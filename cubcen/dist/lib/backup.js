"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledBackupService = exports.backupService = exports.ScheduledBackupService = exports.BackupService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const promises_2 = require("stream/promises");
const zlib_1 = require("zlib");
const config_1 = __importDefault(require("./config"));
const logger_1 = require("./logger");
class BackupService {
    constructor() {
        this.isRunning = false;
        const backupConfig = config_1.default.getBackupConfig();
        this.backupPath = backupConfig.path;
        this.databaseUrl = config_1.default.getDatabaseConfig().url;
        this.ensureBackupDirectory();
    }
    static getInstance() {
        if (!BackupService.instance) {
            BackupService.instance = new BackupService();
        }
        return BackupService.instance;
    }
    async ensureBackupDirectory() {
        try {
            await promises_1.default.mkdir(this.backupPath, { recursive: true });
        }
        catch (error) {
            logger_1.logger.error('Failed to create backup directory', error, {
                backupPath: this.backupPath
            });
            throw new Error(`Failed to create backup directory: ${this.backupPath}`);
        }
    }
    async createBackup(compress = true) {
        if (this.isRunning) {
            return {
                success: false,
                error: 'Backup operation already in progress'
            };
        }
        this.isRunning = true;
        const backupId = this.generateBackupId();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = compress ? '.gz' : '';
        const filename = `cubcen-backup-${timestamp}${extension}`;
        const backupFilePath = path_1.default.join(this.backupPath, filename);
        try {
            logger_1.logger.info('Starting database backup', {
                backupId,
                filename,
                compress
            });
            if (this.databaseUrl.startsWith('file:')) {
                const dbPath = this.databaseUrl.replace('file:', '');
                const resolvedDbPath = path_1.default.resolve(dbPath);
                await this.backupSQLiteDatabase(resolvedDbPath, backupFilePath, compress);
            }
            else {
                throw new Error('Non-SQLite database backup not implemented yet');
            }
            const stats = await promises_1.default.stat(backupFilePath);
            const metadata = {
                id: backupId,
                filename,
                path: backupFilePath,
                size: stats.size,
                compressed: compress,
                createdAt: new Date(),
                databaseUrl: this.databaseUrl,
                version: process.env.npm_package_version || '1.0.0',
            };
            metadata.checksum = await this.calculateChecksum(backupFilePath);
            await this.saveBackupMetadata(metadata);
            logger_1.logger.info('Database backup completed successfully', {
                backupId,
                filename,
                size: stats.size,
                checksum: metadata.checksum
            });
            return {
                success: true,
                metadata
            };
        }
        catch (error) {
            logger_1.logger.error('Database backup failed', error, {
                backupId,
                filename
            });
            try {
                await promises_1.default.unlink(backupFilePath);
            }
            catch (cleanupError) {
                logger_1.logger.warn('Failed to clean up failed backup file', cleanupError);
            }
            return {
                success: false,
                error: error.message
            };
        }
        finally {
            this.isRunning = false;
        }
    }
    async restoreBackup(backupId) {
        if (this.isRunning) {
            return {
                success: false,
                restoredFrom: '',
                error: 'Backup operation already in progress'
            };
        }
        this.isRunning = true;
        try {
            const metadata = await this.getBackupMetadata(backupId);
            if (!metadata) {
                return {
                    success: false,
                    restoredFrom: '',
                    error: `Backup with ID ${backupId} not found`
                };
            }
            logger_1.logger.info('Starting database restore', {
                backupId,
                filename: metadata.filename
            });
            const currentChecksum = await this.calculateChecksum(metadata.path);
            if (metadata.checksum && currentChecksum !== metadata.checksum) {
                return {
                    success: false,
                    restoredFrom: metadata.filename,
                    error: 'Backup file integrity check failed'
                };
            }
            const preRestoreBackup = await this.createBackup(true);
            if (!preRestoreBackup.success) {
                logger_1.logger.warn('Failed to create pre-restore backup', {
                    error: preRestoreBackup.error
                });
            }
            if (this.databaseUrl.startsWith('file:')) {
                const dbPath = this.databaseUrl.replace('file:', '');
                const resolvedDbPath = path_1.default.resolve(dbPath);
                await this.restoreSQLiteDatabase(metadata.path, resolvedDbPath, metadata.compressed);
            }
            else {
                throw new Error('Non-SQLite database restore not implemented yet');
            }
            logger_1.logger.info('Database restore completed successfully', {
                backupId,
                filename: metadata.filename
            });
            return {
                success: true,
                restoredFrom: metadata.filename
            };
        }
        catch (error) {
            logger_1.logger.error('Database restore failed', error, {
                backupId
            });
            return {
                success: false,
                restoredFrom: '',
                error: error.message
            };
        }
        finally {
            this.isRunning = false;
        }
    }
    async listBackups() {
        try {
            const metadataFiles = await promises_1.default.readdir(this.backupPath);
            const backups = [];
            for (const file of metadataFiles) {
                if (file.endsWith('.metadata.json')) {
                    try {
                        const metadataPath = path_1.default.join(this.backupPath, file);
                        const metadataContent = await promises_1.default.readFile(metadataPath, 'utf-8');
                        const metadata = JSON.parse(metadataContent);
                        try {
                            await promises_1.default.access(metadata.path);
                            backups.push(metadata);
                        }
                        catch {
                            logger_1.logger.warn('Backup file missing for metadata', { file, path: metadata.path });
                        }
                    }
                    catch (error) {
                        logger_1.logger.warn('Failed to read backup metadata', error, { file });
                    }
                }
            }
            return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        catch (error) {
            logger_1.logger.error('Failed to list backups', error);
            return [];
        }
    }
    async deleteBackup(backupId) {
        try {
            const metadata = await this.getBackupMetadata(backupId);
            if (!metadata) {
                return false;
            }
            await promises_1.default.unlink(metadata.path);
            const metadataPath = path_1.default.join(this.backupPath, `${backupId}.metadata.json`);
            await promises_1.default.unlink(metadataPath);
            logger_1.logger.info('Backup deleted successfully', {
                backupId,
                filename: metadata.filename
            });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Failed to delete backup', error, { backupId });
            return false;
        }
    }
    async cleanupOldBackups() {
        const backupConfig = config_1.default.getBackupConfig();
        const retentionMs = backupConfig.retentionDays * 24 * 60 * 60 * 1000;
        const cutoffDate = new Date(Date.now() - retentionMs);
        try {
            const backups = await this.listBackups();
            let deletedCount = 0;
            for (const backup of backups) {
                if (backup.createdAt < cutoffDate) {
                    const deleted = await this.deleteBackup(backup.id);
                    if (deleted) {
                        deletedCount++;
                    }
                }
            }
            if (deletedCount > 0) {
                logger_1.logger.info('Cleaned up old backups', {
                    deletedCount,
                    retentionDays: backupConfig.retentionDays
                });
            }
            return deletedCount;
        }
        catch (error) {
            logger_1.logger.error('Failed to cleanup old backups', error);
            return 0;
        }
    }
    async getBackupStats() {
        const backups = await this.listBackups();
        if (backups.length === 0) {
            return {
                totalBackups: 0,
                totalSize: 0
            };
        }
        const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
        const dates = backups.map(b => b.createdAt);
        return {
            totalBackups: backups.length,
            totalSize,
            oldestBackup: new Date(Math.min(...dates.map(d => d.getTime()))),
            newestBackup: new Date(Math.max(...dates.map(d => d.getTime())))
        };
    }
    async backupSQLiteDatabase(sourcePath, backupPath, compress) {
        if (compress) {
            await (0, promises_2.pipeline)((0, fs_1.createReadStream)(sourcePath), (0, zlib_1.createGzip)(), (0, fs_1.createWriteStream)(backupPath));
        }
        else {
            await promises_1.default.copyFile(sourcePath, backupPath);
        }
    }
    async restoreSQLiteDatabase(backupPath, targetPath, compressed) {
        if (compressed) {
            await (0, promises_2.pipeline)((0, fs_1.createReadStream)(backupPath), (0, zlib_1.createGunzip)(), (0, fs_1.createWriteStream)(targetPath));
        }
        else {
            await promises_1.default.copyFile(backupPath, targetPath);
        }
    }
    generateBackupId() {
        return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async calculateChecksum(filePath) {
        const crypto = await Promise.resolve().then(() => __importStar(require('crypto')));
        const hash = crypto.createHash('sha256');
        const stream = (0, fs_1.createReadStream)(filePath);
        for await (const chunk of stream) {
            hash.update(chunk);
        }
        return hash.digest('hex');
    }
    async saveBackupMetadata(metadata) {
        const metadataPath = path_1.default.join(this.backupPath, `${metadata.id}.metadata.json`);
        await promises_1.default.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    }
    async getBackupMetadata(backupId) {
        try {
            const metadataPath = path_1.default.join(this.backupPath, `${backupId}.metadata.json`);
            const metadataContent = await promises_1.default.readFile(metadataPath, 'utf-8');
            const metadata = JSON.parse(metadataContent);
            metadata.createdAt = new Date(metadata.createdAt);
            return metadata;
        }
        catch {
            return null;
        }
    }
}
exports.BackupService = BackupService;
class ScheduledBackupService {
    constructor() {
        this.backupService = BackupService.getInstance();
    }
    static getInstance() {
        if (!ScheduledBackupService.instance) {
            ScheduledBackupService.instance = new ScheduledBackupService();
        }
        return ScheduledBackupService.instance;
    }
    start() {
        const backupConfig = config_1.default.getBackupConfig();
        if (!backupConfig.enabled) {
            logger_1.logger.info('Scheduled backups are disabled');
            return;
        }
        const intervalMs = backupConfig.intervalHours * 60 * 60 * 1000;
        this.intervalId = setInterval(async () => {
            try {
                logger_1.logger.info('Starting scheduled backup');
                const result = await this.backupService.createBackup(true);
                if (result.success) {
                    logger_1.logger.info('Scheduled backup completed successfully', {
                        filename: result.metadata?.filename
                    });
                    await this.backupService.cleanupOldBackups();
                }
                else {
                    logger_1.logger.error('Scheduled backup failed', new Error(result.error || 'Unknown error'));
                }
            }
            catch (error) {
                logger_1.logger.error('Scheduled backup error', error);
            }
        }, intervalMs);
        logger_1.logger.info('Scheduled backup service started', {
            intervalHours: backupConfig.intervalHours,
            retentionDays: backupConfig.retentionDays
        });
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            logger_1.logger.info('Scheduled backup service stopped');
        }
    }
}
exports.ScheduledBackupService = ScheduledBackupService;
exports.backupService = BackupService.getInstance();
exports.scheduledBackupService = ScheduledBackupService.getInstance();
//# sourceMappingURL=backup.js.map