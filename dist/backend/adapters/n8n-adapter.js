"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nPlatformAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const base_adapter_1 = require("./base-adapter");
const circuit_breaker_1 = require("../../lib/circuit-breaker");
class N8nPlatformAdapter extends base_adapter_1.BasePlatformAdapter {
    constructor(config) {
        super(config);
        this.validateConfig();
        this.httpClient = axios_1.default.create({
            baseURL: this.config.baseUrl,
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
        return 'n8n';
    }
    async authenticate(credentials) {
        try {
            const n8nCreds = credentials;
            if (n8nCreds.apiKey) {
                this.httpClient.defaults.headers.common['X-N8N-API-KEY'] = n8nCreds.apiKey;
                await this.circuitBreaker.execute(async () => {
                    const response = await this.httpClient.get('/workflows');
                    return response.data;
                });
                return {
                    success: true,
                    token: n8nCreds.apiKey
                };
            }
            if (n8nCreds.email && n8nCreds.password) {
                const response = await this.circuitBreaker.execute(async () => {
                    return await this.httpClient.post('/login', {
                        email: n8nCreds.email,
                        password: n8nCreds.password
                    });
                });
                if (response.data && response.data.token) {
                    const authData = response.data;
                    this.authToken = authData.token;
                    this.tokenExpiresAt = new Date(Date.now() + (authData.expiresIn || 3600) * 1000);
                    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
                    return {
                        success: true,
                        token: this.authToken,
                        expiresAt: this.tokenExpiresAt
                    };
                }
            }
            throw new Error('Invalid credentials provided');
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
            const workflows = await this.circuitBreaker.execute(async () => {
                const response = await this.httpClient.get('/workflows');
                const data = response.data;
                return Array.isArray(data) ? data : data.data || [];
            });
            const agents = [];
            for (const workflow of workflows) {
                const agent = await this.convertWorkflowToAgent(workflow);
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
            const workflow = await this.circuitBreaker.execute(async () => {
                const response = await this.httpClient.get(`/workflows/${agentId}`);
                const data = response.data;
                return data.data || data;
            });
            const executions = await this.circuitBreaker.execute(async () => {
                const response = await this.httpClient.get(`/executions`, {
                    params: {
                        filter: JSON.stringify({ workflowId: agentId }),
                        limit: 10,
                        includeData: false
                    }
                });
                const data = response.data;
                return Array.isArray(data) ? data : data.data || [];
            });
            const metrics = this.calculateAgentMetrics(executions);
            const status = this.determineAgentStatus(workflow, executions);
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
                const response = await this.httpClient.post(`/workflows/${agentId}/execute`, {
                    data: params
                });
                const data = response.data;
                return data.data || data;
            });
            const result = await this.waitForExecutionCompletion(execution.id);
            return {
                success: result.status === 'success',
                data: result.data,
                error: result.status === 'error' ? result.error : undefined,
                executionTime: Date.now() - startTime,
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
                const response = await this.httpClient.get('/healthz');
                return response.data;
            });
            const responseTime = Date.now() - startTime;
            return {
                status: 'healthy',
                lastCheck: new Date(),
                responseTime,
                details: {
                    circuitBreakerState: this.circuitBreaker.getStats().state,
                    authenticated: !!this.authToken || !!this.httpClient.defaults.headers.common['X-N8N-API-KEY']
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
        this.authToken = undefined;
        this.tokenExpiresAt = undefined;
        delete this.httpClient.defaults.headers.common['Authorization'];
        delete this.httpClient.defaults.headers.common['X-N8N-API-KEY'];
    }
    setupHttpInterceptors() {
        this.httpClient.interceptors.request.use((config) => {
            config.metadata = { startTime: Date.now() };
            return config;
        }, (error) => Promise.reject(error));
        this.httpClient.interceptors.response.use((response) => response, async (error) => {
            if (error.response?.status === 401 && this.authToken) {
                this.authToken = undefined;
                this.tokenExpiresAt = undefined;
                delete this.httpClient.defaults.headers.common['Authorization'];
            }
            return Promise.reject(error);
        });
    }
    async convertWorkflowToAgent(workflow) {
        const capabilities = this.extractCapabilities(workflow);
        return {
            id: workflow.id,
            name: workflow.name,
            platformId: this.config.id,
            platformType: 'n8n',
            status: workflow.active ? 'active' : 'inactive',
            capabilities,
            configuration: {
                tags: workflow.tags || [],
                nodeCount: workflow.nodes?.length || 0,
                versionId: workflow.versionId,
                settings: workflow.settings || {}
            },
            healthStatus: {
                status: 'healthy',
                lastCheck: new Date()
            },
            createdAt: new Date(workflow.createdAt),
            updatedAt: new Date(workflow.updatedAt)
        };
    }
    extractCapabilities(workflow) {
        const capabilities = [];
        if (workflow.nodes) {
            const nodeTypes = new Set(workflow.nodes.map(node => node.type));
            capabilities.push(...Array.from(nodeTypes));
        }
        if (workflow.tags) {
            capabilities.push(...workflow.tags.map(tag => `tag:${tag}`));
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
        const completedExecutions = executions.filter(e => e.stoppedAt);
        const errorExecutions = executions.filter(e => e.status === 'error' || e.status === 'crashed');
        const totalExecutionTime = completedExecutions.reduce((sum, execution) => {
            const start = new Date(execution.startedAt).getTime();
            const end = new Date(execution.stoppedAt).getTime();
            return sum + (end - start);
        }, 0);
        return {
            tasksCompleted: completedExecutions.length,
            averageExecutionTime: completedExecutions.length > 0 ? totalExecutionTime / completedExecutions.length : 0,
            errorRate: executions.length > 0 ? errorExecutions.length / executions.length : 0
        };
    }
    determineAgentStatus(workflow, executions) {
        if (!workflow.active) {
            return 'inactive';
        }
        const recentExecutions = executions.slice(0, 5);
        const recentErrors = recentExecutions.filter(e => e.status === 'error' || e.status === 'crashed');
        if (recentErrors.length >= 3) {
            return 'error';
        }
        const runningExecutions = executions.filter(e => e.status === 'running');
        if (runningExecutions.length > 0) {
            return 'active';
        }
        return 'active';
    }
    getCurrentTask(executions) {
        const runningExecution = executions.find(e => e.status === 'running');
        return runningExecution ? `Execution ${runningExecution.id}` : undefined;
    }
    async waitForExecutionCompletion(executionId, maxWaitTime = 300000) {
        const startTime = Date.now();
        const pollInterval = 2000;
        while (Date.now() - startTime < maxWaitTime) {
            try {
                const execution = await this.circuitBreaker.execute(async () => {
                    const response = await this.httpClient.get(`/executions/${executionId}`);
                    const data = response.data;
                    return data.data || data;
                });
                if (execution.status !== 'running' && execution.status !== 'new') {
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
                            includeData: false
                        }
                    });
                    const data = response.data;
                    return Array.isArray(data) ? data : data.data || [];
                });
                executions.forEach((execution) => {
                    if (execution.status === 'success' || execution.status === 'error') {
                        const event = {
                            type: execution.status === 'success' ? 'task_completed' : 'error_occurred',
                            agentId: execution.workflowId,
                            data: execution,
                            timestamp: new Date(execution.stoppedAt || execution.startedAt)
                        };
                        this.emitEvent(event);
                    }
                });
            }
            catch (error) {
                console.error('Error polling n8n executions:', error);
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
            throw new Error('n8n adapter requires credentials configuration');
        }
        const creds = this.config.credentials;
        if (!creds.apiKey && !(creds.email && creds.password)) {
            throw new Error('n8n adapter requires either apiKey or email/password credentials');
        }
    }
}
exports.N8nPlatformAdapter = N8nPlatformAdapter;
//# sourceMappingURL=n8n-adapter.js.map