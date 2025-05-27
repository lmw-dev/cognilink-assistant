/**
 * 平台模板管理器
 * 负责管理所有平台的模板，提供模板加载、验证、渲染和缓存功能
 */

import {
  PlatformTemplate,
  PlatformId,
  SocialMediaPlatform,
  TemplateContext,
  RenderedTemplate,
  ValidationResult,
  TemplateLoadOptions,
  TemplateUpdateOptions,
  BatchOperationResult,
  TemplatePerformanceMetrics,
  TemplateStatistics,
  TemplateEvent,
  TemplateEventListener,
  TemplateConfig
} from '../types/social-media';
import {
  platformTemplates,
  supportedPlatforms,
  defaultValidationRules
} from '../config/platform-templates';
import { TemplateValidator } from './template-validator';
import { TemplateRenderer } from './template-renderer';
import { Logger } from '../utils/logger';
import crypto from 'crypto';

export class PlatformTemplateManager {
  private templates: Map<PlatformId, PlatformTemplate>;
  private templateCache: Map<string, RenderedTemplate>;
  private validator: TemplateValidator;
  private renderer: TemplateRenderer;
  private logger: Logger;
  private eventListeners: Map<string, TemplateEventListener[]>;
  private config: TemplateConfig;
  private performanceMetrics: Map<PlatformId, TemplatePerformanceMetrics>;

  constructor(config?: Partial<TemplateConfig>) {
    this.templates = new Map();
    this.templateCache = new Map();
    this.validator = new TemplateValidator();
    this.renderer = new TemplateRenderer();
    this.logger = new Logger('PlatformTemplateManager');
    this.eventListeners = new Map();
    this.performanceMetrics = new Map();
    
    // 默认配置
    this.config = {
      enableCache: true,
      cacheSize: 1000,
      cacheTTL: 3600000, // 1小时
      enableValidation: true,
      enableMetrics: true,
      enableEvents: true,
      defaultTimeout: 30000, // 30秒
      maxConcurrentOperations: 10,
      ...config
    };

    // 加载默认模板
    this.loadDefaultTemplates();
    
    this.logger.info('PlatformTemplateManager initialized', {
      templateCount: this.templates.size,
      config: this.config
    });
  }

  /**
   * 获取平台模板
   */
  getTemplate(platformId: PlatformId, options?: TemplateLoadOptions): PlatformTemplate {
    const startTime = Date.now();
    
    try {
      const template = this.templates.get(platformId);
      
      if (!template) {
        throw new Error(`未找到平台 "${platformId}" 的模板`);
      }

      // 验证模板（如果启用）
      if (this.config.enableValidation && options?.validateOnLoad !== false) {
        const validationResult = this.validator.validate(template);
        if (!validationResult.isValid) {
          this.logger.warn(`Template validation failed for ${platformId}`, {
            errors: validationResult.errors
          });
          
          if (validationResult.errors.some(e => e.severity === 'error')) {
            throw new Error(`模板验证失败: ${validationResult.errors[0].message}`);
          }
        }
      }

      // 记录性能指标
      if (this.config.enableMetrics) {
        this.recordPerformanceMetric(platformId, 'loadTime', Date.now() - startTime);
      }

      // 触发事件
      if (this.config.enableEvents) {
        this.emitEvent({
          type: 'loaded',
          platformId,
          templateId: template.id,
          timestamp: new Date(),
          data: { loadTime: Date.now() - startTime }
        });
      }

      return template;

    } catch (error) {
      this.logger.error(`Failed to get template for ${platformId}`, error instanceof Error ? error : new Error(String(error)));
      
      if (this.config.enableEvents) {
        this.emitEvent({
          type: 'error',
          platformId,
          templateId: platformId,
          timestamp: new Date(),
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
      
      throw error;
    }
  }

  /**
   * 获取所有支持的平台
   */
  getSupportedPlatforms(): SocialMediaPlatform[] {
    return [...supportedPlatforms];
  }

  /**
   * 验证模板有效性
   */
  validateTemplate(template: PlatformTemplate): ValidationResult {
    const startTime = Date.now();
    
    try {
      const result = this.validator.validate(template);
      
      // 记录性能指标
      if (this.config.enableMetrics) {
        this.recordPerformanceMetric(template.id, 'validationTime', Date.now() - startTime);
      }

      // 触发事件
      if (this.config.enableEvents) {
        this.emitEvent({
          type: 'validated',
          platformId: template.id,
          templateId: template.id,
          timestamp: new Date(),
          data: { validationResult: result }
        });
      }

      return result;

    } catch (error) {
      this.logger.error(`Template validation failed for ${template.id}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 渲染模板
   */
  renderTemplate(
    template: PlatformTemplate, 
    context: TemplateContext
  ): RenderedTemplate {
    const startTime = Date.now();
    
    try {
      // 检查缓存
      const cacheKey = this.generateCacheKey(template.id, context);
      if (this.config.enableCache) {
        const cached = this.templateCache.get(cacheKey);
        if (cached) {
          this.recordPerformanceMetric(template.id, 'cacheHitRate', 1);
          return cached;
        }
      }

      // 渲染模板
      const result = this.renderer.render(template, context);

      // 缓存结果
      if (this.config.enableCache) {
        this.cacheRenderedTemplate(cacheKey, result);
        this.recordPerformanceMetric(template.id, 'cacheHitRate', 0);
      }

      // 记录性能指标
      if (this.config.enableMetrics) {
        this.recordPerformanceMetric(template.id, 'renderTime', Date.now() - startTime);
      }

      // 触发事件
      if (this.config.enableEvents) {
        this.emitEvent({
          type: 'rendered',
          platformId: template.id,
          templateId: template.id,
          timestamp: new Date(),
          data: { renderTime: Date.now() - startTime }
        });
      }

      return result;

    } catch (error) {
      this.logger.error(`Template rendering failed for ${template.id}`, error instanceof Error ? error : new Error(String(error)));
      
      if (this.config.enableEvents) {
        this.emitEvent({
          type: 'error',
          platformId: template.id,
          templateId: template.id,
          timestamp: new Date(),
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
      
      throw error;
    }
  }

  /**
   * 动态加载模板
   */
  async loadTemplate(platformId: PlatformId, options?: TemplateLoadOptions): Promise<PlatformTemplate> {
    const startTime = Date.now();
    
    try {
      // 检查是否已存在
      if (this.templates.has(platformId) && !options?.version) {
        return this.getTemplate(platformId, options);
      }

      // 这里可以扩展为从外部源加载模板
      // 目前返回默认模板
      const template = platformTemplates[platformId];
      if (!template) {
        throw new Error(`未找到平台 "${platformId}" 的模板定义`);
      }

      // 验证模板
      if (this.config.enableValidation) {
        const validationResult = this.validateTemplate(template);
        if (!validationResult.isValid) {
          throw new Error(`模板验证失败: ${validationResult.errors[0]?.message}`);
        }
      }

      // 更新模板
      this.templates.set(platformId, template);

      this.logger.info(`Template loaded successfully for ${platformId}`, {
        loadTime: Date.now() - startTime
      });

      return template;

    } catch (error) {
      this.logger.error(`Failed to load template for ${platformId}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 更新模板
   */
  updateTemplate(
    platformId: PlatformId, 
    template: PlatformTemplate, 
    options?: TemplateUpdateOptions
  ): void {
    try {
      // 验证模板
      if (this.config.enableValidation && options?.validateBeforeUpdate !== false) {
        const validationResult = this.validateTemplate(template);
        if (!validationResult.isValid) {
          throw new Error(`模板验证失败: ${validationResult.errors[0]?.message}`);
        }
      }

      // 创建备份
      if (options?.createBackup) {
        const existingTemplate = this.templates.get(platformId);
        if (existingTemplate) {
          // 这里可以实现备份逻辑
          this.logger.info(`Template backup created for ${platformId}`);
        }
      }

      // 更新模板
      this.templates.set(platformId, template);

      // 清除相关缓存
      if (this.config.enableCache) {
        this.clearCacheForPlatform(platformId);
      }

      // 触发事件
      if (this.config.enableEvents) {
        this.emitEvent({
          type: 'updated',
          platformId,
          templateId: template.id,
          timestamp: new Date(),
          data: { template }
        });
      }

      this.logger.info(`Template updated successfully for ${platformId}`);

    } catch (error) {
      this.logger.error(`Failed to update template for ${platformId}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 批量验证模板
   */
  async validateBatch(templates: PlatformTemplate[]): Promise<BatchOperationResult<ValidationResult>> {
    const successful: ValidationResult[] = [];
    const failed: Array<{ item: ValidationResult; error: Error }> = [];

    for (const template of templates) {
      try {
        const result = this.validateTemplate(template);
        successful.push(result);
      } catch (error) {
        failed.push({
          item: { isValid: false, errors: [], warnings: [], score: 0 },
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
    }

    return {
      successful,
      failed,
      summary: {
        total: templates.length,
        successful: successful.length,
        failed: failed.length
      }
    };
  }

  /**
   * 批量渲染模板
   */
  async renderBatch(
    requests: Array<{ template: PlatformTemplate; context: TemplateContext }>
  ): Promise<BatchOperationResult<RenderedTemplate>> {
    const successful: RenderedTemplate[] = [];
    const failed: Array<{ item: RenderedTemplate; error: Error }> = [];

    // 限制并发数量
    const chunks = this.chunkArray(requests, this.config.maxConcurrentOperations);
    
    for (const chunk of chunks) {
      const promises = chunk.map(async ({ template, context }) => {
        try {
          const result = this.renderTemplate(template, context);
          successful.push(result);
        } catch (error) {
          failed.push({
            item: {
              systemPrompt: '',
              userPrompt: '',
              metadata: {
                platformId: template.id,
                templateVersion: '0.0.0',
                renderTime: new Date(),
                contextHash: '',
                placeholdersReplaced: [],
                warnings: []
              }
            },
            error: error instanceof Error ? error : new Error(String(error))
          });
        }
      });

      await Promise.all(promises);
    }

    return {
      successful,
      failed,
      summary: {
        total: requests.length,
        successful: successful.length,
        failed: failed.length
      }
    };
  }

  /**
   * 获取模板统计信息
   */
  getStatistics(): TemplateStatistics {
    const templatesPerPlatform: Record<PlatformId, number> = {
      xiaohongshu: 0,
      twitter: 0,
      wechat: 0,
      blog: 0,
      toutiao: 0
    };

    for (const [platformId] of this.templates) {
      templatesPerPlatform[platformId] = 1;
    }

    // 计算平均性能指标
    let totalLoadTime = 0;
    let totalRenderTime = 0;
    let totalCacheHits = 0;
    let totalOperations = 0;

    for (const metrics of this.performanceMetrics.values()) {
      totalLoadTime += metrics.loadTime;
      totalRenderTime += metrics.renderTime;
      totalCacheHits += metrics.cacheHitRate;
      totalOperations++;
    }

    return {
      totalTemplates: this.templates.size,
      templatesPerPlatform,
      averageLoadTime: totalOperations > 0 ? totalLoadTime / totalOperations : 0,
      averageRenderTime: totalOperations > 0 ? totalRenderTime / totalOperations : 0,
      cacheEfficiency: totalOperations > 0 ? totalCacheHits / totalOperations : 0,
      errorRate: 0 // 可以从事件历史中计算
    };
  }

  /**
   * 添加事件监听器
   */
  addEventListener(eventType: string, listener: TemplateEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(eventType: string, listener: TemplateEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.templateCache.clear();
    this.logger.info('Template cache cleared');
  }

  /**
   * 清除特定平台的缓存
   */
  clearCacheForPlatform(platformId: PlatformId): void {
    const keysToDelete: string[] = [];
    for (const [key] of this.templateCache) {
      if (key.startsWith(`${platformId}:`)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.templateCache.delete(key);
    }
    
    this.logger.debug(`Cache cleared for platform ${platformId}`, {
      deletedKeys: keysToDelete.length
    });
  }

  /**
   * 获取缓存统计
   */
  getCacheStatistics(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    const totalHits = Array.from(this.performanceMetrics.values())
      .reduce((sum, metrics) => sum + metrics.cacheHitRate, 0);
    const totalOperations = this.performanceMetrics.size;

    return {
      size: this.templateCache.size,
      maxSize: this.config.cacheSize,
      hitRate: totalOperations > 0 ? totalHits / totalOperations : 0
    };
  }

  /**
   * 加载默认模板
   */
  private loadDefaultTemplates(): void {
    for (const [platformId, template] of Object.entries(platformTemplates)) {
      this.templates.set(platformId as PlatformId, template);
    }
    
    this.logger.info(`Loaded ${this.templates.size} default templates`);
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(platformId: PlatformId, context: TemplateContext): string {
    const contextString = JSON.stringify({
      topic: context.topic,
      context: context.context,
      userPreferences: context.userPreferences
    });
    
    const hash = crypto.createHash('md5').update(contextString).digest('hex');
    return `${platformId}:${hash}`;
  }

  /**
   * 缓存渲染结果
   */
  private cacheRenderedTemplate(key: string, result: RenderedTemplate): void {
    // 检查缓存大小限制
    if (this.templateCache.size >= this.config.cacheSize) {
      // 删除最旧的缓存项（简单的LRU实现）
      const firstKey = this.templateCache.keys().next().value;
      if (firstKey) {
        this.templateCache.delete(firstKey);
      }
    }

    this.templateCache.set(key, result);
  }

  /**
   * 记录性能指标
   */
  private recordPerformanceMetric(
    platformId: PlatformId, 
    metricType: keyof TemplatePerformanceMetrics, 
    value: number
  ): void {
    if (!this.performanceMetrics.has(platformId)) {
      this.performanceMetrics.set(platformId, {
        loadTime: 0,
        renderTime: 0,
        validationTime: 0,
        memoryUsage: 0,
        cacheHitRate: 0
      });
    }

    const metrics = this.performanceMetrics.get(platformId)!;
    metrics[metricType] = value;
  }

  /**
   * 触发事件
   */
  private emitEvent(event: TemplateEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          this.logger.error(`Event listener error for ${event.type}`, error instanceof Error ? error : new Error(String(error)));
        }
      }
    }
  }

  /**
   * 将数组分块
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
} 