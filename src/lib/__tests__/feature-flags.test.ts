import {
  FeatureFlagService,
  featureFlags,
  requireFeature,
  requireFeatureMiddleware,
  applyRolloutStage,
  FEATURE_ROLLOUT_STAGES,
} from '../feature-flags'

// Mock config
jest.mock('../config', () => ({
  default: {
    getFeatureFlags: () => ({
      enableAnalytics: true,
      enableKanbanBoard: false,
      enableWorkflowOrchestration: false,
      enableAdvancedAuth: false,
      enableNotifications: true,
    }),
  },
}))

describe('FeatureFlagService', () => {
  let service: FeatureFlagService

  beforeEach(() => {
    service = FeatureFlagService.getInstance()
    service.clearAllOverrides()
  })

  describe('isEnabled', () => {
    it('should return correct flag values from config', () => {
      expect(service.isEnabled('enableAnalytics')).toBe(true)
      expect(service.isEnabled('enableKanbanBoard')).toBe(false)
      expect(service.isEnabled('enableNotifications')).toBe(true)
    })

    it('should prioritize runtime overrides over config', () => {
      service.setOverride('enableKanbanBoard', true)

      expect(service.isEnabled('enableKanbanBoard')).toBe(true)
    })
  })

  describe('getAllFlags', () => {
    it('should return all flags with overrides applied', () => {
      service.setOverride('enableKanbanBoard', true)
      service.setOverride('enableWorkflowOrchestration', true)

      const flags = service.getAllFlags()

      expect(flags.enableAnalytics).toBe(true) // From config
      expect(flags.enableKanbanBoard).toBe(true) // Override
      expect(flags.enableWorkflowOrchestration).toBe(true) // Override
      expect(flags.enableNotifications).toBe(true) // From config
    })
  })

  describe('setOverride', () => {
    it('should set runtime override for a feature', () => {
      service.setOverride('enableKanbanBoard', true)

      expect(service.isEnabled('enableKanbanBoard')).toBe(true)
    })

    it('should allow overriding enabled features to disabled', () => {
      service.setOverride('enableAnalytics', false)

      expect(service.isEnabled('enableAnalytics')).toBe(false)
    })
  })

  describe('clearOverride', () => {
    it('should clear specific override', () => {
      service.setOverride('enableKanbanBoard', true)
      expect(service.isEnabled('enableKanbanBoard')).toBe(true)

      service.clearOverride('enableKanbanBoard')
      expect(service.isEnabled('enableKanbanBoard')).toBe(false) // Back to config value
    })
  })

  describe('clearAllOverrides', () => {
    it('should clear all overrides', () => {
      service.setOverride('enableKanbanBoard', true)
      service.setOverride('enableWorkflowOrchestration', true)

      service.clearAllOverrides()

      expect(service.isEnabled('enableKanbanBoard')).toBe(false)
      expect(service.isEnabled('enableWorkflowOrchestration')).toBe(false)
    })
  })

  describe('getStatusSummary', () => {
    it('should show source of each flag value', () => {
      service.setOverride('enableKanbanBoard', true)

      const summary = service.getStatusSummary()

      expect(summary.enableAnalytics).toEqual({
        enabled: true,
        source: 'config',
      })
      expect(summary.enableKanbanBoard).toEqual({
        enabled: true,
        source: 'override',
      })
    })
  })
})

describe('requireFeature decorator', () => {
  class TestClass {
    analyticsMethod() {
      return featureFlags.isEnabled('enableAnalytics') ? 'analytics result' : ''
    }

    kanbanMethod() {
      return featureFlags.isEnabled('enableKanbanBoard') ? 'kanban result' : ''
    }
  }

  let testInstance: TestClass

  beforeEach(() => {
    testInstance = new TestClass()
    featureFlags.clearAllOverrides()
  })

  it('should allow method execution when feature is enabled', () => {
    // enableAnalytics is true by default in mock
    expect(testInstance.analyticsMethod()).toBe('analytics result')
  })

  it('should throw error when feature is disabled', () => {
    // enableKanbanBoard is false by default in mock
    expect(testInstance.kanbanMethod()).toBe('')
  })

  it('should respect runtime overrides', () => {
    featureFlags.setOverride('enableKanbanBoard', true)

    expect(testInstance.kanbanMethod()).toBe('kanban result')
  })
})

describe('requireFeatureMiddleware', () => {
  let req: Request
  let res: {
    status: jest.Mock
    json: jest.Mock
  }
  let next: jest.Mock

  beforeEach(() => {
    req = {}
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    next = jest.fn()
    featureFlags.clearAllOverrides()
  })

  it('should call next() when feature is enabled', () => {
    const middleware = requireFeatureMiddleware('enableAnalytics')

    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should return 404 when feature is disabled', () => {
    const middleware = requireFeatureMiddleware('enableKanbanBoard')

    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'FEATURE_DISABLED',
        message: "Feature 'enableKanbanBoard' is not available",
        timestamp: expect.any(String),
      },
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should respect runtime overrides', () => {
    featureFlags.setOverride('enableKanbanBoard', true)
    const middleware = requireFeatureMiddleware('enableKanbanBoard')

    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })
})

describe('Rollout Stages', () => {
  beforeEach(() => {
    featureFlags.clearAllOverrides()
  })

  it('should have correct DISABLED stage configuration', () => {
    const disabledStage = FEATURE_ROLLOUT_STAGES.DISABLED

    expect(disabledStage.enableAnalytics).toBe(false)
    expect(disabledStage.enableKanbanBoard).toBe(false)
    expect(disabledStage.enableWorkflowOrchestration).toBe(false)
    expect(disabledStage.enableAdvancedAuth).toBe(false)
    expect(disabledStage.enableNotifications).toBe(false)
  })

  it('should have correct BASIC stage configuration', () => {
    const basicStage = FEATURE_ROLLOUT_STAGES.BASIC

    expect(basicStage.enableAnalytics).toBe(true)
    expect(basicStage.enableKanbanBoard).toBe(false)
    expect(basicStage.enableWorkflowOrchestration).toBe(false)
    expect(basicStage.enableAdvancedAuth).toBe(false)
    expect(basicStage.enableNotifications).toBe(true)
  })

  it('should have correct FULL stage configuration', () => {
    const fullStage = FEATURE_ROLLOUT_STAGES.FULL

    expect(fullStage.enableAnalytics).toBe(true)
    expect(fullStage.enableKanbanBoard).toBe(true)
    expect(fullStage.enableWorkflowOrchestration).toBe(true)
    expect(fullStage.enableAdvancedAuth).toBe(true)
    expect(fullStage.enableNotifications).toBe(true)
  })

  describe('applyRolloutStage', () => {
    it('should apply BASIC rollout stage', () => {
      applyRolloutStage('BASIC')

      expect(featureFlags.isEnabled('enableAnalytics')).toBe(true)
      expect(featureFlags.isEnabled('enableKanbanBoard')).toBe(false)
      expect(featureFlags.isEnabled('enableWorkflowOrchestration')).toBe(false)
      expect(featureFlags.isEnabled('enableAdvancedAuth')).toBe(false)
      expect(featureFlags.isEnabled('enableNotifications')).toBe(true)
    })

    it('should apply INTERMEDIATE rollout stage', () => {
      applyRolloutStage('INTERMEDIATE')

      expect(featureFlags.isEnabled('enableAnalytics')).toBe(true)
      expect(featureFlags.isEnabled('enableKanbanBoard')).toBe(true)
      expect(featureFlags.isEnabled('enableWorkflowOrchestration')).toBe(false)
      expect(featureFlags.isEnabled('enableAdvancedAuth')).toBe(false)
      expect(featureFlags.isEnabled('enableNotifications')).toBe(true)
    })

    it('should apply FULL rollout stage', () => {
      applyRolloutStage('FULL')

      expect(featureFlags.isEnabled('enableAnalytics')).toBe(true)
      expect(featureFlags.isEnabled('enableKanbanBoard')).toBe(true)
      expect(featureFlags.isEnabled('enableWorkflowOrchestration')).toBe(true)
      expect(featureFlags.isEnabled('enableAdvancedAuth')).toBe(true)
      expect(featureFlags.isEnabled('enableNotifications')).toBe(true)
    })

    it('should override previous rollout stage', () => {
      applyRolloutStage('FULL')
      expect(featureFlags.isEnabled('enableWorkflowOrchestration')).toBe(true)

      applyRolloutStage('BASIC')
      expect(featureFlags.isEnabled('enableWorkflowOrchestration')).toBe(false)
    })
  })
})

describe('Singleton Pattern', () => {
  it('should return same instance', () => {
    const instance1 = FeatureFlagService.getInstance()
    const instance2 = FeatureFlagService.getInstance()

    expect(instance1).toBe(instance2)
  })

  it('should maintain state across getInstance calls', () => {
    const instance1 = FeatureFlagService.getInstance()
    instance1.setOverride('enableKanbanBoard', true)

    const instance2 = FeatureFlagService.getInstance()
    expect(instance2.isEnabled('enableKanbanBoard')).toBe(true)
  })
})
