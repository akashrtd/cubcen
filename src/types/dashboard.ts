import { ComponentProps } from 'react'

// Layout Types
export interface GridConfiguration {
  areas: {
    desktop: string
    tablet: string
    mobile: string
  }
  columns: {
    desktop: string
    tablet: string
    mobile: string
  }
  rows: {
    desktop: string
    tablet: string
    mobile: string
  }
}

export interface DashboardLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  gridAreas?: {
    header: string
    sidebar: string
    main: string
    footer: string
  }
  breakpoints?: {
    mobile: number
    tablet: number
    desktop: number
  }
}

// Card Types
export interface DashboardCardProps {
  title?: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  metric?: {
    value: string | number
    unit?: string
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
  }
  children?: React.ReactNode
  actions?: React.ReactNode
  loading?: boolean
  error?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  interactive?: boolean
  onClick?: () => void
  onFilter?: (filter: FilterValue) => void
}

export interface MetricCardProps extends DashboardCardProps {
  metrics: Array<{
    label: string
    value: string | number
    unit?: string
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    color?: string
  }>
  layout?: 'horizontal' | 'vertical' | 'grid'
}

export interface ChartCardProps extends DashboardCardProps {
  chartType: 'line' | 'bar' | 'pie' | 'heatmap' | 'area' | 'scatter'
  data: ChartData
  chartConfig?: ChartConfiguration
  exportable?: boolean
  filterable?: boolean
}

// Chart Types
export type ChartType = 'line' | 'bar' | 'pie' | 'heatmap' | 'area' | 'scatter'

export interface ChartData {
  datasets: ChartDataset[]
  labels?: string[]
  metadata?: Record<string, any>
}

export interface ChartDataset {
  label: string
  data: ChartDataPoint[]
  color?: string
  type?: ChartType
  options?: Record<string, any>
}

export interface ChartDataPoint {
  x?: string | number
  y?: string | number
  value?: string | number
  label?: string
  color?: string
  metadata?: Record<string, any>
}

export interface ChartConfiguration {
  colors?: {
    primary: string
    secondary: string
    accent: string
    success: string
    warning: string
    error: string
  }
  legend?: {
    show: boolean
    position: 'top' | 'bottom' | 'left' | 'right'
    align: 'start' | 'center' | 'end'
  }
  tooltip?: {
    show: boolean
    format?: (value: any) => string
    customContent?: React.ComponentType<TooltipProps>
  }
  axes?: {
    x?: AxisConfiguration
    y?: AxisConfiguration
  }
  animations?: {
    enabled: boolean
    duration: number
    easing: string
  }
  responsive?: {
    breakpoints: Record<string, Partial<ChartConfiguration>>
  }
}

export interface AxisConfiguration {
  show: boolean
  label?: string
  format?: (value: any) => string
  domain?: [number, number]
}

export interface LegendItem {
  label: string
  color: string
  visible: boolean
}

export interface TooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

// Grid Types
export interface DashboardGridProps {
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

export interface GridItemProps {
  children: React.ReactNode
  colSpan?: number | { mobile?: number; tablet?: number; desktop?: number }
  rowSpan?: number | { mobile?: number; tablet?: number; desktop?: number }
  order?: number | { mobile?: number; tablet?: number; desktop?: number }
  className?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

// Theme Types
export interface DashboardTheme {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      disabled: string
    }
    status: {
      success: string
      warning: string
      error: string
      info: string
    }
    chart: {
      palette: string[]
      gradients: Record<string, string>
    }
  }
  typography: {
    fontFamily: {
      sans: string[]
      mono: string[]
    }
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
    lineHeight: {
      tight: number
      normal: number
      relaxed: number
    }
  }
  spacing: {
    grid: {
      gap: string
      padding: string
      margin: string
    }
    card: {
      padding: string
      margin: string
    }
  }
  breakpoints: {
    mobile: string
    tablet: string
    desktop: string
    wide: string
  }
  animations: {
    duration: {
      fast: string
      normal: string
      slow: string
    }
    easing: {
      ease: string
      easeIn: string
      easeOut: string
      easeInOut: string
    }
  }
}

export interface ThemeProviderProps {
  children: React.ReactNode
  theme?: Partial<DashboardTheme>
  defaultTheme?: 'light' | 'dark' | 'system'
  storageKey?: string
  enableColorSchemeDetection?: boolean
  validateContrast?: boolean
}

// Filter Types
export interface FilterValue {
  type: 'string' | 'number' | 'date' | 'boolean' | 'array'
  value: any
  operator?: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between'
}

export interface FilterState {
  dateRange?: {
    start: Date
    end: Date
  }
  categories?: string[]
  status?: string[]
  priority?: string[]
  platforms?: string[]
  agents?: string[]
  customFilters?: Record<string, FilterValue>
}

export interface FilterConfiguration {
  enabled: boolean
  persistent: boolean
  shareable: boolean
  presets?: FilterPreset[]
}

export interface FilterPreset {
  id: string
  name: string
  description?: string
  filters: FilterState
  isDefault?: boolean
}

// Performance Types
export interface PerformanceMetrics {
  renderTime: number
  chartLoadTime: number
  dataFetchTime: number
  interactionLatency: number
  memoryUsage: number
  bundleSize: number
}

export interface PerformanceThresholds {
  renderTime: number
  chartLoadTime: number
  dataFetchTime: number
  interactionLatency: number
}

// Accessibility Types
export interface AnnouncementProps {
  message: string
  priority: 'polite' | 'assertive'
  delay?: number
}

export interface KeyboardNavigationProps {
  trapFocus?: boolean
  restoreFocus?: boolean
  initialFocus?: string
  skipLinks?: Array<{
    href: string
    label: string
  }>
}

export interface FocusManagementProps {
  autoFocus?: boolean
  focusOnMount?: boolean
  focusOnUpdate?: boolean
  focusSelector?: string
}