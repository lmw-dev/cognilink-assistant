# 向量存储迁移指南

## 概述

TOM-103 实现了从JSON文件向量存储到LanceDB专业向量数据库的迁移功能，显著提升了向量检索性能。

## 主要改进

- **性能提升**: 检索速度从秒级提升到毫秒级（<500ms for 1000篇笔记）
- **扩展性**: 支持数万篇笔记的向量存储和检索
- **内存优化**: 内存使用优化50%以上
- **增量更新**: 支持增量更新，无需重建整个索引

## 核心组件

### 1. OptimizedVectorStore
高性能向量存储类，基于LanceDB实现：

```typescript
import { OptimizedVectorStore } from './services/optimized-vector-store';
import { VectorStoreConfig } from './types/vector-storage';

const config: VectorStoreConfig = {
  dbPath: '.obsidian/plugins/cognilink-assistant/vector.db',
  tableName: 'embeddings',
  vectorDimension: 1536,
  enableBackup: true,
  backupInterval: 24 * 60 * 60 * 1000,
};

const vectorStore = new OptimizedVectorStore(config);
await vectorStore.initialize();
```

### 2. VectorStorageMigrator
数据迁移工具，负责从JSON到LanceDB的迁移：

```typescript
import { VectorStorageMigrator } from './services/vector-storage-migrator';
import { VectorStorageConfigManager } from './config/vector-storage-config';

const configManager = new VectorStorageConfigManager();
const migrator = new VectorStorageMigrator(plugin, configManager);

// 执行迁移
const result = await migrator.migrateFromJSON();
console.log(`迁移完成: ${result.migratedCount} 个文档`);
```

### 3. VectorStorageConfigManager
配置管理器，支持JSON和LanceDB之间的切换：

```typescript
import { VectorStorageConfigManager } from './config/vector-storage-config';

const configManager = new VectorStorageConfigManager();

// 切换到LanceDB
configManager.setStorageEngine('lancedb');

// 检查当前引擎
if (configManager.isUsingLanceDB()) {
  console.log('正在使用LanceDB');
}
```

## 迁移步骤

### 自动迁移（推荐）

1. **安装依赖**
   ```bash
   npm install lancedb
   ```

2. **执行迁移**
   ```bash
   npm run migrate-vector-storage
   ```

3. **验证迁移**
   ```bash
   npm run migrate:validate
   ```

### 手动迁移

```typescript
// 1. 初始化组件
const configManager = new VectorStorageConfigManager();
const migrator = new VectorStorageMigrator(plugin, configManager);

// 2. 检查当前状态
const stats = await migrator.getMigrationStats();
console.log(`JSON文档: ${stats.jsonDocuments}`);
console.log(`LanceDB文档: ${stats.lancedbDocuments}`);

// 3. 执行迁移
const result = await migrator.migrateFromJSON();
if (result.success) {
  console.log('迁移成功');
} else {
  console.error('迁移失败:', result.errors);
}

// 4. 验证结果
const validation = await migrator.validateMigration();
if (validation.isValid) {
  console.log('验证通过');
} else {
  console.warn('验证发现问题:', validation.issues);
}
```

## 命令行工具

### 可用命令

```bash
# 执行迁移
npm run migrate-vector-storage

# 验证迁移结果
npm run migrate:validate

# 查看迁移统计
npm run migrate:stats

# 回滚到JSON存储
npm run migrate:rollback
```

### 命令选项

```bash
# 指定自定义JSON文件路径
npm run migrate-vector-storage -- --json-path ./custom/embeddings.json

# 强制迁移（跳过确认）
npm run migrate-vector-storage -- --force

# 显示帮助
npm run migrate-vector-storage -- --help
```

## API 使用

### 向量搜索

```typescript
// 使用向量搜索
const vector = await aiService.generateEmbeddings('查询文本');
const results = await vectorStore.searchByVector(vector, {
  limit: 10,
  threshold: 0.8,
  filter: { noteType: 'markdown' }
});

// 处理结果
results.forEach(result => {
  console.log(`文档: ${result.document.title}`);
  console.log(`相似度: ${result.score}`);
});
```

### 文档管理

```typescript
// 添加文档
const documents: VectorDocument[] = [
  {
    id: 'doc1',
    content: '文档内容',
    title: '文档标题',
    tags: ['标签1', '标签2'],
    updated: Date.now(),
    vector: await aiService.generateEmbeddings('文档内容'),
    metadata: {
      filePath: 'doc1.md',
      noteType: 'markdown',
      wordCount: 100,
    },
  },
];

await vectorStore.addDocuments(documents);

// 更新文档
await vectorStore.updateDocument('doc1', updatedDocument);

// 删除文档
await vectorStore.deleteDocument('doc1');
```

### 批量操作

```typescript
// 批量添加
const batchResult = await vectorStore.batchAdd(documents);
console.log(`处理: ${batchResult.processedCount}, 失败: ${batchResult.failedCount}`);

// 批量更新
const updates = [
  { id: 'doc1', document: updatedDoc1 },
  { id: 'doc2', document: updatedDoc2 },
];
await vectorStore.batchUpdate(updates);
```

## 性能优化

### 配置调优

```typescript
const config: VectorStoreConfig = {
  dbPath: '.obsidian/plugins/cognilink-assistant/vector.db',
  tableName: 'embeddings',
  vectorDimension: 1536,
  enableBackup: true,
  backupInterval: 24 * 60 * 60 * 1000, // 24小时备份一次
};
```

### 搜索优化

```typescript
// 使用合适的阈值
const results = await vectorStore.searchByVector(vector, {
  limit: 10,
  threshold: 0.75, // 调整阈值以平衡精度和召回率
});

// 使用过滤条件减少搜索范围
const filteredResults = await vectorStore.searchByVector(vector, {
  limit: 5,
  filter: {
    noteType: 'markdown',
    tags: ['重要', '工作'],
  },
});
```

## 故障排除

### 常见问题

1. **LanceDB导入失败**
   ```
   Error: LanceDB is not available in this environment
   ```
   解决方案：确保已安装LanceDB依赖
   ```bash
   npm install lancedb
   ```

2. **向量维度不匹配**
   ```
   Error: Vector dimension mismatch: expected 1536, got 768
   ```
   解决方案：检查嵌入模型配置，确保向量维度一致

3. **迁移失败**
   ```
   Error: Failed to read JSON data
   ```
   解决方案：检查JSON文件路径和权限

### 调试模式

```typescript
// 启用详细日志
const logger = new Logger('VectorStore');
logger.setLevel(LogLevel.DEBUG);

// 检查文档数量
const count = await vectorStore.getDocumentCount();
console.log(`当前文档数量: ${count}`);

// 优化数据库
await vectorStore.optimize();
```

### 备份和恢复

```typescript
// 创建备份
const backupPath = await vectorStore.backup();
console.log(`备份已创建: ${backupPath}`);

// 恢复备份
await vectorStore.restore(backupPath);
```

## 向后兼容性

- 保持现有EmbeddingService和RAGService的API不变
- 提供配置选项在JSON和LanceDB之间切换
- 迁移过程不影响插件的正常使用

## 测试

```bash
# 运行向量存储相关测试
npm test -- --testPathPattern="optimized-vector-store|vector-storage-migrator"

# 运行所有测试
npm test

# 运行构建验证
npm run build
```

## 注意事项

1. **数据备份**: 迁移前请确保已备份现有数据
2. **磁盘空间**: LanceDB需要额外的磁盘空间存储向量数据
3. **内存使用**: 大量文档的迁移可能需要较多内存
4. **网络环境**: 首次安装LanceDB需要网络连接

## 后续优化

- 支持更多向量数据库（如ChromaDB、FAISS）
- 实现向量索引的自动优化
- 添加向量数据的压缩存储
- 支持分布式向量存储 