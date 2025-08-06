import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PieChart } from '../pie-chart'
import type { ChartData, ChartConfiguration } from '@/types/dashboard'

// Mock Recharts components
jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => (
    <div data-testid="recharts-pie-chart">{children}</div>
  ),
  Pie: ({ data, onClick, label }: any) => (
    <div data-testid="pie">
      <div data-testid="pie-data">{JSON.stringify(data)}</div>
      {data.map((item: any, index: number) => (
        <div
          key={index}
          data-testid={`pie-slice-${index}`}
          onClick={() => onClick?.(item, index)}
        >
          Slice: {item.name} ({item.value})
        </div>
      ))}
    </div>
  ),
  Cell: ({ fill }: any) => <div data-testid="pie-cell" style={{ backgroundColor: fill }} />,
  Tooltip: ({ content }: any) => <div data-testid="tooltip">Tooltip</div>,
  Legend: ({ content }: any) => <div data-testid="legend">Legend</div>,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

const mockData: ChartData = {
  datasets: [
    {
      label: 'Categories',
      data: [
        { label: 'Category A', value: 100, color: '#3F51B5' },
        { label: 'Category B', value: 200, color: '#B19ADA' },
        { label: 'Category C', value: 150, color: '#FF6B35' },
        { label: 'Category D', value: 50, color: '#10B981' },
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
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-out',
  },
}

describe('PieChart', () => {
  const defaultProps = {
    data: mockData,
    config: mockConfig,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: false,
    colors: ['#3F51B5', '#B19ADA', '#FF6B35', '#10B981'],
  }

  it('renders pie chart correctly', () => {
    render(<PieChart {...defaultProps} />)

    expect(screen.getByTestId('recharts-pie-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('pie')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('transforms data correctly for pie chart', () => {
    render(<PieChart {...defaultProps} />)

    const pieDataElement = screen.getByTestId('pie-data')
    const pieData = JSON.parse(pieDataElement.textContent || '[]')

    expect(pieData).toHaveLength(4)
    expect(pieData[0]).toEqual({
      name: 'Category A',
      value: 100,
      color: '#3F51B5',
      originalData: mockData.datasets[0].data[0],
    })
    expect(pieData[1]).toEqual({
      name: 'Category B',
      value: 200,
      color: '#B19ADA',
      originalData: mockData.datasets[0].data[1],
    })
  })

  it('renders pie slices with correct data', () => {
    render(<PieChart {...defaultProps} />)

    expect(screen.getByText('Slice: Category A (100)')).toBeInTheDocument()
    expect(screen.getByText('Slice: Category B (200)')).toBeInTheDocument()
    expect(screen.getByText('Slice: Category C (150)')).toBeInTheDocument()
    expect(screen.getByText('Slice: Category D (50)')).toBeInTheDocument()
  })

  it('handles slice click events', async () => {
    const user = userEvent.setup()
    const onDataClick = jest.fn()

    render(<PieChart {...defaultProps} onDataClick={onDataClick} />)

    await user.click(screen.getByTestId('pie-slice-0'))

    expect(onDataClick).toHaveBeenCalledWith({
      x: 'Category A',
      y: 100,
      value: 100,
      label: 'Category A',
      color: '#3F51B5',
      metadata: mockData.datasets[0].data[0].metadata,
    })
  })

  it('uses fallback colors when data colors are not provided', () => {
    const dataWithoutColors: ChartData = {
      datasets: [
        {
          label: 'Categories',
          data: [
            { label: 'Category A', value: 100 },
            { label: 'Category B', value: 200 },
          ],
        },
      ],
    }

    render(<PieChart {...defaultProps} data={dataWithoutColors} />)

    const pieDataElement = screen.getByTestId('pie-data')
    const pieData = JSON.parse(pieDataElement.textContent || '[]')

    expect(pieData[0].color).toBe('#3F51B5') // First color from props
    expect(pieData[1].color).toBe('#B19ADA') // Second color from props
  })

  it('generates labels from x values when label is not provided', () => {
    const dataWithXValues: ChartData = {
      datasets: [
        {
          label: 'Categories',
          data: [
            { x: 'A', value: 100 },
            { x: 'B', value: 200 },
          ],
        },
      ],
    }

    render(<PieChart {...defaultProps} data={dataWithXValues} />)

    const pieDataElement = screen.getByTestId('pie-data')
    const pieData = JSON.parse(pieDataElement.textContent || '[]')

    expect(pieData[0].name).toBe('A')
    expect(pieData[1].name).toBe('B')
  })

  it('generates fallback labels when neither label nor x is provided', () => {
    const dataWithoutLabels: ChartData = {
      datasets: [
        {
          label: 'Categories',
          data: [
            { value: 100 },
            { value: 200 },
          ],
        },
      ],
    }

    render(<PieChart {...defaultProps} data={dataWithoutLabels} />)

    const pieDataElement = screen.getByTestId('pie-data')
    const pieData = JSON.parse(pieDataElement.textContent || '[]')

    expect(pieData[0].name).toBe('Item 1')
    expect(pieData[1].name).toBe('Item 2')
  })

  it('uses y value when value is not provided', () => {
    const dataWithYValues: ChartData = {
      datasets: [
        {
          label: 'Categories',
          data: [
            { label: 'Category A', y: 100 },
            { label: 'Category B', y: 200 },
          ],
        },
      ],
    }

    render(<PieChart {...defaultProps} data={dataWithYValues} />)

    const pieDataElement = screen.getByTestId('pie-data')
    const pieData = JSON.parse(pieDataElement.textContent || '[]')

    expect(pieData[0].value).toBe(100)
    expect(pieData[1].value).toBe(200)
  })

  it('hides tooltip when configured', () => {
    const configWithHiddenTooltip = {
      ...mockConfig,
      tooltip: { show: false },
    }

    render(<PieChart {...defaultProps} config={configWithHiddenTooltip} />)

    expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
  })

  it('hides legend when configured', () => {
    const configWithHiddenLegend = {
      ...mockConfig,
      legend: { show: false, position: 'bottom' as const, align: 'center' as const },
    }

    render(<PieChart {...defaultProps} config={configWithHiddenLegend} />)

    expect(screen.queryByTestId('legend')).not.toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    const emptyData: ChartData = { datasets: [] }

    render(<PieChart {...defaultProps} data={emptyData} />)

    expect(screen.getByTestId('recharts-pie-chart')).toBeInTheDocument()
    
    const pieDataElement = screen.getByTestId('pie-data')
    const pieData = JSON.parse(pieDataElement.textContent || '[]')
    expect(pieData).toHaveLength(0)
  })

  it('handles dataset without data', () => {
    const datasetWithoutData: ChartData = {
      datasets: [
        {
          label: 'Empty Dataset',
          data: [],
        },
      ],
    }

    render(<PieChart {...defaultProps} data={datasetWithoutData} />)

    const pieDataElement = screen.getByTestId('pie-data')
    const pieData = JSON.parse(pieDataElement.textContent || '[]')
    expect(pieData).toHaveLength(0)
  })

  it('handles zero values', () => {
    const dataWithZeros: ChartData = {
      datasets: [
        {
          label: 'Categories',
          data: [
            { label: 'Category A', value: 0 },
            { label: 'Category B', value: 200 },
            { label: 'Category C', value: 0 },
          ],
        },
      ],
    }

    render(<PieChart {...defaultProps} data={dataWithZeros} />)

    const pieDataElement = screen.getByTestId('pie-data')
    const pieData = JSON.parse(pieDataElement.textContent || '[]')

    expect(pieData).toHaveLength(3)
    expect(pieData[0].value).toBe(0)
    expect(pieData[1].value).toBe(200)
    expect(pieData[2].value).toBe(0)
  })

  it('cycles through colors when there are more data points than colors', () => {
    const manyDataPoints: ChartData = {
      datasets: [
        {
          label: 'Categories',
          data: [
            { label: 'A', value: 100 },
            { label: 'B', value: 200 },
            { label: 'C', value: 150 },
            { label: 'D', value: 50 },
            { label: 'E', value: 75 }, // Should cycle back to first color
          ],
        },
      ],
    }

    render(<PieChart {...defaultProps} data={manyDataPoints} />)

    const pieDataElement = screen.getByTestId('pie-data')
    const pieData = JSON.parse(pieDataElement.textContent || '[]')

    expect(pieData[0].color).toBe('#3F51B5') // First color
    expect(pieData[4].color).toBe('#3F51B5') // Cycles back to first color
  })
})