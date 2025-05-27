/**
 * TOM-108: 风格评估器
 * 
 * 负责内容风格评估、必需元素检测和风格改进建议
 */

import {
  StyleAssessor as IStyleAssessor,
  StyleAssessment,
  ElementCheckResult,
  StyleSuggestion,
  ElementScore,
  KeywordAnalysis,
  ElementDetection
} from '../types/content-processing';
import { SocialMediaPlatform } from '../types/social-media';
import { Logger } from '../utils/logger';

/**
 * 风格评估器 - 负责内容风格评估和元素检测
 */
export class StyleAssessor implements IStyleAssessor {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('StyleAssessor');
  }

  /**
   * 评估内容风格
   */
  assessStyle(content: string, platform: SocialMediaPlatform): StyleAssessment {
    this.logger.info(`Assessing style for platform: ${platform.id}`);

    const overallScore = this.calculateOverallScore(content, platform);
    const platformFit = this.calculatePlatformFit(content, platform);
    const toneConsistency = this.calculateToneConsistency(content, platform);
    const elementPresence = this.checkElementPresence(content, platform);
    const keywordUsage = this.analyzeKeywordUsage(content, platform);

    const result: StyleAssessment = {
      overallScore,
      platformFit,
      toneConsistency,
      elementPresence,
      keywordUsage,
      improvements: this.generateImprovements(content, platform),
      strengths: this.identifyStrengths(content, platform),
      weaknesses: this.identifyWeaknesses(content, platform),
      confidence: 0.85
    };

    this.logger.info(`Style assessment completed with score: ${overallScore}`);
    return result;
  }

  /**
   * 检查必需元素
   */
  checkRequiredElements(content: string, platform: SocialMediaPlatform): ElementCheckResult {
    const requiredElements = platform.requiredElements || [];
    const requiredElementsResult: ElementDetection[] = [];
    const optionalElementsResult: ElementDetection[] = [];
    
    // 处理必需元素
    const detected: string[] = [];
    const missing: string[] = [];
    const confidence: Record<string, number> = {};

    requiredElements.forEach(element => {
      const isPresent = this.detectElement(content, element);
      if (isPresent) {
        detected.push(element);
        confidence[element] = 0.9;
      } else {
        missing.push(element);
        confidence[element] = 0.1;
      }
    });

    requiredElementsResult.push({
      detected,
      missing,
      confidence
    });

    // 计算整体符合度
    const overallCompliance = Math.round((detected.length / Math.max(requiredElements.length, 1)) * 100);

    return {
      requiredElements: requiredElementsResult,
      optionalElements: optionalElementsResult,
      overallCompliance
    };
  }

  /**
   * 建议风格改进
   */
  suggestStyleImprovements(content: string, platform: SocialMediaPlatform): StyleSuggestion[] {
    const suggestions: StyleSuggestion[] = [];
    
    // 检查必需元素
    const elementCheck = this.checkRequiredElements(content, platform);
    const missingElements = elementCheck.requiredElements[0]?.missing || [];
    if (missingElements.length > 0) {
      suggestions.push({
        type: 'element',
        message: `缺少必需元素: ${missingElements.join('、')}`,
        example: this.generateElementExample(missingElements[0], platform),
        priority: 1
      });
    }

    // 检查关键词使用
    const keywordAnalysis = this.analyzeKeywordUsage(content, platform);
    if (keywordAnalysis.missingKeywords.length > 0) {
      suggestions.push({
        type: 'keyword',
        message: `建议添加平台关键词: ${keywordAnalysis.missingKeywords.slice(0, 3).join('、')}`,
        priority: 2
      });
    }

    // 检查语调一致性
    const toneScore = this.calculateToneConsistency(content, platform);
    if (toneScore < 70) {
      suggestions.push({
        type: 'tone',
        message: '语调与平台风格不够匹配，建议调整表达方式',
        priority: 3
      });
    }

    return suggestions;
  }

  /**
   * 计算总体评分
   */
  private calculateOverallScore(content: string, platform: SocialMediaPlatform): number {
    const platformFit = this.calculatePlatformFit(content, platform);
    const toneConsistency = this.calculateToneConsistency(content, platform);
    const elementScore = this.calculateElementScore(content, platform);
    
    return Math.round((platformFit * 0.4 + toneConsistency * 0.3 + elementScore * 0.3));
  }

  /**
   * 计算平台适配度
   */
  private calculatePlatformFit(content: string, platform: SocialMediaPlatform): number {
    const styleKeywords = platform.styleKeywords || [];
    let score = 50; // 基础分

    // 检查风格关键词
    const keywordMatches = styleKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    score += (keywordMatches / Math.max(styleKeywords.length, 1)) * 30;

    // 平台特定检查
    switch (platform.id) {
      case 'xiaohongshu':
        score += this.checkXiaohongshuStyle(content);
        break;
      case 'twitter':
        score += this.checkTwitterStyle(content);
        break;
      case 'wechat':
        score += this.checkWechatStyle(content);
        break;
      case 'blog':
        score += this.checkBlogStyle(content);
        break;
      case 'toutiao':
        score += this.checkToutiaoStyle(content);
        break;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 计算语调一致性
   */
  private calculateToneConsistency(content: string, platform: SocialMediaPlatform): number {
    // 基于平台特定的语调检查
    let score = 70; // 基础分

    const sentences = content.split(/[。！？.!?]+/).filter(s => s.trim());
    if (sentences.length === 0) return 0;

    // 检查语调一致性
    const toneScores = sentences.map(sentence => this.analyzeSentenceTone(sentence, platform));
    const avgTone = toneScores.reduce((sum, score) => sum + score, 0) / toneScores.length;
    const toneVariance = toneScores.reduce((sum, score) => sum + Math.pow(score - avgTone, 2), 0) / toneScores.length;

    // 方差越小，一致性越高
    score += Math.max(0, 30 - toneVariance);

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 检查元素存在
   */
  private checkElementPresence(content: string, platform: SocialMediaPlatform): ElementScore[] {
    const requiredElements = platform.requiredElements || [];
    
    return requiredElements.map(element => ({
      element,
      present: this.detectElement(content, element),
      score: this.detectElement(content, element) ? 100 : 0,
      importance: this.getElementImportance(element, platform),
      suggestions: this.detectElement(content, element) ? [] : [`建议添加${element}`]
    }));
  }

  /**
   * 分析关键词使用
   */
  private analyzeKeywordUsage(content: string, platform: SocialMediaPlatform): KeywordAnalysis {
    const styleKeywords = platform.styleKeywords || [];
    const requiredKeywords: string[] = [];
    const missingKeywords: string[] = [];
    const overusedKeywords: string[] = [];

    styleKeywords.forEach(keyword => {
      const count = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      if (count > 0) {
        requiredKeywords.push(keyword);
        if (count > 3) {
          overusedKeywords.push(keyword);
        }
      } else {
        missingKeywords.push(keyword);
      }
    });

    const totalWords = content.split(/\s+/).length;
    const density = requiredKeywords.length / Math.max(totalWords, 1);
    const distribution = this.calculateKeywordDistribution(content, requiredKeywords);

    return {
      totalKeywords: requiredKeywords.length,
      requiredKeywords,
      missingKeywords,
      overusedKeywords,
      density,
      distribution
    };
  }

  /**
   * 检测元素是否存在
   */
  private detectElement(content: string, element: string): boolean {
    const elementPatterns: Record<string, RegExp> = {
      '表情符号': /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu,
      '互动问题': /[？?]|你们觉得|大家认为|你觉得呢|怎么看/,
      '标签': /#[\w\u4e00-\u9fff]+/,
      '小标题': /^##\s+/m,
      '代码示例': /```[\s\S]*?```|`[^`]+`/,
      '数据支撑': /\d+%|\d+倍|\d+个|\d+万|\d+亿/,
      '热点话题': /震惊|揭秘|真相|内幕|爆料|反转/
    };

    const pattern = elementPatterns[element];
    if (pattern) {
      return pattern.test(content);
    }

    // 简单的文本匹配
    return content.includes(element);
  }

  /**
   * 生成元素示例
   */
  private generateElementExample(element: string, platform: SocialMediaPlatform): string {
    const examples: Record<string, Record<string, string>> = {
      xiaohongshu: {
        '表情符号': '✨💕🌟',
        '互动问题': '你们觉得怎么样呢？',
        '亲切称呼': '姐妹们、宝子们'
      },
      twitter: {
        '标签': '#技术分享 #编程',
        '互动元素': '你怎么看？转发让更多人看到'
      },
      wechat: {
        '小标题': '## 核心观点',
        '数据支撑': '根据最新数据显示，增长了30%'
      },
      blog: {
        '代码示例': '```javascript\nconsole.log("Hello World");\n```'
      },
      toutiao: {
        '热点话题': '震惊！这个真相你一定不知道'
      }
    };

    return examples[platform.id]?.[element] || `请添加${element}`;
  }

  /**
   * 获取元素重要性
   */
  private getElementImportance(element: string, platform: SocialMediaPlatform): number {
    const importance: Record<string, Record<string, number>> = {
      xiaohongshu: {
        '表情符号': 90,
        '互动问题': 85,
        '亲切称呼': 80
      },
      twitter: {
        '标签': 95,
        '互动元素': 75
      },
      wechat: {
        '小标题': 90,
        '数据支撑': 85
      },
      blog: {
        '代码示例': 95,
        '技术细节': 90
      },
      toutiao: {
        '热点话题': 95,
        '争议观点': 85
      }
    };

    return importance[platform.id]?.[element] || 50;
  }

  /**
   * 分析句子语调
   */
  private analyzeSentenceTone(sentence: string, platform: SocialMediaPlatform): number {
    let score = 50;

    // 平台特定语调检查
    switch (platform.id) {
      case 'xiaohongshu':
        if (/姐妹|宝子|绝绝子|yyds/.test(sentence)) score += 20;
        if (/[！!]{2,}/.test(sentence)) score += 10;
        break;
      case 'twitter':
        if (sentence.length <= 140) score += 15;
        if (/#\w+/.test(sentence)) score += 10;
        break;
      case 'wechat':
        if (/数据|研究|分析/.test(sentence)) score += 15;
        if (sentence.length > 50) score += 10;
        break;
      case 'blog':
        if (/技术|代码|实现/.test(sentence)) score += 15;
        if (sentence.length > 80) score += 10;
        break;
      case 'toutiao':
        if (/震惊|揭秘|真相/.test(sentence)) score += 20;
        break;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 计算关键词分布
   */
  private calculateKeywordDistribution(content: string, keywords: string[]): number {
    if (keywords.length === 0) return 0;

    const sentences = content.split(/[。！？.!?]+/).filter(s => s.trim());
    const sentenceCount = sentences.length;
    
    if (sentenceCount === 0) return 0;

    const keywordSentences = sentences.filter(sentence => 
      keywords.some(keyword => sentence.toLowerCase().includes(keyword.toLowerCase()))
    ).length;

    return keywordSentences / sentenceCount;
  }

  /**
   * 计算元素评分
   */
  private calculateElementScore(content: string, platform: SocialMediaPlatform): number {
    const elementPresence = this.checkElementPresence(content, platform);
    if (elementPresence.length === 0) return 100;

    const totalScore = elementPresence.reduce((sum, element) => sum + element.score, 0);
    return totalScore / elementPresence.length;
  }

  /**
   * 生成改进建议
   */
  private generateImprovements(content: string, platform: SocialMediaPlatform): string[] {
    const improvements: string[] = [];
    
    const elementCheck = this.checkRequiredElements(content, platform);
    const missingElements = elementCheck.requiredElements[0]?.missing || [];
    if (missingElements.length > 0) {
      improvements.push(`添加缺失的必需元素: ${missingElements.join('、')}`);
    }

    const keywordAnalysis = this.analyzeKeywordUsage(content, platform);
    if (keywordAnalysis.missingKeywords.length > 0) {
      improvements.push(`使用更多平台关键词: ${keywordAnalysis.missingKeywords.slice(0, 3).join('、')}`);
    }

    return improvements;
  }

  /**
   * 识别优势
   */
  private identifyStrengths(content: string, platform: SocialMediaPlatform): string[] {
    const strengths: string[] = [];
    
    const elementPresence = this.checkElementPresence(content, platform);
    const presentElements = elementPresence.filter(e => e.present);
    if (presentElements.length > 0) {
      strengths.push(`包含了${presentElements.length}个必需元素`);
    }

    const keywordAnalysis = this.analyzeKeywordUsage(content, platform);
    if (keywordAnalysis.requiredKeywords.length > 0) {
      strengths.push(`使用了${keywordAnalysis.requiredKeywords.length}个平台关键词`);
    }

    return strengths;
  }

  /**
   * 识别薄弱点
   */
  private identifyWeaknesses(content: string, platform: SocialMediaPlatform): string[] {
    const weaknesses: string[] = [];
    
    const elementCheck = this.checkRequiredElements(content, platform);
    const missingElements = elementCheck.requiredElements[0]?.missing || [];
    if (missingElements.length > 0) {
      weaknesses.push(`缺少${missingElements.length}个必需元素`);
    }

    const toneScore = this.calculateToneConsistency(content, platform);
    if (toneScore < 70) {
      weaknesses.push('语调与平台风格不够匹配');
    }

    return weaknesses;
  }

  // 平台特定风格检查方法
  private checkXiaohongshuStyle(content: string): number {
    let score = 0;
    if (/[😍🥰💕✨🌟💯]/u.test(content)) score += 10;
    if (/姐妹|宝子|绝绝子|yyds/.test(content)) score += 15;
    if (/[？?]/.test(content)) score += 5;
    return score;
  }

  private checkTwitterStyle(content: string): number {
    let score = 0;
    if (/#\w+/.test(content)) score += 15;
    if (/@\w+/.test(content)) score += 10;
    if (content.length <= 240) score += 5;
    return score;
  }

  private checkWechatStyle(content: string): number {
    let score = 0;
    if (/##\s+/.test(content)) score += 10;
    if (/\d+%|\d+倍/.test(content)) score += 15;
    if (content.length > 800) score += 5;
    return score;
  }

  private checkBlogStyle(content: string): number {
    let score = 0;
    if (/```[\s\S]*?```/.test(content)) score += 15;
    if (/##\s+/.test(content)) score += 10;
    if (content.length > 1000) score += 5;
    return score;
  }

  private checkToutiaoStyle(content: string): number {
    let score = 0;
    if (/震惊|揭秘|真相|内幕/.test(content)) score += 15;
    if (/[！!]{2,}/.test(content)) score += 10;
    if (/[？?]/.test(content)) score += 5;
    return score;
  }
} 