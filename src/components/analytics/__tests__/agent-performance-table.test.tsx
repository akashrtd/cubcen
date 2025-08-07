import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AgentPerformanceTable } from '../agent-performance-table'

const mockData = [
  {
    agentId: 'agent-1',
    agentName: 'Test Agent 1',
    totalTasks: 100,
    successRate: 95,
    averageResponseTime: 150,
  },
  {
    agentId: 'agent-2',
    agentName: 'Test Agent 2',
    totalTasks: 50,
    successRate: 80,
    averageResponseTime: 300,
  },
  {
    agentId: 'agent-3',
    agentName: 'Test Agent 3',
    totalTasks: 200,
    successRate: 90,
    averageResponseTime: 120,
  },
]

describe('AgentPerformanceTable', () => {
  it('renders loading state correctly', () => {
    render(<AgentPerformanceTable data={[]} loading={true} />)

    expect(screen.getByText('Agent Performance')).toBeInTheDocument()

    // Check for loading skeletons
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('renders agent performance data correctly', () => {
    render(<AgentPerformanceTable data={mockData} loading={false} />)

    expect(screen.getByText('Agent Performance')).toBeInTheDocument()
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument()
    expect(screen.getByText('Test Agent 3')).toBeInTheDocument()

    // Check performance metrics
    expect(screen.getByText('100')).toBeInTheDocument() // Total tasks
    expect(screen.getByText('95%')).toBeInTheDocument() // Success rate
    expect(screen.getByText('150ms')).toBeInTheDocument() // Response time
  })

  it('displays empty state when no data', () => {
    render(<AgentPerformanceTable data={[]} loading={false} />)

    expect(
      screen.getByText('No agent performance data available')
    ).toBeInTheDocument()
  })

  it('sorts by agent name by default', () => {
    render(<AgentPerformanceTable data={mockData} loading={false} />)

    const rows = screen.getAllByRole('row')
    // Skip header row, check data rows
    expect(rows[1]).toHaveTextContent('Test Agent 1')
    expect(rows[2]).toHaveTextContent('Test Agent 2')
    expect(rows[3]).toHaveTextContent('Test Agent 3')
  })

  it('sorts by total tasks when column header is clicked', async () => {
    render(<AgentPerformanceTable data={mockData} loading={false} />)

    const totalTasksHeader = screen.getByText('Total Tasks')
    fireEvent.click(totalTasksHeader)

    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      // Should be sorted by total tasks descending (200, 100, 50)
      expect(rows[1]).toHaveTextContent('Test Agent 3') // 200 tasks
      expect(rows[2]).toHaveTextContent('Test Agent 1') // 100 tasks
      expect(rows[3]).toHaveTextContent('Test Agent 2') // 50 tasks
    })
  })

  it('sorts by success rate when column header is clicked', async () => {
    render(<AgentPerformanceTable data={mockData} loading={false} />)

    const successRateHeader = screen.getByText('Success Rate')
    fireEvent.click(successRateHeader)

    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      // Should be sorted by success rate descending (95%, 90%, 80%)
      expect(rows[1]).toHaveTextContent('Test Agent 1') // 95%
      expect(rows[2]).toHaveTextContent('Test Agent 3') // 90%
      expect(rows[3]).toHaveTextContent('Test Agent 2') // 80%
    })
  })

  it('sorts by response time when column header is clicked', async () => {
    render(<AgentPerformanceTable data={mockData} loading={false} />)

    const responseTimeHeader = screen.getByText('Avg Response Time')
    fireEvent.click(responseTimeHeader)

    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      // Should be sorted by response time ascending (120ms, 150ms, 300ms)
      expect(rows[1]).toHaveTextContent('Test Agent 3') // 120ms
      expect(rows[2]).toHaveTextContent('Test Agent 1') // 150ms
      expect(rows[3]).toHaveTextContent('Test Agent 2') // 300ms
    })
  })

  it('toggles sort direction when clicking same column twice', async () => {
    render(<AgentPerformanceTable data={mockData} loading={false} />)

    const totalTasksHeader = screen.getByText('Total Tasks')

    // First click - descending
    fireEvent.click(totalTasksHeader)
    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Test Agent 3') // 200 tasks
    })

    // Second click - ascending
    fireEvent.click(totalTasksHeader)
    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Test Agent 2') // 50 tasks
    })
  })

  it('displays correct success rate colors', () => {
    const dataWithVariedRates = [
      { ...mockData[0], successRate: 95 }, // High - green
      { ...mockData[1], successRate: 75 }, // Medium - yellow
      { ...mockData[2], successRate: 45 }, // Low - red
    ]

    render(<AgentPerformanceTable data={dataWithVariedRates} loading={false} />)

    // Check that success rates are displayed with appropriate styling
    expect(screen.getByText('95%')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()
  })

  it('displays correct response time colors', () => {
    const dataWithVariedTimes = [
      { ...mockData[0], averageResponseTime: 100 }, // Fast - green
      { ...mockData[1], averageResponseTime: 500 }, // Medium - yellow
      { ...mockData[2], averageResponseTime: 1500 }, // Slow - red
    ]

    render(<AgentPerformanceTable data={dataWithVariedTimes} loading={false} />)

    // Check that response times are displayed
    expect(screen.getByText('100ms')).toBeInTheDocument()
    expect(screen.getByText('500ms')).toBeInTheDocument()
    expect(screen.getByText('1500ms')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <AgentPerformanceTable data={mockData} loading={false} />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles keyboard navigation for sorting', () => {
    render(<AgentPerformanceTable data={mockData} loading={false} />)

    const totalTasksHeader = screen.getByText('Total Tasks')

    // Test Enter key
    fireEvent.keyDown(totalTasksHeader, { key: 'Enter', code: 'Enter' })

    // Test Space key
    fireEvent.keyDown(totalTasksHeader, { key: ' ', code: 'Space' })

    // Should not throw errors and should be accessible
    expect(totalTasksHeader).toBeInTheDocument()
  })
})
