import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LineChart } from '../line-chart'
import type { ChartData, ChartConfiguration } from '@/types/dashboard'

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children, data }: any) => (
    <div data-testid="recharts-line-chart">
      {children}
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
  Line: ({ dataKey, onClick }: any) => (
    <div data-testid={`line-${dataKey}`} onClick={() => onClick?.({ value: 100 }, 0)}>
      Line: {dataKey}
    </div>
  ),
  XAxis: ({ dataKey }: any) => <div data-testid="x-axis">XAxis: {dataKey}</div>,
  YAxis: () => <div data-testid="y-axis">YAxis</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid">Grid</div>,
  Tooltip: ({ content }: any) => <div data-testid="tooltip">Tooltip</div>,
  Legend: ({ onClick }: any) => (
    <div data-testid="legend" onClick={() => onClick?.({ value: 'Test', color: '#000' })}>
      Legend
    </div>
  ),
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Area: ({ dataKey, onClick }: any) => (
    <div data-testid={`area-${dataKey}`} onClick={() => onClick?.({ value: 100 }, 0)}>
      Area: {dataKey}
    </div>
  ),
  AreaChart: ({ children, data }: any) => (
    <div data-testid="recharts-area-chart">
      {children}
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
  Scatter: ({ dataKey, onClick }: any) => (
    <div data-testid={`scatter-${dataKey}`} onClick={() => onClick?.({ value: 100 }, 0)}>
      Scatter: {dataKey}
    </div>
  ),
  ScatterChart: ({ children, data }: any) => (
    <div data-testid="recharts-scatter-chart">
      {children}
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
}))

const mockData: ChartData = {
  datasets: [
    {
      label: 'Dataset 1',
      data: [
        { x: 'Jan', y: 100 },
        { x: 'Feb', y: 200 },
        { x: 'Mar', y: 150 },
      ],
    },
    {
      label: 'Dataset 2',
      data: [
        { x: 'Jan', y: 80 },
        { x: 'Feb', y: 180 },
        { x: 'Mar', y: 120 },
      ],
    },
  ],
}

const mockConfig: ChartConfiguration = {
  colors: {
    primary: '#3F51B5',
    secondary: '#B19ADA',
    accent: '#FF6B35',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  legend: {
    show: true,
    position: 'bottom',
    align: 'center',
  },
  tooltip: {
    show: true,
  },
  axes: {
    x: { show: true },
    y: { show: true },
  },
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-out',
  },
}

describe('LineChart', () => {
  const defaultProps = {
    data: mockData,
    config: mockConfig,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: false,
    colors: ['#3F51B5', '#B19ADA'],
  }

  it('renders line chart correctly', () => {
    render(<LineChart {...defaultProps} />)

    expect(screen.getByTestId('recharts-line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('renders multiple datasets as lines', () => {
    render(<LineChart {...defaultProps} />)

    expect(screen.getByTestId('line-Dataset 1')).toBeInTheDocument()
    expect(screen.getByTestId('line-Dataset 2')).toBeInTheDocument()
    expect(screen.getByText('Line: Dataset 1')).toBeInTheDocument()
    expect(screen.getByText('Line: Dataset 2')).toBeInTheDocument()
  })

  it('transforms data correctly for Recharts', () => {
    render(<LineChart {...defaultProps} />)

    const chartDataElement = screen.getByTestId('chart-data')
    const chartData = JSON.parse(chartDataElement.textContent || '[]')

    expect(chartData).toHaveLength(3) // Jan, Feb, Mar
    expect(chartData[0]).toEqual({
      x: 'Feb',
      'Dataset 1': 200,
      'Dataset 2': 180,
    })
    expect(chartData[1]).toEqual({
      x: 'Jan',
      'Dataset 1': 100,
      'Dataset 2': 80,
    })
    expect(chartData[2]).toEqual({
      x: 'Mar',
      'Dataset 1': 150,
      'Dataset 2': 120,
    })
  })

  it('handles data click events', async () => {
    const user = userEvent.setup()
    const onDataClick = jest.fn()

    render(<LineChart {...defaultProps} onDataClick={onDataClick} />)

    await user.click(screen.getByTestId('line-Dataset 1'))

    expect(onDataClick).toHaveBeenCalledWith({
      x: undefined,
      y: 100,
      value: 100,
      label: undefined,
    })
  })

  it('handles legend click events', async () => {
    const user = userEvent.setup()
    const onLegendClick = jest.fn()

    render(<LineChart {...defaultProps} onLegendClick={onLegendClick} />)

    await user.click(screen.getByTestId('legend'))

    expect(onLegendClick).toHaveBeenCalledWith({
      label: 'Test',
      color: '#000',
      visible: true,
    })
  })

  it('renders as area chart when area prop is true', () => {
    render(<LineChart {...defaultProps} area={true} />)

    expect(screen.getByTestId('recharts-area-chart')).toBeInTheDocument()
    expect(screen.getByTestId('area-Dataset 1')).toBeInTheDocument()
    expect(screen.getByTestId('area-Dataset 2')).toBeInTheDocument()
  })

  it('renders as scatter chart when scatter prop is true', () => {
    render(<LineChart {...defaultProps} scatter={true} />)

    expect(screen.getByTestId('recharts-scatter-chart')).toBeInTheDocument()
    expect(screen.getByTestId('scatter-Dataset 1')).toBeInTheDocument()
    expect(screen.getByTestId('scatter-Dataset 2')).toBeInTheDocument()
  })

  it('hides axes when configured', () => {
    const configWithHiddenAxes = {
      ...mockConfig,
      axes: {
        x: { show: false },
        y: { show: false },
      },
    }

    render(<LineChart {...defaultProps} config={configWithHiddenAxes} />)

    expect(screen.queryByTestId('x-axis')).not.toBeInTheDocument()
    expect(screen.queryByTestId('y-axis')).not.toBeInTheDocument()
  })

  it('hides tooltip when configured', () => {
    const configWithHiddenTooltip = {
      ...mockConfig,
      tooltip: { show: false },
    }

    render(<LineChart {...defaultProps} config={configWithHiddenTooltip} />)

    expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
  })

  it('hides legend when configured', () => {
    const configWithHiddenLegend = {
      ...mockConfig,
      legend: { show: false, position: 'bottom' as const, align: 'center' as const },
    }

    render(<LineChart {...defaultProps} config={configWithHiddenLegend} />)

    expect(screen.queryByTestId('legend')).not.toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    const emptyData: ChartData = { datasets: [] }

    render(<LineChart {...defaultProps} data={emptyData} />)

    expect(screen.getByTestId('recharts-line-chart')).toBeInTheDocument()
    
    const chartDataElement = screen.getByTestId('chart-data')
    const chartData = JSON.parse(chartDataElement.textContent || '[]')
    expect(chartData).toHaveLength(0)
  })

  it('sorts x values correctly', () => {
    const unsortedData: ChartData = {
      datasets: [
        {
          label: 'Test',
          data: [
            { x: 'Mar', y: 150 },
            { x: 'Jan', y: 100 },
            { x: 'Feb', y: 200 },
          ],
        },
      ],
    }

    render(<LineChart {...defaultProps} data={unsortedData} />)

    const chartDataElement = screen.getByTestId('chart-data')
    const chartData = JSON.parse(chartDataElement.textContent || '[]')

    // String sorting is alphabetical: Feb, Jan, Mar
    expect(chartData[0].x).toBe('Feb')
    expect(chartData[1].x).toBe('Jan')
    expect(chartData[2].x).toBe('Mar')
  })

  it('handles numeric x values', () => {
    const numericData: ChartData = {
      datasets: [
        {
          label: 'Test',
          data: [
            { x: 3, y: 150 },
            { x: 1, y: 100 },
            { x: 2, y: 200 },
          ],
        },
      ],
    }

    render(<LineChart {...defaultProps} data={numericData} />)

    const chartDataElement = screen.getByTestId('chart-data')
    const chartData = JSON.parse(chartDataElement.textContent || '[]')

    expect(chartData[0].x).toBe(1)
    expect(chartData[1].x).toBe(2)
    expect(chartData[2].x).toBe(3)
  })
})