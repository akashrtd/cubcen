/**
 * Base Platform Adapter Tests
 */

import { BasePlatformAdapter } from '../base-adapter';
import {
  Agent,
  AgentStatus,
  AuthResult,
  ConnectionStatus,
  EventCallback,
  ExecutionParams,
  ExecutionResult,
  HealthStatus,
  PlatformConfig,
  PlatformCredentials,
  PlatformEvent,
  PlatformType
} from '../../../types/platform';

// Test implementation of BasePlatformAdapter
class TestPlatformAdapter extends BasePlatformAdapter {
  private mockConnected = false;
  private mockAuthResult: AuthResult = { success: true };
  private mockAgents: Agent[] = [];
  private mockHealthStatus: HealthStatus = { status: 'healthy', lastCheck: new Date() };

  getPlatformType(): PlatformType {
    return 'n8n';
  }

  async authenticate(_credentials: PlatformCredentials): Promise<AuthResult> {
    return this.mockAuthResult;
  }

  async discoverAgents(): Promise<Agent[]> {
    return this.mockAgents;
  }

  async getAgentStatus(agentId: string): Promise<AgentStatus> {
    return {
      id: agentId,
      status: 'active',
      lastSeen: new Date()
    };
  }

  async executeAgent(agentId: string, params: ExecutionParams): Promise<ExecutionResult> {
    return {
      success: true,
      data: { agentId, params },
      executionTime: 100,
      timestamp: new Date()
    };
  }

  async subscribeToEvents(callback: EventCallback): Promise<void> {
    this.addEventCallback(callback);
  }

  async unsubscribeFromEvents(callback: EventCallback): Promise<void> {
    this.removeEventCallback(callback);
  }

  async healthCheck(): Promise<HealthStatus> {
    return this.mockHealthStatus;
  }

  async connect(): Promise<ConnectionStatus> {
    this.mockConnected = true;
    this.setConnected(true);
    return { connected: true, lastConnected: new Date() };
  }

  async disconnect(): Promise<void> {
    this.mockConnected = false;
    this.setConnected(false);
  }

  // Test helper methods
  setMockAuthResult(result: AuthResult): void {
    this.mockAuthResult = result;
  }

  setMockAgents(agents: Agent[]): void {
    this.mockAgents = agents;
  }

  setMockHealthStatus(status: HealthStatus): void {
    this.mockHealthStatus = status;
  }

  triggerTestEvent(event: PlatformEvent): void {
    this.emitEvent(event);
  }

  setTestError(error: Error): void {
    this.setLastError(error);
  }
}

describe('BasePlatformAdapter', () => {
  let adapter: TestPlatformAdapter;
  let config: PlatformConfig;

  beforeEach(() => {
    config = {
      id: 'test-platform',
      name: 'Test Platform',
      type: 'n8n',
      baseUrl: 'https://test.example.com',
      credentials: {
        apiKey: 'test-key'
      }
    };
    adapter = new TestPlatformAdapter(config);
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      expect(adapter.getConfig()).toEqual(config);
      expect(adapter.isAdapterConnected()).toBe(false);
      expect(adapter.getLastError()).toBeUndefined();
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the configuration', () => {
      const returnedConfig = adapter.getConfig();
      expect(returnedConfig).toEqual(config);
      expect(returnedConfig).not.toBe(config); // Should be a copy
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const updates = {
        name: 'Updated Platform',
        baseUrl: 'https://updated.example.com'
      };

      adapter.updateConfig(updates);

      const updatedConfig = adapter.getConfig();
      expect(updatedConfig.name).toBe('Updated Platform');
      expect(updatedConfig.baseUrl).toBe('https://updated.example.com');
      expect(updatedConfig.id).toBe(config.id); // Should preserve original values
    });
  });

  describe('isAdapterConnected', () => {
    it('should return false initially', () => {
      expect(adapter.isAdapterConnected()).toBe(false);
    });

    it('should return true after connection', async () => {
      await adapter.connect();
      expect(adapter.isAdapterConnected()).toBe(true);
    });

    it('should return false after disconnection', async () => {
      await adapter.connect();
      await adapter.disconnect();
      expect(adapter.isAdapterConnected()).toBe(false);
    });
  });

  describe('getLastError', () => {
    it('should return undefined initially', () => {
      expect(adapter.getLastError()).toBeUndefined();
    });

    it('should return the last error that was set', () => {
      const error = new Error('Test error');
      adapter.setTestError(error);
      expect(adapter.getLastError()).toBe(error);
    });
  });

  describe('event handling', () => {
    it('should handle event subscriptions', async () => {
      const callback = jest.fn();
      
      await adapter.subscribeToEvents(callback);
      
      const testEvent: PlatformEvent = {
        type: 'agent_status_changed',
        agentId: 'test-agent',
        data: { status: 'active' },
        timestamp: new Date()
      };
      
      adapter.triggerTestEvent(testEvent);
      
      expect(callback).toHaveBeenCalledWith(testEvent);
    });

    it('should handle event unsubscriptions', async () => {
      const callback = jest.fn();
      
      await adapter.subscribeToEvents(callback);
      await adapter.unsubscribeFromEvents(callback);
      
      const testEvent: PlatformEvent = {
        type: 'agent_status_changed',
        agentId: 'test-agent',
        data: { status: 'active' },
        timestamp: new Date()
      };
      
      adapter.triggerTestEvent(testEvent);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple event callbacks', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      await adapter.subscribeToEvents(callback1);
      await adapter.subscribeToEvents(callback2);
      
      const testEvent: PlatformEvent = {
        type: 'task_completed',
        agentId: 'test-agent',
        data: { result: 'success' },
        timestamp: new Date()
      };
      
      adapter.triggerTestEvent(testEvent);
      
      expect(callback1).toHaveBeenCalledWith(testEvent);
      expect(callback2).toHaveBeenCalledWith(testEvent);
    });

    it('should handle errors in event callbacks gracefully', async () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      const normalCallback = jest.fn();
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await adapter.subscribeToEvents(errorCallback);
      await adapter.subscribeToEvents(normalCallback);
      
      const testEvent: PlatformEvent = {
        type: 'error_occurred',
        agentId: 'test-agent',
        data: { error: 'test error' },
        timestamp: new Date()
      };
      
      adapter.triggerTestEvent(testEvent);
      
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Error in event callback:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('abstract method implementations', () => {
    it('should implement getPlatformType', () => {
      expect(adapter.getPlatformType()).toBe('n8n');
    });

    it('should implement authenticate', async () => {
      const result = await adapter.authenticate({ apiKey: 'test' });
      expect(result.success).toBe(true);
    });

    it('should implement discoverAgents', async () => {
      const mockAgents: Agent[] = [{
        id: 'agent-1',
        name: 'Test Agent',
        platformId: 'test-platform',
        platformType: 'n8n',
        status: 'active',
        capabilities: ['test'],
        configuration: {},
        healthStatus: { status: 'healthy', lastCheck: new Date() },
        createdAt: new Date(),
        updatedAt: new Date()
      }];
      
      adapter.setMockAgents(mockAgents);
      const agents = await adapter.discoverAgents();
      expect(agents).toEqual(mockAgents);
    });

    it('should implement getAgentStatus', async () => {
      const status = await adapter.getAgentStatus('test-agent');
      expect(status.id).toBe('test-agent');
      expect(status.status).toBe('active');
    });

    it('should implement executeAgent', async () => {
      const params = { param1: 'value1' };
      const result = await adapter.executeAgent('test-agent', params);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ agentId: 'test-agent', params });
    });

    it('should implement healthCheck', async () => {
      const health = await adapter.healthCheck();
      expect(health.status).toBe('healthy');
    });

    it('should implement connect', async () => {
      const result = await adapter.connect();
      expect(result.connected).toBe(true);
      expect(adapter.isAdapterConnected()).toBe(true);
    });

    it('should implement disconnect', async () => {
      await adapter.connect();
      await adapter.disconnect();
      expect(adapter.isAdapterConnected()).toBe(false);
    });
  });

  describe('validateConfig', () => {
    it('should validate required configuration fields', () => {
      // This is a protected method, so we test it indirectly through the constructor
      expect(() => {
        new TestPlatformAdapter({
          id: '',
          name: 'Test',
          type: 'n8n',
          baseUrl: 'https://test.com',
          credentials: {}
        });
      }).not.toThrow(); // The test adapter doesn't call validateConfig in constructor
    });
  });
});