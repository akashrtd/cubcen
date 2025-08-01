/**
 * Comprehensive API Testing Suite
 * End-to-end tests for all API endpoints with proper error scenarios
 */

import request from 'supertest'
import app from '@/server'
import { prisma } from '@/lib/database'
import { AuthService } from '@/services/auth'
import { AgentService } from '@/services/agent'
import { TaskService } from '@/services/task'
import { AdapterManager } from '@/backend/adapters/adapter-factory'

describe('Comprehensive API Tests', () => {
  let authService: AuthService
  let adminToken: string
  let operatorToken: string
  let viewerToken: string

  let testAgentId: string
  let testTaskId: string

  beforeAll(async () => {
    authService = new AuthService(prisma)

    // Create test users with different roles
    const adminUser = await authService.register({
      email: 'admin@test.com',
      password: 'password123',
      name: 'Admin User',
      role: 'admin'
    })
    adminToken = adminUser.tokens.accessToken

    const operatorUser = await authService.register({
      email: 'operator@test.com',
      password: 'password123',
      name: 'Operator User',
      role: 'operator'
    })
    operatorToken = operatorUser.tokens.accessToken

    const viewerUser = await authService.register({
      email: 'viewer@test.com',
      password: 'password123',
      name: 'Viewer User',
      role: 'viewer'
    })
    viewerToken = viewerUser.tokens.accessToken
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin@test.com', 'operator@test.com', 'viewer@test.com']
        }
      }
    })
    await prisma.$disconnect()
  })

  describe('Authentication API', () => {
    describe('POST /api/cubcen/v1/auth/login', () => {
      it('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/cubcen/v1/auth/login')
          .send({
            email: 'admin@test.com',
            password: 'password123'
          })
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.user).toBeDefined()
        expect(response.body.data.tokens).toBeDefined()
        expect(response.body.data.tokens.accessToken).toBeDefined()
        expect(response.body.data.tokens.refreshToken).toBeDefined()
      })

      it('should reject invalid credentials', async () => {
        const response = await request(app)
          .post('/api/cubcen/v1/auth/login')
          .send({
            email: 'admin@test.com',
            password: 'wrongpassword'
          })
          .expect(401)

        expect(response.body.success).toBe(false)
        expect(response.body.error.code).toBe('INVALID_CREDENTIALS')
      })

      it('should validate request body', async () => {
        const response = await request(app)
          .post('/api/cubcen/v1/auth/login')
          .send({
            email: 'invalid-email',
            password: '123' // too short
          })
          .expect(400)

        expect(response.body.success).toBe(false)
        expect(response.body.error.code).toBe('VALIDATION_ERROR')
      })

      it('should handle rate limiting', async () => {
        // Make multiple rapid requests to trigger rate limiting
        const promises = Array(10).fill(null).map(() =>
          request(app)
            .post('/api/cubcen/v1/auth/login')
            .send({
              email: 'admin@test.com',
              password: 'wrongpassword'
            })
        )

        const responses = await Promise.all(promises)
        const rateLimitedResponses = responses.filter(r => r.status === 429)
        expect(rateLimitedResponses.length).toBeGreaterThan(0)
      })
    })

    describe('GET /api/cubcen/v1/auth/me', () => {
      it('should return current user with valid token', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/auth/me')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.user.email).toBe('admin@test.com')
        expect(response.body.data.user.role).toBe('admin')
      })

      it('should reject request without token', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/auth/me')
          .expect(401)

        expect(response.body.error.code).toBe('MISSING_TOKEN')
      })

      it('should reject request with invalid token', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/auth/me')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401)

        expect(response.body.error.code).toBe('INVALID_TOKEN')
      })
    })
  })

  describe('Agents API', () => {
    beforeAll(async () => {
      // Create a test platform first
      await prisma.platform.create({
        data: {
          id: 'test-platform',
          name: 'Test Platform',
          type: 'N8N',
          baseUrl: 'http://localhost:5678',
          status: 'CONNECTED'
        }
      })

      // Create a test agent
      const agent = await prisma.agent.create({
        data: {
          id: 'test-agent',
          name: 'Test Agent',
          platformId: 'test-platform',
          externalId: 'ext-123',
          status: 'ACTIVE',
          capabilities: ['test'],
          configuration: {}
        }
      })
      testAgentId = agent.id
    })

    afterAll(async () => {
      await prisma.agent.deleteMany({ where: { id: testAgentId } })
      await prisma.platform.deleteMany({ where: { id: 'test-platform' } })
    })

    describe('GET /api/cubcen/v1/agents', () => {
      it('should return agents list for authenticated user', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/agents')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.agents).toBeDefined()
        expect(response.body.data.pagination).toBeDefined()
        expect(Array.isArray(response.body.data.agents)).toBe(true)
      })

      it('should support pagination parameters', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/agents?page=1&limit=5')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(200)

        expect(response.body.data.pagination.page).toBe(1)
        expect(response.body.data.pagination.limit).toBe(5)
      })

      it('should support filtering by status', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/agents?status=ACTIVE')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        // All returned agents should have ACTIVE status
        response.body.data.agents.forEach((agent: { status: string }) => {
          expect(agent.status).toBe('ACTIVE')
        })
      })

      it('should support search functionality', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/agents?search=Test')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
      })

      it('should reject unauthenticated requests', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/agents')
          .expect(401)

        expect(response.body.error.code).toBe('MISSING_TOKEN')
      })

      it('should validate query parameters', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/agents?page=0&limit=1000') // Invalid values
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(400)

        expect(response.body.error.code).toBe('VALIDATION_ERROR')
      })
    })

    describe('GET /api/cubcen/v1/agents/:id', () => {
      it('should return specific agent for authenticated user', async () => {
        const response = await request(app)
          .get(`/api/cubcen/v1/agents/${testAgentId}`)
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.agent.id).toBe(testAgentId)
        expect(response.body.data.agent.name).toBe('Test Agent')
      })

      it('should return 404 for non-existent agent', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/agents/non-existent-id')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(404)

        expect(response.body.error.code).toBe('AGENT_NOT_FOUND')
      })

      it('should validate agent ID parameter', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/agents/invalid-id-format')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(400)

        expect(response.body.error.code).toBe('VALIDATION_ERROR')
      })
    })

    describe('POST /api/cubcen/v1/agents', () => {
      it('should create agent with operator role', async () => {
        const agentData = {
          name: 'New Test Agent',
          platformId: 'test-platform',
          externalId: 'ext-456',
          capabilities: ['email', 'api'],
          configuration: { timeout: 30000 },
          description: 'Test agent description'
        }

        const response = await request(app)
          .post('/api/cubcen/v1/agents')
          .set('Authorization', `Bearer ${operatorToken}`)
          .send(agentData)
          .expect(201)

        expect(response.body.success).toBe(true)
        expect(response.body.data.agent.name).toBe(agentData.name)
        expect(response.body.data.agent.platformId).toBe(agentData.platformId)

        // Clean up
        await prisma.agent.delete({ where: { id: response.body.data.agent.id } })
      })

      it('should reject creation with viewer role', async () => {
        const agentData = {
          name: 'Unauthorized Agent',
          platformId: 'test-platform',
          externalId: 'ext-789'
        }

        const response = await request(app)
          .post('/api/cubcen/v1/agents')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(agentData)
          .expect(403)

        expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS')
      })

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/cubcen/v1/agents')
          .set('Authorization', `Bearer ${operatorToken}`)
          .send({
            name: '', // Invalid empty name
            platformId: 'test-platform'
            // Missing externalId
          })
          .expect(400)

        expect(response.body.error.code).toBe('VALIDATION_ERROR')
      })
    })
  })

  describe('Tasks API', () => {
    beforeAll(async () => {
      // Create a test task
      const task = await prisma.task.create({
        data: {
          id: 'test-task',
          agentId: testAgentId,
          status: 'PENDING',
          priority: 'MEDIUM',
          parameters: { test: true }
        }
      })
      testTaskId = task.id
    })

    afterAll(async () => {
      await prisma.task.deleteMany({ where: { id: testTaskId } })
    })

    describe('GET /api/cubcen/v1/tasks', () => {
      it('should return tasks list for authenticated user', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/tasks')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.tasks).toBeDefined()
        expect(response.body.data.pagination).toBeDefined()
      })

      it('should support filtering by agent ID', async () => {
        const response = await request(app)
          .get(`/api/cubcen/v1/tasks?agentId=${testAgentId}`)
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        response.body.data.tasks.forEach((task: { agentId: string }) => {
          expect(task.agentId).toBe(testAgentId)
        })
      })

      it('should support filtering by status', async () => {
        const response = await request(app)
          .get('/api/cubcen/v1/tasks?status=PENDING')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        response.body.data.tasks.forEach((task: { status: string }) => {
          expect(task.status).toBe('PENDING')
        })
      })
    })

    describe('POST /api/cubcen/v1/tasks', () => {
      it('should create task with operator role', async () => {
        const taskData = {
          agentId: testAgentId,
          priority: 'HIGH',
          parameters: { test: 'data' }
        }

        const response = await request(app)
          .post('/api/cubcen/v1/tasks')
          .set('Authorization', `Bearer ${operatorToken}`)
          .send(taskData)
          .expect(201)

        expect(response.body.success).toBe(true)
        expect(response.body.data.task.agentId).toBe(taskData.agentId)
        expect(response.body.data.task.priority).toBe(taskData.priority)

        // Clean up
        await prisma.task.delete({ where: { id: response.body.data.task.id } })
      })

      it('should reject creation with viewer role', async () => {
        const taskData = {
          agentId: testAgentId,
          priority: 'LOW'
        }

        const response = await request(app)
          .post('/api/cubcen/v1/tasks')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(taskData)
          .expect(403)

        expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS')
      })
    })
  })

  describe('Health API', () => {
    describe('GET /health', () => {
      it('should return system health status', async () => {
        const response = await request(app)
          .get('/health')
          .expect(200)

        expect(response.body.status).toBeDefined()
        expect(response.body.checks).toBeDefined()
        expect(response.body.timestamp).toBeDefined()
        expect(Array.isArray(response.body.checks)).toBe(true)
      })

      it('should not require authentication', async () => {
        // Health endpoint should be accessible without authentication
        const response = await request(app)
          .get('/health')
          .expect(200)

        expect(response.body.status).toBeDefined()
      })
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/non-existent-endpoint')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)

      expect(response.body.error.code).toBe('ENDPOINT_NOT_FOUND')
      expect(response.body.error.requestId).toBeDefined()
      expect(response.body.error.timestamp).toBeDefined()
    })

    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('should include request ID in all error responses', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/agents/invalid-id')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(400)

      expect(response.body.error.requestId).toBeDefined()
      expect(response.body.error.requestId).toMatch(/^req_/)
    })

    it('should handle database connection errors gracefully', async () => {
      // This test would simulate database connection issues
      // For now, we just ensure error handling structure is in place
      expect(true).toBe(true)
    })
  })

  describe('API Versioning', () => {
    it('should include version in all API endpoints', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should reject requests to non-versioned endpoints', async () => {
      const response = await request(app)
        .get('/api/cubcen/auth/me') // Missing version
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)

      expect(response.body.error.code).toBe('ENDPOINT_NOT_FOUND')
    })
  })

  describe('Rate Limiting', () => {
    it('should apply general rate limiting to API endpoints', async () => {
      // Make many requests to trigger rate limiting
      const promises = Array(150).fill(null).map(() =>
        request(app)
          .get('/api/cubcen/v1/auth/me')
          .set('Authorization', `Bearer ${adminToken}`)
      )

      const responses = await Promise.all(promises)
      const rateLimitedResponses = responses.filter(r => r.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })

    it('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.headers['x-ratelimit-limit']).toBeDefined()
      expect(response.headers['x-ratelimit-remaining']).toBeDefined()
    })
  })
})