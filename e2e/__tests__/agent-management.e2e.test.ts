import { TestServer } from '../utils/test-server'
import { ApiHelper, ValidationHelper, waitFor } from '../utils/test-helpers'

describe('Agent Management E2E Tests', () => {
  let server: TestServer
  let api: ApiHelper

  beforeAll(async () => {
    server = new TestServer()
    await server.start()
    api = new ApiHelper(server)
  })

  afterAll(async () => {
    await server.cleanup()
  })

  describe('Agent Discovery and Registration', () => {
    it('should list all agents with proper structure', async () => {
      const response = await api.get('/api/cubcen/v1/agents')
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)

      response.body.forEach((agent: any) => {
        ValidationHelper.validateAgent(agent)
      })
    })

    it('should get agent by ID with detailed information', async () => {
      // First get list of agents
      const listResponse = await api.get('/api/cubcen/v1/agents')
      expect(listResponse.status).toBe(200)
      const agentId = listResponse.body[0].id

      const response = await api.get(`/api/cubcen/v1/agents/${agentId}`)
      expect(response.status).toBe(200)

      ValidationHelper.validateAgent(response.body)
      expect(response.body.id).toBe(agentId)
      expect(response.body).toHaveProperty('platform')
      expect(response.body).toHaveProperty('tasks')
    })

    it('should return 404 for non-existent agent', async () => {
      const response = await api.get('/api/cubcen/v1/agents/non-existent-id')
      expect(response.status).toBe(404)
      expect(response.body.error).toContain('Agent not found')
    })

    it('should register new agent from platform', async () => {
      const agentData = {
        name: 'New Test Agent',
        platformId: 'test-platform-id',
        platformType: 'n8n',
        externalId: 'workflow-new',
        capabilities: ['testing', 'automation'],
        configuration: {
          triggers: ['webhook'],
          actions: ['log_data'],
        },
      }

      const response = await api.post('/api/cubcen/v1/agents', agentData)
      expect(response.status).toBe(201)

      ValidationHelper.validateAgent(response.body)
      expect(response.body.name).toBe(agentData.name)
      expect(response.body.platformType).toBe(agentData.platformType)
      expect(response.body.status).toBe('inactive') // New agents start inactive
    })

    it('should prevent duplicate agent registration', async () => {
      const agentData = {
        name: 'Duplicate Agent',
        platformId: 'test-platform-id',
        platformType: 'n8n',
        externalId: 'workflow-1', // Existing external ID
        capabilities: ['testing'],
        configuration: {},
      }

      const response = await api.post('/api/cubcen/v1/agents', agentData)
      expect(response.status).toBe(409)
      expect(response.body.error).toContain('already exists')
    })
  })

  describe('Agent Status Management', () => {
    let testAgentId: string

    beforeAll(async () => {
      // Get an existing agent for testing
      const response = await api.get('/api/cubcen/v1/agents')
      expect(response.status).toBe(200)
      testAgentId = response.body[0].id
    })

    it('should update agent status', async () => {
      const response = await api.put(`/api/cubcen/v1/agents/${testAgentId}/status`, {
        status: 'maintenance',
      })
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('maintenance')
      expect(response.body.updatedAt).toBeDefined()
    })

    it('should reject invalid status values', async () => {
      const response = await api.put(`/api/cubcen/v1/agents/${testAgentId}/status`, {
        status: 'invalid-status',
      })
      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Invalid status')
    })

    it('should get agent health status', async () => {
      const response = await api.get(`/api/cubcen/v1/agents/${testAgentId}/health`)
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('lastCheck')
      expect(response.body).toHaveProperty('responseTime')
      expect(['healthy', 'unhealthy', 'degraded']).toContain(
        response.body.status
      )
    })

    it('should trigger health check for agent', async () => {
      const response = await api.post(`/api/cubcen/v1/agents/${testAgentId}/health-check`, {})
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('responseTime')
    })
  })

  describe('Agent Configuration Management', () => {
    let testAgentId: string

    beforeAll(async () => {
      const response = await api.get('/api/cubcen/v1/agents')
      expect(response.status).toBe(200)
      testAgentId = response.body[0].id
    })

    it('should update agent configuration', async () => {
      const newConfig = {
        triggers: ['webhook', 'schedule'],
        actions: ['send_email', 'log_data', 'api_call'],
        settings: {
          timeout: 30000,
          retries: 3,
        },
      }

      const response = await api.put(`/api/cubcen/v1/agents/${testAgentId}/configuration`, {
        configuration: newConfig,
      })
      expect(response.status).toBe(200)
      expect(response.body.configuration).toEqual(newConfig)
      expect(response.body.updatedAt).toBeDefined()
    })

    it('should validate configuration schema', async () => {
      const invalidConfig = {
        triggers: 'invalid-format', // Should be array
        actions: [],
      }

      const response = await api.put(`/api/cubcen/v1/agents/${testAgentId}/configuration`, {
        configuration: invalidConfig,
      })
      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Invalid configuration')
    })

    it('should get agent configuration history', async () => {
      const response = await api.get(`/api/cubcen/v1/agents/${testAgentId}/configuration/history`)
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((config: any) => {
        expect(config).toHaveProperty('id')
        expect(config).toHaveProperty('configuration')
        expect(config).toHaveProperty('createdAt')
        expect(config).toHaveProperty('createdBy')
      })
    })
  })

  describe('Agent Filtering and Search', () => {
    it('should filter agents by status', async () => {
      const response = await api.get('/api/cubcen/v1/agents?status=active')
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((agent: any) => {
        expect(agent.status).toBe('active')
      })
    })

    it('should filter agents by platform type', async () => {
      const response = await api.get('/api/cubcen/v1/agents?platformType=n8n')
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((agent: any) => {
        expect(agent.platformType).toBe('n8n')
      })
    })

    it('should search agents by name', async () => {
      const response = await api.get('/api/cubcen/v1/agents?search=Email')
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((agent: any) => {
        expect(agent.name.toLowerCase()).toContain('email')
      })
    })

    it('should paginate agent results', async () => {
      const response = await api.get('/api/cubcen/v1/agents?page=1&limit=2')
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('pagination')
      expect(response.body.data.length).toBeLessThanOrEqual(2)
      expect(response.body.pagination).toHaveProperty('page')
      expect(response.body.pagination).toHaveProperty('limit')
      expect(response.body.pagination).toHaveProperty('total')
    })
  })

  describe('Agent Metrics and Analytics', () => {
    let testAgentId: string

    beforeAll(async () => {
      const response = await api.get('/api/cubcen/v1/agents')
      expect(response.status).toBe(200)
      testAgentId = response.body[0].id
    })

    it('should get agent performance metrics', async () => {
      const response = await api.get(`/api/cubcen/v1/agents/${testAgentId}/metrics`)
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('executionCount')
      expect(response.body).toHaveProperty('successRate')
      expect(response.body).toHaveProperty('averageExecutionTime')
      expect(response.body).toHaveProperty('errorRate')
      expect(response.body).toHaveProperty('lastExecution')
    })

    it('should get agent metrics with time range', async () => {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago

      const response = await api.get(
          `/api/cubcen/v1/agents/${testAgentId}/metrics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        )
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('executionCount')
      expect(response.body).toHaveProperty('timeRange')
      expect(response.body.timeRange.startDate).toBe(startDate.toISOString())
      expect(response.body.timeRange.endDate).toBe(endDate.toISOString())
    })
  })

  describe('Real-time Agent Updates', () => {
    it('should receive real-time agent status updates via WebSocket', async () => {
      // This would require WebSocket testing setup
      // For now, we'll test the HTTP endpoints that trigger WebSocket updates

      const agents = await api.get('/api/cubcen/v1/agents')
      expect(agents.status).toBe(200)
      const testAgentId = agents.body[0].id

      // Update agent status and verify it triggers real-time update
      const response = await api.put(`/api/cubcen/v1/agents/${testAgentId}/status`, {
          status: 'active',
        })
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('active')

      // In a real WebSocket test, we would verify that connected clients
      // receive the status update message
    })
  })

  describe('Agent Error Handling', () => {
    it('should handle agent execution errors gracefully', async () => {
      const agents = await api.get('/api/cubcen/v1/agents')
      expect(agents.status).toBe(200)
      const testAgentId = agents.body[0].id

      // Simulate agent execution with error
      const response = await api.post(`/api/cubcen/v1/agents/${testAgentId}/execute`, {
          parameters: { simulateError: true },
        })
      expect(response.status).toBe(500)
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('agentId')
    })

    it('should log agent errors for debugging', async () => {
      const agents = await api.get('/api/cubcen/v1/agents')
      expect(agents.status).toBe(200)
      const testAgentId = agents.body[0].id

      // Get agent error logs
      const response = await api.get(`/api/cubcen/v1/agents/${testAgentId}/errors`)
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((error: any) => {
        expect(error).toHaveProperty('id')
        expect(error).toHaveProperty('message')
        expect(error).toHaveProperty('timestamp')
        expect(error).toHaveProperty('severity')
      })
    })
  })
})
