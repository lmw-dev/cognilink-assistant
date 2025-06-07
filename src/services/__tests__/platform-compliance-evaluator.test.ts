/**
 * TOM-111: 平台适配度评估器单元测试
 */

import { PlatformComplianceEvaluator } from '../platform-compliance-evaluator';
import { SocialMediaPlatform, PlatformId } from '../../types/social-media';
import { ComplianceEvaluationOptions } from '../../types/quality-assessment';

describe('PlatformComplianceEvaluator', () => {
  let evaluator: PlatformComplianceEvaluator;

  const mockPlatforms: Record<PlatformId, SocialMediaPlatform> = {
    xiaohongshu: {
      id: 'xiaohongshu',
      name: '小红书',
      maxLength: 1000,
      styleKeywords: ['分享', '种草', '好物'],
      requiredElements: ['emoji', 'hashtag'],
      formatRules: {
        emojiDensity: 'medium',
        hashtagCount: { min: 3, max: 10 },
        interactionPrompt: true
      },
      features: ['hashtags', 'images', 'emoji']
    },
    twitter: {
      id: 'twitter',
      name: 'Twitter',
      maxLength: 280,
      styleKeywords: ['简洁', '快速'],
      requiredElements: ['brevity'],
              formatRules: {
          characterLimit: 280,
          hashtagCount: { min: 0, max: 3 },
          mentionStyle: '@username'
        },
      features: ['hashtags', 'mentions', 'retweets']
    },
    wechat: {
      id: 'wechat',
      name: '微信公众号',
      maxLength: 10000,
      styleKeywords: ['专业', '深度', '分析'],
      requiredElements: ['structure', 'examples'],
      formatRules: {
        structureRequired: true,
        professionalTone: true,
        headingHierarchy: true
      },
      features: ['rich_text', 'images', 'links']
    },
    blog: {
      id: 'blog',
      name: '个人博客',
      maxLength: 50000,
      styleKeywords: ['技术', '深度', '原创'],
      requiredElements: ['code', 'references'],
      formatRules: {
        codeBlockSupport: true,
        seoOptimized: true,
        referenceSection: true
      },
      features: ['markdown', 'code', 'images', 'links']
    },
    toutiao: {
      id: 'toutiao',
      name: '头条号',
      maxLength: 5000,
      styleKeywords: ['吸引', '热门', '讨论'],
      requiredElements: ['title', 'discussion'],
      formatRules: {
        titleOptimization: true,
        discussionPrompt: true,
        popularLanguage: true
      },
      features: ['rich_text', 'images', 'videos']
    },
    zhihu: {
      id: 'zhihu',
      name: '知乎',
      maxLength: 50000,
      styleKeywords: ['谢邀', '专业', '深度', '分析'],
      requiredElements: ['structure', 'references', 'data'],
      formatRules: {
        professionalTone: true,
        dataSupport: true,
        referenceSection: true,
        headingHierarchy: true
      },
      features: ['markdown', 'rich_text', 'images', 'links', 'code']
    },
    douyin: {
      id: 'douyin',
      name: '抖音',
      maxLength: 150,
      styleKeywords: ['热门', '挑战', '创意', 'BGM'],
      requiredElements: ['video_script', 'music_suggestion', 'interaction_hook'],
      formatRules: {
        characterLimit: 150,
        emojiDensity: 'medium',
        interactionPrompt: true,
        hashtagCount: {min: 1, max: 5}
      },
      features: ['short_video', 'music', 'effects', 'hashtags', 'live']
    },
    linkedin: {
      id: 'linkedin',
      name: 'LinkedIn',
      maxLength: 10000,
      styleKeywords: ['专业', '深度', '分析'],
      requiredElements: ['structure', 'references', 'data'],
      formatRules: {
        professionalTone: true,
        dataSupport: true,
        referenceSection: true,
        headingHierarchy: true
      },
      features: ['markdown', 'rich_text', 'images', 'links', 'code']
    }
  };

  beforeEach(() => {
    evaluator = new PlatformComplianceEvaluator();
  });

  describe('小红书平台规则测试', () => {
    const platform = mockPlatforms.xiaohongshu;

    it('应该通过表情符号密度检查', async () => {
      const content = '今天分享一个超棒的护肤心得😊 这款面霜真的很好用💕 质感很棒✨ 大家觉得怎么样？ #护肤 #美妆 #分享';
      
      const result = await evaluator.evaluateCompliance(content, platform);
      
      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(70);
      expect(result.isCompliant).toBe(true);
      
      // 检查表情符号密度规则
      const emojiRule = result.ruleChecks.find(r => r.ruleId === 'xhs-emoji-density');
      expect(emojiRule).toBeDefined();
      expect(emojiRule!.passed).toBe(true);
    });

    it('应该检测表情符号密度不足', async () => {
      const content = '今天分享一个护肤心得，这款面霜很好用，质感不错。';
      
      const result = await evaluator.evaluateCompliance(content, platform);
      
      const emojiRule = result.ruleChecks.find(r => r.ruleId === 'xhs-emoji-density');
      expect(emojiRule).toBeDefined();
      expect(emojiRule!.passed).toBe(false);
      expect(emojiRule!.suggestions).toContain('建议增加适量表情符号提升内容活跃度');
    });

    it('应该检测互动问题', async () => {
      const content = '分享一个好用的产品😊 你们觉得怎么样？大家有什么推荐吗？ #分享 #好物 #推荐';
      
      const result = await evaluator.evaluateCompliance(content, platform);
      
      const interactionRule = result.ruleChecks.find(r => r.ruleId === 'xhs-interaction-questions');
      expect(interactionRule).toBeDefined();
      expect(interactionRule!.passed).toBe(true);
    });

    it('应该检测标签使用', async () => {
      const content = '分享好物😊 #美妆 #护肤 #好物推荐 #种草 #分享';
      
      const result = await evaluator.evaluateCompliance(content, platform);
      
      const hashtagRule = result.ruleChecks.find(r => r.ruleId === 'xhs-hashtag-usage');
      expect(hashtagRule).toBeDefined();
      expect(hashtagRule!.passed).toBe(true);
    });

    it('应该检测内容长度', async () => {
      const shortContent = '太短了';
      
      const result = await evaluator.evaluateCompliance(shortContent, platform);
      
      const lengthRule = result.ruleChecks.find(r => r.ruleId === 'xhs-length-check');
      expect(lengthRule).toBeDefined();
      expect(lengthRule!.passed).toBe(false);
    });
  });

  describe('Twitter平台规则测试', () => {
    const platform = mockPlatforms.twitter;

    it('应该通过字符限制检查', async () => {
      const content = '分享一个有趣的技术发现 #tech #programming';
      
      const result = await evaluator.evaluateCompliance(content, platform);
      
      const lengthRule = result.ruleChecks.find(r => r.ruleId === 'twitter-character-limit');
      expect(lengthRule).toBeDefined();
      expect(lengthRule!.passed).toBe(true);
    });

    it('应该检测字符超限', async () => {
      const longContent = 'a'.repeat(300); // 超过280字符
      
      const result = await evaluator.evaluateCompliance(longContent, platform);
      
      const lengthRule = result.ruleChecks.find(r => r.ruleId === 'twitter-character-limit');
      expect(lengthRule).toBeDefined();
      expect(lengthRule!.passed).toBe(false);
      expect(lengthRule!.suggestions).toContain('内容超过280字符限制，请精简表达');
    });

    it('应该检测标签数量', async () => {
      const content = '测试内容 #tag1 #tag2'; // 适量标签
      
      const result = await evaluator.evaluateCompliance(content, platform);
      
      const hashtagRule = result.ruleChecks.find(r => r.ruleId === 'twitter-hashtag-count');
      expect(hashtagRule).toBeDefined();
      expect(hashtagRule!.passed).toBe(true);
    });

    it('应该检测标签过多', async () => {
      const content = '测试 #tag1 #tag2 #tag3 #tag4 #tag5'; // 过多标签
      
      const result = await evaluator.evaluateCompliance(content, platform);
      
      const hashtagRule = result.ruleChecks.find(r => r.ruleId === 'twitter-hashtag-count');
      expect(hashtagRule).toBeDefined();
      expect(hashtagRule!.passed).toBe(false);
    });

    it('应该检测简洁性', async () => {
      const content = '这是一个简短的推文。每个句子都很简洁。';
      
      const result = await evaluator.evaluateCompliance(content, platform);
      
      const brevityRule = result.ruleChecks.find(r => r.ruleId === 'twitter-brevity');
      expect(brevityRule).toBeDefined();
      expect(brevityRule!.passed).toBe(true);
    });
  });

  describe('微信公众号平台规则测试', () => {
    const platform = mockPlatforms.wechat;

    it('应该检测内容长度要求', async () => {
      const longContent = 'a'.repeat(1000); // 足够长的内容
      
      const result = await evaluator.evaluateCompliance(longContent, platform);
      
      const lengthRule = result.ruleChecks.find(r => r.ruleId === 'wechat-length-requirement');
      expect(lengthRule).toBeDefined();
      expect(lengthRule!.passed).toBe(true);
    });

    it('应该检测结构化要求', async () => {
      const structuredContent = `
# 主标题

## 第一部分
这是第一部分的内容。

## 第二部分  
这是第二部分的内容。

## 第三部分
这是第三部分的内容。

### 小节
这是小节内容。

结论部分的内容。
      `;
      
      const result = await evaluator.evaluateCompliance(structuredContent, platform);
      
      const structureRule = result.ruleChecks.find(r => r.ruleId === 'wechat-structure-required');
      expect(structureRule).toBeDefined();
      expect(structureRule!.passed).toBe(true);
    });

    it('应该检测专业语调', async () => {
      const professionalContent = '根据最新的研究数据显示，这项技术的性能优化效果显著。专家分析认为，这种趋势将持续发展。我们建议采用这种方案。';
      
      const result = await evaluator.evaluateCompliance(professionalContent, platform);
      
      const toneRule = result.ruleChecks.find(r => r.ruleId === 'wechat-professional-tone');
      expect(toneRule).toBeDefined();
      expect(toneRule!.passed).toBe(true);
    });

    it('应该检测示例使用', async () => {
      const contentWithExamples = '这个概念很重要。例如，在实际应用中我们可以这样做。比如说，具体来说就是这个案例。';
      
      const result = await evaluator.evaluateCompliance(contentWithExamples, platform);
      
      const exampleRule = result.ruleChecks.find(r => r.ruleId === 'wechat-example-usage');
      expect(exampleRule).toBeDefined();
      expect(exampleRule!.passed).toBe(true);
    });
  });

  describe('个人博客平台规则测试', () => {
    const platform = mockPlatforms.blog;

    it('应该检测技术深度', async () => {
      const technicalContent = '这篇文章讨论了算法优化和系统架构设计。我们分析了性能瓶颈，并提出了基于设计模式的解决方案。通过源码分析，我们发现了框架的实现原理。';
      
      const result = await evaluator.evaluateCompliance(technicalContent, platform);
      
      const depthRule = result.ruleChecks.find(r => r.ruleId === 'blog-technical-depth');
      expect(depthRule).toBeDefined();
      expect(depthRule!.passed).toBe(true);
    });

    it('应该检测代码示例', async () => {
      const contentWithCode = `
这是一个技术文章。

\`\`\`javascript
function example() {
  return 'Hello World';
}
\`\`\`

还有行内代码 \`const x = 1\`。
      `;
      
      const result = await evaluator.evaluateCompliance(contentWithCode, platform);
      
      const codeRule = result.ruleChecks.find(r => r.ruleId === 'blog-code-examples');
      expect(codeRule).toBeDefined();
      expect(codeRule!.passed).toBe(true);
    });

    it('应该检测SEO优化', async () => {
      const seoContent = `
# 主标题

这是内容，包含[链接](https://example.com)和![图片](image.jpg)。

还有更多[内部链接](./other.md)。
      `;
      
      const result = await evaluator.evaluateCompliance(seoContent, platform);
      
      const seoRule = result.ruleChecks.find(r => r.ruleId === 'blog-seo-optimization');
      expect(seoRule).toBeDefined();
      expect(seoRule!.passed).toBe(true);
    });

    it('应该检测参考文献', async () => {
      const contentWithReferences = `
文章内容...

## 参考文献

1. [MDN文档](https://developer.mozilla.org)
2. [官方指南](https://guide.example.com)
      `;
      
      const result = await evaluator.evaluateCompliance(contentWithReferences, platform);
      
      const refRule = result.ruleChecks.find(r => r.ruleId === 'blog-reference-section');
      expect(refRule).toBeDefined();
      expect(refRule!.passed).toBe(true);
    });
  });

  describe('头条号平台规则测试', () => {
    const platform = mockPlatforms.toutiao;

    it('应该检测标题吸引力', async () => {
      const attractiveContent = `
# 震惊！这5个技巧让你的效率提升300%

内容正文...
      `;
      
      const result = await evaluator.evaluateCompliance(attractiveContent, platform);
      
      const titleRule = result.ruleChecks.find(r => r.ruleId === 'toutiao-title-attractiveness');
      expect(titleRule).toBeDefined();
      expect(titleRule!.passed).toBe(true);
    });

    it('应该检测通俗易懂', async () => {
      const popularContent = '因为这个方法很好用，所以我推荐给大家。比如说，这样做就是很简单的。';
      
      const result = await evaluator.evaluateCompliance(popularContent, platform);
      
      const languageRule = result.ruleChecks.find(r => r.ruleId === 'toutiao-popular-language');
      expect(languageRule).toBeDefined();
      expect(languageRule!.passed).toBe(true);
    });

    it('应该检测讨论引导', async () => {
      const discussionContent = '这个话题很有趣。你怎么看？大家觉得如何？欢迎讨论！';
      
      const result = await evaluator.evaluateCompliance(discussionContent, platform);
      
      const discussionRule = result.ruleChecks.find(r => r.ruleId === 'toutiao-discussion-prompt');
      expect(discussionRule).toBeDefined();
      expect(discussionRule!.passed).toBe(true);
    });

    it('应该检测争议内容', async () => {
      const controversialContent = '这个观点存在争议。有人支持，也有人反对。不同观点都值得讨论。';
      
      const result = await evaluator.evaluateCompliance(controversialContent, platform);
      
      const controversialRule = result.ruleChecks.find(r => r.ruleId === 'toutiao-controversial-content');
      expect(controversialRule).toBeDefined();
      expect(controversialRule!.passed).toBe(true);
    });

    it('应该检测标题党程度', async () => {
      const moderateContent = `
# 深度解析：这个技术趋势值得关注

内容正文...
      `;
      
      const result = await evaluator.evaluateCompliance(moderateContent, platform);
      
      const clickbaitRule = result.ruleChecks.find(r => r.ruleId === 'toutiao-clickbait-level');
      expect(clickbaitRule).toBeDefined();
      expect(clickbaitRule!.passed).toBe(true);
    });
  });

  describe('配置和选项测试', () => {
    it('应该支持严格模式', async () => {
      const content = '测试内容';
      const platform = mockPlatforms.xiaohongshu;
      const options: ComplianceEvaluationOptions = { strictMode: true };
      
      const result = await evaluator.evaluateCompliance(content, platform, options);
      
      expect(result.metadata.strictMode).toBe(true);
      // 严格模式下评分应该更严格
    });

    it('应该支持自定义规则过滤', async () => {
      const content = '测试内容';
      const platform = mockPlatforms.xiaohongshu;
      const options: ComplianceEvaluationOptions = {
        enabledRules: ['xhs-emoji-density', 'xhs-length-check']
      };
      
      const result = await evaluator.evaluateCompliance(content, platform, options);
      
      // 只应该执行指定的规则
      expect(result.ruleChecks.length).toBeLessThanOrEqual(2);
      expect(result.ruleChecks.every(r => 
        r.ruleId === 'xhs-emoji-density' || r.ruleId === 'xhs-length-check'
      )).toBe(true);
    });

    it('应该支持跳过可选规则', async () => {
      const content = '测试内容';
      const platform = mockPlatforms.xiaohongshu;
      const options: ComplianceEvaluationOptions = { skipOptionalRules: true };
      
      const result = await evaluator.evaluateCompliance(content, platform, options);
      
      // 不应该包含info级别的规则
      expect(result.ruleChecks.every(r => r.ruleId !== 'xhs-visual-language')).toBe(true);
    });
  });

  describe('改进建议生成', () => {
    it('应该生成有用的改进建议', async () => {
      const poorContent = '短'; // 很短的内容，会触发多个规则失败
      const platform = mockPlatforms.xiaohongshu;
      
      const result = await evaluator.evaluateCompliance(poorContent, platform);
      
      expect(result.improvements.length).toBeGreaterThan(0);
      
      // 检查建议的结构
      const suggestion = result.improvements[0];
      expect(suggestion.type).toBeDefined();
      expect(suggestion.category).toBeDefined();
      expect(suggestion.title).toBeDefined();
      expect(suggestion.description).toBeDefined();
      expect(suggestion.impact).toBeGreaterThan(0);
      expect(suggestion.effort).toBeGreaterThan(0);
      expect(suggestion.priority).toBeGreaterThan(0);
      expect(suggestion.actionable).toBe(true);
      expect(Array.isArray(suggestion.examples)).toBe(true);
    });

    it('应该按优先级排序建议', async () => {
      const poorContent = '短内容';
      const platform = mockPlatforms.xiaohongshu;
      
      const result = await evaluator.evaluateCompliance(poorContent, platform);
      
      if (result.improvements.length > 1) {
        // 建议应该按优先级降序排列
        for (let i = 0; i < result.improvements.length - 1; i++) {
          expect(result.improvements[i].priority).toBeGreaterThanOrEqual(
            result.improvements[i + 1].priority
          );
        }
      }
    });
  });

  describe('错误处理', () => {
    it('应该抛出错误当内容为空', async () => {
      const platform = mockPlatforms.xiaohongshu;
      
      await expect(
        evaluator.evaluateCompliance('', platform)
      ).rejects.toThrow('内容不能为空');
    });

    it('应该抛出错误当平台信息无效', async () => {
      const invalidPlatform = { 
        id: '' as PlatformId, 
        name: '', 
        maxLength: 0, 
        styleKeywords: [],
        requiredElements: [],
        formatRules: {},
        features: [] 
      } as unknown as SocialMediaPlatform;
      
      await expect(
        evaluator.evaluateCompliance('测试内容', invalidPlatform)
      ).rejects.toThrow('平台信息不能为空');
    });

    it('应该抛出错误当平台不支持', async () => {
      const unsupportedPlatform = { 
        id: 'unsupported' as PlatformId, 
        name: '不支持的平台', 
        maxLength: 1000,
        styleKeywords: [],
        requiredElements: [],
        formatRules: {},
        features: [] 
      } as unknown as SocialMediaPlatform;
      
      await expect(
        evaluator.evaluateCompliance('测试内容', unsupportedPlatform)
      ).rejects.toThrow('不支持的平台: unsupported');
    });
  });

  describe('性能测试', () => {
    it('应该在1秒内完成评估', async () => {
      const content = '这是一个性能测试的内容，需要在规定时间内完成评估。';
      const platform = mockPlatforms.xiaohongshu;
      const startTime = Date.now();
      
      await evaluator.evaluateCompliance(content, platform);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(processingTime).toBeLessThan(1000); // 1秒内完成
    });
  });

  describe('规则管理', () => {
    it('应该支持更新规则', () => {
      const customRules = [
        {
          id: 'custom-rule',
          name: '自定义规则',
          description: '测试自定义规则',
          type: 'content' as const,
          severity: 'warning' as const,
          weight: 0.5,
          enabled: true,
          platformSpecific: true,
          validator: () => ({
            ruleId: 'custom-rule',
            ruleName: '自定义规则',
            passed: true,
            score: 100,
            weight: 0.5,
            details: '测试通过',
            suggestions: [],
            metadata: { confidence: 1.0 }
          })
        }
      ];
      
      evaluator.updateRules('xiaohongshu', customRules);
      
      const rules = evaluator.getPlatformRules('xiaohongshu', {
        enabledRules: [],
        strictMode: false,
        includeWarnings: true,
        customWeights: {},
        skipOptionalRules: false
      });
      
      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe('custom-rule');
    });
  });
}); 