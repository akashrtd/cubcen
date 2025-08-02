// Cubcen Authentication Service
// Core authentication logic including login, registration, and token management

import bcrypt from 'bcryptjs'
import { PrismaClient } from '@/generated/prisma'
import { UserRole } from '@/types/auth'
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResult,
  AuthUser,
  AuthToken,
  AuthenticationError,
  TokenPayload,
  RefreshTokenPayload,
} from '@/types/auth'
import {
  createTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
} from '@/lib/jwt'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/database'

class AuthService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      logger.info('User login attempt', { email: credentials.email })

      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: credentials.email },
      })

      if (!user) {
        logger.warn('Login failed: User not found', {
          email: credentials.email,
        })
        throw new AuthenticationError(
          'Invalid email or password',
          'INVALID_CREDENTIALS'
        )
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      )
      if (!isPasswordValid) {
        logger.warn('Login failed: Invalid password', {
          email: credentials.email,
          userId: user.id,
        })
        throw new AuthenticationError(
          'Invalid email or password',
          'INVALID_CREDENTIALS'
        )
      }

      // Create tokens
      const tokens = createTokenPair(user.id, user.email, user.role as UserRole)

      // Convert user to AuthUser format
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }

      logger.info('User login successful', {
        email: credentials.email,
        userId: user.id,
        role: user.role,
      })

      return {
        user: authUser,
        tokens,
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }

      logger.error('Login error', error as Error, { email: credentials.email })
      throw new AuthenticationError('Login failed', 'LOGIN_ERROR')
    }
  }

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResult> {
    try {
      logger.info('User registration attempt', { email: credentials.email })

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: credentials.email },
      })

      if (existingUser) {
        logger.warn('Registration failed: Email already exists', {
          email: credentials.email,
        })
        throw new AuthenticationError(
          'Email already registered',
          'EMAIL_EXISTS'
        )
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(credentials.password, saltRounds)

      // Create user with default role if not specified
      const userRole = credentials.role || UserRole.VIEWER

      const user = await this.prisma.user.create({
        data: {
          email: credentials.email,
          password: hashedPassword,
          name: credentials.name || null,
          role: userRole,
        },
      })

      // Create tokens
      const tokens = createTokenPair(user.id, user.email, user.role as UserRole)

      // Convert user to AuthUser format
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }

      logger.info('User registration successful', {
        email: credentials.email,
        userId: user.id,
        role: user.role,
      })

      return {
        user: authUser,
        tokens,
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }

      logger.error('Registration error', error as Error, {
        email: credentials.email,
      })
      throw new AuthenticationError('Registration failed', 'REGISTRATION_ERROR')
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthToken> {
    try {
      logger.info('Token refresh attempt')

      // Verify refresh token
      const payload: RefreshTokenPayload = verifyRefreshToken(refreshToken)

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      })

      if (!user) {
        logger.warn('Token refresh failed: User not found', {
          userId: payload.userId,
        })
        throw new AuthenticationError('Invalid refresh token', 'INVALID_TOKEN')
      }

      // Create new token pair
      const tokens = createTokenPair(user.id, user.email, user.role as UserRole)

      logger.info('Token refresh successful', {
        userId: user.id,
        email: user.email,
      })

      return tokens
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }

      logger.error('Token refresh error', error as Error)
      throw new AuthenticationError('Token refresh failed', 'REFRESH_ERROR')
    }
  }

  /**
   * Validate access token and return user information
   */
  async validateToken(token: string): Promise<AuthUser> {
    try {
      // Verify token
      const payload: TokenPayload = verifyAccessToken(token)

      // Find user to ensure they still exist and get latest data
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      })

      if (!user) {
        throw new AuthenticationError('User not found', 'USER_NOT_FOUND')
      }

      // Convert user to AuthUser format
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }

      return authUser
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }

      logger.error('Token validation error', error as Error)
      throw new AuthenticationError('Invalid token', 'INVALID_TOKEN')
    }
  }

  /**
   * Extract and validate token from Authorization header
   */
  async validateAuthHeader(authHeader: string | undefined): Promise<AuthUser> {
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      throw new AuthenticationError(
        'Missing or invalid authorization header',
        'MISSING_TOKEN'
      )
    }

    return this.validateToken(token)
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      logger.info('Password change attempt', { userId })

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new AuthenticationError('User not found', 'USER_NOT_FOUND')
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      )
      if (!isCurrentPasswordValid) {
        logger.warn('Password change failed: Invalid current password', {
          userId,
        })
        throw new AuthenticationError(
          'Current password is incorrect',
          'INVALID_PASSWORD'
        )
      }

      // Hash new password
      const saltRounds = 12
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      })

      logger.info('Password change successful', { userId })
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }

      logger.error('Password change error', error as Error, { userId })
      throw new AuthenticationError(
        'Password change failed',
        'PASSWORD_CHANGE_ERROR'
      )
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<AuthUser> {
    try {
      logger.info('User role update attempt', { userId, newRole })

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      })

      logger.info('User role update successful', { userId, newRole })

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    } catch (error) {
      logger.error('User role update error', error as Error, {
        userId,
        newRole,
      })
      throw new AuthenticationError('Role update failed', 'ROLE_UPDATE_ERROR')
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    } catch (error) {
      logger.error('Get user by ID error', error as Error, { userId })
      throw new AuthenticationError('Failed to get user', 'GET_USER_ERROR')
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<AuthUser[]> {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      })

      return users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }))
    } catch (error) {
      logger.error('Get all users error', error as Error)
      throw new AuthenticationError('Failed to get users', 'GET_USERS_ERROR')
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      logger.info('User deletion attempt', { userId })

      await this.prisma.user.delete({
        where: { id: userId },
      })

      logger.info('User deletion successful', { userId })
    } catch (error) {
      logger.error('User deletion error', error as Error, { userId })
      throw new AuthenticationError('User deletion failed', 'DELETE_USER_ERROR')
    }
  }
}

const authService = new AuthService(prisma)

export { AuthService, authService }
