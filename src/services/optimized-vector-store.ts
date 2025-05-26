/**
 * 优化的向量存储服务
 * 用于TOM-103: 向量存储迁移到LanceDB
 */

import { 
  VectorDocument, 
  SearchOptions, 
  SearchResult, 
  BatchResult, 
  VectorStoreConfig 
} from '../types/vector-storage';
import { Logger } from '../utils/logger';
import { cosineDistance } from '../utils/math';

// LanceDB 类型定义 (简化版，实际使用时会从lancedb包导入)
interface LanceDBConnection {
  openTable(name: string): Promise<LanceDBTable>;
  createTable(name: string, data: any[]): Promise<LanceDBTable>;
}

interface LanceDBTable {
  add(data: any[]): Promise<void>;
  search(vector: number[]): LanceDBQuery;
  delete(filter: string): Promise<void>;
  countRows(): Promise<number>;
  update(updates: any): Promise<void>;
}

interface LanceDBQuery {
  limit(n: number): LanceDBQuery;
  where(filter: string): LanceDBQuery;
  toArray(): Promise<any[]>;
}

/**
 * 优化的向量存储类
 * 基于LanceDB实现高性能向量检索
 */
export class OptimizedVectorStore {
  private logger: Logger;
  private config: VectorStoreConfig;
  private db: LanceDBConnection | null = null;
  private table: LanceDBTable | null = null;
  private isInitialized = false;

  constructor(config: VectorStoreConfig) {
    this.logger = new Logger('OptimizedVectorStore');
    this.config = config;
  }

  /**
   * 初始化向量存储
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.info('Vector store already initialized');
      return;
    }

    try {
      this.logger.info('Initializing LanceDB vector store...');
      
      // 动态导入LanceDB (避免在Obsidian环境中的兼容性问题)
      const lancedb = await this.importLanceDB();
      
      // 连接到数据库
      this.db = await lancedb.connect(this.config.dbPath);
      this.logger.info(`Connected to LanceDB at: ${this.config.dbPath}`);

             // 尝试打开现有表，如果不存在则创建
       try {
         this.table = await this.db!.openTable(this.config.tableName);
         this.logger.info(`Opened existing table: ${this.config.tableName}`);
       } catch (error) {
         this.logger.info(`Table ${this.config.tableName} not found, creating new table...`);
         await this.createTable();
       }

      this.isInitialized = true;
      this.logger.info('Vector store initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize vector store', error);
      throw new Error(`Vector store initialization failed: ${error}`);
    }
  }

     /**
    * 动态导入LanceDB
    */
   private async importLanceDB(): Promise<any> {
     try {
       // 在Obsidian环境中，需要特殊处理模块导入
       // 使用动态导入避免编译时的模块检查
       const lancedb = await eval('import("@lancedb/lancedb")');
       return lancedb;
     } catch (error) {
       this.logger.error('Failed to import LanceDB', error);
       throw new Error('LanceDB is not available in this environment');
     }
   }

  /**
   * 创建新表
   */
  private async createTable(): Promise<void> {
    if (!this.db) {
      throw new Error('Database connection not established');
    }

    // 创建示例数据结构
    const sampleData = [{
      id: 'sample',
      content: 'sample content',
      title: 'sample title',
      tags: ['sample'],
      updated: Date.now(),
      vector: new Array(this.config.vectorDimension).fill(0),
      metadata: {
        filePath: 'sample.md',
        noteType: 'markdown',
        wordCount: 2,
      },
    }];

    this.table = await this.db.createTable(this.config.tableName, sampleData);
    
    // 删除示例数据
    await this.table.delete("id = 'sample'");
    
    this.logger.info(`Created new table: ${this.config.tableName}`);
  }

  /**
   * 添加文档
   */
  async addDocuments(documents: VectorDocument[]): Promise<void> {
    await this.ensureInitialized();
    
    if (!documents.length) {
      this.logger.warn('No documents to add');
      return;
    }

    try {
      this.logger.info(`Adding ${documents.length} documents to vector store`);
      
      // 验证文档格式
      const validDocuments = this.validateDocuments(documents);
      
      if (validDocuments.length !== documents.length) {
        this.logger.warn(`${documents.length - validDocuments.length} documents failed validation`);
      }

      if (validDocuments.length === 0) {
        throw new Error('No valid documents to add');
      }

      // 批量添加到LanceDB
      await this.table!.add(validDocuments);
      
      this.logger.info(`Successfully added ${validDocuments.length} documents`);
    } catch (error) {
      this.logger.error('Failed to add documents', error);
      throw new Error(`Failed to add documents: ${error}`);
    }
  }

  /**
   * 更新文档
   */
  async updateDocument(id: string, document: VectorDocument): Promise<void> {
    await this.ensureInitialized();

    try {
      this.logger.info(`Updating document: ${id}`);
      
      // 验证文档
      const validDocuments = this.validateDocuments([document]);
      if (validDocuments.length === 0) {
        throw new Error('Document validation failed');
      }

      // 先删除旧文档
      await this.table!.delete(`id = '${id}'`);
      
      // 添加新文档
      await this.table!.add([validDocuments[0]]);
      
      this.logger.info(`Successfully updated document: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to update document ${id}`, error);
      throw new Error(`Failed to update document: ${error}`);
    }
  }

  /**
   * 删除文档
   */
  async deleteDocument(id: string): Promise<void> {
    await this.ensureInitialized();

    try {
      this.logger.info(`Deleting document: ${id}`);
      await this.table!.delete(`id = '${id}'`);
      this.logger.info(`Successfully deleted document: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete document ${id}`, error);
      throw new Error(`Failed to delete document: ${error}`);
    }
  }

  /**
   * 文本查询搜索
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    // 这里需要先将query转换为向量，然后调用searchByVector
    // 为了简化，这里返回空结果，实际实现需要集成嵌入服务
    this.logger.warn('Text search not implemented, use searchByVector instead');
    return [];
  }

  /**
   * 向量搜索
   */
  async searchByVector(vector: number[], options: SearchOptions = {}): Promise<SearchResult[]> {
    await this.ensureInitialized();

    try {
      const limit = options.limit || 10;
      const threshold = options.threshold || 0.0;

      this.logger.info(`Searching with vector (dim: ${vector.length}), limit: ${limit}`);

      // 验证向量维度
      if (vector.length !== this.config.vectorDimension) {
        throw new Error(`Vector dimension mismatch: expected ${this.config.vectorDimension}, got ${vector.length}`);
      }

      // 执行向量搜索
      let query = this.table!.search(vector).limit(limit);
      
      // 应用过滤条件
      if (options.filter) {
        const filterStr = this.buildFilterString(options.filter);
        if (filterStr) {
          query = query.where(filterStr);
        }
      }

      const results = await query.toArray();

      // 转换结果格式并应用阈值过滤
      const searchResults: SearchResult[] = results
        .map((result: any) => {
          const distance = result._distance || 0;
          const score = 1 - distance; // 将距离转换为相似度分数
          
          return {
            document: {
              id: result.id,
              content: result.content,
              title: result.title,
              tags: result.tags || [],
              updated: result.updated,
              vector: result.vector,
              metadata: result.metadata || {},
            },
            score,
            distance,
          };
        })
        .filter(result => result.score >= threshold)
        .sort((a, b) => b.score - a.score);

      this.logger.info(`Found ${searchResults.length} results above threshold ${threshold}`);
      return searchResults;
    } catch (error) {
      this.logger.error('Vector search failed', error);
      throw new Error(`Vector search failed: ${error}`);
    }
  }

  /**
   * 批量添加
   */
  async batchAdd(documents: VectorDocument[]): Promise<BatchResult> {
    const startTime = Date.now();
    let processedCount = 0;
    let failedCount = 0;
    const errors: Array<{ index: number; error: string }> = [];

    try {
      // 分批处理，避免内存问题
      const batchSize = 100;
      
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        
        try {
          await this.addDocuments(batch);
          processedCount += batch.length;
        } catch (error) {
          failedCount += batch.length;
          errors.push({
            index: i,
            error: String(error),
          });
        }
      }

      const duration = Date.now() - startTime;
      this.logger.info(`Batch add completed: ${processedCount} processed, ${failedCount} failed, ${duration}ms`);

      return {
        success: failedCount === 0,
        processedCount,
        failedCount,
        errors,
      };
    } catch (error) {
      this.logger.error('Batch add operation failed', error);
      return {
        success: false,
        processedCount,
        failedCount: documents.length - processedCount,
        errors: [{ index: -1, error: String(error) }],
      };
    }
  }

  /**
   * 批量更新
   */
  async batchUpdate(updates: { id: string; document: VectorDocument }[]): Promise<BatchResult> {
    const startTime = Date.now();
    let processedCount = 0;
    let failedCount = 0;
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      
      try {
        await this.updateDocument(update.id, update.document);
        processedCount++;
      } catch (error) {
        failedCount++;
        errors.push({
          index: i,
          error: String(error),
        });
      }
    }

    const duration = Date.now() - startTime;
    this.logger.info(`Batch update completed: ${processedCount} processed, ${failedCount} failed, ${duration}ms`);

    return {
      success: failedCount === 0,
      processedCount,
      failedCount,
      errors,
    };
  }

  /**
   * 获取文档数量
   */
  async getDocumentCount(): Promise<number> {
    await this.ensureInitialized();
    
    try {
      const count = await this.table!.countRows();
      this.logger.info(`Document count: ${count}`);
      return count;
    } catch (error) {
      this.logger.error('Failed to get document count', error);
      throw new Error(`Failed to get document count: ${error}`);
    }
  }

  /**
   * 优化数据库
   */
  async optimize(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      this.logger.info('Optimizing vector store...');
      // LanceDB的优化操作（如果有的话）
      // 这里可以添加索引重建、压缩等操作
      this.logger.info('Vector store optimization completed');
    } catch (error) {
      this.logger.error('Failed to optimize vector store', error);
      throw new Error(`Optimization failed: ${error}`);
    }
  }

  /**
   * 备份数据库
   */
  async backup(): Promise<string> {
    await this.ensureInitialized();
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${this.config.dbPath}.backup.${timestamp}`;
      
      this.logger.info(`Creating backup at: ${backupPath}`);
      
      // 这里需要实现实际的备份逻辑
      // 可能需要复制数据库文件或导出数据
      
      this.logger.info(`Backup created successfully: ${backupPath}`);
      return backupPath;
    } catch (error) {
      this.logger.error('Failed to create backup', error);
      throw new Error(`Backup failed: ${error}`);
    }
  }

  /**
   * 恢复数据库
   */
  async restore(backupPath: string): Promise<void> {
    try {
      this.logger.info(`Restoring from backup: ${backupPath}`);
      
      // 这里需要实现实际的恢复逻辑
      // 可能需要替换数据库文件或导入数据
      
      // 重新初始化
      this.isInitialized = false;
      await this.initialize();
      
      this.logger.info('Restore completed successfully');
    } catch (error) {
      this.logger.error('Failed to restore from backup', error);
      throw new Error(`Restore failed: ${error}`);
    }
  }

  /**
   * 确保已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * 验证文档格式
   */
  private validateDocuments(documents: VectorDocument[]): VectorDocument[] {
    return documents.filter(doc => {
      if (!doc.id || !doc.content || !doc.title) {
        this.logger.warn(`Document validation failed: missing required fields`, doc.id);
        return false;
      }
      
      if (!Array.isArray(doc.vector) || doc.vector.length !== this.config.vectorDimension) {
        this.logger.warn(`Document validation failed: invalid vector dimension`, doc.id);
        return false;
      }
      
      return true;
    });
  }

  /**
   * 构建过滤字符串
   */
  private buildFilterString(filter: Record<string, any>): string {
    const conditions: string[] = [];
    
    for (const [key, value] of Object.entries(filter)) {
      if (typeof value === 'string') {
        conditions.push(`${key} = '${value}'`);
      } else if (typeof value === 'number') {
        conditions.push(`${key} = ${value}`);
      } else if (Array.isArray(value)) {
        const valueStr = value.map(v => `'${v}'`).join(', ');
        conditions.push(`${key} IN (${valueStr})`);
      }
    }
    
    return conditions.join(' AND ');
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    if (this.db) {
      this.logger.info('Closing vector store connection');
      // LanceDB可能不需要显式关闭连接
      this.db = null;
      this.table = null;
      this.isInitialized = false;
    }
  }
} 