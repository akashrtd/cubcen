// Cubcen Authentication Service Tests
// Comprehensive tests for authentication functionality

import { AuthService, authService } from '../auth'
import { PrismaClient } from '@/generated/prisma'
import { UserRole } from '@/types/auth'
import { AuthenticationError } from '@/types/auth'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock dependencies
jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
  JsonWebTokenError: class JsonWebTokenError extends Error {},
  TokenExpiredError: class TokenExpiredError extends Error {},
}))

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
} as unknown as PrismaClient

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    mockAuthService = authService as jest.Mocked<typeof authService>
    jest.clearAllMocks()
  })

  describe('login', () => {
    const loginCredentials = {
      email: 'test@cubcen.com',
      password: 'TestPassword123!',
    }

    const mockUser = {
      id: 'user-123',
      email: 'test@cubcen.com',
      password: 'hashed-password',
      name: 'Test User',
      role: UserRole.VIEWER,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should successfully login with valid credentials', async () => {
      // Mock database response
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser)

      // Mock bcrypt comparison
      mockBcrypt.compare.mockResolvedValue(true) as any

      // Mock JWT token creation
      mockJwt.sign.mockReturnValue('mock-token')

      const result = await authService.login(loginCredentials)

      expect(result.user.id).toBe(mockUser.id)
      expect(result.user.email).toBe(mockUser.email)
      expect(result.user.role).toBe(mockUser.role)
      expect(result.tokens.accessToken).toBeDefined()
      expect(result.tokens.refreshToken).toBeDefined()
      expect(result.tokens.tokenType).toBe('Bearer')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginCredentials.email },
      })
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        loginCredentials.password,
        mockUser.password
      )
    })

    it('should throw error for non-existent user', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null)

      await expect(authService.login(loginCredentials)).rejects.toThrow(
        new AuthenticationError(
          'Invalid email or password',
          'INVALID_CREDENTIALS'
        )
      )
    })

    it('should throw error for invalid password', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(false)

      await expect(authService.login(loginCredentials)).rejects.toThrow(
        new AuthenticationError(
          'Invalid email or password',
          'INVALID_CREDENTIALS'
        )
      )
    })

    it('should handle database errors', async () => {
      mockPrisma.user.findUnique = jest
        .fn()
        .mockRejectedValue(new Error('Database error'))

      await expect(authService.login(loginCredentials)).rejects.toThrow(
        new AuthenticationError('Login failed', 'LOGIN_ERROR')
      )
    })
  })

  describe('register', () => {
    const registerCredentials = {
      email: 'newuser@cubcen.com',
      password: 'NewPassword123!',
      name: 'New User',
    }

    const mockCreatedUser = {
      id: 'user-456',
      email: 'newuser@cubcen.com',
      password: 'hashed-password',
      name: 'New User',
      role: UserRole.VIEWER,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should successfully register new user', async () => {
      // Mock no existing user
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null)

      // Mock user creation
      mockPrisma.user.create = jest.fn().mockResolvedValue(mockCreatedUser)

      // Mock password hashing
      mockBcrypt.hash.mockResolvedValue('hashed-password')

      // Mock JWT token creation
      mockJwt.sign.mockReturnValue('mock-token')

      const result = await authService.register(registerCredentials)

      expect(result.user.id).toBe(mockCreatedUser.id)
      expect(result.user.email).toBe(mockCreatedUser.email)
      expect(result.user.role).toBe(UserRole.VIEWER)
      expect(result.tokens.accessToken).toBeDefined()

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerCredentials.email },
      })
      expect(mockBcrypt.hash).toHaveBeenCalledWith(
        registerCredentials.password,
        12
      )
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerCredentials.email,
          password: 'hashed-password',
          name: registerCredentials.name,
          role: UserRole.VIEWER,
        },
      })
    })

    it('should throw error for existing email', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockCreatedUser)

      await expect(authService.register(registerCredentials)).rejects.toThrow(
        new AuthenticationError('Email already registered', 'EMAIL_EXISTS')
      )
    })

    it('should register with custom role', async () => {
      const adminCredentials = {
        ...registerCredentials,
        role: UserRole.ADMIN,
      }

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null)
      mockPrisma.user.create = jest.fn().mockResolvedValue({
        ...mockCreatedUser,
        role: UserRole.ADMIN,
      })
      mockBcrypt.hash.mockResolvedValue('hashed-password')
      mockJwt.sign.mockReturnValue('mock-token')

      const result = await authService.register(adminCredentials)

      expect(result.user.role).toBe(UserRole.ADMIN)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: adminCredentials.email,
          password: 'hashed-password',
          name: adminCredentials.name,
          role: UserRole.ADMIN,
        },
      })
    })

    it('should handle database errors during registration', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null)
      mockPrisma.user.create = jest
        .fn()
        .mockRejectedValue(new Error('Database error'))
      mockBcrypt.hash.mockResolvedValue('hashed-password')

      await expect(authService.register(registerCredentials)).rejects.toThrow(
        new AuthenticationError('Registration failed', 'REGISTRATION_ERROR')
      )
    })
  })

  describe('validateToken', () => {
    const mockTokenPayload = {
      userId: 'user-123',
      email: 'test@cubcen.com',
      role: UserRole.VIEWER,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }

    const mockUser = {
      id: 'user-123',
      email: 'test@cubcen.com',
      password: 'hashed-password',
      name: 'Test User',
      role: UserRole.VIEWER,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should successfully validate valid token', async () => {
      mockJwt.verify.mockReturnValue(mockTokenPayload as jwt.JwtPayload)
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser)

      const result = await authService.validateToken('valid-token')

      expect(result.id).toBe(mockUser.id)
      expect(result.email).toBe(mockUser.email)
      expect(result.role).toBe(mockUser.role)

      expect(mockJwt.verify).toHaveBeenCalledWith(
        'valid-token',
        expect.any(String),
        expect.any(Object)
      )
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockTokenPayload.userId },
      })
    })

    it('should throw error for non-existent user', async () => {
      mockJwt.verify.mockReturnValue(mockTokenPayload as jwt.JwtPayload)
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null)

      await expect(authService.validateToken('valid-token')).rejects.toThrow(
        new AuthenticationError('User not found', 'USER_NOT_FOUND')
      )
    })

    it('should handle JWT verification errors', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token')
      })

      await expect(authService.validateToken('invalid-token')).rejects.toThrow(
        new AuthenticationError('Invalid token', 'INVALID_TOKEN')
      )
    })

    it('should handle expired tokens', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date())
      })

      await expect(authService.validateToken('expired-token')).rejects.toThrow(
        new AuthenticationError('Invalid token', 'INVALID_TOKEN')
      )
    })
  })

  describe('changePassword', () => {
    const userId = 'user-123'
    const currentPassword = 'OldPassword123!'
    const newPassword = 'NewPassword123!'

    const mockUser = {
      id: userId,
      email: 'test@cubcen.com',
      password: 'hashed-old-password',
      name: 'Test User',
      role: UserRole.VIEWER,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should successfully change password', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true) as any
      mockBcrypt.hash
        .mockResolvedValue('hashed-new-password')(
          mockPrisma.user.update as jest.Mock
        )
        .mockResolvedValue({
          ...mockUser,
          password: 'hashed-new-password',
        })

      await authService.changePassword(userId, currentPassword, newPassword)

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        currentPassword,
        mockUser.password
      )
      expect(mockBcrypt.hash).toHaveBeenCalledWith(newPassword, 12)
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: 'hashed-new-password' },
      })
    })

    it('should throw error for non-existent user', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null)

      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow(
        new AuthenticationError('User not found', 'USER_NOT_FOUND')
      )
    })

    it('should throw error for invalid current password', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(false)

      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow(
        new AuthenticationError(
          'Current password is incorrect',
          'INVALID_PASSWORD'
        )
      )
    })
  })

  describe('updateUserRole', () => {
    const userId = 'user-123'
    const newRole = UserRole.ADMIN

    const mockUser = {
      id: userId,
      email: 'test@cubcen.com',
      password: 'hashed-password',
      name: 'Test User',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should successfully update user role', async () => {
      mockPrisma.user.update = jest.fn().mockResolvedValue(mockUser)

      const result = await authService.updateUserRole(userId, newRole)

      expect(result.id).toBe(userId)
      expect(result.role).toBe(UserRole.ADMIN)
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { role: newRole },
      })
    })

    it('should handle database errors during role update', async () => {
      mockPrisma.user.update = jest
        .fn()
        .mockRejectedValue(new Error('Database error'))

      await expect(authService.updateUserRole(userId, newRole)).rejects.toThrow(
        new AuthenticationError('Role update failed', 'ROLE_UPDATE_ERROR')
      )
    })
  })

  describe('getUserById', () => {
    const userId = 'user-123'
    const mockUser = {
      id: userId,
      email: 'test@cubcen.com',
      password: 'hashed-password',
      name: 'Test User',
      role: UserRole.VIEWER,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should successfully get user by ID', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser)

      const result = await authService.getUserById(userId)

      expect(result).not.toBeNull()
      expect(result!.id).toBe(userId)
      expect(result!.email).toBe(mockUser.email)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      })
    })

    it('should return null for non-existent user', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null)

      const result = await authService.getUserById(userId)

      expect(result).toBeNull()
    })
  })

  describe('getAllUsers', () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@cubcen.com',
        password: 'hashed-password',
        name: 'User 1',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user-2',
        email: 'user2@cubcen.com',
        password: 'hashed-password',
        name: 'User 2',
        role: UserRole.VIEWER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    it('should successfully get all users', async () => {
      mockPrisma.user.findMany = jest.fn().mockResolvedValue(mockUsers)

      const result = await authService.getAllUsers()

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('user-1')
      expect(result[1].id).toBe('user-2')
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('deleteUser', () => {
    const userId = 'user-123'

    it('should successfully delete user', async () => {
      mockPrisma.user.delete = jest.fn().mockResolvedValue({})

      await authService.deleteUser(userId)

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      })
    })

    it('should handle database errors during deletion', async () => {
      ;(mockPrisma.user.delete as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      await expect(authService.deleteUser(userId)).rejects.toThrow(
        new AuthenticationError('User deletion failed', 'DELETE_USER_ERROR')
      )
    })
  })
})
