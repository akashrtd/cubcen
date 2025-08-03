// Cubcen API Error Handler Tests
// Tests for centralized error handling utilities

import request from 'supertest'
import express from 'express'
import { ZodError, z } from 'zod'
import {
  APIError,
  APIErrorCode,
  createSuccessResponse,
  createErrorResponse,
  handleValidationError,
  handleAuthError,
  handleAuthzError,
  handleDatabaseError,
  handleExternalServiceError,
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
  asyncHandler,
  ValidationHelpers,
} from '../api-error-handler'
import { AuthenticationError, AuthorizationError } from '@/types/auth'

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}))

describe('API Error Handler', () => {
  describe('APIError class', () => {
    it('should create an API error with correct properties', () => {
      const error = new APIError(
        APIErrorCode.VALIDATION_ERROR,
        'Test validation error',
        { field: 'email' }
      )

      expect(error.code).toBe(APIErrorCode.VALIDATION_ERROR)
      expect(error.message).toBe('Test validation error')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({ field: 'email' })
      expect(error.isOperational).toBe(true)
      expect(error.name).toBe('APIError')
    })

    it('should set correct status codes for different error types', () => {
      const validationError = new APIError(APIErrorCode.VALIDATION_ERROR, 'Validation failed')
      const authError = new APIError(APIErrorCode.AUTHENTICATION_FAILED, 'Auth failed')
      const notFoundError = new APIError(APIErrorCode.RESOURCE_NOT_FOUND, 'Not found')
      const internalError = new APIError(APIErrorCode.INTERNAL_ERROR, 'Internal error')

      expect(validationError.statusCode).toBe(400)
      expect(authError.statusCode).toBe(401)
      expect(notFoundError.statusCode).toBe(404)
      expect(internalError.statusCode).toBe(500)
    })
  })

  describe('Response creators', () => {
    it('should create success response correctly', () => {
      const data = { id: '123', name: 'Test' }
      const response = createSuccessResponse(data, 'Success message', 'req_123')

      expect(response).toEqual({
        success: true,
        data,
        message: 'Success message',
        timestamp: expect.any(String),
        requestId: 'req_123',
      })
    })

    it('should create error response correctly', () => {
      const response = createErrorResponse(
        APIErrorCode.VALIDATION_ERROR,
        'Validation failed',
        { field: 'email' },
        'req_123'
      )

      expect(response).toEqual({
        success: false,
        error: {
          code: APIErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: { field: 'email' },
          timestamp: expect.any(String),
          requestId: 'req_123',
        },
      })
    })
  })

  describe('Error handlers', () => {
    it('should handle Zod validation errors', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      })

      try {
        schema.parse({ email: 'invalid', age: 15 })
      } catch (error) {
        const response = handleValidationError(error as ZodError, 'req_123')

        expect(response.success).toBe(false)
        expect(response.error.code).toBe(APIErrorCode.VALIDATION_ERROR)
        expect(response.error.details).toHaveLength(2)
        expect(response.error.requestId).toBe('req_123')
      }
    })

    it('should handle authentication errors', () => {
      const authError = new AuthenticationError('Invalid token', 'INVALID_TOKEN')
      const response = handleAuthError(authError, 'req_123')

      expect(response.success).toBe(false)
      expect(response.error.code).toBe(APIErrorCode.INVALID_TOKEN)
      expect(response.error.message).toBe('Invalid token')
      expect(response.error.requestId).toBe('req_123')
    })

    it('should handle authorization errors', () => {
      const authzError = new AuthorizationError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS')
      const response = handleAuthzError(authzError, 'req_123')

      expect(response.success).toBe(false)
      expect(response.error.code).toBe(APIErrorCode.INSUFFICIENT_PERMISSIONS)
      expect(response.error.message).toBe('Insufficient permissions')
      expect(response.error.requestId).toBe('req_123')
    })

    it('should handle database errors', () => {
      const uniqueError = new Error('UNIQUE constraint failed: users.email')
      const response = handleDatabaseError(uniqueError, 'req_123')

      expect(response.success).toBe(false)
      expect(response.error.code).toBe(APIErrorCode.RESOURCE_ALREADY_EXISTS)
      expect(response.error.message).toBe('Resource already exists')
    })

    it('should handle external service errors', () => {
      const timeoutError = new Error('Connection timeout')
      const response = handleExternalServiceError(timeoutError, 'TestService', 'req_123')

      expect(response.success).toBe(false)
      expect(response.error.code).toBe(APIErrorCode.TIMEOUT_ERROR)
      expect(response.error.message).toBe('TestService service timeout')
    })
  })

  describe('Middleware', () => {
    let app: express.Application

    beforeEach(() => {
      app = express()
      app.use(express.json())
      app.use(requestIdMiddleware)
    })

    it('should add request ID to headers', async () => {
      app.get('/test', (req, res) => {
        res.json({ requestId: req.headers['x-request-id'] })
      })

      const response = await request(app)
        .get('/test')
        .expect(200)

      expect(response.body.requestId).toMatch(/^req_\d+_[a-z0-9]+$/)
      expect(response.headers['x-request-id']).toBeDefined()
    })

    it('should handle 404 errors correctly', async () => {
      app.use(notFoundHandler)

      const response = await request(app)
        .get('/nonexistent')
        .expect(404)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: APIErrorCode.RESOURCE_NOT_FOUND,
          message: 'API endpoint not found: GET /nonexistent',
          timestamp: expect.any(String),
          requestId: expect.any(String),
        },
      })
    })

    it('should handle async errors with asyncHandler', async () => {
      app.get('/error', asyncHandler(async (req, res) => {
        throw new APIError(APIErrorCode.VALIDATION_ERROR, 'Test error')
      }))

      app.use(errorHandler)

      const response = await request(app)
        .get('/error')
        .expect(400)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: APIErrorCode.VALIDATION_ERROR,
          message: 'Test error',
          timestamp: expect.any(String),
          requestId: expect.any(String),
        },
      })
    })

    it('should handle generic errors', async () => {
      app.get('/generic-error', asyncHandler(async (req, res) => {
        throw new Error('Generic error')
      }))

      app.use(errorHandler)

      const response = await request(app)
        .get('/generic-error')
        .expect(500)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: APIErrorCode.INTERNAL_ERROR,
          message: 'Internal server error',
          timestamp: expect.any(String),
          requestId: expect.any(String),
        },
      })
    })
  })

  describe('ValidationHelpers', () => {
    it('should require resource existence', () => {
      const resource = { id: '123', name: 'Test' }
      const result = ValidationHelpers.requireResource(resource, 'User')
      expect(result).toBe(resource)

      expect(() => {
        ValidationHelpers.requireResource(null, 'User')
      }).toThrow(APIError)

      expect(() => {
        ValidationHelpers.requireResource(undefined, 'User')
      }).toThrow(APIError)
    })

    it('should require unique resource', () => {
      expect(() => {
        ValidationHelpers.requireUniqueResource(null, 'User')
      }).not.toThrow()

      expect(() => {
        ValidationHelpers.requireUniqueResource({ id: '123' }, 'User')
      }).toThrow(APIError)
    })

    it('should require permissions', () => {
      expect(() => {
        ValidationHelpers.requirePermission(true, 'Access granted')
      }).not.toThrow()

      expect(() => {
        ValidationHelpers.requirePermission(false, 'Access denied')
      }).toThrow(APIError)
    })

    it('should require preconditions', () => {
      expect(() => {
        ValidationHelpers.requirePrecondition(true, 'Condition met')
      }).not.toThrow()

      expect(() => {
        ValidationHelpers.requirePrecondition(false, 'Condition not met')
      }).toThrow(APIError)
    })
  })
})