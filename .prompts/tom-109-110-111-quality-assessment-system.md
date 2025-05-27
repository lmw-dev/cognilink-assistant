# TOM-109/110/111 内容质量评估系统开发 Prompt

## 🎯 目标 (Objective)
**Linear Issues**: 
- TOM-109 - [Feature] 内容质量评估系统 - 原创性与平台适配度检测
- TOM-110 - [Task: TOM-109] 原创性检测算法实现  
- TOM-111 - [Task: TOM-109] 平台适配度评估引擎

**父Feature**: TOM-109 内容质量评估系统
**关键验收标准参考**: 
- AC1: 原创性检测准确率达到85%以上
- AC2: 平台适配度评估覆盖主要规则，准确率80%以上
- AC3: 内容质量评分与人工评估相关性达到0.8以上
- AC4: 质量报告生成完整且有用
- AC5: 评估响应时间控制在5秒以内

**核心指令**: 实现完整的内容质量评估系统，包括原创性检测算法增强、平台适配度评估引擎和综合质量评分机制，确保生成内容的高质量和原创性。

## 📋 上下文参考 (Context References)

### 主要操作文件
- 核心文件: @src/services/content-quality-evaluator.ts (待创建)
- 原创性检测: @src/services/originality-detector.ts (待创建，基于现有OriginalityService扩展)
- 平台适配度: @src/services/platform-compliance-evaluator.ts (待创建)
- 质量评分器: @src/services/quality-scorer.ts (待创建)

### 依赖的现有服务
- 现有原创性服务: @src/services/OriginalityService.ts
- 嵌入服务: @src/services/EmbeddingService.ts
- AI服务: @src/services/AIService.ts
- 内容后处理器: @src/services/content-post-processor.ts
- 平台模板管理: @src/services/platform-template-manager.ts

### 类型定义文件
- 质量评估类型: @src/types/quality-assessment.ts (待创建)
- 社交媒体类型: @src/types/social-media.ts
- 内容处理类型: @src/types/content-processing.ts

### 需要遵循的内部规则
- TypeScript标准: @.cursor/rules/001-typescript-standards.mdc
- 项目通用规范: @.cursor/rules/003-general.mdc
- 任务工作流程: @.cursor/rules/007-task-workflow.mdc
- Obsidian集成规范: @.cursor/rules/obsidian-integration.mdc

## 🔧 具体要求与约束 (Requirements & Constraints)

### 技术栈约束
- **语言**: TypeScript (strict mode)
- **架构模式**: 服务层模式，依赖注入
- **性能要求**: 评估响应时间<5秒，原创性检测<2秒
- **准确率要求**: 原创性检测≥85%，平台适配度≥80%，质量评分相关性≥0.8

### 功能要求

#### TOM-110: 原创性检测算法增强
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

#### TOM-111: 平台适配度评估引擎
1. **平台规则体系**:
   - 小红书: 表情符号密度、互动问题、视觉语言、标签使用
   - Twitter: 字符限制、标签数量、简洁性、互动元素
   - 微信公众号: 长度要求、结构化、专业性、示例使用
   - 个人博客: 技术深度、代码示例、SEO优化
   - 头条号: 标题吸引力、通俗易懂、讨论引导

2. **评估机制**:
   - 基于规则的自动检查算法
   - 权重化评分系统
   - 具体改进建议生成
   - 规则配置和更新支持

#### TOM-109: 综合质量评估系统
1. **多维度评分**:
   - 原创性评分 (基于TOM-110)
   - 平台适配度评分 (基于TOM-111)
   - LLM质量评估 (可读性、吸引力、逻辑性、实用性)
   - 综合质量评分算法

2. **质量报告生成**:
   - 详细评估报告
   - 问题识别和分类
   - 优化建议排序
   - 可视化评分展示

### 质量标准
- **测试覆盖率**: 80%以上
- **性能基准**: 评估时间<5秒，批量评估支持
- **错误处理**: 完善的异常处理和降级策略
- **可扩展性**: 支持新平台和评估维度的添加

## 📝 期望输出结构 (Expected Output Structure)

### 1. 核心类/接口

```typescript
// 内容质量评估器主类
export class ContentQualityEvaluator {
  constructor(
    private originalityDetector: OriginalityDetector,
    private platformComplianceEvaluator: PlatformComplianceEvaluator,
    private qualityScorer: QualityScorer,
    private aiService: AIService
  );

  // 综合质量评估
  async evaluateContent(
    content: string,
    platform: SocialMediaPlatform,
    sourceNotes?: Note[],
    options?: QualityEvaluationOptions
  ): Promise<QualityEvaluationResult>;

  // 批量评估
  async batchEvaluate(
    contents: ContentEvaluationRequest[],
    options?: BatchEvaluationOptions
  ): Promise<BatchEvaluationResult>;
}

// 原创性检测器 (TOM-110)
export class OriginalityDetector {
  // 检测内容原创性
  async detectOriginality(
    content: string,
    sourceNotes: Note[],
    options?: OriginalityDetectionOptions
  ): Promise<OriginalityDetectionResult>;

  // 识别重复片段
  async identifyDuplicateSegments(
    content: string,
    sourceNotes: Note[]
  ): Promise<DuplicateSegment[]>;
}

// 平台适配度评估器 (TOM-111)
export class PlatformComplianceEvaluator {
  // 评估平台适配度
  async evaluateCompliance(
    content: string,
    platform: SocialMediaPlatform,
    options?: ComplianceEvaluationOptions
  ): Promise<ComplianceEvaluationResult>;

  // 生成改进建议
  generateImprovementSuggestions(
    result: ComplianceEvaluationResult
  ): ImprovementSuggestion[];
}

// 质量评分器
export class QualityScorer {
  // LLM质量评估
  async scoreWithLLM(
    content: string,
    platform: SocialMediaPlatform,
    criteria: QualityCriteria[]
  ): Promise<LLMQualityScore>;

  // 综合评分计算
  calculateOverallScore(
    originalityScore: number,
    complianceScore: number,
    llmScore: LLMQualityScore
  ): OverallQualityScore;
}
```

### 2. 类型定义

```typescript
// 质量评估结果
export interface QualityEvaluationResult {
  overall: OverallQualityScore;
  originality: OriginalityDetectionResult;
  platformCompliance: ComplianceEvaluationResult;
  llmQuality: LLMQualityScore;
  report: QualityReport;
  processingTime: number;
  confidence: number;
}

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
}

// LLM质量评分
export interface LLMQualityScore {
  readability: number;
  attractiveness: number;
  logic: number;
  practicality: number;
  overall: number;
  reasoning: string;
}
```

## 🔄 实现步骤 (Implementation Steps)

### 第1步: 类型系统设计 (优先级: 最高)
1. 创建 `src/types/quality-assessment.ts`
2. 定义所有接口和类型
3. 确保与现有类型系统兼容
4. 添加完整的JSDoc注释

### 第2步: 原创性检测算法实现 (TOM-110) (优先级: 最高)
1. 创建 `OriginalityDetector` 类
2. 扩展现有 `OriginalityService` 功能
3. 实现段落级和句子级相似度检测
4. 添加重复片段识别算法
5. 实现最相似源笔记追踪
6. 性能优化和批量处理支持

### 第3步: 平台适配度评估引擎 (TOM-111) (优先级: 高)
1. 创建 `PlatformComplianceEvaluator` 类
2. 为5个平台定义详细规则
3. 实现基于规则的检查算法
4. 设计权重化评分机制
5. 实现改进建议生成
6. 添加规则配置管理

### 第4步: 质量评分器实现 (优先级: 高)
1. 创建 `QualityScorer` 类
2. 实现LLM质量评估集成
3. 设计多维度评分算法
4. 实现综合评分计算
5. 添加评分校准机制

### 第5步: 主评估器集成 (TOM-109) (优先级: 高)
1. 创建 `ContentQualityEvaluator` 主类
2. 集成所有子模块
3. 实现综合评估流程
4. 添加质量报告生成
5. 实现批量评估功能

### 第6步: 测试和验证 (优先级: 中)
1. 编写单元测试 (目标覆盖率80%+)
2. 创建集成测试
3. 性能基准测试
4. 准确率验证测试
5. 边界条件测试

### 第7步: 集成和部署 (优先级: 中)
1. 集成到主插件
2. 添加命令面板支持
3. 创建使用文档
4. 部署到测试环境
5. 验收测试执行

## 🎉 完成检查清单 (Completion Checklist)

### TOM-110 原创性检测算法
- [ ] OriginalityDetector类实现完成
- [ ] 相似度计算算法优化
- [ ] 重复片段识别功能
- [ ] 最相似源笔记追踪
- [ ] 性能优化(<2秒)
- [ ] 准确率验证(≥85%)
- [ ] 单元测试覆盖

### TOM-111 平台适配度评估引擎
- [ ] PlatformComplianceEvaluator类实现
- [ ] 5个平台规则体系定义
- [ ] 基于规则的检查算法
- [ ] 权重化评分机制
- [ ] 改进建议生成
- [ ] 准确率验证(≥80%)
- [ ] 规则配置管理

### TOM-109 综合质量评估系统
- [ ] ContentQualityEvaluator主类实现
- [ ] 多维度评分集成
- [ ] LLM质量评估集成
- [ ] 质量报告生成
- [ ] 批量评估功能
- [ ] 性能基准达标(<5秒)
- [ ] 质量评分相关性验证(≥0.8)

### 通用完成项
- [ ] 完整的TypeScript类型定义
- [ ] 单元测试通过(覆盖率80%+)
- [ ] 集成测试通过
- [ ] 性能基准测试通过
- [ ] 代码审查通过
- [ ] 文档更新完成
- [ ] Linear任务状态更新
- [ ] 部署验证完成

## 🧪 测试策略 (Testing Strategy)

### 单元测试要求
- 测试覆盖率目标: 80%以上
- 关键测试场景:
  - 原创性检测准确性
  - 平台适配度评估准确性
  - LLM质量评分一致性
  - 综合评分算法正确性
- Mock策略: 模拟AI服务、嵌入服务调用

### 集成测试要求
- 端到端质量评估流程
- 与现有服务的集成测试
- 批量评估性能测试
- 错误处理和降级测试

### 性能测试要求
- 单次评估时间<5秒
- 原创性检测时间<2秒
- 批量评估并发性能
- 内存使用优化验证

## 🚨 重要注意事项 (Important Notes)

### 技术风险
- **准确率风险**: 评估算法可能需要多次调优才能达到目标准确率
  - 缓解措施: 建立完善的测试数据集，实施渐进式优化策略
- **性能风险**: LLM调用可能影响整体评估性能
  - 缓解措施: 实现智能缓存，批量处理优化，异步处理机制
- **集成风险**: 与现有服务集成可能遇到兼容性问题
  - 缓解措施: 充分的集成测试，向后兼容设计

### 最佳实践
- 使用依赖注入提高可测试性
- 实现配置驱动的规则管理
- 添加详细的日志和监控
- 设计可扩展的评估框架
- 实现优雅的错误处理和降级

### 数据和隐私考虑
- 确保用户内容隐私保护
- 实现本地化的相似度计算
- 避免敏感信息泄露到外部服务
- 遵循数据最小化原则

## 📊 成功指标 (Success Metrics)

### 功能指标
- 原创性检测准确率 ≥ 85%
- 平台适配度评估准确率 ≥ 80%
- 质量评分与人工评估相关性 ≥ 0.8
- 评估响应时间 ≤ 5秒
- 系统可用性 ≥ 99%

### 质量指标
- 代码覆盖率 ≥ 80%
- 单元测试通过率 = 100%
- 集成测试通过率 = 100%
- 代码审查通过率 = 100%
- 文档完整性评分 ≥ 90%

### 用户体验指标
- 评估结果可理解性 ≥ 4.0/5.0
- 改进建议有用性 ≥ 4.0/5.0
- 系统响应速度满意度 ≥ 4.0/5.0

---

**使用说明**: 
1. 严格按照实现步骤顺序执行
2. 每个步骤完成后进行验证
3. 遇到问题及时记录和解决
4. 定期更新Linear任务状态
5. 完成后进行完整的验收测试 