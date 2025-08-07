/**
 * Tests for dashboard migration utilities
 */

import {
  DashboardMigration,
  LegacyDataAdapter,
  MigrationRollback,
  MigrationAnalytics,
} from '../dashboard-migration'

// Mock environment variables
const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }

  // Clear any existing instances
  ;(DashboardMigration as any).instance = null
})

afterEach(() => {
  process.env = originalEnv
})

describe('DashboardMigration', () => {
  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = DashboardMigration.getInstance()
      const instance2 = DashboardMigration.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('shouldUseNewComponents', () => {
    it('should return true when explicitly enabled', () => {
      process.env.NEXT_PUBLIC_USE_NEW_DASHBOARD = 'true'
      const migration = DashboardMigration.getInstance()
      expect(migration.shouldUseNewComponents()).toBe(true)
    })

    it('should return false when disabled', () => {
      process.env.NEXT_PUBLIC_USE_NEW_DASHBOARD = 'false'
      const migration = DashboardMigration.getInstance()
      expect(migration.shouldUseNewComponents()).toBe(false)
    })

    it('should use rollout percentage for user-based rollout', () => {
      process.env.NEXT_PUBLIC_USE_NEW_DASHBOARD = 'false'
      process.env.NEXT_PUBLIC_ROLLOUT_PERCENTAGE = '50'
      const migration = DashboardMigration.getInstance()

      // Test with consistent user ID
      const result1 = migration.shouldUseNewComponents('user123')
      const result2 = migration.shouldUseNewComponents('user123')
      expect(result1).toBe(result2) // Should be consistent
    })
  })

  describe('getFeatureFlags', () => {
    it('should return correct feature flags', () => {
      process.env.NEXT_PUBLIC_USE_NEW_DASHBOARD = 'true'
      process.env.NEXT_PUBLIC_NEW_KPI_CARDS = 'true'
      const migration = DashboardMigration.getInstance()

      const flags = migration.getFeatureFlags()
      expect(flags.DASHBOARD_V2).toBe(true)
      expect(flags.KPI_CARDS_V2).toBe(true)
    })
  })
})

describe('LegacyDataAdapter', () => {
  describe('adaptKPIData', () => {
    it('should adapt legacy KPI data format', () => {
      const legacyData = {
        title: 'Test Metric',
        value: 100,
        unit: 'items',
        description: 'Test description',
        color: 'text-blue-600',
      }

      const adapted = LegacyDataAdapter.adaptKPIData(legacyData)
      expect(adapted.title).toBe('Test Metric')
      expect(adapted.metrics[0].value).toBe(100)
      expect(adapted.metrics[0].unit).toBe('items')
    })

    it('should handle null/undefined data', () => {
      expect(LegacyDataAdapter.adaptKPIData(null)).toBeNull()
      expect(LegacyDataAdapter.adaptKPIData(undefined)).toBeNull()
    })
  })

  describe('adaptChartData', () => {
    it('should adapt legacy chart data', () => {
      const legacyData = [
        { name: 'Jan', value: 100, count: 50 },
        { name: 'Feb', value: 200, count: 75 },
      ]

      const adapted = LegacyDataAdapter.adaptChartData(legacyData, 'bar')
      expect(adapted.datasets).toHaveLength(2) // value and count
      expect(adapted.labels).toEqual(['Jan', 'Feb'])
      expect(adapted.metadata.chartType).toBe('bar')
    })

    it('should handle empty data', () => {
      const adapted = LegacyDataAdapter.adaptChartData([], 'line')
      expect(adapted.datasets).toEqual([])
      expect(adapted.labels).toEqual([])
    })
  })

  describe('validateDataCompatibility', () => {
    it('should validate analytics data format', () => {
      const validData = { totalAgents: 5, activeAgents: 3 }
      const invalidData: { [key: string]: any } = { foo: 'bar' }

      expect(
        LegacyDataAdapter.validateDataCompatibility(validData, 'analytics')
      ).toBe(true)
      expect(
        LegacyDataAdapter.validateDataCompatibility(invalidData, 'analytics')
      ).toBe(false)
    })

    it('should validate chart data format', () => {
      const validData = [{ name: 'test', value: 1 }]
      const invalidData = []

      expect(
        LegacyDataAdapter.validateDataCompatibility(validData, 'chart')
      ).toBe(true)
      expect(
        LegacyDataAdapter.validateDataCompatibility(invalidData, 'chart')
      ).toBe(false)
    })
  })
})

describe('MigrationRollback', () => {
  beforeEach(() => {
    // Clear failure counts
    ;(MigrationRollback as any).failureCount.clear()
  })

  describe('recordFailure', () => {
    it('should record component failures', () => {
      MigrationRollback.recordFailure('TestComponent', 'user123')
      expect(MigrationRollback.shouldRollback('TestComponent', 'user123')).toBe(
        false
      )

      // Record more failures
      MigrationRollback.recordFailure('TestComponent', 'user123')
      MigrationRollback.recordFailure('TestComponent', 'user123')

      expect(MigrationRollback.shouldRollback('TestComponent', 'user123')).toBe(
        true
      )
    })
  })

  describe('clearFailures', () => {
    it('should clear failure count', () => {
      MigrationRollback.recordFailure('TestComponent', 'user123')
      MigrationRollback.recordFailure('TestComponent', 'user123')
      MigrationRollback.recordFailure('TestComponent', 'user123')

      expect(MigrationRollback.shouldRollback('TestComponent', 'user123')).toBe(
        true
      )

      MigrationRollback.clearFailures('TestComponent', 'user123')
      expect(MigrationRollback.shouldRollback('TestComponent', 'user123')).toBe(
        false
      )
    })
  })
})

describe('MigrationAnalytics', () => {
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('trackComponentUsage', () => {
    it('should track component usage', () => {
      MigrationAnalytics.trackComponentUsage('TestComponent', 'new', 'user123')

      expect(consoleSpy).toHaveBeenCalledWith('Component usage tracked', {
        component: 'TestComponent',
        version: 'new',
        userId: 'user123',
        timestamp: expect.any(String),
      })
    })
  })

  describe('trackError', () => {
    it('should track errors and record failures', () => {
      const error = new Error('Test error')
      const errorSpy = jest.spyOn(console, 'error').mockImplementation()

      MigrationAnalytics.trackError('TestComponent', error, 'user123')

      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
    })
  })
})
