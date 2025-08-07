import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BarChart } from '../bar-chart'
import type { ChartData, ChartConfiguration } from '@/types/dashboard'

// Mock Recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children, data }: any) => (
    <div data-testid="recharts-bar-chart">
      {children}
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
  Bar: ({ dataKey, onClick }: any) => (
    <div
      data-testid={`bar-${dataKey}`}
      onClick={() => onClick?.({ value: 100 }, 0)}
    >
      Bar: {dataKey}
    </div>
  ),
  XAxis: ({ dataKey }: any) => <div data-testid="x-axis">XAxis: {dataKey}</div>,
  YAxis: ({ tickFormatter }: any) => (
    <div data-testid="y-axis">YAxis{tickFormatter ? ' (formatted)' : ''}</div>
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid">Grid</div>,
  Tooltip: ({ content }: any) => <div data-testid="tooltip">Tooltip</div>,
  Legend: ({ onClick }: any) => (
    <div
      data-testid="legend"
      onClick={() => onClick?.({ value: 'Test', color: '#000' })}
    >
      Legend
    </div>
  ),
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

const mockData: ChartData = {
  datasets: [
    {
      label: 'Dataset 1',
      data: [
        { x: 'Q1', y: 100 },
        { x: 'Q2', y: 200 },
        { x: 'Q3', y: 150 },
        { x: 'Q4', y: 300 },
      ],
    },
    {
      label: 'Dataset 2',
      data: [
        { x: 'Q1', y: 80 },
        { x: 'Q2', y: 180 },
        { x: 'Q3', y: 120 },
        { x: 'Q4', y: 250 },
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
    y: { show: true, format: (value: number) => `$${value}` },
  },
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-out',
  },
}

describe('BarChart', () => {
  const defaultProps = {
    data: mockData,
    config: mockConfig,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: false,
    colors: ['#3F51B5', '#B19ADA'],
  }

  it('renders bar chart correctly', () => {
    render(<BarChart {...defaultProps} />)

    expect(screen.getByTestId('recharts-bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('renders multiple datasets as bars', () => {
    render(<BarChart {...defaultProps} />)

    expect(screen.getByTestId('bar-Dataset 1')).toBeInTheDocument()
    expect(screen.getByTestId('bar-Dataset 2')).toBeInTheDocument()
    expect(screen.getByText('Bar: Dataset 1')).toBeInTheDocument()
    expect(screen.getByText('Bar: Dataset 2')).toBeInTheDocument()
  })

  it('transforms data correctly for Recharts', () => {
    render(<BarChart {...defaultProps} />)

    const chartDataElement = screen.getByTestId('chart-data')
    const chartData = JSON.parse(chartDataElement.textContent || '[]')

    expect(chartData).toHaveLength(4) // Q1, Q2, Q3, Q4
    expect(chartData[0]).toEqual({
      x: 'Q1',
      'Dataset 1': 100,
      'Dataset 2': 80,
    })
    expect(chartData[1]).toEqual({
      x: 'Q2',
      'Dataset 1': 200,
      'Dataset 2': 180,
    })
    expect(chartData[2]).toEqual({
      x: 'Q3',
      'Dataset 1': 150,
      'Dataset 2': 120,
    })
    expect(chartData[3]).toEqual({
      x: 'Q4',
      'Dataset 1': 300,
      'Dataset 2': 250,
    })
  })

  it('handles bar click events', async () => {
    const user = userEvent.setup()
    const onDataClick = jest.fn()

    render(<BarChart {...defaultProps} onDataClick={onDataClick} />)

    await user.click(screen.getByTestId('bar-Dataset 1'))

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

    render(<BarChart {...defaultProps} onLegendClick={onLegendClick} />)

    await user.click(screen.getByTestId('legend'))

    expect(onLegendClick).toHaveBeenCalledWith({
      label: 'Test',
      color: '#000',
      visible: true,
    })
  })

  it('applies Y-axis formatter when provided', () => {
    render(<BarChart {...defaultProps} />)

    expect(screen.getByText('YAxis (formatted)')).toBeInTheDocument()
  })

  it('hides axes when configured', () => {
    const configWithHiddenAxes = {
      ...mockConfig,
      axes: {
        x: { show: false },
        y: { show: false },
      },
    }

    render(<BarChart {...defaultProps} config={configWithHiddenAxes} />)

    expect(screen.queryByTestId('x-axis')).not.toBeInTheDocument()
    expect(screen.queryByTestId('y-axis')).not.toBeInTheDocument()
  })

  it('hides tooltip when configured', () => {
    const configWithHiddenTooltip = {
      ...mockConfig,
      tooltip: { show: false },
    }

    render(<BarChart {...defaultProps} config={configWithHiddenTooltip} />)

    expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
  })

  it('hides legend when configured', () => {
    const configWithHiddenLegend = {
      ...mockConfig,
      legend: {
        show: false,
        position: 'bottom' as const,
        align: 'center' as const,
      },
    }

    render(<BarChart {...defaultProps} config={configWithHiddenLegend} />)

    expect(screen.queryByTestId('legend')).not.toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    const emptyData: ChartData = { datasets: [] }

    render(<BarChart {...defaultProps} data={emptyData} />)

    expect(screen.getByTestId('recharts-bar-chart')).toBeInTheDocument()

    const chartDataElement = screen.getByTestId('chart-data')
    const chartData = JSON.parse(chartDataElement.textContent || '[]')
    expect(chartData).toHaveLength(0)
  })

  it('sorts categories correctly', () => {
    const unsortedData: ChartData = {
      datasets: [
        {
          label: 'Test',
          data: [
            { x: 'Q3', y: 150 },
            { x: 'Q1', y: 100 },
            { x: 'Q4', y: 300 },
            { x: 'Q2', y: 200 },
          ],
        },
      ],
    }

    render(<BarChart {...defaultProps} data={unsortedData} />)

    const chartDataElement = screen.getByTestId('chart-data')
    const chartData = JSON.parse(chartDataElement.textContent || '[]')

    expect(chartData[0].x).toBe('Q1')
    expect(chartData[1].x).toBe('Q2')
    expect(chartData[2].x).toBe('Q3')
    expect(chartData[3].x).toBe('Q4')
  })

  it('handles numeric categories', () => {
    const numericData: ChartData = {
      datasets: [
        {
          label: 'Test',
          data: [
            { x: 2023, y: 150 },
            { x: 2021, y: 100 },
            { x: 2022, y: 200 },
          ],
        },
      ],
    }

    render(<BarChart {...defaultProps} data={numericData} />)

    const chartDataElement = screen.getByTestId('chart-data')
    const chartData = JSON.parse(chartDataElement.textContent || '[]')

    expect(chartData[0].x).toBe(2021)
    expect(chartData[1].x).toBe(2022)
    expect(chartData[2].x).toBe(2023)
  })

  it('handles missing data points', () => {
    const sparseData: ChartData = {
      datasets: [
        {
          label: 'Dataset 1',
          data: [
            { x: 'Q1', y: 100 },
            { x: 'Q3', y: 150 },
          ],
        },
        {
          label: 'Dataset 2',
          data: [
            { x: 'Q1', y: 80 },
            { x: 'Q2', y: 180 },
            { x: 'Q3', y: 120 },
          ],
        },
      ],
    }

    render(<BarChart {...defaultProps} data={sparseData} />)

    const chartDataElement = screen.getByTestId('chart-data')
    const chartData = JSON.parse(chartDataElement.textContent || '[]')

    expect(chartData).toHaveLength(3) // Q1, Q2, Q3
    expect(chartData[0]).toEqual({
      x: 'Q1',
      'Dataset 1': 100,
      'Dataset 2': 80,
    })
    expect(chartData[1]).toEqual({
      x: 'Q2',
      'Dataset 1': 0, // Missing data should default to 0
      'Dataset 2': 180,
    })
    expect(chartData[2]).toEqual({
      x: 'Q3',
      'Dataset 1': 150,
      'Dataset 2': 120,
    })
  })
})
