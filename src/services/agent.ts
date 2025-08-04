/**
 * Cubcen Agent Management Service
 * Handles agent registration, status tracking, health monitoring, and configuration management
 */

import { AgentStatus } from '@/generated/prisma'
import { AgentHealth, Agent, Platform, prisma } from '@/lib/database'
import { structuredLogger as logger } from '@/lib/logger'
import {
  AdapterFactory,
  AdapterManager,
} from '@/backend/adapters/adapter-factory'
import { BasePlatformAdapter } from '@/backend/adapters/base-adapter'
import {
  PlatformConfig,
  Agent as PlatformAgent,
  HealthStatus,
} from '@/types/platform'
import { z } from 'zod'

// Forward declaration to avoid circular dependency
interface WebSocketService {
  notifyAgentStatusChange(
    agentId: string,
    status: 'active' | 'inactive' | 'error' | 'maintenance',
    metadata?: Record<string, unknown>
  ): void
  notifyAgentHealthChange(
    agentId: string,
    health: {
      status: 'healthy' | 'unhealthy' | 'degraded'
      lastCheck: Date
      responseTime?: number
      errorCount?: number
      details?: Record<string, unknown>
    }
  ): void
  notifyAgentConnection(
    agentId: string,
    platformId: string,
    connected: boolean,
    reason?: string
  ): void
}

// Validation schemas
const agentRegistrationSchema = z.object({
  name: z.string().min(1).max(100),
  platformId: z.string().min(1),
  externalId: z.string().min(1),
  capabilities: z.array(z.string()).default([]),
  configuration: z.record(z.string(), z.unknown()).default({}),
  description: z.string().optional(),
})

const agentUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  capabilities: z.array(z.string()).optional(),
  configuration: z.record(z.string(), z.unknown()).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
})

const healthCheckConfigSchema = z.object({
  interval: z.number().min(1000).max(300000).default(30000), // 1s to 5min
  timeout: z.number().min(1000).max(60000).default(10000), // 1s to 1min
  retries: z.number().min(0).max(5).default(3),
  enabled: z.boolean().default(true),
})

export interface AgentRegistrationData {
  name: string
  platformId: string
  externalId: string
  capabilities?: string[]
  configuration?: Record<string, unknown>
  description?: string
}

export interface AgentUpdateData {
  name?: string
  capabilities?: string[]
  configuration?: Record<string, unknown>
  description?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
}

export interface HealthCheckConfig {
  interval: number
  timeout: number
  retries: number
  enabled: boolean
}

export interface AgentWithHealth extends Omit<Agent, 'healthStatus'> {
  healthStatus: HealthStatus
  platform: Platform
}

export interface AgentDiscoveryResult {
  discovered: number
  registered: number
  updated: number
  errors: string[]
}

export class AgentService {
  private adapterManager: AdapterManager
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map()
  private healthCheckConfigs: Map<string, HealthCheckConfig> = new Map()
  private webSocketService?: WebSocketService

  constructor(
    adapterManager: AdapterManager,
    webSocketService?: WebSocketService
  ) {
    this.adapterManager = adapterManager
    this.webSocketService = webSocketService
  }

  /**
   * Set WebSocket service for real-time updates (to avoid circular dependency)
   */
  public setWebSocketService(webSocketService: WebSocketService): void {
    this.webSocketService = webSocketService
  }

  /**
   * Register a new agent
   */
  async registerAgent(data: AgentRegistrationData): Promise<Agent> {
    try {
      // Validate input data
      const validatedData = agentRegistrationSchema.parse(data)

      logger.info('Registering new agent', {
        name: validatedData.name,
        platformId: validatedData.platformId,
        externalId: validatedData.externalId,
      })

      // Verify platform exists
      const platform = await prisma.platform.findUnique({
        where: { id: validatedData.platformId },
      })

      if (!platform) {
        throw new Error(
          `Platform with ID ${validatedData.platformId} not found`
        )
      }

      // Check if agent already exists
      const existingAgent = await prisma.agent.findUnique({
        where: {
          platformId_externalId: {
            platformId: validatedData.platformId,
            externalId: validatedData.externalId,
          },
        },
      })

      if (existingAgent) {
        throw new Error(
          `Agent with external ID ${validatedData.externalId} already exists on platform ${validatedData.platformId}`
        )
      }

      // Create agent in database
      const agent = await prisma.agent.create({
        data: {
          name: validatedData.name,
          platformId: validatedData.platformId,
          externalId: validatedData.externalId,
          status: 'INACTIVE',
          capabilities: JSON.stringify(validatedData.capabilities || []),
          configuration: JSON.stringify(validatedData.configuration || {}),
          healthStatus: JSON.stringify({ status: 'unknown', lastCheck: null }),
          description: validatedData.description,
        },
      })

      // Start health monitoring for the new agent
      await this.startHealthMonitoring(agent.id)

      // Notify WebSocket clients about new agent
      this.webSocketService?.notifyAgentStatusChange(agent.id, 'inactive', {
        name: agent.name,
        platformId: agent.platformId,
        registered: true,
      })

      logger.info('Agent registered successfully', {
        agentId: agent.id,
        name: agent.name,
        platformId: agent.platformId,
      })

      return agent
    } catch (error) {
      logger.error('Failed to register agent', error as Error, {
        platformId: data.platformId,
        externalId: data.externalId,
      })
      throw error
    }
  }

  /**
   * Update an existing agent
   */
  async updateAgent(agentId: string, data: AgentUpdateData): Promise<Agent> {
    try {
      // Validate input data
      const validatedData = agentUpdateSchema.parse(data)

      logger.info('Updating agent', { agentId, updateData: validatedData })

      // Check if agent exists
      const existingAgent = await prisma.agent.findUnique({
        where: { id: agentId },
      })

      if (!existingAgent) {
        throw new Error(`Agent with ID ${agentId} not found`)
      }

      // Update agent in database
      const agent = await prisma.agent.update({
        where: { id: agentId },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.capabilities && {
            capabilities: JSON.stringify(validatedData.capabilities),
          }),
          ...(validatedData.configuration && {
            configuration: JSON.stringify(validatedData.configuration),
          }),
          ...(validatedData.description !== undefined && {
            description: validatedData.description,
          }),
          ...(validatedData.status && { status: validatedData.status }),
          updatedAt: new Date(),
        },
      })

      // Notify WebSocket clients about agent update
      if (validatedData.status) {
        const wsStatus = this.mapAgentStatusToWebSocket(validatedData.status)
        this.webSocketService?.notifyAgentStatusChange(agentId, wsStatus, {
          name: agent.name,
          updated: true,
        })
      }

      logger.info('Agent updated successfully', { agentId, name: agent.name })

      return agent
    } catch (error) {
      logger.error('Failed to update agent', error as Error, { agentId })
      throw error
    }
  }

  /**
   * Get agent by ID with health status
   */
  async getAgent(agentId: string): Promise<AgentWithHealth | null> {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        include: { platform: true },
      })

      if (!agent) {
        return null
      }

      // Get latest health status
      const healthStatus = await this.getAgentHealthStatus(agentId)

      return {
        ...agent,
        healthStatus,
      }
    } catch (error) {
      logger.error('Failed to get agent', error as Error, { agentId })
      throw error
    }
  }

  /**
   * Get all agents with filtering and pagination
   */
  async getAgents(
    options: {
      platformType?: string
      status?: AgentStatus
      search?: string
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } = {}
  ): Promise<{
    agents: AgentWithHealth[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const {
        platformType,
        status,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options

      // Build where clause
      const where: Record<string, unknown> = {}

      if (platformType) {
        where.platform = { type: platformType.toUpperCase() }
      }

      if (status) {
        where.status = status
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Get total count
      const total = await prisma.agent.count({ where })

      // Get agents with pagination
      const agents = await prisma.agent.findMany({
        where,
        include: { platform: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      })

      // Add health status to each agent
      const agentsWithHealth = await Promise.all(
        agents.map(async agent => ({
          ...agent,
          healthStatus: await this.getAgentHealthStatus(agent.id),
        }))
      )

      return {
        agents: agentsWithHealth,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      logger.error('Failed to get agents', error as Error, options)
      throw error
    }
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<void> {
    try {
      logger.info('Deleting agent', { agentId })

      // Stop health monitoring
      await this.stopHealthMonitoring(agentId)

      // Delete agent from database (cascade will handle related records)
      await prisma.agent.delete({
        where: { id: agentId },
      })

      logger.info('Agent deleted successfully', { agentId })
    } catch (error) {
      logger.error('Failed to delete agent', error as Error, { agentId })
      throw error
    }
  }

  /**
   * Discover agents from connected platforms
   */
  async discoverAgents(platformId?: string): Promise<AgentDiscoveryResult> {
    try {
      logger.info('Starting agent discovery', { platformId })

      const result: AgentDiscoveryResult = {
        discovered: 0,
        registered: 0,
        updated: 0,
        errors: [],
      }

      // Get platforms to discover from
      const platforms = platformId
        ? await prisma.platform.findMany({ where: { id: platformId } })
        : await prisma.platform.findMany({ where: { status: 'CONNECTED' } })

      for (const platform of platforms) {
        try {
          const adapter = this.adapterManager.getAdapter(platform.id)
          if (!adapter) {
            result.errors.push(`No adapter found for platform ${platform.name}`)
            continue
          }

          // Discover agents from platform
          const platformAgents = await adapter.discoverAgents()
          result.discovered += platformAgents.length

          // Process each discovered agent
          for (const platformAgent of platformAgents) {
            try {
              // Check if agent already exists
              const existingAgent = await prisma.agent.findUnique({
                where: {
                  platformId_externalId: {
                    platformId: platform.id,
                    externalId: platformAgent.id,
                  },
                },
              })

              if (existingAgent) {
                // Update existing agent
                await this.updateAgent(existingAgent.id, {
                  name: platformAgent.name,
                  capabilities: platformAgent.capabilities,
                  configuration: platformAgent.configuration,
                })
                result.updated++
              } else {
                // Register new agent
                await this.registerAgent({
                  name: platformAgent.name,
                  platformId: platform.id,
                  externalId: platformAgent.id,
                  capabilities: platformAgent.capabilities,
                  configuration: platformAgent.configuration,
                })
                result.registered++
              }
            } catch (error) {
              const errorMsg = `Failed to process agent ${platformAgent.name}: ${(error as Error).message}`
              result.errors.push(errorMsg)
              logger.error(
                'Failed to process discovered agent',
                error as Error,
                {
                  platformId: platform.id,
                  agentId: platformAgent.id,
                }
              )
            }
          }
        } catch (error) {
          const errorMsg = `Failed to discover agents from platform ${platform.name}: ${(error as Error).message}`
          result.errors.push(errorMsg)
          logger.error(
            'Failed to discover agents from platform',
            error as Error,
            {
              platformId: platform.id,
            }
          )
        }
      }

      logger.info('Agent discovery completed', result)
      return result
    } catch (error) {
      logger.error('Agent discovery failed', error as Error, { platformId })
      throw error
    }
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<void> {
    try {
      await prisma.agent.update({
        where: { id: agentId },
        data: {
          status,
          updatedAt: new Date(),
        },
      })

      // Notify WebSocket clients about status change
      const wsStatus = this.mapAgentStatusToWebSocket(status)
      this.webSocketService?.notifyAgentStatusChange(agentId, wsStatus, {
        statusUpdate: true,
      })

      logger.info('Agent status updated', { agentId, status })
    } catch (error) {
      logger.error('Failed to update agent status', error as Error, {
        agentId,
        status,
      })
      throw error
    }
  }

  /**
   * Get agent health status
   */
  async getAgentHealthStatus(agentId: string): Promise<HealthStatus> {
    try {
      // Get latest health record
      const healthRecord = await prisma.agentHealth.findFirst({
        where: { agentId },
        orderBy: { lastCheckAt: 'desc' },
      })

      if (!healthRecord) {
        return {
          status: 'unhealthy',
          lastCheck: new Date(),
          details: { message: 'No health data available' },
        }
      }

      return JSON.parse(healthRecord.status) as HealthStatus
    } catch (error) {
      logger.error('Failed to get agent health status', error as Error, {
        agentId,
      })
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        error: (error as Error).message,
      }
    }
  }

  /**
   * Perform health check for an agent
   */
  async performHealthCheck(agentId: string): Promise<HealthStatus> {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        include: { platform: true },
      })

      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`)
      }

      const adapter = this.adapterManager.getAdapter(agent.platformId)
      if (!adapter) {
        throw new Error(`No adapter found for platform ${agent.platformId}`)
      }

      // Perform health check through adapter
      const healthStatus = await adapter.healthCheck()

      // Store health record
      await prisma.agentHealth.create({
        data: {
          agentId,
          status: JSON.stringify(healthStatus),
          responseTime: healthStatus.responseTime,
          lastCheckAt: new Date(),
          errorCount: healthStatus.status === 'unhealthy' ? 1 : 0,
          consecutiveErrors: healthStatus.status === 'unhealthy' ? 1 : 0,
        },
      })

      // Notify WebSocket clients about health update
      this.webSocketService?.notifyAgentHealthChange(agentId, {
        status: healthStatus.status,
        lastCheck: new Date(),
        responseTime: healthStatus.responseTime,
        details: healthStatus.details,
      })

      // Update agent status based on health
      const newStatus = this.mapHealthToAgentStatus(healthStatus.status)
      if (agent.status !== newStatus) {
        await this.updateAgentStatus(agentId, newStatus)
      }

      return healthStatus
    } catch (error) {
      logger.error('Health check failed', error as Error, { agentId })

      const errorHealthStatus: HealthStatus = {
        status: 'unhealthy',
        lastCheck: new Date(),
        error: (error as Error).message,
      }

      // Store error health record
      try {
        await prisma.agentHealth.create({
          data: {
            agentId,
            status: JSON.stringify(errorHealthStatus),
            lastCheckAt: new Date(),
            errorCount: 1,
            consecutiveErrors: 1,
          },
        })
      } catch (dbError) {
        logger.error('Failed to store health check error', dbError as Error, {
          agentId,
        })
      }

      return errorHealthStatus
    }
  }

  /**
   * Configure health monitoring for an agent
   */
  async configureHealthMonitoring(
    agentId: string,
    config: HealthCheckConfig
  ): Promise<void> {
    try {
      // Validate configuration
      const validatedConfig = healthCheckConfigSchema.parse(config)

      logger.info('Configuring health monitoring', {
        agentId,
        config: validatedConfig,
      })

      // Store configuration
      this.healthCheckConfigs.set(agentId, validatedConfig)

      // Restart health monitoring with new configuration
      await this.stopHealthMonitoring(agentId)
      if (validatedConfig.enabled) {
        await this.startHealthMonitoring(agentId)
      }

      logger.info('Health monitoring configured', { agentId })
    } catch (error) {
      logger.error('Failed to configure health monitoring', error as Error, {
        agentId,
      })
      throw error
    }
  }

  /**
   * Start health monitoring for an agent
   */
  async startHealthMonitoring(agentId: string): Promise<void> {
    try {
      // Get configuration or use default
      const config = this.healthCheckConfigs.get(agentId) || {
        interval: 30000,
        timeout: 10000,
        retries: 3,
        enabled: true,
      }

      if (!config.enabled) {
        return
      }

      // Clear existing interval if any
      await this.stopHealthMonitoring(agentId)

      // Start new interval
      const interval = setInterval(async () => {
        try {
          await this.performHealthCheck(agentId)
        } catch (error) {
          logger.error('Scheduled health check failed', error as Error, {
            agentId,
          })
        }
      }, config.interval)

      this.healthCheckIntervals.set(agentId, interval)

      logger.info('Health monitoring started', {
        agentId,
        interval: config.interval,
      })
    } catch (error) {
      logger.error('Failed to start health monitoring', error as Error, {
        agentId,
      })
      throw error
    }
  }

  /**
   * Stop health monitoring for an agent
   */
  async stopHealthMonitoring(agentId: string): Promise<void> {
    try {
      const interval = this.healthCheckIntervals.get(agentId)
      if (interval) {
        clearInterval(interval)
        this.healthCheckIntervals.delete(agentId)
        logger.info('Health monitoring stopped', { agentId })
      }
    } catch (error) {
      logger.error('Failed to stop health monitoring', error as Error, {
        agentId,
      })
      throw error
    }
  }

  /**
   * Get health monitoring status for all agents
   */
  getHealthMonitoringStatus(): {
    agentId: string
    enabled: boolean
    interval: number
  }[] {
    const status: { agentId: string; enabled: boolean; interval: number }[] = []

    for (const [agentId, config] of this.healthCheckConfigs.entries()) {
      status.push({
        agentId,
        enabled: config.enabled && this.healthCheckIntervals.has(agentId),
        interval: config.interval,
      })
    }

    return status
  }

  /**
   * Cleanup - stop all health monitoring
   */
  async cleanup(): Promise<void> {
    try {
      logger.info('Cleaning up agent service')

      // Stop all health monitoring
      for (const agentId of this.healthCheckIntervals.keys()) {
        await this.stopHealthMonitoring(agentId)
      }

      this.healthCheckConfigs.clear()

      logger.info('Agent service cleanup completed')
    } catch (error) {
      logger.error('Failed to cleanup agent service', error as Error)
      throw error
    }
  }

  /**
   * Map health status to agent status
   */
  private mapHealthToAgentStatus(
    healthStatus: 'healthy' | 'unhealthy' | 'degraded'
  ): AgentStatus {
    switch (healthStatus) {
      case 'healthy':
        return 'ACTIVE'
      case 'degraded':
        return 'ACTIVE' // Still active but with issues
      case 'unhealthy':
        return 'ERROR'
      default:
        return 'INACTIVE'
    }
  }

  /**
   * Map agent status to WebSocket status
   */
  private mapAgentStatusToWebSocket(
    status: AgentStatus
  ): 'active' | 'inactive' | 'error' | 'maintenance' {
    switch (status) {
      case 'ACTIVE':
        return 'active'
      case 'INACTIVE':
        return 'inactive'
      case 'ERROR':
        return 'error'
      case 'MAINTENANCE':
        return 'maintenance'
      default:
        return 'inactive'
    }
  }
}
