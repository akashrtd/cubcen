import request from 'supertest'
import { TestServer } from './test-server'

/**
 * Authentication helper for E2E tests
 */
export class AuthHelper {
  private server: TestServer
  private tokens: Map<string, string> = new Map()

  constructor(server: TestServer) {
    this.server = server
  }

  /**
   * Login and get JWT token for a test user
   */
  async loginAs(email: string, password: string = 'testpassword123'): Promise<string> {
    if (this.tokens.has(email)) {
      return this.tokens.get(email)!
    }

    const response = await request(this.server.getUrl())
      .post('/api/cubcen/v1/auth/login')
      .send({ email, password })
      .expect(200)

    const token = response.body.token
    this.tokens.set(email, token)
    return token
  }

  /**
   * Get authorization header for authenticated requests
   */
  async getAuthHeader(email: string): Promise<{ Authorization: string }> {
    const token = await this.loginAs(email)
    return { Authorization: `Bearer ${token}` }
  }

  /**
   * Clear cached tokens
   */
  clearTokens(): void {
    this.tokens.clear()
  }
}

/**
 * API test helper with common request patterns
 */
export class ApiHelper {
  private server: TestServer
  private auth: AuthHelper

  constructor(server: TestServer) {
    this.server = server
    this.auth = new AuthHelper(server)
  }

  /**
   * Make authenticated GET request
   */
  async get(path: string, userEmail: string = 'admin@cubcen.test') {
    const headers = await this.auth.getAuthHeader(userEmail)
    return request(this.server.getUrl())
      .get(path)
      .set(headers)
  }

  /**
   * Make authenticated POST request
   */
  async post(path: string, data: any, userEmail: string = 'admin@cubcen.test') {
    const headers = await this.auth.getAuthHeader(userEmail)
    return request(this.server.getUrl())
      .post(path)
      .set(headers)
      .send(data)
  }

  /**
   * Make authenticated PUT request
   */
  async put(path: string, data: any, userEmail: string = 'admin@cubcen.test') {
    const headers = await this.auth.getAuthHeader(userEmail)
    return request(this.server.getUrl())
      .put(path)
      .set(headers)
      .send(data)
  }

  /**
   * Make authenticated DELETE request
   */
  async delete(path: string, userEmail: string = 'admin@cubcen.test') {
    const headers = await this.auth.getAuthHeader(userEmail)
    return request(this.server.getUrl())
      .delete(path)
      .set(headers)
  }

  /**
   * Get auth helper
   */
  getAuth(): AuthHelper {
    return this.auth
  }
}

/**
 * Data validation helpers
 */
export class ValidationHelper {
  /**
   * Validate agent object structure
   */
  static validateAgent(agent: any): void {
    expect(agent).toHaveProperty('id')
    expect(agent).toHaveProperty('name')
    expect(agent).toHaveProperty('platformId')
    expect(agent).toHaveProperty('platformType')
    expect(agent).toHaveProperty('status')
    expect(agent).toHaveProperty('capabilities')
    expect(agent).toHaveProperty('configuration')
    expect(agent).toHaveProperty('healthStatus')
    expect(agent).toHaveProperty('createdAt')
    expect(agent).toHaveProperty('updatedAt')
  }

  /**
   * Validate task object structure
   */
  static validateTask(task: any): void {
    expect(task).toHaveProperty('id')
    expect(task).toHaveProperty('name')
    expect(task).toHaveProperty('agentId')
    expect(task).toHaveProperty('status')
    expect(task).toHaveProperty('priority')
    expect(task).toHaveProperty('scheduledAt')
    expect(task).toHaveProperty('parameters')
    expect(task).toHaveProperty('createdAt')
    expect(task).toHaveProperty('updatedAt')
  }

  /**
   * Validate platform object structure
   */
  static validatePlatform(platform: any): void {
    expect(platform).toHaveProperty('id')
    expect(platform).toHaveProperty('name')
    expect(platform).toHaveProperty('type')
    expect(platform).toHaveProperty('baseUrl')
    expect(platform).toHaveProperty('status')
    expect(platform).toHaveProperty('lastSyncAt')
    expect(platform).toHaveProperty('createdAt')
    expect(platform).toHaveProperty('updatedAt')
  }

  /**
   * Validate user object structure
   */
  static validateUser(user: any): void {
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('name')
    expect(user).toHaveProperty('role')
    expect(user).toHaveProperty('isActive')
    expect(user).toHaveProperty('createdAt')
    expect(user).toHaveProperty('updatedAt')
    expect(user).not.toHaveProperty('password') // Should not expose password
  }
}

/**
 * Wait for condition helper
 */
export async function waitFor(
  condition: () => Promise<boolean> | boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error(`Condition not met within ${timeout}ms`)
}

/**
 * Mock external API responses
 */
export class MockApiHelper {
  /**
   * Mock n8n API responses
   */
  static mockN8nResponses() {
    // Mock implementation would go here
    // For now, we'll use the existing mock adapters
  }

  /**
   * Mock Make.com API responses
   */
  static mockMakeResponses() {
    // Mock implementation would go here
    // For now, we'll use the existing mock adapters
  }
}