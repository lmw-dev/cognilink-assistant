import {
  FormattedContent,
  FormatMetadata,
  FormatWarning,
  FormatSuggestion,
  FormatRules,
  ContentFormatter as IContentFormatter
} from '../types/content-processing';
import { SocialMediaPlatform } from '../types/social-media';
import { Logger } from '../utils/logger';

/**
 * 内容格式化器 - 负责平台特定的内容格式化
 */
export class ContentFormatter implements IContentFormatter {
  private logger: Logger;
  private platformRules: Map<string, FormatRules>;

  constructor() {
    this.logger = new Logger('ContentFormatter');
    this.platformRules = new Map();
    this.initializePlatformRules();
  }

  /**
   * 初始化平台格式化规则
   */
  private initializePlatformRules(): void {
    // 小红书格式规则
    this.platformRules.set('xiaohongshu', {
      paragraphBreak: '\n\n',
      hashtagFormat: '#话题#',
      emojiPlacement: 'distributed',
      interactionPlacement: 'end',
      lineBreakOptimization: true,
      specialCharacterHandling: true
    });

    // Twitter格式规则
    this.platformRules.set('twitter', {
      paragraphBreak: '\n',
      hashtagFormat: '#hashtag',
      emojiPlacement: 'end',
      interactionPlacement: 'end',
      lineBreakOptimization: true,
      specialCharacterHandling: false
    });

    // 微信公众号格式规则
    this.platformRules.set('wechat', {
      paragraphBreak: '\n\n',
      hashtagFormat: '## 标题',
      emojiPlacement: 'none',
      interactionPlacement: 'end',
      lineBreakOptimization: false,
      specialCharacterHandling: true
    });

    // 个人博客格式规则
    this.platformRules.set('blog', {
      paragraphBreak: '\n\n',
      hashtagFormat: '## 标题',
      emojiPlacement: 'none',
      interactionPlacement: 'end',
      lineBreakOptimization: false,
      specialCharacterHandling: true
    });

    // 头条号格式规则
    this.platformRules.set('toutiao', {
      paragraphBreak: '\n\n',
      hashtagFormat: '#热点话题#',
      emojiPlacement: 'start',
      interactionPlacement: 'end',
      lineBreakOptimization: true,
      specialCharacterHandling: true
    });
  }

  /**
   * 格式化内容
   */
  formatContent(content: string, platform: SocialMediaPlatform): FormattedContent {
    const startTime = Date.now();
    this.logger.info(`Formatting content for platform: ${platform.id}`);

    const rules = this.platformRules.get(platform.id);
    if (!rules) {
      throw new Error(`Unsupported platform: ${platform.id}`);
    }

    const originalLength = content.length;
    let formattedContent = content;
    const warnings: FormatWarning[] = [];
    const suggestions: FormatSuggestion[] = [];

    // 应用格式化规则
    formattedContent = this.applyPlatformRules(formattedContent, rules);

    // 清理和标准化
    formattedContent = this.cleanAndNormalize(formattedContent);

    // 检查格式问题
    this.checkFormatIssues(formattedContent, platform, warnings, suggestions);

    const processingTime = Date.now() - startTime;
    const metadata: FormatMetadata = {
      platform,
      originalLength,
      formattedLength: formattedContent.length,
      appliedRules: this.getAppliedRules(rules),
      processingTime
    };

    const result: FormattedContent = {
      content: formattedContent,
      metadata,
      warnings,
      suggestions
    };

    this.logger.info(`Content formatting completed in ${processingTime}ms`);
    return result;
  }

  /**
   * 应用平台特定格式规则
   */
  applyPlatformRules(content: string, rules: FormatRules): string {
    let formatted = content;

    // 处理段落分隔
    formatted = this.formatParagraphs(formatted, rules);

    // 处理表情符号位置
    formatted = this.formatEmojiPlacement(formatted, rules);

    // 处理互动元素位置
    formatted = this.formatInteractionPlacement(formatted, rules);

    // 处理行间距优化
    if (rules.lineBreakOptimization) {
      formatted = this.optimizeLineBreaks(formatted);
    }

    // 处理特殊字符
    if (rules.specialCharacterHandling) {
      formatted = this.handleSpecialCharacters(formatted);
    }

    return formatted;
  }

  /**
   * 清理和标准化内容
   */
  cleanAndNormalize(content: string): string {
    let cleaned = content;

    // 移除多余的空白字符
    cleaned = cleaned.replace(/[ \t]+/g, ' ');

    // 标准化换行符
    cleaned = cleaned.replace(/\r\n/g, '\n');

    // 移除行首行尾空白
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');

    // 移除多余的空行
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // 移除开头和结尾的空行
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * 格式化段落
   */
  private formatParagraphs(content: string, rules: FormatRules): string {
    // 根据平台规则调整段落间距
    const paragraphs = content.split(/\n\s*\n/);
    return paragraphs.join(rules.paragraphBreak);
  }

  /**
   * 格式化表情符号位置
   */
  private formatEmojiPlacement(content: string, rules: FormatRules): string {
    const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
    const emojis = content.match(emojiPattern) || [];
    
    if (emojis.length === 0) return content;

    let formatted = content.replace(emojiPattern, '').trim();

    switch (rules.emojiPlacement) {
      case 'start':
        formatted = emojis.join(' ') + ' ' + formatted;
        break;
      case 'end':
        formatted = formatted + ' ' + emojis.join(' ');
        break;
      case 'distributed':
        formatted = this.distributeEmojis(formatted, emojis);
        break;
      case 'none':
        // 移除所有表情符号
        break;
    }

    return formatted;
  }

  /**
   * 分布式放置表情符号
   */
  private distributeEmojis(content: string, emojis: string[]): string {
    const sentences = content.split(/[。！？.!?]+/);
    let emojiIndex = 0;
    
    const result = sentences.map((sentence, index) => {
      if (sentence.trim() && emojiIndex < emojis.length) {
        const emoji = emojis[emojiIndex++];
        return sentence.trim() + emoji;
      }
      return sentence;
    });

    return result.join('');
  }

  /**
   * 格式化互动元素位置
   */
  private formatInteractionPlacement(content: string, rules: FormatRules): string {
    const interactionPattern = /[？?]|你们觉得|大家认为|你觉得呢|怎么看|评论区|留言/g;
    const interactions = content.match(interactionPattern) || [];
    
    if (interactions.length === 0) return content;

    let formatted = content;

    switch (rules.interactionPlacement) {
      case 'start':
        // 将互动元素移到开头
        formatted = this.moveInteractionsToStart(formatted);
        break;
      case 'end':
        // 将互动元素移到结尾
        formatted = this.moveInteractionsToEnd(formatted);
        break;
      case 'middle':
        // 将互动元素放在中间
        formatted = this.moveInteractionsToMiddle(formatted);
        break;
    }

    return formatted;
  }

  /**
   * 优化行间距
   */
  private optimizeLineBreaks(content: string): string {
    // 在句号后添加适当的换行
    let optimized = content.replace(/([。！？])([^。！？\n])/g, '$1\n$2');
    
    // 在长句中添加适当的换行
    optimized = optimized.replace(/([，、；])(\S{20,})/g, '$1\n$2');
    
    return optimized;
  }

  /**
   * 处理特殊字符
   */
  private handleSpecialCharacters(content: string): string {
    let handled = content;

    // 转换全角标点为半角
    handled = handled.replace(/，/g, ',');
    handled = handled.replace(/；/g, ';');
    handled = handled.replace(/：/g, ':');

    // 处理引号
    handled = handled.replace(/"/g, '"');
    handled = handled.replace(/"/g, '"');

    return handled;
  }

  /**
   * 检查格式问题
   */
  private checkFormatIssues(
    content: string, 
    platform: SocialMediaPlatform, 
    warnings: FormatWarning[], 
    suggestions: FormatSuggestion[]
  ): void {
    // 检查段落长度
    this.checkParagraphLength(content, warnings, suggestions);

    // 检查行长度
    this.checkLineLength(content, warnings, suggestions);

    // 检查特殊字符
    this.checkSpecialCharacters(content, warnings, suggestions);

    // 平台特定检查
    this.checkPlatformSpecificIssues(content, platform, warnings, suggestions);
  }

  /**
   * 检查段落长度
   */
  private checkParagraphLength(content: string, warnings: FormatWarning[], suggestions: FormatSuggestion[]): void {
    const paragraphs = content.split(/\n\s*\n/);
    
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.length > 500) {
        warnings.push({
          type: 'structure',
          message: `第${index + 1}段过长 (${paragraph.length}字符)`,
          position: index,
          severity: 'medium'
        });
        
        suggestions.push({
          type: 'improvement',
          message: '建议将长段落拆分为多个短段落',
          before: paragraph.substring(0, 50) + '...',
          after: '拆分后的段落示例',
          impact: 3
        });
      }
    });
  }

  /**
   * 检查行长度
   */
  private checkLineLength(content: string, warnings: FormatWarning[], suggestions: FormatSuggestion[]): void {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.length > 100) {
        warnings.push({
          type: 'length',
          message: `第${index + 1}行过长 (${line.length}字符)`,
          position: index,
          severity: 'low'
        });
      }
    });
  }

  /**
   * 检查特殊字符
   */
  private checkSpecialCharacters(content: string, warnings: FormatWarning[], suggestions: FormatSuggestion[]): void {
    // 检查不常见的Unicode字符 - 排除基本ASCII、中文、空白字符和常见标点
    const unusualChars = content.match(/[^\u0020-\u007F\u4e00-\u9fff\s\u3000-\u303F\uFF00-\uFFEF]/gu);
    
    if (unusualChars && unusualChars.length > 0) {
      warnings.push({
        type: 'character',
        message: `发现特殊字符: ${unusualChars.slice(0, 5).join(', ')}`,
        severity: 'low'
      });
    }
  }

  /**
   * 平台特定格式检查
   */
  private checkPlatformSpecificIssues(
    content: string, 
    platform: SocialMediaPlatform, 
    warnings: FormatWarning[], 
    suggestions: FormatSuggestion[]
  ): void {
    switch (platform.id) {
      case 'xiaohongshu':
        this.checkXiaohongshuFormat(content, warnings, suggestions);
        break;
      case 'twitter':
        this.checkTwitterFormat(content, warnings, suggestions);
        break;
      case 'wechat':
        this.checkWechatFormat(content, warnings, suggestions);
        break;
      case 'blog':
        this.checkBlogFormat(content, warnings, suggestions);
        break;
      case 'toutiao':
        this.checkToutiaoFormat(content, warnings, suggestions);
        break;
    }
  }

  /**
   * 小红书格式检查
   */
  private checkXiaohongshuFormat(content: string, warnings: FormatWarning[], suggestions: FormatSuggestion[]): void {
    // 检查表情符号密度
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu) || []).length;
    const emojiDensity = emojiCount / (content.length / 100);
    
    if (emojiDensity < 3) {
      suggestions.push({
        type: 'improvement',
        message: '建议增加表情符号密度，每100字3-8个',
        impact: 2
      });
    }

    // 检查互动问题
    if (!/[？?]/.test(content)) {
      suggestions.push({
        type: 'improvement',
        message: '建议添加互动问题增加用户参与度',
        impact: 3
      });
    }
  }

  /**
   * Twitter格式检查
   */
  private checkTwitterFormat(content: string, warnings: FormatWarning[], suggestions: FormatSuggestion[]): void {
    // 检查字符限制
    if (content.length > 280) {
      warnings.push({
        type: 'length',
        message: `内容超过Twitter字符限制 (${content.length}/280)`,
        severity: 'high'
      });
      
      suggestions.push({
        type: 'correction',
        message: '建议缩短内容或拆分为推文串',
        impact: 5
      });
    }

    // 检查标签使用
    const hashtagCount = (content.match(/#\w+/g) || []).length;
    if (hashtagCount === 0) {
      suggestions.push({
        type: 'improvement',
        message: '建议添加1-3个相关标签',
        impact: 2
      });
    }
  }

  /**
   * 微信公众号格式检查
   */
  private checkWechatFormat(content: string, warnings: FormatWarning[], suggestions: FormatSuggestion[]): void {
    // 检查小标题
    if (content.length > 800 && !/##\s+/.test(content)) {
      suggestions.push({
        type: 'improvement',
        message: '建议添加小标题提升文章结构',
        impact: 3
      });
    }

    // 检查段落结构
    const paragraphs = content.split(/\n\s*\n/);
    if (paragraphs.length < 3 && content.length > 1000) {
      suggestions.push({
        type: 'improvement',
        message: '建议增加段落分隔提高可读性',
        impact: 2
      });
    }
  }

  /**
   * 博客格式检查
   */
  private checkBlogFormat(content: string, warnings: FormatWarning[], suggestions: FormatSuggestion[]): void {
    // 检查代码块
    if (!/```[\s\S]*?```/.test(content) && content.includes('代码')) {
      suggestions.push({
        type: 'improvement',
        message: '建议使用代码块格式化代码示例',
        impact: 3
      });
    }

    // 检查标题层级
    const headings = content.match(/^#+\s+/gm) || [];
    if (headings.length === 0 && content.length > 1000) {
      suggestions.push({
        type: 'improvement',
        message: '建议添加标题层级提升文档结构',
        impact: 4
      });
    }
  }

  /**
   * 头条号格式检查
   */
  private checkToutiaoFormat(content: string, warnings: FormatWarning[], suggestions: FormatSuggestion[]): void {
    // 检查吸引力元素
    if (!/震惊|揭秘|真相|内幕/.test(content)) {
      suggestions.push({
        type: 'improvement',
        message: '建议添加更有吸引力的表达方式',
        impact: 4
      });
    }

    // 检查互动引导
    if (!/评论|讨论|你怎么看/.test(content)) {
      suggestions.push({
        type: 'improvement',
        message: '建议添加讨论引导语增加互动',
        impact: 2
      });
    }
  }

  /**
   * 移动互动元素到开头
   */
  private moveInteractionsToStart(content: string): string {
    // 简化实现，实际可以更复杂
    return content;
  }

  /**
   * 移动互动元素到结尾
   */
  private moveInteractionsToEnd(content: string): string {
    // 简化实现，实际可以更复杂
    return content;
  }

  /**
   * 移动互动元素到中间
   */
  private moveInteractionsToMiddle(content: string): string {
    // 简化实现，实际可以更复杂
    return content;
  }

  /**
   * 获取应用的规则列表
   */
  private getAppliedRules(rules: FormatRules): string[] {
    const appliedRules: string[] = [];
    
    if (rules.lineBreakOptimization) appliedRules.push('行间距优化');
    if (rules.specialCharacterHandling) appliedRules.push('特殊字符处理');
    if (rules.emojiPlacement !== 'none') appliedRules.push('表情符号位置调整');
    
    appliedRules.push('段落格式化');
    appliedRules.push('内容清理');
    
    return appliedRules;
  }
} 