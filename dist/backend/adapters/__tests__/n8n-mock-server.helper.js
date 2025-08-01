"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockN8nServer = void 0;
const express_1 = __importDefault(require("express"));
class MockN8nServer {
    constructor(options = {}) {
        this.workflows = [];
        this.executions = [];
        this.isAuthenticated = false;
        this.validApiKey = 'test-api-key';
        this.validCredentials = { email: 'test@example.com', password: 'password123' };
        this.app = (0, express_1.default)();
        this.port = options.port || 5678;
        this.delay = options.delay || 0;
        this.failureRate = options.failureRate || 0;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupDefaultData();
    }
    setupMiddleware() {
        this.app.use(express_1.default.json());
        this.app.use((req, res, next) => {
            if (this.delay > 0) {
                setTimeout(next, this.delay);
            }
            else {
                next();
            }
        });
        this.app.use((_req, res, next) => {
            if (Math.random() < this.failureRate) {
                return res.status(500).json({ error: 'Simulated server error' });
            }
            next();
        });
        this.app.use((req, res, next) => {
            if (req.path === '/login' || req.path === '/healthz') {
                return next();
            }
            const apiKey = req.headers['x-n8n-api-key'];
            const authHeader = req.headers.authorization;
            if (apiKey === this.validApiKey) {
                this.isAuthenticated = true;
                return next();
            }
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                if (token === 'valid-jwt-token') {
                    this.isAuthenticated = true;
                    return next();
                }
            }
            return res.status(401).json({ error: 'Unauthorized' });
        });
    }
    setupRoutes() {
        this.app.get('/healthz', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });
        this.app.post('/login', (req, res) => {
            const { email, password } = req.body;
            if (email === this.validCredentials.email && password === this.validCredentials.password) {
                res.json({
                    token: 'valid-jwt-token',
                    expiresIn: 3600
                });
            }
            else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });
        this.app.get('/workflows', (req, res) => {
            res.json({ data: this.workflows });
        });
        this.app.get('/workflows/:id', (req, res) => {
            const workflow = this.workflows.find(w => w.id === req.params.id);
            if (workflow) {
                res.json({ data: workflow });
            }
            else {
                res.status(404).json({ error: 'Workflow not found' });
            }
        });
        this.app.post('/workflows/:id/execute', (req, res) => {
            const workflowId = req.params.id;
            const workflow = this.workflows.find(w => w.id === workflowId);
            if (!workflow) {
                return res.status(404).json({ error: 'Workflow not found' });
            }
            const executionId = `exec-${Date.now()}`;
            const execution = {
                id: executionId,
                workflowId,
                mode: 'manual',
                status: 'running',
                startedAt: new Date().toISOString(),
                workflowData: workflow,
                data: req.body.data
            };
            this.executions.push(execution);
            setTimeout(() => {
                const exec = this.executions.find(e => e.id === executionId);
                if (exec) {
                    exec.status = Math.random() > 0.2 ? 'success' : 'error';
                    exec.stoppedAt = new Date().toISOString();
                    if (exec.status === 'success') {
                        exec.data = { result: 'Execution completed successfully', input: req.body.data };
                    }
                    else {
                        exec.error = 'Simulated execution error';
                    }
                }
            }, 1000);
            res.json({ data: execution });
        });
        this.app.get('/executions', (req, res) => {
            let filteredExecutions = [...this.executions];
            if (req.query.filter) {
                try {
                    const filter = JSON.parse(req.query.filter);
                    if (filter.workflowId) {
                        filteredExecutions = filteredExecutions.filter(e => e.workflowId === filter.workflowId);
                    }
                }
                catch (error) {
                }
            }
            const limit = parseInt(req.query.limit) || 10;
            const limitedExecutions = filteredExecutions.slice(0, limit);
            res.json({ data: limitedExecutions });
        });
        this.app.get('/executions/:id', (req, res) => {
            const execution = this.executions.find(e => e.id === req.params.id);
            if (execution) {
                res.json({ data: execution });
            }
            else {
                res.status(404).json({ error: 'Execution not found' });
            }
        });
        this.app.get('/error/timeout', (_req, _res) => {
        });
        this.app.get('/error/500', (req, res) => {
            res.status(500).json({ error: 'Internal server error' });
        });
        this.app.get('/error/malformed', (req, res) => {
            res.send('This is not valid JSON');
        });
    }
    setupDefaultData() {
        this.workflows = [
            {
                id: 'workflow-1',
                name: 'Test Workflow 1',
                active: true,
                tags: ['automation', 'test'],
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-02T00:00:00Z',
                versionId: 'v1',
                nodes: [
                    {
                        id: 'node-1',
                        name: 'Start',
                        type: 'n8n-nodes-base.start',
                        typeVersion: 1,
                        position: [100, 100],
                        parameters: {}
                    },
                    {
                        id: 'node-2',
                        name: 'HTTP Request',
                        type: 'n8n-nodes-base.httpRequest',
                        typeVersion: 1,
                        position: [300, 100],
                        parameters: { url: 'https://api.example.com' }
                    }
                ],
                connections: {},
                settings: {
                    executionOrder: 'v1'
                }
            },
            {
                id: 'workflow-2',
                name: 'Test Workflow 2',
                active: false,
                tags: ['inactive'],
                createdAt: '2024-01-03T00:00:00Z',
                updatedAt: '2024-01-04T00:00:00Z',
                versionId: 'v1',
                nodes: [
                    {
                        id: 'node-1',
                        name: 'Webhook',
                        type: 'n8n-nodes-base.webhook',
                        typeVersion: 1,
                        position: [100, 100],
                        parameters: { path: 'test-webhook' }
                    }
                ],
                connections: {}
            }
        ];
        this.executions = [
            {
                id: 'exec-1',
                workflowId: 'workflow-1',
                mode: 'manual',
                status: 'success',
                startedAt: '2024-01-01T10:00:00Z',
                stoppedAt: '2024-01-01T10:01:00Z',
                workflowData: this.workflows[0],
                data: { result: 'Success' }
            },
            {
                id: 'exec-2',
                workflowId: 'workflow-1',
                mode: 'manual',
                status: 'error',
                startedAt: '2024-01-01T11:00:00Z',
                stoppedAt: '2024-01-01T11:00:30Z',
                workflowData: this.workflows[0],
                error: 'Test error'
            }
        ];
    }
    async start() {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(this.port, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log(`Mock n8n server running on port ${this.port}`);
                    resolve();
                }
            });
        });
    }
    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('Mock n8n server stopped');
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    setDelay(delay) {
        this.delay = delay;
    }
    setFailureRate(rate) {
        this.failureRate = rate;
    }
    addWorkflow(workflow) {
        this.workflows.push(workflow);
    }
    addExecution(execution) {
        this.executions.push(execution);
    }
    clearData() {
        this.workflows = [];
        this.executions = [];
    }
    getWorkflows() {
        return [...this.workflows];
    }
    getExecutions() {
        return [...this.executions];
    }
    isServerAuthenticated() {
        return this.isAuthenticated;
    }
    resetAuth() {
        this.isAuthenticated = false;
    }
}
exports.MockN8nServer = MockN8nServer;
//# sourceMappingURL=n8n-mock-server.helper.js.map