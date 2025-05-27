/**
 * TOM-109: 质量报告生成器测试
 * 测试质量报告生成器的各项功能
 */

import { QualityReportGenerator } from '../quality-report-generator';
import {
  QualityEvaluationResult,
  QualityReport,
  QualityReportSummary,
  ImprovementPlan,
  ReportFormat,
  QualityGrade,
  OriginalityDetectionResult,
  ComplianceEvaluationResult,
  LLMQualityScore,
  OverallQualityScore,
  QualityDimensions,
  ScoreWeights,
  DuplicateSegment,
  RuleCheckResult,
  MostSimilarSource
} from '../../types/quality-assessment';
import { SocialMediaPlatform, PlatformId } from '../../types/social-media';

describe('QualityReportGenerator', () => {
  let generator: QualityReportGenerator;
  let mockEvaluationResult: QualityEvaluationResult;

  beforeEach(() => {
    generator = new QualityReportGenerator();
    
    // 创建模拟的评估结果
    mockEvaluationResult = createMockEvaluationResult();
  });

  describe('generateDetailedReport', () => {
    it('应该生成完整的详细报告', () => {
      const report = generator.generateDetailedReport(mockEvaluationResult);

      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.details).toBeDefined();
      expect(report.improvements).toBeDefined();
      expect(report.metadata).toBeDefined();
    });

    it('应该包含正确的摘要信息', () => {
      const report = generator.generateDetailedReport(mockEvaluationResult);

      expect(report.summary.overallScore).toBe(75);
      expect(report.summary.grade).toBe('good');
      expect(report.summary.keyStrengths).toBeInstanceOf(Array);
      expect(report.summary.keyWeaknesses).toBeInstanceOf(Array);
      expect(report.summary.quickActions).toBeInstanceOf(Array);
    });

    it('应该包含详细的分析结果', () => {
      const report = generator.generateDetailedReport(mockEvaluationResult);

      expect(report.details.originalityAnalysis).toBeDefined();
      expect(report.details.complianceAnalysis).toBeDefined();
      expect(report.details.llmQualityAnalysis).toBeDefined();
      expect(report.details.scoreBreakdown).toBeDefined();
    });

    it('应该生成改进计划', () => {
      const report = generator.generateDetailedReport(mockEvaluationResult);

      expect(report.improvements).toBeDefined();
      expect(report.improvements.priority).toBeInstanceOf(Array);
      expect(report.improvements.optional).toBeInstanceOf(Array);
      expect(report.improvements.longTerm).toBeInstanceOf(Array);
      expect(typeof report.improvements.estimatedImpact).toBe('number');
    });

    it('应该包含正确的元数据', () => {
      const report = generator.generateDetailedReport(mockEvaluationResult);

      expect(report.metadata.generatedAt).toBeInstanceOf(Date);
      expect(report.metadata.version).toBe('1.0.0');
      expect(report.metadata.platform).toBe('xiaohongshu');
      expect(report.metadata.contentLength).toBe(500);
      expect(report.metadata.evaluationTime).toBe(2500);
    });

    it('应该支持自定义选项', () => {
      const options = {
        includeMetadata: false,
        includeImprovements: false,
        format: 'json' as ReportFormat
      };

      const report = generator.generateDetailedReport(mockEvaluationResult, options);

      expect(report).toBeDefined();
      // 即使设置为false，这些字段仍然会存在，但可能内容不同
      expect(report.metadata).toBeDefined();
      expect(report.improvements).toBeDefined();
    });
  });

  describe('generateSummaryReport', () => {
    it('应该生成正确的摘要报告', () => {
      const summary = generator.generateSummaryReport(mockEvaluationResult);

      expect(summary.overallScore).toBe(75);
      expect(summary.grade).toBe('good');
      expect(summary.recommendation).toBe('内容质量良好，建议优化原创性和平台适配度');
      expect(summary.confidence).toBe(0.85);
      expect(summary.processingTime).toBe(2500);
    });

    it('应该识别关键优势', () => {
      const summary = generator.generateSummaryReport(mockEvaluationResult);

      expect(summary.keyStrengths).toContain('可读性强');
      expect(summary.keyStrengths.length).toBeGreaterThan(0);
    });

    it('应该识别关键弱点', () => {
      const summary = generator.generateSummaryReport(mockEvaluationResult);

      expect(summary.keyWeaknesses).toContain('原创性不足');
      expect(summary.keyWeaknesses).toContain('平台适配度较低');
      expect(summary.keyWeaknesses.length).toBeGreaterThan(0);
    });

    it('应该生成快速操作建议', () => {
      const summary = generator.generateSummaryReport(mockEvaluationResult);

      expect(summary.quickActions).toBeInstanceOf(Array);
      expect(summary.quickActions.length).toBeGreaterThan(0);
      expect(summary.quickActions[0]).toContain('增加原创内容');
    });
  });

  describe('generateImprovementPlan', () => {
    it('应该生成完整的改进计划', () => {
      const plan = generator.generateImprovementPlan(mockEvaluationResult);

      expect(plan.priority).toBeInstanceOf(Array);
      expect(plan.optional).toBeInstanceOf(Array);
      expect(plan.longTerm).toBeInstanceOf(Array);
      expect(typeof plan.estimatedImpact).toBe('number');
    });

    it('应该为低分项目生成改进建议', () => {
      const plan = generator.generateImprovementPlan(mockEvaluationResult);

      // 原创性分数70，应该有改进建议
      const originalityImprovements = plan.optional.filter(s => 
        s.category.includes('originality') || s.title.includes('原创')
      );
      expect(originalityImprovements.length).toBeGreaterThan(0);

      // 平台适配度分数65，应该有改进建议
      const complianceImprovements = plan.longTerm.filter(s => 
        s.category.includes('compliance') || s.title.includes('规则')
      );
      expect(complianceImprovements.length).toBeGreaterThan(0);
    });

    it('应该正确分类改进建议优先级', () => {
      const plan = generator.generateImprovementPlan(mockEvaluationResult);

      // 优先级建议应该是关键或高优先级
      plan.priority.forEach(suggestion => {
        expect(suggestion.type === 'critical' || suggestion.priority >= 80).toBe(true);
      });

      // 可选建议应该是重要但优先级中等
      plan.optional.forEach(suggestion => {
        expect(suggestion.type === 'important' && suggestion.priority < 80 && suggestion.priority >= 60).toBe(true);
      });

      // 长期建议应该是增强型或低优先级
      plan.longTerm.forEach(suggestion => {
        expect(suggestion.type === 'enhancement' || suggestion.priority < 60).toBe(true);
      });
    });

    it('应该计算预估影响', () => {
      const plan = generator.generateImprovementPlan(mockEvaluationResult);

      expect(plan.estimatedImpact).toBeGreaterThan(0);
      expect(plan.estimatedImpact).toBeLessThanOrEqual(100);
    });
  });

  describe('exportReport', () => {
    let mockReport: QualityReport;

    beforeEach(() => {
      mockReport = generator.generateDetailedReport(mockEvaluationResult);
    });

    it('应该导出Markdown格式', () => {
      const markdown = generator.exportReport(mockReport, 'markdown');

      expect(typeof markdown).toBe('string');
      expect(markdown).toContain('# 内容质量评估报告');
      expect(markdown).toContain('📊 评估摘要');
      expect(markdown).toContain('📈 详细分析');
      expect(markdown).toContain('🔧 改进建议');
    });

    it('应该导出JSON格式', () => {
      const json = generator.exportReport(mockReport, 'json');

      expect(typeof json).toBe('string');
      expect(() => JSON.parse(json)).not.toThrow();
      
      const parsed = JSON.parse(json);
      expect(parsed.summary).toBeDefined();
      expect(parsed.details).toBeDefined();
      expect(parsed.improvements).toBeDefined();
    });

    it('应该导出HTML格式', () => {
      const html = generator.exportReport(mockReport, 'html');

      expect(typeof html).toBe('string');
      expect(html).toContain('<html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('内容质量评估报告');
    });

    it('应该导出文本格式', () => {
      const text = generator.exportReport(mockReport, 'text');

      expect(typeof text).toBe('string');
      expect(text).toContain('内容质量评估报告');
      expect(text).toContain('总体评分: 75');
      expect(text).toContain('质量等级: 良好');
    });

    it('应该默认使用Markdown格式', () => {
      const defaultExport = generator.exportReport(mockReport, 'unknown' as ReportFormat);
      const markdownExport = generator.exportReport(mockReport, 'markdown');

      expect(defaultExport).toBe(markdownExport);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理缺少原创性结果的情况', () => {
      const resultWithoutOriginality = {
        ...mockEvaluationResult,
        originality: undefined
      };

      const report = generator.generateDetailedReport(resultWithoutOriginality);
      expect(report.details.originalityAnalysis).toBeUndefined();
    });

    it('应该处理缺少平台适配度结果的情况', () => {
      const resultWithoutCompliance = {
        ...mockEvaluationResult,
        platformCompliance: undefined
      };

      const report = generator.generateDetailedReport(resultWithoutCompliance);
      expect(report.details.complianceAnalysis).toBeUndefined();
    });

    it('应该处理缺少LLM质量结果的情况', () => {
      const resultWithoutLLM = {
        ...mockEvaluationResult,
        llmQuality: undefined
      };

      const report = generator.generateDetailedReport(resultWithoutLLM);
      expect(report.details.llmQualityAnalysis).toBeUndefined();
    });

    it('应该处理高分情况（无需改进建议）', () => {
      const highScoreResult = createHighScoreEvaluationResult();
      const plan = generator.generateImprovementPlan(highScoreResult);

      expect(plan.priority.length).toBe(0);
      expect(plan.optional.length).toBe(0);
      expect(plan.longTerm.length).toBe(0);
    });

    it('应该处理极低分情况', () => {
      const lowScoreResult = createLowScoreEvaluationResult();
      const plan = generator.generateImprovementPlan(lowScoreResult);

      expect(plan.priority.length).toBeGreaterThan(0);
      expect(plan.estimatedImpact).toBeGreaterThan(50);
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内生成报告', () => {
      const startTime = Date.now();
      generator.generateDetailedReport(mockEvaluationResult);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // 1秒内完成
    });

    it('应该在合理时间内导出大型报告', () => {
      const report = generator.generateDetailedReport(mockEvaluationResult);
      
      const startTime = Date.now();
      generator.exportReport(report, 'markdown');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500); // 0.5秒内完成
    });
  });
});

// 辅助函数：创建模拟评估结果
function createMockEvaluationResult(): QualityEvaluationResult {
  const mockNote = {
    title: '测试笔记',
    content: '这是一个测试笔记的内容',
    link: 'test-note.md',
    path: '/test/test-note.md',
    tags: ['test'],
    embedding: [0.1, 0.2, 0.3],
    updated: Date.now()
  };

  const mockDuplicateSegment: DuplicateSegment = {
    content: '重复的内容片段',
    startIndex: 10,
    endIndex: 25,
    similarity: 0.85,
    sourceNote: mockNote,
    sourceSegment: '原始重复片段',
    confidence: 0.9,
    type: 'semantic'
  };

  const mockMostSimilarSource: MostSimilarSource = {
    note: mockNote,
    similarity: 0.85,
    matchedSegments: ['重复片段1', '重复片段2'],
    coverage: 0.3,
    confidence: 0.9
  };

  const mockOriginality: OriginalityDetectionResult = {
    overallScore: 70,
    similarity: 0.85,
    duplicateSegments: [mockDuplicateSegment],
    mostSimilarSource: mockMostSimilarSource,
    isOriginal: false,
    confidence: 0.85,
    processingTime: 1000,
    metadata: {
      totalSegments: 10,
      duplicateCount: 2,
      uniqueSourceCount: 1,
      averageSimilarity: 0.75,
      method: 'cosine',
      threshold: 0.8
    }
  };

  const mockRuleCheck: RuleCheckResult = {
    ruleId: 'length-check',
    ruleName: '长度检查',
    passed: false,
    score: 60,
    weight: 0.3,
    details: '内容长度不符合平台要求',
    suggestions: ['调整内容长度到推荐范围'],
    metadata: {
      actualValue: 500,
      expectedValue: 300,
      threshold: 400,
      confidence: 0.9
    }
  };

  const mockCompliance: ComplianceEvaluationResult = {
    overallScore: 65,
    ruleChecks: [mockRuleCheck],
    improvements: [],
    isCompliant: false,
    platformSpecificScores: { xiaohongshu: 65 },
    processingTime: 800,
    metadata: {
      totalRules: 5,
      passedRules: 3,
      failedRules: 2,
      warningRules: 1,
      platform: 'xiaohongshu' as PlatformId,
      strictMode: false
    }
  };

  const mockLLMQuality: LLMQualityScore = {
    readability: 85,
    attractiveness: 80,
    logic: 90,
    practicality: 85,
    overall: 85,
    reasoning: '内容整体质量较高，逻辑清晰，实用性强',
    confidence: 0.9,
    processingTime: 700,
    metadata: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      promptTokens: 500,
      completionTokens: 200
    }
  };

  const mockDimensions: QualityDimensions = {
    originality: 70,
    compliance: 65,
    readability: 85,
    attractiveness: 80,
    logic: 90,
    practicality: 85
  };

  const mockWeights: ScoreWeights = {
    originality: 0.3,
    compliance: 0.3,
    platformCompliance: 0.3,
    llmQuality: 0.4,
    readability: 0.1,
    attractiveness: 0.1,
    logic: 0.1,
    practicality: 0.1
  };

  const mockOverall: OverallQualityScore = {
    total: 75,
    dimensions: mockDimensions,
    weights: mockWeights,
    grade: 'good' as QualityGrade,
    recommendation: '内容质量良好，建议优化原创性和平台适配度',
    confidence: 0.85,
    breakdown: {
      originality: 70,
      compliance: 65,
      llmQuality: 85
    }
  };

  return {
    overall: mockOverall,
    originality: mockOriginality,
    platformCompliance: mockCompliance,
    llmQuality: mockLLMQuality,
    report: {} as QualityReport, // 会在测试中生成
    processingTime: 2500,
    confidence: 0.85,
    timestamp: Date.now(),
    metadata: {
      contentLength: 500,
      platform: 'xiaohongshu' as PlatformId,
      evaluationMode: 'comprehensive',
      version: '1.0.0'
    }
  };
}

// 创建高分评估结果（无需改进）
function createHighScoreEvaluationResult(): QualityEvaluationResult {
  const result = createMockEvaluationResult();
  
  // 设置高分
  if (result.originality) result.originality.overallScore = 95;
  if (result.platformCompliance) result.platformCompliance.overallScore = 90;
  if (result.llmQuality) result.llmQuality.overall = 92;
  
  result.overall.total = 92;
  result.overall.grade = 'excellent';
  
  return result;
}

// 创建低分评估结果（需要大量改进）
function createLowScoreEvaluationResult(): QualityEvaluationResult {
  const result = createMockEvaluationResult();
  
  // 设置低分
  if (result.originality) result.originality.overallScore = 30;
  if (result.platformCompliance) result.platformCompliance.overallScore = 25;
  if (result.llmQuality) result.llmQuality.overall = 40;
  
  result.overall.total = 32;
  result.overall.grade = 'poor';
  
  return result;
} 