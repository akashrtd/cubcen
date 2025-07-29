/**
 * Platform adapter types and interfaces for Cubcen
 */

export type PlatformType = 'n8n' | 'make' | 'zapier';

export interface PlatformCredentials {
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  oauthToken?: string;
  refreshToken?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface PlatformConfig {
  id: string;
  name: string;
  type: PlatformType;
  baseUrl: string;
  credentials: PlatformCredentials;
  timeout?: number;
  retryAttempts?: number;
  circuitBreakerThreshold?: number;
}

export interface Agent {
  id: string;
  name: string;
  platformId: string;
  platformType: PlatformType;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  capabilities: string[];
  configuration: Record<string, unknown>;
  healthStatus: HealthStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  lastCheck: Date;
  responseTime?: number;
  details?: Record<string, unknown>;
  error?: string;
}

export interface ExecutionParams {
  [key: string]: unknown;
}

export interface ExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  expiresAt?: Date;
  error?: string;
}

export interface AgentStatus {
  id: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  lastSeen: Date;
  currentTask?: string;
  metrics?: {
    tasksCompleted: number;
    averageExecutionTime: number;
    errorRate: number;
  };
}

export type EventCallback = (event: PlatformEvent) => void;

export interface PlatformEvent {
  type: 'agent_status_changed' | 'task_completed' | 'error_occurred';
  agentId: string;
  data: unknown;
  timestamp: Date;
}

export interface ConnectionStatus {
  connected: boolean;
  lastConnected?: Date;
  error?: string;
}