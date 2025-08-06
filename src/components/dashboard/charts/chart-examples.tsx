import React from 'react'
import { ChartWrapper } from './chart-wrapper'
import { ChartConfigUtils } from './chart-config-system'
import type { ChartData } from '@/types/dashboard'

// Example data for different chart types
const lineChartData: ChartData = {
  datasets: [
    {
      label: 'Revenue',
      data: [
        { x: 'Jan', y: 4000 },
        { x: 'Feb', y: 3000 },
        { x: 'Mar', y: 5000 },
        { x: 'Apr', y: 4500 },
        { x: 'May', y: 6000 },
        { x: 'Jun', y: 5500 },
      ],
    },
    {
      label: 'Expenses',
      data: [
        { x: 'Jan', y: 2400 },
        { x: 'Feb', y: 1398 },
        { x: 'Mar', y: 3800 },
        { x: 'Apr', y: 3908 },
        { x: 'May', y: 4800 },
        { x: 'Jun', y: 3800 },
      ],
    },
  ],
}

const barChartData: ChartData = {
  datasets: [
    {
      label: 'Sales',
      data: [
        { x: 'Q1', y: 120 },
        { x: 'Q2', y: 190 },
        { x: 'Q3', y: 300 },
        { x: 'Q4', y: 500 },
      ],
    },
    {
      label: 'Target',
      data: [
        { x: 'Q1', y: 100 },
        { x: 'Q2', y: 200 },
        { x: 'Q3', y: 350 },
        { x: 'Q4', y: 450 },
      ],
    },
  ],
}

const pieChartData: ChartData = {
  datasets: [
    {
      label: 'Market Share',
      data: [
        { label: 'Product A', value: 35 },
        { label: 'Product B', value: 25 },
        { label: 'Product C', value: 20 },
        { label: 'Product D', value: 15 },
        { label: 'Others', value: 5 },
      ],
    },
  ],
}

const heatmapData: ChartData = {
  datasets: [
    {
      label: 'Activity Heatmap',
      data: [
        { x: 'Mon', y: '9AM', value: 10 },
        { x: 'Mon', y: '12PM', value: 20 },
        { x: 'Mon', y: '3PM', value: 15 },
        { x: 'Tue', y: '9AM', value: 25 },
        { x: 'Tue', y: '12PM', value: 30 },
        { x: 'Tue', y: '3PM', value: 18 },
        { x: 'Wed', y: '9AM', value: 12 },
        { x: 'Wed', y: '12PM', value: 22 },
        { x: 'Wed', y: '3PM', value: 28 },
      ],
    },
  ],
  metadata: {
    title: 'Weekly Activity Pattern',
  },
}

export function ChartExamples() {
  const handleDataClick = (data: any) => {
    console.log('Chart data clicked:', data)
  }

  const handleExportStart = (format: string) => {
    console.log(`Starting export as ${format}...`)
  }

  const handleExportComplete = (format: string) => {
    console.log(`Export as ${format} completed!`)
  }

  const handleExportError = (error: Error, format: string) => {
    console.error(`Export as ${format} failed:`, error)
  }

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-foreground">Chart Examples</h2>
      
      {/* Line Chart */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Line Chart</h3>
        <div className="border border-border rounded-lg p-4">
          <ChartWrapper
            type="line"
            data={lineChartData}
            config={ChartConfigUtils.quickConfig('line', 'default')}
            height={300}
            exportable={true}
            exportFilename="revenue-chart"
            onDataClick={handleDataClick}
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
            onExportError={handleExportError}
          />
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Bar Chart</h3>
        <div className="border border-border rounded-lg p-4">
          <ChartWrapper
            type="bar"
            data={barChartData}
            config={ChartConfigUtils.quickConfig('bar', 'vibrant')}
            height={300}
            exportable={true}
            exportFilename="sales-chart"
            onDataClick={handleDataClick}
          />
        </div>
      </div>

      {/* Pie Chart */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Pie Chart</h3>
        <div className="border border-border rounded-lg p-4">
          <ChartWrapper
            type="pie"
            data={pieChartData}
            config={ChartConfigUtils.quickConfig('pie', 'minimal')}
            height={300}
            exportable={true}
            exportFilename="market-share-chart"
            onDataClick={handleDataClick}
          />
        </div>
      </div>

      {/* Heatmap Chart */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Heatmap Chart</h3>
        <div className="border border-border rounded-lg p-4">
          <ChartWrapper
            type="heatmap"
            data={heatmapData}
            config={ChartConfigUtils.quickConfig('heatmap', 'dark')}
            height={300}
            exportable={true}
            exportFilename="activity-heatmap"
            onDataClick={handleDataClick}
          />
        </div>
      </div>

      {/* Area Chart (Line Chart variant) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Area Chart</h3>
        <div className="border border-border rounded-lg p-4">
          <ChartWrapper
            type="area"
            data={lineChartData}
            config={ChartConfigUtils.builder()
              .withTheme('default')
              .withPreset('line')
              .withColors({ primary: '#10B981', secondary: '#3B82F6' })
              .build()}
            height={300}
            exportable={true}
            exportFilename="area-chart"
            onDataClick={handleDataClick}
          />
        </div>
      </div>

      {/* Custom Configuration Example */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Custom Configuration</h3>
        <div className="border border-border rounded-lg p-4">
          <ChartWrapper
            type="line"
            data={lineChartData}
            config={ChartConfigUtils.builder()
              .withTheme('vibrant')
              .withLegend({ show: true, position: 'top', align: 'start' })
              .withTooltip({ 
                show: true, 
                format: (value) => `$${value.toLocaleString()}` 
              })
              .withAnimations({ enabled: true, duration: 500, easing: 'ease-in-out' })
              .build()}
            height={300}
            exportable={true}
            exportFilename="custom-chart"
            onDataClick={handleDataClick}
          />
        </div>
      </div>
    </div>
  )
}