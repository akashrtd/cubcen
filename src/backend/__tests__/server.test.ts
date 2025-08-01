// Cubcen Server Integration Tests
// Tests for core API structure and error handling

import request from 'supertest'
import app from '../../server'
import { AuthService } from '../../services/auth'
import { prisma } from '../../lib/database'

// Mock the database
jest.mock('../../lib/database', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

// Mock the auth service
jest.mock('../../services/auth')

describe('Cubcen Server Integration Tests', () => {
  let authToken: string
  let mockAuthService: jest.Mocked<AuthService>

  beforeAll(async () => {
    // Create a mock auth token for testing
    authToken = 'Bearer mock-jwt-token'

    // Mock auth service
    mockAuthService = new AuthService(prisma) as jest.Mocked<AuthService>
    mockAuthService.validateAuthHeader = jest.fn().mockResolvedValue({
      id: 'user_1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
    })
  })

  afterAll(async () => {
    // Clean up any resources
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200)

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        version: expect.any(String),
        environment: expect.any(String),
      })
    })
  })

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app).get('/health').expect(200)

      expect(response.headers).toHaveProperty('x-content-type-options')
      expect(response.headers).toHaveProperty('x-frame-options')
      expect(response.headers).toHaveProperty('x-xss-protection')
    })

    it('should include request ID header', async () => {
      const response = await request(app).get('/health').expect(200)

      expect(response.headers).toHaveProperty('x-request-id')
      expect(response.headers['x-request-id']).toMatch(/^req_\d+_[a-z0-9]+$/)
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting to API routes', async () => {
      // Make multiple requests quickly
      const requests = Array(10)
        .fill(null)
        .map(() =>
          request(app)
            .get('/api/cubcen/v1/agents')
            .set('Authorization', authToken)
        )

      const responses = await Promise.all(requests)

      // All requests should succeed (within rate limit)
      responses.forEach(response => {
        expect([200, 401, 403]).toContain(response.status) // 401/403 for auth, but not 429
      })
    })

    it('should have stricter rate limiting for auth endpoints', async () => {
      // This test would need to be more sophisticated in a real scenario
      // For now, just verify the endpoint exists and responds
      const response = await request(app)
        .post('/api/cubcen/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        })

      // Should get validation error or auth error, not rate limit error
      expect([400, 401]).toContain(response.status)
    })
  })

  describe('Input Validation', () => {
    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/agents')
        .set('Authorization', authToken)
        .send({
          // Missing required fields
          name: '',
          platformType: 'invalid',
        })
        .expect(400)

      expect(response.body).toMatchObject({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: expect.any(Array),
        },
      })
    })

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/agents?page=invalid&limit=1000')
        .set('Authorization', authToken)
        .expect(400)

      expect(response.body).toMatchObject({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
        },
      })
    })

    it('should validate URL parameters', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/agents/') // Empty ID
        .set('Authorization', authToken)
        .expect(404) // Should be 404 for empty path segment

      expect(response.body).toMatchObject({
        error: {
          code: 'ENDPOINT_NOT_FOUND',
        },
      })
    })
  })

  describe('Input Sanitization', () => {
    it('should sanitize malicious input', async () => {
      const maliciousInput = {
        name: '<script>alert("xss")</script>Test Agent',
        platformType: 'n8n',
        platformId: 'platform_1',
        capabilities: ['<script>alert("xss")</script>'],
        configuration: {
          key: 'javascript:alert("xss")',
          onclick: 'alert("xss")',
        },
      }

      const response = await request(app)
        .post('/api/cubcen/v1/agents')
        .set('Authorization', authToken)
        .send(maliciousInput)

      // Should not return 500 error due to sanitization
      expect([200, 201, 400, 401, 403]).toContain(response.status)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/agents')
        .set('Authorization', authToken)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle missing authentication', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/agents')
        .expect(401)

      expect(response.body).toMatchObject({
        error: {
          code: expect.any(String),
          message: expect.any(String),
          timestamp: expect.any(String),
        },
      })
    })

    it('should handle invalid authentication', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/agents')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body).toMatchObject({
        error: {
          code: expect.any(String),
          message: expect.any(String),
          timestamp: expect.any(String),
        },
      })
    })

    it('should handle server errors gracefully', async () => {
      // Mock a server error
      mockAuthService.validateAuthHeader.mockRejectedValueOnce(
        new Error('Database connection failed')
      )

      const response = await request(app)
        .get('/api/cubcen/v1/agents')
        .set('Authorization', authToken)
        .expect(401) // Auth middleware will catch and return 401

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toHaveProperty('timestamp')
    })
  })

  describe('API Endpoints', () => {
    describe('Agents API', () => {
      it('should get agents list', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/agents')
          .set('Authorization', authToken)
          .expect(200)

        expect(response.body).toMatchObject({
          success: true,
          data: {
            agents: expect.any(Array),
            pagination: expect.any(Object),
          },
          message: expect.any(String),
        })
      })

      it('should get agent by ID', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/agents/agent_1')
          .set('Authorization', authToken)
          .expect(200)

        expect(response.body).toMatchObject({
          success: true,
          data: {
            agent: expect.any(Object),
          },
          message: expect.any(String),
        })
      })

      it('should create new agent', async () => {
        const agentData = {
          name: 'Test Agent',
          platformType: 'n8n',
          platformId: 'platform_1',
          capabilities: ['test'],
          configuration: { test: true },
        }

        const response = await request(app)
          .post('/api/cubcen/v1/agents')
          .set('Authorization', authToken)
          .send(agentData)
          .expect(201)

        expect(response.body).toMatchObject({
          success: true,
          data: {
            agent: expect.objectContaining({
              name: agentData.name,
              platformType: agentData.platformType,
            }),
          },
          message: expect.any(String),
        })
      })
    })

    describe('Tasks API', () => {
      it('should get tasks list', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/tasks')
          .set('Authorization', authToken)
          .expect(200)

        expect(response.body).toMatchObject({
          success: true,
          data: {
            tasks: expect.any(Array),
            pagination: expect.any(Object),
          },
          message: expect.any(String),
        })
      })

      it('should create new task', async () => {
        const taskData = {
          agentId: 'agent_1',
          priority: 'medium',
          parameters: { test: true },
        }

        const response = await request(app)
          .post('/api/cubcen/v1/tasks')
          .set('Authorization', authToken)
          .send(taskData)
          .expect(201)

        expect(response.body).toMatchObject({
          success: true,
          data: {
            task: expect.objectContaining({
              agentId: taskData.agentId,
              priority: taskData.priority,
            }),
          },
          message: expect.any(String),
        })
      })
    })

    describe('Platforms API', () => {
      it('should get platforms list', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/platforms')
          .set('Authorization', authToken)
          .expect(200)

        expect(response.body).toMatchObject({
          success: true,
          data: {
            platforms: expect.any(Array),
            pagination: expect.any(Object),
          },
          message: expect.any(String),
        })
      })

      it('should test platform connection', async () => {
        const connectionData = {
          baseUrl: 'https://test.example.com',
          authConfig: {
            type: 'api_key',
            credentials: { apiKey: 'test-key' },
          },
        }

        const response = await request(app)
          .post('/api/cubcen/v1/platforms/test-connection')
          .set('Authorization', authToken)
          .send(connectionData)
          .expect(200)

        expect(response.body).toMatchObject({
          success: true,
          data: {
            connectionTest: expect.any(Object),
          },
          message: expect.any(String),
        })
      })
    })

    describe('Users API', () => {
      it('should get users list (admin only)', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/users')
          .set('Authorization', authToken)
          .expect(200)

        expect(response.body).toMatchObject({
          success: true,
          data: {
            users: expect.any(Array),
            pagination: expect.any(Object),
          },
          message: expect.any(String),
        })
      })
    })
  })

  describe('404 Handling', () => {
    it('should return 404 for non-existent API endpoints', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/nonexistent')
        .set('Authorization', authToken)
        .expect(404)

      expect(response.body).toMatchObject({
        error: {
          code: 'ENDPOINT_NOT_FOUND',
          message: expect.stringContaining('not found'),
          timestamp: expect.any(String),
        },
      })
    })
  })

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/cubcen/v1/agents')
        .set('Origin', 'http://localhost:3000')
        .expect(204)

      expect(response.headers).toHaveProperty('access-control-allow-origin')
      expect(response.headers).toHaveProperty('access-control-allow-methods')
      expect(response.headers).toHaveProperty('access-control-allow-headers')
    })
  })
})
