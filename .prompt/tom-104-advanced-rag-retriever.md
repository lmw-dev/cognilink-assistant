# TOM-104: 多阶段RAG检索算法实现 - 提示词模板

## 目标
实现多阶段检索算法，包括语义检索、关键词匹配增强和结果多样性重排序，提升检索结果的相关性和多样性。

## Linear Issue 参考
**Issue ID**: TOM-104  
**关联父Feature**: TOM-102 (RAG服务增强)  
**关键验收标准**: AC3 - 检索结果相关性提升40%以上

## 核心指令

请在 @src/services/ 目录下创建一个名为 `advanced-rag-retriever.ts` 的新文件，实现 `AdvancedRAGRetriever` 类，该类将替代现有的简单向量检索，提供多阶段检索能力。

## 上下文参考

**主要操作文件**:
- 新建文件: @src/services/advanced-rag-retriever.ts
- 相关服务: @src/services/optimized-vector-store.ts, @src/services/EmbeddingService.ts, @src/services/RAGService.ts
- 类型定义: @src/types/vector-storage.ts
- 设计参考: @docs/01-design/050301-0006-CogniLink优化方案.md (第160-214行的AdvancedRAGRetriever设计)

**需要遵循的内部规则**:
- .cursor/rules/001-typescript-standards.mdc (严格TypeScript类型定义)
- .cursor/rules/003-general.mdc (项目通用规范)

## 具体要求与约束

### 1. 核心类设计
```typescript
export class AdvancedRAGRetriever {
  constructor(
    vectorStore: OptimizedVectorStore,
    embeddingService: EmbeddingService,
    options?: AdvancedRAGOptions
  );
  
  async retrieve(
    query: string, 
    options?: RetrievalOptions
  ): Promise<EnhancedSearchResult[]>;
}
```

### 2. 多阶段检索流程
- **阶段1**: 基于向量相似度的语义检索
  - 使用 OptimizedVectorStore.searchByVector() 进行初始检索
  - 检索数量为 top_k * 2，确保有足够候选结果
  - 应用最小相似度阈值过滤

- **阶段2**: 关键词匹配增强
  - 实现 `_enhanceWithKeywords()` 方法
  - 对查询进行分词处理
  - 计算关键词在内容、标题、标签中的匹配分数
  - 标题匹配权重 > 标签匹配权重 > 内容匹配权重
  - 综合语义分数和关键词分数，支持可配置权重比例

- **阶段3**: 多样性重排序
  - 实现 `_diversifyResults()` 方法
  - 避免返回过多相似内容（重复内容<15%）
  - 基于内容相似度进行去重
  - 保持结果的主题多样性

### 3. 配置选项
```typescript
interface AdvancedRAGOptions {
  keywordWeight: number;        // 关键词权重 (默认: 0.3)
  diversityThreshold: number;   // 多样性阈值 (默认: 0.85)
  maxResults: number;           // 最大返回结果数 (默认: 8)
}

interface RetrievalOptions {
  topK?: number;               // 返回结果数量
  minScore?: number;           // 最小相似度阈值
  includeMetadata?: boolean;   // 是否包含元数据
  filter?: Record<string, any>; // 过滤条件
}
```

### 4. 返回结果格式
```typescript
interface EnhancedSearchResult extends SearchResult {
  keywordScore: number;        // 关键词匹配分数
  combinedScore: number;       // 综合评分
  diversityRank: number;       // 多样性排名
  matchedKeywords: string[];   // 匹配的关键词
}
```

### 5. 性能要求
- 检索响应时间保持在500ms以内
- 支持批量检索优化
- 实现结果缓存机制（可选）
- 内存使用优化，避免大量中间结果

### 6. 错误处理
- 所有异步操作必须有适当的错误处理
- 当向量存储不可用时，降级到关键词检索
- 提供详细的日志记录，便于调试和性能分析

### 7. 测试要求
- 创建对应的测试文件 `@src/services/__tests__/advanced-rag-retriever.test.ts`
- 测试覆盖率达到80%以上
- 包含单元测试和集成测试
- 性能基准测试，验证相关性提升40%的目标

### 8. 集成要求
- 更新 @src/services/RAGService.ts，使用新的 AdvancedRAGRetriever
- 保持向后兼容性，支持渐进式迁移
- 在设置中添加相关配置选项

## 期望输出结构示例

```typescript
// 主要类结构
export class AdvancedRAGRetriever {
  private vectorStore: OptimizedVectorStore;
  private embeddingService: EmbeddingService;
  private options: AdvancedRAGOptions;
  private logger: Logger;

  async retrieve(query: string, options?: RetrievalOptions): Promise<EnhancedSearchResult[]> {
    // 阶段1: 语义检索
    const semanticResults = await this._semanticSearch(query, options);
    
    // 阶段2: 关键词增强
    const enhancedResults = await this._enhanceWithKeywords(semanticResults, query);
    
    // 阶段3: 多样性重排序
    const finalResults = await this._diversifyResults(enhancedResults, options?.topK);
    
    return finalResults;
  }

  private async _semanticSearch(query: string, options?: RetrievalOptions): Promise<SearchResult[]> {
    // 实现语义检索逻辑
  }

  private async _enhanceWithKeywords(results: SearchResult[], query: string): Promise<EnhancedSearchResult[]> {
    // 实现关键词增强逻辑
  }

  private async _diversifyResults(results: EnhancedSearchResult[], topK?: number): Promise<EnhancedSearchResult[]> {
    // 实现多样性重排序逻辑
  }
}
```

## 验收标准检查清单

- [ ] 实现完整的多阶段检索流程
- [ ] 检索结果相关性相比现有方案提升40%以上
- [ ] 支持可配置的语义/关键词权重比例
- [ ] 结果多样性评估通过（重复内容<15%）
- [ ] 检索响应时间保持在500ms以内
- [ ] 完整的TypeScript类型定义
- [ ] 80%以上的测试覆盖率
- [ ] 与现有RAGService的无缝集成
- [ ] 详细的性能日志和错误处理

## 实现注意事项

1. **性能优化**: 使用批量操作减少I/O开销
2. **内存管理**: 及时释放大型中间结果
3. **可扩展性**: 设计支持未来添加更多检索策略
4. **监控指标**: 记录关键性能指标，便于后续优化
5. **渐进式部署**: 支持A/B测试，对比新旧检索效果 