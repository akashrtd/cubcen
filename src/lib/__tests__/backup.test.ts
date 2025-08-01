import fs from 'fs/promises';
import { BackupService, ScheduledBackupService } from '../backup';

// Mock dependencies
jest.mock('../config', () => ({
  default: {
    getBackupConfig: () => ({
      enabled: true,
      intervalHours: 24,
      retentionDays: 7,
      path: '/tmp/test-backups'
    }),
    getDatabaseConfig: () => ({
      url: 'file:./test.db'
    })
  }
}));

jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Mock fs operations
jest.mock('fs/promises');
jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('BackupService', () => {
  let backupService: BackupService;
  const testBackupPath = '/tmp/test-backups';

  beforeEach(() => {
    jest.clearAllMocks();
    backupService = BackupService.getInstance();
  });

  describe('createBackup', () => {
    it('should create a backup successfully', async () => {
      // Mock file operations
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({ size: 1024 } as never);
      mockFs.writeFile.mockResolvedValue(undefined);
      
      // Mock file copy
      jest.doMock('fs', () => ({
        createReadStream: jest.fn(() => ({
          pipe: jest.fn()
        })),
        createWriteStream: jest.fn(() => ({
          on: jest.fn()
        }))
      }));

      const result = await backupService.createBackup(false);

      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.compressed).toBe(false);
      expect(mockFs.mkdir).toHaveBeenCalledWith(testBackupPath, { recursive: true });
    });

    it('should handle backup creation failure', async () => {
      mockFs.mkdir.mockRejectedValue(new Error('Permission denied'));

      const result = await backupService.createBackup();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission denied');
    });

    it('should prevent concurrent backup operations', async () => {
      // Mock a long-running backup
      mockFs.mkdir.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const promise1 = backupService.createBackup();
      const promise2 = backupService.createBackup();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.success || result2.success).toBe(true);
      expect(result1.success && result2.success).toBe(false);
      
      const failedResult = result1.success ? result2 : result1;
      expect(failedResult.error).toBe('Backup operation already in progress');
    });

    it('should create compressed backup when requested', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({ size: 512 } as never);
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await backupService.createBackup(true);

      expect(result.success).toBe(true);
      expect(result.metadata?.compressed).toBe(true);
    });
  });

  describe('listBackups', () => {
    it('should list available backups', async () => {
      const mockMetadata = {
        id: 'backup_123',
        filename: 'test-backup.gz',
        path: '/tmp/test-backups/test-backup.gz',
        size: 1024,
        compressed: true,
        createdAt: new Date(),
        databaseUrl: 'file:./test.db',
        version: '1.0.0'
      };

      mockFs.readdir.mockResolvedValue(['backup_123.metadata.json'] as never);
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockMetadata));
      mockFs.access.mockResolvedValue(undefined);

      const backups = await backupService.listBackups();

      expect(backups).toHaveLength(1);
      expect(backups[0].id).toBe('backup_123');
      expect(backups[0].filename).toBe('test-backup.gz');
    });

    it('should handle missing backup files', async () => {
      mockFs.readdir.mockResolvedValue(['backup_123.metadata.json'] as never);
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        id: 'backup_123',
        path: '/tmp/missing-backup.gz'
      }));
      mockFs.access.mockRejectedValue(new Error('File not found'));

      const backups = await backupService.listBackups();

      expect(backups).toHaveLength(0);
    });

    it('should handle corrupted metadata files', async () => {
      mockFs.readdir.mockResolvedValue(['backup_123.metadata.json'] as never);
      mockFs.readFile.mockResolvedValue('invalid json');

      const backups = await backupService.listBackups();

      expect(backups).toHaveLength(0);
    });
  });

  describe('deleteBackup', () => {
    it('should delete backup and metadata files', async () => {
      const mockMetadata = {
        id: 'backup_123',
        path: '/tmp/test-backups/test-backup.gz'
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockMetadata));
      mockFs.unlink.mockResolvedValue(undefined);

      const result = await backupService.deleteBackup('backup_123');

      expect(result).toBe(true);
      expect(mockFs.unlink).toHaveBeenCalledTimes(2); // Backup file + metadata file
    });

    it('should handle deletion of non-existent backup', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await backupService.deleteBackup('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('cleanupOldBackups', () => {
    it('should delete backups older than retention period', async () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const recentDate = new Date();

      const mockBackups = [
        {
          id: 'old_backup',
          createdAt: oldDate,
          path: '/tmp/old-backup.gz'
        },
        {
          id: 'recent_backup',
          createdAt: recentDate,
          path: '/tmp/recent-backup.gz'
        }
      ];

      // Mock listBackups
      jest.spyOn(backupService, 'listBackups').mockResolvedValue(mockBackups as never);
      
      // Mock deleteBackup
      const deleteBackupSpy = jest.spyOn(backupService, 'deleteBackup').mockResolvedValue(true);

      const deletedCount = await backupService.cleanupOldBackups();

      expect(deletedCount).toBe(1);
      expect(deleteBackupSpy).toHaveBeenCalledWith('old_backup');
      expect(deleteBackupSpy).not.toHaveBeenCalledWith('recent_backup');
    });
  });

  describe('getBackupStats', () => {
    it('should return backup statistics', async () => {
      const mockBackups = [
        {
          id: 'backup_1',
          size: 1024,
          createdAt: new Date('2023-01-01')
        },
        {
          id: 'backup_2',
          size: 2048,
          createdAt: new Date('2023-01-02')
        }
      ];

      jest.spyOn(backupService, 'listBackups').mockResolvedValue(mockBackups as never);

      const stats = await backupService.getBackupStats();

      expect(stats.totalBackups).toBe(2);
      expect(stats.totalSize).toBe(3072);
      expect(stats.oldestBackup).toEqual(new Date('2023-01-01'));
      expect(stats.newestBackup).toEqual(new Date('2023-01-02'));
    });

    it('should handle empty backup list', async () => {
      jest.spyOn(backupService, 'listBackups').mockResolvedValue([]);

      const stats = await backupService.getBackupStats();

      expect(stats.totalBackups).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.oldestBackup).toBeUndefined();
      expect(stats.newestBackup).toBeUndefined();
    });
  });
});

describe('ScheduledBackupService', () => {
  let scheduledBackupService: ScheduledBackupService;
  let backupService: BackupService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    scheduledBackupService = ScheduledBackupService.getInstance();
    backupService = BackupService.getInstance();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('start', () => {
    it('should start scheduled backups', () => {
      const createBackupSpy = jest.spyOn(backupService, 'createBackup')
        .mockResolvedValue({ success: true, metadata: {} as never });
      jest.spyOn(backupService, 'cleanupOldBackups')
        .mockResolvedValue(0);

      scheduledBackupService.start();

      // Fast-forward 24 hours
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);

      expect(createBackupSpy).toHaveBeenCalled();
    });

    it('should handle backup failures gracefully', async () => {
      const createBackupSpy = jest.spyOn(backupService, 'createBackup')
        .mockResolvedValue({ success: false, error: 'Backup failed' });

      scheduledBackupService.start();

      // Fast-forward 24 hours
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(createBackupSpy).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop scheduled backups', () => {
      scheduledBackupService.start();
      scheduledBackupService.stop();

      const createBackupSpy = jest.spyOn(backupService, 'createBackup');

      // Fast-forward 24 hours
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);

      expect(createBackupSpy).not.toHaveBeenCalled();
    });
  });
});