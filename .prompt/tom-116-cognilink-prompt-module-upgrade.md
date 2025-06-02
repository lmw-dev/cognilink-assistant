# TOM-116 CogniLink Prompt 模块综合升级 - v2.0 主Feature Prompt

## 🎯 目标 (Objective)
**Linear Issue**: TOM-116 - CogniLink Prompt 模块综合升级 - v2.0
**父Feature**: 主Feature (包含4个子Task: TOM-117~120)
**关键验收标准参考**: 将AI痕迹检测率从100%降低至30%以下，平台适配度提升至90%以上，用户满意度从3.5/5提升至4.5/5以上

**核心指令**: 实现CogniLink Assistant的Prompt模块全面升级，从基础功能提升为智能化、自然化、平台特化的高质量内容生成系统

## 📋 上下文参考 (Context References)

### 主要操作文件
- 主服务类: @src/services/prompt/PromptModuleService.ts (待创建)
- 核心类型: @src/types/prompt-advanced.ts (待创建)
- 设置管理: @src/services/SettingsManager.ts (现有)
- 质量评估: @src/services/content-quality-evaluator.ts (现有)

### 依赖的现有服务 (必须验证接口)
- AI服务: @src/services/AIService.ts
- RAG服务: @src/services/EmbeddingService.ts
- 设置存储: @src/services/SettingsStorage.ts
- **重要**: 使用前必须通过 `grep_search` 或 `codebase_search` 验证接口方法名和签名

### 需要遵循的内部规则
- TypeScript标准: @.cursor/rules/typescript-standards.mdc
- 项目通用规范: @.cursor/rules/project-general-standards.mdc
- 任务完成流程: @.cursor/rules/task-completion-workflow.mdc

### 关键参考文档
- 需求设计: @docs/01-design/050302-009-CogniLink Prompt 模块综合需求设计文档.md
- 开发记录: @docs/development-record.md (版本1.2相关内容)

### 接口依赖检查清单 (🔍 Interface Verification)
- [ ] 已搜索并确认AIService的接口定义和方法签名
- [ ] 已验证EmbeddingService的检索接口和返回类型
- [ ] 已检查SettingsManager和SettingsStorage的配置接口
- [ ] 已查看现有ContentQualityEvaluator的集成方式

## 🔧 具体要求与约束 (Requirements & Constraints)

### 技术栈约束
- **语言**: TypeScript (strict mode)
- **架构模式**: 服务层模式，分层架构设计
- **性能要求**: 响应速度<10秒，模板加载<1秒，UI响应<500ms
- **质量要求**: AI痕迹检测率<30%，平台适配度>90%，用户满意度>4.5/5

### 功能要求
1. **分层Prompt架构**: 系统、任务、上下文、输出四层结构
2. **反AI痕迹策略**: 语言自然化、个性化注入、适度不完美化
3. **平台特化适配**: 小红书、Twitter、微信公众号等平台优化
4. **智能质量评估**: 多维度评估和实时监控系统
5. **用户界面优化**: 直观易用的管理界面和编辑器

### 质量标准
- **代码覆盖率**: 单元测试80%以上
- **性能基准**: 支持100+模板流畅操作
- **兼容性**: 与现有系统无缝集成，向下兼容

### 类型安全要求 (🛡️ Type Safety)
- **类型优先设计**: 先定义完整的AdvancedPromptTemplate接口，再实现功能
- **接口一致性**: 确保所有子Task的类型定义与主架构完全匹配
- **测试驱动**: 编写测试用例时明确期望的数据结构和行为
- **边界条件**: 考虑模板为空、配置缺失、评估失败等边界情况的类型处理

## 📝 期望输出结构 (Expected Output Structure)

### 1. 核心架构类
```typescript
// 主服务协调器
export class PromptModuleService {
  constructor(
    private templateService: EnhancedPromptTemplateService,
    private qualityEvaluator: ContentQualityEvaluator,
    private platformAnalyzer: PlatformContentAnalyzer
  ) {}
  
  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResult>;
  async evaluatePromptQuality(template: AdvancedPromptTemplate): Promise<PromptQualityReport>;
}
```

### 2. 高级数据结构
```typescript
// 分层Prompt模板接口
export interface AdvancedPromptTemplate {
  id: string;
  name: string;
  platform: SocialMediaPlatform;
  category: PromptCategory;
  
  // 分层Prompt结构
  systemPrompt: string;      // 系统层：角色定义和基础规则
  taskPrompt: string;        // 任务层：具体任务和目标描述
  contextPrompt: string;     // 上下文层：用户输入和背景信息
  outputPrompt: string;      // 输出层：格式要求和质量标准
  
  // 高级配置
  variables: PromptVariable[];
  examples: FewShotExample[];
  qualityRules: QualityRule[];
  antiAISettings: AntiAIDetectionStrategy;
}
```

### 3. 子Task集成接口
```typescript
// TOM-117: 核心模板管理
export interface EnhancedPromptTemplateService {
  createTemplate(template: AdvancedPromptTemplate): Promise<void>;
  getTemplates(filters?: TemplateFilters): Promise<AdvancedPromptTemplate[]>;
  updateTemplate(id: string, updates: Partial<AdvancedPromptTemplate>): Promise<void>;
  deleteTemplate(id: string): Promise<void>;
}

// TOM-118: 智能质量评估
export interface EnhancedContentQualityEvaluator {
  evaluateAIDetectionRisk(content: string): Promise<AIDetectionReport>;
  evaluatePlatformCompliance(content: string, platform: SocialMediaPlatform): Promise<ComplianceReport>;
  generateImprovementSuggestions(report: QualityReport): Promise<ImprovementSuggestion[]>;
}
```

## 🔄 实施步骤 (Implementation Steps)

### 第0步: 前期验证 (优先级: 最高) ⚠️ 必须执行
1. **接口依赖验证**: 使用 `grep_search` 确认所有依赖服务的接口
2. **类型定义检查**: 搜索现有相关类型定义，确保新类型与现有系统兼容
3. **子Task依赖分析**: 明确TOM-117~120之间的依赖关系和执行顺序

### 第1步: 基础架构搭建 (优先级: 最高) - 对应TOM-117
1. **数据结构定义**: 创建AdvancedPromptTemplate和相关接口
2. **核心服务实现**: 开发EnhancedPromptTemplateService基础功能
3. **数据持久化**: 集成Obsidian settings存储系统
4. **向下兼容**: 确保现有模板格式正常迁移

### 第2步: 质量评估系统 (优先级: 高) - 对应TOM-118
1. **ContentQualityEvaluator增强**: 扩展现有质量评估系统
2. **AI痕迹检测**: 实现反AI痕迹检测和优化算法
3. **多维度评估**: 集成平台适配度、原创性、互动潜力评估
4. **实时监控**: 建立Prompt质量预评估和内容后评估机制

### 第3步: 平台特化模板 (优先级: 高) - 对应TOM-119
1. **PlatformContentAnalyzer开发**: 实现平台规则分析器
2. **小红书模板集**: 开发种草、攻略、合集等特化模板
3. **Twitter模板集**: 创建Thread、快讯、见解等模板
4. **微信公众号模板集**: 设计分析、科普、评论等模板
5. **模板集成**: 建立DEFAULT_PROMPT_TEMPLATES常量

### 第4步: 用户界面优化 (优先级: 中) - 对应TOM-120
1. **模板管理界面**: 开发卡片式布局和高级筛选功能
2. **分层编辑器**: 实现分层Prompt编辑和实时预览
3. **智能辅助**: 添加模板推荐、智能提示、向导功能
4. **性能优化**: 实现虚拟滚动、防抖搜索等优化

### 第5步: 系统集成测试 (优先级: 高)
1. **端到端测试**: 验证完整的内容生成和质量评估流程
2. **性能基准**: 确保所有性能指标达标
3. **兼容性测试**: 验证与现有系统的无缝集成
4. **用户验收**: 进行用户体验测试和反馈收集

## 🎉 完成检查清单 (Completion Checklist)

### 基础功能检查
- [ ] PromptModuleService主服务协调器实现完成
- [ ] 4个子Task (TOM-117~120) 全部完成并集成
- [ ] 分层Prompt架构工作正常
- [ ] 反AI痕迹策略效果显著

### 质量保障检查 (基于TOM-109经验)
- [ ] **接口调用验证**: 所有依赖服务调用方法名和参数正确
- [ ] **类型一致性检查**: TypeScript类型定义与实现完全匹配
- [ ] **边界条件测试**: 测试用例覆盖模板为空、配置缺失等边界情况
- [ ] **编译验证**: `npm run build` 无错误无警告

### 性能指标验证
- [ ] AI痕迹检测率 < 30% (从100%降低)
- [ ] 平台适配度 > 90%
- [ ] 用户满意度 > 4.5/5 (从3.5/5提升)
- [ ] 响应速度 < 10秒
- [ ] 模板加载时间 < 1秒
- [ ] UI响应时间 < 500ms

### 功能完整性检查
- [ ] 完整的模板CRUD操作正常运行
- [ ] 智能质量评估系统输出合理
- [ ] 平台特化模板准确有效
- [ ] 用户界面直观易用

### 文档和流程检查
- [ ] 完成Linear任务状态更新 (TOM-116~120全部关闭)
- [ ] 更新docs/development-record.md版本记录
- [ ] 代码审查通过，符合TypeScript标准
- [ ] 用户指南和技术文档完整

## 🚨 重要注意事项 (Important Notes)

### 技术风险
- **架构复杂性风险**: 分层架构可能增加系统复杂度
  - 缓解：采用渐进式开发，先实现基础功能再扩展高级特性
- **性能优化风险**: 多维度评估可能影响响应速度
  - 缓解：实现异步处理、智能缓存和批量优化

### 最佳实践
- **模块化设计**: 每个子Task独立开发，接口清晰
- **类型安全**: 严格遵循TypeScript最佳实践
- **测试驱动**: 为每个功能模块编写完整测试
- **渐进增强**: 保持与现有系统的兼容性

### 常见Bug预防 (基于历史经验)
#### 1. 子Task依赖错误预防
- ❌ **错误做法**: 假设TOM-118的接口 `this.qualityEvaluator.evaluateContent()`
- ✅ **正确做法**: 先搜索TOM-118的实际接口定义，确认方法名和参数

#### 2. 类型定义不一致预防
- ❌ **错误做法**: 各子Task使用不同的AdvancedPromptTemplate定义
- ✅ **正确做法**: 在主Feature中统一定义接口，子Task严格遵循

#### 3. 性能指标验证预防
- ❌ **错误做法**: 仅在开发环境测试性能指标
- ✅ **正确做法**: 建立性能基准测试，在真实环境验证指标

#### 4. 用户体验割裂预防
- ❌ **错误做法**: 各子Task的UI组件风格不统一
- ✅ **正确做法**: 建立统一的设计系统和组件库

## 📚 子Task执行顺序建议

### 阶段1: 基础架构 (1天)
**执行顺序**: TOM-117 → 基础架构验证
- TOM-117作为基础，必须优先完成
- 建立核心数据结构和服务接口
- 为后续子Task提供稳定的基础

### 阶段2: 核心功能 (1天)  
**执行顺序**: TOM-118 和 TOM-119 并行开发
- 两个Task相对独立，可以并行进行
- TOM-118专注质量评估算法
- TOM-119专注平台特化模板

### 阶段3: 用户体验 (1天)
**执行顺序**: TOM-120 → 系统集成测试
- 依赖前三个Task的完成
- 实现完整的用户界面和交互
- 进行端到端的系统验证

---

**总预计开发时间**: 3天
**关键里程碑**: 每个阶段完成后进行集成验证
**成功标准**: 所有验收标准达成，性能指标满足要求 