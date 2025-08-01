/**
 * Tests for Cubcen Error Service
 */

import { ErrorService } from '../error'
import { prisma } from '@/lib/database'
import { logger } from '@/lib/logger'

// Mock dependencies
jest.mock('@/lib/database', () => ({
  prisma: {
    systemLog: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
      findFirst: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockLogger = logger as jest.Mocked<typeof logger>

describe('ErrorService', () => {
  let errorService: ErrorService

  beforeEach(() => {
    errorService = new ErrorService()
    jest.clearAllMocks()
  })

  describe('getErrorLogs', () => {
    it('should fetch error logs with default pagination', async () => {
      const mockLogs = [
        {
          id: 'log1',
          level: 'ERROR',
          message: 'Test error',
          context: '{"agentId": "agent1"}',
          source: 'test-service',
          timestamp: new Date(),
        },
      ]

      mockPrisma.systemLog.count.mockResolvedValue(1)
      mockPrisma.systemLog.findMany.mockResolvedValue(mockLogs)

      const result = await errorService.getErrorLogs()

      expect(result).toEqual({
        logs: expect.arrayContaining([
          expect.objectContaining({
            id: 'log1',
            level: 'ERROR',
            message: 'Test error',
            source: 'test-service',
            agentId: 'agent1',
          }),
        ]),
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      })

      expect(mockPrisma.systemLog.count).toHaveBeenCalledWith({ where: {} })
      expect(mockPrisma.systemLog.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { timestamp: 'desc' },
        skip: 0,
        take: 50,
      })
    })

    it('should apply filters correctly', async () => {
      const filter = {
        level: 'ERROR' as const,
        source: 'test-service',
        search: 'connection',
      }

      mockPrisma.systemLog.count.mockResolvedValue(0)
      mockPrisma.systemLog.findMany.mockResolvedValue([])

      await errorService.getErrorLogs({ filter })

      expect(mockPrisma.systemLog.count).toHaveBeenCalledWith({
        where: {
          level: 'ERROR',
          source: { contains: 'test-service', mode: 'insensitive' },
          OR: [
            { message: { contains: 'connection', mode: 'insensitive' } },
            { context: { contains: 'connection', mode: 'insensitive' } },
          ],
        },
      })
    })

    it('should handle date range filters', async () => {
      const dateFrom = new Date('2024-01-01')
      const dateTo = new Date('2024-01-02')
      const filter = { dateFrom, dateTo }

      mockPrisma.systemLog.count.mockResolvedValue(0)
      mockPrisma.systemLog.findMany.mockResolvedValue([])

      await errorService.getErrorLogs({ filter })

      expect(mockPrisma.systemLog.count).toHaveBeenCalledWith({
        where: {
          timestamp: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      })
    })

    it('should handle pagination correctly', async () => {
      mockPrisma.systemLog.count.mockResolvedValue(100)
      mockPrisma.systemLog.findMany.mockResolvedValue([])

      const result = await errorService.getErrorLogs({ page: 3, limit: 20 })

      expect(result.totalPages).toBe(5)
      expect(mockPrisma.systemLog.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { timestamp: 'desc' },
        skip: 40, // (3-1) * 20
        take: 20,
      })
    })

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed')
      mockPrisma.systemLog.count.mockRejectedValue(error)

      await expect(errorService.getErrorLogs()).rejects.toThrow(
        'Database connection failed'
      )
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get error logs',
        error,
        expect.any(Object)
      )
    })
  })

  describe('getErrorStats', () => {
    it('should calculate error statistics correctly', async () => {
      const timeRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-02'),
      }

      // Mock total count
      mockPrisma.systemLog.count.mockResolvedValueOnce(50)

      // Mock by level grouping
      mockPrisma.systemLog.groupBy.mockResolvedValueOnce([
        { level: 'ERROR', _count: { level: 30 } },
        { level: 'WARN', _count: { level: 20 } },
      ])

      // Mock by source grouping
      mockPrisma.systemLog.groupBy.mockResolvedValueOnce([
        (mockPrisma.systemLog.groupBy as jest.Mock).mockResolvedValueOnce([
        { source: 'agent-service', _count: { source: 25 } },
        { source: 'task-service', _count: { source: 15 } },
      ]);

      // Mock top errors
      mockPrisma.systemLog.groupBy.mockResolvedValueOnce([
        {
          message: 'Connection timeout',
          _count: { message: 10 },
          _max: { timestamp: new Date('2024-01-01T12:00:00Z') },
        },
      ])

      // Mock previous period count for trend
      mockPrisma.systemLog.count.mockResolvedValueOnce(20)

      const result = await errorService.getErrorStats(timeRange)

      expect(result).toEqual({
        total: 50,
        byLevel: {
          ERROR: 30,
          WARN: 20,
        },
        bySource: {
          'agent-service': 25,
          'task-service': 15,
        },
        recentTrend: 'increasing',
        topErrors: [
          {
            message: 'Connection timeout',
            count: 10,
            lastOccurrence: new Date('2024-01-01T12:00:00Z'),
          },
        ],
      })
    })

    it('should handle empty results', async () => {
      const timeRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-02'),
      }

      mockPrisma.systemLog.count.mockResolvedValue(0)
      mockPrisma.systemLog.groupBy.mockResolvedValue([])

      const result = await errorService.getErrorStats(timeRange)

      expect(result.total).toBe(0)
      expect(result.byLevel).toEqual({})
      expect(result.bySource).toEqual({})
      expect(result.topErrors).toEqual([])
    })
  })

  describe('detectErrorPatterns', () => {
    it('should detect error patterns correctly', async () => {
      const timeRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-02'),
      }

      // Mock frequent errors
      mockPrisma.systemLog.groupBy.mockResolvedValueOnce([
        {
          message: 'Connection timeout',
          source: 'n8n-adapter',
          _count: { message: 5 },
          _max: { timestamp: new Date('2024-01-01T12:00:00Z') },
        },
      ])

      // Mock affected agents query
      mockPrisma.systemLog.findMany.mockResolvedValueOnce([
        { context: '{"agentId": "agent1"}' },
        { context: '{"agentId": "agent2"}' },
      ])

      const result = await errorService.detectErrorPatterns(timeRange)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        pattern: 'Connection timeout',
        description: 'Recurring error in n8n-adapter',
        frequency: 5,
        affectedAgents: ['agent1', 'agent2'],
        severity: 'MEDIUM',
        suggestedAction: 'Check network connectivity and platform API status',
      })
    })

    it('should determine severity based on frequency and affected agents', async () => {
      const timeRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-02'),
      }

      // Mock high frequency error
      mockPrisma.systemLog.groupBy.mockResolvedValueOnce([
        {
          message: 'Critical system error',
          source: 'core-service',
          _count: { message: 15 },
          _max: { timestamp: new Date() },
        },
      ])

      mockPrisma.systemLog.findMany.mockResolvedValueOnce([
        { context: '{"agentId": "agent1"}' },
        { context: '{"agentId": "agent2"}' },
        { context: '{"agentId": "agent3"}' },
        { context: '{"agentId": "agent4"}' },
        { context: '{"agentId": "agent5"}' },
        { context: '{"agentId": "agent6"}' },
      ])

      const result = await errorService.detectErrorPatterns(timeRange)

      expect(result[0].severity).toBe('CRITICAL')
    })
  })

  describe('getRetryableTasks', () => {
    it('should fetch retryable tasks correctly', async () => {
      const mockTasks = [
        {
          id: 'task1',
          name: 'Test Task',
          agentId: 'agent1',
          status: 'FAILED',
          error: 'Connection failed',
          retryCount: 1,
          maxRetries: 3,
          updatedAt: new Date(),
          parameters: '{"param1": "value1"}',
          agent: { name: 'Test Agent' },
        },
      ]

      mockPrisma.task.findMany.mockResolvedValue(mockTasks)

      const result = await errorService.getRetryableTasks()

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'task1',
        name: 'Test Task',
        agentId: 'agent1',
        agentName: 'Test Agent',
        status: 'FAILED',
        error: 'Connection failed',
        retryCount: 1,
        maxRetries: 3,
        canRetry: true,
        parameters: { param1: 'value1' },
      })

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: ['FAILED', 'CANCELLED'] },
          retryCount: {
            lt: expect.any(Object),
          },
        },
        include: {
          agent: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 50,
      })
    })
  })

  describe('retryTask', () => {
    it('should retry a task successfully', async () => {
      const taskId = 'task1'
      const mockTask = {
        id: taskId,
        status: 'FAILED',
        retryCount: 1,
        maxRetries: 3,
      }

      mockPrisma.task.findUnique.mockResolvedValue(mockTask)
      mockPrisma.task.update.mockResolvedValue({
        ...mockTask,
        status: 'PENDING',
      })

      await errorService.retryTask(taskId)

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          status: 'PENDING',
          retryCount: 2,
          error: null,
          startedAt: null,
          completedAt: null,
          updatedAt: expect.any(Date),
        },
      })

      expect(mockLogger.info).toHaveBeenCalledWith('Task retry initiated', {
        taskId,
        retryCount: 2,
        maxRetries: 3,
      })
    })

    it('should throw error if task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null)

      await expect(errorService.retryTask('nonexistent')).rejects.toThrow(
        'Task with ID nonexistent not found'
      )
    })

    it('should throw error if task is not retryable', async () => {
      const mockTask = {
        id: 'task1',
        status: 'COMPLETED',
        retryCount: 0,
        maxRetries: 3,
      }

      mockPrisma.task.findUnique.mockResolvedValue(mockTask)

      await expect(errorService.retryTask('task1')).rejects.toThrow(
        'Task task1 is not in a retryable state'
      )
    })

    it('should throw error if max retries exceeded', async () => {
      const mockTask = {
        id: 'task1',
        status: 'FAILED',
        retryCount: 3,
        maxRetries: 3,
      }

      mockPrisma.task.findUnique.mockResolvedValue(mockTask)

      await expect(errorService.retryTask('task1')).rejects.toThrow(
        'Task task1 has exceeded maximum retry attempts'
      )
    })
  })

  describe('bulkRetryTasks', () => {
    it('should retry multiple tasks successfully', async () => {
      const taskIds = ['task1', 'task2']

      // Mock successful retries
      jest
        .spyOn(errorService, 'retryTask')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)

      const result = await errorService.bulkRetryTasks(taskIds)

      expect(result).toEqual({
        successful: ['task1', 'task2'],
        failed: [],
      })

      expect(errorService.retryTask).toHaveBeenCalledTimes(2)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Bulk task retry completed',
        {
          total: 2,
          successful: 2,
          failed: 0,
        }
      )
    })

    it('should handle partial failures', async () => {
      const taskIds = ['task1', 'task2']

      jest
        jest.spyOn(errorService, 'retryTask')
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Task not found'));

      const result = await errorService.bulkRetryTasks(taskIds)

      expect(result).toEqual({
        successful: ['task1'],
        failed: [{ taskId: 'task2', error: 'Task not found' }],
      })
    })
  })

  describe('generateSuggestedAction', () => {
    it('should generate appropriate suggestions for different error types', () => {
      const testCases = [
        {
          message: 'Connection timeout occurred',
          source: 'n8n-adapter',
          expected: 'Check network connectivity and platform API status',
        },
        {
          message: 'Authentication failed',
          source: 'make-adapter',
          expected: 'Verify API credentials and refresh authentication tokens',
        },
        {
          message: 'Request timeout',
          source: 'zapier-adapter',
          expected: 'Increase timeout settings or check platform performance',
        },
        {
          message: 'Rate limit exceeded',
          source: 'api-service',
          expected: 'Implement rate limiting or upgrade platform plan',
        },
        {
          message: 'Invalid parameter format',
          source: 'validation-service',
          expected: 'Review input parameters and data validation rules',
        },
        {
          message: 'Unknown error',
          source: 'unknown-service',
          expected: 'Review error details and check platform documentation',
        },
      ]

      testCases.forEach(({ message, source, expected }) => {
        const result = (
          errorService as unknown as {
            generateSuggestedAction: (message: string, source: string) => string
          }
        ).generateSuggestedAction(message, source)
        expect(result).toBe(expected)
      })
    })
  })
})
