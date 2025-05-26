# TOM-105: 智能分块策略实现 - 提示词模板

## 目标
实现基于Markdown结构感知的智能文档分块策略，保持语义完整性，提升向量检索的准确性。

## Linear Issue 参考
**Issue ID**: TOM-105  
**关联父Feature**: TOM-102 (RAG服务增强)  
**关键验收标准**: 支持智能分块以提升检索质量

## 核心指令

请在 @src/services/ 目录下创建一个名为 `semantic-chunker.ts` 的新文件，实现 `SemanticChunker` 类，该类将替代现有的简单段落分块策略，提供基于Markdown结构和语义感知的智能分块能力。

## 上下文参考

**主要操作文件**:
- 新建文件: @src/services/semantic-chunker.ts
- 相关服务: @src/services/EmbeddingService.ts, @src/services/optimized-vector-store.ts
- 类型定义: @src/types/vector-storage.ts
- 设计参考: @docs/01-design/050301-0006-CogniLink优化方案.md (第106-159行的SemanticChunker设计)
- 现有分块逻辑: @src/services/EmbeddingService.ts (第26-40行的splitContentByParagraph函数)

**需要遵循的内部规则**:
- .cursor/rules/001-typescript-standards.mdc (严格TypeScript类型定义)
- .cursor/rules/003-general.mdc (项目通用规范)

## 具体要求与约束

### 1. 核心类设计
```typescript
export class SemanticChunker {
  constructor(options?: SemanticChunkerOptions);
  
  async chunkDocument(
    content: string, 
    metadata?: DocumentMetadata
  ): Promise<DocumentChunk[]>;
  
  async chunkMarkdown(
    markdownContent: string, 
    metadata?: DocumentMetadata
  ): Promise<DocumentChunk[]>;
}
```

### 2. 分块策略实现

#### 阶段1: Markdown结构感知分割
- 集成LangChain的 `MarkdownHeaderTextSplitter`
- 支持H1、H2、H3标题结构识别
- 按标题层级进行第一层分割
- 保留标题信息作为元数据

#### 阶段2: 语义感知二次分割
- 集成LangChain的 `RecursiveCharacterTextSplitter`
- 使用Markdown特定的分隔符优先级：
  ```typescript
  const markdownSeparators = [
    "\n#{1,6} ",     // Markdown标题
    "\n```\n",       // 代码块
    "\n---\n",       // 水平分割线
    "\n\n",          // 双换行（段落）
    "\n",            // 单换行
    ". ",            // 句号
    " ",             // 空格
    ""               // 字符级别
  ];
  ```

#### 阶段3: 大小控制和重叠处理
- 分块大小控制在400-600字符范围内（目标512字符）
- 设置50字符的重叠（overlap）
- 基于Token计数而非字符计数进行精确控制

### 3. 配置选项
```typescript
interface SemanticChunkerOptions {
  chunkSize: number;           // 目标分块大小 (默认: 512)
  chunkOverlap: number;        // 重叠大小 (默认: 50)
  maxChunkSize: number;        // 最大分块大小 (默认: 600)
  minChunkSize: number;        // 最小分块大小 (默认: 100)
  preserveHeaders: boolean;    // 是否保留标题信息 (默认: true)
  enableSemanticSplit: boolean; // 是否启用语义分割 (默认: true)
}

interface DocumentMetadata {
  filePath: string;
  title?: string;
  tags?: string[];
  lastModified?: number;
  noteType?: string;
}
```

### 4. 返回结果格式
```typescript
interface DocumentChunk {
  id: string;                  // 唯一标识符
  content: string;             // 分块内容
  metadata: ChunkMetadata;     // 分块元数据
  startIndex: number;          // 在原文档中的起始位置
  endIndex: number;            // 在原文档中的结束位置
  tokenCount: number;          // Token数量
}

interface ChunkMetadata extends DocumentMetadata {
  chunkIndex: number;          // 分块序号
  headerPath: string[];        // 标题路径 (如: ["# 主标题", "## 子标题"])
  chunkType: 'header' | 'content' | 'code' | 'list'; // 分块类型
  parentChunkId?: string;      // 父分块ID（如果有）
  wordCount: number;           // 词数统计
}
```

### 5. 依赖集成

#### LangChain集成
- 安装依赖: `npm install langchain`
- 导入必要模块:
  ```typescript
  import { MarkdownHeaderTextSplitter } from "langchain/text_splitter";
  import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
  ```

#### Token计数
- 使用现有的 `@src/utils/tokenUtils.ts` 中的 `countTokens` 函数
- 确保分块大小基于Token而非字符

### 6. 智能分块逻辑

#### Markdown结构识别
```typescript
private initializeHeaderSplitter(): MarkdownHeaderTextSplitter {
  return new MarkdownHeaderTextSplitter({
    headersToSplitOn: [
      ["#", "Header 1"],
      ["##", "Header 2"], 
      ["###", "Header 3"],
      ["####", "Header 4"],
    ],
    stripHeaders: false, // 保留标题
  });
}
```

#### 递归字符分割
```typescript
private initializeTextSplitter(): RecursiveCharacterTextSplitter {
  return new RecursiveCharacterTextSplitter({
    chunkSize: this.options.chunkSize,
    chunkOverlap: this.options.chunkOverlap,
    separators: [
      "\n#{1,6} ",   // Markdown标题
      "\n```\n",     // 代码块
      "\n---\n",     // 水平线
      "\n\n",        // 段落分隔
      "\n",          // 行分隔
      ". ",          // 句子分隔
      " ",           // 词分隔
      "",            // 字符分隔
    ],
    lengthFunction: (text: string) => countTokens(text, 'openai'),
  });
}
```

### 7. 性能要求
- 分块处理速度：大型文档（10000字符）处理时间<1秒
- 内存使用优化：避免加载整个文档到内存
- 支持流式处理大型文档
- 缓存分块结果，避免重复计算

### 8. 错误处理
- 处理格式不规范的Markdown文档
- 处理超长单个段落的情况
- 提供降级策略：当智能分块失败时，回退到简单分块
- 详细的错误日志和调试信息

### 9. 测试要求
- 创建测试文件 `@src/services/__tests__/semantic-chunker.test.ts`
- 测试覆盖率达到85%以上
- 包含各种Markdown结构的测试用例
- 性能基准测试
- 分块质量评估测试

### 10. 集成要求
- 更新 @src/services/EmbeddingService.ts，使用新的SemanticChunker
- 替换现有的 `splitContentByParagraph` 函数
- 保持向后兼容性
- 在设置中添加分块策略配置选项

## 期望输出结构示例

```typescript
export class SemanticChunker {
  private headerSplitter: MarkdownHeaderTextSplitter;
  private textSplitter: RecursiveCharacterTextSplitter;
  private options: SemanticChunkerOptions;
  private logger: Logger;

  constructor(options?: Partial<SemanticChunkerOptions>) {
    this.options = {
      chunkSize: 512,
      chunkOverlap: 50,
      maxChunkSize: 600,
      minChunkSize: 100,
      preserveHeaders: true,
      enableSemanticSplit: true,
      ...options,
    };
    
    this.headerSplitter = this.initializeHeaderSplitter();
    this.textSplitter = this.initializeTextSplitter();
    this.logger = new Logger('SemanticChunker');
  }

  async chunkMarkdown(
    markdownContent: string, 
    metadata?: DocumentMetadata
  ): Promise<DocumentChunk[]> {
    try {
      // 阶段1: 按标题结构分割
      const headerChunks = await this.splitByHeaders(markdownContent);
      
      // 阶段2: 语义感知二次分割
      const semanticChunks = await this.splitSemanticChunks(headerChunks);
      
      // 阶段3: 后处理和元数据增强
      const finalChunks = await this.postProcessChunks(semanticChunks, metadata);
      
      return finalChunks;
    } catch (error) {
      this.logger.error('Chunking failed, falling back to simple strategy', error);
      return this.fallbackChunking(markdownContent, metadata);
    }
  }

  private async splitByHeaders(content: string): Promise<HeaderChunk[]> {
    // 实现标题分割逻辑
  }

  private async splitSemanticChunks(headerChunks: HeaderChunk[]): Promise<SemanticChunk[]> {
    // 实现语义分割逻辑
  }

  private async postProcessChunks(chunks: SemanticChunk[], metadata?: DocumentMetadata): Promise<DocumentChunk[]> {
    // 实现后处理逻辑
  }

  private async fallbackChunking(content: string, metadata?: DocumentMetadata): Promise<DocumentChunk[]> {
    // 实现降级分块策略
  }
}
```

## 验收标准检查清单

- [ ] 实现完整的智能分块功能
- [ ] 支持H1、H2、H3标题结构识别
- [ ] 分块后的内容保持语义完整性
- [ ] 分块大小控制在合理范围内（400-600字符）
- [ ] 元数据信息正确传递和保存
- [ ] 集成LangChain的MarkdownHeaderTextSplitter和RecursiveCharacterTextSplitter
- [ ] 基于Token计数的精确大小控制
- [ ] 完整的TypeScript类型定义
- [ ] 85%以上的测试覆盖率
- [ ] 与现有EmbeddingService的无缝集成

## 实现注意事项

1. **语义完整性**: 确保分块边界不会破坏语义单元
2. **性能优化**: 对大型文档使用流式处理
3. **错误恢复**: 提供多层降级策略
4. **可配置性**: 支持不同场景的分块参数调整
5. **监控指标**: 记录分块质量和性能指标
6. **向后兼容**: 确保现有功能不受影响

## 分块质量评估

实现分块质量评估机制：
- 语义连贯性评分
- 大小分布统计
- 重叠效果分析
- 标题结构保留度
- 与原始内容的对应关系验证 