# TOM-107: 平台特定提示模板系统 - Cursor AI Prompt

## 🎯 目标 (Objective)
**Linear Issue**: TOM-107 - [Task: TOM-106] 平台特定提示模板系统
**父Feature**: TOM-106 社交媒体内容生成
**关键验收标准参考**: 完成四个平台的提示模板设计，模板系统支持参数化配置，生成内容符合各平台风格要求

**核心指令**: 设计和实现平台特定的提示模板系统，为小红书、Twitter、微信公众号、个人博客等平台定制专门的内容生成模板，确保生成内容符合各平台的风格特征和用户习惯。

## 📋 上下文参考 (Context References)

### 主要操作文件
- 模板管理器: @src/services/platform-template-manager.ts (待创建)
- 类型定义: @src/types/social-media.ts (待创建)
- 模板配置: @src/config/platform-templates.ts (待创建)
- 模板测试: @src/tests/platform-template-manager.test.ts (待创建)

### 依赖的现有服务
- AI服务: @src/services/AIService.ts
- 设置管理: @src/services/SettingsManager.ts
- 日志服务: @src/utils/logger.ts
- 提示模板服务: @src/services/PromptTemplateService.ts

### 需要遵循的内部规则
- TypeScript标准: @.cursor/rules/typescript-standards.mdc
- 项目通用规范: @.cursor/rules/general.mdc

## 🔧 具体要求与约束 (Requirements & Constraints)

### 技术栈约束
- **语言**: TypeScript (strict mode)
- **设计模式**: Template Method Pattern + Strategy Pattern
- **配置格式**: JSON/TypeScript配置对象
- **验证机制**: 模板有效性验证和错误处理
- **扩展性**: 支持新平台的轻松添加

### 平台模板详细规范

#### 1. 小红书 (Xiaohongshu) 模板
```typescript
const xiaohongshuTemplate = {
  id: 'xiaohongshu',
  name: '小红书',
  maxLength: 300,
  systemPrompt: `你是一个专业的小红书内容创作者，擅长写种草笔记。
特点：
- 使用"姐妹们"、"宝子们"等亲切称呼
- 大量使用表情符号 (🔥💕✨🌟💯)
- 突出产品优点和使用体验
- 包含互动问题引导评论
- 语言活泼有趣，贴近年轻用户`,
  userTemplate: `基于以下内容创作一篇小红书种草笔记：

主题：{topic}
相关内容：{context}

要求：
1. 300字左右，语言活泼有趣
2. 使用大量表情符号
3. 包含"姐妹们"等亲切称呼
4. 突出亮点和使用体验
5. 结尾包含互动问题
6. 适当使用小红书流行用语`,
  styleKeywords: ['姐妹们', '宝子们', '绝绝子', 'yyds', '种草', '拔草', '好用到哭'],
  requiredElements: ['表情符号', '互动问题', '亲切称呼', '使用体验'],
  formatRules: {
    paragraphBreak: '\n\n',
    emojiDensity: 'high', // 每20-30字一个表情符号
    hashtagStyle: '#话题#',
    interactionPrompt: true
  }
};
```

#### 2. Twitter 模板
```typescript
const twitterTemplate = {
  id: 'twitter',
  name: 'Twitter',
  maxLength: 280,
  systemPrompt: `你是一个专业的Twitter内容创作者，擅长写简洁有力的推文。
特点：
- 字符限制280字符，简洁明了
- 使用相关标签 (#hashtag)
- 包含行动号召 (CTA)
- 适合转发和互动
- 语言简练，观点鲜明`,
  userTemplate: `基于以下内容创作一条Twitter推文：

主题：{topic}
相关内容：{context}

要求：
1. 严格控制在280字符以内
2. 包含2-3个相关标签
3. 语言简洁有力
4. 包含互动元素（问题/投票/转发请求）
5. 适合国际化受众
6. 如果内容较长，设计为推文串`,
  styleKeywords: ['thread', 'thoughts', 'insights', 'tips', 'breaking'],
  requiredElements: ['标签', '互动元素', '简洁表达'],
  formatRules: {
    characterLimit: 280,
    hashtagCount: '2-3',
    threadSupport: true,
    mentionStyle: '@username'
  }
};
```

#### 3. 微信公众号 (WeChat) 模板
```typescript
const wechatTemplate = {
  id: 'wechat',
  name: '微信公众号',
  maxLength: 1500,
  systemPrompt: `你是一个专业的微信公众号内容创作者，擅长写深度文章。
特点：
- 结构化内容，逻辑清晰
- 专业性强，有深度
- 适合中文读者习惯
- 包含数据和案例支撑
- 语言正式但不失亲和力`,
  userTemplate: `基于以下内容创作一篇微信公众号文章：

主题：{topic}
相关内容：{context}

要求：
1. 800-1500字，结构清晰
2. 包含引言、正文、总结
3. 使用小标题分段
4. 引用相关数据或案例
5. 语言专业但易懂
6. 结尾包含思考问题或行动建议`,
  styleKeywords: ['深度', '洞察', '分析', '思考', '实践', '经验'],
  requiredElements: ['小标题', '结构化内容', '数据支撑', '总结'],
  formatRules: {
    headingStyle: '## 小标题',
    paragraphLength: '100-200字',
    dataSupport: true,
    conclusionRequired: true
  }
};
```

#### 4. 个人博客 (Personal Blog) 模板
```typescript
const blogTemplate = {
  id: 'blog',
  name: '个人博客',
  maxLength: 3000,
  systemPrompt: `你是一个专业的技术博客作者，擅长写技术文档和深度分析。
特点：
- 技术文档格式，详细全面
- 包含代码示例和实践指导
- SEO友好的结构
- 适合技术人员阅读
- 注重实用性和可操作性`,
  userTemplate: `基于以下内容创作一篇技术博客文章：

主题：{topic}
相关内容：{context}

要求：
1. 1000-3000字，技术文档格式
2. 包含目录、正文、总结、参考资料
3. 适当包含代码示例
4. SEO优化的标题和结构
5. 详细的实践指导
6. 专业术语解释清楚`,
  styleKeywords: ['技术', '实践', '指南', '教程', '最佳实践', '深入'],
  requiredElements: ['目录', '代码示例', '实践指导', '参考资料'],
  formatRules: {
    tocRequired: true,
    codeBlockSupport: true,
    seoOptimized: true,
    referenceSection: true
  }
};
```

#### 5. 头条号 (Toutiao) 模板
```typescript
const toutiaoTemplate = {
  id: 'toutiao',
  name: '头条号',
  maxLength: 2000,
  systemPrompt: `你是一个专业的头条号内容创作者，擅长写吸引眼球的热点文章。
特点：
- 标题党风格，吸引点击
- 内容通俗易懂，贴近大众
- 热点话题敏感度高
- 包含争议性观点引发讨论
- 语言生动有趣，接地气`,
  userTemplate: `基于以下内容创作一篇头条号文章：

主题：{topic}
相关内容：{context}

要求：
1. 1000-2000字，通俗易懂
2. 标题要有吸引力和争议性
3. 开头要抓住读者注意力
4. 内容要有观点冲突或反转
5. 结尾要引发思考和讨论
6. 适当使用网络流行语`,
  styleKeywords: ['震惊', '揭秘', '真相', '内幕', '爆料', '反转', '热议'],
  requiredElements: ['吸引标题', '争议观点', '热点话题', '讨论引导'],
  formatRules: {
    titleStyle: '震惊！揭秘！真相！',
    paragraphLength: '80-150字',
    controversialContent: true,
    discussionPrompt: true
  }
};
```

### 模板系统架构要求

#### 1. 模板管理器接口
```typescript
export interface PlatformTemplateManager {
  // 获取平台模板
  getTemplate(platformId: string): PlatformTemplate;
  
  // 获取所有支持的平台
  getSupportedPlatforms(): SocialMediaPlatform[];
  
  // 验证模板有效性
  validateTemplate(template: PlatformTemplate): ValidationResult;
  
  // 渲染模板（填充参数）
  renderTemplate(
    template: PlatformTemplate, 
    context: TemplateContext
  ): RenderedTemplate;
  
  // 动态加载模板
  loadTemplate(platformId: string): Promise<PlatformTemplate>;
  
  // 更新模板
  updateTemplate(platformId: string, template: PlatformTemplate): void;
}
```

#### 2. 模板验证规则
```typescript
export interface TemplateValidationRules {
  // 必需字段检查
  requiredFields: string[];
  
  // 长度限制检查
  lengthConstraints: {
    systemPrompt: { min: number; max: number };
    userTemplate: { min: number; max: number };
  };
  
  // 格式规则检查
  formatValidation: {
    placeholderPattern: RegExp;
    styleKeywordCount: { min: number; max: number };
  };
  
  // 平台特定验证
  platformSpecificRules: Record<string, any>;
}
```

### 性能要求
- **模板加载时间**: ≤100ms
- **模板渲染时间**: ≤50ms
- **内存使用**: 模板缓存不超过10MB
- **并发支持**: 支持多个模板同时渲染

### 扩展性要求
- **新平台添加**: 通过配置文件轻松添加新平台
- **模板自定义**: 支持用户自定义模板参数
- **版本管理**: 支持模板版本控制和回滚
- **A/B测试**: 支持多个模板版本的A/B测试

## 📝 期望输出结构 (Expected Output Structure)

### 1. 核心类型定义
```typescript
// src/types/social-media.ts
export interface SocialMediaPlatform {
  id: 'xiaohongshu' | 'twitter' | 'wechat' | 'blog' | 'toutiao';
  name: string;
  maxLength: number;
  styleKeywords: string[];
  requiredElements: string[];
  formatRules: FormatRules;
}

export interface PlatformTemplate {
  id: string;
  name: string;
  maxLength: number;
  systemPrompt: string;
  userTemplate: string;
  styleKeywords: string[];
  requiredElements: string[];
  formatRules: FormatRules;
  validationRules?: TemplateValidationRules;
}

export interface TemplateContext {
  topic: string;
  context: string;
  userPreferences?: UserPreferences;
  additionalParams?: Record<string, any>;
}

export interface RenderedTemplate {
  systemPrompt: string;
  userPrompt: string;
  metadata: TemplateMetadata;
}
```

### 2. 平台模板管理器实现
```typescript
// src/services/platform-template-manager.ts
export class PlatformTemplateManager {
  private templates: Map<string, PlatformTemplate>;
  private validator: TemplateValidator;
  private renderer: TemplateRenderer;

  constructor() {
    this.templates = new Map();
    this.validator = new TemplateValidator();
    this.renderer = new TemplateRenderer();
    this.loadDefaultTemplates();
  }

  getTemplate(platformId: string): PlatformTemplate {
    // 实现模板获取逻辑
  }

  validateTemplate(template: PlatformTemplate): ValidationResult {
    // 实现模板验证逻辑
  }

  renderTemplate(
    template: PlatformTemplate, 
    context: TemplateContext
  ): RenderedTemplate {
    // 实现模板渲染逻辑
  }

  private loadDefaultTemplates(): void {
    // 加载默认平台模板
  }
}
```

### 3. 模板验证器
```typescript
// src/services/template-validator.ts
export class TemplateValidator {
  validate(template: PlatformTemplate): ValidationResult {
    // 实现完整的模板验证逻辑
  }

  private validateRequiredFields(template: PlatformTemplate): boolean {
    // 验证必需字段
  }

  private validateLengthConstraints(template: PlatformTemplate): boolean {
    // 验证长度约束
  }

  private validateFormatRules(template: PlatformTemplate): boolean {
    // 验证格式规则
  }
}
```

### 4. 模板渲染器
```typescript
// src/services/template-renderer.ts
export class TemplateRenderer {
  render(template: PlatformTemplate, context: TemplateContext): RenderedTemplate {
    // 实现模板渲染逻辑
  }

  private replacePlaceholders(template: string, context: TemplateContext): string {
    // 替换模板占位符
  }

  private applyFormatRules(content: string, rules: FormatRules): string {
    // 应用格式规则
  }
}
```

## 🧪 测试策略 (Testing Strategy)

### 单元测试要求
```typescript
// src/tests/platform-template-manager.test.ts
describe('PlatformTemplateManager', () => {
  test('should load all default templates', () => {
    // 测试默认模板加载
  });

  test('should validate template correctly', () => {
    // 测试模板验证
  });

  test('should render template with context', () => {
    // 测试模板渲染
  });

  test('should handle invalid platform id', () => {
    // 测试错误处理
  });
});
```

### 集成测试要求
- **模板与AI服务集成**: 测试渲染后的模板在AI服务中的使用
- **配置系统集成**: 测试模板配置的加载和更新
- **错误处理集成**: 测试各种异常情况的处理

### 性能测试要求
- **模板加载性能**: 测试大量模板的加载时间
- **渲染性能**: 测试模板渲染的响应时间
- **内存使用**: 监控模板缓存的内存占用

## 🔄 实现步骤 (Implementation Steps)

### 第1步: 类型定义 (优先级: 最高)
1. 创建 `src/types/social-media.ts`
2. 定义所有模板相关的TypeScript接口
3. 设计平台配置结构
4. 添加验证和渲染相关类型

### 第2步: 默认模板配置 (优先级: 高)
1. 创建 `src/config/platform-templates.ts`
2. 实现四个平台的详细模板配置
3. 添加模板元数据和验证规则
4. 确保模板质量和一致性

### 第3步: 模板验证器 (优先级: 高)
1. 创建 `src/services/template-validator.ts`
2. 实现完整的模板验证逻辑
3. 添加平台特定的验证规则
4. 提供详细的验证错误信息

### 第4步: 模板渲染器 (优先级: 高)
1. 创建 `src/services/template-renderer.ts`
2. 实现模板占位符替换
3. 添加格式规则应用逻辑
4. 支持动态参数注入

### 第5步: 平台模板管理器 (优先级: 最高)
1. 创建 `src/services/platform-template-manager.ts`
2. 集成验证器和渲染器
3. 实现模板缓存和管理
4. 添加错误处理和日志记录

### 第6步: 测试和验证 (优先级: 高)
1. 编写完整的单元测试
2. 实现集成测试
3. 性能基准测试
4. 模板质量验证

## 🚨 重要注意事项 (Important Notes)

### 模板设计原则
- **平台特异性**: 每个模板必须体现平台独特的风格特征
- **用户体验**: 生成的内容应符合平台用户的阅读习惯
- **可扩展性**: 模板设计应便于后续添加新平台
- **一致性**: 所有模板应遵循统一的设计模式

### 质量控制要求
- **内容质量**: 模板应能生成高质量、有价值的内容
- **风格一致性**: 生成内容应符合平台风格要求
- **长度控制**: 严格遵守各平台的长度限制
- **格式规范**: 确保生成内容的格式正确

### 性能优化要求
- **模板缓存**: 使用内存缓存提高模板访问速度
- **懒加载**: 按需加载模板，减少初始化时间
- **批量处理**: 支持批量模板渲染操作
- **资源管理**: 合理管理内存使用，避免内存泄漏

## 🎉 完成检查清单 (Completion Checklist)

- [ ] 所有TypeScript接口和类型定义完成
- [ ] 四个平台的详细模板配置完成
- [ ] 模板验证器实现并测试通过
- [ ] 模板渲染器实现并测试通过
- [ ] 平台模板管理器集成完成
- [ ] 单元测试覆盖率达到100%
- [ ] 集成测试通过
- [ ] 性能基准测试达标
- [ ] 模板质量验证通过
- [ ] 错误处理机制完善
- [ ] 文档和注释完整
- [ ] 代码审查通过

---

**使用说明**: 
1. 严格按照平台特定要求设计模板
2. 确保模板的可扩展性和维护性
3. 重点关注模板质量和用户体验
4. 完成后进行全面的测试验证 