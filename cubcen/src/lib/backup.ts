import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip, createGunzip } from 'zlib';
import config from './config';
import { logger } from './logger';

export interface BackupMetadata {
  id: string;
  filename: string;
  path: string;
  size: number;
  compressed: boolean;
  createdAt: Date;
  databaseUrl: string;
  version: string;
  checksum?: string;
}

export interface BackupResult {
  success: boolean;
  metadata?: BackupMetadata;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  restoredFrom: string;
  error?: string;
}

/**
 * Database backup and restore service
 */
export class BackupService {
  private static instance: BackupService;
  private backupPath: string;
  private databaseUrl: string;
  private isRunning: boolean = false;

  private constructor() {
    const backupConfig = config.getBackupConfig();
    this.backupPath = backupConfig.path;
    this.databaseUrl = config.getDatabaseConfig().url;
    this.ensureBackupDirectory();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.backupPath, { recursive: true });
    } catch (error) {
      logger.error('Failed to create backup directory', error as Error, {
        backupPath: this.backupPath
      });
      throw new Error(`Failed to create backup directory: ${this.backupPath}`);
    }
  }

  /**
   * Create a database backup
   */
  public async createBackup(compress: boolean = true): Promise<BackupResult> {
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
    const backupFilePath = path.join(this.backupPath, filename);

    try {
      logger.info('Starting database backup', {
        backupId,
        filename,
        compress
      });

      // For SQLite databases
      if (this.databaseUrl.startsWith('file:')) {
        const dbPath = this.databaseUrl.replace('file:', '');
        const resolvedDbPath = path.resolve(dbPath);
        
        await this.backupSQLiteDatabase(resolvedDbPath, backupFilePath, compress);
      } else {
        // For other databases, implement specific backup logic
        throw new Error('Non-SQLite database backup not implemented yet');
      }

      const stats = await fs.stat(backupFilePath);
      const metadata: BackupMetadata = {
        id: backupId,
        filename,
        path: backupFilePath,
        size: stats.size,
        compressed: compress,
        createdAt: new Date(),
        databaseUrl: this.databaseUrl,
        version: process.env.npm_package_version || '1.0.0',
      };

      // Calculate checksum for integrity verification
      metadata.checksum = await this.calculateChecksum(backupFilePath);

      // Save metadata
      await this.saveBackupMetadata(metadata);

      logger.info('Database backup completed successfully', {
        backupId,
        filename,
        size: stats.size,
        checksum: metadata.checksum
      });

      return {
        success: true,
        metadata
      };

    } catch (error) {
      logger.error('Database backup failed', error as Error, {
        backupId,
        filename
      });

      // Clean up failed backup file
      try {
        await fs.unlink(backupFilePath);
      } catch (cleanupError) {
        logger.warn('Failed to clean up failed backup file', cleanupError as Error);
      }

      return {
        success: false,
        error: (error as Error).message
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Restore database from backup
   */
  public async restoreBackup(backupId: string): Promise<RestoreResult> {
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

      logger.info('Starting database restore', {
        backupId,
        filename: metadata.filename
      });

      // Verify backup integrity
      const currentChecksum = await this.calculateChecksum(metadata.path);
      if (metadata.checksum && currentChecksum !== metadata.checksum) {
        return {
          success: false,
          restoredFrom: metadata.filename,
          error: 'Backup file integrity check failed'
        };
      }

      // Create a backup of current database before restore
      const preRestoreBackup = await this.createBackup(true);
      if (!preRestoreBackup.success) {
        logger.warn('Failed to create pre-restore backup', {
          error: preRestoreBackup.error
        });
      }

      // For SQLite databases
      if (this.databaseUrl.startsWith('file:')) {
        const dbPath = this.databaseUrl.replace('file:', '');
        const resolvedDbPath = path.resolve(dbPath);
        
        await this.restoreSQLiteDatabase(metadata.path, resolvedDbPath, metadata.compressed);
      } else {
        throw new Error('Non-SQLite database restore not implemented yet');
      }

      logger.info('Database restore completed successfully', {
        backupId,
        filename: metadata.filename
      });

      return {
        success: true,
        restoredFrom: metadata.filename
      };

    } catch (error) {
      logger.error('Database restore failed', error as Error, {
        backupId
      });

      return {
        success: false,
        restoredFrom: '',
        error: (error as Error).message
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * List all available backups
   */
  public async listBackups(): Promise<BackupMetadata[]> {
    try {
      const metadataFiles = await fs.readdir(this.backupPath);
      const backups: BackupMetadata[] = [];

      for (const file of metadataFiles) {
        if (file.endsWith('.metadata.json')) {
          try {
            const metadataPath = path.join(this.backupPath, file);
            const metadataContent = await fs.readFile(metadataPath, 'utf-8');
            const metadata: BackupMetadata = JSON.parse(metadataContent);
            
            // Verify backup file still exists
            try {
              await fs.access(metadata.path);
              backups.push(metadata);
            } catch {
              logger.warn('Backup file missing for metadata', { file, path: metadata.path });
            }
          } catch (error) {
            logger.warn('Failed to read backup metadata', error as Error, { file });
          }
        }
      }

      return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      logger.error('Failed to list backups', error as Error);
      return [];
    }
  }

  /**
   * Delete a backup
   */
  public async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const metadata = await this.getBackupMetadata(backupId);
      if (!metadata) {
        return false;
      }

      // Delete backup file
      await fs.unlink(metadata.path);
      
      // Delete metadata file
      const metadataPath = path.join(this.backupPath, `${backupId}.metadata.json`);
      await fs.unlink(metadataPath);

      logger.info('Backup deleted successfully', {
        backupId,
        filename: metadata.filename
      });

      return true;
    } catch (error) {
      logger.error('Failed to delete backup', error as Error, { backupId });
      return false;
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  public async cleanupOldBackups(): Promise<number> {
    const backupConfig = config.getBackupConfig();
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
        logger.info('Cleaned up old backups', {
          deletedCount,
          retentionDays: backupConfig.retentionDays
        });
      }

      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old backups', error as Error);
      return 0;
    }
  }

  /**
   * Get backup statistics
   */
  public async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup?: Date;
    newestBackup?: Date;
  }> {
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

  // Private helper methods

  private async backupSQLiteDatabase(sourcePath: string, backupPath: string, compress: boolean): Promise<void> {
    if (compress) {
      await pipeline(
        createReadStream(sourcePath),
        createGzip(),
        createWriteStream(backupPath)
      );
    } else {
      await fs.copyFile(sourcePath, backupPath);
    }
  }

  private async restoreSQLiteDatabase(backupPath: string, targetPath: string, compressed: boolean): Promise<void> {
    if (compressed) {
      await pipeline(
        createReadStream(backupPath),
        createGunzip(),
        createWriteStream(targetPath)
      );
    } else {
      await fs.copyFile(backupPath, targetPath);
    }
  }

  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);
    
    for await (const chunk of stream) {
      hash.update(chunk);
    }
    
    return hash.digest('hex');
  }

  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = path.join(this.backupPath, `${metadata.id}.metadata.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    try {
      const metadataPath = path.join(this.backupPath, `${backupId}.metadata.json`);
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);
      
      // Convert date strings back to Date objects
      metadata.createdAt = new Date(metadata.createdAt);
      
      return metadata;
    } catch {
      return null;
    }
  }
}

// Scheduled backup service
export class ScheduledBackupService {
  private static instance: ScheduledBackupService;
  private backupService: BackupService;
  private intervalId?: NodeJS.Timeout;

  private constructor() {
    this.backupService = BackupService.getInstance();
  }

  public static getInstance(): ScheduledBackupService {
    if (!ScheduledBackupService.instance) {
      ScheduledBackupService.instance = new ScheduledBackupService();
    }
    return ScheduledBackupService.instance;
  }

  public start(): void {
    const backupConfig = config.getBackupConfig();
    
    if (!backupConfig.enabled) {
      logger.info('Scheduled backups are disabled');
      return;
    }

    const intervalMs = backupConfig.intervalHours * 60 * 60 * 1000;
    
    this.intervalId = setInterval(async () => {
      try {
        logger.info('Starting scheduled backup');
        const result = await this.backupService.createBackup(true);
        
        if (result.success) {
          logger.info('Scheduled backup completed successfully', {
            filename: result.metadata?.filename
          });
          
          // Clean up old backups
          await this.backupService.cleanupOldBackups();
        } else {
          logger.error('Scheduled backup failed', new Error(result.error || 'Unknown error'));
        }
      } catch (error) {
        logger.error('Scheduled backup error', error as Error);
      }
    }, intervalMs);

    logger.info('Scheduled backup service started', {
      intervalHours: backupConfig.intervalHours,
      retentionDays: backupConfig.retentionDays
    });
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      logger.info('Scheduled backup service stopped');
    }
  }
}

// Export singleton instances
export const backupService = BackupService.getInstance();
export const scheduledBackupService = ScheduledBackupService.getInstance();