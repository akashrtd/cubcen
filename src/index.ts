// Cubcen Application Entry Point
// Starts the Express server and initializes the application

import { createServer } from 'http'
import app from './server'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/database'
import { initializeWebSocketService } from '@/services/websocket'
import { AgentService } from '@/services/agent'
import { TaskService } from '@/services/task'
import { WorkflowService } from '@/services/workflow'
import { AdapterManager } from '@/backend/adapters/adapter-factory'
import { initializeTaskService } from '@/backend/routes/tasks'
import { createWorkflowRoutes } from '@/backend/routes/workflows'
import { scheduledBackupService } from '@/lib/backup'
import config from '@/lib/config'

const PORT = process.env.PORT || 3001

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect()
    logger.info('Database connection established')
    
    // Create HTTP server
    const httpServer = createServer(app)
    
    // Initialize adapter manager and services
    const adapterManager = new AdapterManager()
    const agentService = new AgentService(adapterManager)
    
    // Initialize WebSocket service with agent service integration
    const webSocketService = initializeWebSocketService(httpServer, agentService)
    
    // Initialize task service with adapter manager and WebSocket service
    const taskService = new TaskService(adapterManager, webSocketService)
    
    // Initialize workflow service with adapter manager, task service, and WebSocket service
    const workflowService = new WorkflowService(adapterManager, taskService, webSocketService)
    
    // Set WebSocket service in agent service for real-time updates
    agentService.setWebSocketService(webSocketService)
    
    // Initialize task routes with the task service
    initializeTaskService(adapterManager, webSocketService)
    
    // Initialize workflow routes
    app.use('/api/cubcen/v1/workflows', createWorkflowRoutes(workflowService))
    
    // Initialize scheduled backup service
    const backupConfig = config.getBackupConfig()
    if (backupConfig.enabled) {
      scheduledBackupService.start()
      logger.info('Scheduled backup service started', {
        intervalHours: backupConfig.intervalHours,
        retentionDays: backupConfig.retentionDays
      })
    }
    
    logger.info('Services initialized', {
      webSocket: true,
      agentService: true,
      taskService: true,
      workflowService: true,
      scheduledBackup: backupConfig.enabled
    })
    
    // Start the server
    const server = httpServer.listen(PORT, () => {
      logger.info(`Cubcen server started successfully`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        websocket: true
      })
    })
    
    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully`)
      
      // Stop scheduled backup service
      try {
        scheduledBackupService.stop()
        logger.info('Scheduled backup service stopped')
      } catch (error) {
        logger.error('Error stopping scheduled backup service', error as Error)
      }
      
      // Cleanup workflow service first
      try {
        await workflowService.cleanup()
        logger.info('Workflow service cleaned up')
      } catch (error) {
        logger.error('Error cleaning up workflow service', error as Error)
      }
      
      // Cleanup task service
      try {
        await taskService.cleanup()
        logger.info('Task service cleaned up')
      } catch (error) {
        logger.error('Error cleaning up task service', error as Error)
      }
      
      // Cleanup agent service
      try {
        await agentService.cleanup()
        logger.info('Agent service cleaned up')
      } catch (error) {
        logger.error('Error cleaning up agent service', error as Error)
      }
      
      // Shutdown WebSocket service
      try {
        await webSocketService.shutdown()
        logger.info('WebSocket service closed')
      } catch (error) {
        logger.error('Error closing WebSocket service', error as Error)
      }
      
      server.close(async () => {
        logger.info('HTTP server closed')
        
        try {
          await prisma.$disconnect()
          logger.info('Database connection closed')
        } catch (error) {
          logger.error('Error closing database connection', error as Error)
        }
        
        process.exit(0)
      })
      
      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down')
        process.exit(1)
      }, 10000)
    }
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
    
  } catch (error) {
    logger.error('Failed to start server', error as Error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled promise rejection', new Error(String(reason)), {
    promise: promise.toString()
  })
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', error)
  process.exit(1)
})

// Start the server
startServer()