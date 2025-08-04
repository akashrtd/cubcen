import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock retryable tasks data
  const mockTasks = [
    {
      id: 'task-1',
      name: 'Process Customer Data',
      agentId: 'agent-1',
      agentName: 'Data Processing Agent',
      status: 'FAILED',
      error: 'Connection timeout after 30 seconds',
      retryCount: 2,
      maxRetries: 3,
      lastAttempt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      canRetry: true,
      parameters: {
        customerId: '12345',
        dataType: 'profile',
      },
    },
    {
      id: 'task-2',
      name: 'Send Email Notification',
      agentId: 'agent-2',
      agentName: 'Email Agent',
      status: 'FAILED',
      error: 'SMTP authentication failed',
      retryCount: 1,
      maxRetries: 3,
      lastAttempt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      canRetry: true,
      parameters: {
        recipient: 'user@example.com',
        template: 'welcome',
      },
    },
    {
      id: 'task-3',
      name: 'Generate Report',
      agentId: 'agent-3',
      agentName: 'Report Generator',
      status: 'CANCELLED',
      error: 'User cancelled operation',
      retryCount: 0,
      maxRetries: 3,
      lastAttempt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      canRetry: false,
      parameters: {
        reportType: 'monthly',
        period: '2024-01',
      },
    },
  ]

  return NextResponse.json({
    success: true,
    tasks: mockTasks,
    message: 'Retryable tasks retrieved successfully',
  })
}