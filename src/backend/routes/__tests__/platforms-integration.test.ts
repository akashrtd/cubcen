import request from 'supertest'
import express from 'express'
import { PrismaClient } from '@prisma/client'
import { platformsRouter } from '../platforms'
import { authMiddleware } from '../../middleware/auth'

// Mock Prisma
jest.mock('@prisma/client')
const mockPrisma = {
  platform: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  agent: {
    count: jest.fn(),
  },
} as any

// Mock auth middleware
jest.mock('../../middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 'user-1', role: 'ADMIN' }
    next()
  },
}))

const app = express()
app.use(express.json())
app.use('/api/cubcen/v1/platforms', authMiddleware, platformsRouter)

describe('Platforms API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/cubcen/v1/platforms', () => {
    it('should return list of platforms', async () => {
      const mockPlatforms = [
        {
          id: 'platform-1',
          name: 'n8n Instance',
          type: 'N8N',
          baseUrl: 'https://n8n.example.com',
          status: 'CONNECTED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'platform-2',
          name: 'Make Scenario',
          type: 'MAKE',
          baseUrl: 'https://make.example.com',
          status: 'CONNECTED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.platform.findMany.mockResolvedValue(mockPlatforms)
      mockPrisma.agent.count.mockResolvedValue(5)

      const response = await request(app)
        .get('/api/cubcen/v1/platforms')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.data[0].name).toBe('n8n Instance')
      expect(response.body.data[1].name).toBe('Make Scenario')
    })

    it('should handle database errors', async () => {
      mockPrisma.platform.findMany.mockRejectedValue(
        new Error('Database error')
      )

      const response = await request(app)
        .get('/api/cubcen/v1/platforms')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Failed to fetch platforms')
    })

    it('should filter platforms by type', async () => {
      const mockPlatforms = [
        {
          id: 'platform-1',
          name: 'n8n Instance',
          type: 'N8N',
          baseUrl: 'https://n8n.example.com',
          status: 'CONNECTED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.platform.findMany.mockResolvedValue(mockPlatforms)
      mockPrisma.agent.count.mockResolvedValue(3)

      const response = await request(app)
        .get('/api/cubcen/v1/platforms?type=N8N')
        .expect(200)

      expect(mockPrisma.platform.findMany).toHaveBeenCalledWith({
        where: { type: 'N8N' },
        include: { _count: { select: { agents: true } } },
      })
    })
  })

  describe('POST /api/cubcen/v1/platforms', () => {
    it('should create a new platform', async () => {
      const newPlatform = {
        name: 'New Platform',
        type: 'N8N',
        baseUrl: 'https://new.example.com',
        authConfig: {
          type: 'api_key',
          credentials: { apiKey: 'test-key' },
        },
      }

      const createdPlatform = {
        id: 'platform-3',
        ...newPlatform,
        status: 'DISCONNECTED',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.platform.create.mockResolvedValue(createdPlatform)

      const response = await request(app)
        .post('/api/cubcen/v1/platforms')
        .send(newPlatform)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('New Platform')
      expect(response.body.data.type).toBe('N8N')
    })

    it('should validate required fields', async () => {
      const invalidPlatform = {
        name: 'Test Platform',
        // Missing type and baseUrl
      }

      const response = await request(app)
        .post('/api/cubcen/v1/platforms')
        .send(invalidPlatform)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('validation')
    })

    it('should handle duplicate platform names', async () => {
      const duplicatePlatform = {
        name: 'Existing Platform',
        type: 'N8N',
        baseUrl: 'https://existing.example.com',
      }

      mockPrisma.platform.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['name'] },
      })

      const response = await request(app)
        .post('/api/cubcen/v1/platforms')
        .send(duplicatePlatform)
        .expect(409)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('already exists')
    })
  })

  describe('PUT /api/cubcen/v1/platforms/:id', () => {
    it('should update an existing platform', async () => {
      const platformId = 'platform-1'
      const updateData = {
        name: 'Updated Platform',
        baseUrl: 'https://updated.example.com',
      }

      const updatedPlatform = {
        id: platformId,
        ...updateData,
        type: 'N8N',
        status: 'CONNECTED',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.platform.findUnique.mockResolvedValue({ id: platformId })
      mockPrisma.platform.update.mockResolvedValue(updatedPlatform)

      const response = await request(app)
        .put(`/api/cubcen/v1/platforms/${platformId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('Updated Platform')
    })

    it('should return 404 for non-existent platform', async () => {
      const platformId = 'non-existent'
      mockPrisma.platform.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .put(`/api/cubcen/v1/platforms/${platformId}`)
        .send({ name: 'Updated' })
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Platform not found')
    })
  })

  describe('DELETE /api/cubcen/v1/platforms/:id', () => {
    it('should delete an existing platform', async () => {
      const platformId = 'platform-1'

      mockPrisma.platform.findUnique.mockResolvedValue({ id: platformId })
      mockPrisma.platform.delete.mockResolvedValue({ id: platformId })

      const response = await request(app)
        .delete(`/api/cubcen/v1/platforms/${platformId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Platform deleted successfully')
    })

    it('should return 404 for non-existent platform', async () => {
      const platformId = 'non-existent'
      mockPrisma.platform.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .delete(`/api/cubcen/v1/platforms/${platformId}`)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Platform not found')
    })

    it('should prevent deletion of platform with active agents', async () => {
      const platformId = 'platform-1'

      mockPrisma.platform.findUnique.mockResolvedValue({ id: platformId })
      mockPrisma.agent.count.mockResolvedValue(3)

      const response = await request(app)
        .delete(`/api/cubcen/v1/platforms/${platformId}`)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('active agents')
    })
  })

  describe('POST /api/cubcen/v1/platforms/:id/test-connection', () => {
    it('should test platform connection successfully', async () => {
      const platformId = 'platform-1'
      const mockPlatform = {
        id: platformId,
        type: 'N8N',
        baseUrl: 'https://n8n.example.com',
        authConfig: { type: 'api_key', credentials: { apiKey: 'test-key' } },
      }

      mockPrisma.platform.findUnique.mockResolvedValue(mockPlatform)

      // Mock successful connection test
      jest.doMock('../../adapters/adapter-factory', () => ({
        AdapterFactory: {
          createAdapter: jest.fn().mockReturnValue({
            testConnection: jest.fn().mockResolvedValue({
              success: true,
              responseTime: 150,
              version: '1.0.0',
            }),
          }),
        },
      }))

      const response = await request(app)
        .post(`/api/cubcen/v1/platforms/${platformId}/test-connection`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.connected).toBe(true)
      expect(response.body.data.responseTime).toBe(150)
    })

    it('should handle connection test failure', async () => {
      const platformId = 'platform-1'
      const mockPlatform = {
        id: platformId,
        type: 'N8N',
        baseUrl: 'https://n8n.example.com',
        authConfig: { type: 'api_key', credentials: { apiKey: 'invalid-key' } },
      }

      mockPrisma.platform.findUnique.mockResolvedValue(mockPlatform)

      // Mock failed connection test
      jest.doMock('../../adapters/adapter-factory', () => ({
        AdapterFactory: {
          createAdapter: jest.fn().mockReturnValue({
            testConnection: jest
              .fn()
              .mockRejectedValue(new Error('Connection failed')),
          }),
        },
      }))

      const response = await request(app)
        .post(`/api/cubcen/v1/platforms/${platformId}/test-connection`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.connected).toBe(false)
      expect(response.body.data.error).toBe('Connection failed')
    })
  })

  describe('Authentication and Authorization', () => {
    it('should require authentication', async () => {
      // Create app without auth middleware
      const unauthenticatedApp = express()
      unauthenticatedApp.use(express.json())
      unauthenticatedApp.use('/api/cubcen/v1/platforms', platformsRouter)

      const response = await request(unauthenticatedApp)
        .get('/api/cubcen/v1/platforms')
        .expect(401)

      expect(response.body.error).toContain('authentication')
    })

    it('should require admin role for platform creation', async () => {
      // Mock non-admin user
      jest.doMock('../../middleware/auth', () => ({
        authMiddleware: (req: any, res: any, next: any) => {
          req.user = { id: 'user-1', role: 'VIEWER' }
          next()
        },
      }))

      const newPlatform = {
        name: 'Test Platform',
        type: 'N8N',
        baseUrl: 'https://test.example.com',
      }

      const response = await request(app)
        .post('/api/cubcen/v1/platforms')
        .send(newPlatform)
        .expect(403)

      expect(response.body.error).toContain('permission')
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/platforms')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid JSON')
    })

    it('should handle database connection errors', async () => {
      mockPrisma.platform.findMany.mockRejectedValue(new Error('ECONNREFUSED'))

      const response = await request(app)
        .get('/api/cubcen/v1/platforms')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Failed to fetch platforms')
    })

    it('should validate platform type enum', async () => {
      const invalidPlatform = {
        name: 'Test Platform',
        type: 'INVALID_TYPE',
        baseUrl: 'https://test.example.com',
      }

      const response = await request(app)
        .post('/api/cubcen/v1/platforms')
        .send(invalidPlatform)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid platform type')
    })
  })
})
