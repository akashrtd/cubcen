import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params

  // Mock individual agent data
  const mockAgent = {
    id: agentId,
    name: 'Email Notification Agent',
    platform: 'n8n',
    status: 'active',
    capabilities: ['email', 'notifications', 'scheduling'],
    configuration: {
      emailProvider: 'smtp',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
    },
    healthStatus: {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      responseTime: 150,
      checks: {
        connectivity: 'pass',
        authentication: 'pass',
        resources: 'pass',
      },
    },
    description: 'Sends email notifications based on triggers',
    metrics: {
      tasksCompleted: 156,
      successRate: 98.1,
      avgResponseTime: 1.2,
      errors: 3,
    },
    recentTasks: [
      {
        id: 'task-1',
        name: 'Send Welcome Email',
        status: 'completed',
        startedAt: new Date(Date.now() - 30 * 60 * 1000),
        completedAt: new Date(Date.now() - 28 * 60 * 1000),
        duration: 2000,
      },
      {
        id: 'task-2',
        name: 'Send Password Reset',
        status: 'completed',
        startedAt: new Date(Date.now() - 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 58 * 60 * 1000),
        duration: 1500,
      },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  }

  return NextResponse.json({
    success: true,
    agent: mockAgent,
    message: 'Agent retrieved successfully',
  })
}