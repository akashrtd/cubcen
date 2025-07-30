/**
 * Cubcen Agent Routes Integration Tests
 * Tests for agent management API endpoints
 */

import request from 'supertest'
import { Express } from 'express'
import { createTestApp } from '@/backend/__tests__/test-helpers'
import { prisma } from '@/lib/database'
import { resetDatabase } from '@/lib/database-utils'
import { generateJWT } from '@/lib/jwt'

describe('Agent Routes', () => {
  let app: Express
  let testUserId: string
  let testPlatformId: string
  let authToken: string
  let operatorToken: string
  let adminToken: string

  beforeAll(async () => {
    app = await createTestApp()
    await resetDatabase()

    // Create test users with different roles
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@cubcen.com',
        password: 'admin123',
        role: 'ADMIN',
        name: 'Admin User'
      }
    })

    const operatorUser = await prisma.user.create({
      data: {
        email: 'operator@cubcen.com',
        password: 'operator123',
        role: 'OPERATOR',
        name: 'Operator User'
      }
    })

    const viewerUser = await prisma.user.create({
      data: {
        email: 'viewer@cubcen.com',
        password: 'viewer123',
        role: 'VIEWER',
        name: 'Viewer User'
      }
    })

    testUserId = viewerUser.id

    // Generate auth tokens
    authToken = generateJWT({ userId: viewerUser.id, role: 'VIEWER' })
    operatorToken = generateJWT({ userId: operatorUser.id, role: 'OPERATOR' })
    adminToken = generateJWT({ userId: adminUser.id, role: 'ADMIN' })

    // Create test platform
    const testPlatform = await prisma.platform.create({
      data: {
        name: 'Test Platform',
        type: 'N8N',
        baseUrl: 'http://localhost:5678',
        status: 'CONNECTED',
        authConfig: JSON.stringify({ apiKey: 'test-key' })
      }
    })
    testPlatformId = testPlatform.id
  })

  beforeEach(async () => {
    // Clean up agents before each test
    await prisma.agentHealth.deleteMany()
    await prisma.agent.deleteMany()
  })

  afterAll(async () => {
    await resetDatabase()
  })

  describe('GET /api/cubcen/v1/agents', () => {
    beforeEach(async () => {
      // Create test agents
      await prisma.agent.createMany({
        data: [
          {
            name: 'Test Agent 1',
            platformId: testPlatformId,
            externalId: 'test-agent-001',
            status: 'ACTIVE',
            capabilities: JSON.stringify(['email', 'automation']),
            configuration: JSON.stringify({ emailProvider: 'smtp' }),
            healthStatus: JSON.stringify({ status: 'healthy' })
          },
          {
            name: 'Test Agent 2',
            platformId: testPlatformId,
            externalId: 'test-agent-002',
            status: 'INACTIVE',
            capabilities: JSON.stringify(['webhook']),
            configuration: JSON.stringify({ webhookUrl: 'https://example.com' }),
            healthStatus: JSON.stringify({ status: 'unknown' })
          }
        ]
      })
    })

    it('should get all agents successfully', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.agents).toHaveLength(2)
      expect(response.body.data.pagination).toBeDefined()
      expect(response.body.data.pagination.total).toBe(2)
    })

    it('should filter agents by status', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/agents?status=ACTIVE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data.agents).toHaveLength(1)
      expect(response.body.data.agents[0].status).toBe('ACTIVE')
    })

    it('should search agents by name', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/agents?search=Agent 1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data.agents).toHaveLength(1)
      expect(response.body.data.agents[0].name).toContain('Agent 1')
    })

    it('should paginate agents', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/agents?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data.agents).toHaveLength(1)
      expect(response.body.data.pagination.page).toBe(1)
      expect(response.body.data.pagination.limit).toBe(1)
      expect(response.body.data.pagination.totalPages).toBe(2)
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/cubcen/v1/agents')
        .expect(401)
    })

    it('should handle invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/agents?status=INVALID_STATUS')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/cubcen/v1/agents/:id', () => {
    let testAgentId: string

    beforeEach(async () => {
      const agent = await prisma.agent.create({
        data: {
          name: 'Test Agent',
          platformId: testPlatformId,
          externalId: 'test-agent-001',
          status: 'ACTIVE',
          capabilities: JSON.stringify(['test']),
          configuration: JSON.stringify({ testMode: true }),
          healthStatus: JSON.stringify({ status: 'healthy' })
        }
      })
      testAgentId = agent.id
    })

    it('should get agent by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/cubcen/v1/agents/${testAgentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.agent.id).toBe(testAgentId)
      expect(response.body.data.agent.name).toBe('Test Agent')
      expect(response.body.data.agent.healthStatus).toBeDefined()
      expect(response.body.data.agent.platform).toBeDefined()
    })

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/agents/invalid-agent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('AGENT_NOT_FOUND')
    })

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/cubcen/v1/agents/${testAgentId}`)
        .expect(401)
    })
  })

  describe('POST /api/cubcen/v1/agents', () => {
    const validAgentData = {
      name: 'New Test Agent',
      platformId: '',
      externalId: 'new-test-agent-001',
      capabilities: ['test', 'automation'],
      configuration: { testMode: true },
      description: 'A new test agent'
    }

    beforeEach(() => {
      validAgentData.platformId = testPlatformId
    })

    it('should create agent successfully with operator role', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(validAgentData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.agent.name).toBe(validAgentData.name)
      expect(response.body.data.agent.externalId).toBe(validAgentData.externalId)
      expect(response.body.data.agent.status).toBe('INACTIVE')
    })

    it('should create agent successfully with admin role', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validAgentData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.agent.name).toBe(validAgentData.name)
    })

    it('should reject creation with viewer role', async () => {
      await request(app)
        .post('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validAgentData)
        .expect(403)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        platformId: testPlatformId,
        externalId: 'test-agent-001'
      }

      const response = await request(app)
        .post('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should handle duplicate external ID', async () => {
      // Create first agent
      await request(app)
        .post('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(validAgentData)
        .expect(201)

      // Try to create duplicate
      const response = await request(app)
        .post('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(validAgentData)
        .expect(409)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('AGENT_ALREADY_EXISTS')
    })

    it('should handle invalid platform ID', async () => {
      const invalidData = {
        ...validAgentData,
        platformId: 'invalid-platform-id'
      }

      const response = await request(app)
        .post('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(invalidData)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('PLATFORM_NOT_FOUND')
    })

    it('should require authentication', async () => {
      await request(app)
        .post('/api/cubcen/v1/agents')
        .send(validAgentData)
        .expect(401)
    })
  })

  describe('PUT /api/cubcen/v1/agents/:id', () => {
    let testAgentId: string

    beforeEach(async () => {
      const agent = await prisma.agent.create({
        data: {
          name: 'Test Agent',
          platformId: testPlatformId,
          externalId: 'test-agent-001',
          status: 'INACTIVE',
          capabilities: JSON.stringify(['test']),
          configuration: JSON.stringify({ testMode: true }),
          healthStatus: JSON.stringify({ status: 'unknown' })
        }
      })
      testAgentId = agent.id
    })

    it('should update agent successfully with operator role', async () => {
      const updateData = {
        name: 'Updated Test Agent',
        capabilities: ['test', 'automation', 'updated'],
        configuration: { testMode: false, newFeature: true },
        description: 'Updated description',
        status: 'ACTIVE'
      }

      const response = await request(app)
        .put(`/api/cubcen/v1/agents/${testAgentId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.agent.name).toBe(updateData.name)
      expect(response.body.data.agent.status).toBe(updateData.status)
    })

    it('should update agent successfully with admin role', async () => {
      const updateData = {
        name: 'Updated by Admin'
      }

      const response = await request(app)
        .put(`/api/cubcen/v1/agents/${testAgentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.agent.name).toBe(updateData.name)
    })

    it('should reject update with viewer role', async () => {
      const updateData = {
        name: 'Should not update'
      }

      await request(app)
        .put(`/api/cubcen/v1/agents/${testAgentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403)
    })

    it('should return 404 for non-existent agent', async () => {
      const updateData = {
        name: 'Updated Name'
      }

      const response = await request(app)
        .put('/api/cubcen/v1/agents/invalid-agent-id')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(updateData)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('AGENT_NOT_FOUND')
    })

    it('should validate update data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        status: 'INVALID_STATUS'
      }

      const response = await request(app)
        .put(`/api/cubcen/v1/agents/${testAgentId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/cubcen/v1/agents/${testAgentId}`)
        .send({ name: 'Updated' })
        .expect(401)
    })
  })

  describe('DELETE /api/cubcen/v1/agents/:id', () => {
    let testAgentId: string

    beforeEach(async () => {
      const agent = await prisma.agent.create({
        data: {
          name: 'Test Agent',
          platformId: testPlatformId,
          externalId: 'test-agent-001',
          status: 'INACTIVE',
          capabilities: JSON.stringify(['test']),
          configuration: JSON.stringify({ testMode: true }),
          healthStatus: JSON.stringify({ status: 'unknown' })
        }
      })
      testAgentId = agent.id
    })

    it('should delete agent successfully with admin role', async () => {
      const response = await request(app)
        .delete(`/api/cubcen/v1/agents/${testAgentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)

      // Verify agent was deleted
      const agent = await prisma.agent.findUnique({
        where: { id: testAgentId }
      })
      expect(agent).toBeNull()
    })

    it('should reject deletion with operator role', async () => {
      await request(app)
        .delete(`/api/cubcen/v1/agents/${testAgentId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(403)
    })

    it('should reject deletion with viewer role', async () => {
      await request(app)
        .delete(`/api/cubcen/v1/agents/${testAgentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403)
    })

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .delete('/api/cubcen/v1/agents/invalid-agent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('AGENT_NOT_FOUND')
    })

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/cubcen/v1/agents/${testAgentId}`)
        .expect(401)
    })
  })

  describe('GET /api/cubcen/v1/agents/:id/health', () => {
    let testAgentId: string

    beforeEach(async () => {
      const agent = await prisma.agent.create({
        data: {
          name: 'Test Agent',
          platformId: testPlatformId,
          externalId: 'test-agent-001',
          status: 'ACTIVE',
          capabilities: JSON.stringify(['test']),
          configuration: JSON.stringify({ testMode: true }),
          healthStatus: JSON.stringify({ status: 'healthy' })
        }
      })
      testAgentId = agent.id

      // Create health record
      await prisma.agentHealth.create({
        data: {
          agentId: testAgentId,
          status: JSON.stringify({
            status: 'healthy',
            lastCheck: new Date(),
            responseTime: 150
          }),
          responseTime: 150,
          lastCheckAt: new Date()
        }
      })
    })

    it('should get agent health successfully', async () => {
      const response = await request(app)
        .get(`/api/cubcen/v1/agents/${testAgentId}/health`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.health).toBeDefined()
      expect(response.body.data.health.status).toBe('healthy')
    })

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/cubcen/v1/agents/${testAgentId}/health`)
        .expect(401)
    })
  })

  describe('POST /api/cubcen/v1/agents/:id/health-check', () => {
    let testAgentId: string

    beforeEach(async () => {
      const agent = await prisma.agent.create({
        data: {
          name: 'Test Agent',
          platformId: testPlatformId,
          externalId: 'test-agent-001',
          status: 'ACTIVE',
          capabilities: JSON.stringify(['test']),
          configuration: JSON.stringify({ testMode: true }),
          healthStatus: JSON.stringify({ status: 'unknown' })
        }
      })
      testAgentId = agent.id
    })

    it('should perform health check with operator role', async () => {
      const response = await request(app)
        .post(`/api/cubcen/v1/agents/${testAgentId}/health-check`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.health).toBeDefined()
    })

    it('should reject health check with viewer role', async () => {
      await request(app)
        .post(`/api/cubcen/v1/agents/${testAgentId}/health-check`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403)
    })

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/agents/invalid-agent-id/health-check')
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('AGENT_NOT_FOUND')
    })

    it('should require authentication', async () => {
      await request(app)
        .post(`/api/cubcen/v1/agents/${testAgentId}/health-check`)
        .expect(401)
    })
  })

  describe('POST /api/cubcen/v1/agents/:id/health-config', () => {
    let testAgentId: string

    beforeEach(async () => {
      const agent = await prisma.agent.create({
        data: {
          name: 'Test Agent',
          platformId: testPlatformId,
          externalId: 'test-agent-001',
          status: 'ACTIVE',
          capabilities: JSON.stringify(['test']),
          configuration: JSON.stringify({ testMode: true }),
          healthStatus: JSON.stringify({ status: 'unknown' })
        }
      })
      testAgentId = agent.id
    })

    it('should configure health monitoring with operator role', async () => {
      const config = {
        interval: 60000,
        timeout: 15000,
        retries: 3,
        enabled: true
      }

      const response = await request(app)
        .post(`/api/cubcen/v1/agents/${testAgentId}/health-config`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(config)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should validate health configuration', async () => {
      const invalidConfig = {
        interval: 500, // Too low
        timeout: 70000, // Too high
        retries: 10,    // Too high
        enabled: true
      }

      const response = await request(app)
        .post(`/api/cubcen/v1/agents/${testAgentId}/health-config`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(invalidConfig)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should reject configuration with viewer role', async () => {
      const config = {
        interval: 60000,
        enabled: true
      }

      await request(app)
        .post(`/api/cubcen/v1/agents/${testAgentId}/health-config`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(config)
        .expect(403)
    })

    it('should require authentication', async () => {
      await request(app)
        .post(`/api/cubcen/v1/agents/${testAgentId}/health-config`)
        .send({ enabled: true })
        .expect(401)
    })
  })

  describe('POST /api/cubcen/v1/agents/discover', () => {
    it('should discover agents with operator role', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/agents/discover')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ platformId: testPlatformId })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.discovery).toBeDefined()
    })

    it('should discover agents from all platforms when no platformId provided', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/agents/discover')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({})
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.discovery).toBeDefined()
    })

    it('should reject discovery with viewer role', async () => {
      await request(app)
        .post('/api/cubcen/v1/agents/discover')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(403)
    })

    it('should require authentication', async () => {
      await request(app)
        .post('/api/cubcen/v1/agents/discover')
        .send({})
        .expect(401)
    })
  })

  describe('GET /api/cubcen/v1/agents/health-monitoring/status', () => {
    it('should get health monitoring status', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/agents/health-monitoring/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.status).toBeDefined()
      expect(Array.isArray(response.body.data.status)).toBe(true)
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/cubcen/v1/agents/health-monitoring/status')
        .expect(401)
    })
  })
})