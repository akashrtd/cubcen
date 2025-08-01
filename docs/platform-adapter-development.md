# Platform Adapter Development Guide

This guide explains how to develop custom platform adapters for the Cubcen AI Agent Management Platform.

## Overview

Platform adapters are the bridge between Cubcen and external automation platforms (n8n, Make.com, Zapier, etc.). They provide a standardized interface for discovering, monitoring, and controlling agents across different platforms.

## Architecture

### Base Adapter Interface

All platform adapters must implement the `PlatformAdapter` interface:

```typescript
interface PlatformAdapter {
  // Authentication
  authenticate(credentials: PlatformCredentials): Promise<AuthResult>

  // Agent Discovery
  discoverAgents(): Promise<Agent[]>
  getAgentStatus(agentId: string): Promise<AgentStatus>

  // Agent Control
  executeAgent(
    agentId: string,
    params: ExecutionParams
  ): Promise<ExecutionResult>

  // Monitoring
  subscribeToEvents(callback: EventCallback): Promise<void>
  healthCheck(): Promise<HealthStatus>
}
```

### Adapter Factory Pattern

Adapters are managed through the `AdapterManager` factory:

```typescript
class AdapterManager {
  registerAdapter(type: PlatformType, adapter: PlatformAdapter): void
  getAdapter(type: PlatformType): PlatformAdapter
  createAdapter(config: PlatformConfig): PlatformAdapter
}
```

## Creating a New Adapter

### Step 1: Define Platform Types

Add your platform type to the enum:

```typescript
// src/types/platform.ts
export enum PlatformType {
  N8N = 'N8N',
  MAKE = 'MAKE',
  ZAPIER = 'ZAPIER',
  YOUR_PLATFORM = 'YOUR_PLATFORM', // Add your platform here
}
```

### Step 2: Implement Base Adapter

Create your adapter class extending `BaseAdapter`:

```typescript
// src/backend/adapters/your-platform-adapter.ts
import { BaseAdapter } from './base-adapter'
import {
  PlatformCredentials,
  Agent,
  AgentStatus,
  ExecutionParams,
  ExecutionResult,
  HealthStatus,
} from '@/types/platform'

export class YourPlatformAdapter extends BaseAdapter {
  private apiClient: YourPlatformAPIClient

  constructor(config: PlatformConfig) {
    super(config)
    this.apiClient = new YourPlatformAPIClient(config.baseUrl)
  }

  async authenticate(credentials: PlatformCredentials): Promise<AuthResult> {
    try {
      const result = await this.apiClient.authenticate(credentials)
      this.isAuthenticated = result.success
      return result
    } catch (error) {
      this.logger.error('Authentication failed', error)
      throw new AuthenticationError('Failed to authenticate with platform')
    }
  }

  async discoverAgents(): Promise<Agent[]> {
    this.ensureAuthenticated()

    try {
      const platformAgents = await this.apiClient.getAgents()
      return platformAgents.map(this.mapPlatformAgentToAgent)
    } catch (error) {
      this.logger.error('Agent discovery failed', error)
      throw new DiscoveryError('Failed to discover agents')
    }
  }

  async getAgentStatus(agentId: string): Promise<AgentStatus> {
    this.ensureAuthenticated()

    try {
      const status = await this.apiClient.getAgentStatus(agentId)
      return this.mapPlatformStatusToStatus(status)
    } catch (error) {
      this.logger.error('Get agent status failed', error, { agentId })
      throw new StatusError('Failed to get agent status')
    }
  }

  async executeAgent(
    agentId: string,
    params: ExecutionParams
  ): Promise<ExecutionResult> {
    this.ensureAuthenticated()

    try {
      const result = await this.apiClient.executeAgent(agentId, params)
      return this.mapPlatformResultToResult(result)
    } catch (error) {
      this.logger.error('Agent execution failed', error, { agentId, params })
      throw new ExecutionError('Failed to execute agent')
    }
  }

  async subscribeToEvents(callback: EventCallback): Promise<void> {
    this.ensureAuthenticated()

    try {
      await this.apiClient.subscribeToWebhooks(event => {
        const mappedEvent = this.mapPlatformEventToEvent(event)
        callback(mappedEvent)
      })
    } catch (error) {
      this.logger.error('Event subscription failed', error)
      throw new SubscriptionError('Failed to subscribe to events')
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      const health = await this.apiClient.healthCheck()
      return {
        status: health.ok ? 'healthy' : 'unhealthy',
        lastCheck: new Date(),
        details: health,
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        details: { error: error.message },
      }
    }
  }

  // Private helper methods
  private mapPlatformAgentToAgent(platformAgent: any): Agent {
    return {
      id: platformAgent.id,
      name: platformAgent.name,
      platformId: this.config.id,
      platformType: this.config.type,
      externalId: platformAgent.id,
      status: this.mapPlatformStatusToStatus(platformAgent.status),
      capabilities: platformAgent.capabilities || [],
      configuration: platformAgent.config || {},
      description: platformAgent.description,
      healthStatus: {
        status: 'healthy',
        lastCheck: new Date(),
      },
      createdAt: new Date(platformAgent.createdAt),
      updatedAt: new Date(platformAgent.updatedAt),
    }
  }

  private mapPlatformStatusToStatus(platformStatus: string): AgentStatus {
    switch (platformStatus.toLowerCase()) {
      case 'active':
      case 'running':
        return 'ACTIVE'
      case 'inactive':
      case 'stopped':
        return 'INACTIVE'
      case 'error':
      case 'failed':
        return 'ERROR'
      case 'maintenance':
        return 'MAINTENANCE'
      default:
        return 'INACTIVE'
    }
  }
}
```

### Step 3: Register Adapter

Register your adapter in the adapter factory:

```typescript
// src/backend/adapters/adapter-factory.ts
import { YourPlatformAdapter } from './your-platform-adapter'

export class AdapterManager {
  private adapters = new Map<PlatformType, PlatformAdapter>()

  constructor() {
    // Register built-in adapters
    this.registerAdapter(PlatformType.N8N, N8nAdapter)
    this.registerAdapter(PlatformType.MAKE, MakeAdapter)
    this.registerAdapter(PlatformType.YOUR_PLATFORM, YourPlatformAdapter) // Add here
  }
}
```

### Step 4: Add Configuration Schema

Define configuration schema for your platform:

```typescript
// src/lib/validation/platform.ts
export const yourPlatformConfigSchema = z.object({
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  webhookUrl: z.string().url().optional(),
  timeout: z.number().min(1000).max(60000).default(30000),
  retries: z.number().min(0).max(5).default(3),
})
```

## Testing Your Adapter

### Unit Tests

Create comprehensive unit tests for your adapter:

```typescript
// src/backend/adapters/__tests__/your-platform-adapter.test.ts
import { YourPlatformAdapter } from '../your-platform-adapter'
import { PlatformConfig } from '@/types/platform'

describe('YourPlatformAdapter', () => {
  let adapter: YourPlatformAdapter
  let mockConfig: PlatformConfig

  beforeEach(() => {
    mockConfig = {
      id: 'test-platform',
      name: 'Test Platform',
      type: PlatformType.YOUR_PLATFORM,
      baseUrl: 'https://api.yourplatform.com',
      credentials: {
        apiKey: 'test-api-key',
      },
    }

    adapter = new YourPlatformAdapter(mockConfig)
  })

  describe('authenticate', () => {
    it('should authenticate successfully with valid credentials', async () => {
      // Mock API response
      jest.spyOn(adapter['apiClient'], 'authenticate').mockResolvedValue({
        success: true,
        token: 'auth-token',
      })

      const result = await adapter.authenticate(mockConfig.credentials)

      expect(result.success).toBe(true)
      expect(adapter['isAuthenticated']).toBe(true)
    })

    it('should handle authentication failure', async () => {
      jest
        .spyOn(adapter['apiClient'], 'authenticate')
        .mockRejectedValue(new Error('Invalid credentials'))

      await expect(
        adapter.authenticate(mockConfig.credentials)
      ).rejects.toThrow('Failed to authenticate with platform')
    })
  })

  describe('discoverAgents', () => {
    beforeEach(async () => {
      // Authenticate first
      jest.spyOn(adapter['apiClient'], 'authenticate').mockResolvedValue({
        success: true,
        token: 'auth-token',
      })
      await adapter.authenticate(mockConfig.credentials)
    })

    it('should discover agents successfully', async () => {
      const mockPlatformAgents = [
        {
          id: 'agent-1',
          name: 'Test Agent 1',
          status: 'active',
          capabilities: ['email'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      jest
        .spyOn(adapter['apiClient'], 'getAgents')
        .mockResolvedValue(mockPlatformAgents)

      const agents = await adapter.discoverAgents()

      expect(agents).toHaveLength(1)
      expect(agents[0].name).toBe('Test Agent 1')
      expect(agents[0].status).toBe('ACTIVE')
    })
  })

  // Add more tests for other methods...
})
```

### Integration Tests

Create integration tests with mock server:

```typescript
// src/backend/adapters/__tests__/your-platform-integration.test.ts
import { YourPlatformAdapter } from '../your-platform-adapter'
import { createMockServer } from './your-platform-mock-server.helper'

describe('YourPlatformAdapter Integration', () => {
  let mockServer: any
  let adapter: YourPlatformAdapter

  beforeAll(async () => {
    mockServer = await createMockServer()

    adapter = new YourPlatformAdapter({
      id: 'test-platform',
      name: 'Test Platform',
      type: PlatformType.YOUR_PLATFORM,
      baseUrl: mockServer.url,
      credentials: { apiKey: 'test-key' },
    })
  })

  afterAll(async () => {
    await mockServer.close()
  })

  it('should perform full agent lifecycle', async () => {
    // Test authentication
    await adapter.authenticate({ apiKey: 'test-key' })

    // Test agent discovery
    const agents = await adapter.discoverAgents()
    expect(agents.length).toBeGreaterThan(0)

    // Test agent status
    const status = await adapter.getAgentStatus(agents[0].externalId)
    expect(status).toBeDefined()

    // Test health check
    const health = await adapter.healthCheck()
    expect(health.status).toBe('healthy')
  })
})
```

## Error Handling

### Custom Error Types

Define platform-specific error types:

```typescript
// src/backend/adapters/errors/your-platform-errors.ts
export class YourPlatformError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'YourPlatformError'
  }
}

export class YourPlatformAuthError extends YourPlatformError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR')
    this.name = 'YourPlatformAuthError'
  }
}

export class YourPlatformRateLimitError extends YourPlatformError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR')
    this.name = 'YourPlatformRateLimitError'
  }
}
```

### Circuit Breaker Integration

Use the circuit breaker for resilient API calls:

```typescript
import { CircuitBreaker } from '@/lib/circuit-breaker'

export class YourPlatformAdapter extends BaseAdapter {
  private circuitBreaker: CircuitBreaker

  constructor(config: PlatformConfig) {
    super(config)
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000,
      timeout: 30000,
    })
  }

  async discoverAgents(): Promise<Agent[]> {
    return this.circuitBreaker.execute(async () => {
      const platformAgents = await this.apiClient.getAgents()
      return platformAgents.map(this.mapPlatformAgentToAgent)
    })
  }
}
```

## Configuration

### Environment Variables

Add platform-specific environment variables:

```bash
# .env
YOUR_PLATFORM_API_KEY=your-api-key
YOUR_PLATFORM_BASE_URL=https://api.yourplatform.com
YOUR_PLATFORM_WEBHOOK_SECRET=webhook-secret
```

### Platform Registration

Register your platform in the database:

```sql
INSERT INTO platforms (id, name, type, base_url, status, created_at, updated_at)
VALUES (
  'your-platform-1',
  'Your Platform Instance',
  'YOUR_PLATFORM',
  'https://api.yourplatform.com',
  'CONNECTED',
  NOW(),
  NOW()
);
```

## Best Practices

### 1. Authentication Management

- Store credentials securely
- Implement token refresh logic
- Handle authentication errors gracefully
- Support multiple authentication methods (API key, OAuth, etc.)

### 2. Rate Limiting

- Respect platform rate limits
- Implement exponential backoff
- Use circuit breaker pattern
- Queue requests when necessary

### 3. Error Handling

- Provide meaningful error messages
- Log errors with context
- Implement retry logic for transient failures
- Handle platform-specific error codes

### 4. Data Mapping

- Map platform-specific data to Cubcen schema
- Handle missing or optional fields
- Validate data before processing
- Maintain backward compatibility

### 5. Monitoring

- Implement comprehensive health checks
- Monitor API response times
- Track error rates and patterns
- Log important events and metrics

### 6. Testing

- Write unit tests for all methods
- Create integration tests with mock servers
- Test error scenarios and edge cases
- Validate data mapping accuracy

## API Documentation

Document your adapter's specific features:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     YourPlatformConfig:
 *       type: object
 *       required:
 *         - baseUrl
 *         - apiKey
 *       properties:
 *         baseUrl:
 *           type: string
 *           format: uri
 *           description: Base URL for Your Platform API
 *         apiKey:
 *           type: string
 *           description: API key for authentication
 *         webhookUrl:
 *           type: string
 *           format: uri
 *           description: Webhook URL for real-time events
 */
```

## Deployment

### Docker Support

Add platform-specific dependencies to Dockerfile:

```dockerfile
# Install platform-specific dependencies
RUN npm install your-platform-sdk
```

### Health Checks

Implement health check endpoints:

```typescript
// src/backend/routes/platforms.ts
router.get('/:id/health', async (req, res) => {
  const adapter = adapterManager.getAdapter(req.params.id)
  const health = await adapter.healthCheck()

  res.status(health.status === 'healthy' ? 200 : 503).json(health)
})
```

## Support and Maintenance

### Logging

Use structured logging for debugging:

```typescript
this.logger.info('Agent discovery started', {
  platformId: this.config.id,
  platformType: this.config.type,
})

this.logger.error('Agent execution failed', error, {
  agentId,
  params,
  platformId: this.config.id,
})
```

### Metrics

Track adapter-specific metrics:

```typescript
// Track API call metrics
this.metrics.increment('api.calls.total', {
  platform: this.config.type,
  endpoint: 'discover_agents',
})

this.metrics.timing('api.response_time', responseTime, {
  platform: this.config.type,
  endpoint: 'discover_agents',
})
```

## Example: Complete Adapter Implementation

See the existing adapters for complete examples:

- [n8n Adapter](../src/backend/adapters/n8n-adapter.ts)
- [Make.com Adapter](../src/backend/adapters/make-adapter.ts)

These implementations demonstrate all the concepts covered in this guide and serve as reference implementations for new platform adapters.
