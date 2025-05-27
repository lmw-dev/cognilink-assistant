/**
 * TOM-108: 长度处理器
 * 
 * 负责内容长度验证、智能截断和长度优化建议
 */

import { 
  LengthProcessor as ILengthProcessor,
  LengthValidationResult,
  TruncateOptions,
  OptimizationSuggestion
} from '../types/content-processing';
import { SocialMediaPlatform } from '../types/social-media';

/**
 * 长度处理器实现
 */
export class LengthProcessor implements ILengthProcessor {
  private readonly logger: Console;

  constructor() {
    this.logger = console;
  }

  /**
   * 验证内容长度是否符合平台要求
   */
  validateLength(content: string, platform: SocialMediaPlatform): LengthValidationResult {
    const startTime = Date.now();
    
    try {
      const currentLength = this.getContentLength(content);
      const { minLength, maxLength, optimalLength } = this.getPlatformLengthLimits(platform);
      
      const isValid = currentLength >= minLength && currentLength <= maxLength;
      const exceedsBy = currentLength > maxLength ? currentLength - maxLength : undefined;
      const shortBy = currentLength < minLength ? minLength - currentLength : undefined;
      
      const recommendations = this.generateLengthRecommendations(
        currentLength, 
        minLength, 
        maxLength, 
        optimalLength,
        platform
      );

      const result: LengthValidationResult = {
        isValid,
        currentLength,
        targetLength: optimalLength || maxLength,
        minLength,
        maxLength,
        optimalLength,
        exceedsBy,
        shortBy,
        recommendations
      };

      this.logger.log(`[LengthProcessor] 长度验证完成: ${Date.now() - startTime}ms`, {
        platform: platform.id,
        currentLength,
        isValid,
        recommendations: recommendations.length
      });

      return result;
    } catch (error) {
      this.logger.error('[LengthProcessor] 长度验证失败:', error);
      throw new Error(`长度验证失败: ${error.message}`);
    }
  }

  /**
   * 智能截断内容，保持语义完整性
   */
  smartTruncate(content: string, maxLength: number, options?: TruncateOptions): string {
    const startTime = Date.now();
    
    try {
      if (this.getContentLength(content) <= maxLength) {
        return content;
      }

      const opts: TruncateOptions = {
        preserveSentences: true,
        preserveParagraphs: false,
        addEllipsis: true,
        prioritizeKeywords: [],
        preserveElements: [],
        truncateStrategy: 'smart',
        ...options
      };

      let truncatedContent = '';

      switch (opts.truncateStrategy) {
        case 'start':
          truncatedContent = this.truncateFromStart(content, maxLength, opts);
          break;
        case 'middle':
          truncatedContent = this.truncateFromMiddle(content, maxLength, opts);
          break;
        case 'end':
          truncatedContent = this.truncateFromEnd(content, maxLength, opts);
          break;
        case 'smart':
        default:
          truncatedContent = this.smartTruncateContent(content, maxLength, opts);
          break;
      }

      this.logger.log(`[LengthProcessor] 智能截断完成: ${Date.now() - startTime}ms`, {
        originalLength: this.getContentLength(content),
        truncatedLength: this.getContentLength(truncatedContent),
        strategy: opts.truncateStrategy
      });

      return truncatedContent;
    } catch (error) {
      this.logger.error('[LengthProcessor] 智能截断失败:', error);
      throw new Error(`智能截断失败: ${error.message}`);
    }
  }

  /**
   * 提供长度优化建议
   */
  suggestLengthOptimization(content: string, platform: SocialMediaPlatform): OptimizationSuggestion[] {
    const startTime = Date.now();
    
    try {
      const currentLength = this.getContentLength(content);
      const { minLength, maxLength, optimalLength } = this.getPlatformLengthLimits(platform);
      const suggestions: OptimizationSuggestion[] = [];

      // 内容过长的建议
      if (currentLength > maxLength) {
        const exceedsBy = currentLength - maxLength;
        
        if (exceedsBy > maxLength * 0.5) {
          suggestions.push({
            type: 'restructure',
            description: `内容超出限制${exceedsBy}字符，建议重新组织内容结构`,
            impact: 'high',
            effort: 'difficult'
          });
        } else if (exceedsBy > maxLength * 0.2) {
          suggestions.push({
            type: 'shorten',
            description: `内容超出${exceedsBy}字符，建议删除次要信息`,
            impact: 'medium',
            effort: 'moderate'
          });
        } else {
          suggestions.push({
            type: 'shorten',
            description: `内容略长${exceedsBy}字符，建议精简表达`,
            impact: 'low',
            effort: 'easy'
          });
        }
      }

      // 内容过短的建议
      if (currentLength < minLength) {
        const shortBy = minLength - currentLength;
        
        if (shortBy > minLength * 0.5) {
          suggestions.push({
            type: 'expand',
            description: `内容过短${shortBy}字符，建议增加详细说明和案例`,
            impact: 'high',
            effort: 'difficult'
          });
        } else {
          suggestions.push({
            type: 'expand',
            description: `内容偏短${shortBy}字符，建议补充相关信息`,
            impact: 'medium',
            effort: 'moderate'
          });
        }
      }

      // 优化长度建议
      if (optimalLength && Math.abs(currentLength - optimalLength) > optimalLength * 0.1) {
        const diff = currentLength - optimalLength;
        if (diff > 0) {
          suggestions.push({
            type: 'shorten',
            description: `建议调整至最佳长度${optimalLength}字符，当前超出${diff}字符`,
            impact: 'medium',
            effort: 'moderate'
          });
        } else {
          suggestions.push({
            type: 'expand',
            description: `建议调整至最佳长度${optimalLength}字符，当前不足${Math.abs(diff)}字符`,
            impact: 'medium',
            effort: 'moderate'
          });
        }
      }

      // 平台特定建议
      suggestions.push(...this.getPlatformSpecificSuggestions(content, platform));

      this.logger.log(`[LengthProcessor] 优化建议生成完成: ${Date.now() - startTime}ms`, {
        platform: platform.id,
        currentLength,
        suggestionsCount: suggestions.length
      });

      return suggestions;
    } catch (error) {
      this.logger.error('[LengthProcessor] 优化建议生成失败:', error);
      throw new Error(`优化建议生成失败: ${error.message}`);
    }
  }

  /**
   * 获取内容长度（支持中英文混合计算）
   */
  private getContentLength(content: string): number {
    // 移除多余空白字符
    const cleanContent = content.trim().replace(/\s+/g, ' ');
    
    // 中文字符按1个字符计算，英文单词按实际长度计算
    let length = 0;
    for (const char of cleanContent) {
      // 中文字符、日文字符、韩文字符等
      if (/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(char)) {
        length += 1;
      } else {
        length += 1;
      }
    }
    
    return length;
  }

  /**
   * 获取平台长度限制
   */
  private getPlatformLengthLimits(platform: SocialMediaPlatform): {
    minLength: number;
    maxLength: number;
    optimalLength?: number;
  } {
    const baseMaxLength = platform.maxLength;
    
    switch (platform.id) {
      case 'xiaohongshu':
        return {
          minLength: 50,
          maxLength: baseMaxLength,
          optimalLength: 200
        };
      case 'twitter':
        return {
          minLength: 10,
          maxLength: baseMaxLength,
          optimalLength: 200
        };
      case 'wechat':
        return {
          minLength: 800,
          maxLength: baseMaxLength,
          optimalLength: 1200
        };
      case 'blog':
        return {
          minLength: 1000,
          maxLength: baseMaxLength,
          optimalLength: 2000
        };
      case 'toutiao':
        return {
          minLength: 1000,
          maxLength: baseMaxLength,
          optimalLength: 1500
        };
      default:
        return {
          minLength: 50,
          maxLength: baseMaxLength,
          optimalLength: Math.floor(baseMaxLength * 0.8)
        };
    }
  }

  /**
   * 生成长度调整建议
   */
  private generateLengthRecommendations(
    currentLength: number,
    minLength: number,
    maxLength: number,
    optimalLength: number | undefined,
    platform: SocialMediaPlatform
  ): string[] {
    const recommendations: string[] = [];

    if (currentLength > maxLength) {
      const exceedsBy = currentLength - maxLength;
      recommendations.push(`内容超出${exceedsBy}字符，需要缩短`);
      
      if (platform.id === 'twitter') {
        recommendations.push('考虑拆分为推文串（Thread）');
      } else if (platform.id === 'xiaohongshu') {
        recommendations.push('删除次要的表情符号和装饰性文字');
      }
    }

    if (currentLength < minLength) {
      const shortBy = minLength - currentLength;
      recommendations.push(`内容不足${shortBy}字符，需要扩展`);
      
      if (platform.id === 'wechat') {
        recommendations.push('增加数据支撑和案例说明');
      } else if (platform.id === 'blog') {
        recommendations.push('添加代码示例和详细解释');
      }
    }

    if (optimalLength && currentLength >= minLength && currentLength <= maxLength) {
      const diff = Math.abs(currentLength - optimalLength);
      if (diff > optimalLength * 0.1) {
        recommendations.push(`建议调整至最佳长度${optimalLength}字符`);
      }
    }

    return recommendations;
  }

  /**
   * 智能截断内容
   */
  private smartTruncateContent(content: string, maxLength: number, options: TruncateOptions): string {
    // 优先保留重要元素
    let workingContent = this.preserveImportantElements(content, options.preserveElements);
    
    if (this.getContentLength(workingContent) <= maxLength) {
      return workingContent;
    }

    // 按段落截断
    if (options.preserveParagraphs) {
      workingContent = this.truncateByParagraphs(workingContent, maxLength);
    }
    
    // 按句子截断
    if (options.preserveSentences && this.getContentLength(workingContent) > maxLength) {
      workingContent = this.truncateBySentences(workingContent, maxLength);
    }
    
    // 最后的字符级截断
    if (this.getContentLength(workingContent) > maxLength) {
      const targetLength = options.addEllipsis ? maxLength - 3 : maxLength;
      workingContent = workingContent.substring(0, targetLength);
    }
    
    // 添加省略号
    if (options.addEllipsis && this.getContentLength(workingContent) < this.getContentLength(content)) {
      workingContent += '...';
    }
    
    return workingContent.trim();
  }

  /**
   * 从开头截断
   */
  private truncateFromStart(content: string, maxLength: number, options: TruncateOptions): string {
    const targetLength = options.addEllipsis ? maxLength - 3 : maxLength;
    let truncated = content.substring(content.length - targetLength);
    
    if (options.preserveSentences) {
      const sentences = truncated.split(/[。！？.!?]+/);
      if (sentences.length > 1) {
        truncated = sentences.slice(1).join('');
      }
    }
    
    return (options.addEllipsis ? '...' : '') + truncated.trim();
  }

  /**
   * 从中间截断
   */
  private truncateFromMiddle(content: string, maxLength: number, options: TruncateOptions): string {
    const targetLength = options.addEllipsis ? maxLength - 3 : maxLength;
    const halfLength = Math.floor(targetLength / 2);
    
    const start = content.substring(0, halfLength);
    const end = content.substring(content.length - halfLength);
    
    return start + (options.addEllipsis ? '...' : '') + end;
  }

  /**
   * 从末尾截断
   */
  private truncateFromEnd(content: string, maxLength: number, options: TruncateOptions): string {
    const targetLength = options.addEllipsis ? maxLength - 3 : maxLength;
    let truncated = content.substring(0, targetLength);
    
    if (options.preserveSentences) {
      const lastSentenceEnd = Math.max(
        truncated.lastIndexOf('。'),
        truncated.lastIndexOf('！'),
        truncated.lastIndexOf('？'),
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf('?')
      );
      
      if (lastSentenceEnd > targetLength * 0.5) {
        truncated = truncated.substring(0, lastSentenceEnd + 1);
      }
    }
    
    return truncated.trim() + (options.addEllipsis ? '...' : '');
  }

  /**
   * 按段落截断
   */
  private truncateByParagraphs(content: string, maxLength: number): string {
    const paragraphs = content.split(/\n\s*\n/);
    let result = '';
    
    for (const paragraph of paragraphs) {
      const testResult = result + (result ? '\n\n' : '') + paragraph;
      if (this.getContentLength(testResult) <= maxLength) {
        result = testResult;
      } else {
        break;
      }
    }
    
    return result || paragraphs[0];
  }

  /**
   * 按句子截断
   */
  private truncateBySentences(content: string, maxLength: number): string {
    const sentences = content.split(/([。！？.!?]+)/);
    let result = '';
    
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i];
      const punctuation = sentences[i + 1] || '';
      const testResult = result + sentence + punctuation;
      
      if (this.getContentLength(testResult) <= maxLength) {
        result = testResult;
      } else {
        break;
      }
    }
    
    return result || sentences[0];
  }

  /**
   * 保留重要元素
   */
  private preserveImportantElements(content: string, elements: string[]): string {
    if (!elements || elements.length === 0) {
      return content;
    }

    // 这里可以实现更复杂的元素保留逻辑
    // 例如保留特定的标签、链接、表情符号等
    return content;
  }

  /**
   * 获取平台特定的优化建议
   */
  private getPlatformSpecificSuggestions(content: string, platform: SocialMediaPlatform): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    switch (platform.id) {
            case 'xiaohongshu': {
         const emojiPattern = /🔥|💕|✨|🌟|💯|👍|❤️|😍|🥰/;
         if (!emojiPattern.test(content)) {
           suggestions.push({
             type: 'expand',
             description: '建议添加表情符号增加亲和力',
             impact: 'medium',
             effort: 'easy'
           });
         }
         break;
       }

      case 'twitter':
        if (!/[#@]/.test(content)) {
          suggestions.push({
            type: 'expand',
            description: '建议添加相关标签或提及用户',
            impact: 'medium',
            effort: 'easy'
          });
        }
        break;

      case 'wechat':
        if (!/##/.test(content)) {
          suggestions.push({
            type: 'restructure',
            description: '建议添加小标题提升可读性',
            impact: 'medium',
            effort: 'moderate'
          });
        }
        break;

      case 'blog':
        if (!/```/.test(content)) {
          suggestions.push({
            type: 'expand',
            description: '建议添加代码示例增强技术性',
            impact: 'high',
            effort: 'moderate'
          });
        }
        break;

      case 'toutiao':
        if (!/[震惊揭秘真相内幕爆料反转]/.test(content)) {
          suggestions.push({
            type: 'restructure',
            description: '建议增加吸引眼球的表达方式',
            impact: 'high',
            effort: 'moderate'
          });
        }
        break;
    }

    return suggestions;
  }
} 