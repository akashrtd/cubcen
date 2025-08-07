import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DashboardLayout } from './layout/dashboard-layout'
import { DashboardSidebar } from './layout/dashboard-sidebar'
import { MobileNavigation } from './layout/mobile-navigation'
import { DashboardThemeProvider } from './theming/theme-provider'
import { DashboardGrid } from './grid/dashboard-grid'
import { GridItem } from './grid/grid-item'
import { DashboardCard } from './cards/dashboard-card'
import { MetricCard } from './cards/metric-card'
import { ChartCard } from './cards/chart-card'
import { DataTableCard } from './cards/data-table-card'
import { FilterProvider } from './filters/filter-context'
import {
  Activity,
  Users,
  TrendingUp,
  AlertCircle,
  BarChart3,
  PieChart,
  Server,
  Clock,
  DollarSign,
  Zap,
} from 'lucide-react'
import { Button } from '../ui/button'

const meta: Meta = {
  title: 'Dashboard/Overview/Complete Dashboard',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive demonstration of the complete modular dashboard UI system with all components, theming, responsive design, and interactive features.',
      },
    },
  },
}

export default meta
type Story = StoryObj

// Sample data for comprehensive dashboard
const performanceData = {
  datasets: [
    {
      label: 'Agent Performance',
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
    {
      label: 'System Load',
      data: [
        { x: 'Jan', y: 45 },
        { x: 'Feb', y: 52 },
        { x: 'Mar', y: 48 },
        { x: 'Apr', y: 61 },
        { x: 'May', y: 55 },
        { x: 'Jun', y: 67 },
      ],
      color: '#B19ADA',
    },
  ],
}

const platformDistribution = {
  datasets: [
    {
      label: 'Platform Distribution',
      data: [
        { label: 'n8n', value: 45, color: '#3F51B5' },
        { label: 'Make.com', value: 30, color: '#B19ADA' },
        { label: 'Zapier', value: 20, color: '#FF6B35' },
        { label: 'Other', value: 5, color: '#10B981' },
      ],
    },
  ],
}

const taskCompletionData = {
  datasets: [
    {
      label: 'Task Completion',
      data: [
        { x: 'Mon', y: 24 },
        { x: 'Tue', y: 32 },
        { x: 'Wed', y: 28 },
        { x: 'Thu', y: 35 },
        { x: 'Fri', y: 42 },
        { x: 'Sat', y: 18 },
        { x: 'Sun', y: 15 },
      ],
      color: '#FF6B35',
    },
  ],
}

const sampleTableData = [
  {
    id: 1,
    name: 'Agent Alpha',
    status: 'Active',
    platform: 'n8n',
    tasks: 156,
    success: '98.5%',
  },
  {
    id: 2,
    name: 'Agent Beta',
    status: 'Active',
    platform: 'Make.com',
    tasks: 89,
    success: '97.2%',
  },
  {
    id: 3,
    name: 'Agent Gamma',
    status: 'Inactive',
    platform: 'Zapier',
    tasks: 45,
    success: '95.8%',
  },
  {
    id: 4,
    name: 'Agent Delta',
    status: 'Active',
    platform: 'n8n',
    tasks: 203,
    success: '99.1%',
  },
  {
    id: 5,
    name: 'Agent Epsilon',
    status: 'Error',
    platform: 'Make.com',
    tasks: 12,
    success: '87.3%',
  },
]

// Header component
const DashboardHeader = () => (
  <header className="bg-background border-b border-border p-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cubcen Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          AI Agent Management Platform
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          Export
        </Button>
        <Button size="sm">Add Agent</Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          All systems operational
        </div>
      </div>
    </div>
  </header>
)

// Footer component
const DashboardFooter = () => (
  <footer className="bg-muted/50 border-t border-border p-4">
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>© 2024 Cubcen AI Agent Management Platform</span>
      <div className="flex items-center gap-4">
        <span>Last updated: 2 minutes ago</span>
        <span>Version 1.0.0</span>
      </div>
    </div>
  </footer>
)

// Main dashboard content
const DashboardContent = () => (
  <FilterProvider>
    <DashboardGrid>
      {/* KPI Cards Row */}
      <GridItem
        colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}
        priority="critical"
      >
        <DashboardCard
          title="Active Agents"
          subtitle="Currently running"
          metric={{
            value: 24,
            unit: 'agents',
            trend: 'up',
            trendValue: '+12%',
          }}
          icon={Activity}
          priority="high"
          interactive
        />
      </GridItem>

      <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }} priority="high">
        <DashboardCard
          title="Total Users"
          subtitle="Registered users"
          metric={{
            value: 1247,
            unit: 'users',
            trend: 'up',
            trendValue: '+5.2%',
          }}
          icon={Users}
          priority="medium"
          interactive
        />
      </GridItem>

      <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }} priority="high">
        <DashboardCard
          title="Success Rate"
          subtitle="Overall performance"
          metric={{ value: '98.5%', trend: 'up', trendValue: '+0.3%' }}
          icon={TrendingUp}
          priority="high"
          interactive
        />
      </GridItem>

      <GridItem
        colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}
        priority="critical"
      >
        <DashboardCard
          title="Active Alerts"
          subtitle="Requires attention"
          metric={{ value: 3, unit: 'alerts', trend: 'down', trendValue: '-2' }}
          icon={AlertCircle}
          priority="critical"
          interactive
        />
      </GridItem>

      {/* System Metrics */}
      <GridItem colSpan={{ desktop: 4, tablet: 3, mobile: 1 }}>
        <MetricCard
          title="System Performance"
          subtitle="Real-time system metrics"
          icon={Server}
          layout="vertical"
          metrics={[
            {
              label: 'CPU Usage',
              value: '45%',
              trend: 'up',
              trendValue: '+5%',
              color: '#3F51B5',
            },
            {
              label: 'Memory Usage',
              value: '67%',
              trend: 'down',
              trendValue: '-3%',
              color: '#B19ADA',
            },
            {
              label: 'Disk Usage',
              value: '23%',
              trend: 'neutral',
              trendValue: '0%',
              color: '#FF6B35',
            },
            {
              label: 'Network I/O',
              value: '156 MB/s',
              trend: 'up',
              trendValue: '+12%',
              color: '#10B981',
            },
          ]}
        />
      </GridItem>

      <GridItem colSpan={{ desktop: 4, tablet: 3, mobile: 1 }}>
        <MetricCard
          title="Financial Overview"
          subtitle="Revenue and cost metrics"
          icon={DollarSign}
          layout="grid"
          metrics={[
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
          ]}
        />
      </GridItem>

      <GridItem colSpan={{ desktop: 4, tablet: 2, mobile: 1 }}>
        <MetricCard
          title="Performance Metrics"
          subtitle="Response times and efficiency"
          icon={Zap}
          layout="horizontal"
          metrics={[
            {
              label: 'Avg Response',
              value: '245ms',
              trend: 'down',
              trendValue: '-15ms',
              color: '#10B981',
            },
            {
              label: 'Throughput',
              value: '1.2k/s',
              trend: 'up',
              trendValue: '+200/s',
              color: '#3F51B5',
            },
            {
              label: 'Uptime',
              value: '99.9%',
              trend: 'neutral',
              trendValue: '0%',
              color: '#F59E0B',
            },
          ]}
        />
      </GridItem>

      {/* Charts Row */}
      <GridItem colSpan={{ desktop: 8, tablet: 4, mobile: 1 }}>
        <ChartCard
          title="Performance Trends"
          subtitle="Agent performance and system load over time"
          chartType="line"
          data={performanceData}
          icon={BarChart3}
          size="lg"
          exportable
          filterable
          chartConfig={{
            legend: { show: true, position: 'bottom', align: 'center' },
            animations: { enabled: true, duration: 750, easing: 'ease-in-out' },
          }}
        />
      </GridItem>

      <GridItem colSpan={{ desktop: 4, tablet: 2, mobile: 1 }}>
        <ChartCard
          title="Platform Distribution"
          subtitle="Agent distribution across platforms"
          chartType="pie"
          data={platformDistribution}
          icon={PieChart}
          exportable
          filterable
          chartConfig={{
            legend: { show: true, position: 'right', align: 'center' },
          }}
        />
      </GridItem>

      {/* Task Completion Chart */}
      <GridItem colSpan={{ desktop: 6, tablet: 3, mobile: 1 }}>
        <ChartCard
          title="Weekly Task Completion"
          subtitle="Tasks completed per day this week"
          chartType="bar"
          data={taskCompletionData}
          icon={BarChart3}
          exportable
          filterable
        />
      </GridItem>

      {/* Time-based Metrics */}
      <GridItem colSpan={{ desktop: 6, tablet: 3, mobile: 1 }}>
        <MetricCard
          title="Time Analytics"
          subtitle="Time-based performance metrics"
          icon={Clock}
          layout="vertical"
          size="lg"
          metrics={[
            {
              label: 'Avg Processing Time',
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
            {
              label: 'Peak Load Time',
              value: '14:30',
              trend: 'neutral',
              trendValue: 'Same',
              color: '#B19ADA',
            },
          ]}
        />
      </GridItem>

      {/* Data Table */}
      <GridItem colSpan={{ desktop: 12, tablet: 4, mobile: 1 }}>
        <DataTableCard
          title="Agent Status Overview"
          subtitle="Detailed view of all agents and their current status"
          data={sampleTableData}
          columns={[
            { key: 'name', label: 'Agent Name', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
            { key: 'platform', label: 'Platform', sortable: true },
            { key: 'tasks', label: 'Tasks', sortable: true },
            { key: 'success', label: 'Success Rate', sortable: true },
          ]}
          searchable
          filterable
          exportable
          pageSize={5}
        />
      </GridItem>
    </DashboardGrid>
  </FilterProvider>
)

export const CompleteDashboard: Story = {
  render: () => (
    <DashboardThemeProvider defaultTheme="light" validateContrast>
      <DashboardLayout
        header={<DashboardHeader />}
        sidebar={<DashboardSidebar />}
        footer={<DashboardFooter />}
      >
        <DashboardContent />
      </DashboardLayout>
    </DashboardThemeProvider>
  ),
}

export const DarkThemeDashboard: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <DashboardThemeProvider defaultTheme="dark" validateContrast>
      <DashboardLayout
        header={<DashboardHeader />}
        sidebar={<DashboardSidebar />}
        footer={<DashboardFooter />}
      >
        <DashboardContent />
      </DashboardLayout>
    </DashboardThemeProvider>
  ),
}

export const MobileDashboard: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
  render: () => (
    <DashboardThemeProvider defaultTheme="light" validateContrast>
      <DashboardLayout
        header={<DashboardHeader />}
        footer={<MobileNavigation />}
      >
        <DashboardContent />
      </DashboardLayout>
    </DashboardThemeProvider>
  ),
}

export const TabletDashboard: Story = {
  parameters: {
    viewport: { defaultViewport: 'tablet' },
  },
  render: () => (
    <DashboardThemeProvider defaultTheme="light" validateContrast>
      <DashboardLayout
        header={<DashboardHeader />}
        sidebar={<DashboardSidebar />}
        footer={<DashboardFooter />}
      >
        <DashboardContent />
      </DashboardLayout>
    </DashboardThemeProvider>
  ),
}

export const CustomBrandTheme: Story = {
  render: () => (
    <DashboardThemeProvider
      defaultTheme="light"
      theme={{
        colors: {
          primary: '#3F51B5',
          secondary: '#B19ADA',
          accent: '#FF6B35',
          background: '#FFFFFF',
          surface: '#F8F9FA',
          text: {
            primary: '#1A1A1A',
            secondary: '#6B7280',
            disabled: '#9CA3AF',
          },
          status: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3F51B5',
          },
          chart: {
            palette: [
              '#3F51B5',
              '#B19ADA',
              '#FF6B35',
              '#10B981',
              '#F59E0B',
              '#EF4444',
            ],
            gradients: {
              primary: 'linear-gradient(135deg, #3F51B5 0%, #B19ADA 100%)',
              secondary: 'linear-gradient(135deg, #FF6B35 0%, #10B981 100%)',
            },
          },
        },
      }}
      validateContrast
    >
      <DashboardLayout
        header={<DashboardHeader />}
        sidebar={<DashboardSidebar />}
        footer={<DashboardFooter />}
      >
        <DashboardContent />
      </DashboardLayout>
    </DashboardThemeProvider>
  ),
}

export const MinimalDashboard: Story = {
  render: () => (
    <DashboardThemeProvider defaultTheme="light" validateContrast>
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Minimal Dashboard</h1>
          <DashboardGrid>
            <GridItem colSpan={4}>
              <DashboardCard
                title="Active Agents"
                metric={{ value: 24, unit: 'agents' }}
                icon={Activity}
              />
            </GridItem>
            <GridItem colSpan={4}>
              <DashboardCard
                title="Total Users"
                metric={{ value: 1247, unit: 'users' }}
                icon={Users}
              />
            </GridItem>
            <GridItem colSpan={4}>
              <DashboardCard
                title="Success Rate"
                metric={{ value: '98.5%' }}
                icon={TrendingUp}
              />
            </GridItem>
          </DashboardGrid>
        </div>
      </DashboardLayout>
    </DashboardThemeProvider>
  ),
}

export const LoadingStates: Story = {
  render: () => (
    <DashboardThemeProvider defaultTheme="light" validateContrast>
      <DashboardLayout header={<DashboardHeader />}>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Loading States Demo</h1>
          <DashboardGrid>
            <GridItem colSpan={3}>
              <DashboardCard title="Loading Card" loading icon={Activity} />
            </GridItem>
            <GridItem colSpan={3}>
              <MetricCard
                title="Loading Metrics"
                loading
                icon={TrendingUp}
                metrics={[{ label: 'Loading...', value: 0 }]}
              />
            </GridItem>
            <GridItem colSpan={6}>
              <ChartCard
                title="Loading Chart"
                chartType="line"
                data={performanceData}
                loading
                icon={BarChart3}
              />
            </GridItem>
          </DashboardGrid>
        </div>
      </DashboardLayout>
    </DashboardThemeProvider>
  ),
}

export const ErrorStates: Story = {
  render: () => (
    <DashboardThemeProvider defaultTheme="light" validateContrast>
      <DashboardLayout header={<DashboardHeader />}>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Error States Demo</h1>
          <DashboardGrid>
            <GridItem colSpan={3}>
              <DashboardCard
                title="Error Card"
                error="Failed to load data"
                icon={AlertCircle}
              />
            </GridItem>
            <GridItem colSpan={3}>
              <MetricCard
                title="Error Metrics"
                error="Connection timeout"
                icon={AlertCircle}
                metrics={[{ label: 'Unavailable', value: 0 }]}
              />
            </GridItem>
            <GridItem colSpan={6}>
              <ChartCard
                title="Error Chart"
                chartType="line"
                data={performanceData}
                error="Unable to fetch chart data"
                icon={BarChart3}
              />
            </GridItem>
          </DashboardGrid>
        </div>
      </DashboardLayout>
    </DashboardThemeProvider>
  ),
}
