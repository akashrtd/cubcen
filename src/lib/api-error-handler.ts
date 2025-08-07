// Cubcen API Error Handler
// Centralized error handling utilities for consistent API responses

import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { structuredLogger as logger } from '@/lib/logger'
import { AuthenticationError, AuthorizationError } from '@/types/auth'

/**
 * Standard API error response interface
 */
export interface APIErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
    timestamp: string
    requestId?: string
  }
}

/**
 * Standard API success response interface
 */
export interface APISuccessResponse<T = unknown> {
  success: true
  data?: T
  message?: string
  timestamp?: string
  requestId?: string
}

/**
 * API response type union
 */
export type APIResponse<T = unknown> = APISuccessResponse<T> | APIErrorResponse

/**
 * Error codes enum for consistent error handling
 */
export enum APIErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Authentication & Authorization errors
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',

  // Business logic errors
  INVALID_OPERATION = 'INVALID_OPERATION',
  OPERATION_FAILED = 'OPERATION_FAILED',
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',

  // External service errors
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  PLATFORM_CONNECTION_FAILED = 'PLATFORM_CONNECTION_FAILED',
  SYNC_FAILED = 'SYNC_FAILED',

  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
}

/**
 * HTTP status code mapping for error codes
 */
const ERROR_STATUS_MAP: Record<APIErrorCode, number> = {
  [APIErrorCode.VALIDATION_ERROR]: 400,
  [APIErrorCode.INVALID_REQUEST]: 400,
  [APIErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [APIErrorCode.AUTHENTICATION_FAILED]: 401,
  [APIErrorCode.AUTHORIZATION_FAILED]: 403,
  [APIErrorCode.INVALID_TOKEN]: 401,
  [APIErrorCode.TOKEN_EXPIRED]: 401,
  [APIErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [APIErrorCode.RESOURCE_NOT_FOUND]: 404,
  [APIErrorCode.RESOURCE_ALREADY_EXISTS]: 409,
  [APIErrorCode.RESOURCE_CONFLICT]: 409,
  [APIErrorCode.INVALID_OPERATION]: 400,
  [APIErrorCode.OPERATION_FAILED]: 422,
  [APIErrorCode.PRECONDITION_FAILED]: 412,
  [APIErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [APIErrorCode.PLATFORM_CONNECTION_FAILED]: 502,
  [APIErrorCode.SYNC_FAILED]: 502,
  [APIErrorCode.INTERNAL_ERROR]: 500,
  [APIErrorCode.DATABASE_ERROR]: 500,
  [APIErrorCode.NETWORK_ERROR]: 503,
  [APIErrorCode.TIMEOUT_ERROR]: 504,
  [APIErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [APIErrorCode.TOO_MANY_REQUESTS]: 429,
}

/**
 * Custom API Error class
 */
export class APIError extends Error {
  public readonly code: APIErrorCode
  public readonly statusCode: number
  public readonly details?: unknown
  public readonly isOperational: boolean

  constructor(
    code: APIErrorCode,
    message: string,
    details?: unknown,
    isOperational = true
  ) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.statusCode = ERROR_STATUS_MAP[code] || 500
    this.details = details
    this.isOperational = isOperational

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, APIError)
  }
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  requestId?: string
): APISuccessResponse<T> {
  const response: APISuccessResponse<T> = {
    success: true,
    timestamp: new Date().toISOString(),
  }
  if (data !== undefined) {
    response.data = data
  }
  if (message) {
    response.message = message
  }
  if (requestId) {
    response.requestId = requestId
  }
  return response
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: APIErrorCode,
  message: string,
  details?: unknown,
  requestId?: string
): APIErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    },
  }
}

/**
 * Handle Zod validation errors
 */
export function handleValidationError(
  error: ZodError,
  requestId?: string
): APIErrorResponse {
  const validationErrors = error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }))

  return createErrorResponse(
    APIErrorCode.VALIDATION_ERROR,
    'Request validation failed',
    validationErrors,
    requestId
  )
}

/**
 * Handle authentication errors
 */
export function handleAuthError(
  error: AuthenticationError,
  requestId?: string
): APIErrorResponse {
  const errorCodeMap: Record<string, APIErrorCode> = {
    INVALID_TOKEN: APIErrorCode.INVALID_TOKEN,
    TOKEN_EXPIRED: APIErrorCode.TOKEN_EXPIRED,
    AUTHENTICATION_FAILED: APIErrorCode.AUTHENTICATION_FAILED,
  }

  const code = errorCodeMap[error.code] || APIErrorCode.AUTHENTICATION_FAILED

  return createErrorResponse(code, error.message, undefined, requestId)
}

/**
 * Handle authorization errors
 */
export function handleAuthzError(
  error: AuthorizationError,
  requestId?: string
): APIErrorResponse {
  const errorCodeMap: Record<string, APIErrorCode> = {
    INSUFFICIENT_PERMISSIONS: APIErrorCode.INSUFFICIENT_PERMISSIONS,
    AUTHORIZATION_FAILED: APIErrorCode.AUTHORIZATION_FAILED,
  }

  const code = errorCodeMap[error.code] || APIErrorCode.AUTHORIZATION_FAILED

  return createErrorResponse(code, error.message, undefined, requestId)
}

/**
 * Handle database errors
 */
export function handleDatabaseError(
  error: Error,
  requestId?: string
): APIErrorResponse {
  // Don't expose internal database errors to clients
  logger.error('Database error', error, { requestId })

  if (error.message.includes('UNIQUE constraint')) {
    return createErrorResponse(
      APIErrorCode.RESOURCE_ALREADY_EXISTS,
      'Resource already exists',
      undefined,
      requestId
    )
  }

  if (error.message.includes('NOT NULL constraint')) {
    return createErrorResponse(
      APIErrorCode.MISSING_REQUIRED_FIELD,
      'Required field is missing',
      undefined,
      requestId
    )
  }

  if (error.message.includes('FOREIGN KEY constraint')) {
    return createErrorResponse(
      APIErrorCode.RESOURCE_NOT_FOUND,
      'Referenced resource not found',
      undefined,
      requestId
    )
  }

  return createErrorResponse(
    APIErrorCode.DATABASE_ERROR,
    'Database operation failed',
    undefined,
    requestId
  )
}

/**
 * Handle external service errors
 */
export function handleExternalServiceError(
  error: Error,
  service: string,
  requestId?: string
): APIErrorResponse {
  logger.error(`External service error: ${service}`, error, {
    requestId,
    service,
  })

  if (error.message.includes('timeout')) {
    return createErrorResponse(
      APIErrorCode.TIMEOUT_ERROR,
      `${service} service timeout`,
      undefined,
      requestId
    )
  }

  if (error.message.includes('connection')) {
    return createErrorResponse(
      APIErrorCode.PLATFORM_CONNECTION_FAILED,
      `Failed to connect to ${service}`,
      undefined,
      requestId
    )
  }

  return createErrorResponse(
    APIErrorCode.EXTERNAL_SERVICE_ERROR,
    `${service} service error`,
    undefined,
    requestId
  )
}

/**
 * Generic error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.headers['x-request-id'] as string

  // Log the error
  logger.error('API Error', error, {
    requestId,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.id,
  })

  // Handle specific error types
  if (error instanceof APIError) {
    res
      .status(error.statusCode)
      .json(
        createErrorResponse(error.code, error.message, error.details, requestId)
      )
    return
  }

  if (error instanceof ZodError) {
    res.status(400).json(handleValidationError(error, requestId))
    return
  }

  if (error instanceof AuthenticationError) {
    res.status(401).json(handleAuthError(error, requestId))
    return
  }

  if (error instanceof AuthorizationError) {
    res.status(403).json(handleAuthzError(error, requestId))
    return
  }

  // Handle database errors
  if (error.message.includes('SQLITE') || error.message.includes('database')) {
    res.status(500).json(handleDatabaseError(error, requestId))
    return
  }

  // Default to internal server error
  res
    .status(500)
    .json(
      createErrorResponse(
        APIErrorCode.INTERNAL_ERROR,
        'Internal server error',
        undefined,
        requestId
      )
    )
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Not found handler for API routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  const requestId = req.headers['x-request-id'] as string

  res
    .status(404)
    .json(
      createErrorResponse(
        APIErrorCode.RESOURCE_NOT_FOUND,
        `API endpoint not found: ${req.method} ${req.path}`,
        undefined,
        requestId
      )
    )
}

/**
 * Request ID middleware
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId =
    (req.headers['x-request-id'] as string) ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  req.headers['x-request-id'] = requestId
  res.setHeader('X-Request-ID', requestId)

  next()
}

/**
 * Validation helper for common patterns
 */
export const ValidationHelpers = {
  /**
   * Validate that a resource exists
   */
  requireResource<T>(resource: T | null | undefined, resourceType: string): T {
    if (!resource) {
      throw new APIError(
        APIErrorCode.RESOURCE_NOT_FOUND,
        `${resourceType} not found`
      )
    }
    return resource
  },

  /**
   * Validate that a resource doesn't already exist
   */
  requireUniqueResource<T>(
    resource: T | null | undefined,
    resourceType: string
  ): void {
    if (resource) {
      throw new APIError(
        APIErrorCode.RESOURCE_ALREADY_EXISTS,
        `${resourceType} already exists`
      )
    }
  },

  /**
   * Validate operation permissions
   */
  requirePermission(condition: boolean, message: string): void {
    if (!condition) {
      throw new APIError(APIErrorCode.INSUFFICIENT_PERMISSIONS, message)
    }
  },

  /**
   * Validate business logic preconditions
   */
  requirePrecondition(condition: boolean, message: string): void {
    if (!condition) {
      throw new APIError(APIErrorCode.PRECONDITION_FAILED, message)
    }
  },
}
