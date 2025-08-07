'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { TouchInteraction, useIsMobile } from '../mobile/touch-interactions'

interface SwipeNavigationSection {
  id: string
  title: string
  content: React.ReactNode
  disabled?: boolean
}

interface SwipeNavigationProps {
  sections: SwipeNavigationSection[]
  initialSection?: string
  onSectionChange?: (sectionId: string) => void
  className?: string
  showIndicators?: boolean
  enableKeyboardNavigation?: boolean
  animationDuration?: number
}

export function SwipeNavigation({
  sections,
  initialSection,
  onSectionChange,
  className,
  showIndicators = true,
  enableKeyboardNavigation = true,
  animationDuration = 300,
}: SwipeNavigationProps) {
  const isMobile = useIsMobile()
  const [currentSectionIndex, setCurrentSectionIndex] = useState(() => {
    if (initialSection) {
      const index = sections.findIndex(section => section.id === initialSection)
      return index >= 0 ? index : 0
    }
    return 0
  })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement>(null)

  const currentSection = sections[currentSectionIndex]

  // Navigate to a specific section
  const navigateToSection = useCallback(
    (index: number) => {
      if (
        index < 0 ||
        index >= sections.length ||
        index === currentSectionIndex ||
        isTransitioning ||
        sections[index]?.disabled
      ) {
        return
      }

      setIsTransitioning(true)
      setCurrentSectionIndex(index)
      onSectionChange?.(sections[index].id)

      // Reset transition state after animation
      setTimeout(() => {
        setIsTransitioning(false)
      }, animationDuration)
    },
    [
      sections,
      currentSectionIndex,
      isTransitioning,
      onSectionChange,
      animationDuration,
    ]
  )

  // Handle swipe gestures
  const handleSwipeLeft = useCallback(() => {
    navigateToSection(currentSectionIndex + 1)
  }, [currentSectionIndex, navigateToSection])

  const handleSwipeRight = useCallback(() => {
    navigateToSection(currentSectionIndex - 1)
  }, [currentSectionIndex, navigateToSection])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!enableKeyboardNavigation || isTransitioning) return

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          navigateToSection(currentSectionIndex - 1)
          break
        case 'ArrowRight':
          event.preventDefault()
          navigateToSection(currentSectionIndex + 1)
          break
        case 'Home':
          event.preventDefault()
          navigateToSection(0)
          break
        case 'End':
          event.preventDefault()
          navigateToSection(sections.length - 1)
          break
      }
    },
    [
      enableKeyboardNavigation,
      isTransitioning,
      currentSectionIndex,
      navigateToSection,
      sections.length,
    ]
  )

  // Update section when initialSection prop changes
  useEffect(() => {
    if (initialSection) {
      const index = sections.findIndex(section => section.id === initialSection)
      if (index >= 0 && index !== currentSectionIndex) {
        navigateToSection(index)
      }
    }
  }, [initialSection, sections, currentSectionIndex, navigateToSection])

  // Don't render swipe navigation on desktop unless explicitly needed
  if (!isMobile) {
    return (
      <div className={cn('swipe-navigation-desktop', className)}>
        {currentSection?.content}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'swipe-navigation',
        'relative',
        'w-full',
        'h-full',
        'overflow-hidden',
        className
      )}
      onKeyDown={handleKeyDown}
      tabIndex={enableKeyboardNavigation ? 0 : -1}
      role="region"
      aria-label="Swipeable content sections"
      aria-live="polite"
    >
      {/* Section indicators */}
      {showIndicators && sections.length > 1 && (
        <div
          className={cn(
            'swipe-indicators',
            'absolute',
            'top-4',
            'left-1/2',
            'transform',
            '-translate-x-1/2',
            'z-10',
            'flex',
            'space-x-2',
            'px-3',
            'py-2',
            'bg-black/20',
            'backdrop-blur-sm',
            'rounded-full'
          )}
          role="tablist"
          aria-label="Section indicators"
        >
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => navigateToSection(index)}
              disabled={section.disabled || isTransitioning}
              className={cn(
                'indicator-dot',
                'w-2',
                'h-2',
                'rounded-full',
                'transition-all',
                'duration-200',
                'focus:outline-none',
                'focus:ring-2',
                'focus:ring-white/50',
                'focus:ring-offset-1',
                'focus:ring-offset-black/20',
                // Active state
                index === currentSectionIndex && [
                  'bg-white',
                  'scale-125',
                  'shadow-sm',
                ],
                // Inactive state
                index !== currentSectionIndex && [
                  'bg-white/50',
                  'hover:bg-white/75',
                  'active:scale-90',
                ],
                // Disabled state
                section.disabled && [
                  'opacity-30',
                  'cursor-not-allowed',
                  'hover:bg-white/50',
                ]
              )}
              role="tab"
              aria-selected={index === currentSectionIndex}
              aria-label={`Go to ${section.title}`}
              aria-disabled={section.disabled}
            />
          ))}
        </div>
      )}

      {/* Sections container */}
      <TouchInteraction
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        swipeThreshold={50}
        disabled={isTransitioning}
        className="w-full h-full"
      >
        <div
          ref={sectionsRef}
          className={cn(
            'sections-container',
            'flex',
            'w-full',
            'h-full',
            'transition-transform',
            'ease-out',
            isTransitioning && 'duration-300'
          )}
          style={{
            transform: `translateX(-${currentSectionIndex * 100}%)`,
            transitionDuration: isTransitioning
              ? `${animationDuration}ms`
              : '0ms',
          }}
        >
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={cn(
                'section',
                'flex-shrink-0',
                'w-full',
                'h-full',
                'overflow-auto',
                // Optimize rendering for non-visible sections
                Math.abs(index - currentSectionIndex) > 1 && 'opacity-0'
              )}
              role="tabpanel"
              aria-labelledby={`section-${section.id}-tab`}
              aria-hidden={index !== currentSectionIndex}
              tabIndex={index === currentSectionIndex ? 0 : -1}
            >
              {/* Only render content for current and adjacent sections for performance */}
              {Math.abs(index - currentSectionIndex) <= 1 && section.content}
            </div>
          ))}
        </div>
      </TouchInteraction>

      {/* Navigation instructions for screen readers */}
      <div className="sr-only" aria-live="polite">
        {enableKeyboardNavigation && (
          <>
            Use arrow keys to navigate between sections. Press Home to go to
            first section, End to go to last section.
          </>
        )}
        Current section: {currentSection?.title} ({currentSectionIndex + 1} of{' '}
        {sections.length})
      </div>

      {/* Section title overlay for accessibility */}
      <div
        className={cn(
          'section-title-overlay',
          'absolute',
          'bottom-4',
          'left-4',
          'right-4',
          'px-3',
          'py-2',
          'bg-black/20',
          'backdrop-blur-sm',
          'rounded-lg',
          'text-white',
          'text-sm',
          'font-medium',
          'text-center',
          'transition-opacity',
          'duration-200',
          // Only show during transitions or when explicitly needed
          !isTransitioning && 'opacity-0',
          'pointer-events-none'
        )}
        aria-hidden="true"
      >
        {currentSection?.title}
      </div>
    </div>
  )
}

// Hook for managing swipe navigation state
export function useSwipeNavigation(
  sections: SwipeNavigationSection[],
  initialSection?: string
) {
  const [currentSectionId, setCurrentSectionId] = useState(
    initialSection || sections[0]?.id || ''
  )
  const [history, setHistory] = useState<string[]>([currentSectionId])

  const navigateToSection = useCallback(
    (sectionId: string) => {
      if (sectionId !== currentSectionId) {
        setCurrentSectionId(sectionId)
        setHistory(prev => [...prev.slice(-9), sectionId]) // Keep last 10 entries
      }
    },
    [currentSectionId]
  )

  const goBack = useCallback(() => {
    if (history.length > 1) {
      const previousSection = history[history.length - 2]
      setCurrentSectionId(previousSection)
      setHistory(prev => prev.slice(0, -1))
    }
  }, [history])

  const canGoBack = history.length > 1

  return {
    currentSectionId,
    navigateToSection,
    goBack,
    canGoBack,
    history,
  }
}

// Utility function to create sections from dashboard pages
export function createDashboardSections(
  pages: Array<{
    id: string
    title: string
    component: React.ComponentType
    disabled?: boolean
  }>
): SwipeNavigationSection[] {
  return pages.map(page => ({
    id: page.id,
    title: page.title,
    disabled: page.disabled,
    content: <page.component />,
  }))
}
