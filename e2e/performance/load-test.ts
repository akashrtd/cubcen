import { TestServer } from '../utils/test-server'
import { ApiHelper } from '../utils/test-helpers'
import { performance } from 'perf_hooks'

/**
 * Performance and load testing utilities for Cubcen
 */
export class LoadTester {
  private server: TestServer
  private api: ApiHelper
  private results: PerformanceResult[] = []

  constructor(server: TestServer) {
    this.server = server
    this.api = new ApiHelper(server)
  }

  /**
   * Run concurrent API requests to test load handling
   */
  async runConcurrentRequests(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    concurrency: number,
    duration: number,
    data?: any
  ): Promise<LoadTestResult> {
    console.log(`🚀 Starting load test: ${concurrency} concurrent ${method} requests to ${endpoint}`)
    
    const startTime = performance.now()
    const endTime = startTime + duration
    const promises: Promise<any>[] = []
    const results: RequestResult[] = []

    // Create concurrent requests
    for (let i = 0; i < concurrency; i++) {
      const promise = this.runRequestLoop(endpoint, method, endTime, data, results)
      promises.push(promise)
    }

    // Wait for all requests to complete
    await Promise.all(promises)

    const totalTime = performance.now() - startTime
    
    return this.analyzeResults(results, totalTime, concurrency)
  }

  /**
   * Run requests in a loop until end time
   */
  private async runRequestLoop(
    endpoint: string,
    method: string,
    endTime: number,
    data: any,
    results: RequestResult[]
  ): Promise<void> {
    while (performance.now() < endTime) {
      const requestStart = performance.now()
      
      try {
        let response
        switch (method) {
          case 'GET':
            response = await this.api.get(endpoint)
            break
          case 'POST':
            response = await this.api.post(endpoint, data)
            break
          case 'PUT':
            response = await this.api.put(endpoint, data)
            break
          case 'DELETE':
            response = await this.api.delete(endpoint)
            break
          default:
            throw new Error(`Unsupported HTTP method: ${method}`)
        }

        const requestTime = performance.now() - requestStart
        results.push({
          success: true,
          responseTime: requestTime,
          statusCode: response?.status || 0,
          timestamp: new Date()
        })
      } catch (error: any) {
        const requestTime = performance.now() - requestStart
        results.push({
          success: false,
          responseTime: requestTime,
          statusCode: error.status || 500,
          error: error.message,
          timestamp: new Date()
        })
      }

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }

  /**
   * Analyze load test results
   */
  private analyzeResults(
    results: RequestResult[],
    totalTime: number,
    concurrency: number
  ): LoadTestResult {
    const successfulRequests = results.filter(r => r.success)
    const failedRequests = results.filter(r => !r.success)
    const responseTimes = successfulRequests.map(r => r.responseTime)

    const analysis = {
      totalRequests: results.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      successRate: (successfulRequests.length / results.length) * 100,
      requestsPerSecond: results.length / (totalTime / 1000),
      concurrency,
      duration: totalTime,
      responseTime: {
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        average: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        p50: this.percentile(responseTimes, 50),
        p95: this.percentile(responseTimes, 95),
        p99: this.percentile(responseTimes, 99)
      },
      errors: this.groupErrors(failedRequests)
    }

    console.log('📊 Load test results:', analysis)
    return analysis
  }

  /**
   * Calculate percentile from array of numbers
   */
  private percentile(arr: number[], p: number): number {
    const sorted = arr.sort((a, b) => a - b)
    const index = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[index] || 0
  }

  /**
   * Group errors by type
   */
  private groupErrors(failedRequests: RequestResult[]): Record<string, number> {
    const errors: Record<string, number> = {}
    
    failedRequests.forEach(request => {
      const key = `${request.statusCode}: ${request.error || 'Unknown error'}`
      errors[key] = (errors[key] || 0) + 1
    })

    return errors
  }

  /**
   * Test database performance under load
   */
  async testDatabaseLoad(
    operations: number,
    concurrency: number
  ): Promise<DatabaseLoadResult> {
    console.log(`🗄️ Testing database load: ${operations} operations with ${concurrency} concurrent connections`)
    
    const startTime = performance.now()
    const promises: Promise<any>[] = []
    const results: DatabaseOperationResult[] = []

    // Create concurrent database operations
    for (let i = 0; i < concurrency; i++) {
      const promise = this.runDatabaseOperations(operations / concurrency, results)
      promises.push(promise)
    }

    await Promise.all(promises)

    const totalTime = performance.now() - startTime
    const successfulOps = results.filter(r => r.success)
    const failedOps = results.filter(r => !r.success)

    return {
      totalOperations: results.length,
      successfulOperations: successfulOps.length,
      failedOperations: failedOps.length,
      successRate: (successfulOps.length / results.length) * 100,
      operationsPerSecond: results.length / (totalTime / 1000),
      averageResponseTime: successfulOps.reduce((sum, op) => sum + op.responseTime, 0) / successfulOps.length,
      duration: totalTime,
      errors: this.groupDatabaseErrors(failedOps)
    }
  }

  /**
   * Run database operations
   */
  private async runDatabaseOperations(
    count: number,
    results: DatabaseOperationResult[]
  ): Promise<void> {
    const prisma = this.server.getPrisma()

    for (let i = 0; i < count; i++) {
      const operationStart = performance.now()
      
      try {
        // Mix of read and write operations
        if (i % 4 === 0) {
          // Create operation
          await prisma.agent.create({
            data: {
              name: `Load Test Agent ${i}`,
              platformId: 'test-platform',
              externalId: `load-test-${i}`,
              status: 'active',
              capabilities: JSON.stringify(['testing']),
              configuration: JSON.stringify({ test: true }),
              healthStatus: 'healthy'
            }
          })
        } else if (i % 4 === 1) {
          // Read operation
          await prisma.agent.findMany({ take: 10 })
        } else if (i % 4 === 2) {
          // Update operation
          const agents = await prisma.agent.findMany({ take: 1 })
          if (agents.length > 0) {
            await prisma.agent.update({
              where: { id: agents[0].id },
              data: { updatedAt: new Date() }
            })
          }
        } else {
          // Complex query
          await prisma.agent.findMany({
            include: {
              platform: true,
              tasks: { take: 5 }
            },
            take: 5
          })
        }

        const responseTime = performance.now() - operationStart
        results.push({
          success: true,
          responseTime,
          operation: 'database',
          timestamp: new Date()
        })
      } catch (error: any) {
        const responseTime = performance.now() - operationStart
        results.push({
          success: false,
          responseTime,
          operation: 'database',
          error: error.message,
          timestamp: new Date()
        })
      }
    }
  }

  /**
   * Group database errors
   */
  private groupDatabaseErrors(failedOps: DatabaseOperationResult[]): Record<string, number> {
    const errors: Record<string, number> = {}
    
    failedOps.forEach(op => {
      const key = op.error || 'Unknown database error'
      errors[key] = (errors[key] || 0) + 1
    })

    return errors
  }

  /**
   * Test memory usage under load
   */
  async testMemoryUsage(duration: number): Promise<MemoryTestResult> {
    console.log(`🧠 Testing memory usage for ${duration}ms`)
    
    const startMemory = process.memoryUsage()
    const memorySnapshots: MemorySnapshot[] = []
    const startTime = performance.now()
    const endTime = startTime + duration

    // Take memory snapshots every 100ms
    const interval = setInterval(() => {
      const memory = process.memoryUsage()
      memorySnapshots.push({
        timestamp: new Date(),
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        external: memory.external,
        rss: memory.rss
      })
    }, 100)

    // Run some operations to stress memory
    while (performance.now() < endTime) {
      await this.api.get('/api/cubcen/v1/agents')
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    clearInterval(interval)
    
    const endMemory = process.memoryUsage()
    const maxHeapUsed = Math.max(...memorySnapshots.map(s => s.heapUsed))
    const avgHeapUsed = memorySnapshots.reduce((sum, s) => sum + s.heapUsed, 0) / memorySnapshots.length

    return {
      startMemory,
      endMemory,
      maxHeapUsed,
      avgHeapUsed,
      memoryGrowth: endMemory.heapUsed - startMemory.heapUsed,
      snapshots: memorySnapshots,
      duration
    }
  }
}

// Type definitions
interface RequestResult {
  success: boolean
  responseTime: number
  statusCode: number
  error?: string
  timestamp: Date
}

interface DatabaseOperationResult {
  success: boolean
  responseTime: number
  operation: string
  error?: string
  timestamp: Date
}

interface MemorySnapshot {
  timestamp: Date
  heapUsed: number
  heapTotal: number
  external: number
  rss: number
}

interface LoadTestResult {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  successRate: number
  requestsPerSecond: number
  concurrency: number
  duration: number
  responseTime: {
    min: number
    max: number
    average: number
    p50: number
    p95: number
    p99: number
  }
  errors: Record<string, number>
}

interface DatabaseLoadResult {
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  successRate: number
  operationsPerSecond: number
  averageResponseTime: number
  duration: number
  errors: Record<string, number>
}

interface MemoryTestResult {
  startMemory: NodeJS.MemoryUsage
  endMemory: NodeJS.MemoryUsage
  maxHeapUsed: number
  avgHeapUsed: number
  memoryGrowth: number
  snapshots: MemorySnapshot[]
  duration: number
}

interface PerformanceResult {
  testName: string
  result: LoadTestResult | DatabaseLoadResult | MemoryTestResult
  timestamp: Date
}