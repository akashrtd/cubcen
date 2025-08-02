/**
 * Mock Platform Adapter for Cubcen
 * Used for testing and development purposes
 */

import { BasePlatformAdapter } from './base-adapter'
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
  PlatformType,
} from '../../types/platform'

export class MockPlatformAdapter extends BasePlatformAdapter {
  private mockAgents: Agent[] = []
  private mockDelay: number = 100
  private shouldFailAuth: boolean = false
  private shouldFailHealthCheck: boolean = false
  private shouldFailExecution: boolean = false
  private eventInterval?: NodeJS.Timeout

  constructor(config: PlatformConfig) {
    super(config)
    this.initializeMockData()
  }

  getPlatformType(): PlatformType {
    return this.config.type
  }

  async authenticate(_credentials: PlatformCredentials): Promise<AuthResult> {
    await this.delay()

    if (this.shouldFailAuth) {
      return {
        success: false,
        error: 'Mock authentication failure',
      }
    }

    return {
      success: true,
      token: 'mock-token-' + Date.now(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    }
  }

  async discoverAgents(): Promise<Agent[]> {
    await this.delay()
    return [...this.mockAgents]
  }

  async getAgentStatus(agentId: string): Promise<AgentStatus> {
    await this.delay()

    const agent = this.mockAgents.find(a => a.id === agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    return {
      id: agentId,
      status: agent.status,
      lastSeen: new Date(),
      currentTask: Math.random() > 0.7 ? 'mock-task-' + Date.now() : undefined,
      metrics: {
        tasksCompleted: Math.floor(Math.random() * 100),
        averageExecutionTime: Math.floor(Math.random() * 5000),
        errorRate: Math.random() * 0.1,
      },
    }
  }

  async executeAgent(
    agentId: string,
    params: ExecutionParams
  ): Promise<ExecutionResult> {
    const startTime = Date.now()
    await this.delay()

    if (this.shouldFailExecution) {
      return {
        success: false,
        error: 'Mock execution failure',
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
      }
    }

    // Emit execution event
    this.emitEvent({
      type: 'task_completed',
      agentId,
      data: { params, result: 'success' },
      timestamp: new Date(),
    })

    return {
      success: true,
      data: {
        result: 'Mock execution successful',
        params,
        agentId,
        executionId: 'mock-exec-' + Date.now(),
      },
      executionTime: Date.now() - startTime,
      timestamp: new Date(),
    }
  }

  async subscribeToEvents(callback: EventCallback): Promise<void> {
    this.addEventCallback(callback)

    // Start emitting mock events periodically
    if (!this.eventInterval) {
      this.eventInterval = setInterval(() => {
        if (this.mockAgents.length > 0) {
          const randomAgent =
            this.mockAgents[Math.floor(Math.random() * this.mockAgents.length)]
          const eventTypes: PlatformEvent['type'][] = [
            'agent_status_changed',
            'task_completed',
            'error_occurred',
          ]
          const randomEventType =
            eventTypes[Math.floor(Math.random() * eventTypes.length)]

          this.emitEvent({
            type: randomEventType,
            agentId: randomAgent.id,
            data: { message: `Mock ${randomEventType} event` },
            timestamp: new Date(),
          })
        }
      }, 1000) // Emit events every 1 second for testing
    }
  }

  async unsubscribeFromEvents(callback: EventCallback): Promise<void> {
    this.removeEventCallback(callback)

    // Stop emitting events if no callbacks remain
    if (this.eventCallbacks.length === 0 && this.eventInterval) {
      clearInterval(this.eventInterval)
      this.eventInterval = undefined
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now()
    await this.delay()

    if (this.shouldFailHealthCheck) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        error: 'Mock health check failure',
      }
    }

    return {
      status: 'healthy',
      lastCheck: new Date(),
      responseTime: Date.now() - startTime,
      details: {
        platform: this.config.type,
        agentCount: this.mockAgents.length,
        mockAdapter: true,
      },
    }
  }

  async connect(): Promise<ConnectionStatus> {
    await this.delay()

    try {
      const authResult = await this.authenticate(this.config.credentials)
      if (!authResult.success) {
        throw new Error(authResult.error || 'Authentication failed')
      }

      this.setConnected(true)
      return {
        connected: true,
        lastConnected: new Date(),
      }
    } catch (error) {
      this.setConnected(false)
      this.setLastError(error as Error)
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.delay()

    if (this.eventInterval) {
      clearInterval(this.eventInterval)
      this.eventInterval = undefined
    }

    this.setConnected(false)
  }

  // Mock configuration methods
  setMockDelay(delay: number): void {
    this.mockDelay = delay
  }

  setShouldFailAuth(shouldFail: boolean): void {
    this.shouldFailAuth = shouldFail
  }

  setShouldFailHealthCheck(shouldFail: boolean): void {
    this.shouldFailHealthCheck = shouldFail
  }

  setShouldFailExecution(shouldFail: boolean): void {
    this.shouldFailExecution = shouldFail
  }

  addMockAgent(agent: Partial<Agent>): void {
    const mockAgent: Agent = {
      id: agent.id || 'mock-agent-' + Date.now(),
      name: agent.name || 'Mock Agent',
      platformId: this.config.id,
      platformType: this.config.type,
      status: agent.status || 'active',
      capabilities: agent.capabilities || ['mock-capability'],
      configuration: agent.configuration || {},
      healthStatus: agent.healthStatus || {
        status: 'healthy',
        lastCheck: new Date(),
      },
      createdAt: agent.createdAt || new Date(),
      updatedAt: agent.updatedAt || new Date(),
    }

    this.mockAgents.push(mockAgent)
  }

  clearMockAgents(): void {
    this.mockAgents = []
  }

  private async delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.mockDelay))
  }

  private initializeMockData(): void {
    // Create some default mock agents
    for (let i = 1; i <= 3; i++) {
      this.addMockAgent({
        id: `mock-agent-${i}`,
        name: `Mock Agent ${i}`,
        status: i === 3 ? 'error' : 'active',
        capabilities: [`capability-${i}`, 'mock-capability'],
        configuration: {
          setting1: `value${i}`,
          setting2: i * 10,
        },
      })
    }
  }
}
// Export alias for backward compatibility
export { MockPlatformAdapter as MockAdapter }