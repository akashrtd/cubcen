# Dashboard Performance Optimization Guide

## Overview

The Cubcen Dashboard UI system is designed with performance as a core principle, implementing various optimization techniques to ensure fast loading times, smooth interactions, and efficient resource usage. This guide covers the built-in performance features and best practices for optimal dashboard performance.

## Core Web Vitals

The dashboard system is optimized to achieve excellent Core Web Vitals scores:

- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1

### Performance Monitoring

```tsx
import { CoreWebVitals } from '@/components/dashboard/performance/core-web-vitals'

function PerformanceMonitoredDashboard() {
  return (
    <CoreWebVitals
      onLCP={metric => console.log('LCP:', metric)}
      onFID={metric => console.log('FID:', metric)}
      onCLS={metric => console.log('CLS:', metric)}
    >
      <DashboardLayout>
        <DashboardGrid>{/* Dashboard content */}</DashboardGrid>
      </DashboardLayout>
    </CoreWebVitals>
  )
}
```

## Lazy Loading and Code Splitting

### Dynamic Chart Imports

Charts are automatically lazy-loaded to reduce initial bundle size:

```tsx
// Charts are dynamically imported only when needed
import { ChartCard } from '@/components/dashboard/cards/chart-card'

function OptimizedDashboard() {
  return (
    <DashboardGrid>
      <ChartCard
        title="Revenue Chart"
        chartType="line"
        data={data}
        // Chart component is lazy-loaded:
        // - Reduces initial bundle size
        // - Loads only when component is rendered
        // - Shows skeleton while loading
      />
    </DashboardGrid>
  )
}
```

### Progressive Loading

Components load progressively based on viewport intersection:

```tsx
import { ProgressiveLoader } from '@/components/dashboard/performance/progressive-loader'

function ProgressiveDashboard() {
  return (
    <DashboardGrid>
      {largeDataset.map((item, index) => (
        <ProgressiveLoader
          key={item.id}
          priority={index < 3 ? 'high' : 'low'}
          delay={index * 100}
        >
          <DashboardCard {...item} />
        </ProgressiveLoader>
      ))}
    </DashboardGrid>
  )
}
```

### Lazy Card Loading

Cards outside the viewport are lazy-loaded:

```tsx
import { LazyCard } from '@/components/dashboard/performance/lazy-card'

function LazyDashboard() {
  return (
    <DashboardGrid>
      {cards.map(card => (
        <LazyCard
          key={card.id}
          priority={card.priority}
          rootMargin="50px"
          threshold={0.1}
        >
          <DashboardCard {...card} />
        </LazyCard>
      ))}
    </DashboardGrid>
  )
}
```

## Component Memoization

### Automatic Memoization

Dashboard components are automatically memoized to prevent unnecessary re-renders:

```tsx
// DashboardCard is automatically memoized
function OptimizedCard({ title, metric, data }) {
  return (
    <DashboardCard
      title={title}
      metric={metric}
      // Only re-renders when props actually change
      // Automatic shallow comparison of props
    >
      <ExpensiveComponent data={data} />
    </DashboardCard>
  )
}
```

### Custom Memoization

For complex data processing, use custom memoization:

```tsx
import { useMemo } from 'react'
import { MemoizedComponent } from '@/components/dashboard/performance/memoization'

function DataProcessingCard({ rawData, filters }) {
  const processedData = useMemo(() => {
    return expensiveDataProcessing(rawData, filters)
  }, [rawData, filters])

  return (
    <MemoizedComponent
      shouldUpdate={(prevProps, nextProps) => {
        return prevProps.data !== nextProps.data
      }}
    >
      <ChartCard title="Processed Data" data={processedData} />
    </MemoizedComponent>
  )
}
```

## Virtualization

### Large Dataset Handling

For large datasets, virtualization is automatically applied:

```tsx
import { VirtualizedGrid } from '@/components/dashboard/performance/virtualization'

function LargeDatasetDashboard({ items }) {
  return (
    <VirtualizedGrid
      items={items}
      itemHeight={200}
      containerHeight={600}
      overscan={5}
      renderItem={(item, index) => (
        <DashboardCard key={item.id} title={item.title} metric={item.metric} />
      )}
    />
  )
}
```

### Virtual Scrolling

Long lists use virtual scrolling for optimal performance:

```tsx
import { VirtualList } from '@/components/dashboard/performance/virtualization'

function VirtualizedList({ data }) {
  return (
    <VirtualList
      items={data}
      itemHeight={80}
      height={400}
      renderItem={({ item, index, style }) => (
        <div style={style}>
          <DashboardCard title={item.title} metric={item.metric} size="sm" />
        </div>
      )}
    />
  )
}
```

## Skeleton Loading

### Viewport-Based Skeletons

Skeleton screens are shown while content loads:

```tsx
import { ViewportSkeleton } from '@/components/dashboard/performance/viewport-skeleton'

function SkeletonDashboard() {
  return (
    <DashboardGrid>
      <ViewportSkeleton
        variant="card"
        priority="high"
        shimmer={true}
        count={6}
      />
    </DashboardGrid>
  )
}
```

### Custom Skeletons

Create custom skeleton layouts:

```tsx
import { Skeleton } from '@/components/ui/skeleton'

function CustomSkeleton() {
  return (
    <div className="dashboard-card-skeleton">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-[200px] w-full" />
    </div>
  )
}
```

## Image and Asset Optimization

### Responsive Images

Images are automatically optimized for different screen sizes:

```tsx
import { OptimizedImage } from '@/lib/image-optimization'

function ImageCard() {
  return (
    <DashboardCard title="Chart Image">
      <OptimizedImage
        src="/charts/revenue-chart.png"
        alt="Revenue chart showing upward trend"
        width={400}
        height={300}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
      />
    </DashboardCard>
  )
}
```

### Icon Optimization

Icons are tree-shaken and optimized:

```tsx
// ✅ Good: Import only needed icons
import { Activity, Users, TrendingUp } from 'lucide-react'

// ❌ Avoid: Importing entire icon library
import * as Icons from 'lucide-react'
```

## Data Fetching Optimization

### Efficient Data Loading

```tsx
import { useQuery } from '@tanstack/react-query'

function DataOptimizedCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  return (
    <DashboardCard
      title="Metrics"
      loading={isLoading}
      error={error?.message}
      metric={data?.metric}
    />
  )
}
```

### Batch API Requests

````tsx
function BatchedDataDashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard-batch'],
    queryFn: () => Promise.all([
      fetchMetrics(),
      fetchChartData(),
      fetchUserData()
    ]),
    select: ([metrics, chartData, userData]) => ({
      metrics,
      chartData,
      userData
    })
  })

  return (
    <DashboardGrid>
      <DashboardCard metric={data?.metrics} />
      <ChartCard data={data?.chartData} />
      <DashboardCard metric={data?.userData} />
    </DashboardGrid>
  )
}
```## Bun
dle Optimization

### Tree Shaking

The dashboard system is designed for optimal tree shaking:

```tsx
// ✅ Good: Import specific components
import { DashboardCard } from '@/components/dashboard/cards/dashboard-card'
import { ChartCard } from '@/components/dashboard/cards/chart-card'

// ❌ Avoid: Importing entire modules
import * as Dashboard from '@/components/dashboard'
````

### Dynamic Imports

Use dynamic imports for heavy components:

```tsx
import { lazy, Suspense } from 'react'

const HeavyAnalyticsChart = lazy(
  () => import('@/components/dashboard/charts/heavy-analytics-chart')
)

function OptimizedAnalytics() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyAnalyticsChart data={data} />
    </Suspense>
  )
}
```

### Bundle Analysis

Monitor bundle size with built-in analysis:

```bash
# Analyze bundle size
npm run build:analyze

# Check dashboard component sizes
npm run bundle:dashboard
```

## Memory Management

### Cleanup and Disposal

Components automatically clean up resources:

```tsx
import { useEffect, useRef } from 'react'

function MemoryOptimizedChart({ data }) {
  const chartRef = useRef(null)

  useEffect(() => {
    // Chart cleanup is handled automatically
    return () => {
      // Custom cleanup if needed
      if (chartRef.current) {
        chartRef.current.dispose()
      }
    }
  }, [])

  return (
    <ChartCard
      ref={chartRef}
      data={data}
      // Memory management is automatic:
      // - Event listeners are cleaned up
      // - Chart instances are disposed
      // - Data references are cleared
    />
  )
}
```

### Memory Leak Prevention

```tsx
import { useCallback, useRef } from 'react'

function LeakPreventionExample() {
  const timeoutRef = useRef(null)

  const handleDelayedAction = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      // Action
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <DashboardCard onClick={handleDelayedAction} title="Memory Safe Card" />
  )
}
```

## Performance Monitoring

### Real-time Performance Tracking

```tsx
import { PerformanceMonitor } from '@/lib/performance-monitor'

function MonitoredDashboard() {
  useEffect(() => {
    const monitor = new PerformanceMonitor({
      trackRenderTime: true,
      trackMemoryUsage: true,
      trackInteractionLatency: true,
      onMetric: metric => {
        console.log('Performance metric:', metric)
        // Send to analytics service
      },
    })

    return () => monitor.disconnect()
  }, [])

  return <DashboardLayout>{/* Dashboard content */}</DashboardLayout>
}
```

### Performance Benchmarks

```tsx
import { Benchmark } from '@/lib/benchmark'

function BenchmarkedComponent() {
  const benchmark = new Benchmark('dashboard-render')

  useEffect(() => {
    benchmark.start()

    return () => {
      benchmark.end()
      console.log('Render time:', benchmark.duration)
    }
  }, [])

  return <DashboardCard title="Benchmarked Card" />
}
```

## Optimization Best Practices

### Component Design

```tsx
// ✅ Good: Optimized component structure
function OptimizedCard({ title, data, onUpdate }) {
  // Memoize expensive calculations
  const processedData = useMemo(() => processData(data), [data])

  // Memoize callbacks
  const handleClick = useCallback(() => {
    onUpdate(processedData)
  }, [onUpdate, processedData])

  return (
    <DashboardCard title={title} onClick={handleClick}>
      {processedData.map(item => (
        <DataItem key={item.id} {...item} />
      ))}
    </DashboardCard>
  )
}

// ❌ Avoid: Unoptimized component
function UnoptimizedCard({ title, data, onUpdate }) {
  // Expensive calculation on every render
  const processedData = processData(data)

  return (
    <DashboardCard
      title={title}
      onClick={() => onUpdate(processedData)} // New function every render
    >
      {processedData.map(item => (
        <div key={item.id}>{item.name}</div> // Inline component
      ))}
    </DashboardCard>
  )
}
```

### Data Management

```tsx
// ✅ Good: Efficient data updates
function EfficientDataCard({ items }) {
  const [selectedItems, setSelectedItems] = useState(new Set())

  const handleToggle = useCallback(id => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  return (
    <DashboardCard title="Efficient Selection">
      {items.map(item => (
        <SelectableItem
          key={item.id}
          item={item}
          selected={selectedItems.has(item.id)}
          onToggle={handleToggle}
        />
      ))}
    </DashboardCard>
  )
}

// ❌ Avoid: Inefficient data updates
function InefficientDataCard({ items }) {
  const [selectedItems, setSelectedItems] = useState([])

  const handleToggle = id => {
    // Inefficient array operations
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  return (
    <DashboardCard title="Inefficient Selection">
      {items.map(item => (
        <SelectableItem
          key={item.id}
          item={item}
          selected={selectedItems.includes(item.id)} // O(n) lookup
          onToggle={() => handleToggle(item.id)} // New function every render
        />
      ))}
    </DashboardCard>
  )
}
```

### Chart Optimization

```tsx
// ✅ Good: Optimized chart data
function OptimizedChart({ rawData }) {
  const chartData = useMemo(
    () => ({
      datasets: [
        {
          label: 'Data',
          data: rawData.map(({ x, y }) => ({ x, y })), // Only extract needed fields
        },
      ],
    }),
    [rawData]
  )

  const chartConfig = useMemo(
    () => ({
      animations: { enabled: true, duration: 300 },
      legend: { show: true, position: 'bottom' },
    }),
    []
  )

  return (
    <ChartCard
      title="Optimized Chart"
      chartType="line"
      data={chartData}
      config={chartConfig}
    />
  )
}

// ❌ Avoid: Unoptimized chart data
function UnoptimizedChart({ rawData }) {
  return (
    <ChartCard
      title="Unoptimized Chart"
      chartType="line"
      data={{
        datasets: [
          {
            label: 'Data',
            data: rawData, // Entire objects passed, recalculated every render
          },
        ],
      }}
      config={{
        animations: { enabled: true, duration: 300 }, // New object every render
      }}
    />
  )
}
```

## Performance Testing

### Load Testing

```tsx
import { render, waitFor } from '@testing-library/react'
import { performance } from 'perf_hooks'

describe('Dashboard Performance', () => {
  test('renders large dataset within performance budget', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      title: `Item ${i}`,
      value: Math.random() * 100,
    }))

    const startTime = performance.now()

    render(
      <DashboardGrid>
        {largeDataset.map(item => (
          <DashboardCard key={item.id} {...item} />
        ))}
      </DashboardGrid>
    )

    await waitFor(() => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render within 100ms budget
      expect(renderTime).toBeLessThan(100)
    })
  })

  test('chart loads within performance budget', async () => {
    const chartData = generateLargeChartData(10000)

    const startTime = performance.now()

    render(
      <ChartCard
        title="Performance Test Chart"
        chartType="line"
        data={chartData}
      />
    )

    await waitFor(() => {
      const endTime = performance.now()
      const loadTime = endTime - startTime

      // Chart should load within 200ms budget
      expect(loadTime).toBeLessThan(200)
    })
  })
})
```

### Memory Testing

```tsx
describe('Memory Usage', () => {
  test('components clean up properly', () => {
    const { unmount } = render(
      <DashboardLayout>
        <ChartCard data={largeDataset} />
      </DashboardLayout>
    )

    const initialMemory = performance.memory?.usedJSHeapSize || 0

    unmount()

    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }

    setTimeout(() => {
      const finalMemory = performance.memory?.usedJSHeapSize || 0
      const memoryDiff = finalMemory - initialMemory

      // Memory usage should not increase significantly
      expect(memoryDiff).toBeLessThan(1024 * 1024) // 1MB threshold
    }, 100)
  })
})
```

## Performance Monitoring Tools

### Built-in Monitoring

```tsx
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor'

function MonitoredDashboard() {
  const { metrics, startMeasure, endMeasure } = usePerformanceMonitor()

  useEffect(() => {
    startMeasure('dashboard-load')

    return () => {
      endMeasure('dashboard-load')
      console.log('Dashboard metrics:', metrics)
    }
  }, [])

  return <DashboardLayout>{/* Dashboard content */}</DashboardLayout>
}
```

### External Tools Integration

```tsx
// Web Vitals reporting
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function reportWebVitals() {
  getCLS(console.log)
  getFID(console.log)
  getFCP(console.log)
  getLCP(console.log)
  getTTFB(console.log)
}

// Performance Observer
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    console.log('Performance entry:', entry)
  }
})

observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] })
```

## Troubleshooting Performance Issues

### Common Performance Problems

#### Slow Initial Load

- **Cause**: Large bundle size, synchronous loading
- **Solution**: Implement code splitting and lazy loading

```tsx
// Split heavy components
const HeavyChart = lazy(() => import('./HeavyChart'))

function OptimizedDashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart />
    </Suspense>
  )
}
```

#### Sluggish Interactions

- **Cause**: Expensive re-renders, missing memoization
- **Solution**: Use React.memo and useMemo

```tsx
const OptimizedCard = React.memo(({ data }) => {
  const processedData = useMemo(() => expensiveProcessing(data), [data])

  return <DashboardCard data={processedData} />
})
```

#### Memory Leaks

- **Cause**: Uncleaned event listeners, timers
- **Solution**: Proper cleanup in useEffect

```tsx
useEffect(() => {
  const timer = setInterval(updateData, 1000)
  const listener = window.addEventListener('resize', handleResize)

  return () => {
    clearInterval(timer)
    window.removeEventListener('resize', handleResize)
  }
}, [])
```

### Performance Debugging

```tsx
// React DevTools Profiler
import { Profiler } from 'react'

function ProfiledDashboard() {
  const onRenderCallback = (id, phase, actualDuration) => {
    console.log('Render:', { id, phase, actualDuration })
  }

  return (
    <Profiler id="Dashboard" onRender={onRenderCallback}>
      <DashboardLayout>{/* Dashboard content */}</DashboardLayout>
    </Profiler>
  )
}
```

## Performance Checklist

### Development

- [ ] Use React.memo for pure components
- [ ] Implement useMemo for expensive calculations
- [ ] Use useCallback for event handlers
- [ ] Lazy load heavy components
- [ ] Optimize bundle size with tree shaking
- [ ] Implement proper error boundaries

### Production

- [ ] Enable gzip/brotli compression
- [ ] Use CDN for static assets
- [ ] Implement service worker caching
- [ ] Monitor Core Web Vitals
- [ ] Set up performance budgets
- [ ] Regular performance audits

### Monitoring

- [ ] Track render times
- [ ] Monitor memory usage
- [ ] Measure interaction latency
- [ ] Log performance metrics
- [ ] Set up alerts for performance regressions
- [ ] Regular performance reviews

The dashboard system's performance optimizations ensure fast, responsive user experiences while maintaining code quality and maintainability.
