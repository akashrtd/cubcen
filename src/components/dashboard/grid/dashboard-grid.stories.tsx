import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DashboardGrid } from './dashboard-grid'
import { GridItem } from './grid-item'
import { DashboardCard } from '../cards/dashboard-card'
import { MetricCard } from '../cards/metric-card'
import { ChartCard } from '../cards/chart-card'
import {
  Activity,
  Users,
  TrendingUp,
  AlertCircle,
  BarChart3,
  PieChart,
} from 'lucide-react'

const meta: Meta<typeof DashboardGrid> = {
  title: 'Dashboard/Grid/DashboardGrid',
  component: DashboardGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A responsive 12-column grid system for organizing dashboard cards. Supports responsive breakpoints, custom column spans, and priority-based ordering.',
      },
    },
  },
  argTypes: {
    columns: {
      control: 'number',
      description: 'Number of columns in the grid',
    },
    gap: {
      control: 'number',
      description: 'Gap between grid items in rem',
    },
    responsive: {
      control: 'object',
      description: 'Responsive column configuration',
    },
    autoFlow: {
      control: 'select',
      options: ['row', 'column', 'dense'],
      description: 'Grid auto-flow behavior',
    },
  },
}

export default meta
type Story = StoryObj<typeof DashboardGrid>

// Sample data for charts
const sampleLineData = {
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

const samplePieData = {
  datasets: [
    {
      label: 'Distribution',
      data: [
        { label: 'n8n', value: 45, color: '#3F51B5' },
        { label: 'Make.com', value: 30, color: '#B19ADA' },
        { label: 'Zapier', value: 20, color: '#FF6B35' },
        { label: 'Other', value: 5, color: '#10B981' },
      ],
    },
  ],
}

export const Default: Story = {
  args: {},
  render: args => (
    <DashboardGrid {...args}>
      <GridItem colSpan={3}>
        <DashboardCard
          title="Active Agents"
          metric={{
            value: 24,
            unit: 'agents',
            trend: 'up',
            trendValue: '+12%',
          }}
          icon={Activity}
        />
      </GridItem>
      <GridItem colSpan={3}>
        <DashboardCard
          title="Total Users"
          metric={{
            value: 1247,
            unit: 'users',
            trend: 'up',
            trendValue: '+5%',
          }}
          icon={Users}
        />
      </GridItem>
      <GridItem colSpan={3}>
        <DashboardCard
          title="Success Rate"
          metric={{ value: '98.5%', trend: 'up', trendValue: '+0.3%' }}
          icon={TrendingUp}
        />
      </GridItem>
      <GridItem colSpan={3}>
        <DashboardCard
          title="Active Alerts"
          metric={{ value: 3, unit: 'alerts', trend: 'down', trendValue: '-2' }}
          icon={AlertCircle}
          priority="critical"
        />
      </GridItem>
    </DashboardGrid>
  ),
}

export const ResponsiveLayout: Story = {
  args: {},
  render: args => (
    <DashboardGrid {...args}>
      <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
        <DashboardCard
          title="Active Agents"
          metric={{
            value: 24,
            unit: 'agents',
            trend: 'up',
            trendValue: '+12%',
          }}
          icon={Activity}
        />
      </GridItem>
      <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
        <DashboardCard
          title="Total Users"
          metric={{
            value: 1247,
            unit: 'users',
            trend: 'up',
            trendValue: '+5%',
          }}
          icon={Users}
        />
      </GridItem>
      <GridItem colSpan={{ desktop: 6, tablet: 4, mobile: 1 }}>
        <ChartCard
          title="Performance Trends"
          chartType="line"
          data={sampleLineData}
          icon={BarChart3}
        />
      </GridItem>
      <GridItem colSpan={{ desktop: 4, tablet: 2, mobile: 1 }}>
        <MetricCard
          title="System Metrics"
          icon={TrendingUp}
          metrics={[
            { label: 'CPU', value: '45%', trend: 'up', trendValue: '+5%' },
            { label: 'Memory', value: '67%', trend: 'down', trendValue: '-3%' },
            { label: 'Disk', value: '23%', trend: 'neutral', trendValue: '0%' },
          ]}
        />
      </GridItem>
      <GridItem colSpan={{ desktop: 4, tablet: 2, mobile: 1 }}>
        <ChartCard
          title="Platform Distribution"
          chartType="pie"
          data={samplePieData}
          icon={PieChart}
        />
      </GridItem>
      <GridItem colSpan={{ desktop: 4, tablet: 2, mobile: 1 }}>
        <DashboardCard
          title="System Health"
          metric={{ value: '99.9%', trend: 'up', trendValue: '+0.1%' }}
          icon={Activity}
          priority="high"
        />
      </GridItem>
    </DashboardGrid>
  ),
}

export const MixedSizes: Story = {
  args: {},
  render: args => (
    <DashboardGrid {...args}>
      <GridItem colSpan={6}>
        <ChartCard
          title="Main Performance Chart"
          subtitle="Primary system metrics"
          chartType="line"
          data={sampleLineData}
          icon={BarChart3}
          size="lg"
        />
      </GridItem>
      <GridItem colSpan={3}>
        <MetricCard
          title="Key Metrics"
          icon={TrendingUp}
          metrics={[
            { label: 'Active', value: 24, unit: 'agents' },
            { label: 'Pending', value: 5, unit: 'tasks' },
          ]}
        />
      </GridItem>
      <GridItem colSpan={3}>
        <DashboardCard
          title="Quick Status"
          metric={{ value: 'Online', trend: 'neutral' }}
          icon={Activity}
          size="sm"
        />
      </GridItem>
      <GridItem colSpan={4}>
        <ChartCard
          title="Distribution"
          chartType="pie"
          data={samplePieData}
          icon={PieChart}
        />
      </GridItem>
      <GridItem colSpan={8}>
        <DashboardCard
          title="Detailed Information"
          subtitle="Extended content area"
          icon={AlertCircle}
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              This is a larger card that spans 8 columns and contains more
              detailed information.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </GridItem>
    </DashboardGrid>
  ),
}

export const PriorityOrdering: Story = {
  args: {},
  render: args => (
    <DashboardGrid {...args}>
      <GridItem colSpan={3} priority="critical">
        <DashboardCard
          title="Critical Alert"
          metric={{ value: 5, unit: 'errors', trend: 'up', trendValue: '+2' }}
          icon={AlertCircle}
          priority="critical"
        />
      </GridItem>
      <GridItem colSpan={3} priority="high">
        <DashboardCard
          title="High Priority"
          metric={{ value: 89, unit: 'tasks', trend: 'up', trendValue: '+15%' }}
          icon={TrendingUp}
          priority="high"
        />
      </GridItem>
      <GridItem colSpan={3} priority="medium">
        <DashboardCard
          title="Medium Priority"
          metric={{ value: 156, unit: 'items', trend: 'up', trendValue: '+5%' }}
          icon={Activity}
          priority="medium"
        />
      </GridItem>
      <GridItem colSpan={3} priority="low">
        <DashboardCard
          title="Low Priority"
          metric={{ value: 42, unit: 'items' }}
          icon={Users}
          priority="low"
        />
      </GridItem>
    </DashboardGrid>
  ),
}

export const CustomGap: Story = {
  args: {
    gap: 2,
  },
  render: args => (
    <DashboardGrid {...args}>
      <GridItem colSpan={4}>
        <DashboardCard title="Card 1" icon={Activity} />
      </GridItem>
      <GridItem colSpan={4}>
        <DashboardCard title="Card 2" icon={Users} />
      </GridItem>
      <GridItem colSpan={4}>
        <DashboardCard title="Card 3" icon={TrendingUp} />
      </GridItem>
    </DashboardGrid>
  ),
}

export const CustomColumns: Story = {
  args: {
    columns: 8,
  },
  render: args => (
    <DashboardGrid {...args}>
      <GridItem colSpan={2}>
        <DashboardCard title="Card 1" icon={Activity} />
      </GridItem>
      <GridItem colSpan={2}>
        <DashboardCard title="Card 2" icon={Users} />
      </GridItem>
      <GridItem colSpan={2}>
        <DashboardCard title="Card 3" icon={TrendingUp} />
      </GridItem>
      <GridItem colSpan={2}>
        <DashboardCard title="Card 4" icon={AlertCircle} />
      </GridItem>
    </DashboardGrid>
  ),
}

export const DenseLayout: Story = {
  args: {
    autoFlow: 'dense',
  },
  render: args => (
    <DashboardGrid {...args}>
      <GridItem colSpan={6} rowSpan={2}>
        <ChartCard
          title="Large Chart"
          chartType="line"
          data={sampleLineData}
          icon={BarChart3}
          size="lg"
        />
      </GridItem>
      <GridItem colSpan={3}>
        <DashboardCard title="Card 1" icon={Activity} />
      </GridItem>
      <GridItem colSpan={3}>
        <DashboardCard title="Card 2" icon={Users} />
      </GridItem>
      <GridItem colSpan={2}>
        <DashboardCard title="Small 1" icon={TrendingUp} size="sm" />
      </GridItem>
      <GridItem colSpan={2}>
        <DashboardCard title="Small 2" icon={AlertCircle} size="sm" />
      </GridItem>
      <GridItem colSpan={2}>
        <DashboardCard title="Small 3" icon={Activity} size="sm" />
      </GridItem>
    </DashboardGrid>
  ),
}

export const MobileLayout: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  render: args => (
    <DashboardGrid {...args}>
      <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
        <DashboardCard
          title="Active Agents"
          metric={{
            value: 24,
            unit: 'agents',
            trend: 'up',
            trendValue: '+12%',
          }}
          icon={Activity}
        />
      </GridItem>
      <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
        <DashboardCard
          title="Total Users"
          metric={{
            value: 1247,
            unit: 'users',
            trend: 'up',
            trendValue: '+5%',
          }}
          icon={Users}
        />
      </GridItem>
      <GridItem colSpan={{ desktop: 6, tablet: 4, mobile: 1 }}>
        <ChartCard
          title="Performance"
          chartType="line"
          data={sampleLineData}
          icon={BarChart3}
        />
      </GridItem>
      <GridItem colSpan={{ desktop: 6, tablet: 4, mobile: 1 }}>
        <ChartCard
          title="Distribution"
          chartType="pie"
          data={samplePieData}
          icon={PieChart}
        />
      </GridItem>
    </DashboardGrid>
  ),
}

export const TabletLayout: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  render: args => (
    <DashboardGrid {...args}>
      <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
        <DashboardCard
          title="Active Agents"
          metric={{
            value: 24,
            unit: 'agents',
            trend: 'up',
            trendValue: '+12%',
          }}
          icon={Activity}
        />
      </GridItem>
      <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
        <DashboardCard
          title="Total Users"
          metric={{
            value: 1247,
            unit: 'users',
            trend: 'up',
            trendValue: '+5%',
          }}
          icon={Users}
        />
      </GridItem>
      <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
        <DashboardCard
          title="Success Rate"
          metric={{ value: '98.5%', trend: 'up', trendValue: '+0.3%' }}
          icon={TrendingUp}
        />
      </GridItem>
      <GridItem colSpan={{ desktop: 6, tablet: 4, mobile: 1 }}>
        <ChartCard
          title="Performance Trends"
          chartType="line"
          data={sampleLineData}
          icon={BarChart3}
        />
      </GridItem>
      <GridItem colSpan={{ desktop: 6, tablet: 2, mobile: 1 }}>
        <ChartCard
          title="Distribution"
          chartType="pie"
          data={samplePieData}
          icon={PieChart}
        />
      </GridItem>
    </DashboardGrid>
  ),
}
