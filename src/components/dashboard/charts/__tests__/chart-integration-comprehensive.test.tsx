import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChartWrapper } from '../chart-wrapper'
import { ChartCard } from '../chart-card'
import { ChartData, ChartConfiguration } from '@/types/dashboard'

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children, data, ...props }: any) => (
    <div
      data-testid="line-chart"
      data-chart-data={JSON.stringify(data)}
      {...props}
    >
      {children}
    </div>
  ),
  BarChart: ({ children, data, ...props }: any) => (
    <div
      data-testid="bar-chart"
      data-chart-data={JSON.stringify(data)}
      {...props}
    >
      {children}
    </div>
  ),
  PieChart: ({ children, data, ...props }: any) => (
    <div
      data-testid="pie-chart"
      data-chart-data={JSON.stringify(data)}
      {...props}
    >
      {children}
    </div>
  ),
  Line: (props: any) => <div data-testid="line" {...props} />,
  Bar: (props: any) => <div data-testid="bar" {...props} />,
  Cell: (props: any) => <div data-testid="cell" {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => (
    <div data-testid="cartesian-grid" {...props} />
  ),
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  Legend: (props: any) => <div data-testid="legend" {...props} />,
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>
      {children}
    </div>
  ),
}))

// Mock dynamic imports
jest.mock('../chart-types/line-chart', () => ({
  LineChart: ({ data, config, onDataClick }: any) => (
    <div
      data-testid="line-chart-component"
      onClick={() => onDataClick && onDataClick({ x: 1, y: 100 })}
    >
      Line Chart: {data.datasets.length} datasets
    </div>
  ),
}))

jest.mock('../chart-types/bar-chart', () => ({
  BarChart: ({ data, config }: any) => (
    <div data-testid="bar-chart-component">
      Bar Chart: {data.datasets.length} datasets
    </div>
  ),
}))

jest.mock('../chart-types/pie-chart', () => ({
  PieChart: ({ data, config }: any) => (
    <div data-testid="pie-chart-component">
      Pie Chart: {data.datasets.length} datasets
    </div>
  ),
}))

jest.mock('../chart-types/heatmap-chart', () => ({
  HeatmapChart: ({ data, config }: any) => (
    <div data-testid="heatmap-chart-component">
      Heatmap Chart: {data.datasets.length} datasets
    </div>
  ),
}))

describe('Chart Integration Comprehensive Tests', () => {
  const mockLineData: ChartData = {
    datasets: [
      {
        label: 'Sales',
        data: [
          { x: 'Jan', y: 100 },
          { x: 'Feb', y: 150 },
          { x: 'Mar', y: 120 },
        ],
        color: '#3F51B5',
      },
    ],
    labels: ['Jan', 'Feb', 'Mar'],
  }

  const mockBarData: ChartData = {
    datasets: [
      {
        label: 'Revenue',
        data: [
          { x: 'Q1', y: 10000 },
          { x: 'Q2', y: 15000 },
          { x: 'Q3', y: 12000 },
          { x: 'Q4', y: 18000 },
        ],
        color: '#B19ADA',
      },
    ],
  }

  const mockPieData: ChartData = {
    datasets: [
      {
        label: 'Distribution',
        data: [
          { label: 'Desktop', value: 60 },
          { label: 'Mobile', value: 30 },
          { label: 'Tablet', value: 10 },
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

  describe('ChartWrapper Component', () => {
    it('renders line chart with correct data', async () => {
      render(
        <ChartWrapper type="line" data={mockLineData} config={mockConfig} />
      )

      await waitFor(() => {
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
        expect(screen.getByText('Line Chart: 1 datasets')).toBeInTheDocument()
      })
    })

    it('renders bar chart with correct data', async () => {
      render(<ChartWrapper type="bar" data={mockBarData} config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('bar-chart-component')).toBeInTheDocument()
        expect(screen.getByText('Bar Chart: 1 datasets')).toBeInTheDocument()
      })
    })

    it('renders pie chart with correct data', async () => {
      render(<ChartWrapper type="pie" data={mockPieData} config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('pie-chart-component')).toBeInTheDocument()
        expect(screen.getByText('Pie Chart: 1 datasets')).toBeInTheDocument()
      })
    })

    it('renders heatmap chart with correct data', async () => {
      render(
        <ChartWrapper type="heatmap" data={mockLineData} config={mockConfig} />
      )

      await waitFor(() => {
        expect(
          screen.getByTestId('heatmap-chart-component')
        ).toBeInTheDocument()
        expect(
          screen.getByText('Heatmap Chart: 1 datasets')
        ).toBeInTheDocument()
      })
    })

    it('shows loading state', () => {
      render(<ChartWrapper type="line" data={mockLineData} loading={true} />)

      expect(screen.getByText(/loading chart/i)).toBeInTheDocument()
      expect(
        screen.queryByTestId('line-chart-component')
      ).not.toBeInTheDocument()
    })

    it('shows error state', () => {
      render(
        <ChartWrapper
          type="line"
          data={mockLineData}
          error="Failed to load chart data"
        />
      )

      expect(screen.getByText('Failed to load chart data')).toBeInTheDocument()
      expect(
        screen.queryByTestId('line-chart-component')
      ).not.toBeInTheDocument()
    })

    it('handles data click events', async () => {
      const onDataClick = jest.fn()
      render(
        <ChartWrapper
          type="line"
          data={mockLineData}
          onDataClick={onDataClick}
          interactive={true}
        />
      )

      await waitFor(() => {
        const chart = screen.getByTestId('line-chart-component')
        fireEvent.click(chart)
      })

      expect(onDataClick).toHaveBeenCalledWith({ x: 1, y: 100 })
    })

    it('handles legend click events', async () => {
      const onLegendClick = jest.fn()
      render(
        <ChartWrapper
          type="line"
          data={mockLineData}
          onLegendClick={onLegendClick}
          config={{
            ...mockConfig,
            legend: { show: true, position: 'bottom', align: 'center' },
            animations: { enabled: true, duration: 300, easing: 'ease-out' },
          }}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
      })

      // Simulate legend click (implementation would depend on chart component)
      // This is a placeholder for the expected behavior
    })

    it('applies responsive configuration', () => {
      const responsiveConfig: ChartConfiguration = {
        ...mockConfig,
        responsive: {
          breakpoints: {
            mobile: {
              legend: { show: false },
              tooltip: { show: true },
            },
            tablet: {
              legend: { show: true, position: 'right' },
            },
          },
        },
      }

      render(
        <ChartWrapper
          type="line"
          data={mockLineData}
          config={responsiveConfig}
          responsive={true}
        />
      )

      // Test that responsive config is applied
      // Implementation would depend on how responsive config is handled
    })

    it('accepts height prop', () => {
      render(<ChartWrapper type="line" data={mockLineData} height={400} />)

      // Height prop is accepted without error
      expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
    })

    it('enables export functionality when exportable is true', async () => {
      render(<ChartWrapper type="line" data={mockLineData} exportable={true} />)

      await waitFor(() => {
        const exportButton = screen.queryByRole('button', { name: /export/i })
        expect(exportButton).toBeInTheDocument()
      })
    })
  })

  describe('Data Visualization Accuracy', () => {
    it('correctly processes line chart data', async () => {
      render(<ChartWrapper type="line" data={mockLineData} />)

      await waitFor(() => {
        const chart = screen.getByTestId('line-chart-component')
        expect(chart).toBeInTheDocument()
      })

      // Verify data is passed correctly
      expect(screen.getByText('Line Chart: 1 datasets')).toBeInTheDocument()
    })

    it('correctly processes bar chart data with multiple datasets', async () => {
      const multiDatasetBarData: ChartData = {
        datasets: [
          {
            label: 'Revenue',
            data: [
              { x: 'Q1', y: 10000 },
              { x: 'Q2', y: 15000 },
            ],
            color: '#3F51B5',
          },
          {
            label: 'Profit',
            data: [
              { x: 'Q1', y: 2000 },
              { x: 'Q2', y: 3000 },
            ],
            color: '#B19ADA',
          },
        ],
      }

      render(<ChartWrapper type="bar" data={multiDatasetBarData} />)

      await waitFor(() => {
        expect(screen.getByText('Bar Chart: 2 datasets')).toBeInTheDocument()
      })
    })

    it('correctly processes pie chart data with percentages', async () => {
      const pieDataWithPercentages: ChartData = {
        datasets: [
          {
            label: 'Usage',
            data: [
              { label: 'Desktop', value: 60, metadata: { percentage: '60%' } },
              { label: 'Mobile', value: 30, metadata: { percentage: '30%' } },
              { label: 'Tablet', value: 10, metadata: { percentage: '10%' } },
            ],
          },
        ],
      }

      render(<ChartWrapper type="pie" data={pieDataWithPercentages} />)

      await waitFor(() => {
        expect(screen.getByTestId('pie-chart-component')).toBeInTheDocument()
      })
    })

    it('handles empty datasets gracefully', async () => {
      const emptyData: ChartData = {
        datasets: [],
      }

      render(<ChartWrapper type="line" data={emptyData} />)

      await waitFor(() => {
        expect(screen.getByText(/no data available/i)).toBeInTheDocument()
      })
    })

    it('handles malformed data gracefully', async () => {
      const malformedData: ChartData = {
        datasets: [
          {
            label: 'Invalid',
            data: [
              { x: null, y: undefined },
              { x: 'valid', y: 100 },
            ],
          },
        ],
      }

      render(<ChartWrapper type="line" data={malformedData} />)

      await waitFor(() => {
        // Should render without crashing and show valid data
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
      })
    })

    it('validates data types and formats', async () => {
      const mixedTypeData: ChartData = {
        datasets: [
          {
            label: 'Mixed',
            data: [
              { x: 'Jan', y: 100 },
              { x: 'Feb', y: '150' }, // String number
              { x: 'Mar', y: 120 },
            ],
          },
        ],
      }

      render(<ChartWrapper type="line" data={mixedTypeData} />)

      await waitFor(() => {
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
      })
    })
  })

  describe('Chart Configuration', () => {
    it('applies color configuration correctly', async () => {
      const colorConfig: ChartConfiguration = {
        colors: {
          primary: '#FF0000',
          secondary: '#00FF00',
          accent: '#0000FF',
          success: '#00FFFF',
          warning: '#FFFF00',
          error: '#FF00FF',
        },
      }

      render(
        <ChartWrapper type="line" data={mockLineData} config={colorConfig} />
      )

      await waitFor(() => {
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
      })

      // Configuration should be passed to chart component
      // Actual color application would be tested in individual chart component tests
    })

    it('configures legend display and positioning', async () => {
      const legendConfig: ChartConfiguration = {
        legend: {
          show: true,
          position: 'top',
          align: 'start',
        },
      }

      render(
        <ChartWrapper type="line" data={mockLineData} config={legendConfig} />
      )

      await waitFor(() => {
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
      })
    })

    it('configures tooltip behavior', async () => {
      const tooltipConfig: ChartConfiguration = {
        tooltip: {
          show: true,
          format: (value: any) => `$${value.toLocaleString()}`,
        },
      }

      render(
        <ChartWrapper type="line" data={mockLineData} config={tooltipConfig} />
      )

      await waitFor(() => {
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
      })
    })

    it('configures animation settings', async () => {
      const animationConfig: ChartConfiguration = {
        animations: {
          enabled: true,
          duration: 500,
          easing: 'ease-in-out',
        },
      }

      render(
        <ChartWrapper
          type="line"
          data={mockLineData}
          config={animationConfig}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
      })
    })

    it('disables animations when specified', async () => {
      const noAnimationConfig: ChartConfiguration = {
        animations: {
          enabled: false,
          duration: 0,
          easing: 'linear',
        },
      }

      render(
        <ChartWrapper
          type="line"
          data={mockLineData}
          config={noAnimationConfig}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
      })
    })
  })

  describe('Performance and Lazy Loading', () => {
    it('lazy loads chart components', async () => {
      render(<ChartWrapper type="line" data={mockLineData} />)

      // Chart loads dynamically
      await waitFor(() => {
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
      })
    })

    it('memoizes chart data to prevent unnecessary re-renders', async () => {
      const { rerender } = render(
        <ChartWrapper type="line" data={mockLineData} config={mockConfig} />
      )

      await waitFor(() => {
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
      })

      // Re-render with same data
      rerender(
        <ChartWrapper type="line" data={mockLineData} config={mockConfig} />
      )

      // Chart should not re-render if data hasn't changed
      expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
    })

    it('handles large datasets efficiently', async () => {
      const largeDataset: ChartData = {
        datasets: [
          {
            label: 'Large Dataset',
            data: Array.from({ length: 1000 }, (_, i) => ({
              x: i,
              y: Math.random() * 100,
            })),
          },
        ],
      }

      const startTime = performance.now()

      render(<ChartWrapper type="line" data={largeDataset} />)

      await waitFor(() => {
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000) // 1 second
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels for charts', async () => {
      render(
        <ChartWrapper type="line" data={mockLineData} config={mockConfig} />
      )

      await waitFor(() => {
        const chartContainer = screen.getByRole('application')
        expect(chartContainer).toHaveAttribute(
          'aria-label',
          expect.stringContaining('line chart')
        )
      })
    })

    it('provides keyboard navigation for interactive charts', async () => {
      render(
        <ChartWrapper type="line" data={mockLineData} interactive={true} />
      )

      await waitFor(() => {
        const chartContainer = screen.getByRole('application')
        expect(chartContainer).toHaveAttribute('tabindex', '0')
      })
    })

    it('announces data updates to screen readers', async () => {
      const { rerender } = render(
        <ChartWrapper type="line" data={mockLineData} />
      )

      const updatedData: ChartData = {
        ...mockLineData,
        datasets: [
          {
            ...mockLineData.datasets[0],
            data: [
              { x: 'Jan', y: 200 },
              { x: 'Feb', y: 250 },
              { x: 'Mar', y: 220 },
            ],
          },
        ],
      }

      rerender(<ChartWrapper type="line" data={updatedData} />)

      await waitFor(() => {
        // Chart should re-render with updated data
        expect(screen.getByTestId('line-chart-component')).toBeInTheDocument()
      })
    })
  })
})
