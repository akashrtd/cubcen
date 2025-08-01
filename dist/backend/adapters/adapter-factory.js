"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterManager = exports.AdapterFactory = void 0;
const mock_adapter_1 = require("./mock-adapter");
const n8n_adapter_1 = require("./n8n-adapter");
const make_adapter_1 = require("./make-adapter");
class AdapterFactory {
    static registerAdapter(type, adapterClass) {
        this.adapters.set(type, adapterClass);
    }
    static createAdapter(config) {
        const AdapterClass = this.adapters.get(config.type);
        if (!AdapterClass) {
            throw new Error(`No adapter registered for platform type: ${config.type}`);
        }
        const adapter = new AdapterClass(config);
        this.instances.set(config.id, adapter);
        return adapter;
    }
    static getAdapter(platformId) {
        return this.instances.get(platformId);
    }
    static getOrCreateAdapter(config) {
        const existing = this.instances.get(config.id);
        if (existing) {
            existing.updateConfig(config);
            return existing;
        }
        return this.createAdapter(config);
    }
    static async removeAdapter(platformId) {
        const adapter = this.instances.get(platformId);
        if (adapter) {
            try {
                await adapter.disconnect();
            }
            catch (error) {
                console.error(`Error disconnecting adapter ${platformId}:`, error);
            }
            this.instances.delete(platformId);
        }
    }
    static getRegisteredTypes() {
        return Array.from(this.adapters.keys());
    }
    static getAllAdapters() {
        return new Map(this.instances);
    }
    static isAdapterRegistered(type) {
        return this.adapters.has(type);
    }
    static clearInstances() {
        this.instances.clear();
    }
    static initializeDefaultAdapters() {
        this.registerAdapter('n8n', n8n_adapter_1.N8nPlatformAdapter);
        this.registerAdapter('make', make_adapter_1.MakePlatformAdapter);
        this.registerAdapter('zapier', mock_adapter_1.MockPlatformAdapter);
    }
}
exports.AdapterFactory = AdapterFactory;
AdapterFactory.adapters = new Map();
AdapterFactory.instances = new Map();
class AdapterManager {
    constructor() {
        this.adapters = new Map();
    }
    async addPlatform(config) {
        const adapter = AdapterFactory.createAdapter(config);
        this.adapters.set(config.id, adapter);
        try {
            await adapter.connect();
            return adapter;
        }
        catch (error) {
            this.adapters.delete(config.id);
            throw error;
        }
    }
    async removePlatform(platformId) {
        const adapter = this.adapters.get(platformId);
        if (adapter) {
            await adapter.disconnect();
            this.adapters.delete(platformId);
        }
        await AdapterFactory.removeAdapter(platformId);
    }
    getAdapter(platformId) {
        return this.adapters.get(platformId);
    }
    getAllAdapters() {
        return Array.from(this.adapters.values());
    }
    getAdaptersByType(type) {
        return Array.from(this.adapters.values())
            .filter(adapter => adapter.getPlatformType() === type);
    }
    async checkAllAdaptersHealth() {
        const healthResults = new Map();
        for (const [platformId, adapter] of Array.from(this.adapters.entries())) {
            try {
                const health = await adapter.healthCheck();
                healthResults.set(platformId, health);
            }
            catch (error) {
                healthResults.set(platformId, {
                    status: 'unhealthy',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    lastCheck: new Date()
                });
            }
        }
        return healthResults;
    }
    async disconnectAll() {
        const disconnectPromises = Array.from(this.adapters.values())
            .map(adapter => adapter.disconnect().catch(error => console.error('Error disconnecting adapter:', error)));
        await Promise.all(disconnectPromises);
        this.adapters.clear();
    }
}
exports.AdapterManager = AdapterManager;
AdapterFactory.initializeDefaultAdapters();
//# sourceMappingURL=adapter-factory.js.map