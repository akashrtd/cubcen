// Cubcen Authentication Integration Test
// End-to-end test for authentication system

import { AuthService } from '@/services/auth'
import { PrismaClient, UserRole } from '@/generated/prisma'
import { createTokenPair, verifyAccessToken } from '@/lib/jwt'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'

// Mock database for integration test
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn()
  }
} as unknown as PrismaClient

describe('Authentication Integration', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService(mockPrisma)
    jest.clearAllMocks()
  })

  it('should complete full authentication flow', async () => {
    // Mock user data
    const userData = {
      id: 'user-123',
      email: 'admin@cubcen.com',
      password: '$2a$12$hashedpassword',
      name: 'Admin User',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Mock database responses
    mockPrisma.user.findUnique = jest.fn()
      .mockResolvedValueOnce(null) // For registration check
      .mockResolvedValueOnce(userData) // For login
      .mockResolvedValueOnce(userData) // For token validation

    mockPrisma.user.create = jest.fn().mockResolvedValue(userData)

    // Mock bcrypt
    const bcrypt = require('bcryptjs')
    bcrypt.hash = jest.fn().mockResolvedValue('$2a$12$hashedpassword')
    bcrypt.compare = jest.fn().mockResolvedValue(true)

    // 1. Register user
    const registerResult = await authService.register({
      email: 'admin@cubcen.com',
      password: 'SecurePassword123!',
      name: 'Admin User',
      role: UserRole.ADMIN
    })

    expect(registerResult.user.email).toBe('admin@cubcen.com')
    expect(registerResult.user.role).toBe(UserRole.ADMIN)
    expect(registerResult.tokens.accessToken).toBeDefined()
    expect(registerResult.tokens.refreshToken).toBeDefined()

    // 2. Login user
    const loginResult = await authService.login({
      email: 'admin@cubcen.com',
      password: 'SecurePassword123!'
    })

    expect(loginResult.user.email).toBe('admin@cubcen.com')
    expect(loginResult.tokens.accessToken).toBeDefined()

    // 3. Validate token
    const validatedUser = await authService.validateToken(loginResult.tokens.accessToken)
    expect(validatedUser.email).toBe('admin@cubcen.com')
    expect(validatedUser.role).toBe(UserRole.ADMIN)

    // 4. Test JWT utilities
    const tokenPayload = verifyAccessToken(loginResult.tokens.accessToken)
    expect(tokenPayload.userId).toBe(userData.id)
    expect(tokenPayload.email).toBe(userData.email)
    expect(tokenPayload.role).toBe(userData.role)

    // 5. Test RBAC permissions
    expect(hasPermission(UserRole.ADMIN, PERMISSIONS.USER_CREATE)).toBe(true)
    expect(hasPermission(UserRole.ADMIN, PERMISSIONS.SYSTEM_CONFIGURE)).toBe(true)
    expect(hasPermission(UserRole.VIEWER, PERMISSIONS.USER_CREATE)).toBe(false)

    // 6. Test token creation
    const newTokens = createTokenPair(userData.id, userData.email, userData.role)
    expect(newTokens.accessToken).toBeDefined()
    expect(newTokens.refreshToken).toBeDefined()
    expect(newTokens.tokenType).toBe('Bearer')
    expect(newTokens.expiresIn).toBeGreaterThan(0)
  })

  it('should handle authentication errors properly', async () => {
    // Test invalid login
    mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null)

    await expect(authService.login({
      email: 'nonexistent@cubcen.com',
      password: 'password'
    })).rejects.toThrow('Invalid email or password')

    // Test duplicate registration
    const existingUser = {
      id: 'user-456',
      email: 'existing@cubcen.com',
      password: 'hashedpassword',
      name: 'Existing User',
      role: UserRole.VIEWER,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockPrisma.user.findUnique = jest.fn().mockResolvedValue(existingUser)

    await expect(authService.register({
      email: 'existing@cubcen.com',
      password: 'password'
    })).rejects.toThrow('Email already registered')
  })

  it('should validate role-based permissions correctly', () => {
    // Admin permissions
    expect(hasPermission(UserRole.ADMIN, PERMISSIONS.USER_CREATE)).toBe(true)
    expect(hasPermission(UserRole.ADMIN, PERMISSIONS.USER_DELETE)).toBe(true)
    expect(hasPermission(UserRole.ADMIN, PERMISSIONS.SYSTEM_CONFIGURE)).toBe(true)

    // Operator permissions
    expect(hasPermission(UserRole.OPERATOR, PERMISSIONS.AGENT_CREATE)).toBe(true)
    expect(hasPermission(UserRole.OPERATOR, PERMISSIONS.TASK_EXECUTE)).toBe(true)
    expect(hasPermission(UserRole.OPERATOR, PERMISSIONS.USER_CREATE)).toBe(false)
    expect(hasPermission(UserRole.OPERATOR, PERMISSIONS.SYSTEM_CONFIGURE)).toBe(false)

    // Viewer permissions
    expect(hasPermission(UserRole.VIEWER, PERMISSIONS.USER_READ)).toBe(true)
    expect(hasPermission(UserRole.VIEWER, PERMISSIONS.AGENT_READ)).toBe(true)
    expect(hasPermission(UserRole.VIEWER, PERMISSIONS.USER_CREATE)).toBe(false)
    expect(hasPermission(UserRole.VIEWER, PERMISSIONS.AGENT_CREATE)).toBe(false)
  })
})

// Mock bcryptjs and jsonwebtoken for integration test
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}))

jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}))