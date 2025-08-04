// Cubcen Security Middleware
// Comprehensive security middleware for input sanitization, CSRF protection, and security headers

import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import crypto from 'crypto'
import structuredLogger from '@/lib/logger'

/**
 * Enhanced input sanitization middleware
 */
export function sanitizeInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Recursively sanitize object with comprehensive XSS protection
    function sanitizeObject(obj: unknown): unknown {
      if (typeof obj === 'string') {
        return (
          obj
            // Remove script tags and their content
            .replace(/<script\b[^<]*(?:(?!<\/script>)[^<]*)*<\/script>/gi, '')
            // Remove javascript: protocol
            .replace(/javascript:/gi, '')
            // Remove vbscript: protocol
            .replace(/vbscript:/gi, '')
            // Remove data: protocol (except for images)
            .replace(/data:(?!image\/)/gi, '')
            // Remove event handlers
            .replace(/on\w+\s*=/gi, '')
            // Remove style attributes that could contain expressions
            .replace(/style\s*=\s*["'][^"']*expression\s*\([^"']*["']/gi, '')
            // Remove potentially dangerous HTML tags
            .replace(
              /<(iframe|object|embed|form|input|textarea|select|option|button|link|meta|base|applet|frame|frameset|noframes|noscript)\b[^>]*>/gi,
              ''
            )
            // Remove HTML comments that could contain malicious code
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove SQL injection patterns
            .replace(
              /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
              ''
            )
            // Trim whitespace
            .trim()
        )
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject)
      }

      if (obj && typeof obj === 'object') {
        const sanitized: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(obj)) {
          // Sanitize the key as well
          const sanitizedKey =
            typeof key === 'string' ? (sanitizeObject(key) as string) : key
          sanitized[sanitizedKey] = sanitizeObject(value)
        }
        return sanitized
      }

      return obj
    }

    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body)
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery = sanitizeObject(req.query) as Record<
        string,
        unknown
      >
      req.query = sanitizedQuery as Query
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      const sanitizedParams = sanitizeObject(req.params) as Record<
        string,
        unknown
      >
      req.params = sanitizedParams as ParamsDictionary
    }

    // Log suspicious input patterns
    const originalUrl = req.originalUrl
    if (
      originalUrl.includes('<script') ||
      originalUrl.includes('javascript:') ||
      originalUrl.includes('union select')
    ) {
      structuredLogger.warn('Suspicious input detected and sanitized', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        originalUrl,
        timestamp: new Date().toISOString(),
      })
    }

    next()
  } catch (error) {
    structuredLogger.error('Input sanitization error', error as Error, {
      path: req.path,
      method: req.method,
      ip: req.ip,
    })

    res.status(500).json({
      error: {
        code: 'SANITIZATION_ERROR',
        message: 'Input sanitization failed',
        timestamp: new Date().toISOString(),
      },
    })
    return
  }
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Skip CSRF protection for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next()
    }

    // Skip CSRF protection for API endpoints with valid JWT tokens
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return next()
    }

    // Check for CSRF token in headers or body
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf
    const sessionCsrfToken = req.session?.csrfToken

    if (!csrfToken || !sessionCsrfToken || csrfToken !== sessionCsrfToken) {
      structuredLogger.warn('CSRF token validation failed', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        hasToken: !!csrfToken,
        hasSessionToken: !!sessionCsrfToken,
        tokensMatch: csrfToken === sessionCsrfToken,
      })

      res.status(403).json({
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'CSRF token validation failed',
          timestamp: new Date().toISOString(),
        },
      })
      return
    }

    next()
  } catch (error) {
    structuredLogger.error('CSRF protection error', error as Error, {
      path: req.path,
      method: req.method,
      ip: req.ip,
    })

    res.status(500).json({
      error: {
        code: 'CSRF_PROTECTION_ERROR',
        message: 'CSRF protection failed',
        timestamp: new Date().toISOString(),
      },
    })
    return
  }
}

/**
 * Generate CSRF token endpoint
 */
export function generateCsrfToken(req: Request, res: Response): void {
  try {
    const token = crypto.randomBytes(32).toString('hex')

    // Store token in session (if session middleware is available)
    if (req.session) {
      req.session.csrfToken = token
    }

    res.json({
      csrfToken: token,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    structuredLogger.error('CSRF protection error', error as Error, {
      path: req.path,
      method: req.method,
      ip: req.ip,
    })

    res.status(500).json({
      error: {
        code: 'CSRF_PROTECTION_ERROR',
        message: 'CSRF protection failed',
        timestamp: new Date().toISOString(),
      },
    })
  }
  return
}

/**
 * Security headers middleware
 */
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' ws: wss:",
        "media-src 'self'",
        "object-src 'none'",
        "child-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'self'",
      ].join('; ')
    )

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff')

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY')

    // XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block')

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Permissions policy
    res.setHeader(
      'Permissions-Policy',
      [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()',
      ].join(', ')
    )

    // Strict Transport Security (HTTPS only)
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      )
    }

    // Remove server information
    res.removeHeader('X-Powered-By')
    res.removeHeader('Server')
  } catch (error) {
    structuredLogger.error('Security headers error', error as Error, {
      path: req.path,
      method: req.method,
      ip: req.ip,
    })

    res.status(500).json({
      error: {
        code: 'SECURITY_HEADERS_ERROR',
        message: 'Failed to set security headers',
        timestamp: new Date().toISOString(),
      },
    })
    return
  }
  next()
}

/**
 * Request size limiting middleware
 */
export function requestSizeLimit(maxSize: number = 10 * 1024 * 1024) {
  // 10MB default
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10)

    if (contentLength > maxSize) {
      structuredLogger.warn('Request size limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        contentLength,
        maxSize,
      })

      res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `Request size exceeds limit of ${maxSize} bytes`,
          timestamp: new Date().toISOString(),
        },
      })
      return
    }

    next()
  }
}

/**
 * IP whitelist middleware
 */
export function ipWhitelist(allowedIPs: string[] = []) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (allowedIPs.length === 0) {
      return next() // No whitelist configured, allow all
    }

    const clientIP =
      req.ip || req.connection.remoteAddress || req.socket.remoteAddress

    if (!clientIP || !allowedIPs.includes(clientIP)) {
      structuredLogger.warn('IP not in whitelist', {
        ip: clientIP,
        allowedIPs,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      })

      res.status(403).json({
        error: {
          code: 'IP_NOT_ALLOWED',
          message: 'Access denied from this IP address',
          timestamp: new Date().toISOString(),
        },
      })
      return
    }

    next()
  }
}

/**
 * Suspicious activity detection middleware
 */
export function suspiciousActivityDetection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const suspiciousPatterns = [
    // SQL injection patterns
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(from|where|into|values|set)\b)/i,
    // XSS patterns
    /<script\b[^<]*(?:(?!<\/script>)[^<]*)*<\/script>/gi,
    /javascript:/i,
    /vbscript:/i,
    // Path traversal patterns
    /\.\.[\/\\]/,
    // Command injection patterns
    /[;&|`$(){}[\]]/,
    // LDAP injection patterns
    /[()=*!&|]/,
  ]

  const requestString = JSON.stringify({
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    params: req.params,
  })

  const suspiciousActivity = suspiciousPatterns.some(pattern =>
    pattern.test(requestString)
  )

  if (suspiciousActivity) {
    structuredLogger.warn('Suspicious activity detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      requestData: requestString,
      timestamp: new Date().toISOString(),
    })

    // In production, you might want to block the request
    if (process.env.NODE_ENV === 'production') {
      res.status(400).json({
        error: {
          code: 'SUSPICIOUS_ACTIVITY',
          message: 'Request contains suspicious patterns',
          timestamp: new Date().toISOString(),
        },
      })
      return
    }
  }

  next()
}

/**
 * File upload security middleware
 */
export function fileUploadSecurity(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.file && !req.files) {
    return next() // No file upload, continue
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/csv',
    'application/json',
    'application/pdf',
  ]

  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const files = req.files
    ? Array.isArray(req.files)
      ? req.files
      : Object.values(req.files).flat()
    : [req.file]

  for (const file of files) {
    if (!file) continue

    // Check file size
    if (file.size > maxFileSize) {
      structuredLogger.warn('File size exceeds limit', {
        filename: file.originalname,
        size: file.size,
        maxSize: maxFileSize,
        ip: req.ip,
      })

      res.status(413).json({
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds limit of ${maxFileSize} bytes`,
          timestamp: new Date().toISOString(),
        },
      })
      return
    }

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      structuredLogger.warn('Disallowed file type uploaded', {
        filename: file.originalname,
        mimetype: file.mimetype,
        allowedTypes: allowedMimeTypes,
        ip: req.ip,
      })

      res.status(400).json({
        error: {
          code: 'INVALID_FILE_TYPE',
          message: `File type ${file.mimetype} is not allowed`,
          timestamp: new Date().toISOString(),
        },
      })
      return
    }

    // Check for executable file extensions
    const dangerousExtensions = [
      '.exe',
      '.bat',
      '.cmd',
      '.com',
      '.pif',
      '.scr',
      '.vbs',
      '.js',
      '.jar',
      '.sh',
    ]
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'))

    if (dangerousExtensions.includes(fileExtension)) {
      structuredLogger.warn('Dangerous file extension detected', {
        filename: file.originalname,
        extension: fileExtension,
        ip: req.ip,
      })

      res.status(400).json({
        error: {
          code: 'DANGEROUS_FILE_EXTENSION',
          message: `File extension ${fileExtension} is not allowed`,
          timestamp: new Date().toISOString(),
        },
      })
      return
    }
  }

  next()
}

/**
 * Advanced rate limiting with progressive penalties
 */
export class AdvancedRateLimiter {
  private attempts: Map<
    string,
    { count: number; firstAttempt: Date; blocked: boolean; blockUntil?: Date }
  > = new Map()
  private readonly maxAttempts: number
  private readonly windowMs: number
  private readonly blockDurationMs: number
  private readonly progressiveMultiplier: number

  constructor(
    options: {
      maxAttempts?: number
      windowMs?: number
      blockDurationMs?: number
      progressiveMultiplier?: number
    } = {}
  ) {
    this.maxAttempts = options.maxAttempts || 5
    this.windowMs = options.windowMs || 15 * 60 * 1000 // 15 minutes
    this.blockDurationMs = options.blockDurationMs || 60 * 1000 // 1 minute
    this.progressiveMultiplier = options.progressiveMultiplier || 2
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void | Response => {
      const key = this.getKey(req)
      const now = new Date()
      const attempt = this.attempts.get(key)

      // Check if currently blocked
      if (attempt?.blocked && attempt.blockUntil && now < attempt.blockUntil) {
        const remainingMs = attempt.blockUntil.getTime() - now.getTime()

        structuredLogger.warn('Request blocked by advanced rate limiter', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method,
          remainingMs,
          attemptCount: attempt.count,
        })

        return res.status(429).json({
          error: {
            code: 'RATE_LIMIT_BLOCKED',
            message: `Too many failed attempts. Blocked for ${Math.ceil(remainingMs / 1000)} seconds.`,
            timestamp: new Date().toISOString(),
            retryAfter: Math.ceil(remainingMs / 1000),
          },
        })
      }

      // Reset if window has passed
      if (
        attempt &&
        now.getTime() - attempt.firstAttempt.getTime() > this.windowMs
      ) {
        this.attempts.delete(key)
      }

      // Check if limit exceeded
      const currentAttempt = this.attempts.get(key)
      if (currentAttempt && currentAttempt.count >= this.maxAttempts) {
        // Calculate progressive block duration
        const blockDuration =
          this.blockDurationMs *
          Math.pow(
            this.progressiveMultiplier,
            Math.floor(currentAttempt.count / this.maxAttempts)
          )
        const blockUntil = new Date(now.getTime() + blockDuration)

        this.attempts.set(key, {
          ...currentAttempt,
          blocked: true,
          blockUntil,
        })

        structuredLogger.warn('IP blocked by advanced rate limiter', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method,
          attemptCount: currentAttempt.count,
          blockDurationMs: blockDuration,
        })

        return res.status(429).json({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many attempts. Blocked for ${Math.ceil(blockDuration / 1000)} seconds.`,
            timestamp: new Date().toISOString(),
            retryAfter: Math.ceil(blockDuration / 1000),
          },
        })
      }

      next()
    }
  }

  public recordAttempt(req: Request, success: boolean): void {
    const key = this.getKey(req)
    const now = new Date()
    const attempt = this.attempts.get(key)

    if (success) {
      // Clear attempts on success
      this.attempts.delete(key)
    } else {
      // Increment failed attempts
      if (attempt) {
        this.attempts.set(key, {
          ...attempt,
          count: attempt.count + 1,
        })
      } else {
        this.attempts.set(key, {
          count: 1,
          firstAttempt: now,
          blocked: false,
        })
      }
    }
  }

  private getKey(req: Request): string {
    return `${req.ip}:${req.path}`
  }

  public cleanup(): void {
    const now = new Date()
    for (const [key, attempt] of this.attempts.entries()) {
      // Remove expired entries
      if (now.getTime() - attempt.firstAttempt.getTime() > this.windowMs * 2) {
        this.attempts.delete(key)
      }
      // Remove unblocked entries
      if (attempt.blocked && attempt.blockUntil && now > attempt.blockUntil) {
        this.attempts.delete(key)
      }
    }
  }
}

/**
 * Honeypot middleware to detect bots
 */
export function honeypotProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  // Check for honeypot field in forms
  if (req.body && req.body.honeypot && req.body.honeypot.trim() !== '') {
    structuredLogger.warn('Honeypot field filled, likely bot detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      honeypotValue: req.body.honeypot,
    })

    // Return success to avoid revealing the honeypot
    return res.status(200).json({
      success: true,
      message: 'Request processed successfully',
    })
  }

  next()
}

/**
 * Geolocation-based access control
 */
export function geolocationFilter(allowedCountries: string[] = []) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (allowedCountries.length === 0) {
      return next() // No restrictions
    }

    // In a real implementation, you would use a GeoIP service
    // For now, we'll just log and continue
    const country =
      req.headers['cf-ipcountry'] || req.headers['x-country-code'] || 'unknown'

    if (
      typeof country === 'string' &&
      !allowedCountries.includes(country.toUpperCase())
    ) {
      structuredLogger.warn('Request from restricted country', {
        ip: req.ip,
        country,
        allowedCountries,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      })

      res.status(403).json({
        error: {
          code: 'GEOGRAPHIC_RESTRICTION',
          message: 'Access denied from this geographic location',
          timestamp: new Date().toISOString(),
        },
      })
      return
    }

    next()
  }
}

/**
 * Request signature validation middleware
 */
export function requestSignatureValidation(secretKey: string) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const signature = req.headers['x-signature'] as string
    const timestamp = req.headers['x-timestamp'] as string

    if (!signature || !timestamp) {
      res.status(400).json({
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'Request signature and timestamp required',
          timestamp: new Date().toISOString(),
        },
      })
      return
    }

    // Check timestamp freshness (prevent replay attacks)
    const requestTime = parseInt(timestamp, 10)
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5 minutes

    if (Math.abs(now - requestTime) > maxAge) {
      structuredLogger.warn('Request timestamp too old or too far in future', {
        ip: req.ip,
        requestTime,
        currentTime: now,
        difference: Math.abs(now - requestTime),
        maxAge,
      })

      res.status(400).json({
        error: {
          code: 'INVALID_TIMESTAMP',
          message: 'Request timestamp is too old or too far in the future',
          timestamp: new Date().toISOString(),
        },
      })
      return
    }

    // Validate signature
    const payload = `${req.method}${req.path}${timestamp}${JSON.stringify(req.body || {})}`
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex')

    if (signature !== expectedSignature) {
      structuredLogger.warn('Invalid request signature', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        providedSignature: signature,
        expectedSignature,
      })

      res.status(401).json({
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Request signature validation failed',
          timestamp: new Date().toISOString(),
        },
      })
      return
    }

    next()
  }
}
