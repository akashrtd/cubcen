import React, { useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TouchInteractionProps {
  children: React.ReactNode
  onTap?: (event: TouchEvent) => void
  onDoubleTap?: (event: TouchEvent) => void
  onLongPress?: (event: TouchEvent) => void
  onSwipeLeft?: (event: TouchEvent) => void
  onSwipeRight?: (event: TouchEvent) => void
  onSwipeUp?: (event: TouchEvent) => void
  onSwipeDown?: (event: TouchEvent) => void
  onPinchZoom?: (scale: number, event: TouchEvent) => void
  className?: string
  disabled?: boolean
  longPressDelay?: number
  swipeThreshold?: number
  pinchThreshold?: number
}

interface TouchState {
  startX: number
  startY: number
  startTime: number
  lastTapTime: number
  tapCount: number
  isLongPress: boolean
  initialDistance: number
  initialScale: number
}

export function TouchInteraction({
  children,
  onTap,
  onDoubleTap,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchZoom,
  className,
  disabled = false,
  longPressDelay = 500,
  swipeThreshold = 50,
  pinchThreshold = 0.1,
}: TouchInteractionProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const touchStateRef = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastTapTime: 0,
    tapCount: 0,
    isLongPress: false,
    initialDistance: 0,
    initialScale: 1,
  })
  const longPressTimerRef = useRef<NodeJS.Timeout | undefined>()

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }, [])

  // Handle touch start
  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (disabled) return

      const touch = event.touches[0]
      const now = Date.now()
      const touchState = touchStateRef.current

      // Clear any existing long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }

      // Update touch state
      touchState.startX = touch.clientX
      touchState.startY = touch.clientY
      touchState.startTime = now
      touchState.isLongPress = false

      // Handle multi-touch for pinch gestures
      if (event.touches.length === 2) {
        touchState.initialDistance = getTouchDistance(event.touches)
        touchState.initialScale = 1
      }

      // Set up long press detection
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          touchState.isLongPress = true
          onLongPress(event)
        }, longPressDelay)
      }

      // Prevent default to avoid unwanted behaviors
      event.preventDefault()
    },
    [disabled, onLongPress, longPressDelay, getTouchDistance]
  )

  // Handle touch move
  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (disabled) return

      const touchState = touchStateRef.current

      // Handle pinch zoom
      if (event.touches.length === 2 && onPinchZoom) {
        const currentDistance = getTouchDistance(event.touches)
        if (touchState.initialDistance > 0) {
          const scale = currentDistance / touchState.initialDistance
          if (Math.abs(scale - touchState.initialScale) > pinchThreshold) {
            touchState.initialScale = scale
            onPinchZoom(scale, event)
          }
        }
      }

      // Cancel long press if finger moves too much
      const touch = event.touches[0]
      const deltaX = Math.abs(touch.clientX - touchState.startX)
      const deltaY = Math.abs(touch.clientY - touchState.startY)

      if ((deltaX > 10 || deltaY > 10) && longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = undefined
      }

      event.preventDefault()
    },
    [disabled, onPinchZoom, getTouchDistance, pinchThreshold]
  )

  // Handle touch end
  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (disabled) return

      const touch = event.changedTouches[0]
      const now = Date.now()
      const touchState = touchStateRef.current

      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = undefined
      }

      // Skip if this was a long press
      if (touchState.isLongPress) {
        return
      }

      // Calculate swipe distance and direction
      const deltaX = touch.clientX - touchState.startX
      const deltaY = touch.clientY - touchState.startY
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)
      const duration = now - touchState.startTime

      // Check for swipe gestures
      if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight(event)
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft(event)
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown(event)
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp(event)
          }
        }
        return
      }

      // Check for tap gestures (only if not a swipe)
      if (absDeltaX < 10 && absDeltaY < 10 && duration < 300) {
        // Check for double tap
        if (now - touchState.lastTapTime < 300 && touchState.tapCount === 1) {
          touchState.tapCount = 0
          touchState.lastTapTime = 0
          if (onDoubleTap) {
            onDoubleTap(event)
          }
        } else {
          // Single tap
          touchState.tapCount = 1
          touchState.lastTapTime = now

          // Delay single tap to check for double tap
          setTimeout(() => {
            if (touchState.tapCount === 1 && onTap) {
              touchState.tapCount = 0
              onTap(event)
            }
          }, 300)
        }
      }

      event.preventDefault()
    },
    [
      disabled,
      onTap,
      onDoubleTap,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      swipeThreshold,
    ]
  )

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return (
    <div
      ref={elementRef}
      className={cn(
        'touch-interaction',
        // Optimize for touch interactions
        'touch-manipulation select-none',
        // Prevent text selection during gestures
        '[user-select:none] [-webkit-user-select:none]',
        // Disable tap highlight
        '[tap-highlight-color:transparent] [-webkit-tap-highlight-color:transparent]',
        className
      )}
      style={{
        // Ensure smooth touch interactions
        touchAction: disabled ? 'auto' : 'manipulation',
      }}
    >
      {children}
    </div>
  )
}

// Hook for detecting touch device
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false)

  React.useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          // @ts-expect-error - msMaxTouchPoints is a legacy IE property not in TypeScript DOM types
          navigator.msMaxTouchPoints > 0
      )
    }

    checkTouchDevice()

    // Listen for changes in touch capability
    window.addEventListener('touchstart', checkTouchDevice, { once: true })

    return () => {
      window.removeEventListener('touchstart', checkTouchDevice)
    }
  }, [])

  return isTouchDevice
}

// Hook for detecting mobile viewport
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return isMobile
}
