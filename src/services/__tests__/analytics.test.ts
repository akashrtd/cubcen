import { AnalyticsService } from '../analytics'

// Mock database
jest.mock('@/lib/database', () => ({
  prisma: {
    agent: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    task: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    platform: {
      findMany: jest.fn(),
    },
    agentHealth: {
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}))

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}))

const { prisma } = require('@/lib/database')

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService
  let mockPrisma: any

  beforeEach(() => {
    analyticsService = new AnalyticsService()
    mockPrisma = prisma
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAnalyticsData', () => {
    beforeEach(() => {
      // Setup default mocks
      mockPrisma.agent.count.mockResolvedValueOnce(10) // totalAgents
      mockPrisma.agent.count.mockResolvedValueOnce(8) // activeAgents
      mockPrisma.task.count.mockResolvedValueOnce(100) // totalTasks
      mockPrisma.task.count.mockResolvedValueOnce(85) // completedTasks
      mockPrisma.task.count.mockResolvedValueOnce(15) // failedTasks

      mockPrisma.task.groupBy
        .mockResolvedValueOnce([
          { status: 'COMPLETED', _count: { status: 85 } },
          { status: 'FAILED', _count: { status: 15 } },
        ])
        .mockResolvedValueOnce([
          { priority: 'HIGH', _count: { priority: 30 } },
          { priority: 'MEDIUM', _count: { priority: 50 } },
          { priority: 'LOW', _count: { priority: 20 } },
        ])
        .mockResolvedValueOnce([
          { agentId: 'agent1', _count: { id: 50 } },
          { agentId: 'agent2', _count: { id: 30 } },
        ])
        .mockResolvedValueOnce([
          { agentId: 'agent1', _count: { id: 45 } },
          { agentId: 'agent2', _count: { id: 25 } },
        ])

      mockPrisma.agent.findMany.mockResolvedValue([
        { id: 'agent1', name: 'Test Agent 1' },
        { id: 'agent2', name: 'Test Agent 2' },
      ])

      mockPrisma.platform.findMany.mockResolvedValue([
        { id: 'platform1', name: 'n8n', type: 'N8N' },
      ])

      mockPrisma.agentHealth.aggregate.mockResolvedValue({
        _avg: { responseTime: 150 },
      })

      mockPrisma.agentHealth.groupBy.mockResolvedValue([
        { agentId: 'agent1', _avg: { responseTime: 120 } },
        { agentId: 'agent2', _avg: { responseTime: 180 } },
      ])

      mockPrisma.task.findMany
        .mockResolvedValueOnce([
          { completedAt: new Date('2024-01-01') },
          { completedAt: new Date('2024-01-02') },
        ])
        .mockResolvedValueOnce([{ completedAt: new Date('2024-01-01') }])
        .mockResolvedValueOnce([
          { error: '{"message": "Connection timeout"}' },
          { error: '{"message": "Invalid credentials"}' },
          { error: '{"message": "Connection timeout"}' },
        ])
    })

    it('should return comprehensive analytics data', async () => {
      const result = await analyticsService.getAnalyticsData()

      expect(result).toEqual({
        totalAgents: 10,
        activeAgents: 8,
        totalTasks: 100,
        completedTasks: 85,
        failedTasks: 15,
        successRate: 85,
        averageResponseTime: 150,
        tasksByStatus: [
          { status: 'COMPLETED', count: 85 },
          { status: 'FAILED', count: 15 },
        ],
        tasksByPriority: [
          { priority: 'HIGH', count: 30 },
          { priority: 'MEDIUM', count: 50 },
          { priority: 'LOW', count: 20 },
        ],
        agentPerformance: [
          {
            agentId: 'agent1',
            agentName: 'Test Agent 1',
            totalTasks: 50,
            successRate: 90,
            averageResponseTime: 120,
          },
          {
            agentId: 'agent2',
            agentName: 'Test Agent 2',
            totalTasks: 30,
            successRate: 83.33,
            averageResponseTime: 180,
          },
        ],
        platformDistribution: expect.any(Array),
        dailyTaskTrends: expect.any(Array),
        errorPatterns: [
          { error: 'Connection timeout', count: 2 },
          { error: 'Invalid credentials', count: 1 },
        ],
      })
    })

    it('should handle date range filtering', async () => {
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }

      await analyticsService.getAnalyticsData(dateRange)

      // Verify that date filtering was applied to task queries
      expect(mockPrisma.task.count).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        },
      })
    })

    it('should handle zero tasks gracefully', async () => {
      mockPrisma.task.count.mockResolvedValueOnce(0) // totalTasks
      mockPrisma.task.count.mockResolvedValueOnce(0) // completedTasks
      mockPrisma.task.count.mockResolvedValueOnce(0) // failedTasks

      const result = await analyticsService.getAnalyticsData()

      expect(result.successRate).toBe(0)
      expect(result.totalTasks).toBe(0)
    })

    it('should handle database errors', async () => {
      mockPrisma.agent.count.mockRejectedValue(new Error('Database error'))

      await expect(analyticsService.getAnalyticsData()).rejects.toThrow(
        'Failed to retrieve analytics data'
      )
    })
  })

  describe('exportData', () => {
    const testData = [
      { name: 'Agent 1', tasks: 10, success: 90 },
      { name: 'Agent 2', tasks: 5, success: 80 },
    ]

    it('should export data as JSON', async () => {
      const result = await analyticsService.exportData(testData, 'json')

      expect(result).toBe(JSON.stringify(testData, null, 2))
    })

    it('should export data as CSV', async () => {
      const result = await analyticsService.exportData(testData, 'csv')

      expect(result).toContain('name,tasks,success')
      expect(result).toContain('"Agent 1",10,90')
      expect(result).toContain('"Agent 2",5,80')
    })

    it('should handle empty arrays', async () => {
      const result = await analyticsService.exportData([], 'csv')

      expect(result).toBe('')
    })

    it('should handle object data for CSV', async () => {
      const objectData = { totalAgents: 10, activeAgents: 8 }
      const result = await analyticsService.exportData(objectData, 'csv')

      expect(result).toContain('Key,Value')
      expect(result).toContain('"totalAgents",10')
      expect(result).toContain('"activeAgents",8')
    })

    it('should handle strings with quotes in CSV', async () => {
      const dataWithQuotes = [{ name: 'Agent "Test"', tasks: 5 }]
      const result = await analyticsService.exportData(dataWithQuotes, 'csv')

      expect(result).toContain('"Agent ""Test""",5')
    })

    it('should throw error for unsupported format', async () => {
      await expect(
        analyticsService.exportData(testData, 'xml' as any)
      ).rejects.toThrow('Unsupported export format')
    })
  })

  describe('error handling', () => {
    it('should handle JSON parsing errors in error patterns', async () => {
      mockPrisma.task.findMany.mockResolvedValue([
        { error: 'invalid json' },
        { error: '{"message": "valid json"}' },
      ])

      // Mock other required calls
      mockPrisma.agent.count.mockResolvedValue(0)
      mockPrisma.task.count.mockResolvedValue(0)
      mockPrisma.task.groupBy.mockResolvedValue([])
      mockPrisma.agentHealth.aggregate.mockResolvedValue({
        _avg: { responseTime: 0 },
      })

      const result = await analyticsService.getAnalyticsData()

      expect(result.errorPatterns).toEqual([
        { error: 'valid json', count: 1 },
        { error: 'Parse error', count: 1 },
      ])
    })

    it('should handle missing agent names', async () => {
      mockPrisma.task.groupBy.mockResolvedValue([
        { agentId: 'unknown-agent', _count: { id: 10 } },
      ])
      mockPrisma.agent.findMany.mockResolvedValue([])

      // Mock other required calls
      mockPrisma.agent.count.mockResolvedValue(0)
      mockPrisma.task.count.mockResolvedValue(0)
      mockPrisma.agentHealth.aggregate.mockResolvedValue({
        _avg: { responseTime: 0 },
      })
      mockPrisma.agentHealth.groupBy.mockResolvedValue([])

      const result = await analyticsService.getAnalyticsData()

      expect(result.agentPerformance[0].agentName).toBe('Unknown Agent')
    })
  })

  describe('data calculations', () => {
    it('should calculate success rate correctly', async () => {
      mockPrisma.task.count
        .mockResolvedValueOnce(0) // totalAgents
        .mockResolvedValueOnce(0) // activeAgents
        .mockResolvedValueOnce(100) // totalTasks
        .mockResolvedValueOnce(75) // completedTasks
        .mockResolvedValueOnce(25) // failedTasks

      // Mock other required calls
      mockPrisma.task.groupBy.mockResolvedValue([])
      mockPrisma.agentHealth.aggregate.mockResolvedValue({
        _avg: { responseTime: 0 },
      })
      mockPrisma.task.findMany.mockResolvedValue([])

      const result = await analyticsService.getAnalyticsData()

      expect(result.successRate).toBe(75)
    })

    it('should round response times correctly', async () => {
      mockPrisma.agentHealth.aggregate.mockResolvedValue({
        _avg: { responseTime: 123.456 },
      })

      // Mock other required calls
      mockPrisma.agent.count.mockResolvedValue(0)
      mockPrisma.task.count.mockResolvedValue(0)
      mockPrisma.task.groupBy.mockResolvedValue([])
      mockPrisma.task.findMany.mockResolvedValue([])

      const result = await analyticsService.getAnalyticsData()

      expect(result.averageResponseTime).toBe(123)
    })
  })
})
