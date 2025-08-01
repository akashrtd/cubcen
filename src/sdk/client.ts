/**
 * Cubcen API Client
 * Main SDK client for interacting with the Cubcen API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  CubcenClientConfig,
  ApiResponse,
  LoginCredentials,
  RegisterData,
  AuthResult,
  User,
  Agent,
  CreateAgentData,
  UpdateAgentData,
  AgentFilters,
  Task,
  CreateTaskData,
  TaskFilters,
  Platform,
  CreatePlatformData,
  UpdatePlatformData,
  SystemHealth,
  AnalyticsData,
  AnalyticsFilters,
  Notification,
  NotificationPreferences,
  PaginationResult,
} from './types'
import {
  CubcenError,
  CubcenNetworkError,
  CubcenTimeoutError,
  createCubcenError,
} from './errors'

export class CubcenClient {
  private readonly http: AxiosInstance
  private accessToken?: string
  private refreshToken?: string

  constructor(config: CubcenClientConfig) {
    this.http = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cubcen-SDK/1.0.0',
      },
    })

    // Request interceptor for authentication
    this.http.interceptors.request.use(config => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`
      }
      return config
    })

    // Response interceptor for error handling
    this.http.interceptors.response.use(
      response => response,
      async error => {
        if (error.code === 'ECONNABORTED') {
          throw new CubcenTimeoutError('Request timeout')
        }

        if (!error.response) {
          throw new CubcenNetworkError('Network error: ' + error.message)
        }

        const { status, data } = error.response
        const errorData = data?.error || {}

        throw createCubcenError(
          status,
          errorData.message || 'Unknown error',
          errorData.code || 'UNKNOWN_ERROR',
          errorData.requestId,
          errorData.details
        )
      }
    )
  }

  /**
   * Set authentication tokens
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }

  /**
   * Clear authentication tokens
   */
  clearTokens(): void {
    this.accessToken = undefined
    this.refreshToken = undefined
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.http.request(config)

      if (!response.data.success) {
        throw new CubcenError(
          response.data.error?.message || 'API request failed',
          response.data.error?.code || 'API_ERROR',
          response.status,
          response.data.error?.requestId,
          response.data.error?.details
        )
      }

      return response.data.data as T
    } catch (error) {
      if (error instanceof CubcenError) {
        throw error
      }
      throw new CubcenError('Unexpected error: ' + (error as Error).message)
    }
  }

  // Authentication Methods

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const result = await this.request<AuthResult>({
      method: 'POST',
      url: '/api/cubcen/v1/auth/login',
      data: credentials,
    })

    this.setTokens(result.tokens.accessToken, result.tokens.refreshToken)
    return result
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    const result = await this.request<AuthResult>({
      method: 'POST',
      url: '/api/cubcen/v1/auth/register',
      data,
    })

    this.setTokens(result.tokens.accessToken, result.tokens.refreshToken)
    return result
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    const result = await this.request<{ user: User }>({
      method: 'GET',
      url: '/api/cubcen/v1/auth/me',
    })
    return result.user
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<AuthResult> {
    if (!this.refreshToken) {
      throw new CubcenError('No refresh token available')
    }

    const result = await this.request<AuthResult>({
      method: 'POST',
      url: '/api/cubcen/v1/auth/refresh',
      data: { refreshToken: this.refreshToken },
    })

    this.setTokens(result.tokens.accessToken, result.tokens.refreshToken)
    return result
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.request<void>({
      method: 'POST',
      url: '/api/cubcen/v1/auth/logout',
    })
    this.clearTokens()
  }

  // Agent Methods

  /**
   * Get all agents with filtering and pagination
   */
  async getAgents(filters?: AgentFilters): Promise<{
    agents: Agent[]
    pagination: PaginationResult
  }> {
    return this.request({
      method: 'GET',
      url: '/api/cubcen/v1/agents',
      params: filters,
    })
  }

  /**
   * Get agent by ID
   */
  async getAgent(id: string): Promise<Agent> {
    const result = await this.request<{ agent: Agent }>({
      method: 'GET',
      url: `/api/cubcen/v1/agents/${id}`,
    })
    return result.agent
  }

  /**
   * Create new agent
   */
  async createAgent(data: CreateAgentData): Promise<Agent> {
    const result = await this.request<{ agent: Agent }>({
      method: 'POST',
      url: '/api/cubcen/v1/agents',
      data,
    })
    return result.agent
  }

  /**
   * Update agent
   */
  async updateAgent(id: string, data: UpdateAgentData): Promise<Agent> {
    const result = await this.request<{ agent: Agent }>({
      method: 'PUT',
      url: `/api/cubcen/v1/agents/${id}`,
      data,
    })
    return result.agent
  }

  /**
   * Delete agent
   */
  async deleteAgent(id: string): Promise<void> {
    await this.request<void>({
      method: 'DELETE',
      url: `/api/cubcen/v1/agents/${id}`,
    })
  }

  /**
   * Get agent health status
   */
  async getAgentHealth(id: string): Promise<SystemHealth> {
    return this.request({
      method: 'GET',
      url: `/api/cubcen/v1/agents/${id}/health`,
    })
  }

  // Task Methods

  /**
   * Get all tasks with filtering and pagination
   */
  async getTasks(filters?: TaskFilters): Promise<{
    tasks: Task[]
    pagination: PaginationResult
  }> {
    return this.request({
      method: 'GET',
      url: '/api/cubcen/v1/tasks',
      params: filters,
    })
  }

  /**
   * Get task by ID
   */
  async getTask(id: string): Promise<Task> {
    const result = await this.request<{ task: Task }>({
      method: 'GET',
      url: `/api/cubcen/v1/tasks/${id}`,
    })
    return result.task
  }

  /**
   * Create new task
   */
  async createTask(data: CreateTaskData): Promise<Task> {
    const result = await this.request<{ task: Task }>({
      method: 'POST',
      url: '/api/cubcen/v1/tasks',
      data,
    })
    return result.task
  }

  /**
   * Cancel task
   */
  async cancelTask(id: string): Promise<Task> {
    const result = await this.request<{ task: Task }>({
      method: 'POST',
      url: `/api/cubcen/v1/tasks/${id}/cancel`,
    })
    return result.task
  }

  /**
   * Retry failed task
   */
  async retryTask(id: string): Promise<Task> {
    const result = await this.request<{ task: Task }>({
      method: 'POST',
      url: `/api/cubcen/v1/tasks/${id}/retry`,
    })
    return result.task
  }

  // Platform Methods

  /**
   * Get all platforms
   */
  async getPlatforms(): Promise<Platform[]> {
    const result = await this.request<{ platforms: Platform[] }>({
      method: 'GET',
      url: '/api/cubcen/v1/platforms',
    })
    return result.platforms
  }

  /**
   * Get platform by ID
   */
  async getPlatform(id: string): Promise<Platform> {
    const result = await this.request<{ platform: Platform }>({
      method: 'GET',
      url: `/api/cubcen/v1/platforms/${id}`,
    })
    return result.platform
  }

  /**
   * Create new platform
   */
  async createPlatform(data: CreatePlatformData): Promise<Platform> {
    const result = await this.request<{ platform: Platform }>({
      method: 'POST',
      url: '/api/cubcen/v1/platforms',
      data,
    })
    return result.platform
  }

  /**
   * Update platform
   */
  async updatePlatform(
    id: string,
    data: UpdatePlatformData
  ): Promise<Platform> {
    const result = await this.request<{ platform: Platform }>({
      method: 'PUT',
      url: `/api/cubcen/v1/platforms/${id}`,
      data,
    })
    return result.platform
  }

  /**
   * Delete platform
   */
  async deletePlatform(id: string): Promise<void> {
    await this.request<void>({
      method: 'DELETE',
      url: `/api/cubcen/v1/platforms/${id}`,
    })
  }

  /**
   * Test platform connection
   */
  async testPlatformConnection(id: string): Promise<SystemHealth> {
    return this.request({
      method: 'POST',
      url: `/api/cubcen/v1/platforms/${id}/test`,
    })
  }

  // Health Methods

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    return this.request({
      method: 'GET',
      url: '/health',
    })
  }

  // Analytics Methods

  /**
   * Get analytics data
   */
  async getAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsData> {
    return this.request({
      method: 'GET',
      url: '/api/cubcen/v1/analytics',
      params: filters,
    })
  }

  // Notification Methods

  /**
   * Get user notifications
   */
  async getNotifications(): Promise<Notification[]> {
    const result = await this.request<{ notifications: Notification[] }>({
      method: 'GET',
      url: '/api/cubcen/v1/notifications',
    })
    return result.notifications
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(id: string): Promise<void> {
    await this.request<void>({
      method: 'PUT',
      url: `/api/cubcen/v1/notifications/${id}/read`,
    })
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const result = await this.request<{ preferences: NotificationPreferences }>(
      {
        method: 'GET',
        url: '/api/cubcen/v1/notifications/preferences',
      }
    )
    return result.preferences
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const result = await this.request<{ preferences: NotificationPreferences }>(
      {
        method: 'PUT',
        url: '/api/cubcen/v1/notifications/preferences',
        data: preferences,
      }
    )
    return result.preferences
  }
}
