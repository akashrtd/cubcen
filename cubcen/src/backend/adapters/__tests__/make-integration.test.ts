/**
 * Integration tests for Make.com Platform Adapter
 * Tests with mock HTTP server to simulate Make.com API
 */

import { MakePlatformAdapter } from '../make-adapter';
import { PlatformConfig } from '../../../types/platform';
import { createMakeApiMockServer } from './make-mock-server.helper';

describe('MakePlatformAdapter Integration Tests', () => {
  let adapter: MakePlatformAdapter;
  let mockServer: ReturnType<typeof createMakeApiMockServer>;
  let mockConfig: PlatformConfig;

  beforeAll(async () => {
    // Start mock server
    mockServer = createMakeApiMockServer();
    await mockServer.start();
  });

  afterAll(async () => {
    // Stop mock server
    await mockServer.stop();
  });

  beforeEach(() => {
    mockConfig = {
      id: 'test-make-integration',
      name: 'Test Make.com Integration',
      type: 'make',
      baseUrl: mockServer.getBaseUrl(),
      credentials: {
        apiToken: 'valid-api-token'
      }
    };

    adapter = new MakePlatformAdapter(mockConfig);
  });

  afterEach(async () => {
    await adapter.disconnect();
    mockServer.reset();
  });

  describe('Full workflow integration', () => {
    it('should complete full agent lifecycle', async () => {
      // 1. Connect to platform
      const connectionResult = await adapter.connect();
      expect(connectionResult.connected).toBe(true);

      // 2. Discover agents
      const agents = await adapter.discoverAgents();
      expect(agents.length).toBeGreaterThan(0);
      
      const testAgent = agents[0];
      expect(testAgent.platformType).toBe('make');
      expect(testAgent.name).toBeDefined();

      // 3. Get agent status
      const status = await adapter.getAgentStatus(testAgent.id);
      expect(status.id).toBe(testAgent.id);
      expect(status.status).toMatch(/^(active|inactive|error|maintenance)$/);

      // 4. Execute agent
      const executionResult = await adapter.executeAgent(testAgent.id, {
        testData: 'integration-test'
      });
      expect(executionResult.success).toBe(true);
      expect(executionResult.timestamp).toBeInstanceOf(Date);

      // 5. Health check
      const health = await adapter.healthCheck();
      expect(health.status).toBe('healthy');
    });

    it('should handle OAuth authentication flow', async () => {
      const oauthConfig = {
        ...mockConfig,
        credentials: {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          refreshToken: 'valid-refresh-token',
          teamId: 123
        }
      };

      const oauthAdapter = new MakePlatformAdapter(oauthConfig);

      // Test OAuth authentication
      const authResult = await oauthAdapter.authenticate(oauthConfig.credentials);
      expect(authResult.success).toBe(true);
      expect(authResult.token).toBeDefined();
      expect(authResult.expiresAt).toBeInstanceOf(Date);

      // Test that subsequent requests work
      const agents = await oauthAdapter.discoverAgents();
      expect(agents.length).toBeGreaterThan(0);

      await oauthAdapter.disconnect();
    });

    it('should handle error scenarios gracefully', async () => {
      // Test with invalid credentials
      const invalidConfig = {
        ...mockConfig,
        credentials: {
          apiToken: 'invalid-token'
        }
      };

      const invalidAdapter = new MakePlatformAdapter(invalidConfig);

      const authResult = await invalidAdapter.authenticate(invalidConfig.credentials);
      expect(authResult.success).toBe(false);
      expect(authResult.error).toContain('Authentication failed');

      // Test connection failure
      const connectionResult = await invalidAdapter.connect();
      expect(connectionResult.connected).toBe(false);
      expect(connectionResult.error).toBeDefined();
    });

    it('should handle rate limiting', async () => {
      // Configure mock server to return rate limit responses
      mockServer.enableRateLimit();

      const connectionResult = await adapter.connect();
      expect(connectionResult.connected).toBe(true);

      // This should trigger rate limiting
      const health = await adapter.healthCheck();
      
      // The adapter should handle rate limiting gracefully
      expect(health.status).toBe('unhealthy');
      expect(health.error).toContain('429');

      mockServer.disableRateLimit();
    });

    it('should handle network timeouts', async () => {
      // Configure mock server to simulate slow responses
      mockServer.enableSlowResponses(5000); // 5 second delay

      const timeoutConfig = {
        ...mockConfig,
        timeout: 2000 // 2 second timeout
      };

      const timeoutAdapter = new MakePlatformAdapter(timeoutConfig);

      const startTime = Date.now();
      const health = await timeoutAdapter.healthCheck();
      const duration = Date.now() - startTime;

      expect(health.status).toBe('unhealthy');
      expect(duration).toBeLessThan(3000); // Should timeout before 3 seconds
      expect(health.error).toContain('timeout');

      mockServer.disableSlowResponses();
      await timeoutAdapter.disconnect();
    });

    it('should handle circuit breaker activation', async () => {
      // Configure mock server to return errors
      mockServer.enableErrors();

      const connectionResult = await adapter.connect();
      expect(connectionResult.connected).toBe(false);

      // Multiple failed requests should trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        const health = await adapter.healthCheck();
        expect(health.status).toBe('unhealthy');
      }

      // Circuit breaker should now be open
      const finalHealth = await adapter.healthCheck();
      expect(finalHealth.status).toBe('unhealthy');
      expect(finalHealth.details?.circuitBreakerState).toBe('open');

      mockServer.disableErrors();
    });
  });

  describe('Event subscription integration', () => {
    it('should receive events from polling', async () => {
      const events: any[] = [];
      const eventCallback = (event: any) => {
        events.push(event);
      };

      await adapter.connect();
      await adapter.subscribeToEvents(eventCallback);

      // Wait for polling to occur (mock server will generate events)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Should have received some events
      expect(events.length).toBeGreaterThan(0);
      
      const event = events[0];
      expect(event.type).toMatch(/^(task_completed|error_occurred)$/);
      expect(event.agentId).toBeDefined();
      expect(event.timestamp).toBeInstanceOf(Date);

      await adapter.unsubscribeFromEvents(eventCallback);
    });
  });

  describe('Team-based operations', () => {
    it('should handle team-specific requests', async () => {
      const teamConfig = {
        ...mockConfig,
        credentials: {
          apiToken: 'valid-api-token',
          teamId: 456
        }
      };

      const teamAdapter = new MakePlatformAdapter(teamConfig);

      await teamAdapter.connect();

      // All requests should include teamId parameter
      const agents = await teamAdapter.discoverAgents();
      expect(agents.length).toBeGreaterThan(0);

      if (agents.length > 0) {
        const status = await teamAdapter.getAgentStatus(agents[0].id);
        expect(status.id).toBe(agents[0].id);
      }

      await teamAdapter.disconnect();
    });
  });

  describe('Error recovery', () => {
    it('should recover from temporary network issues', async () => {
      await adapter.connect();

      // Simulate network issue
      mockServer.enableErrors();

      let health = await adapter.healthCheck();
      expect(health.status).toBe('unhealthy');

      // Restore network
      mockServer.disableErrors();

      // Should recover
      health = await adapter.healthCheck();
      expect(health.status).toBe('healthy');
    });

    it('should handle token expiration and refresh', async () => {
      const oauthConfig = {
        ...mockConfig,
        credentials: {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          accessToken: 'expiring-token',
          refreshToken: 'valid-refresh-token'
        }
      };

      const oauthAdapter = new MakePlatformAdapter(oauthConfig);

      // Initial authentication
      await oauthAdapter.authenticate(oauthConfig.credentials);

      // Simulate token expiration
      mockServer.expireToken();

      // Next request should trigger token refresh
      const agents = await oauthAdapter.discoverAgents();
      expect(agents.length).toBeGreaterThan(0);

      await oauthAdapter.disconnect();
    });
  });

  describe('Performance and reliability', () => {
    it('should handle concurrent requests', async () => {
      await adapter.connect();

      // Make multiple concurrent requests
      const promises = [
        adapter.healthCheck(),
        adapter.discoverAgents(),
        adapter.healthCheck(),
        adapter.discoverAgents()
      ];

      const results = await Promise.all(promises);

      // All requests should succeed
      expect(results[0].status).toBe('healthy');
      expect(results[1].length).toBeGreaterThan(0);
      expect(results[2].status).toBe('healthy');
      expect(results[3].length).toBeGreaterThan(0);
    });

    it('should maintain performance under load', async () => {
      await adapter.connect();

      const startTime = Date.now();
      const iterations = 10;

      // Perform multiple operations
      for (let i = 0; i < iterations; i++) {
        await adapter.healthCheck();
      }

      const duration = Date.now() - startTime;
      const averageTime = duration / iterations;

      // Average response time should be reasonable
      expect(averageTime).toBeLessThan(1000); // Less than 1 second per request
    });
  });
});