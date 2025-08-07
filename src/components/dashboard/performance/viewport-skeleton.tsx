import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  useIntersectionObserver,
  getViewportBasedPriority,
} from './intersection-observer'

interface ViewportSkeletonProps {
  children: React.ReactNode
  className?: string
  variant?: 'card' | 'chart' | 'table' | 'metric' | 'list' | 'grid'
  priority?: 'critical' | 'high' | 'medium' | 'low' | 'auto'
  height?: number
  width?: number
  rows?: number
  columns?: number
  animated?: boolean
  showShimmer?: boolean
  adaptiveComplexity?: boolean
  onVisibilityChange?: (visible: boolean) => void
}

interface SkeletonConfig {
  baseDelay: number
  complexityMultiplier: number
  animationDuration: string
  shimmerIntensity: number
}

// Priority-based skeleton configurations
const SKELETON_CONFIGS: Record<string, SkeletonConfig> = {
  critical: {
    baseDelay: 0,
    complexityMultiplier: 1,
    animationDuration: '1s',
    shimmerIntensity: 0.8,
  },
  high: {
    baseDelay: 50,
    complexityMultiplier: 0.8,
    animationDuration: '1.2s',
    shimmerIntensity: 0.6,
  },
  medium: {
    baseDelay: 100,
    complexityMultiplier: 0.6,
    animationDuration: '1.5s',
    shimmerIntensity: 0.4,
  },
  low: {
    baseDelay: 200,
    complexityMultiplier: 0.4,
    animationDuration: '2s',
    shimmerIntensity: 0.2,
  },
}

export function ViewportSkeleton({
  children,
  className,
  variant = 'card',
  priority = 'auto',
  height = 200,
  width,
  rows = 3,
  columns = 3,
  animated = true,
  showShimmer = true,
  adaptiveComplexity = true,
  onVisibilityChange,
}: ViewportSkeletonProps) {
  const { ref, inView } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
  })

  // Determine priority automatically based on viewport position
  const effectivePriority = useMemo(() => {
    if (priority !== 'auto') return priority

    // Get priority based on viewport position when element is available
    return 'medium' // Default fallback
  }, [priority])

  const config = SKELETON_CONFIGS[effectivePriority]

  // Handle visibility changes
  React.useEffect(() => {
    onVisibilityChange?.(inView)
  }, [inView, onVisibilityChange])

  // Render appropriate skeleton based on variant
  const skeletonContent = useMemo(() => {
    const baseProps = {
      animated,
      showShimmer,
      config,
      adaptiveComplexity,
    }

    switch (variant) {
      case 'card':
        return <CardSkeleton {...baseProps} height={height} />
      case 'chart':
        return <ChartSkeleton {...baseProps} height={height} />
      case 'table':
        return <TableSkeleton {...baseProps} rows={rows} columns={columns} />
      case 'metric':
        return <MetricSkeleton {...baseProps} />
      case 'list':
        return <ListSkeleton {...baseProps} rows={rows} />
      case 'grid':
        return <GridSkeleton {...baseProps} rows={rows} columns={columns} />
      default:
        return <CardSkeleton {...baseProps} height={height} />
    }
  }, [
    variant,
    height,
    rows,
    columns,
    animated,
    showShimmer,
    config,
    adaptiveComplexity,
  ])

  // Render content if in view
  if (inView) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      ref={ref}
      className={cn(
        'viewport-skeleton',
        `viewport-skeleton-${variant}`,
        `viewport-skeleton-priority-${effectivePriority}`,
        className
      )}
      style={{
        minHeight: height,
        width: width ? `${width}px` : undefined,
      }}
      role="status"
      aria-label={`Loading ${variant} content`}
    >
      {skeletonContent}
    </div>
  )
}

// Individual skeleton components
interface SkeletonComponentProps {
  animated: boolean
  showShimmer: boolean
  config: SkeletonConfig
  adaptiveComplexity: boolean
}

function CardSkeleton({
  animated,
  showShimmer,
  config,
  adaptiveComplexity,
  height = 200,
}: SkeletonComponentProps & { height?: number }) {
  const complexity = adaptiveComplexity ? config.complexityMultiplier : 1
  const elementCount = Math.max(1, Math.floor(3 * complexity))

  return (
    <Card
      className={cn(
        'dashboard-card-skeleton',
        showShimmer && 'skeleton-shimmer',
        !animated && 'skeleton-no-animation'
      )}
      style={
        {
          minHeight: `${height}px`,
          '--skeleton-animation-duration': config.animationDuration,
          '--skeleton-shimmer-intensity': config.shimmerIntensity,
        } as React.CSSProperties
      }
    >
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              {complexity > 0.5 && <Skeleton className="h-3 w-16" />}
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {complexity > 0.7 && (
          <div className="flex items-baseline space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        )}
        <div className="space-y-2">
          {Array.from({ length: elementCount }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4 w-full"
              style={{
                width: `${Math.random() * 40 + 60}%`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
        <Skeleton className="h-20 w-full rounded" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton({
  animated,
  showShimmer,
  config,
  adaptiveComplexity,
  height = 300,
}: SkeletonComponentProps & { height?: number }) {
  const complexity = adaptiveComplexity ? config.complexityMultiplier : 1
  const barCount = Math.max(3, Math.floor(8 * complexity))
  const legendCount = Math.max(1, Math.floor(3 * complexity))

  return (
    <Card
      className={cn(
        'dashboard-card-skeleton',
        showShimmer && 'skeleton-shimmer',
        !animated && 'skeleton-no-animation'
      )}
      style={
        {
          '--skeleton-animation-duration': config.animationDuration,
          '--skeleton-shimmer-intensity': config.shimmerIntensity,
        } as React.CSSProperties
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart area */}
          <div
            className="flex justify-between items-end"
            style={{ height: `${height}px` }}
          >
            {Array.from({ length: barCount }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-8"
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>

          {/* Legend */}
          {complexity > 0.5 && (
            <div className="flex justify-center space-x-4">
              {Array.from({ length: legendCount }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TableSkeleton({
  animated,
  showShimmer,
  config,
  adaptiveComplexity,
  rows = 5,
  columns = 4,
}: SkeletonComponentProps & { rows?: number; columns?: number }) {
  const complexity = adaptiveComplexity ? config.complexityMultiplier : 1
  const effectiveRows = Math.max(1, Math.floor(rows * complexity))
  const effectiveColumns = Math.max(1, Math.floor(columns * complexity))

  return (
    <Card
      className={cn(
        'dashboard-card-skeleton',
        showShimmer && 'skeleton-shimmer',
        !animated && 'skeleton-no-animation'
      )}
      style={
        {
          '--skeleton-animation-duration': config.animationDuration,
          '--skeleton-shimmer-intensity': config.shimmerIntensity,
        } as React.CSSProperties
      }
    >
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Table header */}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)` }}
          >
            {Array.from({ length: effectiveColumns }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4 w-full"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: effectiveRows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`,
              }}
            >
              {Array.from({ length: effectiveColumns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className="h-4 w-full"
                  style={{
                    animationDelay: `${(rowIndex * effectiveColumns + colIndex) * 25}ms`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MetricSkeleton({
  animated,
  showShimmer,
  config,
  adaptiveComplexity,
}: SkeletonComponentProps) {
  const complexity = adaptiveComplexity ? config.complexityMultiplier : 1

  return (
    <Card
      className={cn(
        'dashboard-card-skeleton',
        showShimmer && 'skeleton-shimmer',
        !animated && 'skeleton-no-animation'
      )}
      style={
        {
          '--skeleton-animation-duration': config.animationDuration,
          '--skeleton-shimmer-intensity': config.shimmerIntensity,
        } as React.CSSProperties
      }
    >
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-8" />
            {complexity > 0.6 && <Skeleton className="h-6 w-12 rounded-full" />}
          </div>
          {complexity > 0.4 && <Skeleton className="h-4 w-3/4" />}
          {complexity > 0.7 && (
            <div className="flex space-x-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ListSkeleton({
  animated,
  showShimmer,
  config,
  adaptiveComplexity,
  rows = 5,
}: SkeletonComponentProps & { rows?: number }) {
  const complexity = adaptiveComplexity ? config.complexityMultiplier : 1
  const effectiveRows = Math.max(1, Math.floor(rows * complexity))

  return (
    <Card
      className={cn(
        'dashboard-card-skeleton',
        showShimmer && 'skeleton-shimmer',
        !animated && 'skeleton-no-animation'
      )}
      style={
        {
          '--skeleton-animation-duration': config.animationDuration,
          '--skeleton-shimmer-intensity': config.shimmerIntensity,
        } as React.CSSProperties
      }
    >
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: effectiveRows }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              {complexity > 0.5 && (
                <Skeleton className="h-8 w-8 rounded-full" />
              )}
              <div className="flex-1 space-y-2">
                <Skeleton
                  className="h-4 w-full"
                  style={{
                    width: `${Math.random() * 40 + 60}%`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
                {complexity > 0.7 && (
                  <Skeleton
                    className="h-3 w-full"
                    style={{
                      width: `${Math.random() * 30 + 40}%`,
                      animationDelay: `${i * 100 + 50}ms`,
                    }}
                  />
                )}
              </div>
              {complexity > 0.6 && <Skeleton className="h-6 w-6 rounded" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function GridSkeleton({
  animated,
  showShimmer,
  config,
  adaptiveComplexity,
  rows = 3,
  columns = 3,
}: SkeletonComponentProps & { rows?: number; columns?: number }) {
  const complexity = adaptiveComplexity ? config.complexityMultiplier : 1
  const effectiveRows = Math.max(1, Math.floor(rows * complexity))
  const effectiveColumns = Math.max(1, Math.floor(columns * complexity))

  return (
    <div
      className={cn(
        'grid gap-4',
        showShimmer && 'skeleton-shimmer',
        !animated && 'skeleton-no-animation'
      )}
      style={
        {
          gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`,
          '--skeleton-animation-duration': config.animationDuration,
          '--skeleton-shimmer-intensity': config.shimmerIntensity,
        } as React.CSSProperties
      }
    >
      {Array.from({ length: effectiveRows * effectiveColumns }).map((_, i) => (
        <Card key={i} className="dashboard-card-skeleton">
          <CardContent className="p-4">
            <div className="space-y-2">
              <Skeleton
                className="h-4 w-3/4"
                style={{ animationDelay: `${i * 50}ms` }}
              />
              <Skeleton
                className="h-16 w-full rounded"
                style={{ animationDelay: `${i * 50 + 25}ms` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Higher-order component for adding viewport-based skeleton loading
export function withViewportSkeleton<T extends object>(
  Component: React.ComponentType<T>,
  skeletonOptions: Omit<ViewportSkeletonProps, 'children'> = {}
) {
  const WrappedComponent = React.forwardRef<any, T>((props, ref) => {
    return (
      <ViewportSkeleton {...skeletonOptions}>
        <Component {...props} ref={ref} />
      </ViewportSkeleton>
    )
  })

  WrappedComponent.displayName = `WithViewportSkeleton(${Component.displayName || Component.name})`

  return WrappedComponent
}
