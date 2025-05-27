/**
 * TOM-109: 质量报告生成器
 * 负责生成详细的质量评估报告和改进建议
 */

import {
  QualityEvaluationResult,
  QualityReport,
  QualityReportSummary,
  QualityReportDetails,
  ImprovementPlan,
  ImprovementSuggestion,
  ReportOptions,
  ReportFormat,
  ReportMetadata,
  ImprovementType,
  QualityGrade,
  DuplicateSegment,
  RuleCheckResult
} from '../types/quality-assessment';

/**
 * 质量报告生成器
 * 提供多种格式的质量评估报告生成功能
 */
export class QualityReportGenerator {
  
  /**
   * 生成详细报告
   */
  generateDetailedReport(
    result: QualityEvaluationResult,
    options?: ReportOptions
  ): QualityReport {
    const opts = {
      includeMetadata: true,
      includeImprovements: true,
      includeDetails: true,
      format: 'markdown' as ReportFormat,
      language: 'zh' as const,
      template: '',
      ...options
    };

    const summary = this.generateSummaryReport(result);
    const details = this.generateReportDetails(result);
    const improvements = this.generateImprovementPlan(result);
    const metadata = this.generateReportMetadata(result, opts);

    return {
      summary,
      details,
      improvements,
      metadata
    };
  }

  /**
   * 生成摘要报告
   */
  generateSummaryReport(result: QualityEvaluationResult): QualityReportSummary {
    const { overall } = result;

    return {
      overallScore: overall.total,
      grade: overall.grade,
      recommendation: overall.recommendation,
      keyStrengths: this.identifyKeyStrengths(result),
      keyWeaknesses: this.identifyKeyWeaknesses(result),
      topRecommendations: this.getTopRecommendations(result),
      riskLevel: this.calculateRiskLevel(overall.total),
      quickActions: this.generateQuickActions(result),
      confidence: result.confidence,
      processingTime: result.processingTime
    };
  }

  /**
   * 生成改进建议
   */
  generateImprovementPlan(result: QualityEvaluationResult): ImprovementPlan {
    const suggestions: ImprovementSuggestion[] = [];

    // 原创性改进建议
    if (result.originality && result.originality.overallScore < 80) {
      suggestions.push(...this.generateOriginalityImprovements(result.originality));
    }

    // 平台适配度改进建议
    if (result.platformCompliance && result.platformCompliance.overallScore < 80) {
      suggestions.push(...this.generateComplianceImprovements(result.platformCompliance));
    }

    // LLM质量改进建议
    if (result.llmQuality && result.llmQuality.overall < 80) {
      suggestions.push(...this.generateLLMQualityImprovements(result.llmQuality));
    }

    // 按优先级分类
    const priority = suggestions.filter(s => s.type === 'critical' || s.priority >= 80);
    const optional = suggestions.filter(s => s.type === 'important' && s.priority < 80 && s.priority >= 60);
    const longTerm = suggestions.filter(s => s.type === 'enhancement' || s.priority < 60);

    // 计算预估影响和工作量
    const estimatedImpact = this.calculateEstimatedImpact(suggestions);
    const estimatedEffort = this.calculateEstimatedEffort(suggestions);

    return {
      priority,
      optional,
      longTerm,
      estimatedImpact,
      estimatedEffort,
      timeline: {
        immediate: priority.length,
        shortTerm: optional.length,
        longTerm: longTerm.length
      }
    };
  }

  /**
   * 导出报告
   */
  exportReport(report: QualityReport, format: ReportFormat): string {
    switch (format) {
      case 'markdown':
        return this.exportToMarkdown(report);
      case 'json':
        return this.exportToJSON(report);
      case 'html':
        return this.exportToHTML(report);
      case 'text':
        return this.exportToText(report);
      default:
        return this.exportToMarkdown(report);
    }
  }

  /**
   * 生成报告详情
   */
  private generateReportDetails(result: QualityEvaluationResult): QualityReportDetails {
    return {
      dimensionBreakdown: {
        originality: result.originality?.overallScore || 0,
        compliance: result.platformCompliance?.overallScore || 0,
        readability: result.llmQuality?.readability || 0,
        attractiveness: result.llmQuality?.attractiveness || 0,
        logic: result.llmQuality?.logic || 0,
        practicality: result.llmQuality?.practicality || 0
      },
      originalityAnalysis: result.originality ? {
        score: result.originality.overallScore,
        duplicateCount: result.originality.duplicateSegments.length,
        uniqueSourceCount: result.originality.metadata.uniqueSourceCount,
        riskSegments: result.originality.duplicateSegments,
        isOriginal: result.originality.isOriginal,
        duplicateSegments: result.originality.duplicateSegments.length,
        mostSimilarSource: result.originality.mostSimilarSource?.note?.title || 'N/A',
        confidence: result.originality.confidence
      } : undefined,

      complianceAnalysis: result.platformCompliance ? {
        score: result.platformCompliance.overallScore,
        passedRules: result.platformCompliance.metadata.passedRules,
        failedRules: result.platformCompliance.metadata.failedRules,
        criticalIssues: result.platformCompliance.ruleChecks.filter(r => !r.passed && r.weight >= 0.3),
        isCompliant: result.platformCompliance.isCompliant,
        totalRules: result.platformCompliance.metadata.totalRules,
        details: `通过 ${result.platformCompliance.metadata.passedRules}/${result.platformCompliance.metadata.totalRules} 项规则检查`
      } : undefined,

      llmQualityAnalysis: result.llmQuality ? {
        overallScore: result.llmQuality.overall,
        readability: result.llmQuality.readability,
        attractiveness: result.llmQuality.attractiveness,
        logic: result.llmQuality.logic,
        practicality: result.llmQuality.practicality,
        reasoning: result.llmQuality.reasoning,
        confidence: result.llmQuality.confidence
      } : undefined,

      scoreBreakdown: {
        originality: result.overall.breakdown.originality,
        compliance: result.overall.breakdown.compliance,
        llmQuality: result.overall.breakdown.llmQuality,
        weights: result.overall.weights
      }
    };
  }

  /**
   * 生成报告元数据
   */
  private generateReportMetadata(
    result: QualityEvaluationResult,
    options: any
  ): ReportMetadata {
    return {
      generatedAt: new Date(),
      version: '1.0.0',
      platform: result.metadata.platform,
      contentLength: result.metadata.contentLength,
      evaluationTime: result.processingTime,
      evaluationMode: result.metadata.evaluationMode,
      confidence: result.confidence
    };
  }

  /**
   * 识别关键优势
   */
  private identifyKeyStrengths(result: QualityEvaluationResult): string[] {
    const strengths: string[] = [];

    if (result.originality && result.originality.overallScore >= 85) {
      strengths.push('内容原创性高');
    }

    if (result.platformCompliance && result.platformCompliance.overallScore >= 85) {
      strengths.push('平台适配度优秀');
    }

    if (result.llmQuality) {
      if (result.llmQuality.readability >= 85) strengths.push('可读性强');
      if (result.llmQuality.attractiveness >= 85) strengths.push('内容吸引力高');
      if (result.llmQuality.logic >= 85) strengths.push('逻辑性强');
      if (result.llmQuality.practicality >= 85) strengths.push('实用性高');
    }

    if (strengths.length === 0) {
      strengths.push('内容基础质量合格');
    }

    return strengths;
  }

  /**
   * 识别关键弱点
   */
  private identifyKeyWeaknesses(result: QualityEvaluationResult): string[] {
    const weaknesses: string[] = [];

    if (result.originality && result.originality.overallScore <= 70) {
      weaknesses.push('原创性不足');
    }

    if (result.platformCompliance && result.platformCompliance.overallScore <= 70) {
      weaknesses.push('平台适配度较低');
    }

    if (result.llmQuality) {
      if (result.llmQuality.readability < 70) weaknesses.push('可读性有待提升');
      if (result.llmQuality.attractiveness < 70) weaknesses.push('吸引力不足');
      if (result.llmQuality.logic < 70) weaknesses.push('逻辑性较弱');
      if (result.llmQuality.practicality < 70) weaknesses.push('实用性不高');
    }

    return weaknesses;
  }

  /**
   * 生成快速行动建议
   */
  private generateQuickActions(result: QualityEvaluationResult): string[] {
    const actions: string[] = [];

    if (result.originality && result.originality.overallScore <= 70) {
      actions.push('增加原创内容，减少直接引用');
    }

    if (result.platformCompliance && result.platformCompliance.overallScore <= 70) {
      actions.push('调整内容格式以符合平台规范');
    }

    if (result.llmQuality) {
      if (result.llmQuality.readability < 70) {
        actions.push('简化语言表达，提高可读性');
      }
      if (result.llmQuality.attractiveness < 70) {
        actions.push('增加吸引人的元素和表达');
      }
    }

    if (actions.length === 0) {
      actions.push('继续保持当前质量水平');
    }

    return actions;
  }

  /**
   * 生成原创性改进建议
   */
  private generateOriginalityImprovements(originality: any): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    if (originality.overallScore < 60) {
      suggestions.push({
        type: 'critical',
        category: 'originality',
        title: '提升内容原创性',
        description: '重写重复内容，增加个人观点和独特见解',
        impact: 85,
        effort: 70,
        priority: 90,
        actionable: true,
        examples: ['重新表述核心观点', '添加个人经验分享'],
        expectedImpact: originality.overallScore < 40 ? 30 : 15,
        estimatedEffort: '高'
      });
    } else if (originality.overallScore < 80) {
      suggestions.push({
        type: 'important',
        category: 'originality',
        title: '优化内容表达',
        description: '调整部分重复表述，增强内容独特性',
        impact: 60,
        effort: 40,
        priority: 70,
        actionable: true,
        examples: ['使用同义词替换', '重新组织段落结构'],
        expectedImpact: 20,
        estimatedEffort: '中'
      });
    }

    return suggestions;
  }

  /**
   * 生成合规性改进建议
   */
  private generateComplianceImprovements(compliance: any): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    // 从失败的规则检查中生成建议
    const failedRules = compliance.ruleChecks?.filter((rule: any) => !rule.passed) || [];
    
    for (const rule of failedRules.slice(0, 3)) { // 限制建议数量
      const priority = rule.weight * 100;
      suggestions.push({
        type: priority >= 80 ? 'important' : 'optional',
        category: 'compliance',
        title: rule.ruleName || '规则改进',
        description: rule.suggestions?.[0] || '请按照平台规范调整内容',
        impact: Math.round(rule.weight * 100),
        effort: this.getEffortFromRuleId(rule.ruleId),
        priority: Math.round(priority),
        actionable: true,
        examples: rule.suggestions || [],
        expectedImpact: Math.round(rule.weight * 100 * 0.2),
        estimatedEffort: this.getEffortDescription(this.getEffortFromRuleId(rule.ruleId))
      });
    }

    return suggestions;
  }

  /**
   * 生成LLM质量改进建议
   */
  private generateLLMQualityImprovements(llmQuality: any): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    // 如果整体质量很低，添加综合改进建议
    if (llmQuality.overall < 50) {
      suggestions.push({
        type: 'critical',
        category: 'llm-quality',
        title: '全面提升内容质量',
        description: '内容整体质量较低，需要全面重写和优化',
        impact: 90,
        effort: 80,
        priority: 95,
        actionable: true,
        examples: ['重新构思内容结构', '提升语言表达质量', '增强逻辑性'],
        expectedImpact: 25,
        estimatedEffort: '很高'
      });
    }

    if (llmQuality.readability < 70) {
      suggestions.push({
        type: 'important',
        category: 'readability',
        title: '提升可读性',
        description: '优化语言表达，使用更清晰的句式结构',
        impact: 75,
        effort: 50,
        priority: 75,
        actionable: true,
        examples: ['使用简单句式', '添加段落标题'],
        expectedImpact: 12,
        estimatedEffort: '中'
      });
    }

    if (llmQuality.attractiveness < 70) {
      suggestions.push({
        type: 'important',
        category: 'attractiveness',
        title: '增强吸引力',
        description: '添加有趣的元素，使用更生动的表达方式',
        impact: 70,
        effort: 60,
        priority: 70,
        actionable: true,
        examples: ['使用生动的比喻', '添加有趣的案例'],
        expectedImpact: 15,
        estimatedEffort: '中'
      });
    }

    if (llmQuality.logic < 70) {
      suggestions.push({
        type: 'important',
        category: 'logic',
        title: '改善逻辑性',
        description: '重新组织内容结构，确保论述逻辑清晰',
        impact: 80,
        effort: 70,
        priority: 80,
        actionable: true,
        examples: ['重新排列段落顺序', '添加逻辑连接词'],
        expectedImpact: 18,
        estimatedEffort: '高'
      });
    }

    if (llmQuality.practicality < 70) {
      suggestions.push({
        type: 'optional',
        category: 'practicality',
        title: '提升实用性',
        description: '添加具体示例和可操作的建议',
        impact: 65,
        effort: 50,
        priority: 65,
        actionable: true,
        examples: ['添加具体步骤', '提供实际案例'],
        expectedImpact: 10,
        estimatedEffort: '中'
      });
    }

    return suggestions;
  }

  /**
   * 计算预估影响
   */
  private calculateEstimatedImpact(suggestions: ImprovementSuggestion[]): number {
    return suggestions.reduce((total, suggestion) => total + suggestion.expectedImpact, 0);
  }

  /**
   * 计算预估工作量
   */
  private calculateEstimatedEffort(suggestions: ImprovementSuggestion[]): number {
    return suggestions.reduce((total, suggestion) => total + suggestion.effort, 0);
  }

  /**
   * 获取顶级推荐建议
   */
  private getTopRecommendations(result: QualityEvaluationResult): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    // 从各个评估结果中收集建议
    if (result.originality && result.originality.overallScore < 80) {
      suggestions.push(...this.generateOriginalityImprovements(result.originality));
    }

    if (result.platformCompliance && result.platformCompliance.overallScore < 80) {
      suggestions.push(...this.generateComplianceImprovements(result.platformCompliance));
    }

    if (result.llmQuality && result.llmQuality.overall < 80) {
      suggestions.push(...this.generateLLMQualityImprovements(result.llmQuality));
    }

    // 按优先级排序并返回前3个
    return suggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
  }

  /**
   * 计算风险等级
   */
  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    return 'high';
  }

  /**
   * 根据规则ID获取工作量
   */
  private getEffortFromRuleId(ruleId: string): number {
    if (ruleId?.includes('length')) return 30;
    if (ruleId?.includes('structure')) return 60;
    if (ruleId?.includes('style')) return 40;
    if (ruleId?.includes('interaction')) return 20;
    if (ruleId?.includes('format')) return 25;
    return 35;
  }

  /**
   * 获取工作量描述
   */
  private getEffortDescription(effort: number): string {
    if (effort <= 20) return '低';
    if (effort <= 40) return '中';
    if (effort <= 60) return '高';
    return '很高';
  }

  /**
   * 导出为Markdown格式
   */
  private exportToMarkdown(report: QualityReport): string {
    const { summary, details, improvements, metadata } = report;

    return `# 内容质量评估报告

## 📊 评估摘要

**总体评分**: ${summary.overallScore.toFixed(1)}/100  
**质量等级**: ${this.getGradeText(summary.grade)}  
**置信度**: ${(summary.confidence * 100).toFixed(1)}%  
**处理时间**: ${summary.processingTime}ms  

**建议**: ${summary.recommendation}

### 🎯 关键优势
${summary.keyStrengths.map(s => `- ${s}`).join('\n')}

### ⚠️ 需要改进
${summary.keyWeaknesses.map(s => `- ${s}`).join('\n')}

### 🚀 快速行动
${summary.quickActions.map(s => `- ${s}`).join('\n')}

## 📈 详细分析

### 原创性分析
${details.originalityAnalysis ? `
- **评分**: ${details.originalityAnalysis.score}/100
- **是否原创**: ${details.originalityAnalysis.isOriginal ? '是' : '否'}
- **重复片段**: ${details.originalityAnalysis.duplicateSegments}个
- **最相似来源**: ${details.originalityAnalysis.mostSimilarSource}
- **置信度**: ${(details.originalityAnalysis.confidence * 100).toFixed(1)}%
` : '未进行原创性检测'}

### 平台适配度分析
${details.complianceAnalysis ? `
- **评分**: ${details.complianceAnalysis.score}/100
- **是否合规**: ${details.complianceAnalysis.isCompliant ? '是' : '否'}
- **通过规则**: ${details.complianceAnalysis.passedRules}/${details.complianceAnalysis.totalRules}
- **详情**: ${details.complianceAnalysis.details}
` : '未进行平台适配度检测'}

### LLM质量分析
${details.llmQualityAnalysis ? `
- **综合评分**: ${details.llmQualityAnalysis.overallScore}/100
- **可读性**: ${details.llmQualityAnalysis.readability}/100
- **吸引力**: ${details.llmQualityAnalysis.attractiveness}/100
- **逻辑性**: ${details.llmQualityAnalysis.logic}/100
- **实用性**: ${details.llmQualityAnalysis.practicality}/100
- **评分理由**: ${details.llmQualityAnalysis.reasoning}
` : '未进行LLM质量评估'}

## 🔧 改进建议

### 🔴 优先改进 (${improvements.priority.length}项)
${improvements.priority.map(s => `
#### ${s.title}
- **描述**: ${s.description}
- **优先级**: ${s.priority}/100
- **预期影响**: +${s.expectedImpact}分
- **工作量**: ${s.estimatedEffort}
`).join('\n')}

### 🟡 可选改进 (${improvements.optional.length}项)
${improvements.optional.map(s => `
#### ${s.title}
- **描述**: ${s.description}
- **优先级**: ${s.priority}/100
- **预期影响**: +${s.expectedImpact}分
`).join('\n')}

### 🟢 长期优化 (${improvements.longTerm.length}项)
${improvements.longTerm.map(s => `
#### ${s.title}
- **描述**: ${s.description}
- **预期影响**: +${s.expectedImpact}分
`).join('\n')}

**预估总体改进效果**: +${improvements.estimatedImpact}分

---

*报告生成时间: ${metadata.generatedAt.toLocaleString()}*  
*评估版本: ${metadata.version}*  
*目标平台: ${metadata.platform}*`;
  }

  /**
   * 导出为JSON格式
   */
  private exportToJSON(report: QualityReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * 导出为HTML格式
   */
  private exportToHTML(report: QualityReport): string {
    // 简化的HTML导出
    const markdown = this.exportToMarkdown(report);
    return `<!DOCTYPE html>
<html>
<head>
    <title>内容质量评估报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1, h2, h3 { color: #333; }
        .score { font-size: 24px; font-weight: bold; color: #007acc; }
        .grade { padding: 4px 8px; border-radius: 4px; color: white; }
        .excellent { background-color: #28a745; }
        .good { background-color: #17a2b8; }
        .fair { background-color: #ffc107; color: #333; }
        .poor { background-color: #fd7e14; }
        .unacceptable { background-color: #dc3545; }
    </style>
</head>
<body>
    <pre>${markdown}</pre>
</body>
</html>`;
  }

  /**
   * 导出为纯文本格式
   */
  private exportToText(report: QualityReport): string {
    return this.exportToMarkdown(report).replace(/[#*-]/g, '');
  }

  /**
   * 获取等级文本
   */
  private getGradeText(grade: QualityGrade): string {
    const gradeTexts = {
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      poor: '较差',
      unacceptable: '不合格'
    };
    return gradeTexts[grade];
  }
} 