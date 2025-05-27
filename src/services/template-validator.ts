/**
 * 模板验证器
 * 负责验证平台模板的有效性和完整性
 */

import {
  PlatformTemplate,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  TemplateValidationRules,
  PlatformId
} from '../types/social-media';
import { defaultValidationRules } from '../config/platform-templates';
import { Logger } from '../utils/logger';

export class TemplateValidator {
  private validationRules: TemplateValidationRules;
  private logger: Logger;

  constructor(customRules?: Partial<TemplateValidationRules>) {
    this.validationRules = {
      ...defaultValidationRules,
      ...customRules
    };
    this.logger = new Logger('TemplateValidator');
  }

  /**
   * 验证模板的完整性和有效性
   */
  validate(template: PlatformTemplate): ValidationResult {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // 1. 验证必需字段
      const requiredFieldErrors = this.validateRequiredFields(template);
      errors.push(...requiredFieldErrors);

      // 2. 验证长度约束
      const lengthErrors = this.validateLengthConstraints(template);
      errors.push(...lengthErrors);

      // 3. 验证格式规则
      const formatErrors = this.validateFormatRules(template);
      errors.push(...formatErrors);

      // 4. 验证平台特定规则
      const platformErrors = this.validatePlatformSpecificRules(template);
      errors.push(...platformErrors);

      // 5. 生成警告
      const validationWarnings = this.generateWarnings(template);
      warnings.push(...validationWarnings);

      // 6. 计算验证分数
      const score = this.calculateValidationScore(errors, warnings);

      const validationTime = Date.now() - startTime;
      this.logger.debug(`Template validation completed in ${validationTime}ms`, {
        templateId: template.id,
        score,
        errorCount: errors.length,
        warningCount: warnings.length
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        score
      };

    } catch (error) {
      this.logger.error('Template validation failed', error instanceof Error ? error : new Error(String(error)));
      return {
        isValid: false,
        errors: [{
          field: 'validation',
          message: `验证过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`,
          severity: 'error'
        }],
        warnings: [],
        score: 0
      };
    }
  }

  /**
   * 验证必需字段
   */
  private validateRequiredFields(template: PlatformTemplate): ValidationError[] {
    const errors: ValidationError[] = [];
    const requiredFields = this.validationRules.requiredFields;

    for (const field of requiredFields) {
      const value = (template as any)[field];
      
      if (value === undefined || value === null) {
        errors.push({
          field,
          message: `必需字段 "${field}" 缺失`,
          severity: 'error',
          suggestion: `请为模板添加 "${field}" 字段`
        });
      } else if (typeof value === 'string' && value.trim() === '') {
        errors.push({
          field,
          message: `必需字段 "${field}" 不能为空`,
          severity: 'error',
          suggestion: `请为 "${field}" 字段提供有效内容`
        });
      } else if (Array.isArray(value) && value.length === 0) {
        errors.push({
          field,
          message: `必需数组字段 "${field}" 不能为空`,
          severity: 'error',
          suggestion: `请为 "${field}" 数组添加至少一个元素`
        });
      }
    }

    return errors;
  }

  /**
   * 验证长度约束
   */
  private validateLengthConstraints(template: PlatformTemplate): ValidationError[] {
    const errors: ValidationError[] = [];
    const constraints = this.validationRules.lengthConstraints;

    // 验证系统提示长度
    if (template.systemPrompt) {
      const systemPromptLength = template.systemPrompt.length;
      if (systemPromptLength < constraints.systemPrompt.min) {
        errors.push({
          field: 'systemPrompt',
          message: `系统提示长度 (${systemPromptLength}) 小于最小要求 (${constraints.systemPrompt.min})`,
          severity: 'error',
          suggestion: '请扩展系统提示内容，提供更详细的指导'
        });
      } else if (systemPromptLength > constraints.systemPrompt.max) {
        errors.push({
          field: 'systemPrompt',
          message: `系统提示长度 (${systemPromptLength}) 超过最大限制 (${constraints.systemPrompt.max})`,
          severity: 'error',
          suggestion: '请精简系统提示内容，保持简洁明了'
        });
      }
    }

    // 验证用户模板长度
    if (template.userTemplate) {
      const userTemplateLength = template.userTemplate.length;
      if (userTemplateLength < constraints.userTemplate.min) {
        errors.push({
          field: 'userTemplate',
          message: `用户模板长度 (${userTemplateLength}) 小于最小要求 (${constraints.userTemplate.min})`,
          severity: 'error',
          suggestion: '请扩展用户模板内容，提供更详细的要求'
        });
      } else if (userTemplateLength > constraints.userTemplate.max) {
        errors.push({
          field: 'userTemplate',
          message: `用户模板长度 (${userTemplateLength}) 超过最大限制 (${constraints.userTemplate.max})`,
          severity: 'error',
          suggestion: '请精简用户模板内容，保持简洁明了'
        });
      }
    }

    return errors;
  }

  /**
   * 验证格式规则
   */
  private validateFormatRules(template: PlatformTemplate): ValidationError[] {
    const errors: ValidationError[] = [];
    const formatValidation = this.validationRules.formatValidation;

    // 验证占位符格式
    if (template.userTemplate) {
      const placeholders = template.userTemplate.match(formatValidation.placeholderPattern);
      const requiredPlaceholders = ['topic', 'context'];
      
      for (const required of requiredPlaceholders) {
        const placeholder = `{${required}}`;
        if (!template.userTemplate.includes(placeholder)) {
          errors.push({
            field: 'userTemplate',
            message: `缺少必需的占位符 "${placeholder}"`,
            severity: 'error',
            suggestion: `请在用户模板中添加 "${placeholder}" 占位符`
          });
        }
      }
    }

    // 验证风格关键词数量
    if (template.styleKeywords) {
      const keywordCount = template.styleKeywords.length;
      if (keywordCount < formatValidation.styleKeywordCount.min) {
        errors.push({
          field: 'styleKeywords',
          message: `风格关键词数量 (${keywordCount}) 少于最小要求 (${formatValidation.styleKeywordCount.min})`,
          severity: 'error',
          suggestion: '请添加更多风格关键词以更好地定义平台特色'
        });
      } else if (keywordCount > formatValidation.styleKeywordCount.max) {
        errors.push({
          field: 'styleKeywords',
          message: `风格关键词数量 (${keywordCount}) 超过最大限制 (${formatValidation.styleKeywordCount.max})`,
          severity: 'error',
          suggestion: '请精简风格关键词，保留最重要的特征词'
        });
      }
    }

    return errors;
  }

  /**
   * 验证平台特定规则
   */
  private validatePlatformSpecificRules(template: PlatformTemplate): ValidationError[] {
    const errors: ValidationError[] = [];

    switch (template.id) {
      case 'xiaohongshu':
        errors.push(...this.validateXiaohongshuRules(template));
        break;
      case 'twitter':
        errors.push(...this.validateTwitterRules(template));
        break;
      case 'wechat':
        errors.push(...this.validateWechatRules(template));
        break;
      case 'blog':
        errors.push(...this.validateBlogRules(template));
        break;
      case 'toutiao':
        errors.push(...this.validateToutiaoRules(template));
        break;
      default:
        errors.push({
          field: 'id',
          message: `不支持的平台ID: ${template.id}`,
          severity: 'error',
          suggestion: '请使用支持的平台ID: xiaohongshu, twitter, wechat, blog, toutiao'
        });
    }

    return errors;
  }

  /**
   * 验证小红书特定规则
   */
  private validateXiaohongshuRules(template: PlatformTemplate): ValidationError[] {
    const errors: ValidationError[] = [];

    // 检查是否包含表情符号相关内容
    if (!template.systemPrompt.includes('表情符号') && !template.userTemplate.includes('表情符号')) {
      errors.push({
        field: 'systemPrompt',
        message: '小红书模板应包含表情符号使用指导',
        severity: 'error',
        suggestion: '请在系统提示或用户模板中添加表情符号使用要求'
      });
    }

    // 检查是否包含互动元素
    if (!template.systemPrompt.includes('互动') && !template.userTemplate.includes('互动')) {
      errors.push({
        field: 'systemPrompt',
        message: '小红书模板应包含互动元素指导',
        severity: 'error',
        suggestion: '请在模板中添加互动问题或评论引导要求'
      });
    }

    // 检查长度限制
    if (template.maxLength > 300) {
      errors.push({
        field: 'maxLength',
        message: `小红书内容长度 (${template.maxLength}) 超过推荐限制 (300)`,
        severity: 'warning',
        suggestion: '建议将小红书内容长度控制在300字以内'
      });
    }

    return errors;
  }

  /**
   * 验证Twitter特定规则
   */
  private validateTwitterRules(template: PlatformTemplate): ValidationError[] {
    const errors: ValidationError[] = [];

    // 检查字符限制
    if (template.maxLength > 280) {
      errors.push({
        field: 'maxLength',
        message: `Twitter内容长度 (${template.maxLength}) 超过平台限制 (280)`,
        severity: 'error',
        suggestion: '请将Twitter内容长度设置为280字符以内'
      });
    }

    // 检查是否包含标签指导
    if (!template.systemPrompt.includes('标签') && !template.userTemplate.includes('标签')) {
      errors.push({
        field: 'systemPrompt',
        message: 'Twitter模板应包含标签使用指导',
        severity: 'error',
        suggestion: '请在模板中添加hashtag使用要求'
      });
    }

    return errors;
  }

  /**
   * 验证微信公众号特定规则
   */
  private validateWechatRules(template: PlatformTemplate): ValidationError[] {
    const errors: ValidationError[] = [];

    // 检查是否包含结构化内容指导
    if (!template.systemPrompt.includes('结构') && !template.userTemplate.includes('结构')) {
      errors.push({
        field: 'systemPrompt',
        message: '微信公众号模板应包含结构化内容指导',
        severity: 'error',
        suggestion: '请在模板中添加文章结构要求'
      });
    }

    // 检查长度要求
    if (template.maxLength < 800) {
      errors.push({
        field: 'maxLength',
        message: `微信公众号内容长度 (${template.maxLength}) 低于推荐最小值 (800)`,
        severity: 'warning',
        suggestion: '建议将微信公众号内容长度设置为800字以上'
      });
    }

    return errors;
  }

  /**
   * 验证博客特定规则
   */
  private validateBlogRules(template: PlatformTemplate): ValidationError[] {
    const errors: ValidationError[] = [];

    // 检查是否包含技术内容指导
    if (!template.systemPrompt.includes('技术') && !template.userTemplate.includes('技术')) {
      errors.push({
        field: 'systemPrompt',
        message: '博客模板应包含技术内容指导',
        severity: 'warning',
        suggestion: '建议在模板中添加技术深度要求'
      });
    }

    // 检查是否包含代码示例要求
    if (!template.userTemplate.includes('代码')) {
      errors.push({
        field: 'userTemplate',
        message: '博客模板应包含代码示例要求',
        severity: 'warning',
        suggestion: '建议在用户模板中添加代码示例要求'
      });
    }

    return errors;
  }

  /**
   * 验证头条号特定规则
   */
  private validateToutiaoRules(template: PlatformTemplate): ValidationError[] {
    const errors: ValidationError[] = [];

    // 检查是否包含吸引力指导
    if (!template.systemPrompt.includes('吸引') && !template.userTemplate.includes('吸引')) {
      errors.push({
        field: 'systemPrompt',
        message: '头条号模板应包含标题吸引力指导',
        severity: 'error',
        suggestion: '请在模板中添加标题吸引力要求'
      });
    }

    // 检查是否包含争议性内容指导
    if (!template.systemPrompt.includes('争议') && !template.userTemplate.includes('争议')) {
      errors.push({
        field: 'systemPrompt',
        message: '头条号模板应包含争议性内容指导',
        severity: 'warning',
        suggestion: '建议在模板中添加适度争议性要求'
      });
    }

    return errors;
  }

  /**
   * 生成验证警告
   */
  private generateWarnings(template: PlatformTemplate): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // 检查模板元数据
    if (!template.metadata) {
      warnings.push({
        field: 'metadata',
        message: '缺少模板元数据',
        suggestion: '建议添加版本、作者、描述等元数据信息'
      });
    }

    // 检查格式规则完整性
    if (!template.formatRules || Object.keys(template.formatRules).length === 0) {
      warnings.push({
        field: 'formatRules',
        message: '缺少格式规则定义',
        suggestion: '建议添加平台特定的格式规则'
      });
    }

    // 检查必需元素定义
    if (!template.requiredElements || template.requiredElements.length === 0) {
      warnings.push({
        field: 'requiredElements',
        message: '缺少必需元素定义',
        suggestion: '建议定义平台内容的必需元素'
      });
    }

    return warnings;
  }

  /**
   * 计算验证分数
   */
  private calculateValidationScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    const errorPenalty = errors.length * 20; // 每个错误扣20分
    const warningPenalty = warnings.length * 5; // 每个警告扣5分
    
    const score = Math.max(0, 100 - errorPenalty - warningPenalty);
    return Math.round(score);
  }

  /**
   * 批量验证模板
   */
  async validateBatch(templates: PlatformTemplate[]): Promise<Map<PlatformId, ValidationResult>> {
    const results = new Map<PlatformId, ValidationResult>();
    
    for (const template of templates) {
      try {
        const result = this.validate(template);
        results.set(template.id, result);
      } catch (error) {
        this.logger.error(`Failed to validate template ${template.id}`, error instanceof Error ? error : new Error(String(error)));
        results.set(template.id, {
          isValid: false,
          errors: [{
            field: 'validation',
            message: `验证失败: ${error instanceof Error ? error.message : '未知错误'}`,
            severity: 'error'
          }],
          warnings: [],
          score: 0
        });
      }
    }

    return results;
  }

  /**
   * 更新验证规则
   */
  updateValidationRules(newRules: Partial<TemplateValidationRules>): void {
    this.validationRules = {
      ...this.validationRules,
      ...newRules
    };
    
    this.logger.info('Template validation rules updated');
  }

  /**
   * 获取当前验证规则
   */
  getValidationRules(): TemplateValidationRules {
    return { ...this.validationRules };
  }
} 