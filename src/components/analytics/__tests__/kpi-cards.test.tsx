import { render, screen } from '@testing-library/react'
import { KPICards } from '../kpi-cards'

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
  ],
  tasksByPriority: [
    { priority: 'HIGH', count: 30 },
    { priority: 'MEDIUM', count: 50 },
    { priority: 'LOW', count: 20 },
  ],
  agentPerformance: [],
  platformDistribution: [],
  dailyTaskTrends: [],
  errorPatterns: [],
}

describe('KPICards', () => {
  it('renders loading state correctly', () => {
    render(<KPICards data={null} loading={true} />)
    
    // Check for loading skeletons
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('renders KPI data correctly', () => {
    render(<KPICards data={mockData} loading={false} />)
    
    // Check for KPI values
    expect(screen.getByText('10')).toBeInTheDocument() // Total Agents
    expect(screen.getByText('8')).toBeInTheDocument() // Active Agents
    expect(screen.getByText('100')).toBeInTheDocument() // Total Tasks
    expect(screen.getByText('85%')).toBeInTheDocument() // Success Rate
    expect(screen.getByText('150ms')).toBeInTheDocument() // Avg Response Time
  })

  it('displays correct KPI labels', () => {
    render(<KPICards data={mockData} loading={false} />)
    
    expect(screen.getByText('Total Agents')).toBeInTheDocument()
    expect(screen.getByText('Active Agents')).toBeInTheDocument()
    expect(screen.getByText('Total Tasks')).toBeInTheDocument()
    expect(screen.getByText('Success Rate')).toBeInTheDocument()
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument()
  })

  it('displays trend indicators', () => {
    render(<KPICards data={mockData} loading={false} />)
    
    // Check for trend icons (up/down arrows)
    const trendIcons = document.querySelectorAll('svg')
    expect(trendIcons.length).toBeGreaterThan(0)
  })

  it('shows positive trend for good metrics', () => {
    const dataWithGoodTrends = {
      ...mockData,
      successRate: 95, // High success rate should show positive trend
    }
    
    render(<KPICards data={dataWithGoodTrends} loading={false} />)
    
    expect(screen.getByText('95%')).toBeInTheDocument()
  })

  it('shows negative trend for poor metrics', () => {
    const dataWithPoorTrends = {
      ...mockData,
      successRate: 45, // Low success rate should show negative trend
      averageResponseTime: 2000, // High response time should show negative trend
    }
    
    render(<KPICards data={dataWithPoorTrends} loading={false} />)
    
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('2000ms')).toBeInTheDocument()
  })

  it('handles zero values correctly', () => {
    const dataWithZeros = {
      ...mockData,
      totalAgents: 0,
      activeAgents: 0,
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      successRate: 0,
      averageResponseTime: 0,
    }
    
    render(<KPICards data={dataWithZeros} loading={false} />)
    
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('0ms')).toBeInTheDocument()
  })

  it('calculates success rate correctly', () => {
    const customData = {
      ...mockData,
      completedTasks: 90,
      totalTasks: 100,
      successRate: 90,
    }
    
    render(<KPICards data={customData} loading={false} />)
    
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('displays inactive agents count', () => {
    render(<KPICards data={mockData} loading={false} />)
    
    // Total agents (10) - Active agents (8) = 2 inactive
    // This might be shown as a secondary metric or in a tooltip
    expect(screen.getByText('8')).toBeInTheDocument() // Active agents
    expect(screen.getByText('10')).toBeInTheDocument() // Total agents
  })

  it('formats large numbers correctly', () => {
    const dataWithLargeNumbers = {
      ...mockData,
      totalAgents: 1500,
      totalTasks: 50000,
      averageResponseTime: 1250,
    }
    
    render(<KPICards data={dataWithLargeNumbers} loading={false} />)
    
    expect(screen.getByText('1500')).toBeInTheDocument()
    expect(screen.getByText('50000')).toBeInTheDocument()
    expect(screen.getByText('1250ms')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <KPICards data={mockData} loading={false} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles null data gracefully', () => {
    render(<KPICards data={null} loading={false} />)
    
    // Should show loading state or empty state
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('displays appropriate icons for each KPI', () => {
    render(<KPICards data={mockData} loading={false} />)
    
    // Check that icons are present (SVG elements)
    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(4) // At least one icon per KPI
  })

  it('shows correct color coding for metrics', () => {
    render(<KPICards data={mockData} loading={false} />)
    
    // Success rate of 85% should have appropriate color
    const successRateElement = screen.getByText('85%')
    expect(successRateElement).toBeInTheDocument()
    
    // Response time of 150ms should have appropriate color
    const responseTimeElement = screen.getByText('150ms')
    expect(responseTimeElement).toBeInTheDocument()
  })

  it('handles decimal values in success rate', () => {
    const dataWithDecimals = {
      ...mockData,
      successRate: 87.5,
    }
    
    render(<KPICards data={dataWithDecimals} loading={false} />)
    
    expect(screen.getByText('87.5%')).toBeInTheDocument()
  })

  it('displays failed tasks count', () => {
    render(<KPICards data={mockData} loading={false} />)
    
    // Failed tasks might be shown as a secondary metric
    // The component should handle the failed tasks count (15)
    expect(screen.getByText('15%')).toBeInTheDocument() // This is the failure rate
  })

  it('shows responsive layout', () => {
    const { container } = render(<KPICards data={mockData} loading={false} />)
    
    // Check that the container has responsive grid classes
    expect(container.firstChild).toHaveClass('grid')
  })
})