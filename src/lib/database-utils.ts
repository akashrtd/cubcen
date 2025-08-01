/**
 * Cubcen Database Utilities
 * Helper functions for database operations and testing
 */

import { prisma } from './database'
import { logger } from './logger'

/**
 * Reset database for testing - removes all data
 */
export async function resetDatabase(): Promise<void> {
  logger.info('Resetting database...')
  const tableNames = [
    'AgentHealth',
    'Metric',
    'SystemLog',
    'Notification',
    'WorkflowStep',
    'Task',
    'Workflow',
    'Agent',
    'Platform',
    'User',
  ];

  for (const tableName of tableNames) {
    const model =
      tableName.charAt(0).toLowerCase() +
      tableName.slice(1);
    if ((prisma as any)[model]) {
      try {
        await (prisma as any)[model].deleteMany({});
      } catch (error) {
        logger.warn(
          `Could not delete from ${model}: ${
            (error as Error).message
          }`,
        );
      }
    }
  }
  logger.info('Database reset completed');
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  users: number
  platforms: number
  agents: number
  tasks: number
  workflows: number
  systemLogs: number
}> {
  try {
    const [users, platforms, agents, tasks, workflows, systemLogs] = await Promise.all([
      prisma.user.count(),
      prisma.platform.count(),
      prisma.agent.count(),
      prisma.task.count(),
      prisma.workflow.count(),
      prisma.systemLog.count(),
    ])

    return {
      users,
      platforms,
      agents,
      tasks,
      workflows,
      systemLogs,
    }
  } catch (error) {
    logger.error('Failed to get database statistics', error as Error)
    throw error
  }
}

/**
 * Validate database schema integrity
 */
export async function validateDatabaseSchema(): Promise<{
  isValid: boolean
  errors: string[]
}> {
  const errors: string[] = []

  try {
    // Test basic queries to ensure schema is working
    await prisma.user.findFirst()
    await prisma.platform.findFirst()
    await prisma.agent.findFirst()
    await prisma.task.findFirst()
    await prisma.workflow.findFirst()

    // Test relationships
    await prisma.user.findFirst({
      include: { createdWorkflows: true }
    })

    await prisma.agent.findFirst({
      include: { tasks: true }
    })

    await prisma.platform.findFirst({
      include: { agents: true }
    })

    logger.info('Database schema validation completed successfully')
    return { isValid: true, errors: [] }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(errorMessage)
    logger.error('Database schema validation failed', error as Error)
    return { isValid: false, errors }
  }
}

/**
 * Create test data for development
 */
export async function createTestData(): Promise<void> {
  try {
    logger.info('Creating test data...')

    // Create test user
    await prisma.user.upsert({
      where: { email: 'test@cubcen.com' },
      update: {},
      create: {
        email: 'test@cubcen.com',
        password: 'test123',
        role: 'ADMIN',
        name: 'Test User',
      },
    })

    // Create test platform
    const testPlatform = await prisma.platform.upsert({
      where: { name_type: { name: 'Test Platform', type: 'N8N' } },
      update: {},
      create: {
        name: 'Test Platform',
        type: 'N8N',
        baseUrl: 'http://localhost:5678',
        status: 'CONNECTED',
        authConfig: JSON.stringify({ apiKey: 'test-key' }),
      },
    })

    // Create test agent
    await prisma.agent.upsert({
      where: { platformId_externalId: { platformId: testPlatform.id, externalId: 'test-agent-001' } },
      update: {},
      create: {
        name: 'Test Agent',
        platformId: testPlatform.id,
        externalId: 'test-agent-001',
        status: 'ACTIVE',
        capabilities: JSON.stringify(['test', 'automation']),
        configuration: JSON.stringify({ testMode: true }),
        healthStatus: JSON.stringify({ status: 'healthy' }),
        description: 'Test agent for development',
      },
    })

    logger.info('Test data created successfully')
  } catch (error) {
    logger.error('Failed to create test data', error as Error)
    throw error
  }
}
