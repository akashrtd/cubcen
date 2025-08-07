'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useRouter, usePathname } from 'next/navigation'
import { TouchInteraction, useIsMobile } from '../mobile/touch-interactions'
import { MobileTooltip } from '../mobile/mobile-tooltip'

interface MobileNavigationItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  disabled?: boolean
}

interface MobileNavigationProps {
  items: MobileNavigationItem[]
  className?: string
  onItemClick?: (item: MobileNavigationItem) => void
}

export function MobileNavigation({
  items,
  className,
  onItemClick,
}: MobileNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [activeItem, setActiveItem] = useState<string>('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const navigationRef = useRef<HTMLElement>(null)

  // Update active item based on current pathname
  useEffect(() => {
    const currentItem = items.find(
      item => pathname === item.href || pathname.startsWith(item.href + '/')
    )
    if (currentItem) {
      setActiveItem(currentItem.id)
    }
  }, [pathname, items])

  const handleItemClick = useCallback(
    (item: MobileNavigationItem) => {
      if (item.disabled || isTransitioning) return

      setIsTransitioning(true)
      setActiveItem(item.id)
      onItemClick?.(item)

      if (item.href) {
        router.push(item.href)
        // Reset transition state after navigation
        setTimeout(() => setIsTransitioning(false), 300)
      } else {
        setIsTransitioning(false)
      }
    },
    [router, onItemClick, isTransitioning]
  )

  // Handle swipe navigation between sections
  const handleSwipeLeft = useCallback(() => {
    const currentIndex = items.findIndex(item => item.id === activeItem)
    const nextIndex = (currentIndex + 1) % items.length
    const nextItem = items[nextIndex]

    if (nextItem && !nextItem.disabled) {
      handleItemClick(nextItem)
    }
  }, [items, activeItem, handleItemClick])

  const handleSwipeRight = useCallback(() => {
    const currentIndex = items.findIndex(item => item.id === activeItem)
    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
    const prevItem = items[prevIndex]

    if (prevItem && !prevItem.disabled) {
      handleItemClick(prevItem)
    }
  }, [items, activeItem, handleItemClick])

  // Don't render on desktop
  if (!isMobile) {
    return null
  }

  return (
    <TouchInteraction
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      swipeThreshold={50}
      className="mobile-navigation-wrapper"
    >
      <nav
        ref={navigationRef}
        className={cn(
          'mobile-navigation',
          'fixed',
          'bottom-0',
          'left-0',
          'right-0',
          'z-50',
          'bg-dashboard-surface/95', // Semi-transparent for better visual hierarchy
          'backdrop-blur-md', // Add blur effect
          'border-t',
          'border-dashboard-border',
          'px-2',
          'py-1',
          'safe-area-inset-bottom', // Handle iPhone notch
          // Smooth transitions
          'transition-all',
          'duration-300',
          'ease-out',
          // Shadow for depth
          'shadow-lg',
          'shadow-black/10',
          className
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around">
          {items.map((item, index) => {
            const isActive = activeItem === item.id
            const Icon = item.icon

            const navButton = (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled || isTransitioning}
                className={cn(
                  'mobile-nav-item',
                  'flex',
                  'flex-col',
                  'items-center',
                  'justify-center',
                  'px-3',
                  'py-2',
                  'rounded-lg',
                  'transition-all',
                  'duration-200',
                  'ease-in-out',
                  'min-w-0',
                  'flex-1',
                  'max-w-20',
                  'relative',
                  // Minimum touch target size
                  'min-h-[44px]',
                  // Active state
                  isActive && [
                    'bg-dashboard-primary',
                    'text-dashboard-text-inverse',
                    'shadow-sm',
                    'scale-105', // Slightly larger when active
                  ],
                  // Inactive state
                  !isActive && [
                    'text-dashboard-text-secondary',
                    'hover:text-dashboard-text-primary',
                    'hover:bg-dashboard-background/50',
                    'active:scale-95', // Touch feedback
                  ],
                  // Disabled/transitioning state
                  (item.disabled || isTransitioning) && [
                    'opacity-50',
                    'cursor-not-allowed',
                    'hover:bg-transparent',
                    'hover:text-dashboard-text-secondary',
                  ],
                  // Focus styles
                  'focus:outline-none',
                  'focus:ring-2',
                  'focus:ring-dashboard-primary',
                  'focus:ring-offset-2',
                  'focus:ring-offset-dashboard-surface',
                  // Touch optimizations
                  'touch-manipulation',
                  'select-none',
                  '-webkit-tap-highlight-color: transparent'
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                aria-describedby={`nav-item-${item.id}-description`}
              >
                {/* Icon */}
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      'transition-all',
                      'duration-200',
                      isActive && 'scale-110',
                      isTransitioning && 'animate-pulse'
                    )}
                    aria-hidden="true"
                  />

                  {/* Badge */}
                  {item.badge && (
                    <span
                      className={cn(
                        'absolute',
                        '-top-1',
                        '-right-1',
                        'min-w-4',
                        'h-4',
                        'px-1',
                        'text-xs',
                        'font-medium',
                        'text-white',
                        'bg-dashboard-error',
                        'rounded-full',
                        'flex',
                        'items-center',
                        'justify-center',
                        'leading-none',
                        'animate-pulse'
                      )}
                      aria-label={`${item.badge} notifications`}
                    >
                      {typeof item.badge === 'number' && item.badge > 99
                        ? '99+'
                        : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-xs',
                    'font-medium',
                    'mt-1',
                    'truncate',
                    'max-w-full',
                    'transition-all',
                    'duration-200',
                    isActive && 'font-semibold'
                  )}
                >
                  {item.label}
                </span>

                {/* Screen reader description */}
                <span
                  id={`nav-item-${item.id}-description`}
                  className="sr-only"
                >
                  {isActive
                    ? `Current page: ${item.label}`
                    : `Navigate to ${item.label}`}
                  {item.badge ? `. ${item.badge} notifications` : ''}
                </span>
              </button>
            )

            // Wrap with tooltip for better accessibility on touch devices
            return (
              <MobileTooltip
                key={item.id}
                content={
                  <div className="text-center">
                    <div className="font-medium">{item.label}</div>
                    {item.badge && (
                      <div className="text-xs opacity-75 mt-1">
                        {item.badge} notifications
                      </div>
                    )}
                  </div>
                }
                side="top"
                disabled={item.disabled}
                tapToShow={false} // Only show on long press
                delayDuration={500}
              >
                {navButton}
              </MobileTooltip>
            )
          })}
        </div>

        {/* Swipe indicator */}
        <div
          className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-dashboard-text-disabled/30 rounded-full"
          aria-hidden="true"
        />

        {/* Navigation instructions for screen readers */}
        <div className="sr-only" aria-live="polite">
          Swipe left or right to navigate between sections. Current section:{' '}
          {items.find(item => item.id === activeItem)?.label || 'Unknown'}
        </div>
      </nav>
    </TouchInteraction>
  )
}

// Default navigation items for the dashboard
export const defaultMobileNavItems: MobileNavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
        />
      </svg>
    ),
  },
  {
    id: 'agents',
    label: 'Agents',
    href: '/dashboard/agents',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: 'tasks',
    label: 'Tasks',
    href: '/dashboard/tasks',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
]

// Hook for managing mobile navigation state
export function useMobileNavigation() {
  const [isVisible, setIsVisible] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show navigation when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    // Show navigation by default
    setIsVisible(true)

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return { isVisible, setIsVisible }
}
