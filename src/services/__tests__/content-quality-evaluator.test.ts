/**
 * TOM-109: 内容质量评估系统 - 核心评估器测试
 */

import { ContentQualityEvaluator } from '../content-quality-evaluator';
import { OriginalityDetector } from '../originality-detector';
import { PlatformComplianceEvaluator } from '../platform-compliance-evaluator';
import { QualityScorer } from '../quality-scorer';
import { QualityReportGenerator } from '../quality-report-generator';
import { AIService } from '../AIService';
import { SocialMediaPlatform, PlatformId } from '../../types/social-media';
import {
  Note,
  QualityEvaluationOptions,
  QualityEvaluationResult,
  ContentEvaluationRequest,
  BatchEvaluationOptions,
  QuickEvaluationResult,
  QualityAssessmentError,
  QualityAssessmentErrorType
} from '../../types/quality-assessment';

// Mock dependencies
jest.mock('../originality-detector');
jest.mock('../platform-compliance-evaluator');
jest.mock('../quality-scorer');
jest.mock('../quality-report-generator');
jest.mock('../AIService');

describe('ContentQualityEvaluator', () => {
  let evaluator: ContentQualityEvaluator;
  let mockOriginalityDetector: jest.Mocked<OriginalityDetector>;
  let mockPlatformComplianceEvaluator: jest.Mocked<PlatformComplianceEvaluator>;
  let mockQualityScorer: jest.Mocked<QualityScorer>;
  let mockReportGenerator: jest.Mocked<QualityReportGenerator>;
  let mockAIService: jest.Mocked<AIService>;

  const mockPlatform: SocialMediaPlatform = {
    id: 'xiaohongshu' as PlatformId,
    name: '小红书',
    maxLength: 1000,
    styleKeywords: ['姐妹们', '绝绝子', '种草'],
    requiredElements: ['emoji', 'hashtag'],
    formatRules: {
      emojiDensity: 'high',
      hashtagStyle: 'integrated',
      interactionPrompt: true
    },
    features: ['images', 'hashtags', 'emoji']
  };

  const mockNote: Note = {
    title: '测试笔记',
    content: '这是一个测试笔记的内容',
    link: '/test/note.md',
    path: '/test/note.md',
    tags: ['test'],
    updated: Date.now()
  };

  beforeEach(() => {
    // Create mocked instances with proper constructors
    const mockEmbeddingService = {} as any;
    mockOriginalityDetector = new OriginalityDetector(mockEmbeddingService) as jest.Mocked<OriginalityDetector>;
    mockPlatformComplianceEvaluator = new PlatformComplianceEvaluator() as jest.Mocked<PlatformComplianceEvaluator>;
    mockQualityScorer = new QualityScorer() as jest.Mocked<QualityScorer>;
    mockReportGenerator = new QualityReportGenerator() as jest.Mocked<QualityReportGenerator>;
    mockAIService = new AIService({} as any) as jest.Mocked<AIService>;

    // Setup default mock implementations
    mockOriginalityDetector.detectOriginality.mockResolvedValue({
      overallScore: 85,
      similarity: 0.15,
      duplicateSegments: [],
      mostSimilarSource: null,
      isOriginal: true,
      confidence: 0.9,
      processingTime: 100,
      metadata: {
        totalSegments: 5,
        duplicateCount: 0,
        uniqueSourceCount: 0,
        averageSimilarity: 0.1,
        method: 'cosine',
        threshold: 0.8
      }
    });

    mockPlatformComplianceEvaluator.evaluateCompliance.mockResolvedValue({
      overallScore: 80,
      ruleChecks: [],
      improvements: [],
      isCompliant: true,
      platformSpecificScores: { xiaohongshu: 80 },
      processingTime: 50,
      metadata: {
        totalRules: 5,
        passedRules: 4,
        failedRules: 1,
        warningRules: 0,
        platform: 'xiaohongshu',
        strictMode: false
      }
    });

    mockQualityScorer.calculateQualityScore.mockReturnValue({
      overall: 75,
      originality: 80,
      readability: 70,
      engagement: 75,
      platformOptimization: 75,
      breakdown: {
        contentStructure: 75,
        languageQuality: 70,
        platformAlignment: 75,
        userEngagement: 75,
        technicalQuality: 80
      },
      confidence: 0.8
    });

    mockReportGenerator.generateDetailedReport.mockReturnValue({
      summary: {
        overallScore: 82,
        grade: 'good',
        keyStrengths: ['原创性高', '平台适配度好'],
        keyWeaknesses: ['可读性有待提升'],
        topRecommendations: [],
        riskLevel: 'low',
        recommendation: '内容质量良好',
        quickActions: ['优化句子结构'],
        confidence: 0.85,
        processingTime: 150
      },
      details: {
        dimensionBreakdown: {
          originality: 85,
          compliance: 80,
          readability: 80,
          attractiveness: 85,
          logic: 80,
          practicality: 85
        },
        originalityAnalysis: {
          score: 85,
          duplicateCount: 0,
          uniqueSourceCount: 0,
          riskSegments: [],
          isOriginal: true,
          duplicateSegments: 0,
          mostSimilarSource: 'N/A',
          confidence: 0.9
        },
        complianceAnalysis: {
          score: 80,
          passedRules: 4,
          failedRules: 1,
          criticalIssues: [],
          isCompliant: true,
          totalRules: 5,
          details: '通过 4/5 项规则检查'
        },
        llmQualityAnalysis: {
          overallScore: 82,
          readability: 80,
          attractiveness: 85,
          logic: 80,
          practicality: 85,
          reasoning: '内容整体质量较高',
          confidence: 0.85
        },
        scoreBreakdown: {
          originality: 85,
          compliance: 80,
          llmQuality: 82,
          weights: {
            originality: 0.3,
            compliance: 0.3,
            platformCompliance: 0.3,
            llmQuality: 0.4,
            readability: 0.25,
            attractiveness: 0.25,
            logic: 0.25,
            practicality: 0.25
          }
        }
      },
      improvements: {
        priority: [],
        optional: [],
        longTerm: [],
        estimatedImpact: 0,
        estimatedEffort: 0,
        timeline: {
          immediate: 0,
          shortTerm: 0,
          longTerm: 0
        }
      },
      metadata: {
        generatedAt: new Date(),
        version: '1.0.0',
        platform: 'xiaohongshu',
        contentLength: 50,
        evaluationTime: 150,
        evaluationMode: 'full',
        confidence: 0.85
      }
    });

    mockReportGenerator.generateSummaryReport.mockReturnValue({
      overallScore: 82,
      grade: 'good',
      keyStrengths: ['原创性高', '平台适配度好'],
      keyWeaknesses: ['可读性有待提升'],
      topRecommendations: [],
      riskLevel: 'low',
      recommendation: '内容质量良好',
      quickActions: ['优化句子结构'],
      confidence: 0.85,
      processingTime: 150
    });

    mockAIService.sendMessage.mockResolvedValue({
      id: 'response-1',
      role: 'assistant',
      content: JSON.stringify({
        overall: 82,
        readability: 80,
        attractiveness: 85,
        logic: 80,
        practicality: 85,
        reasoning: '内容整体质量较高，逻辑清晰，实用性强',
        confidence: 0.85,
        processingTime: 100,
        metadata: {
          model: 'test-model',
          temperature: 0.7,
          maxTokens: 1000,
          promptTokens: 100,
          completionTokens: 200
        }
      }),
      timestamp: Date.now()
    });

    // Create evaluator instance
    evaluator = new ContentQualityEvaluator(
      mockOriginalityDetector,
      mockPlatformComplianceEvaluator,
      mockQualityScorer,
      mockReportGenerator,
      mockAIService
    );
  });

  describe('evaluateContent', () => {
    it('应该成功评估内容质量', async () => {
      const content = '姐妹们！这个产品真的太好用了！强烈推荐给大家 ✨ #好物推荐';
      const sourceNotes = [mockNote];

      // 添加小延迟来模拟真实处理时间
      mockOriginalityDetector.detectOriginality.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 1));
        return {
          overallScore: 85,
          similarity: 0.15,
          duplicateSegments: [],
          mostSimilarSource: null,
          isOriginal: true,
          confidence: 0.9,
          processingTime: 100,
          metadata: {
            totalSegments: 5,
            duplicateCount: 0,
            uniqueSourceCount: 0,
            averageSimilarity: 0.1,
            method: 'cosine',
            threshold: 0.8
          }
        };
      });

      const result = await evaluator.evaluateContent(content, mockPlatform, sourceNotes);

      expect(result).toBeDefined();
      expect(result.overall).toBeDefined();
      expect(result.overall.total).toBeGreaterThan(0);
      expect(result.overall.total).toBeLessThanOrEqual(100);
      expect(result.originality).toBeDefined();
      expect(result.platformCompliance).toBeDefined();
      expect(result.llmQuality).toBeDefined();
      expect(result.report).toBeDefined();
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
    });

    it('应该处理没有源笔记的情况', async () => {
      const content = '这是一个测试内容';

      const result = await evaluator.evaluateContent(content, mockPlatform);

      expect(result).toBeDefined();
      expect(result.originality).toBeNull();
      expect(result.platformCompliance).toBeDefined();
      expect(result.llmQuality).toBeDefined();
    });

    it('应该支持自定义评估选项', async () => {
      const content = '测试内容';
      const options: QualityEvaluationOptions = {
        includeOriginality: false,
        includePlatformCompliance: true,
        includeLLMQuality: true,
        enableDetailedReport: false,
        strictMode: true,
        customWeights: {
          originality: 0.2,
          platformCompliance: 0.4,
          llmQuality: 0.4
        }
      };

      const result = await evaluator.evaluateContent(content, mockPlatform, [mockNote], options);

      expect(result.originality).toBeNull();
      expect(result.platformCompliance).toBeDefined();
      expect(result.llmQuality).toBeDefined();
      expect(mockPlatformComplianceEvaluator.evaluateCompliance).toHaveBeenCalledWith(
        content,
        mockPlatform,
        { strictMode: true }
      );
    });

    it('应该处理评估错误', async () => {
      const content = '测试内容';
      mockOriginalityDetector.detectOriginality.mockRejectedValue(new Error('原创性检测失败'));

      await expect(evaluator.evaluateContent(content, mockPlatform, [mockNote]))
        .rejects.toThrow(QualityAssessmentError);
    });

    it('应该验证输入参数', async () => {
      await expect(evaluator.evaluateContent('', mockPlatform))
        .rejects.toThrow(QualityAssessmentError);
    });
  });

  describe('batchEvaluate', () => {
    it('应该批量评估多个内容', async () => {
      const requests: ContentEvaluationRequest[] = [
        {
          content: '内容1',
          platform: mockPlatform,
          sourceNotes: [mockNote]
        },
        {
          content: '内容2',
          platform: mockPlatform
        }
      ];

      const options: BatchEvaluationOptions = {
        batchSize: 2,
        maxConcurrency: 1,
        continueOnError: true
      };

      const result = await evaluator.batchEvaluate(requests, options);

      expect(result).toBeDefined();
      expect(result.results).toHaveLength(2);
      expect(result.summary).toBeDefined();
      expect(result.summary.totalProcessed).toBe(2);
      expect(result.summary.successCount).toBe(2);
      expect(result.summary.errorCount).toBe(0);
    });

    it('应该处理批量评估中的错误', async () => {
      const requests: ContentEvaluationRequest[] = [
        {
          content: '',
          platform: mockPlatform
        }
      ];

      const options: BatchEvaluationOptions = {
        continueOnError: true
      };

      const result = await evaluator.batchEvaluate(requests, options);

      expect(result.summary.errorCount).toBeGreaterThan(0);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('quickEvaluate', () => {
    it('应该快速评估内容', async () => {
      const content = '这是一个快速评估的测试内容';

      const result = await evaluator.quickEvaluate(content, mockPlatform);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.grade).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.quickFixes).toBeInstanceOf(Array);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('应该在快速模式下跳过LLM评估', async () => {
      const content = '快速评估内容';

      await evaluator.quickEvaluate(content, mockPlatform);

      expect(mockAIService.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理LLM服务错误', async () => {
      const content = '测试内容';
      mockAIService.sendMessage.mockRejectedValue(new Error('LLM服务不可用'));

      await expect(evaluator.evaluateContent(content, mockPlatform))
        .rejects.toThrow(QualityAssessmentError);
    });

    it('应该处理平台适配度评估错误', async () => {
      const content = '测试内容';
      mockPlatformComplianceEvaluator.evaluateCompliance.mockRejectedValue(new Error('平台评估失败'));

      await expect(evaluator.evaluateContent(content, mockPlatform))
        .rejects.toThrow(QualityAssessmentError);
    });

    it('应该处理无效的LLM响应', async () => {
      const content = '测试内容';
      mockAIService.sendMessage.mockResolvedValue({
        id: 'response-2',
        role: 'assistant',
        content: '无效的JSON响应',
        timestamp: Date.now()
      });

      await expect(evaluator.evaluateContent(content, mockPlatform))
        .rejects.toThrow(QualityAssessmentError);
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内完成评估', async () => {
      const content = '性能测试内容';
      const startTime = Date.now();

      const result = await evaluator.evaluateContent(content, mockPlatform);

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(5000); // 5秒内完成
      expect(result.processingTime).toBeLessThan(5000);
    });

    it('应该在快速模式下更快完成', async () => {
      const content = '快速评估性能测试';
      const startTime = Date.now();

      const result = await evaluator.quickEvaluate(content, mockPlatform);

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(1000); // 1秒内完成
      expect(result.processingTime).toBeLessThan(1000);
    });
  });

  describe('边界情况', () => {
    it('应该处理极长内容', async () => {
      const longContent = '这是一个很长的内容。'.repeat(1000);

      const result = await evaluator.evaluateContent(longContent, mockPlatform);

      expect(result).toBeDefined();
      expect(result.metadata.contentLength).toBe(longContent.length);
    });

    it('应该处理特殊字符', async () => {
      const specialContent = '🎉💫✨🌟⭐️🔥💯👍🏻❤️😍🥰';

      const result = await evaluator.evaluateContent(specialContent, mockPlatform);

      expect(result).toBeDefined();
    });

    it('应该处理混合语言内容', async () => {
      const mixedContent = 'Hello 世界! This is a mixed language content. 这是混合语言内容。';

      const result = await evaluator.evaluateContent(mixedContent, mockPlatform);

      expect(result).toBeDefined();
    });
  });
}); 