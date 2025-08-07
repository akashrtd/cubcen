import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Performance-optimized memo wrapper with custom comparison
export function createMemoizedComponent<T extends object>(
  Component: React.ComponentType<T>,
  customCompare?: (prevProps: T, nextProps: T) => boolean
) {
  const MemoizedComponent = memo(Component, customCompare)
  MemoizedComponent.displayName = `Memoized(${Component.displayName || Component.name})`
  return MemoizedComponent
}

// Dashboard-specific memoization for cards
export const MemoizedDashboardCard = memo(
  ({ title, data, loading, error, children, className, ...props }: any) => {
    return (
      <div className={cn('dashboard-card', className)} {...props}>
        {children}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison for dashboard cards
    return (
      prevProps.title === nextProps.title &&
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
      prevProps.className === nextProps.className
    )
  }
)

MemoizedDashboardCard.displayName = 'MemoizedDashboardCard'

// Chart-specific memoization
export const MemoizedChartWrapper = memo(
  ({ type, data, config, height, className, ...props }: any) => {
    return (
      <div
        className={cn('chart-wrapper', className)}
        style={{ height }}
        {...props}
      >
        {/* Chart content would go here */}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Deep comparison for chart data and config
    return (
      prevProps.type === nextProps.type &&
      prevProps.height === nextProps.height &&
      prevProps.className === nextProps.className &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
      JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config)
    )
  }
)

MemoizedChartWrapper.displayName = 'MemoizedChartWrapper'

// Metric card memoization
export const MemoizedMetricCard = memo(
  ({ metric, trend, unit, label, className, ...props }: any) => {
    return (
      <div className={cn('metric-card', className)} {...props}>
        <div className="metric-value">{metric}</div>
        <div className="metric-label">{label}</div>
        {trend && <div className="metric-trend">{trend}</div>}
        {unit && <div className="metric-unit">{unit}</div>}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Shallow comparison for metric cards
    return (
      prevProps.metric === nextProps.metric &&
      prevProps.trend === nextProps.trend &&
      prevProps.unit === nextProps.unit &&
      prevProps.label === nextProps.label &&
      prevProps.className === nextProps.className
    )
  }
)

MemoizedMetricCard.displayName = 'MemoizedMetricCard'

// Hook for memoizing expensive calculations
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList,
  options?: {
    maxAge?: number // Cache duration in milliseconds
    key?: string // Cache key for debugging
  }
): T {
  const cacheRef = useRef<{
    value: T
    timestamp: number
    deps: React.DependencyList
  } | null>(null)

  return useMemo(() => {
    const now = Date.now()
    const cache = cacheRef.current

    // Check if we have a valid cache
    if (
      cache &&
      (!options?.maxAge || now - cache.timestamp < options.maxAge) &&
      dependencies.length === cache.deps.length &&
      dependencies.every((dep, index) => dep === cache.deps[index])
    ) {
      if (options?.key) {
        console.log(`Cache hit for ${options.key}`)
      }
      return cache.value
    }

    // Calculate new value
    if (options?.key) {
      console.log(`Cache miss for ${options.key}, recalculating...`)
    }

    const startTime = performance.now()
    const value = calculation()
    const endTime = performance.now()

    if (options?.key) {
      console.log(
        `Calculation ${options.key} took ${(endTime - startTime).toFixed(2)}ms`
      )
    }

    // Update cache
    cacheRef.current = {
      value,
      timestamp: now,
      deps: [...dependencies],
    }

    return value
  }, [calculation, dependencies, options?.key, options?.maxAge])
}

// Hook for memoizing callback functions
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, dependencies)
}

// Hook for stable object references
export function useStableObject<T extends object>(obj: T): T {
  const stableRef = useRef<T>(obj)

  // Only update if the object has actually changed
  const hasChanged = useMemo(() => {
    const current = stableRef.current

    // Shallow comparison
    if (Object.keys(current).length !== Object.keys(obj).length) {
      return true
    }

    for (const key in obj) {
      if (current[key] !== obj[key]) {
        return true
      }
    }

    return false
  }, [obj])

  if (hasChanged) {
    stableRef.current = obj
  }

  return stableRef.current
}

// Performance monitoring for memoized components
export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  const PerformanceMonitoredComponent = React.forwardRef<any, T>(
    (props, ref) => {
      const renderCountRef = useRef(0)
      const lastRenderTime = useRef(0)

      useEffect(() => {
        renderCountRef.current += 1
        const now = performance.now()

        if (lastRenderTime.current > 0) {
          const timeSinceLastRender = now - lastRenderTime.current
          console.log(
            `${componentName || Component.displayName || Component.name} render #${renderCountRef.current} ` +
              `(${timeSinceLastRender.toFixed(2)}ms since last render)`
          )
        }

        lastRenderTime.current = now
      })

      const renderStart = performance.now()

      useEffect(() => {
        const renderEnd = performance.now()
        const renderTime = renderEnd - renderStart

        if (renderTime > 16) {
          // Flag slow renders (>16ms = <60fps)
          console.warn(
            `Slow render detected: ${componentName || Component.displayName || Component.name} ` +
              `took ${renderTime.toFixed(2)}ms to render`
          )
        }
      })

      return <Component {...props} ref={ref} />
    }
  )

  PerformanceMonitoredComponent.displayName = `WithPerformanceMonitoring(${componentName || Component.displayName || Component.name})`

  return PerformanceMonitoredComponent
}

// Render optimization utilities
export class RenderOptimizer {
  private static renderQueue: Array<() => void> = []
  private static isProcessing = false

  // Batch multiple state updates
  static batchUpdates(updates: Array<() => void>) {
    this.renderQueue.push(...updates)

    if (!this.isProcessing) {
      this.isProcessing = true

      // Use scheduler if available, otherwise fallback to setTimeout
      if (typeof window !== 'undefined' && 'scheduler' in window) {
        ;(window as any).scheduler.postTask(
          () => {
            this.processQueue()
          },
          { priority: 'user-blocking' }
        )
      } else {
        setTimeout(() => {
          this.processQueue()
        }, 0)
      }
    }
  }

  private static processQueue() {
    const updates = [...this.renderQueue]
    this.renderQueue.length = 0

    // Execute all updates in a single batch
    setTimeout(() => {
      updates.forEach(update => update())
    }, 0)

    this.isProcessing = false

    // Process any new updates that were added during processing
    if (this.renderQueue.length > 0) {
      this.batchUpdates([])
    }
  }

  // Debounce rapid updates
  static debounceUpdate(
    updateFn: () => void,
    delay: number = 100,
    key: string = 'default'
  ) {
    const timers = this.debounceTimers || (this.debounceTimers = new Map())

    if (timers.has(key)) {
      clearTimeout(timers.get(key))
    }

    timers.set(
      key,
      setTimeout(() => {
        updateFn()
        timers.delete(key)
      }, delay)
    )
  }

  private static debounceTimers: Map<string, NodeJS.Timeout>

  // Throttle high-frequency updates
  static throttleUpdate(
    updateFn: () => void,
    delay: number = 16, // ~60fps
    key: string = 'default'
  ) {
    const lastExecution =
      this.throttleTimestamps || (this.throttleTimestamps = new Map())
    const now = Date.now()
    const lastTime = lastExecution.get(key) || 0

    if (now - lastTime >= delay) {
      updateFn()
      lastExecution.set(key, now)
    }
  }

  private static throttleTimestamps: Map<string, number>
}

// Hook for optimized re-renders
export function useOptimizedRender() {
  const [, forceRender] = React.useReducer(x => x + 1, 0)

  const scheduleUpdate = useCallback(
    (priority: 'low' | 'normal' | 'high' = 'normal') => {
      switch (priority) {
        case 'high':
          // Immediate update
          forceRender()
          break
        case 'normal':
          // Batched update
          RenderOptimizer.batchUpdates([forceRender])
          break
        case 'low':
          // Debounced update
          RenderOptimizer.debounceUpdate(forceRender, 100)
          break
      }
    },
    []
  )

  return { scheduleUpdate }
}

// Component for preventing unnecessary re-renders of children
export const RenderBarrier = memo(
  ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }
)

RenderBarrier.displayName = 'RenderBarrier'

// Hook for tracking render performance
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0)
  const renderTimes = useRef<number[]>([])
  const startTime = useRef(0)

  // Mark render start
  startTime.current = performance.now()

  useEffect(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime.current

    renderCount.current += 1
    renderTimes.current.push(renderTime)

    // Keep only last 10 render times
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift()
    }

    const avgRenderTime =
      renderTimes.current.reduce((a, b) => a + b, 0) /
      renderTimes.current.length

    if (renderTime > 16) {
      console.warn(
        `${componentName} slow render: ${renderTime.toFixed(2)}ms ` +
          `(avg: ${avgRenderTime.toFixed(2)}ms, count: ${renderCount.current})`
      )
    }

    // Send performance data to analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('event', 'component_render_performance', {
        component_name: componentName,
        render_time: Math.round(renderTime),
        render_count: renderCount.current,
        avg_render_time: Math.round(avgRenderTime),
      })
    }
  })

  return {
    renderCount: renderCount.current,
    averageRenderTime:
      renderTimes.current.length > 0
        ? renderTimes.current.reduce((a, b) => a + b, 0) /
          renderTimes.current.length
        : 0,
  }
}
