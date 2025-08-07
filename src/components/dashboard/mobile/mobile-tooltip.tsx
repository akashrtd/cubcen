import React, { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useIsTouchDevice } from './touch-interactions'

interface MobileTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  disabled?: boolean
  className?: string
  contentClassName?: string
  delayDuration?: number
  tapToShow?: boolean
  tapToHide?: boolean
}

export function MobileTooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  disabled = false,
  className,
  contentClassName,
  delayDuration = 0,
  tapToShow = true,
  tapToHide = true,
}: MobileTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isTouchDevice = useIsTouchDevice()

  // Calculate tooltip position
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    let x = 0
    let y = 0

    // Calculate base position based on side
    switch (side) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2
        y = triggerRect.top - tooltipRect.height - 8
        break
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2
        y = triggerRect.bottom + 8
        break
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8
        y = triggerRect.top + triggerRect.height / 2
        break
      case 'right':
        x = triggerRect.right + 8
        y = triggerRect.top + triggerRect.height / 2
        break
    }

    // Adjust for alignment
    if (side === 'top' || side === 'bottom') {
      switch (align) {
        case 'start':
          x = triggerRect.left
          break
        case 'end':
          x = triggerRect.right - tooltipRect.width
          break
        case 'center':
        default:
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
          break
      }
    } else {
      switch (align) {
        case 'start':
          y = triggerRect.top
          break
        case 'end':
          y = triggerRect.bottom - tooltipRect.height
          break
        case 'center':
        default:
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
          break
      }
    }

    // Keep tooltip within viewport bounds
    x = Math.max(8, Math.min(x, viewport.width - tooltipRect.width - 8))
    y = Math.max(8, Math.min(y, viewport.height - tooltipRect.height - 8))

    setPosition({ x, y })
  }, [side, align])

  // Show tooltip
  const showTooltip = useCallback(() => {
    if (disabled) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (delayDuration > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
        // Calculate position after showing to get accurate measurements
        requestAnimationFrame(calculatePosition)
      }, delayDuration)
    } else {
      setIsVisible(true)
      requestAnimationFrame(calculatePosition)
    }
  }, [disabled, delayDuration, calculatePosition])

  // Hide tooltip
  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }, [])

  // Handle mouse events for non-touch devices
  const handleMouseEnter = useCallback(() => {
    if (!isTouchDevice) {
      showTooltip()
    }
  }, [isTouchDevice, showTooltip])

  const handleMouseLeave = useCallback(() => {
    if (!isTouchDevice) {
      hideTooltip()
    }
  }, [isTouchDevice, hideTooltip])

  // Handle touch/click events
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (!isTouchDevice || !tapToShow) return

      event.preventDefault()

      if (isVisible && tapToHide) {
        hideTooltip()
      } else {
        showTooltip()
      }
    },
    [isTouchDevice, tapToShow, tapToHide, isVisible, showTooltip, hideTooltip]
  )

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (isTouchDevice) return // Touch events handle this

      if (tapToShow) {
        event.preventDefault()

        if (isVisible && tapToHide) {
          hideTooltip()
        } else {
          showTooltip()
        }
      }
    },
    [isTouchDevice, tapToShow, tapToHide, isVisible, showTooltip, hideTooltip]
  )

  // Handle focus events for keyboard accessibility
  const handleFocus = useCallback(() => {
    showTooltip()
  }, [showTooltip])

  const handleBlur = useCallback(() => {
    hideTooltip()
  }, [hideTooltip])

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        hideTooltip()
      }
    },
    [isVisible, hideTooltip]
  )

  // Close tooltip when clicking outside
  React.useEffect(() => {
    if (!isVisible) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current &&
        tooltipRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        hideTooltip()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isVisible, hideTooltip])

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <div
        ref={triggerRef}
        className={cn(
          'mobile-tooltip-trigger',
          isTouchDevice && 'cursor-pointer',
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? 'mobile-tooltip-content' : undefined}
        aria-expanded={isVisible}
      >
        {children}
      </div>

      {/* Tooltip content */}
      {isVisible && (
        <div
          ref={tooltipRef}
          id="mobile-tooltip-content"
          className={cn(
            'mobile-tooltip-content',
            'fixed z-50 px-3 py-2 text-sm',
            'bg-gray-900 text-white rounded-md shadow-lg',
            'dark:bg-gray-100 dark:text-gray-900',
            'max-w-xs break-words',
            // Animation classes
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            // Side-specific animations
            side === 'top' && 'slide-in-from-bottom-2',
            side === 'bottom' && 'slide-in-from-top-2',
            side === 'left' && 'slide-in-from-right-2',
            side === 'right' && 'slide-in-from-left-2',
            contentClassName
          )}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          role="tooltip"
          aria-live="polite"
        >
          {content}

          {/* Tooltip arrow */}
          <div
            className={cn(
              'absolute w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45',
              side === 'top' &&
                'bottom-[-4px] left-1/2 transform -translate-x-1/2',
              side === 'bottom' &&
                'top-[-4px] left-1/2 transform -translate-x-1/2',
              side === 'left' &&
                'right-[-4px] top-1/2 transform -translate-y-1/2',
              side === 'right' &&
                'left-[-4px] top-1/2 transform -translate-y-1/2'
            )}
          />
        </div>
      )}
    </>
  )
}

// Utility component for chart tooltips
export function ChartMobileTooltip({
  children,
  data,
  formatter,
  ...props
}: Omit<MobileTooltipProps, 'content'> & {
  data?: any
  formatter?: (data: any) => React.ReactNode
}) {
  const content = React.useMemo(() => {
    if (!data) return null

    if (formatter) {
      return formatter(data)
    }

    // Default formatting for chart data
    if (typeof data === 'object' && data !== null) {
      return (
        <div className="space-y-1">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-2">
              <span className="font-medium">{key}:</span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      )
    }

    return String(data)
  }, [data, formatter])

  if (!content) {
    return <>{children}</>
  }

  return (
    <MobileTooltip content={content} {...props}>
      {children}
    </MobileTooltip>
  )
}
