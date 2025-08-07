'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Bot,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Clock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { useState, useEffect } from 'react'

// Mock data for demonstration
const mockStats = {
  totalAgents: 24,
  activeAgents: 18,
  totalTasks: 156,
  completedTasks: 142,
  failedTasks: 8,
  pendingTasks: 6,
  successRate: 91.0,
  avgResponseTime: 1.2,
}

const mockRecentTasks = [
  {
    id: '1',
    name: 'Data Sync - Customer Records',
    agent: 'n8n-sync-agent',
    status: 'completed',
    duration: '2.3s',
    timestamp: '2 minutes ago',
  },
  {
    id: '2',
    name: 'Email Campaign Trigger',
    agent: 'make-email-agent',
    status: 'running',
    duration: '1.8s',
    timestamp: '5 minutes ago',
  },
  {
    id: '3',
    name: 'Inventory Update',
    agent: 'zapier-inventory',
    status: 'failed',
    duration: '0.5s',
    timestamp: '8 minutes ago',
  },
  {
    id: '4',
    name: 'Report Generation',
    agent: 'n8n-reports',
    status: 'completed',
    duration: '4.1s',
    timestamp: '12 minutes ago',
  },
]

const mockAgents = [
  {
    id: '1',
    name: 'Customer Data Sync',
    platform: 'n8n',
    status: 'active',
    lastRun: '2 minutes ago',
    successRate: 98,
  },
  {
    id: '2',
    name: 'Email Marketing',
    platform: 'make',
    status: 'active',
    lastRun: '5 minutes ago',
    successRate: 95,
  },
  {
    id: '3',
    name: 'Inventory Management',
    platform: 'zapier',
    status: 'error',
    lastRun: '8 minutes ago',
    successRate: 87,
  },
  {
    id: '4',
    name: 'Report Generator',
    platform: 'n8n',
    status: 'idle',
    lastRun: '1 hour ago',
    successRate: 92,
  },
]

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-500'
      case 'running':
        return 'bg-cubcen-secondary'
      case 'error':
      case 'failed':
        return 'bg-red-500'
      case 'idle':
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'default'
      case 'running':
        return 'secondary'
      case 'error':
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s what&apos;s happening with your AI
              agents.
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-cubcen-primary hover:bg-cubcen-primary-hover"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Agents
              </CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalAgents}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  {mockStats.activeAgents} active
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  {mockStats.completedTasks} completed
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.successRate}%</div>
              <Progress value={mockStats.successRate} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Response
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.avgResponseTime}s
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">↓ 0.3s from yesterday</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {mockStats.failedTasks > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {mockStats.failedTasks} tasks failed in the last hour.
              <Button
                variant="link"
                className="p-0 ml-1 h-auto text-cubcen-primary"
              >
                View details
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Tasks
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </CardTitle>
              <CardDescription>
                Latest task executions across all agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentTasks.map(task => (
                  <div key={task.id} className="flex items-center space-x-4">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {task.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {task.agent} • {task.duration} • {task.timestamp}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agent Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Agent Status
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage
                </Button>
              </CardTitle>
              <CardDescription>
                Current status of your AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAgents.map(agent => (
                  <div key={agent.id} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}
                      />
                      <Badge variant="outline" className="text-xs">
                        {agent.platform}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {agent.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last run: {agent.lastRun} • {agent.successRate}% success
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
