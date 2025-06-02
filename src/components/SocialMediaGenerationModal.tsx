import { Modal, App, Setting, Notice } from 'obsidian';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import CogniLinkPlugin from '../main';
import { SocialMediaContentUI } from './SocialMediaContentUI';
import { SocialMediaPlatform, GeneratedContent, ContentGenerationOptions, PlatformId } from '../types/social-media';
import { QualityEvaluationResult } from '../types/quality-assessment';

export class SocialMediaGenerationModal extends Modal {
  private plugin: CogniLinkPlugin;
  private root: Root | null = null;
  private initialPlatform?: string;
  private initialTheme?: string;

  constructor(app: App, plugin: CogniLinkPlugin, platform?: string, theme?: string) {
    super(app);
    this.plugin = plugin;
    this.initialPlatform = platform;
    this.initialTheme = theme;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    
    // 设置模态框样式类
    this.modalEl.addClass('social-media-generation-modal');
    
    // 创建模态框头部
    const headerEl = contentEl.createDiv('modal-header');
    headerEl.createEl('h2', { text: '社交媒体内容生成' });
    
    // 创建模态框主体
    const bodyEl = contentEl.createDiv('modal-body');
    
    // 创建React容器
    const reactContainer = bodyEl.createDiv('social-media-ui-container');
    
    try {
      // 准备平台数据
      const platforms: SocialMediaPlatform[] = [
        {
          id: 'xiaohongshu',
          name: '小红书',
          maxLength: 1000,
          styleKeywords: ['种草', '分享', '推荐', '好物'],
          requiredElements: ['表情符号', '话题标签', '互动问题'],
          formatRules: {
            emojiDensity: 'high',
            hashtagCount: { min: 2, max: 5 },
            interactionPrompt: true
          },
          features: ['表情符号丰富', '种草分享', '互动性强', '生活化语言', '购物推荐']
        },
        {
          id: 'twitter',
          name: 'Twitter',
          maxLength: 280,
          styleKeywords: ['简洁', '观点', '分享'],
          requiredElements: ['话题标签', '简洁表达'],
          formatRules: {
            characterLimit: 280,
            hashtagCount: { min: 1, max: 3 },
            threadSupport: true
          },
          features: ['简洁表达', '话题标签', '转发互动', '国际化', '实时性']
        },
        {
          id: 'wechat',
          name: '微信公众号',
          maxLength: 5000,
          styleKeywords: ['深度', '专业', '结构化'],
          requiredElements: ['标题', '结构', '总结'],
          formatRules: {
            structureRequired: true,
            headingHierarchy: true,
            professionalTone: true
          },
          features: ['深度内容', '结构化写作', '专业性强', '数据支撑', '实用价值']
        },
        {
          id: 'blog',
          name: '个人博客',
          maxLength: 10000,
          styleKeywords: ['技术', '深度', 'SEO'],
          requiredElements: ['标题', '代码示例', '参考链接'],
          formatRules: {
            codeBlockSupport: true,
            seoOptimized: true,
            referenceSection: true
          },
          features: ['技术深度', 'SEO优化', '代码示例', '详细教程', '参考资料']
        },
        {
          id: 'toutiao',
          name: '头条号',
          maxLength: 2000,
          styleKeywords: ['热点', '时效', '数据'],
          requiredElements: ['标题优化', '数据支撑', '热点话题'],
          formatRules: {
            titleOptimization: true,
            dataSupport: true,
            clickbaitLevel: { min: 3, max: 7 }
          },
          features: ['时效性强', '热点话题', '数据支撑', '标题优化', '流量导向']
        }
      ];

      // 创建React根节点
      this.root = createRoot(reactContainer);
      
      // 渲染React组件
      this.root.render(
        React.createElement(SocialMediaContentUI, {
          platforms,
          onGenerateContent: this.handleGenerateContent.bind(this),
          onEvaluateQuality: this.handleEvaluateQuality.bind(this),
          onApplySuggestion: this.handleApplySuggestion.bind(this),
          onExportReport: this.handleExportReport.bind(this),
          defaultPlatform: this.initialPlatform,
          defaultTheme: this.initialTheme,
          defaultContentLength: 'medium',
          defaultWritingStyle: 'casual',
          defaultKeywords: [],
          defaultIncludeCurrentNote: false,
          plugin: this.plugin,
          className: 'modal-social-media-ui'
        })
      );
      
    } catch (error) {
      console.error('Failed to render social media UI:', error);
      bodyEl.createEl('p', { 
        text: '加载社交媒体生成界面失败，请重试',
        cls: 'error-message'
      });
    }
  }

  async onClose() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  private async handleGenerateContent(
    platform: SocialMediaPlatform,
    theme: string,
    options: ContentGenerationOptions
  ): Promise<GeneratedContent> {
    try {
      console.log('Generating content for:', { platform: platform.id, theme, options });
      
      // 使用插件的社交媒体内容生成服务
      if ('socialMediaContentGenerator' in this.plugin && this.plugin.socialMediaContentGenerator) {
        return await (this.plugin as any).socialMediaContentGenerator.generateContent(
          platform.id,
          theme,
          options
        );
      } else {
        // 如果没有专用服务，使用AI服务生成
        const prompt = `请为${platform.name}平台生成关于"${theme}"的内容。

平台要求：
- 平台：${platform.name}
- 最大长度：${platform.maxLength}字符
- 平台特色：${platform.features?.join('、') || '无特殊要求'}
- 风格关键词：${platform.styleKeywords.join('、')}

内容要求：
1. 内容要有清晰的段落结构
2. 适当使用表情符号和话题标签
3. 包含互动问题或引导语
4. 符合平台的内容风格和长度要求
5. 内容要有吸引力和可读性

请生成格式良好、有吸引力的${platform.name}内容：`;

        const message = {
          id: Date.now().toString(),
          role: 'user' as const,
          content: prompt,
          timestamp: Date.now()
        };

        const response = await this.plugin.aiService.sendMessage(message);
        
        // 格式化生成的内容
        let formattedContent = response.content;
        
        // 根据平台特性进行格式化
        if (platform.id === 'xiaohongshu') {
          // 小红书：确保有表情符号和话题标签
          if (!formattedContent.includes('✨') && !formattedContent.includes('💡')) {
            formattedContent = '✨ ' + formattedContent;
          }
          if (!formattedContent.includes('#')) {
            formattedContent += '\n\n#Cursor使用技巧 #工作效率 #程序员必备';
          }
        } else if (platform.id === 'twitter') {
          // Twitter：确保简洁，添加话题标签
          if (formattedContent.length > 250) {
            formattedContent = formattedContent.substring(0, 240) + '...';
          }
          if (!formattedContent.includes('#')) {
            formattedContent += ' #Cursor #编程技巧';
          }
        } else if (platform.id === 'wechat') {
          // 微信公众号：确保有标题和结构
          if (!formattedContent.includes('##') && !formattedContent.includes('**')) {
            formattedContent = `## ${theme}\n\n${formattedContent}`;
          }
        }
        
        // 确保内容有合适的换行
        formattedContent = formattedContent
          .replace(/([。！？])\s*([^。！？\n])/g, '$1\n\n$2') // 句号后换行
          .replace(/([：:])\s*([^：:\n])/g, '$1\n$2') // 冒号后换行
          .replace(/\n{3,}/g, '\n\n') // 限制连续换行
          .trim();
        
        return {
          platform,
          content: formattedContent,
          originalContent: response.content,
          metadata: {
            topic: theme,
            generationTime: Date.now(),
            sourceNotes: [],
            templateUsed: 'ai-service',
            processingApplied: ['format-optimization'],
            fromCache: false
          },
          qualityScore: 80,
          styleAssessment: {},
          lengthValidation: {},
          isValid: true,
          needsReview: false,
          confidence: 0.8,
          warnings: [],
          suggestions: []
        };
      }
      
    } catch (error) {
      console.error('Content generation failed:', error);
      throw new Error(`内容生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private async handleEvaluateQuality(content: GeneratedContent): Promise<QualityEvaluationResult> {
    try {
      console.log('🔍 开始质量评估 - 内容主题:', content.metadata.topic);
      console.log('📝 内容长度:', content.content.length, '字符');
      
      // 使用插件的质量评估服务
      if ('contentQualityEvaluator' in this.plugin && this.plugin.contentQualityEvaluator) {
        const result = await (this.plugin as any).contentQualityEvaluator.evaluateContent(content);
        console.log('✅ 质量评估完成 - 使用专用服务');
        return result;
      } else {
        console.log('⚠️ 使用简化质量评估服务');
        
        // 简单的质量评估实现
        const score = Math.min(100, Math.max(0, 
          80 - (content.content.length > 1000 ? 10 : 0) + 
          (content.content.includes('？') ? 5 : 0) +
          (content.content.includes('！') ? 5 : 0)
        ));
        
        console.log('📊 计算得分:', score);
        
        const result: QualityEvaluationResult = {
          overall: {
            total: score,
            dimensions: {
              originality: score + 5,
              compliance: score - 5,
              readability: score,
              attractiveness: score + 10,
              logic: score,
              practicality: score
            },
            weights: {
              originality: 0.3,
              compliance: 0.3,
              platformCompliance: 0.3,
              llmQuality: 0.1,
              readability: 0.2,
              attractiveness: 0.2,
              logic: 0.2,
              practicality: 0.2
            },
            grade: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'fair',
            recommendation: '建议增加更多互动元素',
            confidence: 0.8,
            breakdown: {
              originality: score + 5,
              compliance: score - 5,
              llmQuality: score
            }
          },
          report: {
            summary: {
              overallScore: score,
              grade: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'fair',
              keyStrengths: ['内容结构清晰'],
              keyWeaknesses: ['互动元素不足'],
              topRecommendations: [
                {
                  type: 'important',
                  category: 'engagement',
                  title: '增加互动元素',
                  description: '建议增加更多互动元素',
                  impact: 70,
                  effort: 30,
                  priority: 80,
                  actionable: true,
                  expectedImpact: 70,
                  estimatedEffort: 'low'
                }
              ],
              riskLevel: 'low',
              recommendation: '建议增加更多互动元素',
              quickActions: ['添加问题', '增加表情符号'],
              confidence: 0.8,
              processingTime: 100
            },
            details: {
              dimensionBreakdown: {
                originality: score + 5,
                compliance: score - 5,
                readability: score,
                attractiveness: score + 10,
                logic: score,
                practicality: score
              },
              scoreBreakdown: {
                originality: score + 5,
                compliance: score - 5,
                llmQuality: score,
                weights: {
                  originality: 0.3,
                  compliance: 0.3,
                  platformCompliance: 0.3,
                  llmQuality: 0.1,
                  readability: 0.2,
                  attractiveness: 0.2,
                  logic: 0.2,
                  practicality: 0.2
                }
              }
            },
            improvements: {
              priority: [
                {
                  type: 'important',
                  category: 'engagement',
                  title: '增加互动元素',
                  description: '建议增加更多互动元素',
                  impact: 70,
                  effort: 30,
                  priority: 80,
                  actionable: true,
                  expectedImpact: 70,
                  estimatedEffort: 'low'
                }
              ],
              optional: [],
              longTerm: [],
              estimatedImpact: 70,
              estimatedEffort: 30,
              timeline: {
                immediate: 1,
                shortTerm: 0,
                longTerm: 0
              }
            },
            metadata: {
              generatedAt: new Date(),
              version: '1.0',
              platform: content.platform.id,
              contentLength: content.content.length,
              evaluationTime: 100,
              evaluationMode: 'simple',
              confidence: 0.8
            }
          },
          processingTime: 100,
          confidence: 0.8,
          timestamp: Date.now(),
          metadata: {
            contentLength: content.content.length,
            platform: content.platform.id,
            evaluationMode: 'simple',
            version: '1.0'
          }
        };
        
        console.log('✅ 质量评估结果生成完成:', {
          总分: result.overall.total,
          等级: result.overall.grade,
          建议数量: result.report.improvements.priority.length
        });
        
        return result;
      }
      
    } catch (error) {
      console.error('❌ 质量评估失败:', error);
      throw new Error(`质量评估失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private async handleApplySuggestion(
    suggestionId: string,
    content: GeneratedContent
  ): Promise<GeneratedContent> {
    try {
      console.log('Applying suggestion:', suggestionId, 'to content:', content.metadata.topic);
      
      // 简单的建议应用实现
      let improvedContent = content.content;
      
      switch (suggestionId) {
        case '1':
          improvedContent += '\n\n你觉得怎么样？欢迎在评论区分享你的想法！';
          break;
        default:
          improvedContent += '\n\n[已应用改进建议]';
      }
      
      return {
        ...content,
        content: improvedContent,
        metadata: {
          ...content.metadata,
          processingApplied: [...content.metadata.processingApplied, `suggestion-${suggestionId}`]
        }
      };
      
    } catch (error) {
      console.error('Apply suggestion failed:', error);
      throw new Error(`应用建议失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private async handleExportReport(
    result: QualityEvaluationResult,
    format: 'markdown' | 'json' | 'text'
  ): Promise<void> {
    try {
      console.log('Exporting report:', result.metadata.platform, 'in format:', format);
      
      let exportContent = '';
      let fileName = '';
      
      switch (format) {
        case 'markdown':
          exportContent = `# 质量评估报告

## 基本信息
- **平台**: ${result.metadata.platform}
- **评估时间**: ${new Date().toLocaleString()}
- **内容长度**: ${result.metadata.contentLength} 字符
- **置信度**: ${Math.round(result.confidence * 100)}%

## 总体评分
**${result.overall.total}/100** (${result.overall.grade === 'excellent' ? '优秀' : result.overall.grade === 'good' ? '良好' : '一般'})

## 各维度评分
- **原创性**: ${result.overall.dimensions.originality}/100
- **平台适配度**: ${result.overall.dimensions.compliance}/100
- **可读性**: ${result.overall.dimensions.readability}/100
- **吸引力**: ${result.overall.dimensions.attractiveness}/100
- **逻辑性**: ${result.overall.dimensions.logic}/100
- **实用性**: ${result.overall.dimensions.practicality}/100

## 改进建议
${result.report.improvements.priority.map((s, i) => `${i + 1}. **${s.title}**: ${s.description} (预期提升: ${s.expectedImpact}%)`).join('\n')}

## 总结
${result.overall.recommendation}

---
*报告生成时间: ${new Date().toLocaleString()}*`;
          fileName = `质量评估报告_${result.metadata.platform}_${new Date().toISOString().slice(0, 10)}.md`;
          break;
          
        case 'json':
          exportContent = JSON.stringify(result, null, 2);
          fileName = `质量评估报告_${result.metadata.platform}_${new Date().toISOString().slice(0, 10)}.json`;
          break;
          
        case 'text':
          exportContent = `质量评估报告

平台: ${result.metadata.platform}
评估时间: ${new Date().toLocaleString()}
内容长度: ${result.metadata.contentLength} 字符
置信度: ${Math.round(result.confidence * 100)}%

总体评分: ${result.overall.total}/100 (${result.overall.grade === 'excellent' ? '优秀' : result.overall.grade === 'good' ? '良好' : '一般'})

各维度评分:
- 原创性: ${result.overall.dimensions.originality}/100
- 平台适配度: ${result.overall.dimensions.compliance}/100
- 可读性: ${result.overall.dimensions.readability}/100
- 吸引力: ${result.overall.dimensions.attractiveness}/100
- 逻辑性: ${result.overall.dimensions.logic}/100
- 实用性: ${result.overall.dimensions.practicality}/100

改进建议:
${result.report.improvements.priority.map((s, i) => `${i + 1}. ${s.title}: ${s.description} (预期提升: ${s.expectedImpact}%)`).join('\n')}

总结: ${result.overall.recommendation}

报告生成时间: ${new Date().toLocaleString()}`;
          fileName = `质量评估报告_${result.metadata.platform}_${new Date().toISOString().slice(0, 10)}.txt`;
          break;
      }
      
      // 复制到剪贴板
      await navigator.clipboard.writeText(exportContent);
      
      // 显示成功通知
      new Notice(`✅ 报告已复制到剪贴板！\n格式: ${format.toUpperCase()}\n文件名: ${fileName}`, 5000);
      
      // 尝试创建文件到 Obsidian vault
      try {
        const vault = this.plugin.app.vault;
        const reportsFolder = 'CogniLink Reports';
        
        // 确保报告文件夹存在
        if (!await vault.adapter.exists(reportsFolder)) {
          await vault.createFolder(reportsFolder);
        }
        
        const filePath = `${reportsFolder}/${fileName}`;
        await vault.create(filePath, exportContent);
        
        new Notice(`📁 报告已保存到: ${filePath}`, 3000);
        
      } catch (fileError) {
        console.warn('Failed to save report file:', fileError);
        new Notice(`⚠️ 报告已复制到剪贴板，但无法保存文件`, 3000);
      }
      
    } catch (error) {
      console.error('Export report failed:', error);
      new Notice(`❌ 导出报告失败: ${error instanceof Error ? error.message : '未知错误'}`, 5000);
      throw new Error(`导出报告失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
} 