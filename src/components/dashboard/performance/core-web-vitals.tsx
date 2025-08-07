import React, { useEffect, useRef, useState, useCallback } from 'react'

// Core Web Vitals metrics interface
export interface CoreWebVitalsMetrics {
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  inp?: number // Interaction to Next Paint
}

// Performance thresholds (Google's recommended values)
export const PERFORMANCE_THRESHOLDS = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  ttfb: { good: 800, needsImprovement: 1800 },
  inp: { good: 200, needsImprovement: 500 },
} as const

// Performance rating type
export type PerformanceRating = 'good' | 'needs-improvement' | 'poor'

// Get performance rating for a metric
export function getPerformanceRating(
  metric: keyof typeof PERFORMANCE_THRESHOLDS,
  value: number
): PerformanceRating {
  const thresholds = PERFORMANCE_THRESHOLDS[metric]
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.needsImprovement) return 'needs-improvement'
  return 'poor'
}

// Core Web Vitals tracking hook
export function useCoreWebVitals() {
  const [metrics, setMetrics] = useState<CoreWebVitalsMetrics>({})
  const observersRef = useRef<PerformanceObserver[]>([])

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    const observers: PerformanceObserver[] = []

    // Track Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          startTime: number
        }

        if (lastEntry) {
          const lcp = lastEntry.startTime
          setMetrics(prev => ({ ...prev, lcp }))

          // Send to analytics
          sendToAnalytics('LCP', lcp)
        }
      })

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      observers.push(lcpObserver)
    } catch (e) {
      console.warn('LCP observation not supported')
    }

    // Track First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime
          setMetrics(prev => ({ ...prev, fid }))

          // Send to analytics
          sendToAnalytics('FID', fid)
        })
      })

      fidObserver.observe({ entryTypes: ['first-input'] })
      observers.push(fidObserver)
    } catch (e) {
      console.warn('FID observation not supported')
    }

    // Track Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            setMetrics(prev => ({ ...prev, cls: clsValue }))
          }
        })

        // Send to analytics (debounced)
        debounce(() => sendToAnalytics('CLS', clsValue), 1000)()
      })

      clsObserver.observe({ entryTypes: ['layout-shift'] })
      observers.push(clsObserver)
    } catch (e) {
      console.warn('CLS observation not supported')
    }

    // Track First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime
            setMetrics(prev => ({ ...prev, fcp }))

            // Send to analytics
            sendToAnalytics('FCP', fcp)
          }
        })
      })

      fcpObserver.observe({ entryTypes: ['paint'] })
      observers.push(fcpObserver)
    } catch (e) {
      console.warn('FCP observation not supported')
    }

    // Track Time to First Byte (TTFB)
    try {
      const navigationEntries = performance.getEntriesByType(
        'navigation'
      ) as PerformanceNavigationTiming[]
      if (navigationEntries.length > 0) {
        const ttfb =
          navigationEntries[0].responseStart - navigationEntries[0].requestStart
        setMetrics(prev => ({ ...prev, ttfb }))

        // Send to analytics
        sendToAnalytics('TTFB', ttfb)
      }
    } catch (e) {
      console.warn('TTFB measurement not supported')
    }

    // Track Interaction to Next Paint (INP) - newer metric
    try {
      const inpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          const inp = entry.processingEnd - entry.startTime
          setMetrics(prev => ({ ...prev, inp }))

          // Send to analytics
          sendToAnalytics('INP', inp)
        })
      })

      // INP is still experimental
      if ('observe' in inpObserver) {
        inpObserver.observe({ entryTypes: ['event'] })
        observers.push(inpObserver)
      }
    } catch (e) {
      console.warn('INP observation not supported')
    }

    observersRef.current = observers

    // Cleanup observers
    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [])

  return metrics
}

// Send metrics to analytics
function sendToAnalytics(metricName: string, value: number) {
  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && 'gtag' in window) {
    ;(window as any).gtag('event', 'web_vitals', {
      metric_name: metricName,
      value: Math.round(value),
      rating: getPerformanceRating(
        metricName.toLowerCase() as keyof typeof PERFORMANCE_THRESHOLDS,
        value
      ),
    })
  }

  // Send to custom analytics endpoint
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metricName,
        value,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(error => {
      console.warn('Failed to send web vitals to analytics:', error)
    })
  }
}

// Debounce utility
function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Performance monitoring component
export function PerformanceMonitor({
  children,
  onMetricsUpdate,
}: {
  children: React.ReactNode
  onMetricsUpdate?: (metrics: CoreWebVitalsMetrics) => void
}) {
  const metrics = useCoreWebVitals()

  useEffect(() => {
    onMetricsUpdate?.(metrics)
  }, [metrics, onMetricsUpdate])

  return <>{children}</>
}

// Performance dashboard component
export function PerformanceDashboard() {
  const metrics = useCoreWebVitals()
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development or when explicitly enabled
  useEffect(() => {
    const shouldShow =
      process.env.NODE_ENV === 'development' ||
      localStorage.getItem('show-performance-dashboard') === 'true'

    setIsVisible(shouldShow)
  }, [])

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        minWidth: '200px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        Core Web Vitals
      </div>

      {Object.entries(metrics).map(([key, value]) => {
        if (value === undefined) return null

        const rating = getPerformanceRating(
          key as keyof typeof PERFORMANCE_THRESHOLDS,
          value
        )

        const color =
          rating === 'good'
            ? '#4CAF50'
            : rating === 'needs-improvement'
              ? '#FF9800'
              : '#F44336'

        return (
          <div key={key} style={{ marginBottom: '2px' }}>
            <span style={{ textTransform: 'uppercase' }}>{key}:</span>{' '}
            <span style={{ color, fontWeight: 'bold' }}>
              {Math.round(value)}
              {key === 'cls' ? '' : 'ms'}
            </span>
          </div>
        )
      })}

      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
        Press F12 → Console for details
      </div>
    </div>
  )
}

// Hook for tracking component-specific performance
export function useComponentPerformance(componentName: string) {
  const renderStartTime = useRef<number>(0)
  const mountTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  // Track mount time
  useEffect(() => {
    mountTime.current = performance.now()

    return () => {
      const unmountTime = performance.now()
      const totalLifetime = unmountTime - mountTime.current

      console.log(
        `${componentName} lifecycle: ${totalLifetime.toFixed(2)}ms total, ` +
          `${renderCount.current} renders`
      )
    }
  }, [componentName])

  // Track render performance
  renderStartTime.current = performance.now()

  useEffect(() => {
    const renderEndTime = performance.now()
    const renderTime = renderEndTime - renderStartTime.current
    renderCount.current += 1

    if (renderTime > 16) {
      // Flag slow renders
      console.warn(
        `${componentName} slow render #${renderCount.current}: ${renderTime.toFixed(2)}ms`
      )
    }

    // Send to analytics for production monitoring
    if (process.env.NODE_ENV === 'production' && renderTime > 50) {
      sendToAnalytics('component_render_time', renderTime)
    }
  })

  return {
    renderCount: renderCount.current,
    mountTime: mountTime.current,
  }
}

// Performance budget checker
export function usePerformanceBudget(budgets: Partial<CoreWebVitalsMetrics>) {
  const metrics = useCoreWebVitals()
  const [violations, setViolations] = useState<string[]>([])

  useEffect(() => {
    const newViolations: string[] = []

    Object.entries(budgets).forEach(([metric, budget]) => {
      const actualValue = metrics[metric as keyof CoreWebVitalsMetrics]

      if (
        actualValue !== undefined &&
        budget !== undefined &&
        actualValue > budget
      ) {
        newViolations.push(
          `${metric.toUpperCase()}: ${Math.round(actualValue)}ms exceeds budget of ${budget}ms`
        )
      }
    })

    setViolations(newViolations)

    // Log violations
    if (newViolations.length > 0) {
      console.warn('Performance budget violations:', newViolations)
    }
  }, [metrics, budgets])

  return {
    violations,
    isWithinBudget: violations.length === 0,
    metrics,
  }
}

// Real User Monitoring (RUM) data collection
export function useRealUserMonitoring() {
  const [rumData, setRumData] = useState<{
    pageLoadTime: number
    domContentLoaded: number
    resourceLoadTimes: Array<{ name: string; duration: number }>
    userInteractions: number
    errors: number
  } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Collect page load metrics
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming
    if (navigation) {
      const pageLoadTime = navigation.loadEventEnd - navigation.requestStart
      const domContentLoaded =
        navigation.domContentLoadedEventEnd - navigation.requestStart

      // Collect resource load times
      const resources = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[]
      const resourceLoadTimes = resources.map(resource => ({
        name: resource.name,
        duration: resource.duration,
      }))

      setRumData({
        pageLoadTime,
        domContentLoaded,
        resourceLoadTimes,
        userInteractions: 0,
        errors: 0,
      })
    }

    // Track user interactions
    let interactionCount = 0
    const trackInteraction = () => {
      interactionCount += 1
      setRumData(prev =>
        prev ? { ...prev, userInteractions: interactionCount } : null
      )
    }

    // Track errors
    let errorCount = 0
    const trackError = () => {
      errorCount += 1
      setRumData(prev => (prev ? { ...prev, errors: errorCount } : null))
    }

    // Add event listeners
    ;['click', 'keydown', 'scroll'].forEach(event => {
      window.addEventListener(event, trackInteraction, { passive: true })
    })

    window.addEventListener('error', trackError)
    window.addEventListener('unhandledrejection', trackError)

    // Cleanup
    return () => {
      ;['click', 'keydown', 'scroll'].forEach(event => {
        window.removeEventListener(event, trackInteraction)
      })
      window.removeEventListener('error', trackError)
      window.removeEventListener('unhandledrejection', trackError)
    }
  }, [])

  return rumData
}
