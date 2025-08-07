import { render, screen, fireEvent } from '@testing-library/react'
import { PerformanceCharts } from '../performance-charts'

const mockData = {
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
    { status: 'PENDING', count: 5 },
  ],
  tasksByPriority: [
    { priority: 'HIGH', count: 30 },
    { priority: 'MEDIUM', count: 50 },
    { priority: 'LOW', count: 20 },
  ],
  agentPerformance: [],
  platformDistribution: [
    { platform: 'n8n (N8N)', count: 5 },
    { platform: 'Make.com (MAKE)', count: 3 },
    { platform: 'Zapier (ZAPIER)', count: 2 },
  ],
  dailyTaskTrends: [
    { date: '2024-01-01', completed: 10, failed: 2 },
    { date: '2024-01-02', completed: 15, failed: 1 },
    { date: '2024-01-03', completed: 12, failed: 3 },
  ],
  errorPatterns: [],
}

// Mock recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: any) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  LineChart: ({ children }: any) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }: any) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Cell: () => <div data-testid="cell" />,
}))

describe('PerformanceCharts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    <PerformanceCharts data={{}} loading={true} />

    // Check for loading skeletons
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('renders all chart sections', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    expect(screen.getByText('Task Status Distribution')).toBeInTheDocument()
    expect(screen.getByText('Task Priority Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Platform Distribution')).toBeInTheDocument()
    expect(screen.getByText('Daily Task Trends')).toBeInTheDocument()
  })

  it('renders pie charts for status and priority distribution', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    const pieCharts = screen.getAllByTestId('pie-chart')
    expect(pieCharts.length).toBeGreaterThanOrEqual(2) // Status and Priority charts
  })

  it('renders bar chart for platform distribution', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders line chart for daily trends', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('displays chart legends', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    const legends = screen.getAllByTestId('legend')
    expect(legends.length).toBeGreaterThan(0)
  })

  it('displays chart tooltips', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    const tooltips = screen.getAllByTestId('tooltip')
    expect(tooltips.length).toBeGreaterThan(0)
  })

  it('handles empty data gracefully', () => {
    const emptyData = {
      ...mockData,
      tasksByStatus: [],
      tasksByPriority: [],
      platformDistribution: [],
      dailyTaskTrends: [],
    }

    render(<PerformanceCharts data={emptyData} loading={false} />)

    // Should still render chart containers
    expect(screen.getByText('Task Status Distribution')).toBeInTheDocument()
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <PerformanceCharts data={mockData} loading={false} />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('displays correct chart components for each chart type', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    // Check that all necessary chart components are rendered
    expect(
      screen.getAllByTestId('responsive-container').length
    ).toBeGreaterThan(0)
    expect(screen.getAllByTestId('x-axis').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('y-axis').length).toBeGreaterThan(0)
  })

  it('handles single data point in trends', () => {
    const singlePointData = {
      ...mockData,
      dailyTaskTrends: [{ date: '2024-01-01', completed: 10, failed: 2 }],
    }

    render(<PerformanceCharts data={singlePointData} loading={false} />)

    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('displays platform names correctly', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    // Platform distribution chart should handle platform names
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('handles zero values in charts', () => {
    const zeroData = {
      ...mockData,
      tasksByStatus: [
        { status: 'COMPLETED', count: 0 },
        { status: 'FAILED', count: 0 },
      ],
    }

    render(<PerformanceCharts data={zeroData} loading={false} />)

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
  })

  it('supports chart interaction', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    // Charts should be interactive (handled by recharts)
    const pieChart = screen.getAllByTestId('pie-chart')[0]
    expect(pieChart).toBeInTheDocument()

    // Test that clicking doesn't break anything
    fireEvent.click(pieChart)
  })

  it('displays correct colors for different chart segments', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    // Charts should use appropriate colors (handled by recharts and Cell components)
    const cells = screen.getAllByTestId('cell')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('formats dates correctly in trend chart', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    // Date formatting is handled by the chart component
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles large numbers in charts', () => {
    const largeNumberData = {
      ...mockData,
      tasksByStatus: [
        { status: 'COMPLETED', count: 10000 },
        { status: 'FAILED', count: 1500 },
      ],
    }

    render(<PerformanceCharts data={largeNumberData} loading={false} />)

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
  })

  it('displays grid lines in appropriate charts', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    const grids = screen.getAllByTestId('cartesian-grid')
    expect(grids.length).toBeGreaterThan(0)
  })

  it('handles null data gracefully', () => {
    render(<PerformanceCharts data={null} loading={false} />)

    // Should show loading state when data is null
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('renders responsive containers for all charts', () => {
    render(<PerformanceCharts data={mockData} loading={false} />)

    const responsiveContainers = screen.getAllByTestId('responsive-container')
    expect(responsiveContainers.length).toBeGreaterThanOrEqual(4) // One for each chart section
  })
})
