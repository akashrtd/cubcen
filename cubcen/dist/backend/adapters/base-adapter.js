"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePlatformAdapter = void 0;
class BasePlatformAdapter {
    constructor(config) {
        this.isConnected = false;
        this.eventCallbacks = [];
        this.config = config;
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    isAdapterConnected() {
        return this.isConnected;
    }
    getLastError() {
        return this.lastError;
    }
    setConnected(connected) {
        this.isConnected = connected;
    }
    setLastError(error) {
        this.lastError = error;
    }
    emitEvent(event) {
        this.eventCallbacks.forEach(callback => {
            try {
                callback(event);
            }
            catch (error) {
                console.error('Error in event callback:', error);
            }
        });
    }
    addEventCallback(callback) {
        this.eventCallbacks.push(callback);
    }
    removeEventCallback(callback) {
        const index = this.eventCallbacks.indexOf(callback);
        if (index > -1) {
            this.eventCallbacks.splice(index, 1);
        }
    }
    validateConfig() {
        if (!this.config.id) {
            throw new Error('Platform configuration must have an id');
        }
        if (!this.config.name) {
            throw new Error('Platform configuration must have a name');
        }
        if (!this.config.type) {
            throw new Error('Platform configuration must have a type');
        }
        if (!this.config.baseUrl) {
            throw new Error('Platform configuration must have a baseUrl');
        }
    }
}
exports.BasePlatformAdapter = BasePlatformAdapter;
//# sourceMappingURL=base-adapter.js.map