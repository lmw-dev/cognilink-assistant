# TOM-108: 内容后处理和格式化 - Cursor AI Prompt

## 🎯 目标 (Objective)
**Linear Issue**: TOM-108 - [Task: TOM-106] 内容后处理和格式化
**父Feature**: TOM-106 社交媒体内容生成
**关键验收标准参考**: AC2 (平台风格符合), AC3 (90%成功率) - 确保生成内容符合平台要求且成功率达到90%以上

**核心指令**: 实现生成内容的后处理和格式化功能，包括长度检查、风格验证、格式优化等，确保内容符合平台要求，提升内容质量和用户满意度。

## 📋 上下文参考 (Context References)

### 主要操作文件
- 后处理器: @src/services/content-post-processor.ts (待创建)
- 风格评估器: @src/services/style-assessor.ts (待创建)
- 格式化器: @src/services/content-formatter.ts (待创建)
- 质量评分器: @src/services/quality-scorer.ts (待创建)
- 类型定义: @src/types/content-processing.ts (待创建)

### 依赖的现有服务
- 平台模板: @src/services/platform-template-manager.ts
- AI服务: @src/services/AIService.ts
- 设置管理: @src/services/SettingsManager.ts
- 日志服务: @src/utils/logger.ts

### 需要遵循的内部规则
- TypeScript标准: @.cursor/rules/typescript-standards.mdc
- 项目通用规范: @.cursor/rules/general.mdc

## 🔧 具体要求与约束 (Requirements & Constraints)

### 技术栈约束
- **语言**: TypeScript (strict mode)
- **设计模式**: Strategy Pattern + Chain of Responsibility
- **处理流程**: 管道式处理，支持插件化扩展
- **错误处理**: 详细的错误信息和恢复机制
- **性能要求**: 处理时间≤5秒，支持批量处理

### 后处理功能详细规范

#### 1. 长度检查和智能截断
```typescript
interface LengthProcessor {
  // 检查内容长度是否符合平台要求
  validateLength(content: string, platform: SocialMediaPlatform): LengthValidationResult;
  
  // 智能截断，保持语义完整性
  smartTruncate(content: string, maxLength: number, options?: TruncateOptions): string;
  
  // 长度优化建议
  suggestLengthOptimization(content: string, platform: SocialMediaPlatform): OptimizationSuggestion[];
}

interface TruncateOptions {
  preserveSentences: boolean;      // 保持句子完整性
  preserveParagraphs: boolean;     // 保持段落完整性
  addEllipsis: boolean;           // 添加省略号
  prioritizeKeywords: string[];    // 优先保留的关键词
}
```

#### 2. 风格评估算法
```typescript
interface StyleAssessor {
  // 评估内容风格符合度
  assessStyle(content: string, platform: SocialMediaPlatform): StyleAssessment;
  
  // 检查必需元素
  checkRequiredElements(content: string, platform: SocialMediaPlatform): ElementCheckResult;
  
  // 风格优化建议
  suggestStyleImprovements(content: string, platform: SocialMediaPlatform): StyleSuggestion[];
}

interface StyleAssessment {
  overallScore: number;           // 总体风格评分 (0-100)
  platformFit: number;           // 平台适配度 (0-100)
  toneConsistency: number;        // 语调一致性 (0-100)
  elementPresence: ElementScore[]; // 必需元素检查
  improvements: string[];         // 改进建议
}
```

#### 3. 格式化处理器
```typescript
interface ContentFormatter {
  // 格式化内容
  formatContent(content: string, platform: SocialMediaPlatform): FormattedContent;
  
  // 应用平台特定格式规则
  applyPlatformRules(content: string, rules: FormatRules): string;
  
  // 清理和标准化
  cleanAndNormalize(content: string): string;
}

interface FormattedContent {
  content: string;
  metadata: FormatMetadata;
  warnings: FormatWarning[];
  suggestions: FormatSuggestion[];
}
```

#### 4. 质量评分机制
```typescript
interface QualityScorer {
  // 计算内容质量评分
  calculateQualityScore(content: string, platform: SocialMediaPlatform): QualityScore;
  
  // 原创性检查
  checkOriginality(content: string): OriginalityResult;
  
  // 可读性评估
  assessReadability(content: string): ReadabilityScore;
  
  // 参与度预测
  predictEngagement(content: string, platform: SocialMediaPlatform): EngagementPrediction;
}

interface QualityScore {
  overall: number;                // 总体质量 (0-100)
  originality: number;           // 原创性 (0-100)
  readability: number;           // 可读性 (0-100)
  engagement: number;            // 预期参与度 (0-100)
  platformOptimization: number;  // 平台优化度 (0-100)
  breakdown: QualityBreakdown;   // 详细评分
}
```

### 平台特定处理规则

#### 1. 小红书后处理规则
```typescript
const xiaohongshuProcessingRules = {
  lengthRules: {
    minLength: 50,
    maxLength: 300,
    optimalLength: 200,
    truncateStrategy: 'preserve_emoji_and_interaction'
  },
  styleRules: {
    requiredElements: ['表情符号', '互动问题', '亲切称呼'],
    emojiDensity: { min: 0.03, max: 0.08 }, // 每100字3-8个表情符号
    interactionRequired: true,
    toneKeywords: ['姐妹们', '宝子们', '绝绝子', 'yyds']
  },
  formatRules: {
    paragraphBreak: '\n\n',
    hashtagFormat: '#话题#',
    emojiPlacement: 'distributed', // 分布式放置
    interactionPlacement: 'end'    // 互动问题放在结尾
  },
  qualityMetrics: {
    engagementFactors: ['表情符号使用', '互动问题', '种草语言'],
    readabilityTarget: 'casual',
    originalityThreshold: 0.8
  }
};
```

#### 2. Twitter后处理规则
```typescript
const twitterProcessingRules = {
  lengthRules: {
    maxLength: 280,
    threadSupport: true,
    threadBreakStrategy: 'sentence_boundary'
  },
  styleRules: {
    requiredElements: ['标签', '互动元素'],
    hashtagCount: { min: 1, max: 3 },
    mentionSupport: true,
    linkHandling: 'preserve_space'
  },
  formatRules: {
    hashtagFormat: '#hashtag',
    mentionFormat: '@username',
    threadNumbering: true,
    lineBreakOptimization: true
  },
  qualityMetrics: {
    engagementFactors: ['标签使用', '互动元素', '简洁性'],
    readabilityTarget: 'concise',
    viralityFactors: ['争议性', '时效性', '实用性']
  }
};
```

#### 3. 微信公众号后处理规则
```typescript
const wechatProcessingRules = {
  lengthRules: {
    minLength: 800,
    maxLength: 1500,
    optimalLength: 1200,
    structureRequired: true
  },
  styleRules: {
    requiredElements: ['小标题', '结构化内容', '总结'],
    headingLevels: { min: 2, max: 4 },
    dataSupport: true,
    professionalTone: true
  },
  formatRules: {
    headingFormat: '## 标题',
    paragraphLength: { min: 100, max: 200 },
    listFormatting: true,
    conclusionRequired: true
  },
  qualityMetrics: {
    engagementFactors: ['深度分析', '数据支撑', '实用价值'],
    readabilityTarget: 'professional',
    authorityFactors: ['专业术语', '数据引用', '逻辑结构']
  }
};
```

#### 4. 个人博客后处理规则
```typescript
const blogProcessingRules = {
  lengthRules: {
    minLength: 1000,
    maxLength: 3000,
    optimalLength: 2000,
    sectionBalance: true
  },
  styleRules: {
    requiredElements: ['目录', '代码示例', '参考资料'],
    tocRequired: true,
    codeBlockSupport: true,
    seoOptimization: true
  },
  formatRules: {
    headingHierarchy: true,
    codeBlockFormat: '```language',
    linkFormatting: '[text](url)',
    imageSupport: true
  },
  qualityMetrics: {
    engagementFactors: ['技术深度', '实用性', 'SEO优化'],
    readabilityTarget: 'technical',
    seoFactors: ['关键词密度', '标题结构', '内链外链']
  }
};
```

#### 5. 头条号后处理规则
```typescript
const toutiaoProcessingRules = {
  lengthRules: {
    minLength: 1000,
    maxLength: 2000,
    optimalLength: 1500,
    titleOptimization: true
  },
  styleRules: {
    requiredElements: ['吸引标题', '争议观点', '热点话题', '讨论引导'],
    controversialContent: true,
    clickbaitLevel: { min: 0.6, max: 0.9 }, // 标题党程度控制
    popularLanguage: true,
    toneKeywords: ['震惊', '揭秘', '真相', '内幕', '爆料', '反转']
  },
  formatRules: {
    titleStyle: '震惊！揭秘！真相！',
    paragraphLength: { min: 80, max: 150 },
    controversialPlacement: 'throughout', // 争议内容分布
    discussionPrompt: true
  },
  qualityMetrics: {
    engagementFactors: ['争议性', '热点话题', '标题吸引力', '讨论引导'],
    readabilityTarget: 'popular',
    viralityFactors: ['情绪激发', '观点冲突', '社会热点']
  }
};
```

### 错误处理和重试机制

#### 1. 错误分类和处理
```typescript
interface ProcessingError {
  type: 'length' | 'style' | 'format' | 'quality';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  suggestion: string;
  recoverable: boolean;
}

interface ErrorHandler {
  handleLengthError(error: LengthError): ProcessingResult;
  handleStyleError(error: StyleError): ProcessingResult;
  handleFormatError(error: FormatError): ProcessingResult;
  handleQualityError(error: QualityError): ProcessingResult;
}
```

#### 2. 重试策略
```typescript
interface RetryStrategy {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
  
  shouldRetry(error: ProcessingError, attempt: number): boolean;
  getRetryDelay(attempt: number): number;
}
```

## 📝 期望输出结构 (Expected Output Structure)

### 1. 核心后处理器类
```typescript
// src/services/content-post-processor.ts
export class ContentPostProcessor {
  private lengthProcessor: LengthProcessor;
  private styleAssessor: StyleAssessor;
  private formatter: ContentFormatter;
  private qualityScorer: QualityScorer;
  private errorHandler: ErrorHandler;

  constructor() {
    this.lengthProcessor = new LengthProcessor();
    this.styleAssessor = new StyleAssessor();
    this.formatter = new ContentFormatter();
    this.qualityScorer = new QualityScorer();
    this.errorHandler = new ErrorHandler();
  }

  async processContent(
    content: string,
    platform: SocialMediaPlatform,
    options?: ProcessingOptions
  ): Promise<ProcessedContent> {
    // 实现完整的后处理流程
  }

  async batchProcess(
    contents: ContentInput[],
    options?: BatchProcessingOptions
  ): Promise<BatchProcessingResult> {
    // 实现批量处理
  }

  validateContent(
    content: string,
    platform: SocialMediaPlatform
  ): ValidationResult {
    // 实现内容验证
  }
}
```

### 2. 处理结果接口
```typescript
// src/types/content-processing.ts
export interface ProcessedContent {
  originalContent: string;
  processedContent: string;
  platform: SocialMediaPlatform;
  
  // 处理结果
  lengthValidation: LengthValidationResult;
  styleAssessment: StyleAssessment;
  formatResult: FormatResult;
  qualityScore: QualityScore;
  
  // 元数据
  processingTime: number;
  processingSteps: ProcessingStep[];
  warnings: ProcessingWarning[];
  suggestions: ProcessingSuggestion[];
  
  // 状态
  isValid: boolean;
  needsReview: boolean;
  confidence: number;
}

export interface ProcessingOptions {
  strictMode: boolean;
  autoFix: boolean;
  preserveOriginal: boolean;
  customRules?: CustomProcessingRules;
}
```

### 3. 长度处理器实现
```typescript
// src/services/length-processor.ts
export class LengthProcessor {
  validateLength(
    content: string, 
    platform: SocialMediaPlatform
  ): LengthValidationResult {
    // 实现长度验证逻辑
  }

  smartTruncate(
    content: string, 
    maxLength: number, 
    options?: TruncateOptions
  ): string {
    // 实现智能截断逻辑
  }

  private findOptimalBreakPoint(content: string, maxLength: number): number {
    // 寻找最佳截断点
  }

  private preserveImportantElements(content: string, elements: string[]): string {
    // 保留重要元素
  }
}
```

### 4. 风格评估器实现
```typescript
// src/services/style-assessor.ts
export class StyleAssessor {
  assessStyle(
    content: string, 
    platform: SocialMediaPlatform
  ): StyleAssessment {
    // 实现风格评估逻辑
  }

  private checkToneConsistency(content: string, platform: SocialMediaPlatform): number {
    // 检查语调一致性
  }

  private analyzeKeywordUsage(content: string, keywords: string[]): KeywordAnalysis {
    // 分析关键词使用
  }

  private detectRequiredElements(content: string, elements: string[]): ElementDetection {
    // 检测必需元素
  }
}
```

## 🧪 测试策略 (Testing Strategy)

### 单元测试要求
```typescript
// src/tests/content-post-processor.test.ts
describe('ContentPostProcessor', () => {
  describe('Length Processing', () => {
    test('should validate content length correctly', () => {
      // 测试长度验证
    });

    test('should truncate content intelligently', () => {
      // 测试智能截断
    });

    test('should preserve important elements during truncation', () => {
      // 测试元素保留
    });
  });

  describe('Style Assessment', () => {
    test('should assess platform style correctly', () => {
      // 测试风格评估
    });

    test('should detect required elements', () => {
      // 测试元素检测
    });

    test('should provide style improvement suggestions', () => {
      // 测试改进建议
    });
  });

  describe('Format Processing', () => {
    test('should format content according to platform rules', () => {
      // 测试格式化
    });

    test('should handle special characters correctly', () => {
      // 测试特殊字符处理
    });
  });

  describe('Quality Scoring', () => {
    test('should calculate quality score accurately', () => {
      // 测试质量评分
    });

    test('should assess originality correctly', () => {
      // 测试原创性检查
    });
  });
});
```

### 集成测试要求
- **端到端处理流程**: 测试完整的后处理流程
- **平台特定规则**: 测试各平台的特定处理规则
- **错误处理**: 测试各种错误情况的处理
- **性能测试**: 测试大量内容的处理性能

### 性能基准测试
```typescript
// src/tests/performance/post-processor.perf.test.ts
describe('ContentPostProcessor Performance', () => {
  test('should process single content within 5 seconds', () => {
    // 测试单个内容处理性能
  });

  test('should handle batch processing efficiently', () => {
    // 测试批量处理性能
  });

  test('should maintain memory usage under limits', () => {
    // 测试内存使用
  });
});
```

## 🔄 实现步骤 (Implementation Steps)

### 第1步: 类型定义和接口设计 (优先级: 最高)
1. 创建 `src/types/content-processing.ts`
2. 定义所有后处理相关的TypeScript接口
3. 设计处理结果和错误类型
4. 添加配置和选项类型

### 第2步: 长度处理器实现 (优先级: 高)
1. 创建 `src/services/length-processor.ts`
2. 实现长度验证和智能截断
3. 添加平台特定的长度规则
4. 实现长度优化建议功能

### 第3步: 风格评估器实现 (优先级: 高)
1. 创建 `src/services/style-assessor.ts`
2. 实现风格评估算法
3. 添加必需元素检测
4. 实现风格改进建议

### 第4步: 格式化器实现 (优先级: 高)
1. 创建 `src/services/content-formatter.ts`
2. 实现平台特定格式化
3. 添加清理和标准化功能
4. 实现格式验证

### 第5步: 质量评分器实现 (优先级: 高)
1. 创建 `src/services/quality-scorer.ts`
2. 实现质量评分算法
3. 添加原创性检查
4. 实现可读性和参与度评估

### 第6步: 核心后处理器集成 (优先级: 最高)
1. 创建 `src/services/content-post-processor.ts`
2. 集成所有处理组件
3. 实现处理流程管道
4. 添加错误处理和重试机制

### 第7步: 测试和验证 (优先级: 高)
1. 编写完整的单元测试
2. 实现集成测试
3. 性能基准测试
4. 质量验证测试

## 🚨 重要注意事项 (Important Notes)

### 处理质量要求
- **准确性**: 长度检查准确率100%，风格评估准确率≥85%
- **一致性**: 相同输入应产生一致的处理结果
- **可靠性**: 处理成功率≥95%，错误恢复率≥90%
- **性能**: 单个内容处理时间≤5秒，批量处理支持并发

### 用户体验要求
- **透明性**: 提供详细的处理结果和改进建议
- **可控性**: 支持用户自定义处理规则和选项
- **反馈性**: 提供实时的处理状态和进度反馈
- **学习性**: 根据用户反馈优化处理算法

### 扩展性要求
- **插件化**: 支持自定义处理器插件
- **配置化**: 支持动态配置处理规则
- **平台扩展**: 便于添加新平台的处理规则
- **算法升级**: 支持处理算法的在线升级

## 🎉 完成检查清单 (Completion Checklist)

- [ ] 所有TypeScript接口和类型定义完成
- [ ] 长度处理器实现并测试通过
- [ ] 风格评估器实现并测试通过
- [ ] 格式化器实现并测试通过
- [ ] 质量评分器实现并测试通过
- [ ] 核心后处理器集成完成
- [ ] 错误处理和重试机制完善
- [ ] 单元测试覆盖率达到90%以上
- [ ] 集成测试通过
- [ ] 性能基准测试达标(5秒内处理)
- [ ] 四个平台的处理规则验证通过
- [ ] 批量处理功能测试通过
- [ ] 文档和注释完整
- [ ] 代码审查通过

---

**使用说明**: 
1. 重点关注处理质量和用户体验
2. 确保各平台处理规则的准确性
3. 实现完善的错误处理和恢复机制
4. 进行充分的测试验证，特别是边界情况 