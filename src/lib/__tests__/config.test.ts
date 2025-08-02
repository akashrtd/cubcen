// Configuration tests

// Mock process.env before importing config
const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
})

afterAll(() => {
  process.env = originalEnv
})

describe('Configuration System', () => {
  describe('Environment Validation', () => {
    it('should validate required environment variables', async () => {
      // Set minimal required environment
      process.env.DATABASE_URL = 'file:./test.db'
      process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-chars-long'

      const { config } = await import('../config')

      expect(config.getConfig().DATABASE_URL).toBe('file:./test.db')
      expect(config.getConfig().JWT_SECRET).toBe(
        'test-jwt-secret-key-min-32-chars-long'
      )
    })

    it('should use default values for optional variables', async () => {
      process.env.DATABASE_URL = 'file:./test.db'
      process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-chars-long'

      const { config } = await import('../config')

      expect(config.getConfig().NODE_ENV).toBe('development')
      expect(config.getConfig().PORT).toBe(3000)
      expect(config.getConfig().LOG_LEVEL).toBe('info')
    })

    it('should throw error for invalid JWT_SECRET length', async () => {
      process.env.DATABASE_URL = 'file:./test.db'
      process.env.JWT_SECRET = 'short' // Too short

      await expect(async () => {
        await import('../config')
      }).rejects.toThrow('Configuration validation failed')
    })

    it('should throw error for invalid port number', async () => {
      process.env.DATABASE_URL = 'file:./test.db'
      process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-chars-long'
      process.env.PORT = '99999' // Invalid port

      await expect(async () => {
        await import('../config')
      }).rejects.toThrow('Configuration validation failed')
    })

    it('should validate production environment requirements', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true,
      })
      process.env.DATABASE_URL = 'file:./test.db'
      process.env.JWT_SECRET =
        'your-super-secret-jwt-key-change-in-production-min-32-chars' // Default value

      await expect(async () => {
        await import('../config')
      }).rejects.toThrow('JWT_SECRET must be changed in production environment')
    })
  })

  describe('Feature Flags', () => {
    it('should parse feature flags correctly', async () => {
      process.env.DATABASE_URL = 'file:./test.db'
      process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-chars-long'
      process.env.ENABLE_ANALYTICS = 'true'
      process.env.ENABLE_KANBAN_BOARD = 'false'

      const { config } = await import('../config')
      const flags = config.getFeatureFlags()

      expect(flags.enableAnalytics).toBe(true)
      expect(flags.enableKanbanBoard).toBe(false)
    })

    it('should use default feature flag values', async () => {
      process.env.DATABASE_URL = 'file:./test.db'
      process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-chars-long'

      const { config } = await import('../config')
      const flags = config.getFeatureFlags()

      expect(flags.enableAnalytics).toBe(true) // Default
      expect(flags.enableWorkflowOrchestration).toBe(false) // Default
    })
  })

  describe('Configuration Getters', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'file:./test.db'
      process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-chars-long'
      process.env.PORT = '4000'
      process.env.SMTP_HOST = 'smtp.test.com'
      process.env.SMTP_USER = 'test@test.com'
      process.env.N8N_BASE_URL = 'https://n8n.test.com'
      process.env.N8N_API_KEY = 'test-api-key'
    })

    it('should return database configuration', async () => {
      const { config } = await import('../config')
      const dbConfig = config.getDatabaseConfig()

      expect(dbConfig.url).toBe('file:./test.db')
      expect(dbConfig.maxConnections).toBe(10)
    })

    it('should return server configuration', async () => {
      const { config } = await import('../config')
      const serverConfig = config.getServerConfig()

      expect(serverConfig.port).toBe(4000)
      expect(serverConfig.host).toBe('localhost')
      expect(serverConfig.nodeEnv).toBe('development')
    })

    it('should return authentication configuration', async () => {
      const { config } = await import('../config')
      const authConfig = config.getAuthConfig()

      expect(authConfig.jwtSecret).toBe('test-jwt-secret-key-min-32-chars-long')
      expect(authConfig.bcryptRounds).toBe(12)
    })

    it('should return notification configuration', async () => {
      const { config } = await import('../config')
      const notificationConfig = config.getNotificationConfig()

      expect(notificationConfig.smtp.host).toBe('smtp.test.com')
      expect(notificationConfig.smtp.user).toBe('test@test.com')
    })

    it('should return platform configuration', async () => {
      const { config } = await import('../config')
      const platformConfig = config.getPlatformConfig()

      expect(platformConfig.n8n.baseUrl).toBe('https://n8n.test.com')
      expect(platformConfig.n8n.apiKey).toBe('test-api-key')
    })
  })

  describe('Configuration Summary', () => {
    it('should provide configuration summary', async () => {
      process.env.DATABASE_URL = 'file:./test.db'
      process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-chars-long'
      process.env.N8N_BASE_URL = 'https://n8n.test.com'
      process.env.SMTP_HOST = 'smtp.test.com'
      process.env.SMTP_USER = 'test@test.com'

      const { config } = await import('../config')
      const summary = config.getConfigSummary() as {
        platformsConfigured: unknown
        notificationsConfigured: unknown
      }

      expect(summary.nodeEnv).toBe('development')
      expect(summary.databaseType).toBe('SQLite')
      expect(summary.platformsConfigured.n8n).toBe(true)
      expect(summary.notificationsConfigured.email).toBe(true)
    })
  })

  describe('Configuration Reload', () => {
    it('should reload configuration when environment changes', async () => {
      process.env.DATABASE_URL = 'file:./test.db'
      process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-chars-long'
      process.env.PORT = '3000'

      const { config } = await import('../config')
      expect(config.getConfig().PORT).toBe(3000)

      // Change environment
      process.env.PORT = '4000'
      config.reloadConfig()

      expect(config.getConfig().PORT).toBe(4000)
    })
  })

  describe('Environment-Specific Validation', () => {
    it('should warn about missing notification config when notifications enabled', async () => {
      process.env.DATABASE_URL = 'file:./test.db'
      process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-chars-long'
      process.env.ENABLE_NOTIFICATIONS = 'true'
      // No SMTP or Slack config

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      await import('../config')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Notifications enabled but no email or Slack configuration found'
      )

      consoleSpy.mockRestore()
    })

    it('should warn about incomplete platform configuration', async () => {
      process.env.DATABASE_URL = 'file:./test.db'
      process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-chars-long'
      process.env.N8N_BASE_URL = 'https://n8n.test.com'
      // Missing N8N_API_KEY

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      await import('../config')

      expect(consoleSpy).toHaveBeenCalledWith(
        'N8N_BASE_URL provided but N8N_API_KEY is missing'
      )

      consoleSpy.mockRestore()
    })
  })
})
