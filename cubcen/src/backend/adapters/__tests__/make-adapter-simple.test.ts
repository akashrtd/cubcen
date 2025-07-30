/**
 * Simple focused tests for Make.com Platform Adapter
 * Tests core functionality without complex mocking
 */

import { MakePlatformAdapter } from '../make-adapter';
import { PlatformConfig } from '../../../types/platform';

// Mock circuit breaker to always execute
jest.mock('../../../lib/circuit-breaker', () => ({
  createPlatformCircuitBreaker: jest.fn(() => ({
    execute: jest.fn((fn) => fn()),
    getStats: jest.fn(() => ({ state: 'closed' }))
  }))
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    defaults: {
      headers: {
        common: {}
      }
    },
    interceptors: {
      request: {
        use: jest.fn()
      },
      response: {
        use: jest.fn()
      }
    }
  })),
  post: jest.fn()
}));

describe('MakePlatformAdapter - Core Functionality', () => {
  let adapter: MakePlatformAdapter;
  let mockConfig: PlatformConfig;

  beforeEach(() => {
    mockConfig = {
      id: 'test-make',
      name: 'Test Make.com',
      type: 'make',
      baseUrl: 'https://eu1.make.com/api/v2',
      credentials: {
        apiToken: 'test-api-token'
      }
    };

    adapter = new MakePlatformAdapter(mockConfig);
  });

  describe('Basic initialization', () => {
    it('should initialize correctly', () => {
      expect(adapter.getPlatformType()).toBe('make');
      expect(adapter.getConfig()).toEqual(mockConfig);
      expect(adapter.isAdapterConnected()).toBe(false);
    });

    it('should validate configuration on creation', () => {
      expect(() => {
        new MakePlatformAdapter({
          ...mockConfig,
          credentials: {}
        });
      }).toThrow('Make.com adapter requires either apiToken, accessToken, or OAuth client credentials');
    });
  });

  describe('Configuration management', () => {
    it('should handle API token credentials', () => {
      const config = {
        ...mockConfig,
        credentials: {
          apiToken: 'test-token'
        }
      };

      const testAdapter = new MakePlatformAdapter(config);
      expect(testAdapter.getConfig().credentials.apiToken).toBe('test-token');
    });

    it('should handle OAuth credentials', () => {
      const config = {
        ...mockConfig,
        credentials: {
          clientId: 'client-id',
          clientSecret: 'client-secret',
          accessToken: 'access-token',
          refreshToken: 'refresh-token'
        }
      };

      const testAdapter = new MakePlatformAdapter(config);
      expect(testAdapter.getConfig().credentials.clientId).toBe('client-id');
    });

    it('should handle team configuration', () => {
      const config = {
        ...mockConfig,
        credentials: {
          apiToken: 'test-token',
          teamId: 123
        }
      };

      const testAdapter = new MakePlatformAdapter(config);
      expect(testAdapter.getConfig().credentials.teamId).toBe(123);
    });
  });

  describe('Agent conversion', () => {
    it('should convert Make.com scenario to agent format', async () => {
      const mockScenario = {
        id: 1,
        name: 'Test Scenario',
        is_active: true,
        is_locked: false,
        folder_id: null,
        team_id: 123,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        last_edit: '2024-01-02T00:00:00Z',
        blueprint: {
          flow: [
            {
              id: 1,
              module: 'webhook',
              version: 1,
              parameters: {},
              mapper: {},
              metadata: { designer: { x: 0, y: 0 } }
            }
          ],
          metadata: {}
        }
      };

      // Access private method for testing
      const agent = await (adapter as any).convertScenarioToAgent(mockScenario);

      expect(agent).toMatchObject({
        id: '1',
        name: 'Test Scenario',
        platformId: 'test-make',
        platformType: 'make',
        status: 'active',
        capabilities: ['webhook', 'active']
      });
    });

    it('should handle inactive and locked scenarios', async () => {
      const mockScenario = {
        id: 2,
        name: 'Locked Scenario',
        is_active: false,
        is_locked: true,
        team_id: 123,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        last_edit: '2024-01-02T00:00:00Z'
      };

      const agent = await (adapter as any).convertScenarioToAgent(mockScenario);

      expect(agent.status).toBe('maintenance'); // locked takes precedence
    });
  });

  describe('Error handling', () => {
    it('should extract error messages correctly', () => {
      const axiosError = {
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: {
            message: 'Invalid scenario ID'
          }
        }
      };

      const errorMessage = (adapter as any).extractErrorMessage(axiosError);
      expect(errorMessage).toBe('Invalid scenario ID');
    });

    it('should handle network errors', () => {
      const networkError = {
        code: 'ECONNREFUSED',
        message: 'Connection refused'
      };

      const errorMessage = (adapter as any).extractErrorMessage(networkError);
      expect(errorMessage).toBe('Network error: ECONNREFUSED');
    });

    it('should handle unknown errors', () => {
      const errorMessage = (adapter as any).extractErrorMessage('unknown');
      expect(errorMessage).toBe('Unknown error occurred');
    });
  });

  describe('Metrics calculation', () => {
    it('should calculate agent metrics correctly', () => {
      const mockExecutions = [
        {
          id: 1,
          scenario_id: 1,
          status: 'success' as const,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:01:00Z',
          started_at: '2024-01-01T10:00:00Z',
          finished_at: '2024-01-01T10:01:00Z',
          execution_time: 60000,
          operations_count: 5,
          data_transfer: 1024
        },
        {
          id: 2,
          scenario_id: 1,
          status: 'error' as const,
          created_at: '2024-01-01T11:00:00Z',
          updated_at: '2024-01-01T11:01:00Z',
          started_at: '2024-01-01T11:00:00Z',
          finished_at: '2024-01-01T11:01:00Z',
          execution_time: 30000,
          operations_count: 2,
          data_transfer: 512,
          error: {
            message: 'Test error',
            type: 'RuntimeError'
          }
        }
      ];

      const metrics = (adapter as any).calculateAgentMetrics(mockExecutions);

      expect(metrics).toEqual({
        tasksCompleted: 2,
        averageExecutionTime: 45000,
        errorRate: 0.5
      });
    });

    it('should handle empty executions', () => {
      const metrics = (adapter as any).calculateAgentMetrics([]);

      expect(metrics).toEqual({
        tasksCompleted: 0,
        averageExecutionTime: 0,
        errorRate: 0
      });
    });
  });

  describe('Status determination', () => {
    it('should determine agent status correctly', () => {
      const activeScenario = {
        is_active: true,
        is_locked: false
      };

      const inactiveScenario = {
        is_active: false,
        is_locked: false
      };

      const lockedScenario = {
        is_active: true,
        is_locked: true
      };

      expect((adapter as any).determineAgentStatus(activeScenario, [])).toBe('active');
      expect((adapter as any).determineAgentStatus(inactiveScenario, [])).toBe('inactive');
      expect((adapter as any).determineAgentStatus(lockedScenario, [])).toBe('maintenance');
    });

    it('should detect error status from executions', () => {
      const activeScenario = {
        is_active: true,
        is_locked: false
      };

      const errorExecutions = Array(5).fill(null).map((_, i) => ({
        id: i,
        status: 'error'
      }));

      expect((adapter as any).determineAgentStatus(activeScenario, errorExecutions)).toBe('error');
    });
  });

  describe('Capability extraction', () => {
    it('should extract capabilities from scenario', () => {
      const scenario = {
        is_active: true,
        scheduling: {
          type: 'indefinitely' as const,
          interval: 900
        },
        blueprint: {
          flow: [
            { module: 'webhook' },
            { module: 'http' },
            { module: 'email' }
          ]
        }
      };

      const capabilities = (adapter as any).extractCapabilities(scenario);

      expect(capabilities).toContain('webhook');
      expect(capabilities).toContain('http');
      expect(capabilities).toContain('email');
      expect(capabilities).toContain('scheduling:indefinitely');
      expect(capabilities).toContain('active');
    });
  });
});