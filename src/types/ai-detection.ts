/**
 * TOM-118: AI检测系统类型定义
 * 支持AI痕迹检测、反AI策略处理和平台内容分析
 */

import { SocialMediaPlatform, PlatformId } from './social-media';
import { AdvancedPromptTemplate, AntiAIDetectionStrategy } from './prompt-advanced';

// ==================== AI痕迹检测类型 ====================

/**
 * AI痕迹检测维度
 */
export interface AITraceDetectionDimensions {
  mechanicalExpression: number; // 机械化表达 0-100
  patternedLanguage: number; // 模式化语言 0-100
  emotionalDeficiency: number; // 情感缺失 0-100
  structuralRigidity: number; // 结构僵化 0-100
  vocabularyHomogeneity: number; // 词汇同质化 0-100
}

/**
 * 机械化表达检测结果
 */
export interface MechanicalExpressionReport {
  score: number; // 机械化程度 0-100 (越高越机械)
  detectedPatterns: DetectedPattern[];
  frequentPhrases: Array<{
    phrase: string;
    frequency: number;
    mechanicalScore: number;
  }>;
  recommendations: string[];
  confidence: number;
}

/**
 * 模式化语言检测结果
 */
export interface PatternedLanguageReport {
  score: number; // 模式化程度 0-100 (越高越模式化)
  repeatedStructures: Array<{
    pattern: string;
    frequency: number;
    examples: string[];
  }>;
  templateMatches: Array<{
    template: string;
    similarity: number;
    matchedSegments: string[];
  }>;
  recommendations: string[];
  confidence: number;
}

/**
 * 情感缺失检测结果
 */
export interface EmotionalDeficiencyReport {
  score: number; // 情感缺失程度 0-100 (越高越缺乏情感)
  emotionalIndicators: {
    personalPronouns: number; // 人称代词使用频率
    emotionalWords: number; // 情感词汇密度
    experientialElements: number; // 体验性元素
    subjectiveExpressions: number; // 主观表达
  };
  missingElements: string[];
  recommendations: string[];
  confidence: number;
}

/**
 * 检测到的模式
 */
export interface DetectedPattern {
  type: 'mechanical' | 'templated' | 'repetitive' | 'formulaic';
  pattern: string;
  examples: string[];
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  suggestion: string;
}

/**
 * AI检测风险评估
 */
export interface AIDetectionRisk {
  overallRisk: number; // 总体风险 0-1 (1表示高风险被检测为AI)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  primaryIndicators: string[]; // 主要AI痕迹指标
  riskFactors: Array<{
    factor: string;
    weight: number;
    score: number;
    description: string;
  }>;
  recommendedActions: string[];
  confidence: number;
}

/**
 * 自然度评分
 */
export interface NaturalnessScore {
  score: number; // 自然度评分 0-100 (越高越自然)
  dimensions: {
    languageFlow: number; // 语言流畅度
    humanLikeness: number; // 人类相似度
    spontaneity: number; // 自发性
    authenticity: number; // 真实性
    personality: number; // 个性化
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidence: number;
}

/**
 * 人类内容对比分析结果
 */
export interface HumanComparisonReport {
  similarity: number; // 与人类内容相似度 0-1
  differenceAnalysis: {
    vocabulary: number; // 词汇差异
    sentence: number; // 句式差异
    structure: number; // 结构差异
    tone: number; // 语调差异
  };
  humanLikeFeatures: string[];
  aiLikeFeatures: string[];
  recommendations: string[];
  confidence: number;
}

/**
 * 语言模式分析结果
 */
export interface LanguagePatternAnalysis {
  sentenceVariety: number; // 句式多样性 0-100
  vocabularyRichness: number; // 词汇丰富度 0-100
  structuralComplexity: number; // 结构复杂度 0-100
  rhythmNaturalness: number; // 韵律自然度 0-100
  patterns: Array<{
    type: string;
    frequency: number;
    naturalness: number;
    examples: string[];
  }>;
  recommendations: string[];
}

/**
 * AI检测完整报告
 */
export interface AIDetectionReport {
  overallRisk: number; // 总体风险 0-1
  overallScore: number; // 总体AI痕迹评分 0-100 (越低越好)
  dimensions: AITraceDetectionDimensions;
  mechanicalExpression: MechanicalExpressionReport;
  patternedLanguage: PatternedLanguageReport;
  emotionalDeficiency: EmotionalDeficiencyReport;
  naturalness: NaturalnessScore;
  riskAssessment: AIDetectionRisk;
  detectedPatterns: DetectedPattern[];
  improvementSuggestions: AIImprovementSuggestion[];
  processingTime: number;
  confidence: number;
  metadata: {
    contentLength: number;
    analysisMethod: string;
    detectionModel: string;
    timestamp: Date;
  };
}

/**
 * AI改进建议
 */
export interface AIImprovementSuggestion {
  category: 'language' | 'structure' | 'emotion' | 'style' | 'content';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  examples: string[];
  expectedImprovement: number; // 预期改进效果 0-100
  estimatedEffort: 'low' | 'medium' | 'high';
  applicableStrategies: string[];
}

// ==================== 反AI策略处理类型 ====================

/**
 * 语言自然化设置
 */
export interface LanguageNaturalizationConfig {
  sentenceVariation: {
    enabled: boolean;
    level: number; // 0-1
    patterns: string[];
  };
  colloquialLevel: {
    enabled: boolean;
    intensity: number; // 0-1
    targetExpressions: string[];
  };
  emotionalNuance: {
    enabled: boolean;
    depth: number; // 0-1
    emotionalMarkers: string[];
  };
}

/**
 * 个性化注入设置
 */
export interface PersonalizationConfig {
  userStyleMimicry: {
    enabled: boolean;
    styleProfile: UserStyleProfile;
    adaptationLevel: number; // 0-1
  };
  personalExperience: {
    enabled: boolean;
    experienceLevel: number; // 0-1
    contextualRelevance: number; // 0-1
  };
  uniquePerspective: {
    enabled: boolean;
    originalityLevel: number; // 0-1
    viewpointDiversity: number; // 0-1
  };
}

/**
 * 适度不完美化设置
 */
export interface ImperfectionConfig {
  minorInconsistency: {
    enabled: boolean;
    frequency: number; // 0-0.1
    types: ('stylistic' | 'factual' | 'structural')[];
  };
  naturalPauses: {
    enabled: boolean;
    frequency: number; // 0-1
    pauseTypes: string[];
  };
  colloquialErrors: {
    enabled: boolean;
    frequency: number; // 0-0.05
    errorTypes: ('grammar' | 'spelling' | 'punctuation')[];
  };
}

/**
 * 用户风格档案
 */
export interface UserStyleProfile {
  writingStyle: 'formal' | 'casual' | 'technical' | 'creative' | 'conversational';
  tonePreference: 'professional' | 'friendly' | 'humorous' | 'authoritative' | 'empathetic';
  vocabularyLevel: 'simple' | 'moderate' | 'advanced' | 'expert';
  sentenceStructure: 'simple' | 'complex' | 'varied';
  personalMarkers: string[]; // 个人语言习惯标记
  preferredPhrases: string[]; // 偏好短语
  avoidedPatterns: string[]; // 避免的模式
}

/**
 * 体验上下文
 */
export interface ExperienceContext {
  domain: string; // 领域
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  personalStories: string[]; // 个人故事
  preferences: string[]; // 个人偏好
  backgroundKnowledge: string[]; // 背景知识
  culturalContext: string; // 文化背景
}

/**
 * 反AI策略应用结果
 */
export interface AntiAIStrategyResult {
  originalContent: string;
  processedContent: string;
  appliedStrategies: string[];
  improvements: {
    naturalness: number; // 自然度提升 0-100
    aiDetectionReduction: number; // AI检测风险降低 0-100
    humanLikeness: number; // 人类相似度提升 0-100
  };
  qualityMetrics: {
    readability: number;
    coherence: number;
    authenticity: number;
  };
  processingTime: number;
  confidence: number;
}

// ==================== 平台内容分析类型 ====================

/**
 * 平台特性分析结果
 */
export interface PlatformCharacteristicsAnalysis {
  platformId: PlatformId;
  contentFit: number; // 内容适配度 0-100
  audienceAlignment: number; // 受众对齐度 0-100
  featureCompliance: number; // 特性合规度 0-100
  engagementPotential: number; // 互动潜力 0-100
  competitiveness: number; // 竞争力 0-100
  recommendations: string[];
  confidence: number;
}

/**
 * 平台规则详情
 */
export interface PlatformRule {
  id: string;
  name: string;
  description: string;
  type: 'content' | 'format' | 'style' | 'interaction' | 'technical';
  importance: 'critical' | 'important' | 'recommended' | 'optional';
  validator: (content: string) => boolean;
  suggestion: string;
  examples: string[];
}

/**
 * 受众分析结果
 */
export interface AudienceAnalysis {
  targetDemographics: {
    ageGroup: string;
    interests: string[];
    behaviorPatterns: string[];
    preferences: string[];
    gender?: string;
    location?: string;
  };
  contentResonance: number; // 内容共鸣度 0-100
  languageAppropriateRate: number; // 语言适合度 0-100
  topicRelevance: number; // 话题相关性 0-100
  engagementPrediction: number; // 互动预测 0-100
  recommendations: string[];
  confidence: number;
}

/**
 * 平台优化建议
 */
export interface PlatformOptimization {
  currentScore: number;
  optimizedScore: number; // 优化后预期评分
  modifications: Array<{
    type: 'content' | 'structure' | 'style' | 'format';
    description: string;
    before: string;
    after: string;
    impact: number; // 影响程度 0-100
  }>;
  priority: 'high' | 'medium' | 'low';
  estimatedImprovement: number;
  implementationEffort: 'low' | 'medium' | 'high';
  confidence?: number;
}

/**
 * 平台适配建议
 */
export interface AdaptationSuggestion {
  fromPlatform: PlatformId;
  toPlatform: PlatformId;
  adaptationStrategy: string;
  requiredChanges: Array<{
    aspect: string;
    description: string;
    from?: any;
    to?: any;
    reason?: string;
    examples?: string[];
  }>;
  contentTransformation: {
    length: { from: number; to: number };
    style: { from: string; to: string };
  };
  estimatedSuccess: number; // 成功率预测 0-100
  difficulty: 'easy' | 'moderate' | 'difficult';
  confidence?: number;
}

/**
 * 热门内容分析
 */
export interface PopularContentAnalysis {
  platformId: PlatformId;
  category: string;
  trendsIdentified: Array<{
    trend: string;
    frequency: number;
    impact: number;
    examples: string[];
  }>;
  successPatterns: SuccessPattern[];
  recommendedElements: string[];
  avoidedElements: string[];
  timelineRelevance: number; // 时效性相关度 0-100
}

/**
 * 成功模式
 */
export interface SuccessPattern {
  patternId: string;
  description: string;
  platform: PlatformId;
  category?: string;
  elements: string[];
  score: number; // Effectiveness score (0-100)
  examples?: string[];
  confidence?: number; // Confidence in this pattern's effectiveness (0-1)
}

/**
 * 平台适配度评估结果
 */
export interface PlatformComplianceReport {
  platformId: PlatformId;
  overallScore: number; // 总体适配度 0-100
  characteristicsAnalysis: PlatformCharacteristicsAnalysis;
  audienceAnalysis: AudienceAnalysis;
  ruleCompliance: Array<{
    rule: PlatformRule;
    compliance: 'pass' | 'warning' | 'fail';
    score: number;
    suggestion: string;
  }>;
  optimization: PlatformOptimization;
  recommendations: string[];
  processingTime: number;
  confidence: number;
}

// ==================== 增强质量评估类型 ====================

/**
 * 增强质量评估结果 (扩展现有QualityEvaluationResult)
 */
export interface EnhancedQualityReport {
  // 继承基础质量评估结果
  overallScore: number;
  originalityScore: number;
  platformComplianceScore: number;
  readabilityScore: number;
  
  // 新增AI痕迹评估
  aiDetectionReport: AIDetectionReport;
  naturalnessScore: number;
  humanLikenessScore: number;
  
  // 平台特化评估
  platformAnalysis: PlatformComplianceReport;
  audienceAlignment: number;
  viralPotential: number;
  
  // 综合建议
  optimizationPriority: OptimizationPriority[];
  antiAIRecommendations: AntiAIRecommendation[];
  platformSpecificSuggestions: PlatformSuggestion[];
  
  // 元数据
  processingTime: number;
  confidence: number;
  timestamp: Date;
}

/**
 * 优化优先级
 */
export interface OptimizationPriority {
  category: 'ai-detection' | 'platform-fit' | 'readability' | 'engagement';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  expectedImpact: number; // 0-100
  effort: 'low' | 'medium' | 'high';
  timeline: 'immediate' | 'short-term' | 'long-term';
}

/**
 * 反AI建议
 */
export interface AntiAIRecommendation {
  strategy: 'naturalization' | 'personalization' | 'imperfection';
  technique: string;
  description: string;
  example: string;
  expectedReduction: number; // AI检测率预期降低百分比
  difficulty: 'easy' | 'moderate' | 'difficult';
}

/**
 * 平台特定建议
 */
export interface PlatformSuggestion {
  platformId: PlatformId;
  aspect: 'content' | 'format' | 'style' | 'interaction';
  suggestion: string;
  reasoning: string;
  example: string;
  impact: number; // 0-100
}

/**
 * Prompt质量评估结果
 */
export interface PromptQualityReport {
  templateId: string;
  overallScore: number; // 0-100
  aiDetectionRisk: number; // 0-1
  platformFitness: Record<PlatformId, number>; // 各平台适配度
  generationQuality: {
    consistency: number; // 一致性
    creativity: number; // 创造性
    relevance: number; // 相关性
    naturalness: number; // 自然度
  };
  recommendations: string[];
  optimizationSuggestions: Array<{
    layer: 'system' | 'task' | 'context' | 'output';
    suggestion: string;
    expectedImprovement: number;
  }>;
  processingTime: number;
  confidence: number;
}

// ==================== 评估上下文和选项 ====================

/**
 * 评估上下文
 */
export interface EvaluationContext {
  platform: SocialMediaPlatform;
  contentType: string;
  targetAudience?: string;
  purpose: 'informative' | 'promotional' | 'entertainment' | 'educational' | 'social';
  urgency: 'low' | 'medium' | 'high';
  qualityThreshold: number; // 0-100
  customRequirements: string[];
}

/**
 * 优化上下文
 */
export interface OptimizationContext {
  targetPlatform: PlatformId;
  currentQuality: number;
  targetQuality: number;
  allowedModifications: ('content' | 'structure' | 'style' | 'format')[];
  preserveAspects: string[]; // 需要保留的方面
  optimizationBudget: 'low' | 'medium' | 'high'; // 优化投入预算
}

/**
 * 优化后内容
 */
export interface OptimizedContent {
  originalContent: string;
  optimizedContent: string;
  platformId: PlatformId;
  targetAudience?: string; // Optional: description of the targeted audience segment
  changes: ContentChangeDetail[];
  scoreBefore?: number;    // Overall score before optimization (0-100)
  scoreAfter?: number;     // Overall score after optimization (0-100)
  optimizationSummary?: string; // Brief summary of key optimizations made
  confidence?: number; // Confidence in the optimization effectiveness (0-1)
}

// ==================== 错误处理 ====================

/**
 * AI检测错误类型
 */
export enum AIDetectionErrorType {
  INVALID_CONTENT = 'invalid_content',
  DETECTION_MODEL_ERROR = 'detection_model_error',
  STRATEGY_APPLICATION_ERROR = 'strategy_application_error',
  PLATFORM_ANALYSIS_ERROR = 'platform_analysis_error',
  AUDIENCE_ANALYSIS_ERROR = 'audience_analysis_error',
  OPTIMIZATION_ERROR = 'optimization_error',
  ADAPTATION_ERROR = 'adaptation_error',
  CONTENT_ANALYSIS_ERROR = 'content_analysis_error',
  REPORT_GENERATION_ERROR = 'report_generation_error',
  INVALID_PLATFORM = 'invalid_platform',
  TIMEOUT_ERROR = 'timeout_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * AI检测错误类
 */
export class AIDetectionError extends Error {
  constructor(
    message: string,
    public type: AIDetectionErrorType,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AIDetectionError';
  }
}

// ==================== 工具函数类型 ====================

/**
 * AI检测配置
 */
export interface AIDetectionConfig {
  enabled: boolean;
  detectionThreshold: number; // 0-1
  naturalizeThreshold: number; // 0-1
  enableAdvancedPatterns: boolean;
  enableEmotionalAnalysis: boolean;
  enableLanguagePattern: boolean;
  cacheEnabled: boolean;
  timeout: number; // milliseconds
}

/**
 * 默认配置
 */
export const DEFAULT_AI_DETECTION_CONFIG: AIDetectionConfig = {
  enabled: true,
  detectionThreshold: 0.7,
  naturalizeThreshold: 0.5,
  enableAdvancedPatterns: true,
  enableEmotionalAnalysis: true,
  enableLanguagePattern: true,
  cacheEnabled: true,
  timeout: 10000
};

// New Type: PlatformTrends
export interface PlatformTrend {
  trendName: string;
  description: string;
  relevanceScore: number; // 0-100
  recentExamples: string[];
  potentialImpact: 'high' | 'medium' | 'low';
  timeframe: string; // e.g., "last-7-days", "last-30-days"
}

export interface PlatformTrends {
  platformId: PlatformId;
  trends: PlatformTrend[];
  lastUpdated: Date;
}

// New Type: ContentChangeDetail
export interface ContentChangeDetail {
  type: 'content' | 'structure' | 'style' | 'format' | 'seo' | 'compliance';
  description: string;
  originalExcerpt?: string;
  optimizedExcerpt?: string;
  impactScore?: number; // 0-100, estimated impact of this specific change
  reason?: string;
}

export interface AIDetectionErrorDetails {
  // ... existing code ...
} 