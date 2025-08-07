'use client'

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface AnnouncementProps {
  message: string
  priority: 'polite' | 'assertive'
  delay?: number
}

interface ScreenReaderAnnouncerProps {
  className?: string
}

// Global announcement queue to manage multiple announcements
const announcementQueue: AnnouncementProps[] = []
let isProcessing = false

export function ScreenReaderAnnouncer({ className }: ScreenReaderAnnouncerProps) {
  const politeRef = useRef<HTMLDivElement>(null)
  const assertiveRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Process the announcement queue
  const processQueue = useCallback(() => {
    if (isProcessing || announcementQueue.length === 0) return

    isProcessing = true
    const announcement = announcementQueue.shift()!
    
    const targetRef = announcement.priority === 'assertive' ? assertiveRef : politeRef
    
    if (targetRef.current) {
      // Clear previous content
      targetRef.current.textContent = ''
      
      // Add new announcement with optional delay
      const delay = announcement.delay || 0
      timeoutRef.current = setTimeout(() => {
        if (targetRef.current) {
          targetRef.current.textContent = announcement.message
          
          // Clear the message after a short delay to allow for re-announcements
          setTimeout(() => {
            if (targetRef.current) {
              targetRef.current.textContent = ''
            }
            isProcessing = false
            processQueue() // Process next announcement
          }, 100)
        }
      }, delay)
    } else {
      isProcessing = false
      processQueue()
    }
  }, [])

  // Set up global announcement function
  useEffect(() => {
    // Make announce function globally available
    const announceFunction = (
      message: string, 
      priority: 'polite' | 'assertive' = 'polite',
      delay?: number
    ) => {
      announcementQueue.push({ message, priority, delay })
      processQueue()
    }
    
    ;(window as any).announceToScreenReader = announceFunction

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      // Clean up global function
      delete (window as any).announceToScreenReader
    }
  }, [processQueue])

  return (
    <div className={cn('screen-reader-announcer', className)}>
      {/* Polite announcements - won't interrupt current speech */}
      <div
        ref={politeRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />
      
      {/* Assertive announcements - will interrupt current speech */}
      <div
        ref={assertiveRef}
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
      />
    </div>
  )
}

// Hook for using screen reader announcements
export function useScreenReaderAnnouncer() {
  const announce = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite',
    delay?: number
  ) => {
    if (typeof window !== 'undefined' && (window as any).announceToScreenReader) {
      ;(window as any).announceToScreenReader(message, priority, delay)
    }
  }, [])

  const announcePolite = useCallback((message: string, delay?: number) => {
    announce(message, 'polite', delay)
  }, [announce])

  const announceAssertive = useCallback((message: string, delay?: number) => {
    announce(message, 'assertive', delay)
  }, [announce])

  // Announce data updates
  const announceDataUpdate = useCallback((
    dataType: string, 
    updateType: 'loaded' | 'updated' | 'error' | 'filtered' = 'updated',
    details?: string
  ) => {
    let message = `${dataType} ${updateType}`
    if (details) {
      message += `: ${details}`
    }
    announce(message, 'polite')
  }, [announce])

  // Announce chart interactions
  const announceChartInteraction = useCallback((
    action: string,
    element: string,
    value?: string | number,
    context?: string
  ) => {
    let message = `${action} ${element}`
    if (value !== undefined) {
      message += ` with value ${value}`
    }
    if (context) {
      message += ` in ${context}`
    }
    announce(message, 'polite')
  }, [announce])

  // Announce navigation changes
  const announceNavigation = useCallback((
    destination: string,
    context?: string
  ) => {
    let message = `Navigated to ${destination}`
    if (context) {
      message += ` ${context}`
    }
    announce(message, 'polite')
  }, [announce])

  // Announce filter changes
  const announceFilterChange = useCallback((
    filterType: string,
    filterValue: string,
    resultCount?: number
  ) => {
    let message = `Filter applied: ${filterType} set to ${filterValue}`
    if (resultCount !== undefined) {
      message += `. Showing ${resultCount} results`
    }
    announce(message, 'polite')
  }, [announce])

  // Announce loading states
  const announceLoading = useCallback((
    content: string,
    isLoading: boolean
  ) => {
    const message = isLoading 
      ? `Loading ${content}` 
      : `${content} loaded`
    announce(message, 'polite')
  }, [announce])

  // Announce errors
  const announceError = useCallback((
    error: string,
    context?: string
  ) => {
    let message = `Error: ${error}`
    if (context) {
      message += ` in ${context}`
    }
    announce(message, 'assertive')
  }, [announce])

  return {
    announce,
    announcePolite,
    announceAssertive,
    announceDataUpdate,
    announceChartInteraction,
    announceNavigation,
    announceFilterChange,
    announceLoading,
    announceError
  }
}

// Component for announcing data changes
interface DataAnnouncerProps {
  data: any
  dataType: string
  loading?: boolean
  error?: string
  children: React.ReactNode
}

export function DataAnnouncer({ 
  data, 
  dataType, 
  loading = false, 
  error, 
  children 
}: DataAnnouncerProps) {
  const { announceDataUpdate, announceLoading, announceError } = useScreenReaderAnnouncer()
  const previousDataRef = useRef(data)
  const previousLoadingRef = useRef(loading)

  useEffect(() => {
    // Announce loading state changes
    if (loading !== previousLoadingRef.current) {
      announceLoading(dataType, loading)
      previousLoadingRef.current = loading
    }

    // Announce data updates
    if (!loading && data !== previousDataRef.current) {
      if (data && !previousDataRef.current) {
        announceDataUpdate(dataType, 'loaded')
      } else if (data) {
        announceDataUpdate(dataType, 'updated')
      }
      previousDataRef.current = data
    }

    // Announce errors
    if (error) {
      announceError(error, dataType)
    }
  }, [data, dataType, loading, error, announceDataUpdate, announceLoading, announceError])

  return <>{children}</>
}

// Component for announcing chart interactions
interface ChartAnnouncerProps {
  chartType: string
  data: any
  selectedElement?: any
  children: React.ReactNode
}

export function ChartAnnouncer({ 
  chartType, 
  data, 
  selectedElement, 
  children 
}: ChartAnnouncerProps) {
  const { announceChartInteraction } = useScreenReaderAnnouncer()
  const previousSelectedRef = useRef(selectedElement)

  useEffect(() => {
    if (selectedElement && selectedElement !== previousSelectedRef.current) {
      const elementType = selectedElement.type || 'element'
      const value = selectedElement.value || selectedElement.y || selectedElement.data
      announceChartInteraction('Selected', elementType, value, `${chartType} chart`)
      previousSelectedRef.current = selectedElement
    }
  }, [selectedElement, chartType, announceChartInteraction])

  return <>{children}</>
}

// Component for announcing filter changes
interface FilterAnnouncerProps {
  filters: Record<string, any>
  resultCount?: number
  children: React.ReactNode
}

export function FilterAnnouncer({ 
  filters, 
  resultCount, 
  children 
}: FilterAnnouncerProps) {
  const { announceFilterChange } = useScreenReaderAnnouncer()
  const previousFiltersRef = useRef(filters)

  useEffect(() => {
    const currentFilters = JSON.stringify(filters)
    const previousFilters = JSON.stringify(previousFiltersRef.current)

    if (currentFilters !== previousFilters) {
      // Find which filter changed
      Object.keys(filters).forEach(key => {
        if (filters[key] !== previousFiltersRef.current?.[key]) {
          announceFilterChange(key, String(filters[key]), resultCount)
        }
      })
      previousFiltersRef.current = filters
    }
  }, [filters, resultCount, announceFilterChange])

  return <>{children}</>
}