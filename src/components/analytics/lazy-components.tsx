'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, TrendingUp, Users, AlertTriangle } from 'lucide-react'

// Lazy load heavy analytics components
const LazyPerformanceCharts = lazy(() =>
  import('./performance-charts').then(module => ({
    default: module.PerformanceCharts,
  }))
)

const LazyAgentPerformanceTable = lazy(() =>
  import('./agent-performance-table').then(module => ({
    default: module.AgentPerformanceTable,
  }))
)

const LazyErrorPatternsChart = lazy(() =>
  import('./error-patterns-chart').then(module => ({
    default: module.ErrorPatternsChart,
  }))
)

const LazyExportDialog = lazy(() =>
  import('./export-dialog').then(module => ({ default: module.ExportDialog }))
)

// Loading skeletons for each component
const PerformanceChartsLoading = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-4 w-80" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </CardContent>
  </Card>
)

const AgentPerformanceTableLoading = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)

const ErrorPatternsChartLoading = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-80 w-full" />
    </CardContent>
  </Card>
)

// Lazy component wrappers with suspense
export const LazyPerformanceChartsWithSuspense = (props: any) => (
  <Suspense fallback={<PerformanceChartsLoading />}>
    <LazyPerformanceCharts {...props} />
  </Suspense>
)

export const LazyAgentPerformanceTableWithSuspense = (props: any) => (
  <Suspense fallback={<AgentPerformanceTableLoading />}>
    <LazyAgentPerformanceTable {...props} />
  </Suspense>
)

export const LazyErrorPatternsChartWithSuspense = (props: any) => (
  <Suspense fallback={<ErrorPatternsChartLoading />}>
    <LazyErrorPatternsChart {...props} />
  </Suspense>
)

export const LazyExportDialogWithSuspense = (props: any) => (
  <Suspense fallback={null}>
    <LazyExportDialog {...props} />
  </Suspense>
)
