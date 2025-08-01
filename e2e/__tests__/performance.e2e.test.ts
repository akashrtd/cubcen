import { TestServer } from '../utils/test-server'
import { LoadTester } from '../performance/load-test'

describe('Performance and Load Testing E2E', () => {
  let server: TestServer
  let loadTester: LoadTester

  beforeAll(async () => {
    server = new TestServer()
    await server.start()
    loadTester = new LoadTester(server)
  })

  afterAll(async () => {
    await server.cleanup()
  })

  describe('API Performance Tests', () => {
    it('should handle concurrent GET requests to agents endpoint', async () => {
      const result = await loadTester.runConcurrentRequests(
        '/api/cubcen/v1/agents',
        'GET',
        10, // 10 concurrent requests
        5000 // for 5 seconds
      )

      // Performance assertions
      expect(result.successRate).toBeGreaterThan(95) // 95% success rate
      expect(result.responseTime.average).toBeLessThan(200) // Average response time < 200ms
      expect(result.responseTime.p95).toBeLessThan(500) // 95th percentile < 500ms
      expect(result.requestsPerSecond).toBeGreaterThan(20) // At least 20 RPS

      console.log('📊 Agents GET Performance:', {
        successRate: `${result.successRate.toFixed(2)}%`,
        avgResponseTime: `${result.responseTime.average.toFixed(2)}ms`,
        p95ResponseTime: `${result.responseTime.p95.toFixed(2)}ms`,
        requestsPerSecond: result.requestsPerSecond.toFixed(2),
      })
    })

    it('should handle concurrent POST requests for agent creation', async () => {
      const agentData = {
        name: 'Performance Test Agent',
        platformId: 'test-platform',
        platformType: 'n8n',
        externalId: 'perf-test',
        capabilities: ['testing'],
        configuration: { test: true },
      }

      const result = await loadTester.runConcurrentRequests(
        '/api/cubcen/v1/agents',
        'POST',
        5, // 5 concurrent requests
        3000, // for 3 seconds
        agentData
      )

      // Performance assertions for write operations
      expect(result.successRate).toBeGreaterThan(90) // 90% success rate for writes
      expect(result.responseTime.average).toBeLessThan(300) // Average response time < 300ms
      expect(result.responseTime.p95).toBeLessThan(800) // 95th percentile < 800ms

      console.log('📊 Agents POST Performance:', {
        successRate: `${result.successRate.toFixed(2)}%`,
        avgResponseTime: `${result.responseTime.average.toFixed(2)}ms`,
        p95ResponseTime: `${result.responseTime.p95.toFixed(2)}ms`,
        totalRequests: result.totalRequests,
      })
    })

    it('should handle mixed read/write operations', async () => {
      // Run concurrent GET and POST requests
      const [getResult, postResult] = await Promise.all([
        loadTester.runConcurrentRequests(
          '/api/cubcen/v1/agents',
          'GET',
          8,
          4000
        ),
        loadTester.runConcurrentRequests(
          '/api/cubcen/v1/tasks',
          'POST',
          3,
          4000,
          {
            name: 'Mixed Load Test Task',
            agentId: 'test-agent-id',
            priority: 'medium',
            parameters: { test: true },
          }
        ),
      ])

      // Both operations should maintain good performance
      expect(getResult.successRate).toBeGreaterThan(95)
      expect(postResult.successRate).toBeGreaterThan(85)
      expect(getResult.responseTime.average).toBeLessThan(250)
      expect(postResult.responseTime.average).toBeLessThan(400)

      console.log('📊 Mixed Operations Performance:', {
        getSuccessRate: `${getResult.successRate.toFixed(2)}%`,
        postSuccessRate: `${postResult.successRate.toFixed(2)}%`,
        getAvgTime: `${getResult.responseTime.average.toFixed(2)}ms`,
        postAvgTime: `${postResult.responseTime.average.toFixed(2)}ms`,
      })
    })

    it('should maintain performance under sustained load', async () => {
      const result = await loadTester.runConcurrentRequests(
        '/api/cubcen/v1/agents',
        'GET',
        15, // 15 concurrent requests
        10000 // for 10 seconds
      )

      // Sustained load performance requirements
      expect(result.successRate).toBeGreaterThan(95)
      expect(result.responseTime.average).toBeLessThan(300)
      expect(result.responseTime.p99).toBeLessThan(1000) // 99th percentile < 1s
      expect(result.requestsPerSecond).toBeGreaterThan(30)

      console.log('📊 Sustained Load Performance:', {
        duration: `${(result.duration / 1000).toFixed(2)}s`,
        totalRequests: result.totalRequests,
        successRate: `${result.successRate.toFixed(2)}%`,
        avgResponseTime: `${result.responseTime.average.toFixed(2)}ms`,
        p99ResponseTime: `${result.responseTime.p99.toFixed(2)}ms`,
        requestsPerSecond: result.requestsPerSecond.toFixed(2),
      })
    })
  })

  describe('Database Performance Tests', () => {
    it('should handle concurrent database operations', async () => {
      const result = await loadTester.testDatabaseLoad(
        200, // 200 operations
        10 // 10 concurrent connections
      )

      // Database performance assertions
      expect(result.successRate).toBeGreaterThan(95)
      expect(result.averageResponseTime).toBeLessThan(100) // Average DB operation < 100ms
      expect(result.operationsPerSecond).toBeGreaterThan(50) // At least 50 ops/sec

      console.log('📊 Database Performance:', {
        successRate: `${result.successRate.toFixed(2)}%`,
        avgResponseTime: `${result.averageResponseTime.toFixed(2)}ms`,
        operationsPerSecond: result.operationsPerSecond.toFixed(2),
        totalOperations: result.totalOperations,
      })
    })

    it('should handle large dataset queries efficiently', async () => {
      // First create a larger dataset
      const prisma = server.getPrisma()
      const agents = []

      for (let i = 0; i < 100; i++) {
        agents.push({
          name: `Dataset Agent ${i}`,
          platformId: 'test-platform',
          platformType: 'n8n',
          externalId: `dataset-${i}`,
          status: 'active',
          healthStatus: 'healthy',
          capabilities: JSON.stringify(['testing']),
          configuration: JSON.stringify({ index: i }),
        })
      }

      await prisma.agent.createMany({ data: agents })

      // Test query performance on larger dataset
      const result = await loadTester.runConcurrentRequests(
        '/api/cubcen/v1/agents?limit=50',
        'GET',
        5,
        3000
      )

      expect(result.successRate).toBeGreaterThan(95)
      expect(result.responseTime.average).toBeLessThan(300)

      console.log('📊 Large Dataset Query Performance:', {
        successRate: `${result.successRate.toFixed(2)}%`,
        avgResponseTime: `${result.responseTime.average.toFixed(2)}ms`,
        totalRequests: result.totalRequests,
      })
    })
  })

  describe('Memory Usage Tests', () => {
    it('should maintain stable memory usage under load', async () => {
      const result = await loadTester.testMemoryUsage(10000) // 10 seconds

      // Memory usage assertions
      const memoryGrowthMB = result.memoryGrowth / (1024 * 1024)
      const maxHeapMB = result.maxHeapUsed / (1024 * 1024)

      expect(memoryGrowthMB).toBeLessThan(50) // Memory growth < 50MB
      expect(maxHeapMB).toBeLessThan(200) // Max heap usage < 200MB

      console.log('📊 Memory Usage:', {
        memoryGrowth: `${memoryGrowthMB.toFixed(2)}MB`,
        maxHeapUsed: `${maxHeapMB.toFixed(2)}MB`,
        avgHeapUsed: `${(result.avgHeapUsed / (1024 * 1024)).toFixed(2)}MB`,
        duration: `${(result.duration / 1000).toFixed(2)}s`,
      })
    })

    it('should handle memory cleanup after operations', async () => {
      const initialMemory = process.memoryUsage()

      // Run intensive operations
      await loadTester.runConcurrentRequests(
        '/api/cubcen/v1/agents',
        'GET',
        10,
        5000
      )

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000))

      const finalMemory = process.memoryUsage()
      const memoryGrowth =
        (finalMemory.heapUsed - initialMemory.heapUsed) / (1024 * 1024)

      // Memory should not grow significantly after operations
      expect(memoryGrowth).toBeLessThan(30) // < 30MB growth

      console.log('📊 Memory Cleanup:', {
        initialHeap: `${(initialMemory.heapUsed / (1024 * 1024)).toFixed(2)}MB`,
        finalHeap: `${(finalMemory.heapUsed / (1024 * 1024)).toFixed(2)}MB`,
        growth: `${memoryGrowth.toFixed(2)}MB`,
      })
    })
  })

  describe('Error Handling Performance', () => {
    it('should handle error scenarios efficiently', async () => {
      // Test performance when errors occur
      const result = await loadTester.runConcurrentRequests(
        '/api/cubcen/v1/agents/non-existent-id',
        'GET',
        5,
        3000
      )

      // Error responses should still be fast
      expect(result.responseTime.average).toBeLessThan(100) // Error responses < 100ms
      expect(result.failedRequests).toBe(result.totalRequests) // All should fail (404)

      console.log('📊 Error Handling Performance:', {
        avgResponseTime: `${result.responseTime.average.toFixed(2)}ms`,
        totalRequests: result.totalRequests,
        allFailed: result.failedRequests === result.totalRequests,
      })
    })

    it('should maintain performance during validation errors', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        platformType: 'invalid', // Invalid platform type
        capabilities: 'not-an-array', // Invalid: should be array
      }

      const result = await loadTester.runConcurrentRequests(
        '/api/cubcen/v1/agents',
        'POST',
        5,
        2000,
        invalidData
      )

      // Validation errors should be fast
      expect(result.responseTime.average).toBeLessThan(50) // Validation errors < 50ms
      expect(result.failedRequests).toBe(result.totalRequests) // All should fail validation

      console.log('📊 Validation Error Performance:', {
        avgResponseTime: `${result.responseTime.average.toFixed(2)}ms`,
        totalRequests: result.totalRequests,
      })
    })
  })

  describe('Scalability Tests', () => {
    it('should scale response times linearly with load', async () => {
      const loads = [5, 10, 20]
      const results = []

      for (const load of loads) {
        const result = await loadTester.runConcurrentRequests(
          '/api/cubcen/v1/agents',
          'GET',
          load,
          3000
        )
        results.push({ load, avgResponseTime: result.responseTime.average })

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Response time should not increase dramatically with load
      const responseTimeGrowth =
        results[2].avgResponseTime / results[0].avgResponseTime
      expect(responseTimeGrowth).toBeLessThan(3) // Should not be more than 3x slower

      console.log(
        '📊 Scalability Results:',
        results
          .map(r => `${r.load} concurrent: ${r.avgResponseTime.toFixed(2)}ms`)
          .join(', ')
      )
    })
  })
})
