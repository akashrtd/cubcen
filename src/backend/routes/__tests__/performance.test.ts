/**
 * Performance API Routes Tests
 * Tests for performance monitoring and optimization endpoints
 */

import request from 'supertest'
import express from 'express'
import performanceRoutes from '../performance'
import { performanceMonitor } from '@/lib/performance-monitor'
import { dbPerformanceMonitor } from '@/lib/database-performance'
import { cache } from '@/lib/cache'

// Mock dependencies
jest.mock('@/lib/performance-monitor', () => ({
  performanceMonitor: {
    getCurrentStats: jest.fn(),
    getMetrics: jest.fn(),
    getActiveAlerts: jest.fn(),
    resolveAlert: jest.fn(),
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
    recordAPIRequest: jest.fn(),
  },
}))

jest.mock('@/lib/database-performance', () => ({
  dbPerformanceMonitor: {
    getPerformanceStats: jest.fn(),
  },
  DatabaseOptimizer: {
    createOptimalIndexes: jest.fn(),
    analyzePerformance: jest.fn(),
  },
}))

jest.mock('@/lib/cache', () => ({
  cache: {
    getStats: jest.fn(),
    clear: jest.fn(),
  },
}))

jest.mock('@/lib/benchmark', () => ({
  Benchmark: {
    benchmarkDatabase: jest.fn(),
    benchmarkCache: jest.fn(),
    benchmarkAPI: jest.fn(),
  },
  LoadTester: {
    testDatabase: jest.fn(),
    testCache: jest.fn(),
    testMemory: jest.fn(),
  },
  PerformanceTestSuite: {
    runAll: jest.fn(),
  },
}))
jest.mock('@/backend/middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 'user-123', role: 'ADMIN', email: 'admin@test.com' }
    next()
  },
}))

const app = express()
app.use(express.json())
app.use('/api/performance', performanceRoutes)

describe('Performance API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/performance/metrics', () => {
    it('should return current performance metrics', async () => {
      const mockStats = {
        cpu: { usage: 45.2, loadAverage: [1.2, 1.1, 1.0] },
        memory: { used: 512000000, total: 1024000000, percentage: 50 },
        database: { queryCount: 100, averageQueryTime: 25 },
        cache: { hitRate: 85.5, memoryUsage: 50000000 },
        api: { requestCount: 500, averageResponseTime: 150 },
        agents: { totalCount: 10, activeCount: 8 },
      }

      ;(performanceMonitor.getCurrentStats as jest.Mock).mockResolvedValue(
        mockStats
      )

      const response = await request(app)
        .get('/api/performance/metrics')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockStats)
      expect(response.body.timestamp).toBeDefined()
    })

    it('should handle errors when getting metrics', async () => {
      ;(performanceMonitor.getCurrentStats as jest.Mock).mockRejectedValue(
        new Error('Metrics error')
      )

      const response = await request(app)
        .get('/api/performance/metrics')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Failed to retrieve performance metrics')
    })
  })

  describe('GET /api/performance/metrics/history', () => {
    it('should return historical metrics', async () => {
      const mockMetrics = [
        { name: 'cpu_usage', value: 45.2, timestamp: new Date(), unit: '%' },
        { name: 'cpu_usage', value: 47.1, timestamp: new Date(), unit: '%' },
      ]

      ;(performanceMonitor.getMetrics as jest.Mock).mockReturnValue(mockMetrics)

      const response = await request(app)
        .get('/api/performance/metrics/history')
        .query({ metric: 'cpu_usage', limit: 100 })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockMetrics)
      expect(response.body.meta.total).toBe(2)
      expect(response.body.meta.returned).toBe(2)
    })

    it('should filter metrics by time range', async () => {
      const startDate = '2023-01-01T00:00:00.000Z'
      const endDate = '2023-01-02T00:00:00.000Z'

      ;(performanceMonitor.getMetrics as jest.Mock).mockReturnValue([])

      await request(app)
        .get('/api/performance/metrics/history')
        .query({ startDate, endDate })
        .expect(200)

      expect(performanceMonitor.getMetrics).toHaveBeenCalledWith(undefined, {
        start: new Date(startDate),
        end: new Date(endDate),
      })
    })

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/performance/metrics/history')
        .query({ limit: 'invalid' })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/performance/alerts', () => {
    it('should return active alerts', async () => {
      const mockAlerts = [
        {
          id: 'alert-1',
          metric: 'cpu_usage',
          threshold: 80,
          currentValue: 85.2,
          severity: 'warning',
          message: 'CPU usage is high',
          timestamp: new Date(),
          resolved: false,
        },
      ]

      ;(performanceMonitor.getActiveAlerts as jest.Mock).mockReturnValue(
        mockAlerts
      )

      const response = await request(app)
        .get('/api/performance/alerts')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockAlerts)
      expect(response.body.count).toBe(1)
    })
  })

  describe('POST /api/performance/alerts/:alertId/resolve', () => {
    it('should resolve an alert', async () => {
      ;(performanceMonitor.resolveAlert as jest.Mock).mockReturnValue(true)

      const response = await request(app)
        .post('/api/performance/alerts/alert-123/resolve')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Alert resolved successfully')
      expect(performanceMonitor.resolveAlert).toHaveBeenCalledWith('alert-123')
    })

    it('should return 404 for non-existent alert', async () => {
      ;(performanceMonitor.resolveAlert as jest.Mock).mockReturnValue(false)

      const response = await request(app)
        .post('/api/performance/alerts/non-existent/resolve')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Alert not found')
    })
  })

  describe('GET /api/performance/database', () => {
    it('should return database performance stats', async () => {
      const mockStats = {
        totalQueries: 1000,
        averageQueryTime: 25.5,
        slowQueries: [],
        connectionPoolStats: { active: 2, idle: 3, total: 5 },
      }

      ;(
        dbPerformanceMonitor.getPerformanceStats as jest.Mock
      ).mockResolvedValue(mockStats)

      const response = await request(app)
        .get('/api/performance/database')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockStats)
    })
  })

  describe('POST /api/performance/database/optimize', () => {
    it('should optimize database (admin only)', async () => {
      const mockAnalysis = {
        tableStats: [],
        indexRecommendations: [],
        queryOptimizations: [],
      }

      const { DatabaseOptimizer } = require('@/lib/database-performance')
      DatabaseOptimizer.createOptimalIndexes = jest
        .fn()
        .mockResolvedValue(undefined)
      DatabaseOptimizer.analyzePerformance = jest
        .fn()
        .mockResolvedValue(mockAnalysis)

      const response = await request(app)
        .post('/api/performance/database/optimize')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Database optimization completed')
      expect(response.body.data).toEqual(mockAnalysis)
    })

    it('should require admin role', async () => {
      // Mock non-admin user
      const appWithUser = express()
      appWithUser.use(express.json())
      appWithUser.use((req: any, res: any, next: any) => {
        req.user = { id: 'user-123', role: 'VIEWER', email: 'user@test.com' }
        next()
      })
      appWithUser.use('/api/performance', performanceRoutes)

      const response = await request(appWithUser)
        .post('/api/performance/database/optimize')
        .expect(403)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe(
        'Admin role required for database optimization'
      )
    })
  })

  describe('GET /api/performance/cache', () => {
    it('should return cache statistics', async () => {
      const mockStats = {
        totalEntries: 150,
        totalHits: 1200,
        totalMisses: 300,
        hitRate: 80.0,
        memoryUsage: 50000000,
        topKeys: [{ key: 'popular-key', hits: 100 }],
      }

      ;(cache.getStats as jest.Mock).mockReturnValue(mockStats)

      const response = await request(app)
        .get('/api/performance/cache')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockStats)
    })
  })

  describe('POST /api/performance/cache/clear', () => {
    it('should clear cache (admin only)', async () => {
      ;(cache.clear as jest.Mock).mockReturnValue(undefined)

      const response = await request(app)
        .post('/api/performance/cache/clear')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Cache cleared successfully')
      expect(cache.clear).toHaveBeenCalled()
    })
  })

  describe('POST /api/performance/benchmark', () => {
    it('should run database benchmark', async () => {
      const mockResults = [
        {
          name: 'Database: Simple Select',
          duration: 1000,
          operations: 100,
          opsPerSecond: 100,
          averageTime: 10,
        },
      ]

      const { Benchmark } = require('@/lib/benchmark')
      Benchmark.benchmarkDatabase = jest.fn().mockResolvedValue(mockResults)

      const response = await request(app)
        .post('/api/performance/benchmark')
        .send({ name: 'database', iterations: 100 })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockResults)
    })

    it('should validate benchmark name', async () => {
      const response = await request(app)
        .post('/api/performance/benchmark')
        .send({ name: 'invalid-benchmark' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid benchmark name')
    })

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/performance/benchmark')
        .send({ iterations: 'invalid' })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/performance/load-test', () => {
    it('should run load test', async () => {
      const mockResult = {
        config: { name: 'database', duration: 30000, concurrency: 10 },
        totalOperations: 1000,
        successfulOperations: 950,
        failedOperations: 50,
        averageResponseTime: 25.5,
        operationsPerSecond: 33.3,
        errorRate: 5.0,
      }

      const { LoadTester } = require('@/lib/benchmark')
      LoadTester.testDatabase = jest.fn().mockResolvedValue(mockResult)

      const response = await request(app)
        .post('/api/performance/load-test')
        .send({
          name: 'database',
          duration: 30000,
          concurrency: 10,
          rampUpTime: 5000,
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockResult)
    })

    it('should validate load test parameters', async () => {
      const response = await request(app)
        .post('/api/performance/load-test')
        .send({
          name: 'database',
          duration: 500, // Too short
          concurrency: 10,
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/performance/test-suite', () => {
    it('should run comprehensive test suite', async () => {
      const mockResult = {
        benchmarks: [],
        loadTests: [],
        summary: {
          totalTests: 6,
          totalDuration: 120000,
          criticalIssues: [],
          recommendations: ['Performance looks good!'],
        },
      }

      const { PerformanceTestSuite } = require('@/lib/benchmark')
      PerformanceTestSuite.runAll = jest.fn().mockResolvedValue(mockResult)

      const response = await request(app)
        .post('/api/performance/test-suite')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockResult)
    })
  })

  describe('Monitoring Control', () => {
    it('should start performance monitoring', async () => {
      ;(performanceMonitor.startMonitoring as jest.Mock).mockReturnValue(
        undefined
      )

      const response = await request(app)
        .post('/api/performance/monitoring/start')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Performance monitoring started')
      expect(performanceMonitor.startMonitoring).toHaveBeenCalled()
    })

    it('should stop performance monitoring', async () => {
      ;(performanceMonitor.stopMonitoring as jest.Mock).mockReturnValue(
        undefined
      )

      const response = await request(app)
        .post('/api/performance/monitoring/stop')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Performance monitoring stopped')
      expect(performanceMonitor.stopMonitoring).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle performance monitor errors', async () => {
      ;(performanceMonitor.getCurrentStats as jest.Mock).mockRejectedValue(
        new Error('Monitor error')
      )

      const response = await request(app)
        .get('/api/performance/metrics')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Failed to retrieve performance metrics')
    })

    it('should handle database optimization errors', async () => {
      const { DatabaseOptimizer } = require('@/lib/database-performance')
      DatabaseOptimizer.createOptimalIndexes = jest
        .fn()
        .mockRejectedValue(new Error('Optimization error'))

      const response = await request(app)
        .post('/api/performance/database/optimize')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Failed to optimize database')
    })

    it('should handle benchmark errors', async () => {
      const { Benchmark } = require('@/lib/benchmark')
      Benchmark.benchmarkDatabase = jest
        .fn()
        .mockRejectedValue(new Error('Benchmark error'))

      const response = await request(app)
        .post('/api/performance/benchmark')
        .send({ name: 'database' })
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Failed to run benchmark')
    })
  })
})

describe('Performance API Authorization', () => {
  const createAppWithRole = (role: string) => {
    const app = express()
    app.use(express.json())
    app.use((req: any, res: any, next: any) => {
      req.user = { id: 'user-123', role, email: 'user@test.com' }
      next()
    })
    app.use('/api/performance', performanceRoutes)
    return app
  }

  it('should allow ADMIN to access all endpoints', async () => {
    const app = createAppWithRole('ADMIN')

    await request(app).get('/api/performance/metrics').expect(200)
    await request(app).post('/api/performance/cache/clear').expect(200)
    await request(app).post('/api/performance/database/optimize').expect(200)
  })

  it('should restrict non-admin access to sensitive operations', async () => {
    const app = createAppWithRole('OPERATOR')

    await request(app).get('/api/performance/metrics').expect(200)
    await request(app).post('/api/performance/cache/clear').expect(403)
    await request(app).post('/api/performance/database/optimize').expect(403)
  })
})
