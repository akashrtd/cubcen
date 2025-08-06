// Dashboard Layout Components
export { DashboardLayout, DashboardHeader, DashboardFooter } from './layout/dashboard-layout'
export { DashboardSidebar } from './layout/dashboard-sidebar'
export { MobileNavigation, defaultMobileNavItems, useMobileNavigation } from './layout/mobile-navigation'
export { useSwipeNavigation, SwipeIndicator, defaultSwipeRoutes } from './layout/swipe-navigation'

// Dashboard Card Components
export { 
  DashboardCard, 
  MetricCard, 
  ChartCard, 
  DataTableCard 
} from './cards'
export type { 
  DataTableColumn, 
  DataTableRow, 
  DataTableCardProps 
} from './cards'

// Dashboard Grid Components
export { DashboardGrid, GridItem } from './grid'
export { 
  calculateOptimalCardSpan,
  autoArrangeCards,
  generateGridCustomProperties,
  validateGridConfig 
} from './grid'
export type { ResponsiveValue, GridBreakpoints } from './grid'

// Dashboard Chart Components
export { ChartWrapper } from './charts/chart-wrapper'

// Dashboard Theming Components
export { 
  DashboardThemeProvider, 
  useDashboardTheme, 
  useTheme,
  ColorPalette,
  TypographyScale,
  ContrastValidator,
  ThemeCustomizer
} from './theming'

// Dashboard Examples
export { DashboardLayoutExample } from './examples/dashboard-layout-example'

// Dashboard Types
export type * from '@/types/dashboard'