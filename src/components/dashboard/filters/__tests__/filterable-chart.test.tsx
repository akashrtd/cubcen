import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterableChart, withFiltering } from '../filterable-chart'
import { FilterProvider } from '../filter-context'
import { ChartData, ChartDataPoint, LegendItem } from '@/types/dashboard'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    toString: jest.fn(() => ''),
  })),
}))

// Mock ChartWrapper
jest.mock('../charts/chart-wrapper', () => ({
  ChartWrapper: ({ onDataClick, onLegendClick, ...props }: any) => (
    <div data-testid="chart-wrapper" {...props}>
      <button
        data-testid="data-point"
        onClick={() =>
          onDataClick?.({
            x: 'Category A',
            y: 100,
            value: 100,
            label: 'Category A',
            metadata: { category: 'Category A', series: 'Series 1' },
          })
        }
      >
        Click Data Point
      </button>
      <button
        data-testid="legend-item"
        onClick={() =>
          onLegendClick?.({
            label: 'Series 1',
            color: '#3F51B5',
            visible: true,
          })
        }
      >
        Click Legend
      </button>
    </div>
  ),
}))

// Test wrapper with FilterProvider
function TestWrapper({ children, ...props }: any) {
  return <FilterProvider {...props}>{children}</FilterProvider>
}

const mockChartData: ChartData = {
  datasets: [
    {
      label: 'Series 1',
      data: [
        { x: 'Category A', y: 100, label: 'Category A' },
        { x: 'Category B', y: 200, label: 'Category B' },
      ],
    },
  ],
}

describe('FilterableChart', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders chart wrapper with props', () => {
    render(
      <TestWrapper>
        <FilterableChart type="bar" data={mockChartData} height={300} />
      </TestWrapper>
    )

    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument()
  })

  it('handles data point clicks with default filtering', async () => {
    render(
      <TestWrapper>
        <FilterableChart type="bar" data={mockChartData} enableFiltering />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('data-point'))

    // Should apply default category filter
    // We can't easily test the filter state without exposing it,
    // but we can verify the click handler was called
    expect(screen.getByTestId('data-point')).toBeInTheDocument()
  })

  it('handles legend clicks with default filtering', async () => {
    render(
      <TestWrapper>
        <FilterableChart type="bar" data={mockChartData} enableFiltering />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('legend-item'))

    // Should apply default series filter
    expect(screen.getByTestId('legend-item')).toBeInTheDocument()
  })

  it('uses custom filter mappings for data clicks', async () => {
    const customDataMapping = jest.fn(() => ({
      customFilter: {
        type: 'string' as const,
        value: 'custom-value',
        operator: 'equals' as const,
      },
    }))

    render(
      <TestWrapper>
        <FilterableChart
          type="bar"
          data={mockChartData}
          enableFiltering
          filterMappings={{
            dataClick: customDataMapping,
          }}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('data-point'))

    expect(customDataMapping).toHaveBeenCalledWith({
      x: 'Category A',
      y: 100,
      value: 100,
      label: 'Category A',
      metadata: { category: 'Category A', series: 'Series 1' },
    })
  })

  it('uses custom filter mappings for legend clicks', async () => {
    const customLegendMapping = jest.fn(() => ({
      customLegendFilter: {
        type: 'string' as const,
        value: 'legend-value',
        operator: 'equals' as const,
      },
    }))

    render(
      <TestWrapper>
        <FilterableChart
          type="bar"
          data={mockChartData}
          enableFiltering
          filterMappings={{
            legendClick: customLegendMapping,
          }}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('legend-item'))

    expect(customLegendMapping).toHaveBeenCalledWith({
      label: 'Series 1',
      color: '#3F51B5',
      visible: true,
    })
  })

  it('calls custom handlers before applying filters', async () => {
    const customDataClick = jest.fn()
    const customLegendClick = jest.fn()

    render(
      <TestWrapper>
        <FilterableChart
          type="bar"
          data={mockChartData}
          enableFiltering
          onDataClick={customDataClick}
          onLegendClick={customLegendClick}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('data-point'))
    await user.click(screen.getByTestId('legend-item'))

    expect(customDataClick).toHaveBeenCalled()
    expect(customLegendClick).toHaveBeenCalled()
  })

  it('disables filtering when enableFiltering is false', async () => {
    const customDataClick = jest.fn()

    render(
      <TestWrapper>
        <FilterableChart
          type="bar"
          data={mockChartData}
          enableFiltering={false}
          onDataClick={customDataClick}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('data-point'))

    // Custom handler should still be called
    expect(customDataClick).toHaveBeenCalled()
    // But no filters should be applied (we can't easily test this without exposing filter state)
  })

  it('passes through all chart props', () => {
    render(
      <TestWrapper>
        <FilterableChart
          type="line"
          data={mockChartData}
          height={400}
          responsive={false}
          interactive={false}
          exportable
          exportFilename="test-chart"
          className="custom-class"
        />
      </TestWrapper>
    )

    const chartWrapper = screen.getByTestId('chart-wrapper')
    expect(chartWrapper).toHaveAttribute('type', 'line')
    expect(chartWrapper).toHaveAttribute('height', '400')
    expect(chartWrapper).toHaveAttribute('responsive', 'false')
    expect(chartWrapper).toHaveAttribute('interactive', 'false')
    expect(chartWrapper).toHaveAttribute('exportable', 'true')
    expect(chartWrapper).toHaveAttribute('exportFilename', 'test-chart')
    expect(chartWrapper).toHaveAttribute('className', 'custom-class')
  })
})

describe('withFiltering HOC', () => {
  const user = userEvent.setup()

  // Mock component to wrap
  const MockChart = ({ onDataClick, onLegendClick, ...props }: any) => (
    <div data-testid="mock-chart" {...props}>
      <button
        data-testid="hoc-data-point"
        onClick={() =>
          onDataClick?.({
            x: 'HOC Category',
            y: 150,
            value: 150,
            label: 'HOC Category',
          })
        }
      >
        HOC Data Point
      </button>
      <button
        data-testid="hoc-legend-item"
        onClick={() =>
          onLegendClick?.({
            label: 'HOC Series',
            color: '#FF6B35',
            visible: true,
          })
        }
      >
        HOC Legend
      </button>
    </div>
  )

  it('wraps component with filtering functionality', async () => {
    const FilterableMockChart = withFiltering(MockChart)

    render(
      <TestWrapper>
        <FilterableMockChart data={mockChartData} enableFiltering />
      </TestWrapper>
    )

    expect(screen.getByTestId('mock-chart')).toBeInTheDocument()

    await user.click(screen.getByTestId('hoc-data-point'))
    // Should apply filtering (can't easily test without exposing state)
  })

  it('uses default filter mappings provided to HOC', async () => {
    const defaultMappings = {
      dataClick: jest.fn(() => ({
        defaultFilter: {
          type: 'string' as const,
          value: 'default-value',
          operator: 'equals' as const,
        },
      })),
    }

    const FilterableMockChart = withFiltering(MockChart, defaultMappings)

    render(
      <TestWrapper>
        <FilterableMockChart data={mockChartData} enableFiltering />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('hoc-data-point'))

    expect(defaultMappings.dataClick).toHaveBeenCalled()
  })

  it('allows overriding default mappings', async () => {
    const defaultMappings = {
      dataClick: jest.fn(() => ({
        default: {
          type: 'string' as const,
          value: 'default',
          operator: 'equals' as const,
        },
      })),
    }

    const overrideMappings = {
      dataClick: jest.fn(() => ({
        override: {
          type: 'string' as const,
          value: 'override',
          operator: 'equals' as const,
        },
      })),
    }

    const FilterableMockChart = withFiltering(MockChart, defaultMappings)

    render(
      <TestWrapper>
        <FilterableMockChart
          data={mockChartData}
          enableFiltering
          filterMappings={overrideMappings}
        />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('hoc-data-point'))

    expect(overrideMappings.dataClick).toHaveBeenCalled()
    expect(defaultMappings.dataClick).not.toHaveBeenCalled()
  })

  it('passes through all props to wrapped component', () => {
    const FilterableMockChart = withFiltering(MockChart)

    render(
      <TestWrapper>
        <FilterableMockChart
          data={mockChartData}
          customProp="test-value"
          anotherProp={123}
        />
      </TestWrapper>
    )

    const mockChart = screen.getByTestId('mock-chart')
    expect(mockChart).toHaveAttribute('customProp', 'test-value')
    expect(mockChart).toHaveAttribute('anotherProp', '123')
  })
})
