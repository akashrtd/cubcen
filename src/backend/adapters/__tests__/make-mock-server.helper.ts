/**
 * Mock HTTP server for Make.com API integration tests
 */

import express from 'express'
import { Server } from 'http'

interface MockServerOptions {
  port?: number
  enableLogging?: boolean
}

export function createMakeApiMockServer(options: MockServerOptions = {}) {
  const app = express()
  const port = options.port || 0 // Use random port if not specified
  let server: Server
  let actualPort: number

  // State management
  let isRateLimited = false
  let hasErrors = false
  let slowResponseDelay = 0
  let tokenExpired = false

  // Mock data
  const mockScenarios = [
    {
      id: 1,
      name: 'Test Webhook Scenario',
      is_active: true,
      is_locked: false,
      folder_id: null,
      team_id: 123,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      last_edit: '2024-01-02T00:00:00Z',
      scheduling: {
        type: 'indefinitely' as const,
        interval: 900,
      },
      blueprint: {
        flow: [
          {
            id: 1,
            module: 'webhook',
            version: 1,
            parameters: { hook: 'test-hook' },
            mapper: {},
            metadata: { designer: { x: 0, y: 0 } },
          },
          {
            id: 2,
            module: 'http',
            version: 1,
            parameters: { url: 'https://api.example.com' },
            mapper: {},
            metadata: { designer: { x: 200, y: 0 } },
          },
        ],
        metadata: { version: 1 },
      },
    },
    {
      id: 2,
      name: 'Scheduled Data Sync',
      is_active: false,
      is_locked: true,
      folder_id: 5,
      team_id: 123,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
      last_edit: '2024-01-03T00:00:00Z',
      blueprint: {
        flow: [
          {
            id: 1,
            module: 'schedule',
            version: 1,
            parameters: { interval: 3600 },
            mapper: {},
            metadata: { designer: { x: 0, y: 0 } },
          },
        ],
        metadata: { version: 1 },
      },
    },
  ]

  const mockExecutions = [
    {
      id: 1001,
      scenario_id: 1,
      status: 'success' as const,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:01:00Z',
      started_at: '2024-01-01T10:00:00Z',
      finished_at: '2024-01-01T10:01:00Z',
      execution_time: 60000,
      operations_count: 5,
      data_transfer: 1024,
    },
    {
      id: 1002,
      scenario_id: 1,
      status: 'error' as const,
      created_at: '2024-01-01T11:00:00Z',
      updated_at: '2024-01-01T11:01:00Z',
      started_at: '2024-01-01T11:00:00Z',
      finished_at: '2024-01-01T11:01:00Z',
      execution_time: 30000,
      operations_count: 2,
      data_transfer: 512,
      error: {
        message: 'HTTP request failed',
        type: 'HttpError',
        details: { statusCode: 404 },
      },
    },
    {
      id: 1003,
      scenario_id: 2,
      status: 'success' as const,
      created_at: '2024-01-01T12:00:00Z',
      updated_at: '2024-01-01T12:02:00Z',
      started_at: '2024-01-01T12:00:00Z',
      finished_at: '2024-01-01T12:02:00Z',
      execution_time: 120000,
      operations_count: 10,
      data_transfer: 2048,
    },
  ]

  // Middleware
  app.use(express.json())

  if (options.enableLogging) {
    app.use((req, res, next) => {
      console.log(`[Mock Make.com API] ${req.method} ${req.path}`)
      next()
    })
  }

  // Global middleware for testing conditions
  app.use(async (req, res, next) => {
    // Simulate slow responses
    if (slowResponseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, slowResponseDelay))
    }

    // Simulate rate limiting
    if (isRateLimited) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retry_after: 60,
      })
    }

    // Simulate general errors
    if (hasErrors) {
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Service temporarily unavailable',
      })
    }

    next()
  })

  // Authentication middleware
  const authenticateRequest = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing authorization header',
      })
    }

    // Handle token expiration simulation
    if (tokenExpired && authHeader.includes('expiring-token')) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Access token has expired',
      })
    }

    // Validate token format
    if (authHeader.startsWith('Token ')) {
      const token = authHeader.substring(6)
      if (token === 'invalid-token') {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'The provided API token is invalid',
        })
      }
    } else if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      if (token === 'invalid-access-token') {
        return res.status(401).json({
          error: 'Invalid access token',
          message: 'The provided access token is invalid',
        })
      }
    } else {
      return res.status(401).json({
        error: 'Invalid authorization format',
        message: 'Authorization header must use Token or Bearer format',
      })
    }

    next()
  }

  // OAuth token endpoint
  app.post('/oauth/token', (req, res) => {
    const { grant_type, client_id, client_secret, refresh_token } = req.body

    if (grant_type !== 'refresh_token') {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Only refresh_token grant type is supported',
      })
    }

    if (!client_id || !client_secret || !refresh_token) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing required parameters',
      })
    }

    if (refresh_token === 'invalid-refresh-token') {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid refresh token',
      })
    }

    res.json({
      access_token: 'new-access-token-' + Date.now(),
      refresh_token: 'new-refresh-token-' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'scenarios:read scenarios:write executions:read',
    })
  })

  // Scenarios endpoints
  app.get('/scenarios', authenticateRequest, (req, res) => {
    const { teamId, limit } = req.query
    let scenarios = [...mockScenarios]

    // Filter by team if specified
    if (teamId) {
      scenarios = scenarios.filter(
        s => s.team_id === parseInt(teamId as string)
      )
    }

    // Apply limit if specified
    if (limit) {
      scenarios = scenarios.slice(0, parseInt(limit as string))
    }

    res.json(scenarios)
  })

  app.get('/scenarios/:id', authenticateRequest, (req, res) => {
    const scenarioId = parseInt(req.params.id)
    const scenario = mockScenarios.find(s => s.id === scenarioId)

    if (!scenario) {
      return res.status(404).json({
        error: 'Scenario not found',
        message: `Scenario with ID ${scenarioId} does not exist`,
      })
    }

    res.json(scenario)
  })

  app.post('/scenarios/:id/run', authenticateRequest, (req, res) => {
    const scenarioId = parseInt(req.params.id)
    const scenario = mockScenarios.find(s => s.id === scenarioId)

    if (!scenario) {
      return res.status(404).json({
        error: 'Scenario not found',
        message: `Scenario with ID ${scenarioId} does not exist`,
      })
    }

    if (!scenario.is_active) {
      return res.status(400).json({
        error: 'Scenario inactive',
        message: 'Cannot execute inactive scenario',
      })
    }

    // Create new execution
    const execution = {
      id: Date.now(),
      scenario_id: scenarioId,
      status: 'success' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      finished_at: new Date(Date.now() + 1000).toISOString(),
      execution_time: 1000,
      operations_count: 3,
      data_transfer: 512,
    }

    res.json(execution)
  })

  // Executions endpoints
  app.get('/scenarios/:id/executions', authenticateRequest, (req, res) => {
    const scenarioId = parseInt(req.params.id)
    const { limit } = req.query

    let executions = mockExecutions.filter(e => e.scenario_id === scenarioId)

    // Apply limit if specified
    if (limit) {
      executions = executions.slice(0, parseInt(limit as string))
    }

    res.json(executions)
  })

  app.get('/executions', authenticateRequest, (req, res) => {
    const { limit } = req.query
    let executions = [...mockExecutions]

    // Apply limit if specified
    if (limit) {
      executions = executions.slice(0, parseInt(limit as string))
    }

    res.json(executions)
  })

  app.get('/executions/:id', authenticateRequest, (req, res) => {
    const executionId = parseInt(req.params.id)
    const execution = mockExecutions.find(e => e.id === executionId)

    if (!execution) {
      return res.status(404).json({
        error: 'Execution not found',
        message: `Execution with ID ${executionId} does not exist`,
      })
    }

    res.json(execution)
  })

  // Health check endpoint (not part of real Make.com API, but useful for testing)
  app.get('/health', authenticateRequest, (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
    })
  })

  // Error handler
  app.use((err: Error, req: express.Request, res: express.Response) => {
    console.error('Mock server error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    })
  })

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not found',
      message: `Endpoint ${req.method} ${req.path} not found`,
    })
  })

  return {
    async start(): Promise<void> {
      return new Promise((resolve, reject) => {
        server = app.listen(port, (err?: Error) => {
          if (err) {
            reject(err)
          } else {
            actualPort =
              (server.address() as { port: number } | null)?.port || port
            if (options.enableLogging) {
              console.log(
                `Mock Make.com API server started on port ${actualPort}`
              )
            }
            resolve()
          }
        })
      })
    },

    async stop(): Promise<void> {
      return new Promise(resolve => {
        if (server) {
          server.close(() => {
            if (options.enableLogging) {
              console.log('Mock Make.com API server stopped')
            }
            resolve()
          })
        } else {
          resolve()
        }
      })
    },

    getBaseUrl(): string {
      return `http://localhost:${actualPort}`
    },

    getPort(): number {
      return actualPort
    },

    // Test control methods
    enableRateLimit(): void {
      isRateLimited = true
    },

    disableRateLimit(): void {
      isRateLimited = false
    },

    enableErrors(): void {
      hasErrors = true
    },

    disableErrors(): void {
      hasErrors = false
    },

    enableSlowResponses(delay: number): void {
      slowResponseDelay = delay
    },

    disableSlowResponses(): void {
      slowResponseDelay = 0
    },

    expireToken(): void {
      tokenExpired = true
    },

    refreshToken(): void {
      tokenExpired = false
    },

    reset(): void {
      isRateLimited = false
      hasErrors = false
      slowResponseDelay = 0
      tokenExpired = false
    },

    // Data manipulation methods
    addScenario(scenario: Record<string, unknown>): void {
      mockScenarios.push(scenario)
    },

    removeScenario(id: number): void {
      const index = mockScenarios.findIndex(s => s.id === id)
      if (index > -1) {
        mockScenarios.splice(index, 1)
      }
    },

    addExecution(execution: Record<string, unknown>): void {
      mockExecutions.push(execution)
    },

    clearExecutions(): void {
      mockExecutions.length = 0
    },

    getScenarios(): Record<string, unknown>[] {
      return [...mockScenarios]
    },

    getExecutions(): Record<string, unknown>[] {
      return [...mockExecutions]
    },
  }
}
