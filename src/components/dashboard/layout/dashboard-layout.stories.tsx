import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DashboardLayout } from './dashboard-layout'
import { DashboardSidebar } from './dashboard-sidebar'
import { MobileNavigation } from './mobile-navigation'
import { DashboardCard } from '../cards/dashboard-card'
import { DashboardGrid } from '../grid/dashboard-grid'
import { GridItem } from '../grid/grid-item'
import { Activity, Users, TrendingUp, AlertCircle } from 'lucide-react'

const meta: Meta<typeof DashboardLayout> = {
  title: 'Dashboard/Layout/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main dashboard layout component with CSS Grid-based responsive design. Supports customizable grid areas, collapsible sidebar, and mobile navigation.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the layout',
    },
    gridAreas: {
      control: 'object',
      description: 'Custom grid area configuration for different layouts',
    },
    breakpoints: {
      control: 'object',
      description: 'Custom responsive breakpoints',
    },
  },
}

export default meta
type Story = StoryObj<typeof DashboardLayout>

// Sample content components for stories
const SampleHeader = () => (
  <header className="bg-background border-b border-border p-4">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-foreground">Cubcen Dashboard</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Welcome back, Admin</span>
      </div>
    </div>
  </header>
)

const SampleContent = () => (
  <DashboardGrid>
    <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
      <DashboardCard
        title="Active Agents"
        metric={{ value: 24, unit: 'agents', trend: 'up', trendValue: '+12%' }}
        icon={Activity}
        priority="high"
      />
    </GridItem>
    <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
      <DashboardCard
        title="Total Users"
        metric={{ value: 1247, unit: 'users', trend: 'up', trendValue: '+5%' }}
        icon={Users}
        priority="medium"
      />
    </GridItem>
    <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
      <DashboardCard
        title="Success Rate"
        metric={{ value: '98.5%', trend: 'up', trendValue: '+0.3%' }}
        icon={TrendingUp}
        priority="high"
      />
    </GridItem>
    <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}>
      <DashboardCard
        title="Active Alerts"
        metric={{ value: 3, unit: 'alerts', trend: 'down', trendValue: '-2' }}
        icon={AlertCircle}
        priority="critical"
      />
    </GridItem>
  </DashboardGrid>
)

const SampleFooter = () => (
  <footer className="bg-muted/50 border-t border-border p-4">
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>© 2024 Cubcen AI Agent Management Platform</span>
      <span>System Status: All systems operational</span>
    </div>
  </footer>
)

export const Default: Story = {
  args: {},
  render: (args) => (
    <DashboardLayout {...args}>
      <SampleContent />
    </DashboardLayout>
  ),
}

export const WithHeaderAndFooter: Story = {
  args: {},
  render: (args) => (
    <DashboardLayout
      {...args}
      header={<SampleHeader />}
      footer={<SampleFooter />}
    >
      <SampleContent />
    </DashboardLayout>
  ),
}

export const WithSidebar: Story = {
  args: {},
  render: (args) => (
    <DashboardLayout
      {...args}
      header={<SampleHeader />}
      sidebar={<DashboardSidebar />}
      footer={<SampleFooter />}
    >
      <SampleContent />
    </DashboardLayout>
  ),
}

export const MobileLayout: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  render: (args) => (
    <DashboardLayout
      {...args}
      header={<SampleHeader />}
      sidebar={<DashboardSidebar />}
      footer={<MobileNavigation />}
    >
      <SampleContent />
    </DashboardLayout>
  ),
}

export const TabletLayout: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  render: (args) => (
    <DashboardLayout
      {...args}
      header={<SampleHeader />}
      sidebar={<DashboardSidebar />}
      footer={<SampleFooter />}
    >
      <SampleContent />
    </DashboardLayout>
  ),
}

export const CustomGridAreas: Story = {
  args: {
    gridAreas: {
      header: 'header',
      sidebar: 'sidebar',
      main: 'main',
      footer: 'footer',
    },
  },
  render: (args) => (
    <DashboardLayout
      {...args}
      header={<SampleHeader />}
      sidebar={<DashboardSidebar />}
      footer={<SampleFooter />}
    >
      <SampleContent />
    </DashboardLayout>
  ),
}

export const AccessibilityFocused: Story = {
  args: {},
  parameters: {
    a11y: {
      test: 'error',
    },
  },
  render: (args) => (
    <DashboardLayout
      {...args}
      header={<SampleHeader />}
      sidebar={<DashboardSidebar />}
      footer={<SampleFooter />}
    >
      <SampleContent />
    </DashboardLayout>
  ),
}