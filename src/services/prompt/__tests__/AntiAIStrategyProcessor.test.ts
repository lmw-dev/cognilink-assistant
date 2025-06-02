/**
 * TOM-118: 反AI策略处理器单元测试
 * 测试语言自然化、个性化注入、适度不完美化等反AI策略
 */

import { jest } from '@jest/globals';
import { AntiAIStrategyProcessor } from '../AntiAIStrategyProcessor';
import { AIService } from '../../AIService';
import {
  AntiAIStrategyResult,
  LanguageNaturalizationConfig,
  PersonalizationConfig,
  ImperfectionConfig,
  UserStyleProfile,
  ExperienceContext
} from '../../../types/ai-detection';
import { AntiAIDetectionStrategy } from '../../../types/prompt-advanced';

// Mock AIService
const mockAIService = {
  sendMessage: jest.fn()
} as unknown as AIService;

describe('AntiAIStrategyProcessor', () => {
  let processor: AntiAIStrategyProcessor;

  beforeEach(() => {
    processor = new AntiAIStrategyProcessor(mockAIService);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize properly', () => {
      expect(processor).toBeInstanceOf(AntiAIStrategyProcessor);
    });
  });

  describe('语言自然化处理', () => {
    it('should apply language naturalization', async () => {
      const mechanicalContent = `
        首先，我们需要分析这个问题。
        其次，我们应该制定解决方案。
        最后，我们需要实施计划。
      `;

      const config: LanguageNaturalizationConfig = {
        sentenceVariation: {
          enabled: true,
          level: 0.8,
          patterns: ['transition', 'colloquial', 'varied']
        },
        colloquialLevel: {
          enabled: true,
          intensity: 0.6,
          targetExpressions: ['嗯', '其实', '说实话', '我觉得']
        },
        emotionalNuance: {
          enabled: true,
          depth: 0.7,
          emotionalMarkers: ['感觉', '想法', '体验', '感受']
        }
      };

      const result = await processor.applyLanguageNaturalization(mechanicalContent, config);

      expect(result.processedContent).not.toBe(mechanicalContent);
      expect(result.improvements.naturalness).toBeGreaterThan(0);
      expect(result.improvements.aiDetectionReduction).toBeGreaterThan(0);
      expect(result.appliedStrategies).toContain('language-naturalization');
      expect(result.qualityMetrics.readability).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should preserve content meaning while naturalizing', async () => {
      const formalContent = `根据数据分析，该方案具有较高的可行性。建议立即实施该计划。`;

      const config: LanguageNaturalizationConfig = {
        sentenceVariation: {
          enabled: true,
          level: 0.5,
          patterns: ['casual']
        },
        colloquialLevel: {
          enabled: true,
          intensity: 0.4,
          targetExpressions: ['我觉得', '看起来']
        },
        emotionalNuance: {
          enabled: false,
          depth: 0,
          emotionalMarkers: []
        }
      };

      const result = await processor.applyLanguageNaturalization(formalContent, config);

      expect(result.processedContent).toContain('可行性');
      expect(result.processedContent).toContain('实施');
      expect(result.qualityMetrics.coherence).toBeGreaterThan(70);
    });
  });

  describe('个性化注入处理', () => {
    it('should apply personalization strategies', async () => {
      const genericContent = `这个方法很有效果。大家可以尝试使用。`;

      const styleProfile: UserStyleProfile = {
        writingStyle: 'conversational',
        tonePreference: 'friendly',
        vocabularyLevel: 'moderate',
        sentenceStructure: 'varied',
        personalMarkers: ['我发现', '在我看来', '根据我的经验'],
        preferredPhrases: ['挺不错的', '值得一试', '个人感觉'],
        avoidedPatterns: ['显而易见', '众所周知', '毫无疑问']
      };

      const experienceContext: ExperienceContext = {
        domain: 'technology',
        experienceLevel: 'intermediate',
        personalStories: ['之前遇到过类似情况', '我曾经试过这种方法'],
        preferences: ['简单直接', '实用为主'],
        backgroundKnowledge: ['编程经验', '项目管理'],
        culturalContext: 'chinese'
      };

      const config: PersonalizationConfig = {
        userStyleMimicry: {
          enabled: true,
          styleProfile,
          adaptationLevel: 0.7
        },
        personalExperience: {
          enabled: true,
          experienceLevel: 0.6,
          contextualRelevance: 0.8
        },
        uniquePerspective: {
          enabled: true,
          originalityLevel: 0.5,
          viewpointDiversity: 0.6
        }
      };

      const result = await processor.applyPersonalization(genericContent, config, experienceContext);

      expect(result.processedContent).not.toBe(genericContent);
      expect(result.improvements.humanLikeness).toBeGreaterThan(0);
      expect(result.appliedStrategies).toContain('personalization');
      expect(result.qualityMetrics.authenticity).toBeGreaterThan(60);
    });

    it('should inject appropriate personal experiences', async () => {
      const technicalContent = `使用TypeScript可以提高代码质量。`;

      const experienceContext: ExperienceContext = {
        domain: 'programming',
        experienceLevel: 'advanced',
        personalStories: ['我在项目中使用TypeScript的经历'],
        preferences: ['类型安全', '开发效率'],
        backgroundKnowledge: ['JavaScript', 'React', 'Node.js'],
        culturalContext: 'chinese'
      };

      const config: PersonalizationConfig = {
        userStyleMimicry: {
          enabled: false,
          styleProfile: {} as UserStyleProfile,
          adaptationLevel: 0
        },
        personalExperience: {
          enabled: true,
          experienceLevel: 0.8,
          contextualRelevance: 0.9
        },
        uniquePerspective: {
          enabled: true,
          originalityLevel: 0.6,
          viewpointDiversity: 0.7
        }
      };

      const result = await processor.applyPersonalization(technicalContent, config, experienceContext);

      expect(result.processedContent.length).toBeGreaterThan(technicalContent.length);
      expect(result.improvements.humanLikeness).toBeGreaterThan(20);
    });
  });

  describe('适度不完美化处理', () => {
    it('should apply moderate imperfections', async () => {
      const perfectContent = `这是一个完美的解决方案。所有参数都已经优化到最佳状态。系统运行稳定可靠。`;

      const config: ImperfectionConfig = {
        minorInconsistency: {
          enabled: true,
          frequency: 0.05,
          types: ['stylistic', 'structural']
        },
        naturalPauses: {
          enabled: true,
          frequency: 0.3,
          pauseTypes: ['思考停顿', '语气词', '连接词']
        },
        colloquialErrors: {
          enabled: true,
          frequency: 0.02,
          errorTypes: ['grammar']
        }
      };

      const result = await processor.applyImperfections(perfectContent, config);

      expect(result.processedContent).not.toBe(perfectContent);
      expect(result.improvements.naturalness).toBeGreaterThan(0);
      expect(result.appliedStrategies).toContain('imperfection');
      expect(result.qualityMetrics.authenticity).toBeGreaterThan(60);
    });

    it('should maintain readability while adding imperfections', async () => {
      const content = `项目管理需要严格的时间控制和资源分配。`;

      const config: ImperfectionConfig = {
        minorInconsistency: {
          enabled: true,
          frequency: 0.1,
          types: ['stylistic']
        },
        naturalPauses: {
          enabled: true,
          frequency: 0.5,
          pauseTypes: ['思考停顿']
        },
        colloquialErrors: {
          enabled: false,
          frequency: 0,
          errorTypes: []
        }
      };

      const result = await processor.applyImperfections(content, config);

      expect(result.qualityMetrics.readability).toBeGreaterThan(70);
      expect(result.qualityMetrics.coherence).toBeGreaterThan(70);
    });
  });

  describe('综合策略应用', () => {
    it('should apply multiple strategies together', async () => {
      const aiContent = `
        基于深度学习算法的推荐系统主要包含以下模块：
        1. 数据预处理模块
        2. 特征提取模块  
        3. 模型训练模块
        4. 推荐生成模块
        该系统具有高精度和良好的扩展性。
      `;

      const antiAIStrategy: AntiAIDetectionStrategy = {
        languageNaturalization: {
          enabled: true,
          sentenceVariation: {
            enabled: true,
            level: 0.7,
            patterns: ['transition', 'colloquial']
          },
          colloquialLevel: {
            enabled: true,
            intensity: 0.5,
            targetExpressions: ['其实', '我觉得', '说实话']
          },
          emotionalNuance: {
            enabled: true,
            depth: 0.6,
            emotionalMarkers: ['感觉', '体验']
          }
        },
        personalizationInjection: {
          enabled: true,
          userStyleMimicry: {
            enabled: true,
            styleProfile: {
              writingStyle: 'technical',
              tonePreference: 'professional',
              vocabularyLevel: 'advanced',
              sentenceStructure: 'complex',
              personalMarkers: ['根据我的经验', '在实际项目中'],
              preferredPhrases: ['确实不错', '值得考虑'],
              avoidedPatterns: ['显而易见', '毫无疑问']
            } as UserStyleProfile,
            adaptationLevel: 0.6
          },
          personalExperience: {
            enabled: true,
            experienceLevel: 0.7,
            contextualRelevance: 0.8
          },
          uniquePerspective: {
            enabled: true,
            originalityLevel: 0.5,
            viewpointDiversity: 0.6
          }
        },
        moderateImperfection: {
          enabled: true,
          minorInconsistency: {
            enabled: true,
            frequency: 0.03,
            types: ['stylistic']
          },
          naturalPauses: {
            enabled: true,
            frequency: 0.2,
            pauseTypes: ['思考停顿']
          },
          colloquialErrors: {
            enabled: false,
            frequency: 0,
            errorTypes: []
          }
        }
      };

      const experienceContext: ExperienceContext = {
        domain: 'machine learning',
        experienceLevel: 'advanced',
        personalStories: ['项目实践经验'],
        preferences: ['技术深度', '实用性'],
        backgroundKnowledge: ['算法', '数据科学'],
        culturalContext: 'chinese'
      };

      const result = await processor.processWithAllStrategies(aiContent, antiAIStrategy, experienceContext);

      expect(result.processedContent).not.toBe(aiContent);
      expect(result.improvements.naturalness).toBeGreaterThan(30);
      expect(result.improvements.aiDetectionReduction).toBeGreaterThan(40);
      expect(result.improvements.humanLikeness).toBeGreaterThan(25);
      expect(result.appliedStrategies.length).toBeGreaterThan(1);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should provide comprehensive metrics', async () => {
      const content = `人工智能技术在各个领域都有广泛应用。`;

      const strategy: AntiAIDetectionStrategy = {
        languageNaturalization: {
          enabled: true,
          sentenceVariation: { enabled: true, level: 0.5, patterns: ['casual'] },
          colloquialLevel: { enabled: true, intensity: 0.4, targetExpressions: ['我觉得'] },
          emotionalNuance: { enabled: false, depth: 0, emotionalMarkers: [] }
        },
        personalizationInjection: {
          enabled: true,
          userStyleMimicry: {
            enabled: false,
            styleProfile: {} as UserStyleProfile,
            adaptationLevel: 0
          },
          personalExperience: { enabled: true, experienceLevel: 0.5, contextualRelevance: 0.6 },
          uniquePerspective: { enabled: false, originalityLevel: 0, viewpointDiversity: 0 }
        },
        moderateImperfection: {
          enabled: true,
          minorInconsistency: { enabled: false, frequency: 0, types: [] },
          naturalPauses: { enabled: true, frequency: 0.1, pauseTypes: ['语气词'] },
          colloquialErrors: { enabled: false, frequency: 0, errorTypes: [] }
        }
      };

      const context: ExperienceContext = {
        domain: 'technology',
        experienceLevel: 'intermediate',
        personalStories: [],
        preferences: [],
        backgroundKnowledge: [],
        culturalContext: 'chinese'
      };

      const result = await processor.processWithAllStrategies(content, strategy, context);

      expect(result.qualityMetrics.readability).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.coherence).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.authenticity).toBeGreaterThanOrEqual(0);
      expect(result.processingTime).toBeGreaterThan(0);
    });
  });

  describe('错误处理', () => {
    it('should handle empty content', async () => {
      const config: LanguageNaturalizationConfig = {
        sentenceVariation: { enabled: true, level: 0.5, patterns: [] },
        colloquialLevel: { enabled: false, intensity: 0, targetExpressions: [] },
        emotionalNuance: { enabled: false, depth: 0, emotionalMarkers: [] }
      };

      await expect(processor.applyLanguageNaturalization('', config)).rejects.toThrow();
    });

    it('should handle invalid configurations gracefully', async () => {
      const content = '这是测试内容。';
      
      const invalidConfig: ImperfectionConfig = {
        minorInconsistency: {
          enabled: true,
          frequency: -1, // 无效频率
          types: ['invalid'] as any
        },
        naturalPauses: {
          enabled: true,
          frequency: 2, // 超出范围
          pauseTypes: []
        },
        colloquialErrors: {
          enabled: true,
          frequency: 0.5, // 过高频率
          errorTypes: ['grammar']
        }
      };

      // 应该处理无效配置并给出默认结果
      const result = await processor.applyImperfections(content, invalidConfig);
      expect(result).toBeDefined();
      expect(result.processedContent).toBeDefined();
    });
  });

  describe('性能测试', () => {
    it('should process content efficiently', async () => {
      const content = '这是一段用于性能测试的内容。包含多个句子和不同的表达方式。目的是验证处理器的性能表现。';

      const config: LanguageNaturalizationConfig = {
        sentenceVariation: { enabled: true, level: 0.6, patterns: ['transition'] },
        colloquialLevel: { enabled: true, intensity: 0.4, targetExpressions: ['我觉得'] },
        emotionalNuance: { enabled: true, depth: 0.5, emotionalMarkers: ['感觉'] }
      };

      const startTime = Date.now();
      const result = await processor.applyLanguageNaturalization(content, config);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(3000); // 3秒内完成
      expect(result.processingTime).toBeGreaterThan(0);
    });
  });

  describe('策略有效性验证', () => {
    it('should reduce AI detection probability', async () => {
      const highAIContent = `
        根据系统分析，该解决方案具有以下优势：
        第一，效率得到显著提升。
        第二，成本得到有效控制。  
        第三，风险得到合理规避。
        因此，建议立即采用该方案。
      `;

      const strategy: AntiAIDetectionStrategy = {
        languageNaturalization: {
          enabled: true,
          sentenceVariation: { enabled: true, level: 0.8, patterns: ['casual', 'varied'] },
          colloquialLevel: { enabled: true, intensity: 0.6, targetExpressions: ['我觉得', '说实话'] },
          emotionalNuance: { enabled: true, depth: 0.7, emotionalMarkers: ['感觉', '想法'] }
        },
        personalizationInjection: {
          enabled: true,
          userStyleMimicry: {
            enabled: true,
            styleProfile: {
              writingStyle: 'conversational',
              tonePreference: 'friendly',
              vocabularyLevel: 'moderate',
              sentenceStructure: 'varied',
              personalMarkers: ['根据我的经验'],
              preferredPhrases: ['挺不错的'],
              avoidedPatterns: ['显而易见']
            } as UserStyleProfile,
            adaptationLevel: 0.7
          },
          personalExperience: { enabled: true, experienceLevel: 0.6, contextualRelevance: 0.8 },
          uniquePerspective: { enabled: true, originalityLevel: 0.5, viewpointDiversity: 0.6 }
        },
        moderateImperfection: {
          enabled: true,
          minorInconsistency: { enabled: true, frequency: 0.05, types: ['stylistic'] },
          naturalPauses: { enabled: true, frequency: 0.3, pauseTypes: ['思考停顿'] },
          colloquialErrors: { enabled: false, frequency: 0, errorTypes: [] }
        }
      };

      const context: ExperienceContext = {
        domain: 'business',
        experienceLevel: 'intermediate',
        personalStories: ['类似项目经验'],
        preferences: ['实用性', '可操作性'],
        backgroundKnowledge: ['项目管理', '成本控制'],
        culturalContext: 'chinese'
      };

      const result = await processor.processWithAllStrategies(highAIContent, strategy, context);

      // 验证AI检测率降低效果
      expect(result.improvements.aiDetectionReduction).toBeGreaterThan(50);
      expect(result.improvements.naturalness).toBeGreaterThan(40);
      expect(result.improvements.humanLikeness).toBeGreaterThan(30);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });
}); 