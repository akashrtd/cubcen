// Cubcen Authentication API Routes
// Express routes for authentication endpoints

import { Router, Request, Response } from 'express'
import { authService } from '@/services/auth'
import { prisma } from '@/lib/database'
import { structuredLogger as logger } from '@/lib/logger'
import {
  authenticate,
  requireAdmin,
  requireSelfOrAdmin,
} from '@/backend/middleware/auth'
import { validateBody, validateParams } from '@/backend/middleware/validation'
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  refreshTokenSchema,
  updateUserRoleSchema,
} from '@/lib/validation/auth'
import { idParamSchema } from '@/backend/middleware/validation'
import { AuthenticationError } from '@/types/auth'

const router = Router()

/**
 * @swagger
 * /api/cubcen/v1/auth/login:
 *   post:
 *     summary: Authenticate user
 *     description: Authenticate user with email and password to obtain JWT tokens
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: user@company.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           description: JWT access token
 *                         refreshToken:
 *                           type: string
 *                           description: JWT refresh token
 *                         expiresIn:
 *                           type: number
 *                           description: Token expiration time in seconds
 *                 message:
 *                   type: string
 *                   example: Login successful
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      logger.info('Login attempt', { email })

      const result = await authService.login({ email, password })

      logger.info('Login successful', {
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
      })

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
      })
    } catch (error) {
      logger.error('Login failed', error as Error, { email: req.body.email })

      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        })
        return
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      })
    }
  }
)

/**
 * @swagger
 * /api/cubcen/v1/auth/register:
 *   post:
 *     summary: Register new user
 *     description: Register a new user account with email, password, and role
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: newuser@company.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: User password (minimum 8 characters)
 *                 example: securePassword123
 *               name:
 *                 type: string
 *                 description: User full name
 *                 example: John Doe
 *               role:
 *                 type: string
 *                 enum: [admin, operator, viewer]
 *                 description: User role (defaults to viewer)
 *                 example: operator
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *                         expiresIn:
 *                           type: number
 *                 message:
 *                   type: string
 *                   example: Registration successful
 *       400:
 *         description: Invalid request data or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many registration attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password, name, role } = req.body

      logger.info('Registration attempt', { email })

      const result = await authService.register({
        email,
        password,
        name,
        role,
      })

      logger.info('Registration successful', {
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
      })

      res.status(201).json({
        success: true,
        data: result,
        message: 'Registration successful',
      })
    } catch (error) {
      logger.error('Registration failed', error as Error, {
        email: req.body.email,
      })

      if (error instanceof AuthenticationError) {
        res.status(400).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        })
        return
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      })
    }
  }
)

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body

      logger.info('Token refresh attempt')

      const tokens = await authService.refreshToken(refreshToken)

      logger.info('Token refresh successful')

      res.status(200).json({
        success: true,
        data: { tokens },
        message: 'Token refreshed successfully',
      })
    } catch (error) {
      logger.error('Token refresh failed', error as Error)

      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        })
        return
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      })
    }
  }
)

/**
 * @swagger
 * /api/cubcen/v1/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Get information about the currently authenticated user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: User information retrieved successfully
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user!

    logger.debug('User info request', { userId: user.id })

    res.status(200).json({
      success: true,
      data: { user },
      message: 'User information retrieved successfully',
    })
  } catch (error) {
    logger.error('Get user info failed', error as Error, {
      userId: req.user?.id,
    })

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    })
  }
})

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body
      const userId = req.user!.id

      logger.info('Password change attempt', { userId })

      await authService.changePassword(userId, currentPassword, newPassword)

      logger.info('Password change successful', { userId })

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      })
    } catch (error) {
      logger.error('Password change failed', error as Error, {
        userId: req.user?.id,
      })

      if (error instanceof AuthenticationError) {
        res.status(400).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        })
        return
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      })
    }
  }
)

/**
 * GET /api/auth/users
 * Get all users (admin only)
 */
router.get(
  '/users',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      logger.info('Get all users request', { requestedBy: req.user!.id })

      const users = await authService.getAllUsers()

      res.status(200).json({
        success: true,
        data: { users },
        message: 'Users retrieved successfully',
      })
    } catch (error) {
      logger.error('Get all users failed', error as Error, {
        requestedBy: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      })
    }
  }
)

/**
 * GET /api/auth/users/:id
 * Get user by ID (self or admin)
 */
router.get(
  '/users/:id',
  authenticate,
  requireSelfOrAdmin('id'),
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      logger.info('Get user by ID request', {
        userId: id,
        requestedBy: req.user!.id,
      })

      const user = await authService.getUserById(id)

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        })
        return
      }

      res.status(200).json({
        success: true,
        data: { user },
        message: 'User retrieved successfully',
      })
    } catch (error) {
      logger.error('Get user by ID failed', error as Error, {
        userId: req.params.id,
        requestedBy: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      })
    }
  }
)

/**
 * PUT /api/auth/users/:id/role
 * Update user role (admin only)
 */
router.put(
  '/users/:id/role',
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateUserRoleSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { role } = req.body

      logger.info('Update user role request', {
        userId: id,
        newRole: role,
        requestedBy: req.user!.id,
      })

      const updatedUser = await authService.updateUserRole(id, role)

      logger.info('User role updated successfully', {
        userId: id,
        newRole: role,
        updatedBy: req.user!.id,
      })

      res.status(200).json({
        success: true,
        data: { user: updatedUser },
        message: 'User role updated successfully',
      })
    } catch (error) {
      logger.error('Update user role failed', error as Error, {
        userId: req.params.id,
        requestedBy: req.user?.id,
      })

      if (error instanceof AuthenticationError) {
        res.status(400).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        })
        return
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      })
    }
  }
)

/**
 * DELETE /api/auth/users/:id
 * Delete user (admin only)
 */
router.delete(
  '/users/:id',
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      // Prevent admin from deleting themselves
      if (id === req.user!.id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_DELETE_SELF',
            message: 'Cannot delete your own account',
          },
        })
        return
      }

      logger.info('Delete user request', {
        userId: id,
        requestedBy: req.user!.id,
      })

      await authService.deleteUser(id)

      logger.info('User deleted successfully', {
        userId: id,
        deletedBy: req.user!.id,
      })

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      })
    } catch (error) {
      logger.error('Delete user failed', error as Error, {
        userId: req.params.id,
        requestedBy: req.user?.id,
      })

      if (error instanceof AuthenticationError) {
        res.status(400).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        })
        return
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      })
    }
  }
)

/**
 * POST /api/auth/logout
 * Logout user (placeholder for token blacklisting in future)
 */
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    logger.info('User logout', { userId })

    // In a production system, you would blacklist the token here
    // For now, we just log the logout event

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    logger.error('Logout failed', error as Error, { userId: req.user?.id })

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    })
  }
})

export default router
