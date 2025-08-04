// Cubcen Authentication and Authorization Middleware
// Express middleware for protecting routes and validating permissions

import { Request, Response, NextFunction } from 'express'
import { UserRole } from '@/types/auth'
import { authService } from '@/services/auth'
import {
  AuthUser,
  AuthenticationError,
  AuthorizationError,
  Permission,
} from '@/types/auth'
import {
  requirePermission as rbacRequirePermission,
  requireResourcePermission as rbacRequireResourcePermission,
} from '@/lib/rbac'
import structuredLogger from '@/lib/logger'
import { prisma } from '@/lib/database'

// Extend Express Request to include user information
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser
  }
}

// Auth service is imported as a singleton instance

/**
 * Authentication middleware - validates JWT token and adds user to request
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    const user = await authService.validateAuthHeader(authHeader)

    // Add user to request object
    req.user = user

    structuredLogger.debug('User authenticated', {
      userId: user.id,
      email: user.email,
      role: user.role,
      path: req.path,
      method: req.method,
    })

    next()
  } catch (error) {
    structuredLogger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      method: req.method,
      authHeader: req.headers.authorization ? 'present' : 'missing',
    })

    if (error instanceof AuthenticationError) {
      res.status(401).json({
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      })
      return
    }

    res.status(401).json({
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      },
    })
  }
}

/**
 * Optional authentication middleware - adds user to request if token is valid, but doesn't require it
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (authHeader) {
      const user = await authService.validateAuthHeader(authHeader)
      req.user = user

      structuredLogger.debug('Optional authentication successful', {
        userId: user.id,
        email: user.email,
        role: user.role,
      })
    }

    next()
  } catch (error) {
    // For optional auth, we don't fail on invalid tokens, just continue without user
    structuredLogger.debug('Optional authentication failed, continuing without user', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    next()
  }
}

/**
 * Role-based authorization middleware factory
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthorizationError(
          'Authentication required',
          'NOT_AUTHENTICATED'
        )
      }

      if (!allowedRoles.includes(req.user.role)) {
        structuredLogger.warn('Authorization failed: Insufficient role', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          path: req.path,
          method: req.method,
        })

        throw new AuthorizationError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}`,
          'INSUFFICIENT_ROLE'
        )
      }

      structuredLogger.debug('Role authorization successful', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
      })

      next()
    } catch (error) {
      if (error instanceof AuthorizationError) {
        res.status(403).json({
          error: {
            code: error.code,
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        })
        return
      }

      res.status(403).json({
        error: {
          code: 'AUTHORIZATION_FAILED',
          message: 'Access denied',
          timestamp: new Date().toISOString(),
        },
      })
    }
  }
}

/**
 * Permission-based authorization middleware factory
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthorizationError(
          'Authentication required',
          'NOT_AUTHENTICATED'
        )
      }

      rbacRequirePermission(req.user.role, permission)

      structuredLogger.debug('Permission authorization successful', {
        userId: req.user.id,
        userRole: req.user.role,
        permission: permission,
      })

      next()
    } catch (error) {
      structuredLogger.warn('Permission authorization failed', {
        userId: req.user?.id,
        userRole: req.user?.role,
        permission: permission,
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
      })

      if (error instanceof AuthorizationError) {
        res.status(403).json({
          error: {
            code: error.code,
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        })
        return
      }

      res.status(403).json({
        error: {
          code: 'AUTHORIZATION_FAILED',
          message: 'Access denied',
          timestamp: new Date().toISOString(),
        },
      })
    }
  }
}

/**
 * Resource permission middleware factory
 */
export function requireResourcePermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthorizationError(
          'Authentication required',
          'NOT_AUTHENTICATED'
        )
      }

      rbacRequireResourcePermission(req.user.role, resource, action)

      structuredLogger.debug('Resource permission authorization successful', {
        userId: req.user.id,
        userRole: req.user.role,
        resource,
        action,
      })

      next()
    } catch (error) {
      structuredLogger.warn('Resource permission authorization failed', {
        userId: req.user?.id,
        userRole: req.user?.role,
        resource,
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
      })

      if (error instanceof AuthorizationError) {
        res.status(403).json({
          error: {
            code: error.code,
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        })
        return
      }

      res.status(403).json({
        error: {
          code: 'AUTHORIZATION_FAILED',
          message: 'Access denied',
          timestamp: new Date().toISOString(),
        },
      })
    }
  }
}

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole(UserRole.ADMIN)

/**
 * Admin or Operator middleware
 */
export const requireOperator = requireRole(UserRole.ADMIN, UserRole.OPERATOR)

/**
 * Any authenticated user middleware (all roles)
 */
export const requireAuth = requireRole(
  UserRole.ADMIN,
  UserRole.OPERATOR,
  UserRole.VIEWER
)

/**
 * Self or admin access middleware - allows users to access their own resources or admins to access any
 */
export function requireSelfOrAdmin(userIdParam: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthorizationError(
          'Authentication required',
          'NOT_AUTHENTICATED'
        )
      }

      const targetUserId = req.params[userIdParam]
      const isAdmin = req.user.role === UserRole.ADMIN
      const isSelf = req.user.id === targetUserId

      if (!isAdmin && !isSelf) {
        structuredLogger.warn('Self or admin authorization failed', {
          userId: req.user.id,
          userRole: req.user.role,
          targetUserId,
          path: req.path,
          method: req.method,
        })

        throw new AuthorizationError(
          'Access denied. You can only access your own resources.',
          'INSUFFICIENT_PERMISSIONS'
        )
      }

      structuredLogger.debug('Self or admin authorization successful', {
        userId: req.user.id,
        userRole: req.user.role,
        targetUserId,
        isAdmin,
        isSelf,
      })

      next()
    } catch (error) {
      if (error instanceof AuthorizationError) {
        res.status(403).json({
          error: {
            code: error.code,
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        })
        return
      }

      res.status(403).json({
        error: {
          code: 'AUTHORIZATION_FAILED',
          message: 'Access denied',
          timestamp: new Date().toISOString(),
        },
      })
    }
  }
}
