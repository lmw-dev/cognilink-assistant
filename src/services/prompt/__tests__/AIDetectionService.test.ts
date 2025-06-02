/**
 * TOM-118: AI检测服务单元测试
 * 测试AI痕迹检测、机械化表达检测、情感缺失检测等功能
 */

import { jest } from '@jest/globals';
import { AIDetectionService } from '../AIDetectionService';
import { AIService } from '../../AIService';
import {
  AIDetectionReport,
  MechanicalExpressionReport,
  PatternedLanguageReport,
  EmotionalDeficiencyReport,
  AIDetectionRisk,
  NaturalnessScore,
  HumanComparisonReport,
  LanguagePatternAnalysis,
  DEFAULT_AI_DETECTION_CONFIG
} from '../../../types/ai-detection';

// Mock AIService
const mockAIService = {
  sendMessage: jest.fn()
} as unknown as AIService;

describe('AIDetectionService', () => {
  let aiDetectionService: AIDetectionService;

  beforeEach(() => {
    aiDetectionService = new AIDetectionService(mockAIService);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(aiDetectionService).toBeInstanceOf(AIDetectionService);
    });

    it('should initialize with custom config', () => {
      const customConfig = {
        ...DEFAULT_AI_DETECTION_CONFIG,
        detectionThreshold: 0.5
      };
      const service = new AIDetectionService(mockAIService, customConfig);
      expect(service).toBeInstanceOf(AIDetectionService);
    });
  });

  describe('detectMechanicalExpressions', () => {
    it('should detect high mechanical expressions', async () => {
      const mechanicalContent = `
        首先，我们需要了解这个问题。
        其次，我们应该分析相关因素。
        然后，我们可以制定解决方案。
        最后，我们需要实施并监控结果。
        总之，这是一个系统性的方法。
      `;

      const result: MechanicalExpressionReport = await aiDetectionService.detectMechanicalExpressions(mechanicalContent);

      expect(result.score).toBeGreaterThan(70); // 高机械化评分
      expect(result.detectedPatterns).toHaveLength(expect.any(Number));
      expect(result.frequentPhrases.length).toBeGreaterThan(0);
      expect(result.recommendations).toHaveLength(expect.any(Number));
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect low mechanical expressions in natural content', async () => {
      const naturalContent = `
        昨天我去咖啡店的时候，偶然遇到了老朋友小张。
        我们聊了很久，他告诉我最近工作的一些趣事。
        说实话，我觉得现在的生活节奏太快了，很难静下心来好好交流。
        不过那天下午的阳光很温暖，让我想起了大学时代的美好时光。
      `;

      const result: MechanicalExpressionReport = await aiDetectionService.detectMechanicalExpressions(naturalContent);

      expect(result.score).toBeLessThan(40); // 低机械化评分
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should handle empty content', async () => {
      await expect(aiDetectionService.detectMechanicalExpressions('')).rejects.toThrow();
    });

    it('should handle very short content', async () => {
      const result = await aiDetectionService.detectMechanicalExpressions('Hello');
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('detectPatternedLanguage', () => {
    it('should detect repeated patterns', async () => {
      const patternedContent = `
        根据研究显示，这种方法有效率达到90%。
        根据专家分析，这个方案具有可行性。
        根据数据统计，用户满意度较高。
        根据调查结果，市场前景良好。
      `;

      const result: PatternedLanguageReport = await aiDetectionService.detectPatternedLanguage(patternedContent);

      expect(result.score).toBeGreaterThan(60); // 高模式化评分
      expect(result.repeatedStructures.length).toBeGreaterThan(0);
      expect(result.templateMatches.length).toBeGreaterThanOrEqual(0);
      expect(result.recommendations).toHaveLength(expect.any(Number));
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect low patterns in varied content', async () => {
      const variedContent = `
        今天天气不错，我决定出去走走。
        街上的人们匆匆忙忙，各自忙着自己的事情。
        突然想起要买菜做饭，于是转身走向菜市场。
        选了些新鲜的蔬菜和水果，心情也变得愉快起来。
      `;

      const result: PatternedLanguageReport = await aiDetectionService.detectPatternedLanguage(variedContent);

      expect(result.score).toBeLessThan(50); // 低模式化评分
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('detectEmotionalDeficiency', () => {
    it('should detect emotional deficiency in cold content', async () => {
      const coldContent = `
        该系统具备以下功能模块：
        1. 数据处理模块
        2. 分析计算模块
        3. 结果输出模块
        系统运行稳定，性能良好。
        用户可根据需求进行配置。
      `;

      const result: EmotionalDeficiencyReport = await aiDetectionService.detectEmotionalDeficiency(coldContent);

      expect(result.score).toBeGreaterThan(60); // 高情感缺失评分
      expect(result.emotionalIndicators.personalPronouns).toBeLessThan(50);
      expect(result.emotionalIndicators.emotionalWords).toBeLessThan(50);
      expect(result.missingElements.length).toBeGreaterThan(0);
      expect(result.recommendations).toHaveLength(expect.any(Number));
    });

    it('should detect low emotional deficiency in warm content', async () => {
      const warmContent = `
        我真的很喜欢这种温暖的感觉！
        每当我想起那些美好的回忆，心中就充满了感激。
        我相信大家都能理解这种心情，因为我们都有过类似的经历。
        希望我的分享能给你们带来一些启发和快乐。
      `;

      const result: EmotionalDeficiencyReport = await aiDetectionService.detectEmotionalDeficiency(warmContent);

      expect(result.score).toBeLessThan(40); // 低情感缺失评分
      expect(result.emotionalIndicators.personalPronouns).toBeGreaterThan(50);
      expect(result.emotionalIndicators.emotionalWords).toBeGreaterThan(50);
    });
  });

  describe('calculateAIDetectionRisk', () => {
    it('should calculate high risk for AI-like content', async () => {
      const aiLikeContent = `
        首先，需要明确问题的本质。
        其次，应当分析相关的影响因素。
        接下来，制定相应的解决方案。
        最后，实施方案并评估效果。
        综上所述，这是一个完整的解决流程。
      `;

      const result: AIDetectionRisk = await aiDetectionService.calculateAIDetectionRisk(aiLikeContent);

      expect(result.overallRisk).toBeGreaterThan(0.6);
      expect(result.riskLevel).toBe('high');
      expect(result.primaryIndicators.length).toBeGreaterThan(0);
      expect(result.riskFactors.length).toBeGreaterThan(0);
      expect(result.recommendedActions.length).toBeGreaterThan(0);
    });

    it('should calculate low risk for human-like content', async () => {
      const humanLikeContent = `
        嗯，我觉得这个问题挺有意思的。
        上次遇到类似情况时，我是这样处理的...
        不过每个人的情况不同，你可能需要根据自己的实际情况来判断。
        总之，多试试不同的方法，总会找到适合自己的解决方案。
      `;

      const result: AIDetectionRisk = await aiDetectionService.calculateAIDetectionRisk(humanLikeContent);

      expect(result.overallRisk).toBeLessThan(0.4);
      expect(result.riskLevel).toMatch(/low|medium/);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('generateNaturalnessScore', () => {
    it('should generate high naturalness score for natural content', async () => {
      const naturalContent = `
        今天心情特别好，因为完成了一个重要的项目。
        虽然过程中遇到了不少困难，但团队的协作让我们最终成功了。
        我想，这就是工作的意义吧 - 在挑战中成长，在合作中收获友谊。
        晚上准备和同事们一起庆祝一下，毕竟这样的时刻值得纪念。
      `;

      const result: NaturalnessScore = await aiDetectionService.generateNaturalnessScore(naturalContent);

      expect(result.score).toBeGreaterThan(70);
      expect(result.dimensions.languageFlow).toBeGreaterThan(60);
      expect(result.dimensions.humanLikeness).toBeGreaterThan(60);
      expect(result.dimensions.spontaneity).toBeGreaterThan(50);
      expect(result.dimensions.authenticity).toBeGreaterThan(60);
      expect(result.dimensions.personality).toBeGreaterThan(50);
      expect(result.strengths.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('should generate low naturalness score for robotic content', async () => {
      const roboticContent = `
        根据系统分析，该方案具有以下优势：
        1. 效率高
        2. 成本低
        3. 风险小
        因此，建议采用此方案。
        请相关部门配合实施。
      `;

      const result: NaturalnessScore = await aiDetectionService.generateNaturalnessScore(roboticContent);

      expect(result.score).toBeLessThan(50);
      expect(result.weaknesses.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('compareWithHumanContent', () => {
    it('should compare content with human samples', async () => {
      const testContent = `
        我觉得这个想法挺不错的，值得尝试一下。
        不过实施起来可能会遇到一些困难，需要提前做好准备。
      `;

      const humanSamples = [
        '我认为这个方案很有潜力，我们应该认真考虑。',
        '说实话，我对这个计划有些担心，担心执行起来会有问题。',
        '从我的经验来看，这种做法通常效果不错。'
      ];

      const result: HumanComparisonReport = await aiDetectionService.compareWithHumanContent(testContent, humanSamples);

      expect(result.similarity).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeLessThanOrEqual(1);
      expect(result.differenceAnalysis.vocabulary).toBeGreaterThanOrEqual(0);
      expect(result.differenceAnalysis.sentence).toBeGreaterThanOrEqual(0);
      expect(result.differenceAnalysis.structure).toBeGreaterThanOrEqual(0);
      expect(result.differenceAnalysis.tone).toBeGreaterThanOrEqual(0);
      expect(result.humanLikeFeatures).toBeInstanceOf(Array);
      expect(result.aiLikeFeatures).toBeInstanceOf(Array);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('analyzeLanguagePatterns', () => {
    it('should analyze language patterns correctly', async () => {
      const content = `
        今天是个特殊的日子。
        阳光明媚，微风轻拂。
        我走在熟悉的街道上，思考着生活的意义。
        每个人都有自己的故事，每个故事都值得被倾听。
        这就是我想说的。
      `;

      const result: LanguagePatternAnalysis = await aiDetectionService.analyzeLanguagePatterns(content);

      expect(result.sentenceVariety).toBeGreaterThanOrEqual(0);
      expect(result.sentenceVariety).toBeLessThanOrEqual(100);
      expect(result.vocabularyRichness).toBeGreaterThanOrEqual(0);
      expect(result.vocabularyRichness).toBeLessThanOrEqual(100);
      expect(result.structuralComplexity).toBeGreaterThanOrEqual(0);
      expect(result.structuralComplexity).toBeLessThanOrEqual(100);
      expect(result.rhythmNaturalness).toBeGreaterThanOrEqual(0);
      expect(result.rhythmNaturalness).toBeLessThanOrEqual(100);
      expect(result.patterns).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('综合AI检测报告', () => {
    it('should generate comprehensive AI detection report', async () => {
      const testContent = `
        基于深度学习技术的智能推荐系统具有以下特点：
        首先，系统能够自动学习用户行为模式。
        其次，算法具有良好的泛化能力。
        最后，系统可以实时调整推荐策略。
        总体而言，该方案技术先进，具有良好的应用前景。
      `;

      // 模拟各个检测方法的调用
      const mechanicalResult = await aiDetectionService.detectMechanicalExpressions(testContent);
      const patternedResult = await aiDetectionService.detectPatternedLanguage(testContent);
      const emotionalResult = await aiDetectionService.detectEmotionalDeficiency(testContent);
      const riskResult = await aiDetectionService.calculateAIDetectionRisk(testContent);
      const naturalnessResult = await aiDetectionService.generateNaturalnessScore(testContent);

      // 验证所有结果都符合期望的格式
      expect(mechanicalResult.score).toBeGreaterThanOrEqual(0);
      expect(mechanicalResult.score).toBeLessThanOrEqual(100);
      expect(patternedResult.score).toBeGreaterThanOrEqual(0);
      expect(patternedResult.score).toBeLessThanOrEqual(100);
      expect(emotionalResult.score).toBeGreaterThanOrEqual(0);
      expect(emotionalResult.score).toBeLessThanOrEqual(100);
      expect(riskResult.overallRisk).toBeGreaterThanOrEqual(0);
      expect(riskResult.overallRisk).toBeLessThanOrEqual(1);
      expect(naturalnessResult.score).toBeGreaterThanOrEqual(0);
      expect(naturalnessResult.score).toBeLessThanOrEqual(100);

      // 这种内容应该显示高AI痕迹
      expect(mechanicalResult.score).toBeGreaterThan(60);
      expect(patternedResult.score).toBeGreaterThan(50);
      expect(emotionalResult.score).toBeGreaterThan(50);
      expect(riskResult.overallRisk).toBeGreaterThan(0.5);
      expect(naturalnessResult.score).toBeLessThan(60);
    });
  });

  describe('错误处理', () => {
    it('should handle invalid content gracefully', async () => {
      await expect(aiDetectionService.detectMechanicalExpressions('')).rejects.toThrow();
      await expect(aiDetectionService.detectPatternedLanguage('')).rejects.toThrow();
      await expect(aiDetectionService.detectEmotionalDeficiency('')).rejects.toThrow();
    });

    it('should handle very long content', async () => {
      const longContent = 'a'.repeat(10000);
      const result = await aiDetectionService.detectMechanicalExpressions(longContent);
      expect(result).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle special characters and emojis', async () => {
      const emojiContent = '今天天气很好！😊 我很开心 🎉 准备出去玩 🌞';
      const result = await aiDetectionService.detectEmotionalDeficiency(emojiContent);
      expect(result).toBeDefined();
      expect(result.score).toBeLessThan(60); // 表情符号应该降低情感缺失评分
    });
  });

  describe('性能测试', () => {
    it('should complete detection within reasonable time', async () => {
      const content = `
        这是一段用于性能测试的内容。
        它包含了多种句式和表达方式。
        目的是验证检测算法的性能表现。
        同时确保结果的准确性和可靠性。
      `;

      const startTime = Date.now();
      await aiDetectionService.detectMechanicalExpressions(content);
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // 检测应该在2秒内完成
      expect(processingTime).toBeLessThan(2000);
    });
  });

  describe('缓存功能', () => {
    it('should cache results for repeated content', async () => {
      const content = '这是一段测试内容。';

      // 第一次调用
      const result1 = await aiDetectionService.detectMechanicalExpressions(content);
      
      // 第二次调用相同内容
      const result2 = await aiDetectionService.detectMechanicalExpressions(content);

      // 结果应该相同
      expect(result1.score).toBe(result2.score);
      expect(result1.confidence).toBe(result2.confidence);
    });
  });
}); 