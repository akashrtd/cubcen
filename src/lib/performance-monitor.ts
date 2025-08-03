/**
 * Performance monitoring utilities for tracking page load times,
 * bundle sizes, and component rendering performance
 */

interface PerformanceMetrics {
  pageLoadTime: number
  domContentLoaded: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  cumulativeLayoutShift?: number
  firstInputDelay?: number
  componentRenderTime?: number
  bundleSize?: number
}

interface ComponentMetrics {
  name: string
  renderTime: number
  mountTime: number
  updateCount: number
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private componentMetrics: Map<string, ComponentMetrics> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      this.observeNavigationTiming()
    }

    // Observe paint timing
    if ('PerformanceObserver' in window) {
      this.observePaintTiming()
      this.observeLargestContentfulPaint()
      this.observeCumulativeLayoutShift()
      this.observeFirstInputDelay()
    }
  }

  private observeNavigationTiming() {
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (navigationEntries.length > 0) {
      const entry = navigationEntries[0]
      const metrics: PerformanceMetrics = {
        pageLoadTime: entry.loadEventEnd - entry.navigationStart,
        domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
      }
      this.metrics.set('navigation', metrics)
    }
  }

  private observePaintTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.updateMetric('paint', { firstContentfulPaint: entry.startTime })
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
      this.observers.set('paint', observer)
    } catch (error) {
      console.warn('Paint timing observer not supported:', error)
    }
  }

  private observeLargestContentfulPaint() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.updateMetric('lcp', { largestContentfulPaint: lastEntry.startTime })
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.set('lcp', observer)
    } catch (error) {
      console.warn('LCP observer not supported:', error)
    }
  }

  private observeCumulativeLayoutShift() {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            this.updateMetric('cls', { cumulativeLayoutShift: clsValue })
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.set('cls', observer)
    } catch (error) {
      console.warn('CLS observer not supported:', error)
    }
  }

  private observeFirstInputDelay() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.updateMetric('fid', { firstInputDelay: (entry as any).processingStart - entry.startTime })
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
      this.observers.set('fid', observer)
    } catch (error) {
      console.warn('FID observer not supported:', error)
    }
  }

  private updateMetric(key: string, update: Partial<PerformanceMetrics>) {
    const existing = this.metrics.get(key) || { pageLoadTime: 0, domContentLoaded: 0 }
    this.metrics.set(key, { ...existing, ...update })
  }

  /**
   * Track component render performance
   */
  trackComponentRender(componentName: string, renderStart: number, renderEnd: number) {
    const renderTime = renderEnd - renderStart
    const existing = this.componentMetrics.get(componentName)
    
    if (existing) {
      existing.renderTime = renderTime
      existing.updateCount += 1
    } else {
      this.componentMetrics.set(componentName, {
        name: componentName,
        renderTime,
        mountTime: renderTime,
        updateCount: 1,
      })
    }
  }

  /**
   * Track lazy component loading time
   */
  trackLazyComponentLoad(componentName: string, loadTime: number) {
    console.log(`Lazy component ${componentName} loaded in ${loadTime}ms`)
    
    // Store in performance metrics
    this.updateMetric(`lazy-${componentName}`, {
      componentRenderTime: loadTime,
      pageLoadTime: 0,
      domContentLoaded: 0,
    })
  }

  /**
   * Get all performance metrics
   */
  getMetrics(): Record<string, PerformanceMetrics> {
    const result: Record<string, PerformanceMetrics> = {}
    this.metrics.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  /**
   * Get component metrics
   */
  getComponentMetrics(): Record<string, ComponentMetrics> {
    const result: Record<string, ComponentMetrics> = {}
    this.componentMetrics.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  /**
   * Get Core Web Vitals summary
   */
  getCoreWebVitals() {
    const paintMetrics = this.metrics.get('paint')
    const lcpMetrics = this.metrics.get('lcp')
    const clsMetrics = this.metrics.get('cls')
    const fidMetrics = this.metrics.get('fid')

    return {
      fcp: paintMetrics?.firstContentfulPaint,
      lcp: lcpMetrics?.largestContentfulPaint,
      cls: clsMetrics?.cumulativeLayoutShift,
      fid: fidMetrics?.firstInputDelay,
    }
  }

  /**
   * Log performance summary to console
   */
  logPerformanceSummary() {
    const metrics = this.getMetrics()
    const componentMetrics = this.getComponentMetrics()
    const coreWebVitals = this.getCoreWebVitals()

    console.group('🚀 Performance Summary')
    
    console.group('📊 Core Web Vitals')
    console.log('First Contentful Paint (FCP):', coreWebVitals.fcp ? `${coreWebVitals.fcp.toFixed(2)}ms` : 'N/A')
    console.log('Largest Contentful Paint (LCP):', coreWebVitals.lcp ? `${coreWebVitals.lcp.toFixed(2)}ms` : 'N/A')
    console.log('Cumulative Layout Shift (CLS):', coreWebVitals.cls ? coreWebVitals.cls.toFixed(4) : 'N/A')
    console.log('First Input Delay (FID):', coreWebVitals.fid ? `${coreWebVitals.fid.toFixed(2)}ms` : 'N/A')
    console.groupEnd()

    if (Object.keys(componentMetrics).length > 0) {
      console.group('⚛️ Component Performance')
      Object.values(componentMetrics).forEach(metric => {
        console.log(`${metric.name}:`, {
          renderTime: `${metric.renderTime.toFixed(2)}ms`,
          mountTime: `${metric.mountTime.toFixed(2)}ms`,
          updates: metric.updateCount,
        })
      })
      console.groupEnd()
    }

    console.group('📈 Page Metrics')
    Object.entries(metrics).forEach(([key, metric]) => {
      if (key.startsWith('lazy-')) {
        console.log(`${key}:`, `${metric.componentRenderTime?.toFixed(2)}ms`)
      } else if (key === 'navigation') {
        console.log('Page Load Time:', `${metric.pageLoadTime.toFixed(2)}ms`)
        console.log('DOM Content Loaded:', `${metric.domContentLoaded.toFixed(2)}ms`)
      }
    })
    console.groupEnd()

    console.groupEnd()
  }

  /**
   * Send performance data to analytics endpoint
   */
  async sendAnalytics() {
    if (typeof window === 'undefined') return

    try {
      const metrics = this.getMetrics()
      const componentMetrics = this.getComponentMetrics()
      const coreWebVitals = this.getCoreWebVitals()

      const payload = {
        url: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        metrics,
        componentMetrics,
        coreWebVitals,
      }

      // Send to analytics endpoint (implement as needed)
      await fetch('/api/cubcen/v1/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.warn('Failed to send performance analytics:', error)
    }
  }

  /**
   * Clean up observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * React hook for tracking component performance
 */
export function usePerformanceTracking(componentName: string) {
  if (typeof window === 'undefined') {
    return { trackRender: () => {}, trackMount: () => {} }
  }

  const trackRender = (renderStart: number, renderEnd: number) => {
    performanceMonitor.trackComponentRender(componentName, renderStart, renderEnd)
  }

  const trackMount = (mountTime: number) => {
    performanceMonitor.trackComponentRender(componentName, 0, mountTime)
  }

  return { trackRender, trackMount }
}

/**
 * Higher-order component for automatic performance tracking
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    const renderStart = performance.now()
    
    React.useEffect(() => {
      const renderEnd = performance.now()
      performanceMonitor.trackComponentRender(componentName, renderStart, renderEnd)
    })

    return React.createElement(WrappedComponent, props)
  }
}

// Auto-log performance summary in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logPerformanceSummary()
    }, 2000)
  })
}