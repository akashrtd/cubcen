import React from 'react'
import { cn } from '@/lib/utils'

interface DashboardGridProps {
  children: React.ReactNode
  columns?: number
  gap?: number
  className?: string
  responsive?: {
    mobile: number
    tablet: number
    desktop: number
  }
  autoFlow?: 'row' | 'column' | 'dense'
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
  justifyItems?: 'start' | 'center' | 'end' | 'stretch'
}

export function DashboardGrid({
  children,
  columns = 12,
  gap = 24,
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
  return (
    <div
      className={cn('dashboard-grid', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
        gridAutoFlow: autoFlow,
        alignItems,
        justifyItems,
      }}
    >
      {children}
    </div>
  )
}

interface GridItemProps {
  children: React.ReactNode
  colSpan?: number | { mobile?: number; tablet?: number; desktop?: number }
  rowSpan?: number | { mobile?: number; tablet?: number; desktop?: number }
  order?: number | { mobile?: number; tablet?: number; desktop?: number }
  className?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

export function GridItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  order,
  className,
  priority = 'medium',
}: GridItemProps) {
  const getSpanValue = (span: number | { mobile?: number; tablet?: number; desktop?: number }) => {
    if (typeof span === 'number') return span
    return span.desktop || span.tablet || span.mobile || 1
  }

  const getOrderValue = (orderValue?: number | { mobile?: number; tablet?: number; desktop?: number }) => {
    if (!orderValue) return undefined
    if (typeof orderValue === 'number') return orderValue
    return orderValue.desktop || orderValue.tablet || orderValue.mobile
  }

  const priorityClasses = {
    low: 'dashboard-grid-item-priority-low',
    medium: 'dashboard-grid-item-priority-medium',
    high: 'dashboard-grid-item-priority-high',
    critical: 'dashboard-grid-item-priority-critical',
  }

  return (
    <div
      className={cn('dashboard-grid-item', priorityClasses[priority], className)}
      style={{
        gridColumn: `span ${getSpanValue(colSpan)}`,
        gridRow: `span ${getSpanValue(rowSpan)}`,
        order: getOrderValue(order),
      }}
    >
      {children}
    </div>
  )
}