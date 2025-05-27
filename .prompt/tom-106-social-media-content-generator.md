# TOM-106: 社交媒体内容生成核心功能开发 - Cursor AI Prompt

## 🎯 目标 (Objective)
**Linear Issue**: TOM-106 - [Feature] 社交媒体内容生成 - 平台特定内容创作
**关键验收标准参考**: AC1 (四平台支持), AC2 (平台风格符合), AC3 (90%成功率), AC4 (30秒内生成), AC5 (4.0/5.0满意度)

**核心指令**: 实现完整的社交媒体内容生成系统，包括平台特定提示模板系统(TOM-107)和内容后处理格式化(TOM-108)，支持小红书、Twitter、微信公众号、个人博客四个平台的高质量内容生成。

## 📋 上下文参考 (Context References)

### 主要操作文件
- 核心服务: @src/services/social-media-content-generator.ts (待创建)
- 模板系统: @src/services/platform-template-manager.ts (待创建)
- 后处理模块: @src/services/content-post-processor.ts (待创建)
- 类型定义: @src/types/social-media.ts (待创建)

### 依赖的现有服务
- RAG检索: @src/services/embedding-service.ts
- AI服务: @src/services/ai-service.ts
- 配置管理: @src/services/config-service.ts
- 错误处理: @src/types/errors.ts

### 需要遵循的内部规则
- TypeScript标准: @.cursor/rules/typescript-standards.mdc
- 项目通用规范: @.cursor/rules/general.mdc
- 任务完成流程: @.cursor/rules/task-workflow.mdc

## 🔧 具体要求与约束 (Requirements & Constraints)

### 技术栈约束
- **语言**: TypeScript (strict mode)
- **架构模式**: Service Layer + Repository Pattern
- **错误处理**: 统一的错误处理机制，继承现有Error类
- **配置管理**: 扩展现有ConfigService
- **测试要求**: 单元测试覆盖率80%以上

### 平台特定要求
1. **小红书 (Xiaohongshu)**
   - 长度: 300字左右
   - 风格: 种草笔记，表情符号丰富，"姐妹们"等流行用语
   - 特征: 视觉描述，互动问题，购买建议

2. **Twitter**
   - 长度: 280字符限制
   - 风格: 简洁有力，推文串支持
   - 特征: 标签使用，互动问题，转发友好

3. **微信公众号 (WeChat)**
   - 长度: 800-1500字
   - 风格: 深度文章，结构化内容
   - 特征: 专业性强，逻辑清晰，引用数据

4. **个人博客 (Personal Blog)**
   - 长度: 1000-3000字
   - 风格: 技术文档格式
   - 特征: SEO优化，代码示例，详细说明

5. **头条号 (Toutiao)**
   - 长度: 1000-2000字
   - 风格: 热点文章，吸引眼球，通俗易懂
   - 特征: 争议观点，讨论引导，网络流行语

### 性能要求
- **生成时间**: ≤30秒
- **成功率**: ≥90%
- **并发支持**: 支持多个平台同时生成
- **内存使用**: 优化内存占用，避免内存泄漏

### 质量标准
- **内容原创性**: 基于用户笔记生成，避免模板化
- **平台适配度**: 符合各平台的风格特征
- **用户满意度**: 目标4.0/5.0以上
- **错误处理**: 完善的错误处理和用户反馈

## 📝 期望输出结构 (Expected Output Structure)

### 1. 核心服务类 (SocialMediaContentGenerator)
```typescript
export class SocialMediaContentGenerator {
  constructor(
    private aiService: AIService,
    private embeddingService: EmbeddingService,
    private templateManager: PlatformTemplateManager,
    private postProcessor: ContentPostProcessor
  ) {}

  async generateContent(
    topic: string,
    platform: SocialMediaPlatform,
    options?: ContentGenerationOptions
  ): Promise<GeneratedContent> {
    // 实现内容生成逻辑
  }

  async generateMultiPlatform(
    topic: string,
    platforms: SocialMediaPlatform[],
    options?: ContentGenerationOptions
  ): Promise<MultiPlatformContent> {
    // 实现多平台批量生成
  }
}
```

### 2. 平台模板管理器 (PlatformTemplateManager)
```typescript
export class PlatformTemplateManager {
  private templates: Map<SocialMediaPlatform, PlatformTemplate>;

  getTemplate(platform: SocialMediaPlatform): PlatformTemplate {
    // 获取平台特定模板
  }

  validateTemplate(template: PlatformTemplate): boolean {
    // 验证模板有效性
  }
}
```

### 3. 内容后处理器 (ContentPostProcessor)
```typescript
export class ContentPostProcessor {
  async processContent(
    content: string,
    platform: SocialMediaPlatform
  ): Promise<ProcessedContent> {
    // 实现内容后处理逻辑
  }

  validateLength(content: string, platform: SocialMediaPlatform): boolean {
    // 长度验证
  }

  assessStyle(content: string, platform: SocialMediaPlatform): StyleAssessment {
    // 风格评估
  }
}
```

### 4. 类型定义 (TypeScript Interfaces)
```typescript
export interface SocialMediaPlatform {
  id: 'xiaohongshu' | 'twitter' | 'wechat' | 'blog' | 'toutiao';
  name: string;
  maxLength: number;
  styleKeywords: string[];
}

export interface GeneratedContent {
  platform: SocialMediaPlatform;
  content: string;
  metadata: ContentMetadata;
  qualityScore: number;
}

export interface PlatformTemplate {
  systemPrompt: string;
  userTemplate: string;
  styleGuide: StyleGuide;
  postProcessingRules: PostProcessingRule[];
}
```

## 🧪 测试策略 (Testing Strategy)

### 单元测试要求
- **SocialMediaContentGenerator**: 测试各平台内容生成逻辑
- **PlatformTemplateManager**: 测试模板加载、验证、获取
- **ContentPostProcessor**: 测试后处理、验证、评估功能
- **错误处理**: 测试各种异常情况的处理

### 集成测试要求
- **端到端内容生成**: 从输入主题到输出内容的完整流程
- **多平台批量生成**: 测试并发生成的正确性和性能
- **与现有服务集成**: 测试与RAG、AI服务的集成

### 性能测试要求
- **生成时间基准**: 确保30秒内完成生成
- **并发性能**: 测试多用户同时使用的性能
- **内存使用**: 监控内存使用情况，防止内存泄漏

## 🔄 实现步骤 (Implementation Steps)

### 第1步: 类型定义和接口设计 (TOM-107前置)
1. 创建 `src/types/social-media.ts`
2. 定义所有必要的TypeScript接口
3. 设计平台配置结构
4. 添加错误类型定义

### 第2步: 平台模板系统实现 (TOM-107核心)
1. 创建 `src/services/platform-template-manager.ts`
2. 实现四个平台的提示模板
3. 添加模板验证和加载机制
4. 实现模板参数化功能

### 第3步: 内容后处理模块 (TOM-108核心)
1. 创建 `src/services/content-post-processor.ts`
2. 实现长度检查和智能截断
3. 实现风格评估算法
4. 添加格式化处理功能

### 第4步: 核心生成器实现 (TOM-106集成)
1. 创建 `src/services/social-media-content-generator.ts`
2. 集成模板系统和后处理模块
3. 实现单平台和多平台生成
4. 添加错误处理和重试机制

### 第5步: 测试和验证
1. 编写完整的单元测试
2. 实现集成测试
3. 性能基准测试
4. 用户验收测试

## 🚨 重要注意事项 (Important Notes)

### 错误处理要求
- 所有异步操作必须有适当的错误处理
- 使用统一的错误类型和错误消息
- 提供用户友好的错误反馈
- 实现重试机制处理临时性错误

### 性能优化要求
- 使用缓存机制避免重复计算
- 实现并发控制避免资源竞争
- 优化AI服务调用，减少不必要的请求
- 监控和记录性能指标

### 配置管理要求
- 扩展现有ConfigService支持社交媒体配置
- 支持用户自定义模板和参数
- 提供默认配置和配置验证
- 支持配置的热更新

### 文档要求
- 为每个公共方法添加详细的JSDoc注释
- 创建使用示例和最佳实践文档
- 更新项目README和开发文档
- 记录重要的技术决策和权衡

## 🎉 完成检查清单 (Completion Checklist)

- [ ] 所有TypeScript接口和类型定义完成
- [ ] 四个平台的提示模板系统实现
- [ ] 内容后处理和格式化功能完成
- [ ] 核心内容生成器集成完成
- [ ] 单元测试覆盖率达到80%以上
- [ ] 集成测试通过
- [ ] 性能基准测试达标(30秒内生成)
- [ ] 错误处理机制完善
- [ ] 文档和注释完整
- [ ] 代码审查通过
- [ ] 部署到测试环境验证
- [ ] Linear任务状态更新和评论添加
- [ ] 开发记录文档更新

---

**使用说明**: 
1. 在开始实现前，请仔细阅读所有要求和约束
2. 按照实现步骤逐步进行，确保每一步都经过测试验证
3. 遇到问题时，参考现有的服务实现和项目规范
4. 完成后按照task-workflow规则进行完整的验收流程 