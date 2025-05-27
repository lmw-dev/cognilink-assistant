/**
 * 内容质量评估系统类型定义
 * 支持原创性检测、平台适配度评估和综合质量评分
 */

import { SocialMediaPlatform, PlatformId } from './social-media';

// 使用项目中已定义的Note接口
export interface Note {
  title: string;
  content: string;
  link: string;
  path: string;
  tags?: string[];
  embedding?: number[];
  updated?: number;
}

// ==================== 通用类型 ====================

/**
 * 相似度计算方法
 */
export type SimilarityMethod = 'cosine' | 'euclidean' | 'manhattan' | 'jaccard';

/**
 * 质量等级
 */
export type QualityGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'unacceptable';

/**
 * 改进建议类型
 */
export type ImprovementType = 'critical' | 'important' | 'optional' | 'enhancement';

/**
 * 改进建议接口
 */
export interface ImprovementSuggestion {
  type: ImprovementType;
  category: string;
  title: string;
  description: string;
  impact: number; // 0-100
  effort: number; // 0-100
  priority: number; // 0-100
  actionable: boolean;
  examples?: string[];
  expectedImpact: number; // 预期影响（兼容性）
  estimatedEffort: string; // 预估工作量（兼容性）
}

// ==================== 原创性检测类型 (TOM-110) ====================

/**
 * 原创性检测选项
 */
export interface OriginalityDetectionOptions {
  threshold?: number; // 相似度阈值，默认0.8
  method?: SimilarityMethod; // 相似度计算方法
  segmentSize?: number; // 分段大小，默认200字符
  overlap?: number; // 分段重叠，默认50字符
  enableCache?: boolean; // 是否启用缓存
  maxSourceNotes?: number; // 最大源笔记数量
  includeMetadata?: boolean; // 是否包含元数据
  strictMode?: boolean; // 严格模式
}

/**
 * 重复片段接口
 */
export interface DuplicateSegment {
  content: string; // 重复内容
  startIndex: number; // 开始位置
  endIndex: number; // 结束位置
  similarity: number; // 相似度 0-1
  sourceNote: Note; // 源笔记
  sourceSegment: string; // 源片段
  confidence: number; // 置信度 0-1
  type: 'exact' | 'semantic' | 'paraphrase'; // 重复类型
}

/**
 * 最相似源笔记
 */
export interface MostSimilarSource {
  note: Note;
  similarity: number;
  matchedSegments: string[];
  coverage: number; // 覆盖率 0-1
  confidence: number;
}

/**
 * 原创性检测结果
 */
export interface OriginalityDetectionResult {
  overallScore: number; // 总体原创性评分 0-100
  similarity: number; // 最高相似度 0-1
  duplicateSegments: DuplicateSegment[]; // 重复片段列表
  mostSimilarSource: MostSimilarSource | null; // 最相似源笔记
  isOriginal: boolean; // 是否原创
  confidence: number; // 置信度 0-1
  processingTime: number; // 处理时间(ms)
  metadata: {
    totalSegments: number;
    duplicateCount: number;
    uniqueSourceCount: number;
    averageSimilarity: number;
    method: SimilarityMethod;
    threshold: number;
  };
}

/**
 * 原创性检测请求
 */
export interface OriginalityDetectionRequest {
  id: string;
  content: string;
  sourceNotes: Note[];
  options?: OriginalityDetectionOptions;
}

/**
 * 批量原创性检测结果
 */
export interface BatchOriginalityResult {
  results: OriginalityDetectionResult[];
  summary: {
    total: number;
    originalCount: number;
    duplicateCount: number;
    averageScore: number;
    processingTime: number;
  };
  errors: Array<{
    requestId: string;
    error: Error;
  }>;
}

// ==================== 平台适配度评估类型 (TOM-111) ====================

/**
 * 规则类型
 */
export type RuleType = 'length' | 'format' | 'style' | 'content' | 'structure' | 'interaction';

/**
 * 规则严重性
 */
export type RuleSeverity = 'error' | 'warning' | 'info';

/**
 * 适配度规则接口
 */
export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  severity: RuleSeverity;
  weight: number; // 权重 0-1
  enabled: boolean;
  platformSpecific: boolean;
  validator: (content: string, platform: SocialMediaPlatform) => RuleCheckResult;
  metadata?: {
    category: string;
    tags: string[];
    version: string;
    author: string;
  };
}

/**
 * 规则检查结果
 */
export interface RuleCheckResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  score: number; // 0-100
  weight: number;
  details: string;
  suggestions?: string[];
  metadata?: {
    actualValue?: any;
    expectedValue?: any;
    threshold?: any;
    confidence: number;
  };
}

/**
 * 平台适配度评估选项
 */
export interface ComplianceEvaluationOptions {
  enabledRules?: string[]; // 启用的规则ID列表
  strictMode?: boolean; // 严格模式
  includeWarnings?: boolean; // 包含警告
  customWeights?: Record<string, number>; // 自定义权重
  skipOptionalRules?: boolean; // 跳过可选规则
}

/**
 * 平台适配度评估结果
 */
export interface ComplianceEvaluationResult {
  overallScore: number; // 总体适配度评分 0-100
  ruleChecks: RuleCheckResult[]; // 规则检查结果
  improvements: ImprovementSuggestion[]; // 改进建议
  isCompliant: boolean; // 是否符合要求
  platformSpecificScores: Record<string, number>; // 平台特定评分
  processingTime: number; // 处理时间(ms)
  metadata: {
    totalRules: number;
    passedRules: number;
    failedRules: number;
    warningRules: number;
    platform: PlatformId;
    strictMode: boolean;
  };
}

// ==================== 平台规则定义 ====================

/**
 * 小红书规则配置
 */
export interface XiaohongshuRules {
  emojiDensity: { min: number; max: number }; // 表情符号密度
  interactionQuestions: { min: number; max: number }; // 互动问题数量
  visualLanguage: string[]; // 视觉语言关键词
  hashtagUsage: { min: number; max: number }; // 标签使用
  lengthRange: { min: number; max: number }; // 长度范围
  titleStyle: string[]; // 标题风格
}

/**
 * Twitter规则配置
 */
export interface TwitterRules {
  characterLimit: number; // 字符限制
  hashtagCount: { min: number; max: number }; // 标签数量
  threadSupport: boolean; // 支持推文串
  brevity: number; // 简洁性要求 0-1
  engagementElements: string[]; // 互动元素
}

/**
 * 微信公众号规则配置
 */
export interface WechatRules {
  lengthRequirement: { min: number; max: number }; // 长度要求
  structureRequired: boolean; // 结构化要求
  professionalTone: boolean; // 专业语调
  exampleUsage: { min: number; max: number }; // 示例使用
  headingLevels: { min: number; max: number }; // 标题层级
}

/**
 * 个人博客规则配置
 */
export interface BlogRules {
  technicalDepth: number; // 技术深度 0-1
  codeExamples: { min: number; max: number }; // 代码示例
  seoOptimization: boolean; // SEO优化
  structureComplexity: number; // 结构复杂度 0-1
  referenceSection: boolean; // 参考文献
}

/**
 * 头条号规则配置
 */
export interface ToutiaoRules {
  titleAttractiveness: number; // 标题吸引力 0-1
  popularLanguage: boolean; // 通俗易懂
  discussionPrompt: boolean; // 讨论引导
  controversialContent: { min: number; max: number }; // 争议内容
  clickbaitLevel: { min: number; max: number }; // 标题党程度
}

/**
 * 平台规则集合
 */
export interface PlatformRuleSet {
  xiaohongshu: XiaohongshuRules;
  twitter: TwitterRules;
  wechat: WechatRules;
  blog: BlogRules;
  toutiao: ToutiaoRules;
}

// ==================== 综合质量评估类型 ====================

/**
 * 质量评估维度
 */
export interface QualityDimensions {
  originality: number; // 原创性 0-100
  compliance: number; // 平台适配度 0-100
  readability: number; // 可读性 0-100
  attractiveness: number; // 吸引力 0-100
  logic: number; // 逻辑性 0-100
  practicality: number; // 实用性 0-100
}

/**
 * 评分权重
 */
export interface ScoreWeights {
  originality: number; // 原创性权重
  compliance: number; // 适配度权重
  platformCompliance: number; // 平台适配度权重（兼容性别名）
  llmQuality: number; // LLM质量权重
  readability: number; // 可读性权重
  attractiveness: number; // 吸引力权重
  logic: number; // 逻辑性权重
  practicality: number; // 实用性权重
}

/**
 * 综合质量评分
 */
export interface OverallQualityScore {
  total: number; // 总分 0-100
  dimensions: QualityDimensions; // 各维度得分
  weights: ScoreWeights; // 权重配置
  grade: QualityGrade; // 质量等级
  recommendation: string; // 推荐建议
  confidence: number; // 置信度 0-1
  breakdown: {
    originality: number;
    compliance: number;
    llmQuality: number;
  };
}

/**
 * 质量评估选项
 */
export interface QualityEvaluationOptions {
  includeOriginality?: boolean; // 包含原创性检测
  includeCompliance?: boolean; // 包含适配度评估
  includePlatformCompliance?: boolean; // 包含平台适配度评估（兼容性别名）
  includeLLMEvaluation?: boolean; // 包含LLM评估
  includeLLMQuality?: boolean; // 包含LLM质量评估（兼容性别名）
  enableDetailedReport?: boolean; // 启用详细报告
  customWeights?: Partial<ScoreWeights>; // 自定义权重
  strictMode?: boolean; // 严格模式
  enableCache?: boolean; // 启用缓存
  timeout?: number; // 超时时间(ms)
  maxProcessingTime?: number; // 最大处理时间(ms)
  confidenceThreshold?: number; // 置信度阈值
  llmCriteria?: QualityCriteria[]; // LLM评估标准
}

/**
 * 内容评估请求
 */
export interface ContentEvaluationRequest {
  id?: string; // 可选的请求ID
  content: string;
  platform: SocialMediaPlatform;
  sourceNotes?: Note[];
  options?: QualityEvaluationOptions;
}

/**
 * 批量评估选项
 */
export interface BatchEvaluationOptions extends QualityEvaluationOptions {
  concurrency?: number; // 并发数
  batchSize?: number; // 批次大小
  maxConcurrency?: number; // 最大并发数
  continueOnError?: boolean; // 遇到错误时继续
  enableProgressTracking?: boolean; // 启用进度跟踪
  failFast?: boolean; // 快速失败
  retryCount?: number; // 重试次数
}

/**
 * 批量评估结果
 */
export interface BatchEvaluationResult {
  results: QualityEvaluationResult[];
  summary: {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    averageScore: number;
    excellentCount: number;
    goodCount: number;
    fairCount: number;
    poorCount: number;
    unacceptableCount: number;
    averageProcessingTime: number;
    totalProcessingTime: number;
  };
  errors?: Array<{
    requestId: string;
    error: Error;
  }>;
  metadata: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    processingTime: number;
    concurrency: number;
  };
}

/**
 * 质量评估结果
 */
export interface QualityEvaluationResult {
  overall: OverallQualityScore; // 综合评分
  originality?: OriginalityDetectionResult; // 原创性检测结果
  platformCompliance?: ComplianceEvaluationResult; // 平台适配度结果
  llmQuality?: LLMQualityScore; // LLM质量评估结果
  report: QualityReport; // 质量报告
  processingTime: number; // 处理时间(ms)
  confidence: number; // 置信度 0-1
  timestamp: number; // 时间戳
  metadata: {
    contentLength: number;
    platform: PlatformId;
    evaluationMode: string;
    version: string;
  };
}

// ==================== LLM质量评估类型 ====================

/**
 * LLM质量评估标准
 */
export type QualityCriteria = 'readability' | 'attractiveness' | 'logic' | 'practicality';

/**
 * LLM质量评估详细标准
 */
export interface QualityCriteriaDetail {
  dimension: keyof QualityDimensions;
  weight: number;
  description: string;
  prompt: string;
}

/**
 * LLM质量评分
 */
export interface LLMQualityScore {
  readability: number; // 可读性 0-100
  attractiveness: number; // 吸引力 0-100
  logic: number; // 逻辑性 0-100
  practicality: number; // 实用性 0-100
  overall: number; // 综合评分 0-100
  reasoning: string; // 评分理由
  confidence: number; // 置信度 0-1
  processingTime: number; // 处理时间(ms)
  metadata: {
    model: string;
    temperature: number;
    maxTokens: number;
    promptTokens: number;
    completionTokens: number;
  };
}

// ==================== 质量报告类型 ====================

/**
 * 质量报告摘要
 */
export interface QualityReportSummary {
  overallScore: number;
  grade: QualityGrade;
  keyStrengths: string[];
  keyWeaknesses: string[];
  topRecommendations: ImprovementSuggestion[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string; // 推荐建议（兼容性）
  quickActions: string[]; // 快速操作建议
  confidence: number; // 置信度
  processingTime: number; // 处理时间
}

/**
 * 质量报告详情
 */
export interface QualityReportDetails {
  dimensionBreakdown: QualityDimensions;
  originalityAnalysis?: {
    score: number;
    duplicateCount: number;
    uniqueSourceCount: number;
    riskSegments: DuplicateSegment[];
    isOriginal: boolean; // 是否原创（兼容性）
    duplicateSegments: number; // 重复片段数（兼容性）
    mostSimilarSource: string; // 最相似来源（兼容性）
    confidence: number; // 置信度（兼容性）
  };
  complianceAnalysis?: {
    score: number;
    passedRules: number;
    failedRules: number;
    criticalIssues: RuleCheckResult[];
    isCompliant: boolean; // 是否合规（兼容性）
    totalRules: number; // 总规则数（兼容性）
    details: string; // 详情（兼容性）
  };
  llmAnalysis?: {
    score: number;
    reasoning: string;
    dimensionScores: Partial<QualityDimensions>;
  };
  llmQualityAnalysis?: {
    overallScore: number;
    readability: number;
    attractiveness: number;
    logic: number;
    practicality: number;
    reasoning: string;
    confidence: number;
  };
  scoreBreakdown: {
    originality: number;
    compliance: number;
    llmQuality: number;
    weights: ScoreWeights;
  };
}

/**
 * 改进计划
 */
export interface ImprovementPlan {
  priority: ImprovementSuggestion[]; // 优先级改进
  optional: ImprovementSuggestion[]; // 可选改进
  longTerm: ImprovementSuggestion[]; // 长期改进
  estimatedImpact: number; // 预估影响 0-100
  estimatedEffort: number; // 预估工作量 0-100
  timeline: {
    immediate: number; // 立即可做的数量
    shortTerm: number; // 短期内可做的数量
    longTerm: number; // 长期规划的数量
  };
}

/**
 * 报告元数据
 */
export interface ReportMetadata {
  generatedAt: Date;
  version: string;
  platform: PlatformId;
  contentLength: number;
  evaluationTime: number;
  evaluationMode: string;
  confidence: number;
}

/**
 * 质量报告
 */
export interface QualityReport {
  summary: QualityReportSummary;
  details: QualityReportDetails;
  improvements: ImprovementPlan;
  metadata: ReportMetadata;
}

/**
 * 报告格式
 */
export type ReportFormat = 'json' | 'markdown' | 'html' | 'text';

/**
 * 报告选项
 */
export interface ReportOptions {
  format?: ReportFormat;
  includeDetails?: boolean;
  includeMetadata?: boolean;
  includeImprovements?: boolean;
  language?: 'zh' | 'en';
  template?: string;
}

// ==================== 快速评估类型 ====================

/**
 * 快速评估结果
 */
export interface QuickEvaluationResult {
  overallScore: number; // 快速评分 0-100（兼容性别名）
  score: number; // 快速评分 0-100
  grade: QualityGrade;
  keyIssues: string[];
  quickFixes: string[];
  needsFullEvaluation: boolean;
  confidence: number;
  processingTime: number;
  recommendations: string[]; // 推荐建议
}

// ==================== 错误和异常类型 ====================

/**
 * 质量评估错误类型
 */
export enum QualityAssessmentErrorType {
  INVALID_INPUT = 'invalid_input',
  ORIGINALITY_DETECTION_ERROR = 'originality_detection_error',
  COMPLIANCE_EVALUATION_ERROR = 'compliance_evaluation_error',
  LLM_EVALUATION_ERROR = 'llm_evaluation_error',
  EVALUATION_ERROR = 'evaluation_error', // 通用评估错误
  QUICK_EVALUATION_ERROR = 'quick_evaluation_error', // 快速评估错误
  CONTENT_TOO_LONG = 'content_too_long', // 内容过长错误
  REPORT_GENERATION_ERROR = 'report_generation_error',
  TIMEOUT_ERROR = 'timeout_error',
  CACHE_ERROR = 'cache_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * 质量评估错误
 */
export class QualityAssessmentError extends Error {
  constructor(
    message: string,
    public type: QualityAssessmentErrorType,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'QualityAssessmentError';
  }
}

// ==================== 配置类型 ====================

/**
 * 质量评估配置
 */
export interface QualityAssessmentConfig {
  originality: {
    enabled: boolean;
    defaultThreshold: number;
    defaultMethod: SimilarityMethod;
    cacheEnabled: boolean;
    maxSourceNotes: number;
  };
  compliance: {
    enabled: boolean;
    strictMode: boolean;
    customRules: boolean;
    ruleWeights: Record<string, number>;
  };
  llmEvaluation: {
    enabled: boolean;
    model: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
  };
  performance: {
    enableCache: boolean;
    cacheSize: number;
    cacheTTL: number;
    maxConcurrency: number;
    defaultTimeout: number;
  };
  reporting: {
    defaultFormat: ReportFormat;
    includeDetails: boolean;
    includeMetadata: boolean;
    language: 'zh' | 'en';
  };
} 