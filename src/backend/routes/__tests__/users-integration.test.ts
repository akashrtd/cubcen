import request from 'supertest'
import express from 'express'
import { usersRouter } from '../users'
import { authMiddleware } from '../../middleware/auth'

// Mock Prisma
jest.mock('@prisma/client')
const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
} as any

// Mock auth middleware
jest.mock('../../middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 'admin-1', role: 'ADMIN' }
    next()
  },
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}))

const app = express()
app.use(express.json())
app.use('/api/cubcen/v1/users', authMiddleware, usersRouter)

describe('Users API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/cubcen/v1/users', () => {
    it('should return list of users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'ADMIN',
          isActive: true,
          lastLoginAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'OPERATOR',
          isActive: true,
          lastLoginAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.user.findMany.mockResolvedValue(mockUsers)
      mockPrisma.user.count.mockResolvedValue(2)

      const response = await request(app)
        .get('/api/cubcen/v1/users')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.data[0].name).toBe('John Doe')
      expect(response.body.data[1].name).toBe('Jane Smith')
      expect(response.body.pagination.total).toBe(2)
    })

    it('should support pagination', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
          role: 'OPERATOR',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.user.findMany.mockResolvedValue(mockUsers)
      mockPrisma.user.count.mockResolvedValue(10)

      const response = await request(app)
        .get('/api/cubcen/v1/users?page=2&limit=5')
        .expect(200)

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      })

      expect(response.body.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 10,
        totalPages: 2,
      })
    })

    it('should filter users by role', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.user.findMany.mockResolvedValue(mockUsers)
      mockPrisma.user.count.mockResolvedValue(1)

      const response = await request(app)
        .get('/api/cubcen/v1/users?role=ADMIN')
        .expect(200)

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'ADMIN' },
        skip: 0,
        take: 20,
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should search users by name or email', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'OPERATOR',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.user.findMany.mockResolvedValue(mockUsers)
      mockPrisma.user.count.mockResolvedValue(1)

      const response = await request(app)
        .get('/api/cubcen/v1/users?search=john')
        .expect(200)

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 20,
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('POST /api/cubcen/v1/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        role: 'OPERATOR',
        password: 'password123',
      }

      const createdUser = {
        id: 'user-3',
        ...newUser,
        password: 'hashed-password',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.create.mockResolvedValue(createdUser)

      const response = await request(app)
        .post('/api/cubcen/v1/users')
        .send(newUser)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('New User')
      expect(response.body.data.email).toBe('newuser@example.com')
      expect(response.body.data.password).toBeUndefined() // Password should not be returned
    })

    it('should validate required fields', async () => {
      const invalidUser = {
        name: 'Test User',
        // Missing email, role, and password
      }

      const response = await request(app)
        .post('/api/cubcen/v1/users')
        .send(invalidUser)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('validation')
    })

    it('should validate email format', async () => {
      const invalidUser = {
        name: 'Test User',
        email: 'invalid-email',
        role: 'OPERATOR',
        password: 'password123',
      }

      const response = await request(app)
        .post('/api/cubcen/v1/users')
        .send(invalidUser)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('email')
    })

    it('should handle duplicate email addresses', async () => {
      const duplicateUser = {
        name: 'Duplicate User',
        email: 'existing@example.com',
        role: 'OPERATOR',
        password: 'password123',
      }

      mockPrisma.user.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      })

      const response = await request(app)
        .post('/api/cubcen/v1/users')
        .send(duplicateUser)
        .expect(409)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('already exists')
    })

    it('should validate password strength', async () => {
      const weakPasswordUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'OPERATOR',
        password: '123', // Too weak
      }

      const response = await request(app)
        .post('/api/cubcen/v1/users')
        .send(weakPasswordUser)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('password')
    })
  })

  describe('PUT /api/cubcen/v1/users/:id', () => {
    it('should update an existing user', async () => {
      const userId = 'user-1'
      const updateData = {
        name: 'Updated User',
        role: 'ADMIN',
      }

      const existingUser = {
        id: userId,
        name: 'Original User',
        email: 'user@example.com',
        role: 'OPERATOR',
        isActive: true,
      }

      const updatedUser = {
        ...existingUser,
        ...updateData,
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.user.update.mockResolvedValue(updatedUser)

      const response = await request(app)
        .put(`/api/cubcen/v1/users/${userId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('Updated User')
      expect(response.body.data.role).toBe('ADMIN')
    })

    it('should return 404 for non-existent user', async () => {
      const userId = 'non-existent'
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .put(`/api/cubcen/v1/users/${userId}`)
        .send({ name: 'Updated' })
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('User not found')
    })

    it('should prevent users from updating their own role', async () => {
      const userId = 'admin-1' // Same as authenticated user
      const updateData = {
        role: 'VIEWER', // Trying to downgrade own role
      }

      const response = await request(app)
        .put(`/api/cubcen/v1/users/${userId}`)
        .send(updateData)
        .expect(403)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('cannot modify your own role')
    })

    it('should update password with proper hashing', async () => {
      const userId = 'user-1'
      const updateData = {
        password: 'newpassword123',
      }

      const existingUser = {
        id: userId,
        name: 'Test User',
        email: 'user@example.com',
        role: 'OPERATOR',
        isActive: true,
      }

      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.user.update.mockResolvedValue({
        ...existingUser,
        password: 'hashed-password',
        updatedAt: new Date(),
      })

      const response = await request(app)
        .put(`/api/cubcen/v1/users/${userId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.password).toBeUndefined()
    })
  })

  describe('DELETE /api/cubcen/v1/users/:id', () => {
    it('should deactivate a user instead of deleting', async () => {
      const userId = 'user-1'

      const existingUser = {
        id: userId,
        name: 'Test User',
        email: 'user@example.com',
        role: 'OPERATOR',
        isActive: true,
      }

      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.user.update.mockResolvedValue({
        ...existingUser,
        isActive: false,
        updatedAt: new Date(),
      })

      const response = await request(app)
        .delete(`/api/cubcen/v1/users/${userId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('User deactivated successfully')

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { isActive: false },
      })
    })

    it('should return 404 for non-existent user', async () => {
      const userId = 'non-existent'
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .delete(`/api/cubcen/v1/users/${userId}`)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('User not found')
    })

    it('should prevent users from deactivating themselves', async () => {
      const userId = 'admin-1' // Same as authenticated user

      const response = await request(app)
        .delete(`/api/cubcen/v1/users/${userId}`)
        .expect(403)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('cannot deactivate yourself')
    })

    it('should prevent deactivating the last admin user', async () => {
      const userId = 'user-1'

      const existingUser = {
        id: userId,
        name: 'Last Admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        isActive: true,
      }

      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.user.count.mockResolvedValue(1) // Only one active admin

      const response = await request(app)
        .delete(`/api/cubcen/v1/users/${userId}`)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('last active admin')
    })
  })

  describe('POST /api/cubcen/v1/users/:id/activate', () => {
    it('should reactivate a deactivated user', async () => {
      const userId = 'user-1'

      const deactivatedUser = {
        id: userId,
        name: 'Test User',
        email: 'user@example.com',
        role: 'OPERATOR',
        isActive: false,
      }

      mockPrisma.user.findUnique.mockResolvedValue(deactivatedUser)
      mockPrisma.user.update.mockResolvedValue({
        ...deactivatedUser,
        isActive: true,
        updatedAt: new Date(),
      })

      const response = await request(app)
        .post(`/api/cubcen/v1/users/${userId}/activate`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('User activated successfully')

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { isActive: true },
      })
    })

    it('should return 400 if user is already active', async () => {
      const userId = 'user-1'

      const activeUser = {
        id: userId,
        name: 'Test User',
        email: 'user@example.com',
        role: 'OPERATOR',
        isActive: true,
      }

      mockPrisma.user.findUnique.mockResolvedValue(activeUser)

      const response = await request(app)
        .post(`/api/cubcen/v1/users/${userId}/activate`)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('already active')
    })
  })

  describe('Authorization', () => {
    it('should require admin role for user management', async () => {
      // Mock non-admin user
      jest.doMock('../../middleware/auth', () => ({
        authMiddleware: (req: any, res: any, next: any) => {
          req.user = { id: 'user-1', role: 'OPERATOR' }
          next()
        },
      }))

      const response = await request(app)
        .get('/api/cubcen/v1/users')
        .expect(403)

      expect(response.body.error).toContain('admin privileges')
    })

    it('should allow operators to view their own profile', async () => {
      // Mock operator user
      jest.doMock('../../middleware/auth', () => ({
        authMiddleware: (req: any, res: any, next: any) => {
          req.user = { id: 'user-1', role: 'OPERATOR' }
          next()
        },
      }))

      const mockUser = {
        id: 'user-1',
        name: 'Operator User',
        email: 'operator@example.com',
        role: 'OPERATOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const response = await request(app)
        .get('/api/cubcen/v1/users/user-1')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.id).toBe('user-1')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database connection failed'))

      const response = await request(app)
        .get('/api/cubcen/v1/users')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Failed to fetch users')
    })

    it('should validate user role enum', async () => {
      const invalidUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'INVALID_ROLE',
        password: 'password123',
      }

      const response = await request(app)
        .post('/api/cubcen/v1/users')
        .send(invalidUser)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid role')
    })
  })
})