// Cubcen Input Validation Middleware
// Zod-based validation middleware for API requests

import { Request, Response, NextFunction } from 'express'
import { z, ZodError, ZodSchema } from 'zod'
import { logger } from '@/lib/logger'

/**
 * Validation error response interface
 */
interface ValidationErrorResponse {
  error: {
    code: string
    message: string
    details: Array<{
      field: string
      message: string
      code: string
    }>
    timestamp: string
  }
}

/**
 * Generic validation middleware factory
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      let dataToValidate: unknown

      switch (source) {
        case 'body':
          dataToValidate = req.body
          break
        case 'query':
          dataToValidate = req.query
          break
        case 'params':
          dataToValidate = req.params
          break
        default:
          dataToValidate = req.body
      }

      // Validate the data
      const validatedData = schema.parse(dataToValidate)

      // Replace the original data with validated data
      switch (source) {
        case 'body':
          req.body = validatedData
          break
        case 'query':
          req.query = validatedData
          break
        case 'params':
          req.params = validatedData
          break
      }

      logger.debug('Validation successful', {
        source,
        path: req.path,
        method: req.method
      })

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation failed', {
          source,
          path: req.path,
          method: req.method,
          errors: error.errors
        })

        const validationErrors = error.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))

        const response: ValidationErrorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: validationErrors,
            timestamp: new Date().toISOString()
          }
        }

        res.status(400).json(response)
        return
      }

      logger.error('Unexpected validation error', error as Error, {
        source,
        path: req.path,
        method: req.method
      })

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error during validation',
          timestamp: new Date().toISOString()
        }
      })
    }
  }
}

/**
 * Body validation middleware
 */
export function validateBody(schema: ZodSchema) {
  return validate(schema, 'body')
}

/**
 * Query validation middleware
 */
export function validateQuery(schema: ZodSchema) {
  return validate(schema, 'query')
}

/**
 * Params validation middleware
 */
export function validateParams(schema: ZodSchema) {
  return validate(schema, 'params')
}

/**
 * Combined validation middleware for multiple sources
 */
export function validateRequest(schemas: {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors: Array<{ source: string; field: string; message: string; code: string }> = []

      // Validate body if schema provided
      if (schemas.body) {
        try {
          req.body = schemas.body.parse(req.body)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map((err: z.ZodIssue) => ({
              source: 'body',
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            })))
          }
        }
      }

      // Validate query if schema provided
      if (schemas.query) {
        try {
          req.query = schemas.query.parse(req.query)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map((err: z.ZodIssue) => ({
              source: 'query',
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            })))
          }
        }
      }

      // Validate params if schema provided
      if (schemas.params) {
        try {
          req.params = schemas.params.parse(req.params)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map((err: z.ZodIssue) => ({
              source: 'params',
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            })))
          }
        }
      }

      // If there are validation errors, return them
      if (errors.length > 0) {
        logger.warn('Request validation failed', {
          path: req.path,
          method: req.method,
          errors
        })

        const response: ValidationErrorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: errors.map(err => ({
              field: `${err.source}.${err.field}`,
              message: err.message,
              code: err.code
            })),
            timestamp: new Date().toISOString()
          }
        }

        res.status(400).json(response)
        return
      }

      logger.debug('Request validation successful', {
        path: req.path,
        method: req.method
      })

      next()
    } catch (error) {
      logger.error('Unexpected request validation error', error as Error, {
        path: req.path,
        method: req.method
      })

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error during validation',
          timestamp: new Date().toISOString()
        }
      })
    }
  }
}

/**
 * Sanitize input middleware - removes potentially dangerous characters
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  try {
    // Recursively sanitize object
    function sanitizeObject(obj: unknown): unknown {
      if (typeof obj === 'string') {
        // Remove potentially dangerous characters
        return obj
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+\s*=/gi, '') // Remove event handlers
          .trim()
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject)
      }
      
      if (obj && typeof obj === 'object') {
        const sanitized: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value)
        }
        return sanitized
      }
      
      return obj
    }

    // Sanitize request body, query, and params
    if (req.body) {
      req.body = sanitizeObject(req.body)
    }
    
    if (req.query) {
      req.query = sanitizeObject(req.query)
    }
    
    if (req.params) {
      req.params = sanitizeObject(req.params)
    }

    next()
  } catch (error) {
    logger.error('Input sanitization error', error as Error, {
      path: req.path,
      method: req.method
    })

    res.status(500).json({
      error: {
        code: 'SANITIZATION_ERROR',
        message: 'Input sanitization failed',
        timestamp: new Date().toISOString()
      }
    })
  }
}

/**
 * Rate limiting validation schema
 */
export const rateLimitSchema = z.object({
  'x-forwarded-for': z.string().optional(),
  'x-real-ip': z.string().optional()
})

/**
 * Common parameter schemas
 */
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required')
})

export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  ...paginationQuerySchema.shape
})

/**
 * File upload validation schema
 */
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimetype: z.string().min(1, 'MIME type is required'),
  size: z.number().min(1).max(10 * 1024 * 1024, 'File size must be less than 10MB')
})