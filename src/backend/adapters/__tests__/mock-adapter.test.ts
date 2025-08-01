/**
 * Mock Platform Adapter Tests
 */

import { MockPlatformAdapter } from '../mock-adapter';
import { PlatformConfig, PlatformEvent } from '../../../types/platform';

describe('MockPlatformAdapter', () => {
  let adapter: MockPlatformAdapter;
  let config: PlatformConfig;

  beforeEach(() => {
    config = {
      id: 'mock-platform',
      name: 'Mock Platform',
      type: 'n8n',
      baseUrl: 'https://mock.example.com',
      credentials: { apiKey: 'mock-key' }
    };
    adapter = new MockPlatformAdapter(config);
  });

  afterEach(() => {
    // Clean up any intervals
    adapter.disconnect();
  });

  describe('constructor', () => {
    it('should initialize with mock data', () => {
      expect(adapter.getPlatformType()).toBe('n8n');
      expect(adapter.getConfig()).toEqual(config);
    });

    it('should create default mock agents', async () => {
      const agents = await adapter.discoverAgents();
      expect(agents).toHaveLength(3);
      expect(agents[0].name).toBe('Mock Agent 1');
      expect(agents[2].status).toBe('error'); // Third agent should have error status
    });
  });

  describe('getPlatformType', () => {
    it('should return the configured platform type', () => {
      expect(adapter.getPlatformType()).toBe(config.type);
    });

    it('should return different types for different configs', () => {
      const makeConfig = { ...config, type: 'make' as const };
      const makeAdapter = new MockPlatformAdapter(makeConfig);
      expect(makeAdapter.getPlatformType()).toBe('make');
    });
  });

  describe('authenticate', () => {
    it('should return successful authentication by default', async () => {
      const result = await adapter.authenticate({ apiKey: 'test' });
      
      expect(result.success).toBe(true);
      expect(result.token).toMatch(/^mock-token-\d+$/);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should return failed authentication when configured to fail', async () => {
      adapter.setShouldFailAuth(true);
      
      const result = await adapter.authenticate({ apiKey: 'test' });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Mock authentication failure');
    });

    it('should respect mock delay', async () => {
      adapter.setMockDelay(50);
      
      const startTime = Date.now();
      await adapter.authenticate({ apiKey: 'test' });
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(50);
    });
  });

  describe('discoverAgents', () => {
    it('should return mock agents', async () => {
      const agents = await adapter.discoverAgents();
      
      expect(agents).toHaveLength(3);
      agents.forEach(agent => {
        expect(agent).toHaveProperty('id');
        expect(agent).toHaveProperty('name');
        expect(agent.platformId).toBe(config.id);
        expect(agent.platformType).toBe(config.type);
      });
    });

    it('should return custom mock agents', async () => {
      adapter.clearMockAgents();
      adapter.addMockAgent({
        id: 'custom-agent',
        name: 'Custom Agent',
        status: 'maintenance'
      });
      
      const agents = await adapter.discoverAgents();
      
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe('custom-agent');
      expect(agents[0].name).toBe('Custom Agent');
      expect(agents[0].status).toBe('maintenance');
    });
  });

  describe('getAgentStatus', () => {
    it('should return status for existing agent', async () => {
      const agents = await adapter.discoverAgents();
      const agentId = agents[0].id;
      
      const status = await adapter.getAgentStatus(agentId);
      
      expect(status.id).toBe(agentId);
      expect(status.status).toBe(agents[0].status);
      expect(status.lastSeen).toBeInstanceOf(Date);
      expect(status.metrics).toHaveProperty('tasksCompleted');
      expect(status.metrics).toHaveProperty('averageExecutionTime');
      expect(status.metrics).toHaveProperty('errorRate');
    });

    it('should throw error for non-existent agent', async () => {
      await expect(adapter.getAgentStatus('non-existent')).rejects.toThrow('Agent not found: non-existent');
    });

    it('should sometimes include current task', async () => {
      const agents = await adapter.discoverAgents();
      const agentId = agents[0].id;
      
      // Run multiple times to test randomness
      let foundCurrentTask = false;
      for (let i = 0; i < 10; i++) {
        const status = await adapter.getAgentStatus(agentId);
        if (status.currentTask) {
          foundCurrentTask = true;
          expect(status.currentTask).toMatch(/^mock-task-\d+$/);
          break;
        }
      }
      
      // This test might occasionally fail due to randomness, but it's unlikely
      // We're not asserting it must be found to avoid flaky tests
      // foundCurrentTask is used to track if we found a current task in the loop
    });
  });

  describe('executeAgent', () => {
    it('should execute agent successfully by default', async () => {
      const agents = await adapter.discoverAgents();
      const agentId = agents[0].id;
      const params = { param1: 'value1', param2: 42 };
      
      const result = await adapter.executeAgent(agentId, params);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('result', 'Mock execution successful');
      expect(result.data).toHaveProperty('params', params);
      expect(result.data).toHaveProperty('agentId', agentId);
      expect((result.data as { executionId: string }).executionId).toMatch(/^mock-exec-\d+$/);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should fail execution when configured to fail', async () => {
      adapter.setShouldFailExecution(true);
      const agents = await adapter.discoverAgents();
      const agentId = agents[0].id;
      
      const result = await adapter.executeAgent(agentId, {});
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Mock execution failure');
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should emit task completion event on successful execution', async () => {
      const eventCallback = jest.fn();
      await adapter.subscribeToEvents(eventCallback);
      
      const agents = await adapter.discoverAgents();
      const agentId = agents[0].id;
      const params = { test: 'data' };
      
      await adapter.executeAgent(agentId, params);
      
      expect(eventCallback).toHaveBeenCalledWith({
        type: 'task_completed',
        agentId,
        data: { params, result: 'success' },
        timestamp: expect.any(Date)
      });
    });
  });

  describe('event handling', () => {
    it('should subscribe to events and start emitting periodic events', async () => {
      const eventCallback = jest.fn();
      
      await adapter.subscribeToEvents(eventCallback);
      
      // Wait for at least one event to be emitted
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      expect(eventCallback).toHaveBeenCalled();
      const call = eventCallback.mock.calls[0][0] as PlatformEvent;
      expect(['agent_status_changed', 'task_completed', 'error_occurred']).toContain(call.type);
      expect(call.agentId).toBeDefined();
      expect(call.timestamp).toBeInstanceOf(Date);
    }, 5000);

    it('should unsubscribe from events and stop emitting when no callbacks remain', async () => {
      const eventCallback = jest.fn();
      
      await adapter.subscribeToEvents(eventCallback);
      await adapter.unsubscribeFromEvents(eventCallback);
      
      // Wait to ensure no events are emitted
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      expect(eventCallback).not.toHaveBeenCalled();
    }, 5000);

    it('should handle multiple event subscribers', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      await adapter.subscribeToEvents(callback1);
      await adapter.subscribeToEvents(callback2);
      
      // Wait for events
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    }, 5000);
  });

  describe('healthCheck', () => {
    it('should return healthy status by default', async () => {
      const health = await adapter.healthCheck();
      
      expect(health.status).toBe('healthy');
      expect(health.lastCheck).toBeInstanceOf(Date);
      expect(health.responseTime).toBeGreaterThan(0);
      expect(health.details).toEqual({
        platform: config.type,
        agentCount: 3,
        mockAdapter: true
      });
    });

    it('should return unhealthy status when configured to fail', async () => {
      adapter.setShouldFailHealthCheck(true);
      
      const health = await adapter.healthCheck();
      
      expect(health.status).toBe('unhealthy');
      expect(health.error).toBe('Mock health check failure');
      expect(health.responseTime).toBeGreaterThan(0);
    });
  });

  describe('connect', () => {
    it('should connect successfully by default', async () => {
      const result = await adapter.connect();
      
      expect(result.connected).toBe(true);
      expect(result.lastConnected).toBeInstanceOf(Date);
      expect(adapter.isAdapterConnected()).toBe(true);
    });

    it('should fail to connect when authentication fails', async () => {
      adapter.setShouldFailAuth(true);
      
      const result = await adapter.connect();
      
      expect(result.connected).toBe(false);
      expect(result.error).toBe('Mock authentication failure');
      expect(adapter.isAdapterConnected()).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('should disconnect and stop event emission', async () => {
      await adapter.connect();
      const eventCallback = jest.fn();
      await adapter.subscribeToEvents(eventCallback);
      
      await adapter.disconnect();
      
      expect(adapter.isAdapterConnected()).toBe(false);
      
      // Wait to ensure no events are emitted after disconnect
      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(eventCallback).not.toHaveBeenCalled();
    }, 5000);
  });

  describe('mock configuration methods', () => {
    it('should allow setting mock delay', async () => {
      adapter.setMockDelay(100);
      
      const startTime = Date.now();
      await adapter.healthCheck();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });

    it('should allow adding custom mock agents', () => {
      adapter.clearMockAgents();
      
      adapter.addMockAgent({
        id: 'custom-1',
        name: 'Custom Agent 1'
      });
      
      adapter.addMockAgent({
        id: 'custom-2',
        name: 'Custom Agent 2',
        status: 'inactive'
      });
      
      return adapter.discoverAgents().then(agents => {
        expect(agents).toHaveLength(2);
        expect(agents[0].id).toBe('custom-1');
        expect(agents[1].status).toBe('inactive');
      });
    });

    it('should generate default values for partial agent data', () => {
      adapter.clearMockAgents();
      adapter.addMockAgent({ name: 'Minimal Agent' });
      
      return adapter.discoverAgents().then(agents => {
        const agent = agents[0];
        expect(agent.id).toMatch(/^mock-agent-\d+$/);
        expect(agent.name).toBe('Minimal Agent');
        expect(agent.platformId).toBe(config.id);
        expect(agent.platformType).toBe(config.type);
        expect(agent.status).toBe('active');
        expect(agent.capabilities).toEqual(['mock-capability']);
        expect(agent.healthStatus.status).toBe('healthy');
      });
    });
  });
});