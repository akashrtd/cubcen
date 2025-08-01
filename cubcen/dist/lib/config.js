"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(65535)).default('3000'),
    HOST: zod_1.z.string().default('localhost'),
    DATABASE_URL: zod_1.z.string().min(1),
    DATABASE_MAX_CONNECTIONS: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).default('10'),
    JWT_SECRET: zod_1.z.string().min(32).default('your-super-secret-jwt-key-change-in-production-min-32-chars'),
    JWT_EXPIRES_IN: zod_1.z.string().default('24h'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    BCRYPT_ROUNDS: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(8).max(15)).default('12'),
    N8N_BASE_URL: zod_1.z.string().url().optional(),
    N8N_API_KEY: zod_1.z.string().optional(),
    MAKE_BASE_URL: zod_1.z.string().url().optional(),
    MAKE_CLIENT_ID: zod_1.z.string().optional(),
    MAKE_CLIENT_SECRET: zod_1.z.string().optional(),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(65535)).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    SLACK_BOT_TOKEN: zod_1.z.string().optional(),
    SLACK_CHANNEL: zod_1.z.string().optional(),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_FILE_PATH: zod_1.z.string().default('./logs'),
    ENABLE_ANALYTICS: zod_1.z.string().transform(val => val === 'true').default('true'),
    ENABLE_KANBAN_BOARD: zod_1.z.string().transform(val => val === 'true').default('true'),
    ENABLE_WORKFLOW_ORCHESTRATION: zod_1.z.string().transform(val => val === 'true').default('false'),
    ENABLE_ADVANCED_AUTH: zod_1.z.string().transform(val => val === 'true').default('false'),
    ENABLE_NOTIFICATIONS: zod_1.z.string().transform(val => val === 'true').default('true'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1000)).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).default('100'),
    WEBSOCKET_HEARTBEAT_INTERVAL: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1000)).default('30000'),
    HEALTH_CHECK_INTERVAL: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1000)).default('60000'),
    HEALTH_CHECK_TIMEOUT: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1000)).default('5000'),
    BACKUP_ENABLED: zod_1.z.string().transform(val => val === 'true').default('true'),
    BACKUP_INTERVAL_HOURS: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).default('24'),
    BACKUP_RETENTION_DAYS: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).default('7'),
    BACKUP_PATH: zod_1.z.string().default('./backups'),
});
class ConfigManager {
    constructor() {
        this.validateAndLoadConfig();
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    validateAndLoadConfig() {
        try {
            this.config = envSchema.parse(process.env);
            this.featureFlags = {
                enableAnalytics: this.config.ENABLE_ANALYTICS,
                enableKanbanBoard: this.config.ENABLE_KANBAN_BOARD,
                enableWorkflowOrchestration: this.config.ENABLE_WORKFLOW_ORCHESTRATION,
                enableAdvancedAuth: this.config.ENABLE_ADVANCED_AUTH,
                enableNotifications: this.config.ENABLE_NOTIFICATIONS,
            };
            this.validateEnvironmentSpecificConfig();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errorMessages = error.errors?.map(err => `${err.path.join('.')}: ${err.message}`).join('\n') || 'Unknown validation error';
                throw new Error(`Configuration validation failed:\n${errorMessages}`);
            }
            throw error;
        }
    }
    validateEnvironmentSpecificConfig() {
        if (this.config.NODE_ENV === 'production') {
            if (this.config.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production-min-32-chars') {
                throw new Error('JWT_SECRET must be changed in production environment');
            }
            if (!this.config.DATABASE_URL.startsWith('file:') && !this.config.DATABASE_URL.includes('://')) {
                throw new Error('DATABASE_URL must be a valid connection string in production');
            }
        }
        if (this.featureFlags.enableNotifications) {
            const hasEmailConfig = this.config.SMTP_HOST && this.config.SMTP_USER && this.config.SMTP_PASS;
            const hasSlackConfig = this.config.SLACK_BOT_TOKEN && this.config.SLACK_CHANNEL;
            if (!hasEmailConfig && !hasSlackConfig) {
                console.warn('Notifications enabled but no email or Slack configuration found');
            }
        }
        if (this.config.N8N_BASE_URL && !this.config.N8N_API_KEY) {
            console.warn('N8N_BASE_URL provided but N8N_API_KEY is missing');
        }
        if (this.config.MAKE_BASE_URL && (!this.config.MAKE_CLIENT_ID || !this.config.MAKE_CLIENT_SECRET)) {
            console.warn('MAKE_BASE_URL provided but MAKE_CLIENT_ID or MAKE_CLIENT_SECRET is missing');
        }
    }
    getConfig() {
        return this.config;
    }
    getFeatureFlags() {
        return this.featureFlags;
    }
    isFeatureEnabled(feature) {
        return this.featureFlags[feature];
    }
    getDatabaseConfig() {
        return {
            url: this.config.DATABASE_URL,
            maxConnections: this.config.DATABASE_MAX_CONNECTIONS,
        };
    }
    getAuthConfig() {
        return {
            jwtSecret: this.config.JWT_SECRET,
            jwtExpiresIn: this.config.JWT_EXPIRES_IN,
            jwtRefreshExpiresIn: this.config.JWT_REFRESH_EXPIRES_IN,
            bcryptRounds: this.config.BCRYPT_ROUNDS,
        };
    }
    getServerConfig() {
        return {
            port: this.config.PORT,
            host: this.config.HOST,
            nodeEnv: this.config.NODE_ENV,
        };
    }
    getLoggingConfig() {
        return {
            level: this.config.LOG_LEVEL,
            filePath: this.config.LOG_FILE_PATH,
        };
    }
    getNotificationConfig() {
        return {
            smtp: {
                host: this.config.SMTP_HOST,
                port: this.config.SMTP_PORT,
                user: this.config.SMTP_USER,
                pass: this.config.SMTP_PASS,
            },
            slack: {
                botToken: this.config.SLACK_BOT_TOKEN,
                channel: this.config.SLACK_CHANNEL,
            },
        };
    }
    getPlatformConfig() {
        return {
            n8n: {
                baseUrl: this.config.N8N_BASE_URL,
                apiKey: this.config.N8N_API_KEY,
            },
            make: {
                baseUrl: this.config.MAKE_BASE_URL,
                clientId: this.config.MAKE_CLIENT_ID,
                clientSecret: this.config.MAKE_CLIENT_SECRET,
            },
        };
    }
    getPerformanceConfig() {
        return {
            rateLimit: {
                windowMs: this.config.RATE_LIMIT_WINDOW_MS,
                maxRequests: this.config.RATE_LIMIT_MAX_REQUESTS,
            },
            websocket: {
                heartbeatInterval: this.config.WEBSOCKET_HEARTBEAT_INTERVAL,
            },
        };
    }
    getHealthCheckConfig() {
        return {
            interval: this.config.HEALTH_CHECK_INTERVAL,
            timeout: this.config.HEALTH_CHECK_TIMEOUT,
        };
    }
    getBackupConfig() {
        return {
            enabled: this.config.BACKUP_ENABLED,
            intervalHours: this.config.BACKUP_INTERVAL_HOURS,
            retentionDays: this.config.BACKUP_RETENTION_DAYS,
            path: path_1.default.resolve(this.config.BACKUP_PATH),
        };
    }
    reloadConfig() {
        this.validateAndLoadConfig();
    }
    getConfigSummary() {
        return {
            nodeEnv: this.config.NODE_ENV,
            port: this.config.PORT,
            databaseType: this.config.DATABASE_URL.startsWith('file:') ? 'SQLite' : 'External',
            featureFlags: this.featureFlags,
            platformsConfigured: {
                n8n: !!this.config.N8N_BASE_URL,
                make: !!this.config.MAKE_BASE_URL,
            },
            notificationsConfigured: {
                email: !!(this.config.SMTP_HOST && this.config.SMTP_USER),
                slack: !!(this.config.SLACK_BOT_TOKEN && this.config.SLACK_CHANNEL),
            },
        };
    }
}
exports.config = ConfigManager.getInstance();
exports.default = exports.config;
//# sourceMappingURL=config.js.map