/**
 * 向量存储配置管理
 * 用于TOM-103: 向量存储迁移到LanceDB
 */

import { VectorStoreConfig, StorageConfig, StorageEngine } from '../types/vector-storage';
import { Logger } from '../utils/logger';

export class VectorStorageConfigManager {
  private logger: Logger;
  private config: StorageConfig;

  constructor() {
    this.logger = new Logger('VectorStorageConfigManager');
    this.config = this.getDefaultConfig();
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): StorageConfig {
    return {
      engine: 'json', // 默认使用JSON，保持向后兼容
      jsonPath: '/Users/liumingwei/Library/Mobile Documents/iCloud~md~obsidian/Documents/.obsidian/plugins/cognilink-assistant/embeddings.json',
      lancedbConfig: {
        dbPath: '/Users/liumingwei/Library/Mobile Documents/iCloud~md~obsidian/Documents/.obsidian/plugins/cognilink-assistant/vector.db',
        tableName: 'embeddings',
        vectorDimension: 1536, // OpenAI text-embedding-ada-002 的维度
        enableBackup: true,
        backupInterval: 24 * 60 * 60 * 1000, // 24小时
      },
    };
  }

  /**
   * 获取当前配置
   */
  getConfig(): StorageConfig {
    return { ...this.config };
  }

  /**
   * 更新存储引擎
   */
  setStorageEngine(engine: StorageEngine): void {
    this.logger.info(`Switching storage engine from ${this.config.engine} to ${engine}`);
    this.config.engine = engine;
  }

  /**
   * 更新LanceDB配置
   */
  updateLanceDBConfig(config: Partial<VectorStoreConfig>): void {
    if (!this.config.lancedbConfig) {
      this.config.lancedbConfig = this.getDefaultConfig().lancedbConfig!;
    }
    
    this.config.lancedbConfig = {
      ...this.config.lancedbConfig,
      ...config,
    };
    
    this.logger.info('LanceDB configuration updated', this.config.lancedbConfig);
  }

  /**
   * 获取LanceDB配置
   */
  getLanceDBConfig(): VectorStoreConfig {
    if (!this.config.lancedbConfig) {
      this.config.lancedbConfig = this.getDefaultConfig().lancedbConfig!;
    }
    return { ...this.config.lancedbConfig };
  }

  /**
   * 获取JSON文件路径
   */
  getJSONPath(): string {
    return this.config.jsonPath || this.getDefaultConfig().jsonPath!;
  }

  /**
   * 更新JSON文件路径
   */
  setJSONPath(path: string): void {
    this.config.jsonPath = path;
    this.logger.info(`JSON path updated to: ${path}`);
  }

  /**
   * 检查当前是否使用LanceDB
   */
  isUsingLanceDB(): boolean {
    return this.config.engine === 'lancedb';
  }

  /**
   * 检查当前是否使用JSON
   */
  isUsingJSON(): boolean {
    return this.config.engine === 'json';
  }

  /**
   * 验证配置有效性
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.engine) {
      errors.push('Storage engine is not specified');
    }

    if (this.config.engine === 'lancedb' && !this.config.lancedbConfig) {
      errors.push('LanceDB configuration is missing');
    }

    if (this.config.engine === 'json' && !this.config.jsonPath) {
      errors.push('JSON file path is missing');
    }

    if (this.config.lancedbConfig) {
      const lanceConfig = this.config.lancedbConfig;
      
      if (!lanceConfig.dbPath) {
        errors.push('LanceDB database path is missing');
      }
      
      if (!lanceConfig.tableName) {
        errors.push('LanceDB table name is missing');
      }
      
      if (!lanceConfig.vectorDimension || lanceConfig.vectorDimension <= 0) {
        errors.push('Invalid vector dimension');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 从JSON对象加载配置
   */
  loadFromJSON(configData: any): void {
    try {
      if (configData.engine) {
        this.config.engine = configData.engine;
      }
      
      if (configData.jsonPath) {
        this.config.jsonPath = configData.jsonPath;
      }
      
      if (configData.lancedbConfig) {
        this.config.lancedbConfig = {
          ...this.getDefaultConfig().lancedbConfig!,
          ...configData.lancedbConfig,
        };
      }
      
      this.logger.info('Configuration loaded from JSON');
    } catch (error) {
      this.logger.error('Failed to load configuration from JSON', error);
      throw new Error(`Invalid configuration data: ${error}`);
    }
  }

  /**
   * 导出配置为JSON对象
   */
  toJSON(): any {
    return {
      engine: this.config.engine,
      jsonPath: this.config.jsonPath,
      lancedbConfig: this.config.lancedbConfig,
    };
  }

  /**
   * 重置为默认配置
   */
  reset(): void {
    this.config = this.getDefaultConfig();
    this.logger.info('Configuration reset to defaults');
  }
} 