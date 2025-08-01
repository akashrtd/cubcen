/**
 * Make.com Platform Adapter for Cubcen
 * Provides integration with Make.com automation platform
 */

import axios from 'axios';
import { BasePlatformAdapter } from './base-adapter';
import { CircuitBreaker, createPlatformCircuitBreaker } from '../../lib/circuit-breaker';
import {
  Agent,
  AgentStatus,
  AuthResult,
  ConnectionStatus,
  EventCallback,
  ExecutionParams,
  ExecutionResult,
  HealthStatus,
  PlatformConfig,
  PlatformCredentials,
  PlatformEvent,
  PlatformType
} from '../../types/platform';

// Make.com specific types
interface MakeScenario {
  id: number;
  name: string;
  is_active: boolean;
  is_locked: boolean;
  folder_id?: number;
  team_id: number;
  created_at: string;
  updated_at: string;
  last_edit: string;
  scheduling?: {
    type: 'indefinitely' | 'times' | 'until';
    interval: number;
  };
  blueprint?: {
    flow: MakeModule[];
    metadata: Record<string, unknown>;
  };
}

interface MakeModule {
  id: number;
  module: string;
  version: number;
  parameters: Record<string, unknown>;
  mapper: Record<string, unknown>;
  metadata: {
    designer: {
      x: number;
      y: number;
    };
    restore?: Record<string, unknown>;
  };
}

interface MakeExecution {
  id: number;
  scenario_id: number;
  status: 'success' | 'error' | 'incomplete' | 'warning';
  created_at: string;
  updated_at: string;
  started_at: string;
  finished_at?: string;
  execution_time?: number;
  operations_count: number;
  data_transfer: number;
  error?: {
    message: string;
    type: string;
    details?: Record<string, unknown>;
  };
}

interface MakeCredentials {
  apiToken?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  teamId?: number;
}

interface MakeOAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export class MakePlatformAdapter extends BasePlatformAdapter {
  private httpClient: ReturnType<typeof axios.create>;
  private circuitBreaker: CircuitBreaker;
  private accessToken?: string;
  private refreshToken?: string;
  private tokenExpiresAt?: Date;
  private teamId?: number;

  constructor(config: PlatformConfig) {
    super(config);
    this.validateConfig();
    
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl || 'https://eu1.make.com/api/v2',
      timeout: this.config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cubcen/1.0.0'
      }
    });

    this.circuitBreaker = createPlatformCircuitBreaker({
      failureThreshold: this.config.circuitBreakerThreshold || 3,
      recoveryTimeout: 30000,
      monitoringPeriod: 5000
    });

    this.setupHttpInterceptors();
  }

  getPlatformType(): PlatformType {
    return 'make';
  }

  async authenticate(credentials: PlatformCredentials): Promise<AuthResult> {
    try {
      const makeCreds = credentials as MakeCredentials;
      
      // Handle API token authentication (simpler approach)
      if (makeCreds.apiToken) {
        this.httpClient.defaults.headers.common['Authorization'] = `Token ${makeCreds.apiToken}`;
        this.teamId = makeCreds.teamId;
        
        // Test the API token by making a simple request
        await this.circuitBreaker.execute(async () => {
          const response = await this.httpClient.get('/scenarios');
          return response.data;
        });

        return {
          success: true,
          token: makeCreds.apiToken
        };
      }

      // Handle OAuth 2.0 authentication
      if (makeCreds.accessToken) {
        this.accessToken = makeCreds.accessToken;
        this.refreshToken = makeCreds.refreshToken;
        this.teamId = makeCreds.teamId;
        
        // Calculate token expiration (Make.com tokens typically last 1 hour)
        this.tokenExpiresAt = new Date(Date.now() + 3600 * 1000);
        
        this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
        
        // Test the access token
        await this.circuitBreaker.execute(async () => {
          const response = await this.httpClient.get('/scenarios');
          return response.data;
        });

        return {
          success: true,
          token: this.accessToken,
          expiresAt: this.tokenExpiresAt
        };
      }

      // Handle OAuth flow with client credentials
      if (makeCreds.clientId && makeCreds.clientSecret && makeCreds.refreshToken) {
        const tokenResponse = await this.refreshAccessToken(
          makeCreds.clientId,
          makeCreds.clientSecret,
          makeCreds.refreshToken
        );

        this.accessToken = tokenResponse.access_token;
        this.refreshToken = tokenResponse.refresh_token;
        this.tokenExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);
        this.teamId = makeCreds.teamId;

        this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;

        return {
          success: true,
          token: this.accessToken,
          expiresAt: this.tokenExpiresAt
        };
      }

      throw new Error('Invalid credentials provided. Requires apiToken or OAuth credentials.');
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      this.setLastError(new Error(`Authentication failed: ${errorMessage}`));
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async discoverAgents(): Promise<Agent[]> {
    try {
      const scenarios = await this.circuitBreaker.execute(async () => {
        const params: Record<string, unknown> = {};
        if (this.teamId) {
          params.teamId = this.teamId;
        }
        
        const response = await this.httpClient.get('/scenarios', {
          params: Object.keys(params).length > 0 ? params : undefined
        });
        return response.data as MakeScenario[];
      });

      const agents: Agent[] = [];

      for (const scenario of scenarios) {
        const agent = await this.convertScenarioToAgent(scenario);
        agents.push(agent);
      }

      return agents;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      this.setLastError(new Error(`Failed to discover agents: ${errorMessage}`));
      throw error;
    }
  }

  async getAgentStatus(agentId: string): Promise<AgentStatus> {
    try {
      // Get scenario details
      const scenario = await this.circuitBreaker.execute(async () => {
        const response = await this.httpClient.get(`/scenarios/${agentId}`, {
          params: this.teamId ? { teamId: this.teamId } : undefined
        });
        return response.data as MakeScenario;
      });

      // Get recent executions to determine status and metrics
      const executions = await this.circuitBreaker.execute(async () => {
        const response = await this.httpClient.get(`/scenarios/${agentId}/executions`, {
          params: {
            limit: 10,
            ...(this.teamId ? { teamId: this.teamId } : {})
          }
        });
        return response.data as MakeExecution[];
      });

      const metrics = this.calculateAgentMetrics(executions);
      const status = this.determineAgentStatus(scenario, executions);

      return {
        id: agentId,
        status,
        lastSeen: new Date(),
        currentTask: this.getCurrentTask(executions),
        metrics
      };
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      this.setLastError(new Error(`Failed to get agent status: ${errorMessage}`));
      
      return {
        id: agentId,
        status: 'error',
        lastSeen: new Date(),
        metrics: {
          tasksCompleted: 0,
          averageExecutionTime: 0,
          errorRate: 1
        }
      };
    }
  }

  async executeAgent(agentId: string, params: ExecutionParams): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Make.com scenarios are typically triggered by webhooks or schedules
      // For manual execution, we'll use the run endpoint if available
      const execution = await this.circuitBreaker.execute(async () => {
        const response = await this.httpClient.post(`/scenarios/${agentId}/run`, {
          data: params,
          ...(this.teamId ? { teamId: this.teamId } : {})
        });
        return response.data as MakeExecution;
      });

      // Wait for execution completion
      const result = await this.waitForExecutionCompletion(execution.id);
      
      return {
        success: result.status === 'success',
        data: result,
        error: result.status === 'error' ? result.error?.message : undefined,
        executionTime: result.execution_time || (Date.now() - startTime),
        timestamp: new Date()
      };
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      this.setLastError(new Error(`Failed to execute agent: ${errorMessage}`));
      
      return {
        success: false,
        error: errorMessage,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  async subscribeToEvents(callback: EventCallback): Promise<void> {
    this.addEventCallback(callback);
    
    // Start polling for events (Make.com doesn't provide real-time webhooks for all events)
    this.startEventPolling();
  }

  async unsubscribeFromEvents(callback: EventCallback): Promise<void> {
    this.removeEventCallback(callback);
  }

  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      // Check if we can access scenarios (basic connectivity test)
      await this.circuitBreaker.execute(async () => {
        const response = await this.httpClient.get('/scenarios', {
          params: {
            limit: 1,
            ...(this.teamId ? { teamId: this.teamId } : {})
          }
        });
        return response.data;
      });

      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        lastCheck: new Date(),
        responseTime,
        details: {
          circuitBreakerState: this.circuitBreaker.getStats().state,
          authenticated: !!this.accessToken || !!this.httpClient.defaults.headers.common['Authorization'],
          tokenExpiry: this.tokenExpiresAt?.toISOString()
        }
      };
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        error: errorMessage,
        details: {
          circuitBreakerState: this.circuitBreaker.getStats().state
        }
      };
    }
  }

  async connect(): Promise<ConnectionStatus> {
    try {
      // Authenticate if credentials are provided
      if (this.config.credentials) {
        const authResult = await this.authenticate(this.config.credentials);
        if (!authResult.success) {
          throw new Error(authResult.error || 'Authentication failed');
        }
      }

      // Perform health check
      const health = await this.healthCheck();
      if (health.status !== 'healthy') {
        throw new Error(health.error || 'Health check failed');
      }

      this.setConnected(true);
      
      return {
        connected: true,
        lastConnected: new Date()
      };
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      this.setLastError(new Error(`Connection failed: ${errorMessage}`));
      this.setConnected(false);
      
      return {
        connected: false,
        error: errorMessage
      };
    }
  }

  async disconnect(): Promise<void> {
    this.setConnected(false);
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.tokenExpiresAt = undefined;
    this.teamId = undefined;
    
    // Clear authentication headers
    delete this.httpClient.defaults.headers.common['Authorization'];
  }

  private async refreshAccessToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ): Promise<MakeOAuthTokenResponse> {
    try {
      const response = await axios.post('https://eu1.make.com/oauth/token', {
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data as MakeOAuthTokenResponse;
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${this.extractErrorMessage(error)}`);
    }
  }

  private setupHttpInterceptors(): void {
    // Request interceptor for retry logic and token refresh
    this.httpClient.interceptors.request.use(
      (config) => {
        // Check if token needs refresh (simplified for now)
        if (this.tokenExpiresAt && this.refreshToken && new Date() >= this.tokenExpiresAt) {
          // Token refresh would happen here in a real implementation
          console.warn('Token expired, refresh needed');
        }

        // Add request timestamp for timeout tracking
        (config as unknown as Record<string, unknown>).metadata = { startTime: Date.now() };
        return config;
      },
      (error: unknown) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error: Error & { response?: { status?: number; headers?: Record<string, string> } }) => {
        // Handle token expiration
        if (error.response?.status === 401) {
          this.accessToken = undefined;
          this.tokenExpiresAt = undefined;
          delete this.httpClient.defaults.headers.common['Authorization'];
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers?.['retry-after'];
          if (retryAfter) {
            const delay = parseInt(retryAfter) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async convertScenarioToAgent(scenario: MakeScenario): Promise<Agent> {
    const capabilities = this.extractCapabilities(scenario);
    
    // Determine status: locked takes precedence over active/inactive
    let status: 'active' | 'inactive' | 'error' | 'maintenance';
    if (scenario.is_locked) {
      status = 'maintenance';
    } else if (scenario.is_active) {
      status = 'active';
    } else {
      status = 'inactive';
    }
    
    return {
      id: scenario.id.toString(),
      name: scenario.name,
      platformId: this.config.id,
      platformType: 'make',
      status,
      capabilities,
      configuration: {
        folderId: scenario.folder_id,
        teamId: scenario.team_id,
        scheduling: scenario.scheduling,
        moduleCount: scenario.blueprint?.flow?.length || 0,
        isLocked: scenario.is_locked
      },
      healthStatus: {
        status: 'healthy',
        lastCheck: new Date()
      },
      createdAt: new Date(scenario.created_at),
      updatedAt: new Date(scenario.updated_at)
    };
  }

  private extractCapabilities(scenario: MakeScenario): string[] {
    const capabilities: string[] = [];
    
    if (scenario.blueprint?.flow) {
      const moduleTypes = new Set(scenario.blueprint.flow.map(module => module.module));
      capabilities.push(...Array.from(moduleTypes));
    }

    if (scenario.scheduling) {
      capabilities.push(`scheduling:${scenario.scheduling.type}`);
    }

    if (scenario.is_active) {
      capabilities.push('active');
    }

    return capabilities;
  }

  private calculateAgentMetrics(executions: MakeExecution[]) {
    if (!executions || executions.length === 0) {
      return {
        tasksCompleted: 0,
        averageExecutionTime: 0,
        errorRate: 0
      };
    }

    const completedExecutions = executions.filter(e => e.finished_at);
    const errorExecutions = executions.filter(e => e.status === 'error');
    
    const totalExecutionTime = completedExecutions.reduce((sum, execution) => {
      return sum + (execution.execution_time || 0);
    }, 0);

    return {
      tasksCompleted: completedExecutions.length,
      averageExecutionTime: completedExecutions.length > 0 ? totalExecutionTime / completedExecutions.length : 0,
      errorRate: executions.length > 0 ? errorExecutions.length / executions.length : 0
    };
  }

  private determineAgentStatus(scenario: MakeScenario, executions: MakeExecution[]): 'active' | 'inactive' | 'error' | 'maintenance' {
    if (scenario.is_locked) {
      return 'maintenance';
    }

    if (!scenario.is_active) {
      return 'inactive';
    }

    const recentExecutions = executions.slice(0, 5);
    const recentErrors = recentExecutions.filter(e => e.status === 'error');
    
    if (recentErrors.length >= 3) {
      return 'error';
    }

    return 'active';
  }

  private getCurrentTask(executions: MakeExecution[]): string | undefined {
    const runningExecution = executions.find(e => !e.finished_at && e.started_at);
    return runningExecution ? `Execution ${runningExecution.id}` : undefined;
  }

  private async waitForExecutionCompletion(executionId: number, maxWaitTime = 300000): Promise<MakeExecution> {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const execution = await this.circuitBreaker.execute(async () => {
          const response = await this.httpClient.get(`/executions/${executionId}`, {
            params: this.teamId ? { teamId: this.teamId } : undefined
          });
          return response.data as MakeExecution;
        });

        if (execution.finished_at) {
          return execution;
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        // If we can't get execution status, assume it failed
        throw error;
      }
    }

    throw new Error(`Execution ${executionId} timed out after ${maxWaitTime}ms`);
  }

  private startEventPolling(): void {
    // Simple polling implementation for MVP
    // In production, this could be replaced with webhooks
    setInterval(async () => {
      try {
        const executions = await this.circuitBreaker.execute(async () => {
          const response = await this.httpClient.get('/executions', {
            params: {
              limit: 10,
              ...(this.teamId ? { teamId: this.teamId } : {})
            }
          });
          return response.data as MakeExecution[];
        });

        // Emit events for completed executions
        executions.forEach((execution: MakeExecution) => {
          if (execution.finished_at) {
            const event: PlatformEvent = {
              type: execution.status === 'success' ? 'task_completed' : 'error_occurred',
              agentId: execution.scenario_id.toString(),
              data: execution,
              timestamp: new Date(execution.finished_at)
            };
            
            this.emitEvent(event);
          }
        });
      } catch (error) {
        // Log error but don't throw to avoid breaking the polling loop
        console.error('Error polling Make.com executions:', error);
      }
    }, 30000); // Poll every 30 seconds
  }

  private extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
      const axiosError = error as Record<string, unknown>;
      
      // Handle axios errors
      if (axiosError.response && typeof axiosError.response === 'object') {
        const response = axiosError.response as Record<string, unknown>;
        if (response.data && typeof response.data === 'object') {
          const data = response.data as Record<string, unknown>;
          if (typeof data.message === 'string') {
            return data.message;
          }
          if (typeof data.error === 'string') {
            return data.error;
          }
        }
        if (typeof response.statusText === 'string' && typeof response.status === 'number') {
          return `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      if (typeof axiosError.code === 'string') {
        return `Network error: ${axiosError.code}`;
      }
      if (typeof axiosError.message === 'string') {
        return axiosError.message;
      }
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'Unknown error occurred';
  }

  protected validateConfig(): void {
    super.validateConfig();
    
    if (!this.config.credentials) {
      throw new Error('Make.com adapter requires credentials configuration');
    }

    const creds = this.config.credentials as MakeCredentials;
    if (!creds.apiToken && !creds.accessToken && !(creds.clientId && creds.clientSecret)) {
      throw new Error('Make.com adapter requires either apiToken, accessToken, or OAuth client credentials');
    }
  }
}