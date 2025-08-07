'use client'

import React, { useState } from 'react'
import { FilterProvider } from '../filters/filter-context'
import { FilterSynchronizer, ActiveFiltersDisplay, useCrossCardFiltering } from '../filters/filter-synchronizer'
import { DashboardGrid } from '../grid/dashboard-grid'
import { ChartCard } from '../cards/chart-card'
import { MetricCard } from '../cards/metric-card'
import { FilterableCard } from '../filters/filterable-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react'
import type { ChartData, ChartDataPoint, LegendItem, FilterValue } from '@/types/dashboard'

// Sample data for demonstration
const sampleChartData: ChartData = {
  datasets: [
    {
      label: 'Sales',
      data: [
        { x: 'Jan', y: 4000, label: 'January', metadata: { category: 'Q1', region: 'North' } },
        { x: 'Feb', y: 3000, label: 'February', metadata: { category: 'Q1', region: 'North' } },
        { x: 'Mar', y: 5000, label: 'March', metadata: { category: 'Q1', region: 'South' } },
        { x: 'Apr', y: 4500, label: 'April', metadata: { category: 'Q2', region: 'South' } },
        { x: 'May', y: 6000, label: 'May', metadata: { category: 'Q2', region: 'East' } },
        { x: 'Jun', y: 5500, label: 'June', metadata: { category: 'Q2', region: 'East' } },
      ],
    },
    {
      label: 'Revenue',
      data: [
        { x: 'Jan', y: 2400, label: 'January', metadata: { category: 'Q1', region: 'North' } },
        { x: 'Feb', y: 1398, label: 'February', metadata: { category: 'Q1', region: 'North' } },
        { x: 'Mar', y: 9800, label: 'March', metadata: { category: 'Q1', region: 'South' } },
        { x: 'Apr', y: 3908, label: 'April', metadata: { category: 'Q2', region: 'South' } },
        { x: 'May', y: 4800, label: 'May', metadata: { category: 'Q2', region: 'East' } },
        { x: 'Jun', y: 3800, label: 'June', metadata: { category: 'Q2', region: 'East' } },
      ],
    },
  ],
}

const pieChartData: ChartData = {
  datasets: [
    {
      label: 'Regions',
      data: [
        { label: 'North', value: 35, metadata: { region: 'North', category: 'Q1' } },
        { label: 'South', value: 25, metadata: { region: 'South', category: 'Q1' } },
        { label: 'East', value: 30, metadata: { region: 'East', category: 'Q2' } },
        { label: 'West', value: 10, metadata: { region: 'West', category: 'Q2' } },
      ],
    },
  ],
}

// Sample table data
const tableData = [
  { id: 1, name: 'Product A', category: 'Q1', region: 'North', sales: 4000, revenue: 2400 },
  { id: 2, name: 'Product B', category: 'Q1', region: 'South', sales: 3000, revenue: 1398 },
  { id: 3, name: 'Product C', category: 'Q2', region: 'East', sales: 5000, revenue: 9800 },
  { id: 4, name: 'Product D', category: 'Q2', region: 'West', sales: 4500, revenue: 3908 },
]

function FilteredDataTable() {
  const { filteredData, activeFilters, filterCount } = useCrossCardFiltering(tableData, {
    searchFields: ['name', 'category', 'region'],
    filterMappings: {
      category: (item, filterValue) => item.category === filterValue.value,
      region: (item, filterValue) => item.region === filterValue.value,
      month: (item, filterValue) => {
        // Map month names to categories for demo
        const monthToCategory: Record<string, string> = {
          'January': 'Q1', 'February': 'Q1', 'March': 'Q1',
          'April': 'Q2', 'May': 'Q2', 'June': 'Q2',
        }
        return item.category === monthToCategory[filterValue.value as string]
      },
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Filtered Data Table
          {filterCount > 0 && (
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
              {filterCount} filter{filterCount !== 1 ? 's' : ''} active
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Region</th>
                <th className="text-right p-2">Sales</th>
                <th className="text-right p-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{item.name}</td>
                  <td className="p-2">{item.category}</td>
                  <td className="p-2">{item.region}</td>
                  <td className="p-2 text-right">{item.sales.toLocaleString()}</td>
                  <td className="p-2 text-right">${item.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No data matches the current filters
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ClickToFilterExample() {
  const [debugMode, setDebugMode] = useState(false)

  // Custom filter mappings for charts
  const barChartFilterMappings = {
    dataClick: (dataPoint: ChartDataPoint) => {
      const filters: Record<string, FilterValue> = {}
      
      // Filter by month
      if (dataPoint.label) {
        filters.month = {
          type: 'string',
          value: dataPoint.label,
          operator: 'equals',
        }
      }
      
      // Filter by category from metadata
      if (dataPoint.metadata?.category) {
        filters.category = {
          type: 'string',
          value: dataPoint.metadata.category,
          operator: 'equals',
        }
      }
      
      return filters
    },
    legendClick: (legendItem: LegendItem) => ({
      series: {
        type: 'string',
        value: legendItem.label,
        operator: 'equals',
      },
    }),
  }

  const pieChartFilterMappings = {
    dataClick: (dataPoint: ChartDataPoint) => ({
      region: {
        type: 'string',
        value: dataPoint.label || '',
        operator: 'equals',
      },
    }),
  }

  return (
    <FilterProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Click-to-Filter Dashboard</h2>
            <p className="text-muted-foreground">
              Click on chart elements to filter data across all dashboard components
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setDebugMode(!debugMode)}
          >
            {debugMode ? 'Hide' : 'Show'} Debug Info
          </Button>
        </div>

        {/* Active Filters Display */}
        <ActiveFiltersDisplay className="mb-4" />

        {/* Filter Synchronizer */}
        <FilterSynchronizer
          syncConfig={{
            syncAll: true,
            debounceMs: 100,
            onSync: (filters) => {
              if (debugMode) {
                console.log('Filters synchronized:', filters)
              }
            },
          }}
        >
          {/* Dashboard Grid */}
          <DashboardGrid columns={12} gap={6}>
            {/* KPI Cards */}
            <div className="col-span-12 md:col-span-3">
              <FilterableCard
                title="Total Sales"
                metric={{
                  value: '24,500',
                  unit: 'units',
                  trend: 'up',
                  trendValue: '+12%',
                }}
                icon={TrendingUp}
                size="sm"
                priority="high"
                enableFiltering={true}
                filterData={{ category: 'sales' }}
              />
            </div>
            
            <div className="col-span-12 md:col-span-3">
              <FilterableCard
                title="Revenue"
                metric={{
                  value: '$45,200',
                  trend: 'up',
                  trendValue: '+8%',
                }}
                icon={BarChart3}
                size="sm"
                priority="high"
                enableFiltering={true}
                filterData={{ category: 'revenue' }}
              />
            </div>
            
            <div className="col-span-12 md:col-span-3">
              <FilterableCard
                title="Active Users"
                metric={{
                  value: '1,234',
                  trend: 'neutral',
                }}
                icon={Users}
                size="sm"
                priority="medium"
                enableFiltering={true}
                filterData={{ category: 'users' }}
              />
            </div>
            
            <div className="col-span-12 md:col-span-3">
              <FilterableCard
                title="Conversion Rate"
                metric={{
                  value: '3.2%',
                  trend: 'down',
                  trendValue: '-0.5%',
                }}
                icon={Activity}
                size="sm"
                priority="critical"
                enableFiltering={true}
                filterData={{ category: 'conversion' }}
              />
            </div>

            {/* Charts */}
            <div className="col-span-12 lg:col-span-8">
              <ChartCard
                title="Sales & Revenue Trends"
                subtitle="Monthly performance data"
                chartType="bar"
                data={sampleChartData}
                exportable={true}
                filterable={true}
                enableCrossCardFiltering={true}
                filterMappings={barChartFilterMappings}
                exportFilename="sales-revenue-trends"
                chartConfig={{
                  legend: { show: true, position: 'bottom' },
                  tooltip: { show: true },
                  animations: { enabled: true, duration: 300 },
                }}
              />
            </div>

            <div className="col-span-12 lg:col-span-4">
              <ChartCard
                title="Regional Distribution"
                subtitle="Sales by region"
                chartType="pie"
                data={pieChartData}
                exportable={true}
                filterable={true}
                enableCrossCardFiltering={true}
                filterMappings={pieChartFilterMappings}
                exportFilename="regional-distribution"
                chartConfig={{
                  legend: { show: true, position: 'bottom' },
                  tooltip: { show: true },
                  animations: { enabled: true, duration: 300 },
                }}
              />
            </div>

            {/* Filtered Data Table */}
            <div className="col-span-12">
              <FilteredDataTable />
            </div>
          </DashboardGrid>
        </FilterSynchronizer>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use Click-to-Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Chart Interactions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Click on bar chart bars to filter by month and category</li>
                <li>Click on pie chart slices to filter by region</li>
                <li>Click on chart legends to filter by data series</li>
                <li>Filters are applied across all dashboard components</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Card Interactions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Click on KPI cards to filter by category</li>
                <li>Multiple filters can be active simultaneously</li>
                <li>Click the &times; button on filter chips to remove individual filters</li>
                <li>Use &quot;Clear all&quot; to remove all active filters</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        {debugMode && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Open browser console to see filter synchronization logs
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </FilterProvider>
  )
}