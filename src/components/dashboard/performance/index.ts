// Performance optimization components and utilities
export {
  createDynamicChart,
  withDynamicLoading,
  DynamicAnalyticsDashboard,
  DynamicPerformanceCharts,
  DynamicTaskBoard,
  ChartBundle,
  DashboardBundle,
  preloadChartComponents,
  preloadDashboardComponents,
  addResourceHints,
  trackDynamicImportPerformance,
} from './dynamic-imports'

export {
  ProgressiveLoader,
  createSkeletonVariant,
  useProgressiveLoading,
} from './progressive-loader'

export { LazyCard, withLazyLoading, useLazyLoading } from './lazy-card'

export { ViewportSkeleton, withViewportSkeleton } from './viewport-skeleton'

export {
  useIntersectionObserver,
  withIntersectionObserver,
  BatchIntersectionObserver,
  getGlobalBatchObserver,
  useBatchIntersectionObserver,
  trackIntersectionPerformance,
  getViewportBasedPriority,
  useScrollDirectionOptimization,
} from './intersection-observer'

export {
  createMemoizedComponent,
  MemoizedDashboardCard,
  MemoizedChartWrapper,
  MemoizedMetricCard,
  useMemoizedCalculation,
  useMemoizedCallback,
  useStableObject,
  withPerformanceMonitoring,
  RenderOptimizer,
  useOptimizedRender,
  RenderBarrier,
  useRenderPerformance,
} from './memoization'

export {
  VirtualizedList,
  VirtualizedTable,
  VirtualizedGrid,
  useDynamicSizing,
  useVirtualizationPerformance,
  calculateOptimalItemSize,
  estimateVirtualizationMemory,
} from './virtualization'

export {
  useCoreWebVitals,
  getPerformanceRating,
  PERFORMANCE_THRESHOLDS,
  PerformanceMonitor,
  PerformanceDashboard,
  useComponentPerformance,
  usePerformanceBudget,
  useRealUserMonitoring,
  type CoreWebVitalsMetrics,
  type PerformanceRating,
} from './core-web-vitals'

// Performance monitoring utilities
export interface PerformanceMetrics {
  renderTime: number
  chartLoadTime: number
  dataFetchTime: number
  interactionLatency: number
  memoryUsage: number
  bundleSize: number
}

export interface PerformanceThresholds {
  renderTime: number
  chartLoadTime: number
  dataFetchTime: number
  interactionLatency: number
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null)

  const startMeasurement = React.useCallback((name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`)
    }
  }, [])

  const endMeasurement = React.useCallback((name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)

      const measure = performance.getEntriesByName(name)[0]
      if (measure) {
        console.log(
          `Performance: ${name} took ${measure.duration.toFixed(2)}ms`
        )

        // Send to analytics if available
        if ('gtag' in window) {
          ;(window as any).gtag('event', 'performance_measurement', {
            measurement_name: name,
            duration: Math.round(measure.duration),
          })
        }
      }
    }
  }, [])

  const measureComponent = React.useCallback(
    (componentName: string) => {
      return {
        start: () => startMeasurement(componentName),
        end: () => endMeasurement(componentName),
      }
    },
    [startMeasurement, endMeasurement]
  )

  return {
    metrics,
    startMeasurement,
    endMeasurement,
    measureComponent,
  }
}

// Bundle size monitoring
export function getBundleSize(): Promise<number> {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return Promise.resolve(0)
  }

  return new Promise(resolve => {
    // Use Navigation Timing API to estimate bundle size
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming
    if (navigation) {
      const transferSize = navigation.transferSize || 0
      resolve(transferSize)
    } else {
      resolve(0)
    }
  })
}

// Memory usage monitoring
export function getMemoryUsage(): number {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return 0
  }

  const memory = (performance as any).memory
  if (memory) {
    return memory.usedJSHeapSize || 0
  }

  return 0
}

// Core Web Vitals monitoring
export function trackCoreWebVitals() {
  if (typeof window === 'undefined') return

  // Track Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver(list => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]

    if ('gtag' in window) {
      ;(window as any).gtag('event', 'web_vitals', {
        metric_name: 'LCP',
        value: Math.round(lastEntry.startTime),
      })
    }
  })

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (e) {
    // LCP not supported
  }

  // Track First Input Delay (FID)
  const fidObserver = new PerformanceObserver(list => {
    const entries = list.getEntries()
    entries.forEach(entry => {
      const fid = entry.processingStart - entry.startTime

      if ('gtag' in window) {
        ;(window as any).gtag('event', 'web_vitals', {
          metric_name: 'FID',
          value: Math.round(fid),
        })
      }
    })
  })

  try {
    fidObserver.observe({ entryTypes: ['first-input'] })
  } catch (e) {
    // FID not supported
  }

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0
  const clsObserver = new PerformanceObserver(list => {
    const entries = list.getEntries()
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value
      }
    })

    if ('gtag' in window) {
      ;(window as any).gtag('event', 'web_vitals', {
        metric_name: 'CLS',
        value: Math.round(clsValue * 1000) / 1000,
      })
    }
  })

  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  } catch (e) {
    // CLS not supported
  }
}

// Performance budget checker
export function checkPerformanceBudget(
  thresholds: PerformanceThresholds
): boolean {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return true // Assume passing if we can't measure
  }

  const navigation = performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming
  if (!navigation) return true

  const loadTime = navigation.loadEventEnd - navigation.navigationStart
  const renderTime =
    navigation.domContentLoadedEventEnd - navigation.navigationStart

  const withinBudget = {
    renderTime: renderTime <= thresholds.renderTime,
    loadTime: loadTime <= thresholds.chartLoadTime,
  }

  const allWithinBudget = Object.values(withinBudget).every(Boolean)

  if (!allWithinBudget) {
    console.warn('Performance budget exceeded:', {
      actual: { renderTime, loadTime },
      thresholds,
      withinBudget,
    })
  }

  return allWithinBudget
}

// Default performance thresholds (in milliseconds)
export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  renderTime: 1000, // 1 second for initial render
  chartLoadTime: 2000, // 2 seconds for chart loading
  dataFetchTime: 3000, // 3 seconds for data fetching
  interactionLatency: 100, // 100ms for interactions
}

import React from 'react'
