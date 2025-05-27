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

/**
 * 风格评估器实现
 */
export class StyleAssessor implements IStyleAssessor {
  private readonly logger: Console;

  constructor() {
    this.logger = console;
  }

  /**
   * 评估内容风格符合度
   */
  assessStyle(content: string, platform: SocialMediaPlatform): StyleAssessment {
    const startTime = Date.now();
    
    try {
      // 获取平台风格要求
      const styleRequirements = this.getPlatformStyleRequirements(platform);
      
      // 分析关键词使用
      const keywordUsage = this.analyzeKeywordUsage(content, styleRequirements.keywords);
      
      // 检查必需元素
      const elementPresence = this.checkElementPresence(content, styleRequirements.requiredElements);
      
      // 评估语调一致性
      const toneConsistency = this.checkToneConsistency(content, platform);
      
      // 计算平台适配度
      const platformFit = this.calculatePlatformFit(content, platform);
      
      // 计算总体评分
      const overallScore = this.calculateOverallScore(
        keywordUsage.relevanceScore,
        elementPresence.map(e => e.score).reduce((a, b) => a + b, 0) / elementPresence.length,
        toneConsistency,
        platformFit
      );
      
      // 生成改进建议
      const improvements = this.generateImprovements(content, platform, keywordUsage, elementPresence);
      
      // 识别优势和薄弱点
      const { strengths, weaknesses } = this.identifyStrengthsAndWeaknesses(
        content, 
        platform, 
        keywordUsage, 
        elementPresence,
        toneConsistency,
        platformFit
      );

      const result: StyleAssessment = {
        overallScore,
        platformFit,
        toneConsistency,
        elementPresence,
        keywordUsage,
        improvements,
        strengths,
        weaknesses
      };

      this.logger.log(`[StyleAssessor] 风格评估完成: ${Date.now() - startTime}ms`, {
        platform: platform.id,
        overallScore,
        platformFit,
        toneConsistency,
        improvementsCount: improvements.length
      });

      return result;
    } catch (error) {
      this.logger.error('[StyleAssessor] 风格评估失败:', error);
      throw new Error(`风格评估失败: ${error.message}`);
    }
  }

  /**
   * 检查必需元素
   */
  checkRequiredElements(content: string, platform: SocialMediaPlatform): ElementCheckResult {
    const startTime = Date.now();
    
    try {
      const styleRequirements = this.getPlatformStyleRequirements(platform);
      
      const requiredElements = styleRequirements.requiredElements.map(element => 
        this.detectElement(content, element)
      );
      
      const optionalElements = (styleRequirements.optionalElements || []).map(element => 
        this.detectElement(content, element)
      );
      
      // 计算整体符合度
      const requiredCompliance = requiredElements.filter(e => e.detected).length / requiredElements.length;
      const optionalCompliance = optionalElements.length > 0 
        ? optionalElements.filter(e => e.detected).length / optionalElements.length 
        : 1;
      
      const overallCompliance = Math.round((requiredCompliance * 0.8 + optionalCompliance * 0.2) * 100);

      const result: ElementCheckResult = {
        requiredElements,
        optionalElements,
        overallCompliance
      };

      this.logger.log(`[StyleAssessor] 元素检查完成: ${Date.now() - startTime}ms`, {
        platform: platform.id,
        requiredCount: requiredElements.length,
        optionalCount: optionalElements.length,
        overallCompliance
      });

      return result;
    } catch (error) {
      this.logger.error('[StyleAssessor] 元素检查失败:', error);
      throw new Error(`元素检查失败: ${error.message}`);
    }
  }

  /**
   * 提供风格改进建议
   */
  suggestStyleImprovements(content: string, platform: SocialMediaPlatform): StyleSuggestion[] {
    const startTime = Date.now();
    
    try {
      const suggestions: StyleSuggestion[] = [];
      const styleRequirements = this.getPlatformStyleRequirements(platform);
      
      // 关键词建议
      const keywordAnalysis = this.analyzeKeywordUsage(content, styleRequirements.keywords);
      if (keywordAnalysis.missingKeywords.length > 0) {
        suggestions.push({
          category: 'keywords',
          priority: 'high',
          description: `建议添加平台特色关键词: ${keywordAnalysis.missingKeywords.slice(0, 3).join('、')}`,
          example: this.generateKeywordExample(keywordAnalysis.missingKeywords[0], platform)
        });
      }
      
      // 语调建议
      const toneScore = this.checkToneConsistency(content, platform);
      if (toneScore < 70) {
        suggestions.push({
          category: 'tone',
          priority: 'high',
          description: `语调与平台风格不够匹配，建议调整为${styleRequirements.toneTarget}风格`,
          example: this.generateToneExample(platform)
        });
      }
      
      // 元素建议
      const elementCheck = this.checkRequiredElements(content, platform);
      const missingRequired = elementCheck.requiredElements.filter(e => !e.detected);
      if (missingRequired.length > 0) {
        suggestions.push({
          category: 'elements',
          priority: 'high',
          description: `缺少必需元素: ${missingRequired.map(e => e.element).join('、')}`,
          example: this.generateElementExample(missingRequired[0].element, platform)
        });
      }
      
      // 结构建议
      const structureSuggestions = this.generateStructureSuggestions(content, platform);
      suggestions.push(...structureSuggestions);
      
      // 平台特定建议
      const platformSuggestions = this.generatePlatformSpecificSuggestions(content, platform);
      suggestions.push(...platformSuggestions);

      this.logger.log(`[StyleAssessor] 风格建议生成完成: ${Date.now() - startTime}ms`, {
        platform: platform.id,
        suggestionsCount: suggestions.length
      });

      return suggestions;
    } catch (error) {
      this.logger.error('[StyleAssessor] 风格建议生成失败:', error);
      throw new Error(`风格建议生成失败: ${error.message}`);
    }
  }

  /**
   * 检查语调一致性
   */
  private checkToneConsistency(content: string, platform: SocialMediaPlatform): number {
    const styleRequirements = this.getPlatformStyleRequirements(platform);
    const toneKeywords = styleRequirements.toneKeywords;
    const avoidKeywords = styleRequirements.avoidKeywords || [];
    
    let score = 50; // 基础分
    
    // 检查正面关键词
    const positiveMatches = toneKeywords.filter(keyword => 
      content.includes(keyword)
    ).length;
    score += (positiveMatches / toneKeywords.length) * 40;
    
    // 检查负面关键词
    const negativeMatches = avoidKeywords.filter(keyword => 
      content.includes(keyword)
    ).length;
    score -= (negativeMatches / Math.max(avoidKeywords.length, 1)) * 30;
    
    // 平台特定语调检查
    score += this.checkPlatformSpecificTone(content, platform);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 分析关键词使用
   */
  private analyzeKeywordUsage(content: string, keywords: string[]): KeywordAnalysis {
    const matchedKeywords = keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const missingKeywords = keywords.filter(keyword => 
      !content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const totalKeywords = keywords.length;
    const keywordDensity = matchedKeywords.length / Math.max(content.length / 100, 1);
    const relevanceScore = Math.round((matchedKeywords.length / totalKeywords) * 100);
    
    return {
      totalKeywords,
      matchedKeywords,
      missingKeywords,
      keywordDensity,
      relevanceScore
    };
  }

  /**
   * 检测元素存在
   */
  private detectElement(content: string, element: string): ElementDetection {
    let detected = false;
    let confidence = 0;
    let location = '';
    const suggestions: string[] = [];
    
    switch (element) {
      case '表情符号': {
        const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
                 const matches = content.match(emojiPattern);
         detected = !!matches && matches.length > 0;
         confidence = detected ? Math.min((matches?.length || 0) * 20, 100) : 0;
        if (!detected) {
          suggestions.push('建议添加相关表情符号增加亲和力');
        }
        break;
      }
      
      case '互动问题':
      case '互动元素': {
        const questionPattern = /[？?]|你觉得|你认为|大家|评论|分享|点赞/;
        detected = questionPattern.test(content);
        confidence = detected ? 80 : 0;
        if (!detected) {
          suggestions.push('建议添加互动问题引导用户参与');
        }
        break;
      }
      
      case '亲切称呼': {
        const addressPattern = /姐妹们|宝子们|朋友们|大家|亲爱的/;
        detected = addressPattern.test(content);
        confidence = detected ? 90 : 0;
        if (!detected) {
          suggestions.push('建议使用亲切的称呼拉近距离');
        }
        break;
      }
      
      case '标签': {
        const hashtagPattern = /#[\w\u4e00-\u9fff]+/;
        detected = hashtagPattern.test(content);
        confidence = detected ? 85 : 0;
        if (!detected) {
          suggestions.push('建议添加相关标签增加曝光');
        }
        break;
      }
      
      case '小标题': {
        const headingPattern = /^##\s+.+$/m;
        detected = headingPattern.test(content);
        confidence = detected ? 95 : 0;
        if (!detected) {
          suggestions.push('建议添加小标题提升可读性');
        }
        break;
      }
      
      case '结构化内容': {
        const structurePattern = /\n\s*\n|\d+\.|•|-\s+/;
        detected = structurePattern.test(content);
        confidence = detected ? 75 : 0;
        if (!detected) {
          suggestions.push('建议使用列表或分段提升结构性');
        }
        break;
      }
      
      case '目录': {
        const tocPattern = /目录|索引|##\s+/;
        detected = tocPattern.test(content);
        confidence = detected ? 90 : 0;
        if (!detected) {
          suggestions.push('建议添加目录便于阅读');
        }
        break;
      }
      
      case '代码示例': {
        const codePattern = /```[\s\S]*?```|`[^`]+`/;
        detected = codePattern.test(content);
        confidence = detected ? 95 : 0;
        if (!detected) {
          suggestions.push('建议添加代码示例增强技术性');
        }
        break;
      }
      
      case '参考资料': {
        const refPattern = /参考|引用|来源|链接|https?:\/\//;
        detected = refPattern.test(content);
        confidence = detected ? 80 : 0;
        if (!detected) {
          suggestions.push('建议添加参考资料增加权威性');
        }
        break;
      }
      
      case '吸引标题': {
        const titlePattern = /震惊|揭秘|真相|内幕|爆料|反转|必看|重磅/;
        detected = titlePattern.test(content);
        confidence = detected ? 85 : 0;
        if (!detected) {
          suggestions.push('建议使用更吸引眼球的标题');
        }
        break;
      }
      
      case '争议观点': {
        const controversyPattern = /但是|然而|相反|争议|质疑|反对|不同意见/;
        detected = controversyPattern.test(content);
        confidence = detected ? 70 : 0;
        if (!detected) {
          suggestions.push('建议添加不同观点增加讨论性');
        }
        break;
      }
      
      case '热点话题': {
        const hotTopicPattern = /最新|热门|流行|趋势|爆火|网红|话题/;
        detected = hotTopicPattern.test(content);
        confidence = detected ? 75 : 0;
        if (!detected) {
          suggestions.push('建议结合当前热点话题');
        }
        break;
      }
      
      case '讨论引导': {
        const discussionPattern = /你怎么看|欢迎讨论|留言|评论区|分享你的|说说你的/;
        detected = discussionPattern.test(content);
        confidence = detected ? 80 : 0;
        if (!detected) {
          suggestions.push('建议添加讨论引导语');
        }
        break;
      }
      
      default:
        // 通用检测
        detected = content.includes(element);
        confidence = detected ? 60 : 0;
        if (!detected) {
          suggestions.push(`建议添加"${element}"相关内容`);
        }
    }
    
    return {
      element,
      detected,
      confidence,
      location,
      suggestions
    };
  }

  /**
   * 检查元素存在性
   */
  private checkElementPresence(content: string, requiredElements: string[]): ElementScore[] {
    return requiredElements.map(element => {
      const detection = this.detectElement(content, element);
      return {
        element,
        present: detection.detected,
        score: detection.confidence,
                 details: detection.suggestions?.join('; ') || ''
      };
    });
  }

  /**
   * 计算平台适配度
   */
  private calculatePlatformFit(content: string, platform: SocialMediaPlatform): number {
    let score = 50; // 基础分
    
    switch (platform.id) {
      case 'xiaohongshu': {
        // 检查表情符号密度
        const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu) || []).length;
        const emojiDensity = emojiCount / (content.length / 100);
        if (emojiDensity >= 3 && emojiDensity <= 8) score += 20;
        
        // 检查亲切称呼
        if (/姐妹们|宝子们/.test(content)) score += 15;
        
        // 检查互动元素
        if (/[？?]/.test(content)) score += 15;
        break;
      }
      
      case 'twitter': {
        // 检查简洁性
        if (content.length <= 200) score += 20;
        
        // 检查标签
        const hashtagCount = (content.match(/#\w+/g) || []).length;
        if (hashtagCount >= 1 && hashtagCount <= 3) score += 15;
        
        // 检查互动元素
        if (/[@#]/.test(content)) score += 15;
        break;
      }
      
      case 'wechat': {
        // 检查专业性
        if (/数据|研究|分析|报告/.test(content)) score += 20;
        
        // 检查结构化
        if (/##/.test(content)) score += 15;
        
        // 检查深度
        if (content.length >= 800) score += 15;
        break;
      }
      
      case 'blog': {
        // 检查技术性
        if (/```|代码|技术|开发/.test(content)) score += 20;
        
        // 检查结构
        if (/##|###/.test(content)) score += 15;
        
        // 检查详细程度
        if (content.length >= 1000) score += 15;
        break;
      }
      
      case 'toutiao': {
        // 检查吸引力
        if (/震惊|揭秘|真相/.test(content)) score += 20;
        
        // 检查争议性
        if (/但是|然而|相反/.test(content)) score += 15;
        
        // 检查通俗性
        if (!/专业术语|技术细节/.test(content)) score += 15;
        break;
      }
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 计算总体评分
   */
  private calculateOverallScore(
    keywordScore: number,
    elementScore: number,
    toneScore: number,
    platformScore: number
  ): number {
    // 加权平均
    const weights = {
      keyword: 0.25,
      element: 0.3,
      tone: 0.25,
      platform: 0.2
    };
    
    const weightedScore = 
      keywordScore * weights.keyword +
      elementScore * weights.element +
      toneScore * weights.tone +
      platformScore * weights.platform;
    
    return Math.round(weightedScore);
  }

  /**
   * 生成改进建议
   */
  private generateImprovements(
    content: string,
    platform: SocialMediaPlatform,
    keywordUsage: KeywordAnalysis,
    elementPresence: ElementScore[]
  ): string[] {
    const improvements: string[] = [];
    
    // 关键词改进
    if (keywordUsage.relevanceScore < 60) {
      improvements.push(`关键词使用不足，建议增加: ${keywordUsage.missingKeywords.slice(0, 3).join('、')}`);
    }
    
    // 元素改进
    const missingElements = elementPresence.filter(e => !e.present);
    if (missingElements.length > 0) {
      improvements.push(`缺少重要元素: ${missingElements.map(e => e.element).slice(0, 3).join('、')}`);
    }
    
    // 平台特定改进
    switch (platform.id) {
      case 'xiaohongshu': {
        const emojiPattern = /🔥|💕|✨/;
        if (!emojiPattern.test(content)) {
          improvements.push('建议添加更多表情符号增加活泼感');
        }
        break;
      }
      case 'twitter':
        if (content.length > 200) {
          improvements.push('内容偏长，建议精简或拆分为推文串');
        }
        break;
      case 'wechat':
        if (!/##/.test(content)) {
          improvements.push('建议添加小标题提升文章结构');
        }
        break;
      case 'blog':
        if (!/```/.test(content)) {
          improvements.push('建议添加代码示例增强技术性');
        }
        break;
      case 'toutiao':
        if (!/[震惊揭秘]/.test(content)) {
          improvements.push('建议使用更吸引眼球的表达方式');
        }
        break;
    }
    
    return improvements;
  }

  /**
   * 识别优势和薄弱点
   */
  private identifyStrengthsAndWeaknesses(
    content: string,
    platform: SocialMediaPlatform,
    keywordUsage: KeywordAnalysis,
    elementPresence: ElementScore[],
    toneScore: number,
    platformScore: number
  ): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    // 关键词分析
    if (keywordUsage.relevanceScore >= 80) {
      strengths.push('关键词使用恰当，符合平台风格');
    } else if (keywordUsage.relevanceScore < 50) {
      weaknesses.push('关键词使用不足，缺乏平台特色');
    }
    
    // 元素分析
    const presentElements = elementPresence.filter(e => e.present);
    if (presentElements.length >= elementPresence.length * 0.8) {
      strengths.push('必需元素齐全，内容完整度高');
    } else if (presentElements.length < elementPresence.length * 0.5) {
      weaknesses.push('缺少多个重要元素，内容不够完整');
    }
    
    // 语调分析
    if (toneScore >= 80) {
      strengths.push('语调与平台风格高度匹配');
    } else if (toneScore < 60) {
      weaknesses.push('语调与平台风格不够匹配');
    }
    
    // 平台适配分析
    if (platformScore >= 80) {
      strengths.push('平台适配度高，符合用户期望');
    } else if (platformScore < 60) {
      weaknesses.push('平台适配度不足，需要优化');
    }
    
    return { strengths, weaknesses };
  }

  /**
   * 获取平台风格要求
   */
  private getPlatformStyleRequirements(platform: SocialMediaPlatform): {
    keywords: string[];
    requiredElements: string[];
    optionalElements?: string[];
    toneKeywords: string[];
    avoidKeywords?: string[];
    toneTarget: string;
  } {
    switch (platform.id) {
      case 'xiaohongshu':
        return {
          keywords: ['姐妹们', '宝子们', '绝绝子', 'yyds', '种草', '拔草', '好用到哭', '真香', '必入', '回购'],
          requiredElements: ['表情符号', '互动问题', '亲切称呼', '使用体验'],
          toneKeywords: ['姐妹们', '宝子们', '绝绝子', 'yyds'],
          toneTarget: '活泼亲切'
        };
      case 'twitter':
        return {
          keywords: ['thread', 'thoughts', 'insights', 'tips', 'breaking', 'update', 'share', 'discuss'],
          requiredElements: ['标签', '互动元素', '简洁表达'],
          toneKeywords: ['share', 'discuss', 'thoughts'],
          toneTarget: '简洁专业'
        };
      case 'wechat':
        return {
          keywords: ['深度', '洞察', '分析', '思考', '实践', '经验', '方法', '策略'],
          requiredElements: ['小标题', '结构化内容', '数据支撑', '总结'],
          toneKeywords: ['分析', '思考', '实践'],
          toneTarget: '专业深度'
        };
      case 'blog':
        return {
          keywords: ['技术', '实践', '指南', '教程', '最佳实践', '深入', '原理', '实现'],
          requiredElements: ['目录', '代码示例', '实践指导', '参考资料'],
          toneKeywords: ['技术', '实践', '指南'],
          toneTarget: '技术专业'
        };
      case 'toutiao':
        return {
          keywords: ['震惊', '揭秘', '真相', '内幕', '爆料', '反转', '热议', '争议'],
          requiredElements: ['吸引标题', '争议观点', '热点话题', '讨论引导'],
          toneKeywords: ['震惊', '揭秘', '真相'],
          avoidKeywords: ['专业术语', '技术细节'],
          toneTarget: '通俗吸引'
        };
      default:
        return {
          keywords: [],
          requiredElements: [],
          toneKeywords: [],
          toneTarget: '中性'
        };
    }
  }

  /**
   * 检查平台特定语调
   */
  private checkPlatformSpecificTone(content: string, platform: SocialMediaPlatform): number {
    let bonus = 0;
    
    switch (platform.id) {
      case 'xiaohongshu':
        // 检查活泼用词
        if (/超级|特别|非常|真的|太/.test(content)) bonus += 5;
        if (/！/.test(content)) bonus += 5;
        break;
      case 'twitter':
        // 检查简洁性
        if (content.split(/[.!?。！？]/).every(s => s.trim().length < 50)) bonus += 10;
        break;
      case 'wechat':
        // 检查专业性
        if (/因此|所以|综上|总结/.test(content)) bonus += 5;
        if (/数据显示|研究表明/.test(content)) bonus += 5;
        break;
      case 'blog':
        // 检查技术性
        if (/实现|配置|部署|优化/.test(content)) bonus += 5;
        if (/步骤|方法|流程/.test(content)) bonus += 5;
        break;
      case 'toutiao':
        // 检查通俗性
        if (/大家|我们|你们/.test(content)) bonus += 5;
        if (/简单来说|通俗地讲/.test(content)) bonus += 5;
        break;
    }
    
    return bonus;
  }

  /**
   * 生成关键词示例
   */
  private generateKeywordExample(keyword: string, platform: SocialMediaPlatform): string {
    const examples: Record<string, string> = {
      '姐妹们': '姐妹们，这个真的太好用了！',
      '绝绝子': '这个效果绝绝子，必须推荐给大家',
      'thread': 'A thread about best practices 🧵',
      '深度': '深度分析这个问题的根本原因',
      '技术': '技术实现的核心要点如下',
      '震惊': '震惊！这个真相你绝对想不到'
    };
    
    return examples[keyword] || `建议在内容中使用"${keyword}"`;
  }

  /**
   * 生成语调示例
   */
  private generateToneExample(platform: SocialMediaPlatform): string {
    const examples: Record<string, string> = {
      'xiaohongshu': '姐妹们，这个真的太好用了！强烈推荐给大家 ✨',
      'twitter': 'Key insights from today\'s research. What do you think? 🤔',
      'wechat': '通过深入分析，我们可以得出以下结论：',
      'blog': '本文将详细介绍实现方法和最佳实践',
      'toutiao': '震惊！这个真相竟然是这样的，你绝对想不到'
    };
    
    return examples[platform.id] || '调整语调以匹配平台风格';
  }

  /**
   * 生成元素示例
   */
  private generateElementExample(element: string, platform: SocialMediaPlatform): string {
    const examples: Record<string, string> = {
      '表情符号': '添加相关表情符号，如：✨ 🔥 💕',
      '互动问题': '结尾添加：你们觉得怎么样？评论区聊聊吧！',
      '标签': '添加相关标签，如：#技术分享 #经验总结',
      '小标题': '使用 ## 格式添加小标题，如：## 核心要点',
      '代码示例': '添加代码块：```javascript\nconsole.log("Hello");\n```'
    };
    
    return examples[element] || `添加${element}相关内容`;
  }

  /**
   * 生成结构建议
   */
  private generateStructureSuggestions(content: string, platform: SocialMediaPlatform): StyleSuggestion[] {
    const suggestions: StyleSuggestion[] = [];
    
    // 检查段落结构
    const paragraphs = content.split(/\n\s*\n/);
    if (paragraphs.length === 1 && content.length > 200) {
      suggestions.push({
        category: 'structure',
        priority: 'medium',
        description: '建议将长段落拆分为多个短段落提升可读性',
        example: '使用空行分隔不同主题的内容'
      });
    }
    
    // 检查列表结构
    if (content.includes('、') && !content.includes('\n-') && !content.includes('\n•')) {
      suggestions.push({
        category: 'structure',
        priority: 'low',
        description: '建议使用列表格式替代顿号分隔',
        example: '- 第一点\n- 第二点\n- 第三点'
      });
    }
    
    return suggestions;
  }

  /**
   * 生成平台特定建议
   */
  private generatePlatformSpecificSuggestions(content: string, platform: SocialMediaPlatform): StyleSuggestion[] {
    const suggestions: StyleSuggestion[] = [];
    
    switch (platform.id) {
            case 'xiaohongshu': {
         const emojiPattern = /🔥|💕|✨|🌟|💯|👍|❤️|😍|🥰/g;
         const emojiCount = (content.match(emojiPattern) || []).length;
         if (emojiCount < 3) {
           suggestions.push({
             category: 'elements',
             priority: 'medium',
             description: '建议增加表情符号密度，每100字3-8个',
             example: '在关键词后添加相关表情符号'
           });
         }
         break;
       }
        
      case 'twitter':
        if (content.length > 200) {
          suggestions.push({
            category: 'structure',
            priority: 'high',
            description: '内容较长，建议拆分为推文串',
            example: '1/n 开头内容...\n2/n 继续内容...'
          });
        }
        break;
        
      case 'wechat':
        if (!content.includes('##') && content.length > 500) {
          suggestions.push({
            category: 'structure',
            priority: 'high',
            description: '长文章建议添加小标题提升结构性',
            example: '## 问题分析\n## 解决方案\n## 总结'
          });
        }
        break;
    }
    
    return suggestions;
  }
} 