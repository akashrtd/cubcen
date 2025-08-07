/**
 * Cubcen Performance Benchmarking and Load Testing
 * Provides tools for measuring and testing system performance
 */

import { logger } from './logger'
import { prisma } from './database'
import { cache } from './cache'
import { performanceMonitor } from './performance-monitor'

export interface BenchmarkResult {
  name: string
  duration: number
  operations: number
  opsPerSecond: number
  averageTime: number
  minTime: number
  maxTime: number
  memoryUsage: {
    before: NodeJS.MemoryUsage
    after: NodeJS.MemoryUsage
    delta: number
  }
  timestamp: Date
}

export interface LoadTestConfig {
  name: string
  duration: number // Test duration in milliseconds
  concurrency: number // Number of concurrent operations
  rampUpTime?: number // Time to reach full concurrency
  operation: () => Promise<void>
  warmupRuns?: number
}

export interface LoadTestResult {
  config: LoadTestConfig
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  operationsPerSecond: number
  errorRate: number
  errors: Array<{ error: string; count: number }>
  memoryUsage: {
    initial: NodeJS.MemoryUsage
    peak: NodeJS.MemoryUsage
    final: NodeJS.MemoryUsage
  }
  duration: number
  timestamp: Date
}

export class Benchmark {
  /**
   * Run a simple benchmark
   */
  static async run(
    name: string,
    operation: () => Promise<void>,
    iterations = 1000
  ): Promise<BenchmarkResult> {
    logger.info(`Starting benchmark: ${name}`, { iterations })

    const memoryBefore = process.memoryUsage()
    const times: number[] = []

    // Warmup runs
    for (let i = 0; i < Math.min(10, iterations); i++) {
      await operation()
    }

    // Actual benchmark
    const startTime = Date.now()

    for (let i = 0; i < iterations; i++) {
      const opStart = Date.now()
      await operation()
      const opEnd = Date.now()
      times.push(opEnd - opStart)
    }

    const endTime = Date.now()
    const memoryAfter = process.memoryUsage()

    const duration = endTime - startTime
    const averageTime =
      times.reduce((sum, time) => sum + time, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    const opsPerSecond = (iterations / duration) * 1000

    const result: BenchmarkResult = {
      name,
      duration,
      operations: iterations,
      opsPerSecond: Math.round(opsPerSecond * 100) / 100,
      averageTime: Math.round(averageTime * 100) / 100,
      minTime,
      maxTime,
      memoryUsage: {
        before: memoryBefore,
        after: memoryAfter,
        delta: memoryAfter.heapUsed - memoryBefore.heapUsed,
      },
      timestamp: new Date(),
    }

    logger.info(`Benchmark completed: ${name}`, result)
    return result
  }

  /**
   * Run database query benchmark
   */
  static async benchmarkDatabase(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = []

    // Simple select benchmark
    results.push(
      await this.run(
        'Database: Simple Select',
        async () => {
          await prisma.user.findFirst()
        },
        100
      )
    )

    // Complex query benchmark
    results.push(
      await this.run(
        'Database: Complex Query',
        async () => {
          await prisma.agent.findMany({
            include: {
              platform: true,
              tasks: {
                take: 5,
                orderBy: { createdAt: 'desc' },
              },
            },
            take: 10,
          })
        },
        50
      )
    )

    // Insert benchmark
    results.push(
      await this.run(
        'Database: Insert',
        async () => {
          await prisma.systemLog.create({
            data: {
              level: 'INFO',
              message: 'Benchmark test log',
              source: 'benchmark',
            },
          })
        },
        100
      )
    )

    // Aggregation benchmark
    results.push(
      await this.run(
        'Database: Aggregation',
        async () => {
          await prisma.task.groupBy({
            by: ['status'],
            _count: { status: true },
          })
        },
        50
      )
    )

    return results
  }

  /**
   * Run cache benchmark
   */
  static async benchmarkCache(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = []

    // Cache write benchmark
    results.push(
      await this.run(
        'Cache: Write',
        async () => {
          const key = `benchmark-${Math.random()}`
          const data = { test: 'data', timestamp: Date.now() }
          cache.set(key, data)
        },
        1000
      )
    )

    // Cache read benchmark (with existing data)
    const testKey = 'benchmark-read-test'
    cache.set(testKey, { test: 'data' })

    results.push(
      await this.run(
        'Cache: Read Hit',
        async () => {
          cache.get(testKey)
        },
        1000
      )
    )

    // Cache read miss benchmark
    results.push(
      await this.run(
        'Cache: Read Miss',
        async () => {
          cache.get(`nonexistent-${Math.random()}`)
        },
        1000
      )
    )

    return results
  }

  /**
   * Run API endpoint benchmark
   */
  static async benchmarkAPI(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = []

    // This would require actual HTTP requests in a real implementation
    // For now, we'll simulate API operations

    results.push(
      await this.run(
        'API: Agent List',
        async () => {
          // Simulate agent list API call
          await prisma.agent.findMany({ take: 20 })
        },
        100
      )
    )

    results.push(
      await this.run(
        'API: Task Statistics',
        async () => {
          // Simulate task statistics API call
          await Promise.all([
            prisma.task.count(),
            prisma.task.count({ where: { status: 'COMPLETED' } }),
            prisma.task.count({ where: { status: 'FAILED' } }),
          ])
        },
        100
      )
    )

    return results
  }
}

export class LoadTester {
  /**
   * Run load test
   */
  static async run(config: LoadTestConfig): Promise<LoadTestResult> {
    logger.info(`Starting load test: ${config.name}`, {
      duration: config.duration,
      concurrency: config.concurrency,
    })

    const initialMemory = process.memoryUsage()
    let peakMemory = initialMemory
    const errors = new Map<string, number>()
    const responseTimes: number[] = []
    let successfulOperations = 0
    let failedOperations = 0

    // Warmup runs
    if (config.warmupRuns && config.warmupRuns > 0) {
      logger.info(`Running ${config.warmupRuns} warmup operations`)
      for (let i = 0; i < config.warmupRuns; i++) {
        try {
          await config.operation()
        } catch (error) {
          // Ignore warmup errors
        }
      }
    }

    const startTime = Date.now()
    const endTime = startTime + config.duration
    const rampUpTime = config.rampUpTime || 0
    const rampUpEnd = startTime + rampUpTime

    // Track active operations
    const activeOperations = new Set<Promise<void>>()

    // Memory monitoring
    const memoryMonitor = setInterval(() => {
      const currentMemory = process.memoryUsage()
      if (currentMemory.heapUsed > peakMemory.heapUsed) {
        peakMemory = currentMemory
      }
    }, 1000)

    // Main load test loop
    while (Date.now() < endTime) {
      const now = Date.now()

      // Calculate current concurrency based on ramp-up
      let currentConcurrency = config.concurrency
      if (rampUpTime > 0 && now < rampUpEnd) {
        const rampUpProgress = (now - startTime) / rampUpTime
        currentConcurrency = Math.ceil(config.concurrency * rampUpProgress)
      }

      // Start new operations if under concurrency limit
      while (
        activeOperations.size < currentConcurrency &&
        Date.now() < endTime
      ) {
        const operationPromise = this.runSingleOperation(
          config.operation,
          responseTimes,
          errors
        )

        operationPromise
          .then(() => {
            successfulOperations++
          })
          .catch(() => {
            failedOperations++
          })
          .finally(() => {
            activeOperations.delete(operationPromise)
          })

        activeOperations.add(operationPromise)
      }

      // Small delay to prevent tight loop
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    // Wait for remaining operations to complete
    await Promise.allSettled(Array.from(activeOperations))

    clearInterval(memoryMonitor)
    const finalMemory = process.memoryUsage()

    const totalOperations = successfulOperations + failedOperations
    const actualDuration = Date.now() - startTime
    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0
    const minResponseTime =
      responseTimes.length > 0 ? Math.min(...responseTimes) : 0
    const maxResponseTime =
      responseTimes.length > 0 ? Math.max(...responseTimes) : 0
    const operationsPerSecond = (totalOperations / actualDuration) * 1000
    const errorRate =
      totalOperations > 0 ? (failedOperations / totalOperations) * 100 : 0

    const result: LoadTestResult = {
      config,
      totalOperations,
      successfulOperations,
      failedOperations,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      minResponseTime,
      maxResponseTime,
      operationsPerSecond: Math.round(operationsPerSecond * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      errors: Array.from(errors.entries()).map(([error, count]) => ({
        error,
        count,
      })),
      memoryUsage: {
        initial: initialMemory,
        peak: peakMemory,
        final: finalMemory,
      },
      duration: actualDuration,
      timestamp: new Date(),
    }

    logger.info(`Load test completed: ${config.name}`, result)
    return result
  }

  /**
   * Run a single operation and track metrics
   */
  private static async runSingleOperation(
    operation: () => Promise<void>,
    responseTimes: number[],
    errors: Map<string, number>
  ): Promise<void> {
    const startTime = Date.now()

    try {
      await operation()
      const responseTime = Date.now() - startTime
      responseTimes.push(responseTime)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      const currentCount = errors.get(errorMessage) || 0
      errors.set(errorMessage, currentCount + 1)
      throw error
    }
  }

  /**
   * Run database load test
   */
  static async testDatabase(
    duration = 30000,
    concurrency = 10
  ): Promise<LoadTestResult> {
    return this.run({
      name: 'Database Load Test',
      duration,
      concurrency,
      rampUpTime: 5000,
      warmupRuns: 10,
      operation: async () => {
        // Mix of different database operations
        const operations = [
          () => prisma.agent.findMany({ take: 10 }),
          () => prisma.task.count(),
          () =>
            prisma.systemLog.create({
              data: {
                level: 'INFO',
                message: 'Load test log',
                source: 'load-test',
              },
            }),
          () => prisma.user.findFirst(),
        ]

        const randomOperation =
          operations[Math.floor(Math.random() * operations.length)]
        await randomOperation()
      },
    })
  }

  /**
   * Run cache load test
   */
  static async testCache(
    duration = 30000,
    concurrency = 50
  ): Promise<LoadTestResult> {
    return this.run({
      name: 'Cache Load Test',
      duration,
      concurrency,
      rampUpTime: 2000,
      operation: async () => {
        const key = `load-test-${Math.floor(Math.random() * 1000)}`

        if (Math.random() > 0.3) {
          // 70% reads
          cache.get(key)
        } else {
          // 30% writes
          cache.set(key, { data: 'test', timestamp: Date.now() })
        }
      },
    })
  }

  /**
   * Run memory stress test
   */
  static async testMemory(
    duration = 60000,
    concurrency = 5
  ): Promise<LoadTestResult> {
    return this.run({
      name: 'Memory Stress Test',
      duration,
      concurrency,
      operation: async () => {
        // Create and manipulate large objects
        const largeArray = new Array(10000).fill(0).map((_, i) => ({
          id: i,
          data: `test-data-${i}`,
          timestamp: Date.now(),
          nested: {
            value: Math.random(),
            array: new Array(100).fill(Math.random()),
          },
        }))

        // Perform operations on the array
        largeArray.sort((a, b) => a.nested.value - b.nested.value)
        largeArray.filter(item => item.nested.value > 0.5)

        // Force garbage collection opportunity
        await new Promise(resolve => setTimeout(resolve, 10))
      },
    })
  }
}

// Performance test suite
export class PerformanceTestSuite {
  /**
   * Run comprehensive performance tests
   */
  static async runAll(): Promise<{
    benchmarks: BenchmarkResult[]
    loadTests: LoadTestResult[]
    summary: {
      totalTests: number
      totalDuration: number
      criticalIssues: string[]
      recommendations: string[]
    }
  }> {
    logger.info('Starting comprehensive performance test suite')
    const startTime = Date.now()

    const benchmarks: BenchmarkResult[] = []
    const loadTests: LoadTestResult[] = []
    const criticalIssues: string[] = []
    const recommendations: string[] = []

    try {
      // Run benchmarks
      logger.info('Running database benchmarks')
      benchmarks.push(...(await Benchmark.benchmarkDatabase()))

      logger.info('Running cache benchmarks')
      benchmarks.push(...(await Benchmark.benchmarkCache()))

      logger.info('Running API benchmarks')
      benchmarks.push(...(await Benchmark.benchmarkAPI()))

      // Run load tests
      logger.info('Running database load test')
      loadTests.push(await LoadTester.testDatabase(30000, 10))

      logger.info('Running cache load test')
      loadTests.push(await LoadTester.testCache(30000, 50))

      logger.info('Running memory stress test')
      loadTests.push(await LoadTester.testMemory(60000, 5))

      // Analyze results
      this.analyzeResults(
        benchmarks,
        loadTests,
        criticalIssues,
        recommendations
      )
    } catch (error) {
      logger.error(
        'Performance test suite failed',
        error instanceof Error ? error : undefined
      )
      criticalIssues.push(`Test suite execution failed: ${error}`)
    }

    const totalDuration = Date.now() - startTime

    const summary = {
      totalTests: benchmarks.length + loadTests.length,
      totalDuration,
      criticalIssues,
      recommendations,
    }

    logger.info('Performance test suite completed', summary)

    return {
      benchmarks,
      loadTests,
      summary,
    }
  }

  /**
   * Analyze test results and generate recommendations
   */
  private static analyzeResults(
    benchmarks: BenchmarkResult[],
    loadTests: LoadTestResult[],
    criticalIssues: string[],
    recommendations: string[]
  ): void {
    // Analyze benchmarks
    benchmarks.forEach(benchmark => {
      if (benchmark.averageTime > 1000) {
        criticalIssues.push(
          `Slow operation: ${benchmark.name} (${benchmark.averageTime}ms average)`
        )
      }

      if (benchmark.opsPerSecond < 10) {
        recommendations.push(
          `Consider optimizing ${benchmark.name} - only ${benchmark.opsPerSecond} ops/sec`
        )
      }

      if (benchmark.memoryUsage.delta > 50 * 1024 * 1024) {
        // 50MB
        recommendations.push(
          `High memory usage in ${benchmark.name} - ${Math.round(benchmark.memoryUsage.delta / 1024 / 1024)}MB`
        )
      }
    })

    // Analyze load tests
    loadTests.forEach(loadTest => {
      if (loadTest.errorRate > 5) {
        criticalIssues.push(
          `High error rate in ${loadTest.config.name}: ${loadTest.errorRate}%`
        )
      }

      if (loadTest.averageResponseTime > 2000) {
        criticalIssues.push(
          `Slow response time in ${loadTest.config.name}: ${loadTest.averageResponseTime}ms`
        )
      }

      if (loadTest.operationsPerSecond < 10) {
        recommendations.push(
          `Low throughput in ${loadTest.config.name}: ${loadTest.operationsPerSecond} ops/sec`
        )
      }

      const memoryGrowth =
        loadTest.memoryUsage.final.heapUsed -
        loadTest.memoryUsage.initial.heapUsed
      if (memoryGrowth > 100 * 1024 * 1024) {
        // 100MB
        recommendations.push(
          `Potential memory leak in ${loadTest.config.name}: ${Math.round(memoryGrowth / 1024 / 1024)}MB growth`
        )
      }
    })

    // General recommendations
    if (criticalIssues.length === 0) {
      recommendations.push(
        'Performance looks good! Consider monitoring in production.'
      )
    }

    if (
      benchmarks.some(b => b.name.includes('Database') && b.averageTime > 100)
    ) {
      recommendations.push(
        'Consider adding database indexes for frequently queried fields'
      )
    }

    if (
      loadTests.some(
        t => t.config.name.includes('Cache') && t.averageResponseTime > 10
      )
    ) {
      recommendations.push(
        'Cache performance could be improved - consider Redis for production'
      )
    }
  }
}

// Export utilities
export const performanceUtils = {
  benchmark: Benchmark,
  loadTester: LoadTester,
  testSuite: PerformanceTestSuite,
}
