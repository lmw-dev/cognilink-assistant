import {
  QualityScorer as IQualityScorer,
  QualityScore,
  OriginalityResult,
  ReadabilityScore,
  EngagementPrediction,
  QualityBreakdown,
  ReadabilityFactors,
  EngagementFactors
} from '../types/content-processing';
import { SocialMediaPlatform } from '../types/social-media';
import { Logger } from '../utils/logger';

/**
 * 质量评分器 - 负责内容质量评估
 */
export class QualityScorer implements IQualityScorer {
  private logger: Logger;
  private commonWords: Set<string>;
  private platformKeywords: Map<string, string[]>;

  constructor() {
    this.logger = new Logger('QualityScorer');
    this.commonWords = new Set([
      '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这样'
    ]);
    this.initializePlatformKeywords();
  }

  /**
   * 初始化平台关键词
   */
  private initializePlatformKeywords(): void {
    this.platformKeywords = new Map();
    
    this.platformKeywords.set('xiaohongshu', [
      '姐妹们', '宝子们', '绝绝子', 'yyds', '种草', '拔草', '好用', '推荐', '必买', '心动', '爱了', '太香了'
    ]);
    
    this.platformKeywords.set('twitter', [
      '分享', '讨论', '观点', '思考', '学习', '成长', '感悟', '体验', '发现', '探索'
    ]);
    
    this.platformKeywords.set('wechat', [
      '深度', '分析', '解读', '洞察', '趋势', '专业', '权威', '数据', '研究', '报告'
    ]);
    
    this.platformKeywords.set('blog', [
      '技术', '实践', '经验', '总结', '教程', '指南', '方法', '解决方案', '最佳实践', '案例'
    ]);
    
    this.platformKeywords.set('toutiao', [
      '震惊', '揭秘', '真相', '内幕', '爆料', '反转', '惊人', '意外', '罕见', '独家'
    ]);
  }

  /**
   * 计算内容质量评分
   */
  calculateQualityScore(content: string, platform: SocialMediaPlatform): QualityScore {
    const startTime = Date.now();
    this.logger.info(`Calculating quality score for platform: ${platform.id}`);

    // 处理空内容
    if (!content || typeof content !== 'string') {
      return {
        overall: 0,
        originality: 0,
        readability: 0,
        engagement: 0,
        platformOptimization: 0,
        breakdown: {
          contentStructure: 0,
          languageQuality: 0,
          platformAlignment: 0,
          userEngagement: 0,
          technicalQuality: 0
        },
        confidence: 0
      };
    }

    // 计算各项评分
    const originality = this.checkOriginality(content);
    const readability = this.assessReadability(content);
    const engagement = this.predictEngagement(content, platform);
    const platformOptimization = this.assessPlatformOptimization(content, platform);

    // 计算详细评分
    const breakdown = this.calculateQualityBreakdown(content, platform);

    // 计算总体评分
    const overall = this.calculateOverallScore(originality, readability, engagement, platformOptimization);

    const processingTime = Date.now() - startTime;
    const confidence = this.calculateConfidence(content, platform);

    const result: QualityScore = {
      overall,
      originality: originality.score,
      readability: readability.score,
      engagement: engagement.score,
      platformOptimization,
      breakdown,
      confidence
    };

    this.logger.info(`Quality score calculated in ${processingTime}ms: ${overall}`);
    return result;
  }

  /**
   * 检查原创性
   */
  checkOriginality(content: string): OriginalityResult {
    // 处理空内容
    if (!content || typeof content !== 'string') {
      return {
        score: 0,
        duplicateSegments: [],
        uniquenessRatio: 0,
        confidence: 0
      };
    }

    // 简化的原创性检查 - 实际应用中可以集成更复杂的算法
    const sentences = content.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
    const duplicateSegments: string[] = [];
    
    // 检查重复句子
    const sentenceMap = new Map<string, number>();
    sentences.forEach(sentence => {
      const normalized = sentence.trim().toLowerCase();
      if (normalized.length > 10) {
        const count = sentenceMap.get(normalized) || 0;
        sentenceMap.set(normalized, count + 1);
        if (count > 0) {
          duplicateSegments.push(sentence.trim());
        }
      }
    });

    // 计算独特性比例
    const uniqueSentences = sentences.length - duplicateSegments.length;
    const uniquenessRatio = sentences.length > 0 ? uniqueSentences / sentences.length : 1;

    // 计算原创性评分
    let score = uniquenessRatio * 100;
    
    // 检查常见短语
    const commonPhrases = ['众所周知', '据说', '有人说', '网上说', '大家都知道'];
    const commonPhraseCount = commonPhrases.reduce((count, phrase) => {
      return count + (content.includes(phrase) ? 1 : 0);
    }, 0);
    
    score -= commonPhraseCount * 5; // 每个常见短语扣5分
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      duplicateSegments,
      uniquenessRatio,
      confidence: this.calculateOriginalityConfidence(content)
    };
  }

  /**
   * 评估可读性
   */
  assessReadability(content: string): ReadabilityScore {
    // 处理空内容
    if (!content || typeof content !== 'string') {
      return {
        score: 0,
        level: 'graduate',
        factors: {
          sentenceLength: 0,
          wordComplexity: 0,
          paragraphStructure: 0,
          vocabularyDiversity: 0
        }
      };
    }

    const sentences = content.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.trim().length > 0);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // 计算可读性因素
    const factors: ReadabilityFactors = {
      sentenceLength: sentences.length > 0 ? words.length / sentences.length : 0,
      wordComplexity: this.calculateWordComplexity(words),
      paragraphStructure: this.calculateParagraphStructure(paragraphs),
      vocabularyDiversity: this.calculateVocabularyDiversity(words)
    };

    // 计算可读性评分
    let score = 100;
    
    // 句子长度评分 (理想长度15-25字)
    if (factors.sentenceLength > 30) {
      score -= (factors.sentenceLength - 30) * 2;
    } else if (factors.sentenceLength < 10) {
      score -= (10 - factors.sentenceLength) * 3;
    }

    // 词汇复杂度评分
    score -= factors.wordComplexity * 20;

    // 段落结构评分
    score += factors.paragraphStructure * 20;

    // 词汇多样性评分
    score += factors.vocabularyDiversity * 15;

    score = Math.max(0, Math.min(100, score));

    // 确定可读性级别
    let level: ReadabilityScore['level'];
    if (score >= 80) level = 'elementary';
    else if (score >= 60) level = 'middle';
    else if (score >= 40) level = 'high';
    else if (score >= 20) level = 'college';
    else level = 'graduate';

    return {
      score,
      level,
      factors
    };
  }

  /**
   * 预测参与度
   */
  predictEngagement(content: string, platform: SocialMediaPlatform): EngagementPrediction {
    // 处理空内容
    if (!content || typeof content !== 'string') {
      return {
        score: 0,
        factors: {
          emotionalAppeal: 0,
          interactivity: 0,
          relevance: 0,
          timing: 0,
          visualElements: 0
        },
        recommendations: [],
        confidence: 0
      };
    }

    const factors: EngagementFactors = {
      emotionalAppeal: this.calculateEmotionalAppeal(content),
      interactivity: this.calculateInteractivity(content),
      relevance: this.calculateRelevance(content, platform),
      timing: this.calculateTiming(content),
      visualElements: this.calculateVisualElements(content)
    };

    // 计算参与度评分
    const score = (
      factors.emotionalAppeal * 0.3 +
      factors.interactivity * 0.25 +
      factors.relevance * 0.25 +
      factors.timing * 0.1 +
      factors.visualElements * 0.1
    );

    const recommendations = this.generateEngagementRecommendations(factors, platform);
    const confidence = this.calculateEngagementConfidence(content, platform);

    return {
      score,
      factors,
      recommendations,
      confidence
    };
  }

  /**
   * 评估平台优化度
   */
  private assessPlatformOptimization(content: string, platform: SocialMediaPlatform): number {
    let score = 50; // 基础分

    const platformKeywords = this.platformKeywords.get(platform.id) || [];
    const keywordMatches = platformKeywords.filter(keyword => content.includes(keyword));
    
    // 关键词匹配度
    score += (keywordMatches.length / platformKeywords.length) * 30;

    // 平台特定元素检查
    switch (platform.id) {
      case 'xiaohongshu':
        score += this.checkXiaohongshuOptimization(content);
        break;
      case 'twitter':
        score += this.checkTwitterOptimization(content);
        break;
      case 'wechat':
        score += this.checkWechatOptimization(content);
        break;
      case 'blog':
        score += this.checkBlogOptimization(content);
        break;
      case 'toutiao':
        score += this.checkToutiaoOptimization(content);
        break;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 计算质量细分评分
   */
  private calculateQualityBreakdown(content: string, platform: SocialMediaPlatform): QualityBreakdown {
    return {
      contentStructure: this.assessContentStructure(content),
      languageQuality: this.assessLanguageQuality(content),
      platformAlignment: this.assessPlatformOptimization(content, platform),
      userEngagement: this.predictEngagement(content, platform).score,
      technicalQuality: this.assessTechnicalQuality(content)
    };
  }

  /**
   * 计算总体评分
   */
  private calculateOverallScore(
    originality: OriginalityResult,
    readability: ReadabilityScore,
    engagement: EngagementPrediction,
    platformOptimization: number
  ): number {
    return (
      originality.score * 0.25 +
      readability.score * 0.25 +
      engagement.score * 0.3 +
      platformOptimization * 0.2
    );
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(content: string, platform: SocialMediaPlatform): number {
    let confidence = 0.8; // 基础置信度

    // 内容长度影响置信度
    if (content.length < 50) confidence -= 0.2;
    else if (content.length > 2000) confidence -= 0.1;

    // 平台匹配度影响置信度
    const platformKeywords = this.platformKeywords.get(platform.id) || [];
    const keywordMatches = platformKeywords.filter(keyword => content.includes(keyword));
    confidence += (keywordMatches.length / platformKeywords.length) * 0.2;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * 计算词汇复杂度
   */
  private calculateWordComplexity(words: string[]): number {
    if (words.length === 0) return 0;

    const complexWords = words.filter(word => {
      return word.length > 4 && !this.commonWords.has(word);
    });

    return complexWords.length / words.length;
  }

  /**
   * 计算段落结构
   */
  private calculateParagraphStructure(paragraphs: string[]): number {
    if (paragraphs.length === 0) return 0;

    // 理想段落数量和长度
    const idealParagraphCount = Math.min(5, Math.max(2, paragraphs.length));
    const paragraphScore = Math.min(1, paragraphs.length / idealParagraphCount);

    // 段落长度一致性
    const lengths = paragraphs.map(p => p.length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const consistencyScore = Math.max(0, 1 - variance / (avgLength * avgLength));

    return (paragraphScore + consistencyScore) / 2;
  }

  /**
   * 计算词汇多样性
   */
  private calculateVocabularyDiversity(words: string[]): number {
    if (words.length === 0) return 0;

    const uniqueWords = new Set(words.map(word => word.toLowerCase()));
    return uniqueWords.size / words.length;
  }

  /**
   * 计算情感吸引力
   */
  private calculateEmotionalAppeal(content: string): number {
    const emotionalWords = [
      '惊喜', '震撼', '感动', '激动', '兴奋', '开心', '快乐', '幸福', '满足', '骄傲',
      '担心', '焦虑', '紧张', '害怕', '愤怒', '失望', '沮丧', '悲伤', '痛苦', '绝望',
      '爱', '喜欢', '讨厌', '恨', '羡慕', '嫉妒', '同情', '怜悯', '感激', '敬佩'
    ];

    const emotionalCount = emotionalWords.reduce((count, word) => {
      return count + (content.includes(word) ? 1 : 0);
    }, 0);

    // 表情符号也增加情感吸引力
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu) || []).length;

    const totalEmotionalElements = emotionalCount + emojiCount;
    const contentLength = content.length / 100; // 每100字为单位

    return Math.min(100, (totalEmotionalElements / contentLength) * 20);
  }

  /**
   * 计算互动性
   */
  private calculateInteractivity(content: string): number {
    let score = 0;

    // 问句
    const questionCount = (content.match(/[？?]/g) || []).length;
    score += questionCount * 15;

    // 互动词汇
    const interactiveWords = ['你们觉得', '大家认为', '你觉得呢', '怎么看', '评论区', '留言', '分享', '讨论'];
    const interactiveCount = interactiveWords.reduce((count, word) => {
      return count + (content.includes(word) ? 1 : 0);
    }, 0);
    score += interactiveCount * 10;

    // 呼吁行动
    const actionWords = ['点赞', '转发', '收藏', '关注', '订阅', '分享'];
    const actionCount = actionWords.reduce((count, word) => {
      return count + (content.includes(word) ? 1 : 0);
    }, 0);
    score += actionCount * 8;

    return Math.min(100, score);
  }

  /**
   * 计算相关性
   */
  private calculateRelevance(content: string, platform: SocialMediaPlatform): number {
    const platformKeywords = this.platformKeywords.get(platform.id) || [];
    const keywordMatches = platformKeywords.filter(keyword => content.includes(keyword));
    
    return (keywordMatches.length / platformKeywords.length) * 100;
  }

  /**
   * 计算时间感
   */
  private calculateTiming(content: string): number {
    const timeWords = ['今天', '昨天', '明天', '现在', '最近', '刚刚', '马上', '立即', '趋势', '热门', '最新'];
    const timeCount = timeWords.reduce((count, word) => {
      return count + (content.includes(word) ? 1 : 0);
    }, 0);

    return Math.min(100, timeCount * 20);
  }

  /**
   * 计算视觉元素
   */
  private calculateVisualElements(content: string): number {
    let score = 0;

    // 表情符号
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu) || []).length;
    score += Math.min(50, emojiCount * 5);

    // 特殊符号
    const symbolCount = (content.match(/[★☆♥♡→←↑↓✓✗]/g) || []).length;
    score += Math.min(30, symbolCount * 3);

    // 格式化元素
    if (content.includes('**') || content.includes('__')) score += 10; // 粗体
    if (content.includes('```')) score += 10; // 代码块

    return Math.min(100, score);
  }

  /**
   * 生成参与度提升建议
   */
  private generateEngagementRecommendations(factors: EngagementFactors, platform: SocialMediaPlatform): string[] {
    const recommendations: string[] = [];

    if (factors.emotionalAppeal < 50) {
      recommendations.push('增加情感词汇和表情符号提升情感吸引力');
    }

    if (factors.interactivity < 50) {
      recommendations.push('添加互动问题或呼吁行动提升互动性');
    }

    if (factors.relevance < 50) {
      recommendations.push(`增加${platform.name}平台相关的关键词和话题`);
    }

    if (factors.timing < 30) {
      recommendations.push('添加时效性词汇增强内容的时间感');
    }

    if (factors.visualElements < 40) {
      recommendations.push('增加表情符号或特殊符号提升视觉吸引力');
    }

    return recommendations;
  }

  /**
   * 小红书优化检查
   */
  private checkXiaohongshuOptimization(content: string): number {
    let score = 0;

    // 表情符号密度
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu) || []).length;
    const emojiDensity = emojiCount / (content.length / 100);
    if (emojiDensity >= 3 && emojiDensity <= 8) score += 15;

    // 互动问题
    if (/[？?]/.test(content)) score += 10;

    // 种草语言
    const grassWords = ['种草', '推荐', '好用', '必买', '心动'];
    const grassCount = grassWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
    score += grassCount * 3;

    return score;
  }

  /**
   * Twitter优化检查
   */
  private checkTwitterOptimization(content: string): number {
    let score = 0;

    // 字符限制
    if (content.length <= 280) score += 15;

    // 标签使用
    const hashtagCount = (content.match(/#\w+/g) || []).length;
    if (hashtagCount >= 1 && hashtagCount <= 3) score += 10;

    // 简洁性
    const sentences = content.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = content.length / sentences.length;
    if (avgSentenceLength <= 50) score += 5;

    return score;
  }

  /**
   * 微信公众号优化检查
   */
  private checkWechatOptimization(content: string): number {
    let score = 0;

    // 结构化内容
    if (/##\s+/.test(content)) score += 10;

    // 专业性
    const professionalWords = ['分析', '研究', '数据', '报告', '趋势', '洞察'];
    const professionalCount = professionalWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
    score += professionalCount * 2;

    // 长度适中
    if (content.length >= 800 && content.length <= 1500) score += 10;

    return score;
  }

  /**
   * 博客优化检查
   */
  private checkBlogOptimization(content: string): number {
    let score = 0;

    // 技术内容
    if (/```[\s\S]*?```/.test(content)) score += 10;

    // 标题层级
    const headings = content.match(/^#+\s+/gm) || [];
    if (headings.length >= 2) score += 10;

    // 技术词汇
    const techWords = ['技术', '实现', '方法', '解决方案', '最佳实践', '架构'];
    const techCount = techWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
    score += techCount * 2;

    return score;
  }

  /**
   * 头条号优化检查
   */
  private checkToutiaoOptimization(content: string): number {
    let score = 0;

    // 吸引力词汇
    const attractiveWords = ['震惊', '揭秘', '真相', '内幕', '爆料', '反转'];
    const attractiveCount = attractiveWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
    score += attractiveCount * 5;

    // 争议性
    const controversialWords = ['争议', '质疑', '反对', '支持', '辩论'];
    const controversialCount = controversialWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
    score += controversialCount * 3;

    // 讨论引导
    if (/评论|讨论|你怎么看/.test(content)) score += 10;

    return score;
  }

  /**
   * 评估内容结构
   */
  private assessContentStructure(content: string): number {
    let score = 50; // 基础分

    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // 段落数量
    if (paragraphs.length >= 2 && paragraphs.length <= 6) score += 20;
    
    // 段落长度一致性
    const lengths = paragraphs.map(p => p.length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const consistencyScore = Math.max(0, 30 - (variance / avgLength));
    score += consistencyScore;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 评估语言质量
   */
  private assessLanguageQuality(content: string): number {
    let score = 70; // 基础分

    // 检查语法错误（简化版）
    const grammarIssues = [
      /的的/g,  // 重复的"的"
      /了了/g,  // 重复的"了"
      /在在/g,  // 重复的"在"
    ];

    grammarIssues.forEach(pattern => {
      const matches = content.match(pattern) || [];
      score -= matches.length * 5;
    });

    // 词汇多样性
    const words = content.split(/\s+/).filter(w => w.trim().length > 0);
    const uniqueWords = new Set(words.map(word => word.toLowerCase()));
    const diversity = uniqueWords.size / words.length;
    score += diversity * 30;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 评估技术质量
   */
  private assessTechnicalQuality(content: string): number {
    let score = 80; // 基础分

    // 检查特殊字符
    const unusualChars = content.match(/[^\u0020-\u007F\u4e00-\u9fff\s\u3000-\u303F\uFF00-\uFFEF]/gu);
    if (unusualChars && unusualChars.length > 0) {
      score -= unusualChars.length * 2;
    }

    // 检查格式一致性
    if (content.includes('\t')) score -= 5; // 制表符
    if (/\s{3,}/.test(content)) score -= 5; // 多余空格

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 计算原创性置信度
   */
  private calculateOriginalityConfidence(content: string): number {
    let confidence = 0.8;

    // 内容长度影响置信度
    if (content.length < 100) confidence -= 0.2;
    if (content.length > 1000) confidence += 0.1;

    // 词汇多样性影响置信度
    const words = content.split(/\s+/).filter(w => w.trim().length > 0);
    const uniqueWords = new Set(words.map(word => word.toLowerCase()));
    const diversity = uniqueWords.size / words.length;
    confidence += diversity * 0.2;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * 计算参与度预测置信度
   */
  private calculateEngagementConfidence(content: string, platform: SocialMediaPlatform): number {
    let confidence = 0.7;

    // 平台关键词匹配度影响置信度
    const platformKeywords = this.platformKeywords.get(platform.id) || [];
    const keywordMatches = platformKeywords.filter(keyword => content.includes(keyword));
    confidence += (keywordMatches.length / platformKeywords.length) * 0.3;

    return Math.max(0.1, Math.min(1.0, confidence));
  }
} 