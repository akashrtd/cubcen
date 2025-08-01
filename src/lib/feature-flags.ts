import config, { FeatureFlags } from './config'

/**
 * Feature flag service for managing gradual feature rollout
 * Provides runtime feature flag checking and management
 */
export class FeatureFlagService {
  private static instance: FeatureFlagService
  private flags: FeatureFlags
  private overrides: Partial<FeatureFlags> = {}

  private constructor() {
    this.flags = config.getFeatureFlags()
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService()
    }
    return FeatureFlagService.instance
  }

  /**
   * Check if a feature is enabled
   */
  public isEnabled(feature: keyof FeatureFlags): boolean {
    // Check for runtime overrides first
    if (this.overrides[feature] !== undefined) {
      return this.overrides[feature]!
    }

    return this.flags[feature]
  }

  /**
   * Get all feature flags
   */
  public getAllFlags(): FeatureFlags {
    return { ...this.flags, ...this.overrides }
  }

  /**
   * Set runtime override for a feature flag (useful for testing)
   */
  public setOverride(feature: keyof FeatureFlags, enabled: boolean): void {
    this.overrides[feature] = enabled
  }

  /**
   * Clear runtime override for a feature flag
   */
  public clearOverride(feature: keyof FeatureFlags): void {
    delete this.overrides[feature]
  }

  /**
   * Clear all runtime overrides
   */
  public clearAllOverrides(): void {
    this.overrides = {}
  }

  /**
   * Reload feature flags from configuration
   */
  public reload(): void {
    this.flags = config.getFeatureFlags()
  }

  /**
   * Get feature flag status summary
   */
  public getStatusSummary(): Record<
    string,
    { enabled: boolean; source: 'config' | 'override' }
  > {
    const summary: Record<
      string,
      { enabled: boolean; source: 'config' | 'override' }
    > = {}

    const allFlags = this.getAllFlags()

    for (const [key, value] of Object.entries(allFlags)) {
      summary[key] = {
        enabled: value,
        source:
          this.overrides[key as keyof FeatureFlags] !== undefined
            ? 'override'
            : 'config',
      }
    }

    return summary
  }
}

// Feature flag decorators and utilities
export function requireFeature(feature: keyof FeatureFlags) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: unknown[]) {
      if (!featureFlags.isEnabled(feature)) {
        throw new Error(`Feature '${feature}' is not enabled`)
      }
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

/**
 * Express middleware to check feature flags
 */
export function requireFeatureMiddleware(feature: keyof FeatureFlags) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!featureFlags.isEnabled(feature)) {
      return res.status(404).json({
        error: {
          code: 'FEATURE_DISABLED',
          message: `Feature '${feature}' is not available`,
          timestamp: new Date().toISOString(),
        },
      })
    }
    next()
  }
}

/**
 * React hook for feature flags (for frontend usage)
 */
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  // This would be implemented in the frontend with proper React hooks
  // For now, return the server-side flag status
  return featureFlags.isEnabled(feature)
}

/**
 * Feature flag configuration for different environments
 */
export const FEATURE_ROLLOUT_STAGES = {
  DISABLED: {
    enableAnalytics: false,
    enableKanbanBoard: false,
    enableWorkflowOrchestration: false,
    enableAdvancedAuth: false,
    enableNotifications: false,
  },
  BASIC: {
    enableAnalytics: true,
    enableKanbanBoard: false,
    enableWorkflowOrchestration: false,
    enableAdvancedAuth: false,
    enableNotifications: true,
  },
  INTERMEDIATE: {
    enableAnalytics: true,
    enableKanbanBoard: true,
    enableWorkflowOrchestration: false,
    enableAdvancedAuth: false,
    enableNotifications: true,
  },
  ADVANCED: {
    enableAnalytics: true,
    enableKanbanBoard: true,
    enableWorkflowOrchestration: true,
    enableAdvancedAuth: false,
    enableNotifications: true,
  },
  FULL: {
    enableAnalytics: true,
    enableKanbanBoard: true,
    enableWorkflowOrchestration: true,
    enableAdvancedAuth: true,
    enableNotifications: true,
  },
} as const

/**
 * Apply a rollout stage configuration
 */
export function applyRolloutStage(
  stage: keyof typeof FEATURE_ROLLOUT_STAGES
): void {
  const stageConfig = FEATURE_ROLLOUT_STAGES[stage]

  for (const [feature, enabled] of Object.entries(stageConfig)) {
    featureFlags.setOverride(feature as keyof FeatureFlags, enabled)
  }
}

// Export singleton instance
export const featureFlags = FeatureFlagService.getInstance()
export default featureFlags
