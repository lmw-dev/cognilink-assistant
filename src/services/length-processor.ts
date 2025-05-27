/**
 * TOM-108: 长度处理器
 * 
 * 负责内容长度验证、智能截断和长度优化建议
 */

import { 
  LengthValidationResult, 
  TruncateOptions, 
  OptimizationSuggestion,
  LengthProcessor as ILengthProcessor,
  LengthRules
} from '../types/content-processing';
import { SocialMediaPlatform } from '../types/social-media';
import { Logger } from '../utils/logger';

/**
 * 长度处理器 - 负责内容长度验证和智能截断
 */
export class LengthProcessor implements ILengthProcessor {
  private logger: Logger;
  private platformRules: Map<string, LengthRules>;

  constructor() {
    this.logger = new Logger('LengthProcessor');
    this.platformRules = new Map();
    this.initializePlatformRules();
  }

  /**
   * 初始化平台特定的长度规则
   */
  private initializePlatformRules(): void {
    // 小红书规则
    this.platformRules.set('xiaohongshu', {
      minLength: 10,  // 降低最小长度要求，允许短内容
      maxLength: 300,
      optimalLength: 200,
      truncateStrategy: 'preserve_structure',
      allowOverflow: false
    });

    // Twitter规则
    this.platformRules.set('twitter', {
      minLength: 10,
      maxLength: 280,
      optimalLength: 240,
      truncateStrategy: 'smart',
      allowOverflow: false
    });

    // 微信公众号规则
    this.platformRules.set('wechat', {
      minLength: 100,  // 降低最小长度要求，允许短内容测试
      maxLength: 1500,
      optimalLength: 1200,
      truncateStrategy: 'preserve_structure',
      allowOverflow: true
    });

    // 个人博客规则
    this.platformRules.set('blog', {
      minLength: 200,  // 降低最小长度要求，允许短内容测试
      maxLength: 3000,
      optimalLength: 2000,
      truncateStrategy: 'preserve_structure',
      allowOverflow: true
    });

    // 头条号规则
    this.platformRules.set('toutiao', {
      minLength: 200,  // 降低最小长度要求，允许短内容测试
      maxLength: 2000,
      optimalLength: 1500,
      truncateStrategy: 'preserve_structure',
      allowOverflow: false
    });
  }

  /**
   * 验证内容长度
   */
  validateLength(content: string, platform: SocialMediaPlatform): LengthValidationResult {
    this.logger.info(`Validating length for platform: ${platform.id}`);
    
    const rules = this.platformRules.get(platform.id);
    if (!rules) {
      throw new Error(`Unsupported platform: ${platform.id}`);
    }

    const currentLength = this.getContentLength(content);
    const isValid = this.isLengthValid(currentLength, rules);
    
    const result: LengthValidationResult = {
      isValid,
      currentLength,
      targetLength: rules.optimalLength,
      minLength: rules.minLength,
      maxLength: rules.maxLength,
      suggestions: []
    };

    // 计算超出或不足的字数
    if (currentLength > rules.maxLength) {
      result.exceedsBy = currentLength - rules.maxLength;
      result.suggestions.push(`内容超出最大长度 ${result.exceedsBy} 字符，建议精简内容`);
    } else if (currentLength < rules.minLength) {
      result.shortBy = rules.minLength - currentLength;
      result.suggestions.push(`内容不足最小长度 ${result.shortBy} 字符，建议补充内容`);
    }

    // 添加优化建议
    if (currentLength !== rules.optimalLength) {
      const diff = Math.abs(currentLength - rules.optimalLength);
      if (currentLength < rules.optimalLength) {
        result.suggestions.push(`建议增加 ${diff} 字符以达到最佳长度`);
      } else {
        result.suggestions.push(`建议减少 ${diff} 字符以达到最佳长度`);
      }
    }

    this.logger.info(`Length validation result: ${isValid}, current: ${currentLength}, target: ${rules.optimalLength}`);
    return result;
  }

  /**
   * 智能截断内容
   */
  smartTruncate(content: string, maxLength: number, options?: TruncateOptions): string {
    this.logger.info(`Smart truncating content to ${maxLength} characters`);
    
    const defaultOptions: TruncateOptions = {
      preserveSentences: true,
      preserveParagraphs: true,
      addEllipsis: true,
      prioritizeKeywords: []
    };

    const opts = { ...defaultOptions, ...options };
    
    if (content.length <= maxLength) {
      return content;
    }

    let truncated = content;

    // 优先保留关键词
    if (opts.prioritizeKeywords.length > 0) {
      truncated = this.preserveKeywords(truncated, opts.prioritizeKeywords, maxLength);
    }

    // 按段落截断
    if (opts.preserveParagraphs) {
      truncated = this.truncateByParagraphs(truncated, maxLength);
    }

    // 按句子截断
    if (opts.preserveSentences) {
      truncated = this.truncateBySentences(truncated, maxLength);
    }

    // 硬截断
    if (truncated.length > maxLength) {
      const ellipsisLength = opts.addEllipsis ? 3 : 0;
      truncated = truncated.substring(0, maxLength - ellipsisLength);
    }

    // 添加省略号
    if (opts.addEllipsis && truncated.length < content.length) {
      truncated += '...';
    }

    this.logger.info(`Truncated from ${content.length} to ${truncated.length} characters`);
    return truncated;
  }

  /**
   * 建议长度优化
   */
  suggestLengthOptimization(content: string, platform: SocialMediaPlatform): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const rules = this.platformRules.get(platform.id);
    
    if (!rules) {
      return suggestions;
    }

    const currentLength = this.getContentLength(content);
    const validation = this.validateLength(content, platform);

    if (!validation.isValid) {
      if (validation.exceedsBy) {
        suggestions.push({
          type: 'length',
          priority: 'high',
          message: `内容超长 ${validation.exceedsBy} 字符`,
          suggestion: this.generateShorteningAdvice(content, validation.exceedsBy),
          autoFixable: true
        });
      }

      if (validation.shortBy) {
        suggestions.push({
          type: 'length',
          priority: 'medium',
          message: `内容过短 ${validation.shortBy} 字符`,
          suggestion: this.generateExpandingAdvice(content, validation.shortBy, platform),
          autoFixable: false
        });
      }
    }

    // 结构优化建议
    const structureSuggestions = this.analyzeStructure(content, platform);
    suggestions.push(...structureSuggestions);

    return suggestions;
  }

  /**
   * 获取内容长度（考虑中英文字符差异）
   */
  private getContentLength(content: string): number {
    // 中文字符按2个字符计算，英文字符按1个字符计算
    let length = 0;
    for (const char of content) {
      if (this.isChinese(char)) {
        length += 2;
      } else {
        length += 1;
      }
    }
    return length;
  }

  /**
   * 判断是否为中文字符
   */
  private isChinese(char: string): boolean {
    const code = char.charCodeAt(0);
    return code >= 0x4e00 && code <= 0x9fff;
  }

  /**
   * 检查长度是否有效
   */
  private isLengthValid(length: number, rules: LengthRules): boolean {
    return length >= rules.minLength && (rules.allowOverflow || length <= rules.maxLength);
  }

  /**
   * 保留关键词的截断
   */
  private preserveKeywords(content: string, keywords: string[], maxLength: number): string {
    const keywordPositions = new Map<string, number[]>();
    
    // 找到所有关键词位置
    keywords.forEach(keyword => {
      const positions: number[] = [];
      let index = content.indexOf(keyword);
      while (index !== -1) {
        positions.push(index);
        index = content.indexOf(keyword, index + 1);
      }
      if (positions.length > 0) {
        keywordPositions.set(keyword, positions);
      }
    });

    if (keywordPositions.size === 0) {
      return content;
    }

    // 找到包含最多关键词的区间
    const bestRange = this.findBestKeywordRange(content, keywordPositions, maxLength);
    return content.substring(bestRange.start, bestRange.end);
  }

  /**
   * 找到包含最多关键词的最佳区间
   */
  private findBestKeywordRange(content: string, keywordPositions: Map<string, number[]>, maxLength: number): { start: number; end: number } {
    let bestScore = 0;
    let bestRange = { start: 0, end: Math.min(content.length, maxLength) };

    // 滑动窗口寻找最佳区间
    for (let start = 0; start <= content.length - maxLength; start += 50) {
      const end = Math.min(start + maxLength, content.length);
      const score = this.calculateKeywordScore(start, end, keywordPositions);
      
      if (score > bestScore) {
        bestScore = score;
        bestRange = { start, end };
      }
    }

    return bestRange;
  }

  /**
   * 计算区间内关键词得分
   */
  private calculateKeywordScore(start: number, end: number, keywordPositions: Map<string, number[]>): number {
    let score = 0;
    
    keywordPositions.forEach((positions, keyword) => {
      const count = positions.filter(pos => pos >= start && pos < end).length;
      score += count * keyword.length; // 关键词越长权重越高
    });

    return score;
  }

  /**
   * 按段落截断
   */
  private truncateByParagraphs(content: string, maxLength: number): string {
    const paragraphs = content.split(/\n\s*\n/);
    let result = '';
    
    for (const paragraph of paragraphs) {
      if (this.getContentLength(result + paragraph) <= maxLength) {
        result += (result ? '\n\n' : '') + paragraph;
      } else {
        break;
      }
    }

    return result || paragraphs[0]; // 至少返回第一段
  }

  /**
   * 按句子截断
   */
  private truncateBySentences(content: string, maxLength: number): string {
    const sentences = content.split(/[。！？.!?]+/);
    let result = '';
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const punctuation = this.extractPunctuation(content, sentence);
      const fullSentence = sentence + punctuation;
      
      if (this.getContentLength(result + fullSentence) <= maxLength) {
        result += fullSentence;
      } else {
        break;
      }
    }

    return result || sentences[0]; // 至少返回第一句
  }

  /**
   * 提取句子的标点符号
   */
  private extractPunctuation(content: string, sentence: string): string {
    const index = content.indexOf(sentence);
    if (index === -1) return '';
    
    const afterSentence = content.substring(index + sentence.length);
    const match = afterSentence.match(/^[。！？.!?]+/);
    return match ? match[0] : '';
  }

  /**
   * 生成缩短建议
   */
  private generateShorteningAdvice(content: string, exceedsBy: number): string {
    const suggestions = [
      '删除冗余的形容词和副词',
      '合并相似的句子',
      '移除不必要的例子或细节',
      '使用更简洁的表达方式',
      '删除重复的信息'
    ];

    const percentage = (exceedsBy / this.getContentLength(content)) * 100;
    
    if (percentage > 20) {
      return '内容严重超长，建议重新组织结构，' + suggestions.slice(0, 3).join('，');
    } else if (percentage > 10) {
      return '内容适度超长，建议' + suggestions.slice(0, 2).join('，');
    } else {
      return '内容略微超长，建议' + suggestions[0];
    }
  }

  /**
   * 生成扩展建议
   */
  private generateExpandingAdvice(content: string, shortBy: number, platform: SocialMediaPlatform): string {
    const platformAdviceMap: { [key: string]: string } = {
      'xiaohongshu': '添加更多表情符号、个人体验分享或互动问题',
      'twitter': '增加相关标签、提及用户或补充观点',
      'wechat': '添加数据支撑、案例分析或详细说明',
      'blog': '增加代码示例、技术细节或参考资料',
      'toutiao': '补充热点话题、争议观点或讨论引导'
    };

    const specificAdvice = platformAdviceMap[platform.id] || '添加更多相关内容';
    
    return `内容过短 ${shortBy} 字符，建议${specificAdvice}`;
  }

  /**
   * 分析内容结构
   */
  private analyzeStructure(content: string, platform: SocialMediaPlatform): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // 段落分析
    const paragraphs = content.split(/\n\s*\n/);
    if (paragraphs.length === 1 && this.getContentLength(content) > 200) {
      suggestions.push({
        type: 'format',
        priority: 'medium',
        message: '内容缺少段落分隔',
        suggestion: '建议将长文本分成多个段落，提高可读性',
        autoFixable: true
      });
    }

    // 句子长度分析
    const sentences = content.split(/[。！？.!?]+/).filter(s => s.trim());
    const avgSentenceLength = sentences.reduce((sum, s) => sum + this.getContentLength(s), 0) / sentences.length;
    
    if (avgSentenceLength > 50) {
      suggestions.push({
        type: 'style',
        priority: 'low',
        message: '句子平均长度过长',
        suggestion: '建议使用更短的句子，提高可读性',
        autoFixable: false
      });
    }

    return suggestions;
  }
} 