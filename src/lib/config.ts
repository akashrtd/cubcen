import { z } from 'zod'
import path from 'path'

// Environment schema validation
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .default('3000'),
  HOST: z.string().default('localhost'),

  // Database Configuration
  DATABASE_URL: z.string().min(1),
  DATABASE_MAX_CONNECTIONS: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1))
    .default('10'),

  // Authentication Configuration
  JWT_SECRET: z
    .string()
    .min(32)
    .default('your-super-secret-jwt-key-change-in-production-min-32-chars'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z
    .string()
    .transform(Number)
    .pipe(z.number().min(8).max(15))
    .default('12'),

  // External Platform Configuration
  N8N_BASE_URL: z.string().url().optional(),
  N8N_API_KEY: z.string().optional(),
  MAKE_BASE_URL: z.string().url().optional(),
  MAKE_CLIENT_ID: z.string().optional(),
  MAKE_CLIENT_SECRET: z.string().optional(),

  // Notification Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().optional(),
  SLACK_CHANNEL: z.string().optional(),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().default('./logs'),

  // Feature Flags
  ENABLE_ANALYTICS: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  ENABLE_KANBAN_BOARD: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  ENABLE_WORKFLOW_ORCHESTRATION: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  ENABLE_ADVANCED_AUTH: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  ENABLE_NOTIFICATIONS: z
    .string()
    .transform(val => val === 'true')
    .default('true'),

  // Performance Configuration
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1000))
    .default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1))
    .default('100'),
  WEBSOCKET_HEARTBEAT_INTERVAL: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1000))
    .default('30000'),

  // Health Check Configuration
  HEALTH_CHECK_INTERVAL: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1000))
    .default('60000'),
  HEALTH_CHECK_TIMEOUT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1000))
    .default('5000'),

  // Backup Configuration
  BACKUP_ENABLED: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  BACKUP_INTERVAL_HOURS: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1))
    .default('24'),
  BACKUP_RETENTION_DAYS: z.coerce.number().min(1).default(7),
  BACKUP_PATH: z.string().default('./backups'),
})

export type Config = z.infer<typeof envSchema>

// Feature flags interface
export interface FeatureFlags {
  enableAnalytics: boolean
  enableKanbanBoard: boolean
  enableWorkflowOrchestration: boolean
  enableAdvancedAuth: boolean
  enableNotifications: boolean
}

// Configuration class
class ConfigManager {
  private static instance: ConfigManager
  private config: Config = {} as Config;
  private featureFlags: FeatureFlags = {} as FeatureFlags;

  private constructor() {
    this.validateAndLoadConfig()
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  private validateAndLoadConfig(): void {
    try {
      // Parse and validate environment variables
      this.config = envSchema.parse(process.env)

      // Extract feature flags
      this.featureFlags = {
        enableAnalytics: this.config.ENABLE_ANALYTICS,
        enableKanbanBoard: this.config.ENABLE_KANBAN_BOARD,
        enableWorkflowOrchestration: this.config.ENABLE_WORKFLOW_ORCHESTRATION,
        enableAdvancedAuth: this.config.ENABLE_ADVANCED_AUTH,
        enableNotifications: this.config.ENABLE_NOTIFICATIONS,
      }

      // Validate environment-specific requirements
      this.validateEnvironmentSpecificConfig()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages =
          error.issues
            ?.map(err => `${err.path.join('.')}: ${err.message}`)
            .join('\n') || 'Unknown validation error'
        throw new Error(`Configuration validation failed:\n${errorMessages}`)
      }
      throw error
    }
  }

  private validateEnvironmentSpecificConfig(): void {
    // Production-specific validations
    if (this.config.NODE_ENV === 'production') {
      if (
        this.config.JWT_SECRET ===
        'your-super-secret-jwt-key-change-in-production-min-32-chars'
      ) {
        throw new Error('JWT_SECRET must be changed in production environment')
      }

      if (
        !this.config.DATABASE_URL.startsWith('file:') &&
        !this.config.DATABASE_URL.includes('://')
      ) {
        throw new Error(
          'DATABASE_URL must be a valid connection string in production'
        )
      }
    }

    // Notification configuration validation
    if (this.featureFlags.enableNotifications) {
      const hasEmailConfig =
        this.config.SMTP_HOST && this.config.SMTP_USER && this.config.SMTP_PASS
      const hasSlackConfig =
        this.config.SLACK_BOT_TOKEN && this.config.SLACK_CHANNEL

      if (!hasEmailConfig && !hasSlackConfig) {
        console.warn(
          'Notifications enabled but no email or Slack configuration found'
        )
      }
    }

    // Platform integration validation
    if (this.config.N8N_BASE_URL && !this.config.N8N_API_KEY) {
      console.warn('N8N_BASE_URL provided but N8N_API_KEY is missing')
    }

    if (
      this.config.MAKE_BASE_URL &&
      (!this.config.MAKE_CLIENT_ID || !this.config.MAKE_CLIENT_SECRET)
    ) {
      console.warn(
        'MAKE_BASE_URL provided but MAKE_CLIENT_ID or MAKE_CLIENT_SECRET is missing'
      )
    }
  }

  public getConfig(): Config {
    return this.config
  }

  public getFeatureFlags(): FeatureFlags {
    return this.featureFlags
  }

  public isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.featureFlags[feature]
  }

  public getDatabaseConfig() {
    return {
      url: this.config.DATABASE_URL,
      maxConnections: this.config.DATABASE_MAX_CONNECTIONS,
    }
  }

  public getAuthConfig() {
    return {
      jwtSecret: this.config.JWT_SECRET,
      jwtExpiresIn: this.config.JWT_EXPIRES_IN,
      jwtRefreshExpiresIn: this.config.JWT_REFRESH_EXPIRES_IN,
      bcryptRounds: this.config.BCRYPT_ROUNDS,
    }
  }

  public getServerConfig() {
    return {
      port: this.config.PORT,
      host: this.config.HOST,
      nodeEnv: this.config.NODE_ENV,
    }
  }

  public getLoggingConfig() {
    return {
      level: this.config.LOG_LEVEL,
      filePath: this.config.LOG_FILE_PATH,
    }
  }

  public getNotificationConfig() {
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
    }
  }

  public getPlatformConfig() {
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
    }
  }

  public getPerformanceConfig() {
    return {
      rateLimit: {
        windowMs: this.config.RATE_LIMIT_WINDOW_MS,
        maxRequests: this.config.RATE_LIMIT_MAX_REQUESTS,
      },
      websocket: {
        heartbeatInterval: this.config.WEBSOCKET_HEARTBEAT_INTERVAL,
      },
    }
  }

  public getHealthCheckConfig() {
    return {
      interval: this.config.HEALTH_CHECK_INTERVAL,
      timeout: this.config.HEALTH_CHECK_TIMEOUT,
    }
  }

  public getBackupConfig() {
    return {
      enabled: this.config.BACKUP_ENABLED,
      intervalHours: this.config.BACKUP_INTERVAL_HOURS,
      retentionDays: this.config.BACKUP_RETENTION_DAYS,
      path: path.resolve(this.config.BACKUP_PATH),
    }
  }

  // Reload configuration (useful for testing or runtime config changes)
  public reloadConfig(): void {
    this.validateAndLoadConfig()
  }

  // Get configuration summary for debugging
  public getConfigSummary(): Record<string, unknown> {
    return {
      nodeEnv: this.config.NODE_ENV,
      port: this.config.PORT,
      databaseType: this.config.DATABASE_URL.startsWith('file:')
        ? 'SQLite'
        : 'External',
      featureFlags: this.featureFlags,
      platformsConfigured: {
        n8n: !!this.config.N8N_BASE_URL,
        make: !!this.config.MAKE_BASE_URL,
      },
      notificationsConfigured: {
        email: !!(this.config.SMTP_HOST && this.config.SMTP_USER),
        slack: !!(this.config.SLACK_BOT_TOKEN && this.config.SLACK_CHANNEL),
      },
    }
  }
}

// Export singleton instance
export const config = ConfigManager.getInstance()
export default config
