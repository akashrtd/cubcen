import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ChartWrapper } from './chart-wrapper'

const meta: Meta<typeof ChartWrapper> = {
  title: 'Dashboard/Charts/ChartWrapper',
  component: ChartWrapper,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A universal chart container component that supports multiple chart types with lazy loading, export functionality, and interactive features.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['line', 'bar', 'pie', 'heatmap', 'area', 'scatter'],
      description: 'Type of chart to render',
    },
    height: {
      control: 'number',
      description: 'Chart height in pixels',
    },
    responsive: {
      control: 'boolean',
      description: 'Enable responsive behavior',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable interactive features',
    },
    exportable: {
      control: 'boolean',
      description: 'Enable export functionality',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
}

export default meta
type Story = StoryObj<typeof ChartWrapper>

// Sample data for different chart types
const lineChartData = {
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

const barChartData = {
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

const pieChartData = {
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

const heatmapData = {
  datasets: [
    {
      label: 'Activity Heatmap',
      data: [
        { x: 0, y: 0, value: 12 },
        { x: 1, y: 0, value: 19 },
        { x: 2, y: 0, value: 3 },
        { x: 3, y: 0, value: 5 },
        { x: 0, y: 1, value: 2 },
        { x: 1, y: 1, value: 3 },
        { x: 2, y: 1, value: 20 },
        { x: 3, y: 1, value: 17 },
        { x: 0, y: 2, value: 20 },
        { x: 1, y: 2, value: 17 },
        { x: 2, y: 2, value: 8 },
        { x: 3, y: 2, value: 2 },
      ],
    },
  ],
}

const areaChartData = {
  datasets: [
    {
      label: 'Memory Usage',
      data: [
        { x: '00:00', y: 45 },
        { x: '04:00', y: 52 },
        { x: '08:00', y: 68 },
        { x: '12:00', y: 75 },
        { x: '16:00', y: 82 },
        { x: '20:00', y: 65 },
        { x: '24:00', y: 48 },
      ],
      color: '#10B981',
    },
  ],
}

const scatterData = {
  datasets: [
    {
      label: 'Performance vs Load',
      data: [
        { x: 10, y: 85 },
        { x: 25, y: 78 },
        { x: 40, y: 72 },
        { x: 55, y: 65 },
        { x: 70, y: 58 },
        { x: 85, y: 45 },
        { x: 95, y: 32 },
      ],
      color: '#F59E0B',
    },
  ],
}

export const LineChart: Story = {
  args: {
    type: 'line',
    data: lineChartData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: true,
  },
}

export const BarChart: Story = {
  args: {
    type: 'bar',
    data: barChartData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: true,
  },
}

export const PieChart: Story = {
  args: {
    type: 'pie',
    data: pieChartData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: true,
  },
}

export const HeatmapChart: Story = {
  args: {
    type: 'heatmap',
    data: heatmapData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: true,
  },
}

export const AreaChart: Story = {
  args: {
    type: 'area',
    data: areaChartData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: true,
  },
}

export const ScatterChart: Story = {
  args: {
    type: 'scatter',
    data: scatterData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: true,
  },
}

export const SmallChart: Story = {
  args: {
    type: 'line',
    data: lineChartData,
    height: 200,
    responsive: true,
    interactive: false,
    exportable: false,
  },
}

export const LargeChart: Story = {
  args: {
    type: 'bar',
    data: barChartData,
    height: 500,
    responsive: true,
    interactive: true,
    exportable: true,
    config: {
      legend: {
        show: true,
        position: 'bottom',
        align: 'center',
      },
      tooltip: {
        show: true,
      },
      animations: {
        enabled: true,
        duration: 750,
        easing: 'ease-in-out',
      },
    },
  },
}

export const CustomColors: Story = {
  args: {
    type: 'line',
    data: lineChartData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: true,
    config: {
      colors: {
        primary: '#8B5CF6',
        secondary: '#06B6D4',
        accent: '#F59E0B',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
    },
  },
}

export const WithLegend: Story = {
  args: {
    type: 'line',
    data: lineChartData,
    height: 350,
    responsive: true,
    interactive: true,
    exportable: true,
    config: {
      legend: {
        show: true,
        position: 'top',
        align: 'end',
      },
    },
  },
}

export const WithCustomTooltip: Story = {
  args: {
    type: 'bar',
    data: barChartData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: true,
    config: {
      tooltip: {
        show: true,
        format: (value: any) => `${value} tasks completed`,
      },
    },
  },
}

export const WithAnimations: Story = {
  args: {
    type: 'pie',
    data: pieChartData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: true,
    config: {
      animations: {
        enabled: true,
        duration: 1000,
        easing: 'ease-in-out',
      },
    },
  },
}

export const LoadingState: Story = {
  args: {
    type: 'line',
    data: lineChartData,
    height: 300,
    loading: true,
    responsive: true,
    interactive: true,
    exportable: true,
  },
}

export const ErrorState: Story = {
  args: {
    type: 'bar',
    data: barChartData,
    height: 300,
    error: 'Failed to load chart data. Please try again.',
    responsive: true,
    interactive: true,
    exportable: true,
  },
}

export const NonResponsive: Story = {
  args: {
    type: 'line',
    data: lineChartData,
    height: 300,
    responsive: false,
    interactive: true,
    exportable: true,
  },
}

export const NonInteractive: Story = {
  args: {
    type: 'bar',
    data: barChartData,
    height: 300,
    responsive: true,
    interactive: false,
    exportable: true,
  },
}

export const NonExportable: Story = {
  args: {
    type: 'pie',
    data: pieChartData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: false,
  },
}

export const InteractiveWithCallbacks: Story = {
  args: {
    type: 'bar',
    data: barChartData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: true,
    onDataClick: (data) => {
      console.log('Data clicked:', data)
      alert(`Clicked: ${data.x} - ${data.y}`)
    },
    onLegendClick: (legendItem) => {
      console.log('Legend clicked:', legendItem)
      alert(`Legend clicked: ${legendItem.label}`)
    },
  },
}

export const ResponsiveMobile: Story = {
  args: {
    type: 'line',
    data: lineChartData,
    height: 250,
    responsive: true,
    interactive: true,
    exportable: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}

export const ResponsiveTablet: Story = {
  args: {
    type: 'bar',
    data: barChartData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}

export const DarkTheme: Story = {
  args: {
    type: 'line',
    data: lineChartData,
    height: 300,
    responsive: true,
    interactive: true,
    exportable: true,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}