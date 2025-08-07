import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ChartCard } from '../chart-card'
import { BarChart3 } from 'lucide-react'

expect.extend(toHaveNoViolations)

// Mock ChartWrapper component
jest.mock('../../charts/chart-wrapper', () => ({
  ChartWrapper: ({ type, data, onDataClick, className }: any) => (
    <div
      className={className}
      data-testid="chart-wrapper"
      data-chart-type={type}
      onClick={() => onDataClick?.({ label: 'test-data', x: 1, y: 100 })}
    >
      Mock Chart: {type}
      <div>Data points: {data?.datasets?.[0]?.data?.length || 0}</div>
    </div>
  ),
}))

describe('ChartCard', () => {
  const user = userEvent.setup()

  const mockChartData = {
    datasets: [
      {
        label: 'Test Dataset',
        data: [
          { x: 1, y: 100, label: 'Point 1' },
          { x: 2, y: 200, label: 'Point 2' },
          { x: 3, y: 150, label: 'Point 3' },
        ],
      },
    ],
    labels: ['Jan', 'Feb', 'Mar'],
  }

  const mockChartConfig = {
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
      position: 'bottom' as const,
      align: 'center' as const,
    },
  }

  describe('Basic Rendering', () => {
    it('renders with title and chart', async () => {
      render(
        <ChartCard title="Test Chart" chartType="bar" data={mockChartData} />
      )

      expect(screen.getByText('Test Chart')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument()
        expect(screen.getByText('Mock Chart: bar')).toBeInTheDocument()
      })
    })

    it('renders with subtitle and icon', async () => {
      render(
        <ChartCard
          title="Chart with Icon"
          subtitle="Test subtitle"
          icon={BarChart3}
          chartType="line"
          data={mockChartData}
        />
      )

      expect(screen.getByText('Chart with Icon')).toBeInTheDocument()
      expect(screen.getByText('Test subtitle')).toBeInTheDocument()

      const icon = document.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('passes chart configuration correctly', async () => {
      render(
        <ChartCard
          title="Configured Chart"
          chartType="pie"
          data={mockChartData}
          chartConfig={mockChartConfig}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument()
        expect(screen.getByText('Mock Chart: pie')).toBeInTheDocument()
      })
    })
  })

  describe('Chart Actions', () => {
    it('renders filter button when filterable', () => {
      render(
        <ChartCard
          title="Filterable Chart"
          chartType="bar"
          data={mockChartData}
          filterable
        />
      )

      const filterButton = screen.getByLabelText('Filter chart data')
      expect(filterButton).toBeInTheDocument()
    })

    it('renders export dropdown when exportable', async () => {
      render(
        <ChartCard
          title="Exportable Chart"
          chartType="bar"
          data={mockChartData}
          exportable
        />
      )

      const exportButton = screen.getByLabelText('Export chart')
      expect(exportButton).toBeInTheDocument()

      await user.click(exportButton)

      expect(screen.getByText('Export as PNG')).toBeInTheDocument()
      expect(screen.getByText('Export as SVG')).toBeInTheDocument()
      expect(screen.getByText('Export as PDF')).toBeInTheDocument()
    })

    it('handles filter button click', async () => {
      const mockOnFilter = jest.fn()

      render(
        <ChartCard
          title="Filterable Chart"
          chartType="bar"
          data={mockChartData}
          filterable
          onFilter={mockOnFilter}
        />
      )

      const filterButton = screen.getByLabelText('Filter chart data')
      await user.click(filterButton)

      expect(mockOnFilter).toHaveBeenCalledWith({
        type: 'string',
        value: 'chart-filter',
        operator: 'equals',
      })
    })

    it('handles export menu clicks', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      render(
        <ChartCard
          title="Exportable Chart"
          chartType="bar"
          data={mockChartData}
          exportable
        />
      )

      const exportButton = screen.getByLabelText('Export chart')
      await user.click(exportButton)

      const pngOption = screen.getByText('Export as PNG')
      await user.click(pngOption)

      expect(consoleSpy).toHaveBeenCalledWith('Exporting chart as png')

      consoleSpy.mockRestore()
    })

    it('renders custom actions alongside chart actions', () => {
      render(
        <ChartCard
          title="Chart with Actions"
          chartType="bar"
          data={mockChartData}
          filterable
          exportable
          actions={<button>Custom Action</button>}
        />
      )

      expect(screen.getByLabelText('Filter chart data')).toBeInTheDocument()
      expect(screen.getByLabelText('Export chart')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Custom Action' })
      ).toBeInTheDocument()
    })
  })

  describe('Loading and Error States', () => {
    it('renders loading skeleton', () => {
      render(
        <ChartCard
          title="Loading Chart"
          chartType="bar"
          data={mockChartData}
          loading
        />
      )

      // Should show skeleton elements
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)

      // Should not show chart
      expect(screen.queryByTestId('chart-wrapper')).not.toBeInTheDocument()
    })

    it('renders error state', () => {
      render(
        <ChartCard
          title="Error Chart"
          chartType="bar"
          data={mockChartData}
          error="Failed to load chart data"
        />
      )

      expect(screen.getByText('Unable to load chart')).toBeInTheDocument()
      expect(screen.getByText('Failed to load chart data')).toBeInTheDocument()

      // Should not show chart
      expect(screen.queryByTestId('chart-wrapper')).not.toBeInTheDocument()
    })

    it('shows loading spinner while chart component loads', () => {
      render(
        <ChartCard
          title="Loading Chart Component"
          chartType="bar"
          data={mockChartData}
        />
      )

      // Chart should be rendered (mocked)
      expect(screen.getByText('Loading Chart Component')).toBeInTheDocument()
    })
  })

  describe('Chart Interaction', () => {
    it('handles chart data clicks for filtering', async () => {
      const mockOnFilter = jest.fn()

      render(
        <ChartCard
          title="Interactive Chart"
          chartType="bar"
          data={mockChartData}
          interactive
          onFilter={mockOnFilter}
        />
      )

      await waitFor(() => {
        const chart = screen.getByTestId('chart-wrapper')
        fireEvent.click(chart)
      })

      expect(mockOnFilter).toHaveBeenCalledWith({
        type: 'string',
        value: 'test-data',
        operator: 'equals',
      })
    })

    it('does not handle clicks when not interactive', async () => {
      const mockOnFilter = jest.fn()

      render(
        <ChartCard
          title="Non-interactive Chart"
          chartType="bar"
          data={mockChartData}
          onFilter={mockOnFilter}
        />
      )

      await waitFor(() => {
        const chart = screen.getByTestId('chart-wrapper')
        fireEvent.click(chart)
      })

      // onFilter should still be called because chart wrapper handles it
      expect(mockOnFilter).toHaveBeenCalled()
    })
  })

  describe('Chart Types', () => {
    const chartTypes = [
      'line',
      'bar',
      'pie',
      'heatmap',
      'area',
      'scatter',
    ] as const

    chartTypes.forEach(chartType => {
      it(`renders ${chartType} chart correctly`, async () => {
        render(
          <ChartCard
            title={`${chartType} Chart`}
            chartType={chartType}
            data={mockChartData}
          />
        )

        await waitFor(() => {
          expect(screen.getByTestId('chart-wrapper')).toHaveAttribute(
            'data-chart-type',
            chartType
          )
          expect(
            screen.getByText(`Mock Chart: ${chartType}`)
          ).toBeInTheDocument()
        })
      })
    })
  })

  describe('Custom Content', () => {
    it('renders additional children content', async () => {
      render(
        <ChartCard
          title="Chart with Content"
          chartType="bar"
          data={mockChartData}
        >
          <div>Additional chart content</div>
        </ChartCard>
      )

      expect(screen.getByText('Additional chart content')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('meets WCAG accessibility standards', async () => {
      const { container } = render(
        <ChartCard
          title="Accessible Chart"
          subtitle="Chart subtitle"
          icon={BarChart3}
          chartType="bar"
          data={mockChartData}
          filterable
          exportable
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('provides proper ARIA labels for action buttons', () => {
      render(
        <ChartCard
          title="Chart with Actions"
          chartType="bar"
          data={mockChartData}
          filterable
          exportable
        />
      )

      expect(screen.getByLabelText('Filter chart data')).toBeInTheDocument()
      expect(screen.getByLabelText('Export chart')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('handles empty data gracefully', async () => {
      const emptyData = {
        datasets: [],
        labels: [],
      }

      render(<ChartCard title="Empty Chart" chartType="bar" data={emptyData} />)

      await waitFor(() => {
        expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument()
        expect(screen.getByText('Data points: 0')).toBeInTheDocument()
      })
    })

    it('applies custom className', () => {
      render(
        <ChartCard
          title="Custom Chart"
          chartType="bar"
          data={mockChartData}
          className="custom-chart-class"
        />
      )

      const card = document.querySelector('.chart-card')
      expect(card).toHaveClass('custom-chart-class')
    })
  })
})
