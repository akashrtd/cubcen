'use client'

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface KeyboardNavigationProps {
  children: React.ReactNode
  trapFocus?: boolean
  restoreFocus?: boolean
  initialFocus?: string
  skipLinks?: Array<{
    href: string
    label: string
  }>
  onEscape?: () => void
  className?: string
}

export function KeyboardNavigation({
  children,
  trapFocus = false,
  restoreFocus = false,
  initialFocus,
  skipLinks = [],
  onEscape,
  className
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Store the previously focused element when component mounts
  useEffect(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }

    // Set initial focus if specified
    if (initialFocus) {
      const element = document.querySelector(initialFocus) as HTMLElement
      if (element) {
        element.focus()
      }
    }

    // Restore focus when component unmounts
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [restoreFocus, initialFocus])

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])',
      '[role="menuitem"]:not([disabled])',
      '[role="tab"]:not([disabled])'
    ].join(', ')

    return Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[]
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, shiftKey } = event

    // Handle escape key
    if (key === 'Escape' && onEscape) {
      onEscape()
      return
    }

    // Handle tab navigation with focus trapping
    if (key === 'Tab' && trapFocus) {
      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const currentElement = document.activeElement as HTMLElement

      if (shiftKey) {
        // Shift + Tab (backward navigation)
        if (currentElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab (forward navigation)
        if (currentElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Handle arrow key navigation for chart interactions
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      const currentElement = document.activeElement as HTMLElement
      
      // Check if we're in a chart container
      if (currentElement.closest('[data-chart-container]')) {
        handleChartNavigation(event, currentElement)
      }
    }
  }, [trapFocus, onEscape, getFocusableElements, handleChartNavigation])

  // Handle chart-specific keyboard navigation
  const handleChartNavigation = useCallback((event: KeyboardEvent, currentElement: HTMLElement) => {
    const { key } = event
    const chartContainer = currentElement.closest('[data-chart-container]')
    if (!chartContainer) return

    const chartElements = Array.from(
      chartContainer.querySelectorAll('[data-chart-element]')
    ) as HTMLElement[]

    if (chartElements.length === 0) return

    const currentIndex = chartElements.indexOf(currentElement)
    let nextIndex = currentIndex

    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % chartElements.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = currentIndex === 0 ? chartElements.length - 1 : currentIndex - 1
        break
      default:
        return
    }

    event.preventDefault()
    chartElements[nextIndex].focus()
  }, [])

  // Attach keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div
      ref={containerRef}
      className={cn('keyboard-navigation-container', className)}
    >
      {/* Skip links for screen readers */}
      {skipLinks.length > 0 && (
        <div className="sr-only focus-within:not-sr-only">
          <div className="fixed top-0 left-0 z-50 bg-white border border-gray-300 p-2 shadow-lg">
            {skipLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block p-2 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
      
      {children}
    </div>
  )
}

// Hook for managing focus within components
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement | null>(null)

  const setFocus = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus()
      focusRef.current = element
    }
  }, [])

  const restoreFocus = useCallback(() => {
    if (focusRef.current) {
      focusRef.current.focus()
    }
  }, [])

  const moveFocus = useCallback((direction: 'next' | 'previous') => {
    const currentElement = document.activeElement as HTMLElement
    if (!currentElement) return

    const focusableElements = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[]

    const currentIndex = focusableElements.indexOf(currentElement)
    if (currentIndex === -1) return

    let nextIndex: number
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % focusableElements.length
    } else {
      nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
    }

    focusableElements[nextIndex].focus()
  }, [])

  return {
    setFocus,
    restoreFocus,
    moveFocus
  }
}

// Component for focus trap functionality
interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  initialFocus?: string
  onEscape?: () => void
}

export function FocusTrap({ children, active = true, initialFocus, onEscape }: FocusTrapProps) {
  if (!active) {
    return <>{children}</>
  }

  return (
    <KeyboardNavigation
      trapFocus
      restoreFocus
      initialFocus={initialFocus}
      onEscape={onEscape}
    >
      {children}
    </KeyboardNavigation>
  )
}