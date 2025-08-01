/**
 * Cubcen Database Integration Tests
 * Tests actual database operations with SQLite
 */

import { checkDatabaseHealth } from '../database'

describe('Database Integration Tests', () => {
  describe('Database Health Check', () => {
    it('should return healthy status for working database', async () => {
      const health = await checkDatabaseHealth()

      expect(health.status).toBe('healthy')
      expect(health.details.connected).toBe(true)
      expect(typeof health.details.userCount).toBe('number')
      expect(typeof health.details.agentCount).toBe('number')
      expect(typeof health.details.taskCount).toBe('number')
      expect(typeof health.details.platformCount).toBe('number')
      expect(health.details.lastChecked).toBeDefined()
    })
  })

  describe('Database Schema Validation', () => {
    it('should validate database schema integrity', async () => {
      const { validateDatabaseSchema } = await import('../database-utils')
      const result = await validateDatabaseSchema()

      if (!result.isValid) {
        console.log('Validation errors:', result.errors)
      }

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Database Statistics', () => {
    it('should get database statistics', async () => {
      const { getDatabaseStats } = await import('../database-utils')
      const stats = await getDatabaseStats()

      expect(typeof stats.users).toBe('number')
      expect(typeof stats.platforms).toBe('number')
      expect(typeof stats.agents).toBe('number')
      expect(typeof stats.tasks).toBe('number')
      expect(typeof stats.workflows).toBe('number')
      expect(typeof stats.systemLogs).toBe('number')
    })
  })
})
