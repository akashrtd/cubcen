import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock platforms data
  const mockPlatforms = [
    {
      id: 'platform-1',
      name: 'n8n Development',
      type: 'N8N',
      baseUrl: 'http://localhost:5678',
      status: 'connected',
      authConfig: {
        type: 'api_key',
        apiKey: 'dev-api-key-123',
      },
      lastSyncAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      agentCount: 2,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updatedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
    {
      id: 'platform-2',
      name: 'Make.com Development',
      type: 'MAKE',
      baseUrl: 'https://api.make.com',
      status: 'connected',
      authConfig: {
        type: 'oauth2',
        clientId: 'dev-client-id',
        clientSecret: 'dev-client-secret',
        accessToken: 'dev-access-token',
      },
      lastSyncAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      agentCount: 1,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    },
  ]

  return NextResponse.json({
    success: true,
    platforms: mockPlatforms,
    total: mockPlatforms.length,
    message: 'Platforms retrieved successfully',
  })
}