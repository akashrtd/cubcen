/**
 * Cubcen SDK Error Classes
 * Custom error types for the Cubcen API client
 */

export class CubcenError extends Error {
  public readonly code: string
  public readonly statusCode?: number
  public readonly requestId?: string
  public readonly details?: unknown

  constructor(
    message: string,
    code: string = 'CUBCEN_ERROR',
    statusCode?: number,
    requestId?: string,
    details?: unknown
  ) {
    super(message)
    this.name = 'CubcenError'
    this.code = code
    this.statusCode = statusCode
    this.requestId = requestId
    this.details = details

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CubcenError)
    }
  }
}

export class CubcenAuthenticationError extends CubcenError {
  constructor(message: string = 'Authentication failed', requestId?: string, details?: unknown) {
    super(message, 'AUTHENTICATION_ERROR', 401, requestId, details)
    this.name = 'CubcenAuthenticationError'
  }
}

export class CubcenAuthorizationError extends CubcenError {
  constructor(message: string = 'Access denied', requestId?: string, details?: unknown) {
    super(message, 'AUTHORIZATION_ERROR', 403, requestId, details)
    this.name = 'CubcenAuthorizationError'
  }
}

export class CubcenValidationError extends CubcenError {
  constructor(message: string = 'Validation failed', requestId?: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, requestId, details)
    this.name = 'CubcenValidationError'
  }
}

export class CubcenNotFoundError extends CubcenError {
  constructor(message: string = 'Resource not found', requestId?: string, details?: unknown) {
    super(message, 'NOT_FOUND_ERROR', 404, requestId, details)
    this.name = 'CubcenNotFoundError'
  }
}

export class CubcenConflictError extends CubcenError {
  constructor(message: string = 'Resource conflict', requestId?: string, details?: unknown) {
    super(message, 'CONFLICT_ERROR', 409, requestId, details)
    this.name = 'CubcenConflictError'
  }
}

export class CubcenRateLimitError extends CubcenError {
  constructor(message: string = 'Rate limit exceeded', requestId?: string, details?: unknown) {
    super(message, 'RATE_LIMIT_ERROR', 429, requestId, details)
    this.name = 'CubcenRateLimitError'
  }
}

export class CubcenServerError extends CubcenError {
  constructor(message: string = 'Internal server error', requestId?: string, details?: unknown) {
    super(message, 'SERVER_ERROR', 500, requestId, details)
    this.name = 'CubcenServerError'
  }
}

export class CubcenNetworkError extends CubcenError {
  constructor(message: string = 'Network error', requestId?: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', undefined, requestId, details)
    this.name = 'CubcenNetworkError'
  }
}

export class CubcenTimeoutError extends CubcenError {
  constructor(message: string = 'Request timeout', requestId?: string, details?: unknown) {
    super(message, 'TIMEOUT_ERROR', 408, requestId, details)
    this.name = 'CubcenTimeoutError'
  }
}

/**
 * Factory function to create appropriate error based on HTTP status code
 */
export function createCubcenError(
  statusCode: number,
  message: string,
  code: string,
  requestId?: string,
  details?: unknown
): CubcenError {
  switch (statusCode) {
    case 400:
      return new CubcenValidationError(message, requestId, details)
    case 401:
      return new CubcenAuthenticationError(message, requestId, details)
    case 403:
      return new CubcenAuthorizationError(message, requestId, details)
    case 404:
      return new CubcenNotFoundError(message, requestId, details)
    case 409:
      return new CubcenConflictError(message, requestId, details)
    case 429:
      return new CubcenRateLimitError(message, requestId, details)
    case 500:
    case 502:
    case 503:
    case 504:
      return new CubcenServerError(message, requestId, details)
    default:
      return new CubcenError(message, code, statusCode, requestId, details)
  }
}