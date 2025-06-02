# TOM-119 平台特化模板库开发 - 平台适配Task

## 🎯 目标 (Objective)
**Linear Issue**: TOM-119 - 平台特化模板库开发
**父Feature**: TOM-116 - CogniLink Prompt 模块综合升级 - v2.0
**关键验收标准参考**: 实现平台适配度提升至90%以上，创建小红书、Twitter、微信公众号等主流平台的优化模板集

**核心指令**: 开发针对不同社交媒体平台的特化Prompt模板库，实现PlatformContentAnalyzer平台分析器，确保平台特化模板准确有效

## 📋 上下文参考 (Context References)

### 主要操作文件
- 平台内容分析器: @src/services/prompt/PlatformContentAnalyzer.ts (待创建，与TOM-118协同)
- 平台模板管理器: @src/services/prompt/PlatformTemplateManager.ts (待创建)
- 预定义模板库: @src/config/advanced-platform-templates.ts (待创建)
- 平台适配器: @src/services/prompt/PlatformAdapterService.ts (待创建)

### 依赖的现有服务 (必须验证接口)
- 基础模板服务: @src/services/prompt/EnhancedPromptTemplateService.ts (TOM-117)
- 质量评估器: @src/services/content-quality-evaluator.ts (TOM-118扩展)
- 现有平台模板: @src/config/platform-templates.ts
- 平台合规性评估: @src/services/platform-compliance-evaluator.ts
- **重要**: 使用前必须通过 `grep_search` 或 `codebase_search` 验证接口方法名和签名

### 需要遵循的内部规则
- TypeScript标准: @.cursor/rules/typescript-standards.mdc
- 项目通用规范: @.cursor/rules/project-general-standards.mdc

### 关键参考文档
- 需求设计: @docs/01-design/050302-009-CogniLink Prompt 模块综合需求设计文档.md
- 主Feature Prompt: @.prompt/tom-116-cognilink-prompt-module-upgrade.md
- 基础架构: @.prompt/tom-117-core-template-management-system.md
- 质量评估: @.prompt/tom-118-intelligent-quality-evaluation-system.md

### 接口依赖检查清单 (🔍 Interface Verification)
- [ ] 已搜索并确认TOM-117的AdvancedPromptTemplate接口定义
- [ ] 已验证TOM-118的PlatformContentAnalyzer接口设计
- [ ] 已检查现有platform-templates的数据结构和扩展方式
- [ ] 已查看PlatformComplianceEvaluator的平台规则定义

## 🔧 具体要求与约束 (Requirements & Constraints)

### 技术栈约束
- **语言**: TypeScript (strict mode)
- **架构模式**: 模板工厂模式，平台适配器模式
- **性能要求**: 模板生成<500ms，平台分析<1秒
- **质量要求**: 平台适配度≥90%，模板质量评估通过率≥95%

### 功能要求
1. **平台特化模板集**: 小红书、Twitter、微信公众号、个人博客、头条号
2. **PlatformContentAnalyzer**: 平台规则提取、受众分析、热门内容分析
3. **智能模板推荐**: 基于内容类型和平台特性的模板推荐
4. **模板优化引擎**: 基于平台表现数据的模板持续优化
5. **跨平台适配**: 同一内容在不同平台间的智能转换

### 质量标准
- **平台覆盖率**: 5个主流平台完整支持
- **模板数量**: 每个平台至少3套高质量特化模板
- **适配准确率**: 平台适配度评估≥90%
- **生成质量**: 使用新模板生成的内容通过质量评估

### 类型安全要求 (🛡️ Type Safety)
- **类型优先设计**: 先定义完整的平台模板接口，再实现模板内容
- **接口一致性**: 确保平台模板与AdvancedPromptTemplate完全兼容
- **测试驱动**: 编写测试用例时明确期望的平台适配效果
- **边界条件**: 考虑平台规则变化、内容格式异常等边界情况的处理

## 📝 期望输出结构 (Expected Output Structure)

### 1. 平台内容分析器 (与TOM-118协同开发)
```typescript
// src/services/prompt/PlatformContentAnalyzer.ts
export class PlatformContentAnalyzer {
  constructor(
    private templateService: EnhancedPromptTemplateService,
    private qualityEvaluator: EnhancedContentQualityEvaluator
  ) {}

  // 平台规则提取和分析
  async extractPlatformRules(platform: SocialMediaPlatform): Promise<PlatformRule[]>;
  async analyzePlatformTrends(platform: SocialMediaPlatform, timeframe: string): Promise<PlatformTrends>;
  async identifySuccessPatterns(platform: SocialMediaPlatform, category: string): Promise<SuccessPattern[]>;
  
  // 目标受众分析
  async analyzeTargetAudience(content: string, platform: SocialMediaPlatform): Promise<AudienceAnalysis>;
  async calculateAudienceAlignment(content: string, platform: SocialMediaPlatform): Promise<number>;
  
  // 内容优化建议
  async generatePlatformSpecificPrompt(basePrompt: string, platform: SocialMediaPlatform): Promise<string>;
  async optimizeContentForPlatform(content: string, platform: SocialMediaPlatform): Promise<OptimizedContent>;
  async suggestCrossPlatformAdaptation(content: string, fromPlatform: SocialMediaPlatform, toPlatform: SocialMediaPlatform): Promise<AdaptationSuggestion>;
}
```

### 2. 平台模板管理器
```typescript
// src/services/prompt/PlatformTemplateManager.ts
export class PlatformTemplateManager {
  constructor(
    private templateService: EnhancedPromptTemplateService,
    private platformAnalyzer: PlatformContentAnalyzer,
    private qualityEvaluator: EnhancedContentQualityEvaluator
  ) {}

  // 模板推荐和选择
  async recommendTemplate(criteria: TemplateCriteria): Promise<AdvancedPromptTemplate[]>;
  async selectOptimalTemplate(content: string, platform: SocialMediaPlatform, category: PromptCategory): Promise<AdvancedPromptTemplate>;
  
  // 模板生成和优化
  async generatePlatformTemplate(platform: SocialMediaPlatform, category: PromptCategory, requirements: TemplateRequirements): Promise<AdvancedPromptTemplate>;
  async optimizeExistingTemplate(templateId: string, performanceData: TemplatePerformanceData): Promise<AdvancedPromptTemplate>;
  
  // 批量操作
  async batchCreatePlatformTemplates(platform: SocialMediaPlatform): Promise<string[]>;
  async validateTemplateForPlatform(template: AdvancedPromptTemplate, platform: SocialMediaPlatform): Promise<ValidationResult>;
}
```

### 3. 预定义平台模板库
```typescript
// src/config/advanced-platform-templates.ts
export const ADVANCED_PLATFORM_TEMPLATES: AdvancedPromptTemplate[] = [
  // 小红书特化模板
  {
    id: 'xiaohongshu-lifestyle-review',
    name: '小红书生活好物测评模板',
    platform: 'xiaohongshu',
    category: 'product-review',
    systemPrompt: `你是一位真实的生活达人，对好物有独到的见解和真实的使用体验。你的表达自然真诚，善于用生动的细节和个人感受来分享产品体验...`,
    taskPrompt: `基于用户提供的产品信息，创作一篇真实自然的好物分享内容...`,
    contextPrompt: `产品信息：{productInfo}\n用户使用场景：{useCase}\n个人偏好：{preferences}...`,
    outputPrompt: `输出格式要求：\n1. 标题吸引人且真实\n2. 开头要有个人使用背景\n3. 详细的使用体验和感受\n4. 真实的优缺点分析\n5. 适当的表情符号和话题标签...`,
    
    variables: [
      { name: 'productInfo', type: 'string', required: true, description: '产品基本信息' },
      { name: 'useCase', type: 'string', required: false, description: '使用场景描述' },
      { name: 'preferences', type: 'string', required: false, description: '个人偏好和需求' }
    ],
    
    examples: [
      {
        id: 'xiaohongshu-skincare-example',
        input: { productInfo: '玉泽皮肤屏障修护面霜', useCase: '干燥敏感肌护理', preferences: '成分简单温和' },
        expectedOutput: '🌟真的被这个面霜惊艳到了！\n\n作为一个敏感肌+干皮星人，换季的时候脸总是又干又痒，用什么都不舒服😭...',
        explanation: '体现真实使用体验，语言自然，包含个人感受',
        weight: 1.0
      }
    ],
    
    qualityRules: [
      { id: 'xiaohongshu-authenticity', name: '真实性检查', type: 'custom', condition: { contains: ['个人体验', '真实感受'] }, weight: 0.3, enabled: true },
      { id: 'xiaohongshu-engagement', name: '互动性检查', type: 'custom', condition: { contains: ['表情符号', '话题标签'] }, weight: 0.2, enabled: true }
    ],
    
    antiAISettings: {
      languageNaturalization: { enabled: true, sentenceVariation: 0.8, colloquialLevel: 0.7, emotionalNuance: 0.9 },
      personalizationInjection: { enabled: true, userStyleMimicry: true, personalExperience: true, uniquePerspective: true },
      moderateImperfection: { enabled: true, minorInconsistency: 0.05, naturalPauses: true, colloquialErrors: false }
    }
  },

  // Twitter特化模板
  {
    id: 'twitter-tech-insight',
    name: 'Twitter技术观点Thread模板',
    platform: 'twitter',
    category: 'opinion-sharing',
    systemPrompt: `你是一位资深的技术专家，对行业发展有深入的洞察。你善于用简洁有力的语言表达复杂的技术观点，能够引发思考和讨论...`,
    taskPrompt: `基于用户提供的技术话题，创作一个有深度的Twitter Thread，分享独特的技术观点和见解...`,
    contextPrompt: `技术话题：{topic}\n当前趋势：{trends}\n个人经验：{experience}...`,
    outputPrompt: `输出格式要求：\n1. 开头tweet要抓眼球\n2. 分解为多个相关tweet\n3. 每个tweet控制在280字符内\n4. 包含相关话题标签\n5. 结尾引导互动...`,
    
    variables: [
      { name: 'topic', type: 'string', required: true, description: '技术话题' },
      { name: 'trends', type: 'string', required: false, description: '当前技术趋势' },
      { name: 'experience', type: 'string', required: false, description: '个人技术经验' }
    ],
    
    antiAISettings: {
      languageNaturalization: { enabled: true, sentenceVariation: 0.7, colloquialLevel: 0.6, emotionalNuance: 0.7 },
      personalizationInjection: { enabled: true, userStyleMimicry: true, personalExperience: true, uniquePerspective: true },
      moderateImperfection: { enabled: true, minorInconsistency: 0.03, naturalPauses: false, colloquialErrors: false }
    }
  },

  // 微信公众号特化模板
  {
    id: 'wechat-deep-analysis',
    name: '微信公众号深度分析模板',
    platform: 'wechat',
    category: 'analytical-article',
    systemPrompt: `你是一位资深的行业分析师，具有深厚的专业背景和独到的分析视角。你善于从多个维度深入分析复杂问题，用数据和逻辑支撑观点...`,
    taskPrompt: `基于用户提供的话题，撰写一篇深度分析文章，要求逻辑严密、论据充分、见解独到...`,
    contextPrompt: `分析话题：{topic}\n相关数据：{data}\n行业背景：{background}...`,
    outputPrompt: `输出格式要求：\n1. 引人深思的标题\n2. 简洁有力的开头\n3. 清晰的结构层次\n4. 数据支撑的分析\n5. 深度的洞察总结...`,
    
    antiAISettings: {
      languageNaturalization: { enabled: true, sentenceVariation: 0.6, colloquialLevel: 0.4, emotionalNuance: 0.6 },
      personalizationInjection: { enabled: true, userStyleMimicry: false, personalExperience: true, uniquePerspective: true },
      moderateImperfection: { enabled: true, minorInconsistency: 0.02, naturalPauses: true, colloquialErrors: false }
    }
  }
];
```

### 4. 平台适配器服务
```typescript
// src/services/prompt/PlatformAdapterService.ts
export class PlatformAdapterService {
  constructor(
    private templateManager: PlatformTemplateManager,
    private platformAnalyzer: PlatformContentAnalyzer,
    private qualityEvaluator: EnhancedContentQualityEvaluator
  ) {}

  // 跨平台内容适配
  async adaptContentForPlatform(content: string, targetPlatform: SocialMediaPlatform, sourceContext?: PlatformContext): Promise<AdaptedContent>;
  async batchAdaptContent(content: string, targetPlatforms: SocialMediaPlatform[]): Promise<Map<SocialMediaPlatform, AdaptedContent>>;
  
  // 平台规则验证
  async validateForPlatform(content: string, platform: SocialMediaPlatform): Promise<PlatformValidationResult>;
  async suggestPlatformImprovements(content: string, platform: SocialMediaPlatform): Promise<PlatformImprovement[]>;
  
  // 智能平台选择
  async recommendOptimalPlatforms(content: string, goals: ContentGoals): Promise<PlatformRecommendation[]>;
  async analyzePlatformFit(content: string, platform: SocialMediaPlatform): Promise<PlatformFitScore>;
}
```

## 🔄 实施步骤 (Implementation Steps)

### 第0步: 前期验证 (优先级: 最高) ⚠️ 必须执行
1. **接口依赖验证**: 使用 `grep_search` 确认TOM-117和TOM-118的接口定义
2. **现有平台模板分析**: 检查现有platform-templates的结构和扩展方式
3. **平台规则调研**: 研究各平台的最新规则和特性变化

### 第1步: 平台内容分析器开发 (优先级: 最高)
1. **PlatformContentAnalyzer基础类**: 实现平台规则提取和分析功能
2. **平台特性数据库**: 建立各平台的规则、特性、趋势数据库
3. **受众分析算法**: 实现目标受众匹配和对齐度计算
4. **成功模式识别**: 分析各平台的热门内容和成功模式

### 第2步: 平台特化模板集开发 (优先级: 最高)
1. **小红书模板集**: 种草测评、攻略教程、合集推荐3套模板
2. **Twitter模板集**: 观点Thread、实时快讯、个人见解3套模板
3. **微信公众号模板集**: 深度分析、知识科普、观点评论3套模板
4. **个人博客和头条号模板**: 技术文档、SEO优化、专业分析模板

### 第3步: 平台模板管理器 (优先级: 高)
1. **PlatformTemplateManager类**: 实现模板推荐和管理功能
2. **智能推荐算法**: 基于内容分析的模板匹配算法
3. **模板优化引擎**: 基于性能数据的模板持续优化
4. **批量操作支持**: 支持批量模板生成和验证

### 第4步: 平台适配器服务 (优先级: 中)
1. **PlatformAdapterService类**: 实现跨平台内容适配
2. **内容转换算法**: 实现不同平台间的内容格式转换
3. **规则验证引擎**: 确保内容符合目标平台规则
4. **智能优化建议**: 生成平台特定的优化建议

### 第5步: 集成测试和优化 (优先级: 高)
1. **模板质量验证**: 使用TOM-118的质量评估器验证模板效果
2. **平台适配度测试**: 验证各平台模板的适配度≥90%
3. **性能优化**: 确保模板生成和平台分析性能达标
4. **用户体验测试**: 验证模板推荐和适配的准确性

## 🎉 完成检查清单 (Completion Checklist)

### 基础功能检查
- [ ] PlatformContentAnalyzer完整实现并集成
- [ ] PlatformTemplateManager模板管理功能完善
- [ ] PlatformAdapterService跨平台适配正常
- [ ] 5个平台各有3套以上高质量特化模板

### 质量保障检查 (基于TOM-109经验)
- [ ] **接口调用验证**: 所有依赖服务调用方法名和参数正确
- [ ] **类型一致性检查**: TypeScript类型定义与实现完全匹配
- [ ] **边界条件测试**: 测试用例覆盖平台规则变化、模板异常等边界情况
- [ ] **编译验证**: `npm run build` 无错误无警告

### 平台适配度验证
- [ ] 小红书模板生成内容契合平台调性，种草感强
- [ ] Twitter模板严格遵守字符限制和格式要求
- [ ] 微信公众号模板符合深度阅读习惯，逻辑严密
- [ ] 个人博客模板SEO友好，结构清晰
- [ ] 头条号模板标题吸引人，内容有料

### 模板质量验证
- [ ] 每个平台至少3套高质量特化模板完成
- [ ] 模板包含完整的分层Prompt结构
- [ ] 反AI痕迹策略配置合理有效
- [ ] 质量规则定义明确可执行
- [ ] 使用新模板生成的内容通过质量评估

### 系统集成验证
- [ ] 与TOM-117的EnhancedPromptTemplateService无缝集成
- [ ] 与TOM-118的质量评估系统正确协作
- [ ] 预定义模板正确加载到系统
- [ ] 模板推荐和适配算法准确有效

### 性能和用户体验
- [ ] 平台分析响应时间<1秒
- [ ] 模板生成时间<500ms
- [ ] 整体平台适配度评估≥90%
- [ ] 模板推荐准确率≥85%

### 文档和流程检查
- [ ] Linear任务状态更新 (TOM-119标记完成)
- [ ] 平台模板使用指南完整
- [ ] API文档和扩展指南完善
- [ ] 为TOM-120提供完整的模板管理接口

## 🚨 重要注意事项 (Important Notes)

### 技术风险
- **平台规则变化风险**: 社交媒体平台规则可能频繁变化
  - 缓解：建立规则更新监控机制，模板配置化管理
- **模板质量一致性风险**: 不同平台模板质量可能不均衡
  - 缓解：统一的质量评估标准，持续优化机制

### 最佳实践
- **平台深度研究**: 深入理解各平台的用户特点和内容偏好
- **模板可配置性**: 确保模板可以根据需求灵活调整
- **质量持续监控**: 建立模板性能监控和优化机制
- **用户反馈集成**: 收集用户反馈，持续改进模板效果

### 常见Bug预防 (基于TOM-109经验)
#### 1. 平台规则理解错误预防
- ❌ **错误做法**: 基于过时或错误的平台规则设计模板
- ✅ **正确做法**: 持续关注平台规则更新，建立规则验证机制

#### 2. 模板适配度评估偏差预防
- ❌ **错误做法**: 仅基于理论分析评估模板适配度
- ✅ **正确做法**: 结合实际生成内容的平台表现进行评估

#### 3. 跨平台一致性问题预防
- ❌ **错误做法**: 各平台模板独立开发，缺乏一致性
- ✅ **正确做法**: 建立统一的模板开发标准和质量检查流程

#### 4. 性能优化忽视预防
- ❌ **错误做法**: 忽视大量模板加载和匹配的性能影响
- ✅ **正确做法**: 实现智能缓存、延迟加载、并行处理

## 📚 与其他子Task的集成规划

### 依赖TOM-117的接口
```typescript
// 使用TOM-117的基础模板结构
export interface PlatformSpecificTemplate extends AdvancedPromptTemplate {
  platformRules: PlatformRule[];
  adaptationStrategies: AdaptationStrategy[];
  performanceMetrics: PlatformPerformanceMetrics;
}
```

### 依赖TOM-118的服务
```typescript
// 使用TOM-118的质量评估能力
export interface PlatformTemplateValidator {
  validateTemplateQuality(template: AdvancedPromptTemplate, platform: SocialMediaPlatform): Promise<PlatformQualityReport>;
  optimizeTemplateWithAI(template: AdvancedPromptTemplate): Promise<AdvancedPromptTemplate>;
}
```

### 为TOM-120提供的接口
```typescript
// 为UI组件提供平台模板管理能力
export interface PlatformTemplateUIAdapter {
  getTemplatesForPlatform(platform: SocialMediaPlatform): Promise<TemplateCardData[]>;
  getTemplatePreviewForPlatform(template: AdvancedPromptTemplate, platform: SocialMediaPlatform): Promise<string>;
  validateTemplateForUI(template: Partial<AdvancedPromptTemplate>, platform: SocialMediaPlatform): Promise<ValidationResult>;
}
```

---

**优先级**: 高 (平台特化核心功能)
**依赖**: TOM-117 (基础架构), TOM-118 (质量评估)
**预计完成时间**: 1天
**成功标准**: 平台适配度≥90%，5个平台各有3套以上高质量模板，模板推荐准确率≥85% 