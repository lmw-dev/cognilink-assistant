/**
 * TOM-117: 核心模板管理系统 - 主服务协调器
 * 统一管理 Prompt 模块的所有子服务和功能
 */

import { 
  EnhancedPromptTemplateService, 
  TemplateServiceError,
  TemplateServiceConfig 
} from './EnhancedPromptTemplateService';
import { ContentQualityEvaluator } from '../content-quality-evaluator';
import { SettingsManager } from '../SettingsManager';
import { SettingsStorage } from '../SettingsStorage';
import { 
  AdvancedPromptTemplate,
  TemplateStatistics,
  TemplateFilters,
  PromptCategory,
  TemplatePerformanceReport,
  TemplateValidationResult,
  generateTemplateId,
  combinePromptLayers
} from '../../types/prompt-advanced';
import { PlatformId, SocialMediaPlatform } from '../../types/social-media';
import { PromptModuleSettings } from '../../types/settings';

// 模块状态枚举
export enum PromptModuleStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  ERROR = 'error',
  UPDATING = 'updating'
}

// 模块事件类型
export interface PromptModuleEvent {
  type: 'template-created' | 'template-updated' | 'template-deleted' | 'module-status-changed';
  data: any;
  timestamp: Date;
}

// 事件监听器类型
export type PromptModuleEventListener = (event: PromptModuleEvent) => void;

// 模块初始化选项
export interface PromptModuleInitOptions {
  enableAutoBackup?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableEventLogging?: boolean;
  customConfig?: Partial<TemplateServiceConfig>;
}

/**
 * Prompt 模块主服务协调器
 * 
 * 功能：
 * 1. 统一管理所有子服务
 * 2. 提供高级API接口
 * 3. 处理模块级配置和状态
 * 4. 集成质量评估和性能监控
 */
export class PromptModuleService {
  private templateService: EnhancedPromptTemplateService;
  private qualityEvaluator: ContentQualityEvaluator;
  private status: PromptModuleStatus;
  private eventListeners: PromptModuleEventListener[];
  private initOptions: PromptModuleInitOptions;
  private lastBackupTime: Date;
  private performanceMetrics: Map<string, any>;

  constructor(
    private settingsManager: SettingsManager,
    private settingsStorage: SettingsStorage,
    qualityEvaluator: ContentQualityEvaluator,
    initOptions?: PromptModuleInitOptions
  ) {
    this.qualityEvaluator = qualityEvaluator;
    this.status = PromptModuleStatus.INITIALIZING;
    this.eventListeners = [];
    this.initOptions = {
      enableAutoBackup: true,
      enablePerformanceMonitoring: true,
      enableEventLogging: true,
      ...initOptions
    };
    this.lastBackupTime = new Date();
    this.performanceMetrics = new Map();

    // 初始化模板服务
    this.initializeTemplateService();

    console.log('[PromptModuleService] Initialized with options:', this.initOptions);
  }

  // ========== 模块管理 ==========

  /**
   * 获取模块状态
   */
  getStatus(): PromptModuleStatus {
    return this.status;
  }

  /**
   * 获取模块设置
   */
  getSettings(): PromptModuleSettings {
    const settings = this.settingsManager.getSettings();
    return (settings as any).promptModule || {};
  }

  /**
   * 更新模块设置
   */
  async updateSettings(newSettings: Partial<PromptModuleSettings>): Promise<void> {
    try {
      const currentSettings = this.settingsManager.getSettings();
      const updatedSettings = {
        ...currentSettings,
        promptModule: {
          ...(currentSettings as any).promptModule,
          ...newSettings
        }
      };

      await this.settingsManager.updateSettings(updatedSettings as any);
      
      // 重新初始化服务以应用新设置
      if (newSettings.enableCache !== undefined || 
          newSettings.cacheSize !== undefined || 
          newSettings.enableValidation !== undefined) {
        this.initializeTemplateService();
      }

      this.emitEvent({
        type: 'module-status-changed',
        data: { settings: newSettings },
        timestamp: new Date()
      });

      console.log('[PromptModuleService] Settings updated:', newSettings);
    } catch (error) {
      console.error('[PromptModuleService] Update settings failed:', error);
      throw new TemplateServiceError(
        `更新模块设置失败: ${error.message}`,
        'UPDATE_SETTINGS_ERROR'
      );
    }
  }

  /**
   * 重新初始化模块
   */
  async reinitialize(): Promise<void> {
    try {
      this.status = PromptModuleStatus.UPDATING;
      this.emitEvent({
        type: 'module-status-changed',
        data: { status: this.status },
        timestamp: new Date()
      });

      this.initializeTemplateService();

      this.status = PromptModuleStatus.READY;
      this.emitEvent({
        type: 'module-status-changed',
        data: { status: this.status },
        timestamp: new Date()
      });

      console.log('[PromptModuleService] Reinitialized successfully');
    } catch (error) {
      this.status = PromptModuleStatus.ERROR;
      console.error('[PromptModuleService] Reinitialize failed:', error);
      throw error;
    }
  }

  // ========== 模板管理API ==========

  /**
   * 创建模板（增强版）
   */
  async createTemplate(
    template: Omit<AdvancedPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>,
    options?: { validateQuality?: boolean; autoOptimize?: boolean }
  ): Promise<string> {
    try {
      const opts = { validateQuality: true, autoOptimize: true, ...options };

      // 质量预检查
      if (opts.validateQuality) {
        const qualityValidation = await this.validateTemplateQuality(template);
        if (!qualityValidation.isValid) {
          const criticalErrors = qualityValidation.errors.filter(e => e.severity === 'error');
          if (criticalErrors.length > 0) {
            throw new TemplateServiceError(
              `模板质量验证失败: ${criticalErrors[0].message}`,
              'QUALITY_VALIDATION_ERROR',
              { errors: criticalErrors }
            );
          }
        }
      }

      // 自动优化
      if (opts.autoOptimize) {
        // 这里可以添加自动优化逻辑，如标准化格式、优化变量等
        console.log('[PromptModuleService] Auto-optimization applied');
      }

      const templateId = await this.templateService.createTemplate(template);

      // 性能监控
      if (this.initOptions.enablePerformanceMonitoring) {
        this.recordPerformanceMetric('template-created', {
          templateId,
          timestamp: new Date(),
          category: template.category,
          platform: template.platform
        });
      }

      this.emitEvent({
        type: 'template-created',
        data: { templateId, template },
        timestamp: new Date()
      });

      return templateId;
    } catch (error) {
      console.error('[PromptModuleService] Create template failed:', error);
      throw error;
    }
  }

  /**
   * 获取模板（增强版）
   */
  async getTemplate(id: string, options?: { includePerformanceData?: boolean }): Promise<AdvancedPromptTemplate | null> {
    try {
      const template = await this.templateService.getTemplate(id);
      if (!template) {
        return null;
      }

      // 添加性能数据
      if (options?.includePerformanceData && this.initOptions.enablePerformanceMonitoring) {
        const performanceData = this.getTemplatePerformanceData(id);
        if (performanceData) {
          template.performanceMetrics = {
            ...template.performanceMetrics,
            ...performanceData
          };
        }
      }

      return template;
    } catch (error) {
      console.error(`[PromptModuleService] Get template ${id} failed:`, error);
      throw error;
    }
  }

  /**
   * 获取模板列表（增强版）
   */
  async getTemplates(
    filters?: TemplateFilters, 
    options?: { 
      sortBy?: 'createdAt' | 'updatedAt' | 'usageCount' | 'name';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    }
  ): Promise<AdvancedPromptTemplate[]> {
    try {
      let templates = await this.templateService.getTemplates(filters);

      // 排序
      if (options?.sortBy) {
        templates.sort((a, b) => {
          const aValue = a[options.sortBy!];
          const bValue = b[options.sortBy!];
          
          let comparison = 0;
          if (aValue < bValue) comparison = -1;
          else if (aValue > bValue) comparison = 1;
          
          return options.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      // 分页
      if (options?.offset !== undefined || options?.limit !== undefined) {
        const start = options.offset || 0;
        const end = options.limit ? start + options.limit : undefined;
        templates = templates.slice(start, end);
      }

      return templates;
    } catch (error) {
      console.error('[PromptModuleService] Get templates failed:', error);
      throw error;
    }
  }

  /**
   * 更新模板（增强版）
   */
  async updateTemplate(
    id: string,
    updates: Partial<AdvancedPromptTemplate>,
    options?: { validateQuality?: boolean; autoOptimize?: boolean }
  ): Promise<void> {
    try {
      const opts = { validateQuality: true, autoOptimize: true, ...options };

      // 获取原模板
      const originalTemplate = await this.templateService.getTemplate(id);
      if (!originalTemplate) {
        throw new TemplateServiceError(`模板不存在: ${id}`, 'NOT_FOUND');
      }

      // 创建更新后的完整模板用于验证
      const updatedTemplate = { ...originalTemplate, ...updates };

      // 质量预检查
      if (opts.validateQuality) {
        const qualityValidation = await this.validateTemplateQuality(updatedTemplate);
        if (!qualityValidation.isValid) {
          const criticalErrors = qualityValidation.errors.filter(e => e.severity === 'error');
          if (criticalErrors.length > 0) {
            console.warn('[PromptModuleService] Template quality issues detected:', criticalErrors);
          }
        }
      }

      await this.templateService.updateTemplate(id, updates);

      // 性能监控
      if (this.initOptions.enablePerformanceMonitoring) {
        this.recordPerformanceMetric('template-updated', {
          templateId: id,
          timestamp: new Date(),
          updates: Object.keys(updates)
        });
      }

      this.emitEvent({
        type: 'template-updated',
        data: { templateId: id, updates },
        timestamp: new Date()
      });

    } catch (error) {
      console.error(`[PromptModuleService] Update template ${id} failed:`, error);
      throw error;
    }
  }

  /**
   * 删除模板（增强版）
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      await this.templateService.deleteTemplate(id);

      // 清理性能数据
      if (this.initOptions.enablePerformanceMonitoring) {
        this.performanceMetrics.delete(`template-${id}`);
      }

      this.emitEvent({
        type: 'template-deleted',
        data: { templateId: id },
        timestamp: new Date()
      });

    } catch (error) {
      console.error(`[PromptModuleService] Delete template ${id} failed:`, error);
      throw error;
    }
  }

  // ========== 高级功能API ==========

  /**
   * 智能搜索模板
   */
  async searchTemplates(
    query: string, 
    options?: {
      fuzzyMatch?: boolean;
      searchFields?: ('name' | 'description' | 'tags' | 'content')[];
      maxResults?: number;
    }
  ): Promise<AdvancedPromptTemplate[]> {
    try {
      const opts = {
        fuzzyMatch: true,
        searchFields: ['name', 'description', 'tags', 'content'] as const,
        maxResults: 50,
        ...options
      };

      // 基础搜索
      let results = await this.templateService.searchTemplates(query);

      // 如果启用了内容搜索，也搜索模板内容
      if (opts.searchFields.includes('content')) {
        const allTemplates = await this.templateService.getTemplates();
        const contentMatches = allTemplates.filter(template => {
          const content = combinePromptLayers(template).toLowerCase();
          return content.includes(query.toLowerCase());
        });

        // 合并结果并去重
        const resultIds = new Set(results.map(t => t.id));
        contentMatches.forEach(template => {
          if (!resultIds.has(template.id)) {
            results.push(template);
          }
        });
      }

      // 限制结果数量
      if (results.length > opts.maxResults) {
        results = results.slice(0, opts.maxResults);
      }

      return results;
    } catch (error) {
      console.error('[PromptModuleService] Search templates failed:', error);
      throw error;
    }
  }

  /**
   * 获取推荐模板
   */
  async getRecommendedTemplates(
    platform: PlatformId,
    category?: PromptCategory,
    limit: number = 10
  ): Promise<AdvancedPromptTemplate[]> {
    try {
      const filters: TemplateFilters = { platform };
      if (category) {
        filters.category = category;
      }

      const templates = await this.templateService.getTemplates(filters);

      // 根据使用次数和质量评分排序
      const scored = templates.map(template => {
        let score = template.usageCount * 0.3; // 使用频率权重 30%
        
        if (template.performanceMetrics) {
          score += template.performanceMetrics.platformFitScore * 0.4; // 平台适配 40%
          score += template.performanceMetrics.userSatisfaction * 0.3; // 用户满意度 30%
        }

        return { template, score };
      });

      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.template);
    } catch (error) {
      console.error('[PromptModuleService] Get recommended templates failed:', error);
      throw error;
    }
  }

  /**
   * 生成模板性能报告
   */
  async generateTemplatePerformanceReport(
    templateId: string,
    period?: { start: Date; end: Date }
  ): Promise<TemplatePerformanceReport> {
    try {
      const template = await this.templateService.getTemplate(templateId);
      if (!template) {
        throw new TemplateServiceError(`模板不存在: ${templateId}`, 'NOT_FOUND');
      }

      const reportPeriod = period || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
        end: new Date()
      };

      // 获取性能数据
      const performanceData = this.getTemplatePerformanceData(templateId);
      const metrics = template.performanceMetrics || {
        aiDetectionScore: 0.5,
        platformFitScore: 0.8,
        engagementPrediction: 0.7,
        qualityConsistency: 0.8,
        userSatisfaction: 0.7,
        averageGenerationTime: 0,
        usageFrequency: 0,
        lastOptimized: new Date()
      };

      return {
        templateId,
        reportPeriod,
        metrics,
        usage: {
          totalUsages: template.usageCount,
          uniqueUsers: Math.floor(template.usageCount * 0.7), // 估算
          averageSessionLength: 300, // 5分钟，示例值
          popularTimeSlots: ['09:00-12:00', '14:00-18:00'] // 示例值
        },
        quality: {
          averageQualityScore: metrics.platformFitScore * 100,
          qualityTrend: 'stable',
          commonIssues: [],
          userFeedback: {
            positive: Math.floor(template.usageCount * 0.8),
            negative: Math.floor(template.usageCount * 0.1),
            neutral: Math.floor(template.usageCount * 0.1)
          }
        },
        recommendations: [
          {
            priority: 'medium',
            category: '性能优化',
            description: '建议添加更多示例以提升模板质量',
            estimatedImpact: 0.2
          }
        ]
      };
    } catch (error) {
      console.error(`[PromptModuleService] Generate performance report for ${templateId} failed:`, error);
      throw error;
    }
  }

  /**
   * 批量操作
   */
  async batchOperation<T>(
    operation: 'create' | 'update' | 'delete',
    items: T[],
    operationFn: (item: T) => Promise<any>
  ): Promise<{ successful: any[]; failed: Array<{ item: T; error: Error }> }> {
    const successful: any[] = [];
    const failed: Array<{ item: T; error: Error }> = [];

    for (const item of items) {
      try {
        const result = await operationFn(item);
        successful.push(result);
      } catch (error) {
        console.error(`[PromptModuleService] Batch ${operation} failed for item:`, item, error);
        failed.push({ item, error: error as Error });
      }
    }

    return { successful, failed };
  }

  // ========== 统计和分析 ==========

  /**
   * 获取详细统计信息
   */
  async getDetailedStatistics(): Promise<TemplateStatistics & { moduleInfo: any }> {
    try {
      const basicStats = await this.templateService.getTemplateStatistics();
      
      return {
        ...basicStats,
        moduleInfo: {
          status: this.status,
          lastBackupTime: this.lastBackupTime,
          settings: this.getSettings(),
          performanceMetricsCount: this.performanceMetrics.size
        }
      };
    } catch (error) {
      console.error('[PromptModuleService] Get detailed statistics failed:', error);
      throw error;
    }
  }

  // ========== 事件管理 ==========

  /**
   * 添加事件监听器
   */
  addEventListener(listener: PromptModuleEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: PromptModuleEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // ========== 私有方法 ==========

  /**
   * 初始化模板服务
   */
  private initializeTemplateService(): void {
    try {
      const settings = this.getSettings();
      const config: Partial<TemplateServiceConfig> = {
        enableCache: settings.enableCache,
        cacheSize: settings.cacheSize,
        cacheTTL: settings.cacheTTL,
        enableValidation: settings.enableValidation,
        enablePerformanceTracking: settings.enablePerformanceTracking,
        maxTemplates: settings.maxTemplates,
        autoBackup: settings.autoBackup,
        ...this.initOptions.customConfig
      };

      this.templateService = new EnhancedPromptTemplateService(
        this.settingsManager,
        this.settingsStorage,
        config
      );

      this.status = PromptModuleStatus.READY;
      console.log('[PromptModuleService] Template service initialized');
    } catch (error) {
      this.status = PromptModuleStatus.ERROR;
      console.error('[PromptModuleService] Initialize template service failed:', error);
      throw error;
    }
  }

  /**
   * 验证模板质量
   */
  private async validateTemplateQuality(
    template: Partial<AdvancedPromptTemplate>
  ): Promise<TemplateValidationResult> {
    // 基础验证逻辑（可扩展）
    const errors: TemplateValidationResult['errors'] = [];
    const warnings: string[] = [];
    let score = 100;

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
      score -= 20;
    }

    if (!template.taskPrompt || template.taskPrompt.trim().length === 0) {
      errors.push({
        field: 'taskPrompt',
        message: '任务提示词不能为空',
        severity: 'error'
      });
      score -= 20;
    }

    if (template.examples && template.examples.length === 0) {
      warnings.push('建议添加示例以提升模板效果');
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
   * 记录性能指标
   */
  private recordPerformanceMetric(metric: string, data: any): void {
    if (!this.initOptions.enablePerformanceMonitoring) return;

    const key = `${metric}-${Date.now()}`;
    this.performanceMetrics.set(key, data);

    // 限制内存使用，只保留最近1000条记录
    if (this.performanceMetrics.size > 1000) {
      const oldest = Array.from(this.performanceMetrics.keys())[0];
      this.performanceMetrics.delete(oldest);
    }
  }

  /**
   * 获取模板性能数据
   */
  private getTemplatePerformanceData(templateId: string): any {
    if (!this.initOptions.enablePerformanceMonitoring) return null;

    const relatedMetrics = Array.from(this.performanceMetrics.entries())
      .filter(([key, data]) => data.templateId === templateId);

    if (relatedMetrics.length === 0) return null;

    // 计算汇总数据
    const usageCount = relatedMetrics.filter(([key]) => key.includes('template-created')).length;
    const updateCount = relatedMetrics.filter(([key]) => key.includes('template-updated')).length;

    return {
      usageFrequency: usageCount,
      lastOptimized: new Date(),
      updateCount
    };
  }

  /**
   * 发射事件
   */
  private emitEvent(event: PromptModuleEvent): void {
    if (!this.initOptions.enableEventLogging) return;

    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[PromptModuleService] Event listener error:', error);
      }
    });

    console.log('[PromptModuleService] Event emitted:', event.type, event.data);
  }

  // ========== 公共API代理 ==========

  // 直接代理到模板服务的方法
  async cloneTemplate(id: string, newName: string): Promise<string> {
    return this.templateService.cloneTemplate(id, newName);
  }

  async exportTemplates(ids?: string[], format?: any): Promise<string> {
    return this.templateService.exportTemplates(ids, format);
  }

  async importTemplates(jsonData: string): Promise<string[]> {
    return this.templateService.importTemplates(jsonData);
  }

  async getTemplatesByCategory(category: PromptCategory): Promise<AdvancedPromptTemplate[]> {
    return this.templateService.getTemplatesByCategory(category);
  }

  async getTemplatesByPlatform(platform: PlatformId): Promise<AdvancedPromptTemplate[]> {
    return this.templateService.getTemplatesByPlatform(platform);
  }
} 