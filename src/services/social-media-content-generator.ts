import { AIService } from './AIService';
import { EmbeddingService } from './EmbeddingService';
import { PlatformTemplateManager } from './platform-template-manager';
import { ContentPostProcessor } from './content-post-processor';
import { 
  SocialMediaPlatform, 
  GeneratedContent, 
  ContentGenerationOptions,
  MultiPlatformContent,
  ContentMetadata,
  GenerationError,
  GenerationErrorType
} from '../types/social-media';
// 移除不存在的导入，使用 social-media.ts 中的类型

/**
 * 社交媒体内容生成器
 * 
 * 核心功能：
 * - 基于用户笔记生成平台特定内容
 * - 支持多平台批量生成
 * - 集成模板系统和后处理功能
 * - 提供质量评估和优化建议
 */
export class SocialMediaContentGenerator {
  private generationCache: Map<string, GeneratedContent> = new Map();
  private performanceMetrics: Map<string, number> = new Map();

  constructor(
    private aiService: AIService,
    private embeddingService: EmbeddingService,
    private templateManager: PlatformTemplateManager,
    private postProcessor: ContentPostProcessor
  ) {}

  /**
   * 生成单个平台的内容
   */
  async generateContent(
    topic: string,
    platform: SocialMediaPlatform,
    options: ContentGenerationOptions = {}
  ): Promise<GeneratedContent> {
    const startTime = Date.now();
    
    try {
      // 1. 验证输入参数
      this.validateInputs(topic, platform);

      // 2. 检查缓存
      const cacheKey = this.generateCacheKey(topic, platform, options);
      if (options.useCache !== false && this.generationCache.has(cacheKey)) {
        const cached = this.generationCache.get(cacheKey)!;
        return {
          ...cached,
          metadata: {
            ...cached.metadata,
            fromCache: true,
            generationTime: Date.now() - startTime
          }
        };
      }

      // 3. 获取相关笔记内容
      const relevantNotes = await this.retrieveRelevantContent(topic, options);

      // 4. 获取平台模板
      const template = this.templateManager.getTemplate(platform.id);

      // 5. 渲染模板
      const renderContext = {
        topic,
        context: relevantNotes.map(note => note.content).join('\n\n'),
        userPreferences: options.userPreferences || {},
        additionalParams: {
          platform: platform.name,
          maxLength: platform.maxLength.toString(),
          styleKeywords: platform.features?.join(', ') || ''
        }
      };

      const renderedTemplate = this.templateManager.renderTemplate(
        template,
        renderContext
      );

      const renderedPrompt = `${renderedTemplate.systemPrompt}\n\n${renderedTemplate.userPrompt}`;

      // 6. 调用AI生成内容
      const rawContent = await this.generateWithAI(renderedPrompt, platform, options);

      // 7. 后处理和格式化
      const processedResult = await this.postProcessor.processContent(
        rawContent,
        platform,
        {
          strictMode: options.strictMode || false,
          autoFix: options.autoFix !== false,
          preserveOriginal: false
        }
      );

              // 8. 构建最终结果
        const result: GeneratedContent = {
          platform,
          content: processedResult.processedContent,
          originalContent: rawContent,
          metadata: {
            topic,
            generationTime: Date.now() - startTime,
            sourceNotes: relevantNotes.map(note => ({
              title: note.title,
              path: note.path
            })),
            templateUsed: template.metadata?.description || template.name,
            processingApplied: processedResult.processingSteps.map(step => step.step),
            fromCache: false,
            originalLength: rawContent.length,
            formattedLength: processedResult.processedContent.length
          },
          qualityScore: processedResult.qualityScore.overall,
          styleAssessment: processedResult.styleAssessment,
          lengthValidation: processedResult.lengthValidation,
          isValid: processedResult.isValid,
          needsReview: processedResult.needsReview,
          confidence: processedResult.confidence,
          warnings: processedResult.warnings.map(w => w.message),
          suggestions: processedResult.suggestions.map(s => ({
            type: s.category,
            message: s.message,
            impact: s.priority
          }))
        };

      // 9. 缓存结果
      if (options.useCache !== false) {
        this.generationCache.set(cacheKey, result);
      }

      // 10. 记录性能指标
      this.recordPerformanceMetrics(platform.id, Date.now() - startTime);

      return result;

    } catch (error) {
      const generationError = this.handleGenerationError(error, platform, topic);
      throw generationError;
    }
  }

  /**
   * 多平台批量生成
   */
  async generateMultiPlatform(
    topic: string,
    platforms: SocialMediaPlatform[],
    options: ContentGenerationOptions = {}
  ): Promise<MultiPlatformContent> {
    const startTime = Date.now();
    const results: GeneratedContent[] = [];
    const errors: Array<{ platform: SocialMediaPlatform; error: GenerationError }> = [];

    // 并发生成控制
    const concurrency = options.concurrency || 3;
    const chunks = this.chunkArray(platforms, concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(async (platform) => {
        try {
          const result = await this.generateContent(topic, platform, {
            ...options,
            useCache: options.useCache !== false
          });
          return { success: true, platform, result };
        } catch (error) {
          const generationError = error instanceof GenerationError 
            ? error 
            : this.handleGenerationError(error, platform, topic);
          return { success: false, platform, error: generationError };
        }
      });

      const chunkResults = await Promise.all(promises);
      
      for (const chunkResult of chunkResults) {
        if (chunkResult.success && chunkResult.result) {
          results.push(chunkResult.result);
        } else if (!chunkResult.success && chunkResult.error) {
          errors.push({ 
            platform: chunkResult.platform, 
            error: chunkResult.error 
          });
        }
      }
    }

    return {
      topic,
      platforms,
      results,
      errors,
      metadata: {
        totalPlatforms: platforms.length,
        successfulGenerations: results.length,
        failedGenerations: errors.length,
        totalTime: Date.now() - startTime,
        averageQualityScore: results.length > 0 
          ? results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length 
          : 0
      }
    };
  }

  /**
   * 获取生成统计信息
   */
  getGenerationStats(): {
    totalGenerations: number;
    averageTime: number;
    platformStats: Record<string, { count: number; averageTime: number }>;
    cacheHitRate: number;
  } {
    const totalGenerations = Array.from(this.performanceMetrics.values()).length;
    const averageTime = totalGenerations > 0 
      ? Array.from(this.performanceMetrics.values()).reduce((a, b) => a + b, 0) / totalGenerations 
      : 0;

    const platformStats: Record<string, { count: number; averageTime: number }> = {};
    
    // 计算平台统计
    for (const [key, time] of this.performanceMetrics.entries()) {
      const platform = key.split(':')[0];
      if (!platformStats[platform]) {
        platformStats[platform] = { count: 0, averageTime: 0 };
      }
      platformStats[platform].count++;
      platformStats[platform].averageTime = 
        (platformStats[platform].averageTime * (platformStats[platform].count - 1) + time) / 
        platformStats[platform].count;
    }

    const cacheHitRate = this.generationCache.size > 0 
      ? (this.generationCache.size / totalGenerations) * 100 
      : 0;

    return {
      totalGenerations,
      averageTime,
      platformStats,
      cacheHitRate
    };
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.generationCache.clear();
  }

  /**
   * 验证内容生成能力
   */
  async validateGenerationCapability(platform: SocialMediaPlatform): Promise<{
    isSupported: boolean;
    templateAvailable: boolean;
    aiServiceReady: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    let templateAvailable = false;
    let aiServiceReady = false;

    try {
      // 检查模板可用性
      const template = await this.templateManager.getTemplate(platform.id);
      templateAvailable = !!template;
    } catch (error) {
      issues.push(`Template not available for platform ${platform.id}: ${error}`);
    }

    try {
      // 检查AI服务状态 - 简单检查是否存在
      aiServiceReady = !!this.aiService;
      if (!aiServiceReady) {
        issues.push('AI service is not ready');
      }
    } catch (error) {
      issues.push(`AI service error: ${error}`);
    }

    return {
      isSupported: templateAvailable && aiServiceReady && issues.length === 0,
      templateAvailable,
      aiServiceReady,
      issues
    };
  }

  // 私有方法

  private validateInputs(topic: string, platform: SocialMediaPlatform): void {
    if (!topic || topic.trim().length === 0) {
      throw new GenerationError(
        'Topic cannot be empty',
        GenerationErrorType.INVALID_INPUT,
        { topic, platform: platform.id }
      );
    }

    if (!platform || !platform.id) {
      throw new GenerationError(
        'Invalid platform configuration',
        GenerationErrorType.INVALID_INPUT,
        { topic, platform }
      );
    }
  }

  private generateCacheKey(
    topic: string, 
    platform: SocialMediaPlatform, 
    options: ContentGenerationOptions
  ): string {
    const optionsHash = JSON.stringify({
      strictMode: options.strictMode,
      autoFix: options.autoFix,
      userPreferences: options.userPreferences
    });
    return `${platform.id}:${topic}:${optionsHash}`;
  }

  private async retrieveRelevantContent(
    topic: string, 
    options: ContentGenerationOptions
  ): Promise<Array<{ title: string; content: string; path: string }>> {
    try {
      // 优化：只用 topic 作为检索主题，不拼接平台要求/内容要求
      const searchResults = await this.embeddingService.findRelevantNotes(
        topic, // 只用主题
        options.maxSourceNotes || 5,
        0.7 // threshold
      );

      return searchResults.map(result => ({
        title: result.title || 'Untitled',
        content: result.content,
        path: result.path || 'Unknown'
      }));
    } catch (error) {
      console.warn('Failed to retrieve relevant content:', error);
      return [];
    }
  }

  private async generateWithAI(
    prompt: string,
    platform: SocialMediaPlatform,
    options: ContentGenerationOptions
  ): Promise<string> {
    const aiOptions = {
      maxTokens: this.calculateMaxTokens(platform),
      temperature: options.creativity || 0.7,
      timeout: options.timeout || 30000
    };

    try {
      const message = await this.aiService.sendMessage({
        id: `gen-${Date.now()}`,
        role: 'user',
        content: prompt,
        timestamp: Date.now()
      });
      return message.content.trim();
    } catch (error) {
      throw new GenerationError(
        `AI generation failed: ${error}`,
        GenerationErrorType.AI_SERVICE_ERROR,
        { platform: platform.id, prompt: prompt.substring(0, 100) }
      );
    }
  }

  private calculateMaxTokens(platform: SocialMediaPlatform): number {
    // 根据平台特性计算合适的token数量
    const baseTokens = Math.ceil(platform.maxLength * 1.5); // 考虑token与字符的比例
    return Math.min(Math.max(baseTokens, 100), 4000); // 限制在合理范围内
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private recordPerformanceMetrics(platformId: string, time: number): void {
    const key = `${platformId}:${Date.now()}`;
    this.performanceMetrics.set(key, time);

    // 保持最近1000条记录
    if (this.performanceMetrics.size > 1000) {
      const oldestKey = Array.from(this.performanceMetrics.keys())[0];
      this.performanceMetrics.delete(oldestKey);
    }
  }

  private handleGenerationError(
    error: any,
    platform: SocialMediaPlatform,
    topic: string
  ): GenerationError {
    if (error instanceof GenerationError) {
      return error;
    }

    let errorType = GenerationErrorType.UNKNOWN_ERROR;
    let message = 'Unknown error occurred during content generation';

    if (error.message?.includes('timeout')) {
      errorType = GenerationErrorType.TIMEOUT_ERROR;
      message = 'Content generation timed out';
    } else if (error.message?.includes('AI') || error.message?.includes('model')) {
      errorType = GenerationErrorType.AI_SERVICE_ERROR;
      message = `AI service error: ${error.message}`;
    } else if (error.message?.includes('template')) {
      errorType = GenerationErrorType.TEMPLATE_ERROR;
      message = `Template error: ${error.message}`;
    } else if (error.message?.includes('validation')) {
      errorType = GenerationErrorType.VALIDATION_ERROR;
      message = `Validation error: ${error.message}`;
    }

    return new GenerationError(
      message,
      errorType,
      { 
        platform: platform.id, 
        topic, 
        originalError: error.message,
        stack: error.stack 
      }
    );
  }
} 