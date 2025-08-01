/**
 * Health API Routes Tests
 * Tests for health check endpoints and monitoring API
 */

import request from 'supertest'
import express from 'express'
import healthRoutes from '../routes/health'
import healthMonitoring from '../../lib/health'

// Mock the health monitoring service
jest.mock('../../lib/health')

const mockHealthMonitoring = healthMonitoring as jest.Mocked<
  typeof healthMonitoring
>

// Create test app
const app = express()
app.use(express.json())
app.use('/health', healthRoutes)

describe('Health API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /health', () => {
    it('should return healthy status when all checks pass', async () => {
      const mockHealthStatus = {
        status: 'healthy' as const,
        timestamp: new Date(),
        checks: [
          {
            name: 'database',
            status: 'healthy' as const,
            lastCheck: new Date(),
            responseTime: 50,
          },
          {
            name: 'memory',
            status: 'healthy' as const,
            lastCheck: new Date(),
          },
        ],
        metrics: {
          timestamp: new Date(),
          cpu: { usage: 25, loadAverage: [0.5, 0.7, 0.9] },
          memory: {
            used: 1024 * 1024 * 1024,
            free: 3 * 1024 * 1024 * 1024,
            total: 4 * 1024 * 1024 * 1024,
            heapUsed: 25 * 1024 * 1024,
            heapTotal: 50 * 1024 * 1024,
            external: 5 * 1024 * 1024,
          },
          disk: {
            free: 100 * 1024 * 1024 * 1024,
            total: 500 * 1024 * 1024 * 1024,
          },
          uptime: 3600,
        },
        version: '0.1.0',
      }

      mockHealthMonitoring.runAllHealthChecks.mockResolvedValue(
        mockHealthStatus
      )

      const response = await request(app).get('/health').expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: 'healthy',
          checks: expect.any(Array),
          metrics: expect.any(Object),
          version: '0.1.0',
        },
      })
    })

    it('should return degraded status with 200 when some checks are degraded', async () => {
      const mockHealthStatus = {
        status: 'degraded' as const,
        timestamp: new Date(),
        checks: [
          {
            name: 'database',
            status: 'healthy' as const,
            lastCheck: new Date(),
          },
          {
            name: 'memory',
            status: 'degraded' as const,
            lastCheck: new Date(),
            details: { warning: 'Memory usage is high' },
          },
        ],
        metrics: {
          timestamp: new Date(),
          cpu: { usage: 25, loadAverage: [0.5, 0.7, 0.9] },
          memory: {
            used: 1024,
            free: 2048,
            total: 3072,
            heapUsed: 512,
            heapTotal: 1024,
            external: 256,
          },
          disk: { free: 1000, total: 2000 },
          uptime: 3600,
        },
        version: '0.1.0',
      }

      mockHealthMonitoring.runAllHealthChecks.mockResolvedValue(
        mockHealthStatus
      )

      const response = await request(app).get('/health').expect(200)

      expect(response.body.data.status).toBe('degraded')
    })

    it('should return unhealthy status with 503 when checks fail', async () => {
      const mockHealthStatus = {
        status: 'unhealthy' as const,
        timestamp: new Date(),
        checks: [
          {
            name: 'database',
            status: 'unhealthy' as const,
            lastCheck: new Date(),
            error: 'Database connection failed',
          },
        ],
        metrics: {
          timestamp: new Date(),
          cpu: { usage: 25, loadAverage: [0.5, 0.7, 0.9] },
          memory: {
            used: 1024,
            free: 2048,
            total: 3072,
            heapUsed: 512,
            heapTotal: 1024,
            external: 256,
          },
          disk: { free: 1000, total: 2000 },
          uptime: 3600,
        },
        version: '0.1.0',
      }

      mockHealthMonitoring.runAllHealthChecks.mockResolvedValue(
        mockHealthStatus
      )

      const response = await request(app).get('/health').expect(503)

      expect(response.body.data.status).toBe('unhealthy')
    })

    it('should handle health check errors', async () => {
      mockHealthMonitoring.runAllHealthChecks.mockRejectedValue(
        new Error('Health check failed')
      )

      const response = await request(app).get('/health').expect(500)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: 'Failed to perform health check',
        },
      })
    })
  })

  describe('GET /health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app).get('/health/live').expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: 'alive',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          version: expect.any(String),
        },
      })
    })
  })

  describe('GET /health/ready', () => {
    it('should return ready status when critical checks pass', async () => {
      const mockDatabaseCheck = {
        name: 'database',
        status: 'healthy' as const,
        lastCheck: new Date(),
      }
      const mockMemoryCheck = {
        name: 'memory',
        status: 'healthy' as const,
        lastCheck: new Date(),
      }

      mockHealthMonitoring.checkDatabase.mockResolvedValue(mockDatabaseCheck)
      mockHealthMonitoring.checkMemory.mockResolvedValue(mockMemoryCheck)

      const response = await request(app).get('/health/ready').expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: 'ready',
          checks: {
            database: 'healthy',
            memory: 'healthy',
          },
        },
      })
    })

    it('should return not ready status when critical checks fail', async () => {
      const mockDatabaseCheck = {
        name: 'database',
        status: 'unhealthy' as const,
        lastCheck: new Date(),
        error: 'Database connection failed',
      }
      const mockMemoryCheck = {
        name: 'memory',
        status: 'healthy' as const,
        lastCheck: new Date(),
      }

      mockHealthMonitoring.checkDatabase.mockResolvedValue(mockDatabaseCheck)
      mockHealthMonitoring.checkMemory.mockResolvedValue(mockMemoryCheck)

      const response = await request(app).get('/health/ready').expect(503)

      expect(response.body.data.status).toBe('not_ready')
    })

    it('should handle readiness check errors', async () => {
      mockHealthMonitoring.checkDatabase.mockRejectedValue(
        new Error('Database check failed')
      )

      const response = await request(app).get('/health/ready').expect(503)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'READINESS_CHECK_FAILED',
          message: 'Application is not ready',
        },
      })
    })
  })

  describe('GET /health/checks/:name', () => {
    it('should return specific database health check', async () => {
      const mockCheck = {
        name: 'database',
        status: 'healthy' as const,
        lastCheck: new Date(),
        responseTime: 45,
        details: { connectionStatus: 'connected' },
      }

      mockHealthMonitoring.checkDatabase.mockResolvedValue(mockCheck)

      const response = await request(app)
        .get('/health/checks/database')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          name: 'database',
          status: 'healthy',
          responseTime: 45,
        },
      })
    })

    it('should return specific memory health check', async () => {
      const mockCheck = {
        name: 'memory',
        status: 'degraded' as const,
        lastCheck: new Date(),
        details: { warning: 'Memory usage is high' },
      }

      mockHealthMonitoring.checkMemory.mockResolvedValue(mockCheck)

      const response = await request(app)
        .get('/health/checks/memory')
        .expect(200)

      expect(response.body.data.status).toBe('degraded')
    })

    it('should return 404 for unknown health check', async () => {
      const response = await request(app)
        .get('/health/checks/unknown')
        .expect(404)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'HEALTH_CHECK_NOT_FOUND',
          message: "Health check 'unknown' not found",
          availableChecks: ['database', 'memory', 'disk', 'application'],
        },
      })
    })

    it('should handle health check errors', async () => {
      mockHealthMonitoring.checkDatabase.mockRejectedValue(
        new Error('Database check failed')
      )

      const response = await request(app)
        .get('/health/checks/database')
        .expect(500)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: "Failed to perform health check 'database'",
        },
      })
    })
  })

  describe('GET /health/metrics', () => {
    it('should return current system metrics', async () => {
      const mockMetrics = {
        timestamp: new Date(),
        cpu: { usage: 25, loadAverage: [0.5, 0.7, 0.9] },
        memory: {
          used: 1024 * 1024 * 1024,
          free: 3 * 1024 * 1024 * 1024,
          total: 4 * 1024 * 1024 * 1024,
          heapUsed: 25 * 1024 * 1024,
          heapTotal: 50 * 1024 * 1024,
          external: 5 * 1024 * 1024,
        },
        disk: {
          free: 100 * 1024 * 1024 * 1024,
          total: 500 * 1024 * 1024 * 1024,
        },
        uptime: 3600,
      }

      mockHealthMonitoring.collectSystemMetrics.mockResolvedValue(mockMetrics)

      const response = await request(app).get('/health/metrics').expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          timestamp: expect.any(String),
          cpu: expect.any(Object),
          memory: expect.any(Object),
          disk: expect.any(Object),
          uptime: 3600,
        },
      })
    })

    it('should handle metrics collection errors', async () => {
      mockHealthMonitoring.collectSystemMetrics.mockRejectedValue(
        new Error('Metrics collection failed')
      )

      const response = await request(app).get('/health/metrics').expect(500)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'METRICS_COLLECTION_FAILED',
          message: 'Failed to collect system metrics',
        },
      })
    })
  })

  describe('GET /health/metrics/history', () => {
    it('should return metrics history', async () => {
      const mockHistory = [
        {
          timestamp: new Date(),
          cpu: { usage: 25, loadAverage: [0.5, 0.7, 0.9] },
          memory: {
            used: 1024,
            free: 2048,
            total: 3072,
            heapUsed: 512,
            heapTotal: 1024,
            external: 256,
          },
          disk: { free: 1000, total: 2000 },
          uptime: 3600,
        },
        {
          timestamp: new Date(),
          cpu: { usage: 30, loadAverage: [0.6, 0.8, 1.0] },
          memory: {
            used: 1200,
            free: 1872,
            total: 3072,
            heapUsed: 600,
            heapTotal: 1024,
            external: 300,
          },
          disk: { free: 950, total: 2000 },
          uptime: 3660,
        },
      ]

      mockHealthMonitoring.getMetricsHistory.mockReturnValue(mockHistory)

      const response = await request(app)
        .get('/health/metrics/history')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          metrics: expect.any(Array),
          count: 2,
          limit: 'none',
        },
      })

      expect(response.body.data.metrics).toHaveLength(2)
    })

    it('should return limited metrics history when limit is specified', async () => {
      const mockHistory = [
        {
          timestamp: new Date(),
          cpu: { usage: 25, loadAverage: [0.5, 0.7, 0.9] },
          memory: {
            used: 1024,
            free: 2048,
            total: 3072,
            heapUsed: 512,
            heapTotal: 1024,
            external: 256,
          },
          disk: { free: 1000, total: 2000 },
          uptime: 3600,
        },
      ]

      mockHealthMonitoring.getMetricsHistory.mockReturnValue(mockHistory)

      const response = await request(app)
        .get('/health/metrics/history?limit=1')
        .expect(200)

      expect(response.body.data.limit).toBe(1)
      expect(mockHealthMonitoring.getMetricsHistory).toHaveBeenCalledWith(1)
    })

    it('should handle metrics history errors', async () => {
      mockHealthMonitoring.getMetricsHistory.mockImplementation(() => {
        throw new Error('History retrieval failed')
      })

      const response = await request(app)
        .get('/health/metrics/history')
        .expect(500)

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'METRICS_HISTORY_FAILED',
          message: 'Failed to retrieve metrics history',
        },
      })
    })
  })
})
