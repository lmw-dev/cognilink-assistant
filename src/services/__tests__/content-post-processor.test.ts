import { ContentPostProcessor } from '../content-post-processor';
import { SocialMediaPlatform } from '../../types/social-media';

describe('ContentPostProcessor', () => {
  let processor: ContentPostProcessor;
  let mockPlatform: SocialMediaPlatform;

  beforeEach(() => {
    processor = new ContentPostProcessor();
    mockPlatform = {
      id: 'xiaohongshu',
      name: '小红书',
      maxLength: 300,
      styleKeywords: ['姐妹们', '宝子们', '绝绝子', 'yyds', '种草'],
      requiredElements: ['表情符号', '互动问题', '亲切称呼'],
      formatRules: {
        paragraphBreak: '\n\n',
        emojiDensity: 'high',
        hashtagStyle: '#话题#',
        interactionPrompt: true,
        emojiPlacement: 'distributed',
        interactionPlacement: 'end'
      }
    };
  });

  describe('processContent', () => {
    it('should process content successfully', async () => {
      const content = '今天分享一个超好用的护肤品！姐妹们一定要试试这个面霜，用了一周皮肤变得水嫩嫩的✨ 你们有什么好用的护肤品推荐吗？';
      
      const result = await processor.processContent(content, mockPlatform);
      
      expect(result).toBeDefined();
      expect(result.originalContent).toBe(content);
      expect(result.processedContent).toBeDefined();
      expect(result.platform).toBe(mockPlatform);
      expect(result.isValid).toBe(true);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle long content with truncation', async () => {
      const longContent = '这是一个非常长的内容，'.repeat(50) + '需要被截断以符合平台要求。';
      
      const result = await processor.processContent(longContent, mockPlatform, {
        strictMode: false,
        autoFix: true,
        preserveOriginal: true
      });
      
      expect(result.processedContent.length).toBeLessThanOrEqual(mockPlatform.maxLength);
      expect(result.suggestions.some(s => s.message.includes('截断'))).toBe(true);
    });

    it('should assess content quality', async () => {
      const content = '今天天气真好😊 大家都在做什么呢？分享一下你们的日常吧！';
      
      const result = await processor.processContent(content, mockPlatform);
      
      expect(result.qualityScore).toBeDefined();
      expect(result.qualityScore.overall).toBeGreaterThan(0);
      expect(result.qualityScore.overall).toBeLessThanOrEqual(100);
      expect(result.qualityScore.engagement).toBeGreaterThan(0);
    });

    it('should provide style assessment', async () => {
      const content = '分享一个学习方法，希望对大家有帮助。';
      
      const result = await processor.processContent(content, mockPlatform);
      
      expect(result.styleAssessment).toBeDefined();
      expect(result.styleAssessment.overallScore).toBeGreaterThan(0);
      expect(result.styleAssessment.platformFit).toBeGreaterThan(0);
    });

    it('should format content according to platform rules', async () => {
      const content = '这是一个测试内容\n\n需要格式化处理';
      
      const result = await processor.processContent(content, mockPlatform);
      
      expect(result.formatResult).toBeDefined();
      expect(result.formatResult.content).toBeDefined();
      expect(result.formatResult.metadata.appliedRules.length).toBeGreaterThan(0);
    });
  });

  describe('validateContent', () => {
    it('should validate content successfully', () => {
      const content = '这是一个符合要求的内容，长度适中，包含互动元素？姐妹们觉得怎么样呢？今天分享一个超好用的护肤品！用了一周皮肤变得水嫩嫩的✨ 你们有什么好用的护肤品推荐吗？大家一起来讨论一下吧！';
      
      const result = processor.validateContent(content, mockPlatform);
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
    });

    it('should detect length violations', () => {
      const shortContent = '太短';
      
      const result = processor.validateContent(shortContent, mockPlatform);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'length')).toBe(true);
    });
  });

  describe('batchProcess', () => {
    it('should process multiple contents', async () => {
      const contents = [
        {
          id: '1',
          content: '第一个测试内容😊',
          platform: mockPlatform
        },
        {
          id: '2', 
          content: '第二个测试内容，包含更多信息和互动问题？',
          platform: mockPlatform
        }
      ];
      
      const result = await processor.batchProcess(contents);
      
      expect(result.totalProcessed).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results.length).toBe(2);
    });
  });

  describe('cache functionality', () => {
    it('should cache and reuse results', async () => {
      const content = '缓存测试内容';
      
      // 第一次处理
      const result1 = await processor.processContent(content, mockPlatform);
      
      // 第二次处理应该使用缓存
      const result2 = await processor.processContent(content, mockPlatform);
      
      expect(result1.processedContent).toBe(result2.processedContent);
      expect(result1.processingTime).toBeGreaterThan(0);
    });

    it('should clear cache', () => {
      processor.clearCache();
      const stats = processor.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        enableLengthProcessing: false,
        enableStyleAssessment: true
      };
      
      processor.updateConfig(newConfig);
      
      // 配置更新应该不抛出错误
      expect(() => processor.updateConfig(newConfig)).not.toThrow();
    });
  });
}); 