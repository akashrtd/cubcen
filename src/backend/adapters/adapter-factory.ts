/**
 * Platform Adapter Factory for Cubcen
 * Provides dynamic loading and creation of platform adapters
 */

import { BasePlatformAdapter } from './base-adapter'
import { MockPlatformAdapter } from './mock-adapter'
import { N8nPlatformAdapter } from './n8n-adapter'
import { MakePlatformAdapter } from './make-adapter'
import {
  PlatformConfig,
  PlatformType,
  HealthStatus,
} from '../../types/platform'

export type AdapterConstructor = new (
  config: PlatformConfig
) => BasePlatformAdapter

export class AdapterFactory {
  private static adapters: Map<PlatformType, AdapterConstructor> = new Map()
  private static instances: Map<string, BasePlatformAdapter> = new Map()

  /**
   * Register a platform adapter
   */
  static registerAdapter(
    type: PlatformType,
    adapterClass: AdapterConstructor
  ): void {
    this.adapters.set(type, adapterClass)
  }

  /**
   * Create a new adapter instance
   */
  static createAdapter(config: PlatformConfig): BasePlatformAdapter {
    const AdapterClass = this.adapters.get(config.type)

    if (!AdapterClass) {
      throw new Error(`No adapter registered for platform type: ${config.type}`)
    }

    const adapter = new AdapterClass(config)
    this.instances.set(config.id, adapter)

    return adapter
  }

  /**
   * Get an existing adapter instance
   */
  static getAdapter(platformId: string): BasePlatformAdapter | undefined {
    return this.instances.get(platformId)
  }

  /**
   * Get or create an adapter instance
   */
  static getOrCreateAdapter(config: PlatformConfig): BasePlatformAdapter {
    const existing = this.instances.get(config.id)
    if (existing) {
      // Update configuration if it has changed
      existing.updateConfig(config)
      return existing
    }

    return this.createAdapter(config)
  }

  /**
   * Remove an adapter instance
   */
  static async removeAdapter(platformId: string): Promise<void> {
    const adapter = this.instances.get(platformId)
    if (adapter) {
      try {
        await adapter.disconnect()
      } catch (error) {
        console.error(`Error disconnecting adapter ${platformId}:`, error)
      }
      this.instances.delete(platformId)
    }
  }

  /**
   * Get all registered adapter types
   */
  static getRegisteredTypes(): PlatformType[] {
    return Array.from(this.adapters.keys())
  }

  /**
   * Get all active adapter instances
   */
  static getAllAdapters(): Map<string, BasePlatformAdapter> {
    return new Map(this.instances)
  }

  /**
   * Check if an adapter type is registered
   */
  static isAdapterRegistered(type: PlatformType): boolean {
    return this.adapters.has(type)
  }

  /**
   * Clear all adapter instances (useful for testing)
   */
  static clearInstances(): void {
    this.instances.clear()
  }

  /**
   * Initialize default adapters
   */
  static initializeDefaultAdapters(): void {
    // Register real adapters
    this.registerAdapter('n8n', N8nPlatformAdapter as AdapterConstructor)
    this.registerAdapter('make', MakePlatformAdapter as AdapterConstructor)

    // Register mock adapters for platforms not yet implemented
    this.registerAdapter('zapier', MockPlatformAdapter as AdapterConstructor)
  }
}

/**
 * Adapter Manager for handling multiple platform connections
 */
export class AdapterManager {
  private adapters: Map<string, BasePlatformAdapter> = new Map()

  /**
   * Add a platform configuration and create adapter
   */
  async addPlatform(config: PlatformConfig): Promise<BasePlatformAdapter> {
    const adapter = AdapterFactory.createAdapter(config)
    this.adapters.set(config.id, adapter)

    try {
      await adapter.connect()
      return adapter
    } catch (error) {
      this.adapters.delete(config.id)
      throw error
    }
  }

  /**
   * Remove a platform and disconnect adapter
   */
  async removePlatform(platformId: string): Promise<void> {
    const adapter = this.adapters.get(platformId)
    if (adapter) {
      await adapter.disconnect()
      this.adapters.delete(platformId)
    }
    await AdapterFactory.removeAdapter(platformId)
  }

  /**
   * Get an adapter by platform ID
   */
  getAdapter(platformId: string): BasePlatformAdapter | undefined {
    return this.adapters.get(platformId)
  }

  /**
   * Get all adapters
   */
  getAllAdapters(): BasePlatformAdapter[] {
    return Array.from(this.adapters.values())
  }

  /**
   * Get adapters by type
   */
  getAdaptersByType(type: PlatformType): BasePlatformAdapter[] {
    return Array.from(this.adapters.values()).filter(
      adapter => adapter.getPlatformType() === type
    )
  }

  /**
   * Check health of all adapters
   */
  async checkAllAdaptersHealth(): Promise<
    Map<
      string,
      HealthStatus | { status: 'unhealthy'; error: string; lastCheck: Date }
    >
  > {
    const healthResults = new Map()

    for (const [platformId, adapter] of Array.from(this.adapters.entries())) {
      try {
        const health = await adapter.healthCheck()
        healthResults.set(platformId, health)
      } catch (error) {
        healthResults.set(platformId, {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date(),
        })
      }
    }

    return healthResults
  }

  /**
   * Register an adapter for testing purposes
   */
  registerAdapter(platformId: string, adapter: BasePlatformAdapter): void {
    this.adapters.set(platformId, adapter)
  }

  /**
   * Disconnect all adapters
   */
  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.adapters.values()).map(adapter =>
      adapter
        .disconnect()
        .catch(error => console.error('Error disconnecting adapter:', error))
    )

    await Promise.all(disconnectPromises)
    this.adapters.clear()
  }
}

// Initialize default adapters when module is loaded
AdapterFactory.initializeDefaultAdapters()
