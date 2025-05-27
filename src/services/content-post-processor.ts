import {
  ProcessedContent,
  ProcessingOptions,
  ProcessingStep,
  ProcessingWarning,
  ProcessingSuggestion,
  ValidationResult,
  ContentInput,
  BatchProcessingOptions,
  BatchProcessingResult,
  BatchProgress,
  BatchError,
  ProcessingError,
  RetryStrategy,
  PostProcessorConfig
} from '../types/content-processing';
import { SocialMediaPlatform } from '../types/social-media';
import { LengthProcessor } from './length-processor';
import { StyleAssessor } from './style-assessor';
import { ContentFormatter } from './content-formatter';
import { QualityScorer } from './quality-scorer';
import { Logger } from '../utils/logger';

/**
 * 内容后处理器 - 主控制器
 * 整合长度检查、风格评估、格式化和质量评分功能
 */
export class ContentPostProcessor {
  private logger: Logger;
  private lengthProcessor: LengthProcessor;
  private styleAssessor: StyleAssessor;
  private formatter: ContentFormatter;
  private qualityScorer: QualityScorer;
  private config: PostProcessorConfig;
  private processingCache: Map<string, ProcessedContent>;

  constructor(config?: Partial<PostProcessorConfig>) {
    this.logger = new Logger('ContentPostProcessor');
    this.lengthProcessor = new LengthProcessor();
    this.styleAssessor = new StyleAssessor();
    this.formatter = new ContentFormatter();
    this.qualityScorer = new QualityScorer();
    this.processingCache = new Map();
    
    this.config = {
      enableLengthProcessing: true,
      enableStyleAssessment: true,
      enableFormatting: true,
      enableQualityScoring: true,
      enableCaching: true,
      enableMetrics: true,
      defaultOptions: {
        strictMode: false,
        autoFix: true,
        preserveOriginal: true,
        enableCache: true,
        timeout: 30000,
        retryAttempts: 3
      },
      retryStrategy: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2,
        retryableErrors: ['timeout', 'network', 'temporary'],
        shouldRetry: (error: ProcessingError, attempt: number) => {
          return attempt < 3 && this.config.retryStrategy.retryableErrors.includes(error.type);
        },
        getRetryDelay: (attempt: number) => {
          return this.config.retryStrategy.retryDelay * Math.pow(this.config.retryStrategy.backoffMultiplier, attempt);
        }
      },
      timeoutMs: 30000,
      ...config
    };

    this.logger.info('ContentPostProcessor initialized');
  }

  /**
   * 处理单个内容
   */
  async processContent(
    content: string,
    platform: SocialMediaPlatform,
    options?: ProcessingOptions
  ): Promise<ProcessedContent> {
    const startTime = Date.now();
    const mergedOptions = { ...this.config.defaultOptions, ...options };
    const cacheKey = this.generateCacheKey(content, platform, mergedOptions);

    this.logger.info(`Processing content for platform: ${platform.id}`);

    // 检查缓存
    if (this.config.enableCaching && mergedOptions.enableCache && this.processingCache.has(cacheKey)) {
      this.logger.info('Returning cached result');
      return this.processingCache.get(cacheKey)!;
    }

    const processingSteps: ProcessingStep[] = [];
    const warnings: ProcessingWarning[] = [];
    const suggestions: ProcessingSuggestion[] = [];

    try {
      // 初始化处理步骤
      const initStep = this.createProcessingStep('initialization');
      processingSteps.push(initStep);

      let processedContent = content;
      let isValid = true;
      let needsReview = false;

      // 1. 长度处理
      if (this.config.enableLengthProcessing) {
        const lengthStep = this.createProcessingStep('length_processing');
        processingSteps.push(lengthStep);

        try {
          const lengthValidation = this.lengthProcessor.validateLength(processedContent, platform);
          
          if (!lengthValidation.isValid && mergedOptions.autoFix) {
            if (lengthValidation.exceedsBy && lengthValidation.exceedsBy > 0) {
              processedContent = this.lengthProcessor.smartTruncate(
                processedContent,
                lengthValidation.targetLength,
                {
                  preserveSentences: true,
                  preserveParagraphs: true,
                  addEllipsis: true,
                  prioritizeKeywords: []
                }
              );
              
              suggestions.push({
                category: 'optimization',
                priority: 3,
                message: '内容已自动截断以符合平台长度要求',
                impact: 'medium'
              });
            }
          }

          if (!lengthValidation.isValid) {
            isValid = false;
            warnings.push({
              type: 'length',
              severity: 'warning',
              message: `内容长度不符合要求: ${lengthValidation.currentLength}/${lengthValidation.targetLength}`,
              autoFixable: true
            });
          }

          this.completeProcessingStep(lengthStep, { validation: lengthValidation });
        } catch (error) {
          this.failProcessingStep(lengthStep, error as Error);
          throw error;
        }
      }

      // 2. 风格评估
      let styleAssessment;
      if (this.config.enableStyleAssessment) {
        const styleStep = this.createProcessingStep('style_assessment');
        processingSteps.push(styleStep);

        try {
          styleAssessment = this.styleAssessor.assessStyle(processedContent, platform);
          
          if (styleAssessment.overallScore < 70) {
            needsReview = true;
            warnings.push({
              type: 'style',
              severity: 'warning',
              message: `风格评分较低: ${styleAssessment.overallScore}/100`,
              autoFixable: false
            });
          }

          // 添加风格改进建议
          styleAssessment.improvements.forEach(improvement => {
            suggestions.push({
              category: 'improvement',
              priority: 2,
              message: improvement,
              impact: 'medium'
            });
          });

          this.completeProcessingStep(styleStep, { assessment: styleAssessment });
        } catch (error) {
          this.failProcessingStep(styleStep, error as Error);
          throw error;
        }
      }

      // 3. 内容格式化
      let formatResult;
      if (this.config.enableFormatting) {
        const formatStep = this.createProcessingStep('formatting');
        processingSteps.push(formatStep);

        try {
          formatResult = this.formatter.formatContent(processedContent, platform);
          processedContent = formatResult.content;

          // 添加格式化警告和建议
          warnings.push(...formatResult.warnings.map(w => ({
            type: w.type as ProcessingWarning['type'],
            severity: w.severity === 'high' ? 'error' as const : 'warning' as const,
            message: w.message,
            autoFixable: true
          })));

          suggestions.push(...formatResult.suggestions.map(s => ({
            category: s.type as ProcessingSuggestion['category'],
            priority: s.impact,
            message: s.message,
            impact: s.impact > 3 ? 'high' as const : s.impact > 1 ? 'medium' as const : 'low' as const
          })));

          this.completeProcessingStep(formatStep, { result: formatResult });
        } catch (error) {
          this.failProcessingStep(formatStep, error as Error);
          throw error;
        }
      }

      // 4. 质量评分
      let qualityScore;
      if (this.config.enableQualityScoring) {
        const qualityStep = this.createProcessingStep('quality_scoring');
        processingSteps.push(qualityStep);

        try {
          qualityScore = this.qualityScorer.calculateQualityScore(processedContent, platform);
          
          if (qualityScore.overall < 60) {
            needsReview = true;
            warnings.push({
              type: 'quality',
              severity: 'warning',
              message: `内容质量评分较低: ${qualityScore.overall}/100`,
              autoFixable: false
            });
          }

          this.completeProcessingStep(qualityStep, { score: qualityScore });
        } catch (error) {
          this.failProcessingStep(qualityStep, error as Error);
          throw error;
        }
      }

      // 计算置信度
      const confidence = this.calculateProcessingConfidence(
        processedContent,
        platform,
        styleAssessment,
        qualityScore
      );

      const processingTime = Date.now() - startTime;

      const result: ProcessedContent = {
        originalContent: content,
        processedContent,
        platform,
        lengthValidation: this.config.enableLengthProcessing 
          ? this.lengthProcessor.validateLength(processedContent, platform)
          : { isValid: true, currentLength: processedContent.length, targetLength: processedContent.length, suggestions: [] },
        styleAssessment: styleAssessment || {
          overallScore: 80,
          platformFit: 80,
          toneConsistency: 80,
          elementPresence: [],
          keywordUsage: { totalKeywords: 0, requiredKeywords: [], missingKeywords: [], overusedKeywords: [], density: 0, distribution: 0 },
          improvements: [],
          strengths: [],
          weaknesses: [],
          confidence: 0.8
        },
        formatResult: formatResult || {
          content: processedContent,
          metadata: {
            platform,
            originalLength: content.length,
            formattedLength: processedContent.length,
            appliedRules: [],
            processingTime: 0
          },
          warnings: [],
          suggestions: []
        },
        qualityScore: qualityScore || {
          overall: 80,
          originality: 80,
          readability: 80,
          engagement: 80,
          platformOptimization: 80,
          breakdown: {
            contentStructure: 80,
            languageQuality: 80,
            platformAlignment: 80,
            userEngagement: 80,
            technicalQuality: 80
          },
          confidence: 0.8
        },
        processingTime,
        processingSteps,
        warnings,
        suggestions,
        isValid,
        needsReview,
        confidence
      };

      // 缓存结果
      if (this.config.enableCaching && mergedOptions.enableCache) {
        this.processingCache.set(cacheKey, result);
      }

      this.logger.info(`Content processing completed in ${processingTime}ms`);
      return result;

    } catch (error) {
      this.logger.error('Content processing failed:', error);
      
      // 如果启用重试策略
      if (mergedOptions.retryAttempts && mergedOptions.retryAttempts > 0) {
        const retryOptions = { ...mergedOptions, retryAttempts: mergedOptions.retryAttempts - 1 };
        await this.delay(this.config.retryStrategy.getRetryDelay(3 - mergedOptions.retryAttempts));
        return this.processContent(content, platform, retryOptions);
      }

      throw error;
    }
  }

  /**
   * 批量处理内容
   */
  async batchProcess(
    contents: ContentInput[],
    options?: BatchProcessingOptions
  ): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    const batchOptions = {
      concurrency: 3,
      failFast: false,
      retryFailures: true,
      ...options
    };

    this.logger.info(`Starting batch processing of ${contents.length} items`);

    const results: ProcessedContent[] = [];
    const errors: BatchError[] = [];
    let completed = 0;
    let failed = 0;

    // 分批处理
    const batches = this.chunkArray(contents, batchOptions.concurrency);
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (input) => {
        try {
          const result = await this.processContent(input.content, input.platform, input.options);
          results.push(result);
          completed++;
          
          // 报告进度
          if (batchOptions.progressCallback) {
            const progress: BatchProgress = {
              total: contents.length,
              completed,
              failed,
              currentItem: input.id,
              estimatedTimeRemaining: this.estimateRemainingTime(startTime, completed, contents.length)
            };
            batchOptions.progressCallback(progress);
          }
          
          return { success: true, input, result };
        } catch (error) {
          failed++;
          const batchError: BatchError = {
            id: input.id,
            error: (error as Error).message,
            retryable: this.isRetryableError(error as Error),
            attempts: 1
          };
          errors.push(batchError);
          
          if (batchOptions.failFast) {
            throw error;
          }
          
          return { success: false, input, error };
        }
      });

      await Promise.all(batchPromises);
    }

    const processingTime = Date.now() - startTime;

    const batchResult: BatchProcessingResult = {
      totalProcessed: contents.length,
      successful: completed,
      failed,
      results,
      errors,
      processingTime
    };

    this.logger.info(`Batch processing completed: ${completed}/${contents.length} successful in ${processingTime}ms`);
    return batchResult;
  }

  /**
   * 验证内容
   */
  validateContent(content: string, platform: SocialMediaPlatform): ValidationResult {
    this.logger.info(`Validating content for platform: ${platform.id}`);

    const errors: ProcessingError[] = [];
    const warnings: ProcessingWarning[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // 长度验证
    if (this.config.enableLengthProcessing) {
      const lengthValidation = this.lengthProcessor.validateLength(content, platform);
      if (!lengthValidation.isValid) {
        errors.push({
          type: 'length',
          severity: 'error',
          message: `内容长度不符合要求: ${lengthValidation.currentLength}/${lengthValidation.targetLength}`,
          suggestion: '请调整内容长度',
          recoverable: true
        });
        score -= 20;
      }
    }

    // 风格验证
    if (this.config.enableStyleAssessment) {
      const styleAssessment = this.styleAssessor.assessStyle(content, platform);
      if (styleAssessment.overallScore < 70) {
        warnings.push({
          type: 'style',
          severity: 'warning',
          message: `风格评分较低: ${styleAssessment.overallScore}/100`,
          autoFixable: false
        });
        score -= 15;
        recommendations.push(...styleAssessment.improvements);
      }
    }

    // 质量验证
    if (this.config.enableQualityScoring) {
      const qualityScore = this.qualityScorer.calculateQualityScore(content, platform);
      if (qualityScore.overall < 60) {
        warnings.push({
          type: 'quality',
          severity: 'warning',
          message: `内容质量评分较低: ${qualityScore.overall}/100`,
          autoFixable: false
        });
        score -= 15;
      }
    }

    const isValid = errors.length === 0;
    score = Math.max(0, score);

    return {
      isValid,
      errors,
      warnings,
      score,
      recommendations
    };
  }

  /**
   * 创建处理步骤
   */
  private createProcessingStep(step: string): ProcessingStep {
    return {
      step,
      status: 'running',
      startTime: Date.now()
    };
  }

  /**
   * 完成处理步骤
   */
  private completeProcessingStep(step: ProcessingStep, result?: any): void {
    step.status = 'completed';
    step.endTime = Date.now();
    step.result = result;
  }

  /**
   * 失败处理步骤
   */
  private failProcessingStep(step: ProcessingStep, error: Error): void {
    step.status = 'failed';
    step.endTime = Date.now();
    step.error = error.message;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(content: string, platform: SocialMediaPlatform, options: ProcessingOptions): string {
    const contentHash = this.simpleHash(content);
    const optionsHash = this.simpleHash(JSON.stringify(options));
    return `${platform.id}_${contentHash}_${optionsHash}`;
  }

  /**
   * 简单哈希函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 计算处理置信度
   */
  private calculateProcessingConfidence(
    content: string,
    platform: SocialMediaPlatform,
    styleAssessment?: any,
    qualityScore?: any
  ): number {
    let confidence = 0.8; // 基础置信度

    // 内容长度影响置信度
    if (content.length < 50) confidence -= 0.2;
    else if (content.length > 2000) confidence -= 0.1;

    // 风格评估置信度
    if (styleAssessment && styleAssessment.confidence) {
      confidence = (confidence + styleAssessment.confidence) / 2;
    }

    // 质量评分置信度
    if (qualityScore && qualityScore.confidence) {
      confidence = (confidence + qualityScore.confidence) / 2;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * 分割数组
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 估算剩余时间
   */
  private estimateRemainingTime(startTime: number, completed: number, total: number): number {
    if (completed === 0) return 0;
    
    const elapsed = Date.now() - startTime;
    const avgTimePerItem = elapsed / completed;
    const remaining = total - completed;
    
    return remaining * avgTimePerItem;
  }

  /**
   * 判断是否为可重试错误
   */
  private isRetryableError(error: Error): boolean {
    const retryableMessages = ['timeout', 'network', 'temporary', 'rate limit'];
    return retryableMessages.some(msg => error.message.toLowerCase().includes(msg));
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.processingCache.clear();
    this.logger.info('Processing cache cleared');
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.processingCache.size,
      keys: Array.from(this.processingCache.keys())
    };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<PostProcessorConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Configuration updated');
  }
} 