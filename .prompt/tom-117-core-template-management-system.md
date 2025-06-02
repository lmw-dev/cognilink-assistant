# TOM-117 核心模板管理系统实现 - 基础架构Task

## 🎯 目标 (Objective)
**Linear Issue**: TOM-117 - 核心模板管理系统实现
**父Feature**: TOM-116 - CogniLink Prompt 模块综合升级 - v2.0
**关键验收标准参考**: 实现AdvancedPromptTemplate数据结构、分层Prompt架构和基础CRUD操作功能

**核心指令**: 构建CogniLink Prompt模块的基础架构，包括高级数据结构定义、核心服务实现、数据持久化和向下兼容机制

## 📋 上下文参考 (Context References)

### 主要操作文件
- 核心类型定义: @src/types/prompt-advanced.ts (待创建)
- 增强模板服务: @src/services/prompt/EnhancedPromptTemplateService.ts (待创建)
- 设置扩展: @src/services/PromptModuleSettings.ts (待创建)
- 主服务协调器: @src/services/prompt/PromptModuleService.ts (待创建)

### 依赖的现有服务 (必须验证接口)
- 设置管理: @src/services/SettingsManager.ts
- 设置存储: @src/services/SettingsStorage.ts
- 平台模板: @src/config/platform-templates.ts
- **重要**: 使用前必须通过 `grep_search` 或 `codebase_search` 验证接口方法名和签名

### 需要遵循的内部规则
- TypeScript标准: @.cursor/rules/typescript-standards.mdc
- 项目通用规范: @.cursor/rules/project-general-standards.mdc

### 关键参考文档
- 需求设计: @docs/01-design/050302-009-CogniLink Prompt 模块综合需求设计文档.md
- 主Feature Prompt: @.prompt/tom-116-cognilink-prompt-module-upgrade.md

### 接口依赖检查清单 (🔍 Interface Verification)
- [ ] 已搜索并确认SettingsManager的接口方法名和参数类型
- [ ] 已验证SettingsStorage的数据持久化接口
- [ ] 已检查现有platform-templates的数据结构
- [ ] 已查看现有Obsidian插件设置系统的集成方式

## 🔧 具体要求与约束 (Requirements & Constraints)

### 技术栈约束
- **语言**: TypeScript (strict mode)
- **架构模式**: 服务层模式，数据与业务逻辑分离
- **性能要求**: 模板加载时间<1秒，内存使用合理
- **兼容性要求**: 与现有模板格式向下兼容

### 功能要求
1. **分层Prompt数据结构**: 系统、任务、上下文、输出四层定义
2. **高级配置支持**: 变量、示例、质量规则、反AI设置
3. **完整CRUD操作**: 创建、读取、更新、删除模板
4. **数据持久化**: 集成Obsidian settings存储
5. **向下兼容**: 支持现有简单模板格式迁移

### 质量标准
- **类型安全**: 100%TypeScript类型覆盖
- **测试覆盖率**: 单元测试80%以上
- **性能基准**: 支持100+模板流畅操作
- **数据完整性**: 无数据丢失，支持备份恢复

### 类型安全要求 (🛡️ Type Safety)
- **类型优先设计**: 先定义完整的AdvancedPromptTemplate接口，再实现功能
- **接口一致性**: 确保类型定义与实际数据结构完全匹配
- **测试驱动**: 编写测试用例时明确期望的数据结构
- **边界条件**: 考虑模板为空、必填字段缺失、格式转换等边界情况的类型处理

## 📝 期望输出结构 (Expected Output Structure)

### 1. 核心数据结构定义
```typescript
// src/types/prompt-advanced.ts
export interface AdvancedPromptTemplate {
  // 基础信息
  id: string;
  name: string;
  description?: string;
  platform: SocialMediaPlatform;
  category: PromptCategory;
  tags: string[];
  
  // 分层Prompt结构
  systemPrompt: string;      // 系统层：角色定义和基础规则
  taskPrompt: string;        // 任务层：具体任务和目标描述
  contextPrompt: string;     // 上下文层：用户输入和背景信息处理
  outputPrompt: string;      // 输出层：格式要求和质量标准
  
  // 高级配置
  variables: PromptVariable[];           // 可替换变量定义
  examples: FewShotExample[];            // 示例对话和输出
  qualityRules: QualityRule[];           // 质量检查规则
  antiAISettings: AntiAIDetectionStrategy; // 反AI痕迹策略
  
  // 元数据
  version: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  performanceMetrics?: TemplatePerformanceMetrics;
}

// 支撑接口定义
export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  defaultValue?: any;
  description?: string;
  required: boolean;
  validation?: VariableValidation;
}

export interface FewShotExample {
  id: string;
  input: Record<string, any>;
  expectedOutput: string;
  explanation?: string;
  weight: number; // 示例权重，影响学习效果
}

export interface QualityRule {
  id: string;
  name: string;
  type: 'length' | 'tone' | 'format' | 'keyword' | 'custom';
  condition: RuleCondition;
  weight: number;
  enabled: boolean;
}

export interface AntiAIDetectionStrategy {
  languageNaturalization: {
    enabled: boolean;
    sentenceVariation: number;     // 句式变化度 0-1
    colloquialLevel: number;       // 口语化程度 0-1
    emotionalNuance: number;       // 情感细腻度 0-1
  };
  personalizationInjection: {
    enabled: boolean;
    userStyleMimicry: boolean;     // 用户风格模仿
    personalExperience: boolean;   // 个人经历融入
    uniquePerspective: boolean;    // 独特观点表达
  };
  moderateImperfection: {
    enabled: boolean;
    minorInconsistency: number;    // 轻微不一致度 0-0.1
    naturalPauses: boolean;        // 自然停顿
    colloquialErrors: boolean;     // 口语化错误
  };
}
```

### 2. 增强模板服务类
```typescript
// src/services/prompt/EnhancedPromptTemplateService.ts
export class EnhancedPromptTemplateService {
  constructor(
    private settingsManager: SettingsManager,
    private settingsStorage: SettingsStorage
  ) {}

  // 基础CRUD操作
  async createTemplate(template: Omit<AdvancedPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  async getTemplate(id: string): Promise<AdvancedPromptTemplate | null>;
  async getTemplates(filters?: TemplateFilters): Promise<AdvancedPromptTemplate[]>;
  async updateTemplate(id: string, updates: Partial<AdvancedPromptTemplate>): Promise<void>;
  async deleteTemplate(id: string): Promise<void>;

  // 高级功能
  async searchTemplates(query: string): Promise<AdvancedPromptTemplate[]>;
  async getTemplatesByCategory(category: PromptCategory): Promise<AdvancedPromptTemplate[]>;
  async getTemplatesByPlatform(platform: SocialMediaPlatform): Promise<AdvancedPromptTemplate[]>;
  async cloneTemplate(id: string, newName: string): Promise<string>;
  
  // 批量操作
  async batchCreateTemplates(templates: Omit<AdvancedPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]>;
  async batchDeleteTemplates(ids: string[]): Promise<void>;
  async exportTemplates(ids?: string[]): Promise<string>; // JSON格式导出
  async importTemplates(jsonData: string): Promise<string[]>; // 导入并返回新ID列表
  
  // 兼容性支持
  async migrateFromSimpleTemplate(simpleTemplate: any): Promise<AdvancedPromptTemplate>;
  async getTemplateStatistics(): Promise<TemplateStatistics>;
}
```

### 3. 设置扩展类
```typescript
// src/services/PromptModuleSettings.ts
export interface PromptModuleSettings {
  templates: AdvancedPromptTemplate[];
  defaultTemplateId?: string;
  categories: PromptCategory[];
  globalVariables: Record<string, any>;
  qualityThresholds: QualityThresholds;
  migrationVersion: string;
}

export class PromptModuleSettingsManager {
  async loadSettings(): Promise<PromptModuleSettings>;
  async saveSettings(settings: PromptModuleSettings): Promise<void>;
  async resetToDefaults(): Promise<void>;
  async migrateSettings(fromVersion: string, toVersion: string): Promise<void>;
}
```

## 🔄 实施步骤 (Implementation Steps)

### 第0步: 前期验证 (优先级: 最高) ⚠️ 必须执行
1. **接口依赖验证**: 使用 `grep_search` 确认SettingsManager和SettingsStorage的接口
2. **现有类型检查**: 搜索现有prompt相关类型定义，确保新类型兼容
3. **数据结构分析**: 检查现有platform-templates的数据格式

### 第1步: 核心类型定义 (优先级: 最高)
1. **创建prompt-advanced.ts**: 定义AdvancedPromptTemplate和所有支撑接口
2. **类型验证**: 确保所有接口的类型安全和一致性
3. **默认值定义**: 为所有可选字段提供合理的默认值
4. **类型导出**: 建立统一的类型导出索引

### 第2步: 核心服务实现 (优先级: 最高)
1. **EnhancedPromptTemplateService基础类**: 实现核心CRUD操作
2. **数据验证**: 添加输入数据的完整性检查和验证
3. **错误处理**: 实现完善的错误分类和处理机制
4. **日志记录**: 添加操作日志和性能监控

### 第3步: 数据持久化集成 (优先级: 高)
1. **PromptModuleSettingsManager**: 实现设置管理器
2. **Obsidian集成**: 与现有设置系统无缝集成
3. **数据迁移**: 实现版本控制和数据升级机制
4. **备份恢复**: 添加数据备份和恢复功能

### 第4步: 向下兼容实现 (优先级: 中)
1. **格式转换**: 实现简单模板到高级模板的转换
2. **迁移验证**: 确保现有模板数据无损迁移
3. **兼容性测试**: 验证新旧格式的兼容性
4. **降级支持**: 提供紧急情况下的降级机制

### 第5步: 性能优化和测试 (优先级: 高)
1. **缓存机制**: 实现模板数据的智能缓存
2. **批量优化**: 优化批量操作的性能
3. **单元测试**: 编写完整的单元测试套件
4. **集成测试**: 测试与现有系统的集成

## 🎉 完成检查清单 (Completion Checklist)

### 基础功能检查
- [ ] AdvancedPromptTemplate接口完整定义并通过类型检查
- [ ] 所有支撑接口(PromptVariable, FewShotExample等)实现完成
- [ ] EnhancedPromptTemplateService基础CRUD操作100%实现
- [ ] 反AI痕迹策略结构正确定义

### 质量保障检查 (基于TOM-109经验)
- [ ] **接口调用验证**: 所有设置管理服务调用方法名和参数正确
- [ ] **类型一致性检查**: TypeScript类型定义与实现完全匹配
- [ ] **边界条件测试**: 测试用例覆盖模板为空、必填字段缺失等边界情况
- [ ] **编译验证**: `npm run build` 无错误无警告

### 数据持久化稳定性
- [ ] 模板数据能够正确保存到Obsidian settings
- [ ] 数据读取和写入操作无错误，性能达标
- [ ] 支持数据备份和恢复，版本控制正常
- [ ] 错误处理和日志记录完善

### 兼容性验证
- [ ] 现有简单模板能够正常加载和使用
- [ ] 数据格式升级无损迁移，回滚机制可用
- [ ] 不影响现有功能的正常运行
- [ ] 降级支持在紧急情况下可用

### 性能和质量验证
- [ ] 模板加载时间<1秒 (大量模板场景)
- [ ] 内存使用合理，无明显泄漏
- [ ] 单元测试覆盖率≥80%
- [ ] 集成测试通过，与现有系统协作正常

### 文档和流程检查
- [ ] Linear任务状态更新 (TOM-117标记完成)
- [ ] 代码审查通过，符合TypeScript标准
- [ ] API文档和使用指南完整
- [ ] 为后续子Task (TOM-118~120) 提供稳定基础

## 🚨 重要注意事项 (Important Notes)

### 技术风险
- **数据结构复杂性风险**: AdvancedPromptTemplate结构复杂，可能影响性能
  - 缓解：采用懒加载、数据分片、智能缓存等优化策略
- **向下兼容风险**: 新旧格式转换可能导致数据丢失
  - 缓解：实现完整的测试覆盖、数据备份、回滚机制

### 最佳实践
- **数据结构设计**: 遵循单一职责原则，接口设计清晰简洁
- **类型安全**: 严格的TypeScript类型定义，避免any类型
- **错误处理**: 分层错误处理，用户友好的错误信息
- **性能优化**: 关键路径优化，避免不必要的计算和IO

### 常见Bug预防 (基于TOM-109经验)
#### 1. 接口依赖错误预防
- ❌ **错误做法**: 假设SettingsManager方法名 `this.settingsManager.save()`
- ✅ **正确做法**: 先搜索接口 `grep_search "class SettingsManager"` 确认实际方法名

#### 2. 类型定义不一致预防
- ❌ **错误做法**: 运行时数据结构与TypeScript接口不匹配
- ✅ **正确做法**: 先定义完整接口，再实现数据处理逻辑，确保一致性

#### 3. 数据迁移错误预防
- ❌ **错误做法**: 直接覆盖现有数据，无备份和验证
- ✅ **正确做法**: 实现完整的备份→迁移→验证→确认流程

#### 4. 性能问题预防
- ❌ **错误做法**: 同步加载大量模板数据，阻塞UI
- ✅ **正确做法**: 异步加载、分页处理、智能缓存

## 📚 与其他子Task的集成规划

### 为TOM-118提供的接口
```typescript
// 质量评估系统需要的模板数据
export interface TemplateQualityContext {
  template: AdvancedPromptTemplate;
  variables: Record<string, any>;
  generatedContent?: string;
}
```

### 为TOM-119提供的基础
```typescript
// 平台特化模板的基础结构
export interface PlatformSpecificTemplate extends AdvancedPromptTemplate {
  platformRules: PlatformRule[];
  adaptationStrategies: AdaptationStrategy[];
}
```

### 为TOM-120提供的数据接口
```typescript
// UI组件需要的模板管理接口
export interface TemplateUIAdapter {
  getTemplatesForUI(): Promise<TemplateCardData[]>;
  validateTemplateForUI(template: Partial<AdvancedPromptTemplate>): ValidationResult;
  getTemplatePreview(template: AdvancedPromptTemplate, variables: Record<string, any>): Promise<string>;
}
```

---

**优先级**: 最高 (基础架构，其他子Task依赖此Task)
**预计完成时间**: 1天
**成功标准**: 所有验收标准达成，为后续子Task提供稳定的基础架构 