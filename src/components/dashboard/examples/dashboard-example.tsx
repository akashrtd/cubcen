import React from 'react'
import { DashboardLayout } from '../layout/dashboard-layout'
import { DashboardHeader } from '../layout/dashboard-header'
import { DashboardSidebar } from '../layout/dashboard-sidebar'
import { DashboardFooter } from '../layout/dashboard-footer'
import { DashboardGrid } from '../grid/dashboard-grid'
import { DashboardCard } from '../cards/dashboard-card'
import { ChartWrapper } from '../charts/chart-wrapper'
import { Activity, Users, TrendingUp, AlertCircle } from 'lucide-react'

export function DashboardExample() {
  const mockChartData = {
    datasets: [
      {
        label: 'Sample Data',
        data: [
          { x: 'Jan', y: 100 },
          { x: 'Feb', y: 150 },
          { x: 'Mar', y: 120 },
        ],
      },
    ],
  }

  return (
    <DashboardLayout
      header={<DashboardHeader />}
      sidebar={<DashboardSidebar />}
      footer={<DashboardFooter />}
    >
      <DashboardGrid>
        <GridItem colSpan={3} priority="critical">
          <DashboardCard
            title="Active Agents"
            icon={Activity}
            metric={{
              value: 24,
              unit: 'agents',
              trend: 'up',
              trendValue: '+12%',
            }}
            priority="critical"
          />
        </GridItem>

        <GridItem colSpan={3} priority="high">
          <DashboardCard
            title="Total Users"
            icon={Users}
            metric={{
              value: 1247,
              unit: 'users',
              trend: 'up',
              trendValue: '+5%',
            }}
            priority="high"
          />
        </GridItem>

        <GridItem colSpan={3} priority="medium">
          <DashboardCard
            title="Performance"
            icon={TrendingUp}
            metric={{
              value: 98.5,
              unit: '%',
              trend: 'neutral',
              trendValue: '0%',
            }}
            priority="medium"
          />
        </GridItem>

        <GridItem colSpan={3} priority="low">
          <DashboardCard
            title="Alerts"
            icon={AlertCircle}
            metric={{
              value: 3,
              unit: 'active',
              trend: 'down',
              trendValue: '-2',
            }}
            priority="low"
          />
        </GridItem>

        <GridItem colSpan={6}>
          <DashboardCard title="Performance Chart" size="lg">
            <ChartWrapper type="line" data={mockChartData} height={300} />
          </DashboardCard>
        </GridItem>

        <GridItem colSpan={6}>
          <DashboardCard title="Usage Statistics" size="lg">
            <ChartWrapper type="bar" data={mockChartData} height={300} />
          </DashboardCard>
        </GridItem>
      </DashboardGrid>
    </DashboardLayout>
  )
}
