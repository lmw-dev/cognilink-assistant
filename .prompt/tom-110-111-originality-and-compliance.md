# TOM-110/111 原创性检测与平台适配度评估 Prompt

## 🎯 目标 (Objective)
**Linear Issues**: 
- TOM-110 - [Task: TOM-109] 原创性检测算法实现
- TOM-111 - [Task: TOM-109] 平台适配度评估引擎

**父Feature**: TOM-109 内容质量评估系统
**关键验收标准参考**: 
- TOM-110 AC: 原创性检测准确率达到85%以上，相似度计算性能<2秒
- TOM-111 AC: 平台适配度评估准确率达到80%以上，覆盖主要规则

**核心指令**: 实现原创性检测算法增强和平台适配度评估引擎，为TOM-109质量评估系统提供核心检测能力。

## 📋 上下文参考 (Context References)

### 主要操作文件
- 原创性检测器: @src/services/originality-detector.ts (待创建)
- 平台适配度评估器: @src/services/platform-compliance-evaluator.ts (待创建)
- 类型定义: @src/types/quality-assessment.ts (待创建)

### 依赖的现有服务
- 现有原创性服务: @src/services/OriginalityService.ts
- 嵌入服务: @src/services/EmbeddingService.ts
- 平台模板管理: @src/services/platform-template-manager.ts
- 内容后处理器: @src/services/content-post-processor.ts

### 类型定义文件
- 社交媒体类型: @src/types/social-media.ts
- 内容处理类型: @src/types/content-processing.ts

### 需要遵循的内部规则
- TypeScript标准: @.cursor/rules/001-typescript-standards.mdc
- 项目通用规范: @.cursor/rules/003-general.mdc
- 任务工作流程: @.cursor/rules/007-task-workflow.mdc

## 🔧 具体要求与约束 (Requirements & Constraints)

### 技术栈约束
- **语言**: TypeScript (strict mode)
- **架构模式**: 服务层模式，依赖注入
- **性能要求**: 原创性检测<2秒，平台适配度评估<1秒
- **准确率要求**: 原创性检测≥85%，平台适配度≥80%

### TOM-110: 原创性检测算法增强

#### 功能要求
1. **扩展现有OriginalityService**:
   - 基于sentence-transformers的相似度计算
   - 与源笔记的精确相似度分析
   - 重复内容片段识别和高亮
   - 最相似源笔记追踪和引用

2. **检测算法优化**:
   - 段落级和句子级相似度检测
   - 语义相似度vs字面相似度区分
   - 动态阈值调整机制
   - 批量检测性能优化

#### 技术实现
- 使用现有EmbeddingService进行向量计算
- 实现滑动窗口相似度检测
- 添加缓存机制提升性能
- 支持多种相似度算法（余弦、欧几里得等）

### TOM-111: 平台适配度评估引擎

#### 功能要求
1. **平台规则体系**:
   - **小红书**: 表情符号密度、互动问题、视觉语言、标签使用
   - **Twitter**: 字符限制、标签数量、简洁性、互动元素
   - **微信公众号**: 长度要求、结构化、专业性、示例使用
   - **个人博客**: 技术深度、代码示例、SEO优化
   - **头条号**: 标题吸引力、通俗易懂、讨论引导

2. **评估机制**:
   - 基于规则的自动检查算法
   - 权重化评分系统
   - 具体改进建议生成
   - 规则配置和更新支持

#### 技术实现
- 正则表达式和文本分析
- 可配置的规则引擎
- 权重化评分算法
- 结构化改进建议生成

## 📝 期望输出结构 (Expected Output Structure)

### 1. 原创性检测器 (TOM-110)

```typescript
// 原创性检测器
export class OriginalityDetector {
  constructor(
    private embeddingService: EmbeddingService,
    private logger: Logger
  );

  // 检测内容原创性
  async detectOriginality(
    content: string,
    sourceNotes: Note[],
    options?: OriginalityDetectionOptions
  ): Promise<OriginalityDetectionResult>;

  // 识别重复片段
  async identifyDuplicateSegments(
    content: string,
    sourceNotes: Note[],
    threshold?: number
  ): Promise<DuplicateSegment[]>;

  // 计算相似度
  async calculateSimilarity(
    text1: string,
    text2: string,
    method?: SimilarityMethod
  ): Promise<number>;

  // 批量检测
  async batchDetect(
    requests: OriginalityDetectionRequest[]
  ): Promise<OriginalityDetectionResult[]>;
}
```

### 2. 平台适配度评估器 (TOM-111)

```typescript
// 平台适配度评估器
export class PlatformComplianceEvaluator {
  constructor(
    private platformRules: Map<PlatformId, ComplianceRule[]>,
    private logger: Logger
  );

  // 评估平台适配度
  async evaluateCompliance(
    content: string,
    platform: SocialMediaPlatform,
    options?: ComplianceEvaluationOptions
  ): Promise<ComplianceEvaluationResult>;

  // 检查特定规则
  checkRule(
    content: string,
    rule: ComplianceRule
  ): RuleCheckResult;

  // 生成改进建议
  generateImprovementSuggestions(
    result: ComplianceEvaluationResult
  ): ImprovementSuggestion[];

  // 更新规则配置
  updateRules(
    platformId: PlatformId,
    rules: ComplianceRule[]
  ): void;
}
```

### 3. 类型定义

```typescript
// 原创性检测结果
export interface OriginalityDetectionResult {
  overallScore: number;
  similarity: number;
  duplicateSegments: DuplicateSegment[];
  mostSimilarSource: {
    note: Note;
    similarity: number;
    matchedSegments: string[];
  };
  isOriginal: boolean;
  confidence: number;
  processingTime: number;
}

// 重复片段
export interface DuplicateSegment {
  content: string;
  startIndex: number;
  endIndex: number;
  similarity: number;
  sourceNote: Note;
  sourceSegment: string;
}

// 平台适配度评估结果
export interface ComplianceEvaluationResult {
  overallScore: number;
  ruleChecks: RuleCheckResult[];
  improvements: ImprovementSuggestion[];
  isCompliant: boolean;
  platformSpecificScores: {
    [key: string]: number;
  };
  processingTime: number;
}

// 规则检查结果
export interface RuleCheckResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  score: number;
  weight: number;
  details: string;
  suggestions?: string[];
}
```

## 🔄 实现步骤 (Implementation Steps)

### 第1步: 类型系统设计 (优先级: 最高)
1. 创建 `src/types/quality-assessment.ts`
2. 定义原创性检测相关类型
3. 定义平台适配度评估相关类型
4. 确保与现有类型系统兼容

### 第2步: 原创性检测器实现 (TOM-110) (优先级: 最高)
1. 创建 `OriginalityDetector` 类
2. 实现基础相似度计算
3. 添加重复片段识别算法
4. 实现最相似源笔记追踪
5. 性能优化和缓存机制
6. 批量检测支持

### 第3步: 平台适配度评估器实现 (TOM-111) (优先级: 最高)
1. 创建 `PlatformComplianceEvaluator` 类
2. 定义5个平台的详细规则
3. 实现基于规则的检查算法
4. 设计权重化评分机制
5. 实现改进建议生成
6. 添加规则配置管理

### 第4步: 集成测试 (优先级: 中)
1. 编写单元测试
2. 创建集成测试
3. 性能基准测试
4. 准确率验证测试

### 第5步: 优化和部署 (优先级: 中)
1. 性能优化
2. 错误处理完善
3. 日志和监控添加
4. 文档创建

## 🎉 完成检查清单 (Completion Checklist)

### TOM-110 原创性检测算法
- [ ] OriginalityDetector类实现完成
- [ ] 相似度计算算法优化
- [ ] 重复片段识别功能
- [ ] 最相似源笔记追踪
- [ ] 性能优化(<2秒)
- [ ] 准确率验证(≥85%)
- [ ] 批量检测支持
- [ ] 单元测试覆盖

### TOM-111 平台适配度评估引擎
- [ ] PlatformComplianceEvaluator类实现
- [ ] 5个平台规则体系定义
- [ ] 基于规则的检查算法
- [ ] 权重化评分机制
- [ ] 改进建议生成
- [ ] 准确率验证(≥80%)
- [ ] 规则配置管理
- [ ] 单元测试覆盖

### 通用完成项
- [ ] 完整的TypeScript类型定义
- [ ] 单元测试通过(覆盖率80%+)
- [ ] 集成测试通过
- [ ] 性能基准测试通过
- [ ] 代码审查通过
- [ ] 文档更新完成
- [ ] Linear任务状态更新

## 🧪 测试策略 (Testing Strategy)

### 原创性检测测试
- 相似度计算准确性测试
- 重复片段识别测试
- 性能基准测试(<2秒)
- 边界条件测试

### 平台适配度评估测试
- 规则检查准确性测试
- 评分算法正确性测试
- 改进建议质量测试
- 多平台兼容性测试

## 🚨 重要注意事项 (Important Notes)

### 技术风险
- **准确率风险**: 检测算法可能需要多次调优
  - 缓解措施: 建立完善的测试数据集，渐进式优化
- **性能风险**: 相似度计算可能影响性能
  - 缓解措施: 实现智能缓存，批量处理优化

### 最佳实践
- 使用依赖注入提高可测试性
- 实现配置驱动的规则管理
- 添加详细的日志和监控
- 设计可扩展的检测框架

---

**使用说明**: 
1. 先实现TOM-110原创性检测
2. 再实现TOM-111平台适配度评估
3. 两个模块完成后为TOM-109主系统做准备
4. 严格按照验收标准进行测试验证 