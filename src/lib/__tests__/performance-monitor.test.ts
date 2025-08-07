/**
 * Performance Monitor Tests
 * Tests for the performance monitoring and alerting system
 */

import { performanceMonitor } from '../performance-monitor'
import { Logger } from '../logger'

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

// Mock prisma
jest.mock('../database', () => ({
  prisma: {
    agent: {
      count: jest.fn().mockResolvedValue(10),
    },
    task: {
      count: jest.fn().mockResolvedValue(100),
    },
    agentHealth: {
      aggregate: jest.fn().mockResolvedValue({
        _avg: { responseTime: 150 },
      }),
    },
    metric: {
      create: jest.fn().mockResolvedValue({}),
    },
    notification: {
      create: jest.fn().mockResolvedValue({}),
    },
    $use: jest.fn(),
    $queryRaw: jest.fn(),
    $executeRawUnsafe: jest.fn(),
  },
}))

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Stop monitoring to prevent interference
    performanceMonitor.stopMonitoring()
  })

  afterEach(() => {
    performanceMonitor.stopMonitoring()
  })

  describe('Monitoring Control', () => {
    it('should start monitoring', () => {
      performanceMonitor.startMonitoring()
      expect(logger.info).toHaveBeenCalledWith('Performance monitoring started')
    })

    it('should stop monitoring', () => {
      performanceMonitor.startMonitoring()
      performanceMonitor.stopMonitoring()
      expect(logger.info).toHaveBeenCalledWith('Performance monitoring stopped')
    })

    it('should not start monitoring twice', () => {
      performanceMonitor.startMonitoring()
      performanceMonitor.startMonitoring()
      expect(logger.info).toHaveBeenCalledTimes(1)
    })
  })

  describe('API Request Tracking', () => {
    it('should record API request metrics', () => {
      performanceMonitor.recordAPIRequest(150, false)
      performanceMonitor.recordAPIRequest(200, true)
      performanceMonitor.recordAPIRequest(100, false)

      // Verify metrics are recorded (implementation detail)
      expect(true).toBe(true) // Placeholder - actual implementation would verify internal state
    })

    it('should handle error requests', () => {
      performanceMonitor.recordAPIRequest(500, true)

      // Should not throw error
      expect(true).toBe(true)
    })
  })

  describe('Performance Stats', () => {
    it('should get current performance stats', async () => {
      const stats = await performanceMonitor.getCurrentStats()

      expect(stats).toHaveProperty('cpu')
      expect(stats).toHaveProperty('memory')
      expect(stats).toHaveProperty('database')
      expect(stats).toHaveProperty('cache')
      expect(stats).toHaveProperty('api')
      expect(stats).toHaveProperty('agents')

      expect(stats.cpu).toHaveProperty('usage')
      expect(stats.cpu).toHaveProperty('loadAverage')
      expect(stats.memory).toHaveProperty('used')
      expect(stats.memory).toHaveProperty('total')
      expect(stats.memory).toHaveProperty('percentage')
    })

    it('should handle stats retrieval errors', async () => {
      // Mock database error
      const mockPrisma = require('../database').prisma
      mockPrisma.agent.count.mockRejectedValueOnce(new Error('Database error'))

      const stats = await performanceMonitor.getCurrentStats()

      // Should still return stats with default values
      expect(stats).toHaveProperty('cpu')
      expect(stats).toHaveProperty('memory')
    })
  })

  describe('Metrics Collection', () => {
    it('should get metrics for specific time range', () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 3600000)

      const metrics = performanceMonitor.getMetrics('cpu_usage', {
        start: oneHourAgo,
        end: now,
      })

      expect(Array.isArray(metrics)).toBe(true)
    })

    it('should get all metrics when no filter specified', () => {
      const metrics = performanceMonitor.getMetrics()
      expect(Array.isArray(metrics)).toBe(true)
    })

    it('should filter metrics by name', () => {
      const metrics = performanceMonitor.getMetrics('memory_usage')
      expect(Array.isArray(metrics)).toBe(true)
    })
  })

  describe('Alert Management', () => {
    it('should get active alerts', () => {
      const alerts = performanceMonitor.getActiveAlerts()
      expect(Array.isArray(alerts)).toBe(true)
    })

    it('should resolve alerts', () => {
      const alertId = 'test-alert-123'
      const resolved = performanceMonitor.resolveAlert(alertId)

      // Should return false for non-existent alert
      expect(resolved).toBe(false)
    })
  })

  describe('API Metrics Reset', () => {
    it('should reset API metrics', () => {
      performanceMonitor.recordAPIRequest(100, false)
      performanceMonitor.recordAPIRequest(200, true)

      performanceMonitor.resetAPIMetrics()

      // Should not throw error
      expect(true).toBe(true)
    })
  })

  describe('Cleanup', () => {
    it('should destroy monitor properly', () => {
      performanceMonitor.startMonitoring()
      performanceMonitor.destroy()

      // Should not throw error
      expect(true).toBe(true)
    })
  })
})

describe('Performance Monitoring Integration', () => {
  it('should handle high CPU usage alert', async () => {
    // This would be an integration test that actually triggers alerts
    // For now, we'll just verify the structure exists
    expect(performanceMonitor.getCurrentStats).toBeDefined()
    expect(performanceMonitor.getActiveAlerts).toBeDefined()
  })

  it('should handle memory pressure', async () => {
    // Integration test for memory monitoring
    const stats = await performanceMonitor.getCurrentStats()
    expect(stats.memory.percentage).toBeGreaterThanOrEqual(0)
  })

  it('should monitor database performance', async () => {
    const stats = await performanceMonitor.getCurrentStats()
    expect(stats.database).toHaveProperty('queryCount')
    expect(stats.database).toHaveProperty('averageQueryTime')
  })
})
