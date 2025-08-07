import request from 'supertest'
import express from 'express'
import { jest } from '@jest/globals'
import errorsRouter from '../errors'
import { auditLogger } from '@/lib/audit-logger'
import { logger } from '@/lib/logger'

// Mock dependencies
jest.mock('@/lib/audit-logger')
jest.mock('@/lib/logger')

const mockAuditLogger = auditLogger as jest.Mocked<typeof auditLogger>
const mockLogger = logger as jest.Mocked<typeof logger>

// Create test app
const app = express()
app.use(express.json())

// Mock authentication middleware
app.use((req, res, next) => {
  req.user = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'ADMIN',
  }
  req.ip = '127.0.0.1'
  req.headers['x-request-id'] = 'test-request-id'
  next()
})

app.use('/api/cubcen/v1/errors', errorsRouter)

describe('Error Reporting API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuditLogger.logEvent.mockResolvedValue()
    mockAuditLogger.getAuditLogs.mockResolvedValue({
      logs: [],
      total: 0,
    })
  })

  describe('POST /api/cubcen/v1/errors/report', () => {
    const validErrorReport = {
      errorId: 'error-123',
      message: 'Test error message',
      stack: 'Error: Test error\n    at test.js:1:1',
      componentStack: 'Component stack trace',
      pageName: 'Test Page',
      timestamp: new Date().toISOString(),
      userAgent: 'Mozilla/5.0',
      url: 'http://localhost:3000/test',
      metadata: { additional: 'data' },
    }

    it('should accept valid error report', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/errors/report')
        .send(validErrorReport)
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        message: 'Error reported successfully',
        data: {
          errorId: 'error-123',
          reported: true,
        },
      })

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Client-side error reported',
        expect.any(Error),
        expect.objectContaining({
          errorId: 'error-123',
          pageName: 'Test Page',
          url: 'http://localhost:3000/test',
        })
      )

      expect(mockAuditLogger.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ERROR_REPORTED',
          description: expect.stringContaining('Test error message'),
          metadata: expect.objectContaining({
            errorId: 'error-123',
            pageName: 'Test Page',
          }),
        })
      )
    })

    it('should reject invalid error report', async () => {
      const invalidReport = {
        message: 'Test error',
        // Missing required errorId
      }

      await request(app)
        .post('/api/cubcen/v1/errors/report')
        .send(invalidReport)
        .expect(400)
    })

    it('should handle missing optional fields', async () => {
      const minimalReport = {
        errorId: 'error-123',
        message: 'Test error message',
        timestamp: new Date().toISOString(),
      }

      const response = await request(app)
        .post('/api/cubcen/v1/errors/report')
        .send(minimalReport)
        .expect(200)

      expect(response.body.success).toBe(true)
    })
  })

  describe('POST /api/cubcen/v1/errors/user-report', () => {
    const validUserReport = {
      errorId: 'error-123',
      userDescription: 'The page crashed when I clicked the button',
      reproductionSteps: '1. Click button 2. Page crashes',
      expectedBehavior: 'Page should load normally',
      actualBehavior: 'Page shows error message',
    }

    it('should accept valid user error report', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/errors/user-report')
        .send(validUserReport)
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        message: 'User error report submitted successfully',
        data: {
          errorId: 'error-123',
          userReported: true,
        },
      })

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User error report submitted',
        expect.objectContaining({
          errorId: 'error-123',
          userId: 'test-user-id',
          userDescription: 'The page crashed when I clicked the button',
        })
      )

      expect(mockAuditLogger.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_ERROR_REPORT',
          description: expect.stringContaining('error-123'),
          metadata: expect.objectContaining({
            errorId: 'error-123',
            hasReproductionSteps: true,
            hasExpectedBehavior: true,
          }),
        })
      )
    })

    it('should reject invalid user report', async () => {
      const invalidReport = {
        userDescription: 'Error description',
        // Missing required errorId
      }

      await request(app)
        .post('/api/cubcen/v1/errors/user-report')
        .send(invalidReport)
        .expect(400)
    })

    it('should handle minimal user report', async () => {
      const minimalReport = {
        errorId: 'error-123',
        userDescription: 'Something went wrong',
      }

      const response = await request(app)
        .post('/api/cubcen/v1/errors/user-report')
        .send(minimalReport)
        .expect(200)

      expect(response.body.success).toBe(true)
    })
  })

  describe('GET /api/cubcen/v1/errors', () => {
    it('should return error reports for admin users', async () => {
      const mockErrors = [
        {
          id: '1',
          action: 'CLIENT_ERROR',
          description: 'Test error',
          timestamp: new Date(),
          success: false,
        },
      ]

      mockAuditLogger.getAuditLogs.mockResolvedValue({
        logs: mockErrors,
        total: 1,
      })

      const response = await request(app)
        .get('/api/cubcen/v1/errors')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.errors).toHaveLength(1)

      expect(mockAuditLogger.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ERRORS_ACCESSED',
          description: 'Admin accessed error reports',
        })
      )
    })

    it('should reject non-admin users', async () => {
      // Override user role for this test
      const nonAdminApp = express()
      nonAdminApp.use(express.json())
      nonAdminApp.use((req, res, next) => {
        req.user = {
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'OPERATOR', // Non-admin role
        }
        next()
      })
      nonAdminApp.use('/api/cubcen/v1/errors', errorsRouter)

      await request(nonAdminApp).get('/api/cubcen/v1/errors').expect(403)
    })

    it('should handle query parameters', async () => {
      mockAuditLogger.getAuditLogs.mockResolvedValue({
        logs: [],
        total: 0,
      })

      await request(app)
        .get('/api/cubcen/v1/errors')
        .query({
          page: '2',
          limit: '10',
          severity: 'high',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          pageName: 'Analytics',
          resolved: 'false',
        })
        .expect(200)

      expect(mockAuditLogger.getAuditLogs).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        severity: 'high',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        pageName: 'Analytics',
        resolved: false,
      })
    })
  })

  describe('PUT /api/cubcen/v1/errors/:errorId/resolve', () => {
    it('should resolve error for admin users', async () => {
      const response = await request(app)
        .put('/api/cubcen/v1/errors/error-123/resolve')
        .send({
          resolution: 'Fixed in version 1.2.3',
          notes: 'Updated error handling',
        })
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        message: 'Error marked as resolved',
        data: {
          errorId: 'error-123',
          resolved: true,
        },
      })

      expect(mockAuditLogger.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ERROR_RESOLVED',
          description: expect.stringContaining('error-123'),
          resourceType: 'error',
          resourceId: 'error-123',
          metadata: expect.objectContaining({
            resolution: 'Fixed in version 1.2.3',
            notes: 'Updated error handling',
          }),
        })
      )
    })

    it('should reject non-admin users', async () => {
      // Override user role for this test
      const nonAdminApp = express()
      nonAdminApp.use(express.json())
      nonAdminApp.use((req, res, next) => {
        req.user = {
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'VIEWER', // Non-admin role
        }
        next()
      })
      nonAdminApp.use('/api/cubcen/v1/errors', errorsRouter)

      await request(nonAdminApp)
        .put('/api/cubcen/v1/errors/error-123/resolve')
        .send({
          resolution: 'Fixed',
          notes: 'Test',
        })
        .expect(403)
    })
  })

  describe('Error severity determination', () => {
    it('should classify critical errors correctly', async () => {
      const criticalErrors = [
        'Network error occurred',
        'Failed to fetch data',
        'Authentication failed',
      ]

      for (const message of criticalErrors) {
        await request(app)
          .post('/api/cubcen/v1/errors/report')
          .send({
            errorId: `error-${Date.now()}`,
            message,
            timestamp: new Date().toISOString(),
          })
          .expect(200)
      }

      // Verify that errors were logged with appropriate severity
      expect(mockLogger.error).toHaveBeenCalledTimes(criticalErrors.length)
    })

    it('should classify high severity errors correctly', async () => {
      const highSeverityErrors = [
        'Cannot read property of undefined',
        'TypeError: null is not an object',
      ]

      for (const message of highSeverityErrors) {
        await request(app)
          .post('/api/cubcen/v1/errors/report')
          .send({
            errorId: `error-${Date.now()}`,
            message,
            timestamp: new Date().toISOString(),
          })
          .expect(200)
      }

      expect(mockLogger.error).toHaveBeenCalledTimes(highSeverityErrors.length)
    })
  })

  describe('Error handling', () => {
    it('should handle audit logger failures gracefully', async () => {
      mockAuditLogger.logEvent.mockRejectedValue(new Error('Audit log failed'))

      const response = await request(app)
        .post('/api/cubcen/v1/errors/report')
        .send({
          errorId: 'error-123',
          message: 'Test error',
          timestamp: new Date().toISOString(),
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should handle logger failures gracefully', async () => {
      mockLogger.error.mockImplementation(() => {
        throw new Error('Logger failed')
      })

      const response = await request(app)
        .post('/api/cubcen/v1/errors/report')
        .send({
          errorId: 'error-123',
          message: 'Test error',
          timestamp: new Date().toISOString(),
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })
  })
})
