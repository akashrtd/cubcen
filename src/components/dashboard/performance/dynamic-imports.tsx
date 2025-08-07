import React, { lazy, Suspense, ComponentType } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { ChartType } from '@/types/dashboard'

// Dynamic imports for chart components with proper error boundaries
const LazyLineChart = lazy(() =>
  import('../charts/chart-types/line-chart')
    .then(module => ({ default: module.LineChart }))
    .catch(error => {
      console.error('Failed to load LineChart:', error)
      return { default: ChartErrorFallback }
    })
)

const LazyBarChart = lazy(() =>
  import('../charts/chart-types/bar-chart')
    .then(module => ({ default: module.BarChart }))
    .catch(error => {
      console.error('Failed to load BarChart:', error)
      return { default: ChartErrorFallback }
    })
)

const LazyPieChart = lazy(() =>
  import('../charts/chart-types/pie-chart')
    .then(module => ({ default: module.PieChart }))
    .catch(error => {
      console.error('Failed to load PieChart:', error)
      return { default: ChartErrorFallback }
    })
)

const LazyHeatmapChart = lazy(() =>
  import('../charts/chart-types/heatmap-chart')
    .then(module => ({ default: module.HeatmapChart }))
    .catch(error => {
      console.error('Failed to load HeatmapChart:', error)
      return { default: ChartErrorFallback }
    })
)

// Dynamic imports for other heavy components
const LazyAnalyticsDashboard = lazy(() =>
  import('../../analytics/analytics-dashboard')
    .then(module => ({ default: module.AnalyticsDashboard }))
    .catch(error => {
      console.error('Failed to load AnalyticsDashboard:', error)
      return { default: ComponentErrorFallback }
    })
)

const LazyPerformanceCharts = lazy(() =>
  import('../../analytics/performance-charts')
    .then(module => ({ default: module.PerformanceCharts }))
    .catch(error => {
      console.error('Failed to load PerformanceCharts:', error)
      return { default: ComponentErrorFallback }
    })
)

const LazyTaskBoard = lazy(() =>
  import('../../kanban/task-board')
    .then(module => ({ default: module.TaskBoard }))
    .catch(error => {
      console.error('Failed to load TaskBoard:', error)
      return { default: ComponentErrorFallback }
    })
)

// Error fallback components
function ChartErrorFallback(props: any) {
  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
      <CardContent className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="font-medium">Chart failed to load</p>
          <p className="text-sm mt-1">Please refresh the page to try again</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ComponentErrorFallback(props: any) {
  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
      <CardContent className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="font-medium">Component failed to load</p>
          <p className="text-sm mt-1">Please refresh the page to try again</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading fallbacks for different component types
function ChartLoadingFallback({ height = 300 }: { height?: number }) {
  return (
    <Card className="dashboard-card-skeleton">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className="flex justify-between items-end"
            style={{ height: `${height}px` }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-8"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>
          <div className="flex justify-center space-x-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="dashboard-card-skeleton">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline space-x-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-20 w-full rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Chart component factory with dynamic loading
export function createDynamicChart(type: ChartType) {
  const ChartComponent = ({ fallbackHeight = 300, ...props }: any) => {
    let LazyComponent: ComponentType<any>

    switch (type) {
      case 'line':
      case 'area':
      case 'scatter':
        LazyComponent = LazyLineChart
        break
      case 'bar':
        LazyComponent = LazyBarChart
        break
      case 'pie':
        LazyComponent = LazyPieChart
        break
      case 'heatmap':
        LazyComponent = LazyHeatmapChart
        break
      default:
        return <ChartErrorFallback />
    }

    return (
      <Suspense fallback={<ChartLoadingFallback height={fallbackHeight} />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }

  ChartComponent.displayName = `DynamicChart(${type})`
  return ChartComponent
}

// Higher-order component for adding dynamic loading to any component
export function withDynamicLoading<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode,
  errorFallback?: React.ReactNode
) {
  const LazyComponent = lazy(() =>
    importFn().catch(error => {
      console.error('Dynamic import failed:', error)
      return { default: () => errorFallback || <ComponentErrorFallback /> }
    })
  )

  const DynamicComponent = React.forwardRef<any, T>((props, ref) => (
    <Suspense fallback={fallback || <DashboardLoadingFallback />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ))

  DynamicComponent.displayName = 'DynamicComponent'
  return DynamicComponent
}

// Pre-configured dynamic components
export const DynamicAnalyticsDashboard = withDynamicLoading(
  () =>
    import('../../analytics/analytics-dashboard').then(m => ({
      default: m.AnalyticsDashboard,
    })),
  <DashboardLoadingFallback />,
  <ComponentErrorFallback />
)

export const DynamicPerformanceCharts = withDynamicLoading(
  () =>
    import('../../analytics/performance-charts').then(m => ({
      default: m.PerformanceCharts,
    })),
  <ChartLoadingFallback />,
  <ChartErrorFallback />
)

export const DynamicTaskBoard = withDynamicLoading(
  () => import('../../kanban/task-board').then(m => ({ default: m.TaskBoard })),
  <DashboardLoadingFallback />,
  <ComponentErrorFallback />
)

// Bundle splitting utilities
export const ChartBundle = {
  LineChart: LazyLineChart,
  BarChart: LazyBarChart,
  PieChart: LazyPieChart,
  HeatmapChart: LazyHeatmapChart,
}

export const DashboardBundle = {
  AnalyticsDashboard: LazyAnalyticsDashboard,
  PerformanceCharts: LazyPerformanceCharts,
  TaskBoard: LazyTaskBoard,
}

// Preload functions for critical components
export function preloadChartComponents() {
  // Preload critical chart components
  import('../charts/chart-types/line-chart')
  import('../charts/chart-types/bar-chart')
}

export function preloadDashboardComponents() {
  // Preload critical dashboard components
  import('../../analytics/analytics-dashboard')
}

// Resource hints for better loading performance
export function addResourceHints() {
  if (typeof window !== 'undefined') {
    // Add prefetch hints for chart components
    const chartPrefetch = document.createElement('link')
    chartPrefetch.rel = 'prefetch'
    chartPrefetch.href = '/chunks/chart-components.js'
    document.head.appendChild(chartPrefetch)

    // Add preload hints for critical components
    const criticalPreload = document.createElement('link')
    criticalPreload.rel = 'preload'
    criticalPreload.href = '/chunks/dashboard-critical.js'
    criticalPreload.as = 'script'
    document.head.appendChild(criticalPreload)
  }
}

// Performance monitoring for dynamic imports
export function trackDynamicImportPerformance(componentName: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const startTime = performance.now()

    return {
      end: () => {
        const endTime = performance.now()
        const loadTime = endTime - startTime

        // Log performance metrics
        console.log(`Dynamic import ${componentName}: ${loadTime.toFixed(2)}ms`)

        // Send to analytics if available
        if ('gtag' in window) {
          ;(window as any).gtag('event', 'dynamic_import_performance', {
            component_name: componentName,
            load_time: Math.round(loadTime),
          })
        }
      },
    }
  }

  return { end: () => {} }
}
