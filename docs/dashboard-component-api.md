# Dashboard Component API Documentation

## Overview

The Cubcen Dashboard UI system provides a comprehensive, modular framework for building responsive, accessible dashboard interfaces. This documentation covers all component APIs, theming system, and customization options.

## Table of Contents

- [Layout Components](#layout-components)
- [Card Components](#card-components)
- [Chart Components](#chart-components)
- [Grid System](#grid-system)
- [Theming System](#theming-system)
- [Accessibility Features](#accessibility-features)
- [Performance Optimizations](#performance-optimizations)
- [Migration Guide](#migration-guide)

## Layout Components

### DashboardLayout

The main layout component that provides a CSS Grid-based responsive layout with header, sidebar, main content, and footer regions.

#### Props

```typescript
interface DashboardLayoutProps {
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
  mobileNavItems?: MobileNavigationItem[]
  showMobileNav?: boolean
  enableSwipeNavigation?: boolean
  swipeRoutes?: string[]
}
```

#### Usage Example

````tsx
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout'

function MyDashboard() {
  return (
    <DashboardLayout
      header={<DashboardHeader />}
      sidebar={<DashboardSidebar />}
      footer={<DashboardFooter />}
      showMobileNav={true}
      enableSwipeNavigation={true}
    >
      <DashboardGrid>
        {/* Dashboard content */}
      </DashboardGrid>
    </DashboardLayout>
  )
}
```#### Fea
tures

- **Responsive Grid Layout**: Automatically adapts to mobile, tablet, and desktop breakpoints
- **Collapsible Sidebar**: Sidebar can be collapsed/expanded with state persistence
- **Mobile Navigation**: Bottom navigation bar for mobile devices
- **Swipe Navigation**: Touch gesture support for mobile navigation
- **Accessibility**: Full keyboard navigation and screen reader support
- **Theme Integration**: Seamless integration with the dashboard theming system

#### Responsive Behavior

- **Desktop (≥1280px)**: Full grid layout with sidebar
- **Tablet (768px-1279px)**: Collapsible sidebar with reduced width
- **Mobile (<768px)**: Single column layout with bottom navigation

### DashboardHeader

Utility component for consistent header layout.

```typescript
interface DashboardHeaderProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
}
````

### DashboardFooter

Utility component for consistent footer layout.

```typescript
interface DashboardFooterProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
}
```

## Card Components

### DashboardCard

The base card component that provides consistent styling, loading states, error handling, and accessibility features.

#### Props

```typescript
interface DashboardCardProps {
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
```

#### Usage Example

````tsx
import { DashboardCard } from '@/components/dashboard/cards/dashboard-card'
import { Users } from 'lucide-react'

function UserMetricCard() {
  return (
    <DashboardCard
      title="Active Users"
      subtitle="Last 24 hours"
      icon={Users}
      metric={{
        value: 1234,
        unit: 'users',
        trend: 'up',
        trendValue: '+12%'
      }}
      size="md"
      priority="high"
      interactive={true}
      onClick={() => console.log('Card clicked')}
    />
  )
}
```##
## Card Sizes

- **sm**: Compact card with minimal padding (1rem)
- **md**: Standard card with normal padding (1.5rem) - Default
- **lg**: Large card with increased padding (2rem)
- **xl**: Extra large card with maximum padding (2.5rem)

#### Priority Levels

- **critical**: Red left border, highest visual priority
- **high**: Orange left border, high visual priority
- **medium**: Blue left border, normal visual priority - Default
- **low**: Gray left border, lowest visual priority

#### Features

- **Loading States**: Built-in skeleton loading animation
- **Error Handling**: Accessible error display with screen reader announcements
- **Touch Support**: Optimized for touch devices with tap and long-press gestures
- **Keyboard Navigation**: Full keyboard accessibility with focus management
- **Screen Reader Support**: Comprehensive ARIA labels and live regions

### MetricCard

Specialized card for displaying multiple metrics with trend indicators.

#### Props

```typescript
interface MetricCardProps extends DashboardCardProps {
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
````

#### Usage Example

```tsx
import { MetricCard } from '@/components/dashboard/cards/metric-card'

function SystemMetrics() {
  return (
    <MetricCard
      title="System Performance"
      layout="grid"
      metrics={[
        {
          label: 'CPU Usage',
          value: 45,
          unit: '%',
          trend: 'down',
          trendValue: '-5%',
          color: '#10B981',
        },
        {
          label: 'Memory',
          value: 8.2,
          unit: 'GB',
          trend: 'up',
          trendValue: '+0.3GB',
          color: '#F59E0B',
        },
      ]}
    />
  )
}
```

### ChartCard

Card component with integrated chart visualization capabilities.

#### Props

```typescript
interface ChartCardProps extends DashboardCardProps {
  chartType: 'line' | 'bar' | 'pie' | 'heatmap' | 'area' | 'scatter'
  data: ChartData
  chartConfig?: ChartConfiguration
  exportable?: boolean
  filterable?: boolean
}
```

#### Usage Example

````tsx
import { ChartCard } from '@/components/dashboard/cards/chart-card'

function RevenueChart() {
  const chartData = {
    datasets: [{
      label: 'Revenue',
      data: [
        { x: 'Jan', y: 1000 },
        { x: 'Feb', y: 1200 },
        { x: 'Mar', y: 1100 }
      ]
    }]
  }

  return (
    <ChartCard
      title="Monthly Revenue"
      chartType="line"
      data={chartData}
      exportable={true}
      filterable={true}
      size="lg"
    />
  )
}
```## C
hart Components

### ChartWrapper

Universal chart container that supports multiple chart types with lazy loading, accessibility, and export functionality.

#### Props

```typescript
interface ChartWrapperProps {
  type: ChartType
  data: ChartData
  config?: ChartConfiguration
  loading?: boolean
  error?: string
  height?: number
  responsive?: boolean
  interactive?: boolean
  exportable?: boolean
  exportFilename?: string
  onDataClick?: (data: ChartDataPoint) => void
  onLegendClick?: (legendItem: LegendItem) => void
  onExportStart?: (format: string) => void
  onExportComplete?: (format: string) => void
  onExportError?: (error: Error, format: string) => void
  className?: string
}
````

#### Supported Chart Types

- **line**: Line chart with optional area fill
- **bar**: Vertical or horizontal bar chart
- **pie**: Pie chart with customizable segments
- **heatmap**: Heat map for complex data visualization
- **area**: Area chart (line chart with fill)
- **scatter**: Scatter plot for correlation analysis

#### Chart Data Format

```typescript
interface ChartData {
  datasets: ChartDataset[]
  labels?: string[]
  metadata?: Record<string, any>
}

interface ChartDataset {
  label: string
  data: ChartDataPoint[]
  color?: string
  type?: ChartType
  options?: Record<string, any>
}

interface ChartDataPoint {
  x?: string | number
  y?: string | number
  value?: string | number
  label?: string
  color?: string
  metadata?: Record<string, any>
}
```

#### Chart Configuration

```typescript
interface ChartConfiguration {
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
```

#### Usage Example

````tsx
import { ChartWrapper } from '@/components/dashboard/charts/chart-wrapper'

function SalesChart() {
  const data = {
    datasets: [{
      label: 'Sales',
      data: [
        { x: 'Q1', y: 10000 },
        { x: 'Q2', y: 15000 },
        { x: 'Q3', y: 12000 },
        { x: 'Q4', y: 18000 }
      ],
      color: '#3F51B5'
    }]
  }

  const config = {
    legend: { show: true, position: 'bottom' },
    animations: { enabled: true, duration: 300 },
    tooltip: {
      show: true,
      format: (value) => `$${value.toLocaleString()}`
    }
  }

  return (
    <ChartWrapper
      type="bar"
      data={data}
      config={config}
      height={400}
      exportable={true}
      exportFilename="sales-chart"
      onDataClick={(point) => console.log('Clicked:', point)}
    />
  )
}
```#
### Chart Features

- **Lazy Loading**: Charts are loaded dynamically to improve initial page load
- **Export Functionality**: Export charts as PNG, SVG, or PDF
- **Touch Support**: Pinch-to-zoom, tap interactions, and swipe navigation
- **Keyboard Navigation**: Full keyboard accessibility for chart elements
- **Screen Reader Support**: Comprehensive ARIA labels and data announcements
- **Responsive Design**: Automatic adaptation to different screen sizes
- **Performance Optimization**: Memoized components and efficient re-rendering

## Grid System

### DashboardGrid

12-column responsive grid system optimized for dashboard layouts.

#### Props

```typescript
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
````

#### Usage Example

```tsx
import { DashboardGrid } from '@/components/dashboard/grid/dashboard-grid'
import { GridItem } from '@/components/dashboard/grid/grid-item'

function DashboardContent() {
  return (
    <DashboardGrid
      responsive={{
        mobile: 1,
        tablet: 6,
        desktop: 12,
      }}
      gap={24}
    >
      <GridItem colSpan={{ mobile: 1, tablet: 3, desktop: 4 }}>
        <DashboardCard title="Card 1" />
      </GridItem>
      <GridItem colSpan={{ mobile: 1, tablet: 3, desktop: 4 }}>
        <DashboardCard title="Card 2" />
      </GridItem>
      <GridItem colSpan={{ mobile: 1, tablet: 6, desktop: 4 }}>
        <DashboardCard title="Card 3" />
      </GridItem>
    </DashboardGrid>
  )
}
```

### GridItem

Wrapper component for grid items with responsive column/row spanning.

#### Props

```typescript
interface GridItemProps {
  children: React.ReactNode
  colSpan?: number | { mobile?: number; tablet?: number; desktop?: number }
  rowSpan?: number | { mobile?: number; tablet?: number; desktop?: number }
  order?: number | { mobile?: number; tablet?: number; desktop?: number }
  className?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}
```

#### Grid Breakpoints

- **Mobile**: <768px - Single column layout
- **Tablet**: 768px-1023px - 6 column layout
- **Desktop**: ≥1024px - 12 column layout

#### Priority-Based Ordering

Grid items with higher priority are automatically ordered first:

- **critical**: order: -4
- **high**: order: -3
- **medium**: order: -2
- **low**: order: -1

## Theming System

### DashboardThemeProvider

Comprehensive theming system with CSS variables, contrast validation, and theme switching.

#### Props

````typescript
interface ThemeProviderProps {
  children: React.ReactNode
  theme?: Partial<DashboardTheme>
  defaultTheme?: 'light' | 'dark' | 'system'
  storageKey?: string
  enableColorSchemeDetection?: boolean
  validateContrast?: boolean
}
```#
### Theme Structure

```typescript
interface DashboardTheme {
  colors: {
    primary: string           // #3F51B5 (Cubcen Primary)
    secondary: string         // #B19ADA (Cubcen Secondary)
    accent: string           // #FF6B35 (Cubcen Accent)
    background: string       // #FFFFFF (Light) / #0F172A (Dark)
    surface: string          // #F8F9FA (Light) / #1E293B (Dark)
    text: {
      primary: string        // #1A1A1A (Light) / #F1F5F9 (Dark)
      secondary: string      // #6B7280 (Light) / #CBD5E1 (Dark)
      disabled: string       // #9CA3AF (Light) / #64748B (Dark)
    }
    status: {
      success: string        // #10B981
      warning: string        // #F59E0B
      error: string          // #EF4444
      info: string           // #3B82F6
    }
    chart: {
      palette: string[]      // 10-color palette for charts
      gradients: Record<string, string>
    }
  }
  typography: {
    fontFamily: {
      sans: string[]         // ['Inter', 'system-ui', ...]
      mono: string[]         // ['JetBrains Mono', 'Monaco', ...]
    }
    fontSize: {
      xs: string            // 0.75rem (12px)
      sm: string            // 0.875rem (14px) - Labels
      base: string          // 1rem (16px) - Body
      lg: string            // 1.125rem (18px)
      xl: string            // 1.25rem (20px)
      '2xl': string         // 1.5rem (24px) - H2 Semibold
      '3xl': string         // 2rem (32px) - H1 Bold
    }
    fontWeight: {
      normal: number        // 400
      medium: number        // 500
      semibold: number      // 600
      bold: number          // 700
    }
    lineHeight: {
      tight: number         // 1.25
      normal: number        // 1.5
      relaxed: number       // 1.75
    }
  }
  spacing: {
    grid: {
      gap: string           // 1.5rem
      padding: string       // 2rem
      margin: string        // 2rem
    }
    card: {
      padding: string       // 1.5rem
      margin: string        // 1rem
    }
  }
  breakpoints: {
    mobile: string          // 768px
    tablet: string          // 1024px
    desktop: string         // 1280px
    wide: string            // 1536px
  }
  animations: {
    duration: {
      fast: string          // 150ms
      normal: string        // 250ms
      slow: string          // 350ms
    }
    easing: {
      ease: string          // cubic-bezier(0.4, 0, 0.2, 1)
      easeIn: string        // cubic-bezier(0.4, 0, 1, 1)
      easeOut: string       // cubic-bezier(0, 0, 0.2, 1)
      easeInOut: string     // cubic-bezier(0.4, 0, 0.2, 1)
    }
  }
}
````

#### Usage Example

```tsx
import { DashboardThemeProvider } from '@/components/dashboard/theming/theme-provider'

function App() {
  const customTheme = {
    colors: {
      primary: '#2563EB',
      secondary: '#7C3AED',
    },
  }

  return (
    <DashboardThemeProvider
      theme={customTheme}
      defaultTheme="system"
      validateContrast={true}
      enableColorSchemeDetection={true}
    >
      <DashboardLayout>{/* Your dashboard content */}</DashboardLayout>
    </DashboardThemeProvider>
  )
}
```

#### Theme Hook

````tsx
import { useDashboardTheme } from '@/components/dashboard/theming/theme-provider'

function ThemeControls() {
  const {
    theme,
    setTheme,
    dashboardTheme,
    setDashboardTheme,
    validateContrast,
    getContrastRatio
  } = useDashboardTheme()

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
  }

  const handleCustomColor = (color: string) => {
    setDashboardTheme({
      colors: {
        ...dashboardTheme.colors,
        primary: color
      }
    })
  }

  return (
    <div>
      <button onClick={() => handleThemeChange('light')}>Light</button>
      <button onClick={() => handleThemeChange('dark')}>Dark</button>
      <button onClick={() => handleThemeChange('system')}>System</button>
    </div>
  )
}
```### CSS Var
iables

The theming system uses CSS custom properties for maximum flexibility and performance.

#### Color Variables

```css
:root {
  /* Primary Colors */
  --dashboard-primary: #3F51B5;
  --dashboard-secondary: #B19ADA;
  --dashboard-accent: #FF6B35;
  --dashboard-background: #FFFFFF;
  --dashboard-surface: #F8F9FA;
  --dashboard-border: #E5E7EB;

  /* Text Colors */
  --dashboard-text-primary: #1A1A1A;
  --dashboard-text-secondary: #6B7280;
  --dashboard-text-disabled: #9CA3AF;

  /* Status Colors */
  --dashboard-success: #10B981;
  --dashboard-warning: #F59E0B;
  --dashboard-error: #EF4444;
  --dashboard-info: #3B82F6;

  /* Chart Colors */
  --dashboard-chart-1: var(--dashboard-primary);
  --dashboard-chart-2: var(--dashboard-secondary);
  /* ... up to --dashboard-chart-10 */
}
````

#### Typography Variables

```css
:root {
  /* Font Sizes */
  --dashboard-text-xs: 0.75rem;
  --dashboard-text-sm: 0.875rem;
  --dashboard-text-base: 1rem;
  --dashboard-text-lg: 1.125rem;
  --dashboard-text-xl: 1.25rem;
  --dashboard-text-2xl: 1.5rem;
  --dashboard-text-3xl: 2rem;

  /* Font Weights */
  --dashboard-font-normal: 400;
  --dashboard-font-medium: 500;
  --dashboard-font-semibold: 600;
  --dashboard-font-bold: 700;

  /* Line Heights */
  --dashboard-line-height-tight: 1.25;
  --dashboard-line-height-normal: 1.5;
  --dashboard-line-height-relaxed: 1.75;
}
```

#### Spacing Variables

```css
:root {
  /* Grid Spacing */
  --dashboard-grid-gap: 1.5rem;
  --dashboard-section-margin: 2rem;

  /* Card Spacing */
  --dashboard-card-padding: 1.5rem;
  --dashboard-card-sm-padding: 1rem;
  --dashboard-card-lg-padding: 2rem;
  --dashboard-card-xl-padding: 2.5rem;

  /* Component Spacing */
  --dashboard-component-spacing: 1rem;
}
```

#### Animation Variables

```css
:root {
  /* Transition Durations */
  --dashboard-transition-fast: 150ms ease-out;
  --dashboard-transition-normal: 250ms ease-out;
  --dashboard-transition-slow: 350ms ease-out;

  /* Easing Functions */
  --dashboard-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --dashboard-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --dashboard-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --dashboard-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Custom Theme Creation

#### Step 1: Define Your Theme

```typescript
const myCustomTheme: Partial<DashboardTheme> = {
  colors: {
    primary: '#2563EB', // Custom blue
    secondary: '#7C3AED', // Custom purple
    accent: '#DC2626', // Custom red
    chart: {
      palette: [
        '#2563EB',
        '#7C3AED',
        '#DC2626',
        '#059669',
        '#D97706',
        '#7C2D12',
        '#1E40AF',
        '#6B21A8',
      ],
    },
  },
  typography: {
    fontFamily: {
      sans: ['Roboto', 'system-ui', 'sans-serif'],
    },
  },
}
```

#### Step 2: Apply Theme

```tsx
<DashboardThemeProvider theme={myCustomTheme}>
  <App />
</DashboardThemeProvider>
```

#### Step 3: Use CSS Variables

```css
.my-custom-component {
  background-color: var(--dashboard-primary);
  color: var(--dashboard-text-primary);
  padding: var(--dashboard-card-padding);
  border-radius: var(--dashboard-radius-lg);
  transition: all var(--dashboard-transition-normal);
}
```

### WCAG Compliance

The theming system automatically validates color contrast ratios to ensure WCAG 2.1 AA compliance.

#### Contrast Requirements

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Non-text elements**: Minimum 3:1 contrast ratio

#### Automatic Validation

```typescript
const { validateContrast, getContrastRatio } = useDashboardTheme()

// Check if colors meet WCAG standards
const isValid = validateContrast('#3F51B5', '#FFFFFF') // true
const ratio = getContrastRatio('#3F51B5', '#FFFFFF') // 8.59
```
