"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const backup_1 = require("../../lib/backup");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const logger_1 = require("../../lib/logger");
const router = express_1.default.Router();
const createBackupSchema = zod_1.z.object({
    body: zod_1.z.object({
        compress: zod_1.z.boolean().optional().default(true)
    })
});
const restoreBackupSchema = zod_1.z.object({
    body: zod_1.z.object({
        backupId: zod_1.z.string().min(1)
    })
});
const deleteBackupSchema = zod_1.z.object({
    params: zod_1.z.object({
        backupId: zod_1.z.string().min(1)
    })
});
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const backups = await backup_1.backupService.listBackups();
        logger_1.logger.info('Listed backups', {
            userId: req.user?.id,
            backupCount: backups.length
        });
        res.json({
            success: true,
            data: backups
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to list backups', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'BACKUP_LIST_FAILED',
                message: 'Failed to list backups',
                timestamp: new Date().toISOString()
            }
        });
    }
});
router.post('/', auth_1.requireAuth, (0, validation_1.validateRequest)(createBackupSchema), async (req, res) => {
    try {
        const { compress } = req.body;
        logger_1.logger.info('Creating backup', {
            userId: req.user?.id,
            compress
        });
        const result = await backup_1.backupService.createBackup(compress);
        if (result.success) {
            logger_1.logger.info('Backup created successfully', {
                userId: req.user?.id,
                backupId: result.metadata?.id,
                filename: result.metadata?.filename,
                size: result.metadata?.size
            });
            res.status(201).json({
                success: true,
                data: result.metadata
            });
        }
        else {
            logger_1.logger.warn('Backup creation failed', {
                userId: req.user?.id,
                error: result.error
            });
            const statusCode = result.error?.includes('already in progress') ? 409 : 500;
            res.status(statusCode).json({
                success: false,
                error: {
                    code: 'BACKUP_CREATION_FAILED',
                    message: result.error || 'Failed to create backup',
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Backup creation error', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'BACKUP_CREATION_ERROR',
                message: 'An unexpected error occurred while creating backup',
                timestamp: new Date().toISOString()
            }
        });
    }
});
router.get('/:backupId', auth_1.requireAuth, async (req, res) => {
    try {
        const { backupId } = req.params;
        const backups = await backup_1.backupService.listBackups();
        const backup = backups.find(b => b.id === backupId);
        if (!backup) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'BACKUP_NOT_FOUND',
                    message: `Backup with ID ${backupId} not found`,
                    timestamp: new Date().toISOString()
                }
            });
        }
        logger_1.logger.info('Retrieved backup details', {
            userId: req.user?.id,
            backupId
        });
        res.json({
            success: true,
            data: backup
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get backup details', error, {
            userId: req.user?.id,
            backupId: req.params.backupId
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'BACKUP_DETAILS_FAILED',
                message: 'Failed to retrieve backup details',
                timestamp: new Date().toISOString()
            }
        });
    }
});
router.post('/restore', auth_1.requireAuth, (0, validation_1.validateRequest)(restoreBackupSchema), async (req, res) => {
    try {
        const { backupId } = req.body;
        logger_1.logger.info('Starting database restore', {
            userId: req.user?.id,
            backupId
        });
        const result = await backup_1.backupService.restoreBackup(backupId);
        if (result.success) {
            logger_1.logger.info('Database restored successfully', {
                userId: req.user?.id,
                backupId,
                restoredFrom: result.restoredFrom
            });
            res.json({
                success: true,
                data: {
                    restoredFrom: result.restoredFrom,
                    restoredAt: new Date().toISOString()
                }
            });
        }
        else {
            logger_1.logger.warn('Database restore failed', {
                userId: req.user?.id,
                backupId,
                error: result.error
            });
            let statusCode = 500;
            if (result.error?.includes('not found')) {
                statusCode = 404;
            }
            else if (result.error?.includes('already in progress')) {
                statusCode = 409;
            }
            else if (result.error?.includes('integrity check failed')) {
                statusCode = 400;
            }
            res.status(statusCode).json({
                success: false,
                error: {
                    code: 'RESTORE_FAILED',
                    message: result.error || 'Failed to restore database',
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Database restore error', error, {
            userId: req.user?.id,
            backupId: req.body.backupId
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'RESTORE_ERROR',
                message: 'An unexpected error occurred during restore',
                timestamp: new Date().toISOString()
            }
        });
    }
});
router.delete('/:backupId', auth_1.requireAuth, (0, validation_1.validateRequest)(deleteBackupSchema), async (req, res) => {
    try {
        const { backupId } = req.params;
        logger_1.logger.info('Deleting backup', {
            userId: req.user?.id,
            backupId
        });
        const deleted = await backup_1.backupService.deleteBackup(backupId);
        if (deleted) {
            logger_1.logger.info('Backup deleted successfully', {
                userId: req.user?.id,
                backupId
            });
            res.json({
                success: true,
                message: 'Backup deleted successfully'
            });
        }
        else {
            logger_1.logger.warn('Backup not found for deletion', {
                userId: req.user?.id,
                backupId
            });
            res.status(404).json({
                success: false,
                error: {
                    code: 'BACKUP_NOT_FOUND',
                    message: `Backup with ID ${backupId} not found`,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to delete backup', error, {
            userId: req.user?.id,
            backupId: req.params.backupId
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'BACKUP_DELETE_FAILED',
                message: 'Failed to delete backup',
                timestamp: new Date().toISOString()
            }
        });
    }
});
router.get('/stats', auth_1.requireAuth, async (req, res) => {
    try {
        const stats = await backup_1.backupService.getBackupStats();
        logger_1.logger.info('Retrieved backup statistics', {
            userId: req.user?.id,
            totalBackups: stats.totalBackups,
            totalSize: stats.totalSize
        });
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get backup statistics', error, {
            userId: req.user?.id
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'BACKUP_STATS_FAILED',
                message: 'Failed to retrieve backup statistics',
                timestamp: new Date().toISOString()
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=backup.js.map