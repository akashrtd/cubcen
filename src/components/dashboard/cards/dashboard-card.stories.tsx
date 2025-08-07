import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DashboardCard } from './dashboard-card'
import {
  Activity,
  Users,
  TrendingUp,
  AlertCircle,
  BarChart3,
  PieChart,
} from 'lucide-react'
import { Button } from '../../ui/button'

const meta: Meta<typeof DashboardCard> = {
  title: 'Dashboard/Cards/DashboardCard',
  component: DashboardCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A versatile dashboard card component that supports metrics, icons, loading states, and interactive features. Forms the foundation of the dashboard UI system.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The main title displayed in the card header',
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle text below the title',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Card size variant',
    },
    priority: {
      control: 'select',
      options: ['low', 'medium', 'high', 'critical'],
      description: 'Visual priority level affecting styling',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading skeleton state',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable interactive hover and click states',
    },
  },
}

export default meta
type Story = StoryObj<typeof DashboardCard>

export const Default: Story = {
  args: {
    title: 'Sample Card',
    children: (
      <p className="text-muted-foreground">
        This is a basic dashboard card with default styling.
      </p>
    ),
  },
}

export const WithMetric: Story = {
  args: {
    title: 'Active Agents',
    subtitle: 'Currently running',
    metric: {
      value: 24,
      unit: 'agents',
      trend: 'up',
      trendValue: '+12%',
    },
    icon: Activity,
  },
}

export const WithIcon: Story = {
  args: {
    title: 'Total Users',
    icon: Users,
    children: <p className="text-2xl font-bold">1,247</p>,
  },
}

export const SmallSize: Story = {
  args: {
    title: 'Quick Stat',
    size: 'sm',
    metric: {
      value: 42,
      unit: 'items',
    },
    icon: BarChart3,
  },
}

export const MediumSize: Story = {
  args: {
    title: 'Medium Card',
    size: 'md',
    subtitle: 'Standard size card',
    metric: {
      value: 156,
      unit: 'tasks',
      trend: 'up',
      trendValue: '+8%',
    },
    icon: TrendingUp,
  },
}

export const LargeSize: Story = {
  args: {
    title: 'Large Dashboard Card',
    size: 'lg',
    subtitle: 'Extended information display',
    metric: {
      value: '98.5%',
      trend: 'up',
      trendValue: '+0.3%',
    },
    icon: PieChart,
    children: (
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Success Rate</span>
          <span className="font-medium">98.5%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Error Rate</span>
          <span className="font-medium">1.5%</span>
        </div>
      </div>
    ),
  },
}

export const ExtraLargeSize: Story = {
  args: {
    title: 'Extra Large Card',
    size: 'xl',
    subtitle: 'Maximum size for detailed content',
    icon: AlertCircle,
    children: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">24</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">3</div>
            <div className="text-sm text-muted-foreground">Errors</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Comprehensive system overview with detailed metrics and status
          information.
        </p>
      </div>
    ),
  },
}

export const LowPriority: Story = {
  args: {
    title: 'Low Priority',
    priority: 'low',
    metric: { value: 12, unit: 'items' },
    icon: Activity,
  },
}

export const MediumPriority: Story = {
  args: {
    title: 'Medium Priority',
    priority: 'medium',
    metric: { value: 45, unit: 'tasks', trend: 'up', trendValue: '+5%' },
    icon: TrendingUp,
  },
}

export const HighPriority: Story = {
  args: {
    title: 'High Priority',
    priority: 'high',
    metric: { value: 89, unit: 'alerts', trend: 'up', trendValue: '+15%' },
    icon: AlertCircle,
  },
}

export const CriticalPriority: Story = {
  args: {
    title: 'Critical Alert',
    priority: 'critical',
    metric: { value: 5, unit: 'errors', trend: 'up', trendValue: '+2' },
    icon: AlertCircle,
  },
}

export const LoadingState: Story = {
  args: {
    title: 'Loading Card',
    loading: true,
    icon: Activity,
  },
}

export const ErrorState: Story = {
  args: {
    title: 'Error Card',
    error: 'Failed to load data. Please try again.',
    icon: AlertCircle,
  },
}

export const Interactive: Story = {
  args: {
    title: 'Interactive Card',
    subtitle: 'Click to view details',
    interactive: true,
    metric: {
      value: 156,
      unit: 'items',
      trend: 'up',
      trendValue: '+12%',
    },
    icon: Activity,
    onClick: () => alert('Card clicked!'),
  },
}

export const WithActions: Story = {
  args: {
    title: 'Card with Actions',
    subtitle: 'Includes action buttons',
    metric: {
      value: 42,
      unit: 'tasks',
    },
    icon: Activity,
    actions: (
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          View
        </Button>
        <Button size="sm">Edit</Button>
      </div>
    ),
  },
}

export const TrendUp: Story = {
  args: {
    title: 'Positive Trend',
    metric: {
      value: 1247,
      unit: 'users',
      trend: 'up',
      trendValue: '+15.3%',
    },
    icon: TrendingUp,
  },
}

export const TrendDown: Story = {
  args: {
    title: 'Negative Trend',
    metric: {
      value: 89,
      unit: 'errors',
      trend: 'down',
      trendValue: '-5.2%',
    },
    icon: AlertCircle,
  },
}

export const TrendNeutral: Story = {
  args: {
    title: 'Stable Metric',
    metric: {
      value: 456,
      unit: 'tasks',
      trend: 'neutral',
      trendValue: '0%',
    },
    icon: Activity,
  },
}

export const ResponsiveMobile: Story = {
  args: {
    title: 'Mobile Card',
    subtitle: 'Optimized for mobile',
    metric: {
      value: 24,
      unit: 'agents',
      trend: 'up',
      trendValue: '+12%',
    },
    icon: Activity,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}

export const ResponsiveTablet: Story = {
  args: {
    title: 'Tablet Card',
    subtitle: 'Optimized for tablet',
    metric: {
      value: 156,
      unit: 'tasks',
      trend: 'up',
      trendValue: '+8%',
    },
    icon: TrendingUp,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}

export const DarkTheme: Story = {
  args: {
    title: 'Dark Theme Card',
    subtitle: 'Styled for dark mode',
    metric: {
      value: 89,
      unit: 'items',
      trend: 'up',
      trendValue: '+5%',
    },
    icon: Activity,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}
