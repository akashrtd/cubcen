"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureFlags = exports.FEATURE_ROLLOUT_STAGES = exports.FeatureFlagService = void 0;
exports.requireFeature = requireFeature;
exports.requireFeatureMiddleware = requireFeatureMiddleware;
exports.useFeatureFlag = useFeatureFlag;
exports.applyRolloutStage = applyRolloutStage;
const config_1 = __importDefault(require("./config"));
class FeatureFlagService {
    constructor() {
        this.overrides = {};
        this.flags = config_1.default.getFeatureFlags();
    }
    static getInstance() {
        if (!FeatureFlagService.instance) {
            FeatureFlagService.instance = new FeatureFlagService();
        }
        return FeatureFlagService.instance;
    }
    isEnabled(feature) {
        if (this.overrides[feature] !== undefined) {
            return this.overrides[feature];
        }
        return this.flags[feature];
    }
    getAllFlags() {
        return { ...this.flags, ...this.overrides };
    }
    setOverride(feature, enabled) {
        this.overrides[feature] = enabled;
    }
    clearOverride(feature) {
        delete this.overrides[feature];
    }
    clearAllOverrides() {
        this.overrides = {};
    }
    reload() {
        this.flags = config_1.default.getFeatureFlags();
    }
    getStatusSummary() {
        const summary = {};
        const allFlags = this.getAllFlags();
        for (const [key, value] of Object.entries(allFlags)) {
            summary[key] = {
                enabled: value,
                source: this.overrides[key] !== undefined ? 'override' : 'config'
            };
        }
        return summary;
    }
}
exports.FeatureFlagService = FeatureFlagService;
function requireFeature(feature) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            if (!exports.featureFlags.isEnabled(feature)) {
                throw new Error(`Feature '${feature}' is not enabled`);
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
function requireFeatureMiddleware(feature) {
    return (req, res, next) => {
        if (!exports.featureFlags.isEnabled(feature)) {
            return res.status(404).json({
                error: {
                    code: 'FEATURE_DISABLED',
                    message: `Feature '${feature}' is not available`,
                    timestamp: new Date().toISOString()
                }
            });
        }
        next();
    };
}
function useFeatureFlag(feature) {
    return exports.featureFlags.isEnabled(feature);
}
exports.FEATURE_ROLLOUT_STAGES = {
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
};
function applyRolloutStage(stage) {
    const stageConfig = exports.FEATURE_ROLLOUT_STAGES[stage];
    for (const [feature, enabled] of Object.entries(stageConfig)) {
        exports.featureFlags.setOverride(feature, enabled);
    }
}
exports.featureFlags = FeatureFlagService.getInstance();
exports.default = exports.featureFlags;
//# sourceMappingURL=feature-flags.js.map