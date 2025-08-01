"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPlatformAdapter = void 0;
const base_adapter_1 = require("./base-adapter");
class MockPlatformAdapter extends base_adapter_1.BasePlatformAdapter {
    constructor(config) {
        super(config);
        this.mockAgents = [];
        this.mockDelay = 100;
        this.shouldFailAuth = false;
        this.shouldFailHealthCheck = false;
        this.shouldFailExecution = false;
        this.initializeMockData();
    }
    getPlatformType() {
        return this.config.type;
    }
    async authenticate(_credentials) {
        await this.delay();
        if (this.shouldFailAuth) {
            return {
                success: false,
                error: 'Mock authentication failure'
            };
        }
        return {
            success: true,
            token: 'mock-token-' + Date.now(),
            expiresAt: new Date(Date.now() + 3600000)
        };
    }
    async discoverAgents() {
        await this.delay();
        return [...this.mockAgents];
    }
    async getAgentStatus(agentId) {
        await this.delay();
        const agent = this.mockAgents.find(a => a.id === agentId);
        if (!agent) {
            throw new Error(`Agent not found: ${agentId}`);
        }
        return {
            id: agentId,
            status: agent.status,
            lastSeen: new Date(),
            currentTask: Math.random() > 0.7 ? 'mock-task-' + Date.now() : undefined,
            metrics: {
                tasksCompleted: Math.floor(Math.random() * 100),
                averageExecutionTime: Math.floor(Math.random() * 5000),
                errorRate: Math.random() * 0.1
            }
        };
    }
    async executeAgent(agentId, params) {
        const startTime = Date.now();
        await this.delay();
        if (this.shouldFailExecution) {
            return {
                success: false,
                error: 'Mock execution failure',
                executionTime: Date.now() - startTime,
                timestamp: new Date()
            };
        }
        this.emitEvent({
            type: 'task_completed',
            agentId,
            data: { params, result: 'success' },
            timestamp: new Date()
        });
        return {
            success: true,
            data: {
                result: 'Mock execution successful',
                params,
                agentId,
                executionId: 'mock-exec-' + Date.now()
            },
            executionTime: Date.now() - startTime,
            timestamp: new Date()
        };
    }
    async subscribeToEvents(callback) {
        this.addEventCallback(callback);
        if (!this.eventInterval) {
            this.eventInterval = setInterval(() => {
                if (this.mockAgents.length > 0) {
                    const randomAgent = this.mockAgents[Math.floor(Math.random() * this.mockAgents.length)];
                    const eventTypes = ['agent_status_changed', 'task_completed', 'error_occurred'];
                    const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                    this.emitEvent({
                        type: randomEventType,
                        agentId: randomAgent.id,
                        data: { message: `Mock ${randomEventType} event` },
                        timestamp: new Date()
                    });
                }
            }, 1000);
        }
    }
    async unsubscribeFromEvents(callback) {
        this.removeEventCallback(callback);
        if (this.eventCallbacks.length === 0 && this.eventInterval) {
            clearInterval(this.eventInterval);
            this.eventInterval = undefined;
        }
    }
    async healthCheck() {
        const startTime = Date.now();
        await this.delay();
        if (this.shouldFailHealthCheck) {
            return {
                status: 'unhealthy',
                lastCheck: new Date(),
                responseTime: Date.now() - startTime,
                error: 'Mock health check failure'
            };
        }
        return {
            status: 'healthy',
            lastCheck: new Date(),
            responseTime: Date.now() - startTime,
            details: {
                platform: this.config.type,
                agentCount: this.mockAgents.length,
                mockAdapter: true
            }
        };
    }
    async connect() {
        await this.delay();
        try {
            const authResult = await this.authenticate(this.config.credentials);
            if (!authResult.success) {
                throw new Error(authResult.error || 'Authentication failed');
            }
            this.setConnected(true);
            return {
                connected: true,
                lastConnected: new Date()
            };
        }
        catch (error) {
            this.setConnected(false);
            this.setLastError(error);
            return {
                connected: false,
                error: error instanceof Error ? error.message : 'Connection failed'
            };
        }
    }
    async disconnect() {
        await this.delay();
        if (this.eventInterval) {
            clearInterval(this.eventInterval);
            this.eventInterval = undefined;
        }
        this.setConnected(false);
    }
    setMockDelay(delay) {
        this.mockDelay = delay;
    }
    setShouldFailAuth(shouldFail) {
        this.shouldFailAuth = shouldFail;
    }
    setShouldFailHealthCheck(shouldFail) {
        this.shouldFailHealthCheck = shouldFail;
    }
    setShouldFailExecution(shouldFail) {
        this.shouldFailExecution = shouldFail;
    }
    addMockAgent(agent) {
        const mockAgent = {
            id: agent.id || 'mock-agent-' + Date.now(),
            name: agent.name || 'Mock Agent',
            platformId: this.config.id,
            platformType: this.config.type,
            status: agent.status || 'active',
            capabilities: agent.capabilities || ['mock-capability'],
            configuration: agent.configuration || {},
            healthStatus: agent.healthStatus || {
                status: 'healthy',
                lastCheck: new Date()
            },
            createdAt: agent.createdAt || new Date(),
            updatedAt: agent.updatedAt || new Date()
        };
        this.mockAgents.push(mockAgent);
    }
    clearMockAgents() {
        this.mockAgents = [];
    }
    async delay() {
        return new Promise(resolve => setTimeout(resolve, this.mockDelay));
    }
    initializeMockData() {
        for (let i = 1; i <= 3; i++) {
            this.addMockAgent({
                id: `mock-agent-${i}`,
                name: `Mock Agent ${i}`,
                status: i === 3 ? 'error' : 'active',
                capabilities: [`capability-${i}`, 'mock-capability'],
                configuration: {
                    setting1: `value${i}`,
                    setting2: i * 10
                }
            });
        }
    }
}
exports.MockPlatformAdapter = MockPlatformAdapter;
//# sourceMappingURL=mock-adapter.js.map