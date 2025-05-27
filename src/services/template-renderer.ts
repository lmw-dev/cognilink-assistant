/**
 * 模板渲染器
 * 负责将模板与上下文数据结合，生成最终的提示内容
 */

import {
  PlatformTemplate,
  TemplateContext,
  RenderedTemplate,
  TemplateRenderMetadata,
  FormatRules,
  UserPreferences
} from '../types/social-media';
import { Logger } from '../utils/logger';
import crypto from 'crypto';

export class TemplateRenderer {
  private logger: Logger;
  private placeholderPattern = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

  constructor() {
    this.logger = new Logger('TemplateRenderer');
  }

  /**
   * 渲染模板，生成最终的提示内容
   */
  render(template: PlatformTemplate, context: TemplateContext): RenderedTemplate {
    const startTime = Date.now();
    
    try {
      // 1. 验证输入参数
      this.validateInputs(template, context);

      // 2. 准备渲染上下文
      const renderContext = this.prepareRenderContext(context);

      // 3. 渲染系统提示
      const systemPrompt = this.renderSystemPrompt(template, renderContext);

      // 4. 渲染用户提示
      const userPrompt = this.renderUserPrompt(template, renderContext);

      // 5. 应用格式规则
      const formattedUserPrompt = this.applyFormatRules(userPrompt, template.formatRules);

      // 6. 生成元数据
      const metadata = this.generateMetadata(template, context, startTime);

      const result: RenderedTemplate = {
        systemPrompt,
        userPrompt: formattedUserPrompt,
        metadata
      };

      this.logger.debug(`Template rendered successfully in ${Date.now() - startTime}ms`, {
        templateId: template.id,
        contextHash: metadata.contextHash
      });

      return result;

    } catch (error) {
      this.logger.error('Template rendering failed', error instanceof Error ? error : new Error(String(error)));
      throw new Error(`模板渲染失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量渲染模板
   */
  async renderBatch(
    templates: PlatformTemplate[], 
    contexts: TemplateContext[]
  ): Promise<Map<string, RenderedTemplate>> {
    const results = new Map<string, RenderedTemplate>();
    
    if (templates.length !== contexts.length) {
      throw new Error('模板数量与上下文数量不匹配');
    }

    for (let i = 0; i < templates.length; i++) {
      try {
        const result = this.render(templates[i], contexts[i]);
        results.set(templates[i].id, result);
      } catch (error) {
        this.logger.error(`Failed to render template ${templates[i].id}`, error instanceof Error ? error : new Error(String(error)));
        // 继续处理其他模板，不中断整个批量操作
      }
    }

    return results;
  }

  /**
   * 验证输入参数
   */
  private validateInputs(template: PlatformTemplate, context: TemplateContext): void {
    if (!template) {
      throw new Error('模板不能为空');
    }

    if (!context) {
      throw new Error('上下文不能为空');
    }

    if (!context.topic || context.topic.trim() === '') {
      throw new Error('主题不能为空');
    }

    if (!context.context || context.context.trim() === '') {
      throw new Error('上下文内容不能为空');
    }

    if (!template.systemPrompt || template.systemPrompt.trim() === '') {
      throw new Error('系统提示不能为空');
    }

    if (!template.userTemplate || template.userTemplate.trim() === '') {
      throw new Error('用户模板不能为空');
    }
  }

  /**
   * 准备渲染上下文
   */
  private prepareRenderContext(context: TemplateContext): Record<string, string> {
    const renderContext: Record<string, string> = {
      topic: context.topic.trim(),
      context: context.context.trim()
    };

    // 添加用户偏好相关的上下文
    if (context.userPreferences) {
      renderContext.tone = context.userPreferences.tone || 'professional';
      renderContext.length = context.userPreferences.length || 'medium';
      renderContext.style = context.userPreferences.style || 'moderate';
      
      if (context.userPreferences.customKeywords && context.userPreferences.customKeywords.length > 0) {
        renderContext.customKeywords = context.userPreferences.customKeywords.join(', ');
      }
    }

    // 添加额外参数
    if (context.additionalParams) {
      for (const [key, value] of Object.entries(context.additionalParams)) {
        if (typeof value === 'string') {
          renderContext[key] = value;
        } else {
          renderContext[key] = JSON.stringify(value);
        }
      }
    }

    return renderContext;
  }

  /**
   * 渲染系统提示
   */
  private renderSystemPrompt(template: PlatformTemplate, context: Record<string, string>): string {
    return this.replacePlaceholders(template.systemPrompt, context);
  }

  /**
   * 渲染用户提示
   */
  private renderUserPrompt(template: PlatformTemplate, context: Record<string, string>): string {
    return this.replacePlaceholders(template.userTemplate, context);
  }

  /**
   * 替换模板占位符
   */
  private replacePlaceholders(template: string, context: Record<string, string>): string {
    const warnings: string[] = [];
    
    const result = template.replace(this.placeholderPattern, (match, key) => {
      if (Object.prototype.hasOwnProperty.call(context, key)) {
        return context[key];
      } else {
        warnings.push(`未找到占位符 "${key}" 的值`);
        return match; // 保留原始占位符
      }
    });

    if (warnings.length > 0) {
      this.logger.warn(`Template rendering warnings: ${warnings.join(', ')}`);
    }

    return result;
  }

  /**
   * 应用格式规则
   */
  private applyFormatRules(content: string, rules: FormatRules): string {
    let formattedContent = content;

    try {
      // 应用段落分隔符
      if (rules.paragraphBreak) {
        formattedContent = this.applyParagraphBreaks(formattedContent, rules.paragraphBreak);
      }

      // 应用标题格式
      if (rules.headingStyle) {
        formattedContent = this.applyHeadingStyle(formattedContent, rules.headingStyle);
      }

      // 应用标签格式
      if (rules.hashtagStyle) {
        formattedContent = this.applyHashtagStyle(formattedContent, rules.hashtagStyle);
      }

      // 应用代码块格式
      if (rules.codeBlockFormat) {
        formattedContent = this.applyCodeBlockFormat(formattedContent, rules.codeBlockFormat);
      }

      // 应用链接格式
      if (rules.linkFormatting) {
        formattedContent = this.applyLinkFormatting(formattedContent, rules.linkFormatting);
      }

      // 优化行分隔
      if (rules.lineBreakOptimization) {
        formattedContent = this.optimizeLineBreaks(formattedContent);
      }

      return formattedContent;

    } catch (error) {
      this.logger.warn('Failed to apply format rules, using original content', error instanceof Error ? error : new Error(String(error)));
      return content;
    }
  }

  /**
   * 应用段落分隔符
   */
  private applyParagraphBreaks(content: string, breakStyle: string): string {
    // 将单个换行符替换为指定的段落分隔符
    return content.replace(/\n(?!\n)/g, breakStyle);
  }

  /**
   * 应用标题格式
   */
  private applyHeadingStyle(content: string, headingStyle: string): string {
    // 查找并格式化标题（以#开头的行）
    return content.replace(/^(#+)\s*(.+)$/gm, (match, hashes, title) => {
      const level = hashes.length;
      if (headingStyle.includes('##')) {
        return `${'#'.repeat(Math.min(level, 6))} ${title}`;
      }
      return match;
    });
  }

  /**
   * 应用标签格式
   */
  private applyHashtagStyle(content: string, hashtagStyle: string): string {
    // 根据平台格式化标签
    if (hashtagStyle === '#话题#') {
      // 小红书格式：#话题#
      return content.replace(/#([^#\s]+)/g, '#$1#');
    } else if (hashtagStyle === '#hashtag') {
      // Twitter格式：#hashtag
      return content.replace(/#([^#\s]+)#/g, '#$1');
    }
    return content;
  }

  /**
   * 应用代码块格式
   */
  private applyCodeBlockFormat(content: string, codeBlockFormat: string): string {
    // 确保代码块使用正确的格式
    return content.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `\`\`\`${language}\n${code}\`\`\``;
    });
  }

  /**
   * 应用链接格式
   */
  private applyLinkFormatting(content: string, linkFormat: string): string {
    if (linkFormat === '[text](url)') {
      // Markdown格式链接
      return content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1]($2)');
    }
    return content;
  }

  /**
   * 优化行分隔
   */
  private optimizeLineBreaks(content: string): string {
    // 移除多余的空行，保持适当的段落间距
    return content
      .replace(/\n{3,}/g, '\n\n') // 将3个或更多连续换行符替换为2个
      .replace(/^\n+/, '') // 移除开头的换行符
      .replace(/\n+$/, ''); // 移除结尾的换行符
  }

  /**
   * 生成渲染元数据
   */
  private generateMetadata(
    template: PlatformTemplate, 
    context: TemplateContext, 
    startTime: number
  ): TemplateRenderMetadata {
    // 生成上下文哈希
    const contextString = JSON.stringify({
      topic: context.topic,
      context: context.context,
      userPreferences: context.userPreferences,
      additionalParams: context.additionalParams
    });
    const contextHash = crypto.createHash('md5').update(contextString).digest('hex');

    // 提取已替换的占位符
    const placeholdersReplaced = this.extractPlaceholders(template.userTemplate);

    return {
      platformId: template.id,
      templateVersion: template.metadata?.version || '1.0.0',
      renderTime: new Date(),
      contextHash,
      placeholdersReplaced,
      warnings: [] // 在实际渲染过程中收集的警告
    };
  }

  /**
   * 提取模板中的占位符
   */
  private extractPlaceholders(template: string): string[] {
    const placeholders: string[] = [];
    let match;
    
    while ((match = this.placeholderPattern.exec(template)) !== null) {
      placeholders.push(match[1]);
    }
    
    // 重置正则表达式的lastIndex
    this.placeholderPattern.lastIndex = 0;
    
    return [...new Set(placeholders)]; // 去重
  }

  /**
   * 预览模板渲染结果（不执行实际渲染）
   */
  previewRender(template: PlatformTemplate, context: TemplateContext): {
    placeholders: string[];
    missingPlaceholders: string[];
    estimatedLength: number;
  } {
    const placeholders = this.extractPlaceholders(template.userTemplate);
    const renderContext = this.prepareRenderContext(context);
    
    const missingPlaceholders = placeholders.filter(
      placeholder => !Object.prototype.hasOwnProperty.call(renderContext, placeholder)
    );

    // 估算渲染后的长度
    let estimatedContent = template.userTemplate;
    for (const [key, value] of Object.entries(renderContext)) {
      const placeholder = `{${key}}`;
      estimatedContent = estimatedContent.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
    
    const estimatedLength = estimatedContent.length;

    return {
      placeholders,
      missingPlaceholders,
      estimatedLength
    };
  }

  /**
   * 验证模板语法
   */
  validateTemplateSyntax(template: PlatformTemplate): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 检查占位符语法
      const placeholders = this.extractPlaceholders(template.userTemplate);
      const requiredPlaceholders = ['topic', 'context'];
      
      for (const required of requiredPlaceholders) {
        if (!placeholders.includes(required)) {
          errors.push(`缺少必需的占位符: {${required}}`);
        }
      }

      // 检查是否有未闭合的占位符
      const unclosedPlaceholders = template.userTemplate.match(/\{[^}]*$/g);
      if (unclosedPlaceholders) {
        errors.push(`发现未闭合的占位符: ${unclosedPlaceholders.join(', ')}`);
      }

      // 检查是否有空的占位符
      const emptyPlaceholders = template.userTemplate.match(/\{\s*\}/g);
      if (emptyPlaceholders) {
        warnings.push('发现空的占位符');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`语法验证失败: ${error instanceof Error ? error.message : '未知错误'}`],
        warnings: []
      };
    }
  }
} 