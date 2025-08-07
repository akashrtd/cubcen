/**
 * Grid utility functions for dashboard layout calculations
 */

export interface ResponsiveValue<T> {
  mobile?: T
  tablet?: T
  desktop?: T
}

export interface GridBreakpoints {
  mobile: number
  tablet: number
  desktop: number
}

export const DEFAULT_BREAKPOINTS: GridBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
}

export const DEFAULT_GRID_COLUMNS: GridBreakpoints = {
  mobile: 1,
  tablet: 6,
  desktop: 12,
}

/**
 * Calculate the appropriate column span for a given breakpoint
 */
export function calculateColSpan(
  colSpan: number | ResponsiveValue<number>,
  breakpoint: 'mobile' | 'tablet' | 'desktop',
  maxColumns: number = 12
): number {
  if (typeof colSpan === 'number') {
    return Math.min(colSpan, maxColumns)
  }

  const value =
    colSpan[breakpoint] ||
    colSpan.desktop ||
    colSpan.tablet ||
    colSpan.mobile ||
    1
  return Math.min(value, maxColumns)
}

/**
 * Calculate the appropriate row span for a given breakpoint
 */
export function calculateRowSpan(
  rowSpan: number | ResponsiveValue<number>,
  breakpoint: 'mobile' | 'tablet' | 'desktop',
  maxRows: number = 6
): number {
  if (typeof rowSpan === 'number') {
    return Math.min(rowSpan, maxRows)
  }

  const value =
    rowSpan[breakpoint] ||
    rowSpan.desktop ||
    rowSpan.tablet ||
    rowSpan.mobile ||
    1
  return Math.min(value, maxRows)
}

/**
 * Calculate the appropriate order for a given breakpoint
 */
export function calculateOrder(
  order: number | ResponsiveValue<number> | undefined,
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): number | undefined {
  if (!order) return undefined

  if (typeof order === 'number') {
    return order
  }

  return order[breakpoint] || order.desktop || order.tablet || order.mobile
}

/**
 * Generate Tailwind CSS classes for responsive column spans
 */
export function generateColSpanClasses(
  colSpan: number | ResponsiveValue<number>
): string {
  if (typeof colSpan === 'number') {
    const span = Math.min(colSpan, 12)
    return `col-span-${span}`
  }

  const classes: string[] = []

  if (colSpan.mobile) {
    const span = Math.min(colSpan.mobile, 1)
    classes.push(`col-span-${span}`)
  }

  if (colSpan.tablet) {
    const span = Math.min(colSpan.tablet, 6)
    classes.push(`md:col-span-${span}`)
  }

  if (colSpan.desktop) {
    const span = Math.min(colSpan.desktop, 12)
    classes.push(`lg:col-span-${span}`)
  }

  return classes.join(' ')
}

/**
 * Generate Tailwind CSS classes for responsive row spans
 */
export function generateRowSpanClasses(
  rowSpan: number | ResponsiveValue<number>
): string {
  if (typeof rowSpan === 'number') {
    const span = Math.min(rowSpan, 6)
    return span > 1 ? `row-span-${span}` : ''
  }

  const classes: string[] = []

  if (rowSpan.mobile && rowSpan.mobile > 1) {
    const span = Math.min(rowSpan.mobile, 6)
    classes.push(`row-span-${span}`)
  }

  if (rowSpan.tablet && rowSpan.tablet > 1) {
    const span = Math.min(rowSpan.tablet, 6)
    classes.push(`md:row-span-${span}`)
  }

  if (rowSpan.desktop && rowSpan.desktop > 1) {
    const span = Math.min(rowSpan.desktop, 6)
    classes.push(`lg:row-span-${span}`)
  }

  return classes.join(' ')
}

/**
 * Generate Tailwind CSS classes for responsive order
 */
export function generateOrderClasses(
  order: number | ResponsiveValue<number> | undefined
): string {
  if (!order) return ''

  if (typeof order === 'number') {
    const orderValue = Math.min(order, 12)
    return `order-${orderValue}`
  }

  const classes: string[] = []

  if (order.mobile) {
    const orderValue = Math.min(order.mobile, 12)
    classes.push(`order-${orderValue}`)
  }

  if (order.tablet) {
    const orderValue = Math.min(order.tablet, 12)
    classes.push(`md:order-${orderValue}`)
  }

  if (order.desktop) {
    const orderValue = Math.min(order.desktop, 12)
    classes.push(`lg:order-${orderValue}`)
  }

  return classes.join(' ')
}

/**
 * Calculate optimal card distribution for responsive layouts
 * Ensures 3 cards per row on desktop, 2 on tablet, 1 on mobile
 */
export function calculateOptimalCardSpan(
  totalCards: number,
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): number {
  const cardsPerRow = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  }

  const maxColumns = {
    mobile: 1,
    tablet: 6,
    desktop: 12,
  }

  const cards = cardsPerRow[breakpoint]
  const columns = maxColumns[breakpoint]

  return Math.floor(columns / cards)
}

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(
  width: number
): 'mobile' | 'tablet' | 'desktop' {
  if (width < DEFAULT_BREAKPOINTS.mobile) {
    return 'mobile'
  } else if (width < DEFAULT_BREAKPOINTS.desktop) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * Check if a value is a responsive value object
 */
export function isResponsiveValue<T>(
  value: T | ResponsiveValue<T>
): value is ResponsiveValue<T> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Resolve a responsive value for a specific breakpoint
 */
export function resolveResponsiveValue<T>(
  value: T | ResponsiveValue<T>,
  breakpoint: 'mobile' | 'tablet' | 'desktop',
  fallback: T
): T {
  if (!isResponsiveValue(value)) {
    return value
  }

  return (
    value[breakpoint] ||
    value.desktop ||
    value.tablet ||
    value.mobile ||
    fallback
  )
}

/**
 * Generate CSS custom properties for responsive grid
 */
export function generateGridCustomProperties(
  responsive: GridBreakpoints
): Record<string, string> {
  return {
    '--dashboard-grid-columns-mobile': responsive.mobile.toString(),
    '--dashboard-grid-columns-tablet': responsive.tablet.toString(),
    '--dashboard-grid-columns-desktop': responsive.desktop.toString(),
  }
}

/**
 * Validate grid configuration
 */
export function validateGridConfig(config: {
  columns?: number
  responsive?: GridBreakpoints
}): boolean {
  const { columns = 12, responsive = DEFAULT_GRID_COLUMNS } = config

  // Check if columns is within valid range
  if (columns < 1 || columns > 24) {
    console.warn('Grid columns should be between 1 and 24')
    return false
  }

  // Check if responsive values are valid
  if (responsive.mobile < 1 || responsive.mobile > 12) {
    console.warn('Mobile grid columns should be between 1 and 12')
    return false
  }

  if (responsive.tablet < 1 || responsive.tablet > 12) {
    console.warn('Tablet grid columns should be between 1 and 12')
    return false
  }

  if (responsive.desktop < 1 || responsive.desktop > 24) {
    console.warn('Desktop grid columns should be between 1 and 24')
    return false
  }

  return true
}

/**
 * Auto-arrange cards in optimal grid layout
 */
export function autoArrangeCards(
  cardCount: number,
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): Array<{
  colSpan: number
  priority?: 'critical' | 'high' | 'medium' | 'low'
}> {
  const optimalSpan = calculateOptimalCardSpan(cardCount, breakpoint)

  return Array.from({ length: cardCount }, (_, index) => ({
    colSpan: optimalSpan,
    priority: index === 0 ? 'critical' : index < 3 ? 'high' : 'medium',
  }))
}
