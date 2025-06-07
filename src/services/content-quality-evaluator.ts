/**
 * TOM-109: 内容质量评估系统 - 核心评估器
 * 整合原创性检测、平台适配度评估和LLM质量评分
 */

import { OriginalityDetector } from './originality-detector';
import { PlatformComplianceEvaluator } from './platform-compliance-evaluator';
import { QualityScorer } from './quality-scorer';
import { QualityReportGenerator } from './quality-report-generator';
import { AIService } from './AIService';
import { SocialMediaPlatform, PlatformId } from '../types/social-media';
import {
  Note,
  QualityEvaluationOptions,
  QualityEvaluationResult,
  ContentEvaluationRequest,
  BatchEvaluationOptions,
  BatchEvaluationResult,
  QuickEvaluationResult,
  OverallQualityScore,
  LLMQualityScore,
  QualityReport,
  ScoreWeights,
  QualityGrade,
  QualityCriteria,
  QualityDimensions,
  QualityAssessmentError,
  QualityAssessmentErrorType
} from '../types/quality-assessment';

/**
 * 内容质量评估器
 * 提供综合的内容质量评估功能，整合多个评估维度
 */
export class ContentQualityEvaluator {
  private originalityDetector: OriginalityDetector;
  private platformComplianceEvaluator: PlatformComplianceEvaluator;
  private qualityScorer: QualityScorer;
  private reportGenerator: QualityReportGenerator;
  private aiService: AIService;
  private readonly defaultOptions: Required<QualityEvaluationOptions>;
  private readonly defaultWeights: ScoreWeights;

  constructor(
    originalityDetector: OriginalityDetector,
    platformComplianceEvaluator: PlatformComplianceEvaluator,
    qualityScorer: QualityScorer,
    reportGenerator: QualityReportGenerator,
    aiService: AIService
  ) {
    this.originalityDetector = originalityDetector;
    this.platformComplianceEvaluator = platformComplianceEvaluator;
    this.qualityScorer = qualityScorer;
    this.reportGenerator = reportGenerator;
    this.aiService = aiService;

    // 默认配置
    this.defaultOptions = {
      includeOriginality: true,
      includeCompliance: true,
      includePlatformCompliance: true,
      includeLLMEvaluation: true,
      includeLLMQuality: true,
      enableDetailedReport: true,
      enableCache: true,
      strictMode: false,
      customWeights: {},
      timeout: 30000,
      maxProcessingTime: 30000, // 30秒
      confidenceThreshold: 0.7,
      llmCriteria: ['readability', 'attractiveness', 'logic', 'practicality']
    };

    // 默认评分权重
    this.defaultWeights = {
      originality: 0.3,
      compliance: 0.3,
      platformCompliance: 0.3,
      llmQuality: 0.4,
      readability: 0.1,
      attractiveness: 0.1,
      logic: 0.1,
      practicality: 0.1
    };
  }

  /**
   * 综合质量评估
   */
  async evaluateContent(
    content: string,
    platform: SocialMediaPlatform,
    sourceNotes?: Note[],
    options?: QualityEvaluationOptions
  ): Promise<QualityEvaluationResult> {
    console.log('【DEBUG】evaluateContent 参数:', { content, platform });
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };
    const weights = { ...this.defaultWeights, ...opts.customWeights };

    try {
      // 输入验证
      this.validateInput(content, platform);

      // 并行执行各项评估
      const evaluationPromises: Promise<any>[] = [];
      
      // 原创性检测
      if (opts.includeOriginality && sourceNotes && sourceNotes.length > 0) {
        evaluationPromises.push(
          this.originalityDetector.detectOriginality(content, sourceNotes)
        );
      } else {
        evaluationPromises.push(Promise.resolve(null));
      }

      // 平台适配度评估
      if (opts.includePlatformCompliance) {
        evaluationPromises.push(
          this.platformComplianceEvaluator.evaluateCompliance(content, platform, {
            strictMode: opts.strictMode
          })
        );
      } else {
        evaluationPromises.push(Promise.resolve(null));
      }

      // LLM质量评估
      if (opts.includeLLMQuality) {
        evaluationPromises.push(
          this.scoreWithLLM(content, platform, opts.llmCriteria)
        );
      } else {
        evaluationPromises.push(Promise.resolve(null));
      }

      // 等待所有评估完成
      const [originalityResult, complianceResult, llmQualityResult] = await Promise.all(evaluationPromises);

      // 计算综合评分
      const overallScore = this.calculateOverallScore(
        originalityResult?.overallScore || 100,
        complianceResult?.overallScore || 100,
        llmQualityResult,
        weights
      );

      const processingTime = Date.now() - startTime;
      const confidence = this.calculateConfidence(originalityResult, complianceResult, llmQualityResult);

      // 创建临时结果对象用于报告生成
      const tempResult: QualityEvaluationResult = {
        overall: overallScore,
        originality: originalityResult,
        platformCompliance: complianceResult,
        llmQuality: llmQualityResult,
        report: {} as QualityReport, // 临时占位符
        processingTime,
        confidence,
        timestamp: Date.now(),
        metadata: {
          contentLength: content.length,
          platform: platform.id,
          evaluationMode: opts.strictMode ? 'strict' : 'normal',
          version: '1.0.0'
        }
      };

      // 生成质量报告
      const report = opts.enableDetailedReport 
        ? this.reportGenerator.generateDetailedReport(tempResult)
        : this.reportGenerator.generateDetailedReport(tempResult); // 使用详细报告作为默认

      const finalProcessingTime = Date.now() - startTime;
      
      const result: QualityEvaluationResult = {
        overall: overallScore,
        originality: originalityResult,
        platformCompliance: complianceResult,
        llmQuality: llmQualityResult,
        report,
        processingTime: finalProcessingTime,
        confidence,
        timestamp: Date.now(),
        metadata: {
          contentLength: content.length,
          platform: platform.id,
          evaluationMode: opts.strictMode ? 'strict' : 'normal',
          version: '1.0.0'
        }
      };

      return result;

    } catch (error) {
      throw new QualityAssessmentError(
        `内容质量评估失败: ${error.message}`,
        QualityAssessmentErrorType.EVALUATION_ERROR,
        { 
          platform: platform.id, 
          contentLength: content.length,
          processingTime: Date.now() - startTime
        }
      );
    }
  }

  /**
   * 批量评估
   */
  async batchEvaluate(
    contents: ContentEvaluationRequest[],
    options?: BatchEvaluationOptions
  ): Promise<BatchEvaluationResult> {
    const startTime = Date.now();
    const opts = { 
      concurrency: 3, 
      continueOnError: true, 
      enableProgressTracking: false,
      ...options 
    };

    const results: QualityEvaluationResult[] = [];
    const errors: Array<{ requestId: string; error: Error }> = [];
    
    // 为没有ID的请求生成ID
    const requestsWithIds = contents.map((request, index) => ({
      ...request,
      id: request.id || `request-${index}-${Date.now()}`
    }));
    
    // 分批处理
    const batches = this.createBatches(requestsWithIds, opts.concurrency);
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (request) => {
        try {
          const result = await this.evaluateContent(
            request.content,
            request.platform,
            request.sourceNotes,
            request.options
          );
          return { requestId: request.id!, result };
        } catch (error) {
          if (opts.continueOnError) {
            errors.push({ requestId: request.id!, error: error as Error });
            return null;
          } else {
            throw error;
          }
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(item => {
        if (item && item.result) {
          results.push(item.result);
        }
      });
    }

    const processingTime = Date.now() - startTime;
    
    // 计算批量统计
    const summary = this.calculateBatchSummary(results, processingTime, contents.length);

    return {
      results,
      summary,
      errors: errors.length > 0 ? errors : undefined,
      metadata: {
        totalRequests: contents.length,
        successfulRequests: results.length,
        failedRequests: errors.length,
        processingTime,
        concurrency: opts.concurrency
      }
    };
  }

  /**
   * 快速评估 (仅核心指标)
   */
  async quickEvaluate(
    content: string,
    platform: SocialMediaPlatform
  ): Promise<QuickEvaluationResult> {
    const startTime = Date.now();

    try {
      // 只进行平台适配度评估和基础质量评分
      const [complianceResult, basicQuality] = await Promise.all([
        this.platformComplianceEvaluator.evaluateCompliance(content, platform),
        this.getBasicQualityScore(content, platform)
      ]);

      const overallScore = (complianceResult.overallScore + basicQuality) / 2;
      const processingTime = Date.now() - startTime;
      const grade = this.determineQualityGrade(overallScore);
      const quickRecommendations = this.generateQuickRecommendations(complianceResult, basicQuality);

      // 识别关键问题
      const keyIssues: string[] = [];
      if (complianceResult.overallScore < 70) {
        keyIssues.push('平台适配度不足');
      }
      if (basicQuality < 70) {
        keyIssues.push('内容质量有待提升');
      }

      // 生成快速修复建议
      const quickFixes: string[] = [];
      if (complianceResult.ruleChecks) {
        const failedRules = complianceResult.ruleChecks.filter(rule => !rule.passed);
        failedRules.slice(0, 3).forEach(rule => {
          if (rule.suggestions && rule.suggestions.length > 0) {
            quickFixes.push(rule.suggestions[0]);
          }
        });
      }

      return {
        overallScore,
        score: overallScore, // 兼容性别名
        grade,
        keyIssues,
        quickFixes,
        needsFullEvaluation: overallScore < 80 || keyIssues.length > 2,
        confidence: complianceResult.metadata ? 
          complianceResult.metadata.passedRules / complianceResult.metadata.totalRules : 0.7,
        processingTime,
        recommendations: quickRecommendations
      };

    } catch (error) {
      throw new QualityAssessmentError(
        `快速评估失败: ${error.message}`,
        QualityAssessmentErrorType.QUICK_EVALUATION_ERROR,
        { platform: platform.id, contentLength: content.length }
      );
    }
  }

  /**
   * LLM质量评估
   */
  private async scoreWithLLM(
    content: string,
    platform: SocialMediaPlatform,
    criteria: QualityCriteria[]
  ): Promise<LLMQualityScore> {
    const prompt = this.buildLLMEvaluationPrompt(content, platform, criteria);
    
    try {
      const message = {
        id: `quality-eval-${Date.now()}`,
        role: 'user' as const,
        content: prompt,
        timestamp: Date.now()
      };
      
      const response = await this.aiService.sendMessage(message);
      return this.parseLLMResponse(response.content);
    } catch (error) {
      throw new QualityAssessmentError(
        `LLM质量评估失败: ${error.message}`,
        QualityAssessmentErrorType.LLM_EVALUATION_ERROR,
        { platform: platform.id }
      );
    }
  }

  /**
   * 计算综合评分
   */
  private calculateOverallScore(
    originalityScore: number,
    complianceScore: number,
    llmScore: LLMQualityScore | null,
    weights: ScoreWeights
  ): OverallQualityScore {
    const llmOverallScore = llmScore?.overall || 80; // 默认分数

    const total = (
      originalityScore * weights.originality +
      complianceScore * weights.platformCompliance +
      llmOverallScore * weights.llmQuality
    );

    const grade = this.determineQualityGrade(total);
    const recommendation = this.generateRecommendation(total, grade);

    // 构建质量维度
    const dimensions: QualityDimensions = {
      originality: originalityScore,
      compliance: complianceScore,
      readability: llmScore?.readability || 75,
      attractiveness: llmScore?.attractiveness || 75,
      logic: llmScore?.logic || 75,
      practicality: llmScore?.practicality || 75
    };

    return {
      total: Math.round(total * 100) / 100,
      dimensions,
      breakdown: {
        originality: originalityScore,
        compliance: complianceScore,
        llmQuality: llmOverallScore
      },
      weights,
      grade,
      recommendation,
      confidence: llmScore?.confidence || 0.8
    };
  }

  /**
   * 构建LLM评估提示词
   */
  private buildLLMEvaluationPrompt(
    content: string,
    platform: SocialMediaPlatform,
    criteria: QualityCriteria[]
  ): string {
    return `请对以下内容进行质量评估，针对${platform.name}平台：

内容：
${content}

评估维度：
${criteria.map(c => `- ${c}`).join('\n')}

请按以下JSON格式返回评分（0-100分）：
{
  "readability": 分数,
  "attractiveness": 分数,
  "logic": 分数,
  "practicality": 分数,
  "overall": 综合分数,
  "reasoning": "评分理由",
  "confidence": 置信度(0-1)
}

评分标准：
- 可读性：语言流畅、结构清晰、易于理解
- 吸引力：内容有趣、引人入胜、符合平台特色
- 逻辑性：论述合理、条理清楚、前后一致
- 实用性：内容有价值、对读者有帮助

请确保返回有效的JSON格式。`;
  }

  /**
   * 解析LLM响应
   */
  private parseLLMResponse(response: string): LLMQualityScore {
    try {
      // 提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new QualityAssessmentError(
          '无法找到有效的JSON响应',
          QualityAssessmentErrorType.LLM_EVALUATION_ERROR,
          { response: response.substring(0, 100) }
        );
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // 验证必需字段
      if (!parsed.readability && !parsed.attractiveness && !parsed.logic && !parsed.practicality) {
        throw new QualityAssessmentError(
          'LLM响应缺少必需的评分字段',
          QualityAssessmentErrorType.LLM_EVALUATION_ERROR,
          { parsed }
        );
      }
      
      return {
        readability: this.validateScore(parsed.readability),
        attractiveness: this.validateScore(parsed.attractiveness),
        logic: this.validateScore(parsed.logic),
        practicality: this.validateScore(parsed.practicality),
        overall: this.validateScore(parsed.overall),
        reasoning: parsed.reasoning || '无评分理由',
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.8)),
        processingTime: parsed.processingTime || 0,
        metadata: {
          model: parsed.model || 'unknown',
          temperature: parsed.temperature || 0.7,
          maxTokens: parsed.maxTokens || 1000,
          promptTokens: parsed.promptTokens || 0,
          completionTokens: parsed.completionTokens || 0
        }
      };
    } catch (error) {
      if (error instanceof QualityAssessmentError) {
        throw error;
      }
      
      throw new QualityAssessmentError(
        `LLM响应解析失败: ${error.message}`,
        QualityAssessmentErrorType.LLM_EVALUATION_ERROR,
        { response: response.substring(0, 100), error: error.message }
      );
    }
  }

  /**
   * 验证评分有效性
   */
  private validateScore(score: any): number {
    const num = Number(score);
    if (isNaN(num)) return 75; // 默认分数
    return Math.max(0, Math.min(100, num));
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(
    originalityResult: any,
    complianceResult: any,
    llmQualityResult: LLMQualityScore | null
  ): number {
    let totalConfidence = 0;
    let count = 0;

    if (originalityResult?.confidence) {
      totalConfidence += originalityResult.confidence;
      count++;
    }

    if (complianceResult?.metadata) {
      // 基于规则通过率计算置信度
      const passRate = complianceResult.metadata.passedRules / complianceResult.metadata.totalRules;
      totalConfidence += passRate;
      count++;
    }

    if (llmQualityResult?.confidence) {
      totalConfidence += llmQualityResult.confidence;
      count++;
    }

    return count > 0 ? totalConfidence / count : 0.7;
  }

  /**
   * 确定质量等级
   */
  private determineQualityGrade(score: number): QualityGrade {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'unacceptable';
  }

  /**
   * 生成推荐建议
   */
  private generateRecommendation(score: number, grade: QualityGrade): string {
    const recommendations = {
      excellent: '内容质量优秀，可以直接发布。',
      good: '内容质量良好，建议稍作优化后发布。',
      fair: '内容质量一般，建议根据评估报告进行改进。',
      poor: '内容质量较差，需要大幅改进后再发布。',
      unacceptable: '内容质量不合格，建议重新创作。'
    };

    return recommendations[grade];
  }

  /**
   * 获取基础质量评分
   */
  private async getBasicQualityScore(content: string, platform: SocialMediaPlatform): Promise<number> {
    const qualityScore = this.qualityScorer.calculateQualityScore(content, platform);
    return qualityScore.overall;
  }

  /**
   * 生成快速推荐
   */
  private generateQuickRecommendations(
    complianceResult: any,
    basicQuality: number
  ): string[] {
    const recommendations: string[] = [];

    if (complianceResult.overallScore < 70) {
      recommendations.push('提升平台适配度：' + complianceResult.improvements[0]?.description || '优化内容格式');
    }

    if (basicQuality < 70) {
      recommendations.push('提升内容质量：改善语言表达和结构组织');
    }

    if (recommendations.length === 0) {
      recommendations.push('内容质量良好，可以发布');
    }

    return recommendations;
  }

  /**
   * 创建批处理分组
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * 计算批量统计
   */
  private calculateBatchSummary(results: QualityEvaluationResult[], processingTime: number, totalRequests: number = 0) {
    const successCount = results.length;
    const errorCount = totalRequests - successCount;
    
    if (results.length === 0) {
      return {
        totalProcessed: 0,
        successCount: 0,
        errorCount,
        averageScore: 0,
        excellentCount: 0,
        goodCount: 0,
        fairCount: 0,
        poorCount: 0,
        unacceptableCount: 0,
        averageProcessingTime: 0,
        totalProcessingTime: processingTime
      };
    }

    const scores = results.map(r => r.overall.total);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const gradeCounts = results.reduce((counts, result) => {
      counts[result.overall.grade]++;
      return counts;
    }, {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      unacceptable: 0
    });

    const averageProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;

    return {
      totalProcessed: results.length,
      successCount,
      errorCount,
      averageScore,
      excellentCount: gradeCounts.excellent,
      goodCount: gradeCounts.good,
      fairCount: gradeCounts.fair,
      poorCount: gradeCounts.poor,
      unacceptableCount: gradeCounts.unacceptable,
      averageProcessingTime,
      totalProcessingTime: processingTime
    };
  }

  /**
   * 输入验证
   */
  private validateInput(content: string, platform: SocialMediaPlatform): void {
    if (!content || content.trim().length === 0) {
      throw new QualityAssessmentError(
        '内容不能为空',
        QualityAssessmentErrorType.INVALID_INPUT,
        { contentLength: content?.length || 0 }
      );
    }

    if (!platform || !platform.id) {
      throw new QualityAssessmentError(
        '平台信息无效',
        QualityAssessmentErrorType.INVALID_INPUT,
        { platform: platform?.id || 'unknown' }
      );
    }

    if (content.length > 50000) {
      throw new QualityAssessmentError(
        '内容长度超过限制（最大50000字符）',
        QualityAssessmentErrorType.CONTENT_TOO_LONG,
        { contentLength: content.length, maxLength: 50000 }
      );
    }
  }
} 