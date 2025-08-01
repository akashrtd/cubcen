/**
 * Adapter Factory Tests
 */

import {
  AdapterFactory,
  AdapterManager,
  AdapterConstructor,
} from '../adapter-factory'
import { BasePlatformAdapter } from '../base-adapter'
import { MockPlatformAdapter } from '../mock-adapter'
import { PlatformConfig, PlatformType } from '../../../types/platform'

// Test adapter class
class TestAdapter extends BasePlatformAdapter {
  getPlatformType(): PlatformType {
    return this.config.type
  }

  async authenticate() {
    return { success: true }
  }

  async discoverAgents() {
    return []
  }

  async getAgentStatus() {
    return { id: 'test', status: 'active' as const, lastSeen: new Date() }
  }

  async executeAgent() {
    return { success: true, executionTime: 100, timestamp: new Date() }
  }

  async subscribeToEvents() {}
  async unsubscribeFromEvents() {}

  async healthCheck() {
    return { status: 'healthy' as const, lastCheck: new Date() }
  }

  async connect() {
    this.setConnected(true)
    return { connected: true }
  }

  async disconnect() {
    this.setConnected(false)
  }
}

describe('AdapterFactory', () => {
  let testConfig: PlatformConfig

  beforeEach(() => {
    testConfig = {
      id: 'test-platform',
      name: 'Test Platform',
      type: 'n8n',
      baseUrl: 'https://test.example.com',
      credentials: { apiKey: 'test-key' },
    }

    // Clear instances before each test
    AdapterFactory.clearInstances()
  })

  afterEach(() => {
    AdapterFactory.clearInstances()
  })

  describe('registerAdapter', () => {
    it('should register a new adapter type', () => {
      AdapterFactory.registerAdapter('n8n', TestAdapter)
      expect(AdapterFactory.isAdapterRegistered('n8n')).toBe(true)
    })

    it('should allow overriding existing adapter types', () => {
      AdapterFactory.registerAdapter('n8n', TestAdapter)
      AdapterFactory.registerAdapter(
        'n8n',
        MockPlatformAdapter as AdapterConstructor
      )

      const adapter = AdapterFactory.createAdapter(testConfig)
      expect(adapter).toBeInstanceOf(MockPlatformAdapter)
    })
  })

  describe('createAdapter', () => {
    beforeEach(() => {
      AdapterFactory.registerAdapter('n8n', TestAdapter)
    })

    it('should create a new adapter instance', () => {
      const adapter = AdapterFactory.createAdapter(testConfig)

      expect(adapter).toBeInstanceOf(TestAdapter)
      expect(adapter.getConfig()).toEqual(testConfig)
    })

    it('should store the created instance', () => {
      const adapter = AdapterFactory.createAdapter(testConfig)
      const retrieved = AdapterFactory.getAdapter(testConfig.id)

      expect(retrieved).toBe(adapter)
    })

    it('should throw error for unregistered adapter type', () => {
      const config = { ...testConfig, type: 'unknown' as PlatformType }

      expect(() => AdapterFactory.createAdapter(config)).toThrow(
        'No adapter registered for platform type: unknown'
      )
    })
  })

  describe('getAdapter', () => {
    beforeEach(() => {
      AdapterFactory.registerAdapter('n8n', TestAdapter)
    })

    it('should return existing adapter instance', () => {
      const adapter = AdapterFactory.createAdapter(testConfig)
      const retrieved = AdapterFactory.getAdapter(testConfig.id)

      expect(retrieved).toBe(adapter)
    })

    it('should return undefined for non-existent adapter', () => {
      const retrieved = AdapterFactory.getAdapter('non-existent')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('getOrCreateAdapter', () => {
    beforeEach(() => {
      AdapterFactory.registerAdapter('n8n', TestAdapter)
    })

    it('should return existing adapter if it exists', () => {
      const adapter1 = AdapterFactory.createAdapter(testConfig)
      const adapter2 = AdapterFactory.getOrCreateAdapter(testConfig)

      expect(adapter2).toBe(adapter1)
    })

    it('should create new adapter if it does not exist', () => {
      const adapter = AdapterFactory.getOrCreateAdapter(testConfig)

      expect(adapter).toBeInstanceOf(TestAdapter)
      expect(adapter.getConfig()).toEqual(testConfig)
    })

    it('should update configuration of existing adapter', () => {
      const adapter1 = AdapterFactory.createAdapter(testConfig)
      const updateSpy = jest.spyOn(adapter1, 'updateConfig')

      const updatedConfig = { ...testConfig, name: 'Updated Name' }
      const adapter2 = AdapterFactory.getOrCreateAdapter(updatedConfig)

      expect(adapter2).toBe(adapter1)
      expect(updateSpy).toHaveBeenCalledWith(updatedConfig)
    })
  })

  describe('removeAdapter', () => {
    beforeEach(() => {
      AdapterFactory.registerAdapter('n8n', TestAdapter)
    })

    it('should remove and disconnect adapter', async () => {
      const adapter = AdapterFactory.createAdapter(testConfig)
      const disconnectSpy = jest.spyOn(adapter, 'disconnect')

      await AdapterFactory.removeAdapter(testConfig.id)

      expect(disconnectSpy).toHaveBeenCalled()
      expect(AdapterFactory.getAdapter(testConfig.id)).toBeUndefined()
    })

    it('should handle removal of non-existent adapter', async () => {
      await expect(
        AdapterFactory.removeAdapter('non-existent')
      ).resolves.not.toThrow()
    })

    it('should handle disconnect errors gracefully', async () => {
      const adapter = AdapterFactory.createAdapter(testConfig)
      jest
        .spyOn(adapter, 'disconnect')
        .mockRejectedValue(new Error('Disconnect failed'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await AdapterFactory.removeAdapter(testConfig.id)

      expect(consoleSpy).toHaveBeenCalledWith(
        `Error disconnecting adapter ${testConfig.id}:`,
        expect.any(Error)
      )
      expect(AdapterFactory.getAdapter(testConfig.id)).toBeUndefined()

      consoleSpy.mockRestore()
    })
  })

  describe('getRegisteredTypes', () => {
    it('should return all registered adapter types', () => {
      AdapterFactory.registerAdapter('n8n', TestAdapter)
      AdapterFactory.registerAdapter('make', TestAdapter)

      const types = AdapterFactory.getRegisteredTypes()
      expect(types).toContain('n8n')
      expect(types).toContain('make')
    })
  })

  describe('getAllAdapters', () => {
    beforeEach(() => {
      AdapterFactory.registerAdapter('n8n', TestAdapter)
    })

    it('should return all active adapter instances', () => {
      const adapter1 = AdapterFactory.createAdapter(testConfig)
      const config2 = { ...testConfig, id: 'test-platform-2' }
      const adapter2 = AdapterFactory.createAdapter(config2)

      const allAdapters = AdapterFactory.getAllAdapters()

      expect(allAdapters.size).toBe(2)
      expect(allAdapters.get(testConfig.id)).toBe(adapter1)
      expect(allAdapters.get(config2.id)).toBe(adapter2)
    })
  })

  describe('isAdapterRegistered', () => {
    it('should return true for registered adapter types', () => {
      AdapterFactory.registerAdapter('n8n', TestAdapter)
      expect(AdapterFactory.isAdapterRegistered('n8n')).toBe(true)
    })

    it('should return false for unregistered adapter types', () => {
      expect(
        AdapterFactory.isAdapterRegistered('unknown' as PlatformType)
      ).toBe(false)
    })
  })

  describe('clearInstances', () => {
    beforeEach(() => {
      AdapterFactory.registerAdapter('n8n', TestAdapter)
    })

    it('should clear all adapter instances', () => {
      AdapterFactory.createAdapter(testConfig)
      expect(AdapterFactory.getAllAdapters().size).toBe(1)

      AdapterFactory.clearInstances()
      expect(AdapterFactory.getAllAdapters().size).toBe(0)
    })
  })

  describe('initializeDefaultAdapters', () => {
    it('should register default mock adapters', () => {
      // Clear all adapters first
      const registeredTypes = AdapterFactory.getRegisteredTypes()
      registeredTypes.forEach(_type => {
        // We can't unregister, but we can verify they exist
      })

      AdapterFactory.initializeDefaultAdapters()

      expect(AdapterFactory.isAdapterRegistered('n8n')).toBe(true)
      expect(AdapterFactory.isAdapterRegistered('make')).toBe(true)
      expect(AdapterFactory.isAdapterRegistered('zapier')).toBe(true)
    })
  })
})

describe('AdapterManager', () => {
  let manager: AdapterManager
  let testConfig: PlatformConfig

  beforeEach(() => {
    manager = new AdapterManager()
    testConfig = {
      id: 'test-platform',
      name: 'Test Platform',
      type: 'n8n',
      baseUrl: 'https://test.example.com',
      credentials: { apiKey: 'test-key' },
    }

    AdapterFactory.registerAdapter('n8n', TestAdapter)
    AdapterFactory.clearInstances()
  })

  afterEach(() => {
    AdapterFactory.clearInstances()
  })

  describe('addPlatform', () => {
    it('should add platform and connect adapter', async () => {
      const adapter = await manager.addPlatform(testConfig)

      expect(adapter).toBeInstanceOf(TestAdapter)
      expect(adapter.isAdapterConnected()).toBe(true)
      expect(manager.getAdapter(testConfig.id)).toBe(adapter)
    })

    it('should remove adapter if connection fails', async () => {
      const FailingAdapter = class extends TestAdapter {
        async connect() {
          throw new Error('Connection failed')
        }
      } as AdapterConstructor

      AdapterFactory.registerAdapter('n8n', FailingAdapter)

      await expect(manager.addPlatform(testConfig)).rejects.toThrow(
        'Connection failed'
      )
      expect(manager.getAdapter(testConfig.id)).toBeUndefined()
    })
  })

  describe('removePlatform', () => {
    it('should remove platform and disconnect adapter', async () => {
      const adapter = await manager.addPlatform(testConfig)
      const disconnectSpy = jest.spyOn(adapter, 'disconnect')

      await manager.removePlatform(testConfig.id)

      expect(disconnectSpy).toHaveBeenCalled()
      expect(manager.getAdapter(testConfig.id)).toBeUndefined()
    })

    it('should handle removal of non-existent platform', async () => {
      await expect(
        manager.removePlatform('non-existent')
      ).resolves.not.toThrow()
    })
  })

  describe('getAdapter', () => {
    it('should return adapter by platform ID', async () => {
      const adapter = await manager.addPlatform(testConfig)
      const retrieved = manager.getAdapter(testConfig.id)

      expect(retrieved).toBe(adapter)
    })

    it('should return undefined for non-existent platform', () => {
      const retrieved = manager.getAdapter('non-existent')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('getAllAdapters', () => {
    it('should return all managed adapters', async () => {
      const adapter1 = await manager.addPlatform(testConfig)
      const config2 = { ...testConfig, id: 'test-platform-2' }
      const adapter2 = await manager.addPlatform(config2)

      const allAdapters = manager.getAllAdapters()

      expect(allAdapters).toHaveLength(2)
      expect(allAdapters).toContain(adapter1)
      expect(allAdapters).toContain(adapter2)
    })
  })

  describe('getAdaptersByType', () => {
    it('should return adapters filtered by type', async () => {
      const n8nConfig = { ...testConfig, type: 'n8n' as PlatformType }
      const makeConfig = {
        ...testConfig,
        id: 'make-platform',
        type: 'make' as PlatformType,
      }

      AdapterFactory.registerAdapter('make', TestAdapter)

      const n8nAdapter = await manager.addPlatform(n8nConfig)
      const makeAdapter = await manager.addPlatform(makeConfig)

      const n8nAdapters = manager.getAdaptersByType('n8n')
      const makeAdapters = manager.getAdaptersByType('make')

      expect(n8nAdapters).toHaveLength(1)
      expect(n8nAdapters[0]).toBe(n8nAdapter)
      expect(makeAdapters).toHaveLength(1)
      expect(makeAdapters[0]).toBe(makeAdapter)
    })
  })

  describe('checkAllAdaptersHealth', () => {
    it('should check health of all adapters', async () => {
      await manager.addPlatform(testConfig)
      const config2 = { ...testConfig, id: 'test-platform-2' }
      await manager.addPlatform(config2)

      const healthResults = await manager.checkAllAdaptersHealth()

      expect(healthResults.size).toBe(2)
      expect(healthResults.get(testConfig.id)).toEqual({
        status: 'healthy',
        lastCheck: expect.any(Date),
      })
      expect(healthResults.get(config2.id)).toEqual({
        status: 'healthy',
        lastCheck: expect.any(Date),
      })
    })

    it('should handle health check errors', async () => {
      const FailingHealthAdapter = class extends TestAdapter {
        async healthCheck() {
          throw new Error('Health check failed')
        }
      } as AdapterConstructor

      AdapterFactory.registerAdapter('n8n', FailingHealthAdapter)
      await manager.addPlatform(testConfig)

      const healthResults = await manager.checkAllAdaptersHealth()

      expect(healthResults.get(testConfig.id)).toEqual({
        status: 'unhealthy',
        error: 'Health check failed',
        lastCheck: expect.any(Date),
      })
    })
  })

  describe('disconnectAll', () => {
    it('should disconnect all adapters', async () => {
      const adapter1 = await manager.addPlatform(testConfig)
      const config2 = { ...testConfig, id: 'test-platform-2' }
      const adapter2 = await manager.addPlatform(config2)

      const disconnect1Spy = jest.spyOn(adapter1, 'disconnect')
      const disconnect2Spy = jest.spyOn(adapter2, 'disconnect')

      await manager.disconnectAll()

      expect(disconnect1Spy).toHaveBeenCalled()
      expect(disconnect2Spy).toHaveBeenCalled()
      expect(manager.getAllAdapters()).toHaveLength(0)
    })

    it('should handle disconnect errors gracefully', async () => {
      const FailingDisconnectAdapter = class extends TestAdapter {
        async disconnect() {
          throw new Error('Disconnect failed')
        }
      }

      AdapterFactory.registerAdapter('n8n', FailingDisconnectAdapter)
      await manager.addPlatform(testConfig)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await manager.disconnectAll()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error disconnecting adapter:',
        expect.any(Error)
      )
      expect(manager.getAllAdapters()).toHaveLength(0)

      consoleSpy.mockRestore()
    })
  })
})
