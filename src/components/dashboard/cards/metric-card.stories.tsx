import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MetricCard } from './metric-card'
import {
  Activity,
  Users,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Clock,
} from 'lucide-react'

const meta: Meta<typeof MetricCard> = {
  title: 'Dashboard/Cards/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A specialized card component for displaying KPI metrics with trend indicators, multiple metric support, and flexible layouts.',
      },
    },
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['horizontal', 'vertical', 'grid'],
      description: 'Layout arrangement for multiple metrics',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Card size variant',
    },
    priority: {
      control: 'select',
      options: ['low', 'medium', 'high', 'critical'],
      description: 'Visual priority level',
    },
  },
}

export default meta
type Story = StoryObj<typeof MetricCard>

export const SingleMetric: Story = {
  args: {
    title: 'Active Agents',
    subtitle: 'Currently running',
    icon: Activity,
    metrics: [
      {
        label: 'Total',
        value: 24,
        unit: 'agents',
        trend: 'up',
        trendValue: '+12%',
        color: '#3F51B5',
      },
    ],
  },
}

export const MultipleMetricsHorizontal: Story = {
  args: {
    title: 'System Performance',
    subtitle: 'Key performance indicators',
    icon: TrendingUp,
    layout: 'horizontal',
    metrics: [
      {
        label: 'Success Rate',
        value: '98.5%',
        trend: 'up',
        trendValue: '+0.3%',
        color: '#10B981',
      },
      {
        label: 'Error Rate',
        value: '1.5%',
        trend: 'down',
        trendValue: '-0.2%',
        color: '#EF4444',
      },
      {
        label: 'Response Time',
        value: 245,
        unit: 'ms',
        trend: 'down',
        trendValue: '-15ms',
        color: '#F59E0B',
      },
    ],
  },
}

export const MultipleMetricsVertical: Story = {
  args: {
    title: 'User Analytics',
    subtitle: 'User engagement metrics',
    icon: Users,
    layout: 'vertical',
    metrics: [
      {
        label: 'Total Users',
        value: 1247,
        unit: 'users',
        trend: 'up',
        trendValue: '+5.2%',
        color: '#3F51B5',
      },
      {
        label: 'Active Sessions',
        value: 89,
        unit: 'sessions',
        trend: 'up',
        trendValue: '+12%',
        color: '#B19ADA',
      },
      {
        label: 'Avg. Session Duration',
        value: '4m 32s',
        trend: 'up',
        trendValue: '+45s',
        color: '#FF6B35',
      },
    ],
  },
}

export const GridLayout: Story = {
  args: {
    title: 'Financial Overview',
    subtitle: 'Revenue and cost metrics',
    icon: DollarSign,
    layout: 'grid',
    size: 'lg',
    metrics: [
      {
        label: 'Revenue',
        value: '$12,450',
        trend: 'up',
        trendValue: '+8.5%',
        color: '#10B981',
      },
      {
        label: 'Costs',
        value: '$3,200',
        trend: 'up',
        trendValue: '+2.1%',
        color: '#EF4444',
      },
      {
        label: 'Profit',
        value: '$9,250',
        trend: 'up',
        trendValue: '+12.3%',
        color: '#3F51B5',
      },
      {
        label: 'Margin',
        value: '74.3%',
        trend: 'up',
        trendValue: '+1.8%',
        color: '#F59E0B',
      },
    ],
  },
}

export const SmallSize: Story = {
  args: {
    title: 'Quick Stats',
    size: 'sm',
    icon: Activity,
    metrics: [
      {
        label: 'Active',
        value: 24,
        trend: 'up',
        trendValue: '+2',
      },
    ],
  },
}

export const LargeSize: Story = {
  args: {
    title: 'Detailed Analytics',
    subtitle: 'Comprehensive system metrics',
    size: 'lg',
    icon: TrendingUp,
    layout: 'vertical',
    metrics: [
      {
        label: 'Total Requests',
        value: 45678,
        unit: 'requests',
        trend: 'up',
        trendValue: '+15.3%',
        color: '#3F51B5',
      },
      {
        label: 'Average Response Time',
        value: 234,
        unit: 'ms',
        trend: 'down',
        trendValue: '-12ms',
        color: '#10B981',
      },
      {
        label: 'Error Rate',
        value: '0.8%',
        trend: 'down',
        trendValue: '-0.3%',
        color: '#EF4444',
      },
      {
        label: 'Uptime',
        value: '99.9%',
        trend: 'neutral',
        trendValue: '0%',
        color: '#F59E0B',
      },
    ],
  },
}

export const HighPriority: Story = {
  args: {
    title: 'Critical Metrics',
    subtitle: 'Requires immediate attention',
    priority: 'high',
    icon: AlertCircle,
    metrics: [
      {
        label: 'System Load',
        value: '89%',
        trend: 'up',
        trendValue: '+15%',
        color: '#EF4444',
      },
      {
        label: 'Memory Usage',
        value: '76%',
        trend: 'up',
        trendValue: '+8%',
        color: '#F59E0B',
      },
    ],
  },
}

export const CriticalPriority: Story = {
  args: {
    title: 'System Alerts',
    subtitle: 'Critical system status',
    priority: 'critical',
    icon: AlertCircle,
    metrics: [
      {
        label: 'Failed Tasks',
        value: 12,
        unit: 'tasks',
        trend: 'up',
        trendValue: '+5',
        color: '#EF4444',
      },
      {
        label: 'Error Rate',
        value: '5.2%',
        trend: 'up',
        trendValue: '+2.1%',
        color: '#EF4444',
      },
    ],
  },
}

export const LoadingState: Story = {
  args: {
    title: 'Loading Metrics',
    loading: true,
    icon: Activity,
    metrics: [
      {
        label: 'Loading...',
        value: 0,
        unit: 'items',
      },
    ],
  },
}

export const ErrorState: Story = {
  args: {
    title: 'Error Loading Metrics',
    error: 'Failed to fetch metric data. Please try again.',
    icon: AlertCircle,
    metrics: [
      {
        label: 'Unavailable',
        value: 0,
        unit: 'items',
      },
    ],
  },
}

export const TimeBasedMetrics: Story = {
  args: {
    title: 'Time Analytics',
    subtitle: 'Time-based performance metrics',
    icon: Clock,
    layout: 'horizontal',
    metrics: [
      {
        label: 'Avg. Processing Time',
        value: '2.3s',
        trend: 'down',
        trendValue: '-0.5s',
        color: '#10B981',
      },
      {
        label: 'Queue Wait Time',
        value: '45ms',
        trend: 'down',
        trendValue: '-12ms',
        color: '#3F51B5',
      },
      {
        label: 'Total Uptime',
        value: '99.8%',
        trend: 'up',
        trendValue: '+0.1%',
        color: '#F59E0B',
      },
    ],
  },
}

export const ResponsiveMobile: Story = {
  args: {
    title: 'Mobile Metrics',
    subtitle: 'Optimized for mobile viewing',
    icon: Activity,
    layout: 'vertical',
    metrics: [
      {
        label: 'Active Users',
        value: 156,
        unit: 'users',
        trend: 'up',
        trendValue: '+12%',
      },
      {
        label: 'Sessions',
        value: 89,
        unit: 'sessions',
        trend: 'up',
        trendValue: '+8%',
      },
    ],
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}

export const DarkTheme: Story = {
  args: {
    title: 'Dark Theme Metrics',
    subtitle: 'Styled for dark mode',
    icon: TrendingUp,
    layout: 'horizontal',
    metrics: [
      {
        label: 'Performance',
        value: '95%',
        trend: 'up',
        trendValue: '+3%',
        color: '#10B981',
      },
      {
        label: 'Efficiency',
        value: '87%',
        trend: 'up',
        trendValue: '+5%',
        color: '#3F51B5',
      },
    ],
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}
