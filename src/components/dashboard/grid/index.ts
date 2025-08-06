/**
 * Dashboard Grid System
 * 
 * A comprehensive 12-column responsive grid system for dashboard layouts.
 * Supports responsive breakpoints, priority-based ordering, and flexible
 * column/row spanning.
 */

export { DashboardGrid } from './dashboard-grid'
export { GridItem } from './grid-item'
export type { GridItemProps } from '@/types/dashboard'
export {
  calculateColSpan,
  calculateRowSpan,
  calculateOrder,
  generateColSpanClasses,
  generateRowSpanClasses,
  generateOrderClasses,
  calculateOptimalCardSpan,
  getCurrentBreakpoint,
  isResponsiveValue,
  resolveResponsiveValue,
  generateGridCustomProperties,
  validateGridConfig,
  autoArrangeCards,
  DEFAULT_BREAKPOINTS,
  DEFAULT_GRID_COLUMNS,
} from './grid-utils'
export type { ResponsiveValue, GridBreakpoints } from './grid-utils'