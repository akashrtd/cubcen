import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MetricCard } from '../metric-card'
import { Activity } from 'lucide-react'

expect.extend(toHaveNoViolations)

describe('MetricCard', () => {
  const mockMetrics = [
    {
      label: 'Total Users',
      value: 1234,
      unit: 'users',
      trend: 'up' as const,
      trendValue: '+12%',
      color: '#3F51B5'
    },
    {
      label: 'Active Sessions',
      value: 567,
      unit: 'sessions',
      trend: 'down' as const,
      trendValue: '-5%'
    },
    {
      label: 'Revenue',
      value: '$89,123',
      trend: 'neutral' as const,
      trendValue: '0%'
    }
  ]

  describe('Basic Rendering', () => {
    it('renders with title and metrics', () => {
      render(
        <MetricCard
          title="KPI Dashboard"
          metrics={mockMetrics}
        />
      )
      
      expect(screen.getByText('KPI Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('1234')).toBeInTheDocument()
      expect(screen.getByText('users')).toBeInTheDocument()
      expect(screen.getByText('Active Sessions')).toBeInTheDocument()
      expect(screen.getByText('567')).toBeInTheDocument()
    })

    it('renders with icon', () => {
      render(
        <MetricCard
          title="Metrics"
          icon={Activity}
          metrics={mockMetrics}
        />
      )
      
      expect(screen.getByText('Metrics')).toBeInTheDocument()
      const icon = document.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('renders empty state when no metrics provided', () => {
      render(
        <MetricCard
          title="Empty Metrics"
          metrics={[]}
        />
      )
      
      expect(screen.getByText('Empty Metrics')).toBeInTheDocument()
      expect(screen.queryByText('Total Users')).not.toBeInTheDocument()
    })
  })

  describe('Layout Variants', () => {
    it('renders vertical layout by default', () => {
      render(
        <MetricCard
          title="Vertical Layout"
          metrics={mockMetrics}
        />
      )
      
      const container = document.querySelector('.flex.flex-col.space-y-4')
      expect(container).toBeInTheDocument()
    })

    it('renders horizontal layout', () => {
      render(
        <MetricCard
          title="Horizontal Layout"
          metrics={mockMetrics}
          layout="horizontal"
        />
      )
      
      const container = document.querySelector('.flex.flex-row.items-center.justify-between')
      expect(container).toBeInTheDocument()
    })

    it('renders grid layout', () => {
      render(
        <MetricCard
          title="Grid Layout"
          metrics={mockMetrics}
          layout="grid"
        />
      )
      
      const container = document.querySelector('.grid')
      expect(container).toBeInTheDocument()
    })

    it('applies correct grid columns based on metric count', () => {
      const { rerender } = render(
        <MetricCard
          title="Grid Layout"
          metrics={mockMetrics.slice(0, 2)}
          layout="grid"
        />
      )
      
      expect(document.querySelector('.grid-cols-2')).toBeInTheDocument()

      rerender(
        <MetricCard
          title="Grid Layout"
          metrics={mockMetrics}
          layout="grid"
        />
      )
      
      expect(document.querySelector('.grid-cols-3')).toBeInTheDocument()
    })
  })

  describe('Trend Indicators', () => {
    it('renders up trend with correct styling and icon', () => {
      render(
        <MetricCard
          title="Trend Test"
          metrics={[mockMetrics[0]]}
        />
      )
      
      const trendElement = screen.getByLabelText('Total Users trend: up, +12%')
      expect(trendElement).toBeInTheDocument()
      expect(trendElement).toHaveClass('text-green-600')
    })

    it('renders down trend with correct styling and icon', () => {
      render(
        <MetricCard
          title="Trend Test"
          metrics={[mockMetrics[1]]}
        />
      )
      
      const trendElement = screen.getByLabelText('Active Sessions trend: down, -5%')
      expect(trendElement).toBeInTheDocument()
      expect(trendElement).toHaveClass('text-red-600')
    })

    it('renders neutral trend with correct styling and icon', () => {
      render(
        <MetricCard
          title="Trend Test"
          metrics={[mockMetrics[2]]}
        />
      )
      
      const trendElement = screen.getByLabelText('Revenue trend: neutral, 0%')
      expect(trendElement).toBeInTheDocument()
      expect(trendElement).toHaveClass('text-gray-600')
    })

    it('does not render trend when not provided', () => {
      const metricWithoutTrend = {
        label: 'Simple Metric',
        value: 100
      }
      
      render(
        <MetricCard
          title="No Trend"
          metrics={[metricWithoutTrend]}
        />
      )
      
      expect(screen.queryByLabelText(/trend:/)).not.toBeInTheDocument()
    })
  })

  describe('Custom Colors', () => {
    it('applies custom colors to metric values', () => {
      render(
        <MetricCard
          title="Custom Colors"
          metrics={[mockMetrics[0]]}
        />
      )
      
      const valueElement = screen.getByText('1234')
      expect(valueElement).toHaveStyle({ color: '#3F51B5' })
    })
  })

  describe('Loading and Error States', () => {
    it('renders loading state', () => {
      render(
        <MetricCard
          title="Loading Card"
          metrics={mockMetrics}
          loading
        />
      )
      
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.queryByText('Total Users')).not.toBeInTheDocument()
    })

    it('renders error state', () => {
      render(
        <MetricCard
          title="Error Card"
          metrics={mockMetrics}
          error="Failed to load metrics"
        />
      )
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Failed to load metrics')).toBeInTheDocument()
      expect(screen.queryByText('Total Users')).not.toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('handles long metric labels gracefully', () => {
      const longLabelMetric = {
        label: 'This is a very long metric label that should be handled gracefully',
        value: 100
      }
      
      render(
        <MetricCard
          title="Long Labels"
          metrics={[longLabelMetric]}
        />
      )
      
      const label = screen.getByText(/This is a very long metric label/)
      expect(label).toHaveClass('truncate')
    })

    it('handles different value types', () => {
      const mixedMetrics = [
        { label: 'Number', value: 1234 },
        { label: 'String', value: '1.2K' },
        { label: 'Currency', value: '$89,123' },
        { label: 'Percentage', value: '95%' }
      ]
      
      render(
        <MetricCard
          title="Mixed Values"
          metrics={mixedMetrics}
        />
      )
      
      expect(screen.getByText('1234')).toBeInTheDocument()
      expect(screen.getByText('1.2K')).toBeInTheDocument()
      expect(screen.getByText('$89,123')).toBeInTheDocument()
      expect(screen.getByText('95%')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('meets WCAG accessibility standards', async () => {
      const { container } = render(
        <MetricCard
          title="Accessible Metrics"
          subtitle="Test metrics"
          icon={Activity}
          metrics={mockMetrics}
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('provides proper ARIA labels for trends', () => {
      render(
        <MetricCard
          title="Trend Accessibility"
          metrics={mockMetrics}
        />
      )
      
      expect(screen.getByLabelText('Total Users trend: up, +12%')).toBeInTheDocument()
      expect(screen.getByLabelText('Active Sessions trend: down, -5%')).toBeInTheDocument()
      expect(screen.getByLabelText('Revenue trend: neutral, 0%')).toBeInTheDocument()
    })
  })

  describe('Custom Content', () => {
    it('renders additional children content', () => {
      render(
        <MetricCard
          title="Custom Content"
          metrics={mockMetrics}
        >
          <div>Additional content</div>
        </MetricCard>
      )
      
      expect(screen.getByText('Additional content')).toBeInTheDocument()
    })

    it('renders custom actions', () => {
      render(
        <MetricCard
          title="Custom Actions"
          metrics={mockMetrics}
          actions={<button>Custom Action</button>}
        />
      )
      
      expect(screen.getByRole('button', { name: 'Custom Action' })).toBeInTheDocument()
    })
  })
})