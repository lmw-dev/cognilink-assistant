# TOM-109 内容质量评估系统集成 Prompt

## 🎯 目标 (Objective)
**Linear Issue**: TOM-109 - [Feature] 内容质量评估系统 - 原创性与平台适配度检测

**子任务依赖**: 
- TOM-110 - 原创性检测算法实现 (前置依赖)
- TOM-111 - 平台适配度评估引擎 (前置依赖)

**关键验收标准参考**: 
- AC1: 原创性检测准确率达到85%以上 (依赖TOM-110)
- AC2: 平台适配度评估覆盖主要规则，准确率80%以上 (依赖TOM-111)
- AC3: 内容质量评分与人工评估相关性达到0.8以上
- AC4: 质量报告生成完整且有用
- AC5: 评估响应时间控制在5秒以内

**核心指令**: 基于TOM-110和TOM-111的成果，实现完整的内容质量评估系统，集成原创性检测、平台适配度评估和LLM质量评分，提供综合质量报告。

## 📋 上下文参考 (Context References)

### 主要操作文件
- 核心评估器: @src/services/content-quality-evaluator.ts (待创建)
- 质量评分器: @src/services/quality-scorer.ts (待创建)
- 报告生成器: @src/services/quality-report-generator.ts (待创建)

### 依赖的子任务服务 (前置条件)
- 原创性检测器: @src/services/originality-detector.ts (TOM-110产出)
- 平台适配度评估器: @src/services/platform-compliance-evaluator.ts (TOM-111产出)
- 质量评估类型: @src/types/quality-assessment.ts (TOM-110/111产出)

### 依赖的现有服务
- AI服务: @src/services/AIService.ts
- 嵌入服务: @src/services/EmbeddingService.ts
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
- **架构模式**: 服务层模式，依赖注入，组合模式
- **性能要求**: 综合评估响应时间<5秒
- **准确率要求**: 质量评分与人工评估相关性≥0.8

### 功能要求

#### 1. 综合质量评估系统
1. **多维度评分集成**:
   - 原创性评分 (基于TOM-110 OriginalityDetector)
   - 平台适配度评分 (基于TOM-111 PlatformComplianceEvaluator)
   - LLM质量评估 (可读性、吸引力、逻辑性、实用性)
   - 综合质量评分算法

2. **LLM质量评估**:
   - 与AIService集成进行多维度评估
   - 可读性、吸引力、逻辑性、实用性四个维度
   - 结构化评估提示词设计
   - 评分一致性和可靠性保证

#### 2. 质量报告生成
1. **详细评估报告**:
   - 综合评分和各维度得分
   - 问题识别和分类
   - 优化建议排序和优先级
   - 可视化评分展示数据

2. **报告格式**:
   - 结构化JSON格式
   - 人类可读的文本格式
   - 支持多种输出格式

#### 3. 批量评估和性能优化
1. **批量处理**:
   - 支持多内容并发评估
   - 智能任务调度和资源管理
   - 失败重试和错误处理

2. **性能优化**:
   - 智能缓存机制
   - 异步处理和并发控制
   - 资源使用优化

## 📝 期望输出结构 (Expected Output Structure)

### 1. 核心质量评估器

```typescript
// 内容质量评估器主类
export class ContentQualityEvaluator {
  constructor(
    private originalityDetector: OriginalityDetector,
    private platformComplianceEvaluator: PlatformComplianceEvaluator,
    private qualityScorer: QualityScorer,
    private reportGenerator: QualityReportGenerator,
    private aiService: AIService,
    private logger: Logger
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

  // 快速评估 (仅核心指标)
  async quickEvaluate(
    content: string,
    platform: SocialMediaPlatform
  ): Promise<QuickEvaluationResult>;
}
```

### 2. 质量评分器

```typescript
// 质量评分器
export class QualityScorer {
  constructor(
    private aiService: AIService,
    private logger: Logger
  );

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
    llmScore: LLMQualityScore,
    weights?: ScoreWeights
  ): OverallQualityScore;

  // 评分校准
  calibrateScore(
    score: number,
    platform: SocialMediaPlatform,
    contentType: string
  ): number;
}
```

### 3. 报告生成器

```typescript
// 质量报告生成器
export class QualityReportGenerator {
  // 生成详细报告
  generateDetailedReport(
    result: QualityEvaluationResult,
    options?: ReportOptions
  ): QualityReport;

  // 生成摘要报告
  generateSummaryReport(
    result: QualityEvaluationResult
  ): QualityReportSummary;

  // 生成改进建议
  generateImprovementPlan(
    result: QualityEvaluationResult
  ): ImprovementPlan;

  // 导出报告
  exportReport(
    report: QualityReport,
    format: ReportFormat
  ): string;
}
```

### 4. 核心类型定义

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
  timestamp: number;
}

// LLM质量评分
export interface LLMQualityScore {
  readability: number;
  attractiveness: number;
  logic: number;
  practicality: number;
  overall: number;
  reasoning: string;
  confidence: number;
}

// 综合质量评分
export interface OverallQualityScore {
  total: number;
  breakdown: {
    originality: number;
    compliance: number;
    llmQuality: number;
  };
  weights: ScoreWeights;
  grade: QualityGrade;
  recommendation: string;
}

// 质量报告
export interface QualityReport {
  summary: QualityReportSummary;
  details: QualityReportDetails;
  improvements: ImprovementPlan;
  metadata: ReportMetadata;
}

// 改进计划
export interface ImprovementPlan {
  priority: ImprovementSuggestion[];
  optional: ImprovementSuggestion[];
  longTerm: ImprovementSuggestion[];
  estimatedImpact: number;
}
```

## 🔄 实现步骤 (Implementation Steps)

### 第1步: 依赖验证 (优先级: 最高)
1. 确认TOM-110 OriginalityDetector已完成
2. 确认TOM-111 PlatformComplianceEvaluator已完成
3. 验证质量评估类型定义完整性
4. 测试子模块集成兼容性

### 第2步: 质量评分器实现 (优先级: 最高)
1. 创建 `QualityScorer` 类
2. 实现LLM质量评估集成
3. 设计多维度评分算法
4. 实现综合评分计算
5. 添加评分校准机制

### 第3步: 报告生成器实现 (优先级: 高)
1. 创建 `QualityReportGenerator` 类
2. 实现详细报告生成
3. 设计改进建议算法
4. 添加多格式导出支持
5. 实现可视化数据准备

### 第4步: 主评估器集成 (优先级: 高)
1. 创建 `ContentQualityEvaluator` 主类
2. 集成所有子模块
3. 实现综合评估流程
4. 添加批量评估功能
5. 实现性能优化机制

### 第5步: 测试和验证 (优先级: 中)
1. 编写单元测试 (目标覆盖率80%+)
2. 创建集成测试
3. 性能基准测试
4. 准确率验证测试
5. 用户体验测试

### 第6步: 集成和部署 (优先级: 中)
1. 集成到主插件
2. 添加命令面板支持
3. 创建使用文档
4. 部署到测试环境
5. 验收测试执行

## 🎉 完成检查清单 (Completion Checklist)

### 核心功能实现
- [ ] QualityScorer类实现完成
- [ ] QualityReportGenerator类实现完成
- [ ] ContentQualityEvaluator主类实现完成
- [ ] LLM质量评估集成
- [ ] 综合评分算法实现
- [ ] 质量报告生成功能

### 性能和质量
- [ ] 评估响应时间<5秒
- [ ] 质量评分相关性验证(≥0.8)
- [ ] 批量评估功能
- [ ] 错误处理和降级策略
- [ ] 缓存和性能优化

### 集成和测试
- [ ] 与TOM-110/111模块集成
- [ ] 单元测试通过(覆盖率80%+)
- [ ] 集成测试通过
- [ ] 性能基准测试通过
- [ ] 用户验收测试通过

### 文档和部署
- [ ] API文档完成
- [ ] 使用指南创建
- [ ] 集成到主插件
- [ ] 命令面板支持
- [ ] Linear任务状态更新

## 🧪 测试策略 (Testing Strategy)

### 综合评估测试
- 端到端评估流程测试
- 多维度评分一致性测试
- 评估结果准确性验证
- 性能基准测试(<5秒)

### LLM质量评估测试
- 评分一致性和可靠性测试
- 与人工评估的相关性测试
- 不同内容类型的适应性测试
- 评分校准机制验证

### 报告生成测试
- 报告完整性和准确性测试
- 改进建议质量测试
- 多格式导出功能测试
- 可视化数据正确性验证

## 🚨 重要注意事项 (Important Notes)

### 技术风险
- **依赖风险**: 依赖TOM-110和TOM-111的完成质量
  - 缓解措施: 严格的依赖验证和接口测试
- **性能风险**: LLM调用可能影响整体性能
  - 缓解措施: 智能缓存、批量处理、异步优化
- **准确率风险**: 综合评分算法需要精心调优
  - 缓解措施: 大量测试数据验证，渐进式优化

### 最佳实践
- 使用组合模式集成子模块
- 实现可配置的评分权重
- 添加详细的性能监控
- 设计可扩展的报告格式
- 实现优雅的错误处理

### 用户体验考虑
- 提供清晰易懂的评估结果
- 生成可操作的改进建议
- 支持快速评估和详细评估
- 确保评估结果的一致性

## 📊 成功指标 (Success Metrics)

### 功能指标
- 综合评估准确率 ≥ 85%
- 质量评分相关性 ≥ 0.8
- 评估响应时间 ≤ 5秒
- 报告生成成功率 = 100%
- 系统可用性 ≥ 99%

### 质量指标
- 代码覆盖率 ≥ 80%
- 单元测试通过率 = 100%
- 集成测试通过率 = 100%
- 性能基准达标率 = 100%

### 用户体验指标
- 评估结果可理解性 ≥ 4.0/5.0
- 改进建议有用性 ≥ 4.0/5.0
- 系统响应速度满意度 ≥ 4.0/5.0

---

**使用说明**: 
1. 确保TOM-110和TOM-111已完成并通过测试
2. 按照实现步骤顺序执行
3. 重点关注LLM评估的准确性和一致性
4. 严格验证综合评分算法的正确性
5. 完成后进行完整的端到端验收测试