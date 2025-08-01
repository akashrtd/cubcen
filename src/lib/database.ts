/**
 * Cubcen Database Service
 * Provides type-safe database operations using Prisma ORM
 */

import { PrismaClient } from '../generated/prisma'
import { logger } from './logger'

// Global Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined
}

// Create Prisma client with proper configuration
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  })
}

// Use global instance in development to prevent multiple connections
export const prisma = globalThis.__prisma || createPrismaClient()

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

// Set up logging for database events (commented out due to TypeScript issues in MVP)
// Will be re-enabled in future versions with proper event typing
// prisma.$on('query', (e) => {
//   logger.debug('Database query executed', {
//     query: e.query,
//     params: e.params,
//     duration: e.duration,
//     target: e.target,
//   })
// })

/**
 * Database connection health check
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy'
  details: Record<string, unknown>
}> {
  try {
    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1`

    // Get database statistics
    const userCount = await prisma.user.count()
    const agentCount = await prisma.agent.count()
    const taskCount = await prisma.task.count()
    const platformCount = await prisma.platform.count()

    return {
      status: 'healthy',
      details: {
        connected: true,
        userCount,
        agentCount,
        taskCount,
        platformCount,
        lastChecked: new Date().toISOString(),
      },
    }
  } catch (error) {
    logger.error('Database health check failed', error as Error)
    return {
      status: 'unhealthy',
      details: {
        connected: false,
        error: (error as Error).message,
        lastChecked: new Date().toISOString(),
      },
    }
  }
}

/**
 * Graceful database disconnection
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    logger.info('Database disconnected successfully')
  } catch (error) {
    logger.error('Error disconnecting from database', error as Error)
    throw error
  }
}

/**
 * Database transaction wrapper with error handling
 */
export async function withTransaction<T>(
  callback: (
    tx: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(callback)
  } catch (error) {
    logger.error('Database transaction failed', error as Error)
    throw error
  }
}

// Export Prisma types for use in other modules
export type {
  User,
  Platform,
  Agent,
  Task,
  Workflow,
  WorkflowStep,
  SystemLog,
  AgentHealth,
  Metric,
  UserRole,
  PlatformType,
  PlatformStatus,
  AgentStatus,
  TaskStatus,
  TaskPriority,
  WorkflowStatus,
  LogLevel,
  MetricType,
} from '../generated/prisma'
