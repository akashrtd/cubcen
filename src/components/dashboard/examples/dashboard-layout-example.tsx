'use client'

import React from 'react'
import {
  DashboardLayout,
  DashboardHeader,
  DashboardFooter,
} from '../layout/dashboard-layout'
import { DashboardSidebar } from '../layout/dashboard-sidebar'
import { DashboardCard } from '../cards/dashboard-card'
import { DashboardGrid } from '../grid/dashboard-grid'
import { ChartWrapper } from '../charts/chart-wrapper'

// Example header component
function ExampleHeader() {
  return (
    <DashboardHeader>
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-dashboard-text-primary">
          Cubcen Dashboard
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1 text-sm bg-dashboard-primary text-dashboard-text-inverse rounded-md">
          Settings
        </button>
      </div>
    </DashboardHeader>
  )
}

// Example sidebar content
function ExampleSidebar() {
  return <DashboardSidebar />
}

// Example footer component
function ExampleFooter() {
  return (
    <DashboardFooter>
      <div className="text-dashboard-text-secondary">
        © 2025 Cubcen AI Agent Management Platform
      </div>
      <div className="text-dashboard-text-secondary">Version 1.0.0</div>
    </DashboardFooter>
  )
}

// Example main content
function ExampleMainContent() {
  const mockChartData = {
    datasets: [
      {
        label: 'Active Agents',
        data: [
          { x: 'Jan', y: 10 },
          { x: 'Feb', y: 15 },
          { x: 'Mar', y: 12 },
          { x: 'Apr', y: 18 },
          { x: 'May', y: 22 },
        ],
      },
    ],
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-dashboard-text-primary mb-2">
          Dashboard Overview
        </h2>
        <p className="text-dashboard-text-secondary">
          Monitor your AI agents and platform performance
        </p>
      </div>

      <DashboardGrid>
        {/* KPI Cards */}
        <GridItem
          colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}
          priority="critical"
        >
          <DashboardCard
            title="Active Agents"
            metric={{
              value: 24,
              unit: 'agents',
              trend: 'up',
              trendValue: '+12%',
            }}
            priority="critical"
          />
        </GridItem>

        <GridItem
          colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}
          priority="high"
        >
          <DashboardCard
            title="Tasks Completed"
            metric={{
              value: 1247,
              unit: 'tasks',
              trend: 'up',
              trendValue: '+8%',
            }}
            priority="high"
          />
        </GridItem>

        <GridItem
          colSpan={{ desktop: 3, tablet: 2, mobile: 1 }}
          priority="medium"
        >
          <DashboardCard
            title="Error Rate"
            metric={{
              value: 2.3,
              unit: '%',
              trend: 'down',
              trendValue: '-0.5%',
            }}
            priority="medium"
          />
        </GridItem>

        <GridItem colSpan={{ desktop: 3, tablet: 2, mobile: 1 }} priority="low">
          <DashboardCard
            title="Uptime"
            metric={{
              value: 99.9,
              unit: '%',
              trend: 'neutral',
              trendValue: '0%',
            }}
            priority="low"
          />
        </GridItem>

        {/* Chart Cards */}
        <GridItem colSpan={{ desktop: 6, tablet: 3, mobile: 1 }}>
          <DashboardCard title="Agent Performance" subtitle="Last 30 days">
            <ChartWrapper type="line" data={mockChartData} height={300} />
          </DashboardCard>
        </GridItem>

        <GridItem colSpan={{ desktop: 6, tablet: 3, mobile: 1 }}>
          <DashboardCard title="Task Distribution" subtitle="By platform">
            <ChartWrapper type="pie" data={mockChartData} height={300} />
          </DashboardCard>
        </GridItem>

        {/* Full-width table card */}
        <GridItem colSpan={{ desktop: 12, tablet: 6, mobile: 1 }}>
          <DashboardCard
            title="Recent Activity"
            subtitle="Latest agent activities"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dashboard-background rounded-lg">
                <div>
                  <div className="font-medium">
                    Agent-001 completed workflow
                  </div>
                  <div className="text-sm text-dashboard-text-secondary">
                    2 minutes ago
                  </div>
                </div>
                <div className="px-2 py-1 text-xs bg-dashboard-success text-white rounded">
                  Success
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-dashboard-background rounded-lg">
                <div>
                  <div className="font-medium">Agent-002 started new task</div>
                  <div className="text-sm text-dashboard-text-secondary">
                    5 minutes ago
                  </div>
                </div>
                <div className="px-2 py-1 text-xs bg-dashboard-info text-white rounded">
                  Running
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-dashboard-background rounded-lg">
                <div>
                  <div className="font-medium">Agent-003 encountered error</div>
                  <div className="text-sm text-dashboard-text-secondary">
                    10 minutes ago
                  </div>
                </div>
                <div className="px-2 py-1 text-xs bg-dashboard-error text-white rounded">
                  Error
                </div>
              </div>
            </div>
          </DashboardCard>
        </GridItem>
      </DashboardGrid>
    </div>
  )
}

// Main example component
export function DashboardLayoutExample() {
  return (
    <DashboardLayout
      header={<ExampleHeader />}
      sidebar={<ExampleSidebar />}
      footer={<ExampleFooter />}
      showMobileNav={true}
      enableSwipeNavigation={true}
      className="min-h-screen"
    >
      <ExampleMainContent />
    </DashboardLayout>
  )
}

export default DashboardLayoutExample
