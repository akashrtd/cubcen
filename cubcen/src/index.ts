// Cubcen Application Entry Point
// Starts the Express server and initializes the application

import app from './server'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/database'

const PORT = process.env.PORT || 3001

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect()
    logger.info('Database connection established')
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Cubcen server started successfully`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      })
    })
    
    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully`)
      
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