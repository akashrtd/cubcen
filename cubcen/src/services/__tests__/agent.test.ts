/**
 * Cubcen Agent Management Service Tests
 * Comprehensive tests for agent registration, status tracking, health monitoring, and configuration management
 */

import { AgentService, AgentRegistrationData, AgentUpdateData, HealthCheckConfig } from '../agent'
import { AdapterManager } from '@/backend/adapters/adapter-factory'
import { MockPlatformAdapter } from '@/backend/adapters/mock-adapter'
import { prisma } from '@/lib/database'
import { resetDatabase } from '@/lib/database-utils'
import { logger } from '@/lib/logger'
import { PlatformConfig, Agent as PlatformAgent, HealthStatus } from '@/types/platform'

// Mock logger to avoid console output during tests
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}))

describe('AgentService', () => {
  let agentService: AgentService
  let adapterManager: AdapterManager
  let mockAdapter: MockPlatformAdapter
  let testPlatformId: string
  let testUserId: string

  beforeAll(async () => {
    // Reset database before all tests
    await resetDatabase()
    
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@cubcen.com',
        password: 'test123',
        role: 'ADMIN',
        name: 'Test User'
      }
    })
    testUserId = testUser.id

    // Create test platform
    const testPlatform = await prisma.platform.create({
      data: {
        name: 'Test Platform',
        type: 'N8N',
        baseUrl: 'http://localhost:5678',
        status: 'CONNECTED',
        authConfig: JSON.stringify({ apiKey: 'test-key' })
      }
    })
    testPlatformId = testPlatform.id
  })

  beforeEach(async () => {
    // Clean up agents before each test
    await prisma.agentHealth.deleteMany()
    await prisma.agent.deleteMany()
    
    // Initialize adapter manager and service
    adapterManager = new AdapterManager()
    agentService = new AgentService(adapterManager)
    
    // Create mock adapter
    const mockConfig: PlatformConfig = {
      id: testPlatformId,
      name: 'Test Platform',
      type: 'n8n',
      baseUrl: 'http://localhost:5678',
      credentials: { apiKey: 'test-key' }
    }
    
    mockAdapter = new MockPlatformAdapter(mockConfig)
    await adapterManager.addPlatform(mockConfig)
  })

  afterEach(async () => {
    // Cleanup agent service
    await agentService.cleanup()
    await adapterManager.disconnectAll()
  })

  afterAll(async () => {
    await resetDatabase()
  })

  describe('Agent Registration', () => {
    it('should register a new agent successfully', async () => {
      const agentData: AgentRegistrationData = {
        name: 'Test Agent',
        platformId: testPlatformId,
        externalId: 'test-agent-001',
        capabilities: ['test', 'automation'],
        configuration: { testMode: true },
        description: 'Test agent for unit tests'
      }

      const agent = await agentService.registerAgent(agentData)

      expect(agent).toBeDefined()
      expect(agent.name).toBe(agentData.name)
      expect(agent.platformId).toBe(agentData.platformId)
      expect(agent.externalId).toBe(agentData.externalId)
      expect(agent.status).toBe('INACTIVE')
      expect(JSON.parse(agent.capabilities)).toEqual(agentData.capabilities)
      expect(JSON.parse(agent.configuration)).toEqual(agentData.configuration)
      expect(agent.description).toBe(agentData.description)
    })

    it('should throw error when registering agent with invalid platform', async () => {
      const agentData: AgentRegistrationData = {
        name: 'Test Agent',
        platformId: 'invalid-platform-id',
        externalId: 'test-agent-001'
      }

      await expect(agentService.registerAgent(agentData)).rejects.toThrow('Platform with ID invalid-platform-id not found')
    })

    it('should throw error when registering duplicate agent', async () => {
      const agentData: AgentRegistrationData = {
        name: 'Test Agent',
        platformId: testPlatformId,
        externalId: 'test-agent-001'
      }

      // Register first agent
      await agentService.registerAgent(agentData)

      // Try to register duplicate
      await expect(agentService.registerAgent(agentData)).rejects.toThrow('Agent with external ID test-agent-001 already exists')
    })

    it('should validate agent registration data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        platformId: testPlatformId,
        externalId: 'test-agent-001'
      }

      await expect(agentService.registerAgent(invalidData as AgentRegistrationData)).rejects.toThrow()
    })
  })

  describe('Agent Updates', () => {
    let testAgentId: string

    beforeEach(async () => {
      const agent = await agentService.registerAgent({
        name: 'Test Agent',
        platformId: testPlatformId,
        externalId: 'test-agent-001',
        capabilities: ['test'],
        configuration: { testMode: true }
      })
      testAgentId = agent.id
    })

    it('should update agent successfully', async () => {
      const updateData: AgentUpdateData = {
        name: 'Updated Test Agent',
        capabilities: ['test', 'automation', 'updated'],
        configuration: { testMode: false, newFeature: true },
        description: 'Updated description',
        status: 'ACTIVE'
      }

      const updatedAgent = await agentService.updateAgent(testAgentId, updateData)

      expect(updatedAgent.name).toBe(updateData.name)
      expect(JSON.parse(updatedAgent.capabilities)).toEqual(updateData.capabilities)
      expect(JSON.parse(updatedAgent.configuration)).toEqual(updateData.configuration)
      expect(updatedAgent.description).toBe(updateData.description)
      expect(updatedAgent.status).toBe(updateData.status)
    })

    it('should throw error when updating non-existent agent', async () => {
      const updateData: AgentUpdateData = {
        name: 'Updated Name'
      }

      await expect(agentService.updateAgent('invalid-agent-id', updateData)).rejects.toThrow('Agent with ID invalid-agent-id not found')
    })

    it('should validate agent update data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        status: 'INVALID_STATUS' // Invalid status
      }

      await expect(agentService.updateAgent(testAgentId, invalidData as AgentUpdateData)).rejects.toThrow()
    })
  })

  describe('Agent Retrieval', () => {
    let testAgentId: string

    beforeEach(async () => {
      const agent = await agentService.registerAgent({
        name: 'Test Agent',
        platformId: testPlatformId,
        externalId: 'test-agent-001',
        capabilities: ['test'],
        configuration: { testMode: true }
      })
      testAgentId = agent.id
    })

    it('should get agent by ID with health status', async () => {
      const agent = await agentService.getAgent(testAgentId)

      expect(agent).toBeDefined()
      expect(agent!.id).toBe(testAgentId)
      expect(agent!.healthStatus).toBeDefined()
      expect(agent!.platform).toBeDefined()
    })

    it('should return null for non-existent agent', async () => {
      const agent = await agentService.getAgent('invalid-agent-id')
      expect(agent).toBeNull()
    })

    it('should get agents with filtering and pagination', async () => {
      // Create additional test agents
      await agentService.registerAgent({
        name: 'Second Agent',
        platformId: testPlatformId,
        externalId: 'test-agent-002'
      })

      const result = await agentService.getAgents({
        page: 1,
        limit: 10,
        search: 'Test'
      })

      expect(result.agents).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(1)
    })

    it('should filter agents by status', async () => {
      // Update one agent to ACTIVE status
      await agentService.updateAgent(testAgentId, { status: 'ACTIVE' })

      const result = await agentService.getAgents({
        status: 'ACTIVE'
      })

      expect(result.agents).toHaveLength(1)
      expect(result.agents[0].status).toBe('ACTIVE')
    })

    it('should search agents by name', async () => {
      const result = await agentService.getAgents({
        search: 'Test Agent'
      })

      expect(result.agents).toHaveLength(1)
      expect(result.agents[0].name).toContain('Test Agent')
    })
  })

  describe('Agent Deletion', () => {
    let testAgentId: string

    beforeEach(async () => {
      const agent = await agentService.registerAgent({
        name: 'Test Agent',
        platformId: testPlatformId,
        externalId: 'test-agent-001'
      })
      testAgentId = agent.id
    })

    it('should delete agent successfully', async () => {
      await agentService.deleteAgent(testAgentId)

      const agent = await agentService.getAgent(testAgentId)
      expect(agent).toBeNull()
    })

    it('should handle deletion of non-existent agent', async () => {
      await expect(agentService.deleteAgent('invalid-agent-id')).rejects.toThrow()
    })
  })

  describe('Agent Discovery', () => {
    beforeEach(() => {
      // Mock adapter discovery method
      const mockAgents: PlatformAgent[] = [
        {
          id: 'discovered-agent-001',
          name: 'Discovered Agent 1',
          platformId: testPlatformId,
          platformType: 'n8n',
          status: 'active',
          capabilities: ['email', 'automation'],
          configuration: { emailProvider: 'smtp' },
          healthStatus: { status: 'healthy', lastCheck: new Date() },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'discovered-agent-002',
          name: 'Discovered Agent 2',
          platformId: testPlatformId,
          platformType: 'n8n',
          status: 'inactive',
          capabilities: ['webhook'],
          configuration: { webhookUrl: 'https://example.com/webhook' },
          healthStatus: { status: 'unhealthy', lastCheck: new Date() },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      jest.spyOn(mockAdapter, 'discoverAgents').mockResolvedValue(mockAgents)
    })

    it('should discover and register new agents', async () => {
      const result = await agentService.discoverAgents(testPlatformId)

      expect(result.discovered).toBe(2)
      expect(result.registered).toBe(2)
      expect(result.updated).toBe(0)
      expect(result.errors).toHaveLength(0)

      // Verify agents were registered
      const agents = await agentService.getAgents()
      expect(agents.agents).toHaveLength(2)
    })

    it('should update existing agents during discovery', async () => {
      // Pre-register one agent
      await agentService.registerAgent({
        name: 'Old Name',
        platformId: testPlatformId,
        externalId: 'discovered-agent-001',
        capabilities: ['old-capability']
      })

      const result = await agentService.discoverAgents(testPlatformId)

      expect(result.discovered).toBe(2)
      expect(result.registered).toBe(1) // Only one new agent
      expect(result.updated).toBe(1)    // One existing agent updated
      expect(result.errors).toHaveLength(0)
    })

    it('should handle discovery errors gracefully', async () => {
      // Mock adapter to throw error
      jest.spyOn(mockAdapter, 'discoverAgents').mockRejectedValue(new Error('Platform connection failed'))

      const result = await agentService.discoverAgents(testPlatformId)

      expect(result.discovered).toBe(0)
      expect(result.registered).toBe(0)
      expect(result.updated).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('Platform connection failed')
    })
  })

  describe('Health Monitoring', () => {
    let testAgentId: string

    beforeEach(async () => {
      const agent = await agentService.registerAgent({
        name: 'Test Agent',
        platformId: testPlatformId,
        externalId: 'test-agent-001'
      })
      testAgentId = agent.id

      // Mock health check
      const mockHealthStatus: HealthStatus = {
        status: 'healthy',
        lastCheck: new Date(),
        responseTime: 150,
        details: { cpu: 25.5, memory: 128.5 }
      }
      jest.spyOn(mockAdapter, 'healthCheck').mockResolvedValue(mockHealthStatus)
    })

    it('should perform health check successfully', async () => {
      const health = await agentService.performHealthCheck(testAgentId)

      expect(health.status).toBe('healthy')
      expect(health.responseTime).toBe(150)
      expect(health.details).toBeDefined()

      // Verify health record was stored
      const healthRecord = await prisma.agentHealth.findFirst({
        where: { agentId: testAgentId }
      })
      expect(healthRecord).toBeDefined()
    })

    it('should handle health check failures', async () => {
      // Mock health check failure
      jest.spyOn(mockAdapter, 'healthCheck').mockRejectedValue(new Error('Health check timeout'))

      const health = await agentService.performHealthCheck(testAgentId)

      expect(health.status).toBe('unhealthy')
      expect(health.error).toContain('Health check timeout')
    })

    it('should configure health monitoring', async () => {
      const config: HealthCheckConfig = {
        interval: 60000,
        timeout: 15000,
        retries: 5,
        enabled: true
      }

      await agentService.configureHealthMonitoring(testAgentId, config)

      const status = agentService.getHealthMonitoringStatus()
      const agentStatus = status.find(s => s.agentId === testAgentId)
      
      expect(agentStatus).toBeDefined()
      expect(agentStatus!.enabled).toBe(true)
      expect(agentStatus!.interval).toBe(60000)
    })

    it('should validate health monitoring configuration', async () => {
      const invalidConfig = {
        interval: 500, // Too low
        timeout: 70000, // Too high
        retries: 10,    // Too high
        enabled: true
      }

      await expect(agentService.configureHealthMonitoring(testAgentId, invalidConfig as HealthCheckConfig)).rejects.toThrow()
    })

    it('should start and stop health monitoring', async () => {
      // Start monitoring
      await agentService.startHealthMonitoring(testAgentId)
      
      let status = agentService.getHealthMonitoringStatus()
      let agentStatus = status.find(s => s.agentId === testAgentId)
      expect(agentStatus?.enabled).toBe(true)

      // Stop monitoring
      await agentService.stopHealthMonitoring(testAgentId)
      
      status = agentService.getHealthMonitoringStatus()
      agentStatus = status.find(s => s.agentId === testAgentId)
      expect(agentStatus?.enabled).toBe(false)
    })
  })

  describe('Agent Status Management', () => {
    let testAgentId: string

    beforeEach(async () => {
      const agent = await agentService.registerAgent({
        name: 'Test Agent',
        platformId: testPlatformId,
        externalId: 'test-agent-001'
      })
      testAgentId = agent.id
    })

    it('should update agent status', async () => {
      await agentService.updateAgentStatus(testAgentId, 'ACTIVE')

      const agent = await agentService.getAgent(testAgentId)
      expect(agent!.status).toBe('ACTIVE')
    })

    it('should handle invalid agent status update', async () => {
      await expect(agentService.updateAgentStatus('invalid-agent-id', 'ACTIVE')).rejects.toThrow()
    })
  })

  describe('Error Scenarios', () => {
    it('should handle database connection failures', async () => {
      // Mock database error
      jest.spyOn(prisma.agent, 'create').mockRejectedValue(new Error('Database connection failed'))

      const agentData: AgentRegistrationData = {
        name: 'Test Agent',
        platformId: testPlatformId,
        externalId: 'test-agent-001'
      }

      await expect(agentService.registerAgent(agentData)).rejects.toThrow('Database connection failed')
    })

    it('should handle adapter not found errors', async () => {
      // Remove adapter
      await adapterManager.removePlatform(testPlatformId)

      const testAgentId = 'test-agent-id'
      
      await expect(agentService.performHealthCheck(testAgentId)).rejects.toThrow('Agent with ID test-agent-id not found')
    })

    it('should handle health check timeouts', async () => {
      const agent = await agentService.registerAgent({
        name: 'Test Agent',
        platformId: testPlatformId,
        externalId: 'test-agent-001'
      })

      // Mock timeout error
      jest.spyOn(mockAdapter, 'healthCheck').mockRejectedValue(new Error('Request timeout'))

      const health = await agentService.performHealthCheck(agent.id)
      expect(health.status).toBe('unhealthy')
      expect(health.error).toContain('Request timeout')
    })

    it('should handle invalid configuration data', async () => {
      const invalidData = {
        name: 'Test Agent',
        platformId: testPlatformId,
        externalId: 'test-agent-001',
        capabilities: 'invalid-capabilities', // Should be array
        configuration: 'invalid-config' // Should be object
      }

      await expect(agentService.registerAgent(invalidData as AgentRegistrationData)).rejects.toThrow()
    })
  })

  describe('Service Cleanup', () => {
    it('should cleanup all resources', async () => {
      const agent = await agentService.registerAgent({
        name: 'Test Agent',
        platformId: testPlatformId,
        externalId: 'test-agent-001'
      })

      // Start health monitoring
      await agentService.startHealthMonitoring(agent.id)

      // Verify monitoring is active
      let status = agentService.getHealthMonitoringStatus()
      expect(status).toHaveLength(1)

      // Cleanup
      await agentService.cleanup()

      // Verify monitoring is stopped
      status = agentService.getHealthMonitoringStatus()
      expect(status).toHaveLength(0)
    })
  })
})