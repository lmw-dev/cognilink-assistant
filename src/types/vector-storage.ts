/**
 * 向量存储相关类型定义
 * 用于TOM-103: 向量存储迁移到LanceDB
 */

export interface VectorDocument {
  id: string;           // 文档唯一标识
  content: string;      // 文档内容
  title: string;        // 文档标题
  tags: string[];       // 标签数组
  updated: number;      // 更新时间戳
  vector: number[];     // 向量嵌入
  metadata: {           // 元数据
    filePath: string;
    noteType: string;
    wordCount: number;
    [key: string]: any;
  };
}

export interface SearchOptions {
  limit?: number;       // 返回结果数量限制
  threshold?: number;   // 相似度阈值
  includeMetadata?: boolean; // 是否包含元数据
  filter?: Record<string, any>; // 过滤条件
}

export interface SearchResult {
  document: VectorDocument;
  score: number;        // 相似度评分
  distance: number;     // 向量距离
}

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  errors: string[];
  duration: number;     // 迁移耗时(ms)
}

export interface ValidationResult {
  isValid: boolean;
  totalDocuments: number;
  validDocuments: number;
  invalidDocuments: number;
  issues: ValidationIssue[];
}

export interface ValidationIssue {
  documentId: string;
  issue: string;
  severity: 'error' | 'warning';
}

export interface VectorStoreConfig {
  dbPath: string;       // 数据库文件路径
  tableName: string;    // 表名
  vectorDimension: number; // 向量维度
  enableBackup: boolean; // 是否启用备份
  backupInterval: number; // 备份间隔(ms)
}

export interface BatchOperation<T> {
  operation: 'add' | 'update' | 'delete';
  data: T;
}

export interface BatchResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: Array<{
    index: number;
    error: string;
  }>;
}

// 兼容现有EmbeddingService的Note接口
export interface Note {
  title: string;
  content: string;
  link: string;
  path: string;
  tags?: string[];
  embedding?: number[];
  updated?: number;
}

// 现有的EmbeddingIndexItem接口
export interface EmbeddingIndexItem {
  path: string;
  embedding: number[];
  updated: number;
  title: string;
  tags?: string[];
}

// 存储引擎类型
export type StorageEngine = 'json' | 'lancedb';

// 存储配置
export interface StorageConfig {
  engine: StorageEngine;
  jsonPath?: string;    // JSON文件路径
  lancedbConfig?: VectorStoreConfig; // LanceDB配置
} 