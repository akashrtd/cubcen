/**
 * Dashboard Migration Utilities
 * Handles progressive rollout of new modular dashboard components
 */

import { AnalyticsData } from '@/services/analytics'

export interface MigrationConfig {
  useNewDashboard: boolean
  useNewKPICards: boolean
  useNewCharts: boolean
  useNewLayout: boolean
  rolloutPercentage: number
  userId?: string
  userGroup?: string
}

export interface FeatureFlags {
  DASHBOARD_V2: boolean
  KPI_CARDS_V2: boolean
  CHARTS_V2: boolean
  LAYOUT_V2: boolean
}

/**
 * Dashboard Migration Manager
 * Handles feature flags and progressive rollout logic
 */
export class DashboardMigration {
  private static instance: DashboardMigration
  private config: MigrationConfig

  private constructor() {
    this.config = this.loadConfig()
  }

  static getInstance(): DashboardMigration {
    if (!DashboardMigration.instance) {
      DashboardMigration.instance = new DashboardMigration()
    }
    return DashboardMigration.instance
  }

  private loadConfig(): MigrationConfig {
    return {
      useNewDashboard: process.env.NEXT_PUBLIC_USE_NEW_DASHBOARD === 'true',
      useNewKPICards: process.env.NEXT_PUBLIC_NEW_KPI_CARDS === 'true',
      useNewCharts: process.env.NEXT_PUBLIC_NEW_CHARTS === 'true',
      useNewLayout: process.env.NEXT_PUBLIC_NEW_LAYOUT === 'true',
      rolloutPercentage: parseInt(process.env.NEXT_PUBLIC_ROLLOUT_PERCENTAGE || '0', 10)
    }
  }

  /**
   * Check if user should see new dashboard components
   */
  shouldUseNewComponents(userId?: string): boolean {
    // If explicitly enabled, use new components
    if (this.config.useNewDashboard) {
      return true
    }

    // If rollout percentage is set, use deterministic hash
    if (this.config.rolloutPercentage > 0 && userId) {
      const hash = this.hashUserId(userId)
      return hash < this.config.rolloutPercentage
    }

    return false
  }

  /**
   * Get feature flags for specific user
   */
  getFeatureFlags(userId?: string): FeatureFlags {
    const useNew = this.shouldUseNewComponents(userId)
    
    return {
      DASHBOARD_V2: useNew || this.config.useNewDashboard,
      KPI_CARDS_V2: useNew || this.config.useNewKPICards,
      CHARTS_V2: useNew || this.config.useNewCharts,
      LAYOUT_V2: useNew || this.config.useNewLayout
    }
  }

  /**
   * Hash user ID to determine rollout group
   */
  private hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100
  }

  /**
   * Update migration config (for admin controls)
   */
  updateConfig(newConfig: Partial<MigrationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current migration status
   */
  getMigrationStatus(): {
    totalUsers: number
    newDashboardUsers: number
    rolloutPercentage: number
    features: Record<string, boolean>
  } {
    return {
      totalUsers: 0, // Would be populated from actual user data
      newDashboardUsers: 0, // Would be calculated based on rollout
      rolloutPercentage: this.config.rolloutPercentage,
      features: {
        dashboard: this.config.useNewDashboard,
        kpiCards: this.config.useNewKPICards,
        charts: this.config.useNewCharts,
        layout: this.config.useNewLayout
      }
    }
  }
}/*
*
 * Legacy Data Compatibility Layer
 * Ensures backward compatibility with existing data structures
 */
export class LegacyDataAdapter {
  /**
   * Convert legacy KPI data to new MetricCard format
   */
  static adaptKPIData(legacyData: any): any {
    if (!legacyData || typeof legacyData !== 'object') {
      return null
    }

    // Handle legacy KPI card data structure
    return {
      title: legacyData.title || 'Unknown Metric',
      metrics: [{
        label: legacyData.description || '',
        value: legacyData.value || 0,
        unit: legacyData.unit || '',
        trend: legacyData.trend || 'neutral',
        color: legacyData.color || 'text-primary'
      }],
      icon: legacyData.icon,
      loading: legacyData.loading || false
    }
  }

  /**
   * Convert legacy chart data to new ChartCard format
   */
  static adaptChartData(legacyChartData: any, chartType: string): any {
    if (!legacyChartData || !Array.isArray(legacyChartData)) {
      return {
        datasets: [],
        labels: [],
        metadata: { chartType, legacy: true }
      }
    }

    // Handle Recharts legacy format
    const firstItem = legacyChartData[0]
    if (!firstItem) {
      return {
        datasets: [],
        labels: [],
        metadata: { chartType, legacy: true }
      }
    }

    const dataKeys = Object.keys(firstItem).filter(key => 
      typeof firstItem[key] === 'number' && key !== 'index'
    )

    return {
      datasets: dataKeys.map(key => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        data: legacyChartData.map((item: any, index: number) => ({
          x: item.name || item.label || item.date || index.toString(),
          y: item[key] || 0,
          label: item.name || item.label || item.date || index.toString(),
          metadata: { originalData: item, key }
        }))
      })),
      labels: legacyChartData.map((item: any) => 
        item.name || item.label || item.date || ''
      ),
      metadata: { chartType, legacy: true, originalKeys: dataKeys }
    }
  }

  /**
   * Validate data compatibility
   */
  static validateDataCompatibility(data: any, expectedFormat: string): boolean {
    switch (expectedFormat) {
      case 'analytics':
        return data && typeof data === 'object' && 
               typeof data.totalAgents === 'number' &&
               typeof data.activeAgents === 'number'
      
      case 'chart':
        return Array.isArray(data) && data.length > 0
      
      case 'kpi':
        return data && (typeof data.value !== 'undefined')
      
      default:
        return true
    }
  }
}

/**
 * Migration Rollback Utilities
 * Handles rollback scenarios if new components fail
 */
export class MigrationRollback {
  private static failureCount = new Map<string, number>()
  private static readonly MAX_FAILURES = 3

  /**
   * Record a component failure
   */
  static recordFailure(componentName: string, userId?: string): void {
    const key = `${componentName}-${userId || 'global'}`
    const count = this.failureCount.get(key) || 0
    this.failureCount.set(key, count + 1)

    // Auto-rollback if too many failures
    if (count >= this.MAX_FAILURES) {
      this.triggerRollback(componentName, userId)
    }
  }

  /**
   * Check if component should be rolled back
   */
  static shouldRollback(componentName: string, userId?: string): boolean {
    const key = `${componentName}-${userId || 'global'}`
    return (this.failureCount.get(key) || 0) >= this.MAX_FAILURES
  }

  /**
   * Trigger rollback for a component
   */
  private static triggerRollback(componentName: string, userId?: string): void {
    console.warn(`Rolling back ${componentName} due to repeated failures`, { userId })
    
    // In a real implementation, this would:
    // 1. Update feature flags to disable the component
    // 2. Log the rollback event
    // 3. Notify administrators
    // 4. Potentially trigger alerts
  }

  /**
   * Clear failure count (for recovery)
   */
  static clearFailures(componentName: string, userId?: string): void {
    const key = `${componentName}-${userId || 'global'}`
    this.failureCount.delete(key)
  }
}

/**
 * Migration Analytics
 * Track adoption and performance of new components
 */
export class MigrationAnalytics {
  /**
   * Track component usage
   */
  static trackComponentUsage(componentName: string, version: 'legacy' | 'new', userId?: string): void {
    // In a real implementation, this would send analytics data
    console.log('Component usage tracked', {
      component: componentName,
      version,
      userId,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Track migration performance
   */
  static trackPerformance(componentName: string, loadTime: number, userId?: string): void {
    // Track performance metrics for comparison
    console.log('Performance tracked', {
      component: componentName,
      loadTime,
      userId,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Track errors
   */
  static trackError(componentName: string, error: Error, userId?: string): void {
    console.error('Component error tracked', {
      component: componentName,
      error: error.message,
      stack: error.stack,
      userId,
      timestamp: new Date().toISOString()
    })

    // Record failure for potential rollback
    MigrationRollback.recordFailure(componentName, userId)
  }
}