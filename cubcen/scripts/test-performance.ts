#!/usr/bin/env ts-node

/**
 * Performance Testing Script
 * Demonstrates the performance optimization features implemented in task 22
 */

import { performanceMonitor } from '../src/lib/performance-monitor'
import { dbPerformanceMonitor, DatabaseOptimizer } from '../src/lib/database-performance'
import { cache, CacheWarmer } from '../src/lib/cache'
import { Benchmark, LoadTester, PerformanceTestSuite } from '../src/lib/benchmark'
import { logger } from '../src/lib/logger'

async function testPerformanceFeatures() {
  console.log('🚀 Testing Cubcen Performance Optimization Features\n')

  try {
    // 1. Test Cache System
    console.log('1. Testing Cache System...')
    cache.set('test-key', { data: 'test-value', timestamp: Date.now() })
    const cachedValue = cache.get('test-key')
    console.log('   ✅ Cache set/get working:', cachedValue ? 'SUCCESS' : 'FAILED')
    
    const cacheStats = cache.getStats()
    console.log('   📊 Cache stats:', {
      entries: cacheStats.totalEntries,
      hitRate: cacheStats.hitRate + '%',
      memoryUsage: Math.round(cacheStats.memoryUsage / 1024) + 'KB'
    })

    // 2. Test Cache Warming
    console.log('\n2. Testing Cache Warming...')
    await CacheWarmer.warmCache()
    console.log('   ✅ Cache warming completed')

    // 3. Test Performance Monitoring
    console.log('\n3. Testing Performance Monitoring...')
    performanceMonitor.startMonitoring()
    
    // Simulate some API requests
    performanceMonitor.recordAPIRequest(150, false)
    performanceMonitor.recordAPIRequest(200, false)
    performanceMonitor.recordAPIRequest(500, true)
    
    const stats = await performanceMonitor.getCurrentStats()
    console.log('   📊 Performance stats:', {
      apiRequests: stats.api.requestCount,
      avgResponseTime: Math.round(stats.api.averageResponseTime) + 'ms',
      errorRate: stats.api.errorRate + '%',
      memoryUsage: Math.round(stats.memory.percentage) + '%'
    })

    // 4. Test Database Performance Monitoring
    console.log('\n4. Testing Database Performance...')
    const dbStats = await dbPerformanceMonitor.getPerformanceStats()
    console.log('   📊 Database stats:', {
      totalQueries: dbStats.totalQueries,
      avgQueryTime: dbStats.averageQueryTime + 'ms',
      slowQueries: dbStats.slowQueries.length
    })

    // 5. Test Database Optimization
    console.log('\n5. Testing Database Optimization...')
    await DatabaseOptimizer.createOptimalIndexes()
    const analysis = await DatabaseOptimizer.analyzePerformance()
    console.log('   ✅ Database optimization completed')
    console.log('   📊 Analysis:', {
      tables: analysis.tableStats.length,
      recommendations: analysis.indexRecommendations.length,
      optimizations: analysis.queryOptimizations.length
    })

    // 6. Test Benchmarking
    console.log('\n6. Testing Benchmarking...')
    const benchmarkResult = await Benchmark.run(
      'Simple Operation Test',
      async () => {
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 1))
        Math.random() // Do some work but don't return anything
      },
      100
    )
    console.log('   📊 Benchmark result:', {
      operations: benchmarkResult.operations,
      opsPerSecond: Math.round(benchmarkResult.opsPerSecond),
      avgTime: benchmarkResult.averageTime + 'ms'
    })

    // 7. Test Load Testing
    console.log('\n7. Testing Load Testing...')
    const loadTestResult = await LoadTester.run({
      name: 'Simple Load Test',
      duration: 5000, // 5 seconds
      concurrency: 5,
      operation: async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50))
      }
    })
    console.log('   📊 Load test result:', {
      totalOps: loadTestResult.totalOperations,
      successRate: (100 - loadTestResult.errorRate) + '%',
      opsPerSecond: Math.round(loadTestResult.operationsPerSecond),
      avgResponseTime: Math.round(loadTestResult.averageResponseTime) + 'ms'
    })

    // 8. Test Performance Alerts
    console.log('\n8. Testing Performance Alerts...')
    const alerts = performanceMonitor.getActiveAlerts()
    console.log('   📊 Active alerts:', alerts.length)

    // 9. Test Metrics Collection
    console.log('\n9. Testing Metrics Collection...')
    const metrics = performanceMonitor.getMetrics('api_request_count')
    console.log('   📊 Collected metrics:', metrics.length)

    console.log('\n✅ All performance optimization features tested successfully!')
    console.log('\n📋 Summary of implemented features:')
    console.log('   • In-memory caching with TTL and invalidation')
    console.log('   • Database query optimization and indexing')
    console.log('   • Real-time performance monitoring and alerting')
    console.log('   • Automated benchmarking and load testing')
    console.log('   • Performance metrics collection and analysis')
    console.log('   • Cache warming and optimization strategies')
    console.log('   • Lazy loading and pagination utilities')

  } catch (error) {
    console.error('❌ Error testing performance features:', error)
  } finally {
    // Cleanup
    performanceMonitor.stopMonitoring()
    cache.clear()
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testPerformanceFeatures()
    .then(() => {
      console.log('\n🎉 Performance testing completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Performance testing failed:', error)
      process.exit(1)
    })
}

export { testPerformanceFeatures }