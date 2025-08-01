/**
 * Cubcen Database Seed Script
 * Populates the database with initial development data
 */

import { PrismaClient } from '../src/generated/prisma'
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
      role: 'ADMIN',
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
      role: 'OPERATOR',
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
      role: 'VIEWER',
      name: 'Cubcen Viewer',
    },
  })
  console.log('✅ Created viewer user:', viewerUser.email)

  // Create n8n platform
  const n8nPlatform = await prisma.platform.upsert({
    where: { name_type: { name: 'n8n Development', type: 'N8N' } },
    update: {},
    create: {
      name: 'n8n Development',
      type: 'N8N',
      baseUrl: 'http://localhost:5678',
      status: 'CONNECTED',
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
    where: { name_type: { name: 'Make.com Development', type: 'MAKE' } },
    update: {},
    create: {
      name: 'Make.com Development',
      type: 'MAKE',
      baseUrl: 'https://api.make.com',
      status: 'CONNECTED',
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
      status: 'ACTIVE',
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
      status: 'ACTIVE',
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
      status: 'ACTIVE',
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
        status: 'ACTIVE',
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
        status: 'COMPLETED',
        priority: 'HIGH',
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
        status: 'RUNNING',
        priority: 'MEDIUM',
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
        status: 'PENDING',
        priority: 'LOW',
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

  // Create notification channels
  const emailChannel = await prisma.notificationChannel.upsert({
    where: { id: 'email-channel-1' },
    update: {},
    create: {
      id: 'email-channel-1',
      type: 'EMAIL',
      name: 'Email Notifications',
      enabled: true,
      configuration: JSON.stringify({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        from: process.env.SMTP_FROM || 'noreply@cubcen.com'
      })
    }
  })

  const slackChannel = await prisma.notificationChannel.upsert({
    where: { id: 'slack-channel-1' },
    update: {},
    create: {
      id: 'slack-channel-1',
      type: 'SLACK',
      name: 'Slack Notifications',
      enabled: true,
      configuration: JSON.stringify({
        defaultChannel: '#alerts',
        username: 'Cubcen Bot',
        iconEmoji: ':robot_face:'
      })
    }
  })

  const inAppChannel = await prisma.notificationChannel.upsert({
    where: { id: 'in-app-channel-1' },
    update: {},
    create: {
      id: 'in-app-channel-1',
      type: 'IN_APP',
      name: 'In-App Notifications',
      enabled: true,
      configuration: JSON.stringify({
        maxNotifications: 100,
        retentionDays: 30
      })
    }
  })
  console.log('✅ Created notification channels')

  // Create notification templates
  const templates = [
    {
      eventType: 'AGENT_DOWN',
      channelType: 'EMAIL',
      subject: 'ALERT: Agent {{agentName}} is Down',
      template: `
        <h2>Agent Down Alert</h2>
        <p>The agent <strong>{{agentName}}</strong> on platform {{platformName}} has gone offline.</p>
        <p><strong>Time:</strong> {{timestamp}}</p>
        <p><strong>Agent ID:</strong> {{agentId}}</p>
        <p>Please check the agent status and take appropriate action.</p>
      `,
      variables: ['agentName', 'platformName', 'timestamp', 'agentId']
    },
    {
      eventType: 'AGENT_DOWN',
      channelType: 'SLACK',
      subject: 'Agent Down Alert',
      template: ':warning: *Agent Down Alert*\n\nAgent *{{agentName}}* on {{platformName}} is offline.\n\nTime: {{timestamp}}\nAgent ID: `{{agentId}}`',
      variables: ['agentName', 'platformName', 'timestamp', 'agentId']
    },
    {
      eventType: 'TASK_FAILED',
      channelType: 'EMAIL',
      subject: 'Task Failed: {{taskName}}',
      template: `
        <h2>Task Failure Notification</h2>
        <p>The task <strong>{{taskName}}</strong> has failed.</p>
        <p><strong>Agent:</strong> {{agentName}}</p>
        <p><strong>Error:</strong> {{errorMessage}}</p>
        <p><strong>Time:</strong> {{timestamp}}</p>
        <p>Please review the task logs for more details.</p>
      `,
      variables: ['taskName', 'agentName', 'errorMessage', 'timestamp']
    },
    {
      eventType: 'SYSTEM_ERROR',
      channelType: 'SLACK',
      subject: 'System Error',
      template: ':rotating_light: *System Error*\n\n{{message}}\n\nTime: {{timestamp}}\nPriority: {{priority}}',
      variables: ['message', 'timestamp', 'priority']
    }
  ]

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: {
        eventType_channelType: {
          eventType: template.eventType as any,
          channelType: template.channelType as any
        }
      },
      update: {},
      create: {
        eventType: template.eventType as any,
        channelType: template.channelType as any,
        subject: template.subject,
        template: template.template,
        variables: JSON.stringify(template.variables)
      }
    })
  }
  console.log('✅ Created notification templates')

  // Initialize notification preferences for users
  const defaultPreferences = [
    { eventType: 'AGENT_DOWN', channels: ['EMAIL', 'SLACK'], enabled: true },
    { eventType: 'AGENT_ERROR', channels: ['IN_APP', 'EMAIL'], enabled: true },
    { eventType: 'TASK_FAILED', channels: ['IN_APP'], enabled: true },
    { eventType: 'TASK_COMPLETED', channels: ['IN_APP'], enabled: false },
    { eventType: 'WORKFLOW_FAILED', channels: ['EMAIL', 'SLACK'], enabled: true },
    { eventType: 'WORKFLOW_COMPLETED', channels: ['IN_APP'], enabled: false },
    { eventType: 'SYSTEM_ERROR', channels: ['EMAIL', 'SLACK'], enabled: true },
    { eventType: 'HEALTH_CHECK_FAILED', channels: ['EMAIL'], enabled: true },
    { eventType: 'PLATFORM_DISCONNECTED', channels: ['EMAIL', 'SLACK'], enabled: true }
  ]

  const users = [adminUser, operatorUser, viewerUser]
  for (const user of users) {
    for (const pref of defaultPreferences) {
      await prisma.notificationPreference.upsert({
        where: {
          userId_eventType: {
            userId: user.id,
            eventType: pref.eventType as any
          }
        },
        update: {},
        create: {
          userId: user.id,
          eventType: pref.eventType as any,
          channels: JSON.stringify(pref.channels),
          enabled: pref.enabled,
          escalationDelay: pref.eventType === 'AGENT_DOWN' ? 15 : undefined
        }
      })
    }
  }
  console.log('✅ Created notification preferences for users')

  // Create sample notifications
  await prisma.notification.create({
    data: {
      eventType: 'AGENT_ERROR',
      priority: 'HIGH',
      status: 'SENT',
      title: 'Agent Error Detected',
      message: 'The Email Notification Agent encountered an authentication error.',
      data: JSON.stringify({
        agentId: n8nAgent1.id,
        agentName: n8nAgent1.name,
        errorCode: 'AUTH_FAILED',
        errorMessage: 'SMTP authentication failed'
      }),
      userId: adminUser.id,
      channels: JSON.stringify(['IN_APP', 'EMAIL']),
      sentAt: new Date(Date.now() - 1800000), // 30 minutes ago
      retryCount: 0,
      maxRetries: 3
    }
  })

  await prisma.inAppNotification.create({
    data: {
      userId: adminUser.id,
      title: 'Welcome to Cubcen',
      message: 'Your AI agent management platform is ready to use!',
      type: 'success',
      read: false,
      actionUrl: '/dashboard/agents',
      actionText: 'View Agents'
    }
  })

  console.log('✅ Created sample notifications')

  console.log('🎉 Cubcen database seeding completed successfully!')
  console.log('\n📋 Summary:')
  console.log('- Users: 3 (admin, operator, viewer)')
  console.log('- Platforms: 2 (n8n, Make.com)')
  console.log('- Agents: 3 (2 n8n, 1 Make.com)')
  console.log('- Workflows: 1 (Customer Onboarding)')
  console.log('- Tasks: 3 (various statuses)')
  console.log('- Health Records: 3')
  console.log('- System Logs: 3')
  console.log('- Notification Channels: 3 (Email, Slack, In-App)')
  console.log('- Notification Templates: 4')
  console.log('- User Preferences: 27 (9 per user)')
  console.log('- Sample Notifications: 2')
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