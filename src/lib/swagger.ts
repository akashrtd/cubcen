/**
 * Cubcen API Documentation Configuration
 * OpenAPI/Swagger setup for interactive API documentation
 */

import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'
import { logger } from '@/lib/logger'

// OpenAPI specification configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cubcen API',
      version: '1.0.0',
      description: `
        Cubcen AI Agent Management Platform API
        
        Cubcen is a centralized platform for managing, monitoring, and orchestrating AI agents 
        across multiple automation platforms including n8n, Make.com, and Zapier.
        
        ## Features
        - **Agent Management**: Register, monitor, and control AI agents from multiple platforms
        - **Task Scheduling**: Schedule and execute tasks with retry logic and error handling
        - **Real-time Monitoring**: WebSocket-based real-time updates and notifications
        - **Analytics**: Comprehensive performance metrics and reporting
        - **Error Handling**: Advanced error tracking and recovery mechanisms
        - **Platform Integration**: Extensible adapter framework for different automation platforms
        
        ## Authentication
        All API endpoints (except health checks) require JWT authentication.
        Include the JWT token in the Authorization header: \`Bearer <token>\`
        
        ## Rate Limiting
        - General API endpoints: 100 requests per 15 minutes per IP
        - Authentication endpoints: 5 requests per 15 minutes per IP
        
        ## Error Handling
        All errors follow a consistent format with proper HTTP status codes and detailed error information.
      `,
      contact: {
        name: 'Cubcen API Support',
        email: 'support@cubcen.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.cubcen.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT token obtained from /api/cubcen/v1/auth/login endpoint',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'object',
              required: ['code', 'message', 'timestamp', 'requestId'],
              properties: {
                code: {
                  type: 'string',
                  description: 'Error code identifier',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  description: 'Human-readable error message',
                  example: 'Invalid input parameters',
                },
                details: {
                  type: 'object',
                  description: 'Additional error details (development only)',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'ISO timestamp when error occurred',
                },
                requestId: {
                  type: 'string',
                  description: 'Unique request identifier for tracking',
                  example: 'req_1234567890_abc123',
                },
              },
            },
          },
        },
        Agent: {
          type: 'object',
          required: ['id', 'name', 'platformId', 'platformType', 'status'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique agent identifier',
              example: 'agent_123',
            },
            name: {
              type: 'string',
              description: 'Human-readable agent name',
              example: 'Email Processing Agent',
            },
            platformId: {
              type: 'string',
              description: 'Platform-specific agent identifier',
              example: 'n8n_workflow_456',
            },
            platformType: {
              type: 'string',
              enum: ['n8n', 'make', 'zapier'],
              description: 'Type of automation platform',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'error', 'maintenance'],
              description: 'Current agent status',
            },
            capabilities: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of agent capabilities',
              example: ['email', 'data-processing', 'api-integration'],
            },
            configuration: {
              type: 'object',
              description: 'Agent-specific configuration parameters',
            },
            healthStatus: {
              $ref: '#/components/schemas/HealthStatus',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Agent creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Task: {
          type: 'object',
          required: ['id', 'agentId', 'status', 'priority'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique task identifier',
              example: 'task_789',
            },
            agentId: {
              type: 'string',
              description: 'ID of the agent executing this task',
              example: 'agent_123',
            },
            workflowId: {
              type: 'string',
              description: 'Optional workflow identifier',
              example: 'workflow_456',
            },
            status: {
              type: 'string',
              enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
              description: 'Current task status',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Task execution priority',
            },
            scheduledAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the task is scheduled to run',
            },
            startedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the task started executing',
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the task completed',
            },
            parameters: {
              type: 'object',
              description: 'Task execution parameters',
            },
            result: {
              type: 'object',
              description: 'Task execution result',
            },
            error: {
              type: 'object',
              description: 'Error information if task failed',
            },
          },
        },
        Platform: {
          type: 'object',
          required: ['id', 'name', 'type', 'baseUrl', 'status'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique platform identifier',
              example: 'platform_n8n_001',
            },
            name: {
              type: 'string',
              description: 'Platform display name',
              example: 'n8n Production',
            },
            type: {
              type: 'string',
              enum: ['n8n', 'make', 'zapier'],
              description: 'Platform type',
            },
            baseUrl: {
              type: 'string',
              format: 'uri',
              description: 'Base URL for platform API',
              example: 'https://n8n.company.com',
            },
            status: {
              type: 'string',
              enum: ['connected', 'disconnected', 'error'],
              description: 'Platform connection status',
            },
            lastSyncAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last successful synchronization timestamp',
            },
          },
        },
        HealthStatus: {
          type: 'object',
          required: ['status', 'lastCheck'],
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy', 'degraded'],
              description: 'Health status indicator',
            },
            lastCheck: {
              type: 'string',
              format: 'date-time',
              description: 'Last health check timestamp',
            },
            details: {
              type: 'object',
              description: 'Additional health check details',
            },
          },
        },
        User: {
          type: 'object',
          required: ['id', 'email', 'role'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier',
              example: 'user_123',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@company.com',
            },
            role: {
              type: 'string',
              enum: ['admin', 'operator', 'viewer'],
              description: 'User role for RBAC',
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of user permissions',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/backend/routes/*.ts', './src/backend/routes/**/*.ts'],
}

// Generate OpenAPI specification
export const specs = swaggerJsdoc(swaggerOptions)

// Swagger UI options
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3F51B5 }
    .swagger-ui .scheme-container { background: #f8f9fa; border: 1px solid #e9ecef; }
    .swagger-ui .btn.authorize { background-color: #3F51B5; border-color: #3F51B5; }
    .swagger-ui .btn.authorize:hover { background-color: #303F9F; border-color: #303F9F; }
  `,
  customSiteTitle: 'Cubcen API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'list',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  },
}

/**
 * Setup Swagger documentation middleware
 */
export function setupSwagger(app: Express): void {
  try {
    // Serve Swagger UI
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(specs, swaggerUiOptions)
    )

    // Serve raw OpenAPI spec
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(specs)
    })

    logger.info('Swagger documentation setup completed', {
      docsUrl: '/api-docs',
      specUrl: '/api-docs.json',
    })
  } catch (error) {
    logger.error('Failed to setup Swagger documentation', error as Error)
    throw error
  }
}

/**
 * Validate OpenAPI specification
 */
export function validateApiSpec(): boolean {
  try {
    if (!specs || typeof specs !== 'object') {
      throw new Error('Invalid OpenAPI specification generated')
    }

    if (
      !(specs as OpenAPI.Document).openapi ||
      !(specs as OpenAPI.Document).info ||
      !(specs as OpenAPI.Document).paths
    ) {
      throw new Error('OpenAPI specification missing required fields')
    }

    logger.info('OpenAPI specification validation passed', {
      version: specs.info.version,
      title: specs.info.title,
      pathCount: Object.keys(specs.paths || {}).length,
    })

    return true
  } catch (error) {
    logger.error('OpenAPI specification validation failed', error as Error)
    return false
  }
}
