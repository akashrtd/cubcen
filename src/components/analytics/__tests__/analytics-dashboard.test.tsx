import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AnalyticsDashboard } from '../analytics-dashboard'
import { toast } from 'sonner'

// Mock fetch
global.fetch = jest.fn()

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

// Mock child components
jest.mock('../kpi-cards', () => ({
  KPICards: ({ data, loading }: any) => (
    <div data-testid="kpi-cards">
      {loading ? 'Loading KPIs...' : `KPIs: ${data.totalAgents} agents`}
    </div>
  ),
}))

jest.mock('../performance-charts', () => ({
  PerformanceCharts: ({ data, loading }: any) => (
    <div data-testid="performance-charts">
      {loading
        ? 'Loading charts...'
        : `Charts: ${data.dailyTaskTrends.length} trends`}
    </div>
  ),
}))

jest.mock('../agent-performance-table', () => ({
  AgentPerformanceTable: ({ data, loading }: any) => (
    <div data-testid="agent-performance-table">
      {loading ? 'Loading table...' : `Table: ${data.length} agents`}
    </div>
  ),
}))

jest.mock('../error-patterns-chart', () => ({
  ErrorPatternsChart: ({ data, loading }: any) => (
    <div data-testid="error-patterns-chart">
      {loading ? 'Loading errors...' : `Errors: ${data.length} patterns`}
    </div>
  ),
}))

jest.mock('../date-range-picker', () => ({
  DatePickerWithRange: ({ date, onDateChange }: any) => (
    <div data-testid="date-picker">
      <button
        onClick={() =>
          onDateChange({
            from: new Date('2024-01-01'),
            to: new Date('2024-01-31'),
          })
        }
      >
        Select Date Range
      </button>
    </div>
  ),
}))

jest.mock('../export-dialog', () => ({
  ExportDialog: ({ open, onOpenChange }: any) => (
    <div data-testid="export-dialog">
      {open && (
        <div>
          <span>Export Dialog</span>
          <button onClick={() => onOpenChange(false)}>Close</button>
        </div>
      )}
    </div>
  ),
}))

const mockAnalyticsData = {
  totalAgents: 10,
  activeAgents: 8,
  totalTasks: 100,
  completedTasks: 85,
  failedTasks: 15,
  successRate: 85,
  averageResponseTime: 150,
  tasksByStatus: [
    { status: 'COMPLETED', count: 85 },
    { status: 'FAILED', count: 15 },
  ],
  tasksByPriority: [
    { priority: 'HIGH', count: 30 },
    { priority: 'MEDIUM', count: 50 },
    { priority: 'LOW', count: 20 },
  ],
  agentPerformance: [
    {
      agentId: 'agent1',
      agentName: 'Test Agent 1',
      totalTasks: 50,
      successRate: 90,
      averageResponseTime: 120,
    },
  ],
  platformDistribution: [{ platform: 'n8n (N8N)', count: 5 }],
  dailyTaskTrends: [{ date: '2024-01-01', completed: 10, failed: 2 }],
  errorPatterns: [{ error: 'Connection timeout', count: 5 }],
}

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockAnalyticsData,
        }),
    })
  })

  it('should render loading state initially', async () => {
    render(<AnalyticsDashboard />)

    // Should show loading skeletons
    expect(screen.getByText('Analytics')).toBeInTheDocument()

    // Check for loading skeleton elements by class
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('kpi-cards')).toBeInTheDocument()
    })
  })

  it('should fetch and display analytics data', async () => {
    render(<AnalyticsDashboard />)

    await waitFor(() => {
      expect(screen.getByText('KPIs: 10 agents')).toBeInTheDocument()
      expect(screen.getByText('Charts: 1 trends')).toBeInTheDocument()
      expect(screen.getByText('Table: 1 agents')).toBeInTheDocument()
      expect(screen.getByText('Errors: 1 patterns')).toBeInTheDocument()
    })

    expect(fetch).toHaveBeenCalledWith('/api/cubcen/v1/analytics?', {
      signal: expect.any(AbortSignal),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('should handle API errors', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    render(<AnalyticsDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Analytics Data')).toBeInTheDocument()
      expect(
        screen.getByText('The server is experiencing issues. Please try again later.')
      ).toBeInTheDocument()
    })

    expect(toast.error).toHaveBeenCalledWith(
      'Server error',
      expect.objectContaining({
        description: 'The server is experiencing issues. Please try again later.',
      })
    )
  })

  it('should handle network errors', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<AnalyticsDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Analytics Data')).toBeInTheDocument()
    })

    expect(toast.error).toHaveBeenCalledWith(
      'Failed to load analytics data',
      expect.objectContaining({
        description: 'Network error',
      })
    )
  })

  it('should handle refresh functionality', async () => {
    render(<AnalyticsDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('kpi-cards')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('should handle date range filtering', async () => {
    render(<AnalyticsDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('date-picker')).toBeInTheDocument()
    })

    const dateRangeButton = screen.getByText('Select Date Range')
    fireEvent.click(dateRangeButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/cubcen/v1/analytics?startDate=2024-01-01T00%3A00%3A00.000Z&endDate=2024-01-31T00%3A00%3A00.000Z',
        {
          signal: expect.any(AbortSignal),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    })
  })

  it('should handle refresh interval changes', async () => {
    jest.useFakeTimers()

    render(<AnalyticsDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('kpi-cards')).toBeInTheDocument()
    })

    // Find the refresh interval select by text content
    const refreshSelect = screen.getByText('Manual')
    fireEvent.click(refreshSelect)

    // This would normally trigger the interval, but we'll just verify the setup
    expect(fetch).toHaveBeenCalledTimes(1) // Initial load

    jest.useRealTimers()
  })

  it('should open export dialog', async () => {
    render(<AnalyticsDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('kpi-cards')).toBeInTheDocument()
    })

    const exportButton = screen.getByRole('button', { name: /export/i })
    fireEvent.click(exportButton)

    expect(screen.getByText('Export Dialog')).toBeInTheDocument()
  })

  it('should clear date filter', async () => {
    render(<AnalyticsDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('date-picker')).toBeInTheDocument()
    })

    // First set a date range
    const dateRangeButton = screen.getByText('Select Date Range')
    fireEvent.click(dateRangeButton)

    await waitFor(() => {
      expect(screen.getByText('Clear Filter')).toBeInTheDocument()
    })

    // Then clear it
    const clearButton = screen.getByText('Clear Filter')
    fireEvent.click(clearButton)

    // Should make a new request without date parameters
    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith('/api/cubcen/v1/analytics?', {
        signal: expect.any(AbortSignal),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  it('should handle successful API response with no success flag', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: false,
          error: { message: 'Custom error message' },
        }),
    })

    render(<AnalyticsDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Analytics Data')).toBeInTheDocument()
    })

    expect(toast.error).toHaveBeenCalledWith(
      'Failed to load analytics data',
      expect.objectContaining({
        description: 'Custom error message',
      })
    )
  })

  it('should cleanup on unmount', async () => {
    const { unmount } = render(<AnalyticsDashboard />)

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('kpi-cards')).toBeInTheDocument()
    })

    // Just test that unmount doesn't throw errors
    expect(() => unmount()).not.toThrow()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <AnalyticsDashboard className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
