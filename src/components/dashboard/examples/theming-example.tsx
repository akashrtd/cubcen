'use client'

import React from 'react'
import {
  DashboardThemeProvider,
  ThemeCustomizer,
  DashboardLayout,
  DashboardGrid,
  DashboardCard,
  MetricCard,
  ChartCard,
} from '@/components/dashboard'

// Sample data for demonstration
const sampleChartData = {
  datasets: [
    {
      label: 'Performance',
      data: [
        { x: 'Jan', y: 65 },
        { x: 'Feb', y: 78 },
        { x: 'Mar', y: 82 },
        { x: 'Apr', y: 91 },
        { x: 'May', y: 87 },
      ],
    },
  ],
}

const sampleMetrics = [
  {
    label: 'Active Agents',
    value: 1234,
    unit: 'agents',
    trend: 'up' as const,
    trendValue: '+12%',
  },
  {
    label: 'Success Rate',
    value: 98.5,
    unit: '%',
    trend: 'up' as const,
    trendValue: '+2.1%',
  },
  {
    label: 'Response Time',
    value: 145,
    unit: 'ms',
    trend: 'down' as const,
    trendValue: '-8ms',
  },
]

interface ThemingExampleProps {
  className?: string
  showCustomizer?: boolean
}

export function ThemingExample({
  className = '',
  showCustomizer = true,
}: ThemingExampleProps) {
  const [showThemeCustomizer, setShowThemeCustomizer] =
    React.useState(showCustomizer)

  return (
    <DashboardThemeProvider
      defaultTheme="system"
      validateContrast={true}
      enableColorSchemeDetection={true}
    >
      <div className={`min-h-screen bg-dashboard-background ${className}`}>
        {/* Theme Customizer Panel */}
        {showThemeCustomizer && (
          <div className="fixed top-4 right-4 w-96 max-h-[90vh] overflow-y-auto z-50">
            <ThemeCustomizer
              onThemeChange={theme => {
                console.log('Theme changed:', theme)
              }}
              onExport={theme => {
                console.log('Theme exported:', theme)
              }}
              onImport={theme => {
                console.log('Theme imported:', theme)
              }}
            />
          </div>
        )}

        {/* Toggle Button for Theme Customizer */}
        <button
          onClick={() => setShowThemeCustomizer(!showThemeCustomizer)}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-dashboard-primary text-white rounded-lg shadow-lg hover:bg-dashboard-secondary transition-colors"
        >
          {showThemeCustomizer ? 'Hide' : 'Show'} Theme Customizer
        </button>

        {/* Main Dashboard Layout */}
        <DashboardLayout
          className="pt-16"
          header={
            <div className="bg-dashboard-surface border-b border-dashboard-border px-6 py-4">
              <h1 className="dashboard-text-h1 text-dashboard-text-primary">
                Dashboard Theming Example
              </h1>
              <p className="dashboard-text-body text-dashboard-text-secondary mt-2">
                This example demonstrates the comprehensive theming system with
                live customization
              </p>
            </div>
          }
        >
          <DashboardGrid className="p-6">
            {/* Metric Cards */}
            <MetricCard
              title="Key Performance Indicators"
              metrics={sampleMetrics}
              className="col-span-12 lg:col-span-8"
              priority="high"
            />

            {/* Status Card */}
            <DashboardCard
              title="System Status"
              icon={() => (
                <div className="w-5 h-5 rounded-full bg-dashboard-status-success" />
              )}
              className="col-span-12 lg:col-span-4"
              priority="medium"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="dashboard-text-label text-dashboard-text-secondary">
                    API Health
                  </span>
                  <span className="dashboard-text-label text-dashboard-status-success font-medium">
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="dashboard-text-label text-dashboard-text-secondary">
                    Database
                  </span>
                  <span className="dashboard-text-label text-dashboard-status-success font-medium">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="dashboard-text-label text-dashboard-text-secondary">
                    Cache
                  </span>
                  <span className="dashboard-text-label text-dashboard-status-warning font-medium">
                    Degraded
                  </span>
                </div>
              </div>
            </DashboardCard>

            {/* Chart Card */}
            <ChartCard
              title="Performance Trends"
              subtitle="Last 5 months"
              chartType="line"
              data={sampleChartData}
              className="col-span-12 lg:col-span-6"
              exportable={true}
              priority="high"
            />

            {/* Color Palette Demo */}
            <DashboardCard
              title="Color Palette Demo"
              className="col-span-12 lg:col-span-6"
              priority="low"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-dashboard-primary rounded-lg mx-auto mb-2" />
                    <span className="dashboard-text-label text-dashboard-text-secondary">
                      Primary
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-dashboard-secondary rounded-lg mx-auto mb-2" />
                    <span className="dashboard-text-label text-dashboard-text-secondary">
                      Secondary
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-dashboard-accent rounded-lg mx-auto mb-2" />
                    <span className="dashboard-text-label text-dashboard-text-secondary">
                      Accent
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-dashboard-status-success rounded-lg mx-auto mb-2" />
                    <span className="dashboard-text-label text-dashboard-text-secondary">
                      Success
                    </span>
                  </div>
                </div>
              </div>
            </DashboardCard>

            {/* Typography Demo */}
            <DashboardCard
              title="Typography Scale Demo"
              className="col-span-12"
              priority="low"
            >
              <div className="space-y-4">
                <div className="dashboard-text-h1 text-dashboard-text-primary">
                  Heading 1 - 32px Bold
                </div>
                <div className="dashboard-text-h2 text-dashboard-text-primary">
                  Heading 2 - 24px Semibold
                </div>
                <div className="dashboard-text-body text-dashboard-text-primary">
                  Body Text - 16px Normal. This is the standard body text used
                  throughout the dashboard for general content and descriptions.
                  It maintains excellent readability and meets WCAG
                  accessibility standards.
                </div>
                <div className="dashboard-text-label text-dashboard-text-secondary">
                  Label Text - 14px Medium. Used for form labels, captions, and
                  secondary information.
                </div>
                <div className="text-dashboard-text-xs text-dashboard-text-disabled">
                  Small Text - 12px Normal. Used for fine print, timestamps, and
                  metadata.
                </div>
              </div>
            </DashboardCard>

            {/* Interactive Elements Demo */}
            <DashboardCard
              title="Interactive Elements"
              className="col-span-12 lg:col-span-6"
              priority="medium"
            >
              <div className="space-y-4">
                <button className="w-full px-4 py-2 bg-dashboard-primary text-white rounded-lg hover:bg-dashboard-secondary transition-colors">
                  Primary Button
                </button>
                <button className="w-full px-4 py-2 border border-dashboard-primary text-dashboard-primary rounded-lg hover:bg-dashboard-primary hover:text-white transition-colors">
                  Secondary Button
                </button>
                <button className="w-full px-4 py-2 bg-dashboard-status-success text-white rounded-lg hover:opacity-90 transition-opacity">
                  Success Button
                </button>
                <button className="w-full px-4 py-2 bg-dashboard-status-error text-white rounded-lg hover:opacity-90 transition-opacity">
                  Error Button
                </button>
              </div>
            </DashboardCard>

            {/* Accessibility Info */}
            <DashboardCard
              title="Accessibility Features"
              className="col-span-12 lg:col-span-6"
              priority="medium"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-dashboard-status-success">✓</span>
                  <span className="dashboard-text-body text-dashboard-text-primary">
                    WCAG 2.1 AA Compliant Colors
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-dashboard-status-success">✓</span>
                  <span className="dashboard-text-body text-dashboard-text-primary">
                    Keyboard Navigation Support
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-dashboard-status-success">✓</span>
                  <span className="dashboard-text-body text-dashboard-text-primary">
                    Screen Reader Compatible
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-dashboard-status-success">✓</span>
                  <span className="dashboard-text-body text-dashboard-text-primary">
                    High Contrast Mode Support
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-dashboard-status-success">✓</span>
                  <span className="dashboard-text-body text-dashboard-text-primary">
                    Reduced Motion Preferences
                  </span>
                </div>
              </div>
            </DashboardCard>
          </DashboardGrid>
        </DashboardLayout>
      </div>
    </DashboardThemeProvider>
  )
}

export default ThemingExample
