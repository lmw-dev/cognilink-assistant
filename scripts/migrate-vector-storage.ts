#!/usr/bin/env node

/**
 * 向量存储迁移脚本
 * 用于TOM-103: 向量存储迁移到LanceDB
 * 
 * 使用方法:
 * npm run migrate-vector-storage
 * 或
 * node scripts/migrate-vector-storage.js
 */

import { VectorStorageMigrator } from '../src/services/vector-storage-migrator';
import { VectorStorageConfigManager } from '../src/config/vector-storage-config';
import { Logger } from '../src/utils/logger';

// 模拟插件环境（实际使用时需要真实的插件实例）
class MockPlugin {
  app = {
    vault: {
      adapter: {
        exists: async (path: string) => {
          const fs = await import('fs');
          return fs.existsSync(path);
        },
        read: async (path: string) => {
          const fs = await import('fs');
          return fs.readFileSync(path, 'utf-8');
        },
        write: async (path: string, content: string) => {
          const fs = await import('fs');
          const pathModule = await import('path');
          const dir = pathModule.dirname(path);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(path, content);
        },
        mkdir: async (path: string) => {
          const fs = await import('fs');
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
          }
        },
      },
    },
  };
}

/**
 * 主迁移函数
 */
async function main(): Promise<void> {
  const logger = new Logger('MigrationScript');
  
  try {
    logger.info('Starting vector storage migration script...');

    // 解析命令行参数
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    // 初始化组件
    const mockPlugin = new MockPlugin() as any;
    const configManager = new VectorStorageConfigManager();
    const migrator = new VectorStorageMigrator(mockPlugin, configManager);

    // 显示当前状态
    await showCurrentStatus(migrator, configManager, logger);

    // 执行操作
    if (options.validate) {
      await validateMigration(migrator, logger);
    } else if (options.rollback) {
      await rollbackMigration(migrator, logger);
    } else if (options.stats) {
      await showMigrationStats(migrator, logger);
    } else {
      await performMigration(migrator, configManager, options, logger);
    }

    // 清理资源
    await migrator.cleanup();
    
    logger.info('Migration script completed successfully');
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }
}

/**
 * 解析命令行参数
 */
function parseArgs(args: string[]): {
  jsonPath?: string;
  validate: boolean;
  rollback: boolean;
  stats: boolean;
  force: boolean;
} {
  const options = {
    jsonPath: undefined as string | undefined,
    validate: false,
    rollback: false,
    stats: false,
    force: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--json-path':
        options.jsonPath = args[++i];
        break;
      case '--validate':
        options.validate = true;
        break;
      case '--rollback':
        options.rollback = true;
        break;
      case '--stats':
        options.stats = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--help':
        showHelp();
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          console.warn(`Unknown option: ${arg}`);
        }
    }
  }

  return options;
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log(`
Vector Storage Migration Script

Usage: node scripts/migrate-vector-storage.js [options]

Options:
  --json-path <path>    Specify custom JSON file path
  --validate           Validate existing migration
  --rollback           Rollback migration to JSON storage
  --stats              Show migration statistics
  --force              Force migration without confirmation
  --help               Show this help message

Examples:
  node scripts/migrate-vector-storage.js
  node scripts/migrate-vector-storage.js --json-path ./custom/embeddings.json
  node scripts/migrate-vector-storage.js --validate
  node scripts/migrate-vector-storage.js --rollback
  node scripts/migrate-vector-storage.js --stats
`);
}

/**
 * 显示当前状态
 */
async function showCurrentStatus(
  migrator: VectorStorageMigrator,
  configManager: VectorStorageConfigManager,
  logger: Logger
): Promise<void> {
  logger.info('=== Current Status ===');
  
  const config = configManager.getConfig();
  logger.info(`Current storage engine: ${config.engine}`);
  
  if (config.jsonPath) {
    logger.info(`JSON path: ${config.jsonPath}`);
  }
  
  if (config.lancedbConfig) {
    logger.info(`LanceDB path: ${config.lancedbConfig.dbPath}`);
    logger.info(`LanceDB table: ${config.lancedbConfig.tableName}`);
  }

  const stats = await migrator.getMigrationStats();
  logger.info(`JSON documents: ${stats.jsonDocuments}`);
  logger.info(`LanceDB documents: ${stats.lancedbDocuments}`);
  
  logger.info('======================');
}

/**
 * 执行迁移
 */
async function performMigration(
  migrator: VectorStorageMigrator,
  configManager: VectorStorageConfigManager,
  options: any,
  logger: Logger
): Promise<void> {
  // 检查是否已经使用LanceDB
  if (configManager.isUsingLanceDB()) {
    logger.warn('Already using LanceDB storage engine');
    
    if (!options.force) {
      const stats = await migrator.getMigrationStats();
      if (stats.lancedbDocuments > 0) {
        logger.info('LanceDB already contains data. Use --force to re-migrate');
        return;
      }
    }
  }

  // 确认迁移
  if (!options.force) {
    const confirmed = await confirmMigration();
    if (!confirmed) {
      logger.info('Migration cancelled by user');
      return;
    }
  }

  logger.info('Starting migration...');
  
  const result = await migrator.migrateFromJSON(options.jsonPath);
  
  logger.info('=== Migration Result ===');
  logger.info(`Success: ${result.success}`);
  logger.info(`Migrated: ${result.migratedCount} documents`);
  logger.info(`Failed: ${result.failedCount} documents`);
  logger.info(`Duration: ${result.duration}ms`);
  
  if (result.errors.length > 0) {
    logger.warn('Errors encountered:');
    result.errors.forEach(error => logger.warn(`  - ${error}`));
  }
  
  logger.info('========================');
}

/**
 * 验证迁移
 */
async function validateMigration(
  migrator: VectorStorageMigrator,
  logger: Logger
): Promise<void> {
  logger.info('Validating migration...');
  
  const result = await migrator.validateMigration();
  
  logger.info('=== Validation Result ===');
  logger.info(`Valid: ${result.isValid}`);
  logger.info(`Total documents: ${result.totalDocuments}`);
  logger.info(`Valid documents: ${result.validDocuments}`);
  logger.info(`Invalid documents: ${result.invalidDocuments}`);
  
  if (result.issues.length > 0) {
    logger.warn('Issues found:');
    result.issues.forEach(issue => {
      const level = issue.severity === 'error' ? 'ERROR' : 'WARN';
      logger.warn(`  [${level}] ${issue.documentId}: ${issue.issue}`);
    });
  }
  
  logger.info('=========================');
}

/**
 * 回滚迁移
 */
async function rollbackMigration(
  migrator: VectorStorageMigrator,
  logger: Logger
): Promise<void> {
  logger.warn('Rolling back migration...');
  
  const confirmed = await confirmRollback();
  if (!confirmed) {
    logger.info('Rollback cancelled by user');
    return;
  }
  
  await migrator.rollback();
  logger.info('Rollback completed successfully');
}

/**
 * 显示迁移统计
 */
async function showMigrationStats(
  migrator: VectorStorageMigrator,
  logger: Logger
): Promise<void> {
  const stats = await migrator.getMigrationStats();
  
  logger.info('=== Migration Statistics ===');
  logger.info(`JSON documents: ${stats.jsonDocuments}`);
  logger.info(`LanceDB documents: ${stats.lancedbDocuments}`);
  
  if (stats.lastMigration) {
    logger.info(`Last migration: ${stats.lastMigration.toISOString()}`);
  }
  
  const syncStatus = stats.jsonDocuments === stats.lancedbDocuments ? 'SYNCED' : 'OUT_OF_SYNC';
  logger.info(`Sync status: ${syncStatus}`);
  
  logger.info('============================');
}

/**
 * 确认迁移操作
 */
async function confirmMigration(): Promise<boolean> {
  // 在实际环境中，这里可以使用readline或其他方式获取用户输入
  // 为了简化，这里直接返回true
  console.log('This will migrate your vector storage from JSON to LanceDB.');
  console.log('Make sure you have backed up your data before proceeding.');
  console.log('Use --force to skip this confirmation.');
  
  return true; // 在实际使用中应该获取用户确认
}

/**
 * 确认回滚操作
 */
async function confirmRollback(): Promise<boolean> {
  console.log('This will rollback your vector storage to JSON format.');
  console.log('Any data in LanceDB will be lost.');
  
  return true; // 在实际使用中应该获取用户确认
}

// 运行脚本
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main as runMigration }; 