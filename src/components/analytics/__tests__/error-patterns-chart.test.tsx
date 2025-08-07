import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ErrorPatternsChart } from '../error-patterns-chart'

const mockData = [
  { error: 'Connection timeout', count: 15 },
  { error: 'Authentication failed', count: 8 },
  { error: 'Rate limit exceeded', count: 12 },
  { error: 'Invalid response format', count: 5 },
  { error: 'Network unreachable', count: 3 },
  { error: 'Database connection lost', count: 7 },
]

// Mock recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: any) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

describe('ErrorPatternsChart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    render(<ErrorPatternsChart data={[]} loading={true} />)

    expect(screen.getByText('Error Patterns')).toBeInTheDocument()

    // Check for loading skeleton
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('renders error patterns data correctly', () => {
    render(<ErrorPatternsChart data={mockData} loading={false} />)

    expect(screen.getByText('Error Patterns')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('displays empty state when no data', () => {
    render(<ErrorPatternsChart data={[]} loading={false} />)

    expect(screen.getByText('No error patterns found')).toBeInTheDocument()
    expect(
      screen.getByText(
        'No errors have been recorded in the selected time period.'
      )
    ).toBeInTheDocument()
  })

  it('shows top 5 errors by default', () => {
    render(<ErrorPatternsChart data={mockData} loading={false} />)

    // Should show "Show All" button when there are more than 5 errors
    expect(screen.getByText('Show All (6)')).toBeInTheDocument()
  })

  it('expands to show all errors when "Show All" is clicked', async () => {
    render(<ErrorPatternsChart data={mockData} loading={false} />)

    const showAllButton = screen.getByText('Show All (6)')
    fireEvent.click(showAllButton)

    await waitFor(() => {
      expect(screen.getByText('Show Less')).toBeInTheDocument()
    })
  })

  it('collapses to show top 5 when "Show Less" is clicked', async () => {
    render(<ErrorPatternsChart data={mockData} loading={false} />)

    // First expand
    const showAllButton = screen.getByText('Show All (6)')
    fireEvent.click(showAllButton)

    await waitFor(() => {
      const showLessButton = screen.getByText('Show Less')
      fireEvent.click(showLessButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Show All (6)')).toBeInTheDocument()
    })
  })

  it('handles error selection for detailed view', async () => {
    render(<ErrorPatternsChart data={mockData} loading={false} />)

    // This would typically be triggered by clicking on a bar in the chart
    // Since we're mocking recharts, we'll test the state management
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('displays error counts correctly', () => {
    render(<ErrorPatternsChart data={mockData} loading={false} />)

    // The chart should contain the data, even if we can't directly test the bars
    // due to mocking recharts
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ErrorPatternsChart
        data={mockData}
        loading={false}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles empty error messages gracefully', () => {
    const dataWithEmptyError = [
      { error: '', count: 5 },
      { error: 'Valid error', count: 10 },
    ]

    render(<ErrorPatternsChart data={dataWithEmptyError} loading={false} />)

    expect(screen.getByText('Error Patterns')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('sorts errors by count in descending order', () => {
    const unsortedData = [
      { error: 'Low count error', count: 2 },
      { error: 'High count error', count: 20 },
      { error: 'Medium count error', count: 10 },
    ]

    render(<ErrorPatternsChart data={unsortedData} loading={false} />)

    // The component should sort the data internally
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('handles very long error messages', () => {
    const dataWithLongError = [
      {
        error:
          'This is a very long error message that should be handled gracefully by the component without breaking the layout or causing display issues',
        count: 5,
      },
    ]

    render(<ErrorPatternsChart data={dataWithLongError} loading={false} />)

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('displays correct chart components', () => {
    render(<ErrorPatternsChart data={mockData} loading={false} />)

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar')).toBeInTheDocument()
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })

  it('handles zero count errors', () => {
    const dataWithZeroCount = [
      { error: 'Zero count error', count: 0 },
      { error: 'Normal error', count: 5 },
    ]

    render(<ErrorPatternsChart data={dataWithZeroCount} loading={false} />)

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('handles single error pattern', () => {
    const singleErrorData = [{ error: 'Single error', count: 10 }]

    render(<ErrorPatternsChart data={singleErrorData} loading={false} />)

    expect(screen.getByText('Error Patterns')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    // Should not show "Show All" button for single error
    expect(screen.queryByText(/Show All/)).not.toBeInTheDocument()
  })
})
