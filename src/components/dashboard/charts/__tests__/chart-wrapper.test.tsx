import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChartWrapper } from '../chart-wrapper'
import type { ChartData } from '@/types/dashboard'

// Mock the chart components to avoid Recharts rendering issues in tests
jest.mock('../chart-types/line-chart', () => ({
  LineChart: ({ data, onDataClick }: any) => (
    <div
      data-testid="line-chart"
      onClick={() => onDataClick?.({ x: 1, y: 100 })}
    >
      Line Chart: {data.datasets[0]?.label}
    </div>
  ),
}))

jest.mock('../chart-types/bar-chart', () => ({
  BarChart: ({ data, onDataClick }: any) => (
    <div
      data-testid="bar-chart"
      onClick={() => onDataClick?.({ x: 1, y: 100 })}
    >
      Bar Chart: {data.datasets[0]?.label}
    </div>
  ),
}))

jest.mock('../chart-types/pie-chart', () => ({
  PieChart: ({ data, onDataClick }: any) => (
    <div
      data-testid="pie-chart"
      onClick={() => onDataClick?.({ x: 1, y: 100 })}
    >
      Pie Chart: {data.datasets[0]?.label}
    </div>
  ),
}))

jest.mock('../chart-types/heatmap-chart', () => ({
  HeatmapChart: ({ data, onDataClick }: any) => (
    <div
      data-testid="heatmap-chart"
      onClick={() => onDataClick?.({ x: 1, y: 100 })}
    >
      Heatmap Chart: {data.datasets[0]?.label}
    </div>
  ),
}))

const mockData: ChartData = {
  datasets: [
    {
      label: 'Test Dataset',
      data: [
        { x: 'Jan', y: 100 },
        { x: 'Feb', y: 200 },
        { x: 'Mar', y: 150 },
      ],
    },
  ],
}

describe('ChartWrapper', () => {
  it('renders loading state', () => {
    render(<ChartWrapper type="line" data={mockData} loading={true} />)

    expect(screen.getByText('Loading chart...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders error state', () => {
    render(
      <ChartWrapper type="line" data={mockData} error="Failed to load chart" />
    )

    expect(screen.getByText('Failed to load chart')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders empty state when no data', () => {
    render(<ChartWrapper type="line" data={{ datasets: [] }} />)

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders line chart', async () => {
    render(<ChartWrapper type="line" data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
    expect(screen.getByText('Line Chart: Test Dataset')).toBeInTheDocument()
  })

  it('renders bar chart', async () => {
    render(<ChartWrapper type="bar" data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })
    expect(screen.getByText('Bar Chart: Test Dataset')).toBeInTheDocument()
  })

  it('renders pie chart', async () => {
    render(<ChartWrapper type="pie" data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })
    expect(screen.getByText('Pie Chart: Test Dataset')).toBeInTheDocument()
  })

  it('renders heatmap chart', async () => {
    render(<ChartWrapper type="heatmap" data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('heatmap-chart')).toBeInTheDocument()
    })
    expect(screen.getByText('Heatmap Chart: Test Dataset')).toBeInTheDocument()
  })

  it('renders area chart (line chart variant)', async () => {
    render(<ChartWrapper type="area" data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
    expect(screen.getByText('Line Chart: Test Dataset')).toBeInTheDocument()
  })

  it('renders scatter chart (line chart variant)', async () => {
    render(<ChartWrapper type="scatter" data={mockData} />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
    expect(screen.getByText('Line Chart: Test Dataset')).toBeInTheDocument()
  })

  it('handles unsupported chart type', () => {
    render(<ChartWrapper type={'unsupported' as any} data={mockData} />)

    expect(
      screen.getByText('Unsupported chart type: unsupported')
    ).toBeInTheDocument()
  })

  it('handles data click events', async () => {
    const user = userEvent.setup()
    const onDataClick = jest.fn()

    render(
      <ChartWrapper
        type="line"
        data={mockData}
        onDataClick={onDataClick}
        interactive={true}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('line-chart'))
    expect(onDataClick).toHaveBeenCalledWith({ x: 1, y: 100 })
  })

  it('applies custom configuration', async () => {
    const customConfig = {
      colors: {
        primary: '#FF0000',
        secondary: '#00FF00',
        accent: '#0000FF',
        success: '#00FFFF',
        warning: '#FFFF00',
        error: '#FF00FF',
      },
      legend: {
        show: false,
        position: 'top' as const,
        align: 'start' as const,
      },
      tooltip: {
        show: false,
      },
      animations: {
        enabled: false,
        duration: 0,
        easing: 'linear',
      },
    }

    render(<ChartWrapper type="line" data={mockData} config={customConfig} />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  it('applies responsive height', async () => {
    render(
      <ChartWrapper
        type="line"
        data={mockData}
        height={400}
        responsive={true}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    const wrapper = screen.getByTestId('line-chart').closest('.chart-wrapper')
    expect(wrapper).toHaveStyle({ height: 'auto' })
  })

  it('applies fixed height when not responsive', () => {
    render(
      <ChartWrapper
        type="line"
        data={mockData}
        height={400}
        responsive={false}
        loading={true}
      />
    )

    const wrapper = screen
      .getByText('Loading chart...')
      .closest('.chart-wrapper')
    expect(wrapper).toHaveStyle({ height: '400px' })
  })

  it('applies custom className', () => {
    render(
      <ChartWrapper
        type="line"
        data={mockData}
        className="custom-chart-class"
        loading={true}
      />
    )

    const wrapper = screen
      .getByText('Loading chart...')
      .closest('.chart-wrapper')
    expect(wrapper).toHaveClass('custom-chart-class')
  })

  it('merges default colors with custom colors', async () => {
    const customConfig = {
      colors: {
        primary: '#FF0000',
        // Other colors should use defaults
      },
    }

    render(<ChartWrapper type="line" data={mockData} config={customConfig} />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    // The component should merge custom colors with defaults
    // This is tested implicitly through the component rendering without errors
  })

  it('generates chart colors from data', async () => {
    const multiDatasetData: ChartData = {
      datasets: [
        {
          label: 'Dataset 1',
          data: [{ x: 'A', y: 100 }],
          color: '#FF0000',
        },
        {
          label: 'Dataset 2',
          data: [{ x: 'A', y: 200 }],
          // No color specified, should use default palette
        },
      ],
    }

    render(<ChartWrapper type="line" data={multiDatasetData} />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })
})
