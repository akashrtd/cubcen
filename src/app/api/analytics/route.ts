import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock analytics data
  const mockAnalytics = {
    kpis: {
      totalAgents: 12,
      activeAgents: 10,
      totalTasks: 1247,
      successRate: 94.2,
      avgResponseTime: 1.8,
      errorRate: 5.8,
    },
    agentPerformance: [
      {
        id: 'agent-1',
        name: 'Email Notification Agent',
        platform: 'n8n',
        status: 'active',
        tasksCompleted: 156,
        successRate: 98.1,
        avgResponseTime: 1.2,
        lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        errors: 3,
      },
      {
        id: 'agent-2',
        name: 'Data Sync Agent',
        platform: 'n8n',
        status: 'active',
        tasksCompleted: 89,
        successRate: 91.0,
        avgResponseTime: 2.4,
        lastActive: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        errors: 8,
      },
      {
        id: 'agent-3',
        name: 'Social Media Monitor',
        platform: 'Make.com',
        status: 'active',
        tasksCompleted: 234,
        successRate: 96.8,
        avgResponseTime: 1.6,
        lastActive: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        errors: 7,
      },
      {
        id: 'agent-4',
        name: 'Report Generator',
        platform: 'Zapier',
        status: 'inactive',
        tasksCompleted: 45,
        successRate: 88.9,
        avgResponseTime: 3.2,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        errors: 5,
      },
    ],
    performanceCharts: {
      taskExecution: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Completed',
            data: [45, 52, 38, 67, 73, 42, 58],
            backgroundColor: '#3F51B5',
          },
          {
            label: 'Failed',
            data: [3, 4, 2, 5, 4, 3, 4],
            backgroundColor: '#ef4444',
          },
        ],
      },
      responseTime: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [
          {
            label: 'Response Time (s)',
            data: [1.2, 1.8, 2.1, 1.9, 1.6, 1.4],
            borderColor: '#B19ADA',
            backgroundColor: 'rgba(177, 154, 218, 0.1)',
          },
        ],
      },
      errorPatterns: {
        labels: [
          'Connection Timeout',
          'Auth Failed',
          'Rate Limited',
          'Invalid Data',
          'Server Error',
        ],
        datasets: [
          {
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
              '#ef4444',
              '#f97316',
              '#eab308',
              '#06b6d4',
              '#8b5cf6',
            ],
          },
        ],
      },
    },
    errorPatterns: [
      {
        error: 'Connection timeout to external API',
        count: 45,
      },
      {
        error: 'Authentication failed - invalid credentials',
        count: 32,
      },
      {
        error: 'Rate limit exceeded - too many requests',
        count: 28,
      },
      {
        error: 'Database connection lost',
        count: 15,
      },
      {
        error: 'Invalid JSON response from server',
        count: 12,
      },
      {
        error: 'Memory allocation failed',
        count: 8,
      },
      {
        error: 'File not found - missing configuration',
        count: 6,
      },
    ],
    trends: {
      successRate: {
        current: 94.2,
        previous: 91.8,
        trend: 'up',
      },
      responseTime: {
        current: 1.8,
        previous: 2.1,
        trend: 'down',
      },
      errorRate: {
        current: 5.8,
        previous: 8.2,
        trend: 'down',
      },
    },
  }

  return NextResponse.json({
    success: true,
    data: mockAnalytics,
    message: 'Analytics data retrieved successfully',
  })
}
