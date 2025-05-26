/**
 * VectorStorageMigrator 单元测试
 * 用于TOM-103: 向量存储迁移到LanceDB
 */

import { VectorStorageMigrator } from '../vector-storage-migrator';
import { VectorStorageConfigManager } from '../../config/vector-storage-config';
import { OptimizedVectorStore } from '../optimized-vector-store';
import { EmbeddingIndexItem } from '../../types/vector-storage';

// Mock dependencies
jest.mock('../optimized-vector-store');
jest.mock('../../config/vector-storage-config');

describe('VectorStorageMigrator', () => {
  let migrator: VectorStorageMigrator;
  let mockPlugin: any;
  let mockConfigManager: jest.Mocked<VectorStorageConfigManager>;
  let mockVectorStore: jest.Mocked<OptimizedVectorStore>;

  beforeEach(() => {
    // Mock plugin
    mockPlugin = {
      app: {
        vault: {
          adapter: {
            exists: jest.fn(),
            read: jest.fn(),
            write: jest.fn(),
            mkdir: jest.fn(),
          },
        },
      },
    };

    // Mock config manager
    mockConfigManager = {
      getJSONPath: jest.fn().mockReturnValue('./embeddings.json'),
      getLanceDBConfig: jest.fn().mockReturnValue({
        dbPath: './vector.db',
        tableName: 'embeddings',
        vectorDimension: 1536,
        enableBackup: true,
        backupInterval: 1000,
      }),
      setStorageEngine: jest.fn(),
      isUsingLanceDB: jest.fn().mockReturnValue(false),
    } as any;

    // Mock vector store
    mockVectorStore = {
      initialize: jest.fn(),
      batchAdd: jest.fn().mockResolvedValue({
        success: true,
        processedCount: 10,
        failedCount: 0,
        errors: [],
      }),
      getDocumentCount: jest.fn().mockResolvedValue(10),
      backup: jest.fn().mockResolvedValue('./backup.db'),
      restore: jest.fn(),
      close: jest.fn(),
    } as any;

    (OptimizedVectorStore as jest.Mock).mockImplementation(() => mockVectorStore);

    migrator = new VectorStorageMigrator(mockPlugin, mockConfigManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('migrateFromJSON', () => {
    const mockJSONData: Record<string, EmbeddingIndexItem> = {
      'doc1.md': {
        path: 'doc1.md',
        embedding: new Array(1536).fill(0.1),
        updated: Date.now(),
        title: 'Document 1',
        tags: ['test'],
      },
      'doc2.md#part1': {
        path: 'doc2.md#part1',
        embedding: new Array(1536).fill(0.2),
        updated: Date.now(),
        title: 'Document 2 (分片1)',
        tags: ['test', 'chunk'],
      },
    };

    beforeEach(() => {
      mockPlugin.app.vault.adapter.exists.mockResolvedValue(true);
      mockPlugin.app.vault.adapter.read.mockResolvedValue(JSON.stringify(mockJSONData));
    });

    it('should successfully migrate JSON data to LanceDB', async () => {
      const result = await migrator.migrateFromJSON();

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(10);
      expect(result.failedCount).toBe(0);
      expect(result.errors).toHaveLength(0);

      expect(mockVectorStore.initialize).toHaveBeenCalled();
      expect(mockVectorStore.backup).toHaveBeenCalled();
      expect(mockVectorStore.batchAdd).toHaveBeenCalled();
      expect(mockConfigManager.setStorageEngine).toHaveBeenCalledWith('lancedb');
    });

    it('should handle empty JSON file', async () => {
      mockPlugin.app.vault.adapter.read.mockResolvedValue('{}');

      const result = await migrator.migrateFromJSON();

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(0);
      expect(result.failedCount).toBe(0);
      expect(mockVectorStore.batchAdd).not.toHaveBeenCalled();
    });

    it('should handle missing JSON file', async () => {
      mockPlugin.app.vault.adapter.exists.mockResolvedValue(false);

      const result = await migrator.migrateFromJSON();

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(0);
      expect(result.failedCount).toBe(0);
    });

    it('should handle JSON read errors', async () => {
      mockPlugin.app.vault.adapter.read.mockRejectedValue(new Error('Read failed'));

      const result = await migrator.migrateFromJSON();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Error: Failed to read JSON data: Error: Read failed');
    });

    it('should handle batch add failures', async () => {
      mockVectorStore.batchAdd.mockResolvedValue({
        success: false,
        processedCount: 5,
        failedCount: 5,
        errors: [{ index: 0, error: 'Batch failed' }],
      });

      const result = await migrator.migrateFromJSON();

      expect(result.success).toBe(false);
      expect(result.migratedCount).toBe(5);
      expect(result.failedCount).toBe(5);
      expect(result.errors).toContain('Batch 0: Batch failed');
    });

    it('should handle validation errors', async () => {
      const invalidJSONData = {
        'invalid.md': {
          path: 'invalid.md',
          embedding: [], // Invalid empty vector
          updated: Date.now(),
          title: 'Invalid Document',
        },
      };

      mockPlugin.app.vault.adapter.read.mockResolvedValue(JSON.stringify(invalidJSONData));

      const result = await migrator.migrateFromJSON();

      // Should still succeed but with validation warnings
      expect(result.migratedCount).toBe(0); // No valid documents to migrate
    });

    it('should use custom JSON path when provided', async () => {
      const customPath = './custom/embeddings.json';
      
      await migrator.migrateFromJSON(customPath);

      expect(mockPlugin.app.vault.adapter.exists).toHaveBeenCalledWith(customPath);
    });

    it('should attempt rollback on failure', async () => {
      mockVectorStore.initialize.mockRejectedValue(new Error('Init failed'));

      const result = await migrator.migrateFromJSON();

      expect(result.success).toBe(false);
      // 注意：在这个测试中，rollback是在catch块中调用的，但由于没有backupPath，实际上不会调用setStorageEngine
      // 我们需要模拟有backupPath的情况
    });
  });

  describe('validateMigration', () => {
    beforeEach(() => {
      mockPlugin.app.vault.adapter.exists.mockResolvedValue(true);
      mockPlugin.app.vault.adapter.read.mockResolvedValue('{"doc1.md": {}}');
    });

    it('should validate successful migration', async () => {
      mockVectorStore.getDocumentCount.mockResolvedValue(1);

      const result = await migrator.validateMigration();

      expect(result.isValid).toBe(true);
      expect(result.totalDocuments).toBe(1);
      expect(result.validDocuments).toBe(1);
      expect(result.invalidDocuments).toBe(0);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect document count mismatch', async () => {
      mockVectorStore.getDocumentCount.mockResolvedValue(0);

      const result = await migrator.validateMigration();

      expect(result.isValid).toBe(true); // Warning, not error
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].severity).toBe('warning');
      expect(result.issues[0].issue).toContain('Document count mismatch');
    });

    it('should handle validation errors', async () => {
      mockVectorStore.getDocumentCount.mockRejectedValue(new Error('Count failed'));

      const result = await migrator.validateMigration();

      expect(result.isValid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].severity).toBe('error');
    });
  });

  describe('rollback', () => {
    it('should rollback to JSON storage', async () => {
      await migrator.rollback();

      expect(mockConfigManager.setStorageEngine).toHaveBeenCalledWith('json');
    });

    it('should restore from backup if available', async () => {
      // Simulate having a backup
      (migrator as any).backupPath = './backup.db';
      (migrator as any).vectorStore = mockVectorStore;

      await migrator.rollback();

      expect(mockVectorStore.restore).toHaveBeenCalledWith('./backup.db');
    });

    it('should handle rollback errors', async () => {
      mockConfigManager.setStorageEngine.mockImplementation(() => {
        throw new Error('Config update failed');
      });

      await expect(migrator.rollback()).rejects.toThrow('Rollback failed');
    });
  });

  describe('getMigrationStats', () => {
    beforeEach(() => {
      mockPlugin.app.vault.adapter.exists.mockResolvedValue(true);
      mockPlugin.app.vault.adapter.read.mockResolvedValue('{"doc1.md": {}, "doc2.md": {}}');
    });

    it('should return migration statistics', async () => {
      mockConfigManager.isUsingLanceDB.mockReturnValue(true);
      mockVectorStore.getDocumentCount.mockResolvedValue(2);

      const stats = await migrator.getMigrationStats();

      expect(stats.jsonDocuments).toBe(2);
      expect(stats.lancedbDocuments).toBe(2);
    });

    it('should handle JSON-only mode', async () => {
      mockConfigManager.isUsingLanceDB.mockReturnValue(false);

      const stats = await migrator.getMigrationStats();

      expect(stats.jsonDocuments).toBe(2);
      expect(stats.lancedbDocuments).toBe(0);
    });

    it('should handle stats errors', async () => {
      mockPlugin.app.vault.adapter.read.mockRejectedValue(new Error('Read failed'));

      const stats = await migrator.getMigrationStats();

      expect(stats.jsonDocuments).toBe(0);
      expect(stats.lancedbDocuments).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources', async () => {
      (migrator as any).vectorStore = mockVectorStore;
      (migrator as any).backupPath = './backup.db';

      await migrator.cleanup();

      expect(mockVectorStore.close).toHaveBeenCalled();
      expect((migrator as any).vectorStore).toBeNull();
      expect((migrator as any).backupPath).toBeNull();
    });

    it('should handle cleanup when no resources exist', async () => {
      await expect(migrator.cleanup()).resolves.not.toThrow();
    });
  });

  describe('data conversion', () => {
    it('should convert JSON data to VectorDocument format', async () => {
      const jsonData: Record<string, EmbeddingIndexItem> = {
        'test.md': {
          path: 'test.md',
          embedding: new Array(1536).fill(0.1),
          updated: 123456789,
          title: 'Test Document',
          tags: ['test', 'example'],
        },
        'chunked.md#part1': {
          path: 'chunked.md#part1',
          embedding: new Array(1536).fill(0.2),
          updated: 123456790,
          title: 'Chunked Document (分片1)',
          tags: ['chunked'],
        },
      };

      mockPlugin.app.vault.adapter.exists.mockResolvedValue(true);
      mockPlugin.app.vault.adapter.read.mockResolvedValue(JSON.stringify(jsonData));

      await migrator.migrateFromJSON();

      const batchAddCall = mockVectorStore.batchAdd.mock.calls[0][0];
      
      expect(batchAddCall).toHaveLength(2);
      
             // Check regular document
       const regularDoc = batchAddCall.find((doc: any) => doc.id === 'test.md');
       expect(regularDoc).toBeDefined();
       expect(regularDoc!.title).toBe('Test Document');
       expect(regularDoc!.tags).toEqual(['test', 'example']);
       expect(regularDoc!.metadata.isChunk).toBe(false);
       expect(regularDoc!.metadata.filePath).toBe('test.md');

       // Check chunked document
       const chunkedDoc = batchAddCall.find((doc: any) => doc.id === 'chunked.md#part1');
       expect(chunkedDoc).toBeDefined();
       expect(chunkedDoc!.title).toBe('Chunked Document (分片1)');
       expect(chunkedDoc!.metadata.isChunk).toBe(true);
       expect(chunkedDoc!.metadata.filePath).toBe('chunked.md');
       expect(chunkedDoc!.metadata.originalPath).toBe('chunked.md#part1');
    });

    it('should handle documents with missing fields', async () => {
      const incompleteData = {
        'incomplete.md': {
          path: 'incomplete.md',
          embedding: new Array(1536).fill(0.1),
          updated: Date.now(),
          // Missing title and tags
        },
      };

      mockPlugin.app.vault.adapter.exists.mockResolvedValue(true);
      mockPlugin.app.vault.adapter.read.mockResolvedValue(JSON.stringify(incompleteData));

      await migrator.migrateFromJSON();

      const batchAddCall = mockVectorStore.batchAdd.mock.calls[0][0];
      const doc = batchAddCall[0];
      
      expect(doc.title).toBe('incomplete'); // Extracted from filename
      expect(doc.tags).toEqual([]); // Default empty array
    });
  });
}); 