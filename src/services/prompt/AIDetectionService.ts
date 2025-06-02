/**
 * TOM-118: AI检测服务
 * 提供AI痕迹检测、机械化表达检测、情感缺失检测等功能
 */

import { AIService } from '../AIService';
import {
  AIDetectionReport,
  MechanicalExpressionReport,
  PatternedLanguageReport,
  EmotionalDeficiencyReport,
  AIDetectionRisk,
  NaturalnessScore,
  HumanComparisonReport,
  LanguagePatternAnalysis,
  DetectedPattern,
  AIImprovementSuggestion,
  AITraceDetectionDimensions,
  AIDetectionConfig,
  AIDetectionError,
  AIDetectionErrorType,
  DEFAULT_AI_DETECTION_CONFIG
} from '../../types/ai-detection';
import { Message } from '../../types/message';

/**
 * AI检测服务
 * 分析内容中的AI痕迹并提供自然化建议
 */
export class AIDetectionService {
  private aiService: AIService;
  private config: AIDetectionConfig;
  private cache: Map<string, any>;
  private readonly mechanicalPhrases: string[];
  private readonly emotionalWords: string[];
  private readonly humanPatterns: string[];

  constructor(aiService: AIService, config: AIDetectionConfig = DEFAULT_AI_DETECTION_CONFIG) {
    this.aiService = aiService;
    this.config = config;
    this.cache = new Map();

    // 预定义的机械化短语
    this.mechanicalPhrases = [
      '首先', '其次', '然后', '最后', '总之', '综上所述',
      '根据...', '基于...', '通过分析', '经过研究',
      '因此', '所以', '由此可见', '显而易见',
      '具体来说', '换言之', '也就是说', '总而言之'
    ];

    // 情感词汇
    this.emotionalWords = [
      '喜欢', '爱', '讨厌', '担心', '兴奋', '失望',
      '感觉', '觉得', '想', '希望', '期待', '害怕',
      '开心', '难过', '生气', '紧张', '放松', '满意'
    ];

    // 人类化模式
    this.humanPatterns = [
      '我觉得', '我认为', '在我看来', '依我之见',
      '说实话', '老实说', '坦白说', '不瞒你说',
      '嗯', '呃', '额', '那个', '这个', '怎么说呢'
    ];
  }

  /**
   * 检测机械化表达
   */
  async detectMechanicalExpressions(content: string): Promise<MechanicalExpressionReport> {
    if (!content || content.trim().length === 0) {
      throw new AIDetectionError(
        '内容不能为空',
        AIDetectionErrorType.INVALID_CONTENT
      );
    }

    const startTime = Date.now();
    
    try {
      // 检查缓存
      const cacheKey = `mechanical_${this.hashContent(content)}`;
      if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // 分析机械化程度
      const sentences = this.splitIntoSentences(content);
      const detectedPatterns: DetectedPattern[] = [];
      const frequentPhrases: Array<{
        phrase: string;
        frequency: number;
        mechanicalScore: number;
      }> = [];

      // 检测机械化短语
      let mechanicalCount = 0;
      for (const phrase of this.mechanicalPhrases) {
        const matches = content.match(new RegExp(phrase, 'g'));
        if (matches && matches.length > 0) {
          mechanicalCount += matches.length;
          frequentPhrases.push({
            phrase,
            frequency: matches.length,
            mechanicalScore: this.calculatePhraseScore(phrase, matches.length, content.length)
          });

          detectedPatterns.push({
            type: 'mechanical',
            pattern: phrase,
            examples: matches,
            frequency: matches.length,
            severity: matches.length > 2 ? 'high' : 'medium',
            confidence: 0.8,
            suggestion: `避免过度使用"${phrase}"，可以尝试更自然的表达方式`
          });
        }
      }

      // 检测重复句式结构
      const structurePatterns = this.detectRepeatedStructures(sentences);
      detectedPatterns.push(...structurePatterns);

      // 计算机械化评分
      const totalWords = content.length;
      const mechanicalRatio = mechanicalCount / totalWords;
      const structuralMechanical = structurePatterns.length / sentences.length;
      const score = Math.min(100, (mechanicalRatio * 500 + structuralMechanical * 200) * 100);

      // 生成改进建议
      const recommendations = this.generateMechanicalRecommendations(score, detectedPatterns);

      const result: MechanicalExpressionReport = {
        score,
        detectedPatterns,
        frequentPhrases,
        recommendations,
        confidence: this.calculateConfidence(detectedPatterns, totalWords)
      };

      // 缓存结果
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, result);
      }

      return result;

    } catch (error) {
      throw new AIDetectionError(
        `机械化表达检测失败: ${error.message}`,
        AIDetectionErrorType.DETECTION_MODEL_ERROR,
        { contentLength: content.length }
      );
    } finally {
      const processingTime = Date.now() - startTime;
      console.log(`[AIDetectionService] 机械化检测耗时: ${processingTime}ms`);
    }
  }

  /**
   * 检测模式化语言
   */
  async detectPatternedLanguage(content: string): Promise<PatternedLanguageReport> {
    if (!content || content.trim().length === 0) {
      throw new AIDetectionError(
        '内容不能为空',
        AIDetectionErrorType.INVALID_CONTENT
      );
    }

    try {
      const sentences = this.splitIntoSentences(content);
      
      // 检测重复结构
      const repeatedStructures = this.analyzeRepeatedStructures(sentences);
      
      // 检测模板匹配
      const templateMatches = await this.detectTemplateMatches(content);
      
      // 计算模式化程度
      const structuralRepetition = repeatedStructures.length / Math.max(sentences.length, 1);
      const templateSimilarity = templateMatches.reduce((sum, match) => sum + match.similarity, 0) / Math.max(templateMatches.length, 1);
      const score = Math.min(100, (structuralRepetition * 400 + templateSimilarity * 300) * 100);

      // 生成建议
      const recommendations = this.generatePatternRecommendations(score, repeatedStructures, templateMatches);

      return {
        score,
        repeatedStructures,
        templateMatches,
        recommendations,
        confidence: this.calculatePatternConfidence(repeatedStructures, templateMatches)
      };

    } catch (error) {
      throw new AIDetectionError(
        `模式化语言检测失败: ${error.message}`,
        AIDetectionErrorType.DETECTION_MODEL_ERROR
      );
    }
  }

  /**
   * 检测情感缺失
   */
  async detectEmotionalDeficiency(content: string): Promise<EmotionalDeficiencyReport> {
    if (!content || content.trim().length === 0) {
      throw new AIDetectionError(
        '内容不能为空',
        AIDetectionErrorType.INVALID_CONTENT
      );
    }

    try {
      const words = content.match(/[\u4e00-\u9fa5\w]+/g) || [];
      const sentences = this.splitIntoSentences(content);
      
      // 分析情感指标
      const personalPronouns = this.countPersonalPronouns(content);
      const emotionalWords = this.countEmotionalWords(content);
      const experientialElements = this.countExperientialElements(content);
      const subjectiveExpressions = this.countSubjectiveExpressions(content);

      const emotionalIndicators = {
        personalPronouns: (personalPronouns / words.length) * 100,
        emotionalWords: (emotionalWords / words.length) * 100,
        experientialElements: (experientialElements / sentences.length) * 100,
        subjectiveExpressions: (subjectiveExpressions / sentences.length) * 100
      };

      // 识别缺失元素
      const missingElements = this.identifyMissingEmotionalElements(emotionalIndicators);

      // 计算情感缺失程度
      const avgIndicator = Object.values(emotionalIndicators).reduce((sum, val) => sum + val, 0) / 4;
      const score = Math.max(0, 100 - avgIndicator * 2); // 指标越高，缺失程度越低

      // 生成建议
      const recommendations = this.generateEmotionalRecommendations(score, missingElements);

      return {
        score,
        emotionalIndicators,
        missingElements,
        recommendations,
        confidence: this.calculateEmotionalConfidence(emotionalIndicators)
      };

    } catch (error) {
      throw new AIDetectionError(
        `情感缺失检测失败: ${error.message}`,
        AIDetectionErrorType.DETECTION_MODEL_ERROR
      );
    }
  }

  /**
   * 计算AI检测风险
   */
  async calculateAIDetectionRisk(content: string): Promise<AIDetectionRisk> {
    try {
      // 获取各项检测结果
      const mechanical = await this.detectMechanicalExpressions(content);
      const patterned = await this.detectPatternedLanguage(content);
      const emotional = await this.detectEmotionalDeficiency(content);

      // 计算风险因子
      const riskFactors = [
        {
          factor: '机械化表达',
          weight: 0.3,
          score: mechanical.score,
          description: `检测到${mechanical.detectedPatterns.length}个机械化模式`
        },
        {
          factor: '模式化语言',
          weight: 0.25,
          score: patterned.score,
          description: `发现${patterned.repeatedStructures.length}个重复结构`
        },
        {
          factor: '情感缺失',
          weight: 0.25,
          score: emotional.score,
          description: `情感指标平均值${Math.round(Object.values(emotional.emotionalIndicators).reduce((sum, val) => sum + val, 0) / 4)}%`
        },
        {
          factor: '语言多样性',
          weight: 0.2,
          score: this.calculateLanguageDiversity(content),
          description: '语言表达的多样性程度'
        }
      ];

      // 计算总体风险
      const overallRisk = riskFactors.reduce((sum, factor) => {
        return sum + (factor.score / 100) * factor.weight;
      }, 0);

      // 确定风险等级
      const riskLevel = overallRisk > 0.8 ? 'critical' :
                       overallRisk > 0.6 ? 'high' :
                       overallRisk > 0.4 ? 'medium' : 'low';

      // 识别主要指标
      const primaryIndicators = riskFactors
        .filter(factor => factor.score > 60)
        .map(factor => factor.factor);

      // 生成行动建议
      const recommendedActions = this.generateRiskRecommendations(riskLevel, riskFactors);

      return {
        overallRisk,
        riskLevel,
        primaryIndicators,
        riskFactors,
        recommendedActions,
        confidence: Math.min(mechanical.confidence, patterned.confidence, emotional.confidence)
      };

    } catch (error) {
      throw new AIDetectionError(
        `AI风险评估失败: ${error.message}`,
        AIDetectionErrorType.DETECTION_MODEL_ERROR
      );
    }
  }

  /**
   * 生成自然度评分
   */
  async generateNaturalnessScore(content: string): Promise<NaturalnessScore> {
    try {
      // 分析各个维度
      const languageFlow = this.analyzeLanguageFlow(content);
      const humanLikeness = this.analyzeHumanLikeness(content);
      const spontaneity = this.analyzeSpontaneity(content);
      const authenticity = this.analyzeAuthenticity(content);
      const personality = this.analyzePersonality(content);

      const dimensions = {
        languageFlow,
        humanLikeness,
        spontaneity,
        authenticity,
        personality
      };

      // 计算综合评分
      const score = Object.values(dimensions).reduce((sum, val) => sum + val, 0) / 5;

      // 识别优势和弱点
      const strengths = this.identifyStrengths(dimensions);
      const weaknesses = this.identifyWeaknesses(dimensions);
      
      // 生成建议
      const recommendations = this.generateNaturalnessRecommendations(dimensions, strengths, weaknesses);

      return {
        score,
        dimensions,
        strengths,
        weaknesses,
        recommendations,
        confidence: this.calculateNaturalnessConfidence(dimensions)
      };

    } catch (error) {
      throw new AIDetectionError(
        `自然度评分失败: ${error.message}`,
        AIDetectionErrorType.DETECTION_MODEL_ERROR
      );
    }
  }

  /**
   * 与人类内容对比分析
   */
  async compareWithHumanContent(content: string, humanSamples: string[]): Promise<HumanComparisonReport> {
    try {
      // 分析内容特征
      const contentFeatures = this.extractContentFeatures(content);
      
      // 分析人类样本特征
      const humanFeatures = humanSamples.map(sample => this.extractContentFeatures(sample));
      const avgHumanFeatures = this.averageFeatures(humanFeatures);

      // 计算相似度
      const similarity = this.calculateFeatureSimilarity(contentFeatures, avgHumanFeatures);

      // 分析差异
      const differenceAnalysis = {
        vocabulary: Math.abs(contentFeatures.vocabularyRichness - avgHumanFeatures.vocabularyRichness),
        sentence: Math.abs(contentFeatures.sentenceComplexity - avgHumanFeatures.sentenceComplexity),
        structure: Math.abs(contentFeatures.structuralVariety - avgHumanFeatures.structuralVariety),
        tone: Math.abs(contentFeatures.emotionalTone - avgHumanFeatures.emotionalTone)
      };

      // 识别特征
      const humanLikeFeatures = this.identifyHumanLikeFeatures(contentFeatures, avgHumanFeatures);
      const aiLikeFeatures = this.identifyAILikeFeatures(contentFeatures, avgHumanFeatures);

      // 生成建议
      const recommendations = this.generateComparisonRecommendations(differenceAnalysis, aiLikeFeatures);

      return {
        similarity,
        differenceAnalysis,
        humanLikeFeatures,
        aiLikeFeatures,
        recommendations,
        confidence: this.calculateComparisonConfidence(similarity, humanSamples.length)
      };

    } catch (error) {
      throw new AIDetectionError(
        `人类内容对比失败: ${error.message}`,
        AIDetectionErrorType.DETECTION_MODEL_ERROR
      );
    }
  }

  /**
   * 分析语言模式
   */
  async analyzeLanguagePatterns(content: string): Promise<LanguagePatternAnalysis> {
    try {
      const sentences = this.splitIntoSentences(content);
      const words = content.match(/[\u4e00-\u9fa5\w]+/g) || [];

      // 分析各项指标
      const sentenceVariety = this.calculateSentenceVariety(sentences);
      const vocabularyRichness = this.calculateVocabularyRichness(words);
      const structuralComplexity = this.calculateStructuralComplexity(sentences);
      const rhythmNaturalness = this.calculateRhythmNaturalness(content);

      // 识别模式
      const patterns = this.identifyLanguagePatterns(content, sentences);

      // 生成建议
      const recommendations = this.generatePatternAnalysisRecommendations({
        sentenceVariety,
        vocabularyRichness,
        structuralComplexity,
        rhythmNaturalness
      });

      return {
        sentenceVariety,
        vocabularyRichness,
        structuralComplexity,
        rhythmNaturalness,
        patterns,
        recommendations
      };

    } catch (error) {
      throw new AIDetectionError(
        `语言模式分析失败: ${error.message}`,
        AIDetectionErrorType.DETECTION_MODEL_ERROR
      );
    }
  }

  // ==================== 私有辅助方法 ====================

  private hashContent(content: string): string {
    // 简单的哈希函数
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString();
  }

  private splitIntoSentences(content: string): string[] {
    return content.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
  }

  private detectRepeatedStructures(sentences: string[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const structureMap = new Map<string, number>();

    sentences.forEach(sentence => {
      // 简化句子结构分析
      const structure = this.extractSentenceStructure(sentence);
      structureMap.set(structure, (structureMap.get(structure) || 0) + 1);
    });

    structureMap.forEach((count, structure) => {
      if (count > 1) {
        patterns.push({
          type: 'repetitive',
          pattern: structure,
          examples: sentences.filter(s => this.extractSentenceStructure(s) === structure),
          frequency: count,
          severity: count > 3 ? 'high' : 'medium',
          confidence: 0.7,
          suggestion: `避免重复使用相同的句式结构："${structure}"`
        });
      }
    });

    return patterns;
  }

  private extractSentenceStructure(sentence: string): string {
    // 简化的句子结构提取
    return sentence
      .replace(/[\u4e00-\u9fa5\w]+/g, 'X') // 替换词汇为X
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculatePhraseScore(phrase: string, frequency: number, totalLength: number): number {
    const density = frequency / totalLength;
    return Math.min(100, density * 1000 + frequency * 10);
  }

  private calculateConfidence(patterns: DetectedPattern[], contentLength: number): number {
    if (contentLength < 50) return 0.3; // 内容太短，置信度低
    if (contentLength > 1000) return 0.9; // 内容足够长，置信度高
    
    const patternCount = patterns.reduce((sum, p) => sum + p.frequency, 0);
    return Math.min(0.9, 0.5 + (patternCount / contentLength) * 2);
  }

  private generateMechanicalRecommendations(score: number, patterns: DetectedPattern[]): string[] {
    const recommendations: string[] = [];

    if (score > 70) {
      recommendations.push('内容机械化程度较高，建议增加更多个人化表达');
      recommendations.push('尝试使用更自然的过渡词和连接词');
    }

    if (patterns.length > 5) {
      recommendations.push('避免使用过多的固定句式和套话');
      recommendations.push('增加语言表达的多样性');
    }

    recommendations.push('可以加入一些个人感受和主观判断');
    recommendations.push('使用更口语化的表达方式');

    return recommendations;
  }

  private analyzeRepeatedStructures(sentences: string[]): Array<{
    pattern: string;
    frequency: number;
    examples: string[];
  }> {
    const structureMap = new Map<string, string[]>();

    sentences.forEach(sentence => {
      const structure = this.extractSentenceStructure(sentence);
      if (!structureMap.has(structure)) {
        structureMap.set(structure, []);
      }
      structureMap.get(structure)!.push(sentence);
    });

    return Array.from(structureMap.entries())
      .filter(([_, examples]) => examples.length > 1)
      .map(([pattern, examples]) => ({
        pattern,
        frequency: examples.length,
        examples
      }));
  }

  private async detectTemplateMatches(content: string): Promise<Array<{
    template: string;
    similarity: number;
    matchedSegments: string[];
  }>> {
    // 简化的模板检测，实际应用中可以使用更复杂的算法
    const commonTemplates = [
      '根据...分析，...具有...优势',
      '首先...，其次...，最后...',
      '通过...可以看出...'
    ];

    return commonTemplates.map(template => ({
      template,
      similarity: this.calculateTemplateSimilarity(content, template),
      matchedSegments: this.findMatchingSegments(content, template)
    })).filter(match => match.similarity > 0.3);
  }

  private calculateTemplateSimilarity(content: string, template: string): number {
    // 简化的相似度计算
    const contentWords: string[] = content.match(/[\u4e00-\u9fa5\w]+/g) || [];
    const templateWords: string[] = template.match(/[\u4e00-\u9fa5\w]+/g) || [];
    
    const intersection = contentWords.filter(word => templateWords.includes(word));
    return intersection.length / Math.max(templateWords.length, 1);
  }

  private findMatchingSegments(content: string, template: string): string[] {
    // 简化实现，实际应用中需要更复杂的匹配算法
    const sentences = this.splitIntoSentences(content);
    return sentences.filter(sentence => 
      this.calculateTemplateSimilarity(sentence, template) > 0.5
    );
  }

  private calculatePatternConfidence(
    repeatedStructures: any[],
    templateMatches: any[]
  ): number {
    const structureCount = repeatedStructures.reduce((sum, s) => sum + s.frequency, 0);
    const templateCount = templateMatches.length;
    return Math.min(0.9, 0.6 + (structureCount + templateCount) * 0.05);
  }

  private generatePatternRecommendations(
    score: number,
    structures: any[],
    templates: any[]
  ): string[] {
    const recommendations: string[] = [];

    if (score > 60) {
      recommendations.push('内容模式化程度较高，建议增加表达方式的多样性');
    }

    if (structures.length > 3) {
      recommendations.push('避免重复使用相同的句式结构');
      recommendations.push('尝试变换句子的开头和结尾方式');
    }

    if (templates.length > 0) {
      recommendations.push('减少使用固定的表达模板');
      recommendations.push('增加原创性的表达方式');
    }

    return recommendations;
  }

  private countPersonalPronouns(content: string): number {
    const pronouns = ['我', '你', '他', '她', '我们', '你们', '他们', '我的', '你的', '他的', '她的'];
    return pronouns.reduce((count, pronoun) => {
      const matches = content.match(new RegExp(pronoun, 'g'));
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  private countEmotionalWords(content: string): number {
    return this.emotionalWords.reduce((count, word) => {
      const matches = content.match(new RegExp(word, 'g'));
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  private countExperientialElements(content: string): number {
    const experientialPhrases = ['我经历过', '我遇到过', '我见过', '我试过', '我用过', '我发现'];
    return experientialPhrases.reduce((count, phrase) => {
      return count + (content.includes(phrase) ? 1 : 0);
    }, 0);
  }

  private countSubjectiveExpressions(content: string): number {
    const subjectivePhrases = ['我觉得', '我认为', '我想', '我相信', '在我看来', '依我之见'];
    return subjectivePhrases.reduce((count, phrase) => {
      return count + (content.includes(phrase) ? 1 : 0);
    }, 0);
  }

  private identifyMissingEmotionalElements(indicators: any): string[] {
    const missing: string[] = [];

    if (indicators.personalPronouns < 10) {
      missing.push('缺少个人视角和主观表达');
    }
    if (indicators.emotionalWords < 5) {
      missing.push('缺少情感色彩词汇');
    }
    if (indicators.experientialElements < 20) {
      missing.push('缺少个人经历和体验描述');
    }
    if (indicators.subjectiveExpressions < 15) {
      missing.push('缺少主观判断和观点表达');
    }

    return missing;
  }

  private calculateEmotionalConfidence(indicators: any): number {
    const values = Object.values(indicators) as number[];
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.min(0.9, 0.4 + avg / 100);
  }

  private generateEmotionalRecommendations(score: number, missingElements: string[]): string[] {
    const recommendations: string[] = [];

    if (score > 70) {
      recommendations.push('内容情感表达不足，建议增加更多个人感受');
      recommendations.push('可以分享一些个人经历和真实体验');
    }

    missingElements.forEach(element => {
      switch (element) {
        case '缺少个人视角和主观表达':
          recommendations.push('增加"我觉得"、"在我看来"等主观表达');
          break;
        case '缺少情感色彩词汇':
          recommendations.push('使用更多带有情感色彩的词汇');
          break;
        case '缺少个人经历和体验描述':
          recommendations.push('加入个人经历和实际体验的描述');
          break;
        case '缺少主观判断和观点表达':
          recommendations.push('表达更多个人观点和判断');
          break;
      }
    });

    return recommendations;
  }

  // 其他私有方法的简化实现...

  private calculateLanguageDiversity(content: string): number {
    const words = content.match(/[\u4e00-\u9fa5\w]+/g) || [];
    const uniqueWords = new Set(words);
    return (uniqueWords.size / words.length) * 100;
  }

  private generateRiskRecommendations(riskLevel: string, riskFactors: any[]): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('立即优化内容，降低AI检测风险');
      recommendations.push('增加人性化表达和个人色彩');
    }

    riskFactors.forEach(factor => {
      if (factor.score > 60) {
        recommendations.push(`重点改进${factor.factor}：${factor.description}`);
      }
    });

    return recommendations;
  }

  private analyzeLanguageFlow(content: string): number {
    // 简化的语言流畅度分析
    const sentences = this.splitIntoSentences(content);
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    const variation = this.calculateLengthVariation(sentences);
    return Math.min(100, avgLength * 0.5 + variation * 50);
  }

  private calculateLengthVariation(sentences: string[]): number {
    if (sentences.length < 2) return 0;
    
    const lengths = sentences.map(s => s.length);
    const avg = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
    return Math.min(1, variance / (avg * avg));
  }

  private analyzeHumanLikeness(content: string): number {
    // 检查人类化特征
    const humanPatternCount = this.humanPatterns.reduce((count, pattern) => {
      return count + (content.includes(pattern) ? 1 : 0);
    }, 0);
    
    const personalPronounCount = this.countPersonalPronouns(content);
    const emotionalWordCount = this.countEmotionalWords(content);
    
    return Math.min(100, (humanPatternCount * 20 + personalPronounCount * 5 + emotionalWordCount * 3));
  }

  private analyzeSpontaneity(content: string): number {
    // 检查自发性特征：口语化表达、语气词、不完整句子等
    const fillerWords = ['嗯', '呃', '额', '那个', '这个', '怎么说呢'];
    const fillerCount = fillerWords.reduce((count, word) => {
      return count + (content.includes(word) ? 1 : 0);
    }, 0);
    
    const incompletePhhrases = ['...', '……', '等等', '之类的'];
    const incompleteCount = incompletePhhrases.reduce((count, phrase) => {
      return count + (content.includes(phrase) ? 1 : 0);
    }, 0);
    
    return Math.min(100, (fillerCount * 15 + incompleteCount * 10 + 30));
  }

  private analyzeAuthenticity(content: string): number {
    // 分析真实性：具体细节、个人经历、真实情感等
    const specificNumbers = content.match(/\d+/g) || [];
    const personalExperiences = this.countExperientialElements(content);
    const emotionalExpressions = this.countEmotionalWords(content);
    
    return Math.min(100, specificNumbers.length * 5 + personalExperiences * 10 + emotionalExpressions * 3);
  }

  private analyzePersonality(content: string): number {
    // 分析个性化程度：独特表达、个人偏好、价值观等
    const uniquePhrases = this.detectUniquePhrases(content);
    const personalOpinions = this.countSubjectiveExpressions(content);
    
    return Math.min(100, uniquePhrases * 8 + personalOpinions * 6);
  }

  private detectUniquePhrases(content: string): number {
    // 检测独特短语，这里简化为检测一些特殊表达
    const uniqueExpressions = ['说实话', '不瞒你说', '在我心里', '对我来说', '我个人觉得'];
    return uniqueExpressions.reduce((count, expr) => {
      return count + (content.includes(expr) ? 1 : 0);
    }, 0);
  }

  private identifyStrengths(dimensions: any): string[] {
    const strengths: string[] = [];
    Object.entries(dimensions).forEach(([key, value]) => {
      if ((value as number) > 70) {
        strengths.push(this.getDimensionName(key));
      }
    });
    return strengths;
  }

  private identifyWeaknesses(dimensions: any): string[] {
    const weaknesses: string[] = [];
    Object.entries(dimensions).forEach(([key, value]) => {
      if ((value as number) < 40) {
        weaknesses.push(this.getDimensionName(key));
      }
    });
    return weaknesses;
  }

  private getDimensionName(key: string): string {
    const nameMap: Record<string, string> = {
      languageFlow: '语言流畅度',
      humanLikeness: '人类相似度',
      spontaneity: '自发性',
      authenticity: '真实性',
      personality: '个性化'
    };
    return nameMap[key] || key;
  }

  private generateNaturalnessRecommendations(dimensions: any, strengths: string[], weaknesses: string[]): string[] {
    const recommendations: string[] = [];

    if (weaknesses.includes('语言流畅度')) {
      recommendations.push('增加句子长度的变化，避免句式过于单一');
    }
    if (weaknesses.includes('人类相似度')) {
      recommendations.push('增加更多口语化表达和个人化语言');
    }
    if (weaknesses.includes('自发性')) {
      recommendations.push('加入一些语气词和不完整的表达');
    }
    if (weaknesses.includes('真实性')) {
      recommendations.push('增加具体的数字、时间和个人经历');
    }
    if (weaknesses.includes('个性化')) {
      recommendations.push('表达更多个人观点和独特见解');
    }

    return recommendations;
  }

  private calculateNaturalnessConfidence(dimensions: any): number {
    const values = Object.values(dimensions) as number[];
    const variance = this.calculateVariance(values);
    return Math.min(0.9, 0.5 + (100 - variance) / 200);
  }

  private calculateVariance(values: number[]): number {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  }

  private extractContentFeatures(content: string): any {
    // 提取内容特征用于对比分析
    const words = content.match(/[\u4e00-\u9fa5\w]+/g) || [];
    const sentences = this.splitIntoSentences(content);
    
    return {
      vocabularyRichness: this.calculateVocabularyRichness(words),
      sentenceComplexity: this.calculateSentenceComplexity(sentences),
      structuralVariety: this.calculateStructuralVariety(sentences),
      emotionalTone: this.calculateEmotionalTone(content)
    };
  }

  private calculateVocabularyRichness(words: string[]): number {
    const uniqueWords = new Set(words);
    return (uniqueWords.size / words.length) * 100;
  }

  private calculateSentenceComplexity(sentences: string[]): number {
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    return Math.min(100, avgLength * 2);
  }

  private calculateStructuralVariety(sentences: string[]): number {
    const structures = sentences.map(s => this.extractSentenceStructure(s));
    const uniqueStructures = new Set(structures);
    return (uniqueStructures.size / sentences.length) * 100;
  }

  private calculateEmotionalTone(content: string): number {
    const emotionalWords = this.countEmotionalWords(content);
    const totalWords = content.match(/[\u4e00-\u9fa5\w]+/g)?.length || 1;
    return (emotionalWords / totalWords) * 100;
  }

  private averageFeatures(features: any[]): any {
    if (features.length === 0) return {};
    
    const keys = Object.keys(features[0]);
    const averaged: any = {};
    
    keys.forEach(key => {
      const sum = features.reduce((sum, f) => sum + f[key], 0);
      averaged[key] = sum / features.length;
    });
    
    return averaged;
  }

  private calculateFeatureSimilarity(features1: any, features2: any): number {
    const keys = Object.keys(features1);
    const similarities = keys.map(key => {
      const diff = Math.abs(features1[key] - features2[key]);
      return Math.max(0, 100 - diff) / 100;
    });
    
    return similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
  }

  private identifyHumanLikeFeatures(contentFeatures: any, humanFeatures: any): string[] {
    const features: string[] = [];
    
    if (Math.abs(contentFeatures.vocabularyRichness - humanFeatures.vocabularyRichness) < 10) {
      features.push('词汇丰富度接近人类水平');
    }
    if (Math.abs(contentFeatures.emotionalTone - humanFeatures.emotionalTone) < 15) {
      features.push('情感表达自然');
    }
    
    return features;
  }

  private identifyAILikeFeatures(contentFeatures: any, humanFeatures: any): string[] {
    const features: string[] = [];
    
    if (contentFeatures.structuralVariety < humanFeatures.structuralVariety - 20) {
      features.push('句式结构变化不足');
    }
    if (contentFeatures.emotionalTone < humanFeatures.emotionalTone - 20) {
      features.push('情感表达不足');
    }
    
    return features;
  }

  private generateComparisonRecommendations(differenceAnalysis: any, aiLikeFeatures: string[]): string[] {
    const recommendations: string[] = [];
    
    if (differenceAnalysis.vocabulary > 20) {
      recommendations.push('调整词汇使用，使其更接近自然表达');
    }
    if (differenceAnalysis.tone > 25) {
      recommendations.push('增加情感色彩，使表达更自然');
    }
    
    aiLikeFeatures.forEach(feature => {
      if (feature.includes('句式结构')) {
        recommendations.push('增加句式结构的多样性');
      }
      if (feature.includes('情感表达')) {
        recommendations.push('加强情感表达和个人色彩');
      }
    });
    
    return recommendations;
  }

  private calculateComparisonConfidence(similarity: number, sampleCount: number): number {
    const sampleWeight = Math.min(1, sampleCount / 5); // 样本数量权重
    return Math.min(0.9, similarity * 0.7 + sampleWeight * 0.3);
  }

  private calculateSentenceVariety(sentences: string[]): number {
    const lengths = sentences.map(s => s.length);
    const structures = sentences.map(s => this.extractSentenceStructure(s));
    
    const lengthVariety = this.calculateLengthVariation(sentences) * 100;
    const structureVariety = (new Set(structures).size / structures.length) * 100;
    
    return (lengthVariety + structureVariety) / 2;
  }

  private calculateStructuralComplexity(sentences: string[]): number {
    const complexityScores = sentences.map(sentence => {
      const clauseCount = sentence.split(/[，,；;]/).length;
      const nestingLevel = this.calculateNestingLevel(sentence);
      return clauseCount * 10 + nestingLevel * 20;
    });
    
    return complexityScores.reduce((sum, score) => sum + score, 0) / sentences.length;
  }

  private calculateNestingLevel(sentence: string): number {
    // 简化的嵌套层级计算
    const parentheses = sentence.match(/[（(]/g)?.length || 0;
    const quotes = sentence.match(/[""'']/g)?.length || 0;
    return parentheses + quotes / 2;
  }

  private calculateRhythmNaturalness(content: string): number {
    // 简化的韵律自然度计算
    const sentences = this.splitIntoSentences(content);
    const lengthVariation = this.calculateLengthVariation(sentences);
    const pauseCount = content.match(/[，,；;]/g)?.length || 0;
    const totalLength = content.length;
    
    return Math.min(100, lengthVariation * 50 + (pauseCount / totalLength) * 1000);
  }

  private identifyLanguagePatterns(content: string, sentences: string[]): Array<{
    type: string;
    frequency: number;
    naturalness: number;
    examples: string[];
  }> {
    const patterns: Array<{
      type: string;
      frequency: number;
      naturalness: number;
      examples: string[];
    }> = [];
    
    // 检测疑问句模式
    const questions = sentences.filter(s => s.includes('？') || s.includes('?'));
    if (questions.length > 0) {
      patterns.push({
        type: '疑问句',
        frequency: questions.length,
        naturalness: questions.length / sentences.length < 0.3 ? 80 : 60,
        examples: questions.slice(0, 3)
      });
    }
    
    // 检测感叹句模式
    const exclamations = sentences.filter(s => s.includes('！') || s.includes('!'));
    if (exclamations.length > 0) {
      patterns.push({
        type: '感叹句',
        frequency: exclamations.length,
        naturalness: exclamations.length / sentences.length < 0.2 ? 85 : 70,
        examples: exclamations.slice(0, 3)
      });
    }
    
    return patterns;
  }

  private generatePatternAnalysisRecommendations(metrics: {
    sentenceVariety: number;
    vocabularyRichness: number;
    structuralComplexity: number;
    rhythmNaturalness: number;
  }): string[] {
    const recommendations: string[] = [];
    
    if (metrics.sentenceVariety < 50) {
      recommendations.push('增加句子长度和结构的多样性');
    }
    if (metrics.vocabularyRichness < 40) {
      recommendations.push('丰富词汇使用，避免重复表达');
    }
    if (metrics.structuralComplexity < 30) {
      recommendations.push('适当增加句子的复杂度和层次');
    }
    if (metrics.rhythmNaturalness < 60) {
      recommendations.push('改善语言节奏，增加自然的停顿');
    }
    
    return recommendations;
  }
} 