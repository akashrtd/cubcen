"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CubcenClient = void 0;
const axios_1 = __importDefault(require("axios"));
const errors_1 = require("./errors");
class CubcenClient {
    constructor(config) {
        this.http = axios_1.default.create({
            baseURL: config.baseUrl,
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Cubcen-SDK/1.0.0'
            }
        });
        this.http.interceptors.request.use((config) => {
            if (this.accessToken) {
                config.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            return config;
        });
        this.http.interceptors.response.use((response) => response, async (error) => {
            if (error.code === 'ECONNABORTED') {
                throw new errors_1.CubcenTimeoutError('Request timeout');
            }
            if (!error.response) {
                throw new errors_1.CubcenNetworkError('Network error: ' + error.message);
            }
            const { status, data } = error.response;
            const errorData = data?.error || {};
            throw (0, errors_1.createCubcenError)(status, errorData.message || 'Unknown error', errorData.code || 'UNKNOWN_ERROR', errorData.requestId, errorData.details);
        });
    }
    setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
    clearTokens() {
        this.accessToken = undefined;
        this.refreshToken = undefined;
    }
    async request(config) {
        try {
            const response = await this.http.request(config);
            if (!response.data.success) {
                throw new errors_1.CubcenError(response.data.error?.message || 'API request failed', response.data.error?.code || 'API_ERROR', response.status, response.data.error?.requestId, response.data.error?.details);
            }
            return response.data.data;
        }
        catch (error) {
            if (error instanceof errors_1.CubcenError) {
                throw error;
            }
            throw new errors_1.CubcenError('Unexpected error: ' + error.message);
        }
    }
    async login(credentials) {
        const result = await this.request({
            method: 'POST',
            url: '/api/cubcen/v1/auth/login',
            data: credentials
        });
        this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
        return result;
    }
    async register(data) {
        const result = await this.request({
            method: 'POST',
            url: '/api/cubcen/v1/auth/register',
            data
        });
        this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
        return result;
    }
    async getCurrentUser() {
        const result = await this.request({
            method: 'GET',
            url: '/api/cubcen/v1/auth/me'
        });
        return result.user;
    }
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new errors_1.CubcenError('No refresh token available');
        }
        const result = await this.request({
            method: 'POST',
            url: '/api/cubcen/v1/auth/refresh',
            data: { refreshToken: this.refreshToken }
        });
        this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
        return result;
    }
    async logout() {
        await this.request({
            method: 'POST',
            url: '/api/cubcen/v1/auth/logout'
        });
        this.clearTokens();
    }
    async getAgents(filters) {
        return this.request({
            method: 'GET',
            url: '/api/cubcen/v1/agents',
            params: filters
        });
    }
    async getAgent(id) {
        const result = await this.request({
            method: 'GET',
            url: `/api/cubcen/v1/agents/${id}`
        });
        return result.agent;
    }
    async createAgent(data) {
        const result = await this.request({
            method: 'POST',
            url: '/api/cubcen/v1/agents',
            data
        });
        return result.agent;
    }
    async updateAgent(id, data) {
        const result = await this.request({
            method: 'PUT',
            url: `/api/cubcen/v1/agents/${id}`,
            data
        });
        return result.agent;
    }
    async deleteAgent(id) {
        await this.request({
            method: 'DELETE',
            url: `/api/cubcen/v1/agents/${id}`
        });
    }
    async getAgentHealth(id) {
        return this.request({
            method: 'GET',
            url: `/api/cubcen/v1/agents/${id}/health`
        });
    }
    async getTasks(filters) {
        return this.request({
            method: 'GET',
            url: '/api/cubcen/v1/tasks',
            params: filters
        });
    }
    async getTask(id) {
        const result = await this.request({
            method: 'GET',
            url: `/api/cubcen/v1/tasks/${id}`
        });
        return result.task;
    }
    async createTask(data) {
        const result = await this.request({
            method: 'POST',
            url: '/api/cubcen/v1/tasks',
            data
        });
        return result.task;
    }
    async cancelTask(id) {
        const result = await this.request({
            method: 'POST',
            url: `/api/cubcen/v1/tasks/${id}/cancel`
        });
        return result.task;
    }
    async retryTask(id) {
        const result = await this.request({
            method: 'POST',
            url: `/api/cubcen/v1/tasks/${id}/retry`
        });
        return result.task;
    }
    async getPlatforms() {
        const result = await this.request({
            method: 'GET',
            url: '/api/cubcen/v1/platforms'
        });
        return result.platforms;
    }
    async getPlatform(id) {
        const result = await this.request({
            method: 'GET',
            url: `/api/cubcen/v1/platforms/${id}`
        });
        return result.platform;
    }
    async createPlatform(data) {
        const result = await this.request({
            method: 'POST',
            url: '/api/cubcen/v1/platforms',
            data
        });
        return result.platform;
    }
    async updatePlatform(id, data) {
        const result = await this.request({
            method: 'PUT',
            url: `/api/cubcen/v1/platforms/${id}`,
            data
        });
        return result.platform;
    }
    async deletePlatform(id) {
        await this.request({
            method: 'DELETE',
            url: `/api/cubcen/v1/platforms/${id}`
        });
    }
    async testPlatformConnection(id) {
        return this.request({
            method: 'POST',
            url: `/api/cubcen/v1/platforms/${id}/test`
        });
    }
    async getSystemHealth() {
        return this.request({
            method: 'GET',
            url: '/health'
        });
    }
    async getAnalytics(filters) {
        return this.request({
            method: 'GET',
            url: '/api/cubcen/v1/analytics',
            params: filters
        });
    }
    async getNotifications() {
        const result = await this.request({
            method: 'GET',
            url: '/api/cubcen/v1/notifications'
        });
        return result.notifications;
    }
    async markNotificationRead(id) {
        await this.request({
            method: 'PUT',
            url: `/api/cubcen/v1/notifications/${id}/read`
        });
    }
    async getNotificationPreferences() {
        const result = await this.request({
            method: 'GET',
            url: '/api/cubcen/v1/notifications/preferences'
        });
        return result.preferences;
    }
    async updateNotificationPreferences(preferences) {
        const result = await this.request({
            method: 'PUT',
            url: '/api/cubcen/v1/notifications/preferences',
            data: preferences
        });
        return result.preferences;
    }
}
exports.CubcenClient = CubcenClient;
//# sourceMappingURL=client.js.map