"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakePlatformAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const base_adapter_1 = require("./base-adapter");
const circuit_breaker_1 = require("../../lib/circuit-breaker");
class MakePlatformAdapter extends base_adapter_1.BasePlatformAdapter {
    constructor(config) {
        super(config);
        this.validateConfig();
        this.httpClient = axios_1.default.create({
            baseURL: this.config.baseUrl || 'https://eu1.make.com/api/v2',
            timeout: this.config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Cubcen/1.0.0'
            }
        });
        this.circuitBreaker = (0, circuit_breaker_1.createPlatformCircuitBreaker)({
            failureThreshold: this.config.circuitBreakerThreshold || 3,
            recoveryTimeout: 30000,
            monitoringPeriod: 5000
        });
        this.setupHttpInterceptors();
    }
    getPlatformType() {
        return 'make';
    }
    async authenticate(credentials) {
        try {
            const makeCreds = credentials;
            if (makeCreds.apiToken) {
                this.httpClient.defaults.headers.common['Authorization'] = `Token ${makeCreds.apiToken}`;
                this.teamId = makeCreds.teamId;
                await this.circuitBreaker.execute(async () => {
                    const response = await this.httpClient.get('/scenarios');
                    return response.data;
                });
                return {
                    success: true,
                    token: makeCreds.apiToken
                };
            }
            if (makeCreds.accessToken) {
                this.accessToken = makeCreds.accessToken;
                this.refreshToken = makeCreds.refreshToken;
                this.teamId = makeCreds.teamId;
                this.tokenExpiresAt = new Date(Date.now() + 3600 * 1000);
                this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
                await this.circuitBreaker.execute(async () => {
                    const response = await this.httpClient.get('/scenarios');
                    return response.data;
                });
                return {
                    success: true,
                    token: this.accessToken,
                    expiresAt: this.tokenExpiresAt
                };
            }
            if (makeCreds.clientId && makeCreds.clientSecret && makeCreds.refreshToken) {
                const tokenResponse = await this.refreshAccessToken(makeCreds.clientId, makeCreds.clientSecret, makeCreds.refreshToken);
                this.accessToken = tokenResponse.access_token;
                this.refreshToken = tokenResponse.refresh_token;
                this.tokenExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);
                this.teamId = makeCreds.teamId;
                this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
                return {
                    success: true,
                    token: this.accessToken,
                    expiresAt: this.tokenExpiresAt
                };
            }
            throw new Error('Invalid credentials provided. Requires apiToken or OAuth credentials.');
        }
        catch (error) {
            const errorMessage = this.extractErrorMessage(error);
            this.setLastError(new Error(`Authentication failed: ${errorMessage}`));
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    async discoverAgents() {
        try {
            const scenarios = await this.circuitBreaker.execute(async () => {
                const params = {};
                if (this.teamId) {
                    params.teamId = this.teamId;
                }
                const response = await this.httpClient.get('/scenarios', {
                    params: Object.keys(params).length > 0 ? params : undefined
                });
                return response.data;
            });
            const agents = [];
            for (const scenario of scenarios) {
                const agent = await this.convertScenarioToAgent(scenario);
                agents.push(agent);
            }
            return agents;
        }
        catch (error) {
            const errorMessage = this.extractErrorMessage(error);
            this.setLastError(new Error(`Failed to discover agents: ${errorMessage}`));
            throw error;
        }
    }
    async getAgentStatus(agentId) {
        try {
            const scenario = await this.circuitBreaker.execute(async () => {
                const response = await this.httpClient.get(`/scenarios/${agentId}`, {
                    params: this.teamId ? { teamId: this.teamId } : undefined
                });
                return response.data;
            });
            const executions = await this.circuitBreaker.execute(async () => {
                const response = await this.httpClient.get(`/scenarios/${agentId}/executions`, {
                    params: {
                        limit: 10,
                        ...(this.teamId ? { teamId: this.teamId } : {})
                    }
                });
                return response.data;
            });
            const metrics = this.calculateAgentMetrics(executions);
            const status = this.determineAgentStatus(scenario, executions);
            return {
                id: agentId,
                status,
                lastSeen: new Date(),
                currentTask: this.getCurrentTask(executions),
                metrics
            };
        }
        catch (error) {
            const errorMessage = this.extractErrorMessage(error);
            this.setLastError(new Error(`Failed to get agent status: ${errorMessage}`));
            return {
                id: agentId,
                status: 'error',
                lastSeen: new Date(),
                metrics: {
                    tasksCompleted: 0,
                    averageExecutionTime: 0,
                    errorRate: 1
                }
            };
        }
    }
    async executeAgent(agentId, params) {
        const startTime = Date.now();
        try {
            const execution = await this.circuitBreaker.execute(async () => {
                const response = await this.httpClient.post(`/scenarios/${agentId}/run`, {
                    data: params,
                    ...(this.teamId ? { teamId: this.teamId } : {})
                });
                return response.data;
            });
            const result = await this.waitForExecutionCompletion(execution.id);
            return {
                success: result.status === 'success',
                data: result,
                error: result.status === 'error' ? result.error?.message : undefined,
                executionTime: result.execution_time || (Date.now() - startTime),
                timestamp: new Date()
            };
        }
        catch (error) {
            const errorMessage = this.extractErrorMessage(error);
            this.setLastError(new Error(`Failed to execute agent: ${errorMessage}`));
            return {
                success: false,
                error: errorMessage,
                executionTime: Date.now() - startTime,
                timestamp: new Date()
            };
        }
    }
    async subscribeToEvents(callback) {
        this.addEventCallback(callback);
        this.startEventPolling();
    }
    async unsubscribeFromEvents(callback) {
        this.removeEventCallback(callback);
    }
    async healthCheck() {
        const startTime = Date.now();
        try {
            await this.circuitBreaker.execute(async () => {
                const response = await this.httpClient.get('/scenarios', {
                    params: {
                        limit: 1,
                        ...(this.teamId ? { teamId: this.teamId } : {})
                    }
                });
                return response.data;
            });
            const responseTime = Date.now() - startTime;
            return {
                status: 'healthy',
                lastCheck: new Date(),
                responseTime,
                details: {
                    circuitBreakerState: this.circuitBreaker.getStats().state,
                    authenticated: !!this.accessToken || !!this.httpClient.defaults.headers.common['Authorization'],
                    tokenExpiry: this.tokenExpiresAt?.toISOString()
                }
            };
        }
        catch (error) {
            const errorMessage = this.extractErrorMessage(error);
            return {
                status: 'unhealthy',
                lastCheck: new Date(),
                responseTime: Date.now() - startTime,
                error: errorMessage,
                details: {
                    circuitBreakerState: this.circuitBreaker.getStats().state
                }
            };
        }
    }
    async connect() {
        try {
            if (this.config.credentials) {
                const authResult = await this.authenticate(this.config.credentials);
                if (!authResult.success) {
                    throw new Error(authResult.error || 'Authentication failed');
                }
            }
            const health = await this.healthCheck();
            if (health.status !== 'healthy') {
                throw new Error(health.error || 'Health check failed');
            }
            this.setConnected(true);
            return {
                connected: true,
                lastConnected: new Date()
            };
        }
        catch (error) {
            const errorMessage = this.extractErrorMessage(error);
            this.setLastError(new Error(`Connection failed: ${errorMessage}`));
            this.setConnected(false);
            return {
                connected: false,
                error: errorMessage
            };
        }
    }
    async disconnect() {
        this.setConnected(false);
        this.accessToken = undefined;
        this.refreshToken = undefined;
        this.tokenExpiresAt = undefined;
        this.teamId = undefined;
        delete this.httpClient.defaults.headers.common['Authorization'];
    }
    async refreshAccessToken(clientId, clientSecret, refreshToken) {
        try {
            const response = await axios_1.default.post('https://eu1.make.com/oauth/token', {
                grant_type: 'refresh_token',
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to refresh access token: ${this.extractErrorMessage(error)}`);
        }
    }
    setupHttpInterceptors() {
        this.httpClient.interceptors.request.use((config) => {
            if (this.tokenExpiresAt && this.refreshToken && new Date() >= this.tokenExpiresAt) {
                console.warn('Token expired, refresh needed');
            }
            config.metadata = { startTime: Date.now() };
            return config;
        }, (error) => Promise.reject(error));
        this.httpClient.interceptors.response.use((response) => response, async (error) => {
            if (error.response?.status === 401) {
                this.accessToken = undefined;
                this.tokenExpiresAt = undefined;
                delete this.httpClient.defaults.headers.common['Authorization'];
            }
            if (error.response?.status === 429) {
                const retryAfter = error.response.headers?.['retry-after'];
                if (retryAfter) {
                    const delay = parseInt(retryAfter) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            return Promise.reject(error);
        });
    }
    async convertScenarioToAgent(scenario) {
        const capabilities = this.extractCapabilities(scenario);
        let status;
        if (scenario.is_locked) {
            status = 'maintenance';
        }
        else if (scenario.is_active) {
            status = 'active';
        }
        else {
            status = 'inactive';
        }
        return {
            id: scenario.id.toString(),
            name: scenario.name,
            platformId: this.config.id,
            platformType: 'make',
            status,
            capabilities,
            configuration: {
                folderId: scenario.folder_id,
                teamId: scenario.team_id,
                scheduling: scenario.scheduling,
                moduleCount: scenario.blueprint?.flow?.length || 0,
                isLocked: scenario.is_locked
            },
            healthStatus: {
                status: 'healthy',
                lastCheck: new Date()
            },
            createdAt: new Date(scenario.created_at),
            updatedAt: new Date(scenario.updated_at)
        };
    }
    extractCapabilities(scenario) {
        const capabilities = [];
        if (scenario.blueprint?.flow) {
            const moduleTypes = new Set(scenario.blueprint.flow.map(module => module.module));
            capabilities.push(...Array.from(moduleTypes));
        }
        if (scenario.scheduling) {
            capabilities.push(`scheduling:${scenario.scheduling.type}`);
        }
        if (scenario.is_active) {
            capabilities.push('active');
        }
        return capabilities;
    }
    calculateAgentMetrics(executions) {
        if (!executions || executions.length === 0) {
            return {
                tasksCompleted: 0,
                averageExecutionTime: 0,
                errorRate: 0
            };
        }
        const completedExecutions = executions.filter(e => e.finished_at);
        const errorExecutions = executions.filter(e => e.status === 'error');
        const totalExecutionTime = completedExecutions.reduce((sum, execution) => {
            return sum + (execution.execution_time || 0);
        }, 0);
        return {
            tasksCompleted: completedExecutions.length,
            averageExecutionTime: completedExecutions.length > 0 ? totalExecutionTime / completedExecutions.length : 0,
            errorRate: executions.length > 0 ? errorExecutions.length / executions.length : 0
        };
    }
    determineAgentStatus(scenario, executions) {
        if (scenario.is_locked) {
            return 'maintenance';
        }
        if (!scenario.is_active) {
            return 'inactive';
        }
        const recentExecutions = executions.slice(0, 5);
        const recentErrors = recentExecutions.filter(e => e.status === 'error');
        if (recentErrors.length >= 3) {
            return 'error';
        }
        return 'active';
    }
    getCurrentTask(executions) {
        const runningExecution = executions.find(e => !e.finished_at && e.started_at);
        return runningExecution ? `Execution ${runningExecution.id}` : undefined;
    }
    async waitForExecutionCompletion(executionId, maxWaitTime = 300000) {
        const startTime = Date.now();
        const pollInterval = 2000;
        while (Date.now() - startTime < maxWaitTime) {
            try {
                const execution = await this.circuitBreaker.execute(async () => {
                    const response = await this.httpClient.get(`/executions/${executionId}`, {
                        params: this.teamId ? { teamId: this.teamId } : undefined
                    });
                    return response.data;
                });
                if (execution.finished_at) {
                    return execution;
                }
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            }
            catch (error) {
                throw error;
            }
        }
        throw new Error(`Execution ${executionId} timed out after ${maxWaitTime}ms`);
    }
    startEventPolling() {
        setInterval(async () => {
            try {
                const executions = await this.circuitBreaker.execute(async () => {
                    const response = await this.httpClient.get('/executions', {
                        params: {
                            limit: 10,
                            ...(this.teamId ? { teamId: this.teamId } : {})
                        }
                    });
                    return response.data;
                });
                executions.forEach((execution) => {
                    if (execution.finished_at) {
                        const event = {
                            type: execution.status === 'success' ? 'task_completed' : 'error_occurred',
                            agentId: execution.scenario_id.toString(),
                            data: execution,
                            timestamp: new Date(execution.finished_at)
                        };
                        this.emitEvent(event);
                    }
                });
            }
            catch (error) {
                console.error('Error polling Make.com executions:', error);
            }
        }, 30000);
    }
    extractErrorMessage(error) {
        if (error && typeof error === 'object') {
            const axiosError = error;
            if (axiosError.response && typeof axiosError.response === 'object') {
                const response = axiosError.response;
                if (response.data && typeof response.data === 'object') {
                    const data = response.data;
                    if (typeof data.message === 'string') {
                        return data.message;
                    }
                    if (typeof data.error === 'string') {
                        return data.error;
                    }
                }
                if (typeof response.statusText === 'string' && typeof response.status === 'number') {
                    return `HTTP ${response.status}: ${response.statusText}`;
                }
            }
            if (typeof axiosError.code === 'string') {
                return `Network error: ${axiosError.code}`;
            }
            if (typeof axiosError.message === 'string') {
                return axiosError.message;
            }
        }
        if (error instanceof Error) {
            return error.message;
        }
        return 'Unknown error occurred';
    }
    validateConfig() {
        super.validateConfig();
        if (!this.config.credentials) {
            throw new Error('Make.com adapter requires credentials configuration');
        }
        const creds = this.config.credentials;
        if (!creds.apiToken && !creds.accessToken && !(creds.clientId && creds.clientSecret)) {
            throw new Error('Make.com adapter requires either apiToken, accessToken, or OAuth client credentials');
        }
    }
}
exports.MakePlatformAdapter = MakePlatformAdapter;
//# sourceMappingURL=make-adapter.js.map