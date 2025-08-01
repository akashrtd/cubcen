/**
 * n8n Platform Adapter for Cubcen
 * Provides integration with n8n automation platform
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

// n8n specific types
interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  versionId: string;
  nodes: N8nNode[];
  connections: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
}

interface N8nExecution {
  id: string;
  workflowId: string;
  mode: string;
  retryOf?: string;
  status: 'new' | 'running' | 'success' | 'error' | 'canceled' | 'crashed' | 'waiting';
  startedAt: string;
  stoppedAt?: string;
  workflowData: N8nWorkflow;
  data?: Record<string, unknown>;
  error?: string;
}

interface N8nCredentials {
  apiKey?: string;
  email?: string;
  password?: string;
  token?: string;
}

export class N8nPlatformAdapter extends BasePlatformAdapter {
  private httpClient: ReturnType<typeof axios.create>;
  private circuitBreaker: CircuitBreaker;
  private authToken?: string;
  private tokenExpiresAt?: Date;

  constructor(config: PlatformConfig) {
    super(config);
    this.validateConfig();
    
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
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
    return 'n8n';
  }

  async authenticate(credentials: PlatformCredentials): Promise<AuthResult> {
    try {
      const n8nCreds = credentials as N8nCredentials;
      
      // Handle API key authentication
      if (n8nCreds.apiKey) {
        this.httpClient.defaults.headers.common['X-N8N-API-KEY'] = n8nCreds.apiKey;
        
        // Test the API key by making a simple request
        await this.circuitBreaker.execute(async () => {
          const response = await this.httpClient.get('/workflows');
          return response.data;
        });

        return {
          success: true,
          token: n8nCreds.apiKey
        };
      }

      // Handle email/password authentication
      if (n8nCreds.email && n8nCreds.password) {
        const response = await this.circuitBreaker.execute(async () => {
          return await this.httpClient.post('/login', {
            email: n8nCreds.email,
            password: n8nCreds.password
          });
        });

        if (response.data && (response.data as { token?: string; expiresIn?: number }).token) {
          const authData = response.data as { token: string; expiresIn?: number };
          this.authToken = authData.token;
          this.tokenExpiresAt = new Date(Date.now() + (authData.expiresIn || 3600) * 1000);
          
          this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
          
          return {
            success: true,
            token: this.authToken,
            expiresAt: this.tokenExpiresAt
          };
        }
      }

      throw new Error('Invalid credentials provided');
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
      const workflows = await this.circuitBreaker.execute(async () => {
        const response = await this.httpClient.get('/workflows');
        const data = response.data as { data?: N8nWorkflow[] } | N8nWorkflow[];
        return Array.isArray(data) ? data : (data as { data: N8nWorkflow[] }).data || [];
      });

      const agents: Agent[] = [];

      for (const workflow of workflows) {
        const agent = await this.convertWorkflowToAgent(workflow);
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
      // Get workflow details
      const workflow = await this.circuitBreaker.execute(async () => {
        const response = await this.httpClient.get(`/workflows/${agentId}`);
        const data = response.data as { data?: N8nWorkflow } | N8nWorkflow;
        return (data as { data: N8nWorkflow }).data || (data as N8nWorkflow);
      });

      // Get recent executions to determine status and metrics
      const executions = await this.circuitBreaker.execute(async () => {
        const response = await this.httpClient.get(`/executions`, {
          params: {
            filter: JSON.stringify({ workflowId: agentId }),
            limit: 10,
            includeData: false
          }
        });
        const data = response.data as { data?: N8nExecution[] } | N8nExecution[];
        return Array.isArray(data) ? data : (data as { data: N8nExecution[] }).data || [];
      });

      const metrics = this.calculateAgentMetrics(executions);
      const status = this.determineAgentStatus(workflow, executions);

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
      const execution = await this.circuitBreaker.execute(async () => {
        const response = await this.httpClient.post(`/workflows/${agentId}/execute`, {
          data: params
        });
        const data = response.data as { data?: N8nExecution } | N8nExecution;
        return (data as { data: N8nExecution }).data || (data as N8nExecution);
      });

      // Poll for execution completion
      const result = await this.waitForExecutionCompletion(execution.id);
      
      return {
        success: result.status === 'success',
        data: result.data,
        error: result.status === 'error' ? result.error : undefined,
        executionTime: Date.now() - startTime,
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
    
    // Start polling for events (n8n doesn't have native webhooks in community edition)
    this.startEventPolling();
  }

  async unsubscribeFromEvents(callback: EventCallback): Promise<void> {
    this.removeEventCallback(callback);
  }

  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      await this.circuitBreaker.execute(async () => {
        const response = await this.httpClient.get('/healthz');
        return response.data as { status: string };
      });

      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        lastCheck: new Date(),
        responseTime,
        details: {
          circuitBreakerState: this.circuitBreaker.getStats().state,
          authenticated: !!this.authToken || !!this.httpClient.defaults.headers.common['X-N8N-API-KEY']
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
    this.authToken = undefined;
    this.tokenExpiresAt = undefined;
    
    // Clear authentication headers
    delete this.httpClient.defaults.headers.common['Authorization'];
    delete this.httpClient.defaults.headers.common['X-N8N-API-KEY'];
  }

  private setupHttpInterceptors(): void {
    // Request interceptor for retry logic
    this.httpClient.interceptors.request.use(
      (config) => {
        // Add request timestamp for timeout tracking
        (config as unknown as Record<string, unknown>).metadata = { startTime: Date.now() };
        return config;
      },
      (error: unknown) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error: Error & { response?: { status?: number } }) => {
        // Handle token expiration
        if (error.response?.status === 401 && this.authToken) {
          this.authToken = undefined;
          this.tokenExpiresAt = undefined;
          delete this.httpClient.defaults.headers.common['Authorization'];
        }

        return Promise.reject(error);
      }
    );
  }

  private async convertWorkflowToAgent(workflow: N8nWorkflow): Promise<Agent> {
    const capabilities = this.extractCapabilities(workflow);
    
    return {
      id: workflow.id,
      name: workflow.name,
      platformId: this.config.id,
      platformType: 'n8n',
      status: workflow.active ? 'active' : 'inactive',
      capabilities,
      configuration: {
        tags: workflow.tags || [],
        nodeCount: workflow.nodes?.length || 0,
        versionId: workflow.versionId,
        settings: workflow.settings || {}
      },
      healthStatus: {
        status: 'healthy',
        lastCheck: new Date()
      },
      createdAt: new Date(workflow.createdAt),
      updatedAt: new Date(workflow.updatedAt)
    };
  }

  private extractCapabilities(workflow: N8nWorkflow): string[] {
    const capabilities: string[] = [];
    
    if (workflow.nodes) {
      const nodeTypes = new Set(workflow.nodes.map(node => node.type));
      capabilities.push(...Array.from(nodeTypes));
    }

    if (workflow.tags) {
      capabilities.push(...workflow.tags.map(tag => `tag:${tag}`));
    }

    return capabilities;
  }

  private calculateAgentMetrics(executions: N8nExecution[]) {
    if (!executions || executions.length === 0) {
      return {
        tasksCompleted: 0,
        averageExecutionTime: 0,
        errorRate: 0
      };
    }

    const completedExecutions = executions.filter(e => e.stoppedAt);
    const errorExecutions = executions.filter(e => e.status === 'error' || e.status === 'crashed');
    
    const totalExecutionTime = completedExecutions.reduce((sum, execution) => {
      const start = new Date(execution.startedAt).getTime();
      const end = new Date(execution.stoppedAt!).getTime();
      return sum + (end - start);
    }, 0);

    return {
      tasksCompleted: completedExecutions.length,
      averageExecutionTime: completedExecutions.length > 0 ? totalExecutionTime / completedExecutions.length : 0,
      errorRate: executions.length > 0 ? errorExecutions.length / executions.length : 0
    };
  }

  private determineAgentStatus(workflow: N8nWorkflow, executions: N8nExecution[]): 'active' | 'inactive' | 'error' | 'maintenance' {
    if (!workflow.active) {
      return 'inactive';
    }

    const recentExecutions = executions.slice(0, 5);
    const recentErrors = recentExecutions.filter(e => e.status === 'error' || e.status === 'crashed');
    
    if (recentErrors.length >= 3) {
      return 'error';
    }

    const runningExecutions = executions.filter(e => e.status === 'running');
    if (runningExecutions.length > 0) {
      return 'active';
    }

    return 'active';
  }

  private getCurrentTask(executions: N8nExecution[]): string | undefined {
    const runningExecution = executions.find(e => e.status === 'running');
    return runningExecution ? `Execution ${runningExecution.id}` : undefined;
  }

  private async waitForExecutionCompletion(executionId: string, maxWaitTime = 300000): Promise<N8nExecution> {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const execution = await this.circuitBreaker.execute(async () => {
          const response = await this.httpClient.get(`/executions/${executionId}`);
          const data = response.data as { data?: N8nExecution } | N8nExecution;
          return (data as { data: N8nExecution }).data || (data as N8nExecution);
        });

        if (execution.status !== 'running' && execution.status !== 'new') {
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
    // In production, this could be replaced with webhooks or WebSocket connections
    setInterval(async () => {
      try {
        const executions = await this.circuitBreaker.execute(async () => {
          const response = await this.httpClient.get('/executions', {
            params: {
              limit: 10,
              includeData: false
            }
          });
          const data = response.data as { data?: N8nExecution[] } | N8nExecution[];
          return Array.isArray(data) ? data : (data as { data: N8nExecution[] }).data || [];
        });

        // Emit events for completed executions
        executions.forEach((execution: N8nExecution) => {
          if (execution.status === 'success' || execution.status === 'error') {
            const event: PlatformEvent = {
              type: execution.status === 'success' ? 'task_completed' : 'error_occurred',
              agentId: execution.workflowId,
              data: execution,
              timestamp: new Date(execution.stoppedAt || execution.startedAt)
            };
            
            this.emitEvent(event);
          }
        });
      } catch (error) {
        // Log error but don't throw to avoid breaking the polling loop
        console.error('Error polling n8n executions:', error);
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
      throw new Error('n8n adapter requires credentials configuration');
    }

    const creds = this.config.credentials as N8nCredentials;
    if (!creds.apiKey && !(creds.email && creds.password)) {
      throw new Error('n8n adapter requires either apiKey or email/password credentials');
    }
  }
}