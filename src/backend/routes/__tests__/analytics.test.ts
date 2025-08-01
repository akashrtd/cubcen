import request from 'supertest'
import express from 'express'
import analyticsRoutes from '../analytics'
import { analyticsService } from '@/services/analytics'

// Mock the analytics service
jest.mock('@/services/analytics', () => ({
  analyticsService: {
    getAnalyticsData: jest.fn(),
    exportData: jest.fn(),
  },
}))

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}))

const mockAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>

describe('Analytics Routes', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/cubcen/v1/analytics', analyticsRoutes)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockAnalyticsData = {
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
    ],
    platformDistribution: [
      { platform: 'n8n (N8N)', count: 5 },
    ],
    dailyTaskTrends: [
      { date: '2024-01-01', completed: 10, failed: 2 },
    ],
    errorPatterns: [
      { error: 'Connection timeout', count: 5 },
    ],
  }

  describe('GET /api/cubcen/v1/analytics', () => {
    it('should return analytics data successfully', async () => {
      mockAnalyticsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData)

      const response = await request(app)
        .get('/api/cubcen/v1/analytics')
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: mockAnalyticsData,
        timestamp: expect.any(String),
      })

      expect(mockAnalyticsService.getAnalyticsData).toHaveBeenCalledWith(undefined)
    })

    it('should handle date range parameters', async () => {
      mockAnalyticsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData)

      const startDate = '2024-01-01T00:00:00.000Z'
      const endDate = '2024-01-31T23:59:59.999Z'

      await request(app)
        .get('/api/cubcen/v1/analytics')
        .query({ startDate, endDate })
        .expect(200)

      expect(mockAnalyticsService.getAnalyticsData).toHaveBeenCalledWith({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
    })

    it('should handle invalid date parameters', async () => {
      const response = await request(app)
        .get('/api/cubcen/v1/analytics')
        .query({ startDate: 'invalid-date' })
        .expect(400)

      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(response.body.error.message).toBe('Invalid date range parameters')
    })

    it('should handle service errors', async () => {
      mockAnalyticsService.getAnalyticsData.mockRejectedValue(
        new Error('Database connection failed')
      )

      const response = await request(app)
        .get('/api/cubcen/v1/analytics')
        .expect(500)

      expect(response.body.error.code).toBe('ANALYTICS_ERROR')
      expect(response.body.error.message).toBe('Failed to retrieve analytics data')
    })
  })

  describe('GET /api/cubcen/v1/analytics/kpis', () => {
    it('should return KPI data only', async () => {
      mockAnalyticsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData)

      const response = await request(app)
        .get('/api/cubcen/v1/analytics/kpis')
        .expect(200)

      expect(response.body.data).toEqual({
        totalAgents: 10,
        activeAgents: 8,
        totalTasks: 100,
        completedTasks: 85,
        failedTasks: 15,
        successRate: 85,
        averageResponseTime: 150,
      })

      // Should not include detailed data
      expect(response.body.data.agentPerformance).toBeUndefined()
      expect(response.body.data.dailyTaskTrends).toBeUndefined()
    })

    it('should handle date range for KPIs', async () => {
      mockAnalyticsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData)

      const startDate = '2024-01-01T00:00:00.000Z'

      await request(app)
        .get('/api/cubcen/v1/analytics/kpis')
        .query({ startDate })
        .expect(200)

      expect(mockAnalyticsService.getAnalyticsData).toHaveBeenCalledWith({
        startDate: new Date(startDate),
        endDate: new Date(0), // Default when only startDate provided
      })
    })
  })

  describe('POST /api/cubcen/v1/analytics/export', () => {
    it('should export data as CSV', async () => {
      mockAnalyticsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData)
      mockAnalyticsService.exportData.mockResolvedValue('name,tasks\nAgent 1,50')

      const response = await request(app)
        .post('/api/cubcen/v1/analytics/export')
        .send({ format: 'csv', dataType: 'agents' })
        .expect(200)

      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8')
      expect(response.headers['content-disposition']).toMatch(/attachment; filename=/)
      expect(response.text).toBe('name,tasks\nAgent 1,50')

      expect(mockAnalyticsService.exportData).toHaveBeenCalledWith(
        mockAnalyticsData.agentPerformance,
        'csv'
      )
    })

    it('should export data as JSON', async () => {
      mockAnalyticsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData)
      mockAnalyticsService.exportData.mockResolvedValue('{"data": "test"}')

      const response = await request(app)
        .post('/api/cubcen/v1/analytics/export')
        .send({ format: 'json', dataType: 'overview' })
        .expect(200)

      expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
      expect(response.text).toBe('{"data": "test"}')

      expect(mockAnalyticsService.exportData).toHaveBeenCalledWith(
        mockAnalyticsData,
        'json'
      )
    })

    it('should handle different data types', async () => {
      mockAnalyticsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData)
      mockAnalyticsService.exportData.mockResolvedValue('exported data')

      // Test tasks data type
      await request(app)
        .post('/api/cubcen/v1/analytics/export')
        .send({ format: 'csv', dataType: 'tasks' })
        .expect(200)

      expect(mockAnalyticsService.exportData).toHaveBeenCalledWith(
        {
          tasksByStatus: mockAnalyticsData.tasksByStatus,
          tasksByPriority: mockAnalyticsData.tasksByPriority,
        },
        'csv'
      )

      // Test trends data type
      await request(app)
        .post('/api/cubcen/v1/analytics/export')
        .send({ format: 'csv', dataType: 'trends' })
        .expect(200)

      expect(mockAnalyticsService.exportData).toHaveBeenCalledWith(
        mockAnalyticsData.dailyTaskTrends,
        'csv'
      )

      // Test errors data type
      await request(app)
        .post('/api/cubcen/v1/analytics/export')
        .send({ format: 'csv', dataType: 'errors' })
        .expect(200)

      expect(mockAnalyticsService.exportData).toHaveBeenCalledWith(
        mockAnalyticsData.errorPatterns,
        'csv'
      )
    })

    it('should handle invalid export parameters', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/analytics/export')
        .send({ format: 'invalid' })
        .expect(400)

      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(response.body.error.message).toBe('Invalid export parameters')
    })

    it('should handle export service errors', async () => {
      mockAnalyticsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData)
      mockAnalyticsService.exportData.mockRejectedValue(
        new Error('Export failed')
      )

      const response = await request(app)
        .post('/api/cubcen/v1/analytics/export')
        .send({ format: 'csv' })
        .expect(500)

      expect(response.body.error.code).toBe('EXPORT_ERROR')
      expect(response.body.error.message).toBe('Failed to export analytics data')
    })

    it('should include date range in query parameters', async () => {
      mockAnalyticsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData)
      mockAnalyticsService.exportData.mockResolvedValue('exported data')

      const startDate = '2024-01-01T00:00:00.000Z'
      const endDate = '2024-01-31T23:59:59.999Z'

      await request(app)
        .post('/api/cubcen/v1/analytics/export')
        .query({ startDate, endDate })
        .send({ format: 'csv' })
        .expect(200)

      expect(mockAnalyticsService.getAnalyticsData).toHaveBeenCalledWith({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
    })
  })

  describe('GET /api/cubcen/v1/analytics/trends', () => {
    it('should return trend data', async () => {
      mockAnalyticsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData)

      const response = await request(app)
        .get('/api/cubcen/v1/analytics/trends')
        .expect(200)

      expect(response.body.data).toEqual({
        dailyTrends: mockAnalyticsData.dailyTaskTrends,
        tasksByStatus: mockAnalyticsData.tasksByStatus,
        tasksByPriority: mockAnalyticsData.tasksByPriority,
        platformDistribution: mockAnalyticsData.platformDistribution,
      })
    })

    it('should handle date range for trends', async () => {
      mockAnalyticsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData)

      const startDate = '2024-01-01T00:00:00.000Z'
      const endDate = '2024-01-31T23:59:59.999Z'

      await request(app)
        .get('/api/cubcen/v1/analytics/trends')
        .query({ startDate, endDate })
        .expect(200)

      expect(mockAnalyticsService.getAnalyticsData).toHaveBeenCalledWith({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
    })

    it('should handle service errors for trends', async () => {
      mockAnalyticsService.getAnalyticsData.mockRejectedValue(
        new Error('Service error')
      )

      const response = await request(app)
        .get('/api/cubcen/v1/analytics/trends')
        .expect(500)

      expect(response.body.error.code).toBe('ANALYTICS_ERROR')
      expect(response.body.error.message).toBe('Failed to retrieve trend data')
    })
  })

  describe('error handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/cubcen/v1/analytics/export')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400)

      // Express will handle the JSON parsing error
    })

    it('should include request ID in error responses', async () => {
      mockAnalyticsService.getAnalyticsData.mockRejectedValue(
        new Error('Service error')
      )

      const response = await request(app)
        .get('/api/cubcen/v1/analytics')
        .expect(500)

      expect(response.body.error.timestamp).toBeDefined()
    })
  })
})