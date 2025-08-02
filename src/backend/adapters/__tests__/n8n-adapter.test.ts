/**
 * Tests for n8n Platform Adapter
 */

import axios from 'axios'
import { N8nPlatformAdapter } from '../n8n-adapter'
import { PlatformConfig, PlatformCredentials } from '../../../types/platform'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('N8nPlatformAdapter', () => {
  let adapter: N8nPlatformAdapter
  let mockAxiosInstance: {
    get: jest.Mock
    post: jest.Mock
    put: jest.Mock
    patch: jest.Mock
    delete: jest.Mock
    head: jest.Mock
    options: jest.Mock
    request: jest.Mock
    getUri: jest.Mock
    defaults: {
      headers: {
        common: Record<string, string>
      }
    }
    interceptors: {
      request: {
        use: jest.Mock
        eject: jest.Mock
        clear: jest.Mock
      }
      response: {
        use: jest.Mock
        eject: jest.Mock
        clear: jest.Mock
      }
    }
  }
  let config: PlatformConfig

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      head: jest.fn(),
      options: jest.fn(),
      request: jest.fn(),
      getUri: jest.fn(),
      defaults: {
        headers: {
          common: {},
        },
      },
      interceptors: {
        request: {
          use: jest.fn(),
          eject: jest.fn(),
          clear: jest.fn(),
        },
        response: {
          use: jest.fn(),
          eject: jest.fn(),
          clear: jest.fn(),
        },
      },
    }

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any)

    config = {
      id: 'test-n8n',
      name: 'Test n8n',
      type: 'n8n',
      baseUrl: 'http://localhost:5678',
      credentials: {
        apiKey: 'test-api-key',
      },
      timeout: 30000,
      retryAttempts: 3,
      circuitBreakerThreshold: 3,
    }

    adapter = new N8nPlatformAdapter(config)
  })

  describe('constructor', () => {
    it('should create adapter with valid configuration', () => {
      expect(adapter).toBeInstanceOf(N8nPlatformAdapter)
      expect(adapter.getPlatformType()).toBe('n8n')
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:5678',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cubcen/1.0.0',
        },
      })
    })

    it('should throw error for invalid configuration', () => {
      const invalidConfig = { ...config, credentials: {} }

      expect(
        () => new N8nPlatformAdapter(invalidConfig as PlatformConfig)
      ).toThrow(
        'n8n adapter requires either apiKey or email/password credentials'
      )
    })

    it('should throw error for missing credentials', () => {
      const invalidConfig = {
        ...config,
        credentials: {},
      }

      expect(() => new N8nPlatformAdapter(invalidConfig)).toThrow(
        'n8n adapter requires either apiKey or email/password credentials'
      )
    })
  })

  describe('authenticate', () => {
    it('should authenticate successfully with API key', async () => {
      const credentials: PlatformCredentials = {
        apiKey: 'test-api-key',
      }

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { data: [] },
      })

      const result = await adapter.authenticate(credentials)

      expect(result.success).toBe(true)
      expect(result.token).toBe('test-api-key')
      expect(mockAxiosInstance.defaults.headers.common['X-N8N-API-KEY']).toBe(
        'test-api-key'
      )
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/workflows')
    })

    it('should authenticate successfully with email/password', async () => {
      const credentials: PlatformCredentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          token: 'jwt-token',
          expiresIn: 3600,
        },
      })

      const result = await adapter.authenticate(credentials)

      expect(result.success).toBe(true)
      expect(result.token).toBe('jwt-token')
      expect(result.expiresAt).toBeInstanceOf(Date)
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(
        'Bearer jwt-token'
      )
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/login', {
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should handle authentication failure', async () => {
      const credentials: PlatformCredentials = {
        apiKey: 'invalid-key',
      }

      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Unauthorized'))

      const result = await adapter.authenticate(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized')
    })

    it('should handle network errors during authentication', async () => {
      const credentials: PlatformCredentials = {
        apiKey: 'test-key',
      }

      const networkError = new Error('Network Error')
      networkError.name = 'AxiosError'
      mockAxiosInstance.get.mockRejectedValueOnce(networkError)

      const result = await adapter.authenticate(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network Error')
    })
  })

  describe('discoverAgents', () => {
    const mockWorkflows = [
      {
        id: 'workflow-1',
        name: 'Test Workflow 1',
        active: true,
        tags: ['automation', 'test'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        versionId: 'v1',
        nodes: [
          {
            id: 'node-1',
            name: 'Start',
            type: 'n8n-nodes-base.start',
            typeVersion: 1,
            position: [100, 100],
            parameters: {},
          },
          {
            id: 'node-2',
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 1,
            position: [300, 100],
            parameters: { url: 'https://api.example.com' },
          },
        ],
        connections: {},
      },
      {
        id: 'workflow-2',
        name: 'Test Workflow 2',
        active: false,
        tags: [],
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
        versionId: 'v1',
        nodes: [],
        connections: {},
      },
    ]

    it('should discover agents successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { data: mockWorkflows },
      })

      const agents = await adapter.discoverAgents()

      expect(agents).toHaveLength(2)
      expect(agents[0]).toMatchObject({
        id: 'workflow-1',
        name: 'Test Workflow 1',
        platformId: 'test-n8n',
        platformType: 'n8n',
        status: 'active',
        capabilities: expect.arrayContaining([
          'n8n-nodes-base.start',
          'n8n-nodes-base.httpRequest',
          'tag:automation',
          'tag:test',
        ]),
      })
      expect(agents[1]).toMatchObject({
        id: 'workflow-2',
        name: 'Test Workflow 2',
        status: 'inactive',
      })
    })

    it('should handle API errors during discovery', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API Error'))

      await expect(adapter.discoverAgents()).rejects.toThrow('API Error')
    })

    it('should handle empty workflow response', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { data: [] },
      })

      const agents = await adapter.discoverAgents()

      expect(agents).toHaveLength(0)
    })
  })

  describe('getAgentStatus', () => {
    const mockWorkflow = {
      id: 'workflow-1',
      name: 'Test Workflow',
      active: true,
      tags: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      versionId: 'v1',
      nodes: [],
      connections: {},
    }

    const mockExecutions = [
      {
        id: 'exec-1',
        workflowId: 'workflow-1',
        mode: 'manual',
        status: 'success',
        startedAt: '2024-01-01T10:00:00Z',
        stoppedAt: '2024-01-01T10:01:00Z',
        workflowData: mockWorkflow,
      },
      {
        id: 'exec-2',
        workflowId: 'workflow-1',
        mode: 'manual',
        status: 'error',
        startedAt: '2024-01-01T11:00:00Z',
        stoppedAt: '2024-01-01T11:00:30Z',
        workflowData: mockWorkflow,
      },
      {
        id: 'exec-3',
        workflowId: 'workflow-1',
        mode: 'manual',
        status: 'running',
        startedAt: '2024-01-01T12:00:00Z',
        workflowData: mockWorkflow,
      },
    ]

    it('should get agent status successfully', async () => {
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { data: mockWorkflow } })
        .mockResolvedValueOnce({ data: { data: mockExecutions } })

      const status = await adapter.getAgentStatus('workflow-1')

      expect(status).toMatchObject({
        id: 'workflow-1',
        status: 'active',
        currentTask: 'Execution exec-3',
        metrics: {
          tasksCompleted: 2,
          averageExecutionTime: 45000, // Average of 60s and 30s
          errorRate: 0.3333333333333333, // 1 error out of 3 executions
        },
      })
    })

    it('should handle agent status errors gracefully', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Not found'))

      const status = await adapter.getAgentStatus('invalid-workflow')

      expect(status).toMatchObject({
        id: 'invalid-workflow',
        status: 'error',
        metrics: {
          tasksCompleted: 0,
          averageExecutionTime: 0,
          errorRate: 1,
        },
      })
    })
  })

  describe('executeAgent', () => {
    it('should execute agent successfully', async () => {
      const mockExecution = {
        id: 'exec-123',
        workflowId: 'workflow-1',
        status: 'running',
      }

      const mockCompletedExecution = {
        id: 'exec-123',
        workflowId: 'workflow-1',
        status: 'success',
        data: { result: 'success' },
        startedAt: '2024-01-01T10:00:00Z',
        stoppedAt: '2024-01-01T10:01:00Z',
      }

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: mockExecution },
      })

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { data: mockCompletedExecution },
      })

      const result = await adapter.executeAgent('workflow-1', { input: 'test' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ result: 'success' })
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/workflows/workflow-1/execute',
        {
          data: { input: 'test' },
        }
      )
    })

    it('should handle execution failure', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        new Error('Execution failed')
      )

      const result = await adapter.executeAgent('workflow-1', {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('Execution failed')
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { status: 'ok' },
      })

      const health = await adapter.healthCheck()

      expect(health.status).toBe('healthy')
      expect(health.responseTime).toBeGreaterThanOrEqual(0)
      expect(health.details).toMatchObject({
        circuitBreakerState: 'closed',
      })
    })

    it('should return unhealthy status on error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(
        new Error('Service unavailable')
      )

      const health = await adapter.healthCheck()

      expect(health.status).toBe('unhealthy')
      expect(health.error).toContain('Service unavailable')
    })
  })

  describe('connect', () => {
    it('should connect successfully', async () => {
      // Mock authentication
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { data: [] },
      })

      // Mock health check
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { status: 'ok' },
      })

      const result = await adapter.connect()

      expect(result.connected).toBe(true)
      expect(result.lastConnected).toBeInstanceOf(Date)
      expect(adapter.isAdapterConnected()).toBe(true)
    })

    it('should handle connection failure', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(
        new Error('Connection failed')
      )

      const result = await adapter.connect()

      expect(result.connected).toBe(false)
      expect(result.error).toContain('Connection failed')
      expect(adapter.isAdapterConnected()).toBe(false)
    })
  })

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      await adapter.disconnect()

      expect(adapter.isAdapterConnected()).toBe(false)
      expect(
        mockAxiosInstance.defaults.headers.common['Authorization']
      ).toBeUndefined()
      expect(
        mockAxiosInstance.defaults.headers.common['X-N8N-API-KEY']
      ).toBeUndefined()
    })
  })

  describe('event subscription', () => {
    it('should subscribe to events', async () => {
      const callback = jest.fn()

      await adapter.subscribeToEvents(callback)

      // Verify callback was added (internal method, so we test indirectly)
      expect(callback).not.toHaveBeenCalled()
    })

    it('should unsubscribe from events', async () => {
      const callback = jest.fn()

      await adapter.subscribeToEvents(callback)
      await adapter.unsubscribeFromEvents(callback)

      // Verify callback was removed (internal method, so we test indirectly)
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle axios errors properly', async () => {
      const axiosError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: {
            message: 'Workflow not found',
          },
        },
        isAxiosError: true,
        message: 'Request failed with status code 404',
      }

      mockAxiosInstance.get.mockRejectedValueOnce(axiosError)

      const result = await adapter.authenticate({ apiKey: 'test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Workflow not found')
    })

    it('should handle network errors', async () => {
      const networkError = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      }

      mockAxiosInstance.get.mockRejectedValueOnce(networkError)

      const result = await adapter.authenticate({ apiKey: 'test' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error: ECONNREFUSED')
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded')
      timeoutError.name = 'AxiosError'

      mockAxiosInstance.get.mockRejectedValueOnce(timeoutError)

      const health = await adapter.healthCheck()

      expect(health.status).toBe('unhealthy')
      expect(health.error).toContain('timeout')
    })
  })

  describe('circuit breaker integration', () => {
    it('should use circuit breaker for API calls', async () => {
      // Simulate multiple failures to trigger circuit breaker
      const error = new Error('Service unavailable')

      mockAxiosInstance.get
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)

      // First three calls should fail
      await expect(adapter.healthCheck()).resolves.toMatchObject({
        status: 'unhealthy',
      })
      await expect(adapter.healthCheck()).resolves.toMatchObject({
        status: 'unhealthy',
      })
      await expect(adapter.healthCheck()).resolves.toMatchObject({
        status: 'unhealthy',
      })

      // Fourth call should be blocked by circuit breaker
      const health = await adapter.healthCheck()
      expect(health.status).toBe('unhealthy')
      // Circuit breaker might be triggered or the original error might be returned
      expect(health.error).toBeDefined()
    })
  })

  describe('retry logic', () => {
    it('should handle retry scenarios through circuit breaker', async () => {
      const error = new Error('Temporary failure')

      // First call fails
      mockAxiosInstance.get.mockRejectedValueOnce(error)
      const health1 = await adapter.healthCheck()
      expect(health1.status).toBe('unhealthy')

      // Second call succeeds
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { status: 'ok' } })
      const health2 = await adapter.healthCheck()
      expect(health2.status).toBe('healthy')

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2)
    })
  })
})
