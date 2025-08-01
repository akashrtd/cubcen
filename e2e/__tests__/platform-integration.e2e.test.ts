import { TestServer } from '../utils/test-server'
import { ApiHelper, ValidationHelper, waitFor } from '../utils/test-helpers'

describe('Platform Integration E2E Tests', () => {
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

  describe('Platform Connection Management', () => {
    it('should list all connected platforms', async () => {
      const response = await api.get('/api/cubcen/v1/platforms')
      expect(response.status).toBe(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)

      response.body.forEach((platform: any) => {
        ValidationHelper.validatePlatform(platform)
      })
    })

    it('should get platform by ID with connection details', async () => {
      const platforms = await api.get('/api/cubcen/v1/platforms')
      expect(platforms.status).toBe(200)
      const platformId = platforms.body[0].id

      const response = await api.get(`/api/cubcen/v1/platforms/${platformId}`)
      expect(response.status).toBe(200)

      ValidationHelper.validatePlatform(response.body)
      expect(response.body.id).toBe(platformId)
      expect(response.body).toHaveProperty('agents')
      expect(response.body).toHaveProperty('connectionStatus')
    })

    it('should add new platform connection', async () => {
      const platformData = {
        name: 'Test Zapier Platform',
        type: 'zapier',
        baseUrl: 'https://api.zapier.com',
        authConfig: {
          type: 'api_key',
          apiKey: 'test-zapier-api-key',
        },
      }

      const response = await api.post('/api/cubcen/v1/platforms', platformData)
      expect(response.status).toBe(201)

      ValidationHelper.validatePlatform(response.body)
      expect(response.body.name).toBe(platformData.name)
      expect(response.body.type).toBe(platformData.type)
      expect(response.body.status).toBe('connecting') // Initial status
    })

    it('should test platform connection', async () => {
      const platforms = await api.get('/api/cubcen/v1/platforms')
      expect(platforms.status).toBe(200)
      const platformId = platforms.body[0].id

      const response = await api.post(
        `/api/cubcen/v1/platforms/${platformId}/test-connection`,
        {}
      )
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('responseTime')
      expect(response.body).toHaveProperty('timestamp')
      expect(['connected', 'failed', 'timeout']).toContain(response.body.status)
    })

    it('should update platform configuration', async () => {
      const platforms = await api.get('/api/cubcen/v1/platforms')
      expect(platforms.status).toBe(200)
      const platformId = platforms.body[0].id

      const updateData = {
        name: 'Updated Platform Name',
        authConfig: {
          type: 'api_key',
          apiKey: 'updated-api-key',
        },
      }

      const response = await api.put(
        `/api/cubcen/v1/platforms/${platformId}`,
        updateData
      )
      expect(response.status).toBe(200)

      expect(response.body.name).toBe(updateData.name)
      expect(response.body.updatedAt).toBeDefined()
    })
  })

  describe('n8n Platform Integration', () => {
    let n8nPlatformId: string

    beforeAll(async () => {
      const platforms = await api.get('/api/cubcen/v1/platforms')
      expect(platforms.status).toBe(200)
      const n8nPlatform = platforms.body.find((p: any) => p.type === 'n8n')
      n8nPlatformId = n8nPlatform.id
    })

    it('should discover workflows from n8n platform', async () => {
      const response = await api.post(
        `/api/cubcen/v1/platforms/${n8nPlatformId}/discover`,
        {}
      )
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('discovered')
      expect(response.body).toHaveProperty('workflows')
      expect(Array.isArray(response.body.workflows)).toBe(true)

      response.body.workflows.forEach((workflow: any) => {
        expect(workflow).toHaveProperty('id')
        expect(workflow).toHaveProperty('name')
        expect(workflow).toHaveProperty('active')
        expect(workflow).toHaveProperty('nodes')
      })
    })

    it('should sync agents from n8n workflows', async () => {
      const response = await api.post(
        `/api/cubcen/v1/platforms/${n8nPlatformId}/sync`,
        {}
      )
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('synced')
      expect(response.body).toHaveProperty('created')
      expect(response.body).toHaveProperty('updated')
      expect(response.body).toHaveProperty('errors')
      expect(typeof response.body.synced).toBe('number')
    })

    it('should get n8n workflow execution history', async () => {
      const response = await api.get(
        `/api/cubcen/v1/platforms/${n8nPlatformId}/executions`
      )
      expect(response.status).toBe(200)

      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((execution: any) => {
        expect(execution).toHaveProperty('id')
        expect(execution).toHaveProperty('workflowId')
        expect(execution).toHaveProperty('status')
        expect(execution).toHaveProperty('startedAt')
        expect(['success', 'error', 'running', 'waiting']).toContain(
          execution.status
        )
      })
    })

    it('should handle n8n API errors gracefully', async () => {
      // Simulate API error by using invalid platform ID
      const response = await api.post(
        '/api/cubcen/v1/platforms/invalid-id/discover',
        {}
      )
      expect(response.status).toBe(404)

      expect(response.body.error).toContain('Platform not found')
    })
  })

  describe('Make.com Platform Integration', () => {
    let makePlatformId: string

    beforeAll(async () => {
      const platforms = await api.get('/api/cubcen/v1/platforms')
      expect(platforms.status).toBe(200)
      const makePlatform = platforms.body.find((p: any) => p.type === 'make')
      makePlatformId = makePlatform.id
    })

    it('should discover scenarios from Make.com platform', async () => {
      const response = await api.post(
        `/api/cubcen/v1/platforms/${makePlatformId}/discover`,
        {}
      )
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('discovered')
      expect(response.body).toHaveProperty('scenarios')
      expect(Array.isArray(response.body.scenarios)).toBe(true)

      response.body.scenarios.forEach((scenario: any) => {
        expect(scenario).toHaveProperty('id')
        expect(scenario).toHaveProperty('name')
        expect(scenario).toHaveProperty('isActive')
        expect(scenario).toHaveProperty('modules')
      })
    })

    it('should sync agents from Make.com scenarios', async () => {
      const response = await api.post(
        `/api/cubcen/v1/platforms/${makePlatformId}/sync`,
        {}
      )
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('synced')
      expect(response.body).toHaveProperty('created')
      expect(response.body).toHaveProperty('updated')
      expect(typeof response.body.synced).toBe('number')
    })

    it('should get Make.com scenario execution history', async () => {
      const response = await api.get(
        `/api/cubcen/v1/platforms/${makePlatformId}/executions`
      )
      expect(response.status).toBe(200)

      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((execution: any) => {
        expect(execution).toHaveProperty('id')
        expect(execution).toHaveProperty('scenarioId')
        expect(execution).toHaveProperty('status')
        expect(execution).toHaveProperty('executedAt')
      })
    })

    it('should handle Make.com OAuth token refresh', async () => {
      const response = await api.post(
        `/api/cubcen/v1/platforms/${makePlatformId}/refresh-token`,
        {}
      )
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('tokenRefreshed')
      expect(response.body).toHaveProperty('expiresAt')
      expect(response.body.tokenRefreshed).toBe(true)
    })
  })

  describe('Platform Health Monitoring', () => {
    it('should monitor platform health status', async () => {
      const platforms = await api.get('/api/cubcen/v1/platforms')
      expect(platforms.status).toBe(200)

      for (const platform of platforms.body) {
        const response = await api.get(
          `/api/cubcen/v1/platforms/${platform.id}/health`
        )
        expect(response.status).toBe(200)

        expect(response.body).toHaveProperty('status')
        expect(response.body).toHaveProperty('lastCheck')
        expect(response.body).toHaveProperty('responseTime')
        expect(response.body).toHaveProperty('details')
        expect(['healthy', 'unhealthy', 'degraded']).toContain(
          response.body.status
        )
      }
    })

    it('should detect platform connectivity issues', async () => {
      // Create a platform with invalid configuration to test error handling
      const invalidPlatform = {
        name: 'Invalid Platform',
        type: 'n8n',
        baseUrl: 'http://invalid-url:9999',
        authConfig: {
          type: 'api_key',
          apiKey: 'invalid-key',
        },
      }

      const createResponse = await api.post(
        '/api/cubcen/v1/platforms',
        invalidPlatform
      )
      expect(createResponse.status).toBe(201)

      const platformId = createResponse.body.id

      // Test connection should fail
      const testResponse = await api.post(
        `/api/cubcen/v1/platforms/${platformId}/test-connection`,
        {}
      )
      expect(testResponse.status).toBe(200)

      expect(testResponse.body.status).toBe('failed')
      expect(testResponse.body).toHaveProperty('error')
    })

    it('should track platform performance metrics', async () => {
      const platforms = await api.get('/api/cubcen/v1/platforms')
      expect(platforms.status).toBe(200)
      const platformId = platforms.body[0].id

      const response = await api.get(
        `/api/cubcen/v1/platforms/${platformId}/metrics`
      )
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('requestCount')
      expect(response.body).toHaveProperty('averageResponseTime')
      expect(response.body).toHaveProperty('errorRate')
      expect(response.body).toHaveProperty('uptime')
      expect(response.body).toHaveProperty('lastSync')
    })
  })

  describe('Platform Error Recovery', () => {
    it('should retry failed platform operations', async () => {
      const platforms = await api.get('/api/cubcen/v1/platforms')
      expect(platforms.status).toBe(200)
      const platformId = platforms.body[0].id

      // Simulate a failed operation that should be retried
      const response = await api.post(
        `/api/cubcen/v1/platforms/${platformId}/retry-failed-operations`,
        {}
      )
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('retriedOperations')
      expect(response.body).toHaveProperty('successfulRetries')
      expect(response.body).toHaveProperty('failedRetries')
      expect(typeof response.body.retriedOperations).toBe('number')
    })

    it('should handle platform circuit breaker activation', async () => {
      const platforms = await api.get('/api/cubcen/v1/platforms')
      expect(platforms.status).toBe(200)
      const platformId = platforms.body[0].id

      // Get circuit breaker status
      const response = await api.get(
        `/api/cubcen/v1/platforms/${platformId}/circuit-breaker`
      )
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('state')
      expect(response.body).toHaveProperty('failureCount')
      expect(response.body).toHaveProperty('lastFailureTime')
      expect(['closed', 'open', 'half-open']).toContain(response.body.state)
    })
  })

  describe('Platform Data Synchronization', () => {
    it('should sync platform data incrementally', async () => {
      const platforms = await api.get('/api/cubcen/v1/platforms')
      expect(platforms.status).toBe(200)
      const platformId = platforms.body[0].id

      const response = await api.post(
        `/api/cubcen/v1/platforms/${platformId}/sync`,
        {
          incremental: true,
          lastSyncTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        }
      )
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('synced')
      expect(response.body).toHaveProperty('incremental')
      expect(response.body.incremental).toBe(true)
    })

    it('should handle sync conflicts gracefully', async () => {
      const platforms = await api.get('/api/cubcen/v1/platforms')
      expect(platforms.status).toBe(200)
      const platformId = platforms.body[0].id

      const response = await api.post(
        `/api/cubcen/v1/platforms/${platformId}/sync`,
        {
          forceSync: true,
        }
      )
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('conflicts')
      expect(response.body).toHaveProperty('resolved')
      expect(Array.isArray(response.body.conflicts)).toBe(true)
    })

    it('should validate data integrity after sync', async () => {
      const platforms = await api.get('/api/cubcen/v1/platforms')
      expect(platforms.status).toBe(200)
      const platformId = platforms.body[0].id

      const response = await api.post(
        `/api/cubcen/v1/platforms/${platformId}/validate-data`,
        {}
      )
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('valid')
      expect(response.body).toHaveProperty('issues')
      expect(response.body).toHaveProperty('checkedRecords')
      expect(typeof response.body.valid).toBe('boolean')
      expect(Array.isArray(response.body.issues)).toBe(true)
    })
  })
})
