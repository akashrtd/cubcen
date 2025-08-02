/**
 * API Documentation Tests
 * Tests for OpenAPI/Swagger documentation generation and validation
 */

import request from 'supertest'
import { SwaggerDefinition, PathItem, Response } from 'swagger-jsdoc'
import app from '@/server'
import { specs, validateApiSpec } from '@/lib/swagger'

type ExtendedPathItem = PathItem & {
  post?: {
    summary: string
    tags: string[]
    requestBody: object
    responses: { [key: string]: Response }
  }
}

describe('API Documentation', () => {
  const typedSpecs = specs as SwaggerDefinition

  describe('OpenAPI Specification', () => {
    it('should generate valid OpenAPI specification', () => {
      expect(validateApiSpec()).toBe(true)
      expect(typedSpecs).toBeDefined()
      expect(typedSpecs.openapi).toBe('3.0.0')
      expect(typedSpecs.info).toBeDefined()
      expect(typedSpecs.info.title).toBe('Cubcen API')
      expect(typedSpecs.info.version).toBe('1.0.0')
    })

    it('should include required OpenAPI fields', () => {
      expect(typedSpecs.info.description).toContain(
        'Cubcen AI Agent Management Platform'
      )
      expect(typedSpecs.servers).toBeDefined()
      expect(typedSpecs.servers?.length).toBeGreaterThan(0)
      expect(typedSpecs.components).toBeDefined()
      expect(typedSpecs.components?.securitySchemes).toBeDefined()
      expect(typedSpecs.components?.schemas).toBeDefined()
    })

    it('should include security schemes', () => {
      const securitySchemes = typedSpecs.components?.securitySchemes
      const bearerAuth = securitySchemes?.bearerAuth as {
        type: string
        scheme: string
        bearerFormat: string
      }
      expect(bearerAuth).toBeDefined()
      expect(bearerAuth.type).toBe('http')
      expect(bearerAuth.scheme).toBe('bearer')
      expect(bearerAuth.bearerFormat).toBe('JWT')
    })

    it('should include common schemas', () => {
      const schemas = typedSpecs.components?.schemas
      expect(schemas?.Error).toBeDefined()
      expect(schemas?.Agent).toBeDefined()
      expect(schemas?.Task).toBeDefined()
      expect(schemas?.Platform).toBeDefined()
      expect(schemas?.User).toBeDefined()
      expect(schemas?.HealthStatus).toBeDefined()
    })

    it('should include API paths', () => {
      expect(typedSpecs.paths).toBeDefined()
      expect(Object.keys(typedSpecs.paths as object).length).toBeGreaterThan(0)

      // Check for key endpoints
      const paths = Object.keys(typedSpecs.paths as object)
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
      const authPaths = Object.keys(typedSpecs.paths as object).filter(path =>
        path.includes('/auth/')
      )

      expect(authPaths.length).toBeGreaterThan(0)

      // Check login endpoint documentation
      const loginPath = '/api/cubcen/v1/auth/login'
      const loginPathItem = typedSpecs.paths?.[loginPath] as ExtendedPathItem
      if (loginPathItem) {
        const loginDoc = loginPathItem.post
        expect(loginDoc).toBeDefined()
        expect(loginDoc?.summary).toBeDefined()
        expect(loginDoc?.tags).toContain('Authentication')
        expect(loginDoc?.requestBody).toBeDefined()
        expect(loginDoc?.responses).toBeDefined()
        expect(loginDoc?.responses['200']).toBeDefined()
        expect(loginDoc?.responses['401']).toBeDefined()
      }
    })

    it('should document agent endpoints', () => {
      const agentPaths = Object.keys(typedSpecs.paths as object).filter(path =>
        path.includes('/agents')
      )

      expect(agentPaths.length).toBeGreaterThan(0)

      // Check agents list endpoint documentation
      const agentsPath = '/api/cubcen/v1/agents'
      const agentsPathItem = typedSpecs.paths?.[agentsPath] as PathItem
      if (agentsPathItem) {
        const agentsDoc = agentsPathItem.get
        expect(agentsDoc).toBeDefined()
        expect(agentsDoc?.summary).toBeDefined()
        expect(agentsDoc?.tags).toContain('Agents')
        expect(agentsDoc?.parameters).toBeDefined()
        expect(agentsDoc?.responses).toBeDefined()
        expect(agentsDoc?.responses?.['200']).toBeDefined()
      }
    })

    it('should include proper response schemas', () => {
      const agentsPath = '/api/cubcen/v1/agents'
      const agentsPathItem = typedSpecs.paths?.[agentsPath] as PathItem
      if (agentsPathItem && agentsPathItem.get) {
        const response200 = agentsPathItem.get.responses?.['200'] as Response
        const schema = response200.content?.['application/json']
          .schema as { properties: { [key: string]: object } }
        expect(schema).toBeDefined()
        expect(schema.properties.success).toBeDefined()
        expect(schema.properties.data).toBeDefined()
        expect(schema.properties.message).toBeDefined()
      }
    })

    it('should include error response documentation', () => {
      const loginPath = '/api/cubcen/v1/auth/login'
      const loginPathItem = typedSpecs.paths?.[loginPath] as ExtendedPathItem
      if (loginPathItem && loginPathItem.post) {
        const responses = loginPathItem.post.responses
        expect(responses['400']).toBeDefined()
        expect(responses['401']).toBeDefined()
        expect(responses['429']).toBeDefined()

        // Check error schema reference
        const errorResponse = responses['401'] as Response
        const schema = errorResponse.content?.['application/json'].schema as {
          $ref: string
        }
        expect(schema.$ref).toBe('#/components/schemas/Error')
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
      const schemas = typedSpecs.components?.schemas

      // Check that referenced schemas exist
      Object.values(typedSpecs.paths as object).forEach(
        (pathItem: PathItem) => {
          Object.values(pathItem).forEach(operation => {
            if (operation.responses) {
              Object.values(operation.responses).forEach(response => {
                const typedResponse = response as Response
                if (
                  typedResponse.content &&
                  typedResponse.content['application/json']?.schema
                ) {
                  const schema = typedResponse.content['application/json']
                    .schema as { $ref: string }
                  if (schema && schema.$ref) {
                    const schemaName = schema.$ref.replace(
                      '#/components/schemas/',
                      ''
                    )
                    expect(schemas?.[schemaName]).toBeDefined()
                  }
                }
              })
            }
          })
        }
      )
    })
  })

  describe('API Versioning', () => {
    it('should include version in API paths', () => {
      const paths = Object.keys(typedSpecs.paths as object)
      const versionedPaths = paths.filter(path => path.includes('/v1/'))

      expect(versionedPaths.length).toBeGreaterThan(0)

      // All API paths should include version
      const apiPaths = paths.filter(path => path.startsWith('/api/cubcen/'))
      apiPaths.forEach(path => {
        expect(path).toMatch(/\/v\d+\//)
      })
    })

    it('should have correct API version in info', () => {
      expect(typedSpecs.info?.version).toBe('1.0.0')
    })
  })

  describe('Backward Compatibility', () => {
    it('should maintain consistent schema structure', () => {
      const agentSchema = typedSpecs.components?.schemas?.Agent as {
        required: string[]
      }
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
      Object.values(typedSpecs.paths as object).forEach(
        (pathItem: PathItem) => {
          Object.values(pathItem).forEach(operation => {
            if (operation.deprecated) {
              // This is a placeholder for a real test
            }
          })
        }
      )
    })
  })
})
