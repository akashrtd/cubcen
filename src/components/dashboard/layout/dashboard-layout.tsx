'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { DashboardLayoutProps } from '@/types/dashboard'

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
  ...props
}: DashboardLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < breakpoints.mobile)
      setIsTablet(width >= breakpoints.mobile && width < breakpoints.desktop)
      
      // Auto-collapse sidebar on mobile
      if (width < breakpoints.mobile) {
        setSidebarCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoints])

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

  return (
    <div
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
                'focus:ring-offset-2'
              )}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!sidebarCollapsed}
            >
              <svg
                className={cn(
                  'w-5 h-5',
                  'text-dashboard-text-secondary',
                  'transition-transform',
                  'duration-200',
                  sidebarCollapsed && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
          className={cn(
            'dashboard-sidebar',
            'border-r',
            'border-dashboard-border',
            'bg-dashboard-surface',
            'overflow-y-auto',
            'transition-all',
            'duration-300',
            'ease-in-out',
            sidebarCollapsed && 'w-0 overflow-hidden'
          )}
          style={{ gridArea: gridAreas.sidebar }}
          role="navigation"
          aria-label="Main navigation"
          aria-hidden={sidebarCollapsed}
        >
          <div className={cn(
            'p-4',
            sidebarCollapsed && 'opacity-0'
          )}>
            {sidebar}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main
        className={cn(
          'dashboard-main',
          'overflow-auto',
          'bg-dashboard-background',
          'min-h-0' // Prevents grid item from growing beyond container
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
    </div>
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