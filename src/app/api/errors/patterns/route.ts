import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock error patterns data
  const mockPatterns = [
    {
      id: '1',
      pattern: 'Connection timeout to external API',
      description: 'Recurring timeouts when connecting to third-party services',
      frequency: 15,
      lastOccurrence: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      affectedAgents: ['agent-1', 'agent-3'],
      severity: 'HIGH',
      suggestedAction: 'Check network connectivity and increase timeout values',
    },
    {
      id: '2',
      pattern: 'Authentication failed',
      description: 'API key authentication failures',
      frequency: 8,
      lastOccurrence: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      affectedAgents: ['agent-2'],
      severity: 'MEDIUM',
      suggestedAction: 'Verify API keys are valid and not expired',
    },
    {
      id: '3',
      pattern: 'Memory allocation error',
      description: 'Out of memory errors during large data processing',
      frequency: 3,
      lastOccurrence: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      affectedAgents: ['agent-4'],
      severity: 'CRITICAL',
      suggestedAction: 'Increase memory allocation or optimize data processing',
    },
  ]

  return NextResponse.json({
    success: true,
    patterns: mockPatterns,
    message: 'Error patterns retrieved successfully',
  })
}