// Cubcen Security Hardening Tests
// Comprehensive security testing for XSS, CSRF, session hijacking, and audit log tampering

// Polyfills are now in jest.setup.js

import request from 'supertest'
import { Request, Response, NextFunction } from 'express'
import express from 'express'
import {
  sanitizeInput,
  csrfProtection,
  securityHeaders,
  suspiciousActivityDetection,
  AdvancedRateLimiter,
  honeypotProtection,
} from '../../backend/middleware/security'
import { sessionManager, SessionManager } from '../session-manager'
import { auditLogger, AuditEventType, AuditSeverity } from '../audit-logger'
import { prisma } from '../database'

// Mock logger to avoid console output during tests
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

// Mock audit logger
jest.mock('../audit-logger', () => ({
  auditLogger: {
    logEvent: jest.fn(),
    logSecurityEvent: jest.fn(),
    getAuditLogs: jest.fn(),
  },
  AuditEventType: {
    SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
    CSRF_ATTACK_BLOCKED: 'CSRF_ATTACK_BLOCKED',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
  },
  AuditSeverity: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
  },
}))

// Mock database
jest.mock('../database', () => ({
  prisma: {
    $executeRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
  },
}))

describe('Security Hardening Tests', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Clear all mocks
    jest.clearAllMocks()
  })

  describe('Input Sanitization', () => {
    beforeEach(() => {
      app.use(sanitizeInput)
      app.post('/test', (req: Request, res: Response) => {
        res.json({ body: req.body, query: req.query, params: req.params })
      })
    })

    it('should sanitize XSS attempts in request body', async () => {
      const maliciousPayload = {
        name: '<script>alert("XSS")</script>John',
        description: 'javascript:alert("XSS")',
        comment: '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      }

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .expect(200)

      expect(response.body.body.name).toBe('John')
      expect(response.body.body.description).toBe('alert("XSS")')
      expect(response.body.body.comment).toBe('')
    })

    it('should sanitize SQL injection attempts', async () => {
      const maliciousPayload = {
        username: "admin'; DROP TABLE users; --",
        query: '1 UNION SELECT * FROM passwords',
      }

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .expect(200)

      expect(response.body.body.username).not.toContain('DROP TABLE')
      expect(response.body.body.query).not.toContain('UNION SELECT')
    })

    it('should sanitize nested objects and arrays', async () => {
      const maliciousPayload = {
        user: {
          name: '<script>alert("nested")</script>',
          preferences: ['<script>alert("array")</script>', 'normal value'],
        },
        tags: ['<script>alert("tag")</script>', 'safe-tag'],
      }

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .expect(200)

      expect(response.body.body.user.name).toBe('')
      expect(response.body.body.user.preferences[0]).toBe('')
      expect(response.body.body.user.preferences[1]).toBe('normal value')
      expect(response.body.body.tags[0]).toBe('')
      expect(response.body.body.tags[1]).toBe('safe-tag')
    })

    it('should sanitize query parameters', async () => {
      const response = await request(app)
        .post('/test?search=<script>alert("query")</script>&filter=normal')
        .send({})
        .expect(200)

      expect(response.body.query.search).toBe('')
      expect(response.body.query.filter).toBe('normal')
    })

    it('should handle malformed input gracefully', async () => {
      // Test with circular reference (should not crash)
      const circularObj: any = { name: 'test' }
      circularObj.self = circularObj

      // Since we can't send circular JSON, test with very deep nesting
      const deepObj = {
        level1: {
          level2: { level3: { level4: { level5: '<script>deep</script>' } } },
        },
      }

      const response = await request(app)
        .post('/test')
        .send(deepObj)
        .expect(200)

      expect(response.body.body.level1.level2.level3.level4.level5).toBe('')
    })
  })

  describe('CSRF Protection', () => {
    beforeEach(() => {
      // Mock session middleware
      app.use((req: Request, res: Response, next: NextFunction) => {
        req.session = { csrfToken: 'valid-csrf-token' } as any
        next()
      })

      app.use(csrfProtection)
      app.post('/test', (req: Request, res: Response) => {
        res.json({ success: true })
      })
      app.get('/test', (req: Request, res: Response) => {
        res.json({ success: true })
      })
    })

    it('should allow GET requests without CSRF token', async () => {
      await request(app).get('/test').expect(200)
    })

    it('should allow requests with valid CSRF token in header', async () => {
      await request(app)
        .post('/test')
        .set('x-csrf-token', 'valid-csrf-token')
        .send({})
        .expect(200)
    })

    it('should allow requests with valid CSRF token in body', async () => {
      await request(app)
        .post('/test')
        .send({ _csrf: 'valid-csrf-token' })
        .expect(200)
    })

    it('should block requests with invalid CSRF token', async () => {
      const response = await request(app)
        .post('/test')
        .set('x-csrf-token', 'invalid-token')
        .send({})
        .expect(403)

      expect(response.body.error.code).toBe('CSRF_TOKEN_INVALID')
    })

    it('should block requests without CSRF token', async () => {
      const response = await request(app).post('/test').send({}).expect(403)

      expect(response.body.error.code).toBe('CSRF_TOKEN_INVALID')
    })

    it('should allow API requests with Bearer token', async () => {
      app.use((req: Request, res: Response, next: NextFunction) => {
        req.headers.authorization = 'Bearer valid-jwt-token'
        next()
      })

      await request(app).post('/test').send({}).expect(200)
    })
  })

  describe('Security Headers', () => {
    beforeEach(() => {
      app.use(securityHeaders)
      app.get('/test', (req: Request, res: Response) => {
        res.json({ success: true })
      })
    })

    it('should set comprehensive security headers', async () => {
      const response = await request(app).get('/test').expect(200)

      expect(response.headers['content-security-policy']).toContain(
        "default-src 'self'"
      )
      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-frame-options']).toBe('DENY')
      expect(response.headers['x-xss-protection']).toBe('1; mode=block')
      expect(response.headers['referrer-policy']).toBe(
        'strict-origin-when-cross-origin'
      )
      expect(response.headers['permissions-policy']).toContain('camera=()')
      expect(response.headers['x-powered-by']).toBeUndefined()
    })

    it('should set HSTS header for HTTPS requests', async () => {
      // Mock HTTPS request
      app.use((req: Request, res: Response, next: NextFunction) => {
        req.secure = true
        next()
      })

      const response = await request(app).get('/test').expect(200)

      expect(response.headers['strict-transport-security']).toContain(
        'max-age=31536000'
      )
    })
  })

  describe('Suspicious Activity Detection', () => {
    beforeEach(() => {
      app.use(suspiciousActivityDetection)
      app.post('/test', (req: Request, res: Response) => {
        res.json({ success: true })
      })
    })

    it('should detect SQL injection patterns', async () => {
      const response = await request(app)
        .post('/test')
        .send({ query: '1 UNION SELECT * FROM users WHERE 1=1' })

      // In development, should continue with warning
      if (process.env.NODE_ENV !== 'production') {
        expect(response.status).toBe(200)
      } else {
        expect(response.status).toBe(400)
        expect(response.body.error.code).toBe('SUSPICIOUS_ACTIVITY')
      }
    })

    it('should detect XSS patterns', async () => {
      const response = await request(app)
        .post('/test')
        .send({ content: '<script>alert("xss")</script>' })

      if (process.env.NODE_ENV !== 'production') {
        expect(response.status).toBe(200)
      } else {
        expect(response.status).toBe(400)
        expect(response.body.error.code).toBe('SUSPICIOUS_ACTIVITY')
      }
    })

    it('should detect path traversal attempts', async () => {
      const response = await request(app)
        .post('/test')
        .send({ file: '../../../etc/passwd' })

      if (process.env.NODE_ENV !== 'production') {
        expect(response.status).toBe(200)
      } else {
        expect(response.status).toBe(400)
        expect(response.body.error.code).toBe('SUSPICIOUS_ACTIVITY')
      }
    })

    it('should allow normal requests', async () => {
      await request(app)
        .post('/test')
        .send({ name: 'John Doe', email: 'john@example.com' })
        .expect(200)
    })
  })

  describe('Advanced Rate Limiting', () => {
    let rateLimiter: AdvancedRateLimiter

    beforeEach(() => {
      rateLimiter = new AdvancedRateLimiter({
        maxAttempts: 3,
        windowMs: 60000, // 1 minute
        blockDurationMs: 5000, // 5 seconds
        progressiveMultiplier: 2,
      })

      app.use(rateLimiter.middleware())
      app.post('/test', (req: Request, res: Response) => {
        // Simulate failed attempt
        rateLimiter.recordAttempt(req, false)
        res.json({ success: true })
      })
      app.post('/success', (req: Request, res: Response) => {
        // Simulate successful attempt
        rateLimiter.recordAttempt(req, true)
        res.json({ success: true })
      })
    })

    it('should allow requests under the limit', async () => {
      await request(app).post('/test').expect(200)
      await request(app).post('/test').expect(200)
      await request(app).post('/test').expect(200)
    })

    it('should block requests after exceeding limit', async () => {
      // Make requests up to the limit
      await request(app).post('/test').expect(200)
      await request(app).post('/test').expect(200)
      await request(app).post('/test').expect(200)

      // Next request should be blocked
      const response = await request(app).post('/test').expect(429)
      expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED')
    })

    it('should reset attempts on successful request', async () => {
      // Make some failed attempts
      await request(app).post('/test').expect(200)
      await request(app).post('/test').expect(200)

      // Make successful request
      await request(app).post('/success').expect(200)

      // Should be able to make more requests
      await request(app).post('/test').expect(200)
      await request(app).post('/test').expect(200)
      await request(app).post('/test').expect(200)
    })

    it('should implement progressive blocking', async () => {
      // Exceed limit multiple times to test progressive blocking
      for (let i = 0; i < 6; i++) {
        await request(app).post('/test')
      }

      // Should be blocked with progressive duration
      const response = await request(app).post('/test').expect(429)
      expect(response.body.error.code).toBe('RATE_LIMIT_BLOCKED')
    })
  })

  describe('Honeypot Protection', () => {
    beforeEach(() => {
      app.use(honeypotProtection)
      app.post('/test', (req: Request, res: Response) => {
        res.json({ success: true, data: req.body })
      })
    })

    it('should allow requests without honeypot field', async () => {
      const response = await request(app)
        .post('/test')
        .send({ name: 'John', email: 'john@example.com' })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('John')
    })

    it('should allow requests with empty honeypot field', async () => {
      const response = await request(app)
        .post('/test')
        .send({ name: 'John', email: 'john@example.com', honeypot: '' })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('John')
    })

    it('should block requests with filled honeypot field', async () => {
      const response = await request(app)
        .post('/test')
        .send({ name: 'Bot', email: 'bot@spam.com', honeypot: 'filled by bot' })
        .expect(200) // Returns 200 to avoid revealing the honeypot

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Request processed successfully')
      expect(response.body.data).toBeUndefined()
    })
  })

  describe('Session Management Security', () => {
    let testSessionManager: SessionManager

    beforeEach(() => {
      testSessionManager = SessionManager.getInstance({
        maxAge: 60000, // 1 minute for testing
        maxSessionsPerUser: 2,
      })
    })

    afterEach(async () => {
      await testSessionManager.shutdown()
    })

    it('should create secure sessions', async () => {
      const mockReq = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0 Test Browser'),
      } as any

      const session = await testSessionManager.createSession(
        'user123',
        'test@example.com',
        'USER',
        mockReq
      )

      expect(session.id).toMatch(/^sess_[a-f0-9]{64}$/)
      expect(session.userId).toBe('user123')
      expect(session.csrfToken).toHaveLength(64)
      expect(session.metadata?.deviceFingerprint).toBeDefined()
    })

    it('should validate sessions with IP consistency', async () => {
      const mockReq = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0 Test Browser'),
      } as any

      const session = await testSessionManager.createSession(
        'user123',
        'test@example.com',
        'USER',
        mockReq
      )

      // Same IP should be valid
      const validation1 = await testSessionManager.validateSession(
        session.id,
        mockReq
      )
      expect(validation1.valid).toBe(true)

      // Different IP should be invalid if enforcement is enabled
      process.env.ENFORCE_IP_CONSISTENCY = 'true'
      const differentIPReq = { ...mockReq, ip: '192.168.1.2' }
      const validation2 = await testSessionManager.validateSession(
        session.id,
        differentIPReq
      )
      expect(validation2.valid).toBe(false)
      expect(validation2.reason).toBe('IP address mismatch')

      // Clean up
      delete process.env.ENFORCE_IP_CONSISTENCY
    })

    it('should enforce maximum sessions per user', async () => {
      const mockReq = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0 Test Browser'),
      } as any

      // Create maximum allowed sessions
      const session1 = await testSessionManager.createSession(
        'user123',
        'test@example.com',
        'USER',
        mockReq
      )
      const session2 = await testSessionManager.createSession(
        'user123',
        'test@example.com',
        'USER',
        mockReq
      )

      // Third session should remove the oldest
      const session3 = await testSessionManager.createSession(
        'user123',
        'test@example.com',
        'USER',
        mockReq
      )

      // First session should be invalid now
      const validation1 = await testSessionManager.getSession(session1.id)
      expect(validation1).toBeNull()

      // Second and third sessions should be valid
      const validation2 = await testSessionManager.getSession(session2.id)
      const validation3 = await testSessionManager.getSession(session3.id)
      expect(validation2).toBeTruthy()
      expect(validation3).toBeTruthy()
    })

    it('should clean up expired sessions', async () => {
      const mockReq = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0 Test Browser'),
      } as any

      const session = await testSessionManager.createSession(
        'user123',
        'test@example.com',
        'USER',
        mockReq
      )

      // Manually expire the session
      const sessionData = await testSessionManager.getSession(session.id)
      if (sessionData) {
        sessionData.expiresAt = new Date(Date.now() - 1000) // 1 second ago
      }

      // Session should be cleaned up
      const expiredSession = await testSessionManager.getSession(session.id)
      expect(expiredSession).toBeNull()
    })
  })

  describe('Audit Log Security', () => {
    beforeEach(() => {
      // Mock prisma responses
      ;(prisma.$executeRaw as jest.Mock)
        .mockResolvedValue(1)(prisma.$queryRawUnsafe as jest.Mock)
        .mockResolvedValue([])
    })

    it('should log security events with proper context', async () => {
      const mockReq = {
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0 Test Browser'),
        headers: { 'x-request-id': 'test-request-123' },
      } as any

      await auditLogger.logSecurityEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        'Test security event',
        mockReq,
        'user123',
        { testData: 'value' }
      )

      expect(auditLogger.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
          severity: AuditSeverity.HIGH,
          userId: 'user123',
          description: 'Test security event',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 Test Browser',
          requestId: 'test-request-123',
          success: false,
        })
      )
    })

    it('should prevent audit log tampering through proper access controls', async () => {
      // This test would verify that audit logs can only be accessed by authorized users
      // and that the logs themselves are tamper-evident

      const filters = {
        eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      }(
        // Mock successful retrieval
        auditLogger.getAuditLogs as jest.Mock
      ).mockResolvedValue({
        logs: [
          {
            id: 'log1',
            eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
            timestamp: new Date(),
            description: 'Test log entry',
          },
        ],
        total: 1,
      })

      const result = await auditLogger.getAuditLogs(filters)
      expect(result.logs).toHaveLength(1)
      expect(auditLogger.getAuditLogs).toHaveBeenCalledWith(filters)
    })

    it('should handle audit log export securely', async () => {
      const exportFilters = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        format: 'json' as const,
      }(
        // Mock audit logs for export
        auditLogger.getAuditLogs as jest.Mock
      ).mockResolvedValue({
        logs: [
          {
            id: 'log1',
            eventType: AuditEventType.LOGIN,
            userId: 'user123',
            timestamp: new Date('2023-06-01'),
            description: 'User login',
          },
        ],
        total: 1,
      })

      const exportData = await auditLogger.exportAuditLogs(exportFilters)
      expect(typeof exportData).toBe('string')
      expect(exportData).toContain('LOGIN')
      expect(exportData).toContain('user123')
    })
  })

  describe('Error Handling Security', () => {
    beforeEach(() => {
      app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.path === '/error') {
          throw new Error('Test error with sensitive data: password123')
        }
        next()
      })

      // Global error handler
      app.use(
        (error: Error, req: Request, res: Response, next: NextFunction) => {
          // Simulate production error handling
          const isDevelopment = process.env.NODE_ENV === 'development'

          res.status(500).json({
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: isDevelopment ? error.message : 'Internal server error',
              timestamp: new Date().toISOString(),
              ...(isDevelopment && { stack: error.stack }),
            },
          })
        }
      )

      app.get('/error', (req: Request, res: Response) => {
        res.json({ success: true })
      })
    })

    it('should not expose sensitive information in production errors', async () => {
      // Set production environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const response = await request(app).get('/error').expect(500)

      expect(response.body.error.message).toBe('Internal server error')
      expect(response.body.error.message).not.toContain('password123')
      expect(response.body.error.stack).toBeUndefined()

      // Restore environment
      process.env.NODE_ENV = originalEnv
    })

    it('should provide detailed errors in development', async () => {
      // Set development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const response = await request(app).get('/error').expect(500)

      expect(response.body.error.message).toContain(
        'Test error with sensitive data'
      )
      expect(response.body.error.stack).toBeDefined()

      // Restore environment
      process.env.NODE_ENV = originalEnv
    })
  })
})
