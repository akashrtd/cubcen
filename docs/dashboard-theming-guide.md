# Dashboard Theming System Guide

## Overview

The Cubcen Dashboard theming system provides a comprehensive, flexible approach to customizing the visual appearance of dashboard components while maintaining accessibility standards and brand consistency.

## Core Concepts

### CSS Variables Architecture

The theming system is built on CSS custom properties (variables) that provide:

- **Runtime Theme Switching**: Change themes without page reload
- **Cascade Support**: Variables inherit and can be overridden at any level
- **Performance**: No JavaScript required for style application
- **Browser Support**: Works in all modern browsers

### Theme Layers

1. **Base Layer**: Default Cubcen brand colors and typography
2. **System Layer**: Light/dark mode adaptations
3. **Custom Layer**: User-defined theme overrides
4. **Component Layer**: Component-specific customizations

## Color System

### Brand Colors

```css
:root {
  --dashboard-primary: #3f51b5; /* Cubcen Indigo */
  --dashboard-secondary: #b19ada; /* Cubcen Light Purple */
  --dashboard-accent: #ff6b35; /* Cubcen Orange */
}
```

### Semantic Colors

```css
:root {
  --dashboard-success: #10b981; /* Green */
  --dashboard-warning: #f59e0b; /* Amber */
  --dashboard-error: #ef4444; /* Red */
  --dashboard-info: #3b82f6; /* Blue */
}
```

### Surface Colors

```css
:root {
  --dashboard-background: #ffffff; /* Page background */
  --dashboard-surface: #f8f9fa; /* Card backgrounds */
  --dashboard-border: #e5e7eb; /* Borders and dividers */
}
```

### Text Colors

```css
:root {
  --dashboard-text-primary: #1a1a1a; /* Main text */
  --dashboard-text-secondary: #6b7280; /* Secondary text */
  --dashboard-text-disabled: #9ca3af; /* Disabled text */
}
```

## Typography System

### Font Scale

The typography system follows a modular scale based on WCAG accessibility guidelines:

```css
:root {
  --dashboard-text-xs: 0.75rem; /* 12px */
  --dashboard-text-sm: 0.875rem; /* 14px - Labels */
  --dashboard-text-base: 1rem; /* 16px - Body text */
  --dashboard-text-lg: 1.125rem; /* 18px */
  --dashboard-text-xl: 1.25rem; /* 20px */
  --dashboard-text-2xl: 1.5rem; /* 24px - H2 Semibold */
  --dashboard-text-3xl: 2rem; /* 32px - H1 Bold */
}
```

### Font Weights

```css
:root {
  --dashboard-font-normal: 400; /* Regular text */
  --dashboard-font-medium: 500; /* Emphasized text */
  --dashboard-font-semibold: 600; /* Headings */
  --dashboard-font-bold: 700; /* Strong emphasis */
}
```

### Line Heights

```css
:root {
  --dashboard-line-height-tight: 1.25; /* Headings */
  --dashboard-line-height-normal: 1.5; /* Body text */
  --dashboard-line-height-relaxed: 1.75; /* Long-form content */
}
```

## Spacing System

### Grid Spacing

```css
:root {
  --dashboard-grid-gap: 1.5rem; /* 24px - Grid gap */
  --dashboard-section-margin: 2rem; /* 32px - Section spacing */
  --dashboard-component-spacing: 1rem; /* 16px - Component spacing */
}
```

### Card Spacing

````css
:root {
  --dashboard-card-padding: 1.5rem; /* Default card padding */
  --dashboard-card-sm-padding: 1rem; /* Small card padding */
  --dashboard-card-lg-padding: 2rem; /* Large card padding */
  --dashboard-card-xl-padding: 2.5rem; /* Extra large card padding */
}
```## 
Chart Color System

### Chart Palette

The dashboard provides a 10-color palette optimized for data visualization:

```css
:root {
  --dashboard-chart-1: #3f51b5; /* Primary */
  --dashboard-chart-2: #b19ada; /* Secondary */
  --dashboard-chart-3: #ff6b35; /* Accent */
  --dashboard-chart-4: #10b981; /* Success */
  --dashboard-chart-5: #f59e0b; /* Warning */
  --dashboard-chart-6: #ef4444; /* Error */
  --dashboard-chart-7: #3b82f6; /* Info */
  --dashboard-chart-8: #8b5cf6; /* Purple */
  --dashboard-chart-9: #ec4899; /* Pink */
  --dashboard-chart-10: #14b8a6; /* Teal */
}
````

### Chart Gradients

```css
:root {
  --dashboard-gradient-primary: linear-gradient(
    135deg,
    #3f51b5 0%,
    #b19ada 100%
  );
  --dashboard-gradient-success: linear-gradient(
    135deg,
    #10b981 0%,
    #34d399 100%
  );
  --dashboard-gradient-warning: linear-gradient(
    135deg,
    #f59e0b 0%,
    #fbbf24 100%
  );
  --dashboard-gradient-error: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
}
```

## Dark Theme Implementation

### Automatic Dark Mode

The system automatically detects system preferences and applies appropriate themes:

```typescript
// Theme provider automatically detects system preference
<DashboardThemeProvider defaultTheme="system">
  <App />
</DashboardThemeProvider>
```

### Dark Theme Variables

```css
[data-theme='dark'] {
  --dashboard-background: #0f172a; /* Dark slate */
  --dashboard-surface: #1e293b; /* Lighter slate */
  --dashboard-border: #334155; /* Slate border */

  --dashboard-text-primary: #f1f5f9; /* Light text */
  --dashboard-text-secondary: #cbd5e1; /* Muted light text */
  --dashboard-text-disabled: #64748b; /* Disabled light text */
}
```

## Responsive Design

### Breakpoint Variables

```css
:root {
  --dashboard-mobile: 768px; /* Mobile breakpoint */
  --dashboard-tablet: 1024px; /* Tablet breakpoint */
  --dashboard-desktop: 1280px; /* Desktop breakpoint */
  --dashboard-wide: 1536px; /* Wide screen breakpoint */
}
```

### Mobile Adaptations

```css
@media (max-width: 768px) {
  :root {
    --dashboard-grid-gap: 1rem; /* Reduced gap */
    --dashboard-card-padding: 1rem; /* Reduced padding */
    --dashboard-section-margin: 1rem; /* Reduced margin */
  }
}
```

## Animation System

### Transition Durations

```css
:root {
  --dashboard-transition-fast: 150ms ease-out; /* Quick interactions */
  --dashboard-transition-normal: 250ms ease-out; /* Standard transitions */
  --dashboard-transition-slow: 350ms ease-out; /* Complex animations */
}
```

### Easing Functions

```css
:root {
  --dashboard-ease: cubic-bezier(0.4, 0, 0.2, 1); /* Standard easing */
  --dashboard-ease-in: cubic-bezier(0.4, 0, 1, 1); /* Ease in */
  --dashboard-ease-out: cubic-bezier(0, 0, 0.2, 1); /* Ease out */
  --dashboard-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* Ease in-out */
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --dashboard-transition-fast: 0ms;
    --dashboard-transition-normal: 0ms;
    --dashboard-transition-slow: 0ms;
  }
}
```

## Custom Theme Creation

### Step-by-Step Guide

#### 1. Define Your Color Palette

```typescript
const customColors = {
  primary: '#2563EB', // Custom blue
  secondary: '#7C3AED', // Custom purple
  accent: '#DC2626', // Custom red
  background: '#FAFAFA', // Custom background
  surface: '#FFFFFF', // Custom surface
}
```

#### 2. Create Theme Object

```typescript
const myTheme: Partial<DashboardTheme> = {
  colors: {
    ...customColors,
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    status: {
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#2563EB',
    },
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
        '#BE185D',
        '#0F766E',
      ],
    },
  },
}
```

#### 3. Apply Theme

```tsx
import { DashboardThemeProvider } from '@/components/dashboard/theming/theme-provider'

function App() {
  return (
    <DashboardThemeProvider theme={myTheme} validateContrast={true}>
      <YourDashboard />
    </DashboardThemeProvider>
  )
}
```

#### 4. Use in Components

````tsx
function CustomCard() {
  return (
    <div className="bg-dashboard-surface text-dashboard-text-primary p-dashboard-card-padding">
      <h2 className="text-dashboard-text-2xl font-dashboard-font-semibold">
        Custom Themed Card
      </h2>
    </div>
  )
}
```#
# Advanced Theming Techniques

### Component-Specific Themes

You can create themes that only apply to specific components:

```css
.analytics-dashboard {
  --dashboard-primary: #059669;    /* Green for analytics */
  --dashboard-chart-1: #059669;
  --dashboard-chart-2: #0D9488;
  --dashboard-chart-3: #14B8A6;
}

.error-dashboard {
  --dashboard-primary: #DC2626;    /* Red for errors */
  --dashboard-chart-1: #DC2626;
  --dashboard-chart-2: #EF4444;
  --dashboard-chart-3: #F87171;
}
````

### Dynamic Theme Switching

```typescript
function ThemeSwitcher() {
  const { setDashboardTheme } = useDashboardTheme()

  const applyAnalyticsTheme = () => {
    setDashboardTheme({
      colors: {
        primary: '#059669',
        chart: {
          palette: ['#059669', '#0D9488', '#14B8A6', '#2DD4BF']
        }
      }
    })
  }

  const applyErrorTheme = () => {
    setDashboardTheme({
      colors: {
        primary: '#DC2626',
        chart: {
          palette: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5']
        }
      }
    })
  }

  return (
    <div>
      <button onClick={applyAnalyticsTheme}>Analytics Theme</button>
      <button onClick={applyErrorTheme}>Error Theme</button>
    </div>
  )
}
```

### CSS-in-JS Integration

For dynamic styling with CSS-in-JS libraries:

```typescript
import styled from 'styled-components'

const ThemedCard = styled.div`
  background-color: var(--dashboard-surface);
  color: var(--dashboard-text-primary);
  border: 1px solid var(--dashboard-border);
  border-radius: var(--dashboard-radius-lg);
  padding: var(--dashboard-card-padding);
  transition: box-shadow var(--dashboard-transition-normal);

  &:hover {
    box-shadow: var(--dashboard-shadow-md);
  }

  .metric-value {
    font-size: var(--dashboard-text-2xl);
    font-weight: var(--dashboard-font-bold);
    color: var(--dashboard-primary);
  }
`
```

## Accessibility Considerations

### Color Contrast Validation

The theming system automatically validates color combinations:

```typescript
const { validateContrast, getContrastRatio } = useDashboardTheme()

// Validate text on background
const textContrast = validateContrast('#1A1A1A', '#FFFFFF') // true (21:1 ratio)

// Validate interactive elements
const buttonContrast = validateContrast('#3F51B5', '#FFFFFF') // true (8.59:1 ratio)

// Get exact ratio
const ratio = getContrastRatio('#6B7280', '#F8F9FA') // 4.52:1
```

### High Contrast Mode Support

```css
@media (prefers-contrast: high) {
  :root {
    --dashboard-border: #000000;
    --dashboard-text-secondary: var(--dashboard-text-primary);
  }

  [data-theme='dark'] {
    --dashboard-border: #ffffff;
    --dashboard-text-secondary: var(--dashboard-text-primary);
  }
}
```

### Focus Indicators

```css
.dashboard-card:focus-within {
  outline: 2px solid var(--dashboard-primary);
  outline-offset: 2px;
}
```

## Performance Optimization

### CSS Variable Caching

The theme provider caches CSS variable updates to prevent unnecessary DOM manipulations:

```typescript
// Efficient theme updates
const updateTheme = useCallback(
  (newColors: Partial<Colors>) => {
    setDashboardTheme(prevTheme => ({
      ...prevTheme,
      colors: { ...prevTheme.colors, ...newColors },
    }))
  },
  [setDashboardTheme]
)
```

### Minimal Repaints

CSS variables minimize repaints by avoiding JavaScript style updates:

```css
/* Good: Uses CSS variables */
.card {
  background-color: var(--dashboard-surface);
  transition: background-color var(--dashboard-transition-normal);
}

/* Avoid: Direct style manipulation */
.card.dynamic-bg {
  background-color: #f8f9fa; /* Hard-coded value */
}
```

## Troubleshooting

### Common Issues

#### Theme Not Applying

1. **Check Provider Wrapper**: Ensure components are wrapped in `DashboardThemeProvider`
2. **Verify CSS Import**: Import the dashboard variables CSS file
3. **Check CSS Specificity**: Ensure custom styles don't override theme variables

#### Contrast Warnings

```typescript
// Enable contrast validation to see warnings
<DashboardThemeProvider validateContrast={true}>
  <App />
</DashboardThemeProvider>
```

#### Dark Mode Not Working

1. **Check System Detection**: Ensure `enableColorSchemeDetection={true}`
2. **Verify Data Attribute**: Check that `data-theme` attribute is set on `<html>`
3. **CSS Selector**: Ensure dark theme CSS uses `[data-theme="dark"]` selector

### Debug Tools

```typescript
function ThemeDebugger() {
  const { dashboardTheme, resolvedTheme, getContrastRatio } = useDashboardTheme()

  return (
    <div>
      <h3>Current Theme: {resolvedTheme}</h3>
      <h3>Primary Color: {dashboardTheme.colors.primary}</h3>
      <h3>Text Contrast: {getContrastRatio(
        dashboardTheme.colors.text.primary,
        dashboardTheme.colors.background
      ).toFixed(2)}:1</h3>
    </div>
  )
}
```

## Best Practices

1. **Use Semantic Colors**: Prefer semantic color names over specific hues
2. **Test Accessibility**: Always validate contrast ratios
3. **Support System Preferences**: Respect user's dark mode preference
4. **Minimize Custom CSS**: Use theme variables instead of hard-coded values
5. **Document Custom Themes**: Provide clear documentation for custom themes
6. **Test Across Devices**: Verify themes work on different screen sizes
7. **Performance First**: Use CSS variables for runtime theme switching
