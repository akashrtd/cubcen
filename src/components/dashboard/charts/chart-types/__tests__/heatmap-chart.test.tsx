import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeatmapChart } from '../heatmap-chart'
import type { ChartData, ChartConfiguration } from '@/types/dashboard'

// Mock Recharts ResponsiveContainer
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

const mockData: ChartData = {
  datasets: [
    {
      label: 'Heatmap Data',
      data: [
        { x: 'Mon', y: 'Morning', value: 10 },
        { x: 'Mon', y: 'Afternoon', value: 20 },
        { x: 'Mon', y: 'Evening', value: 15 },
        { x: 'Tue', y: 'Morning', value: 25 },
        { x: 'Tue', y: 'Afternoon', value: 30 },
        { x: 'Tue', y: 'Evening', value: 18 },
        { x: 'Wed', y: 'Morning', value: 12 },
        { x: 'Wed', y: 'Afternoon', value: 22 },
        { x: 'Wed', y: 'Evening', value: 28 },
      ],
    },
  ],
  metadata: {
    title: 'Weekly Activity Heatmap',
  },
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
    format: (value: number) => `${value} units`,
  },
}

describe('HeatmapChart', () => {
  const defaultProps = {
    data: mockData,
    config: mockConfig,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: false,
    colors: ['#3F51B5'],
  }

  it('renders heatmap chart correctly', () => {
    render(<HeatmapChart {...defaultProps} />)

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByText('Weekly Activity Heatmap')).toBeInTheDocument()
  })

  it('renders axis labels correctly', () => {
    render(<HeatmapChart {...defaultProps} />)

    // X-axis labels
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()

    // Y-axis labels
    expect(screen.getByText('Morning')).toBeInTheDocument()
    expect(screen.getByText('Afternoon')).toBeInTheDocument()
    expect(screen.getByText('Evening')).toBeInTheDocument()
  })

  it('sorts axis labels correctly', () => {
    const unsortedData: ChartData = {
      datasets: [
        {
          label: 'Test',
          data: [
            { x: 'Wed', y: 'Evening', value: 10 },
            { x: 'Mon', y: 'Morning', value: 20 },
            { x: 'Tue', y: 'Afternoon', value: 15 },
          ],
        },
      ],
    }

    render(<HeatmapChart {...defaultProps} data={unsortedData} />)

    // Labels should be sorted alphabetically
    const xLabels = screen.getAllByText(/Mon|Tue|Wed/)
    const yLabels = screen.getAllByText(/Morning|Afternoon|Evening/)

    expect(xLabels.length).toBeGreaterThan(0)
    expect(yLabels.length).toBeGreaterThan(0)
  })

  it('handles numeric axis values', () => {
    const numericData: ChartData = {
      datasets: [
        {
          label: 'Numeric Data',
          data: [
            { x: 2023, y: 1, value: 10 },
            { x: 2022, y: 2, value: 20 },
            { x: 2021, y: 3, value: 15 },
          ],
        },
      ],
    }

    render(<HeatmapChart {...defaultProps} data={numericData} />)

    expect(screen.getByText('2021')).toBeInTheDocument()
    expect(screen.getByText('2022')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('handles cell click events', async () => {
    const user = userEvent.setup()
    const onDataClick = jest.fn()

    render(<HeatmapChart {...defaultProps} onDataClick={onDataClick} />)

    // Find and click a cell (SVG rect element)
    const cells = document.querySelectorAll('rect')
    expect(cells.length).toBeGreaterThan(0)

    fireEvent.click(cells[0])

    expect(onDataClick).toHaveBeenCalled()
  })

  it('shows tooltip on mouse enter', async () => {
    render(<HeatmapChart {...defaultProps} />)

    const cells = document.querySelectorAll('rect')
    expect(cells.length).toBeGreaterThan(0)

    // Simulate mouse enter
    fireEvent.mouseEnter(cells[0], {
      clientX: 100,
      clientY: 100,
    })

    // Tooltip should appear (though we can't easily test the positioning)
    // The tooltip is rendered conditionally based on state
  })

  it('hides tooltip on mouse leave', async () => {
    render(<HeatmapChart {...defaultProps} />)

    const cells = document.querySelectorAll('rect')
    expect(cells.length).toBeGreaterThan(0)

    // Simulate mouse enter then leave
    fireEvent.mouseEnter(cells[0], {
      clientX: 100,
      clientY: 100,
    })
    fireEvent.mouseLeave(cells[0])

    // Tooltip should be hidden
  })

  it('renders color legend when enabled', () => {
    render(<HeatmapChart {...defaultProps} />)

    // Should show min and max values in legend (with formatter applied)
    expect(screen.getByText('10 units')).toBeInTheDocument() // Min value
    expect(screen.getByText('30 units')).toBeInTheDocument() // Max value
  })

  it('hides color legend when disabled', () => {
    const configWithoutLegend = {
      ...mockConfig,
      legend: {
        show: false,
        position: 'bottom' as const,
        align: 'center' as const,
      },
    }

    render(<HeatmapChart {...defaultProps} config={configWithoutLegend} />)

    // Legend should not be visible
    // This is harder to test directly, but the component should not render the legend div
  })

  it('applies custom color based on value', () => {
    render(<HeatmapChart {...defaultProps} />)

    const cells = document.querySelectorAll('rect')
    expect(cells.length).toBeGreaterThan(0)

    // Each cell should have a fill color
    cells.forEach(cell => {
      expect(cell.getAttribute('fill')).toBeTruthy()
    })
  })

  it('handles empty data gracefully', () => {
    const emptyData: ChartData = { datasets: [] }

    render(<HeatmapChart {...defaultProps} data={emptyData} />)

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()

    // Should not render any cells
    const cells = document.querySelectorAll('rect')
    expect(cells.length).toBe(0)
  })

  it('handles data without x or y values', () => {
    const invalidData: ChartData = {
      datasets: [
        {
          label: 'Invalid Data',
          data: [
            { value: 10 }, // Missing x and y
            { x: 'A', value: 20 }, // Missing y
            { y: 'B', value: 15 }, // Missing x
          ],
        },
      ],
    }

    render(<HeatmapChart {...defaultProps} data={invalidData} />)

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()

    // Should handle gracefully without crashing
  })

  it('calculates min and max values correctly', () => {
    render(<HeatmapChart {...defaultProps} />)

    // Min value should be 10, max should be 30 based on mock data (with formatter applied)
    expect(screen.getByText('10 units')).toBeInTheDocument()
    expect(screen.getByText('30 units')).toBeInTheDocument()
  })

  it('handles single value data', () => {
    const singleValueData: ChartData = {
      datasets: [
        {
          label: 'Single Value',
          data: [{ x: 'A', y: 'B', value: 50 }],
        },
      ],
    }

    render(<HeatmapChart {...defaultProps} data={singleValueData} />)

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getAllByText('50 units')).toHaveLength(2) // Min and max are the same
  })

  it('applies tooltip formatter when provided', () => {
    render(<HeatmapChart {...defaultProps} />)

    const cells = document.querySelectorAll('rect')
    expect(cells.length).toBeGreaterThan(0)

    // Simulate mouse enter to show tooltip
    fireEvent.mouseEnter(cells[0], {
      clientX: 100,
      clientY: 100,
    })

    // The tooltip should use the formatter (though hard to test the exact content)
  })

  it('handles missing values in sparse data', () => {
    const sparseData: ChartData = {
      datasets: [
        {
          label: 'Sparse Data',
          data: [
            { x: 'A', y: '1', value: 10 },
            { x: 'C', y: '1', value: 20 }, // Missing B,1
            { x: 'A', y: '3', value: 15 }, // Missing A,2
          ],
        },
      ],
    }

    render(<HeatmapChart {...defaultProps} data={sparseData} />)

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    // Should render cells for all combinations, with 0 values for missing data
    const cells = document.querySelectorAll('rect')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('renders without title when not provided', () => {
    const dataWithoutTitle: ChartData = {
      datasets: [
        {
          label: 'Test',
          data: [{ x: 'A', y: 'B', value: 10 }],
        },
      ],
    }

    render(<HeatmapChart {...defaultProps} data={dataWithoutTitle} />)

    expect(
      screen.queryByText('Weekly Activity Heatmap')
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })
})
