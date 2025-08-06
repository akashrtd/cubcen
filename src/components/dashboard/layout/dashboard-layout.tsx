'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { DashboardLayoutProps } from '@/types/dashboard'
import { MobileNavigation, defaultMobileNavItems, useMobileNavigation } from './mobile-navigation'
import { SwipeNavigation, useSwipeNavigation } from './swipe-navigation'
import { useIsMobile } from '../mobile/touch-interactions'
import { KeyboardNavigation, SkipLinks } from '../accessibility/keyboard-navigation'
import { FocusManagement } from '../accessibility/focus-management'
import { ScreenReaderAnnouncer } from '../accessibility/screen-reader-announcer'

const defaultGridAreas = {
  header: 'header',
  sidebar: 'sidebar',
  main: 'main',
  footer: 'footer'
}

const defaultBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
}

export function DashboardLayout({
  children,
  header,
  sidebar,
  footer,
  className,
  gridAreas = defaultGridAreas,
  breakpoints = defaultBreakpoints,
  mobileNavItems = defaultMobileNavItems,
  showMobileNav = true,
  enableSwipeNavigation = true,
  ...props
}: DashboardLayoutProps) {
  const isMobileHook = useIsMobile()
  const [isTablet, setIsTablet] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { isVisible: isMobileNavVisible } = useMobileNavigation()
  
  // Use the hook for mobile detection
  const isMobile = isMobileHook

  // Handle responsive breakpoints with debouncing
  const handleResize = useCallback(() => {
    const width = window.innerWidth
    const newIsTablet = width >= breakpoints.mobile && width < breakpoints.desktop
    
    setIsTablet(newIsTablet)
    
    // Auto-collapse sidebar on mobile, but preserve user preference on desktop
    if (isMobile && !sidebarCollapsed) {
      setSidebarCollapsed(true)
    } else if (!isMobile && !isInitialized) {
      // Restore sidebar state from localStorage on desktop
      const savedState = localStorage.getItem('dashboard-sidebar-collapsed')
      if (savedState !== null) {
        setSidebarCollapsed(JSON.parse(savedState))
      }
    }
    
    if (!isInitialized) {
      setIsInitialized(true)
    }
  }, [breakpoints, sidebarCollapsed, isInitialized, isMobile])

  useEffect(() => {
    // Initial setup
    handleResize()
    
    // Debounced resize handler
    let timeoutId: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 150)
    }

    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [handleResize])

  // Persist sidebar state to localStorage
  useEffect(() => {
    if (isInitialized && !isMobile) {
      localStorage.setItem('dashboard-sidebar-collapsed', JSON.stringify(sidebarCollapsed))
    }
  }, [sidebarCollapsed, isMobile, isInitialized])

  // Generate CSS Grid template areas based on screen size and sidebar state
  const getGridTemplateAreas = () => {
    if (isMobile) {
      return `
        "${gridAreas.header}"
        "${gridAreas.main}"
        ${footer ? `"${gridAreas.footer}"` : ''}
      `.trim()
    }

    if (sidebarCollapsed || !sidebar) {
      return `
        "${gridAreas.header} ${gridAreas.header}"
        "${gridAreas.main} ${gridAreas.main}"
        ${footer ? `"${gridAreas.footer} ${gridAreas.footer}"` : ''}
      `.trim()
    }

    return `
      "${gridAreas.header} ${gridAreas.header}"
      "${gridAreas.sidebar} ${gridAreas.main}"
      ${footer ? `"${gridAreas.footer} ${gridAreas.footer}"` : ''}
    `.trim()
  }

  // Generate CSS Grid template columns
  const getGridTemplateColumns = () => {
    if (isMobile) {
      return '1fr'
    }

    if (sidebarCollapsed || !sidebar) {
      return '1fr'
    }

    return isTablet ? '240px 1fr' : '280px 1fr'
  }

  // Generate CSS Grid template rows
  const getGridTemplateRows = () => {
    const headerHeight = '64px'
    const footerHeight = footer ? '48px' : '0px'
    
    if (footer) {
      return `${headerHeight} 1fr ${footerHeight}`
    }
    
    return `${headerHeight} 1fr`
  }

  const gridStyles = {
    gridTemplateAreas: getGridTemplateAreas(),
    gridTemplateColumns: getGridTemplateColumns(),
    gridTemplateRows: getGridTemplateRows(),
  }

  // Default skip links for accessibility
  const defaultSkipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#dashboard-sidebar', label: 'Skip to navigation' },
    ...(footer ? [{ href: '#dashboard-footer', label: 'Skip to footer' }] : [])
  ]

  return (
    <KeyboardNavigation
      skipLinks={defaultSkipLinks}
      className={cn(
        'dashboard-layout',
        'min-h-screen',
        'grid',
        'transition-all',
        'duration-300',
        'ease-in-out',
        className
      )}
      style={gridStyles}
      {...props}
    >
      {/* Header */}
      {header && (
        <header
          id="dashboard-header"
          className={cn(
            'dashboard-header',
            'flex',
            'items-center',
            'justify-between',
            'px-4',
            'lg:px-6',
            'border-b',
            'border-dashboard-border',
            'bg-dashboard-surface',
            'z-10'
          )}
          style={{ gridArea: gridAreas.header }}
          role="banner"
        >
          {header}
          
          {/* Sidebar Toggle Button */}
          {sidebar && !isMobile && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                'p-2',
                'rounded-md',
                'hover:bg-dashboard-background',
                'transition-colors',
                'duration-200',
                'focus:outline-none',
                'focus:ring-2',
                'focus:ring-dashboard-primary',
                'focus:ring-offset-2',
                'ml-auto' // Push to right side of header
              )}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!sidebarCollapsed}
              aria-controls="dashboard-sidebar"
            >
              <svg
                className={cn(
                  'w-5 h-5',
                  'text-dashboard-text-secondary',
                  'transition-transform',
                  'duration-300',
                  'ease-in-out',
                  sidebarCollapsed && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </header>
      )}

      {/* Sidebar */}
      {sidebar && !isMobile && (
        <aside
          id="dashboard-sidebar"
          className={cn(
            'dashboard-sidebar',
            'border-r',
            'border-dashboard-border',
            'bg-dashboard-surface',
            'overflow-y-auto',
            'transition-all',
            'duration-300',
            'ease-in-out',
            'relative',
            sidebarCollapsed && 'w-0 overflow-hidden'
          )}
          style={{ gridArea: gridAreas.sidebar }}
          role="navigation"
          aria-label="Main navigation"
          aria-hidden={sidebarCollapsed}
        >
          <div className={cn(
            'p-4',
            'transition-opacity',
            'duration-300',
            'ease-in-out',
            sidebarCollapsed && 'opacity-0'
          )}>
            {sidebar}
          </div>
          
          {/* Sidebar resize handle for better UX */}
          <div
            className={cn(
              'absolute',
              'top-0',
              'right-0',
              'w-1',
              'h-full',
              'bg-transparent',
              'hover:bg-dashboard-primary',
              'transition-colors',
              'duration-200',
              'cursor-col-resize',
              sidebarCollapsed && 'hidden'
            )}
            aria-hidden="true"
          />
        </aside>
      )}

      {/* Main Content */}
      <main
        className={cn(
          'dashboard-main',
          'overflow-auto',
          'bg-dashboard-background',
          'min-h-0', // Prevents grid item from growing beyond container
          // Add bottom padding on mobile to account for mobile navigation
          isMobile && showMobileNav && 'pb-20'
        )}
        style={{ gridArea: gridAreas.main }}
        role="main"
        id="main-content"
      >
        {children}
      </main>

      {/* Footer */}
      {footer && (
        <footer
          id="dashboard-footer"
          className={cn(
            'dashboard-footer',
            'flex',
            'items-center',
            'justify-between',
            'px-4',
            'lg:px-6',
            'border-t',
            'border-dashboard-border',
            'bg-dashboard-surface',
            'text-sm',
            'text-dashboard-text-secondary'
          )}
          style={{ gridArea: gridAreas.footer }}
          role="contentinfo"
        >
          {footer}
        </footer>
      )}

      {/* Mobile Navigation */}
      {isMobile && showMobileNav && (
        <div
          className={cn(
            'mobile-nav-container',
            'transition-transform',
            'duration-300',
            'ease-in-out',
            !isMobileNavVisible && 'translate-y-full'
          )}
        >
          <MobileNavigation
            items={mobileNavItems}
            onItemClick={(item) => {
              // Handle mobile navigation item clicks
              console.log('Mobile nav item clicked:', item)
            }}
          />
        </div>
      )}



      {/* Screen Reader Announcer */}
      <ScreenReaderAnnouncer />
    </KeyboardNavigation>
  )
}

// Export additional layout components for composition
export function DashboardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn('flex items-center justify-between w-full', className)} {...props}>
      {children}
    </div>
  )
}

export function DashboardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn('flex items-center justify-between w-full', className)} {...props}>
      {children}
    </div>
  )
}