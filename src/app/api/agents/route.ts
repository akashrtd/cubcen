import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock agents data
  const mockAgents = [
    {
      id: 'agent-1',
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
      },
      description: 'Sends email notifications based on triggers',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 'agent-2',
      name: 'Data Sync Agent',
      platform: 'n8n',
      status: 'active',
      capabilities: ['data-sync', 'api-integration', 'transformation'],
      configuration: {
        sourceApi: 'https://api.source.com',
        targetApi: 'https://api.target.com',
        syncInterval: '5m',
      },
      healthStatus: {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: 200,
      },
      description: 'Synchronizes data between two API endpoints',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: 'agent-3',
      name: 'Social Media Monitor',
      platform: 'Make.com',
      status: 'active',
      capabilities: ['social-media', 'monitoring', 'analytics'],
      configuration: {
        platforms: ['twitter', 'linkedin'],
        keywords: ['AI', 'automation', 'cubcen'],
        alertThreshold: 10,
      },
      healthStatus: {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: 300,
      },
      description: 'Monitors social media mentions and trends',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  ]

  return NextResponse.json({
    success: true,
    agents: mockAgents,
    total: mockAgents.length,
    message: 'Agents retrieved successfully',
  })
}