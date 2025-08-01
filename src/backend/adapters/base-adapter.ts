/**
 * Base Platform Adapter Interface for Cubcen
 * Defines the contract that all platform adapters must implement
 */

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

export abstract class BasePlatformAdapter {
  protected config: PlatformConfig
  protected isConnected: boolean = false
  protected lastError?: Error
  protected eventCallbacks: EventCallback[] = []

  constructor(config: PlatformConfig) {
    this.config = config
  }

  /**
   * Get the platform type
   */
  abstract getPlatformType(): PlatformType

  /**
   * Authenticate with the platform using provided credentials
   */
  abstract authenticate(credentials: PlatformCredentials): Promise<AuthResult>

  /**
   * Discover all available agents on the platform
   */
  abstract discoverAgents(): Promise<Agent[]>

  /**
   * Get the current status of a specific agent
   */
  abstract getAgentStatus(agentId: string): Promise<AgentStatus>

  /**
   * Execute an agent with given parameters
   */
  abstract executeAgent(
    agentId: string,
    params: ExecutionParams
  ): Promise<ExecutionResult>

  /**
   * Subscribe to platform events
   */
  abstract subscribeToEvents(callback: EventCallback): Promise<void>

  /**
   * Unsubscribe from platform events
   */
  abstract unsubscribeFromEvents(callback: EventCallback): Promise<void>

  /**
   * Perform a health check on the platform connection
   */
  abstract healthCheck(): Promise<HealthStatus>

  /**
   * Connect to the platform
   */
  abstract connect(): Promise<ConnectionStatus>

  /**
   * Disconnect from the platform
   */
  abstract disconnect(): Promise<void>

  /**
   * Get platform configuration
   */
  getConfig(): PlatformConfig {
    return { ...this.config }
  }

  /**
   * Update platform configuration
   */
  updateConfig(config: Partial<PlatformConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Check if adapter is connected
   */
  isAdapterConnected(): boolean {
    return this.isConnected
  }

  /**
   * Get the last error that occurred
   */
  getLastError(): Error | undefined {
    return this.lastError
  }

  /**
   * Set connection status
   */
  protected setConnected(connected: boolean): void {
    this.isConnected = connected
  }

  /**
   * Set last error
   */
  protected setLastError(error: Error): void {
    this.lastError = error
  }

  /**
   * Emit an event to all subscribers
   */
  protected emitEvent(event: PlatformEvent): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in event callback:', error)
      }
    })
  }

  /**
   * Add event callback
   */
  protected addEventCallback(callback: EventCallback): void {
    this.eventCallbacks.push(callback)
  }

  /**
   * Remove event callback
   */
  protected removeEventCallback(callback: EventCallback): void {
    const index = this.eventCallbacks.indexOf(callback)
    if (index > -1) {
      this.eventCallbacks.splice(index, 1)
    }
  }

  /**
   * Validate configuration
   */
  protected validateConfig(): void {
    if (!this.config.id) {
      throw new Error('Platform configuration must have an id')
    }
    if (!this.config.name) {
      throw new Error('Platform configuration must have a name')
    }
    if (!this.config.type) {
      throw new Error('Platform configuration must have a type')
    }
    if (!this.config.baseUrl) {
      throw new Error('Platform configuration must have a baseUrl')
    }
  }
}
