/**
 * OptimizedVectorStore 单元测试
 * 用于TOM-103: 向量存储迁移到LanceDB
 */

import { OptimizedVectorStore } from '../optimized-vector-store';
import { VectorDocument, VectorStoreConfig, SearchOptions } from '../../types/vector-storage';

// Mock LanceDB
jest.mock('@lancedb/lancedb', () => ({
  connect: jest.fn(),
}));

describe('OptimizedVectorStore', () => {
  let vectorStore: OptimizedVectorStore;
  let mockConfig: VectorStoreConfig;
  let mockDb: any;
  let mockTable: any;

  beforeEach(() => {
    // 设置mock配置
    mockConfig = {
      dbPath: './test.db',
      tableName: 'test_embeddings',
      vectorDimension: 1536,
      enableBackup: true,
      backupInterval: 1000,
    };

    // 设置mock LanceDB对象
    mockTable = {
      add: jest.fn().mockResolvedValue(undefined),
      search: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      }),
      delete: jest.fn().mockResolvedValue(undefined),
      countRows: jest.fn().mockResolvedValue(0),
      update: jest.fn().mockResolvedValue(undefined),
    };

    mockDb = {
      openTable: jest.fn().mockResolvedValue(mockTable),
      createTable: jest.fn().mockResolvedValue(mockTable),
    };

    // 创建向量存储实例
    vectorStore = new OptimizedVectorStore(mockConfig);

    // Mock动态导入
    (global as any).eval = jest.fn().mockResolvedValue({
      connect: jest.fn().mockResolvedValue(mockDb),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully with existing table', async () => {
      await vectorStore.initialize();
      
      expect(mockDb.openTable).toHaveBeenCalledWith('test_embeddings');
      expect(mockDb.createTable).not.toHaveBeenCalled();
    });

    it('should create new table if not exists', async () => {
      mockDb.openTable.mockRejectedValueOnce(new Error('Table not found'));
      
      await vectorStore.initialize();
      
      expect(mockDb.openTable).toHaveBeenCalledWith('test_embeddings');
      expect(mockDb.createTable).toHaveBeenCalled();
      expect(mockTable.delete).toHaveBeenCalledWith("id = 'sample'");
    });

    it('should not reinitialize if already initialized', async () => {
      await vectorStore.initialize();
      await vectorStore.initialize();
      
      expect(mockDb.openTable).toHaveBeenCalledTimes(1);
    });

    it('should handle initialization errors', async () => {
      (global as any).eval = jest.fn().mockRejectedValue(new Error('LanceDB not available'));
      
      await expect(vectorStore.initialize()).rejects.toThrow('Vector store initialization failed');
    });
  });

  describe('document operations', () => {
    beforeEach(async () => {
      await vectorStore.initialize();
    });

    describe('addDocuments', () => {
      it('should add valid documents', async () => {
        const documents: VectorDocument[] = [
          {
            id: 'doc1',
            content: 'Test content',
            title: 'Test Document',
            tags: ['test'],
            updated: Date.now(),
            vector: new Array(1536).fill(0.1),
            metadata: {
              filePath: 'test.md',
              noteType: 'markdown',
              wordCount: 2,
            },
          },
        ];

        await vectorStore.addDocuments(documents);
        
        expect(mockTable.add).toHaveBeenCalledWith(documents);
      });

      it('should filter out invalid documents', async () => {
        const documents: VectorDocument[] = [
          {
            id: '',
            content: 'Invalid document',
            title: 'Invalid',
            tags: [],
            updated: Date.now(),
            vector: [],
            metadata: {
              filePath: 'invalid.md',
              noteType: 'markdown',
              wordCount: 0,
            },
          },
        ];

        await expect(vectorStore.addDocuments(documents)).rejects.toThrow('No valid documents to add');
        expect(mockTable.add).not.toHaveBeenCalled();
      });

      it('should handle empty document array', async () => {
        await vectorStore.addDocuments([]);
        expect(mockTable.add).not.toHaveBeenCalled();
      });
    });

    describe('updateDocument', () => {
      it('should update existing document', async () => {
        const document: VectorDocument = {
          id: 'doc1',
          content: 'Updated content',
          title: 'Updated Document',
          tags: ['updated'],
          updated: Date.now(),
          vector: new Array(1536).fill(0.2),
          metadata: {
            filePath: 'updated.md',
            noteType: 'markdown',
            wordCount: 2,
          },
        };

        await vectorStore.updateDocument('doc1', document);
        
        expect(mockTable.delete).toHaveBeenCalledWith("id = 'doc1'");
        expect(mockTable.add).toHaveBeenCalledWith([document]);
      });

      it('should handle update errors', async () => {
        const document: VectorDocument = {
          id: 'doc1',
          content: 'Test',
          title: 'Test',
          tags: [],
          updated: Date.now(),
          vector: [], // Invalid vector
          metadata: {
            filePath: 'test.md',
            noteType: 'markdown',
            wordCount: 1,
          },
        };

        await expect(vectorStore.updateDocument('doc1', document)).rejects.toThrow('Document validation failed');
      });
    });

    describe('deleteDocument', () => {
      it('should delete document by id', async () => {
        await vectorStore.deleteDocument('doc1');
        expect(mockTable.delete).toHaveBeenCalledWith("id = 'doc1'");
      });

      it('should handle delete errors', async () => {
        mockTable.delete.mockRejectedValueOnce(new Error('Delete failed'));
        
        await expect(vectorStore.deleteDocument('doc1')).rejects.toThrow('Failed to delete document');
      });
    });
  });

  describe('search operations', () => {
    beforeEach(async () => {
      await vectorStore.initialize();
    });

    describe('searchByVector', () => {
      it('should perform vector search with default options', async () => {
        const vector = new Array(1536).fill(0.1);
        const mockResults = [
          {
            id: 'doc1',
            content: 'Test content',
            title: 'Test',
            tags: ['test'],
            updated: Date.now(),
            vector: new Array(1536).fill(0.1),
            metadata: { filePath: 'test.md', noteType: 'markdown', wordCount: 2 },
            _distance: 0.1,
          },
        ];

        mockTable.search().toArray.mockResolvedValueOnce(mockResults);

        const results = await vectorStore.searchByVector(vector);
        
        expect(mockTable.search).toHaveBeenCalledWith(vector);
        expect(results).toHaveLength(1);
        expect(results[0].score).toBe(0.9); // 1 - 0.1
        expect(results[0].document.id).toBe('doc1');
      });

      it('should apply search options', async () => {
        const vector = new Array(1536).fill(0.1);
        const options: SearchOptions = {
          limit: 5,
          threshold: 0.8,
          filter: { noteType: 'markdown' },
        };

        mockTable.search().toArray.mockResolvedValueOnce([]);

        await vectorStore.searchByVector(vector, options);
        
        expect(mockTable.search().limit).toHaveBeenCalledWith(5);
        expect(mockTable.search().where).toHaveBeenCalledWith("noteType = 'markdown'");
      });

      it('should validate vector dimension', async () => {
        const invalidVector = [0.1, 0.2]; // Wrong dimension
        
        await expect(vectorStore.searchByVector(invalidVector)).rejects.toThrow('Vector dimension mismatch');
      });

      it('should filter results by threshold', async () => {
        const vector = new Array(1536).fill(0.1);
        const mockResults = [
          {
            id: 'doc1',
            _distance: 0.1, // score = 0.9
          },
          {
            id: 'doc2',
            _distance: 0.5, // score = 0.5
          },
        ];

        mockTable.search().toArray.mockResolvedValueOnce(mockResults);

        const results = await vectorStore.searchByVector(vector, { threshold: 0.7 });
        
        expect(results).toHaveLength(1);
        expect(results[0].document.id).toBe('doc1');
      });
    });

    describe('search', () => {
      it('should warn about text search not implemented', async () => {
        const results = await vectorStore.search('test query');
        expect(results).toEqual([]);
      });
    });
  });

  describe('batch operations', () => {
    beforeEach(async () => {
      await vectorStore.initialize();
    });

    describe('batchAdd', () => {
      it('should process documents in batches', async () => {
        const documents: VectorDocument[] = Array.from({ length: 150 }, (_, i) => ({
          id: `doc${i}`,
          content: `Content ${i}`,
          title: `Document ${i}`,
          tags: ['test'],
          updated: Date.now(),
          vector: new Array(1536).fill(0.1),
          metadata: {
            filePath: `doc${i}.md`,
            noteType: 'markdown',
            wordCount: 2,
          },
        }));

        const result = await vectorStore.batchAdd(documents);
        
        expect(result.success).toBe(true);
        expect(result.processedCount).toBe(150);
        expect(result.failedCount).toBe(0);
        expect(mockTable.add).toHaveBeenCalledTimes(2); // 150 docs in 2 batches of 100
      });

      it('should handle batch failures', async () => {
        const documents: VectorDocument[] = [
          {
            id: 'doc1',
            content: 'Test',
            title: 'Test',
            tags: [],
            updated: Date.now(),
            vector: new Array(1536).fill(0.1),
            metadata: {
              filePath: 'test.md',
              noteType: 'markdown',
              wordCount: 1,
            },
          },
        ];

        mockTable.add.mockRejectedValueOnce(new Error('Batch failed'));

        const result = await vectorStore.batchAdd(documents);
        
        expect(result.success).toBe(false);
        expect(result.failedCount).toBe(1);
        expect(result.errors).toHaveLength(1);
      });
    });

    describe('batchUpdate', () => {
      it('should update multiple documents', async () => {
        const updates = [
          {
            id: 'doc1',
            document: {
              id: 'doc1',
              content: 'Updated 1',
              title: 'Updated 1',
              tags: [],
              updated: Date.now(),
              vector: new Array(1536).fill(0.1),
              metadata: {
                filePath: 'doc1.md',
                noteType: 'markdown',
                wordCount: 2,
              },
            },
          },
        ];

        const result = await vectorStore.batchUpdate(updates);
        
        expect(result.success).toBe(true);
        expect(result.processedCount).toBe(1);
        expect(mockTable.delete).toHaveBeenCalledWith("id = 'doc1'");
        expect(mockTable.add).toHaveBeenCalledWith([updates[0].document]);
      });
    });
  });

  describe('maintenance operations', () => {
    beforeEach(async () => {
      await vectorStore.initialize();
    });

    describe('getDocumentCount', () => {
      it('should return document count', async () => {
        mockTable.countRows.mockResolvedValueOnce(42);
        
        const count = await vectorStore.getDocumentCount();
        
        expect(count).toBe(42);
        expect(mockTable.countRows).toHaveBeenCalled();
      });
    });

    describe('optimize', () => {
      it('should complete optimization', async () => {
        await expect(vectorStore.optimize()).resolves.not.toThrow();
      });
    });

    describe('backup and restore', () => {
      it('should create backup', async () => {
        const backupPath = await vectorStore.backup();
        
        expect(backupPath).toMatch(/\.backup\./);
      });

      it('should restore from backup', async () => {
        await expect(vectorStore.restore('backup.db')).resolves.not.toThrow();
      });
    });

    describe('close', () => {
      it('should close connection', async () => {
        await vectorStore.close();
        // Should not throw and should reset internal state
      });
    });
  });

  describe('error handling', () => {
    it('should handle LanceDB import failure', async () => {
      (global as any).eval = jest.fn().mockRejectedValue(new Error('Module not found'));
      
      const newVectorStore = new OptimizedVectorStore(mockConfig);
      await expect(newVectorStore.initialize()).rejects.toThrow('LanceDB is not available in this environment');
    });

    it('should handle database connection failure', async () => {
      (global as any).eval = jest.fn().mockResolvedValue({
        connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
      });
      
      const newVectorStore = new OptimizedVectorStore(mockConfig);
      await expect(newVectorStore.initialize()).rejects.toThrow('Vector store initialization failed');
    });
  });
}); 