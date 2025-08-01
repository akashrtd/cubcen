/**
 * Tests for ErrorLogViewer component
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorLogViewer } from '../error-log-viewer'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'MMM dd, yyyy HH:mm:ss') return 'Jan 01, 2024 12:00:00'
    if (formatStr === 'HH:mm:ss') return '12:00:00'
    if (formatStr === 'MMM dd') return 'Jan 01'
    return 'formatted-date'
  })
}))

const mockErrorLogs = [
  {
    id: 'log1',
    level: 'ERROR' as const,
    message: 'Connection timeout occurred',
    context: { requestId: 'req123' },
    source: 'n8n-adapter',
    timestamp: new Date('2024-01-01T12:00:00Z'),
    agentId: 'agent1',
    taskId: 'task1'
  },
  {
    id: 'log2',
    level: 'WARN' as const,
    message: 'Rate limit approaching',
    context: {},
    source: 'make-adapter',
    timestamp: new Date('2024-01-01T11:30:00Z')
  }
]

const mockApiResponse = {
  logs: mockErrorLogs,
  total: 2,
  page: 1,
  limit: 25,
  totalPages: 1
}

describe('ErrorLogViewer', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should render loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<ErrorLogViewer />)

    expect(screen.getByText('Error Logs')).toBeInTheDocument()
    expect(screen.getByText('System error logs and debugging information')).toBeInTheDocument()
    
    // Should show skeleton loading
    expect(screen.getAllByTestId('skeleton')).toHaveLength(5)
  })

  it('should fetch and display error logs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    render(<ErrorLogViewer />)

    await waitFor(() => {
      expect(screen.getByText('Connection timeout occurred')).toBeInTheDocument()
      expect(screen.getByText('Rate limit approaching')).toBeInTheDocument()
    })

    // Check if API was called correctly
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/cubcen/v1/errors/logs?page=1&limit=25')
    )

    // Check if error levels are displayed
    expect(screen.getByText('ERROR')).toBeInTheDocument()
    expect(screen.getByText('WARN')).toBeInTheDocument()

    // Check if sources are displayed
    expect(screen.getByText('n8n-adapter')).toBeInTheDocument()
    expect(screen.getByText('make-adapter')).toBeInTheDocument()
  })

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    } as Response)

    render(<ErrorLogViewer />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch error logs')).toBeInTheDocument()
    })
  })

  it('should handle search functionality', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    const user = userEvent.setup()
    render(<ErrorLogViewer />)

    await waitFor(() => {
      expect(screen.getByText('Connection timeout occurred')).toBeInTheDocument()
    })

    // Clear previous calls
    mockFetch.mockClear()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockApiResponse, logs: [mockErrorLogs[0]] })
    } as Response)

    // Search for "timeout"
    const searchInput = screen.getByPlaceholderText('Search error messages...')
    await user.type(searchInput, 'timeout')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=timeout')
      )
    })
  })

  it('should handle level filtering', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    const user = userEvent.setup()
    render(<ErrorLogViewer />)

    await waitFor(() => {
      expect(screen.getByText('Connection timeout occurred')).toBeInTheDocument()
    })

    // Clear previous calls
    mockFetch.mockClear()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockApiResponse, logs: [mockErrorLogs[0]] })
    } as Response)

    // Filter by ERROR level
    const levelSelect = screen.getByRole('combobox')
    await user.click(levelSelect)
    await user.click(screen.getByText('Error'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('level=ERROR')
      )
    })
  })

  it('should handle source filtering', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    const user = userEvent.setup()
    render(<ErrorLogViewer />)

    await waitFor(() => {
      expect(screen.getByText('Connection timeout occurred')).toBeInTheDocument()
    })

    // Clear previous calls
    mockFetch.mockClear()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockApiResponse, logs: [mockErrorLogs[0]] })
    } as Response)

    // Filter by source
    const sourceInput = screen.getByPlaceholderText('Source filter...')
    await user.type(sourceInput, 'n8n')
    
    const applyButton = screen.getByText('Apply')
    await user.click(applyButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('source=n8n')
      )
    })
  })

  it('should open error detail modal', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    const user = userEvent.setup()
    render(<ErrorLogViewer />)

    await waitFor(() => {
      expect(screen.getByText('Connection timeout occurred')).toBeInTheDocument()
    })

    // Click on View button
    const viewButtons = screen.getAllByText('View')
    await user.click(viewButtons[0])

    // Check if modal opens with error details
    await waitFor(() => {
      expect(screen.getByText('Error Details - ERROR')).toBeInTheDocument()
      expect(screen.getByText('Connection timeout occurred')).toBeInTheDocument()
      expect(screen.getByText('n8n-adapter')).toBeInTheDocument()
    })

    // Check if related IDs are shown
    expect(screen.getByText('Agent: agent1')).toBeInTheDocument()
    expect(screen.getByText('Task: task1')).toBeInTheDocument()
  })

  it('should handle pagination', async () => {
    const paginatedResponse = {
      ...mockApiResponse,
      total: 50,
      totalPages: 2,
      page: 1
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => paginatedResponse
    } as Response)

    const user = userEvent.setup()
    render(<ErrorLogViewer />)

    await waitFor(() => {
      expect(screen.getByText('Showing 1 to 25 of 50 entries')).toBeInTheDocument()
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    })

    // Clear previous calls
    mockFetch.mockClear()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...paginatedResponse, page: 2 })
    } as Response)

    // Click next page
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      )
    })
  })

  it('should handle refresh functionality', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    const user = userEvent.setup()
    render(<ErrorLogViewer />)

    await waitFor(() => {
      expect(screen.getByText('Connection timeout occurred')).toBeInTheDocument()
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
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cubcen/v1/errors/logs')
      )
    })
  })

  it('should display empty state when no logs found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockApiResponse, logs: [], total: 0 })
    } as Response)

    render(<ErrorLogViewer />)

    await waitFor(() => {
      expect(screen.getByText('No error logs found')).toBeInTheDocument()
    })
  })

  it('should truncate long error messages in table', async () => {
    const longMessage = 'This is a very long error message that should be truncated when displayed in the table view to prevent layout issues and improve readability'
    const logWithLongMessage = {
      ...mockErrorLogs[0],
      message: longMessage
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockApiResponse, logs: [logWithLongMessage] })
    } as Response)

    render(<ErrorLogViewer />)

    await waitFor(() => {
      // Should show truncated message with ellipsis
      expect(screen.getByText(/This is a very long error message that should be truncated when displayed/)).toBeInTheDocument()
      expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument()
    })
  })

  it('should show error level badges with correct colors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response)

    render(<ErrorLogViewer />)

    await waitFor(() => {
      const errorBadge = screen.getByText('ERROR').closest('[data-slot="badge"]')
      const warnBadge = screen.getByText('WARN').closest('[data-slot="badge"]')

      expect(errorBadge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200')
      expect(warnBadge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-200')
    })
  })
})