/**
 * Health Monitoring Service Tests
 * Comprehensive tests for health checks and system metrics
 */

import healthMonitoring from '../health'
import { prisma as database } from '../database'

// Mock the database
jest.mock('../database', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
  },
}))

// Mock fs/promises for disk space checks
jest.mock('fs/promises', () => ({
  statfs: jest.fn(),
}))

// Mock os module
jest.mock('os', () => ({
  freemem: jest.fn(() => 1024 * 1024 * 1024), // 1GB
  totalmem: jest.fn(() => 4 * 1024 * 1024 * 1024), // 4GB
  loadavg: jest.fn(() => [0.5, 0.7, 0.9]),
  cpus: jest.fn(() => Array(4).fill({})), // 4 CPUs
}))

const mockDatabase = database as jest.Mocked<typeof database>
const mockFs = jest.requireMock('fs/promises')
const mockOs = jest.requireMock('os')

describe('Health Monitoring Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset process.memoryUsage mock
    jest.spyOn(process, 'memoryUsage').mockReturnValue({
      rss: 100 * 1024 * 1024,
      heapTotal: 50 * 1024 * 1024,
      heapUsed: 25 * 1024 * 1024,
      external: 5 * 1024 * 1024,
      arrayBuffers: 2 * 1024 * 1024,
    })

    // Reset mocks to default values
    mockFs.statfs.mockResolvedValue({
      bavail: 1000000,
      bsize: 4096,
      blocks: 2000000,
    })

    mockOs.loadavg.mockReturnValue([0.5, 0.7, 0.9])
    mockOs.cpus.mockReturnValue(Array(4).fill({}))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Database Health Check', () => {
    it('should return healthy status when database is accessible', async () => {
      mockDatabase.user.findFirst.mockResolvedValue({ id: 'test-id' })

      const result = await healthMonitoring.checkDatabase()

      expect(result.name).toBe('database')
      expect(result.status).toBe('healthy')
      expect(result.lastCheck).toBeInstanceOf(Date)
      expect(result.responseTime).toBeDefined()
      expect(result.details?.connectionStatus).toBe('connected')
    })

    it('should return degraded status when database is slow', async () => {
      mockDatabase.user.findFirst.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ id: 'test-id' }), 1500)
          )
      )

      const result = await healthMonitoring.checkDatabase()

      expect(result.status).toBe('degraded')
      expect(result.details?.warning).toContain('slow')
    })

    it('should return unhealthy status when database fails', async () => {
      const error = new Error('Database connection failed')
      mockDatabase.user.findFirst.mockRejectedValue(error)

      const result = await healthMonitoring.checkDatabase()

      expect(result.status).toBe('unhealthy')
      expect(result.error).toBe('Database connection failed')
      expect(result.details?.connectionStatus).toBe('failed')
    })
  })

  describe('Memory Health Check', () => {
    it('should return healthy status with normal memory usage', async () => {
      const result = await healthMonitoring.checkMemory()

      expect(result.name).toBe('memory')
      expect(result.status).toBe('healthy')
      expect(result.details?.heap).toBeDefined()
      expect(result.details?.system).toBeDefined()
    })

    it('should return degraded status with high memory usage', async () => {
      // Mock high heap usage (80%)
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 100 * 1024 * 1024,
        heapTotal: 50 * 1024 * 1024,
        heapUsed: 40 * 1024 * 1024, // 80% usage
        external: 5 * 1024 * 1024,
        arrayBuffers: 2 * 1024 * 1024,
      })

      const result = await healthMonitoring.checkMemory()

      expect(result.status).toBe('degraded')
      expect(result.details?.warning).toContain('high')
    })

    it('should return unhealthy status with critical memory usage', async () => {
      // Mock critical heap usage (95%)
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 100 * 1024 * 1024,
        heapTotal: 50 * 1024 * 1024,
        heapUsed: 47.5 * 1024 * 1024, // 95% usage
        external: 5 * 1024 * 1024,
        arrayBuffers: 2 * 1024 * 1024,
      })

      const result = await healthMonitoring.checkMemory()

      expect(result.status).toBe('unhealthy')
      expect(result.error).toContain('critically high')
    })
  })

  describe('Disk Space Health Check', () => {
    it('should return healthy status with sufficient disk space', async () => {
      mockFs.statfs.mockResolvedValue({
        bavail: 1000000, // Available blocks
        bsize: 4096, // Block size
        blocks: 2000000, // Total blocks
      })

      const result = await healthMonitoring.checkDiskSpace()

      expect(result.name).toBe('disk')
      expect(result.status).toBe('healthy')
      expect(result.details?.free).toBeDefined()
      expect(result.details?.total).toBeDefined()
    })

    it('should return degraded status with low disk space', async () => {
      mockFs.statfs.mockResolvedValue({
        bavail: 200000, // 10% free (90% used)
        bsize: 4096,
        blocks: 2000000,
      })

      const result = await healthMonitoring.checkDiskSpace()

      expect(result.status).toBe('degraded')
      expect(result.details?.warning).toContain('running low')
    })

    it('should return unhealthy status with critical disk space', async () => {
      mockFs.statfs.mockResolvedValue({
        bavail: 50000, // 2.5% free (97.5% used)
        bsize: 4096,
        blocks: 2000000,
      })

      const result = await healthMonitoring.checkDiskSpace()

      expect(result.status).toBe('unhealthy')
      expect(result.error).toContain('critically low')
    })

    it('should handle disk check errors gracefully', async () => {
      mockFs.statfs.mockRejectedValue(new Error('Disk check failed'))

      const result = await healthMonitoring.checkDiskSpace()

      expect(result.status).toBe('unhealthy')
      expect(result.error).toBe('Disk check failed')
    })
  })

  describe('Application Health Check', () => {
    it('should return healthy status with normal load', async () => {
      jest.spyOn(process, 'uptime').mockReturnValue(3600) // 1 hour

      const result = await healthMonitoring.checkApplication()

      expect(result.name).toBe('application')
      expect(result.status).toBe('healthy')
      expect(result.details?.uptime).toBe(3600)
      expect(result.details?.uptimeFormatted).toBe('1h')
      expect(result.details?.loadAverage).toEqual([0.5, 0.7, 0.9])
    })

    it('should return degraded status with high load', async () => {
      mockOs.loadavg.mockReturnValue([5, 4.5, 4]) // High load for 4 CPUs

      const result = await healthMonitoring.checkApplication()

      expect(result.status).toBe('degraded')
      expect(result.details?.warning).toContain('high')
    })

    it('should return unhealthy status with critical load', async () => {
      mockOs.loadavg.mockReturnValue([10, 9, 8]) // Critical load for 4 CPUs

      const result = await healthMonitoring.checkApplication()

      expect(result.status).toBe('unhealthy')
      expect(result.error).toContain('critically high')
    })
  })

  describe('System Metrics Collection', () => {
    it('should collect comprehensive system metrics', async () => {
      jest.spyOn(process, 'uptime').mockReturnValue(7200) // 2 hours

      const metrics = await healthMonitoring.collectSystemMetrics()

      expect(metrics).toMatchObject({
        timestamp: expect.any(Date),
        cpu: {
          usage: expect.any(Number),
          loadAverage: expect.any(Array),
        },
        memory: {
          used: expect.any(Number),
          free: expect.any(Number),
          total: expect.any(Number),
          heapUsed: expect.any(Number),
          heapTotal: expect.any(Number),
          external: expect.any(Number),
        },
        disk: {
          free: expect.any(Number),
          total: expect.any(Number),
        },
        uptime: 7200,
      })
    })

    it('should handle metrics collection errors', async () => {
      mockFs.statfs.mockRejectedValue(new Error('Disk stats failed'))

      const metrics = await healthMonitoring.collectSystemMetrics()

      // Should still return metrics with disk stats as 0
      expect(metrics.disk.free).toBe(0)
      expect(metrics.disk.total).toBe(0)
      expect(metrics.memory).toBeDefined()
      expect(metrics.cpu).toBeDefined()
    })
  })

  describe('Overall Health Status', () => {
    it('should return healthy status when all checks pass', async () => {
      mockDatabase.user.findFirst.mockResolvedValue({ id: 'test-id' })
      mockFs.statfs.mockResolvedValue({
        bavail: 1000000,
        bsize: 4096,
        blocks: 2000000,
      })

      const healthStatus = await healthMonitoring.runAllHealthChecks()

      expect(healthStatus.status).toBe('healthy')
      expect(healthStatus.checks).toHaveLength(4)
      expect(healthStatus.metrics).toBeDefined()
      expect(healthStatus.version).toBeDefined()
    })

    it('should return degraded status when some checks are degraded', async () => {
      mockDatabase.user.findFirst.mockResolvedValue({ id: 'test-id' })
      mockFs.statfs.mockResolvedValue({
        bavail: 200000, // Low disk space
        bsize: 4096,
        blocks: 2000000,
      })

      const healthStatus = await healthMonitoring.runAllHealthChecks()

      expect(healthStatus.status).toBe('degraded')
      expect(
        healthStatus.checks.some(check => check.status === 'degraded')
      ).toBe(true)
    })

    it('should return unhealthy status when any check fails', async () => {
      mockDatabase.user.findFirst.mockRejectedValue(new Error('DB failed'))

      const healthStatus = await healthMonitoring.runAllHealthChecks()

      expect(healthStatus.status).toBe('unhealthy')
      expect(
        healthStatus.checks.some(check => check.status === 'unhealthy')
      ).toBe(true)
    })
  })

  describe('Metrics History', () => {
    it('should store and retrieve metrics history', async () => {
      // Clear any existing history first
      healthMonitoring.clearMetricsHistory()

      // Collect some metrics
      await healthMonitoring.collectSystemMetrics()
      await healthMonitoring.collectSystemMetrics()

      const history = healthMonitoring.getMetricsHistory()

      expect(history).toHaveLength(2)
      expect(history[0]).toMatchObject({
        timestamp: expect.any(Date),
        cpu: expect.any(Object),
        memory: expect.any(Object),
      })
    })

    it('should limit metrics history size', async () => {
      // Clear existing history
      healthMonitoring.clearMetricsHistory()

      // Collect more than max history size (100)
      for (let i = 0; i < 105; i++) {
        await healthMonitoring.collectSystemMetrics()
      }

      const history = healthMonitoring.getMetricsHistory()

      expect(history.length).toBeLessThanOrEqual(100)
    }, 15000) // Increase timeout for this test

    it('should return limited history when requested', async () => {
      // Clear existing history
      healthMonitoring.clearMetricsHistory()

      // Collect some metrics
      for (let i = 0; i < 10; i++) {
        await healthMonitoring.collectSystemMetrics()
      }

      const history = healthMonitoring.getMetricsHistory(5)

      expect(history).toHaveLength(5)
    })
  })

  describe('Individual Health Check Retrieval', () => {
    it('should retrieve specific health check after running', async () => {
      mockDatabase.user.findFirst.mockResolvedValue({ id: 'test-id' })
      await healthMonitoring.checkDatabase()

      const check = healthMonitoring.getHealthCheck('database')

      expect(check).toBeDefined()
      expect(check?.name).toBe('database')
      expect(check?.status).toBe('healthy')
    })

    it('should return undefined for non-existent health check', () => {
      const check = healthMonitoring.getHealthCheck('nonexistent')

      expect(check).toBeUndefined()
    })
  })
})
