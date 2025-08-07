'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { GridItemProps } from '@/types/dashboard'

export function GridItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  order,
  className,
  priority = 'medium',
}: GridItemProps) {
  const priorityClasses = {
    low: 'dashboard-grid-item-priority-low',
    medium: 'dashboard-grid-item-priority-medium',
    high: 'dashboard-grid-item-priority-high',
    critical: 'dashboard-grid-item-priority-critical',
  }

  // Generate responsive classes for column span
  const getColSpanClasses = (
    span: number | { mobile?: number; tablet?: number; desktop?: number }
  ) => {
    if (typeof span === 'number') {
      return `col-span-${Math.min(span, 12)}`
    }

    const classes = []
    if (span.mobile) classes.push(`col-span-${Math.min(span.mobile, 1)}`)
    if (span.tablet) classes.push(`md:col-span-${Math.min(span.tablet, 6)}`)
    if (span.desktop) classes.push(`lg:col-span-${Math.min(span.desktop, 12)}`)

    return classes.join(' ')
  }

  // Generate responsive classes for row span
  const getRowSpanClasses = (
    span: number | { mobile?: number; tablet?: number; desktop?: number }
  ) => {
    if (typeof span === 'number') {
      return span > 1 ? `row-span-${Math.min(span, 6)}` : ''
    }

    const classes = []
    if (span.mobile && span.mobile > 1)
      classes.push(`row-span-${Math.min(span.mobile, 6)}`)
    if (span.tablet && span.tablet > 1)
      classes.push(`md:row-span-${Math.min(span.tablet, 6)}`)
    if (span.desktop && span.desktop > 1)
      classes.push(`lg:row-span-${Math.min(span.desktop, 6)}`)

    return classes.join(' ')
  }

  // Generate responsive classes for order
  const getOrderClasses = (
    orderValue?: number | { mobile?: number; tablet?: number; desktop?: number }
  ) => {
    if (!orderValue) return ''

    if (typeof orderValue === 'number') {
      return `order-${Math.min(orderValue, 12)}`
    }

    const classes = []
    if (orderValue.mobile)
      classes.push(`order-${Math.min(orderValue.mobile, 12)}`)
    if (orderValue.tablet)
      classes.push(`md:order-${Math.min(orderValue.tablet, 12)}`)
    if (orderValue.desktop)
      classes.push(`lg:order-${Math.min(orderValue.desktop, 12)}`)

    return classes.join(' ')
  }

  return (
    <div
      className={cn(
        'dashboard-grid-item',
        priorityClasses[priority],
        getColSpanClasses(colSpan),
        getRowSpanClasses(rowSpan),
        getOrderClasses(order),
        className
      )}
    >
      {children}
    </div>
  )
}

// Export the interface for external use
export type { GridItemProps } from '@/types/dashboard'
