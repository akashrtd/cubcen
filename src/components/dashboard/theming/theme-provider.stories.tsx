import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DashboardThemeProvider } from './theme-provider'
import { DashboardCard } from '../cards/dashboard-card'
import { MetricCard } from '../cards/metric-card'
import { ChartCard } from '../cards/chart-card'
import { DashboardGrid } from '../grid/dashboard-grid'
import { GridItem } from '../grid/grid-item'
import { Activity, Users, TrendingUp, BarChart3 } from 'lucide-react'
import { Button } from '../../ui/button'

const meta: Meta<typeof DashboardThemeProvider> = {
  title: 'Dashboard/Theming/ThemeProvider',
  component: DashboardThemeProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive theme provider for dashboard components with support for custom themes, dark/light mode, and WCAG-compliant color schemes.',
      },
    },
  },
  argTypes: {
    defaultTheme: {
      control: 'select',
      options: ['light', 'dark', 'system'],
      description: 'Default theme mode',
    },
    enableColorSchemeDetection: {
      control: 'boolean',
      description: 'Enable automatic color scheme detection',
    },
    validateContrast: {
      control: 'boolean',
      description: 'Enable WCAG contrast validation',
    },
  },
}

export default meta
type Story = StoryObj<typeof DashboardThemeProvider>

// Sample data for demonstrations
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

// Sample dashboard content
const SampleDashboard = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Theme Demo</h1>
        <p className="text-muted-foreground">Demonstrating theme customization capabilities</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">Secondary</Button>
        <Button>Primary</Button>
      </div>
    </div>
    
    <DashboardGrid>
      <GridItem colSpan={3}>
        <DashboardCard
          title="Active Agents"
          metric={{ value: 24, unit: 'agents', trend: 'up', trendValue: '+12%' }}
          icon={Activity}
          priority="high"
        />
      </GridItem>
      <GridItem colSpan={3}>
        <DashboardCard
          title="Total Users"
          metric={{ value: 1247, unit: 'users', trend: 'up', trendValue: '+5%' }}
          icon={Users}
          priority="medium"
        />
      </GridItem>
      <GridItem colSpan={3}>
        <DashboardCard
          title="Success Rate"
          metric={{ value: '98.5%', trend: 'up', trendValue: '+0.3%' }}
          icon={TrendingUp}
          priority="high"
        />
      </GridItem>
      <GridItem colSpan={3}>
        <MetricCard
          title="System Metrics"
          icon={Activity}
          metrics={[
            { label: 'CPU', value: '45%', trend: 'up', trendValue: '+5%' },
            { label: 'Memory', value: '67%', trend: 'down', trendValue: '-3%' },
          ]}
        />
      </GridItem>
      <GridItem colSpan={6}>
        <ChartCard
          title="Performance Trends"
          subtitle="System performance over time"
          chartType="line"
          data={sampleLineData}
          icon={BarChart3}
          exportable
          filterable
        />
      </GridItem>
      <GridItem colSpan={6}>
        <DashboardCard
          title="Detailed Information"
          subtitle="Extended content with various text styles"
          icon={Activity}
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-foreground">
              This demonstrates how text appears in the current theme with proper contrast ratios.
            </p>
            <p className="text-muted-foreground">
              Secondary text maintains readability while providing visual hierarchy.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Success</div>
                <div className="text-2xl font-bold text-green-600">98.5%</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Errors</div>
                <div className="text-2xl font-bold text-red-600">1.5%</div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </GridItem>
    </DashboardGrid>
  </div>
)

export const DefaultTheme: Story = {
  args: {
    defaultTheme: 'light',
    enableColorSchemeDetection: true,
    validateContrast: true,
  },
  render: (args) => (
    <DashboardThemeProvider {...args}>
      <SampleDashboard />
    </DashboardThemeProvider>
  ),
}

export const DarkTheme: Story = {
  args: {
    defaultTheme: 'dark',
    enableColorSchemeDetection: false,
    validateContrast: true,
  },
  render: (args) => (
    <DashboardThemeProvider {...args}>
      <SampleDashboard />
    </DashboardThemeProvider>
  ),
}

export const SystemTheme: Story = {
  args: {
    defaultTheme: 'system',
    enableColorSchemeDetection: true,
    validateContrast: true,
  },
  render: (args) => (
    <DashboardThemeProvider {...args}>
      <SampleDashboard />
    </DashboardThemeProvider>
  ),
}

export const CustomTheme: Story = {
  args: {
    defaultTheme: 'light',
    theme: {
      colors: {
        primary: '#8B5CF6',
        secondary: '#06B6D4',
        accent: '#F59E0B',
        background: '#FAFAFA',
        surface: '#FFFFFF',
        text: {
          primary: '#1A1A1A',
          secondary: '#6B7280',
          disabled: '#9CA3AF',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        chart: {
          palette: ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#3B82F6'],
          gradients: {
            primary: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
            secondary: 'linear-gradient(135deg, #F59E0B 0%, #10B981 100%)',
          },
        },
      },
    },
    validateContrast: true,
  },
  render: (args) => (
    <DashboardThemeProvider {...args}>
      <SampleDashboard />
    </DashboardThemeProvider>
  ),
}

export const HighContrastTheme: Story = {
  args: {
    defaultTheme: 'light',
    theme: {
      colors: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#0066CC',
        background: '#FFFFFF',
        surface: '#F8F9FA',
        text: {
          primary: '#000000',
          secondary: '#333333',
          disabled: '#666666',
        },
        status: {
          success: '#006600',
          warning: '#CC6600',
          error: '#CC0000',
          info: '#0066CC',
        },
        chart: {
          palette: ['#000000', '#333333', '#0066CC', '#006600', '#CC0000', '#CC6600'],
          gradients: {},
        },
      },
    },
    validateContrast: true,
  },
  render: (args) => (
    <DashboardThemeProvider {...args}>
      <SampleDashboard />
    </DashboardThemeProvider>
  ),
}

export const CubcenBrandTheme: Story = {
  args: {
    defaultTheme: 'light',
    theme: {
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
          palette: ['#3F51B5', '#B19ADA', '#FF6B35', '#10B981', '#F59E0B', '#EF4444'],
          gradients: {
            primary: 'linear-gradient(135deg, #3F51B5 0%, #B19ADA 100%)',
            secondary: 'linear-gradient(135deg, #FF6B35 0%, #10B981 100%)',
          },
        },
      },
    },
    validateContrast: true,
  },
  render: (args) => (
    <DashboardThemeProvider {...args}>
      <SampleDashboard />
    </DashboardThemeProvider>
  ),
}

export const CustomTypography: Story = {
  args: {
    defaultTheme: 'light',
    theme: {
      typography: {
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace'],
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '2rem',
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      },
    },
    validateContrast: true,
  },
  render: (args) => (
    <DashboardThemeProvider {...args}>
      <SampleDashboard />
    </DashboardThemeProvider>
  ),
}

export const CustomSpacing: Story = {
  args: {
    defaultTheme: 'light',
    theme: {
      spacing: {
        grid: {
          gap: '2rem',
          padding: '2rem',
          margin: '1.5rem',
        },
        card: {
          padding: '2rem',
          margin: '1rem',
        },
      },
    },
    validateContrast: true,
  },
  render: (args) => (
    <DashboardThemeProvider {...args}>
      <SampleDashboard />
    </DashboardThemeProvider>
  ),
}

export const WithoutContrastValidation: Story = {
  args: {
    defaultTheme: 'light',
    theme: {
      colors: {
        primary: '#FFFF00',
        secondary: '#00FFFF',
        accent: '#FF00FF',
        background: '#FFFFFF',
        surface: '#F0F0F0',
        text: {
          primary: '#CCCCCC',
          secondary: '#DDDDDD',
          disabled: '#EEEEEE',
        },
      },
    },
    validateContrast: false,
  },
  render: (args) => (
    <DashboardThemeProvider {...args}>
      <SampleDashboard />
    </DashboardThemeProvider>
  ),
}

export const ResponsiveMobile: Story = {
  args: {
    defaultTheme: 'light',
    validateContrast: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  render: (args) => (
    <DashboardThemeProvider {...args}>
      <SampleDashboard />
    </DashboardThemeProvider>
  ),
}

export const ResponsiveTablet: Story = {
  args: {
    defaultTheme: 'light',
    validateContrast: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  render: (args) => (
    <DashboardThemeProvider {...args}>
      <SampleDashboard />
    </DashboardThemeProvider>
  ),
}