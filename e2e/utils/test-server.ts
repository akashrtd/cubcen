import express from 'express'
import { Server } from 'http'
import { PrismaClient } from '../../src/generated/prisma'
import app from '../../src/server'

/**
 * Test server utility for E2E tests
 * Provides methods to start/stop test server and manage test data
 */
export class TestServer {
  private app: express.Application
  private server: Server | null = null
  private prisma: PrismaClient
  private port: number

  constructor(port: number = 3001) {
    this.port = port
    this.app = app // Use the pre-configured app from server.ts
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./e2e/temp/test.db',
        },
      },
    })
  }

  /**
   * Start the test server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (err?: Error) => {
        if (err) {
          reject(err)
        } else {
          console.log(`🚀 Test server started on port ${this.port}`)
          resolve()
        }
      })
    })
  }

  /**
   * Stop the test server
   */
  async stop(): Promise<void> {
    return new Promise(resolve => {
      if (this.server) {
        this.server.close(() => {
          console.log('🛑 Test server stopped')
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  /**
   * Get the test server URL
   */
  getUrl(): string {
    return `http://localhost:${this.port}`
  }

  /**
   * Get Prisma client for test data manipulation
   */
  getPrisma(): PrismaClient {
    return this.prisma
  }

  /**
   * Reset test database to initial state
   */
  async resetDatabase(): Promise<void> {
    await this.prisma.task.deleteMany()
    await this.prisma.agent.deleteMany()
    await this.prisma.platform.deleteMany()
    await this.prisma.user.deleteMany()
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect()
    await this.stop()
  }
}
