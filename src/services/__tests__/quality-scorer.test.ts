/**
 * TOM-109: 质量评分器测试
 * 测试质量评分器的各项功能
 */

import { QualityScorer } from '../quality-scorer';
import {
  QualityScore,
  OriginalityResult,
  ReadabilityScore,
  EngagementPrediction
} from '../../types/content-processing';
import { SocialMediaPlatform, PlatformId } from '../../types/social-media';

describe('QualityScorer', () => {
  let scorer: QualityScorer;

  beforeEach(() => {
    scorer = new QualityScorer();
  });

  describe('calculateQualityScore', () => {
    const mockPlatform: SocialMediaPlatform = {
      id: 'xiaohongshu' as PlatformId,
      name: '小红书',
      maxLength: 1000,
      styleKeywords: ['姐妹们', '绝绝子', '种草', '好用'],
      requiredElements: ['emoji', 'hashtag'],
      formatRules: {
        emojiDensity: 'high',
        hashtagStyle: 'integrated',
        interactionPrompt: true
      },
      features: ['images', 'hashtags', 'emoji']
    };

    it('应该计算内容质量评分', () => {
      const content = '这是一篇关于人工智能发展的文章，内容详实，逻辑清晰，具有很强的实用性。AI技术正在改变我们的生活方式，从智能手机到自动驾驶汽车，无处不在。';
      
      const result = scorer.calculateQualityScore(content, mockPlatform);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
      expect(result.originality).toBeGreaterThanOrEqual(0);
      expect(result.originality).toBeLessThanOrEqual(100);
      expect(result.readability).toBeGreaterThanOrEqual(0);
      expect(result.readability).toBeLessThanOrEqual(100);
      expect(result.engagement).toBeGreaterThanOrEqual(0);
      expect(result.engagement).toBeLessThanOrEqual(100);
      expect(result.platformOptimization).toBeGreaterThanOrEqual(0);
      expect(result.platformOptimization).toBeLessThanOrEqual(100);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('应该包含详细的评分分解', () => {
      const content = '测试内容，包含多个句子。这是第二个句子。第三个句子用来测试。';
      
      const result = scorer.calculateQualityScore(content, mockPlatform);

      expect(result.breakdown).toBeDefined();
      expect(typeof result.breakdown.contentStructure).toBe('number');
      expect(typeof result.breakdown.languageQuality).toBe('number');
      expect(typeof result.breakdown.platformAlignment).toBe('number');
      expect(typeof result.breakdown.userEngagement).toBe('number');
      expect(typeof result.breakdown.technicalQuality).toBe('number');
    });

    it('应该处理空内容', () => {
      const result = scorer.calculateQualityScore('', mockPlatform);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeGreaterThanOrEqual(0); // 空内容的置信度可以是0
    });

    it('应该处理短内容', () => {
      const result = scorer.calculateQualityScore('短内容', mockPlatform);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });

    it('应该处理长内容', () => {
      const longContent = '这是一个很长的内容。'.repeat(100);
      const result = scorer.calculateQualityScore(longContent, mockPlatform);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });
  });

  describe('checkOriginality', () => {
    it('应该检测原创内容', () => {
      const content = '这是一篇完全原创的文章，讨论了人工智能在医疗领域的应用。机器学习算法可以帮助医生更准确地诊断疾病。';
      
      const result = scorer.checkOriginality(content);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.duplicateSegments).toBeInstanceOf(Array);
      expect(typeof result.uniquenessRatio).toBe('number');
      expect(result.uniquenessRatio).toBeGreaterThanOrEqual(0);
      expect(result.uniquenessRatio).toBeLessThanOrEqual(1);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('应该检测重复内容', () => {
      const content = '这是一个重复的长句子用于测试。这是一个重复的长句子用于测试。这是一个不同的句子。';
      
      const result = scorer.checkOriginality(content);

      expect(result.duplicateSegments.length).toBeGreaterThan(0);
      expect(result.uniquenessRatio).toBeLessThan(1);
      expect(result.score).toBeLessThan(100);
    });

    it('应该检测常见短语', () => {
      const content = '众所周知，据说人工智能很重要。有人说这是未来的趋势。';
      
      const result = scorer.checkOriginality(content);

      expect(result.score).toBeLessThan(100); // 应该因为常见短语被扣分
    });

    it('应该处理空内容', () => {
      const result = scorer.checkOriginality('');

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.duplicateSegments).toEqual([]);
    });
  });

  describe('assessReadability', () => {
    it('应该评估可读性', () => {
      const content = '这是一个测试文章。文章包含多个句子，用来测试可读性评估功能。每个句子的长度都比较适中，便于阅读理解。';
      
      const result = scorer.assessReadability(content);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(['elementary', 'middle', 'high', 'college', 'graduate']).toContain(result.level);
      expect(result.factors).toBeDefined();
      expect(typeof result.factors.sentenceLength).toBe('number');
      expect(typeof result.factors.wordComplexity).toBe('number');
      expect(typeof result.factors.paragraphStructure).toBe('number');
      expect(typeof result.factors.vocabularyDiversity).toBe('number');
    });

    it('应该处理长句子', () => {
      const content = '这是一个非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的句子，用来测试长句子对可读性评分的影响。';
      
      const result = scorer.assessReadability(content);

      expect(result.score).toBeLessThan(100); // 长句子应该降低可读性评分
    });

    it('应该处理短句子', () => {
      const content = '短句。很短。非常短。';
      
      const result = scorer.assessReadability(content);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('应该处理复杂词汇', () => {
      const content = '这篇文章包含一些复杂的专业术语和技术词汇，可能会影响普通读者的理解。';
      
      const result = scorer.assessReadability(content);

      expect(result).toBeDefined();
      expect(result.factors.wordComplexity).toBeGreaterThan(0);
    });
  });

  describe('predictEngagement', () => {
    const mockPlatform: SocialMediaPlatform = {
      id: 'xiaohongshu' as PlatformId,
      name: '小红书',
      maxLength: 1000,
      styleKeywords: ['姐妹们', '绝绝子', '种草', '好用'],
      requiredElements: ['emoji', 'hashtag'],
      formatRules: {
        emojiDensity: 'high',
        hashtagStyle: 'integrated',
        interactionPrompt: true
      },
      features: ['images', 'hashtags', 'emoji']
    };

    it('应该预测参与度', () => {
      const content = '姐妹们！这个产品真的太好用了！强烈推荐给大家 ✨ #好物推荐 #种草';
      
      const result = scorer.predictEngagement(content, mockPlatform);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.factors).toBeDefined();
      expect(typeof result.factors.emotionalAppeal).toBe('number');
      expect(typeof result.factors.interactivity).toBe('number');
      expect(typeof result.factors.relevance).toBe('number');
      expect(typeof result.factors.timing).toBe('number');
      expect(typeof result.factors.visualElements).toBe('number');
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('应该识别情感元素', () => {
      const emotionalContent = '太棒了！我爱这个产品！真的很开心！😍❤️';
      
      const result = scorer.predictEngagement(emotionalContent, mockPlatform);

      expect(result.factors.emotionalAppeal).toBeGreaterThan(0.5);
    });

    it('应该识别互动元素', () => {
      const interactiveContent = '你们觉得怎么样？请在评论区告诉我！大家有什么推荐吗？';
      
      const result = scorer.predictEngagement(interactiveContent, mockPlatform);

      expect(result.factors.interactivity).toBeGreaterThan(0.5);
    });

    it('应该识别平台相关性', () => {
      const relevantContent = '姐妹们，这个好物必须种草！绝绝子！';
      
      const result = scorer.predictEngagement(relevantContent, mockPlatform);

      expect(result.factors.relevance).toBeGreaterThan(0.5);
    });

    it('应该识别视觉元素', () => {
      const visualContent = '看图！📸 这个颜值真的很高 ✨🌟💫';
      
      const result = scorer.predictEngagement(visualContent, mockPlatform);

      expect(result.factors.visualElements).toBeGreaterThan(0.5);
    });
  });

  describe('platformOptimization', () => {
    it('应该评估小红书优化', () => {
      const platform: SocialMediaPlatform = {
        id: 'xiaohongshu' as PlatformId,
        name: '小红书',
        maxLength: 1000,
        styleKeywords: ['生活方式', '分享', '种草'],
        requiredElements: ['emoji', 'hashtags'],
        formatRules: {
          emojiDensity: 'high',
          hashtagStyle: 'integrated',
          interactionPrompt: true
        },
        features: ['images', 'hashtags', 'emoji']
      };

      const content = '姐妹们！这个产品真的绝绝子 ✨ #好物推荐';
      const result = scorer.calculateQualityScore(content, platform);

      expect(result.platformOptimization).toBeGreaterThan(50);
    });

    it('应该评估Twitter优化', () => {
      const platform: SocialMediaPlatform = {
        id: 'twitter' as PlatformId,
        name: 'Twitter',
        maxLength: 280,
        styleKeywords: ['简洁', '观点', '讨论'],
        requiredElements: ['hashtags'],
        formatRules: {
          characterLimit: 280,
          hashtagStyle: 'separate',
          emojiDensity: 'medium'
        },
        features: ['hashtags', 'mentions']
      };

      const content = '分享一个有趣的观点：人工智能的发展将改变我们的工作方式 #AI #技术';
      const result = scorer.calculateQualityScore(content, platform);

      expect(result.platformOptimization).toBeGreaterThan(0);
    });

    it('应该评估微信公众号优化', () => {
      const platform: SocialMediaPlatform = {
        id: 'wechat' as PlatformId,
        name: '微信公众号',
        maxLength: 5000,
        styleKeywords: ['专业', '深度', '分析'],
        requiredElements: ['heading', 'structure'],
        formatRules: {
          structureRequired: true,
          headingLevels: { min: 2, max: 4 },
          professionalTone: true,
          emojiDensity: 'low'
        },
        features: ['longform', 'images']
      };

      const content = `
# 人工智能发展趋势分析

## 引言
人工智能技术在近年来取得了显著进展...

## 主要发展方向
1. 机器学习算法优化
2. 深度学习应用扩展
3. 自然语言处理突破

## 结论
综合分析表明，人工智能将在未来十年内...
      `;
      
      const result = scorer.calculateQualityScore(content, platform);

      expect(result.platformOptimization).toBeGreaterThan(0);
    });
  });

  describe('边界情况和错误处理', () => {
    const mockPlatform: SocialMediaPlatform = {
      id: 'xiaohongshu' as PlatformId,
      name: '小红书',
      maxLength: 1000,
      styleKeywords: ['生活方式', '分享', '种草'],
      requiredElements: ['emoji', 'hashtags'],
      formatRules: {
        emojiDensity: 'high',
        hashtagStyle: 'integrated',
        interactionPrompt: true
      },
      features: ['images', 'hashtags', 'emoji']
    };

    it('应该处理null内容', () => {
      expect(() => {
        scorer.calculateQualityScore(null as any, mockPlatform);
      }).not.toThrow();
    });

    it('应该处理undefined内容', () => {
      expect(() => {
        scorer.calculateQualityScore(undefined as any, mockPlatform);
      }).not.toThrow();
    });

    it('应该处理特殊字符', () => {
      const content = '这是包含特殊字符的内容：@#$%^&*()_+{}|:"<>?[]\\;\',./ 测试';
      const result = scorer.calculateQualityScore(content, mockPlatform);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });

    it('应该处理纯数字内容', () => {
      const content = '123456789 0987654321 111 222 333';
      const result = scorer.calculateQualityScore(content, mockPlatform);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });

    it('应该处理纯符号内容', () => {
      const content = '!@#$%^&*()_+ 😀😁😂🤣😃😄😅😆';
      const result = scorer.calculateQualityScore(content, mockPlatform);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });
  });

  describe('性能测试', () => {
    const mockPlatform: SocialMediaPlatform = {
      id: 'xiaohongshu' as PlatformId,
      name: '小红书',
      maxLength: 1000,
      styleKeywords: ['生活方式', '分享', '种草'],
      requiredElements: ['emoji', 'hashtags'],
      formatRules: {
        emojiDensity: 'high',
        hashtagStyle: 'integrated',
        interactionPrompt: true
      },
      features: ['images', 'hashtags', 'emoji']
    };

    it('应该在合理时间内完成评分', () => {
      const content = '这是一个测试内容，用来验证评分器的性能。'.repeat(10);
      
      const startTime = Date.now();
      scorer.calculateQualityScore(content, mockPlatform);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // 1秒内完成
    });

    it('应该在合理时间内处理长内容', () => {
      const content = '这是一个很长的测试内容。'.repeat(100);
      
      const startTime = Date.now();
      scorer.calculateQualityScore(content, mockPlatform);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // 2秒内完成
    });
  });
}); 