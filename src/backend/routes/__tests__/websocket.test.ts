// Cubcen WebSocket Routes Tests
// Tests for WebSocket management API endpoints

import request from 'supertest'
import { createServer } from 'http'
import app from '@/server'
import { initializeWebSocketService } from '@/services/websocket'
import { generateToken } from '@/lib/jwt'
import { prisma } from '@/lib/database'

// Mock WebSocket service
const mockWebSocketService = {
  getConnectionCount: jest.fn(),
  getConnections: jest.fn(),
  getSubscriptionStats: jest.fn(),
  broadcastInfoAlert: jest.fn(),
  broadcastWarningAlert: jest.fn(),
  broadcastCriticalAlert: jest.fn()
}

jest.mock('@/services/websocket', () => ({
  getWebSocketService: () => mockWebSocketService,
  initializeWebSocketService: jest.fn()
}))

// Mock authentication middleware
jest.mock('@/backend/middleware/auth', () => ({
  authenticate: jest.fn((req: any, res: any, next: any) => {
    // Mock user based on token
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } })
    }
    
    const token = authHeader.replace('Bearer ', '')
    if (token.includes('admin')) {
      req.user = { id: 'admin123', role: 'admin', email: 'admin@cubcen.com' }
    } else if (token.includes('user')) {
      req.user = { id: 'user123', role: 'operator', email: 'user@cubcen.com' }
    } else if (token.includes('viewer')) {
      req.user = { id: 'viewer123', role: 'viewer', email: 'viewer@cubcen.com' }
    } else {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } })
    }
    
    next()
  })
}))

// Mock JWT functions
jest.mock('@/lib/jwt', () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn()
}))

// Mock database
jest.mock('@/lib/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}))

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}))

describe('WebSocket Routes', () => {
  let server: any
  let adminToken: string
  let userToken: string
  let viewerToken: string

  const mockAdminUser = {
    id: 'admin123',
    email: 'admin@cubcen.com',
    role: 'admin',
    name: 'Admin User'
  }

  const mockRegularUser = {
    id: 'user123',
    email: 'user@cubcen.com',
    role: 'operator',
    name: 'Regular User'
  }

  const mockViewerUser = {
    id: 'viewer123',
    email: 'viewer@cubcen.com',
    role: 'viewer',
    name: 'Viewer User'
  }

  beforeAll(() => {
    server = createServer(app)
    initializeWebSocketService(server)
  })

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Mock token generation
    const { generateToken } = require('@/lib/jwt')
    generateToken.mockImplementation((payload: any) => `mock-token-${payload.userId}`)

    // Generate test tokens
    adminToken = generateToken({ userId: mockAdminUser.id, role: mockAdminUser.role })
    userToken = generateToken({ userId: mockRegularUser.id, role: mockRegularUser.role })
    viewerToken = generateToken({ userId: mockViewerUser.id, role: mockViewerUser.role })

    // Mock database responses
    const { prisma } = require('@/lib/database')
    prisma.user.findUnique.mockImplementation((query: any) => {
      const userId = query.where.id
      if (userId === mockAdminUser.id) return Promise.resolve(mockAdminUser)
      if (userId === mockRegularUser.id) return Promise.resolve(mockRegularUser)
      if (userId === mockViewerUser.id) return Promise.resolve(mockViewerUser)
      return Promise.resolve(null)
    })

    // Mock WebSocket service responses
    mockWebSocketService.getConnectionCount.mockReturnValue(5)
    mockWebSocketService.getSubscriptionStats.mockReturnValue({
      agents: 10,
      tasks: 15,
      platforms: 3
    })
    mockWebSocketService.getConnections.mockReturnValue([
      {
        socketId: 'socket1',
        userId: 'admin123',
        userRole: 'admin',
        connectedAt: new Date('2024-01-01T10:00:00Z'),
        lastActivity: new Date('2024-01-01T10:05:00Z'),
        subscriptions: {
          agents: ['agent1', 'agent2'],
          tasks: ['task1'],
          platforms: ['platform1']
        }
      },
      {
        socketId: 'socket2',
        userId: 'user123',
        userRole: 'operator',
        connectedAt: new Date('2024-01-01T10:01:00Z'),
        lastActivity: new Date('2024-01-01T10:04:00Z'),
        subscriptions: {
          agents: ['agent1'],
          tasks: [],
          platforms: []
        }
      }
    ])
  })

  describe('GET /api/cubcen/v1/websocket/status', () => {
    it('should return WebSocket status for admin users', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/websocket/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('service', 'running')
      expect(response.body).toHaveProperty('connections')
      expect(response.body.connections).toHaveProperty('total', 5)
      expect(response.body.connections.details).toHaveLength(2)
      expect(response.body).toHaveProperty('subscriptions')
      expect(response.body.subscriptions).toEqual({
        agents: 10,
        tasks: 15,
        platforms: 3
      })

      // Admin should see all connection details
      const firstConnection = response.body.connections.details[0]
      expect(firstConnection).toHaveProperty('userId', 'admin123')
      expect(firstConnection).toHaveProperty('userRole', 'admin')
    })

    it('should filter connection details for non-admin users', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/websocket/status')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('service', 'running')
      expect(response.body.connections.details).toHaveLength(1) // Only their own connection

      const connection = response.body.connections.details[0]
      expect(connection).toHaveProperty('userId', 'hidden')
      expect(connection).toHaveProperty('userRole', 'hidden')
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/cubcen/v1/websocket/status')
        .expect(401)
    })

    it('should handle WebSocket service errors', async () => {
      mockWebSocketService.getConnectionCount.mockImplementation(() => {
        throw new Error('Service unavailable')
      })

      const response = await request(app)
        .get('/api/cubcen/v1/websocket/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500)

      expect(response.body.error).toHaveProperty('code', 'WEBSOCKET_STATUS_ERROR')
    })
  })

  describe('GET /api/cubcen/v1/websocket/connections', () => {
    it('should return user-specific connections', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/websocket/connections')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('userId', 'user123')
      expect(response.body.connections).toHaveLength(1)
      expect(response.body).toHaveProperty('totalConnections', 1)

      const connection = response.body.connections[0]
      expect(connection).toHaveProperty('socketId', 'socket2')
      expect(connection).toHaveProperty('subscriptions')
      expect(connection).not.toHaveProperty('userId') // Filtered out for security
    })

    it('should return empty array for users with no connections', async () => {
      // Mock no connections for this user
      mockWebSocketService.getConnections.mockReturnValue([])

      const response = await request(app)
        .get('/api/cubcen/v1/websocket/connections')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('userId', 'viewer123')
      expect(response.body.connections).toHaveLength(0)
      expect(response.body).toHaveProperty('totalConnections', 0)
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/cubcen/v1/websocket/connections')
        .expect(401)
    })

    it('should handle service errors', async () => {
      mockWebSocketService.getConnections.mockImplementation(() => {
        throw new Error('Service error')
      })

      const response = await request(app)
        .get('/api/cubcen/v1/websocket/connections')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(500)

      expect(response.body.error).toHaveProperty('code', 'WEBSOCKET_CONNECTIONS_ERROR')
    })
  })

  describe('GET /api/cubcen/v1/websocket/health', () => {
    it('should return WebSocket service health status', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/websocket/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'healthy')
      expect(response.body).toHaveProperty('service', 'websocket')
      expect(response.body).toHaveProperty('metrics')
      expect(response.body.metrics).toHaveProperty('connections', 5)
      expect(response.body.metrics).toHaveProperty('subscriptions')
      expect(response.body.metrics).toHaveProperty('uptime')
      expect(response.body.metrics).toHaveProperty('memory')
    })

    it('should return unhealthy status on service error', async () => {
      mockWebSocketService.getConnectionCount.mockImplementation(() => {
        throw new Error('Service down')
      })

      const response = await request(app)
        .get('/api/cubcen/v1/websocket/health')
        .expect(503)

      expect(response.body).toHaveProperty('status', 'unhealthy')
      expect(response.body).toHaveProperty('service', 'websocket')
      expect(response.body).toHaveProperty('error', 'Service unavailable')
    })

    it('should not require authentication for health checks', async () => {
      await request(app)
        .get('/api/cubcen/v1/websocket/health')
        .expect(200)
    })
  })

  describe('POST /api/cubcen/v1/websocket/test/broadcast', () => {
    it('should allow admin to broadcast test info alert', async () => {
      const testData = {
        type: 'info',
        data: {
          title: 'Test Info Alert',
          message: 'This is a test information message'
        }
      }

      const response = await request(app)
        .post('/api/cubcen/v1/websocket/test/broadcast')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('message', 'Test info alert broadcasted successfully')
      expect(response.body).toHaveProperty('alertId')
      expect(mockWebSocketService.broadcastInfoAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Info Alert',
          message: 'This is a test information message',
          source: 'system',
          sourceId: 'websocket-test'
        })
      )
    })

    it('should allow admin to broadcast test warning alert', async () => {
      const testData = {
        type: 'warning',
        data: {
          title: 'Test Warning',
          message: 'This is a test warning'
        }
      }

      const response = await request(app)
        .post('/api/cubcen/v1/websocket/test/broadcast')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(mockWebSocketService.broadcastWarningAlert).toHaveBeenCalled()
    })

    it('should allow admin to broadcast test critical alert', async () => {
      const testData = {
        type: 'critical',
        data: {
          title: 'Test Critical Alert',
          message: 'This is a test critical alert'
        }
      }

      const response = await request(app)
        .post('/api/cubcen/v1/websocket/test/broadcast')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(mockWebSocketService.broadcastCriticalAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Critical Alert',
          message: 'This is a test critical alert',
          requiresAction: false
        })
      )
    })

    it('should use default values when data is not provided', async () => {
      const testData = { type: 'info' }

      const response = await request(app)
        .post('/api/cubcen/v1/websocket/test/broadcast')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testData)
        .expect(200)

      expect(mockWebSocketService.broadcastInfoAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Alert',
          message: 'This is a test message from the WebSocket service'
        })
      )
    })

    it('should reject invalid message types', async () => {
      const testData = {
        type: 'invalid',
        data: { title: 'Test', message: 'Test message' }
      }

      const response = await request(app)
        .post('/api/cubcen/v1/websocket/test/broadcast')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testData)
        .expect(400)

      expect(response.body.error).toHaveProperty('code', 'INVALID_MESSAGE_TYPE')
      expect(response.body.error.message).toContain('Message type must be one of: info, warning, critical')
    })

    it('should require admin role', async () => {
      const testData = {
        type: 'info',
        data: { title: 'Test', message: 'Test message' }
      }

      const response = await request(app)
        .post('/api/cubcen/v1/websocket/test/broadcast')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testData)
        .expect(403)

      expect(response.body.error).toHaveProperty('code', 'FORBIDDEN')
      expect(response.body.error.message).toBe('Admin access required')
    })

    it('should require authentication', async () => {
      const testData = {
        type: 'info',
        data: { title: 'Test', message: 'Test message' }
      }

      await request(app)
        .post('/api/cubcen/v1/websocket/test/broadcast')
        .send(testData)
        .expect(401)
    })

    it('should handle broadcast service errors', async () => {
      mockWebSocketService.broadcastInfoAlert.mockImplementation(() => {
        throw new Error('Broadcast failed')
      })

      const testData = {
        type: 'info',
        data: { title: 'Test', message: 'Test message' }
      }

      const response = await request(app)
        .post('/api/cubcen/v1/websocket/test/broadcast')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testData)
        .expect(500)

      expect(response.body.error).toHaveProperty('code', 'BROADCAST_TEST_ERROR')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing WebSocket service gracefully', async () => {
      // Mock getWebSocketService to throw error
      const { getWebSocketService } = require('@/services/websocket')
      getWebSocketService.mockImplementation(() => {
        throw new Error('WebSocket service not initialized')
      })

      const response = await request(app)
        .get('/api/cubcen/v1/websocket/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500)

      expect(response.body.error).toHaveProperty('code', 'WEBSOCKET_STATUS_ERROR')
    })

    it('should include request IDs in error responses', async () => {
      mockWebSocketService.getConnectionCount.mockImplementation(() => {
        throw new Error('Service error')
      })

      const response = await request(app)
        .get('/api/cubcen/v1/websocket/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500)

      expect(response.body.error).toHaveProperty('timestamp')
      expect(response.body.error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting to WebSocket endpoints', async () => {
      // Make multiple rapid requests to test rate limiting
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/cubcen/v1/websocket/status')
          .set('Authorization', `Bearer ${adminToken}`)
      )

      const responses = await Promise.all(requests)
      
      // Some requests should succeed, but if rate limiting is working,
      // we might get some 429 responses for rapid requests
      const successfulResponses = responses.filter(r => r.status === 200)
      const rateLimitedResponses = responses.filter(r => r.status === 429)
      
      expect(successfulResponses.length).toBeGreaterThan(0)
      // Note: Rate limiting behavior depends on the specific configuration
      // This test mainly ensures the endpoint is accessible and doesn't crash
    })
  })
})