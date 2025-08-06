import React, { useState, useRef, useEffect, Suspense } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface LazyCardProps {
  children: React.ReactNode
  className?: string
  fallback?: React.ReactNode
  rootMargin?: string
  threshold?: number
  minHeight?: number
  onIntersect?: () => void
  onLoad?: () => void
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

interface LazyCardSkeletonProps {
  minHeight?: number
  className?: string
}

function LazyCardSkeleton({ minHeight = 200, className }: LazyCardSkeletonProps) {
  return (
    <Card 
      className={cn('dashboard-card-skeleton', className)}
      style={{ minHeight: `${minHeight}px` }}
      role="status"
      aria-label="Loading card content"
    >
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <Skeleton className="h-20 w-full rounded" />
      </CardContent>
    </Card>
  )
}

export function LazyCard({
  children,
  className,
  fallback,
  rootMargin = '50px',
  threshold = 0.1,
  minHeight = 200,
  onIntersect,
  onLoad,
  priority = 'medium',
}: LazyCardProps) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Priority-based loading delay
  const getLoadingDelay = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 0
      case 'high':
        return 50
      case 'medium':
        return 100
      case 'low':
        return 200
      default:
        return 100
    }
  }

  useEffect(() => {
    const currentRef = cardRef.current
    if (!currentRef) return

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !isIntersecting) {
          // Add priority-based delay
          const delay = getLoadingDelay(priority)
          
          setTimeout(() => {
            setIsIntersecting(true)
            onIntersect?.()
            
            // Disconnect observer after first intersection
            if (observerRef.current) {
              observerRef.current.disconnect()
            }
          }, delay)
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    observerRef.current.observe(currentRef)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [isIntersecting, rootMargin, threshold, priority, onIntersect])

  // Handle load completion
  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      // Small delay to ensure smooth loading
      const timer = setTimeout(() => {
        setHasLoaded(true)
        onLoad?.()
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [isIntersecting, hasLoaded, onLoad])

  const defaultFallback = fallback || (
    <LazyCardSkeleton 
      minHeight={minHeight} 
      className={className}
    />
  )

  return (
    <div
      ref={cardRef}
      className={cn(
        'lazy-card-container',
        // Priority-based styling
        priority === 'critical' && 'lazy-card-critical',
        priority === 'high' && 'lazy-card-high',
        priority === 'medium' && 'lazy-card-medium',
        priority === 'low' && 'lazy-card-low',
        className
      )}
      style={{ minHeight: isIntersecting ? 'auto' : `${minHeight}px` }}
    >
      {isIntersecting ? (
        <Suspense fallback={defaultFallback}>
          <div className="lazy-card-content">
            {children}
          </div>
        </Suspense>
      ) : (
        defaultFallback
      )}
    </div>
  )
}

// Higher-order component for wrapping existing cards with lazy loading
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    rootMargin?: string
    threshold?: number
    minHeight?: number
    priority?: 'low' | 'medium' | 'high' | 'critical'
  }
) {
  const LazyWrappedComponent = React.forwardRef<any, T>((props, ref) => {
    return (
      <LazyCard
        rootMargin={options?.rootMargin}
        threshold={options?.threshold}
        minHeight={options?.minHeight}
        priority={options?.priority}
      >
        <Component {...props} ref={ref} />
      </LazyCard>
    )
  })

  LazyWrappedComponent.displayName = `LazyLoaded(${Component.displayName || Component.name})`
  
  return LazyWrappedComponent
}

// Hook for manual lazy loading control
export function useLazyLoading(
  options: {
    rootMargin?: string
    threshold?: number
    priority?: 'low' | 'medium' | 'high' | 'critical'
  } = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const currentRef = elementRef.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !isIntersecting) {
          const delay = options.priority === 'critical' ? 0 : 
                       options.priority === 'high' ? 50 :
                       options.priority === 'medium' ? 100 : 200

          setTimeout(() => {
            setIsIntersecting(true)
            setHasLoaded(true)
            observer.disconnect()
          }, delay)
        }
      },
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.1,
      }
    )

    observer.observe(currentRef)

    return () => observer.disconnect()
  }, [isIntersecting, options.rootMargin, options.threshold, options.priority])

  return {
    elementRef,
    isIntersecting,
    hasLoaded,
  }
}