/**
 * Mock n8n Server for Integration Testing
 * Simulates n8n API responses for testing the n8n adapter
 *
 * @jest-environment node
 */

import express, { Express, Request, Response } from 'express'
import { Server } from 'http'

// This file is used by integration tests and doesn't contain tests itself

export interface MockN8nServerOptions {
  port?: number
  delay?: number
  failureRate?: number
}

export class MockN8nServer {
  private app: Express
  private server?: Server
  private port: number
  private delay: number
  private failureRate: number
  private workflows: Record<string, unknown>[] = []
  private executions: Record<string, unknown>[] = []
  private isAuthenticated = false
  private validApiKey = 'test-api-key'
  private validCredentials = {
    email: 'test@example.com',
    password: 'password123',
  }

  constructor(options: MockN8nServerOptions = {}) {
    this.app = express()
    this.port = options.port || 5678
    this.delay = options.delay || 0
    this.failureRate = options.failureRate || 0

    this.setupMiddleware()
    this.setupRoutes()
    this.setupDefaultData()
  }

  private setupMiddleware(): void {
    this.app.use(express.json())

    // Add delay middleware for testing timeouts
    this.app.use((req, res, next) => {
      if (this.delay > 0) {
        setTimeout(next, this.delay)
      } else {
        next()
      }
    })

    // Add failure simulation middleware
    this.app.use((_req, res, next) => {
      if (Math.random() < this.failureRate) {
        return res.status(500).json({ error: 'Simulated server error' })
      }
      next()
    })

    // Authentication middleware
    this.app.use((req, res, next) => {
      // Skip auth for login and health endpoints
      if (req.path === '/login' || req.path === '/healthz') {
        return next()
      }

      const apiKey = req.headers['x-n8n-api-key']
      const authHeader = req.headers.authorization

      if (apiKey === this.validApiKey) {
        this.isAuthenticated = true
        return next()
      }

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        if (token === 'valid-jwt-token') {
          this.isAuthenticated = true
          return next()
        }
      }

      return res.status(401).json({ error: 'Unauthorized' })
    })
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/healthz', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() })
    })

    // Authentication endpoint
    this.app.post('/login', (req: Request, res: Response) => {
      const { email, password } = req.body

      if (
        email === this.validCredentials.email &&
        password === this.validCredentials.password
      ) {
        res.json({
          token: 'valid-jwt-token',
          expiresIn: 3600,
        })
      } else {
        res.status(401).json({ error: 'Invalid credentials' })
      }
    })

    // Workflows endpoints
    this.app.get('/workflows', (req: Request, res: Response) => {
      res.json({ data: this.workflows })
    })

    this.app.get('/workflows/:id', (req: Request, res: Response) => {
      const workflow = this.workflows.find(w => w.id === req.params.id)
      if (workflow) {
        res.json({ data: workflow })
      } else {
        res.status(404).json({ error: 'Workflow not found' })
      }
    })

    this.app.post('/workflows/:id/execute', (req: Request, res: Response) => {
      const workflowId = req.params.id
      const workflow = this.workflows.find(w => w.id === workflowId)

      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' })
      }

      const executionId = `exec-${Date.now()}`
      const execution = {
        id: executionId,
        workflowId,
        mode: 'manual',
        status: 'running',
        startedAt: new Date().toISOString(),
        workflowData: workflow,
        data: req.body.data,
      }

      this.executions.push(execution)

      // Simulate execution completion after a short delay
      setTimeout(() => {
        const exec = this.executions.find(e => e.id === executionId)
        if (exec) {
          exec.status = Math.random() > 0.2 ? 'success' : 'error'
          exec.stoppedAt = new Date().toISOString()
          if (exec.status === 'success') {
            exec.data = {
              result: 'Execution completed successfully',
              input: req.body.data,
            }
          } else {
            exec.error = 'Simulated execution error'
          }
        }
      }, 1000)

      res.json({ data: execution })
    })

    // Executions endpoints
    this.app.get('/executions', (req: Request, res: Response) => {
      let filteredExecutions = [...this.executions]

      if (req.query.filter) {
        try {
          const filter = JSON.parse(req.query.filter as string)
          if (filter.workflowId) {
            filteredExecutions = filteredExecutions.filter(
              e => e.workflowId === filter.workflowId
            )
          }
        } catch (error) {
          // Ignore invalid filter
        }
      }

      const limit = parseInt(req.query.limit as string) || 10
      const limitedExecutions = filteredExecutions.slice(0, limit)

      res.json({ data: limitedExecutions })
    })

    this.app.get('/executions/:id', (req: Request, res: Response) => {
      const execution = this.executions.find(e => e.id === req.params.id)
      if (execution) {
        res.json({ data: execution })
      } else {
        res.status(404).json({ error: 'Execution not found' })
      }
    })

    // Error simulation endpoints
    this.app.get('/error/timeout', (_req: Request, _res: Response) => {
      // Never respond to simulate timeout
    })

    this.app.get('/error/500', (req: Request, res: Response) => {
      res.status(500).json({ error: 'Internal server error' })
    })

    this.app.get('/error/malformed', (req: Request, res: Response) => {
      res.send('This is not valid JSON')
    })
  }

  private setupDefaultData(): void {
    this.workflows = [
      {
        id: 'workflow-1',
        name: 'Test Workflow 1',
        active: true,
        tags: ['automation', 'test'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        versionId: 'v1',
        nodes: [
          {
            id: 'node-1',
            name: 'Start',
            type: 'n8n-nodes-base.start',
            typeVersion: 1,
            position: [100, 100],
            parameters: {},
          },
          {
            id: 'node-2',
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 1,
            position: [300, 100],
            parameters: { url: 'https://api.example.com' },
          },
        ],
        connections: {},
        settings: {
          executionOrder: 'v1',
        },
      },
      {
        id: 'workflow-2',
        name: 'Test Workflow 2',
        active: false,
        tags: ['inactive'],
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
        versionId: 'v1',
        nodes: [
          {
            id: 'node-1',
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [100, 100],
            parameters: { path: 'test-webhook' },
          },
        ],
        connections: {},
      },
    ]

    this.executions = [
      {
        id: 'exec-1',
        workflowId: 'workflow-1',
        mode: 'manual',
        status: 'success',
        startedAt: '2024-01-01T10:00:00Z',
        stoppedAt: '2024-01-01T10:01:00Z',
        workflowData: this.workflows[0],
        data: { result: 'Success' },
      },
      {
        id: 'exec-2',
        workflowId: 'workflow-1',
        mode: 'manual',
        status: 'error',
        startedAt: '2024-01-01T11:00:00Z',
        stoppedAt: '2024-01-01T11:00:30Z',
        workflowData: this.workflows[0],
        error: 'Test error',
      },
    ]
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (err?: Error) => {
        if (err) {
          reject(err)
        } else {
          console.log(`Mock n8n server running on port ${this.port}`)
          resolve()
        }
      })
    })
  }

  async stop(): Promise<void> {
    return new Promise(resolve => {
      if (this.server) {
        this.server.close(() => {
          console.log('Mock n8n server stopped')
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  // Test utilities
  setDelay(delay: number): void {
    this.delay = delay
  }

  setFailureRate(rate: number): void {
    this.failureRate = rate
  }

  addWorkflow(workflow: Record<string, unknown>): void {
    this.workflows.push(workflow)
  }

  addExecution(execution: Record<string, unknown>): void {
    this.executions.push(execution)
  }

  clearData(): void {
    this.workflows = []
    this.executions = []
  }

  getWorkflows(): Record<string, unknown>[] {
    return [...this.workflows]
  }

  getExecutions(): Record<string, unknown>[] {
    return [...this.executions]
  }

  isServerAuthenticated(): boolean {
    return this.isAuthenticated
  }

  resetAuth(): void {
    this.isAuthenticated = false
  }
}
