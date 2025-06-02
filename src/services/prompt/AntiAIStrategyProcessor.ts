/**
 * TOM-118: 反AI策略处理器
 * 提供语言自然化、个性化注入、适度不完美化等反AI策略处理功能
 */

import { AIService } from '../AIService';
import {
  AntiAIStrategyResult,
  LanguageNaturalizationConfig,
  PersonalizationConfig,
  ImperfectionConfig,
  UserStyleProfile,
  ExperienceContext,
  AIDetectionError,
  AIDetectionErrorType
} from '../../types/ai-detection';
import { AntiAIDetectionStrategy } from '../../types/prompt-advanced';
import { Message } from '../../types/message';

/**
 * 反AI策略处理器
 * 实现多种反AI检测策略，降低AI生成内容的检测率
 */
export class AntiAIStrategyProcessor {
  private aiService: AIService;
  private cache: Map<string, any>;
  
  // 语言自然化词库
  private readonly naturalTransitions: Record<string, string[]> = {
    '首先': ['首先嘛', '第一个呢', '一开始', '最开始的时候', '我先说一下'],
    '其次': ['然后呢', '接下来', '还有就是', '另外', '再就是'],
    '最后': ['最后呢', '总之', '说到底', '到头来', '结果就是'],
    '因此': ['所以说', '这样一来', '结果', '这么看来', '因为这样'],
    '但是': ['不过', '可是', '只是', '就是', '话说回来']
  };

  // 口语化表达
  private readonly colloquialExpressions: string[] = [
    '嗯', '呃', '额', '那个', '这个', '怎么说呢', '你知道的',
    '说实话', '老实说', '坦白说', '不瞒你说', '其实',
    '我觉得', '我想', '我感觉', '在我看来', '依我之见'
  ];

  // 情感标记词
  private readonly emotionalMarkers: string[] = [
    '超级', '特别', '非常', '真的', '确实', '的确',
    '太...了', '好...啊', '简直', '完全', '绝对'
  ];

  // 个人经历模板
  private readonly experienceTemplates: string[] = [
    '我之前遇到过类似的情况',
    '记得有一次',
    '以我的经验来看',
    '我试过这种方法',
    '根据我的观察',
    '在我看来'
  ];

  constructor(aiService: AIService) {
    this.aiService = aiService;
    this.cache = new Map();
  }

  /**
   * 应用语言自然化策略
   */
  async applyLanguageNaturalization(
    content: string,
    config: LanguageNaturalizationConfig
  ): Promise<AntiAIStrategyResult> {
    if (!content || content.trim().length === 0) {
      throw new AIDetectionError(
        '内容不能为空',
        AIDetectionErrorType.INVALID_CONTENT
      );
    }

    const startTime = Date.now();
    let processedContent = content;
    const appliedStrategies: string[] = ['language-naturalization'];

    try {
      // 1. 句式变换
      if (config.sentenceVariation.enabled) {
        processedContent = this.applySentenceVariation(processedContent, config.sentenceVariation);
      }

      // 2. 口语化处理
      if (config.colloquialLevel.enabled) {
        processedContent = this.applyColloquialization(processedContent, config.colloquialLevel);
      }

      // 3. 情感细腻化
      if (config.emotionalNuance.enabled) {
        processedContent = this.applyEmotionalNuance(processedContent, config.emotionalNuance);
      }

      // 计算改进指标
      const improvements = await this.calculateLanguageImprovements(content, processedContent);
      
      // 评估质量指标
      const qualityMetrics = this.evaluateQualityMetrics(processedContent);

      const processingTime = Date.now() - startTime;

      return {
        originalContent: content,
        processedContent,
        appliedStrategies,
        improvements,
        qualityMetrics,
        processingTime,
        confidence: this.calculateProcessingConfidence(improvements, qualityMetrics)
      };

    } catch (error) {
      throw new AIDetectionError(
        `语言自然化处理失败: ${error.message}`,
        AIDetectionErrorType.STRATEGY_APPLICATION_ERROR,
        { contentLength: content.length }
      );
    }
  }

  /**
   * 应用个性化注入策略
   */
  async applyPersonalization(
    content: string,
    config: PersonalizationConfig,
    context: ExperienceContext
  ): Promise<AntiAIStrategyResult> {
    if (!content || content.trim().length === 0) {
      throw new AIDetectionError(
        '内容不能为空',
        AIDetectionErrorType.INVALID_CONTENT
      );
    }

    const startTime = Date.now();
    let processedContent = content;
    const appliedStrategies: string[] = ['personalization'];

    try {
      // 1. 用户风格模拟
      if (config.userStyleMimicry.enabled) {
        processedContent = this.applyUserStyleMimicry(
          processedContent,
          config.userStyleMimicry.styleProfile,
          config.userStyleMimicry.adaptationLevel
        );
      }

      // 2. 个人经历注入
      if (config.personalExperience.enabled) {
        processedContent = this.injectPersonalExperience(
          processedContent,
          context,
          config.personalExperience.experienceLevel,
          config.personalExperience.contextualRelevance
        );
      }

      // 3. 独特视角添加
      if (config.uniquePerspective.enabled) {
        processedContent = this.addUniquePerspective(
          processedContent,
          context,
          config.uniquePerspective.originalityLevel,
          config.uniquePerspective.viewpointDiversity
        );
      }

      // 计算改进指标
      const improvements = await this.calculatePersonalizationImprovements(content, processedContent);
      
      // 评估质量指标
      const qualityMetrics = this.evaluateQualityMetrics(processedContent);

      const processingTime = Date.now() - startTime;

      return {
        originalContent: content,
        processedContent,
        appliedStrategies,
        improvements,
        qualityMetrics,
        processingTime,
        confidence: this.calculateProcessingConfidence(improvements, qualityMetrics)
      };

    } catch (error) {
      throw new AIDetectionError(
        `个性化注入处理失败: ${error.message}`,
        AIDetectionErrorType.STRATEGY_APPLICATION_ERROR
      );
    }
  }

  /**
   * 应用适度不完美化策略
   */
  async applyImperfections(
    content: string,
    config: ImperfectionConfig
  ): Promise<AntiAIStrategyResult> {
    if (!content || content.trim().length === 0) {
      throw new AIDetectionError(
        '内容不能为空',
        AIDetectionErrorType.INVALID_CONTENT
      );
    }

    const startTime = Date.now();
    let processedContent = content;
    const appliedStrategies: string[] = ['imperfection'];

    try {
      // 验证配置参数
      const validatedConfig = this.validateImperfectionConfig(config);

      // 1. 轻微不一致性
      if (validatedConfig.minorInconsistency.enabled) {
        processedContent = this.addMinorInconsistencies(
          processedContent,
          validatedConfig.minorInconsistency
        );
      }

      // 2. 自然停顿
      if (validatedConfig.naturalPauses.enabled) {
        processedContent = this.addNaturalPauses(
          processedContent,
          validatedConfig.naturalPauses
        );
      }

      // 3. 口语化错误
      if (validatedConfig.colloquialErrors.enabled) {
        processedContent = this.addColloquialErrors(
          processedContent,
          validatedConfig.colloquialErrors
        );
      }

      // 计算改进指标
      const improvements = await this.calculateImperfectionImprovements(content, processedContent);
      
      // 评估质量指标
      const qualityMetrics = this.evaluateQualityMetrics(processedContent);

      const processingTime = Date.now() - startTime;

      return {
        originalContent: content,
        processedContent,
        appliedStrategies,
        improvements,
        qualityMetrics,
        processingTime,
        confidence: this.calculateProcessingConfidence(improvements, qualityMetrics)
      };

    } catch (error) {
      throw new AIDetectionError(
        `不完美化处理失败: ${error.message}`,
        AIDetectionErrorType.STRATEGY_APPLICATION_ERROR
      );
    }
  }

  /**
   * 综合应用所有策略
   */
  async processWithAllStrategies(
    content: string,
    strategy: AntiAIDetectionStrategy,
    context: ExperienceContext
  ): Promise<AntiAIStrategyResult> {
    const startTime = Date.now();
    let processedContent = content;
    const appliedStrategies: string[] = [];

    try {
      // 1. 语言自然化
      if (strategy.languageNaturalization) {
        const result = await this.applyLanguageNaturalization(
          processedContent,
          strategy.languageNaturalization
        );
        processedContent = result.processedContent;
        appliedStrategies.push(...result.appliedStrategies);
      }

      // 2. 个性化注入
      if (strategy.personalizationInjection) {
        const result = await this.applyPersonalization(
          processedContent,
          strategy.personalizationInjection,
          context
        );
        processedContent = result.processedContent;
        appliedStrategies.push(...result.appliedStrategies);
      }

      // 3. 适度不完美化
      if (strategy.moderateImperfection) {
        const result = await this.applyImperfections(
          processedContent,
          strategy.moderateImperfection
        );
        processedContent = result.processedContent;
        appliedStrategies.push(...result.appliedStrategies);
      }

      // 计算综合改进指标
      const improvements = await this.calculateComprehensiveImprovements(content, processedContent);
      
      // 评估质量指标
      const qualityMetrics = this.evaluateQualityMetrics(processedContent);

      const processingTime = Date.now() - startTime;

      return {
        originalContent: content,
        processedContent,
        appliedStrategies: [...new Set(appliedStrategies)], // 去重
        improvements,
        qualityMetrics,
        processingTime,
        confidence: this.calculateProcessingConfidence(improvements, qualityMetrics)
      };

    } catch (error) {
      throw new AIDetectionError(
        `综合策略处理失败: ${error.message}`,
        AIDetectionErrorType.STRATEGY_APPLICATION_ERROR
      );
    }
  }

  // ==================== 私有方法实现 ====================

  /**
   * 应用句式变换
   */
  private applySentenceVariation(
    content: string,
    config: { enabled: boolean; level: number; patterns: string[] }
  ): string {
    let result = content;

    // 替换机械化过渡词
    Object.entries(this.naturalTransitions).forEach(([original, alternatives]) => {
      if (config.patterns.includes('transition') || config.patterns.includes('varied')) {
        const regex = new RegExp(original, 'g');
        result = result.replace(regex, () => {
          if (Math.random() < config.level) {
            return alternatives[Math.floor(Math.random() * alternatives.length)];
          }
          return original;
        });
      }
    });

    // 添加句式变化
    if (config.patterns.includes('colloquial')) {
      const sentences = result.split(/[。！？.!?]+/).filter(s => s.trim());
      const processedSentences = sentences.map(sentence => {
        if (Math.random() < config.level * 0.3) {
          // 随机添加语气词或修饰词
          const prefix = this.colloquialExpressions[Math.floor(Math.random() * this.colloquialExpressions.length)];
          return `${prefix}，${sentence}`;
        }
        return sentence;
      });
      
      result = processedSentences.join('。') + '。';
    }

    return result;
  }

  /**
   * 应用口语化处理
   */
  private applyColloquialization(
    content: string,
    config: { enabled: boolean; intensity: number; targetExpressions: string[] }
  ): string {
    let result = content;

    // 随机插入口语化表达
    const sentences = result.split(/[。！？.!?]+/).filter(s => s.trim());
    const processedSentences = sentences.map(sentence => {
      if (Math.random() < config.intensity * 0.4) {
        const expression = config.targetExpressions[Math.floor(Math.random() * config.targetExpressions.length)];
        // 在句子开头或中间插入
        if (Math.random() < 0.5) {
          return `${expression}，${sentence}`;
        } else {
          const words = sentence.split('，');
          if (words.length > 1) {
            const insertIndex = Math.floor(Math.random() * (words.length - 1)) + 1;
            words.splice(insertIndex, 0, expression);
            return words.join('，');
          }
        }
      }
      return sentence;
    });

    return processedSentences.join('。') + '。';
  }

  /**
   * 应用情感细腻化
   */
  private applyEmotionalNuance(
    content: string,
    config: { enabled: boolean; depth: number; emotionalMarkers: string[] }
  ): string {
    let result = content;

    // 添加情感标记
    config.emotionalMarkers.forEach(marker => {
      if (Math.random() < config.depth * 0.5) {
        // 在适当位置插入情感标记
        const sentences = result.split(/[。！？.!?]+/).filter(s => s.trim());
        if (sentences.length > 0) {
          const randomSentenceIndex = Math.floor(Math.random() * sentences.length);
          let sentence = sentences[randomSentenceIndex];
          
          // 根据情感标记类型进行处理
          if (marker === '感觉' || marker === '想法') {
            sentence = `我${marker}${sentence}`;
          } else if (marker === '体验' || marker === '感受') {
            sentence = `${sentence}，这种${marker}很特别`;
          }
          
          sentences[randomSentenceIndex] = sentence;
          result = sentences.join('。') + '。';
        }
      }
    });

    return result;
  }

  /**
   * 应用用户风格模拟
   */
  private applyUserStyleMimicry(
    content: string,
    styleProfile: UserStyleProfile,
    adaptationLevel: number
  ): string {
    let result = content;

    // 应用个人标记
    if (styleProfile.personalMarkers && Math.random() < adaptationLevel) {
      const marker = styleProfile.personalMarkers[Math.floor(Math.random() * styleProfile.personalMarkers.length)];
      const sentences = result.split(/[。！？.!?]+/).filter(s => s.trim());
      if (sentences.length > 0) {
        const firstSentence = sentences[0];
        sentences[0] = `${marker}，${firstSentence}`;
        result = sentences.join('。') + '。';
      }
    }

    // 应用偏好短语
    if (styleProfile.preferredPhrases && Math.random() < adaptationLevel * 0.7) {
      const phrase = styleProfile.preferredPhrases[Math.floor(Math.random() * styleProfile.preferredPhrases.length)];
      result = result.replace(/。$/, `，${phrase}。`);
    }

    // 避免特定模式
    if (styleProfile.avoidedPatterns) {
      styleProfile.avoidedPatterns.forEach(pattern => {
        const regex = new RegExp(pattern, 'g');
        result = result.replace(regex, '');
      });
    }

    return result;
  }

  /**
   * 注入个人经历
   */
  private injectPersonalExperience(
    content: string,
    context: ExperienceContext,
    experienceLevel: number,
    contextualRelevance: number
  ): string {
    let result = content;

    if (Math.random() < experienceLevel * contextualRelevance) {
      // 选择相关的个人故事
      if (context.personalStories.length > 0) {
        const story = context.personalStories[Math.floor(Math.random() * context.personalStories.length)];
        const template = this.experienceTemplates[Math.floor(Math.random() * this.experienceTemplates.length)];
        
        const sentences = result.split(/[。！？.!?]+/).filter(s => s.trim());
        if (sentences.length > 0) {
          const insertIndex = Math.floor(Math.random() * sentences.length);
          sentences.splice(insertIndex, 0, `${template}，${story}`);
          result = sentences.join('。') + '。';
        }
      }
    }

    return result;
  }

  /**
   * 添加独特视角
   */
  private addUniquePerspective(
    content: string,
    context: ExperienceContext,
    originalityLevel: number,
    viewpointDiversity: number
  ): string {
    let result = content;

    if (Math.random() < originalityLevel * viewpointDiversity) {
      // 基于背景知识添加独特见解
      if (context.backgroundKnowledge.length > 0) {
        const knowledge = context.backgroundKnowledge[Math.floor(Math.random() * context.backgroundKnowledge.length)];
        const perspective = `从${knowledge}的角度来看，这个问题可能还有其他的理解方式`;
        
        result = result.replace(/。$/, `。${perspective}。`);
      }
    }

    return result;
  }

  /**
   * 验证不完美化配置
   */
  private validateImperfectionConfig(config: ImperfectionConfig): ImperfectionConfig {
    const validated = { ...config };

    // 限制频率范围
    if (validated.minorInconsistency.frequency < 0 || validated.minorInconsistency.frequency > 0.1) {
      validated.minorInconsistency.frequency = Math.max(0, Math.min(0.1, validated.minorInconsistency.frequency));
    }

    if (validated.naturalPauses.frequency < 0 || validated.naturalPauses.frequency > 1) {
      validated.naturalPauses.frequency = Math.max(0, Math.min(1, validated.naturalPauses.frequency));
    }

    if (validated.colloquialErrors.frequency < 0 || validated.colloquialErrors.frequency > 0.05) {
      validated.colloquialErrors.frequency = Math.max(0, Math.min(0.05, validated.colloquialErrors.frequency));
    }

    return validated;
  }

  /**
   * 添加轻微不一致性
   */
  private addMinorInconsistencies(
    content: string,
    config: { enabled: boolean; frequency: number; types: ('stylistic' | 'factual' | 'structural')[] }
  ): string {
    let result = content;

    if (config.types.includes('stylistic') && Math.random() < config.frequency * 10) {
      // 轻微的风格不一致，如混用正式和非正式表达
      result = result.replace(/因此/g, (match) => {
        return Math.random() < 0.3 ? '所以' : match;
      });
    }

    if (config.types.includes('structural') && Math.random() < config.frequency * 8) {
      // 轻微的结构不一致
      const sentences = result.split(/[。！？.!?]+/).filter(s => s.trim());
      if (sentences.length > 2) {
        // 偶尔改变句子顺序
        const index1 = Math.floor(Math.random() * sentences.length);
        const index2 = Math.floor(Math.random() * sentences.length);
        if (index1 !== index2 && Math.abs(index1 - index2) === 1) {
          [sentences[index1], sentences[index2]] = [sentences[index2], sentences[index1]];
          result = sentences.join('。') + '。';
        }
      }
    }

    return result;
  }

  /**
   * 添加自然停顿
   */
  private addNaturalPauses(
    content: string,
    config: { enabled: boolean; frequency: number; pauseTypes: string[] }
  ): string {
    let result = content;

    const pauseMarkers = ['...', '，嗯', '，呃', '，那个'];
    
    config.pauseTypes.forEach(pauseType => {
      if (pauseType === '思考停顿' && Math.random() < config.frequency * 0.3) {
        const sentences = result.split(/[。！？.!?]+/).filter(s => s.trim());
        if (sentences.length > 0) {
          const randomIndex = Math.floor(Math.random() * sentences.length);
          const marker = pauseMarkers[Math.floor(Math.random() * pauseMarkers.length)];
          sentences[randomIndex] = sentences[randomIndex] + marker;
          result = sentences.join('。') + '。';
        }
      }
    });

    return result;
  }

  /**
   * 添加口语化错误
   */
  private addColloquialErrors(
    content: string,
    config: { enabled: boolean; frequency: number; errorTypes: ('grammar' | 'spelling' | 'punctuation')[] }
  ): string {
    let result = content;

    if (config.errorTypes.includes('grammar') && Math.random() < config.frequency * 20) {
      // 非常轻微的语法松散，如省略助词
      result = result.replace(/的时候/g, (match) => {
        return Math.random() < 0.2 ? '时候' : match;
      });
    }

    return result;
  }

  /**
   * 计算语言自然化改进指标
   */
  private async calculateLanguageImprovements(original: string, processed: string): Promise<{
    naturalness: number;
    aiDetectionReduction: number;
    humanLikeness: number;
  }> {
    // 简化的计算方法，实际应用中可以调用AI检测服务
    const originalColloquialCount = this.countColloquialElements(original);
    const processedColloquialCount = this.countColloquialElements(processed);
    
    const naturalness = Math.min(100, (processedColloquialCount - originalColloquialCount) * 20);
    const aiDetectionReduction = Math.min(100, naturalness * 0.8);
    const humanLikeness = Math.min(100, naturalness * 0.9);

    return {
      naturalness: Math.max(0, naturalness),
      aiDetectionReduction: Math.max(0, aiDetectionReduction),
      humanLikeness: Math.max(0, humanLikeness)
    };
  }

  /**
   * 计算个性化改进指标
   */
  private async calculatePersonalizationImprovements(original: string, processed: string): Promise<{
    naturalness: number;
    aiDetectionReduction: number;
    humanLikeness: number;
  }> {
    const originalPersonalElements = this.countPersonalElements(original);
    const processedPersonalElements = this.countPersonalElements(processed);
    
    const humanLikeness = Math.min(100, (processedPersonalElements - originalPersonalElements) * 25);
    const naturalness = humanLikeness * 0.8;
    const aiDetectionReduction = humanLikeness * 0.7;

    return {
      naturalness: Math.max(0, naturalness),
      aiDetectionReduction: Math.max(0, aiDetectionReduction),
      humanLikeness: Math.max(0, humanLikeness)
    };
  }

  /**
   * 计算不完美化改进指标
   */
  private async calculateImperfectionImprovements(original: string, processed: string): Promise<{
    naturalness: number;
    aiDetectionReduction: number;
    humanLikeness: number;
  }> {
    const originalPerfection = this.calculatePerfectionLevel(original);
    const processedPerfection = this.calculatePerfectionLevel(processed);
    
    const naturalness = Math.min(100, (originalPerfection - processedPerfection) * 30);
    const aiDetectionReduction = naturalness * 0.9;
    const humanLikeness = naturalness * 0.8;

    return {
      naturalness: Math.max(0, naturalness),
      aiDetectionReduction: Math.max(0, aiDetectionReduction),
      humanLikeness: Math.max(0, humanLikeness)
    };
  }

  /**
   * 计算综合改进指标
   */
  private async calculateComprehensiveImprovements(original: string, processed: string): Promise<{
    naturalness: number;
    aiDetectionReduction: number;
    humanLikeness: number;
  }> {
    const colloquialImprovement = this.countColloquialElements(processed) - this.countColloquialElements(original);
    const personalImprovement = this.countPersonalElements(processed) - this.countPersonalElements(original);
    const perfectionReduction = this.calculatePerfectionLevel(original) - this.calculatePerfectionLevel(processed);
    
    const naturalness = Math.min(100, colloquialImprovement * 15 + personalImprovement * 20 + perfectionReduction * 25);
    const humanLikeness = Math.min(100, personalImprovement * 25 + colloquialImprovement * 20);
    const aiDetectionReduction = Math.min(100, (naturalness + humanLikeness) / 2);

    return {
      naturalness: Math.max(0, naturalness),
      aiDetectionReduction: Math.max(0, aiDetectionReduction),
      humanLikeness: Math.max(0, humanLikeness)
    };
  }

  /**
   * 评估质量指标
   */
  private evaluateQualityMetrics(content: string): {
    readability: number;
    coherence: number;
    authenticity: number;
  } {
    const sentences = content.split(/[。！？.!?]+/).filter(s => s.trim());
    const words = content.match(/[\u4e00-\u9fa5\w]+/g) || [];
    
    // 可读性：基于句子长度分布
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    const readability = Math.min(100, 100 - Math.abs(avgSentenceLength - 30) * 2);
    
    // 连贯性：基于过渡词和逻辑连接
    const transitionWords = ['然后', '接下来', '另外', '但是', '不过', '所以', '因为'];
    const transitionCount = transitionWords.reduce((count, word) => {
      return count + (content.match(new RegExp(word, 'g'))?.length || 0);
    }, 0);
    const coherence = Math.min(100, 70 + transitionCount * 5);
    
    // 真实性：基于个人化元素
    const personalElements = this.countPersonalElements(content);
    const authenticity = Math.min(100, 60 + personalElements * 8);

    return {
      readability: Math.max(50, readability),
      coherence: Math.max(50, coherence),
      authenticity: Math.max(50, authenticity)
    };
  }

  /**
   * 计算处理置信度
   */
  private calculateProcessingConfidence(
    improvements: { naturalness: number; aiDetectionReduction: number; humanLikeness: number },
    qualityMetrics: { readability: number; coherence: number; authenticity: number }
  ): number {
    const improvementScore = (improvements.naturalness + improvements.aiDetectionReduction + improvements.humanLikeness) / 3;
    const qualityScore = (qualityMetrics.readability + qualityMetrics.coherence + qualityMetrics.authenticity) / 3;
    
    return Math.min(0.95, (improvementScore + qualityScore) / 200 + 0.3);
  }

  /**
   * 统计口语化元素
   */
  private countColloquialElements(content: string): number {
    return this.colloquialExpressions.reduce((count, expr) => {
      return count + (content.includes(expr) ? 1 : 0);
    }, 0);
  }

  /**
   * 统计个人化元素
   */
  private countPersonalElements(content: string): number {
    const personalPronouns = ['我', '我的', '我们', '我觉得', '我认为', '在我看来'];
    return personalPronouns.reduce((count, pronoun) => {
      return count + (content.match(new RegExp(pronoun, 'g'))?.length || 0);
    }, 0);
  }

  /**
   * 计算完美程度
   */
  private calculatePerfectionLevel(content: string): number {
    // 完美程度指标：句式规整度、用词正式度等
    const formalWords = ['首先', '其次', '最后', '因此', '所以', '根据', '基于'];
    const formalCount = formalWords.reduce((count, word) => {
      return count + (content.match(new RegExp(word, 'g'))?.length || 0);
    }, 0);
    
    const sentences = content.split(/[。！？.!?]+/).filter(s => s.trim());
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    
    // 完美程度 = 正式词汇密度 + 句式规整度
    const formalDensity = formalCount / content.length * 1000;
    const structuralRegularity = Math.abs(avgLength - 20) < 5 ? 50 : 20;
    
    return Math.min(100, formalDensity * 20 + structuralRegularity);
  }
} 