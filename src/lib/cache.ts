/**
 * Cubcen Response Caching System
 * Provides in-memory caching for frequently accessed data with TTL and invalidation
 */

import { logger } from './logger'

export interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

export interface CacheStats {
  totalEntries: number
  totalHits: number
  totalMisses: number
  hitRate: number
  memoryUsage: number
  topKeys: Array<{ key: string; hits: number }>
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  onEvict?: (key: string, entry: CacheEntry) => void
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry>()
  private stats = {
    hits: 0,
    misses: 0,
  }
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes
  private readonly maxSize = 1000
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    entry.hits++
    this.stats.hits++
    return entry.data as T
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL
    const maxSize = options.maxSize || this.maxSize

    // Evict oldest entries if cache is full
    if (this.cache.size >= maxSize) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    }

    this.cache.set(key, entry)
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.stats.hits = 0
    this.stats.misses = 0
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate =
      totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0

    // Calculate memory usage (approximate)
    const memoryUsage = JSON.stringify(Array.from(this.cache.entries())).length

    // Get top keys by hits
    const topKeys = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, hits: entry.hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10)

    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage,
      topKeys,
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      logger.debug('Cache cleanup completed', {
        cleanedCount,
        remainingEntries: this.cache.size,
      })
    }
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

    // Remove oldest 10% of entries
    const toRemove = Math.max(1, Math.floor(entries.length * 0.1))
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0])
    }
  }

  /**
   * Destroy cache and cleanup intervals
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }
}

// Cache decorator for methods
export function cached(ttl = 5 * 60 * 1000) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`

      // Try to get from cache first
      const cached = cache.get<T>(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Execute method and cache result
      const result = await method.apply(this, args)
      cache.set(cacheKey, result, { ttl })

      return result
    }
  }
}

// Specific cache implementations for different data types
export class AnalyticsCache {
  private static readonly CACHE_PREFIX = 'analytics:'

  static getCacheKey(method: string, params: Record<string, unknown>): string {
    return `${this.CACHE_PREFIX}${method}:${JSON.stringify(params)}`
  }

  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 10 * 60 * 1000 // 10 minutes for analytics
  ): Promise<T> {
    const cached = cache.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    cache.set(key, data, { ttl })
    return data
  }

  static invalidatePattern(pattern: string): void {
    const keys = Array.from((cache as any).cache.keys())
    const matchingKeys = keys.filter(key => key.includes(pattern))

    matchingKeys.forEach(key => cache.delete(key))
    logger.debug('Cache invalidation completed', {
      pattern,
      invalidatedKeys: matchingKeys.length,
    })
  }
}

export class AgentCache {
  private static readonly CACHE_PREFIX = 'agent:'
  private static readonly TTL = 2 * 60 * 1000 // 2 minutes for agent data

  static getCacheKey(agentId: string, method: string): string {
    return `${this.CACHE_PREFIX}${agentId}:${method}`
  }

  static async getAgentData<T>(
    agentId: string,
    method: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const key = this.getCacheKey(agentId, method)
    return AnalyticsCache.getOrSet(key, fetcher, this.TTL)
  }

  static invalidateAgent(agentId: string): void {
    AnalyticsCache.invalidatePattern(`${this.CACHE_PREFIX}${agentId}`)
  }

  static invalidateAll(): void {
    AnalyticsCache.invalidatePattern(this.CACHE_PREFIX)
  }
}

export class TaskCache {
  private static readonly CACHE_PREFIX = 'task:'
  private static readonly TTL = 1 * 60 * 1000 // 1 minute for task data

  static getCacheKey(taskId: string, method: string): string {
    return `${this.CACHE_PREFIX}${taskId}:${method}`
  }

  static async getTaskData<T>(
    taskId: string,
    method: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const key = this.getCacheKey(taskId, method)
    return AnalyticsCache.getOrSet(key, fetcher, this.TTL)
  }

  static invalidateTask(taskId: string): void {
    AnalyticsCache.invalidatePattern(`${this.CACHE_PREFIX}${taskId}`)
  }

  static invalidateAll(): void {
    AnalyticsCache.invalidatePattern(this.CACHE_PREFIX)
  }
}

// Cache warming utilities
export class CacheWarmer {
  /**
   * Warm up frequently accessed data
   */
  static async warmCache(): Promise<void> {
    logger.info('Starting cache warm-up process')

    try {
      // Warm up analytics data
      await this.warmAnalyticsCache()

      // Warm up agent data
      await this.warmAgentCache()

      // Warm up system health data
      await this.warmHealthCache()

      logger.info('Cache warm-up completed successfully')
    } catch (error) {
      logger.error('Cache warm-up failed', error instanceof Error ? error : undefined)
    }
  }

  private static async warmAnalyticsCache(): Promise<void> {
    // Pre-load common analytics queries
    const commonQueries = [
      'dashboard-stats',
      'agent-performance',
      'task-trends',
      'error-patterns',
    ]

    for (const query of commonQueries) {
      try {
        // This would call actual analytics methods
        // For now, we'll just set placeholder data
        cache.set(`analytics:${query}`, { warmed: true, timestamp: Date.now() })
      } catch (error) {
        logger.warn('Failed to warm analytics cache', { query, error })
      }
    }
  }

  private static async warmAgentCache(): Promise<void> {
    // Pre-load active agent data
    try {
      // This would fetch actual agent data
      cache.set('agent:active-list', { warmed: true, timestamp: Date.now() })
      cache.set('agent:health-summary', { warmed: true, timestamp: Date.now() })
    } catch (error) {
      logger.warn('Failed to warm agent cache', error)
    }
  }

  private static async warmHealthCache(): Promise<void> {
    // Pre-load system health data
    try {
      cache.set('health:system-status', { warmed: true, timestamp: Date.now() })
      cache.set('health:performance-metrics', {
        warmed: true,
        timestamp: Date.now(),
      })
    } catch (error) {
      logger.warn('Failed to warm health cache', error)
    }
  }
}

// Export singleton cache instance
export const cache = new InMemoryCache()

// Graceful shutdown
process.on('SIGTERM', () => {
  cache.destroy()
})

process.on('SIGINT', () => {
  cache.destroy()
})
