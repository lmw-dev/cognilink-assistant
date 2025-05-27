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
  startTime: number;                     // 开始时间
  endTime: number;                       // 结束时间
  success: boolean;                      // 是否成功
  details?: Record<string, any>;         // 详细信息
}

/**
 * 处理警告
 */
export interface ProcessingWarning {
  type: 'length' | 'style' | 'format' | 'quality';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
}

/**
 * 处理建议
 */
export interface ProcessingSuggestion {
  type: 'optimization' | 'enhancement' | 'fix';
  priority: 'low' | 'medium' | 'high';
  description: string;
  action?: string;
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
  minLength: number;                     // 最小长度
  maxLength: number;                     // 最大长度
  optimalLength?: number;                // 最佳长度
  exceedsBy?: number;                    // 超出字数
  shortBy?: number;                      // 不足字数
  recommendations: string[];             // 长度调整建议
}

/**
 * 截断选项
 */
export interface TruncateOptions {
  preserveSentences: boolean;            // 保持句子完整性
  preserveParagraphs: boolean;           // 保持段落完整性
  addEllipsis: boolean;                  // 添加省略号
  prioritizeKeywords: string[];          // 优先保留的关键词
  preserveElements: string[];            // 优先保留的元素
  truncateStrategy: 'start' | 'middle' | 'end' | 'smart';
}

/**
 * 长度规则
 */
export interface LengthRules {
  minLength: number;
  maxLength: number;
  optimalLength: number;
  truncateStrategy: string;
  preserveElements?: string[];
}

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  type: 'shorten' | 'expand' | 'restructure';
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'easy' | 'moderate' | 'difficult';
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
}

/**
 * 元素评分
 */
export interface ElementScore {
  element: string;                       // 元素名称
  present: boolean;                      // 是否存在
  score: number;                         // 评分 (0-100)
  details?: string;                      // 详细信息
}

/**
 * 关键词分析
 */
export interface KeywordAnalysis {
  totalKeywords: number;                 // 总关键词数
  matchedKeywords: string[];             // 匹配的关键词
  missingKeywords: string[];             // 缺失的关键词
  keywordDensity: number;                // 关键词密度
  relevanceScore: number;                // 相关性评分
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
  element: string;
  detected: boolean;
  confidence: number;                    // 检测置信度
  location?: string;                     // 位置信息
  suggestions?: string[];                // 改进建议
}

/**
 * 风格建议
 */
export interface StyleSuggestion {
  category: 'tone' | 'keywords' | 'elements' | 'structure';
  priority: 'low' | 'medium' | 'high';
  description: string;
  example?: string;
}

/**
 * 风格规则
 */
export interface StyleRules {
  requiredElements: string[];
  optionalElements?: string[];
  toneKeywords: string[];
  avoidKeywords?: string[];
  toneTarget: string;
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
  changes: FormatChange[];               // 格式变更记录
}

/**
 * 格式元数据
 */
export interface FormatMetadata {
  paragraphCount: number;                // 段落数
  sentenceCount: number;                 // 句子数
  wordCount: number;                     // 词数
  characterCount: number;                // 字符数
  emojiCount?: number;                   // 表情符号数
  hashtagCount?: number;                 // 标签数
  linkCount?: number;                    // 链接数
  formatCompliance: number;              // 格式符合度 (0-100)
}

/**
 * 格式警告
 */
export interface FormatWarning {
  type: 'structure' | 'syntax' | 'style' | 'compliance';
  message: string;
  location?: string;
  severity: 'info' | 'warning' | 'error';
}

/**
 * 格式建议
 */
export interface FormatSuggestion {
  type: 'improvement' | 'optimization' | 'compliance';
  description: string;
  before?: string;
  after?: string;
}

/**
 * 格式变更
 */
export interface FormatChange {
  type: 'add' | 'remove' | 'modify';
  description: string;
  location: string;
  oldValue?: string;
  newValue?: string;
}

/**
 * 格式规则
 */
export interface FormatRules {
  paragraphBreak?: string;
  lineBreak?: string;
  headingFormat?: string;
  listFormat?: string;
  linkFormat?: string;
  emojiPlacement?: 'start' | 'end' | 'distributed' | 'none';
  hashtagFormat?: string;
  specialRules?: Record<string, any>;
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
  recommendations: QualityRecommendation[];
}

/**
 * 质量评分细分
 */
export interface QualityBreakdown {
  content: number;                       // 内容质量
  structure: number;                     // 结构质量
  language: number;                      // 语言质量
  relevance: number;                     // 相关性
  uniqueness: number;                    // 独特性
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
  similarityDetected: boolean;           // 是否检测到相似内容
  similarSources?: SimilarSource[];      // 相似来源
  confidence: number;                    // 检测置信度
}

/**
 * 相似来源
 */
export interface SimilarSource {
  source: string;                        // 来源
  similarity: number;                    // 相似度 (0-1)
  matchedText: string;                   // 匹配文本
}

/**
 * 可读性评分
 */
export interface ReadabilityScore {
  score: number;                         // 可读性评分 (0-100)
  level: 'very_easy' | 'easy' | 'moderate' | 'difficult' | 'very_difficult';
  metrics: ReadabilityMetrics;
  suggestions: string[];
}

/**
 * 可读性指标
 */
export interface ReadabilityMetrics {
  averageSentenceLength: number;         // 平均句子长度
  averageWordLength: number;             // 平均词长
  complexWordRatio: number;              // 复杂词比例
  sentenceVariety: number;               // 句子多样性
}

/**
 * 参与度预测
 */
export interface EngagementPrediction {
  score: number;                         // 预期参与度 (0-100)
  factors: EngagementFactor[];           // 影响因素
  recommendations: string[];             // 提升建议
}

/**
 * 参与度因素
 */
export interface EngagementFactor {
  factor: string;                        // 因素名称
  impact: number;                        // 影响程度 (0-100)
  present: boolean;                      // 是否存在
}

/**
 * 质量规则
 */
export interface QualityRules {
  originalityThreshold: number;
  readabilityTarget: string;
  engagementFactors: string[];
  qualityWeights: QualityWeights;
}

/**
 * 质量权重
 */
export interface QualityWeights {
  originality: number;
  readability: number;
  engagement: number;
  platformFit: number;
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
  details?: Record<string, any>;
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
  platform: PlatformId;                 // 目标平台
  options?: ProcessingOptions;           // 处理选项
  metadata?: Record<string, any>;        // 元数据
}

/**
 * 批量处理选项
 */
export interface BatchProcessingOptions {
  concurrency: number;                   // 并发数
  failFast: boolean;                     // 快速失败
  retryStrategy?: RetryStrategy;         // 重试策略
  progressCallback?: (progress: BatchProgress) => void;
}

/**
 * 批量处理结果
 */
export interface BatchProcessingResult {
  totalCount: number;                    // 总数
  successCount: number;                  // 成功数
  failureCount: number;                  // 失败数
  results: ProcessedContent[];           // 处理结果
  errors: ProcessingError[];             // 错误列表
  processingTime: number;                // 总处理时间
  summary: BatchSummary;                 // 批量处理摘要
}

/**
 * 批量进度
 */
export interface BatchProgress {
  completed: number;                     // 已完成数
  total: number;                         // 总数
  percentage: number;                    // 完成百分比
  currentItem?: string;                  // 当前处理项
}

/**
 * 批量摘要
 */
export interface BatchSummary {
  averageProcessingTime: number;         // 平均处理时间
  averageQualityScore: number;           // 平均质量评分
  commonIssues: string[];                // 常见问题
  recommendations: string[];             // 批量建议
}

// ==================== 验证相关 ====================

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;                      // 是否有效
  score: number;                         // 验证评分 (0-100)
  errors: ValidationError[];             // 验证错误
  warnings: ValidationWarning[];         // 验证警告
  suggestions: ValidationSuggestion[];   // 验证建议
}

/**
 * 验证错误
 */
export interface ValidationError {
  field: string;                         // 错误字段
  message: string;                       // 错误信息
  severity: 'error' | 'critical';       // 严重程度
}

/**
 * 验证警告
 */
export interface ValidationWarning {
  field: string;                         // 警告字段
  message: string;                       // 警告信息
  suggestion?: string;                   // 建议
}

/**
 * 验证建议
 */
export interface ValidationSuggestion {
  type: 'improvement' | 'optimization';
  description: string;
  impact: 'low' | 'medium' | 'high';
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