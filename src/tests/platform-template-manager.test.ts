/**
 * 平台模板管理器测试套件
 * 测试模板加载、验证、渲染和缓存功能
 */

import { PlatformTemplateManager } from '../services/platform-template-manager';
import { TemplateValidator } from '../services/template-validator';
import { TemplateRenderer } from '../services/template-renderer';
import {
  PlatformTemplate,
  PlatformId,
  TemplateContext,
  ValidationResult,
  RenderedTemplate
} from '../types/social-media';
import {
  xiaohongshuTemplate,
  twitterTemplate,
  wechatTemplate,
  blogTemplate,
  toutiaoTemplate
} from '../config/platform-templates';

describe('PlatformTemplateManager', () => {
  let templateManager: PlatformTemplateManager;
  let mockContext: TemplateContext;

  beforeEach(() => {
    templateManager = new PlatformTemplateManager({
      enableCache: true,
      enableValidation: true,
      enableMetrics: true,
      enableEvents: false // 禁用事件以简化测试
    });

    mockContext = {
      topic: '测试主题',
      context: '这是一个测试上下文，包含了相关的内容信息。',
      userPreferences: {
        tone: 'casual',
        length: 'medium',
        style: 'moderate'
      }
    };
  });

  afterEach(() => {
    templateManager.clearCache();
  });

  describe('Template Loading', () => {
    test('should load all default templates', () => {
      const supportedPlatforms = templateManager.getSupportedPlatforms();
      expect(supportedPlatforms).toHaveLength(5);
      
      const platformIds: PlatformId[] = ['xiaohongshu', 'twitter', 'wechat', 'blog', 'toutiao'];
      for (const platformId of platformIds) {
        expect(() => templateManager.getTemplate(platformId)).not.toThrow();
      }
    });

    test('should get template for valid platform', () => {
      const template = templateManager.getTemplate('xiaohongshu');
      expect(template).toBeDefined();
      expect(template.id).toBe('xiaohongshu');
      expect(template.name).toBe('小红书');
      expect(template.systemPrompt).toBeTruthy();
      expect(template.userTemplate).toBeTruthy();
    });

    test('should throw error for invalid platform', () => {
      expect(() => {
        templateManager.getTemplate('invalid' as PlatformId);
      }).toThrow('未找到平台');
    });

    test('should load template dynamically', async () => {
      const template = await templateManager.loadTemplate('twitter');
      expect(template).toBeDefined();
      expect(template.id).toBe('twitter');
    });
  });

  describe('Template Validation', () => {
    test('should validate xiaohongshu template correctly', () => {
      const result = templateManager.validateTemplate(xiaohongshuTemplate);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
    });

    test('should validate twitter template correctly', () => {
      const result = templateManager.validateTemplate(twitterTemplate);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
    });

    test('should validate wechat template correctly', () => {
      const result = templateManager.validateTemplate(wechatTemplate);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
    });

    test('should validate blog template correctly', () => {
      const result = templateManager.validateTemplate(blogTemplate);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
    });

    test('should validate toutiao template correctly', () => {
      const result = templateManager.validateTemplate(toutiaoTemplate);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
    });

    test('should detect invalid template', () => {
      const invalidTemplate: PlatformTemplate = {
        ...xiaohongshuTemplate,
        systemPrompt: '', // 空的系统提示
        userTemplate: 'Invalid template without placeholders'
      };

      const result = templateManager.validateTemplate(invalidTemplate);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate batch templates', async () => {
      const templates = [xiaohongshuTemplate, twitterTemplate, wechatTemplate];
      const results = await templateManager.validateBatch(templates);
      
      expect(results.successful).toHaveLength(3);
      expect(results.failed).toHaveLength(0);
      expect(results.summary.total).toBe(3);
    });
  });

  describe('Template Rendering', () => {
    test('should render xiaohongshu template', () => {
      const template = templateManager.getTemplate('xiaohongshu');
      const result = templateManager.renderTemplate(template, mockContext);
      
      expect(result).toBeDefined();
      expect(result.systemPrompt).toBeTruthy();
      expect(result.userPrompt).toBeTruthy();
      expect(result.userPrompt).toContain(mockContext.topic);
      expect(result.userPrompt).toContain(mockContext.context);
      expect(result.metadata.platformId).toBe('xiaohongshu');
    });

    test('should render twitter template', () => {
      const template = templateManager.getTemplate('twitter');
      const result = templateManager.renderTemplate(template, mockContext);
      
      expect(result).toBeDefined();
      expect(result.userPrompt).toContain(mockContext.topic);
      expect(result.metadata.platformId).toBe('twitter');
    });

    test('should render wechat template', () => {
      const template = templateManager.getTemplate('wechat');
      const result = templateManager.renderTemplate(template, mockContext);
      
      expect(result).toBeDefined();
      expect(result.userPrompt).toContain(mockContext.topic);
      expect(result.metadata.platformId).toBe('wechat');
    });

    test('should render blog template', () => {
      const template = templateManager.getTemplate('blog');
      const result = templateManager.renderTemplate(template, mockContext);
      
      expect(result).toBeDefined();
      expect(result.userPrompt).toContain(mockContext.topic);
      expect(result.metadata.platformId).toBe('blog');
    });

    test('should render toutiao template', () => {
      const template = templateManager.getTemplate('toutiao');
      const result = templateManager.renderTemplate(template, mockContext);
      
      expect(result).toBeDefined();
      expect(result.userPrompt).toContain(mockContext.topic);
      expect(result.metadata.platformId).toBe('toutiao');
    });

    test('should handle missing context gracefully', () => {
      const template = templateManager.getTemplate('xiaohongshu');
      const invalidContext: TemplateContext = {
        topic: '',
        context: ''
      };

      expect(() => {
        templateManager.renderTemplate(template, invalidContext);
      }).toThrow();
    });

    test('should render batch templates', async () => {
      const requests = [
        { template: xiaohongshuTemplate, context: mockContext },
        { template: twitterTemplate, context: mockContext }
      ];

      const results = await templateManager.renderBatch(requests);
      expect(results.successful).toHaveLength(2);
      expect(results.failed).toHaveLength(0);
    });
  });

  describe('Template Caching', () => {
    test('should cache rendered templates', () => {
      const template = templateManager.getTemplate('xiaohongshu');
      
      // 第一次渲染
      const result1 = templateManager.renderTemplate(template, mockContext);
      
      // 第二次渲染应该从缓存获取
      const result2 = templateManager.renderTemplate(template, mockContext);
      
      expect(result1).toEqual(result2);
    });

    test('should clear cache', () => {
      const template = templateManager.getTemplate('xiaohongshu');
      templateManager.renderTemplate(template, mockContext);
      
      const statsBefore = templateManager.getCacheStatistics();
      expect(statsBefore.size).toBeGreaterThan(0);
      
      templateManager.clearCache();
      
      const statsAfter = templateManager.getCacheStatistics();
      expect(statsAfter.size).toBe(0);
    });

    test('should clear cache for specific platform', () => {
      const xiaohongshuTemplate = templateManager.getTemplate('xiaohongshu');
      const twitterTemplate = templateManager.getTemplate('twitter');
      
      templateManager.renderTemplate(xiaohongshuTemplate, mockContext);
      templateManager.renderTemplate(twitterTemplate, mockContext);
      
      templateManager.clearCacheForPlatform('xiaohongshu');
      
      const stats = templateManager.getCacheStatistics();
      expect(stats.size).toBe(1); // 只剩下twitter的缓存
    });

    test('should get cache statistics', () => {
      const template = templateManager.getTemplate('xiaohongshu');
      templateManager.renderTemplate(template, mockContext);
      
      const stats = templateManager.getCacheStatistics();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.maxSize).toBe(1000); // 默认配置
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Template Management', () => {
    test('should update template', () => {
      const originalTemplate = templateManager.getTemplate('xiaohongshu');
      const updatedTemplate: PlatformTemplate = {
        ...originalTemplate,
        systemPrompt: '更新后的系统提示，这是一个足够长的系统提示，用于满足验证要求。它包含了详细的指导信息，帮助AI理解如何为小红书平台创建内容。这个提示应该包含平台特色、用户群体、内容风格等重要信息，确保生成的内容符合平台要求和用户期望。'
      };

      templateManager.updateTemplate('xiaohongshu', updatedTemplate);
      
      const retrievedTemplate = templateManager.getTemplate('xiaohongshu');
      expect(retrievedTemplate.systemPrompt).toBe(updatedTemplate.systemPrompt);
    });

    test('should get supported platforms', () => {
      const platforms = templateManager.getSupportedPlatforms();
      expect(platforms).toHaveLength(5);
      
      const platformIds = platforms.map(p => p.id);
      expect(platformIds).toContain('xiaohongshu');
      expect(platformIds).toContain('twitter');
      expect(platformIds).toContain('wechat');
      expect(platformIds).toContain('blog');
      expect(platformIds).toContain('toutiao');
    });

    test('should get template statistics', () => {
      // 执行一些操作以生成统计数据
      const template = templateManager.getTemplate('xiaohongshu');
      templateManager.renderTemplate(template, mockContext);
      
      const stats = templateManager.getStatistics();
      expect(stats.totalTemplates).toBe(5);
      expect(stats.templatesPerPlatform.xiaohongshu).toBe(1);
      expect(stats.averageLoadTime).toBeGreaterThanOrEqual(0);
      expect(stats.averageRenderTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle template validation errors', () => {
      const invalidTemplate: PlatformTemplate = {
        id: 'xiaohongshu',
        name: '小红书',
        maxLength: 300,
        systemPrompt: '', // 无效的空提示
        userTemplate: '',
        styleKeywords: [],
        requiredElements: [],
        formatRules: {}
      };

      expect(() => {
        templateManager.validateTemplate(invalidTemplate);
      }).not.toThrow(); // 验证不应该抛出异常，而是返回验证结果
      
      const result = templateManager.validateTemplate(invalidTemplate);
      expect(result.isValid).toBe(false);
    });

    test('should handle rendering errors gracefully', () => {
      const template = templateManager.getTemplate('xiaohongshu');
      const invalidContext: TemplateContext = {
        topic: '',
        context: ''
      };

      expect(() => {
        templateManager.renderTemplate(template, invalidContext);
      }).toThrow();
    });

    test('should handle batch operation errors', async () => {
      const validRequest = { template: xiaohongshuTemplate, context: mockContext };
      const invalidRequest = { 
        template: xiaohongshuTemplate, 
        context: { topic: '', context: '' } // 无效的上下文，会导致渲染失败
      };

      const requests = [validRequest, invalidRequest];

      const results = await templateManager.renderBatch(requests);
      expect(results.successful.length).toBe(1); // 一个成功
      expect(results.failed.length).toBe(1); // 一个失败
      expect(results.summary.total).toBe(2);
    });
  });

  describe('Performance', () => {
    test('should render template within acceptable time', () => {
      const template = templateManager.getTemplate('xiaohongshu');
      
      const startTime = Date.now();
      templateManager.renderTemplate(template, mockContext);
      const endTime = Date.now();
      
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(100); // 应该在100ms内完成
    });

    test('should handle concurrent rendering', async () => {
      const template = templateManager.getTemplate('xiaohongshu');
      
      const promises = Array.from({ length: 10 }, (_, i) => {
        const context = {
          ...mockContext,
          topic: `测试主题 ${i}`
        };
        return Promise.resolve(templateManager.renderTemplate(template, context));
      });

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.systemPrompt).toBeTruthy();
        expect(result.userPrompt).toBeTruthy();
      });
    });

    test('should maintain cache efficiency', () => {
      const template = templateManager.getTemplate('xiaohongshu');
      
      // 多次渲染相同内容
      for (let i = 0; i < 5; i++) {
        templateManager.renderTemplate(template, mockContext);
      }
      
      const stats = templateManager.getCacheStatistics();
      expect(stats.size).toBe(1); // 应该只有一个缓存项
    });
  });

  describe('Integration Tests', () => {
    test('should work with all components together', () => {
      // 获取模板
      const template = templateManager.getTemplate('xiaohongshu');
      expect(template).toBeDefined();
      
      // 验证模板
      const validationResult = templateManager.validateTemplate(template);
      expect(validationResult.isValid).toBe(true);
      
      // 渲染模板
      const renderResult = templateManager.renderTemplate(template, mockContext);
      expect(renderResult).toBeDefined();
      expect(renderResult.userPrompt).toContain(mockContext.topic);
      
      // 检查缓存
      const cacheStats = templateManager.getCacheStatistics();
      expect(cacheStats.size).toBeGreaterThan(0);
      
      // 获取统计信息
      const stats = templateManager.getStatistics();
      expect(stats.totalTemplates).toBe(5);
    });

    test('should handle complete workflow for all platforms', () => {
      const platformIds: PlatformId[] = ['xiaohongshu', 'twitter', 'wechat', 'blog', 'toutiao'];
      
      for (const platformId of platformIds) {
        // 获取模板
        const template = templateManager.getTemplate(platformId);
        expect(template.id).toBe(platformId);
        
        // 验证模板
        const validationResult = templateManager.validateTemplate(template);
        expect(validationResult.isValid).toBe(true);
        
        // 渲染模板
        const renderResult = templateManager.renderTemplate(template, mockContext);
        expect(renderResult.metadata.platformId).toBe(platformId);
        expect(renderResult.userPrompt).toContain(mockContext.topic);
      }
    });
  });
});

describe('TemplateValidator', () => {
  let validator: TemplateValidator;

  beforeEach(() => {
    validator = new TemplateValidator();
  });

  test('should validate template syntax correctly', () => {
    const result = validator.validate(xiaohongshuTemplate);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should detect missing required fields', () => {
    const invalidTemplate: PlatformTemplate = {
      ...xiaohongshuTemplate,
      systemPrompt: ''
    };

    const result = validator.validate(invalidTemplate);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'systemPrompt')).toBe(true);
  });
});

describe('TemplateRenderer', () => {
  let renderer: TemplateRenderer;
  let mockContext: TemplateContext;

  beforeEach(() => {
    renderer = new TemplateRenderer();
    mockContext = {
      topic: '测试主题',
      context: '这是一个测试上下文，包含了相关的内容信息。',
      userPreferences: {
        tone: 'casual',
        length: 'medium',
        style: 'moderate'
      }
    };
  });

  test('should render template with context', () => {
    const result = renderer.render(xiaohongshuTemplate, mockContext);
    expect(result.systemPrompt).toBeTruthy();
    expect(result.userPrompt).toContain(mockContext.topic);
    expect(result.userPrompt).toContain(mockContext.context);
  });

  test('should validate template syntax', () => {
    const syntaxResult = renderer.validateTemplateSyntax(xiaohongshuTemplate);
    expect(syntaxResult.isValid).toBe(true);
    expect(syntaxResult.errors).toHaveLength(0);
  });

  test('should preview render without executing', () => {
    const preview = renderer.previewRender(xiaohongshuTemplate, mockContext);
    expect(preview.placeholders).toContain('topic');
    expect(preview.placeholders).toContain('context');
    expect(preview.missingPlaceholders).toHaveLength(0);
    expect(preview.estimatedLength).toBeGreaterThan(0);
  });
}); 