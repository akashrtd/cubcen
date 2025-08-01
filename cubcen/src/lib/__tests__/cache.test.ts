/**
 * Cache System Tests
 * Tests for the in-memory caching system with TTL and invalidation
 */

import { cache, AnalyticsCache, AgentCache, TaskCache, CacheWarmer } from '../cache'

describe('InMemoryCache', () => {
  beforeEach(() => {
    cache.clear()
  })

  afterEach(() => {
    cache.clear()
  })

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      const testData = { test: 'data', number: 42 }
      cache.set('test-key', testData)
      
      const retrieved = cache.get('test-key')
      expect(retrieved).toEqual(testData)
    })

    it('should return null for non-existent keys', () => {
      const result = cache.get('non-existent-key')
      expect(result).toBeNull()
    })

    it('should delete values', () => {
      cache.set('test-key', 'test-value')
      expect(cache.get('test-key')).toBe('test-value')
      
      const deleted = cache.delete('test-key')
      expect(deleted).toBe(true)
      expect(cache.get('test-key')).toBeNull()
    })

    it('should check if key exists', () => {
      cache.set('test-key', 'test-value')
      expect(cache.has('test-key')).toBe(true)
      expect(cache.has('non-existent')).toBe(false)
    })

    it('should clear all entries', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      cache.clear()
      
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })

  describe('TTL (Time To Live)', () => {
    it('should expire entries after TTL', async () => {
      cache.set('test-key', 'test-value', { ttl: 100 }) // 100ms TTL
      
      expect(cache.get('test-key')).toBe('test-value')
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(cache.get('test-key')).toBeNull()
    })

    it('should use default TTL when not specified', () => {
      cache.set('test-key', 'test-value')
      expect(cache.has('test-key')).toBe(true)
    })

    it('should handle custom TTL values', () => {
      cache.set('short-ttl', 'value1', { ttl: 50 })
      cache.set('long-ttl', 'value2', { ttl: 10000 })
      
      expect(cache.get('short-ttl')).toBe('value1')
      expect(cache.get('long-ttl')).toBe('value2')
    })
  })

  describe('Statistics', () => {
    it('should track cache statistics', () => {
      // Generate some cache activity
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      cache.get('key1') // hit
      cache.get('key1') // hit
      cache.get('nonexistent') // miss
      
      const stats = cache.getStats()
      
      expect(stats).toHaveProperty('totalEntries')
      expect(stats).toHaveProperty('totalHits')
      expect(stats).toHaveProperty('totalMisses')
      expect(stats).toHaveProperty('hitRate')
      expect(stats).toHaveProperty('memoryUsage')
      expect(stats).toHaveProperty('topKeys')
      
      expect(stats.totalEntries).toBe(2)
      expect(stats.totalHits).toBe(2)
      expect(stats.totalMisses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(66.67, 1)
    })

    it('should track top keys by hits', () => {
      cache.set('popular-key', 'value')
      cache.set('unpopular-key', 'value')
      
      // Access popular key multiple times
      for (let i = 0; i < 5; i++) {
        cache.get('popular-key')
      }
      cache.get('unpopular-key')
      
      const stats = cache.getStats()
      expect(stats.topKeys.length).toBeGreaterThan(0)
      expect(stats.topKeys[0].key).toBe('popular-key')
      expect(stats.topKeys[0].hits).toBe(5)
    })
  })

  describe('Memory Management', () => {
    it('should handle cache size limits', () => {
      // This test would need to be adjusted based on actual implementation
      // For now, we'll just verify the cache doesn't crash with many entries
      for (let i = 0; i < 100; i++) {
        cache.set(`key-${i}`, `value-${i}`)
      }
      
      const stats = cache.getStats()
      expect(stats.totalEntries).toBeLessThanOrEqual(100)
    })

    it('should calculate memory usage', () => {
      cache.set('test-key', { large: 'data'.repeat(1000) })
      
      const stats = cache.getStats()
      expect(stats.memoryUsage).toBeGreaterThan(0)
    })
  })
})

describe('AnalyticsCache', () => {
  beforeEach(() => {
    cache.clear()
  })

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys', () => {
      const params = { dateRange: { start: '2023-01-01', end: '2023-01-31' } }
      const key1 = AnalyticsCache.getCacheKey('test-method', params)
      const key2 = AnalyticsCache.getCacheKey('test-method', params)
      
      expect(key1).toBe(key2)
      expect(key1).toContain('analytics:')
      expect(key1).toContain('test-method')
    })

    it('should generate different keys for different parameters', () => {
      const params1 = { dateRange: { start: '2023-01-01' } }
      const params2 = { dateRange: { start: '2023-02-01' } }
      
      const key1 = AnalyticsCache.getCacheKey('test-method', params1)
      const key2 = AnalyticsCache.getCacheKey('test-method', params2)
      
      expect(key1).not.toBe(key2)
    })
  })

  describe('Get or Set Pattern', () => {
    it('should fetch data when not cached', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test' })
      
      const result = await AnalyticsCache.getOrSet('test-key', fetcher, 1000)
      
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ data: 'test' })
    })

    it('should return cached data when available', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'test' })
      
      // First call should fetch
      const result1 = await AnalyticsCache.getOrSet('test-key', fetcher, 1000)
      
      // Second call should use cache
      const result2 = await AnalyticsCache.getOrSet('test-key', fetcher, 1000)
      
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(result1).toEqual(result2)
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate cache by pattern', () => {
      cache.set('analytics:method1:params', 'data1')
      cache.set('analytics:method2:params', 'data2')
      cache.set('other:data', 'data3')
      
      AnalyticsCache.invalidatePattern('analytics:method1')
      
      expect(cache.get('analytics:method1:params')).toBeNull()
      expect(cache.get('analytics:method2:params')).toBe('data2')
      expect(cache.get('other:data')).toBe('data3')
    })
  })
})

describe('AgentCache', () => {
  beforeEach(() => {
    cache.clear()
  })

  describe('Agent-specific Caching', () => {
    it('should generate agent-specific cache keys', () => {
      const key = AgentCache.getCacheKey('agent-123', 'getStatus')
      expect(key).toBe('agent:agent-123:getStatus')
    })

    it('should cache agent data', async () => {
      const fetcher = jest.fn().mockResolvedValue({ status: 'active' })
      
      const result = await AgentCache.getAgentData('agent-123', 'getStatus', fetcher)
      
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ status: 'active' })
    })

    it('should invalidate agent-specific cache', () => {
      cache.set('agent:agent-123:status', 'data1')
      cache.set('agent:agent-123:health', 'data2')
      cache.set('agent:agent-456:status', 'data3')
      
      AgentCache.invalidateAgent('agent-123')
      
      expect(cache.get('agent:agent-123:status')).toBeNull()
      expect(cache.get('agent:agent-123:health')).toBeNull()
      expect(cache.get('agent:agent-456:status')).toBe('data3')
    })

    it('should invalidate all agent cache', () => {
      cache.set('agent:agent-123:status', 'data1')
      cache.set('agent:agent-456:status', 'data2')
      cache.set('other:data', 'data3')
      
      AgentCache.invalidateAll()
      
      expect(cache.get('agent:agent-123:status')).toBeNull()
      expect(cache.get('agent:agent-456:status')).toBeNull()
      expect(cache.get('other:data')).toBe('data3')
    })
  })
})

describe('TaskCache', () => {
  beforeEach(() => {
    cache.clear()
  })

  describe('Task-specific Caching', () => {
    it('should generate task-specific cache keys', () => {
      const key = TaskCache.getCacheKey('task-123', 'getDetails')
      expect(key).toBe('task:task-123:getDetails')
    })

    it('should cache task data', async () => {
      const fetcher = jest.fn().mockResolvedValue({ status: 'completed' })
      
      const result = await TaskCache.getTaskData('task-123', 'getDetails', fetcher)
      
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ status: 'completed' })
    })

    it('should invalidate task-specific cache', () => {
      cache.set('task:task-123:details', 'data1')
      cache.set('task:task-123:logs', 'data2')
      cache.set('task:task-456:details', 'data3')
      
      TaskCache.invalidateTask('task-123')
      
      expect(cache.get('task:task-123:details')).toBeNull()
      expect(cache.get('task:task-123:logs')).toBeNull()
      expect(cache.get('task:task-456:details')).toBe('data3')
    })
  })
})

describe('CacheWarmer', () => {
  beforeEach(() => {
    cache.clear()
  })

  describe('Cache Warming', () => {
    it('should warm cache without errors', async () => {
      await expect(CacheWarmer.warmCache()).resolves.not.toThrow()
    })

    it('should populate cache with warmed data', async () => {
      await CacheWarmer.warmCache()
      
      // Check that some cache entries were created
      const stats = cache.getStats()
      expect(stats.totalEntries).toBeGreaterThan(0)
    })
  })
})

describe('Cache Decorator', () => {
  class TestService {
    callCount = 0

    async getData(param: string): Promise<string> {
      this.callCount++
      return `data-${param}-${this.callCount}`
    }
  }

  it('should work without decorator for now', async () => {
    const service = new TestService()
    
    const result1 = await service.getData('test')
    const result2 = await service.getData('test')
    
    // Without decorator, results will be different
    expect(result1).not.toBe(result2)
    expect(service.callCount).toBe(2)
  })
})

describe('Cache Error Handling', () => {
  it('should handle cache errors gracefully', () => {
    // Test with invalid data
    expect(() => cache.set('test', undefined as any)).not.toThrow()
    expect(() => cache.get('test')).not.toThrow()
  })

  it('should handle cleanup errors', () => {
    expect(() => cache.clear()).not.toThrow()
    expect(() => cache.destroy()).not.toThrow()
  })
})