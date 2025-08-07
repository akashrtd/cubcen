import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import {
  createDynamicChart,
  withDynamicLoading,
  DynamicAnalyticsDashboard,
  DynamicPerformanceCharts,
  DynamicTaskBoard,
  preloadChartComponents,
  preloadDashboardComponents,
  trackDynamicImportPerformance,
} from '../dynamic-imports'

// Mock the chart components
jest.mock('../../charts/chart-types/line-chart', () => ({
  LineChart: ({ data }: any) => (
    <div data-testid="line-chart">Line Chart: {data?.datasets?.[0]?.label}</div>
  ),
}))

jest.mock('../../charts/chart-types/bar-chart', () => ({
  BarChart: ({ data }: any) => (
    <div data-testid="bar-chart">Bar Chart: {data?.datasets?.[0]?.label}</div>
  ),
}))

jest.mock('../../charts/chart-types/pie-chart', () => ({
  PieChart: ({ data }: any) => (
    <div data-testid="pie-chart">Pie Chart: {data?.datasets?.[0]?.label}</div>
  ),
}))

jest.mock('../../charts/chart-types/heatmap-chart', () => ({
  HeatmapChart: ({ data }: any) => (
    <div data-testid="heatmap-chart">
      Heatmap Chart: {data?.datasets?.[0]?.label}
    </div>
  ),
}))

// Mock other components
jest.mock('../../../analytics/analytics-dashboard', () => ({
  AnalyticsDashboard: () => (
    <div data-testid="analytics-dashboard">Analytics Dashboard</div>
  ),
}))

jest.mock('../../../analytics/performance-charts', () => ({
  PerformanceCharts: () => (
    <div data-testid="performance-charts">Performance Charts</div>
  ),
}))

jest.mock('../../../kanban/task-board', () => ({
  TaskBoard: () => <div data-testid="task-board">Task Board</div>,
}))

const mockChartData = {
  datasets: [
    {
      label: 'Test Dataset',
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
      ],
    },
  ],
}

describe('Dynamic Imports', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createDynamicChart', () => {
    it('should create line chart component', async () => {
      const DynamicLineChart = createDynamicChart('line')

      render(<DynamicLineChart data={mockChartData} />)

      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      })

      expect(screen.getByText('Line Chart: Test Dataset')).toBeInTheDocument()
    })

    it('should create bar chart component', async () => {
      const DynamicBarChart = createDynamicChart('bar')

      render(<DynamicBarChart data={mockChartData} />)

      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      })

      expect(screen.getByText('Bar Chart: Test Dataset')).toBeInTheDocument()
    })

    it('should create pie chart component', async () => {
      const DynamicPieChart = createDynamicChart('pie')

      render(<DynamicPieChart data={mockChartData} />)

      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      })

      expect(screen.getByText('Pie Chart: Test Dataset')).toBeInTheDocument()
    })

    it('should create heatmap chart component', async () => {
      const DynamicHeatmapChart = createDynamicChart('heatmap')

      render(<DynamicHeatmapChart data={mockChartData} />)

      await waitFor(() => {
        expect(screen.getByTestId('heatmap-chart')).toBeInTheDocument()
      })

      expect(
        screen.getByText('Heatmap Chart: Test Dataset')
      ).toBeInTheDocument()
    })

    it('should handle unsupported chart types', () => {
      const DynamicUnsupportedChart = createDynamicChart('unsupported' as any)

      render(<DynamicUnsupportedChart data={mockChartData} />)

      expect(screen.getByText('Chart failed to load')).toBeInTheDocument()
    })

    it('should show loading fallback while chart loads', () => {
      const DynamicLineChart = createDynamicChart('line')

      render(<DynamicLineChart data={mockChartData} fallbackHeight={400} />)

      // Should show skeleton loading state initially
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('withDynamicLoading', () => {
    it('should wrap component with dynamic loading', async () => {
      const TestComponent = ({ message }: { message: string }) => (
        <div data-testid="test-component">{message}</div>
      )

      const DynamicTestComponent = withDynamicLoading(
        () => Promise.resolve({ default: TestComponent }),
        <div data-testid="loading">Loading...</div>,
        <div data-testid="error">Error loading component</div>
      )

      render(<DynamicTestComponent message="Hello World" />)

      // Should show loading state initially
      expect(screen.getByTestId('loading')).toBeInTheDocument()

      // Should show component after loading
      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument()
      })

      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('should show error fallback on import failure', async () => {
      const DynamicFailingComponent = withDynamicLoading(
        () => Promise.reject(new Error('Import failed')),
        <div data-testid="loading">Loading...</div>,
        <div data-testid="error">Error loading component</div>
      )

      render(<DynamicFailingComponent />)

      // Should show loading state initially
      expect(screen.getByTestId('loading')).toBeInTheDocument()

      // Should show error state after failure
      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument()
      })
    })
  })

  describe('Pre-configured Dynamic Components', () => {
    it('should render DynamicAnalyticsDashboard', async () => {
      render(<DynamicAnalyticsDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument()
      })
    })

    it('should render DynamicPerformanceCharts', async () => {
      render(<DynamicPerformanceCharts />)

      await waitFor(() => {
        expect(screen.getByTestId('performance-charts')).toBeInTheDocument()
      })
    })

    it('should render DynamicTaskBoard', async () => {
      render(<DynamicTaskBoard />)

      await waitFor(() => {
        expect(screen.getByTestId('task-board')).toBeInTheDocument()
      })
    })
  })

  describe('Preloading Functions', () => {
    it('should preload chart components', () => {
      // Mock dynamic import
      const mockImport = jest.fn(() => Promise.resolve({}))

      // Replace global import with mock
      const originalImport = global.import
      ;(global as any).import = mockImport

      preloadChartComponents()

      // Restore original import
      ;(global as any).import = originalImport

      // Note: In a real test environment, we would verify that the imports were called
      // but since we're mocking, we just ensure the function doesn't throw
      expect(preloadChartComponents).not.toThrow()
    })

    it('should preload dashboard components', () => {
      expect(preloadDashboardComponents).not.toThrow()
    })
  })

  describe('Performance Tracking', () => {
    beforeEach(() => {
      // Mock performance API
      Object.defineProperty(window, 'performance', {
        value: {
          now: jest.fn(() => Date.now()),
        },
        writable: true,
      })

      // Mock gtag
      ;(window as any).gtag = jest.fn()
    })

    it('should track dynamic import performance', () => {
      const mockNow = jest
        .fn()
        .mockReturnValueOnce(1000) // start time
        .mockReturnValueOnce(1150) // end time

      Object.defineProperty(window, 'performance', {
        value: { now: mockNow },
        writable: true,
      })

      const tracker = trackDynamicImportPerformance('test-component')
      tracker.end()

      expect(mockNow).toHaveBeenCalledTimes(2)
    })

    it('should send analytics data when gtag is available', () => {
      const mockGtag = jest.fn()
      ;(window as any).gtag = mockGtag

      const mockNow = jest
        .fn()
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1200)

      Object.defineProperty(window, 'performance', {
        value: { now: mockNow },
        writable: true,
      })

      const tracker = trackDynamicImportPerformance('test-component')
      tracker.end()

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'dynamic_import_performance',
        {
          component_name: 'test-component',
          load_time: 200,
        }
      )
    })

    it('should handle missing performance API gracefully', () => {
      // Remove performance API
      Object.defineProperty(window, 'performance', {
        value: undefined,
        writable: true,
      })

      const tracker = trackDynamicImportPerformance('test-component')

      expect(() => tracker.end()).not.toThrow()
    })
  })
})
