/**
 * API Documentation Tests
 * Tests for OpenAPI/Swagger documentation generation and validation
 */

import request from 'supertest'
import app from '@/server'
import { specs, validateApiSpec } from '@/lib/swagger'

describe('API Documentation', () => {
  describe('OpenAPI Specification', () => {
    it('should generate valid OpenAPI specification', () => {
      expect(validateApiSpec()).toBe(true)
      expect(specs).toBeDefined()
      expect(specs.openapi).toBe('3.0.0')
      expect(specs.info).toBeDefined()
      expect(specs.info.title).toBe('Cubcen API')
      expect(specs.info.version).toBe('1.0.0')
    })

    it('should include required OpenAPI fields', () => {
      expect(specs.info.description).toContain(
        'Cubcen AI Agent Management Platform'
      )
      expect(specs.servers).toBeDefined()
      expect(specs.servers.length).toBeGreaterThan(0)
      expect(specs.components).toBeDefined()
      expect(specs.components.securitySchemes).toBeDefined()
      expect(specs.components.schemas).toBeDefined()
    })

    it('should include security schemes', () => {
      expect(specs.components.securitySchemes.bearerAuth).toBeDefined()
      expect(specs.components.securitySchemes.bearerAuth.type).toBe('http')
      expect(specs.components.securitySchemes.bearerAuth.scheme).toBe('bearer')
      expect(specs.components.securitySchemes.bearerAuth.bearerFormat).toBe(
        'JWT'
      )
    })

    it('should include common schemas', () => {
      const schemas = specs.components.schemas
      expect(schemas.Error).toBeDefined()
      expect(schemas.Agent).toBeDefined()
      expect(schemas.Task).toBeDefined()
      expect(schemas.Platform).toBeDefined()
      expect(schemas.User).toBeDefined()
      expect(schemas.HealthStatus).toBeDefined()
    })

    it('should include API paths', () => {
      expect(specs.paths).toBeDefined()
      expect(Object.keys(specs.paths).length).toBeGreaterThan(0)

      // Check for key endpoints
      const paths = Object.keys(specs.paths)
      expect(paths.some(path => path.includes('/auth/login'))).toBe(true)
      expect(paths.some(path => path.includes('/agents'))).toBe(true)
      expect(paths.some(path => path.includes('/tasks'))).toBe(true)
    })
  })

  describe('Swagger UI Endpoints', () => {
    it('should serve Swagger UI at /api-docs', async () => {
      const response = await request(app).get('/api-docs/').expect(200)

      expect(response.text).toContain('Swagger UI')
      expect(response.text).toContain('Cubcen API')
    })

    it('should serve OpenAPI spec JSON at /api-docs.json', async () => {
      const response = await request(app)
        .get('/api-docs.json')
        .expect(200)
        .expect('Content-Type', /json/)

      expect(response.body.openapi).toBe('3.0.0')
      expect(response.body.info.title).toBe('Cubcen API')
      expect(response.body.paths).toBeDefined()
    })

    it('should include custom CSS styling', async () => {
      const response = await request(app).get('/api-docs/').expect(200)

      expect(response.text).toContain('#3F51B5') // Cubcen primary color
    })
  })

  describe('API Documentation Content', () => {
    it('should document authentication endpoints', () => {
      const authPaths = Object.keys(specs.paths).filter(path =>
        path.includes('/auth/')
      )

      expect(authPaths.length).toBeGreaterThan(0)

      // Check login endpoint documentation
      const loginPath = '/api/cubcen/v1/auth/login'
      if (specs.paths[loginPath]) {
        const loginDoc = specs.paths[loginPath].post
        expect(loginDoc).toBeDefined()
        expect(loginDoc.summary).toBeDefined()
        expect(loginDoc.tags).toContain('Authentication')
        expect(loginDoc.requestBody).toBeDefined()
        expect(loginDoc.responses).toBeDefined()
        expect(loginDoc.responses['200']).toBeDefined()
        expect(loginDoc.responses['401']).toBeDefined()
      }
    })

    it('should document agent endpoints', () => {
      const agentPaths = Object.keys(specs.paths).filter(path =>
        path.includes('/agents')
      )

      expect(agentPaths.length).toBeGreaterThan(0)

      // Check agents list endpoint documentation
      const agentsPath = '/api/cubcen/v1/agents'
      if (specs.paths[agentsPath]) {
        const agentsDoc = specs.paths[agentsPath].get
        expect(agentsDoc).toBeDefined()
        expect(agentsDoc.summary).toBeDefined()
        expect(agentsDoc.tags).toContain('Agents')
        expect(agentsDoc.parameters).toBeDefined()
        expect(agentsDoc.responses).toBeDefined()
        expect(agentsDoc.responses['200']).toBeDefined()
      }
    })

    it('should include proper response schemas', () => {
      const agentsPath = '/api/cubcen/v1/agents'
      if (specs.paths[agentsPath] && specs.paths[agentsPath].get) {
        const response200 = specs.paths[agentsPath].get.responses['200']
        expect(response200.content['application/json'].schema).toBeDefined()

        const schema = response200.content['application/json'].schema
        expect(schema.properties.success).toBeDefined()
        expect(schema.properties.data).toBeDefined()
        expect(schema.properties.message).toBeDefined()
      }
    })

    it('should include error response documentation', () => {
      const loginPath = '/api/cubcen/v1/auth/login'
      if (specs.paths[loginPath] && specs.paths[loginPath].post) {
        const responses = specs.paths[loginPath].post.responses
        expect(responses['400']).toBeDefined()
        expect(responses['401']).toBeDefined()
        expect(responses['429']).toBeDefined()

        // Check error schema reference
        const errorResponse = responses['401']
        expect(errorResponse.content['application/json'].schema.$ref).toBe(
          '#/components/schemas/Error'
        )
      }
    })
  })

  describe('Documentation Generation Failures', () => {
    it('should handle missing route documentation gracefully', () => {
      // This test ensures the documentation generation doesn't fail
      // even if some routes don't have complete documentation
      expect(() => validateApiSpec()).not.toThrow()
    })

    it('should validate schema references', () => {
      const schemas = specs.components.schemas

      // Check that referenced schemas exist
      Object.values(specs.paths).forEach(
        (pathItem: Record<string, unknown>) => {
          Object.values(pathItem).forEach(
            (operation: Record<string, unknown>) => {
              if (operation.responses) {
                Object.values(
                  operation.responses as Record<string, unknown>
                ).forEach((response: Record<string, unknown>) => {
                  if (
                    response.content &&
                    response.content['application/json']
                  ) {
                    const schema = response.content['application/json'].schema
                    if (schema && schema.$ref) {
                      const schemaName = schema.$ref.replace(
                        '#/components/schemas/',
                        ''
                      )
                      expect(schemas[schemaName]).toBeDefined()
                    }
                  }
                })
              }
            }
          )
        }
      )
    })
  })

  describe('API Versioning', () => {
    it('should include version in API paths', () => {
      const paths = Object.keys(specs.paths)
      const versionedPaths = paths.filter(path => path.includes('/v1/'))

      expect(versionedPaths.length).toBeGreaterThan(0)

      // All API paths should include version
      const apiPaths = paths.filter(path => path.startsWith('/api/cubcen/'))
      apiPaths.forEach(path => {
        expect(path).toMatch(/\/v\d+\//)
      })
    })

    it('should document API version in info', () => {
      expect(specs.info.version).toMatch(/^\d+\.\d+\.\d+$/)
    })
  })

  describe('Backward Compatibility', () => {
    it('should maintain consistent schema structure', () => {
      const agentSchema = specs.components.schemas.Agent
      expect(agentSchema).toBeDefined()
      expect(agentSchema.required).toContain('id')
      expect(agentSchema.required).toContain('name')
      expect(agentSchema.required).toContain('platformId')
      expect(agentSchema.required).toContain('platformType')
      expect(agentSchema.required).toContain('status')
    })

    it('should include deprecation warnings for deprecated endpoints', () => {
      // This test would check for deprecated endpoints when they exist
      // For now, we just ensure the structure supports deprecation
      Object.values(specs.paths).forEach(
        (pathItem: Record<string, unknown>) => {
          Object.values(pathItem).forEach(
            (operation: Record<string, unknown>) => {
              if (operation.deprecated) {
                expect(operation.description).toContain('deprecated')
              }
            }
          )
        }
      )
    })
  })
})
