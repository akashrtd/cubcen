import { PrismaClient } from '../../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./e2e/temp/test.db'
    }
  }
})

/**
 * Seed test database with realistic test data for E2E testing
 */
async function seedTestData() {
  console.log('🌱 Seeding E2E test data...')

  try {
    // Clean existing data
    await prisma.task.deleteMany()
    await prisma.agent.deleteMany()
    await prisma.platform.deleteMany()
    await prisma.user.deleteMany()

    // Create test users
    const hashedPassword = await bcrypt.hash('testpassword123', 10)
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@cubcen.test',
        password: hashedPassword,
        name: 'Test Admin',
        role: 'ADMIN'
      }
    })

    const operatorUser = await prisma.user.create({
      data: {
        email: 'operator@cubcen.test',
        password: hashedPassword,
        name: 'Test Operator',
        role: 'OPERATOR'
      }
    })

    const viewerUser = await prisma.user.create({
      data: {
        email: 'viewer@cubcen.test',
        password: hashedPassword,
        name: 'Test Viewer',
        role: 'VIEWER'
      }
    })

    // Create test platforms
    const n8nPlatform = await prisma.platform.create({
      data: {
        name: 'Test n8n Platform',
        type: 'N8N',
        baseUrl: 'http://localhost:5678',
        authConfig: JSON.stringify({
          type: 'api_key',
          apiKey: 'test-n8n-api-key'
        }),
        status: 'CONNECTED',
        lastSyncAt: new Date()
      }
    })

    const makePlatform = await prisma.platform.create({
      data: {
        name: 'Test Make Platform',
        type: 'MAKE',
        baseUrl: 'https://api.make.com',
        authConfig: JSON.stringify({
          type: 'oauth',
          clientId: 'test-make-client-id',
          clientSecret: 'test-make-client-secret'
        }),
        status: 'CONNECTED',
        lastSyncAt: new Date()
      }
    })

    // Create test agents
    const agents = await Promise.all([
      prisma.agent.create({
        data: {
          name: 'Email Automation Agent',
          platformId: n8nPlatform.id,
          externalId: 'workflow-1',
          status: 'ACTIVE',
          capabilities: JSON.stringify(['email', 'automation']),
          configuration: JSON.stringify({
            triggers: ['webhook'],
            actions: ['send_email', 'log_data']
          }),
          healthStatus: JSON.stringify({
            status: 'healthy',
            lastCheck: new Date(),
            responseTime: 150
          })
        }
      }),
      prisma.agent.create({
        data: {
          name: 'Data Processing Agent',
          platformId: makePlatform.id,
          externalId: 'scenario-1',
          status: 'ACTIVE',
          capabilities: JSON.stringify(['data_processing', 'api_integration']),
          configuration: JSON.stringify({
            triggers: ['schedule'],
            actions: ['process_data', 'api_call']
          }),
          healthStatus: JSON.stringify({
            status: 'healthy',
            lastCheck: new Date(),
            responseTime: 200
          })
        }
      }),
      prisma.agent.create({
        data: {
          name: 'Inactive Test Agent',
          platformId: n8nPlatform.id,
          externalId: 'workflow-2',
          status: 'INACTIVE',
          capabilities: JSON.stringify(['testing']),
          configuration: JSON.stringify({
            triggers: ['manual'],
            actions: ['test_action']
          }),
          healthStatus: JSON.stringify({
            status: 'unhealthy',
            lastCheck: new Date(),
            responseTime: 5000,
            error: 'Connection timeout'
          })
        }
      })
    ])

    // Create test tasks
    const tasks = await Promise.all([
      prisma.task.create({
        data: {
          name: 'Send Welcome Email',
          agentId: agents[0].id,
          status: 'COMPLETED',
          priority: 'MEDIUM',
          scheduledAt: new Date(Date.now() - 3600000), // 1 hour ago
          startedAt: new Date(Date.now() - 3600000 + 5000),
          completedAt: new Date(Date.now() - 3600000 + 15000),
          parameters: JSON.stringify({
            recipient: 'user@example.com',
            template: 'welcome'
          }),
          result: JSON.stringify({
            success: true,
            messageId: 'msg-123',
            deliveredAt: new Date()
          }),
          createdBy: adminUser.id
        }
      }),
      prisma.task.create({
        data: {
          name: 'Process Customer Data',
          agentId: agents[1].id,
          status: 'RUNNING',
          priority: 'HIGH',
          scheduledAt: new Date(Date.now() - 300000), // 5 minutes ago
          startedAt: new Date(Date.now() - 300000 + 2000),
          parameters: JSON.stringify({
            dataSource: 'customers.csv',
            outputFormat: 'json'
          }),
          createdBy: operatorUser.id
        }
      }),
      prisma.task.create({
        data: {
          name: 'Failed Test Task',
          agentId: agents[2].id,
          status: 'FAILED',
          priority: 'LOW',
          scheduledAt: new Date(Date.now() - 1800000), // 30 minutes ago
          startedAt: new Date(Date.now() - 1800000 + 1000),
          completedAt: new Date(Date.now() - 1800000 + 10000),
          parameters: JSON.stringify({
            testParam: 'test_value'
          }),
          error: JSON.stringify({
            code: 'AGENT_UNAVAILABLE',
            message: 'Agent is not responding',
            stack: 'Error: Agent is not responding\n    at TestAgent.execute'
          }),
          createdBy: adminUser.id
        }
      })
    ])

    // Create some system logs for testing
    await Promise.all([
      prisma.systemLog.create({
        data: {
          level: 'INFO',
          message: 'Task completed successfully',
          context: JSON.stringify({ taskId: tasks[0].id }),
          source: 'TaskService'
        }
      }),
      prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: 'Agent connection failed',
          context: JSON.stringify({ agentId: agents[2].id }),
          source: 'AgentService'
        }
      })
    ])

    console.log('✅ Test data seeded successfully')
    console.log(`👤 Created ${3} test users`)
    console.log(`🔌 Created ${2} test platforms`)
    console.log(`🤖 Created ${agents.length} test agents`)
    console.log(`📋 Created ${tasks.length} test tasks`)

  } catch (error) {
    console.error('❌ Failed to seed test data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  seedTestData().catch(console.error)
}

export default seedTestData