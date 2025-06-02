/**
 * TOM-117: 核心模板管理系统 - 增强模板服务
 * 实现高级模板的完整CRUD操作和管理功能
 */

import {
  AdvancedPromptTemplate,
  TemplateFilters,
  TemplateStatistics,
  TemplateCreationOptions,
  TemplateUpdateOptions,
  TemplateImportResult,
  TemplateExportFormat,
  TemplateValidationResult,
  PromptCategory,
  DEFAULT_ADVANCED_TEMPLATE,
  DEFAULT_QUALITY_RULES,
  generateTemplateId,
  isAdvancedPromptTemplate,
  combinePromptLayers,
  extractVariablesFromPrompt
} from '../../types/prompt-advanced';
import { PlatformId, SocialMediaPlatform } from '../../types/social-media';
import { SettingsManager } from '../SettingsManager';
import { SettingsStorage } from '../SettingsStorage';

// 错误类型定义
export class TemplateServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'TemplateServiceError';
  }
}

// 模板服务配置
export interface TemplateServiceConfig {
  enableCache: boolean;
  cacheSize: number;
  cacheTTL: number;
  enableValidation: boolean;
  enablePerformanceTracking: boolean;
  maxTemplates: number;
  autoBackup: boolean;
}

// 默认配置
const DEFAULT_CONFIG: TemplateServiceConfig = {
  enableCache: true,
  cacheSize: 1000,
  cacheTTL: 3600000, // 1小时
  enableValidation: true,
  enablePerformanceTracking: true,
  maxTemplates: 10000,
  autoBackup: true
};

/**
 * 增强模板服务类
 * 提供完整的高级模板管理功能
 */
export class EnhancedPromptTemplateService {
  private templates: Map<string, AdvancedPromptTemplate>;
  private templateCache: Map<string, AdvancedPromptTemplate>;
  private config: TemplateServiceConfig;
  private lastBackupTime: Date;

  constructor(
    private settingsManager: SettingsManager,
    private settingsStorage: SettingsStorage,
    config?: Partial<TemplateServiceConfig>
  ) {
    this.templates = new Map();
    this.templateCache = new Map();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.lastBackupTime = new Date();

    // 初始化时加载模板
    this.loadTemplatesFromStorage().catch(error => {
      console.error('[EnhancedPromptTemplateService] Failed to load templates:', error);
    });

    console.log('[EnhancedPromptTemplateService] Initialized with config:', this.config);
  }

  // ========== 基础CRUD操作 ==========

  /**
   * 创建模板
   */
  async createTemplate(
    templateInput: Omit<AdvancedPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>,
    options?: TemplateCreationOptions
  ): Promise<string> {
    const opts = {
      generateId: true,
      validateOnCreate: true,
      setDefaultValues: true,
      addPerformanceTracking: true,
      ...options
    };

    try {
      // 生成ID
      const id = opts.generateId ? generateTemplateId() : (templateInput as any).id || generateTemplateId();

      // 检查ID冲突
      if (this.templates.has(id)) {
        throw new TemplateServiceError(
          `模板ID已存在: ${id}`,
          'DUPLICATE_ID',
          { templateId: id }
        );
      }

      // 创建完整模板对象
      const now = new Date();
      const fullTemplate: AdvancedPromptTemplate = {
        ...DEFAULT_ADVANCED_TEMPLATE,
        ...templateInput,
        id,
        createdAt: now,
        updatedAt: now,
        version: templateInput.version || '1.0.0',
        usageCount: 0,
        tags: templateInput.tags || [],
        variables: templateInput.variables || [],
        examples: templateInput.examples || [],
        qualityRules: templateInput.qualityRules || [...DEFAULT_QUALITY_RULES]
      };

      // 验证模板
      if (opts.validateOnCreate && this.config.enableValidation) {
        const validation = this.validateTemplate(fullTemplate);
        if (!validation.isValid) {
          const criticalErrors = validation.errors.filter(e => e.severity === 'error');
          if (criticalErrors.length > 0) {
            throw new TemplateServiceError(
              `模板验证失败: ${criticalErrors[0].message}`,
              'VALIDATION_ERROR',
              { errors: criticalErrors }
            );
          }
        }
      }

      // 添加性能跟踪
      if (opts.addPerformanceTracking && this.config.enablePerformanceTracking) {
        fullTemplate.performanceMetrics = {
          aiDetectionScore: 0.5,
          platformFitScore: 0.8,
          engagementPrediction: 0.7,
          qualityConsistency: 0.8,
          userSatisfaction: 0.7,
          averageGenerationTime: 0,
          usageFrequency: 0,
          lastOptimized: now
        };
      }

      // 存储模板
      this.templates.set(id, fullTemplate);

      // 持久化
      await this.saveTemplatesToStorage();

      // 清除缓存
      this.clearCache();

      console.log(`[EnhancedPromptTemplateService] Created template: ${id}`);
      return id;

    } catch (error) {
      console.error('[EnhancedPromptTemplateService] Create template failed:', error);
      throw error instanceof TemplateServiceError ? error : new TemplateServiceError(
        `创建模板失败: ${error.message}`,
        'CREATE_ERROR',
        { originalError: error.message }
      );
    }
  }

  /**
   * 获取模板
   */
  async getTemplate(id: string): Promise<AdvancedPromptTemplate | null> {
    try {
      // 检查缓存
      if (this.config.enableCache && this.templateCache.has(id)) {
        return this.templateCache.get(id)!;
      }

      // 从存储获取
      const template = this.templates.get(id);
      if (!template) {
        return null;
      }

      // 更新缓存
      if (this.config.enableCache) {
        this.templateCache.set(id, template);
      }

      return template;
    } catch (error) {
      console.error(`[EnhancedPromptTemplateService] Get template ${id} failed:`, error);
      throw new TemplateServiceError(
        `获取模板失败: ${error.message}`,
        'GET_ERROR',
        { templateId: id }
      );
    }
  }

  /**
   * 获取模板列表
   */
  async getTemplates(filters?: TemplateFilters): Promise<AdvancedPromptTemplate[]> {
    try {
      let templates = Array.from(this.templates.values());

      // 应用筛选器
      if (filters) {
        templates = templates.filter(template => {
          // 平台筛选
          if (filters.platform && template.platform !== filters.platform) {
            return false;
          }

          // 分类筛选
          if (filters.category && template.category !== filters.category) {
            return false;
          }

          // 标签筛选
          if (filters.tags && filters.tags.length > 0) {
            const hasMatchingTags = filters.tags.some(tag => 
              template.tags.includes(tag)
            );
            if (!hasMatchingTags) {
              return false;
            }
          }

          // 创建时间筛选
          if (filters.createdAfter && template.createdAt < filters.createdAfter) {
            return false;
          }
          if (filters.createdBefore && template.createdAt > filters.createdBefore) {
            return false;
          }

          // 使用次数筛选
          if (filters.minUsageCount && template.usageCount < filters.minUsageCount) {
            return false;
          }
          if (filters.maxUsageCount && template.usageCount > filters.maxUsageCount) {
            return false;
          }

          // 性能指标筛选
          if (filters.hasPerformanceMetrics !== undefined) {
            const hasMetrics = !!template.performanceMetrics;
            if (filters.hasPerformanceMetrics !== hasMetrics) {
              return false;
            }
          }

          return true;
        });
      }

      return templates;
    } catch (error) {
      console.error('[EnhancedPromptTemplateService] Get templates failed:', error);
      throw new TemplateServiceError(
        `获取模板列表失败: ${error.message}`,
        'LIST_ERROR'
      );
    }
  }

  /**
   * 更新模板
   */
  async updateTemplate(
    id: string,
    updates: Partial<AdvancedPromptTemplate>,
    options?: TemplateUpdateOptions
  ): Promise<void> {
    const opts = {
      incrementVersion: true,
      validateOnUpdate: true,
      preserveUsageCount: true,
      updateTimestamp: true,
      notifySubscribers: false,
      ...options
    };

    try {
      const existingTemplate = this.templates.get(id);
      if (!existingTemplate) {
        throw new TemplateServiceError(
          `模板不存在: ${id}`,
          'NOT_FOUND',
          { templateId: id }
        );
      }

      // 创建更新后的模板
      const updatedTemplate: AdvancedPromptTemplate = {
        ...existingTemplate,
        ...updates,
        id, // 确保ID不被修改
        createdAt: existingTemplate.createdAt, // 保持创建时间
        usageCount: opts.preserveUsageCount ? existingTemplate.usageCount : (updates.usageCount || 0),
        updatedAt: opts.updateTimestamp ? new Date() : existingTemplate.updatedAt
      };

      // 增加版本号
      if (opts.incrementVersion) {
        const versionParts = existingTemplate.version.split('.').map(Number);
        versionParts[2] = (versionParts[2] || 0) + 1;
        updatedTemplate.version = versionParts.join('.');
      }

      // 验证更新后的模板
      if (opts.validateOnUpdate && this.config.enableValidation) {
        const validation = this.validateTemplate(updatedTemplate);
        if (!validation.isValid) {
          const criticalErrors = validation.errors.filter(e => e.severity === 'error');
          if (criticalErrors.length > 0) {
            throw new TemplateServiceError(
              `模板验证失败: ${criticalErrors[0].message}`,
              'VALIDATION_ERROR',
              { errors: criticalErrors }
            );
          }
        }
      }

      // 更新存储
      this.templates.set(id, updatedTemplate);

      // 持久化
      await this.saveTemplatesToStorage();

      // 清除缓存
      this.clearCache();

      console.log(`[EnhancedPromptTemplateService] Updated template: ${id}`);

    } catch (error) {
      console.error(`[EnhancedPromptTemplateService] Update template ${id} failed:`, error);
      throw error instanceof TemplateServiceError ? error : new TemplateServiceError(
        `更新模板失败: ${error.message}`,
        'UPDATE_ERROR',
        { templateId: id }
      );
    }
  }

  /**
   * 删除模板
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      if (!this.templates.has(id)) {
        throw new TemplateServiceError(
          `模板不存在: ${id}`,
          'NOT_FOUND',
          { templateId: id }
        );
      }

      // 删除模板
      this.templates.delete(id);

      // 从缓存中删除
      this.templateCache.delete(id);

      // 持久化
      await this.saveTemplatesToStorage();

      console.log(`[EnhancedPromptTemplateService] Deleted template: ${id}`);

    } catch (error) {
      console.error(`[EnhancedPromptTemplateService] Delete template ${id} failed:`, error);
      throw error instanceof TemplateServiceError ? error : new TemplateServiceError(
        `删除模板失败: ${error.message}`,
        'DELETE_ERROR',
        { templateId: id }
      );
    }
  }

  // ========== 高级功能 ==========

  /**
   * 搜索模板
   */
  async searchTemplates(query: string): Promise<AdvancedPromptTemplate[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const searchTerm = query.toLowerCase().trim();
      const templates = Array.from(this.templates.values());

      return templates.filter(template => {
        // 搜索名称、描述、标签
        const searchableText = [
          template.name,
          template.description || '',
          ...template.tags,
          template.category
        ].join(' ').toLowerCase();

        return searchableText.includes(searchTerm);
      });
    } catch (error) {
      console.error('[EnhancedPromptTemplateService] Search templates failed:', error);
      throw new TemplateServiceError(
        `搜索模板失败: ${error.message}`,
        'SEARCH_ERROR'
      );
    }
  }

  /**
   * 按分类获取模板
   */
  async getTemplatesByCategory(category: PromptCategory): Promise<AdvancedPromptTemplate[]> {
    return this.getTemplates({ category });
  }

  /**
   * 按平台获取模板
   */
  async getTemplatesByPlatform(platform: PlatformId): Promise<AdvancedPromptTemplate[]> {
    return this.getTemplates({ platform });
  }

  /**
   * 克隆模板
   */
  async cloneTemplate(id: string, newName: string): Promise<string> {
    try {
      const originalTemplate = await this.getTemplate(id);
      if (!originalTemplate) {
        throw new TemplateServiceError(
          `源模板不存在: ${id}`,
          'NOT_FOUND',
          { templateId: id }
        );
      }

      // 创建克隆模板
      const clonedTemplate: Omit<AdvancedPromptTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        name: newName,
        description: originalTemplate.description,
        platform: originalTemplate.platform,
        category: originalTemplate.category,
        tags: [...originalTemplate.tags, 'cloned'],
        systemPrompt: originalTemplate.systemPrompt,
        taskPrompt: originalTemplate.taskPrompt,
        contextPrompt: originalTemplate.contextPrompt,
        outputPrompt: originalTemplate.outputPrompt,
        variables: [...originalTemplate.variables],
        examples: [...originalTemplate.examples],
        qualityRules: [...originalTemplate.qualityRules],
        antiAISettings: originalTemplate.antiAISettings,
        version: '1.0.0',
        usageCount: 0,
        performanceMetrics: originalTemplate.performanceMetrics
      };

      return await this.createTemplate(clonedTemplate);
    } catch (error) {
      console.error(`[EnhancedPromptTemplateService] Clone template ${id} failed:`, error);
      throw error instanceof TemplateServiceError ? error : new TemplateServiceError(
        `克隆模板失败: ${error.message}`,
        'CLONE_ERROR',
        { sourceTemplateId: id }
      );
    }
  }

  // ========== 批量操作 ==========

  /**
   * 批量创建模板
   */
  async batchCreateTemplates(
    templates: Omit<AdvancedPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<string[]> {
    const createdIds: string[] = [];
    const errors: string[] = [];

    for (const template of templates) {
      try {
        const id = await this.createTemplate(template, { validateOnCreate: false });
        createdIds.push(id);
      } catch (error) {
        console.error('[EnhancedPromptTemplateService] Batch create failed for template:', template.name, error);
        errors.push(`${template.name}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.warn('[EnhancedPromptTemplateService] Batch create completed with errors:', errors);
    }

    return createdIds;
  }

  /**
   * 批量删除模板
   */
  async batchDeleteTemplates(ids: string[]): Promise<void> {
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await this.deleteTemplate(id);
      } catch (error) {
        console.error(`[EnhancedPromptTemplateService] Batch delete failed for template: ${id}`, error);
        errors.push(`${id}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.warn('[EnhancedPromptTemplateService] Batch delete completed with errors:', errors);
      throw new TemplateServiceError(
        `批量删除部分失败: ${errors.length} 个错误`,
        'BATCH_DELETE_ERROR',
        { errors }
      );
    }
  }

  /**
   * 导出模板
   */
  async exportTemplates(
    ids?: string[],
    format?: TemplateExportFormat
  ): Promise<string> {
    try {
      const exportFormat = format || { format: 'json', includeMetadata: true };
      const templatesToExport = ids 
        ? await Promise.all(ids.map(id => this.getTemplate(id)).filter(t => t !== null))
        : Array.from(this.templates.values());

      // 处理导出数据
      let exportData = templatesToExport.map(template => {
        const exported: any = { ...template };

        if (!exportFormat.includeMetadata) {
          delete exported.createdAt;
          delete exported.updatedAt;
          delete exported.usageCount;
        }

        if (!exportFormat.includePerformanceMetrics) {
          delete exported.performanceMetrics;
        }

        if (!exportFormat.includeExamples) {
          delete exported.examples;
        }

        return exported;
      });

      // 根据格式导出
      switch (exportFormat.format) {
        case 'json': {
          return JSON.stringify(exportData, null, exportFormat.compressOutput ? 0 : 2);
        }
        case 'yaml': {
          // 简化的YAML格式
          return exportData.map(template => 
            `# ${template.name}\n` +
            `id: ${template.id}\n` +
            `platform: ${template.platform}\n` +
            `category: ${template.category}\n`
          ).join('\n---\n');
        }
        case 'csv': {
          // 简化的CSV格式
          const headers = ['id', 'name', 'platform', 'category', 'tags'];
          const csvRows = exportData.map(template => 
            headers.map(header => 
              header === 'tags' ? template[header].join(';') : template[header]
            ).join(',')
          );
          return [headers.join(','), ...csvRows].join('\n');
        }
        default:
          throw new TemplateServiceError(
            `不支持的导出格式: ${exportFormat.format}`,
            'UNSUPPORTED_FORMAT'
          );
      }
    } catch (error) {
      console.error('[EnhancedPromptTemplateService] Export templates failed:', error);
      throw error instanceof TemplateServiceError ? error : new TemplateServiceError(
        `导出模板失败: ${error.message}`,
        'EXPORT_ERROR'
      );
    }
  }

  /**
   * 导入模板
   */
  async importTemplates(jsonData: string): Promise<string[]> {
    try {
      const templates = JSON.parse(jsonData);
      if (!Array.isArray(templates)) {
        throw new TemplateServiceError(
          '导入数据必须是模板数组',
          'INVALID_IMPORT_DATA'
        );
      }

      const importedIds: string[] = [];
      for (const templateData of templates) {
        try {
          // 验证模板数据
          if (!isAdvancedPromptTemplate(templateData)) {
            console.warn('[EnhancedPromptTemplateService] Invalid template data, skipping:', templateData);
            continue;
          }

          // 创建模板数据副本并移除时间戳
          const templateToImport: any = { ...templateData };
          delete templateToImport.id;
          delete templateToImport.createdAt;
          delete templateToImport.updatedAt;

          const id = await this.createTemplate(templateToImport);
          importedIds.push(id);
        } catch (error) {
          console.error('[EnhancedPromptTemplateService] Import template failed:', templateData.name, error);
        }
      }

      return importedIds;
    } catch (error) {
      console.error('[EnhancedPromptTemplateService] Import templates failed:', error);
      throw new TemplateServiceError(
        `导入模板失败: ${error.message}`,
        'IMPORT_ERROR'
      );
    }
  }

  // ========== 兼容性支持 ==========

  /**
   * 从简单模板迁移
   */
  async migrateFromSimpleTemplate(simpleTemplate: any): Promise<AdvancedPromptTemplate> {
    try {
      // 基本映射
      const advancedTemplate: Omit<AdvancedPromptTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        name: simpleTemplate.name || '迁移模板',
        description: simpleTemplate.description || '从简单模板迁移',
        platform: simpleTemplate.platform || 'blog',
        category: 'custom',
        tags: simpleTemplate.tags || ['migrated'],
        usageCount: 0,
        
        // 将简单模板内容映射到分层结构
        systemPrompt: simpleTemplate.systemPrompt || '你是一个专业的内容创作者。',
        taskPrompt: simpleTemplate.userTemplate || simpleTemplate.prompt || '请根据用户输入创作内容。',
        contextPrompt: '用户输入: {userInput}\n相关背景: {context}',
        outputPrompt: '请确保输出内容符合平台要求，风格一致，质量优良。',
        
        variables: [
          {
            name: 'userInput',
            type: 'string',
            required: true,
            description: '用户输入内容'
          },
          {
            name: 'context',
            type: 'string',
            required: false,
            description: '相关背景信息'
          }
        ],
        examples: [],
        qualityRules: [...DEFAULT_QUALITY_RULES],
        antiAISettings: DEFAULT_ADVANCED_TEMPLATE.antiAISettings!,
        version: '1.0.0'
      };

      const id = await this.createTemplate(advancedTemplate);
      return (await this.getTemplate(id))!;
    } catch (error) {
      console.error('[EnhancedPromptTemplateService] Migrate simple template failed:', error);
      throw new TemplateServiceError(
        `迁移简单模板失败: ${error.message}`,
        'MIGRATION_ERROR'
      );
    }
  }

  /**
   * 获取模板统计信息
   */
  async getTemplateStatistics(): Promise<TemplateStatistics> {
    try {
      const totalTemplates = this.templates.size;
      const templatesPerPlatform: Record<PlatformId, number> = {
        xiaohongshu: 0,
        twitter: 0,
        wechat: 0,
        blog: 0,
        toutiao: 0,
        zhihu: 0,
        douyin: 0
      };

      // 按分类统计
      const templatesPerCategory: Record<PromptCategory, number> = {
        'product-review': 0,
        'opinion-sharing': 0,
        'analytical-article': 0,
        'tutorial-guide': 0,
        'personal-story': 0,
        'news-commentary': 0,
        'lifestyle-sharing': 0,
        'technical-blog': 0,
        'marketing-copy': 0,
        'social-media-post': 0,
        'custom': 0
      };

      let totalUsageCount = 0;
      let totalQualityScore = 0;
      let qualityScoreCount = 0;
      let performanceMetricsCount = 0;
      const usageCountMap = new Map<string, number>();

      const templates = Array.from(this.templates.values());
      templates.forEach(template => {
        // 平台统计
        templatesPerPlatform[template.platform]++;
        
        // 分类统计
        templatesPerCategory[template.category]++;
        
        // 使用次数
        totalUsageCount += template.usageCount;
        usageCountMap.set(template.id, template.usageCount);
        
        // 质量评分
        if (template.performanceMetrics) {
          performanceMetricsCount++;
          totalQualityScore += template.performanceMetrics.platformFitScore * 100;
          qualityScoreCount++;
        }
      });

      // 最常用模板
      const sortedByUsage = Array.from(usageCountMap.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([id]) => id);

      // 最近更新模板
      const recentlyUpdated = templates
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 10)
        .map(t => t.id);

      return {
        totalTemplates,
        templatesPerPlatform,
        templatesPerCategory,
        averageUsageCount: totalUsageCount / totalTemplates,
        averageQualityScore: qualityScoreCount > 0 ? totalQualityScore / qualityScoreCount : 0,
        mostUsedTemplates: sortedByUsage,
        recentlyUpdated,
        performanceMetricsAvailable: performanceMetricsCount
      };
    } catch (error) {
      console.error('[EnhancedPromptTemplateService] Get statistics failed:', error);
      throw new TemplateServiceError(
        `获取统计信息失败: ${error.message}`,
        'STATISTICS_ERROR'
      );
    }
  }

  // ========== 私有方法 ==========

  /**
   * 验证模板
   */
  private validateTemplate(template: AdvancedPromptTemplate): TemplateValidationResult {
    const errors: TemplateValidationResult['errors'] = [];
    const warnings: string[] = [];
    let score = 100;

    // 必需字段检查
    if (!template.id || template.id.trim().length === 0) {
      errors.push({
        field: 'id',
        message: '模板ID不能为空',
        severity: 'error'
      });
      score -= 20;
    }

    if (!template.name || template.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: '模板名称不能为空',
        severity: 'error'
      });
      score -= 20;
    }

    if (!template.systemPrompt || template.systemPrompt.trim().length === 0) {
      errors.push({
        field: 'systemPrompt',
        message: '系统提示词不能为空',
        severity: 'error'
      });
      score -= 15;
    }

    if (!template.taskPrompt || template.taskPrompt.trim().length === 0) {
      errors.push({
        field: 'taskPrompt',
        message: '任务提示词不能为空',
        severity: 'error'
      });
      score -= 15;
    }

    // 长度检查
    if (template.systemPrompt && template.systemPrompt.length > 2000) {
      errors.push({
        field: 'systemPrompt',
        message: '系统提示词过长（最大2000字符）',
        severity: 'warning',
        suggestion: '考虑简化系统提示词'
      });
      score -= 5;
    }

    if (template.taskPrompt && template.taskPrompt.length > 1000) {
      errors.push({
        field: 'taskPrompt',
        message: '任务提示词过长（最大1000字符）',
        severity: 'warning',
        suggestion: '考虑简化任务描述'
      });
      score -= 5;
    }

    // 变量检查
    const extractedVars = extractVariablesFromPrompt(combinePromptLayers(template));
    const definedVars = template.variables.map(v => v.name);
    const undefinedVars = extractedVars.filter(v => !definedVars.includes(v));
    
    if (undefinedVars.length > 0) {
      warnings.push(`未定义的变量: ${undefinedVars.join(', ')}`);
      score -= undefinedVars.length * 2;
    }

    // 示例检查
    if (template.examples.length === 0) {
      warnings.push('建议添加至少一个示例以提升模板质量');
      score -= 5;
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
      recommendations: warnings
    };
  }

  /**
   * 从存储加载模板
   */
  private async loadTemplatesFromStorage(): Promise<void> {
    try {
      const settings = this.settingsManager.getSettings();
      const promptSettings = (settings as any).promptModuleSettings;
      const templatesData = promptSettings?.templates || [];
      
      for (const templateData of templatesData) {
        if (isAdvancedPromptTemplate(templateData)) {
          this.templates.set(templateData.id, templateData);
        }
      }

      console.log(`[EnhancedPromptTemplateService] Loaded ${this.templates.size} templates from storage`);
    } catch (error) {
      console.error('[EnhancedPromptTemplateService] Load from storage failed:', error);
    }
  }

  /**
   * 保存模板到存储
   */
  private async saveTemplatesToStorage(): Promise<void> {
    try {
      const templates = Array.from(this.templates.values());
      const currentSettings = this.settingsManager.getSettings();
      
      const updatedSettings = {
        ...currentSettings,
        promptModuleSettings: {
          ...(currentSettings as any).promptModuleSettings,
          templates
        }
      };

      await this.settingsManager.updateSettings(updatedSettings as any);

      console.log(`[EnhancedPromptTemplateService] Saved ${templates.length} templates to storage`);
    } catch (error) {
      console.error('[EnhancedPromptTemplateService] Save to storage failed:', error);
      throw error;
    }
  }

  /**
   * 清除缓存
   */
  private clearCache(): void {
    if (this.config.enableCache) {
      this.templateCache.clear();
    }
  }
} 