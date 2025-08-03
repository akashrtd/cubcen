import express from 'express'
import { z } from 'zod'
import { backupService } from '../../lib/backup'
import { requireAuth } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import structuredLogger from '../../lib/logger'

const router = express.Router()

// Validation schemas
const createBackupSchema = {
  body: z.object({
    compress: z.boolean().optional().default(true),
  }),
}

const restoreBackupSchema = {
  body: z.object({
    backupId: z.string().min(1),
  }),
}

const deleteBackupSchema = {
  params: z.object({
    backupId: z.string().min(1),
  }),
}

/**
 * @swagger
 * /api/cubcen/v1/backup:
 *   get:
 *     summary: List all available backups
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available backups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       filename:
 *                         type: string
 *                       size:
 *                         type: number
 *                       compressed:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       version:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const backups = await backupService.listBackups()

    structuredLogger.info('Listed backups', {
      userId: req.user?.id,
      backupCount: backups.length,
    })

    res.json({
      success: true,
      data: backups,
    })
  } catch (error) {
    structuredLogger.error('Failed to list backups', error as Error, {
      userId: req.user?.id,
    })

    res.status(500).json({
      success: false,
      error: {
        code: 'BACKUP_LIST_FAILED',
        message: 'Failed to list backups',
        timestamp: new Date().toISOString(),
      },
    })
  }
})

/**
 * @swagger
 * /api/cubcen/v1/backup:
 *   post:
 *     summary: Create a new database backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               compress:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to compress the backup
 *     responses:
 *       201:
 *         description: Backup created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     filename:
 *                       type: string
 *                     size:
 *                       type: number
 *                     compressed:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Backup operation already in progress
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  requireAuth,
  validateRequest(createBackupSchema),
  async (req, res) => {
    try {
      const { compress } = req.body

      structuredLogger.info('Creating backup', {
        userId: req.user?.id,
        compress,
      })

      const result = await backupService.createBackup(compress)

      if (result.success) {
        structuredLogger.info('Backup created successfully', {
          userId: req.user?.id,
          backupId: result.metadata?.id,
          filename: result.metadata?.filename,
          size: result.metadata?.size,
        })

        res.status(201).json({
          success: true,
          data: result.metadata,
        })
      } else {
        structuredLogger.warn('Backup creation failed', {
          userId: req.user?.id,
          error: result.error,
        })

        const statusCode = result.error?.includes('already in progress')
          ? 409
          : 500

        res.status(statusCode).json({
          success: false,
          error: {
            code: 'BACKUP_CREATION_FAILED',
            message: result.error || 'Failed to create backup',
            timestamp: new Date().toISOString(),
          },
        })
      }
    } catch (error) {
      structuredLogger.error('Backup creation error', error as Error, {
        userId: req.user?.id,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'BACKUP_CREATION_ERROR',
          message: 'An unexpected error occurred while creating backup',
          timestamp: new Date().toISOString(),
        },
      })
    }
  }
)

/**
 * @swagger
 * /api/cubcen/v1/backup/{backupId}:
 *   get:
 *     summary: Get backup details
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Backup ID
 *     responses:
 *       200:
 *         description: Backup details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     filename:
 *                       type: string
 *                     size:
 *                       type: number
 *                     compressed:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     checksum:
 *                       type: string
 *       404:
 *         description: Backup not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:backupId', requireAuth, async (req, res) => {
  try {
    const { backupId } = req.params
    const backups = await backupService.listBackups()
    const backup = backups.find(b => b.id === backupId)

    if (!backup) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BACKUP_NOT_FOUND',
          message: `Backup with ID ${backupId} not found`,
          timestamp: new Date().toISOString(),
        },
      })
    }

    structuredLogger.info('Retrieved backup details', {
      userId: req.user?.id,
      backupId,
    })

    res.json({
      success: true,
      data: backup,
    })
  } catch (error) {
    structuredLogger.error('Failed to get backup details', error as Error, {
      userId: req.user?.id,
      backupId: req.params.backupId,
    })

    res.status(500).json({
      success: false,
      error: {
        code: 'BACKUP_DETAILS_FAILED',
        message: 'Failed to retrieve backup details',
        timestamp: new Date().toISOString(),
      },
    })
  }
})

/**
 * @swagger
 * /api/cubcen/v1/backup/restore:
 *   post:
 *     summary: Restore database from backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - backupId
 *             properties:
 *               backupId:
 *                 type: string
 *                 description: ID of the backup to restore
 *     responses:
 *       200:
 *         description: Database restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     restoredFrom:
 *                       type: string
 *                     restoredAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Backup not found
 *       409:
 *         description: Backup operation already in progress
 *       500:
 *         description: Internal server error
 */
router.post(
  '/restore',
  requireAuth,
  validateRequest(restoreBackupSchema),
  async (req, res) => {
    try {
      const { backupId } = req.body

      structuredLogger.info('Starting database restore', {
        userId: req.user?.id,
        backupId,
      })

      const result = await backupService.restoreBackup(backupId)

      if (result.success) {
        structuredLogger.info('Database restored successfully', {
          userId: req.user?.id,
          backupId,
          restoredFrom: result.restoredFrom,
        })

        res.json({
          success: true,
          data: {
            restoredFrom: result.restoredFrom,
            restoredAt: new Date().toISOString(),
          },
        })
      } else {
        structuredLogger.warn('Database restore failed', {
          userId: req.user?.id,
          backupId,
          error: result.error,
        })

        let statusCode = 500
        if (result.error?.includes('not found')) {
          statusCode = 404
        } else if (result.error?.includes('already in progress')) {
          statusCode = 409
        } else if (result.error?.includes('integrity check failed')) {
          statusCode = 400
        }

        res.status(statusCode).json({
          success: false,
          error: {
            code: 'RESTORE_FAILED',
            message: result.error || 'Failed to restore database',
            timestamp: new Date().toISOString(),
          },
        })
      }
    } catch (error) {
      structuredLogger.error('Database restore error', error as Error, {
        userId: req.user?.id,
        backupId: req.body.backupId,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'RESTORE_ERROR',
          message: 'An unexpected error occurred during restore',
          timestamp: new Date().toISOString(),
        },
      })
    }
  }
)

/**
 * @swagger
 * /api/cubcen/v1/backup/{backupId}:
 *   delete:
 *     summary: Delete a backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Backup ID to delete
 *     responses:
 *       200:
 *         description: Backup deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Backup not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:backupId',
  requireAuth,
  validateRequest(deleteBackupSchema),
  async (req, res) => {
    try {
      const { backupId } = req.params

      structuredLogger.info('Deleting backup', {
        userId: req.user?.id,
        backupId,
      })

      const deleted = await backupService.deleteBackup(backupId)

      if (deleted) {
        structuredLogger.info('Backup deleted successfully', {
          userId: req.user?.id,
          backupId,
        })

        res.json({
          success: true,
          message: 'Backup deleted successfully',
        })
      } else {
        structuredLogger.warn('Backup not found for deletion', {
          userId: req.user?.id,
          backupId,
        })

        res.status(404).json({
          success: false,
          error: {
            code: 'BACKUP_NOT_FOUND',
            message: `Backup with ID ${backupId} not found`,
            timestamp: new Date().toISOString(),
          },
        })
      }
    } catch (error) {
      structuredLogger.error('Failed to delete backup', error as Error, {
        userId: req.user?.id,
        backupId: req.params.backupId,
      })

      res.status(500).json({
        success: false,
        error: {
          code: 'BACKUP_DELETE_FAILED',
          message: 'Failed to delete backup',
          timestamp: new Date().toISOString(),
          },
        })
    }
  }
)

/**
 * @swagger
 * /api/cubcen/v1/backup/stats:
 *   get:
 *     summary: Get backup statistics
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBackups:
 *                       type: number
 *                     totalSize:
 *                       type: number
 *                     oldestBackup:
 *                       type: string
 *                       format: date-time
 *                     newestBackup:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const stats = await backupService.getBackupStats()

    structuredLogger.info('Retrieved backup statistics', {
      userId: req.user?.id,
      totalBackups: stats.totalBackups,
      totalSize: stats.totalSize,
    })

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    structuredLogger.error('Failed to get backup statistics', error as Error, {
      userId: req.user?.id,
    })

    res.status(500).json({
      success: false,
      error: {
        code: 'BACKUP_STATS_FAILED',
        message: 'Failed to retrieve backup statistics',
        timestamp: new Date().toISOString(),
      },
    })
  }
})

export default router
