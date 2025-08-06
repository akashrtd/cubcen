import type { Meta, StoryObj } from '@storybook/react'
import { ChartCard } from './chart-card'
import { BarChart3, LineChart, PieChart, Activity } from 'lucide-react'

const meta: Meta<typeof ChartCard> = {
  title: 'Dashboard/Cards/ChartCard',
  component: ChartCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A specialized card component for displaying data visualizations with integrated chart wrapper, export functionality, and filtering capabilities.',
      },
    },
  },
  argTypes: {
    chartType: {
      control: 'select',
      options: ['line', 'bar', 'pie', 'heatmap', 'area', 'scatter'],
      description: 'Type of chart to display',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Card size variant',
    },
    exportable: {
      control: 'boolean',
      description: 'Enable chart export functionality',
    },
    filterable: {
      control: 'boolean',
      description: 'Enable click-to-filter functionality',
    },
  },
}

export default meta
type Story = StoryObj<typeof ChartCard>

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

export const LineChartCard: Story = {
  args: {
    title: 'Performance Trends',
    subtitle: 'Agent performance over time',
    chartType: 'line',
    data: lineChartData,
    icon: LineChart,
    exportable: true,
    filterable: true,
  },
}

export const BarChartCard: Story = {
  args: {
    title: 'Weekly Task Completion',
    subtitle: 'Tasks completed per day',
    chartType: 'bar',
    data: barChartData,
    icon: BarChart3,
    exportable: true,
    filterable: true,
  },
}

export const PieChartCard: Story = {
  args: {
    title: 'Platform Distribution',
    subtitle: 'Agent distribution across platforms',
    chartType: 'pie',
    data: pieChartData,
    icon: PieChart,
    exportable: true,
    filterable: true,
  },
}

export const HeatmapChartCard: Story = {
  args: {
    title: 'Activity Heatmap',
    subtitle: 'User activity patterns',
    chartType: 'heatmap',
    data: heatmapData,
    icon: Activity,
    exportable: true,
    filterable: true,
  },
}

export const SmallChart: Story = {
  args: {
    title: 'Quick View',
    size: 'sm',
    chartType: 'line',
    data: {
      datasets: [
        {
          label: 'Quick Metric',
          data: [
            { x: '1', y: 10 },
            { x: '2', y: 15 },
            { x: '3', y: 12 },
            { x: '4', y: 18 },
          ],
          color: '#3F51B5',
        },
      ],
    },
    icon: Activity,
  },
}

export const LargeChart: Story = {
  args: {
    title: 'Detailed Analytics',
    subtitle: 'Comprehensive performance analysis',
    size: 'lg',
    chartType: 'line',
    data: lineChartData,
    icon: LineChart,
    exportable: true,
    filterable: true,
    chartConfig: {
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

export const ExtraLargeChart: Story = {
  args: {
    title: 'Executive Dashboard',
    subtitle: 'High-level performance overview',
    size: 'xl',
    chartType: 'bar',
    data: barChartData,
    icon: BarChart3,
    exportable: true,
    filterable: true,
    chartConfig: {
      colors: {
        primary: '#3F51B5',
        secondary: '#B19ADA',
        accent: '#FF6B35',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      legend: {
        show: true,
        position: 'top',
        align: 'end',
      },
    },
  },
}

export const LoadingState: Story = {
  args: {
    title: 'Loading Chart',
    subtitle: 'Fetching data...',
    chartType: 'line',
    data: lineChartData,
    loading: true,
    icon: Activity,
  },
}

export const ErrorState: Story = {
  args: {
    title: 'Chart Error',
    subtitle: 'Failed to load chart data',
    chartType: 'line',
    data: lineChartData,
    error: 'Unable to fetch chart data. Please try again.',
    icon: Activity,
  },
}

export const NonExportable: Story = {
  args: {
    title: 'View Only Chart',
    subtitle: 'Export disabled',
    chartType: 'pie',
    data: pieChartData,
    exportable: false,
    filterable: true,
    icon: PieChart,
  },
}

export const NonFilterable: Story = {
  args: {
    title: 'Static Chart',
    subtitle: 'Filtering disabled',
    chartType: 'bar',
    data: barChartData,
    exportable: true,
    filterable: false,
    icon: BarChart3,
  },
}

export const CustomColors: Story = {
  args: {
    title: 'Custom Styled Chart',
    subtitle: 'With custom color scheme',
    chartType: 'line',
    data: lineChartData,
    icon: LineChart,
    chartConfig: {
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

export const ResponsiveMobile: Story = {
  args: {
    title: 'Mobile Chart',
    subtitle: 'Optimized for mobile',
    chartType: 'bar',
    data: barChartData,
    icon: BarChart3,
    exportable: true,
    filterable: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}

export const ResponsiveTablet: Story = {
  args: {
    title: 'Tablet Chart',
    subtitle: 'Optimized for tablet',
    chartType: 'line',
    data: lineChartData,
    icon: LineChart,
    exportable: true,
    filterable: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}

export const DarkTheme: Story = {
  args: {
    title: 'Dark Theme Chart',
    subtitle: 'Styled for dark mode',
    chartType: 'pie',
    data: pieChartData,
    icon: PieChart,
    exportable: true,
    filterable: true,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}

export const InteractiveChart: Story = {
  args: {
    title: 'Interactive Chart',
    subtitle: 'Click elements to filter',
    chartType: 'bar',
    data: barChartData,
    icon: BarChart3,
    filterable: true,
    exportable: true,
    onDataClick: (data) => {
      console.log('Data clicked:', data)
      alert(`Clicked: ${data.x} - ${data.y}`)
    },
  },
}