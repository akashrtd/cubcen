import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock error logs data
  const mockLogs = [
    {
      id: '1',
      level: 'ERROR',
      message: 'Failed to connect to external API',
      context: {
        url: 'https://api.example.com/data',
        timeout: 30000,
        retryCount: 3,
      },
      source: 'api-client',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      stackTrace:
        'Error: Connection timeout\n    at ApiClient.request (api-client.js:45)\n    at Agent.execute (agent.js:123)',
      agentId: 'agent-1',
      taskId: 'task-1',
      platformId: 'platform-1',
      userId: 'user-1',
    },
    {
      id: '2',
      level: 'WARN',
      message: 'High memory usage detected',
      context: {
        memoryUsage: '85%',
        threshold: '80%',
        processId: 'agent-2',
      },
      source: 'system-monitor',
      timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      agentId: 'agent-2',
    },
    {
      id: '3',
      level: 'ERROR',
      message: 'Authentication failed for SMTP server',
      context: {
        server: 'smtp.gmail.com',
        port: 587,
        username: 'notifications@example.com',
      },
      source: 'email-service',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      stackTrace:
        'AuthenticationError: Invalid credentials\n    at SMTPClient.authenticate (smtp.js:78)',
      agentId: 'agent-3',
      taskId: 'task-2',
    },
    {
      id: '4',
      level: 'INFO',
      message: 'Task completed successfully',
      context: {
        taskId: 'task-4',
        duration: 2340,
        recordsProcessed: 150,
      },
      source: 'task-executor',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      agentId: 'agent-1',
      taskId: 'task-4',
    },
    {
      id: '5',
      level: 'FATAL',
      message: 'System out of memory',
      context: {
        availableMemory: '0MB',
        requiredMemory: '512MB',
        processCount: 15,
      },
      source: 'system',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      stackTrace:
        'OutOfMemoryError: Java heap space\n    at DataProcessor.process (processor.java:234)',
    },
  ]

  return NextResponse.json({
    success: true,
    logs: mockLogs,
    total: mockLogs.length,
    totalPages: 1,
    page: 1,
    limit: 50,
    hasMore: false,
    message: 'Error logs retrieved successfully',
  })
}
