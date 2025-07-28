/**
 * Cubcen Database Seed Script
 * Populates the database with initial development data
 */

import { PrismaClient, UserRole, PlatformType, PlatformStatus, AgentStatus, TaskStatus, TaskPriority, WorkflowStatus } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Cubcen database seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cubcen.com' },
    update: {},
    create: {
      email: 'admin@cubcen.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      name: 'Cubcen Administrator',
    },
  })
  console.log('✅ Created admin user:', adminUser.email)

  // Create operator user
  const operatorPassword = await bcrypt.hash('operator123', 10)
  const operatorUser = await prisma.user.upsert({
    where: { email: 'operator@cubcen.com' },
    update: {},
    create: {
      email: 'operator@cubcen.com',
      password: operatorPassword,
      role: UserRole.OPERATOR,
      name: 'Cubcen Operator',
    },
  })
  console.log('✅ Created operator user:', operatorUser.email)

  // Create viewer user
  const viewerPassword = await bcrypt.hash('viewer123', 10)
  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@cubcen.com' },
    update: {},
    create: {
      email: 'viewer@cubcen.com',
      password: viewerPassword,
      role: UserRole.VIEWER,
      name: 'Cubcen Viewer',
    },
  })
  console.log('✅ Created viewer user:', viewerUser.email)

  // Create n8n platform
  const n8nPlatform = await prisma.platform.upsert({
    where: { name_type: { name: 'n8n Development', type: PlatformType.N8N } },
    update: {},
    create: {
      name: 'n8n Development',
      type: PlatformType.N8N,
      baseUrl: 'http://localhost:5678',
      status: PlatformStatus.CONNECTED,
      authConfig: JSON.stringify({
        type: 'api_key',
        apiKey: 'dev-api-key-123',
      }),
      lastSyncAt: new Date(),
    },
  })
  console.log('✅ Created n8n platform:', n8nPlatform.name)

  // Create Make.com platform
  const makePlatform = await prisma.platform.upsert({
    where: { name_type: { name: 'Make.com Development', type: PlatformType.MAKE } },
    update: {},
    create: {
      name: 'Make.com Development',
      type: PlatformType.MAKE,
      baseUrl: 'https://api.make.com',
      status: PlatformStatus.CONNECTED,
      authConfig: JSON.stringify({
        type: 'oauth2',
        clientId: 'dev-client-id',
        clientSecret: 'dev-client-secret',
        accessToken: 'dev-access-token',
      }),
      lastSyncAt: new Date(),
    },
  })
  console.log('✅ Created Make.com platform:', makePlatform.name)

  // Create sample agents for n8n
  const n8nAgent1 = await prisma.agent.upsert({
    where: { platformId_externalId: { platformId: n8nPlatform.id, externalId: 'n8n-workflow-001' } },
    update: {},
    create: {
      name: 'Email Notification Agent',
      platformId: n8nPlatform.id,
      externalId: 'n8n-workflow-001',
      status: AgentStatus.ACTIVE,
      capabilities: JSON.stringify(['email', 'notifications', 'scheduling']),
      configuration: JSON.stringify({
        emailProvider: 'smtp',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
      }),
      healthStatus: JSON.stringify({
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: 150,
      }),
      description: 'Sends email notifications based on triggers',
    },
  })

  const n8nAgent2 = await prisma.agent.upsert({
    where: { platformId_externalId: { platformId: n8nPlatform.id, externalId: 'n8n-workflow-002' } },
    update: {},
    create: {
      name: 'Data Sync Agent',
      platformId: n8nPlatform.id,
      externalId: 'n8n-workflow-002',
      status: AgentStatus.ACTIVE,
      capabilities: JSON.stringify(['data-sync', 'api-integration', 'transformation']),
      configuration: JSON.stringify({
        sourceApi: 'https://api.source.com',
        targetApi: 'https://api.target.com',
        syncInterval: '5m',
      }),
      healthStatus: JSON.stringify({
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: 200,
      }),
      description: 'Synchronizes data between two API endpoints',
    },
  })

  // Create sample agents for Make.com
  const makeAgent1 = await prisma.agent.upsert({
    where: { platformId_externalId: { platformId: makePlatform.id, externalId: 'make-scenario-001' } },
    update: {},
    create: {
      name: 'Social Media Monitor',
      platformId: makePlatform.id,
      externalId: 'make-scenario-001',
      status: AgentStatus.ACTIVE,
      capabilities: JSON.stringify(['social-media', 'monitoring', 'analytics']),
      configuration: JSON.stringify({
        platforms: ['twitter', 'linkedin'],
        keywords: ['AI', 'automation', 'cubcen'],
        alertThreshold: 10,
      }),
      healthStatus: JSON.stringify({
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: 300,
      }),
      description: 'Monitors social media mentions and trends',
    },
  })

  console.log('✅ Created sample agents')

  // Create a sample workflow
  const existingWorkflow = await prisma.workflow.findFirst({
    where: { name: 'Customer Onboarding Flow' }
  })

  let sampleWorkflow
  if (!existingWorkflow) {
    sampleWorkflow = await prisma.workflow.create({
      data: {
        name: 'Customer Onboarding Flow',
        description: 'Automated workflow for new customer onboarding',
        status: WorkflowStatus.ACTIVE,
        createdBy: adminUser.id,
        steps: {
          create: [
            {
              agentId: n8nAgent1.id,
              stepOrder: 1,
              name: 'Send Welcome Email',
              parameters: JSON.stringify({
                template: 'welcome',
                delay: '0m',
              }),
              conditions: JSON.stringify({
                trigger: 'user_registered',
              }),
            },
            {
              agentId: n8nAgent2.id,
              stepOrder: 2,
              name: 'Sync User Data',
              parameters: JSON.stringify({
                syncType: 'full',
                includePreferences: true,
              }),
              conditions: JSON.stringify({
                previousStepSuccess: true,
              }),
            },
          ],
        },
      },
    })
  } else {
    sampleWorkflow = existingWorkflow
  }
  console.log('✅ Created sample workflow:', sampleWorkflow.name)

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        agentId: n8nAgent1.id,
        workflowId: sampleWorkflow.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        name: 'Send Welcome Email to john@example.com',
        description: 'Welcome email for new user registration',
        parameters: JSON.stringify({
          recipient: 'john@example.com',
          template: 'welcome',
          variables: { name: 'John Doe' },
        }),
        result: JSON.stringify({
          messageId: 'msg-123',
          deliveryStatus: 'delivered',
          sentAt: new Date().toISOString(),
        }),
        scheduledAt: new Date(Date.now() - 3600000), // 1 hour ago
        startedAt: new Date(Date.now() - 3600000 + 5000), // 1 hour ago + 5 seconds
        completedAt: new Date(Date.now() - 3600000 + 10000), // 1 hour ago + 10 seconds
        createdBy: operatorUser.id,
      },
    }),
    prisma.task.create({
      data: {
        agentId: n8nAgent2.id,
        status: TaskStatus.RUNNING,
        priority: TaskPriority.MEDIUM,
        name: 'Daily Data Sync',
        description: 'Scheduled daily synchronization of customer data',
        parameters: JSON.stringify({
          syncType: 'incremental',
          lastSyncTimestamp: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
        }),
        scheduledAt: new Date(),
        startedAt: new Date(),
        createdBy: operatorUser.id,
      },
    }),
    prisma.task.create({
      data: {
        agentId: makeAgent1.id,
        status: TaskStatus.PENDING,
        priority: TaskPriority.LOW,
        name: 'Social Media Monitoring',
        description: 'Monitor social media for brand mentions',
        parameters: JSON.stringify({
          keywords: ['cubcen', 'AI automation'],
          timeRange: '24h',
        }),
        scheduledAt: new Date(Date.now() + 3600000), // 1 hour from now
        createdBy: adminUser.id,
      },
    }),
  ])
  console.log('✅ Created sample tasks:', tasks.length)

  // Create sample health records
  await Promise.all([
    prisma.agentHealth.create({
      data: {
        agentId: n8nAgent1.id,
        status: JSON.stringify({
          status: 'healthy',
          checks: {
            connectivity: 'pass',
            authentication: 'pass',
            resources: 'pass',
          },
        }),
        responseTime: 150,
        errorCount: 0,
        consecutiveErrors: 0,
      },
    }),
    prisma.agentHealth.create({
      data: {
        agentId: n8nAgent2.id,
        status: JSON.stringify({
          status: 'healthy',
          checks: {
            connectivity: 'pass',
            authentication: 'pass',
            resources: 'warning',
          },
        }),
        responseTime: 200,
        errorCount: 1,
        consecutiveErrors: 0,
      },
    }),
    prisma.agentHealth.create({
      data: {
        agentId: makeAgent1.id,
        status: JSON.stringify({
          status: 'healthy',
          checks: {
            connectivity: 'pass',
            authentication: 'pass',
            resources: 'pass',
          },
        }),
        responseTime: 300,
        errorCount: 0,
        consecutiveErrors: 0,
      },
    }),
  ])
  console.log('✅ Created agent health records')

  // Create sample system logs
  await Promise.all([
    prisma.systemLog.create({
      data: {
        level: 'INFO',
        message: 'Cubcen system started successfully',
        context: JSON.stringify({
          version: '1.0.0',
          environment: 'development',
        }),
        source: 'system',
      },
    }),
    prisma.systemLog.create({
      data: {
        level: 'INFO',
        message: 'Platform connection established',
        context: JSON.stringify({
          platformId: n8nPlatform.id,
          platformName: n8nPlatform.name,
        }),
        source: 'platform-adapter',
      },
    }),
    prisma.systemLog.create({
      data: {
        level: 'WARN',
        message: 'Agent health check warning',
        context: JSON.stringify({
          agentId: n8nAgent2.id,
          agentName: n8nAgent2.name,
          issue: 'High resource usage detected',
        }),
        source: 'health-monitor',
      },
    }),
  ])
  console.log('✅ Created system logs')

  console.log('🎉 Cubcen database seeding completed successfully!')
  console.log('\n📋 Summary:')
  console.log('- Users: 3 (admin, operator, viewer)')
  console.log('- Platforms: 2 (n8n, Make.com)')
  console.log('- Agents: 3 (2 n8n, 1 Make.com)')
  console.log('- Workflows: 1 (Customer Onboarding)')
  console.log('- Tasks: 3 (various statuses)')
  console.log('- Health Records: 3')
  console.log('- System Logs: 3')
  console.log('\n🔐 Test Credentials:')
  console.log('- Admin: admin@cubcen.com / admin123')
  console.log('- Operator: operator@cubcen.com / operator123')
  console.log('- Viewer: viewer@cubcen.com / viewer123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })