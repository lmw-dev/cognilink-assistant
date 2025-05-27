/**
 * 社交媒体平台相关类型定义
 * 支持小红书、Twitter、微信公众号、个人博客、头条号五个平台
 */

// 平台标识符类型
export type PlatformId = 'xiaohongshu' | 'twitter' | 'wechat' | 'blog' | 'toutiao';

// 社交媒体平台接口
export interface SocialMediaPlatform {
  id: PlatformId;
  name: string;
  maxLength: number;
  styleKeywords: string[];
  requiredElements: string[];
  formatRules: FormatRules;
}

// 格式规则接口
export interface FormatRules {
  paragraphBreak?: string;
  headingStyle?: string;
  paragraphLength?: string | { min: number; max: number };
  emojiDensity?: 'low' | 'medium' | 'high' | { min: number; max: number };
  hashtagStyle?: string;
  hashtagCount?: string | { min: number; max: number };
  interactionPrompt?: boolean;
  threadSupport?: boolean;
  threadNumbering?: boolean;
  mentionStyle?: string;
  characterLimit?: number;
  lineBreakOptimization?: boolean;
  dataSupport?: boolean;
  conclusionRequired?: boolean;
  tocRequired?: boolean;
  codeBlockSupport?: boolean;
  seoOptimized?: boolean;
  referenceSection?: boolean;
  titleStyle?: string;
  controversialContent?: boolean;
  discussionPrompt?: boolean;
  clickbaitLevel?: { min: number; max: number };
  popularLanguage?: boolean;
  controversialPlacement?: 'start' | 'middle' | 'end' | 'throughout';
  titleOptimization?: boolean;
  emojiPlacement?: 'start' | 'end' | 'distributed';
  interactionPlacement?: 'start' | 'middle' | 'end';
  headingFormat?: string;
  listFormatting?: boolean;
  linkHandling?: string;
  linkFormatting?: string;
  imageSupport?: boolean;
  headingHierarchy?: boolean;
  codeBlockFormat?: string;
  sectionBalance?: boolean;
  structureRequired?: boolean;
  headingLevels?: { min: number; max: number };
  professionalTone?: boolean;
}

// 平台模板接口
export interface PlatformTemplate {
  id: PlatformId;
  name: string;
  maxLength: number;
  systemPrompt: string;
  userTemplate: string;
  styleKeywords: string[];
  requiredElements: string[];
  formatRules: FormatRules;
  validationRules?: TemplateValidationRules;
  metadata?: TemplateMetadata;
}

// 模板验证规则接口
export interface TemplateValidationRules {
  requiredFields: string[];
  lengthConstraints: {
    systemPrompt: { min: number; max: number };
    userTemplate: { min: number; max: number };
  };
  formatValidation: {
    placeholderPattern: RegExp;
    styleKeywordCount: { min: number; max: number };
  };
  platformSpecificRules: Record<string, any>;
}

// 模板元数据接口
export interface TemplateMetadata {
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  tags: string[];
}

// 模板上下文接口
export interface TemplateContext {
  topic: string;
  context: string;
  userPreferences?: UserPreferences;
  additionalParams?: Record<string, any>;
}

// 用户偏好接口
export interface UserPreferences {
  tone?: 'formal' | 'casual' | 'professional' | 'friendly';
  length?: 'short' | 'medium' | 'long';
  style?: 'conservative' | 'moderate' | 'bold';
  includeEmoji?: boolean;
  includeHashtags?: boolean;
  customKeywords?: string[];
}

// 渲染后的模板接口
export interface RenderedTemplate {
  systemPrompt: string;
  userPrompt: string;
  metadata: TemplateRenderMetadata;
}

// 模板渲染元数据接口
export interface TemplateRenderMetadata {
  platformId: PlatformId;
  templateVersion: string;
  renderTime: Date;
  contextHash: string;
  placeholdersReplaced: string[];
  warnings: string[];
}

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
}

// 验证错误接口
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

// 验证警告接口
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

// 模板加载选项接口
export interface TemplateLoadOptions {
  version?: string;
  useCache?: boolean;
  validateOnLoad?: boolean;
}

// 模板更新选项接口
export interface TemplateUpdateOptions {
  validateBeforeUpdate?: boolean;
  createBackup?: boolean;
  notifySubscribers?: boolean;
}

// 批量操作结果接口
export interface BatchOperationResult<T> {
  successful: T[];
  failed: Array<{
    item: T;
    error: Error;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// 模板性能指标接口
export interface TemplatePerformanceMetrics {
  loadTime: number;
  renderTime: number;
  validationTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

// 模板统计信息接口
export interface TemplateStatistics {
  totalTemplates: number;
  templatesPerPlatform: Record<PlatformId, number>;
  averageLoadTime: number;
  averageRenderTime: number;
  cacheEfficiency: number;
  errorRate: number;
}

// 模板事件接口
export interface TemplateEvent {
  type: 'loaded' | 'rendered' | 'validated' | 'updated' | 'error';
  platformId: PlatformId;
  templateId: string;
  timestamp: Date;
  data?: any;
  error?: Error;
}

// 模板监听器接口
export interface TemplateEventListener {
  (event: TemplateEvent): void;
}

// 模板配置接口
export interface TemplateConfig {
  enableCache: boolean;
  cacheSize: number;
  cacheTTL: number; // Time to live in milliseconds
  enableValidation: boolean;
  enableMetrics: boolean;
  enableEvents: boolean;
  defaultTimeout: number;
  maxConcurrentOperations: number;
}

// 所有类型已通过export关键字导出，无需重复导出 