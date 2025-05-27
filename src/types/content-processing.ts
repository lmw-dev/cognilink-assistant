/**
 * TOM-108: 内容后处理和格式化系统类型定义
 * 
 * 包含长度检查、风格评估、格式化、质量评分等功能的完整类型定义
 */

import { SocialMediaPlatform, PlatformId } from './social-media';

// ==================== 核心处理接口 ====================

/**
 * 内容处理选项
 */
export interface ProcessingOptions {
  strictMode: boolean;                    // 严格模式，更严格的验证
  autoFix: boolean;                      // 自动修复问题
  preserveOriginal: boolean;             // 保留原始内容
  customRules?: CustomProcessingRules;   // 自定义处理规则
  enableCache?: boolean;                 // 启用缓存
  timeout?: number;                      // 处理超时时间(ms)
  retryAttempts?: number;
}

/**
 * 自定义处理规则
 */
export interface CustomProcessingRules {
  lengthRules?: Partial<LengthRules>;
  styleRules?: Partial<StyleRules>;
  formatRules?: Partial<FormatRules>;
  qualityRules?: Partial<QualityRules>;
}

/**
 * 处理后的内容结果
 */
export interface ProcessedContent {
  originalContent: string;               // 原始内容
  processedContent: string;              // 处理后内容
  platform: SocialMediaPlatform;        // 目标平台
  
  // 处理结果
  lengthValidation: LengthValidationResult;
  styleAssessment: StyleAssessment;
  formatResult: FormattedContent;
  qualityScore: QualityScore;
  
  // 元数据
  processingTime: number;                // 处理耗时(ms)
  processingSteps: ProcessingStep[];     // 处理步骤
  warnings: ProcessingWarning[];         // 警告信息
  suggestions: ProcessingSuggestion[];   // 改进建议
  
  // 状态
  isValid: boolean;                      // 是否有效
  needsReview: boolean;                  // 是否需要人工审核
  confidence: number;                    // 置信度 (0-1)
}

/**
 * 处理步骤记录
 */
export interface ProcessingStep {
  step: string;                          // 步骤名称
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: number;                     // 开始时间
  endTime?: number;                      // 结束时间
  result?: any;                          // 结果
  error?: string;                        // 错误
}

/**
 * 处理警告
 */
export interface ProcessingWarning {
  type: 'length' | 'style' | 'format' | 'quality';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  suggestion?: string;
  autoFixable: boolean;
}

/**
 * 处理建议
 */
export interface ProcessingSuggestion {
  category: 'improvement' | 'optimization' | 'correction';
  priority: number;
  message: string;
  action?: string;
  impact: 'low' | 'medium' | 'high';
}

// ==================== 长度处理相关 ====================

/**
 * 长度处理器接口
 */
export interface LengthProcessor {
  validateLength(content: string, platform: SocialMediaPlatform): LengthValidationResult;
  smartTruncate(content: string, maxLength: number, options?: TruncateOptions): string;
  suggestLengthOptimization(content: string, platform: SocialMediaPlatform): OptimizationSuggestion[];
}

/**
 * 长度验证结果
 */
export interface LengthValidationResult {
  isValid: boolean;                      // 是否符合长度要求
  currentLength: number;                 // 当前长度
  targetLength: number;                  // 目标长度
  minLength?: number;                    // 最小长度
  maxLength?: number;                    // 最大长度
  exceedsBy?: number;                    // 超出字数
  shortBy?: number;                      // 不足字数
  suggestions: string[];                // 长度调整建议
}

/**
 * 截断选项
 */
export interface TruncateOptions {
  preserveSentences: boolean;            // 保持句子完整性
  preserveParagraphs: boolean;           // 保持段落完整性
  addEllipsis: boolean;                  // 添加省略号
  prioritizeKeywords: string[];          // 优先保留的关键词
}

/**
 * 长度规则
 */
export interface LengthRules {
  minLength: number;
  maxLength: number;
  optimalLength: number;
  truncateStrategy: 'hard' | 'smart' | 'preserve_structure';
  allowOverflow: boolean;
}

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  type: 'length' | 'style' | 'format' | 'quality';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
  autoFixable: boolean;
}

// ==================== 风格评估相关 ====================

/**
 * 风格评估器接口
 */
export interface StyleAssessor {
  assessStyle(content: string, platform: SocialMediaPlatform): StyleAssessment;
  checkRequiredElements(content: string, platform: SocialMediaPlatform): ElementCheckResult;
  suggestStyleImprovements(content: string, platform: SocialMediaPlatform): StyleSuggestion[];
}

/**
 * 风格评估结果
 */
export interface StyleAssessment {
  overallScore: number;                  // 总体风格评分 (0-100)
  platformFit: number;                   // 平台适配度 (0-100)
  toneConsistency: number;               // 语调一致性 (0-100)
  elementPresence: ElementScore[];       // 必需元素检查
  keywordUsage: KeywordAnalysis;         // 关键词使用分析
  improvements: string[];                // 改进建议
  strengths: string[];                   // 优势点
  weaknesses: string[];                  // 薄弱点
  confidence: number;                    // 置信度 (0-1)
}

/**
 * 元素评分
 */
export interface ElementScore {
  element: string;                       // 元素名称
  present: boolean;                      // 是否存在
  score: number;                         // 评分 (0-100)
  importance: number;                   // 重要性
  suggestions: string[];                // 改进建议
}

/**
 * 关键词分析
 */
export interface KeywordAnalysis {
  totalKeywords: number;                 // 总关键词数
  requiredKeywords: string[];             // 匹配的关键词
  missingKeywords: string[];             // 缺失的关键词
  overusedKeywords: string[];            // 过度使用的关键词
  density: number;                        // 关键词密度
  distribution: number;                   // 关键词分布
}

/**
 * 元素检查结果
 */
export interface ElementCheckResult {
  requiredElements: ElementDetection[];
  optionalElements: ElementDetection[];
  overallCompliance: number;             // 整体符合度 (0-100)
}

/**
 * 元素检测
 */
export interface ElementDetection {
  detected: string[];
  missing: string[];
  confidence: Record<string, number>;
}

/**
 * 风格建议
 */
export interface StyleSuggestion {
  type: 'tone' | 'element' | 'keyword' | 'structure';
  message: string;
  example?: string;
  priority: number;
}

/**
 * 风格规则
 */
export interface StyleRules {
  requiredElements: string[];
  toneKeywords: string[];
  forbiddenWords: string[];
  emojiDensity: { min: number; max: number };
  interactionRequired: boolean;
}

// ==================== 格式化相关 ====================

/**
 * 内容格式化器接口
 */
export interface ContentFormatter {
  formatContent(content: string, platform: SocialMediaPlatform): FormattedContent;
  applyPlatformRules(content: string, rules: FormatRules): string;
  cleanAndNormalize(content: string): string;
}

/**
 * 格式化结果
 */
export interface FormattedContent {
  content: string;                       // 格式化后的内容
  metadata: FormatMetadata;              // 格式元数据
  warnings: FormatWarning[];             // 格式警告
  suggestions: FormatSuggestion[];       // 格式建议
}

/**
 * 格式元数据
 */
export interface FormatMetadata {
  platform: SocialMediaPlatform;          // 目标平台
  originalLength: number;                  // 原始长度
  formattedLength: number;                  // 格式化后的长度
  appliedRules: string[];                   // 应用的规则
  processingTime: number;                  // 处理耗时(ms)
}

/**
 * 格式警告
 */
export interface FormatWarning {
  type: 'structure' | 'character' | 'length' | 'style';
  message: string;
  position?: number;
  severity: 'low' | 'medium' | 'high';
}

/**
 * 格式建议
 */
export interface FormatSuggestion {
  type: 'improvement' | 'optimization' | 'correction';
  message: string;
  before?: string;
  after?: string;
  impact: number;
}

/**
 * 格式规则
 */
export interface FormatRules {
  paragraphBreak: string;
  hashtagFormat: string;
  emojiPlacement: 'start' | 'end' | 'distributed' | 'none';
  interactionPlacement: 'start' | 'end' | 'middle';
  lineBreakOptimization: boolean;
  specialCharacterHandling: boolean;
}

// ==================== 质量评分相关 ====================

/**
 * 质量评分器接口
 */
export interface QualityScorer {
  calculateQualityScore(content: string, platform: SocialMediaPlatform): QualityScore;
  checkOriginality(content: string): OriginalityResult;
  assessReadability(content: string): ReadabilityScore;
  predictEngagement(content: string, platform: SocialMediaPlatform): EngagementPrediction;
}

/**
 * 质量评分
 */
export interface QualityScore {
  overall: number;                       // 总体质量 (0-100)
  originality: number;                   // 原创性 (0-100)
  readability: number;                   // 可读性 (0-100)
  engagement: number;                    // 预期参与度 (0-100)
  platformOptimization: number;          // 平台优化度 (0-100)
  breakdown: QualityBreakdown;           // 详细评分
  confidence: number;                    // 置信度 (0-1)
}

/**
 * 质量评分细分
 */
export interface QualityBreakdown {
  contentStructure: number;               // 内容结构质量
  languageQuality: number;                // 语言质量
  platformAlignment: number;                // 平台适配度
  userEngagement: number;                  // 用户参与度
  technicalQuality: number;                  // 技术质量
}

/**
 * 质量建议
 */
export interface QualityRecommendation {
  aspect: string;                        // 改进方面
  current: number;                       // 当前评分
  target: number;                        // 目标评分
  actions: string[];                     // 改进行动
}

/**
 * 原创性结果
 */
export interface OriginalityResult {
  score: number;                         // 原创性评分 (0-100)
  duplicateSegments: string[];            // 重复段落
  uniquenessRatio: number;                // 独特性比例
  confidence: number;                    // 检测置信度
}

/**
 * 可读性评分
 */
export interface ReadabilityScore {
  score: number;                         // 可读性评分 (0-100)
  level: 'elementary' | 'middle' | 'high' | 'college' | 'graduate';
  factors: ReadabilityFactors;
}

/**
 * 可读性指标
 */
export interface ReadabilityFactors {
  sentenceLength: number;                 // 平均句子长度
  wordComplexity: number;                 // 平均词复杂度
  paragraphStructure: number;              // 段落结构
  vocabularyDiversity: number;             // 词汇多样性
}

/**
 * 参与度预测
 */
export interface EngagementPrediction {
  score: number;                         // 预期参与度 (0-100)
  factors: EngagementFactors;            // 影响因素
  recommendations: string[];             // 提升建议
  confidence: number;                    // 预测置信度
}

/**
 * 参与度因素
 */
export interface EngagementFactors {
  emotionalAppeal: number;                // 情感吸引力
  interactivity: number;                  // 互动性
  relevance: number;                      // 相关性
  timing: number;                          // 时间感
  visualElements: number;                  // 视觉元素
}

/**
 * 质量规则
 */
export interface QualityRules {
  minQualityScore: number;
  originalityThreshold: number;
  readabilityTarget: 'simple' | 'moderate' | 'complex';
  engagementThreshold: number;
}

// ==================== 错误处理相关 ====================

/**
 * 处理错误
 */
export interface ProcessingError {
  type: 'length' | 'style' | 'format' | 'quality' | 'system';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  suggestion: string;
  recoverable: boolean;
  code?: string;
  details?: any;
}

/**
 * 错误处理器接口
 */
export interface ErrorHandler {
  handleLengthError(error: LengthError): ProcessingResult;
  handleStyleError(error: StyleError): ProcessingResult;
  handleFormatError(error: FormatError): ProcessingResult;
  handleQualityError(error: QualityError): ProcessingResult;
}

/**
 * 具体错误类型
 */
export interface LengthError extends ProcessingError {
  type: 'length';
  currentLength: number;
  targetLength: number;
}

export interface StyleError extends ProcessingError {
  type: 'style';
  missingElements: string[];
  styleScore: number;
}

export interface FormatError extends ProcessingError {
  type: 'format';
  formatIssues: string[];
}

export interface QualityError extends ProcessingError {
  type: 'quality';
  qualityScore: number;
  threshold: number;
}

/**
 * 处理结果
 */
export interface ProcessingResult {
  success: boolean;
  content?: string;
  error?: ProcessingError;
  warnings?: ProcessingWarning[];
  suggestions?: ProcessingSuggestion[];
}

// ==================== 重试策略相关 ====================

/**
 * 重试策略
 */
export interface RetryStrategy {
  maxRetries: number;                    // 最大重试次数
  retryDelay: number;                    // 重试延迟(ms)
  backoffMultiplier: number;             // 退避倍数
  retryableErrors: string[];             // 可重试的错误类型
  
  shouldRetry(error: ProcessingError, attempt: number): boolean;
  getRetryDelay(attempt: number): number;
}

// ==================== 批量处理相关 ====================

/**
 * 内容输入
 */
export interface ContentInput {
  id: string;                            // 内容ID
  content: string;                       // 内容文本
  platform: SocialMediaPlatform;        // 目标平台
  options?: ProcessingOptions;           // 处理选项
}

/**
 * 批量处理选项
 */
export interface BatchProcessingOptions {
  concurrency: number;                   // 并发数
  failFast: boolean;                     // 快速失败
  retryFailures: boolean;                 // 重试失败
  progressCallback?: (progress: BatchProgress) => void;
}

/**
 * 批量处理结果
 */
export interface BatchProcessingResult {
  totalProcessed: number;                // 总数
  successful: number;                     // 成功数
  failed: number;                         // 失败数
  results: ProcessedContent[];            // 处理结果
  errors: BatchError[];                    // 错误列表
  processingTime: number;                 // 总处理时间
}

/**
 * 批量进度
 */
export interface BatchProgress {
  total: number;                          // 总数
  completed: number;                      // 已完成数
  failed: number;                          // 失败数
  currentItem?: string;                    // 当前处理项
  estimatedTimeRemaining?: number;         // 估计剩余时间
}

/**
 * 批量错误
 */
export interface BatchError {
  id: string;                              // 内容ID
  error: string;                            // 错误信息
  retryable: boolean;                        // 是否可重试
  attempts: number;                          // 重试次数
}

// ==================== 验证相关 ====================

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;                      // 是否有效
  errors: ProcessingError[];             // 验证错误
  warnings: ProcessingWarning[];          // 验证警告
  score: number;                         // 验证评分 (0-100)
  recommendations: string[];             // 验证建议
}

// ==================== 配置相关 ====================

/**
 * 后处理器配置
 */
export interface PostProcessorConfig {
  enableLengthProcessing: boolean;       // 启用长度处理
  enableStyleAssessment: boolean;        // 启用风格评估
  enableFormatting: boolean;             // 启用格式化
  enableQualityScoring: boolean;         // 启用质量评分
  enableCaching: boolean;                // 启用缓存
  enableMetrics: boolean;                // 启用指标收集
  defaultOptions: ProcessingOptions;     // 默认选项
  retryStrategy: RetryStrategy;          // 重试策略
  timeoutMs: number;                     // 超时时间
}

/**
 * 平台特定配置
 */
export interface PlatformProcessingConfig {
  [key: string]: {
    lengthRules: LengthRules;
    styleRules: StyleRules;
    formatRules: FormatRules;
    qualityRules: QualityRules;
  };
}

// ==================== 所有类型已通过export关键字导出 ==================== 