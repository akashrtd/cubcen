/**
 * Demo test for Make.com Platform Adapter
 * Demonstrates the adapter capabilities with realistic scenarios
 */

import { MakePlatformAdapter } from '../make-adapter'
import { PlatformConfig } from '../../../types/platform'
import { createMakeApiMockServer } from './make-mock-server.helper'

describe('Make.com Platform Adapter Demo', () => {
  let mockServer: ReturnType<typeof createMakeApiMockServer>

  beforeAll(async () => {
    mockServer = createMakeApiMockServer({ enableLogging: false })
    await mockServer.start()
  })

  afterAll(async () => {
    await mockServer.stop()
  })

  afterEach(() => {
    mockServer.reset()
  })

  describe('Real-world usage scenarios', () => {
    it('should demonstrate complete Make.com integration workflow', async () => {
      console.log('\n🚀 Make.com Platform Adapter Demo')
      console.log('=====================================')

      // 1. Setup adapter with API token authentication
      const config: PlatformConfig = {
        id: 'make-production',
        name: 'Make.com Production',
        type: 'make',
        baseUrl: mockServer.getBaseUrl(),
        credentials: {
          apiToken: 'valid-api-token',
        },
      }

      const adapter = new MakePlatformAdapter(config)
      console.log('✅ Adapter initialized with API token authentication')

      // 2. Connect to Make.com platform
      console.log('\n📡 Connecting to Make.com platform...')
      const connectionResult = await adapter.connect()

      expect(connectionResult.connected).toBe(true)
      console.log('✅ Successfully connected to Make.com')
      console.log(
        `   Connected at: ${connectionResult.lastConnected?.toISOString()}`
      )

      // 3. Discover available scenarios (agents)
      console.log('\n🔍 Discovering available scenarios...')
      const agents = await adapter.discoverAgents()

      expect(agents.length).toBeGreaterThan(0)
      console.log(`✅ Discovered ${agents.length} scenarios:`)

      agents.forEach((agent, index) => {
        console.log(`   ${index + 1}. ${agent.name} (ID: ${agent.id})`)
        console.log(`      Status: ${agent.status}`)
        console.log(`      Platform: ${agent.platformType}`)
        console.log(`      Capabilities: ${agent.capabilities.join(', ')}`)
        console.log(`      Created: ${agent.createdAt.toISOString()}`)
      })

      // 4. Get detailed status for each agent
      console.log('\n📊 Getting detailed agent status...')
      for (const agent of agents) {
        const status = await adapter.getAgentStatus(agent.id)

        console.log(`\n   Agent: ${agent.name} (${agent.id})`)
        console.log(`   Status: ${status.status}`)
        console.log(`   Last Seen: ${status.lastSeen.toISOString()}`)
        console.log(`   Current Task: ${status.currentTask || 'None'}`)

        if (status.metrics) {
          console.log(`   Metrics:`)
          console.log(
            `     - Tasks Completed: ${status.metrics.tasksCompleted}`
          )
          console.log(
            `     - Avg Execution Time: ${status.metrics.averageExecutionTime}ms`
          )
          console.log(
            `     - Error Rate: ${(status.metrics.errorRate * 100).toFixed(1)}%`
          )
        }
      }

      // 5. Execute an active scenario
      console.log('\n⚡ Executing active scenario...')
      const activeAgent = agents.find(agent => agent.status === 'active')

      if (activeAgent) {
        const executionParams = {
          testData: 'Demo execution',
          timestamp: new Date().toISOString(),
          source: 'cubcen-demo',
        }

        console.log(`   Executing: ${activeAgent.name}`)
        console.log(`   Parameters:`, JSON.stringify(executionParams, null, 2))

        const executionResult = await adapter.executeAgent(
          activeAgent.id,
          executionParams
        )

        console.log(`   Execution Result:`)
        console.log(`     - Success: ${executionResult.success}`)
        console.log(`     - Execution Time: ${executionResult.executionTime}ms`)
        console.log(
          `     - Timestamp: ${executionResult.timestamp.toISOString()}`
        )

        if (executionResult.error) {
          console.log(`     - Error: ${executionResult.error}`)
        }

        expect(executionResult.success).toBe(true)
        console.log('✅ Scenario executed successfully')
      } else {
        console.log('   ⚠️  No active scenarios found for execution')
      }

      // 6. Health check
      console.log('\n🏥 Performing health check...')
      const health = await adapter.healthCheck()

      console.log(`   Health Status: ${health.status}`)
      console.log(`   Response Time: ${health.responseTime}ms`)
      console.log(`   Last Check: ${health.lastCheck.toISOString()}`)

      if (health.details) {
        console.log(`   Details:`)
        console.log(
          `     - Circuit Breaker: ${health.details.circuitBreakerState}`
        )
        console.log(`     - Authenticated: ${health.details.authenticated}`)
        if (health.details.tokenExpiry) {
          console.log(`     - Token Expires: ${health.details.tokenExpiry}`)
        }
      }

      expect(health.status).toBe('healthy')
      console.log('✅ Health check passed')

      // 7. Event subscription demo
      console.log('\n📡 Setting up event subscription...')
      const receivedEvents: unknown[] = []

      const eventCallback = (event: unknown) => {
        receivedEvents.push(event)
        console.log(
          `   Event received: ${event.type} for agent ${event.agentId}`
        )
      }

      await adapter.subscribeToEvents(eventCallback)
      console.log('✅ Event subscription active')

      // Wait a moment for potential events
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (receivedEvents.length > 0) {
        console.log(`   Received ${receivedEvents.length} events during demo`)
      } else {
        console.log('   No events received during demo period')
      }

      await adapter.unsubscribeFromEvents(eventCallback)

      // 8. Disconnect
      console.log('\n🔌 Disconnecting from Make.com...')
      await adapter.disconnect()

      expect(adapter.isAdapterConnected()).toBe(false)
      console.log('✅ Successfully disconnected')

      console.log('\n🎉 Make.com integration demo completed successfully!')
      console.log('=====================================\n')
    })

    it('should demonstrate OAuth authentication flow', async () => {
      console.log('\n🔐 OAuth Authentication Demo')
      console.log('============================')

      const oauthConfig: PlatformConfig = {
        id: 'make-oauth',
        name: 'Make.com OAuth',
        type: 'make',
        baseUrl: mockServer.getBaseUrl(),
        credentials: {
          clientId: 'demo-client-id',
          clientSecret: 'demo-client-secret',
          refreshToken: 'valid-refresh-token',
          teamId: 123,
        },
      }

      const adapter = new MakePlatformAdapter(oauthConfig)
      console.log('✅ Adapter initialized with OAuth credentials')

      // Authenticate using OAuth flow
      console.log('\n🔑 Performing OAuth authentication...')
      const authResult = await adapter.authenticate(oauthConfig.credentials)

      expect(authResult.success).toBe(true)
      console.log('✅ OAuth authentication successful')
      console.log(`   Access Token: ${authResult.token?.substring(0, 20)}...`)
      console.log(`   Expires At: ${authResult.expiresAt?.toISOString()}`)

      // Test authenticated requests
      console.log('\n📋 Testing authenticated requests...')
      const agents = await adapter.discoverAgents()

      expect(agents.length).toBeGreaterThan(0)
      console.log(
        `✅ Successfully retrieved ${agents.length} scenarios with OAuth`
      )

      await adapter.disconnect()
      console.log('✅ OAuth demo completed')
    })

    it('should demonstrate error handling and recovery', async () => {
      console.log('\n⚠️  Error Handling Demo')
      console.log('=======================')

      const config: PlatformConfig = {
        id: 'make-error-demo',
        name: 'Make.com Error Demo',
        type: 'make',
        baseUrl: mockServer.getBaseUrl(),
        credentials: {
          apiToken: 'valid-api-token',
        },
      }

      const adapter = new MakePlatformAdapter(config)

      // 1. Test invalid credentials
      console.log('\n🚫 Testing invalid credentials...')
      const invalidAuthResult = await adapter.authenticate({
        apiToken: 'invalid-token',
      })

      expect(invalidAuthResult.success).toBe(false)
      console.log(`✅ Invalid credentials handled: ${invalidAuthResult.error}`)

      // 2. Test network errors
      console.log('\n🌐 Testing network error handling...')
      mockServer.enableErrors()

      const connectionResult = await adapter.connect()
      expect(connectionResult.connected).toBe(false)
      console.log(`✅ Network error handled: ${connectionResult.error}`)

      // 3. Test recovery after network issues
      console.log('\n🔄 Testing error recovery...')
      mockServer.disableErrors()

      const recoveryResult = await adapter.connect()
      expect(recoveryResult.connected).toBe(true)
      console.log('✅ Successfully recovered from network errors')

      // 4. Test rate limiting
      console.log('\n⏱️  Testing rate limit handling...')
      mockServer.enableRateLimit()

      const rateLimitHealth = await adapter.healthCheck()
      expect(rateLimitHealth.status).toBe('unhealthy')
      console.log(`✅ Rate limiting handled: ${rateLimitHealth.error}`)

      mockServer.disableRateLimit()
      await adapter.disconnect()
      console.log('✅ Error handling demo completed')
    })

    it('should demonstrate performance characteristics', async () => {
      console.log('\n⚡ Performance Demo')
      console.log('==================')

      const config: PlatformConfig = {
        id: 'make-performance',
        name: 'Make.com Performance',
        type: 'make',
        baseUrl: mockServer.getBaseUrl(),
        credentials: {
          apiToken: 'valid-api-token',
        },
      }

      const adapter = new MakePlatformAdapter(config)
      await adapter.connect()

      // Test concurrent requests
      console.log('\n🔄 Testing concurrent requests...')
      const startTime = Date.now()

      const promises = [
        adapter.healthCheck(),
        adapter.discoverAgents(),
        adapter.healthCheck(),
        adapter.discoverAgents(),
      ]

      const results = await Promise.all(promises)
      const duration = Date.now() - startTime

      console.log(`✅ Completed 4 concurrent requests in ${duration}ms`)
      console.log(`   Average: ${(duration / 4).toFixed(1)}ms per request`)

      expect(results[0].status).toBe('healthy')
      expect(results[1].length).toBeGreaterThan(0)
      expect(results[2].status).toBe('healthy')
      expect(results[3].length).toBeGreaterThan(0)

      // Test sequential performance
      console.log('\n📊 Testing sequential performance...')
      const sequentialStart = Date.now()

      for (let i = 0; i < 5; i++) {
        await adapter.healthCheck()
      }

      const sequentialDuration = Date.now() - sequentialStart
      console.log(
        `✅ Completed 5 sequential health checks in ${sequentialDuration}ms`
      )
      console.log(
        `   Average: ${(sequentialDuration / 5).toFixed(1)}ms per request`
      )

      await adapter.disconnect()
      console.log('✅ Performance demo completed')
    })
  })

  describe('Team-based operations demo', () => {
    it('should demonstrate team-specific scenario management', async () => {
      console.log('\n👥 Team Operations Demo')
      console.log('======================')

      const teamConfig: PlatformConfig = {
        id: 'make-team-demo',
        name: 'Make.com Team Demo',
        type: 'make',
        baseUrl: mockServer.getBaseUrl(),
        credentials: {
          apiToken: 'valid-api-token',
          teamId: 456,
        },
      }

      const adapter = new MakePlatformAdapter(teamConfig)
      await adapter.connect()

      console.log('✅ Connected with team-specific configuration')
      console.log(`   Team ID: ${teamConfig.credentials.teamId}`)

      const agents = await adapter.discoverAgents()
      console.log(`✅ Retrieved ${agents.length} team-specific scenarios`)

      if (agents.length > 0) {
        const status = await adapter.getAgentStatus(agents[0].id)
        console.log(`✅ Retrieved status for team scenario: ${agents[0].name}`)
        console.log(`   Status: ${status.status}`)
      }

      await adapter.disconnect()
      console.log('✅ Team operations demo completed')
    })
  })
})
