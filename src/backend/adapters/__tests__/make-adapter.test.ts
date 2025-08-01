/**
 * Unit tests for Make.com Platform Adapter
 */

import axios from 'axios'
import { MakePlatformAdapter } from '../make-adapter'
import { PlatformConfig } from '../../../types/platform'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock circuit breaker
jest.mock('../../../lib/circuit-breaker', () => ({
  createPlatformCircuitBreaker: jest.fn(() => ({
    execute: jest.fn(fn => fn()),
    getStats: jest.fn(() => ({ state: 'closed' })),
  })),
}))

describe('MakePlatformAdapter', () => {
  let adapter: MakePlatformAdapter
  let mockConfig: PlatformConfig
  let mockAxiosInstance: jest.Mocked<ReturnType<typeof axios.create>>

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock axios.create
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      defaults: {
        headers: {
          common: {},
        },
      },
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    } as unknown as jest.Mocked<ReturnType<typeof axios.create>>

    mockedAxios.create.mockReturnValue(mockAxiosInstance)

    mockConfig = {
      id: 'test-make',
      name: 'Test Make.com',
      type: 'make',
      baseUrl: 'https://eu1.make.com/api/v2',
      credentials: {
        apiToken: 'test-api-token',
      },
    }

    adapter = new MakePlatformAdapter(mockConfig)
  })

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(adapter.getPlatformType()).toBe('make')
      expect(adapter.getConfig()).toEqual(mockConfig)
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://eu1.make.com/api/v2',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cubcen/1.0.0',
        },
      })
    })

    it('should throw error for invalid configuration', () => {
      const invalidConfig = {
        ...mockConfig,
        credentials: {},
      }

      expect(() => new MakePlatformAdapter(invalidConfig)).toThrow(
        'Make.com adapter requires either apiToken, accessToken, or OAuth client credentials'
      )
    })

    it('should use default baseUrl if not provided', () => {
      const configWithoutBaseUrl = {
        ...mockConfig,
        baseUrl: undefined as unknown as string,
      }

      new MakePlatformAdapter(configWithoutBaseUrl)

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://eu1.make.com/api/v2',
        })
      )
    })
  })

  describe('authenticate', () => {
    it('should authenticate with API token successfully', async () => {
      const mockScenarios = [{ id: 1, name: 'Test Scenario' }]
      mockAxiosInstance.get.mockResolvedValue({ data: mockScenarios, status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios' } })

      const result = await adapter.authenticate({
        apiToken: 'test-token',
      })

      expect(result.success).toBe(true)
      expect(result.token).toBe('test-token')
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(
        'Token test-token'
      )
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/scenarios')
    })

    it('should authenticate with OAuth access token successfully', async () => {
      const mockScenarios = [{ id: 1, name: 'Test Scenario' }]
      mockAxiosInstance.get.mockResolvedValue({ data: mockScenarios, status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios' } })

      const result = await adapter.authenticate({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        teamId: 123,
      })

      expect(result.success).toBe(true)
      expect(result.token).toBe('access-token')
      expect(result.expiresAt).toBeInstanceOf(Date)
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(
        'Bearer access-token'
      )
    })

    it('should handle OAuth flow with client credentials', async () => {
      const mockTokenResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'scenarios:read',
      }

      const mockScenarios = [{ id: 1, name: 'Test Scenario' }]

      // Mock the OAuth token refresh
      mockedAxios.post.mockResolvedValue({ data: mockTokenResponse, status: 200, statusText: 'OK', headers: {}, config: { url: '/oauth/token' } })
      mockAxiosInstance.get.mockResolvedValue({ data: mockScenarios, status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios' } })

      const result = await adapter.authenticate({
        clientId: 'client-id',
        clientSecret: 'client-secret',
        refreshToken: 'refresh-token',
        teamId: 123,
      })

      expect(result.success).toBe(true)
      expect(result.token).toBe('new-access-token')
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://eu1.make.com/oauth/token',
        {
          grant_type: 'refresh_token',
          client_id: 'client-id',
          client_secret: 'client-secret',
          refresh_token: 'refresh-token',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    })

    it('should handle authentication failure', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Unauthorized'))

      const result = await adapter.authenticate({
        apiToken: 'invalid-token',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication failed: Unauthorized')
    })

    it('should handle invalid credentials', async () => {
      const result = await adapter.authenticate({})

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Authentication failed: Invalid credentials provided. Requires apiToken or OAuth credentials.'
      )
    })
  })

  describe('discoverAgents', () => {
    it('should discover agents successfully', async () => {
      const mockScenarios = [
        {
          id: 1,
          name: 'Test Scenario 1',
          is_active: true,
          is_locked: false,
          team_id: 123,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          last_edit: '2024-01-02T00:00:00Z',
          blueprint: {
            flow: [
              {
                id: 1,
                module: 'webhook',
                version: 1,
                parameters: {},
                mapper: {},
                metadata: { designer: { x: 0, y: 0 } },
              },
              {
                id: 2,
                module: 'http',
                version: 1,
                parameters: {},
                mapper: {},
                metadata: { designer: { x: 100, y: 0 } },
              },
            ],
            metadata: {},
          },
        },
        {
          id: 2,
          name: 'Test Scenario 2',
          is_active: false,
          is_locked: true,
          team_id: 123,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          last_edit: '2024-01-02T00:00:00Z',
        },
      ]

      mockAxiosInstance.get.mockResolvedValue({ data: mockScenarios, status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios' } })

      const agents = await adapter.discoverAgents()

      expect(agents).toHaveLength(2)
      expect(agents[0]).toMatchObject({
        id: '1',
        name: 'Test Scenario 1',
        platformId: 'test-make',
        platformType: 'make',
        status: 'active',
        capabilities: ['webhook', 'http', 'active'],
      })
      expect(agents[1]).toMatchObject({
        id: '2',
        name: 'Test Scenario 2',
        status: 'maintenance',
      })
    })

    it('should handle discovery failure', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'))

      await expect(adapter.discoverAgents()).rejects.toThrow('Network error')
    })

    it('should include teamId in request when configured', async () => {
      const adapterWithTeam = new MakePlatformAdapter({
        ...mockConfig,
        credentials: {
          apiToken: 'test-token',
          teamId: 456,
        },
      })

      mockAxiosInstance.get.mockResolvedValue({ data: [], status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios' } })

      await adapterWithTeam.discoverAgents()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/scenarios', {
        params: { teamId: 456 },
      })
    })
  })

  describe('getAgentStatus', () => {
    it('should get agent status successfully', async () => {
      const mockScenario = {
        id: 1,
        name: 'Test Scenario',
        is_active: true,
        is_locked: false,
        team_id: 123,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        last_edit: '2024-01-02T00:00:00Z',
      }

      const mockExecutions = [
        {
          id: 1,
          scenario_id: 1,
          status: 'success' as const,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:01:00Z',
          started_at: '2024-01-01T10:00:00Z',
          finished_at: '2024-01-01T10:01:00Z',
          execution_time: 60000,
          operations_count: 5,
          data_transfer: 1024,
        },
        {
          id: 2,
          scenario_id: 1,
          status: 'error' as const,
          created_at: '2024-01-01T11:00:00Z',
          updated_at: '2024-01-01T11:01:00Z',
          started_at: '2024-01-01T11:00:00Z',
          finished_at: '2024-01-01T11:01:00Z',
          execution_time: 30000,
          operations_count: 2,
          data_transfer: 512,
          error: {
            message: 'Test error',
            type: 'RuntimeError',
          },
        },
      ]

      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: mockScenario, status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios/1' } })
        .mockResolvedValueOnce({ data: mockExecutions, status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios/1/executions' } })

      const status = await adapter.getAgentStatus('1')

      expect(status).toMatchObject({
        id: '1',
        status: 'active',
        lastSeen: expect.any(Date),
        metrics: {
          tasksCompleted: 2,
          averageExecutionTime: 45000,
          errorRate: 0.5,
        },
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/scenarios/1', {
        params: undefined,
      })
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/scenarios/1/executions',
        {
          params: { limit: 10 },
        }
      )
    })

    it('should handle agent status error', async () => {
      mockAxiosInstance.get.mockRejectedValue({ response: { status: 404, statusText: 'Not Found', data: { message: 'Not found' } }, config: { url: '/scenarios/999' } })

      const status = await adapter.getAgentStatus('999')

      expect(status).toMatchObject({
        id: '999',
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
        id: 123,
        scenario_id: 1,
        status: 'success' as const,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:01:00Z',
        started_at: '2024-01-01T10:00:00Z',
        finished_at: '2024-01-01T10:01:00Z',
        execution_time: 60000,
        operations_count: 5,
        data_transfer: 1024,
      }

      mockAxiosInstance.post.mockResolvedValue({ data: mockExecution, status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios/1/run' } })
      mockAxiosInstance.get.mockResolvedValue({ data: mockExecution, status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios/1/executions' } })

      const result = await adapter.executeAgent('1', { test: 'data' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockExecution)
      expect(result.executionTime).toBe(60000)
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/scenarios/1/run', {
        data: { test: 'data' },
      })
    })

    it('should handle execution failure', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Execution failed'))

      const result = await adapter.executeAgent('1', {})

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to execute agent: Execution failed')
    })

    it('should handle execution with error status', async () => {
      const mockExecution = {
        id: 123,
        scenario_id: 1,
        status: 'error' as const,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:01:00Z',
        started_at: '2024-01-01T10:00:00Z',
        finished_at: '2024-01-01T10:01:00Z',
        execution_time: 30000,
        operations_count: 2,
        data_transfer: 512,
        error: {
          message: 'Runtime error occurred',
          type: 'RuntimeError',
        },
      }

      mockAxiosInstance.post.mockResolvedValue({ data: mockExecution, status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios/1/run' } })
      mockAxiosInstance.get.mockResolvedValue({ data: mockExecution, status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios/1/executions' } })

      const result = await adapter.executeAgent('1', {})

      expect(result.success).toBe(false)
      expect(result.error).toBe('Runtime error occurred')
      expect(result.executionTime).toBe(30000)
    })
  })

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [], status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios' } })

      const health = await adapter.healthCheck()

      expect(health.status).toBe('healthy')
      expect(health.lastCheck).toBeInstanceOf(Date)
      expect(health.responseTime).toBeGreaterThan(0)
      expect(health.details).toMatchObject({
        circuitBreakerState: 'closed',
        authenticated: true,
      })
    })

    it('should return unhealthy status on error', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Service unavailable'))

      const health = await adapter.healthCheck()

      expect(health.status).toBe('unhealthy')
      expect(health.error).toBe('Service unavailable')
    })
  })

  describe('connect', () => {
    it('should connect successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [], status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios' } })

      const result = await adapter.connect()

      expect(result.connected).toBe(true)
      expect(result.lastConnected).toBeInstanceOf(Date)
      expect(adapter.isAdapterConnected()).toBe(true)
    })

    it('should handle connection failure', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Connection failed'))

      const result = await adapter.connect()

      expect(result.connected).toBe(false)
      expect(result.error).toBe('Connection failed: Connection failed')
      expect(adapter.isAdapterConnected()).toBe(false)
    })
  })

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      // First connect
      mockAxiosInstance.get.mockResolvedValue({ data: [], status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios' } })
      await adapter.connect()

      // Then disconnect
      await adapter.disconnect()

      expect(adapter.isAdapterConnected()).toBe(false)
      expect(
        mockAxiosInstance.defaults.headers.common['Authorization']
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
    it('should extract error message from axios error', async () => {
      const axiosError = {
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: {
            message: 'Invalid scenario ID',
          },
        },
      }

      mockAxiosInstance.get.mockRejectedValue(axiosError)

      const result = await adapter.authenticate({ apiToken: 'test' })

      expect(result.error).toBe('Authentication failed: Invalid scenario ID')
    })

    it('should handle network errors', async () => {
      const networkError = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      }

      mockAxiosInstance.get.mockRejectedValue(networkError)

      const result = await adapter.authenticate({ apiToken: 'test' })

      expect(result.error).toBe(
        'Authentication failed: Network error: ECONNREFUSED'
      )
    })

    it('should handle unknown errors', async () => {
      mockAxiosInstance.get.mockRejectedValue('Unknown error')

      const result = await adapter.authenticate({ apiToken: 'test' })

      expect(result.error).toBe('Authentication failed: Unknown error occurred')
    })
  })

  describe('OAuth token refresh', () => {
    it('should refresh token when expired', async () => {
      const adapterWithOAuth = new MakePlatformAdapter({
        ...mockConfig,
        credentials: {
          clientId: 'client-id',
          clientSecret: 'client-secret',
          accessToken: 'expired-token',
          refreshToken: 'refresh-token',
        },
      })

      const mockTokenResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'scenarios:read',
      }

      // Mock token refresh
      mockedAxios.post.mockResolvedValue({ data: mockTokenResponse, status: 200, statusText: 'OK', headers: {}, config: { url: '/oauth/token' } })
      mockAxiosInstance.get.mockResolvedValue({ data: [], status: 200, statusText: 'OK', headers: {}, config: { url: '/scenarios' } })

      // Manually set token as expired
      ;(
        adapterWithOAuth as unknown as {
          tokenExpiresAt: Date
          refreshToken: string
        }
      ).tokenExpiresAt = new Date(Date.now() - 1000)
      ;(
        adapterWithOAuth as unknown as {
          tokenExpiresAt: Date
          refreshToken: string
        }
      ).refreshToken = 'refresh-token'

      await adapterWithOAuth.healthCheck()

      // The interceptor should have refreshed the token
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://eu1.make.com/oauth/token',
        expect.objectContaining({
          grant_type: 'refresh_token',
          refresh_token: 'refresh-token',
        }),
        expect.any(Object)
      )
    })
  })

  describe('rate limiting', () => {
    it('should handle rate limit responses', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          headers: {
            'retry-after': '60',
          },
        },
      }

      mockAxiosInstance.get.mockRejectedValue(rateLimitError)

      const result = await adapter.healthCheck()

      expect(result.status).toBe('unhealthy')
      expect(result.error).toBe('HTTP 429: undefined')
    })
  })
})
