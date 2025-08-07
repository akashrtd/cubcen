import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardFilters } from '../dashboard-filters'
import { FilterProvider } from '../filter-context'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    toString: jest.fn(() => ''),
  })),
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
})

// Test wrapper with FilterProvider
function TestWrapper({ children, ...props }: any) {
  return <FilterProvider {...props}>{children}</FilterProvider>
}

describe('DashboardFilters', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders in compact mode', () => {
    render(
      <TestWrapper>
        <DashboardFilters compact />
      </TestWrapper>
    )

    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument()
    expect(screen.getByText('Filters')).toBeInTheDocument()
  })

  it('renders in full mode', () => {
    render(
      <TestWrapper>
        <DashboardFilters />
      </TestWrapper>
    )

    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('Quick Filters')).toBeInTheDocument()
    expect(screen.getByText('Date Range')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('Platforms')).toBeInTheDocument()
  })

  it('shows default presets', () => {
    render(
      <TestWrapper>
        <DashboardFilters />
      </TestWrapper>
    )

    expect(screen.getByText('Last 7 Days')).toBeInTheDocument()
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument()
    expect(screen.getByText('High Priority')).toBeInTheDocument()
    expect(screen.getByText('Active Agents')).toBeInTheDocument()
  })

  it('applies preset when clicked', async () => {
    render(
      <TestWrapper>
        <DashboardFilters />
      </TestWrapper>
    )

    await user.click(screen.getByText('High Priority'))

    // Should show active filters
    await waitFor(() => {
      expect(screen.getByText('Active Filters')).toBeInTheDocument()
      expect(screen.getByText('high')).toBeInTheDocument()
      expect(screen.getByText('critical')).toBeInTheDocument()
    })
  })

  it('handles status filter selection', async () => {
    render(
      <TestWrapper>
        <DashboardFilters />
      </TestWrapper>
    )

    // Click on active status checkbox
    const activeCheckbox = screen.getByLabelText('active')
    await user.click(activeCheckbox)

    expect(activeCheckbox).toBeChecked()

    // Should show in active filters
    await waitFor(() => {
      expect(screen.getByText('Active Filters')).toBeInTheDocument()
      expect(screen.getByText('active')).toBeInTheDocument()
    })
  })

  it('handles priority filter selection', async () => {
    render(
      <TestWrapper>
        <DashboardFilters />
      </TestWrapper>
    )

    // Click on high priority checkbox
    const highCheckbox = screen.getByLabelText('high')
    await user.click(highCheckbox)

    expect(highCheckbox).toBeChecked()

    // Should show in active filters
    await waitFor(() => {
      expect(screen.getByText('Active Filters')).toBeInTheDocument()
      expect(screen.getByText('high')).toBeInTheDocument()
    })
  })

  it('handles platform filter selection', async () => {
    render(
      <TestWrapper>
        <DashboardFilters />
      </TestWrapper>
    )

    // Click on n8n platform checkbox
    const n8nCheckbox = screen.getByLabelText('n8n')
    await user.click(n8nCheckbox)

    expect(n8nCheckbox).toBeChecked()

    // Should show in active filters
    await waitFor(() => {
      expect(screen.getByText('Active Filters')).toBeInTheDocument()
      expect(screen.getByText('n8n')).toBeInTheDocument()
    })
  })

  it('shows custom categories when provided', () => {
    render(
      <TestWrapper>
        <DashboardFilters availableCategories={['category1', 'category2']} />
      </TestWrapper>
    )

    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByLabelText('category1')).toBeInTheDocument()
    expect(screen.getByLabelText('category2')).toBeInTheDocument()
  })

  it('shows custom agents when provided', () => {
    render(
      <TestWrapper>
        <DashboardFilters availableAgents={['agent1', 'agent2']} />
      </TestWrapper>
    )

    expect(screen.getByText('Agents')).toBeInTheDocument()
    expect(screen.getByLabelText('agent1')).toBeInTheDocument()
    expect(screen.getByLabelText('agent2')).toBeInTheDocument()
  })

  it('removes individual filters when X is clicked', async () => {
    render(
      <TestWrapper>
        <DashboardFilters />
      </TestWrapper>
    )

    // Add a filter first
    const activeCheckbox = screen.getByLabelText('active')
    await user.click(activeCheckbox)

    // Wait for active filters to appear
    await waitFor(() => {
      expect(screen.getByText('Active Filters')).toBeInTheDocument()
    })

    // Find and click the X button to remove the filter
    const removeButton =
      screen.getByRole('button', { name: /remove active filter/i }) ||
      screen.getByText('active').parentElement?.querySelector('svg')

    if (removeButton) {
      await user.click(removeButton)
    }

    // Filter should be removed
    await waitFor(() => {
      expect(activeCheckbox).not.toBeChecked()
    })
  })

  it('clears all filters when Clear All is clicked', async () => {
    render(
      <TestWrapper>
        <DashboardFilters />
      </TestWrapper>
    )

    // Add multiple filters
    await user.click(screen.getByLabelText('active'))
    await user.click(screen.getByLabelText('high'))

    // Wait for filters to be applied
    await waitFor(() => {
      expect(screen.getByText('Active Filters')).toBeInTheDocument()
    })

    // Click Clear All
    await user.click(screen.getByText('Clear All'))

    // All filters should be cleared
    await waitFor(() => {
      expect(screen.getByLabelText('active')).not.toBeChecked()
      expect(screen.getByLabelText('high')).not.toBeChecked()
      expect(screen.queryByText('Active Filters')).not.toBeInTheDocument()
    })
  })

  it('shows share button when enabled', () => {
    render(
      <TestWrapper>
        <DashboardFilters showShareButton />
      </TestWrapper>
    )

    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('hides share button when disabled', () => {
    render(
      <TestWrapper>
        <DashboardFilters showShareButton={false} />
      </TestWrapper>
    )

    expect(screen.queryByText('Share')).not.toBeInTheDocument()
  })

  it('copies URL to clipboard when share is clicked', async () => {
    const mockWriteText = jest.fn()
    navigator.clipboard.writeText = mockWriteText

    render(
      <TestWrapper>
        <DashboardFilters showShareButton />
      </TestWrapper>
    )

    await user.click(screen.getByText('Share'))

    expect(mockWriteText).toHaveBeenCalledWith(window.location.href)
  })

  it('hides presets when showPresets is false', () => {
    render(
      <TestWrapper>
        <DashboardFilters showPresets={false} />
      </TestWrapper>
    )

    expect(screen.queryByText('Quick Filters')).not.toBeInTheDocument()
    expect(screen.queryByText('Last 7 Days')).not.toBeInTheDocument()
  })

  it('shows active filter count in compact mode', async () => {
    render(
      <TestWrapper>
        <DashboardFilters compact />
      </TestWrapper>
    )

    // Open the popover
    await user.click(screen.getByRole('button', { name: /filters/i }))

    // Add a filter
    const activeCheckbox = screen.getByLabelText('active')
    await user.click(activeCheckbox)

    // Close popover by clicking outside
    await user.click(document.body)

    // Should show filter count badge
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  it('shows Clear button in compact mode when filtered', async () => {
    render(
      <TestWrapper>
        <DashboardFilters compact />
      </TestWrapper>
    )

    // Open the popover and add a filter
    await user.click(screen.getByRole('button', { name: /filters/i }))
    await user.click(screen.getByLabelText('active'))
    await user.click(document.body) // Close popover

    // Should show Clear button
    await waitFor(() => {
      expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    // Click Clear button
    await user.click(screen.getByText('Clear'))

    // Clear button should disappear
    await waitFor(() => {
      expect(screen.queryByText('Clear')).not.toBeInTheDocument()
    })
  })

  it('handles date range selection', async () => {
    render(
      <TestWrapper>
        <DashboardFilters />
      </TestWrapper>
    )

    // Click on date range button
    const dateButton = screen.getByText('Select date range')
    await user.click(dateButton)

    // Calendar should be visible
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('applies custom filter options', () => {
    render(
      <TestWrapper>
        <DashboardFilters
          availableStatuses={['custom-status']}
          availablePriorities={['custom-priority']}
          availablePlatforms={['custom-platform']}
        />
      </TestWrapper>
    )

    expect(screen.getByLabelText('custom-status')).toBeInTheDocument()
    expect(screen.getByLabelText('custom-priority')).toBeInTheDocument()
    expect(screen.getByLabelText('custom-platform')).toBeInTheDocument()
  })
})
