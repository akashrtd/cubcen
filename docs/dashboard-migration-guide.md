# Dashboard Migration Guide

## Overview

This guide helps you migrate existing dashboard components to use the new modular dashboard UI system. The migration is designed to be incremental, allowing you to adopt new components gradually while maintaining backward compatibility.

## Migration Strategy

### Phase 1: Setup and Infrastructure
1. Install and configure the dashboard theming system
2. Update existing layouts to use DashboardLayout
3. Migrate CSS variables and theming

### Phase 2: Component Migration
1. Replace existing cards with DashboardCard components
2. Migrate charts to use ChartWrapper
3. Update grid layouts to use DashboardGrid

### Phase 3: Feature Enhancement
1. Add accessibility features
2. Implement mobile optimizations
3. Add performance optimizations

### Phase 4: Cleanup
1. Remove deprecated components
2. Consolidate theming
3. Update documentation

## Pre-Migration Checklist

- [ ] Audit existing dashboard components
- [ ] Identify custom styling and themes
- [ ] Document current accessibility features
- [ ] Test existing functionality
- [ ] Plan rollback strategy

## Step-by-Step Migration

### 1. Install Dashboard System

#### Update Dependencies

Ensure you have the required dependencies:

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "next": "^15.0.0",
    "tailwindcss": "^4.0.0",
    "recharts": "^2.8.0",
    "lucide-react": "^0.400.0"
  }
}
```

#### Import CSS Variables

Add the dashboard variables to your global CSS:

```css
/* globals.css */
@import '../components/dashboard/styles/dashboard-variables.css';
```

### 2. Migrate Layout Components

#### Before: Custom Layout

```tsx
// Old layout
function OldDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="px-4 py-6">
          <h1>Dashboard</h1>
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 bg-white shadow">
          <nav>Navigation</nav>
        </aside>
        <main className="flex-1 p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Dashboard content */}
          </div>
        </main>
      </div>
    </div>
  )
}
```

#### After: DashboardLayout

```tsx
// New layout
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout'
import { DashboardGrid } from '@/components/dashboard/grid/dashboard-grid'

function NewDashboard() {
  return (
    <DashboardLayout
      header={
        <div className="px-4 py-6">
          <h1 className="text-dashboard-text-3xl font-dashboard-font-bold">
            Dashboard
          </h1>
        </div>
      }
      sidebar={
        <nav className="p-4">
          Navigation
        </nav>
      }
      showMobileNav={true}
    >
      <DashboardGrid>
        {/* Dashboard content */}
      </DashboardGrid>
    </DashboardLayout>
  )
}
```

### 3. Migrate Card Components

#### Before: Custom Cards

```tsx
// Old card component
function OldMetricCard({ title, value, trend }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <span className={`ml-2 text-sm ${
          trend > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      </div>
    </div>
  )
}
```

#### After: DashboardCard

```tsx
// New card component
import { DashboardCard } from '@/components/dashboard/cards/dashboard-card'

function NewMetricCard({ title, value, trend }) {
  return (
    <DashboardCard
      title={title}
      metric={{
        value: value,
        trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral',
        trendValue: `${trend > 0 ? '+' : ''}${trend}%`
      }}
      size="md"
      priority="medium"
    />
  )
}
```### 4.
 Migrate Chart Components

#### Before: Direct Recharts Usage

```tsx
// Old chart component
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function OldChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Revenue Chart</h3>
      <LineChart width={400} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </div>
  )
}
```

#### After: ChartWrapper

```tsx
// New chart component
import { ChartCard } from '@/components/dashboard/cards/chart-card'

function NewChart({ data }) {
  const chartData = {
    datasets: [{
      label: 'Revenue',
      data: data.map(item => ({ x: item.name, y: item.value }))
    }]
  }

  return (
    <ChartCard
      title="Revenue Chart"
      chartType="line"
      data={chartData}
      exportable={true}
      size="lg"
    />
  )
}
```

### 5. Migrate Grid Layouts

#### Before: Tailwind Grid

```tsx
// Old grid layout
function OldDashboardContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <div className="col-span-1">
        <MetricCard />
      </div>
      <div className="col-span-1">
        <MetricCard />
      </div>
      <div className="col-span-1 lg:col-span-3">
        <ChartCard />
      </div>
    </div>
  )
}
```

#### After: DashboardGrid

```tsx
// New grid layout
import { DashboardGrid } from '@/components/dashboard/grid/dashboard-grid'
import { GridItem } from '@/components/dashboard/grid/grid-item'

function NewDashboardContent() {
  return (
    <DashboardGrid>
      <GridItem colSpan={{ mobile: 1, tablet: 3, desktop: 4 }}>
        <DashboardCard />
      </GridItem>
      <GridItem colSpan={{ mobile: 1, tablet: 3, desktop: 4 }}>
        <DashboardCard />
      </GridItem>
      <GridItem colSpan={{ mobile: 1, tablet: 6, desktop: 12 }}>
        <ChartCard />
      </GridItem>
    </DashboardGrid>
  )
}
```

### 6. Migrate Theming

#### Before: Custom CSS Variables

```css
/* old-theme.css */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #6b7280;
  --background-color: #f9fafb;
  --text-color: #111827;
}
```

#### After: Dashboard Theme Provider

```tsx
// theme-config.ts
export const customTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    background: '#f9fafb',
    text: {
      primary: '#111827'
    }
  }
}

// App.tsx
import { DashboardThemeProvider } from '@/components/dashboard/theming/theme-provider'

function App() {
  return (
    <DashboardThemeProvider theme={customTheme}>
      <Dashboard />
    </DashboardThemeProvider>
  )
}
```

## Component Mapping

### Layout Components

| Old Component | New Component | Migration Notes |
|---------------|---------------|-----------------|
| Custom layout divs | `DashboardLayout` | Use props for header, sidebar, footer |
| Flexbox layouts | `DashboardGrid` | Convert to CSS Grid with responsive props |
| Custom navigation | `MobileNavigation` | Built-in mobile navigation support |

### Card Components

| Old Component | New Component | Migration Notes |
|---------------|---------------|-----------------|
| Custom card divs | `DashboardCard` | Use props for title, metric, actions |
| Metric displays | `MetricCard` | Support for multiple metrics and trends |
| Chart containers | `ChartCard` | Integrated chart wrapper with export |

### Chart Components

| Old Component | New Component | Migration Notes |
|---------------|---------------|-----------------|
| Direct Recharts | `ChartWrapper` | Unified API for all chart types |
| Custom tooltips | Built-in tooltips | Automatic accessibility and mobile support |
| Export buttons | Built-in export | PNG, SVG, PDF export functionality |

## Accessibility Migration

### Before: Manual Accessibility

```tsx
// Old component with manual accessibility
function OldCard({ title, value }) {
  return (
    <div 
      role="region" 
      aria-label={`${title}: ${value}`}
      tabIndex={0}
    >
      <h3 id="card-title">{title}</h3>
      <p aria-labelledby="card-title">{value}</p>
    </div>
  )
}
```

### After: Built-in Accessibility

```tsx
// New component with automatic accessibility
function NewCard({ title, value }) {
  return (
    <DashboardCard
      title={title}
      metric={{ value }}
      interactive={true}
      // Accessibility is handled automatically:
      // - ARIA labels and roles
      // - Keyboard navigation
      // - Screen reader announcements
      // - Focus management
    />
  )
}
```

## Performance Migration

### Before: Manual Optimization

```tsx
// Old component with manual optimization
const OldChart = React.memo(({ data }) => {
  const memoizedData = useMemo(() => 
    processChartData(data), [data]
  )
  
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyChart data={memoizedData} />
      </Suspense>
    </div>
  )
})
```

### After: Built-in Optimization

```tsx
// New component with automatic optimization
function NewChart({ data }) {
  return (
    <ChartCard
      title="Performance Chart"
      chartType="line"
      data={data}
      // Performance optimizations included:
      // - Automatic memoization
      // - Lazy loading
      // - Progressive loading
      // - Viewport-based rendering
    />
  )
}
```#
# Mobile Migration

### Before: Custom Responsive Design

```tsx
// Old mobile handling
function OldDashboard() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return (
    <div>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}
    </div>
  )
}
```

### After: Built-in Responsive Design

```tsx
// New responsive handling
function NewDashboard() {
  return (
    <DashboardLayout
      showMobileNav={true}
      enableSwipeNavigation={true}
      // Responsive behavior is automatic:
      // - Mobile navigation
      // - Touch interactions
      // - Swipe gestures
      // - Responsive grid
    >
      <DashboardGrid>
        {/* Content adapts automatically */}
      </DashboardGrid>
    </DashboardLayout>
  )
}
```

## Testing Migration

### Update Test Files

#### Before: Custom Testing

```tsx
// old-dashboard.test.tsx
import { render, screen } from '@testing-library/react'
import { OldDashboard } from './old-dashboard'

test('renders dashboard', () => {
  render(<OldDashboard />)
  expect(screen.getByText('Dashboard')).toBeInTheDocument()
})
```

#### After: Enhanced Testing

```tsx
// new-dashboard.test.tsx
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DashboardThemeProvider } from '@/components/dashboard/theming/theme-provider'
import { NewDashboard } from './new-dashboard'

expect.extend(toHaveNoViolations)

test('renders dashboard with accessibility', async () => {
  const { container } = render(
    <DashboardThemeProvider>
      <NewDashboard />
    </DashboardThemeProvider>
  )
  
  expect(screen.getByText('Dashboard')).toBeInTheDocument()
  
  // Test accessibility
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Common Migration Issues

### Issue 1: CSS Conflicts

**Problem**: Existing CSS conflicts with dashboard variables

**Solution**: Use CSS specificity or CSS modules

```css
/* Scope existing styles */
.legacy-dashboard {
  /* Your existing styles */
}

/* Or use CSS modules */
.dashboard :global(.legacy-component) {
  /* Override specific styles */
}
```

### Issue 2: Theme Not Applying

**Problem**: Components not using theme variables

**Solution**: Ensure proper provider wrapping

```tsx
// Wrap entire app or dashboard section
function App() {
  return (
    <DashboardThemeProvider>
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </DashboardThemeProvider>
  )
}
```

### Issue 3: Chart Data Format

**Problem**: Existing chart data doesn't match new format

**Solution**: Create data transformation utilities

```tsx
// data-transformers.ts
export function transformLegacyChartData(legacyData: LegacyData[]): ChartData {
  return {
    datasets: [{
      label: 'Data',
      data: legacyData.map(item => ({
        x: item.label,
        y: item.value
      }))
    }]
  }
}

// Usage
function MigratedChart({ legacyData }) {
  const chartData = transformLegacyChartData(legacyData)
  
  return (
    <ChartCard
      title="Migrated Chart"
      chartType="line"
      data={chartData}
    />
  )
}
```

### Issue 4: Custom Styling

**Problem**: Need to maintain custom component styling

**Solution**: Use className prop and CSS variables

```tsx
// Custom styled component
function CustomCard({ title, value }) {
  return (
    <DashboardCard
      title={title}
      metric={{ value }}
      className="custom-card"
    />
  )
}
```

```css
/* custom-card.css */
.custom-card {
  background: linear-gradient(135deg, var(--dashboard-primary), var(--dashboard-secondary));
  border: 2px solid var(--dashboard-accent);
}

.custom-card .dashboard-card-title {
  color: var(--dashboard-text-inverse);
}
```

## Rollback Strategy

### Gradual Migration

1. **Feature Flags**: Use feature flags to toggle between old and new components

```tsx
function Dashboard() {
  const useNewDashboard = useFeatureFlag('new-dashboard')
  
  return useNewDashboard ? <NewDashboard /> : <OldDashboard />
}
```

2. **Route-Based Migration**: Migrate specific routes first

```tsx
function App() {
  return (
    <Routes>
      <Route path="/dashboard/new" element={<NewDashboard />} />
      <Route path="/dashboard" element={<OldDashboard />} />
    </Routes>
  )
}
```

3. **Component-Level Migration**: Replace components incrementally

```tsx
function Dashboard() {
  return (
    <OldLayout>
      {/* Mix old and new components */}
      <NewDashboardCard title="New Card" />
      <OldCard title="Old Card" />
    </OldLayout>
  )
}
```

## Post-Migration Checklist

- [ ] All components migrated to new system
- [ ] Accessibility tests passing
- [ ] Mobile responsiveness verified
- [ ] Performance benchmarks met
- [ ] Theme consistency maintained
- [ ] Documentation updated
- [ ] Team training completed
- [ ] Old components removed
- [ ] CSS cleanup completed

## Migration Timeline

### Week 1: Setup and Planning
- Install dashboard system
- Set up theming
- Create migration plan
- Set up testing environment

### Week 2-3: Layout Migration
- Migrate main layout components
- Update navigation
- Test responsive behavior

### Week 4-5: Component Migration
- Migrate card components
- Update chart components
- Migrate grid layouts

### Week 6: Enhancement and Testing
- Add accessibility features
- Implement mobile optimizations
- Comprehensive testing

### Week 7: Cleanup and Documentation
- Remove old components
- Update documentation
- Team training

## Support and Resources

### Getting Help

1. **Documentation**: Refer to component API documentation
2. **Examples**: Check Storybook stories for usage examples
3. **Testing**: Use provided test utilities
4. **Community**: Join the dashboard system discussions

### Additional Resources

- [Component API Documentation](./dashboard-component-api.md)
- [Theming Guide](./dashboard-theming-guide.md)
- [Accessibility Guide](./dashboard-accessibility-guide.md)
- [Performance Guide](./dashboard-performance-guide.md)
- [Storybook Examples](../storybook-static/index.html)