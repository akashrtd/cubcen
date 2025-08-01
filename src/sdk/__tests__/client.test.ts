/**
 * Cubcen SDK Client Tests
 * Tests for the API client SDK functionality
 */

import { CubcenClient } from '../client'
import {
  CubcenError,
  CubcenAuthenticationError,
  CubcenValidationError,
  CubcenNotFoundError,
  CubcenRateLimitError,
} from '../errors'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('CubcenClient', () => {
  let client: CubcenClient
  let mockAxiosInstance: {
    request: jest.Mock
    interceptors: {
      request: { use: jest.Mock }
      response: { use: jest.Mock }
    }
  }

  beforeEach(() => {
    mockAxiosInstance = {
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }

    mockedAxios.create.mockReturnValue(mockAxiosInstance)

    client = new CubcenClient({
      baseUrl: 'http://localhost:3000',
      timeout: 5000,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cubcen-SDK/1.0.0',
        },
      })
    })

    it('should setup request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
    })

    it('should use default timeout if not provided', () => {
      new CubcenClient({ baseUrl: 'http://localhost:3000' })

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({ timeout: 30000 })
      )
    })
  })

  describe('Token Management', () => {
    it('should set and clear tokens', () => {
      const accessToken = 'access-token'
      const refreshToken = 'refresh-token'

      client.setTokens(accessToken, refreshToken)
      expect(client['accessToken']).toBe(accessToken)
      expect(client['refreshToken']).toBe(refreshToken)

      client.clearTokens()
      expect(client['accessToken']).toBeUndefined()
      expect(client['refreshToken']).toBeUndefined()
    })
  })

  describe('Authentication Methods', () => {
    describe('login', () => {
      it('should login successfully and set tokens', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              user: { id: '1', email: 'test@example.com', role: 'admin' },
              tokens: {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                expiresIn: 3600,
              },
            },
          },
        }

        mockAxiosInstance.request.mockResolvedValue(mockResponse)

        const result = await client.login({
          email: 'test@example.com',
          password: 'password',
        })

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/cubcen/v1/auth/login',
          data: { email: 'test@example.com', password: 'password' },
        })

        expect(result.user.email).toBe('test@example.com')
        expect(result.tokens.accessToken).toBe('access-token')
        expect(client['accessToken']).toBe('access-token')
        expect(client['refreshToken']).toBe('refresh-token')
      })

      it('should handle login failure', async () => {
        const mockError = {
          response: {
            status: 401,
            data: {
              success: false,
              error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
                requestId: 'req_123',
              },
            },
          },
        }

        mockAxiosInstance.request.mockRejectedValue(mockError)

        await expect(
          client.login({
            email: 'test@example.com',
            password: 'wrong-password',
          })
        ).rejects.toThrow(CubcenAuthenticationError)
      })
    })

    describe('register', () => {
      it('should register successfully', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              user: { id: '1', email: 'new@example.com', role: 'viewer' },
              tokens: {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                expiresIn: 3600,
              },
            },
          },
        }

        mockAxiosInstance.request.mockResolvedValue(mockResponse)

        const result = await client.register({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        })

        expect(result.user.email).toBe('new@example.com')
        expect(client['accessToken']).toBe('access-token')
      })
    })

    describe('getCurrentUser', () => {
      it('should get current user info', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              user: { id: '1', email: 'test@example.com', role: 'admin' },
            },
          },
        }

        mockAxiosInstance.request.mockResolvedValue(mockResponse)

        const user = await client.getCurrentUser()

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/api/cubcen/v1/auth/me',
        })

        expect(user.email).toBe('test@example.com')
      })
    })
  })

  describe('Agent Methods', () => {
    describe('getAgents', () => {
      it('should get agents with filters', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              agents: [
                { id: '1', name: 'Agent 1', status: 'ACTIVE' },
                { id: '2', name: 'Agent 2', status: 'INACTIVE' },
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 2,
                totalPages: 1,
              },
            },
          },
        }

        mockAxiosInstance.request.mockResolvedValue(mockResponse)

        const result = await client.getAgents({
          page: 1,
          limit: 20,
          status: 'ACTIVE',
        })

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/api/cubcen/v1/agents',
          params: { page: 1, limit: 20, status: 'ACTIVE' },
        })

        expect(result.agents).toHaveLength(2)
        expect(result.pagination.total).toBe(2)
      })
    })

    describe('getAgent', () => {
      it('should get specific agent', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              agent: { id: '1', name: 'Test Agent', status: 'ACTIVE' },
            },
          },
        }

        mockAxiosInstance.request.mockResolvedValue(mockResponse)

        const agent = await client.getAgent('1')

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/api/cubcen/v1/agents/1',
        })

        expect(agent.id).toBe('1')
        expect(agent.name).toBe('Test Agent')
      })

      it('should handle agent not found', async () => {
        const mockError = {
          response: {
            status: 404,
            data: {
              success: false,
              error: {
                code: 'AGENT_NOT_FOUND',
                message: 'Agent not found',
                requestId: 'req_123',
              },
            },
          },
        }

        mockAxiosInstance.request.mockRejectedValue(mockError)

        await expect(client.getAgent('non-existent')).rejects.toThrow(
          CubcenNotFoundError
        )
      })
    })

    describe('createAgent', () => {
      it('should create new agent', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              agent: {
                id: '1',
                name: 'New Agent',
                platformId: 'platform-1',
                externalId: 'ext-123',
              },
            },
          },
        }

        mockAxiosInstance.request.mockResolvedValue(mockResponse)

        const agentData = {
          name: 'New Agent',
          platformId: 'platform-1',
          externalId: 'ext-123',
          capabilities: ['email'],
        }

        const agent = await client.createAgent(agentData)

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/cubcen/v1/agents',
          data: agentData,
        })

        expect(agent.name).toBe('New Agent')
      })
    })
  })

  describe('Task Methods', () => {
    describe('getTasks', () => {
      it('should get tasks with filters', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              tasks: [
                { id: '1', agentId: 'agent-1', status: 'PENDING' },
                { id: '2', agentId: 'agent-1', status: 'COMPLETED' },
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 2,
                totalPages: 1,
              },
            },
          },
        }

        mockAxiosInstance.request.mockResolvedValue(mockResponse)

        const result = await client.getTasks({
          agentId: 'agent-1',
          status: 'PENDING',
        })

        expect(result.tasks).toHaveLength(2)
      })
    })

    describe('createTask', () => {
      it('should create new task', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              task: {
                id: '1',
                agentId: 'agent-1',
                status: 'PENDING',
                priority: 'MEDIUM',
              },
            },
          },
        }

        mockAxiosInstance.request.mockResolvedValue(mockResponse)

        const taskData = {
          agentId: 'agent-1',
          priority: 'MEDIUM' as const,
          parameters: { test: true },
        }

        const task = await client.createTask(taskData)

        expect(task.agentId).toBe('agent-1')
        expect(task.priority).toBe('MEDIUM')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      networkError.name = 'NetworkError'

      mockAxiosInstance.request.mockRejectedValue(networkError)

      await expect(client.getCurrentUser()).rejects.toThrow(CubcenError)
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Timeout')
      timeoutError.name = 'ECONNABORTED'
      Object.assign(timeoutError, { code: 'ECONNABORTED' })

      mockAxiosInstance.request.mockRejectedValue(timeoutError)

      await expect(client.getCurrentUser()).rejects.toThrow('Request timeout')
    })

    it('should handle validation errors', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              requestId: 'req_123',
            },
          },
        },
      }

      mockAxiosInstance.request.mockRejectedValue(mockError)

      await expect(client.getCurrentUser()).rejects.toThrow(
        CubcenValidationError
      )
    })

    it('should handle rate limit errors', async () => {
      const mockError = {
        response: {
          status: 429,
          data: {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests',
              requestId: 'req_123',
            },
          },
        },
      }

      mockAxiosInstance.request.mockRejectedValue(mockError)

      await expect(client.getCurrentUser()).rejects.toThrow(
        CubcenRateLimitError
      )
    })

    it('should handle API response errors', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'API_ERROR',
            message: 'Something went wrong',
            requestId: 'req_123',
          },
        },
      }

      mockAxiosInstance.request.mockResolvedValue(mockResponse)

      await expect(client.getCurrentUser()).rejects.toThrow(CubcenError)
    })
  })

  describe('Platform Methods', () => {
    it('should get all platforms', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            platforms: [
              { id: '1', name: 'n8n Platform', type: 'N8N' },
              { id: '2', name: 'Make Platform', type: 'MAKE' },
            ],
          },
        },
      }

      mockAxiosInstance.request.mockResolvedValue(mockResponse)

      const platforms = await client.getPlatforms()

      expect(platforms).toHaveLength(2)
      expect(platforms[0].type).toBe('N8N')
    })
  })

  describe('Health Methods', () => {
    it('should get system health', async () => {
      const mockResponse = {
        data: {
          status: 'healthy',
          checks: [
            { name: 'database', status: 'healthy' },
            { name: 'external-apis', status: 'healthy' },
          ],
          timestamp: '2024-01-01T00:00:00Z',
        },
      }

      mockAxiosInstance.request.mockResolvedValue(mockResponse)

      const health = await client.getSystemHealth()

      expect(health.status).toBe('healthy')
      expect(health.checks).toHaveLength(2)
    })
  })

  describe('Analytics Methods', () => {
    it('should get analytics data', async () => {
      const mockResponse = {
        data: {
          totalAgents: 10,
          activeAgents: 8,
          totalTasks: 100,
          completedTasks: 85,
          failedTasks: 5,
          successRate: 0.85,
        },
      }

      mockAxiosInstance.request.mockResolvedValue(mockResponse)

      const analytics = await client.getAnalytics({
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
      })

      expect(analytics.totalAgents).toBe(10)
      expect(analytics.successRate).toBe(0.85)
    })
  })

  describe('Notification Methods', () => {
    it('should get user notifications', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            notifications: [
              { id: '1', title: 'Test Notification', read: false },
              { id: '2', title: 'Another Notification', read: true },
            ],
          },
        },
      }

      mockAxiosInstance.request.mockResolvedValue(mockResponse)

      const notifications = await client.getNotifications()

      expect(notifications).toHaveLength(2)
      expect(notifications[0].read).toBe(false)
    })

    it('should mark notification as read', async () => {
      const mockResponse = {
        data: { success: true },
      }

      mockAxiosInstance.request.mockResolvedValue(mockResponse)

      await client.markNotificationRead('1')

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/api/cubcen/v1/notifications/1/read',
      })
    })
  })
})
