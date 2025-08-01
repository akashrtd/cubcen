/**
 * Cubcen SDK Type Definitions
 * TypeScript types for the Cubcen API client
 */

// Base API Response
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: unknown
    timestamp: string
    requestId: string
  }
}

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationResult {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Authentication
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role?: 'admin' | 'operator' | 'viewer'
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResult {
  user: User
  tokens: AuthTokens
}

// User
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'operator' | 'viewer'
  permissions: string[]
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

// Agent
export interface Agent {
  id: string
  name: string
  platformId: string
  platformType: 'n8n' | 'make' | 'zapier'
  externalId: string
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'MAINTENANCE'
  capabilities: string[]
  configuration: Record<string, unknown>
  description?: string
  healthStatus: HealthStatus
  createdAt: string
  updatedAt: string
}

export interface CreateAgentData {
  name: string
  platformId: string
  externalId: string
  capabilities?: string[]
  configuration?: Record<string, unknown>
  description?: string
}

export interface UpdateAgentData {
  name?: string
  capabilities?: string[]
  configuration?: Record<string, unknown>
  description?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
}

export interface AgentFilters extends PaginationParams {
  platformType?: 'N8N' | 'MAKE' | 'ZAPIER'
  status?: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'MAINTENANCE'
  search?: string
}

// Task
export interface Task {
  id: string
  agentId: string
  workflowId?: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  scheduledAt: string
  startedAt?: string
  completedAt?: string
  parameters: Record<string, unknown>
  result?: Record<string, unknown>
  error?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface CreateTaskData {
  agentId: string
  workflowId?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  scheduledAt?: string
  parameters?: Record<string, unknown>
}

export interface TaskFilters extends PaginationParams {
  agentId?: string
  status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  dateFrom?: string
  dateTo?: string
}

// Platform
export interface Platform {
  id: string
  name: string
  type: 'N8N' | 'MAKE' | 'ZAPIER'
  baseUrl: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  lastSyncAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePlatformData {
  name: string
  type: 'N8N' | 'MAKE' | 'ZAPIER'
  baseUrl: string
  credentials: Record<string, unknown>
}

export interface UpdatePlatformData {
  name?: string
  baseUrl?: string
  credentials?: Record<string, unknown>
}

// Health Status
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  lastCheck: string
  details?: Record<string, unknown>
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded'
  checks: HealthCheck[]
  timestamp: string
}

export interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  lastCheck: string
  details?: Record<string, unknown>
}

// Analytics
export interface AnalyticsData {
  totalAgents: number
  activeAgents: number
  totalTasks: number
  completedTasks: number
  failedTasks: number
  averageExecutionTime: number
  successRate: number
  errorRate: number
}

export interface AnalyticsFilters {
  dateFrom?: string
  dateTo?: string
  agentId?: string
  platformType?: 'N8N' | 'MAKE' | 'ZAPIER'
}

// Notifications
export interface Notification {
  id: string
  userId: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  title: string
  message: string
  read: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationPreferences {
  id: string
  userId: string
  emailEnabled: boolean
  slackEnabled: boolean
  inAppEnabled: boolean
  errorAlerts: boolean
  taskCompletionAlerts: boolean
  agentStatusAlerts: boolean
  createdAt: string
  updatedAt: string
}

// WebSocket Events
export interface WebSocketEvent {
  type: string
  data: unknown
  timestamp: string
}

// Client Configuration
export interface CubcenClientConfig {
  baseUrl: string
  apiKey?: string
  timeout?: number
  retries?: number
  debug?: boolean
}
