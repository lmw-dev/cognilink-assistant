# CogniLink Prompt 模块综合需求设计文档

**版本**: 2.0  
**日期**: 2025年1月5日  
**文档类型**: 综合需求设计文档

---

## 1. 项目概述与背景

### 1.1 文档目的

本文档综合了CogniLink Prompt模块的功能需求设计和质量优化策略，旨在为产品、设计和开发团队提供一个完整的、可执行的需求规范。文档既包含详细的功能实现要求，也包含战略性的质量优化目标。

### 1.2 项目背景

CogniLink Assistant作为Obsidian插件，致力于提升用户的内容创作效率和质量。Prompt模块是其核心组件，负责：
- **基础功能**: 提供结构化的Prompt模板管理系统
- **质量优化**: 通过智能Prompt设计显著提升AI生成内容的质量和自然度
- **平台适配**: 针对不同社交媒体平台优化内容生成策略

### 1.3 当前现状分析

**已实现功能**:
- 多平台社交媒体内容生成（小红书、Twitter、微信公众号等）
- RAG检索增强生成系统
- 基础的内容生成和原创性检测

**存在问题**:
- AI痕迹明显（检测率达100%）
- 平台适配度不足
- 内容质量不稳定
- 缺乏系统化的Prompt管理

## 2. 核心目标与成功指标

### 2.1 功能性目标

#### 2.1.1 基础模板管理
- 提供完整的Prompt模板CRUD功能
- 支持模板导入/导出和版本管理
- 集成直观的用户管理界面

#### 2.1.2 智能化内容生成
- 实现动态Prompt组装系统
- 支持上下文感知的模板选择
- 集成用户偏好学习机制

### 2.2 质量优化目标

#### 2.2.1 量化指标
- **AI痕迹检测率**: 从100%降低至30%以下
- **平台适配度**: 提升至90%以上
- **用户满意度**: 从3.5/5提升至4.5/5以上
- **内容原创性**: 保持85%以上
- **生成成功率**: 达到95%以上

#### 2.2.2 性能指标
- **响应速度**: 保持在10秒以内
- **模板加载**: 1秒内完成
- **系统稳定性**: 99%可用性

## 3. 详细功能需求

### 3.1 核心模板管理系统

#### 3.1.1 模板数据结构

```typescript
interface AdvancedPromptTemplate {
  // 基础信息
  id: string;
  name: string;
  description?: string;
  
  // 分类与标签
  category: 'social' | 'document' | 'analysis' | 'creative';
  platform?: 'xiaohongshu' | 'twitter' | 'wechat' | 'blog' | 'toutiao';
  platformTags?: string[];
  
  // 分层Prompt结构（质量优化）
  systemPrompt: string;        // 系统级指令
  taskPrompt: string;          // 任务级指令
  contextPrompt: string;       // 上下文级指令
  outputPrompt: string;        // 输出格式指令
  
  // 传统单一内容（向下兼容）
  content?: string;
  
  // 高级特性
  variables: PromptVariable[];
  fewShotExamples: FewShotExample[];
  qualityRules: QualityRule[];
  platformConfig?: PlatformSpecificConfig;
  
  // 反AI痕迹配置
  antiAIStrategy: AntiAIDetectionStrategy;
  
  // 元数据
  isSystemDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  version: string;
}

interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  description: string;
  defaultValue?: any;
  options?: string[];  // for select/multiselect
  required: boolean;
}

interface FewShotExample {
  input: Record<string, string>;
  output: string;
  platform?: string;
}

interface QualityRule {
  type: 'length' | 'tone' | 'format' | 'engagement';
  value: string | number;
  description: string;
}

interface AntiAIDetectionStrategy {
  naturalLanguageEnhancement: {
    sentenceVariation: boolean;
    colloquialExpressions: boolean;
    emotionalNuances: boolean;
    culturalReferences: boolean;
  };
  personalizationInjection: {
    userStyleMimicking: boolean;
    personalExperiences: boolean;
    uniquePerspectives: boolean;
  };
  imperfectionStrategy: {
    minorInconsistencies: boolean;
    naturalPauses: boolean;
    colloquialErrors: boolean;
  };
}
```

#### 3.1.2 CRUD操作功能

**创建模板**
- 支持从零创建或基于现有模板创建
- 提供模板向导帮助用户选择合适的结构
- 支持分层Prompt结构和传统单一内容两种模式

**读取与查询**
- 支持按平台、分类、标签筛选
- 提供搜索功能（名称、内容、标签）
- 支持排序（创建时间、使用频率、用户评分）

**更新模板**
- 支持版本控制，保留历史版本
- 提供模板对比功能
- 支持批量更新操作

**删除管理**
- 软删除机制，支持恢复
- 依赖关系检查
- 批量删除功能

### 3.2 智能模板系统

#### 3.2.1 增强型PromptTemplateService

```typescript
export class EnhancedPromptTemplateService {
  private templates: AdvancedPromptTemplate[];
  private userStyleProfile: UserStyleProfile;
  private platformAnalyzer: PlatformContentAnalyzer;
  private qualityEvaluator: PromptQualityEvaluator;
  
  // 基础CRUD操作
  async createTemplate(templateData: Partial<AdvancedPromptTemplate>): Promise<AdvancedPromptTemplate>;
  async getTemplates(filters?: TemplateFilters): Promise<AdvancedPromptTemplate[]>;
  async updateTemplate(id: string, updates: Partial<AdvancedPromptTemplate>): Promise<AdvancedPromptTemplate>;
  async deleteTemplate(id: string): Promise<boolean>;
  
  // 智能功能
  async selectOptimalTemplate(
    task: ContentGenerationTask,
    context: RAGContext,
    userPreferences: UserPreferences
  ): Promise<AdvancedPromptTemplate>;
  
  async assemblePrompt(
    template: AdvancedPromptTemplate,
    variables: Record<string, any>,
    context: RAGContext
  ): Promise<string>;
  
  async evaluatePromptQuality(prompt: string): Promise<QualityScore>;
  
  async learnFromFeedback(
    templateId: string,
    prompt: string,
    generatedContent: string,
    userFeedback: UserFeedback
  ): Promise<void>;
  
  // 平台优化
  async optimizeForPlatform(
    template: AdvancedPromptTemplate,
    platform: SocialPlatform
  ): Promise<AdvancedPromptTemplate>;
}
```

#### 3.2.2 平台内容分析器

```typescript
export class PlatformContentAnalyzer {
  async analyzePopularContent(
    platform: SocialPlatform,
    topic: string,
    timeRange: TimeRange
  ): Promise<ContentAnalysis>;
  
  extractPlatformRules(platform: SocialPlatform): PlatformRules;
  
  async analyzeTargetAudience(
    platform: SocialPlatform,
    contentType: string
  ): Promise<AudienceProfile>;
  
  async generatePlatformSpecificPrompt(
    basePrompt: string,
    platform: SocialPlatform
  ): Promise<string>;
}
```

### 3.3 预定义模板体系

#### 3.3.1 平台特化模板

**小红书模板集**
```typescript
const xiaohongshuTemplates: AdvancedPromptTemplate[] = [
  {
    id: 'xhs-lifestyle-review',
    name: '小红书 - 生活好物测评',
    category: 'social',
    platform: 'xiaohongshu',
    systemPrompt: "你是一位拥有百万粉丝的小红书生活方式博主，以真实体验和实用建议著称",
    taskPrompt: "请创作一篇关于'${theme}'的小红书测评笔记",
    contextPrompt: "基于以下体验和信息：\n${context}\n参考要点：\n${pinned}",
    outputPrompt: "请以小红书笔记格式输出，包含：\n1. 吸引人的标题\n2. 结构化正文（300-500字）\n3. 相关标签建议\n4. 配图建议",
    antiAIStrategy: {
      naturalLanguageEnhancement: {
        sentenceVariation: true,
        colloquialExpressions: true,
        emotionalNuances: true,
        culturalReferences: true
      },
      personalizationInjection: {
        userStyleMimicking: true,
        personalExperiences: true,
        uniquePerspectives: true
      },
      imperfectionStrategy: {
        minorInconsistencies: true,
        naturalPauses: false,
        colloquialErrors: false
      }
    },
    qualityRules: [
      { type: 'length', value: 500, description: '正文控制在300-500字' },
      { type: 'engagement', value: 'high', description: '必须包含互动引导' }
    ]
  }
];
```

**Twitter模板集**
```typescript
const twitterTemplates: AdvancedPromptTemplate[] = [
  {
    id: 'twitter-thread',
    name: 'Twitter - 观点Thread',
    category: 'social',
    platform: 'twitter',
    systemPrompt: "你是一位Twitter意见领袖，擅长用简洁有力的语言表达深刻观点",
    taskPrompt: "请创建一个关于'${theme}'的Twitter Thread",
    contextPrompt: "基于以下信息和观点：\n${context}\n关键论点：\n${pinned}",
    outputPrompt: "请输出3-5条推文的Thread，每条推文：\n1. 控制在280字符内\n2. 逻辑递进\n3. 包含适当的emoji和hashtag",
    // ... 其他配置
  }
];
```

#### 3.3.2 内容类型模板

**文档生成模板**
- 学术论文模板 (IMRAD结构)
- 技术文档模板
- 商业报告模板
- 创意写作模板

**分析总结模板**
- 多源信息综合模板
- 对比分析模板
- 趋势分析模板
- 决策建议模板

### 3.4 用户界面设计

#### 3.4.1 主管理界面

**模板列表设计**
- 卡片式布局，显示模板关键信息
- 支持网格和列表两种视图
- 实时搜索和高级筛选
- 批量操作支持

**操作工具栏**
- 新建模板（支持向导模式）
- 导入/导出功能
- 批量管理工具
- 设置和帮助

#### 3.4.2 模板编辑器

**分层编辑模式**
```typescript
interface TemplateEditor {
  // 基础信息编辑
  basicInfo: {
    name: string;
    description: string;
    category: string;
    platform: string;
    tags: string[];
  };
  
  // Prompt分层编辑
  promptLayers: {
    systemPrompt: TextEditor;
    taskPrompt: TextEditor;
    contextPrompt: TextEditor;
    outputPrompt: TextEditor;
  };
  
  // 高级配置
  advancedConfig: {
    variables: VariableEditor[];
    examples: ExampleEditor[];
    qualityRules: RuleEditor[];
    antiAISettings: AntiAIConfigEditor;
  };
  
  // 预览和测试
  preview: {
    mockData: Record<string, string>;
    renderedPrompt: string;
    qualityScore: QualityMetrics;
  };
}
```

**实时预览功能**
- 变量替换预览
- 质量评分实时显示
- 平台适配性检查
- 长度和格式验证

#### 3.4.3 智能辅助功能

**模板推荐**
- 基于用户使用历史推荐
- 根据内容类型推荐最佳模板
- 展示模板性能数据

**智能提示**
- 变量使用建议
- 平台最佳实践提示
- 质量改进建议

## 4. 技术实现方案

### 4.1 核心架构设计

```typescript
// 主服务层
export class PromptModuleService {
  private templateService: EnhancedPromptTemplateService;
  private qualityService: ContentQualityEvaluator;
  private platformService: PlatformContentAnalyzer;
  private userProfileService: UserStyleProfileService;
  
  constructor(
    private plugin: CogniLinkPlugin,
    private settings: PluginSettings
  ) {
    this.initializeServices();
  }
  
  async generateContent(
    theme: string,
    platform?: string,
    context?: RAGContext
  ): Promise<GeneratedContent> {
    // 1. 选择最优模板
    const template = await this.templateService.selectOptimalTemplate({
      theme,
      platform,
      context
    });
    
    // 2. 组装Prompt
    const prompt = await this.templateService.assemblePrompt(
      template,
      { theme, context: context?.content, pinned: context?.pinned },
      context
    );
    
    // 3. 质量预评估
    const qualityPreview = await this.qualityService.evaluatePromptQuality(prompt);
    
    // 4. 生成内容
    const content = await this.plugin.aiService.generateContent(prompt);
    
    // 5. 质量后评估
    const finalQuality = await this.qualityService.evaluateContent(
      content,
      platform as SocialPlatform,
      prompt
    );
    
    return {
      content,
      template,
      prompt,
      qualityMetrics: finalQuality
    };
  }
}
```

### 4.2 数据存储方案

#### 4.2.1 存储结构
```typescript
interface PromptModuleSettings {
  templates: AdvancedPromptTemplate[];
  defaultTemplateIds: Record<string, string>; // platform -> templateId
  userPreferences: UserPreferences;
  qualitySettings: QualitySettings;
  platformConfigs: Record<string, PlatformConfig>;
}
```

#### 4.2.2 持久化策略
- 主数据存储在Obsidian插件settings
- 大型模板支持外部文件存储
- 自动备份和版本控制
- 支持云同步（可选）

### 4.3 质量评估系统

```typescript
export class ContentQualityEvaluator {
  async evaluateContent(
    content: string,
    platform: SocialPlatform,
    originalPrompt: string
  ): Promise<QualityMetrics> {
    const metrics = {
      aiDetectionScore: await this.detectAITraces(content),
      platformFitScore: await this.evaluatePlatformFit(content, platform),
      originalityScore: await this.evaluateOriginality(content),
      engagementPotential: await this.evaluateEngagement(content, platform),
      readabilityScore: await this.evaluateReadability(content),
      overallScore: 0
    };
    
    metrics.overallScore = this.calculateOverallScore(metrics);
    return metrics;
  }
  
  private async detectAITraces(content: string): Promise<number> {
    // AI痕迹检测算法
    // 返回0-100分数，越低越好
  }
  
  private async evaluatePlatformFit(
    content: string, 
    platform: SocialPlatform
  ): Promise<number> {
    // 平台适配度评估
    // 检查长度、格式、语调等
  }
}
```

## 5. 实施计划

### 5.1 第一阶段：基础框架（2周）

**目标**: 建立核心模板管理系统
- 实现AdvancedPromptTemplate数据结构
- 开发基础CRUD功能
- 创建用户管理界面
- 集成现有系统

**交付物**:
- EnhancedPromptTemplateService v1.0
- 基础UI组件
- 数据迁移脚本
- 单元测试

### 5.2 第二阶段：智能优化（3周）

**目标**: 实现质量优化和平台适配
- 开发ContentQualityEvaluator
- 实现PlatformContentAnalyzer
- 集成反AI痕迹策略
- 添加实时质量评估

**交付物**:
- 质量评估系统
- 平台特化模板库
- 智能Prompt组装器
- 性能监控系统

### 5.3 第三阶段：用户体验优化（2周）

**目标**: 完善用户界面和交互体验
- 优化模板编辑器
- 添加智能推荐功能
- 实现用户反馈系统
- 完善文档和帮助

**交付物**:
- 完整UI/UX
- 用户指南
- 测试报告
- 性能基准

## 6. 验收标准

### 6.1 功能验收
- [ ] 所有CRUD操作正常运行
- [ ] 模板导入/导出功能完整
- [ ] 分层Prompt系统工作正常
- [ ] 平台特化模板准确有效
- [ ] 质量评估系统输出合理

### 6.2 性能验收
- [ ] 模板加载时间 < 1秒
- [ ] Prompt组装时间 < 2秒
- [ ] UI响应时间 < 500ms
- [ ] 内存使用合理
- [ ] 无明显内存泄漏

### 6.3 质量验收
- [ ] AI痕迹检测率 < 30%
- [ ] 平台适配度 > 90%
- [ ] 用户满意度 > 4.5/5
- [ ] 系统稳定性 > 99%
- [ ] 生成成功率 > 95%

### 6.4 用户体验验收
- [ ] 界面直观易用
- [ ] 操作流程顺畅
- [ ] 错误处理友好
- [ ] 帮助文档完整
- [ ] 性能表现良好

## 7. 风险管理

### 7.1 技术风险
- **复杂度风险**: 分层架构可能增加系统复杂度
  - *缓解*: 分步实施，充分测试
- **性能风险**: 质量评估可能影响响应速度
  - *缓解*: 异步处理，智能缓存
- **兼容性风险**: 新系统与现有功能的集成问题
  - *缓解*: 向下兼容设计，渐进式迁移

### 7.2 用户接受度风险
- **学习成本**: 用户需要适应新的模板系统
  - *缓解*: 提供详细指南，保留简化模式
- **功能复杂**: 高级功能可能让新用户困惑
  - *缓解*: 分层UI设计，默认简化界面

### 7.3 质量风险
- **过度优化**: 可能影响内容准确性
  - *缓解*: 设置质量下限，支持手动调整
- **平台变化**: 社交平台规则可能频繁变化
  - *缓解*: 模块化设计，快速更新机制

## 8. 后续规划

### 8.1 短期优化（3个月内）
- A/B测试框架
- 用户行为分析
- 模板性能统计
- 社区模板分享

### 8.2 中期扩展（6-12个月）
- AI辅助模板生成
- 多模态内容支持
- 高级分析工具
- 企业级功能

### 8.3 长期愿景（1年以上）
- 跨平台内容策略
- 个性化AI训练
- 生态系统集成
- 商业化探索

---

## 附录

### A. 术语定义
- **分层Prompt**: 将Prompt分为系统、任务、上下文、输出四个层次
- **反AI痕迹**: 减少AI生成内容的机械感和模式化特征
- **平台适配**: 针对不同社交媒体平台优化内容风格和格式

### B. 参考文档
- 050302-008Cognilink Prompt 需求设计文档.md
- 050302-007-CogniLink Prompt 质量优化需求设计文档.md
- 22-Prompt 模板系统.md

### C. 变更历史
- v2.0: 综合功能需求和质量优化需求
- v1.1: 添加质量优化策略
- v1.0: 初始功能需求设计

---

*本文档将作为CogniLink Prompt模块开发的完整指导文档，确保项目的成功实施和质量目标的达成。* 