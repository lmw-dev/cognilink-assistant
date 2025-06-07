/**
 * TOM-117: 核心模板管理系统 - 高级类型定义
 * 分层Prompt架构和反AI检测策略相关类型
 */

import { SocialMediaPlatform, PlatformId } from './social-media';
export type { PlatformId } from './social-media';

// 提示词分类类型
export type PromptCategory = 
  | 'product-review'      // 产品测评
  | 'opinion-sharing'     // 观点分享
  | 'analytical-article'  // 分析文章
  | 'tutorial-guide'      // 教程指南
  | 'personal-story'      // 个人故事
  | 'news-commentary'     // 新闻评论
  | 'lifestyle-sharing'   // 生活分享
  | 'technical-blog'      // 技术博客
  | 'marketing-copy'      // 营销文案
  | 'social-media-post'   // 社媒动态
  | 'custom';             // 自定义类型

// 变量验证规则
export interface VariableValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: string[];
  required?: boolean;
  defaultValue?: any;
}

// 可替换变量定义
export interface PromptVariable {
  name: string;                        // 变量名称
  type: 'string' | 'number' | 'boolean' | 'array'; // 变量类型
  defaultValue?: any;                  // 默认值
  description?: string;                // 变量描述
  required: boolean;                   // 是否必需
  validation?: VariableValidation;     // 验证规则
}

// 示例对话和输出
export interface FewShotExample {
  id: string;                          // 示例ID
  input: Record<string, any>;          // 输入变量
  expectedOutput: string;              // 期望输出
  explanation?: string;                // 示例说明
  weight: number;                      // 示例权重，影响学习效果 (0-1)
}

// 规则条件定义
export interface RuleCondition {
  type: 'contains' | 'length' | 'pattern' | 'count' | 'custom';
  value?: any;                         // 条件值
  contains?: string[];                 // 包含的关键词
  minLength?: number;                  // 最小长度
  maxLength?: number;                  // 最大长度
  pattern?: RegExp;                    // 正则模式
  minCount?: number;                   // 最小数量
  maxCount?: number;                   // 最大数量
  customValidator?: (content: string) => boolean; // 自定义验证函数
}

// 质量检查规则
export interface QualityRule {
  id: string;                          // 规则ID
  name: string;                        // 规则名称
  type: 'length' | 'tone' | 'format' | 'keyword' | 'custom'; // 规则类型
  condition: RuleCondition;            // 规则条件
  weight: number;                      // 规则权重 (0-1)
  enabled: boolean;                    // 是否启用
}

// 语言自然化设置
export interface LanguageNaturalizationSettings {
  enabled: boolean;                    // 是否启用
  sentenceVariation: {                 // 句式变化配置
    enabled: boolean;
    level: number;                     // 变化程度 (0-1)
    patterns: string[];                // 变化模式
  };
  colloquialLevel: {                   // 口语化配置
    enabled: boolean;
    intensity: number;                 // 口语化强度 (0-1)
    targetExpressions: string[];       // 目标表达方式
  };
  emotionalNuance: {                   // 情感细腻化配置
    enabled: boolean;
    depth: number;                     // 情感深度 (0-1)
    emotionalMarkers: string[];        // 情感标记词
  };
}

// 个性化注入设置
export interface PersonalizationSettings {
  enabled: boolean;                    // 是否启用
  userStyleMimicry: {                  // 用户风格模仿配置
    enabled: boolean;
    styleProfile: any;                 // 风格配置文件，具体类型在ai-detection.ts中定义
    adaptationLevel: number;           // 适应程度 (0-1)
  };
  personalExperience: {                // 个人经历融入配置
    enabled: boolean;
    experienceLevel: number;           // 经历融入程度 (0-1)
    contextualRelevance: number;       // 上下文相关性 (0-1)
  };
  uniquePerspective: {                 // 独特观点表达配置
    enabled: boolean;
    originalityLevel: number;          // 原创性程度 (0-1)
    viewpointDiversity: number;        // 观点多样性 (0-1)
  };
}

// 适度不完美化设置
export interface ImperfectionSettings {
  enabled: boolean;                    // 是否启用
  minorInconsistency: {                // 轻微不一致配置
    enabled: boolean;
    frequency: number;                 // 不一致频率 (0-0.1)
    types: ('stylistic' | 'factual' | 'structural')[]; // 不一致类型
  };
  naturalPauses: {                     // 自然停顿配置
    enabled: boolean;
    frequency: number;                 // 停顿频率 (0-1)
    pauseTypes: string[];              // 停顿类型
  };
  colloquialErrors: {                  // 口语化错误配置
    enabled: boolean;
    frequency: number;                 // 错误频率 (0-0.05)
    errorTypes: ('grammar' | 'spelling' | 'punctuation')[]; // 错误类型
  };
}

// 反AI痕迹检测策略
export interface AntiAIDetectionStrategy {
  languageNaturalization: LanguageNaturalizationSettings; // 语言自然化
  personalizationInjection: PersonalizationSettings;      // 个性化注入
  moderateImperfection: ImperfectionSettings;             // 适度不完美化
}

// 模板性能指标
export interface TemplatePerformanceMetrics {
  aiDetectionScore: number;            // AI检测评分 (0-1, 越低越好)
  platformFitScore: number;            // 平台适配评分 (0-1)
  engagementPrediction: number;        // 互动预测评分 (0-1)
  qualityConsistency: number;          // 质量一致性 (0-1)
  userSatisfaction: number;            // 用户满意度 (0-1)
  averageGenerationTime: number;       // 平均生成时间 (ms)
  usageFrequency: number;              // 使用频率
  lastOptimized: Date;                 // 最后优化时间
}

// 高级提示词模板核心接口
export interface AdvancedPromptTemplate {
  // 基础信息
  id: string;                          // 模板ID
  name: string;                        // 模板名称
  description?: string;                // 模板描述
  platform: PlatformId;               // 目标平台
  category: PromptCategory;            // 模板分类
  tags: string[];                      // 标签列表
  
  // 分层Prompt结构
  systemPrompt: string;                // 系统层：角色定义和基础规则
  taskPrompt: string;                  // 任务层：具体任务和目标描述
  contextPrompt: string;               // 上下文层：用户输入和背景信息处理
  outputPrompt: string;                // 输出层：格式要求和质量标准
  
  // 高级配置
  variables: PromptVariable[];         // 可替换变量定义
  examples: FewShotExample[];          // 示例对话和输出
  qualityRules: QualityRule[];         // 质量检查规则
  antiAISettings: AntiAIDetectionStrategy; // 反AI痕迹策略
  
  // 元数据
  version: string;                     // 模板版本
  createdAt: Date;                     // 创建时间
  updatedAt: Date;                     // 更新时间
  usageCount: number;                  // 使用次数
  performanceMetrics?: TemplatePerformanceMetrics; // 性能指标
}

// 模板筛选条件
export interface TemplateFilters {
  platform?: PlatformId;              // 平台筛选
  category?: PromptCategory;           // 分类筛选
  tags?: string[];                     // 标签筛选
  createdAfter?: Date;                 // 创建时间筛选
  createdBefore?: Date;               
  minUsageCount?: number;              // 最小使用次数
  maxUsageCount?: number;              // 最大使用次数
  hasPerformanceMetrics?: boolean;     // 是否有性能指标
  enabled?: boolean;                   // 是否启用
}

// 模板统计信息
export interface TemplateStatistics {
  totalTemplates: number;              // 总模板数
  templatesPerPlatform: Record<PlatformId, number>; // 各平台模板数
  templatesPerCategory: Record<PromptCategory, number>; // 各分类模板数
  averageUsageCount: number;           // 平均使用次数
  averageQualityScore: number;         // 平均质量评分
  mostUsedTemplates: string[];         // 最常用模板ID列表
  recentlyUpdated: string[];           // 最近更新模板ID列表
  performanceMetricsAvailable: number; // 有性能指标的模板数
}

// 模板创建选项
export interface TemplateCreationOptions {
  generateId?: boolean;                // 是否自动生成ID
  validateOnCreate?: boolean;          // 创建时是否验证
  setDefaultValues?: boolean;          // 是否设置默认值
  addPerformanceTracking?: boolean;    // 是否添加性能跟踪
}

// 模板更新选项
export interface TemplateUpdateOptions {
  incrementVersion?: boolean;          // 是否增加版本号
  validateOnUpdate?: boolean;          // 更新时是否验证
  preserveUsageCount?: boolean;        // 是否保留使用次数
  updateTimestamp?: boolean;           // 是否更新时间戳
  notifySubscribers?: boolean;         // 是否通知订阅者
}

// 模板导出格式
export interface TemplateExportFormat {
  format: 'json' | 'yaml' | 'csv';     // 导出格式
  includeMetadata?: boolean;           // 是否包含元数据
  includePerformanceMetrics?: boolean; // 是否包含性能指标
  includeExamples?: boolean;           // 是否包含示例
  compressOutput?: boolean;            // 是否压缩输出
}

// 模板导入结果
export interface TemplateImportResult {
  successCount: number;                // 成功导入数量
  failureCount: number;                // 失败数量
  skippedCount: number;                // 跳过数量
  createdTemplateIds: string[];        // 新创建的模板ID
  updatedTemplateIds: string[];        // 更新的模板ID
  errors: Array<{                      // 错误信息
    templateName: string;
    error: string;
    severity: 'warning' | 'error';
  }>;
  warnings: string[];                  // 警告信息
}

// 模板验证结果
export interface TemplateValidationResult {
  isValid: boolean;                    // 是否有效
  errors: Array<{                      // 错误列表
    field: string;
    message: string;
    severity: 'error' | 'warning';
    suggestion?: string;
  }>;
  warnings: string[];                  // 警告列表
  score: number;                       // 验证评分 (0-100)
  recommendations: string[];           // 改进建议
}

// 模板性能报告
export interface TemplatePerformanceReport {
  templateId: string;                  // 模板ID
  reportPeriod: {                      // 报告周期
    start: Date;
    end: Date;
  };
  metrics: TemplatePerformanceMetrics; // 性能指标
  usage: {                             // 使用统计
    totalUsages: number;
    uniqueUsers: number;
    averageSessionLength: number;
    popularTimeSlots: string[];
  };
  quality: {                           // 质量统计
    averageQualityScore: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
    commonIssues: string[];
    userFeedback: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
  recommendations: {                   // 优化建议
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    estimatedImpact: number; // 预期影响 (0-1)
  }[];
}

// 默认值常量
export const DEFAULT_ADVANCED_TEMPLATE: Partial<AdvancedPromptTemplate> = {
  version: '1.0.0',
  tags: [],
  variables: [],
  examples: [],
  qualityRules: [],
  usageCount: 0,
  antiAISettings: {
    languageNaturalization: {
      enabled: true,
      sentenceVariation: {
        enabled: true,
        level: 0.7,
        patterns: []
      },
      colloquialLevel: {
        enabled: true,
        intensity: 0.5,
        targetExpressions: []
      },
      emotionalNuance: {
        enabled: true,
        depth: 0.6,
        emotionalMarkers: []
      }
    },
    personalizationInjection: {
      enabled: true,
      userStyleMimicry: {
        enabled: true,
        styleProfile: {},
        adaptationLevel: 1
      },
      personalExperience: {
        enabled: true,
        experienceLevel: 1,
        contextualRelevance: 1
      },
      uniquePerspective: {
        enabled: true,
        originalityLevel: 1,
        viewpointDiversity: 1
      }
    },
    moderateImperfection: {
      enabled: true,
      minorInconsistency: {
        enabled: true,
        frequency: 0.03,
        types: ['stylistic', 'factual', 'structural']
      },
      naturalPauses: {
        enabled: true,
        frequency: 1,
        pauseTypes: []
      },
      colloquialErrors: {
        enabled: false,
        frequency: 0.05,
        errorTypes: ['grammar', 'spelling', 'punctuation']
      }
    }
  }
};

// 默认质量规则
export const DEFAULT_QUALITY_RULES: QualityRule[] = [
  {
    id: 'min-length',
    name: '最小长度检查',
    type: 'length',
    condition: {
      type: 'length',
      minLength: 50
    },
    weight: 0.2,
    enabled: true
  },
  {
    id: 'max-length',
    name: '最大长度检查',
    type: 'length',
    condition: {
      type: 'length',
      maxLength: 5000
    },
    weight: 0.2,
    enabled: true
  },
  {
    id: 'platform-keywords',
    name: '平台关键词检查',
    type: 'keyword',
    condition: {
      type: 'contains',
      contains: [] // 根据平台动态设置
    },
    weight: 0.3,
    enabled: true
  }
];

// 类型保护函数
export const isValidPromptCategory = (category: string): category is PromptCategory => {
  const validCategories: PromptCategory[] = [
    'product-review', 'opinion-sharing', 'analytical-article', 'tutorial-guide',
    'personal-story', 'news-commentary', 'lifestyle-sharing', 'technical-blog',
    'marketing-copy', 'social-media-post', 'custom'
  ];
  return validCategories.includes(category as PromptCategory);
};

export const isAdvancedPromptTemplate = (obj: any): obj is AdvancedPromptTemplate => {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.platform === 'string' &&
    isValidPromptCategory(obj.category) &&
    typeof obj.systemPrompt === 'string' &&
    typeof obj.taskPrompt === 'string' &&
    typeof obj.contextPrompt === 'string' &&
    typeof obj.outputPrompt === 'string' &&
    Array.isArray(obj.variables) &&
    Array.isArray(obj.examples) &&
    Array.isArray(obj.qualityRules) &&
    typeof obj.antiAISettings === 'object'
  );
};

// 工具函数
export const generateTemplateId = (): string => {
  return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const combinePromptLayers = (template: AdvancedPromptTemplate): string => {
  return [
    template.systemPrompt,
    template.taskPrompt,
    template.contextPrompt,
    template.outputPrompt
  ].filter(Boolean).join('\n\n');
};

export const extractVariablesFromPrompt = (prompt: string): string[] => {
  const variablePattern = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const matches = prompt.match(variablePattern);
  return matches ? matches.map(match => match.slice(1, -1)) : [];
};

export interface FeedbackData {
  contentId: string;
  rating: number;
  comments?: string;
  issues?: string[];
}

export interface HistoryItem {
  id: string;
  templateId: string;
  timestamp: string;
  request: any;
  response: string;
  qualityScore?: number;
}

export interface GenerationOptions {
  topic: string;
  platformId: PlatformId;
  [key: string]: any;
} 