/**
 * TOM-111: 平台适配度评估引擎实现
 * 提供基于规则的平台适配度评估和改进建议生成
 */

import { SocialMediaPlatform, PlatformId } from '../types/social-media';
import {
  ComplianceRule,
  ComplianceEvaluationOptions,
  ComplianceEvaluationResult,
  RuleCheckResult,
  ImprovementSuggestion,
  RuleType,
  RuleSeverity,
  ImprovementType,
  QualityAssessmentError,
  QualityAssessmentErrorType
} from '../types/quality-assessment';

/**
 * 平台适配度评估器
 * 基于规则引擎评估内容在特定平台的适配度
 */
export class PlatformComplianceEvaluator {
  private platformRules: Map<PlatformId, ComplianceRule[]>;
  private readonly defaultOptions: Required<ComplianceEvaluationOptions>;

  constructor() {
    this.platformRules = new Map();
    this.initializePlatformRules();
    
    // 默认配置
    this.defaultOptions = {
      enabledRules: [],
      strictMode: false,
      includeWarnings: true,
      customWeights: {},
      skipOptionalRules: false
    };
  }

  /**
   * 评估平台适配度
   */
  async evaluateCompliance(
    content: string,
    platform: SocialMediaPlatform,
    options?: ComplianceEvaluationOptions
  ): Promise<ComplianceEvaluationResult> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };

    try {
      // 输入验证
      this.validateInput(content, platform);

      // 获取平台规则
      const rules = this.getPlatformRules(platform.id, opts);

      // 执行规则检查
      const ruleChecks = this.executeRuleChecks(content, platform, rules);

      // 计算总体评分
      const overallScore = this.calculateOverallScore(ruleChecks, opts.strictMode);

      // 生成改进建议
      const improvements = this.generateImprovementSuggestions(ruleChecks);

      // 判断是否符合要求
      const isCompliant = this.determineCompliance(ruleChecks, overallScore, opts.strictMode);

      // 计算平台特定评分
      const platformSpecificScores = this.calculatePlatformSpecificScores(ruleChecks);

      const processingTime = Date.now() - startTime;

      return {
        overallScore,
        ruleChecks,
        improvements,
        isCompliant,
        platformSpecificScores,
        processingTime,
        metadata: {
          totalRules: rules.length,
          passedRules: ruleChecks.filter(r => r.passed).length,
          failedRules: ruleChecks.filter(r => !r.passed).length,
          warningRules: ruleChecks.filter(r => r.metadata?.confidence && r.metadata.confidence < 0.8).length,
          platform: platform.id,
          strictMode: opts.strictMode
        }
      };

    } catch (error) {
      throw new QualityAssessmentError(
        `平台适配度评估失败: ${error.message}`,
        QualityAssessmentErrorType.COMPLIANCE_EVALUATION_ERROR,
        { platform: platform.id, contentLength: content.length }
      );
    }
  }

  /**
   * 检查特定规则
   */
  checkRule(content: string, rule: ComplianceRule, platform: SocialMediaPlatform): RuleCheckResult {
    try {
      return rule.validator(content, platform);
    } catch (error) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        passed: false,
        score: 0,
        weight: rule.weight,
        details: `规则检查失败: ${error.message}`,
        suggestions: ['请检查内容格式是否正确'],
        metadata: {
          confidence: 0,
          actualValue: null,
          expectedValue: null
        }
      };
    }
  }

  /**
   * 生成改进建议
   */
  generateImprovementSuggestions(ruleChecks: RuleCheckResult[]): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    for (const check of ruleChecks) {
      if (!check.passed && check.suggestions) {
        for (const suggestion of check.suggestions) {
          suggestions.push({
            type: this.determineSuggestionType(check.score, check.weight),
            category: this.getRuleCategory(check.ruleId),
            title: `${check.ruleName}改进建议`,
            description: suggestion,
            impact: this.calculateImpact(check.weight, check.score),
            effort: this.estimateEffort(check.ruleId),
            priority: this.calculatePriority(check.weight, check.score),
            actionable: true,
            examples: this.getExamples(check.ruleId),
            expectedImpact: this.calculateImpact(check.weight, check.score),
            estimatedEffort: this.getEffortDescription(this.estimateEffort(check.ruleId))
          });
        }
      }
    }

    // 按优先级排序
    return suggestions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 更新规则配置
   */
  updateRules(platformId: PlatformId, rules: ComplianceRule[]): void {
    this.platformRules.set(platformId, rules);
  }

  /**
   * 获取平台规则
   */
  getPlatformRules(platformId: PlatformId, options: Required<ComplianceEvaluationOptions>): ComplianceRule[] {
    const allRules = this.platformRules.get(platformId) || [];
    
    let filteredRules = allRules.filter(rule => rule.enabled);

    // 应用启用规则过滤
    if (options.enabledRules.length > 0) {
      filteredRules = filteredRules.filter(rule => options.enabledRules.includes(rule.id));
    }

    // 跳过可选规则
    if (options.skipOptionalRules) {
      filteredRules = filteredRules.filter(rule => rule.severity !== 'info');
    }

    return filteredRules;
  }

  // ==================== 私有方法 ====================

  /**
   * 初始化平台规则
   */
  private initializePlatformRules(): void {
    // 小红书规则
    this.platformRules.set('xiaohongshu', this.createXiaohongshuRules());
    
    // Twitter规则
    this.platformRules.set('twitter', this.createTwitterRules());
    
    // 微信公众号规则
    this.platformRules.set('wechat', this.createWechatRules());
    
    // 个人博客规则
    this.platformRules.set('blog', this.createBlogRules());
    
    // 头条号规则
    this.platformRules.set('toutiao', this.createToutiaoRules());
  }

  /**
   * 创建小红书规则
   */
  private createXiaohongshuRules(): ComplianceRule[] {
    return [
      {
        id: 'xhs-emoji-density',
        name: '表情符号密度检查',
        description: '检查表情符号使用密度是否适当',
        type: 'style',
        severity: 'warning',
        weight: 0.2,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
          const emojiCount = (content.match(emojiRegex) || []).length;
          const density = emojiCount / (content.length / 100); // 每100字符的表情数
          
          // 调整密度范围，允许更灵活的表情符号使用
          const passed = density >= 1 && density <= 8;
          const score = passed ? 100 : Math.max(0, 100 - Math.abs(density - 4) * 15);
          
          return {
            ruleId: 'xhs-emoji-density',
            ruleName: '表情符号密度检查',
            passed,
            score,
            weight: 0.2,
            details: `表情符号密度: ${density.toFixed(2)}/100字符 (建议: 1-8)`,
            suggestions: passed ? [] : ['建议增加适量表情符号提升内容活跃度', '避免过度使用表情符号'],
            metadata: {
              actualValue: density,
              expectedValue: { min: 1, max: 8 },
              confidence: 0.9
            }
          };
        }
      },
      {
        id: 'xhs-interaction-questions',
        name: '互动问题检查',
        description: '检查是否包含互动问题',
        type: 'interaction',
        severity: 'warning',
        weight: 0.25,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const questionPatterns = [
            /你们觉得.*?[？?]/g,
            /大家.*?[？?]/g,
            /有没有.*?[？?]/g,
            /怎么.*?[？?]/g,
            /评论区.*?/g,
            /留言.*?/g
          ];
          
          const questionCount = questionPatterns.reduce((count, pattern) => {
            return count + (content.match(pattern) || []).length;
          }, 0);
          
          const passed = questionCount >= 1;
          const score = Math.min(100, questionCount * 50);
          
          return {
            ruleId: 'xhs-interaction-questions',
            ruleName: '互动问题检查',
            passed,
            score,
            weight: 0.25,
            details: `互动问题数量: ${questionCount} (建议: ≥1)`,
            suggestions: passed ? [] : ['添加互动问题增加用户参与度', '例如："你们觉得怎么样？"', '鼓励用户在评论区分享经验'],
            metadata: {
              actualValue: questionCount,
              expectedValue: { min: 1 },
              confidence: 0.85
            }
          };
        }
      },
      {
        id: 'xhs-visual-language',
        name: '视觉语言检查',
        description: '检查是否使用视觉化语言',
        type: 'style',
        severity: 'info',
        weight: 0.15,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const visualKeywords = ['颜值', '好看', '美', '漂亮', '颜色', '质感', '手感', '外观', '设计', '包装'];
          const foundKeywords = visualKeywords.filter(keyword => content.includes(keyword));
          
          const passed = foundKeywords.length >= 2;
          const score = Math.min(100, foundKeywords.length * 25);
          
          return {
            ruleId: 'xhs-visual-language',
            ruleName: '视觉语言检查',
            passed,
            score,
            weight: 0.15,
            details: `视觉关键词: ${foundKeywords.length} (建议: ≥2)`,
            suggestions: passed ? [] : ['增加视觉描述词汇', '描述产品外观、颜色、质感等'],
            metadata: {
              actualValue: foundKeywords.length,
              expectedValue: { min: 2 },
              confidence: 0.8
            }
          };
        }
      },
      {
        id: 'xhs-hashtag-usage',
        name: '标签使用检查',
        description: '检查标签使用是否合适',
        type: 'format',
        severity: 'warning',
        weight: 0.2,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const hashtagRegex = /#[^\s#]+/g;
          const hashtagCount = (content.match(hashtagRegex) || []).length;
          
          const passed = hashtagCount >= 3 && hashtagCount <= 10;
          const score = passed ? 100 : Math.max(0, 100 - Math.abs(hashtagCount - 6) * 10);
          
          return {
            ruleId: 'xhs-hashtag-usage',
            ruleName: '标签使用检查',
            passed,
            score,
            weight: 0.2,
            details: `标签数量: ${hashtagCount} (建议: 3-10)`,
            suggestions: passed ? [] : ['添加相关标签提升曝光度', '避免标签过多影响阅读体验'],
            metadata: {
              actualValue: hashtagCount,
              expectedValue: { min: 3, max: 10 },
              confidence: 0.95
            }
          };
        }
      },
      {
        id: 'xhs-length-check',
        name: '内容长度检查',
        description: '检查内容长度是否适合小红书',
        type: 'length',
        severity: 'error',
        weight: 0.2,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const length = content.length;
          const passed = length >= 50 && length <= 1000;
          const score = passed ? 100 : Math.max(0, 100 - Math.abs(length - 500) / 10);
          
          return {
            ruleId: 'xhs-length-check',
            ruleName: '内容长度检查',
            passed,
            score,
            weight: 0.2,
            details: `内容长度: ${length}字符 (建议: 50-1000)`,
            suggestions: passed ? [] : length < 50 ? ['内容过短，建议增加更多细节'] : ['内容过长，建议精简表达'],
            metadata: {
              actualValue: length,
              expectedValue: { min: 50, max: 1000 },
              confidence: 1.0
            }
          };
        }
      }
    ];
  }

  /**
   * 创建Twitter规则
   */
  private createTwitterRules(): ComplianceRule[] {
    return [
      {
        id: 'twitter-character-limit',
        name: '字符限制检查',
        description: '检查是否超过Twitter字符限制',
        type: 'length',
        severity: 'error',
        weight: 0.3,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const length = content.length;
          const passed = length <= 280;
          const score = passed ? 100 : Math.max(0, 100 - (length - 280) / 5);
          
          return {
            ruleId: 'twitter-character-limit',
            ruleName: '字符限制检查',
            passed,
            score,
            weight: 0.3,
            details: `字符数: ${length}/280`,
            suggestions: passed ? [] : ['内容超过280字符限制，请精简表达', '考虑分成多条推文'],
            metadata: {
              actualValue: length,
              expectedValue: { max: 280 },
              confidence: 1.0
            }
          };
        }
      },
      {
        id: 'twitter-hashtag-count',
        name: '标签数量检查',
        description: '检查标签数量是否适当',
        type: 'format',
        severity: 'warning',
        weight: 0.2,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const hashtagRegex = /#[^\s#]+/g;
          const hashtagCount = (content.match(hashtagRegex) || []).length;
          
          const passed = hashtagCount <= 3;
          const score = passed ? 100 : Math.max(0, 100 - (hashtagCount - 3) * 20);
          
          return {
            ruleId: 'twitter-hashtag-count',
            ruleName: '标签数量检查',
            passed,
            score,
            weight: 0.2,
            details: `标签数量: ${hashtagCount} (建议: ≤3)`,
            suggestions: passed ? [] : ['减少标签数量，避免显得像垃圾信息'],
            metadata: {
              actualValue: hashtagCount,
              expectedValue: { max: 3 },
              confidence: 0.9
            }
          };
        }
      },
      {
        id: 'twitter-brevity',
        name: '简洁性检查',
        description: '检查内容是否简洁明了',
        type: 'style',
        severity: 'info',
        weight: 0.25,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const sentences = content.split(/[.!?。！？]/).filter(s => s.trim().length > 0);
          const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
          
          const passed = avgSentenceLength <= 50;
          const score = passed ? 100 : Math.max(0, 100 - (avgSentenceLength - 50) * 2);
          
          return {
            ruleId: 'twitter-brevity',
            ruleName: '简洁性检查',
            passed,
            score,
            weight: 0.25,
            details: `平均句长: ${avgSentenceLength.toFixed(1)}字符 (建议: ≤50)`,
            suggestions: passed ? [] : ['使用更简洁的表达方式', '拆分长句子'],
            metadata: {
              actualValue: avgSentenceLength,
              expectedValue: { max: 50 },
              confidence: 0.8
            }
          };
        }
      },
      {
        id: 'twitter-engagement',
        name: '互动元素检查',
        description: '检查是否包含互动元素',
        type: 'interaction',
        severity: 'info',
        weight: 0.25,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const engagementPatterns = [
            /@\w+/g, // 提及
            /RT\s/g, // 转推
            /[？?]$/g, // 问题
            /请.*转发/g,
            /点赞/g,
            /评论/g
          ];
          
          const engagementCount = engagementPatterns.reduce((count, pattern) => {
            return count + (content.match(pattern) || []).length;
          }, 0);
          
          const passed = engagementCount >= 1;
          const score = Math.min(100, engagementCount * 50);
          
          return {
            ruleId: 'twitter-engagement',
            ruleName: '互动元素检查',
            passed,
            score,
            weight: 0.25,
            details: `互动元素: ${engagementCount} (建议: ≥1)`,
            suggestions: passed ? [] : ['添加问题或呼吁行动', '使用@提及相关用户'],
            metadata: {
              actualValue: engagementCount,
              expectedValue: { min: 1 },
              confidence: 0.75
            }
          };
        }
      }
    ];
  }

  /**
   * 创建微信公众号规则
   */
  private createWechatRules(): ComplianceRule[] {
    return [
      {
        id: 'wechat-length-requirement',
        name: '内容长度要求',
        description: '检查内容长度是否符合公众号要求',
        type: 'length',
        severity: 'error',
        weight: 0.2,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const length = content.length;
          const passed = length >= 800;
          const score = passed ? 100 : Math.max(0, (length / 800) * 100);
          
          return {
            ruleId: 'wechat-length-requirement',
            ruleName: '内容长度要求',
            passed,
            score,
            weight: 0.2,
            details: `内容长度: ${length}字符 (建议: ≥800)`,
            suggestions: passed ? [] : ['增加更多详细内容和案例', '添加背景介绍和深度分析'],
            metadata: {
              actualValue: length,
              expectedValue: { min: 800 },
              confidence: 1.0
            }
          };
        }
      },
      {
        id: 'wechat-structure-required',
        name: '结构化要求',
        description: '检查内容是否具有良好的结构',
        type: 'structure',
        severity: 'warning',
        weight: 0.25,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const headingRegex = /^#{1,6}\s+.+$/gm;
          const headingCount = (content.match(headingRegex) || []).length;
          const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
          
          const hasGoodStructure = headingCount >= 3 && paragraphs.length >= 5;
          const score = Math.min(100, (headingCount * 20) + (paragraphs.length * 5));
          
          return {
            ruleId: 'wechat-structure-required',
            ruleName: '结构化要求',
            passed: hasGoodStructure,
            score,
            weight: 0.25,
            details: `标题: ${headingCount}, 段落: ${paragraphs.length}`,
            suggestions: hasGoodStructure ? [] : ['添加更多小标题组织内容', '合理分段提升可读性'],
            metadata: {
              actualValue: { headings: headingCount, paragraphs: paragraphs.length },
              expectedValue: { headings: { min: 3 }, paragraphs: { min: 5 } },
              confidence: 0.85
            }
          };
        }
      },
      {
        id: 'wechat-professional-tone',
        name: '专业语调检查',
        description: '检查是否使用专业语调',
        type: 'style',
        severity: 'info',
        weight: 0.2,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const professionalKeywords = ['研究', '分析', '数据', '报告', '专家', '调查', '统计', '趋势', '洞察', '建议'];
          const casualWords = ['哈哈', '嘻嘻', '哇', '超级', '巨', '爆'];
          
          const professionalCount = professionalKeywords.filter(word => content.includes(word)).length;
          const casualCount = casualWords.filter(word => content.includes(word)).length;
          
          const score = Math.max(0, Math.min(100, (professionalCount * 15) - (casualCount * 10) + 50));
          const passed = score >= 60;
          
          return {
            ruleId: 'wechat-professional-tone',
            ruleName: '专业语调检查',
            passed,
            score,
            weight: 0.2,
            details: `专业词汇: ${professionalCount}, 口语化词汇: ${casualCount}`,
            suggestions: passed ? [] : ['使用更多专业术语', '避免过于口语化的表达'],
            metadata: {
              actualValue: { professional: professionalCount, casual: casualCount },
              confidence: 0.7
            }
          };
        }
      },
      {
        id: 'wechat-example-usage',
        name: '示例使用检查',
        description: '检查是否包含具体示例',
        type: 'content',
        severity: 'warning',
        weight: 0.2,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const examplePatterns = [
            /例如/g,
            /比如/g,
            /举例/g,
            /案例/g,
            /实例/g,
            /具体来说/g
          ];
          
          const exampleCount = examplePatterns.reduce((count, pattern) => {
            return count + (content.match(pattern) || []).length;
          }, 0);
          
          const passed = exampleCount >= 2;
          const score = Math.min(100, exampleCount * 30);
          
          return {
            ruleId: 'wechat-example-usage',
            ruleName: '示例使用检查',
            passed,
            score,
            weight: 0.2,
            details: `示例数量: ${exampleCount} (建议: ≥2)`,
            suggestions: passed ? [] : ['添加具体案例和示例', '用实际例子说明观点'],
            metadata: {
              actualValue: exampleCount,
              expectedValue: { min: 2 },
              confidence: 0.8
            }
          };
        }
      },
      {
        id: 'wechat-heading-levels',
        name: '标题层级检查',
        description: '检查标题层级是否合理',
        type: 'structure',
        severity: 'info',
        weight: 0.15,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const h1Regex = /^#\s+.+$/gm;
          const h2Regex = /^##\s+.+$/gm;
          const h3Regex = /^###\s+.+$/gm;
          
          const h1Count = (content.match(h1Regex) || []).length;
          const h2Count = (content.match(h2Regex) || []).length;
          const h3Count = (content.match(h3Regex) || []).length;
          
          const hasGoodHierarchy = h1Count >= 1 && h2Count >= 2;
          const score = Math.min(100, (h1Count * 30) + (h2Count * 20) + (h3Count * 10));
          
          return {
            ruleId: 'wechat-heading-levels',
            ruleName: '标题层级检查',
            passed: hasGoodHierarchy,
            score,
            weight: 0.15,
            details: `H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}`,
            suggestions: hasGoodHierarchy ? [] : ['使用合理的标题层级结构', '确保有主标题和副标题'],
            metadata: {
              actualValue: { h1: h1Count, h2: h2Count, h3: h3Count },
              expectedValue: { h1: { min: 1 }, h2: { min: 2 } },
              confidence: 0.9
            }
          };
        }
      }
    ];
  }

  /**
   * 创建个人博客规则
   */
  private createBlogRules(): ComplianceRule[] {
    return [
      {
        id: 'blog-technical-depth',
        name: '技术深度检查',
        description: '检查技术内容的深度',
        type: 'content',
        severity: 'warning',
        weight: 0.3,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const technicalKeywords = ['算法', '架构', '设计模式', '性能', '优化', '源码', '原理', '实现', '框架', '库'];
          const foundKeywords = technicalKeywords.filter(word => content.includes(word));
          
          const passed = foundKeywords.length >= 3;
          const score = Math.min(100, foundKeywords.length * 20);
          
          return {
            ruleId: 'blog-technical-depth',
            ruleName: '技术深度检查',
            passed,
            score,
            weight: 0.3,
            details: `技术关键词: ${foundKeywords.length} (建议: ≥3)`,
            suggestions: passed ? [] : ['增加技术深度内容', '讨论实现原理和技术细节'],
            metadata: {
              actualValue: foundKeywords.length,
              expectedValue: { min: 3 },
              confidence: 0.8
            }
          };
        }
      },
      {
        id: 'blog-code-examples',
        name: '代码示例检查',
        description: '检查是否包含代码示例',
        type: 'content',
        severity: 'warning',
        weight: 0.25,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const codeBlockRegex = /```[\s\S]*?```/g;
          const inlineCodeRegex = /`[^`]+`/g;
          
          const codeBlockCount = (content.match(codeBlockRegex) || []).length;
          const inlineCodeCount = (content.match(inlineCodeRegex) || []).length;
          
          const totalCodeCount = codeBlockCount + inlineCodeCount;
          const passed = totalCodeCount >= 2;
          const score = Math.min(100, totalCodeCount * 25);
          
          return {
            ruleId: 'blog-code-examples',
            ruleName: '代码示例检查',
            passed,
            score,
            weight: 0.25,
            details: `代码块: ${codeBlockCount}, 行内代码: ${inlineCodeCount}`,
            suggestions: passed ? [] : ['添加代码示例说明概念', '提供可运行的代码片段'],
            metadata: {
              actualValue: totalCodeCount,
              expectedValue: { min: 2 },
              confidence: 0.95
            }
          };
        }
      },
      {
        id: 'blog-seo-optimization',
        name: 'SEO优化检查',
        description: '检查SEO优化要素',
        type: 'format',
        severity: 'info',
        weight: 0.2,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const h1Regex = /^#\s+.+$/gm;
          const linkRegex = /\[.*?\]\(.*?\)/g;
          const imageRegex = /!\[.*?\]\(.*?\)/g;
          
          const hasH1 = (content.match(h1Regex) || []).length >= 1;
          const linkCount = (content.match(linkRegex) || []).length;
          const imageCount = (content.match(imageRegex) || []).length;
          
          const seoScore = (hasH1 ? 40 : 0) + Math.min(30, linkCount * 10) + Math.min(30, imageCount * 15);
          const passed = seoScore >= 60;
          
          return {
            ruleId: 'blog-seo-optimization',
            ruleName: 'SEO优化检查',
            passed,
            score: seoScore,
            weight: 0.2,
            details: `H1标题: ${hasH1 ? '有' : '无'}, 链接: ${linkCount}, 图片: ${imageCount}`,
            suggestions: passed ? [] : ['添加H1主标题', '增加内部和外部链接', '添加相关图片'],
            metadata: {
              actualValue: { h1: hasH1, links: linkCount, images: imageCount },
              confidence: 0.85
            }
          };
        }
      },
      {
        id: 'blog-reference-section',
        name: '参考文献检查',
        description: '检查是否包含参考文献',
        type: 'structure',
        severity: 'info',
        weight: 0.15,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const referencePatterns = [
            /参考文献/g,
            /参考资料/g,
            /引用/g,
            /来源/g,
            /References/gi,
            /Bibliography/gi
          ];
          
          const hasReferences = referencePatterns.some(pattern => content.match(pattern));
          const linkCount = (content.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;
          
          const score = (hasReferences ? 60 : 0) + Math.min(40, linkCount * 10);
          const passed = score >= 50;
          
          return {
            ruleId: 'blog-reference-section',
            ruleName: '参考文献检查',
            passed,
            score,
            weight: 0.15,
            details: `参考文献标识: ${hasReferences ? '有' : '无'}, 外部链接: ${linkCount}`,
            suggestions: passed ? [] : ['添加参考文献部分', '引用权威资料来源'],
            metadata: {
              actualValue: { hasReferences, linkCount },
              confidence: 0.8
            }
          };
        }
      },
      {
        id: 'blog-length-check',
        name: '内容长度检查',
        description: '检查博客内容长度',
        type: 'length',
        severity: 'warning',
        weight: 0.1,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const length = content.length;
          const passed = length >= 1500;
          const score = passed ? 100 : Math.max(0, (length / 1500) * 100);
          
          return {
            ruleId: 'blog-length-check',
            ruleName: '内容长度检查',
            passed,
            score,
            weight: 0.1,
            details: `内容长度: ${length}字符 (建议: ≥1500)`,
            suggestions: passed ? [] : ['增加更多详细内容', '添加更多示例和解释'],
            metadata: {
              actualValue: length,
              expectedValue: { min: 1500 },
              confidence: 1.0
            }
          };
        }
      }
    ];
  }

  /**
   * 创建头条号规则
   */
  private createToutiaoRules(): ComplianceRule[] {
    return [
      {
        id: 'toutiao-title-attractiveness',
        name: '标题吸引力检查',
        description: '检查标题是否具有吸引力',
        type: 'content',
        severity: 'warning',
        weight: 0.3,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const titleMatch = content.match(/^#\s+(.+)$/m);
          if (!titleMatch) {
            return {
              ruleId: 'toutiao-title-attractiveness',
              ruleName: '标题吸引力检查',
              passed: false,
              score: 0,
              weight: 0.3,
              details: '未找到标题',
              suggestions: ['添加吸引人的标题'],
              metadata: { confidence: 1.0 }
            };
          }
          
          const title = titleMatch[1];
          const attractiveWords = ['揭秘', '震惊', '必看', '重磅', '独家', '深度', '全面', '最新', '热门', '爆料'];
          const foundWords = attractiveWords.filter(word => title.includes(word));
          
          const hasNumbers = /\d+/.test(title);
          const hasQuestion = /[？?]/.test(title);
          
          const score = Math.min(100, (foundWords.length * 30) + (hasNumbers ? 20 : 0) + (hasQuestion ? 20 : 0) + 30);
          const passed = score >= 60;
          
          return {
            ruleId: 'toutiao-title-attractiveness',
            ruleName: '标题吸引力检查',
            passed,
            score,
            weight: 0.3,
            details: `吸引词: ${foundWords.length}, 数字: ${hasNumbers ? '有' : '无'}, 疑问: ${hasQuestion ? '有' : '无'}`,
            suggestions: passed ? [] : ['使用更有吸引力的词汇', '在标题中加入数字', '使用疑问句式'],
            metadata: {
              actualValue: { attractiveWords: foundWords.length, hasNumbers, hasQuestion },
              confidence: 0.8
            }
          };
        }
      },
      {
        id: 'toutiao-popular-language',
        name: '通俗易懂检查',
        description: '检查语言是否通俗易懂',
        type: 'style',
        severity: 'warning',
        weight: 0.25,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const complexWords = ['鉴于', '基于', '综上所述', '因此', '然而', '此外', '另外', '总而言之'];
          const simpleWords = ['因为', '所以', '但是', '还有', '比如', '就是', '这样', '那么'];
          
          const complexCount = complexWords.filter(word => content.includes(word)).length;
          const simpleCount = simpleWords.filter(word => content.includes(word)).length;
          
          const score = Math.max(0, Math.min(100, (simpleCount * 15) - (complexCount * 10) + 50));
          const passed = score >= 60;
          
          return {
            ruleId: 'toutiao-popular-language',
            ruleName: '通俗易懂检查',
            passed,
            score,
            weight: 0.25,
            details: `简单词汇: ${simpleCount}, 复杂词汇: ${complexCount}`,
            suggestions: passed ? [] : ['使用更通俗的表达方式', '避免过于书面化的词汇'],
            metadata: {
              actualValue: { simple: simpleCount, complex: complexCount },
              confidence: 0.75
            }
          };
        }
      },
      {
        id: 'toutiao-discussion-prompt',
        name: '讨论引导检查',
        description: '检查是否引导讨论',
        type: 'interaction',
        severity: 'info',
        weight: 0.2,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const discussionPatterns = [
            /你怎么看/g,
            /大家觉得/g,
            /欢迎讨论/g,
            /说说你的看法/g,
            /评论区见/g,
            /留言/g
          ];
          
          const discussionCount = discussionPatterns.reduce((count, pattern) => {
            return count + (content.match(pattern) || []).length;
          }, 0);
          
          const passed = discussionCount >= 1;
          const score = Math.min(100, discussionCount * 50);
          
          return {
            ruleId: 'toutiao-discussion-prompt',
            ruleName: '讨论引导检查',
            passed,
            score,
            weight: 0.2,
            details: `讨论引导: ${discussionCount} (建议: ≥1)`,
            suggestions: passed ? [] : ['添加讨论引导语', '鼓励用户参与讨论'],
            metadata: {
              actualValue: discussionCount,
              expectedValue: { min: 1 },
              confidence: 0.85
            }
          };
        }
      },
      {
        id: 'toutiao-controversial-content',
        name: '争议内容检查',
        description: '检查是否包含适度争议内容',
        type: 'content',
        severity: 'info',
        weight: 0.15,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const controversialWords = ['争议', '质疑', '反对', '支持', '不同观点', '辩论', '分歧'];
          const foundWords = controversialWords.filter(word => content.includes(word));
          
          const score = Math.min(100, foundWords.length * 30 + 40);
          const passed = foundWords.length >= 1;
          
          return {
            ruleId: 'toutiao-controversial-content',
            ruleName: '争议内容检查',
            passed,
            score,
            weight: 0.15,
            details: `争议词汇: ${foundWords.length}`,
            suggestions: passed ? [] : ['适当添加不同观点', '引发思考和讨论'],
            metadata: {
              actualValue: foundWords.length,
              confidence: 0.7
            }
          };
        }
      },
      {
        id: 'toutiao-clickbait-level',
        name: '标题党程度检查',
        description: '检查标题党程度是否适中',
        type: 'content',
        severity: 'warning',
        weight: 0.1,
        enabled: true,
        platformSpecific: true,
        validator: (content: string) => {
          const titleMatch = content.match(/^#\s+(.+)$/m);
          if (!titleMatch) return {
            ruleId: 'toutiao-clickbait-level',
            ruleName: '标题党程度检查',
            passed: false,
            score: 0,
            weight: 0.1,
            details: '未找到标题',
            suggestions: ['添加标题'],
            metadata: { confidence: 1.0 }
          };
          
          const title = titleMatch[1];
          const clickbaitWords = ['震惊', '惊呆', '不敢相信', '绝对', '史上最', '终极', '秘密'];
          const foundClickbait = clickbaitWords.filter(word => title.includes(word));
          
          // 适度的标题党是好的，但不要过度
          // 调整评分逻辑：没有标题党词汇也可以通过，但建议适当使用
          const score = foundClickbait.length === 0 ? 80 : 
                       foundClickbait.length <= 2 ? 100 : 
                       Math.max(0, 100 - (foundClickbait.length - 2) * 30);
          const passed = score >= 70;
          
          return {
            ruleId: 'toutiao-clickbait-level',
            ruleName: '标题党程度检查',
            passed,
            score,
            weight: 0.1,
            details: `标题党词汇: ${foundClickbait.length} (建议: 1-2个)`,
            suggestions: passed ? [] : foundClickbait.length === 0 ? ['适当使用吸引人的词汇'] : ['减少过度夸张的表达'],
            metadata: {
              actualValue: foundClickbait.length,
              expectedValue: { min: 1, max: 2 },
              confidence: 0.8
            }
          };
        }
      }
    ];
  }

  /**
   * 输入验证
   */
  private validateInput(content: string, platform: SocialMediaPlatform): void {
    if (!content || content.trim().length === 0) {
      throw new Error('内容不能为空');
    }
    if (!platform || !platform.id) {
      throw new Error('平台信息不能为空');
    }
    if (!this.platformRules.has(platform.id)) {
      throw new Error(`不支持的平台: ${platform.id}`);
    }
  }

  /**
   * 执行规则检查
   */
  private executeRuleChecks(
    content: string,
    platform: SocialMediaPlatform,
    rules: ComplianceRule[]
  ): RuleCheckResult[] {
    return rules.map(rule => this.checkRule(content, rule, platform));
  }

  /**
   * 计算总体评分
   */
  private calculateOverallScore(ruleChecks: RuleCheckResult[], strictMode: boolean): number {
    if (ruleChecks.length === 0) return 0;

    const weightedScore = ruleChecks.reduce((sum, check) => {
      return sum + (check.score * check.weight);
    }, 0);

    const totalWeight = ruleChecks.reduce((sum, check) => sum + check.weight, 0);
    let score = totalWeight > 0 ? (weightedScore / totalWeight) : 0;

    // 严格模式下的额外惩罚
    if (strictMode) {
      const errorCount = ruleChecks.filter(check => !check.passed && check.weight > 0.2).length;
      score *= Math.max(0.5, 1 - (errorCount * 0.1));
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 判断是否符合要求
   */
  private determineCompliance(
    ruleChecks: RuleCheckResult[],
    overallScore: number,
    strictMode: boolean
  ): boolean {
    const threshold = strictMode ? 80 : 70;
    const criticalErrors = ruleChecks.filter(check => 
      !check.passed && check.weight >= 0.3
    ).length;

    return overallScore >= threshold && criticalErrors === 0;
  }

  /**
   * 计算平台特定评分
   */
  private calculatePlatformSpecificScores(ruleChecks: RuleCheckResult[]): Record<string, number> {
    const categories: Record<string, { total: number; weight: number }> = {};

    for (const check of ruleChecks) {
      const category = this.getRuleCategory(check.ruleId);
      if (!categories[category]) {
        categories[category] = { total: 0, weight: 0 };
      }
      categories[category].total += check.score * check.weight;
      categories[category].weight += check.weight;
    }

    const scores: Record<string, number> = {};
    for (const [category, data] of Object.entries(categories)) {
      scores[category] = data.weight > 0 ? data.total / data.weight : 0;
    }

    return scores;
  }

  /**
   * 确定建议类型
   */
  private determineSuggestionType(score: number, weight: number): ImprovementType {
    if (score < 30 && weight >= 0.3) return 'critical';
    if (score < 60 && weight >= 0.2) return 'important';
    if (score < 80) return 'optional';
    return 'enhancement';
  }

  /**
   * 获取规则分类
   */
  private getRuleCategory(ruleId: string): string {
    if (ruleId.includes('length')) return '长度';
    if (ruleId.includes('structure')) return '结构';
    if (ruleId.includes('style')) return '风格';
    if (ruleId.includes('interaction')) return '互动';
    if (ruleId.includes('format')) return '格式';
    if (ruleId.includes('content')) return '内容';
    return '其他';
  }

  /**
   * 计算影响度
   */
  private calculateImpact(weight: number, score: number): number {
    return Math.round(weight * (100 - score));
  }

  /**
   * 估算工作量
   */
  private estimateEffort(ruleId: string): number {
    // 根据规则类型估算修改难度
    if (ruleId.includes('length')) return 30;
    if (ruleId.includes('structure')) return 60;
    if (ruleId.includes('style')) return 40;
    if (ruleId.includes('interaction')) return 20;
    if (ruleId.includes('format')) return 25;
    return 35;
  }

  /**
   * 计算优先级
   */
  private calculatePriority(weight: number, score: number): number {
    return Math.round(weight * 100 * (1 - score / 100));
  }

  /**
   * 获取示例
   */
  private getExamples(ruleId: string): string[] {
    const examples: Record<string, string[]> = {
      'xhs-emoji-density': ['添加😊💕✨等表情符号', '在关键句子后加表情'],
      'xhs-interaction-questions': ['你们觉得怎么样？', '大家有什么好建议吗？'],
      'twitter-character-limit': ['精简表达', '分成多条推文'],
      'wechat-structure-required': ['添加小标题', '合理分段'],
      'blog-code-examples': ['```javascript\ncode here\n```', '`inline code`'],
      'toutiao-title-attractiveness': ['震惊！这个方法竟然...', '5个技巧让你...']
    };
    
    return examples[ruleId] || ['请参考平台最佳实践'];
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
} 