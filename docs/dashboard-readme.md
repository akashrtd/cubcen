# Cubcen Dashboard UI System

A comprehensive, modular dashboard UI framework built for the Cubcen AI Agent Management Platform. This system provides responsive, accessible, and performant dashboard components with advanced data visualization capabilities.

## Features

✨ **Modular Architecture** - Reusable components that work together seamlessly  
🎨 **Comprehensive Theming** - CSS variables-based theming with light/dark mode support  
📱 **Mobile-First Design** - Responsive layouts optimized for all device sizes  
♿ **Accessibility First** - WCAG 2.1 AA compliant with full keyboard and screen reader support  
📊 **Advanced Charts** - Integrated data visualization with Recharts  
⚡ **Performance Optimized** - Lazy loading, memoization, and progressive enhancement  
🎯 **TypeScript Ready** - Full TypeScript support with comprehensive type definitions

## Quick Start

### Installation

The dashboard system is built into the Cubcen platform. No additional installation required.

### Basic Usage

```tsx
import {
  DashboardLayout,
  DashboardGrid,
  DashboardCard,
  ChartCard,
  DashboardThemeProvider,
} from '@/components/dashboard'

function MyDashboard() {
  return (
    <DashboardThemeProvider>
      <DashboardLayout
        header={<h1>My Dashboard</h1>}
        sidebar={<nav>Navigation</nav>}
        showMobileNav={true}
      >
        <DashboardGrid>
          <DashboardCard
            title="Active Users"
            metric={{
              value: 1234,
              unit: 'users',
              trend: 'up',
              trendValue: '+12%',
            }}
          />
          <ChartCard
            title="Revenue Trend"
            chartType="line"
            data={chartData}
            exportable={true}
          />
        </DashboardGrid>
      </DashboardLayout>
    </DashboardThemeProvider>
  )
}
```

## Core Components

### DashboardLayout

The main layout component providing responsive grid-based layouts.

```tsx
<DashboardLayout
  header={<DashboardHeader />}
  sidebar={<DashboardSidebar />}
  footer={<DashboardFooter />}
  showMobileNav={true}
  enableSwipeNavigation={true}
>
  {/* Your dashboard content */}
</DashboardLayout>
```

**Key Features:**

- Responsive CSS Grid layout
- Collapsible sidebar with state persistence
- Mobile bottom navigation
- Swipe gesture support
- Full accessibility support

### DashboardCard

Versatile card component for displaying metrics, content, and interactive elements.

```tsx
<DashboardCard
  title="System Performance"
  subtitle="Last 24 hours"
  icon={Activity}
  metric={{
    value: 98.5,
    unit: '%',
    trend: 'up',
    trendValue: '+2.1%',
  }}
  size="md"
  priority="high"
  interactive={true}
  onClick={() => console.log('Card clicked')}
>
  {/* Additional content */}
</DashboardCard>
```

**Props:**

- `title` - Card title
- `subtitle` - Optional subtitle
- `icon` - Lucide React icon component
- `metric` - Metric display with trend indicators
- `size` - Card size: 'sm' | 'md' | 'lg' | 'xl'
- `priority` - Visual priority: 'low' | 'medium' | 'high' | 'critical'
- `interactive` - Enable click interactions
- `loading` - Show loading skeleton
- `error` - Display error state

### ChartCard

Specialized card for data visualization with integrated chart capabilities.

```tsx
const chartData = {
  datasets: [{
    label: 'Revenue',
    data: [
      { x: 'Jan', y: 10000 },
      { x: 'Feb', y: 12000 },
      { x: 'Mar', y: 11000 }
    ]
  }]
}

<ChartCard
  title="Monthly Revenue"
  chartType="line"
  data={chartData}
  exportable={true}
  filterable={true}
  size="lg"
/>
```

**Supported Chart Types:**

- `line` - Line charts with optional area fill
- `bar` - Vertical and horizontal bar charts
- `pie` - Pie charts with customizable segments
- `heatmap` - Heat maps for complex data visualization
- `area` - Area charts
- `scatter` - Scatter plots

### DashboardGrid

Responsive 12-column grid system optimized for dashboard layouts.

````tsx
<DashboardGrid
  responsive={{
    mobile: 1,
    tablet: 6,
    desktop: 12
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
```## Theming
 System

### Basic Theme Setup

```tsx
import { DashboardThemeProvider } from '@/components/dashboard/theming/theme-provider'

function App() {
  return (
    <DashboardThemeProvider
      defaultTheme="system"
      enableColorSchemeDetection={true}
      validateContrast={true}
    >
      <YourDashboard />
    </DashboardThemeProvider>
  )
}
````

### Custom Theme

```tsx
const customTheme = {
  colors: {
    primary: '#2563EB',
    secondary: '#7C3AED',
    accent: '#DC2626',
    chart: {
      palette: [
        '#2563EB', '#7C3AED', '#DC2626', '#059669',
        '#D97706', '#7C2D12', '#1E40AF', '#6B21A8'
      ]
    }
  },
  typography: {
    fontFamily: {
      sans: ['Roboto', 'system-ui', 'sans-serif']
    }
  }
}

<DashboardThemeProvider theme={customTheme}>
  <YourDashboard />
</DashboardThemeProvider>
```

### Theme Hook

```tsx
import { useDashboardTheme } from '@/components/dashboard/theming/theme-provider'

function ThemeControls() {
  const { theme, setTheme, dashboardTheme, setDashboardTheme } =
    useDashboardTheme()

  return (
    <div>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}
```

## Accessibility Features

### Built-in Accessibility

All components include comprehensive accessibility features:

- **ARIA Labels**: Automatic ARIA labels and roles
- **Keyboard Navigation**: Full keyboard support with focus management
- **Screen Reader Support**: Live regions and announcements
- **Color Contrast**: WCAG 2.1 AA compliant color combinations
- **Focus Management**: Proper focus trapping and restoration
- **High Contrast Mode**: Support for Windows High Contrast Mode

### Accessibility Testing

```tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('dashboard is accessible', async () => {
  const { container } = render(
    <DashboardThemeProvider>
      <DashboardLayout>
        <DashboardCard title="Test Card" />
      </DashboardLayout>
    </DashboardThemeProvider>
  )

  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Performance Optimization

### Lazy Loading

Charts and heavy components are automatically lazy-loaded:

```tsx
// Charts load only when needed
<ChartCard
  title="Performance Chart"
  chartType="line"
  data={data}
  // Automatically lazy-loaded with skeleton
/>
```

### Memoization

Components are automatically memoized to prevent unnecessary re-renders:

```tsx
// Automatic memoization based on props
<DashboardCard
  title="Metrics"
  metric={{ value: 100 }}
  // Only re-renders when props change
/>
```

### Progressive Loading

Large datasets are progressively loaded:

```tsx
<DashboardGrid>
  {/* Cards load progressively based on viewport */}
  {largeDataset.map(item => (
    <DashboardCard key={item.id} {...item} />
  ))}
</DashboardGrid>
```

## Mobile Optimization

### Responsive Design

All components are mobile-first and responsive:

```tsx
<DashboardLayout showMobileNav={true} enableSwipeNavigation={true}>
  <DashboardGrid>
    {/* Automatically stacks on mobile */}
    <GridItem colSpan={{ mobile: 1, tablet: 2, desktop: 3 }}>
      <DashboardCard />
    </GridItem>
  </DashboardGrid>
</DashboardLayout>
```

### Touch Interactions

Touch gestures are supported throughout:

- **Tap**: Select chart elements
- **Long Press**: Access context menus
- **Pinch-to-Zoom**: Zoom charts on mobile
- **Swipe**: Navigate between dashboard sections

## Examples

### Analytics Dashboard

````tsx
import {
  DashboardLayout,
  DashboardGrid,
  GridItem,
  MetricCard,
  ChartCard
} from '@/components/dashboard'

function AnalyticsDashboard() {
  const kpiData = [
    { label: 'Total Users', value: 12543, trend: 'up', trendValue: '+12%' },
    { label: 'Revenue', value: '$45,231', trend: 'up', trendValue: '+8%' },
    { label: 'Conversion', value: '3.2%', trend: 'down', trendValue: '-0.5%' }
  ]

  const chartData = {
    datasets: [{
      label: 'User Growth',
      data: [
        { x: 'Jan', y: 1000 },
        { x: 'Feb', y: 1200 },
        { x: 'Mar', y: 1100 },
        { x: 'Apr', y: 1400 }
      ]
    }]
  }

  return (
    <DashboardLayout
      header={<h1>Analytics Dashboard</h1>}
      showMobileNav={true}
    >
      <DashboardGrid>
        {/* KPI Cards */}
        <GridItem colSpan={{ mobile: 1, tablet: 6, desktop: 12 }}>
          <MetricCard
            title="Key Performance Indicators"
            metrics={kpiData}
            layout="horizontal"
            priority="high"
          />
        </GridItem>

        {/* Charts */}
        <GridItem colSpan={{ mobile: 1, tablet: 3, desktop: 6 }}>
          <ChartCard
            title="User Growth"
            chartType="line"
            data={chartData}
            exportable={true}
          />
        </GridItem>

        <GridItem colSpan={{ mobile: 1, tablet: 3, desktop: 6 }}>
          <ChartCard
            title="Revenue Distribution"
            chartType="pie"
            data={revenueData}
            exportable={true}
          />
        </GridItem>
      </DashboardGrid>
    </DashboardLayout>
  )
}
```### Error
 Monitoring Dashboard

```tsx
function ErrorMonitoringDashboard() {
  const errorMetrics = {
    value: 23,
    unit: 'errors',
    trend: 'down',
    trendValue: '-15%'
  }

  const errorData = {
    datasets: [{
      label: 'Error Rate',
      data: [
        { x: '00:00', y: 5 },
        { x: '06:00', y: 3 },
        { x: '12:00', y: 8 },
        { x: '18:00', y: 2 }
      ]
    }]
  }

  return (
    <DashboardLayout
      header={<h1>Error Monitoring</h1>}
      showMobileNav={true}
    >
      <DashboardGrid>
        <GridItem colSpan={{ mobile: 1, tablet: 2, desktop: 3 }}>
          <DashboardCard
            title="Active Errors"
            metric={errorMetrics}
            priority="critical"
            interactive={true}
            onClick={() => console.log('View errors')}
          />
        </GridItem>

        <GridItem colSpan={{ mobile: 1, tablet: 4, desktop: 9 }}>
          <ChartCard
            title="Error Rate Over Time"
            chartType="area"
            data={errorData}
            exportable={true}
            filterable={true}
          />
        </GridItem>
      </DashboardGrid>
    </DashboardLayout>
  )
}
````

### Custom Themed Dashboard

```tsx
const darkTheme = {
  colors: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#F59E0B',
    background: '#0F172A',
    surface: '#1E293B',
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
    },
  },
}

function CustomDashboard() {
  return (
    <DashboardThemeProvider theme={darkTheme}>
      <DashboardLayout header={<h1>Custom Dashboard</h1>} showMobileNav={true}>
        <DashboardGrid>
          <GridItem colSpan={{ mobile: 1, tablet: 3, desktop: 4 }}>
            <DashboardCard
              title="Custom Metric"
              metric={{ value: 42, unit: 'items' }}
              className="custom-card-styling"
            />
          </GridItem>
        </DashboardGrid>
      </DashboardLayout>
    </DashboardThemeProvider>
  )
}
```

## Best Practices

### Component Organization

```tsx
// ✅ Good: Organize components logically
function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardGrid>
        {/* Group related metrics */}
        <MetricsSection />

        {/* Separate chart section */}
        <ChartsSection />

        {/* Data tables at bottom */}
        <DataSection />
      </DashboardGrid>
    </DashboardLayout>
  )
}

// ❌ Avoid: Mixing unrelated components
function BadDashboard() {
  return (
    <DashboardGrid>
      <DashboardCard title="Users" />
      <ChartCard title="Revenue" />
      <DashboardCard title="Errors" />
      <ChartCard title="Performance" />
    </DashboardGrid>
  )
}
```

### Data Structure

```tsx
// ✅ Good: Consistent data structure
const chartData = {
  datasets: [
    {
      label: 'Revenue',
      data: [
        { x: 'Q1', y: 10000 },
        { x: 'Q2', y: 12000 },
        { x: 'Q3', y: 11000 },
      ],
    },
  ],
}

// ❌ Avoid: Inconsistent data formats
const badData = [
  { quarter: 'Q1', revenue: 10000 },
  { period: 'Q2', amount: 12000 },
]
```

### Performance

```tsx
// ✅ Good: Use memoization for expensive calculations
const processedData = useMemo(() => {
  return expensiveDataProcessing(rawData)
}, [rawData])

// ✅ Good: Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'))

// ❌ Avoid: Processing data in render
function BadComponent({ data }) {
  const processed = expensiveDataProcessing(data) // Runs every render
  return <ChartCard data={processed} />
}
```

### Accessibility

```tsx
// ✅ Good: Provide meaningful titles and descriptions
<DashboardCard
  title="Active Users"
  subtitle="Users currently online"
  metric={{ value: 1234, unit: 'users' }}
/>

// ✅ Good: Use semantic priority levels
<DashboardCard
  title="Critical Errors"
  priority="critical"
  metric={{ value: 5, unit: 'errors' }}
/>

// ❌ Avoid: Generic or missing titles
<DashboardCard
  title="Data"
  metric={{ value: 123 }}
/>
```

### Theming

```tsx
// ✅ Good: Use CSS variables for custom styling
.custom-card {
  background: linear-gradient(
    135deg,
    var(--dashboard-primary),
    var(--dashboard-secondary)
  );
  border: 2px solid var(--dashboard-accent);
}

// ❌ Avoid: Hard-coded colors
.bad-card {
  background: #3F51B5; /* Hard-coded color */
  border: 2px solid #FF6B35;
}
```

### Mobile Optimization

```tsx
// ✅ Good: Consider mobile layout
<DashboardGrid>
  <GridItem colSpan={{ mobile: 1, tablet: 2, desktop: 3 }}>
    <DashboardCard title="Mobile-friendly card" />
  </GridItem>
</DashboardGrid>

// ✅ Good: Enable mobile features
<DashboardLayout
  showMobileNav={true}
  enableSwipeNavigation={true}
>
  {/* Content */}
</DashboardLayout>

// ❌ Avoid: Fixed desktop layouts
<div className="grid grid-cols-4 gap-6">
  {/* Won't work well on mobile */}
</div>
```

## Testing

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardThemeProvider } from '@/components/dashboard/theming/theme-provider'
import { DashboardCard } from '@/components/dashboard/cards/dashboard-card'

function renderWithTheme(component: React.ReactElement) {
  return render(<DashboardThemeProvider>{component}</DashboardThemeProvider>)
}

test('dashboard card displays metric', () => {
  renderWithTheme(
    <DashboardCard title="Test Card" metric={{ value: 100, unit: 'items' }} />
  )

  expect(screen.getByText('Test Card')).toBeInTheDocument()
  expect(screen.getByText('100')).toBeInTheDocument()
  expect(screen.getByText('items')).toBeInTheDocument()
})

test('interactive card handles clicks', () => {
  const handleClick = jest.fn()

  renderWithTheme(
    <DashboardCard
      title="Interactive Card"
      interactive={true}
      onClick={handleClick}
    />
  )

  fireEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalled()
})
```

### Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('dashboard layout is accessible', async () => {
  const { container } = renderWithTheme(
    <DashboardLayout>
      <DashboardGrid>
        <DashboardCard title="Accessible Card" />
      </DashboardGrid>
    </DashboardLayout>
  )

  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Troubleshooting

### Common Issues

#### Theme Not Applying

**Problem**: Components not using theme colors

**Solution**: Ensure components are wrapped in `DashboardThemeProvider`

```tsx
// ✅ Correct
<DashboardThemeProvider>
  <DashboardCard title="Themed Card" />
</DashboardThemeProvider>

// ❌ Missing provider
<DashboardCard title="Unthemed Card" />
```

#### Charts Not Loading

**Problem**: Charts showing loading state indefinitely

**Solution**: Check data format and ensure proper structure

```tsx
// ✅ Correct data format
const data = {
  datasets: [
    {
      label: 'Data',
      data: [
        { x: 'A', y: 1 },
        { x: 'B', y: 2 },
      ],
    },
  ],
}

// ❌ Incorrect format
const badData = [{ name: 'A', value: 1 }]
```

#### Mobile Layout Issues

**Problem**: Components not responsive on mobile

**Solution**: Use responsive grid props

```tsx
// ✅ Responsive
<GridItem colSpan={{ mobile: 1, tablet: 2, desktop: 3 }}>
  <DashboardCard />
</GridItem>

// ❌ Fixed width
<GridItem colSpan={3}>
  <DashboardCard />
</GridItem>
```

## API Reference

For detailed API documentation, see:

- [Component API Documentation](./dashboard-component-api.md)
- [Theming Guide](./dashboard-theming-guide.md)
- [Migration Guide](./dashboard-migration-guide.md)
- [Accessibility Guide](./dashboard-accessibility-guide.md)
- [Performance Guide](./dashboard-performance-guide.md)

## Contributing

When contributing to the dashboard system:

1. Follow the established component patterns
2. Ensure accessibility compliance
3. Add comprehensive tests
4. Update documentation
5. Test on multiple devices and screen sizes

## License

This dashboard system is part of the Cubcen AI Agent Management Platform.
