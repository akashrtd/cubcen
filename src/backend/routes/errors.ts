// Cubcen Error Reporting API
// Handles client-side error reporting and logging

import express from 'express'
import { z } from 'zod'
import { structuredLogger as logger } from '@/lib/logger'
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/audit-logger'
import { validateRequest } from '@/backend/middleware/validation'
import { authenticate } from '@/backend/middleware/auth'
import {
  createErrorResponse,
  errorHandler,
  APIErrorCode,
} from '@/lib/api-error-handler'

const router = express.Router()

// Error report schema
const ErrorReportSchema = z.object({
  errorId: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  pageName: z.string().optional(),
  timestamp: z.string(),
  userAgent: z.string().optional(),
  url: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// User error report schema
const UserErrorReportSchema = z.object({
  errorId: z.string(),
  userDescription: z.string(),
  reproductionSteps: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// Error query schema
const ErrorQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  pageName: z.string().optional(),
  resolved: z.coerce.boolean().optional(),
})

/**
 * POST /api/cubcen/v1/errors/report
 * Report a client-side error
 */
router.post(
  '/report',
  validateRequest({ body: ErrorReportSchema }),
  async (req, res) => {
    try {
      const errorData = req.body
      const requestId = req.headers['x-request-id'] as string

      // Log the error with structured data
      logger.error('Client-side error reported', new Error(errorData.message), {
        errorId: errorData.errorId,
        pageName: errorData.pageName,
        url: errorData.url,
        userAgent: errorData.userAgent,
        timestamp: errorData.timestamp,
        requestId,
        stack: errorData.stack,
        componentStack: errorData.componentStack,
        metadata: errorData.metadata,
      })

      // Store error in database for tracking
      await storeError({
        ...errorData,
        requestId,
        ipAddress: req.ip,
        userId: req.user?.id,
        userEmail: req.user?.email,
        severity: determineSeverity(errorData.message, errorData.stack),
        resolved: false,
      })

      // Log audit event for error reporting
      if (req.user) {
        await auditLogger.logEvent({
          eventType: AuditEventType.SYSTEM_CONFIG_CHANGED,
          severity: AuditSeverity.LOW,
          userId: req.user!.id,
          userEmail: req.user!.email,
          action: 'ERROR_REPORTED',
          description: `User reported client-side error: ${errorData.message}`,
          metadata: {
            errorId: errorData.errorId,
            pageName: errorData.pageName,
            url: errorData.url,
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requestId,
          timestamp: new Date(),
          success: true,
        })
      }

      res.json({
        success: true,
        message: 'Error reported successfully',
        data: {
          errorId: errorData.errorId,
          reported: true,
        },
      })
    } catch (error) {
      errorHandler(error as Error, req, res, () => {})
    }
  }
)

/**
 * POST /api/cubcen/v1/errors/user-report
 * Report an error with user description
 */
router.post(
  '/user-report',
  authenticate,
  validateRequest({ body: UserErrorReportSchema }),
  async (req, res) => {
    try {
      const reportData = req.body
      const requestId = req.headers['x-request-id'] as string

      // Log the user error report
      logger.info('User error report submitted', {
        errorId: reportData.errorId,
        userId: req.user!.id,
        userEmail: req.user!.email,
        userDescription: reportData.userDescription,
        requestId,
      })

      // Update error record with user feedback
      await updateErrorWithUserFeedback(reportData.errorId, {
        userDescription: reportData.userDescription,
        reproductionSteps: reportData.reproductionSteps,
        expectedBehavior: reportData.expectedBehavior,
        actualBehavior: reportData.actualBehavior,
        userReportedAt: new Date(),
        userId: req.user!.id,
        userEmail: req.user!.email,
      })

      // Log audit event
      await auditLogger.logEvent({
        eventType: AuditEventType.DATA_ACCESSED,
        severity: AuditSeverity.LOW,
        userId: req.user!.id,
        userEmail: req.user!.email,
        action: 'USER_ERROR_REPORT',
        description: `User provided additional details for error ${reportData.errorId}`,
        metadata: {
          errorId: reportData.errorId,
          hasReproductionSteps: !!reportData.reproductionSteps,
          hasExpectedBehavior: !!reportData.expectedBehavior,
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestId,
        timestamp: new Date(),
        success: true,
      })

      res.json({
        success: true,
        message: 'User error report submitted successfully',
        data: {
          errorId: reportData.errorId,
          userReported: true,
        },
      })
    } catch (error) {
      errorHandler(error as Error, req, res, () => {})
    }
  }
)

/**
 * GET /api/cubcen/v1/errors
 * Get error reports (admin only)
 */
router.get(
  '/',
  authenticate,
  validateRequest({ query: ErrorQuerySchema }),
  async (req, res) => {
    try {
      // Check if user has admin permissions
      if (req.user!.role !== 'ADMIN') {
        return res
          .status(403)
          .json(
            createErrorResponse(
              APIErrorCode.INSUFFICIENT_PERMISSIONS,
              'Admin access required'
            )
          )
      }

      const query = ErrorQuerySchema.parse(req.query)
      const requestId = req.headers['x-request-id'] as string

      const errors = await getErrors({
        page: query.page,
        limit: query.limit,
        severity: query.severity,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        pageName: query.pageName,
        resolved: query.resolved,
      })

      // Log audit event for error access
      await auditLogger.logEvent({
        eventType: AuditEventType.DATA_ACCESSED,
        severity: AuditSeverity.LOW,
        userId: req.user!.id,
        userEmail: req.user!.email,
        action: 'ERRORS_ACCESSED',
        description: 'Admin accessed error reports',
        metadata: {
          page: query.page,
          limit: query.limit,
          filters: {
            severity: query.severity,
            pageName: query.pageName,
            resolved: query.resolved,
          },
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestId,
        timestamp: new Date(),
        success: true,
      })

      res.json({
        success: true,
        data: errors,
      })
    } catch (error) {
      errorHandler(error as Error, req, res, () => {})
    }
  }
)

/**
 * PUT /api/cubcen/v1/errors/:errorId/resolve
 * Mark an error as resolved (admin only)
 */
router.put('/:errorId/resolve', authenticate, async (req, res) => {
  try {
    // Check if user has admin permissions
    if (req.user!.role !== 'ADMIN') {
      return res
        .status(403)
        .json(
          createErrorResponse(
            APIErrorCode.INSUFFICIENT_PERMISSIONS,
            'Admin access required'
          )
        )
    }

    const { errorId } = req.params
    const { resolution, notes } = req.body
    const requestId = req.headers['x-request-id'] as string

    await resolveError(errorId, {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: req.user!.id,
      resolution,
      notes,
    })

    // Log audit event
    await auditLogger.logEvent({
      eventType: AuditEventType.SYSTEM_CONFIG_CHANGED,
      severity: AuditSeverity.MEDIUM,
      userId: req.user!.id,
      userEmail: req.user!.email,
      resourceType: 'error',
      resourceId: errorId,
      action: 'ERROR_RESOLVED',
      description: `Admin marked error ${errorId} as resolved`,
      metadata: {
        resolution,
        notes,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestId,
      timestamp: new Date(),
      success: true,
    })

    res.json({
      success: true,
      message: 'Error marked as resolved',
      data: {
        errorId,
        resolved: true,
      },
    })
  } catch (error) {
    errorHandler(error as Error, req, res, () => {})
  }
})

// Helper functions

async function storeError(errorData: any): Promise<void> {
  try {
    // In a real implementation, this would store in a dedicated errors table
    // For now, we'll use the audit log system
    await auditLogger.logEvent({
      eventType: AuditEventType.SYSTEM_CONFIG_CHANGED,
      severity:
        errorData.severity === 'critical'
          ? AuditSeverity.CRITICAL
          : errorData.severity === 'high'
            ? AuditSeverity.HIGH
            : errorData.severity === 'medium'
              ? AuditSeverity.MEDIUM
              : AuditSeverity.LOW,
      userId: errorData.userId,
      userEmail: errorData.userEmail,
      action: 'CLIENT_ERROR',
      description: `Client-side error: ${errorData.message}`,
      metadata: {
        errorId: errorData.errorId,
        stack: errorData.stack,
        componentStack: errorData.componentStack,
        pageName: errorData.pageName,
        url: errorData.url,
        userAgent: errorData.userAgent,
        severity: errorData.severity,
        resolved: errorData.resolved,
      },
      ipAddress: errorData.ipAddress,
      userAgent: errorData.userAgent,
      requestId: errorData.requestId,
      timestamp: new Date(errorData.timestamp),
      success: false,
      errorMessage: errorData.message,
    })
  } catch (error) {
    logger.error('Failed to store error report', error as Error)
  }
}

async function updateErrorWithUserFeedback(
  errorId: string,
  feedback: any
): Promise<void> {
  try {
    // In a real implementation, this would update the errors table
    // For now, we'll log the feedback as an audit event
    await auditLogger.logEvent({
      eventType: AuditEventType.DATA_ACCESSED,
      severity: AuditSeverity.LOW,
      userId: feedback.userId,
      userEmail: feedback.userEmail,
      resourceType: 'error',
      resourceId: errorId,
      action: 'ERROR_FEEDBACK',
      description: `User provided feedback for error ${errorId}`,
      metadata: {
        userDescription: feedback.userDescription,
        reproductionSteps: feedback.reproductionSteps,
        expectedBehavior: feedback.expectedBehavior,
        actualBehavior: feedback.actualBehavior,
      },
      timestamp: feedback.userReportedAt,
      success: true,
    })
  } catch (error) {
    logger.error('Failed to update error with user feedback', error as Error)
  }
}

async function getErrors(filters: any): Promise<any> {
  try {
    // In a real implementation, this would query the errors table
    // For now, we'll return audit logs related to errors
    const auditLogs = await auditLogger.getAuditLogs({
      startDate: filters.startDate,
      endDate: filters.endDate,
      page: filters.page,
      limit: filters.limit,
    })

    // Filter for error-related events
    const errorLogs = auditLogs.logs.filter(
      log =>
        log.action === 'CLIENT_ERROR' ||
        log.action === 'ERROR_FEEDBACK' ||
        log.action === 'ERROR_RESOLVED'
    )

    return {
      errors: errorLogs,
      total: errorLogs.length,
      page: filters.page,
      limit: filters.limit,
    }
  } catch (error) {
    logger.error('Failed to get errors', error as Error)
    throw error
  }
}

async function resolveError(errorId: string, resolution: any): Promise<void> {
  try {
    // In a real implementation, this would update the errors table
    // For now, we'll log the resolution as an audit event
    await auditLogger.logEvent({
      eventType: AuditEventType.SYSTEM_CONFIG_CHANGED,
      severity: AuditSeverity.MEDIUM,
      userId: resolution.resolvedBy,
      resourceType: 'error',
      resourceId: errorId,
      action: 'ERROR_RESOLVED',
      description: `Error ${errorId} marked as resolved`,
      metadata: {
        resolution: resolution.resolution,
        notes: resolution.notes,
        resolvedAt: resolution.resolvedAt,
      },
      timestamp: resolution.resolvedAt,
      success: true,
    })
  } catch (error) {
    logger.error('Failed to resolve error', error as Error)
  }
}

function determineSeverity(
  message: string,
  stack?: string
): 'low' | 'medium' | 'high' | 'critical' {
  const lowerMessage = message.toLowerCase()
  const lowerStack = stack?.toLowerCase() || ''

  // Critical errors
  if (
    lowerMessage.includes('network error') ||
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('authentication') ||
    lowerStack.includes('auth')
  ) {
    return 'critical'
  }

  // High severity errors
  if (
    lowerMessage.includes('cannot read') ||
    lowerMessage.includes('undefined') ||
    lowerMessage.includes('null') ||
    lowerStack.includes('typeerror')
  ) {
    return 'high'
  }

  // Medium severity errors
  if (
    lowerMessage.includes('validation') ||
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('error')
  ) {
    return 'medium'
  }

  // Default to low severity
  return 'low'
}

export default router
