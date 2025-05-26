# TOM-103: 向量存储迁移到LanceDB - Cursor Prompt

## 目标
将CogniLink插件的向量存储从JSON文件迁移到LanceDB专业向量数据库，实现高性能的向量检索功能。

## Linear Issue
**TOM-103** - 向量存储迁移到LanceDB
- **父Feature**: TOM-102 - RAG服务增强 - 向量存储与检索优化
- **关键验收标准参考**: TOM-102的AC1、AC2、AC4、AC5
  - AC1: 向量检索响应时间从秒级提升到毫秒级（<500ms for 1000篇笔记）
  - AC2: 支持数万篇笔记的向量存储和检索
  - AC4: 内存使用优化50%以上
  - AC5: 支持增量更新，无需重建整个索引

## 核心指令
请在CogniLink插件中实现向量存储从JSON文件到LanceDB的完整迁移，包括：
1. 集成LanceDB依赖到项目中
2. 设计并实现OptimizedVectorStore类
3. 创建数据迁移工具
4. 实现增量更新机制
5. 确保向后兼容性

## 上下文参考
- **现有向量存储实现**: @src/services/embedding-service.ts
- **当前RAG服务**: @src/services/rag-service.ts
- **项目配置**: @package.json, @tsconfig.json
- **现有数据结构**: 检查现有JSON向量存储的数据格式
- **项目规则**: @.cursor/rules/001-typescript-standards.mdc, @.cursor/rules/003-general.mdc

## 具体要求与约束

### 技术栈约束
- **主要语言**: TypeScript (严格模式)
- **运行环境**: Node.js (Obsidian插件环境)
- **新增依赖**: LanceDB
- **现有依赖**: 保持与现有AI服务、嵌入服务的兼容性

### 数据结构设计
向量数据表结构应包含：
```typescript
interface VectorDocument {
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
```

### 核心类设计要求
实现 `OptimizedVectorStore` 类，必须包含以下方法：
```typescript
class OptimizedVectorStore {
  // 初始化和连接
  async initialize(): Promise<void>
  
  // 文档操作
  async addDocuments(documents: VectorDocument[]): Promise<void>
  async updateDocument(id: string, document: VectorDocument): Promise<void>
  async deleteDocument(id: string): Promise<void>
  
  // 检索功能
  async search(query: string, options?: SearchOptions): Promise<SearchResult[]>
  async searchByVector(vector: number[], options?: SearchOptions): Promise<SearchResult[]>
  
  // 批量操作
  async batchAdd(documents: VectorDocument[]): Promise<void>
  async batchUpdate(updates: { id: string, document: VectorDocument }[]): Promise<void>
  
  // 维护功能
  async getDocumentCount(): Promise<number>
  async optimize(): Promise<void>
  async backup(): Promise<string>
  async restore(backupPath: string): Promise<void>
}
```

### 数据迁移工具要求
创建 `VectorStorageMigrator` 类：
```typescript
class VectorStorageMigrator {
  async migrateFromJSON(jsonFilePath: string): Promise<MigrationResult>
  async validateMigration(): Promise<ValidationResult>
  async rollback(): Promise<void>
}
```

### 性能要求
- **检索速度**: 单次查询响应时间 < 500ms (1000篇笔记规模)
- **内存使用**: 相比JSON方案优化50%以上
- **批量操作**: 支持1000+文档的批量添加
- **并发支持**: 支持多个并发查询请求

### 错误处理要求
- 所有异步操作必须有完整的try-catch错误处理
- 数据库连接失败时的优雅降级机制
- 迁移过程中的错误回滚机制
- 详细的错误日志记录

### 向后兼容性要求
- 保持现有EmbeddingService和RAGService的API不变
- 提供配置选项在JSON和LanceDB之间切换
- 迁移过程不影响插件的正常使用

## 期望输出结构

### 1. 核心实现文件
```
src/services/optimized-vector-store.ts    # OptimizedVectorStore类实现
src/services/vector-storage-migrator.ts   # 数据迁移工具
src/types/vector-storage.ts               # 类型定义
```

### 2. 配置和工具
```
src/config/vector-storage-config.ts       # 配置管理
scripts/migrate-vector-storage.ts         # 迁移脚本
```

### 3. 测试文件
```
src/services/__tests__/optimized-vector-store.test.ts
src/services/__tests__/vector-storage-migrator.test.ts
```

### 4. 更新现有文件
- 更新 `@src/services/embedding-service.ts` 以使用新的向量存储
- 更新 `@package.json` 添加LanceDB依赖
- 更新相关类型定义

## 实施步骤建议

### 第一步：依赖集成和基础设置
1. 在package.json中添加LanceDB依赖
2. 创建基础的类型定义文件
3. 设置LanceDB连接配置

### 第二步：核心类实现
1. 实现OptimizedVectorStore类的基础结构
2. 实现数据库初始化和连接逻辑
3. 实现基础的CRUD操作

### 第三步：检索功能实现
1. 实现向量相似度搜索
2. 实现文本查询转向量搜索
3. 优化检索性能和结果排序

### 第四步：数据迁移工具
1. 实现JSON数据读取和解析
2. 实现数据格式转换
3. 实现批量数据导入
4. 添加迁移验证和回滚功能

### 第五步：集成和测试
1. 更新EmbeddingService以使用新的向量存储
2. 编写完整的单元测试
3. 进行性能基准测试
4. 验证向后兼容性

## 注意事项

### 关键技术考量
- LanceDB在Obsidian插件环境中的兼容性
- 向量数据的序列化和反序列化性能
- 大量数据迁移时的内存管理
- 并发访问时的数据一致性

### 测试重点
- 迁移前后数据的完整性验证
- 不同规模数据集的性能测试
- 错误场景的处理验证
- 内存使用情况监控

### 文档要求
- 为所有公共方法添加详细的JSDoc注释
- 创建迁移操作的用户指南
- 记录性能优化的技术细节
- 提供故障排除指南

---

**使用说明**: 
1. 此prompt应该分阶段执行，建议先从依赖集成和基础设置开始
2. 每个阶段完成后进行测试验证再继续下一阶段
3. 重点关注性能指标的达成和向后兼容性的保持
4. 迁移过程中务必做好数据备份 