# Dashboard Accessibility Guide

## Overview

The Cubcen Dashboard UI system is built with accessibility as a core principle, ensuring that all users, including those using assistive technologies, can effectively interact with dashboard interfaces. This guide covers the comprehensive accessibility features and compliance standards implemented throughout the system.

## WCAG 2.1 AA Compliance

The dashboard system meets or exceeds WCAG 2.1 AA standards across all components and interactions.

### Color Contrast Standards

All color combinations meet the required contrast ratios:

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text (18pt+ or 14pt+ bold)**: Minimum 3:1 contrast ratio
- **Non-text elements**: Minimum 3:1 contrast ratio for UI components and graphics

#### Automatic Contrast Validation

```typescript
import { useDashboardTheme } from '@/components/dashboard/theming/theme-provider'

function ContrastChecker() {
  const { validateContrast, getContrastRatio } = useDashboardTheme()
  
  // Check if colors meet WCAG standards
  const isValid = validateContrast('#3F51B5', '#FFFFFF') // true
  const ratio = getContrastRatio('#3F51B5', '#FFFFFF')   // 8.59:1
  
  return (
    <div>
      <p>Contrast ratio: {ratio.toFixed(2)}:1</p>
      <p>WCAG AA compliant: {isValid ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

### Text and Typography

The typography system ensures optimal readability:

```css
:root {
  /* WCAG compliant font sizes */
  --dashboard-text-sm: 0.875rem;   /* 14px - Minimum for body text */
  --dashboard-text-base: 1rem;     /* 16px - Recommended body text */
  --dashboard-text-2xl: 1.5rem;    /* 24px - Large text threshold */
  --dashboard-text-3xl: 2rem;      /* 32px - Heading text */
  
  /* Optimal line heights for readability */
  --dashboard-line-height-tight: 1.25;    /* Headings */
  --dashboard-line-height-normal: 1.5;    /* Body text */
  --dashboard-line-height-relaxed: 1.75;  /* Long-form content */
}
```

## Keyboard Navigation

### Full Keyboard Support

All interactive elements are accessible via keyboard:

- **Tab**: Navigate between focusable elements
- **Shift + Tab**: Navigate backwards
- **Enter/Space**: Activate buttons and interactive elements
- **Arrow Keys**: Navigate within components (charts, grids)
- **Escape**: Close modals and dropdowns
- **Home/End**: Jump to first/last element in lists

#### Implementation Example

```tsx
import { DashboardCard } from '@/components/dashboard/cards/dashboard-card'

function KeyboardAccessibleCard() {
  return (
    <DashboardCard
      title="Interactive Card"
      interactive={true}
      onClick={() => console.log('Activated via keyboard or mouse')}
      // Keyboard navigation is automatically handled:
      // - Tab to focus
      // - Enter/Space to activate
      // - Proper focus indicators
    />
  )
}
```

### Focus Management

#### Focus Indicators

All focusable elements have clear visual focus indicators:

```css
.dashboard-card:focus-within {
  outline: 2px solid var(--dashboard-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(63, 81, 181, 0.1);
}
```

#### Focus Trapping

Modal dialogs and complex components implement focus trapping:

```tsx
import { FocusManagement } from '@/components/dashboard/accessibility/focus-management'

function ModalDialog({ isOpen, onClose }) {
  return (
    <FocusManagement
      trapFocus={isOpen}
      restoreFocus={true}
      initialFocus="#modal-title"
    >
      <div role="dialog" aria-labelledby="modal-title">
        <h2 id="modal-title">Modal Title</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </FocusManagement>
  )
}
```

### Skip Links

Skip links allow keyboard users to bypass repetitive navigation:

```tsx
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout'

function AccessibleDashboard() {
  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#dashboard-sidebar', label: 'Skip to navigation' },
    { href: '#dashboard-footer', label: 'Skip to footer' }
  ]
  
  return (
    <DashboardLayout
      skipLinks={skipLinks}
      header={<DashboardHeader />}
      sidebar={<DashboardSidebar />}
    >
      <main id="main-content">
        {/* Dashboard content */}
      </main>
    </DashboardLayout>
  )
}
```

## Screen Reader Support

### ARIA Labels and Roles

All components include comprehensive ARIA attributes:

#### Automatic ARIA Labels

```tsx
import { DashboardCard } from '@/components/dashboard/cards/dashboard-card'

function MetricCard() {
  return (
    <DashboardCard
      title="Active Users"
      metric={{
        value: 1234,
        unit: 'users',
        trend: 'up',
        trendValue: '+12%'
      }}
      // Automatically generates ARIA labels:
      // aria-label="Active Users: 1234 users, trending up by 12%"
      // role="region"
      // aria-describedby="card-description"
    />
  )
}
```

#### Chart Accessibility

Charts include comprehensive screen reader support:

```tsx
import { ChartCard } from '@/components/dashboard/cards/chart-card'

function AccessibleChart() {
  const data = {
    datasets: [{
      label: 'Revenue',
      data: [
        { x: 'Q1', y: 10000 },
        { x: 'Q2', y: 12000 },
        { x: 'Q3', y: 11000 }
      ]
    }]
  }
  
  return (
    <ChartCard
      title="Quarterly Revenue"
      chartType="line"
      data={data}
      // Automatically provides:
      // - Chart description for screen readers
      // - Data table alternative
      // - Keyboard navigation for chart elements
      // - Live region announcements for data changes
    />
  )
}
```

### Live Regions

Dynamic content changes are announced to screen readers:

```tsx
import { ScreenReaderAnnouncer } from '@/components/dashboard/accessibility/screen-reader-announcer'

function DynamicContent() {
  const [data, setData] = useState(initialData)
  
  return (
    <div>
      <ScreenReaderAnnouncer
        message={`Data updated: ${data.length} items loaded`}
        priority="polite"
      />
      <DashboardCard
        title="Dynamic Data"
        metric={{ value: data.length, unit: 'items' }}
      />
    </div>
  )
}
```

### Data Announcements

Chart interactions and data updates are announced:

```tsx
import { ChartAnnouncer } from '@/components/dashboard/accessibility/screen-reader-announcer'

function InteractiveChart({ data }) {
  const [selectedPoint, setSelectedPoint] = useState(null)
  
  return (
    <ChartAnnouncer
      chartType="line"
      data={data}
      selectedElement={selectedPoint}
    >
      <ChartCard
        title="Interactive Chart"
        chartType="line"
        data={data}
        onDataClick={(point) => {
          setSelectedPoint(point)
          // Automatically announces: "Selected data point: Q2, $12,000"
        }}
      />
    </ChartAnnouncer>
  )
}
```## Mobil
e Accessibility

### Touch Target Sizes

All interactive elements meet minimum touch target requirements:

```css
/* Minimum 44px touch targets */
.dashboard-card[role="button"] {
  min-height: 44px;
  min-width: 44px;
  padding: 1rem;
}

.mobile-nav-item {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Touch Interactions

Touch gestures are accessible and provide feedback:

```tsx
import { TouchInteraction } from '@/components/dashboard/mobile/touch-interactions'

function TouchAccessibleCard() {
  return (
    <TouchInteraction
      onTap={() => console.log('Tapped')}
      onLongPress={() => console.log('Long pressed')}
      // Provides haptic feedback and visual feedback
      // Announces actions to screen readers
    >
      <DashboardCard
        title="Touch-enabled Card"
        interactive={true}
      />
    </TouchInteraction>
  )
}
```

### Mobile Screen Reader Support

Mobile screen readers (VoiceOver, TalkBack) are fully supported:

```tsx
function MobileAccessibleChart() {
  return (
    <ChartCard
      title="Mobile Chart"
      chartType="bar"
      data={data}
      // Mobile-specific accessibility features:
      // - Swipe gestures for navigation
      // - Tap to hear data values
      // - Alternative data table view
      // - Zoom and pan announcements
    />
  )
}
```

## High Contrast Mode Support

The system adapts to high contrast preferences:

```css
@media (prefers-contrast: high) {
  :root {
    --dashboard-border: #000000;
    --dashboard-text-secondary: var(--dashboard-text-primary);
  }
  
  [data-theme="dark"] {
    --dashboard-border: #FFFFFF;
    --dashboard-text-secondary: var(--dashboard-text-primary);
  }
  
  .dashboard-card {
    border: 2px solid var(--dashboard-border);
  }
}
```

## Reduced Motion Support

Respects user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --dashboard-transition-fast: 0ms;
    --dashboard-transition-normal: 0ms;
    --dashboard-transition-slow: 0ms;
  }
  
  .skeleton-shimmer::before {
    animation: none;
  }
  
  .chart-animation {
    animation: none !important;
  }
}
```

## Testing Accessibility

### Automated Testing

Use jest-axe for automated accessibility testing:

```tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DashboardThemeProvider } from '@/components/dashboard/theming/theme-provider'

expect.extend(toHaveNoViolations)

describe('Dashboard Accessibility', () => {
  test('dashboard layout meets accessibility standards', async () => {
    const { container } = render(
      <DashboardThemeProvider>
        <DashboardLayout>
          <DashboardGrid>
            <DashboardCard title="Test Card" />
          </DashboardGrid>
        </DashboardLayout>
      </DashboardThemeProvider>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  test('interactive elements are keyboard accessible', async () => {
    const { container } = render(
      <DashboardThemeProvider>
        <DashboardCard
          title="Interactive Card"
          interactive={true}
          onClick={() => {}}
        />
      </DashboardThemeProvider>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] All interactive elements are reachable via Tab
- [ ] Tab order is logical and intuitive
- [ ] Focus indicators are clearly visible
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes modals and dropdowns
- [ ] Arrow keys work for component navigation

#### Screen Reader Testing
- [ ] All content is announced correctly
- [ ] Headings create proper document structure
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced
- [ ] Charts have alternative text descriptions

#### Visual Testing
- [ ] Text meets contrast requirements
- [ ] Focus indicators are visible
- [ ] Content is readable at 200% zoom
- [ ] High contrast mode works correctly
- [ ] Color is not the only way to convey information

#### Mobile Testing
- [ ] Touch targets are at least 44px
- [ ] Content is accessible with screen readers
- [ ] Gestures work with assistive technology
- [ ] Orientation changes don't break functionality

### Testing Tools

#### Browser Extensions
- **axe DevTools**: Automated accessibility scanning
- **WAVE**: Web accessibility evaluation
- **Lighthouse**: Accessibility auditing
- **Color Contrast Analyzer**: Contrast ratio checking

#### Screen Readers
- **NVDA** (Windows): Free screen reader
- **JAWS** (Windows): Professional screen reader
- **VoiceOver** (macOS/iOS): Built-in screen reader
- **TalkBack** (Android): Built-in screen reader

#### Testing Commands

```bash
# Run accessibility tests
npm run test:accessibility

# Run with coverage
npm run test:accessibility -- --coverage

# Run specific accessibility test
npm run test -- --testNamePattern="accessibility"
```

## Common Accessibility Patterns

### Error Handling

```tsx
function AccessibleErrorCard() {
  const [error, setError] = useState(null)
  
  return (
    <DashboardCard
      title="Data Card"
      error={error}
      // Error handling includes:
      // - role="alert" for immediate announcement
      // - Clear error description
      // - Suggested actions
      // - Focus management
    />
  )
}
```

### Loading States

```tsx
function AccessibleLoadingCard() {
  const [loading, setLoading] = useState(true)
  
  return (
    <DashboardCard
      title="Loading Card"
      loading={loading}
      // Loading states include:
      // - role="status" for polite announcement
      // - Skeleton animation (respects reduced motion)
      // - Progress indication
      // - Estimated completion time
    />
  )
}
```

### Data Tables

```tsx
function AccessibleDataTable() {
  return (
    <DashboardCard title="Data Table">
      <table role="table" aria-label="User data">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>john@example.com</td>
            <td>
              <span 
                className="status-active"
                aria-label="Status: Active"
              >
                Active
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </DashboardCard>
  )
}
```

## Accessibility API Reference

### ARIA Utilities

```tsx
import { useAriaLabels } from '@/components/dashboard/accessibility/aria-labels'

function ComponentWithARIA() {
  const ariaLabels = useAriaLabels()
  
  return (
    <div
      role="region"
      aria-label={ariaLabels.card.metric('Revenue', 1000, 'dollars', 'up')}
      aria-describedby="card-description"
    >
      <span id="card-description" className="sr-only">
        Revenue metric showing upward trend
      </span>
    </div>
  )
}
```

### Screen Reader Hooks

```tsx
import { useScreenReaderAnnouncer } from '@/components/dashboard/accessibility/screen-reader-announcer'

function AnnouncingComponent() {
  const { announceError, announceSuccess, announceChartInteraction } = useScreenReaderAnnouncer()
  
  const handleDataUpdate = () => {
    announceSuccess('Data updated successfully')
  }
  
  const handleError = (error) => {
    announceError(error.message, 'Data loading')
  }
  
  const handleChartClick = (dataPoint) => {
    announceChartInteraction('Selected', 'data point', dataPoint.value, 'line chart')
  }
  
  return (
    <ChartCard
      onDataClick={handleChartClick}
      onError={handleError}
      onDataUpdate={handleDataUpdate}
    />
  )
}
```

### Focus Management

```tsx
import { FocusManagement } from '@/components/dashboard/accessibility/focus-management'

function FocusExample() {
  return (
    <FocusManagement
      autoFocus={true}
      focusOnMount={true}
      focusSelector="[data-focus-target]"
    >
      <DashboardCard
        title="Auto-focused Card"
        data-focus-target
      />
    </FocusManagement>
  )
}
```

## Best Practices

### Do's

✅ **Use semantic HTML**: Use proper heading hierarchy and semantic elements  
✅ **Provide alternative text**: Include alt text for images and charts  
✅ **Test with keyboard only**: Ensure all functionality works without a mouse  
✅ **Test with screen readers**: Verify content is properly announced  
✅ **Use sufficient color contrast**: Meet WCAG AA standards  
✅ **Provide multiple ways to access information**: Visual, auditory, and tactile  
✅ **Respect user preferences**: Honor reduced motion and high contrast settings  

### Don'ts

❌ **Don't rely on color alone**: Use icons, text, or patterns in addition to color  
❌ **Don't create keyboard traps**: Ensure users can navigate away from components  
❌ **Don't use placeholder text as labels**: Provide proper form labels  
❌ **Don't auto-play media**: Respect user control over audio and video  
❌ **Don't remove focus indicators**: Maintain visible focus states  
❌ **Don't use generic link text**: Provide descriptive link text  
❌ **Don't ignore error states**: Provide clear error messages and recovery paths  

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)

### Testing Tools
- [axe-core](https://github.com/dequelabs/axe-core)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [Pa11y](https://pa11y.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Screen Readers
- [NVDA Download](https://www.nvaccess.org/download/)
- [VoiceOver Guide](https://support.apple.com/guide/voiceover/)
- [JAWS Information](https://www.freedomscientific.com/products/software/jaws/)

The dashboard system's accessibility features ensure that all users can effectively interact with dashboard interfaces, regardless of their abilities or the assistive technologies they use.