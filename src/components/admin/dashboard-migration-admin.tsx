/**
 * Admin interface for managing dashboard migration
 * Allows administrators to control feature flags and rollout
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DashboardMigration, 
  MigrationAnalytics,
  MigrationRollback 
} from '@/lib/dashboard-migration'
import { 
  Settings, 
  Users, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw
} from 'lucide-react'

interface MigrationAdminProps {
  className?: string
}

export function DashboardMigrationAdmin({ className }: MigrationAdminProps) {
  const [migration] = useState(() => DashboardMigration.getInstance())
  const [status, setStatus] = useState(migration.getMigrationStatus())
  const [loading, setLoading] = useState(false)

  const refreshStatus = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would fetch from an API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStatus(migration.getMigrationStatus())
    } finally {
      setLoading(false)
    }
  }

  const updateFeatureFlag = (feature: string, enabled: boolean) => {
    migration.updateConfig({ [feature]: enabled })
    setStatus(migration.getMigrationStatus())
    
    // Track the change
    MigrationAnalytics.trackComponentUsage(
      `Admin-${feature}`, 
      enabled ? 'new' : 'legacy'
    )
  }

  const handleRollback = (componentName: string) => {
    MigrationRollback.clearFailures(componentName)
    updateFeatureFlag(`useNew${componentName}`, false)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Migration</h2>
          <p className="text-muted-foreground">
            Manage the rollout of new modular dashboard components
          </p>
        </div>
        <Button onClick={refreshStatus} disabled={loading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Migration Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rollout Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.rolloutPercentage}%</div>
            <Progress value={status.rolloutPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.newDashboardUsers}</div>
            <p className="text-xs text-muted-foreground">
              of {status.totalUsers} total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features Enabled</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(status.features).filter(Boolean).length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {Object.keys(status.features).length} features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="default" className="text-xs">
                Healthy
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              No critical issues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Flags Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Feature Flags
          </CardTitle>
          <CardDescription>
            Control which new dashboard components are enabled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dashboard-flag">New Dashboard System</Label>
              <p className="text-sm text-muted-foreground">
                Enable the complete new dashboard system
              </p>
            </div>
            <Switch
              id="dashboard-flag"
              checked={status.features.dashboard}
              onCheckedChange={(checked) => updateFeatureFlag('useNewDashboard', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="kpi-flag">New KPI Cards</Label>
              <p className="text-sm text-muted-foreground">
                Use MetricCard components for KPI displays
              </p>
            </div>
            <Switch
              id="kpi-flag"
              checked={status.features.kpiCards}
              onCheckedChange={(checked) => updateFeatureFlag('useNewKPICards', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="charts-flag">New Chart System</Label>
              <p className="text-sm text-muted-foreground">
                Use ChartCard components with new chart wrapper
              </p>
            </div>
            <Switch
              id="charts-flag"
              checked={status.features.charts}
              onCheckedChange={(checked) => updateFeatureFlag('useNewCharts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="layout-flag">New Layout System</Label>
              <p className="text-sm text-muted-foreground">
                Use DashboardLayout with CSS Grid
              </p>
            </div>
            <Switch
              id="layout-flag"
              checked={status.features.layout}
              onCheckedChange={(checked) => updateFeatureFlag('useNewLayout', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Migration Alerts */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Migration in Progress:</strong> New dashboard components are being gradually 
          rolled out. Monitor user feedback and system performance closely.
        </AlertDescription>
      </Alert>
    </div>
  )
}