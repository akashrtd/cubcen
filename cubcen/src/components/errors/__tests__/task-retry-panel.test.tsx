/**
 * Tests for TaskRetryPanel component
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskRetryPanel } from '../task-retry-panel'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'MMM dd, HH:mm') return 'Jan 01, 12:00'
    return 'formatted-date'
  })
}))

const mockRetryableTasks = [
  {
    id: 'task1',
    name: 'Failed Data Sync',
    agentId: 'agent1',
    agentName: 'N8N Workflow Agent',
    status: 'FAILED' as const,
    error: 'Connection timeout to external API',
    retryCount: 1,
    maxRetries: 3,
    lastAttempt: new Date('2024-01-01T12:00:00Z'),
    canRetry: true,
    parameters: { endpoint: 'https://api.example.com' }
  },
  {
    id: 'task2',
    name: 'Email Notification',
    agentId: 'agent2',
    agentName: 'Make.com Scenario',
    status: 'CANCELLED' as const,
    error: 'User cancelled operation',
    retryCount: 3,
    maxRetries: 3,
    lastAttempt: new Date('2024-01-01T11:30:00Z'),
    canRetry: false
  }
]

const mockApiResponse = {
  tasks: mockRetryableTasks
}

describe('TaskRetryPanel', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should render loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<TaskRetryPanel />)

    expect(screen.getByText('Failed Tasks')).toBeInTheDocument()
    expect(screen.getByText('Tasks that failed and can be retried manually')).toBeInTheDocument()
    
    // Should show skeleton loading
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
  })

  it('should fetch and display retryable tasks', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    render(<TaskRetryPanel />)

    await waitFor(() => {
      expect(screen.getByText('Failed Data Sync')).toBeInTheDocument()
      expect(screen.getByText('Email Notification')).toBeInTheDocument()
    })

    // Check if API was called correctly
    expect(mockFetch).toHaveBeenCalledWith('/api/cubcen/v1/errors/retryable-tasks')

    // Check task details
    expect(screen.getByText('N8N Workflow Agent')).toBeInTheDocument()
    expect(screen.getByText('Make.com Scenario')).toBeInTheDocument()
    expect(screen.getByText('Connection timeout to external API')).toBeInTheDocument()
    expect(screen.getByText('User cancelled operation')).toBeInTheDocument()

    // Check retry counts
    expect(screen.getByText('1/3')).toBeInTheDocument()
    expect(screen.getByText('3/3')).toBeInTheDocument()
    expect(screen.getByText('Max reached')).toBeInTheDocument()
  })

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    } as Response)

    render(<TaskRetryPanel />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch retryable tasks')).toBeInTheDocument()
    })
  })

  it('should handle single task retry', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Task retry initiated successfully' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: [] }) // Empty after retry
      } as Response)

    const user = userEvent.setup()
    render(<TaskRetryPanel />)

    await waitFor(() => {
      expect(screen.getByText('Failed Data Sync')).toBeInTheDocument()
    })

    // Click retry button for first task
    const retryButtons = screen.getAllByRole('button', { name: /retry/i })
    const singleRetryButton = retryButtons.find(button => 
      button.querySelector('svg') && !button.textContent?.includes('Selected')
    )
    
    await user.click(singleRetryButton!)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/cubcen/v1/errors/retry-task/task1',
        { method: 'POST' }
      )
    })

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/Retry completed: 1 successful, 0 failed/)).toBeInTheDocument()
    })
  })

  it('should handle single task retry failure', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

    const user = userEvent.setup()
    render(<TaskRetryPanel />)

    await waitFor(() => {
      expect(screen.getByText('Failed Data Sync')).toBeInTheDocument()
    })

    // Click retry button for first task
    const retryButtons = screen.getAllByRole('button', { name: /retry/i })
    const singleRetryButton = retryButtons.find(button => 
      button.querySelector('svg') && !button.textContent?.includes('Selected')
    )
    
    await user.click(singleRetryButton!)

    await waitFor(() => {
      expect(screen.getByText(/Retry completed: 0 successful, 1 failed/)).toBeInTheDocument()
    })
  })

  it('should handle task selection', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    const user = userEvent.setup()
    render(<TaskRetryPanel />)

    await waitFor(() => {
      expect(screen.getByText('Failed Data Sync')).toBeInTheDocument()
    })

    // Select first task (only retryable one)
    const checkboxes = screen.getAllByRole('checkbox')
    const taskCheckbox = checkboxes.find(cb => 
      cb.getAttribute('aria-label') !== 'Select all retryable tasks'
    )
    
    await user.click(taskCheckbox!)

    // Should show bulk retry button
    await waitFor(() => {
      expect(screen.getByText('Retry Selected (1)')).toBeInTheDocument()
    })
  })

  it('should handle select all functionality', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    const user = userEvent.setup()
    render(<TaskRetryPanel />)

    await waitFor(() => {
      expect(screen.getByText('Failed Data Sync')).toBeInTheDocument()
    })

    // Click select all checkbox
    const selectAllCheckbox = screen.getByRole('checkbox', { 
      name: /select all retryable tasks/i 
    })
    await user.click(selectAllCheckbox)

    // Should show bulk retry button with count of retryable tasks (1)
    await waitFor(() => {
      expect(screen.getByText('Retry Selected (1)')).toBeInTheDocument()
    })
  })

  it('should handle bulk retry with confirmation dialog', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ successful: ['task1'], failed: [] })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: [] })
      } as Response)

    const user = userEvent.setup()
    render(<TaskRetryPanel />)

    await waitFor(() => {
      expect(screen.getByText('Failed Data Sync')).toBeInTheDocument()
    })

    // Select first task
    const checkboxes = screen.getAllByRole('checkbox')
    const taskCheckbox = checkboxes.find(cb => 
      cb.getAttribute('aria-label') !== 'Select all retryable tasks'
    )
    await user.click(taskCheckbox!)

    // Click bulk retry button
    const bulkRetryButton = screen.getByText('Retry Selected (1)')
    await user.click(bulkRetryButton)

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Confirm Bulk Retry')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to retry 1 selected task/)).toBeInTheDocument()
    })

    // Confirm retry
    const confirmButton = screen.getByRole('button', { name: /retry tasks/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/cubcen/v1/errors/bulk-retry-tasks',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskIds: ['task1'] })
        }
      )
    })

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/Retry completed: 1 successful, 0 failed/)).toBeInTheDocument()
    })
  })

  it('should handle bulk retry cancellation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    const user = userEvent.setup()
    render(<TaskRetryPanel />)

    await waitFor(() => {
      expect(screen.getByText('Failed Data Sync')).toBeInTheDocument()
    })

    // Select first task
    const checkboxes = screen.getAllByRole('checkbox')
    const taskCheckbox = checkboxes.find(cb => 
      cb.getAttribute('aria-label') !== 'Select all retryable tasks'
    )
    await user.click(taskCheckbox!)

    // Click bulk retry button
    const bulkRetryButton = screen.getByText('Retry Selected (1)')
    await user.click(bulkRetryButton)

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Confirm Bulk Retry')).toBeInTheDocument()
    })

    // Cancel retry
    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Confirm Bulk Retry')).not.toBeInTheDocument()
    })
  })

  it('should handle refresh functionality', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    const user = userEvent.setup()
    render(<TaskRetryPanel />)

    await waitFor(() => {
      expect(screen.getByText('Failed Data Sync')).toBeInTheDocument()
    })

    // Clear previous calls
    mockFetch.mockClear()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    // Click refresh button
    const refreshButton = screen.getByText('Refresh')
    await user.click(refreshButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/cubcen/v1/errors/retryable-tasks')
    })
  })

  it('should display empty state when no failed tasks', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: [] })
    } as Response)

    render(<TaskRetryPanel />)

    await waitFor(() => {
      expect(screen.getByText('No Failed Tasks')).toBeInTheDocument()
      expect(screen.getByText('All tasks are running successfully. No manual retries needed.')).toBeInTheDocument()
    })
  })

  it('should disable retry button for non-retryable tasks', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    render(<TaskRetryPanel />)

    await waitFor(() => {
      expect(screen.getByText('Email Notification')).toBeInTheDocument()
    })

    // Find the retry button for the non-retryable task (task2)
    const rows = screen.getAllByRole('row')
    const task2Row = rows.find(row => row.textContent?.includes('Email Notification'))
    const retryButton = task2Row?.querySelector('button')

    expect(retryButton).toBeDisabled()
  })

  it('should show correct status badges', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    render(<TaskRetryPanel />)

    await waitFor(() => {
      const failedBadge = screen.getByText('FAILED').closest('[data-slot="badge"]')
      const cancelledBadge = screen.getByText('CANCELLED').closest('[data-slot="badge"]')

      expect(failedBadge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200')
      expect(cancelledBadge).toHaveClass('bg-gray-100', 'text-gray-800', 'border-gray-200')
    })
  })

  it('should show loading spinner during retry operations', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)
      .mockImplementation(() => new Promise(() => {})) // Never resolves to keep loading

    const user = userEvent.setup()
    render(<TaskRetryPanel />)

    await waitFor(() => {
      expect(screen.getByText('Failed Data Sync')).toBeInTheDocument()
    })

    // Click retry button
    const retryButtons = screen.getAllByRole('button', { name: /retry/i })
    const singleRetryButton = retryButtons.find(button => 
      button.querySelector('svg') && !button.textContent?.includes('Selected')
    )
    
    await user.click(singleRetryButton!)

    // Should show loading spinner
    await waitFor(() => {
      expect(singleRetryButton?.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })
})