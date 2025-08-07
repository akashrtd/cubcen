import React from 'react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '../mobile/touch-interactions'
import type { DashboardGridProps } from '@/types/dashboard'

export function DashboardGrid({
  children,
  columns = 12,
  gap,
  className,
  responsive = {
    mobile: 1,
    tablet: 6,
    desktop: 12,
  },
  autoFlow = 'row',
  alignItems = 'stretch',
  justifyItems = 'stretch',
}: DashboardGridProps) {
  const isMobile = useIsMobile()

  // Use CSS custom properties for responsive behavior
  const gridStyle = {
    '--dashboard-grid-columns-mobile': responsive.mobile.toString(),
    '--dashboard-grid-columns-tablet': responsive.tablet.toString(),
    '--dashboard-grid-columns-desktop': responsive.desktop.toString(),
    '--dashboard-grid-gap': gap ? `${gap}px` : 'var(--dashboard-grid-gap)',
    gridAutoFlow: autoFlow,
    alignItems,
    justifyItems,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        'dashboard-grid',
        'grid',
        // Responsive grid columns using CSS custom properties
        '[grid-template-columns:repeat(var(--dashboard-grid-columns-mobile),1fr)]',
        'md:[grid-template-columns:repeat(var(--dashboard-grid-columns-tablet),1fr)]',
        'lg:[grid-template-columns:repeat(var(--dashboard-grid-columns-desktop),1fr)]',
        // Mobile-specific optimizations
        isMobile && [
          'px-4', // Add horizontal padding on mobile
          'gap-4', // Reduce gap on mobile
          'pb-20', // Add bottom padding for mobile navigation
        ],
        className
      )}
      style={gridStyle}
    >
      {children}
    </div>
  )
}
