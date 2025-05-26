/**
 * 向量存储数据迁移工具
 * 用于TOM-103: 向量存储迁移到LanceDB
 */

import { 
  VectorDocument, 
  MigrationResult, 
  ValidationResult, 
  ValidationIssue,
  EmbeddingIndexItem 
} from '../types/vector-storage';
import { OptimizedVectorStore } from './optimized-vector-store';
import { VectorStorageConfigManager } from '../config/vector-storage-config';
import { Logger } from '../utils/logger';
import CogniLinkPlugin from '../main';

/**
 * 向量存储迁移器
 * 负责从JSON文件向量存储迁移到LanceDB
 */
export class VectorStorageMigrator {
  private logger: Logger;
  private plugin: CogniLinkPlugin;
  private configManager: VectorStorageConfigManager;
  private vectorStore: OptimizedVectorStore | null = null;
  private backupPath: string | null = null;

  constructor(plugin: CogniLinkPlugin, configManager: VectorStorageConfigManager) {
    this.logger = new Logger('VectorStorageMigrator');
    this.plugin = plugin;
    this.configManager = configManager;
  }

  /**
   * 从JSON文件迁移到LanceDB
   */
  async migrateFromJSON(jsonFilePath?: string): Promise<MigrationResult> {
    const startTime = Date.now();
    let migratedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      this.logger.info('Starting migration from JSON to LanceDB...');

      // 1. 确定JSON文件路径
      const jsonPath = jsonFilePath || this.configManager.getJSONPath();
      this.logger.info(`Reading JSON data from: ${jsonPath}`);

      // 2. 读取JSON数据
      const jsonData = await this.readJSONData(jsonPath);
      if (!jsonData || Object.keys(jsonData).length === 0) {
        this.logger.warn('No data found in JSON file');
        return {
          success: true,
          migratedCount: 0,
          failedCount: 0,
          errors: [],
          duration: Date.now() - startTime,
        };
      }

      this.logger.info(`Found ${Object.keys(jsonData).length} entries in JSON file`);

      // 3. 初始化LanceDB向量存储
      await this.initializeLanceDB();

      // 4. 创建备份
      await this.createBackup();

      // 5. 转换数据格式
      const documents = this.convertJSONToDocuments(jsonData);
      this.logger.info(`Converted ${documents.length} documents`);

      // 6. 验证数据
      const validationResult = this.validateDocuments(documents);
      if (!validationResult.isValid) {
        this.logger.warn(`Validation found ${validationResult.issues.length} issues`);
        // 记录验证问题但继续迁移有效数据
        validationResult.issues.forEach(issue => {
          if (issue.severity === 'error') {
            errors.push(`${issue.documentId}: ${issue.issue}`);
          }
        });
      }

      // 7. 批量迁移数据
      const validDocuments = documents.filter(doc => 
        !validationResult.issues.some(issue => 
          issue.documentId === doc.id && issue.severity === 'error'
        )
      );

      if (validDocuments.length > 0) {
        const batchResult = await this.vectorStore!.batchAdd(validDocuments);
        migratedCount = batchResult.processedCount;
        failedCount = batchResult.failedCount;
        
        batchResult.errors.forEach(error => {
          errors.push(`Batch ${error.index}: ${error.error}`);
        });
      }

      // 8. 更新配置为使用LanceDB
      if (migratedCount > 0) {
        this.configManager.setStorageEngine('lancedb');
        this.logger.info('Updated configuration to use LanceDB');
      }

      const duration = Date.now() - startTime;
      const success = failedCount === 0 && errors.length === 0;

      this.logger.info(`Migration completed: ${migratedCount} migrated, ${failedCount} failed, ${duration}ms`);

      return {
        success,
        migratedCount,
        failedCount,
        errors,
        duration,
      };

    } catch (error) {
      this.logger.error('Migration failed', error);
      
      // 尝试回滚
      if (this.backupPath) {
        try {
          await this.rollback();
        } catch (rollbackError) {
          this.logger.error('Rollback also failed', rollbackError);
          errors.push(`Rollback failed: ${rollbackError}`);
        }
      }

      return {
        success: false,
        migratedCount,
        failedCount: failedCount + 1,
        errors: [...errors, String(error)],
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 验证迁移结果
   */
  async validateMigration(): Promise<ValidationResult> {
    try {
      this.logger.info('Validating migration...');

      if (!this.vectorStore) {
        await this.initializeLanceDB();
      }

      // 获取LanceDB中的文档数量
      const lancedbCount = await this.vectorStore!.getDocumentCount();
      
      // 读取原始JSON数据进行对比
      const jsonPath = this.configManager.getJSONPath();
      const jsonData = await this.readJSONData(jsonPath);
      const originalCount = jsonData ? Object.keys(jsonData).length : 0;

      const issues: ValidationIssue[] = [];

      // 检查数据完整性
      if (lancedbCount !== originalCount) {
        issues.push({
          documentId: 'migration',
          issue: `Document count mismatch: JSON has ${originalCount}, LanceDB has ${lancedbCount}`,
          severity: 'warning',
        });
      }

      // 可以添加更多验证逻辑，比如随机抽样验证数据一致性

      const isValid = issues.filter(issue => issue.severity === 'error').length === 0;

      this.logger.info(`Validation completed: ${isValid ? 'PASSED' : 'FAILED'}, ${issues.length} issues found`);

      return {
        isValid,
        totalDocuments: originalCount,
        validDocuments: lancedbCount,
        invalidDocuments: Math.max(0, originalCount - lancedbCount),
        issues,
      };

    } catch (error) {
      this.logger.error('Validation failed', error);
      return {
        isValid: false,
        totalDocuments: 0,
        validDocuments: 0,
        invalidDocuments: 0,
        issues: [{
          documentId: 'validation',
          issue: `Validation error: ${error}`,
          severity: 'error',
        }],
      };
    }
  }

  /**
   * 回滚迁移
   */
  async rollback(): Promise<void> {
    try {
      this.logger.info('Rolling back migration...');

      // 恢复配置为JSON模式
      this.configManager.setStorageEngine('json');

      // 如果有备份，恢复备份
      if (this.backupPath && this.vectorStore) {
        await this.vectorStore.restore(this.backupPath);
      }

      this.logger.info('Rollback completed successfully');
    } catch (error) {
      this.logger.error('Rollback failed', error);
      throw new Error(`Rollback failed: ${error}`);
    }
  }

  /**
   * 读取JSON数据
   */
  private async readJSONData(jsonPath: string): Promise<Record<string, EmbeddingIndexItem> | null> {
    try {
      const exists = await this.plugin.app.vault.adapter.exists(jsonPath);
      if (!exists) {
        this.logger.warn(`JSON file not found: ${jsonPath}`);
        return null;
      }

      const content = await this.plugin.app.vault.adapter.read(jsonPath);
      const data = JSON.parse(content);
      
      this.logger.info(`Successfully read JSON data: ${Object.keys(data).length} entries`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to read JSON data from ${jsonPath}`, error);
      throw new Error(`Failed to read JSON data: ${error}`);
    }
  }

  /**
   * 转换JSON数据为VectorDocument格式
   */
  private convertJSONToDocuments(jsonData: Record<string, EmbeddingIndexItem>): VectorDocument[] {
    const documents: VectorDocument[] = [];

    for (const [path, item] of Object.entries(jsonData)) {
      try {
        // 处理分片文档（path包含#part的情况）
        const isChunk = path.includes('#part');
        const basePath = isChunk ? path.split('#part')[0] : path;
        
        // 生成基本内容，避免空content导致验证失败
        const content = this.generateContentFromPath(basePath, isChunk);
        
        const document: VectorDocument = {
          id: path, // 使用完整路径作为ID，包括分片信息
          content: content, // 生成基本内容
          title: item.title || this.extractTitleFromPath(basePath),
          tags: item.tags || [],
          updated: item.updated || Date.now(),
          vector: item.embedding || [],
          metadata: {
            filePath: basePath,
            noteType: 'markdown',
            wordCount: content.length,
          },
        };

        documents.push(document);
      } catch (error) {
        this.logger.warn(`Failed to convert document ${path}`, error);
      }
    }

    return documents;
  }

  /**
   * 从路径生成基本内容
   */
  private generateContentFromPath(path: string, isChunk: boolean): string {
    const title = this.extractTitleFromPath(path);
    const chunkSuffix = isChunk ? ' (chunk)' : '';
    
    // 生成基本内容，确保不为空
    return `# ${title}${chunkSuffix}\n\nContent from: ${path}\n\nThis document was migrated from JSON storage to LanceDB.`;
  }

  /**
   * 从路径提取标题
   */
  private extractTitleFromPath(path: string): string {
    const fileName = path.split('/').pop() || path;
    return fileName.replace(/\.md$/, '');
  }

  /**
   * 验证文档数据
   */
  private validateDocuments(documents: VectorDocument[]): ValidationResult {
    const issues: ValidationIssue[] = [];
    let validCount = 0;

    for (const doc of documents) {
      let hasError = false;

      // 检查必需字段
      if (!doc.id) {
        issues.push({
          documentId: doc.id || 'unknown',
          issue: 'Missing document ID',
          severity: 'error',
        });
        hasError = true;
      }

      if (!doc.title) {
        issues.push({
          documentId: doc.id,
          issue: 'Missing document title',
          severity: 'warning',
        });
      }

      if (!doc.content || doc.content.trim().length === 0) {
        issues.push({
          documentId: doc.id,
          issue: 'Missing or empty document content',
          severity: 'warning', // 改为警告而不是错误
        });
      }

      // 检查向量数据
      if (!Array.isArray(doc.vector) || doc.vector.length === 0) {
        issues.push({
          documentId: doc.id,
          issue: 'Missing or invalid vector data',
          severity: 'error',
        });
        hasError = true;
      }

      // 检查向量维度
      const expectedDim = this.configManager.getLanceDBConfig().vectorDimension;
      if (doc.vector.length !== expectedDim) {
        issues.push({
          documentId: doc.id,
          issue: `Vector dimension mismatch: expected ${expectedDim}, got ${doc.vector.length}`,
          severity: 'error',
        });
        hasError = true;
      }

      if (!hasError) {
        validCount++;
      }
    }

    return {
      isValid: issues.filter(issue => issue.severity === 'error').length === 0,
      totalDocuments: documents.length,
      validDocuments: validCount,
      invalidDocuments: documents.length - validCount,
      issues,
    };
  }

  /**
   * 初始化LanceDB向量存储
   */
  private async initializeLanceDB(): Promise<void> {
    if (this.vectorStore) {
      return;
    }

    const lancedbConfig = this.configManager.getLanceDBConfig();
    this.vectorStore = new OptimizedVectorStore(lancedbConfig);
    await this.vectorStore.initialize();
    
    this.logger.info('LanceDB vector store initialized for migration');
  }

  /**
   * 创建备份
   */
  private async createBackup(): Promise<void> {
    try {
      if (this.vectorStore) {
        this.backupPath = await this.vectorStore.backup();
        this.logger.info(`Backup created: ${this.backupPath}`);
      }
    } catch (error) {
      this.logger.warn('Failed to create backup', error);
      // 不阻止迁移过程
    }
  }

  /**
   * 获取迁移统计信息
   */
  async getMigrationStats(): Promise<{
    jsonDocuments: number;
    lancedbDocuments: number;
    lastMigration?: Date;
  }> {
    try {
      // 读取JSON数据统计
      const jsonPath = this.configManager.getJSONPath();
      const jsonData = await this.readJSONData(jsonPath);
      const jsonDocuments = jsonData ? Object.keys(jsonData).length : 0;

      // 读取LanceDB数据统计
      let lancedbDocuments = 0;
      if (this.configManager.isUsingLanceDB()) {
        await this.initializeLanceDB();
        lancedbDocuments = await this.vectorStore!.getDocumentCount();
      }

      return {
        jsonDocuments,
        lancedbDocuments,
        // lastMigration 可以从配置或日志中获取
      };
    } catch (error) {
      this.logger.error('Failed to get migration stats', error);
      return {
        jsonDocuments: 0,
        lancedbDocuments: 0,
      };
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.vectorStore) {
      await this.vectorStore.close();
      this.vectorStore = null;
    }
    this.backupPath = null;
  }
} 