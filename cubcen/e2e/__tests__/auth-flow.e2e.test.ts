import { TestServer } from '../utils/test-server'
import { ApiHelper, ValidationHelper } from '../utils/test-helpers'
import request from 'supertest'

describe('Authentication Flow E2E Tests', () => {
  let server: TestServer
  let api: ApiHelper

  beforeAll(async () => {
    server = new TestServer()
    await server.start()
    api = new ApiHelper(server)
  })

  afterAll(async () => {
    await server.cleanup()
  })

  describe('User Registration and Login', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@cubcen.test',
        password: 'newpassword123',
        name: 'New Test User',
        role: 'operator'
      }

      const response = await request(server.getUrl())
        .post('/api/cubcen/v1/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      ValidationHelper.validateUser(response.body.user)
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user.name).toBe(userData.name)
      expect(response.body.user.role).toBe(userData.role)
    })

    it('should prevent duplicate user registration', async () => {
      const userData = {
        email: 'admin@cubcen.test', // Existing user
        password: 'password123',
        name: 'Duplicate User',
        role: 'operator'
      }

      const response = await request(server.getUrl())
        .post('/api/cubcen/v1/auth/register')
        .send(userData)
        .expect(409)

      expect(response.body.error).toContain('already exists')
    })

    it('should login with valid credentials', async () => {
      const response = await request(server.getUrl())
        .post('/api/cubcen/v1/auth/login')
        .send({
          email: 'admin@cubcen.test',
          password: 'testpassword123'
        })
        .expect(200)

      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      ValidationHelper.validateUser(response.body.user)
      expect(response.body.user.email).toBe('admin@cubcen.test')
    })

    it('should reject invalid credentials', async () => {
      const response = await request(server.getUrl())
        .post('/api/cubcen/v1/auth/login')
        .send({
          email: 'admin@cubcen.test',
          password: 'wrongpassword'
        })
        .expect(401)

      expect(response.body.error).toContain('Invalid credentials')
    })

    it('should reject login for inactive user', async () => {
      // First create an inactive user
      const prisma = server.getPrisma()
      await prisma.user.create({
        data: {
          email: 'inactive@cubcen.test',
          password: '$2a$10$test.hash', // Dummy hash
          name: 'Inactive User',
          role: 'viewer',
          isActive: false
        }
      })

      const response = await request(server.getUrl())
        .post('/api/cubcen/v1/auth/login')
        .send({
          email: 'inactive@cubcen.test',
          password: 'testpassword123'
        })
        .expect(401)

      expect(response.body.error).toContain('Account is inactive')
    })
  })

  describe('Token Validation and Refresh', () => {
    let validToken: string

    beforeAll(async () => {
      validToken = await api.getAuth().loginAs('admin@cubcen.test')
    })

    it('should access protected routes with valid token', async () => {
      const response = await request(server.getUrl())
        .get('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should reject requests with invalid token', async () => {
      const response = await request(server.getUrl())
        .get('/api/cubcen/v1/agents')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body.error).toContain('Invalid token')
    })

    it('should reject requests without token', async () => {
      const response = await request(server.getUrl())
        .get('/api/cubcen/v1/agents')
        .expect(401)

      expect(response.body.error).toContain('No token provided')
    })
  })

  describe('Role-Based Access Control', () => {
    it('should allow admin to access all resources', async () => {
      const adminToken = await api.getAuth().loginAs('admin@cubcen.test')

      // Test various admin-only endpoints
      await request(server.getUrl())
        .get('/api/cubcen/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      await request(server.getUrl())
        .get('/api/cubcen/v1/platforms')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
    })

    it('should restrict viewer access to read-only operations', async () => {
      const viewerToken = await api.getAuth().loginAs('viewer@cubcen.test')

      // Should allow read operations
      await request(server.getUrl())
        .get('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200)

      // Should deny write operations
      await request(server.getUrl())
        .post('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ name: 'Test Agent' })
        .expect(403)
    })

    it('should allow operator to manage agents and tasks', async () => {
      const operatorToken = await api.getAuth().loginAs('operator@cubcen.test')

      // Should allow agent operations
      await request(server.getUrl())
        .get('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200)

      // Should deny user management
      await request(server.getUrl())
        .get('/api/cubcen/v1/users')
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(403)
    })
  })

  describe('Session Management', () => {
    it('should logout and invalidate token', async () => {
      const token = await api.getAuth().loginAs('admin@cubcen.test')

      // Logout
      await request(server.getUrl())
        .post('/api/cubcen/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Token should be invalid after logout
      await request(server.getUrl())
        .get('/api/cubcen/v1/agents')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
    })
  })
})