'use client'

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface FocusManagementProps {
  children: React.ReactNode
  autoFocus?: boolean
  focusOnMount?: boolean
  focusOnUpdate?: boolean
  focusSelector?: string
  className?: string
}

export function FocusManagement({
  children,
  autoFocus = false,
  focusOnMount = false,
  focusOnUpdate = false,
  focusSelector,
  className
}: FocusManagementProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Focus management utility functions
  const findFocusableElement = useCallback(() => {
    if (!containerRef.current) return null

    // If a specific selector is provided, use it
    if (focusSelector) {
      const element = containerRef.current.querySelector(focusSelector) as HTMLElement
      if (element && isFocusable(element)) {
        return element
      }
    }

    // Otherwise, find the first focusable element
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])'
    ].join(', ')

    const elements = containerRef.current.querySelectorAll(focusableSelectors)
    return elements.length > 0 ? (elements[0] as HTMLElement) : null
  }, [focusSelector])

  // Check if an element is focusable
  const isFocusable = useCallback((element: HTMLElement): boolean => {
    if (element.hasAttribute('disabled')) return false
    if (element.getAttribute('tabindex') === '-1') return false
    if (element.offsetParent === null) return false // Hidden element
    
    const style = window.getComputedStyle(element)
    if (style.display === 'none' || style.visibility === 'hidden') return false
    
    return true
  }, [])

  // Set focus to the appropriate element
  const setFocus = useCallback(() => {
    const element = findFocusableElement()
    if (element) {
      // Store previous focus for restoration only if not already stored
      if (!previousFocusRef.current) {
        previousFocusRef.current = document.activeElement as HTMLElement
      }
      element.focus()
    }
  }, [findFocusableElement])

  // Restore focus to the previously focused element
  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && isFocusable(previousFocusRef.current)) {
      previousFocusRef.current.focus()
    }
  }, [isFocusable])

  // Handle focus on mount
  useEffect(() => {
    if (focusOnMount || autoFocus) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        setFocus()
      }, 0)
    }

    // Cleanup: restore focus when component unmounts
    return () => {
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        restoreFocus()
      }
    }
  }, [focusOnMount, autoFocus, setFocus, restoreFocus])

  // Handle focus on updates
  useEffect(() => {
    if (focusOnUpdate) {
      setFocus()
    }
  }, [focusOnUpdate, setFocus])

  return (
    <div
      ref={containerRef}
      className={cn('focus-management-container', className)}
    >
      {children}
    </div>
  )
}

// Hook for programmatic focus management
export function useFocusManagement() {
  const focusHistoryRef = useRef<HTMLElement[]>([])

  const pushFocus = useCallback((element: HTMLElement) => {
    const currentFocus = document.activeElement as HTMLElement
    if (currentFocus && currentFocus !== element) {
      focusHistoryRef.current.push(currentFocus)
    }
    element.focus()
  }, [])

  const popFocus = useCallback(() => {
    const previousElement = focusHistoryRef.current.pop()
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus()
    }
  }, [])

  const clearFocusHistory = useCallback(() => {
    focusHistoryRef.current = []
  }, [])

  const focusFirst = useCallback((container?: HTMLElement) => {
    const root = container || document.body
    const focusableElements = root.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus()
    }
  }, [])

  const focusLast = useCallback((container?: HTMLElement) => {
    const root = container || document.body
    const focusableElements = root.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length > 0) {
      (focusableElements[focusableElements.length - 1] as HTMLElement).focus()
    }
  }, [])

  return {
    pushFocus,
    popFocus,
    clearFocusHistory,
    focusFirst,
    focusLast
  }
}

// Component for managing focus within modals and dialogs
interface ModalFocusManagerProps {
  children: React.ReactNode
  isOpen: boolean
  onClose?: () => void
  initialFocus?: string
  finalFocus?: string
}

export function ModalFocusManager({
  children,
  isOpen,
  onClose,
  initialFocus,
  finalFocus
}: ModalFocusManagerProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement

      // Set initial focus
      setTimeout(() => {
        if (initialFocus) {
          const element = document.querySelector(initialFocus) as HTMLElement
          if (element) {
            element.focus()
          }
        } else if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement
          if (firstFocusable) {
            firstFocusable.focus()
          }
        }
      }, 0)
    } else {
      // Restore focus when modal closes
      setTimeout(() => {
        if (finalFocus) {
          const element = document.querySelector(finalFocus) as HTMLElement
          if (element) {
            element.focus()
          }
        } else if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
          previousFocusRef.current.focus()
        }
      }, 0)
    }
  }, [isOpen, initialFocus, finalFocus])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && onClose) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      className="modal-focus-manager"
    >
      {children}
    </div>
  )
}

// Utility component for skip links
interface SkipLinksProps {
  links: Array<{
    href: string
    label: string
  }>
  className?: string
}

export function SkipLinks({ links, className }: SkipLinksProps) {
  return (
    <div className={cn('skip-links sr-only focus-within:not-sr-only', className)}>
      <div className="fixed top-0 left-0 z-50 bg-white border border-gray-300 shadow-lg">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className="block px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50"
            onClick={(e) => {
              e.preventDefault()
              const target = document.querySelector(link.href)
              if (target) {
                (target as HTMLElement).focus()
                target.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}