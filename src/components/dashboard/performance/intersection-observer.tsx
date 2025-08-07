import { useEffect, useRef, useState, useCallback } from 'react'

interface IntersectionObserverOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  triggerOnce?: boolean
  skip?: boolean
  initialInView?: boolean
  delay?: number
  trackVisibility?: boolean
  fallbackInView?: boolean
}

interface IntersectionObserverEntry {
  boundingClientRect: DOMRectReadOnly
  intersectionRatio: number
  intersectionRect: DOMRectReadOnly
  isIntersecting: boolean
  rootBounds: DOMRectReadOnly | null
  target: Element
  time: number
}

interface UseIntersectionObserverResult {
  ref: (node?: Element | null) => void
  inView: boolean
  entry?: IntersectionObserverEntry
}

// Polyfill for environments without IntersectionObserver
const hasIntersectionObserver =
  typeof window !== 'undefined' && 'IntersectionObserver' in window

function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverOptions = {}
): IntersectionObserver | null {
  if (!hasIntersectionObserver) {
    return null
  }

  return new IntersectionObserver(callback, {
    root: options.root,
    rootMargin: options.rootMargin || '0px',
    threshold: options.threshold || 0,
  })
}

// Hook for using intersection observer
export function useIntersectionObserver(
  options: IntersectionObserverOptions = {}
): UseIntersectionObserverResult {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    triggerOnce = false,
    skip = false,
    initialInView = false,
    delay = 0,
    trackVisibility = false,
    fallbackInView = false,
  } = options

  const [inView, setInView] = useState(initialInView)
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const elementRef = useRef<Element | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const setRef = useCallback(
    (node: Element | null) => {
      if (elementRef.current) {
        // Clean up previous observer
        if (observerRef.current) {
          observerRef.current.unobserve(elementRef.current)
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }

      elementRef.current = node

      if (skip || !node) return

      // Fallback for environments without IntersectionObserver
      if (!hasIntersectionObserver) {
        if (!triggerOnce || !inView) {
          setInView(fallbackInView)
        }
        return
      }

      observerRef.current = createIntersectionObserver(
        entries => {
          const [observerEntry] = entries
          const isIntersecting = observerEntry.isIntersecting

          // Handle visibility tracking
          if (trackVisibility && 'isVisible' in observerEntry) {
            const isVisible = (observerEntry as any).isVisible
            if (!isVisible) return
          }

          const handleIntersection = () => {
            setInView(isIntersecting)
            setEntry(observerEntry)

            if (isIntersecting && triggerOnce && observerRef.current) {
              observerRef.current.unobserve(node)
              observerRef.current = null
            }
          }

          if (delay > 0 && isIntersecting) {
            timeoutRef.current = setTimeout(handleIntersection, delay)
          } else {
            handleIntersection()
          }
        },
        {
          threshold,
          root,
          rootMargin,
          // Enable visibility tracking if supported
          ...(trackVisibility && { trackVisibility: true, delay: 100 }),
        }
      )

      if (observerRef.current && node) {
        observerRef.current.observe(node)
      }
    },
    [
      threshold,
      root,
      rootMargin,
      triggerOnce,
      skip,
      delay,
      trackVisibility,
      fallbackInView,
      inView,
    ]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    ref: setRef,
    inView,
    entry,
  }
}

// Higher-order component for intersection observer
export function withIntersectionObserver<T extends object>(
  Component: React.ComponentType<T>,
  options: IntersectionObserverOptions = {}
) {
  const WrappedComponent = React.forwardRef<
    any,
    T & { onIntersect?: (inView: boolean) => void }
  >((props, ref) => {
    const { onIntersect, ...componentProps } = props
    const { ref: intersectionRef, inView } = useIntersectionObserver(options)

    useEffect(() => {
      onIntersect?.(inView)
    }, [inView, onIntersect])

    return (
      <div ref={intersectionRef}>
        <Component {...(componentProps as T)} ref={ref} />
      </div>
    )
  })

  WrappedComponent.displayName = `WithIntersectionObserver(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Utility for batch intersection observer
export class BatchIntersectionObserver {
  private observer: IntersectionObserver | null = null
  private callbacks = new Map<
    Element,
    (entry: IntersectionObserverEntry) => void
  >()

  constructor(private options: IntersectionObserverOptions = {}) {
    if (hasIntersectionObserver) {
      this.observer = createIntersectionObserver(entries => {
        entries.forEach(entry => {
          const callback = this.callbacks.get(entry.target)
          if (callback) {
            callback(entry)
          }
        })
      }, options)
    }
  }

  observe(
    element: Element,
    callback: (entry: IntersectionObserverEntry) => void
  ) {
    if (!this.observer) {
      // Fallback behavior
      callback({
        isIntersecting: this.options.fallbackInView || false,
        target: element,
      } as IntersectionObserverEntry)
      return
    }

    this.callbacks.set(element, callback)
    this.observer.observe(element)
  }

  unobserve(element: Element) {
    if (this.observer) {
      this.observer.unobserve(element)
    }
    this.callbacks.delete(element)
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
    this.callbacks.clear()
  }
}

// Singleton batch observer for performance optimization
let globalBatchObserver: BatchIntersectionObserver | null = null

export function getGlobalBatchObserver(
  options: IntersectionObserverOptions = {}
) {
  if (!globalBatchObserver) {
    globalBatchObserver = new BatchIntersectionObserver(options)
  }
  return globalBatchObserver
}

// Hook for using the global batch observer
export function useBatchIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverOptions = {}
) {
  const elementRef = useRef<Element | null>(null)
  const batchObserver = getGlobalBatchObserver(options)

  const setRef = useCallback(
    (node: Element | null) => {
      if (elementRef.current) {
        batchObserver.unobserve(elementRef.current)
      }

      elementRef.current = node

      if (node) {
        batchObserver.observe(node, callback)
      }
    },
    [batchObserver, callback]
  )

  useEffect(() => {
    return () => {
      if (elementRef.current) {
        batchObserver.unobserve(elementRef.current)
      }
    }
  }, [batchObserver])

  return { ref: setRef }
}

// Performance monitoring for intersection observer
export function trackIntersectionPerformance(elementId: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const startTime = performance.now()

    return {
      end: () => {
        const endTime = performance.now()
        const observationTime = endTime - startTime

        // Log performance metrics
        console.log(
          `Intersection observation ${elementId}: ${observationTime.toFixed(2)}ms`
        )

        // Send to analytics if available
        if ('gtag' in window) {
          ;(window as any).gtag('event', 'intersection_performance', {
            element_id: elementId,
            observation_time: Math.round(observationTime),
          })
        }
      },
    }
  }

  return { end: () => {} }
}

// Utility for creating viewport-based loading priorities
export function getViewportBasedPriority(
  element: Element
): 'critical' | 'high' | 'medium' | 'low' {
  if (typeof window === 'undefined') return 'medium'

  const rect = element.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  // Critical: Above the fold and in center of viewport
  if (
    rect.top >= 0 &&
    rect.bottom <= viewportHeight &&
    rect.left >= viewportWidth * 0.25 &&
    rect.right <= viewportWidth * 0.75
  ) {
    return 'critical'
  }

  // High: Above the fold
  if (rect.top >= 0 && rect.top <= viewportHeight) {
    return 'high'
  }

  // Medium: Within 2x viewport height
  if (rect.top <= viewportHeight * 2) {
    return 'medium'
  }

  // Low: Beyond 2x viewport height
  return 'low'
}

// Utility for preloading elements based on scroll direction
export function useScrollDirectionOptimization() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(
    null
  )
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up')
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return scrollDirection
}
