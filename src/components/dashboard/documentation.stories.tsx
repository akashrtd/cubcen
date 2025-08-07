import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DashboardCard } from './cards/dashboard-card'
import { MetricCard } from './cards/metric-card'
import { ChartCard } from './cards/chart-card'
import { DashboardGrid } from './grid/dashboard-grid'
import { GridItem } from './grid/grid-item'
import { DashboardLayout } from './layout/dashboard-layout'
import { DashboardThemeProvider } from './theming/theme-provider'
import { Activity, Users, TrendingUp, BarChart3 } from 'lucide-react'

const meta: Meta = {
  title: 'Dashboard/Documentation/Getting Started',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Modular Dashboard UI System

A comprehensive, accessible, and performant dashboard UI system built for the Cubcen AI Agent Management Platform.

## Quick Start

### 1. Basic Layout

\`\`\`tsx
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout'

<DashboardLayout>
  <YourContent />
</DashboardLayout>
\`\`\`

### 2. Grid System

\`\`\`tsx
import { DashboardGrid, GridItem } from '@/components/dashboard/grid'

<DashboardGrid>
  <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
    <DashboardCard title="Card 1" />
  </GridItem>
</DashboardGrid>
\`\`\`

### 3. Cards

\`\`\`tsx
import { DashboardCard, MetricCard, ChartCard } from '@/components/dashboard/cards'

// Basic card
<DashboardCard title="Active Agents" metric={{ value: 24, unit: 'agents' }} />

// Metric card
<MetricCard 
  title="System Metrics"
  metrics={[
    { label: 'CPU', value: '45%', trend: 'up' },
    { label: 'Memory', value: '67%', trend: 'down' }
  ]}
/>

// Chart card
<ChartCard title="Performance" chartType="line" data={chartData} />
\`\`\`

### 4. Theming

\`\`\`tsx
import { DashboardThemeProvider } from '@/components/dashboard/theming/theme-provider'

<DashboardThemeProvider defaultTheme="light" validateContrast>
  <App />
</DashboardThemeProvider>
\`\`\`

## Features

- **Responsive Design**: Mobile-first with breakpoints for all devices
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Theming**: Comprehensive theming with dark/light mode support
- **Performance**: Lazy loading, memoization, and virtualization
- **Interactivity**: Click-to-filter, export, and real-time updates

## Component Props

### DashboardCard
- \`title?\`: string - Card title
- \`subtitle?\`: string - Card subtitle  
- \`metric?\`: Object - Metric data with value, unit, trend
- \`icon?\`: React.ComponentType - Icon component
- \`size?\`: 'sm' | 'md' | 'lg' | 'xl' - Card size
- \`priority?\`: 'low' | 'medium' | 'high' | 'critical' - Visual priority
- \`loading?\`: boolean - Show loading state
- \`error?\`: string - Error message
- \`interactive?\`: boolean - Enable interactive features

### MetricCard
- Extends DashboardCard props
- \`metrics\`: Array - Array of metric objects
- \`layout?\`: 'horizontal' | 'vertical' | 'grid' - Layout arrangement

### ChartCard  
- Extends DashboardCard props
- \`chartType\`: 'line' | 'bar' | 'pie' | 'heatmap' | 'area' | 'scatter'
- \`data\`: ChartData - Chart data object
- \`exportable?\`: boolean - Enable export functionality
- \`filterable?\`: boolean - Enable click-to-filter

### GridItem
- \`colSpan?\`: number | Object - Column span (responsive)
- \`rowSpan?\`: number | Object - Row span (responsive)
- \`priority?\`: 'low' | 'medium' | 'high' | 'critical' - Layout priority

## Responsive Breakpoints

- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2-4 columns)  
- **Desktop**: 1024px - 1280px (3-6 columns)
- **Wide**: > 1280px (4-12 columns)

## Best Practices

1. **Use semantic HTML**: Proper heading hierarchy and landmarks
2. **Provide meaningful labels**: Descriptive titles and ARIA labels
3. **Handle loading states**: Always provide loading and error states
4. **Optimize for mobile**: Test on mobile devices
5. **Follow color guidelines**: Ensure sufficient contrast ratios

## Examples

See the complete examples in other Storybook stories:
- Complete Dashboard: Full-featured dashboard
- Responsive Layouts: Mobile, tablet, desktop
- Custom Themes: Brand-specific themes
- Interactive Features: Click-to-filter and export
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj

// Sample data
const sampleData = {
  datasets: [
    {
      label: 'Performance',
      data: [
        { x: 'Jan', y: 65 },
        { x: 'Feb', y: 78 },
        { x: 'Mar', y: 82 },
        { x: 'Apr', y: 75 },
        { x: 'May', y: 89 },
        { x: 'Jun', y: 94 },
      ],
      color: '#3F51B5',
    },
  ],
}

export const BasicExample: Story = {
  render: () => (
    <DashboardThemeProvider defaultTheme="light" validateContrast>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Getting Started Example</h1>
          <DashboardGrid>
            <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
              <DashboardCard
                title="Active Agents"
                metric={{ value: 24, unit: 'agents', trend: 'up', trendValue: '+12%' }}
                icon={Activity}
                priority="high"
              />
            </GridItem>
            <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
              <DashboardCard
                title="Total Users"
                metric={{ value: 1247, unit: 'users', trend: 'up', trendValue: '+5%' }}
                icon={Users}
                priority="medium"
              />
            </GridItem>
            <GridItem colSpan={{ desktop: 6, tablet: 4, mobile: 1 }}>
              <ChartCard
                title="Performance Trends"
                subtitle="System performance over time"
                chartType="line"
                data={sampleData}
                icon={BarChart3}
                exportable
                filterable
              />
            </GridItem>
            <GridItem colSpan={{ desktop: 6, tablet: 4, mobile: 1 }}>
              <MetricCard
                title="System Metrics"
                subtitle="Real-time system performance"
                icon={TrendingUp}
                layout="vertical"
                metrics={[
                  { label: 'CPU Usage', value: '45%', trend: 'up', trendValue: '+5%', color: '#3F51B5' },
                  { label: 'Memory Usage', value: '67%', trend: 'down', trendValue: '-3%', color: '#B19ADA' },
                  { label: 'Disk Usage', value: '23%', trend: 'neutral', trendValue: '0%', color: '#FF6B35' },
                ]}
              />
            </GridItem>
          </DashboardGrid>
        </div>
      </DashboardLayout>
    </DashboardThemeProvider>
  ),
}

export const ResponsiveExample: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  render: () => (
    <DashboardThemeProvider defaultTheme="light" validateContrast>
      <DashboardLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Mobile Layout</h1>
          <DashboardGrid>
            <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
              <DashboardCard
                title="Active Agents"
                metric={{ value: 24, unit: 'agents' }}
                icon={Activity}
                size="sm"
              />
            </GridItem>
            <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
              <DashboardCard
                title="Total Users"
                metric={{ value: 1247, unit: 'users' }}
                icon={Users}
                size="sm"
              />
            </GridItem>
            <GridItem colSpan={{ desktop: 6, tablet: 4, mobile: 1 }}>
              <ChartCard
                title="Performance"
                chartType="line"
                data={sampleData}
                icon={BarChart3}
                size="sm"
              />
            </GridItem>
          </DashboardGrid>
        </div>
      </DashboardLayout>
    </DashboardThemeProvider>
  ),
}

export const ThemingExample: Story = {
  render: () => (
    <DashboardThemeProvider
      defaultTheme="light"
      theme={{
        colors: {
          primary: '#8B5CF6',
          secondary: '#06B6D4',
          accent: '#F59E0B',
          background: '#FFFFFF',
          surface: '#F8F9FA',
          text: {
            primary: '#1A1A1A',
            secondary: '#6B7280',
            disabled: '#9CA3AF',
          },
          chart: {
            palette: ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981'],
            gradients: {},
          },
        },
      }}
      validateContrast
    >
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Custom Theme Example</h1>
          <DashboardGrid>
            <GridItem colSpan={4}>
              <DashboardCard
                title="Custom Theme"
                subtitle="Purple & Cyan theme"
                metric={{ value: 42, unit: 'items' }}
                icon={Activity}
              />
            </GridItem>
            <GridItem colSpan={8}>
              <ChartCard
                title="Themed Chart"
                subtitle="Using custom color palette"
                chartType="line"
                data={sampleData}
                icon={BarChart3}
              />
            </GridItem>
          </DashboardGrid>
        </div>
      </DashboardLayout>
    </DashboardThemeProvider>
  ),
}