import * as React from 'react';
import { useState, useCallback, useEffect, memo } from 'react';
import { ContentGenerationPanel, GenerationFormState } from './ContentGenerationPanel';
import { QualityDisplayComponent } from './QualityDisplayComponent';
import { 
  SocialMediaPlatform, 
  GeneratedContent, 
  ContentGenerationOptions 
} from '../types/social-media';
import { QualityEvaluationResult } from '../types/quality-assessment';
import { MarkdownRenderer, App, Notice } from 'obsidian';
import CogniLinkPlugin from '../main'; // Import the main plugin class

// 内容预览组件，支持参考文档的智能处理
interface ContentPreviewWithReferencesProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  plugin: CogniLinkPlugin; // Added plugin prop
}

const ContentPreviewWithReferences = memo<ContentPreviewWithReferencesProps>(({ content, plugin, ...rest }) => {
  const [showReferences, setShowReferences] = useState(false);
  const [hoveredReference, setHoveredReference] = useState<string | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  // 提取参考文档信息
  const extractReferences = useCallback((text: string) => {
    const referencePatterns = [
      /\[参考文档[^\]]*\]/g,
      /参考资料[:：][^\n]*/g,
      /\*\*参考[^*]*\*\*/g,
      /来源[:：][^\n]*/g,
      /引用[:：][^\n]*/g,
      /资料来源[:：][^\n]*/g
    ];
    
    const references: string[] = [];
    referencePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        references.push(...matches);
      }
    });
    
    return references;
  }, []);

  // 清理内容，移除参考文档信息
  const cleanContentForCopy = useCallback((text: string) => {
    const referencePatterns = [
      /\[参考文档[^\]]*\]/g,
      /参考资料[:：][^\n]*/g,
      /\*\*参考[^*]*\*\*/g,
      /来源[:：][^\n]*/g,
      /引用[:：][^\n]*/g,
      /资料来源[:：][^\n]*/g
    ];
    
    let cleanedText = text;
    referencePatterns.forEach(pattern => {
      cleanedText = cleanedText.replace(pattern, '');
    });
    
    // 清理多余的空行和空格
    return cleanedText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // 移除多余空行
      .replace(/^\s+|\s+$/g, '') // 移除首尾空格
      .trim();
  }, []);

  // 渲染带有参考信息提示的内容
  const renderContentWithTooltips = useCallback((text: string) => {
    const references = extractReferences(text);
    if (references.length === 0) {
      return <div className="content-text">{text}</div>;
    }

    let processedText = text;
    const referenceMap = new Map<string, string>();
    
    // 为每个参考文档创建唯一标识
    references.forEach((ref, index) => {
      const refId = `ref-${index}`;
      referenceMap.set(refId, ref);
      processedText = processedText.replace(ref, `[参考${index + 1}]`);
    });

    // 分割文本并插入参考标记
    const parts = processedText.split(/(\[参考\d+\])/g);
    
    return (
      <div className="content-text">
        {parts.map((part, index) => {
          const refMatch = part.match(/\[参考(\d+)\]/);
          if (refMatch) {
            const refIndex = parseInt(refMatch[1]) - 1;
            const refId = `ref-${refIndex}`;
            const reference = referenceMap.get(refId);
            
            return (
              <span
                key={index}
                className="reference-marker"
                onMouseEnter={() => setHoveredReference(reference || null)}
                onMouseLeave={() => setHoveredReference(null)}
                title={reference}
              >
                {part}
                {hoveredReference === reference && (
                  <div className="reference-tooltip">
                    {reference}
                  </div>
                )}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  }, [extractReferences, hoveredReference]);

  // Render Markdown content
  useEffect(() => {
    if (contentRef.current && plugin && plugin.app) {
      contentRef.current.innerHTML = '';
      MarkdownRenderer.render(plugin.app, content, contentRef.current, '', plugin);
    }
  }, [content, plugin]);

  const references = extractReferences(content);
  const hasReferences = references.length > 0;

  return (
    <div className="content-preview-with-references" {...rest}>
      {/* Main content display area - Markdown will be rendered here */}
      <div className="main-content" ref={contentRef} />

      {/* Reference controls and export options (existing logic is fine) */}
      {hasReferences && (
        <div className="reference-controls">
          <button
            className="toggle-references-btn sm-link-button"
            onClick={() => setShowReferences(!showReferences)}
            type="button"
          >
            <span className="reference-icon">📚</span>
            {showReferences ? '隐藏参考文档' : `显示参考文档 (${references.length})`}
          </button>
          
          {showReferences && (
            <div className="references-list sm-well">
              <h4>参考文档</h4>
              <ul>
                {references.map((ref, index) => (
                  <li key={index} className="reference-item">
                    <span className="reference-number">[{index + 1}]</span>
                    <span className="reference-text">{ref}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="export-options">
        <div className="export-label">复制选项：</div>
        <div className="export-buttons">
          <button
            className="sm-button"
            onClick={() => {
              const cleanedContent = cleanContentForCopy(content);
              navigator.clipboard.writeText(cleanedContent);
              new Notice('纯净内容已复制! (无参考部分)');
            }}
            type="button"
            title="复制不包含参考文档的纯净内容"
          >
            纯净内容
          </button>
          <button
            className="sm-button"
            onClick={() => {
              navigator.clipboard.writeText(content);
              new Notice('完整内容已复制! (含参考部分)');
            }}
            type="button"
            title="复制包含参考文档的完整内容"
          >
            完整内容
          </button>
        </div>
      </div>
    </div>
  );
});

ContentPreviewWithReferences.displayName = 'ContentPreviewWithReferences';

// 主UI组件Props接口
export interface SocialMediaContentUIProps {
  // 可用平台列表
  platforms: SocialMediaPlatform[];
  
  // 生成内容回调
  onGenerateContent: (
    platform: SocialMediaPlatform,
    theme: string,
    options: ContentGenerationOptions
  ) => Promise<GeneratedContent>;
  
  // 质量评估回调
  onEvaluateQuality: (content: GeneratedContent) => Promise<QualityEvaluationResult>;
  
  // 应用建议回调
  onApplySuggestion?: (suggestionId: string, content: GeneratedContent) => Promise<GeneratedContent>;
  
  // 导出报告回调
  onExportReport?: (result: QualityEvaluationResult, format: 'markdown' | 'json' | 'text') => Promise<void>;
  
  // 预填充数据
  defaultPlatform?: string;
  defaultTheme?: string;
  defaultContentLength?: 'short' | 'medium' | 'long';
  defaultWritingStyle?: 'formal' | 'casual' | 'professional' | 'humorous';
  defaultKeywords?: string[];
  defaultIncludeCurrentNote?: boolean;
  
  // UI控制
  className?: string;
  plugin: CogniLinkPlugin; // Added plugin prop
}

// 工作流状态类型
type WorkflowState = 'input' | 'generating' | 'evaluating' | 'completed' | 'error';

// 错误信息接口
interface ErrorInfo {
  type: 'generation' | 'evaluation' | 'suggestion' | 'export';
  message: string;
  details?: string;
}

// 主UI组件
export const SocialMediaContentUI: React.FC<SocialMediaContentUIProps> = ({
  platforms,
  onGenerateContent,
  onEvaluateQuality,
  onApplySuggestion,
  onExportReport,
  className,
  defaultPlatform,
  defaultTheme,
  defaultContentLength,
  defaultWritingStyle,
  defaultKeywords,
  defaultIncludeCurrentNote,
  plugin // Destructure plugin from props
}) => {
  // 状态管理
  const [workflowState, setWorkflowState] = useState<WorkflowState>('input');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [qualityResult, setQualityResult] = useState<QualityEvaluationResult | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 性能监控
  const [performanceMetrics, setPerformanceMetrics] = useState({
    generationTime: 0,
    evaluationTime: 0,
    totalTime: 0
  });
  
  // 添加质量报告弹窗状态
  const [showQualityModal, setShowQualityModal] = useState(false);
  
  // 调试用：输出当前状态
  console.log('🔍 质量报告状态:', { 
    showQualityModal, 
    hasQualityResult: !!qualityResult 
  });
  
  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
    // 当清除错误时，重置工作流状态为输入状态
    setWorkflowState('input');
  }, []);
  
  // 重置工作流
  const resetWorkflow = useCallback(() => {
    setWorkflowState('input');
    setGeneratedContent(null);
    setQualityResult(null);
    setError(null);
    setIsProcessing(false);
    setPerformanceMetrics({ generationTime: 0, evaluationTime: 0, totalTime: 0 });
  }, []);
  
  // 处理内容生成
  const handleGenerateContentInternal = useCallback(async (formState: GenerationFormState) => {
    if (isProcessing) return;
    
    const startTime = Date.now();
    setIsProcessing(true);
    setWorkflowState('generating');
    setGeneratedContent(null); // Clear previous content
    setQualityResult(null); // Clear previous quality result
    setError(null); // Clear previous error
    
    try {
      const selectedPlatform = formState.selectedPlatform;
      if (!selectedPlatform) {
        throw new Error('请选择目标平台');
      }
      
      const options: ContentGenerationOptions = {
        strictMode: true,
        autoFix: true,
        useCache: false,
        userPreferences: {
          tone: formState.writingStyle as any,
          length: formState.contentLength as any,
          style: 'moderate',
          includeEmoji: true,
          includeHashtags: true,
          customKeywords: formState.keywords
        },
        maxSourceNotes: 5,
        creativity: 0.7,
        timeout: 30000
      };
      
      const content = await onGenerateContent(selectedPlatform, formState.theme, options);
      const ownCalculatedGenerationTime = Date.now() - startTime;
      
      setGeneratedContent(content);

      // Use metadata's generationTime if available and valid, otherwise use own calculation for display
      const displayGenerationTime =
        content.metadata && typeof content.metadata.generationTime === 'number' && content.metadata.generationTime > 0
        ? content.metadata.generationTime
        : ownCalculatedGenerationTime;
      
      setPerformanceMetrics(prev => ({ ...prev, generationTime: displayGenerationTime }));
      
      setWorkflowState('evaluating');
      const evaluationStartTime = Date.now();
      const qualityEvalResult = await onEvaluateQuality(content);
      const evaluationTime = Date.now() - evaluationStartTime;
      const totalTime = Date.now() - startTime;
      
      setQualityResult(qualityEvalResult);
      setPerformanceMetrics(prev => ({ 
        ...prev, 
        evaluationTime, 
        totalTime 
      }));
      setWorkflowState('completed');
      
    } catch (err) {
      console.error('Content generation failed:', err);
      setError({
        type: 'generation',
        message: '内容生成失败',
        details: err instanceof Error ? err.message : '未知错误'
      });
      setWorkflowState('error');
    } finally {
      setIsProcessing(false);
    }
  }, [onGenerateContent, onEvaluateQuality, isProcessing]);
  
  // 处理质量评估刷新
  const handleRefreshQuality = useCallback(async () => {
    if (!generatedContent || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const startTime = Date.now();
      const updatedQualityResult = await onEvaluateQuality(generatedContent);
      const evaluationTime = Date.now() - startTime;
      setQualityResult(updatedQualityResult);
      setPerformanceMetrics(prev => ({ ...prev, evaluationTime }));
    } catch (err) {
      setError({ type: 'evaluation', message: '质量评估刷新失败', details: err instanceof Error ? err.message : undefined });
    } finally {
      setIsProcessing(false);
    }
  }, [generatedContent, onEvaluateQuality, isProcessing]);
  
  // 处理应用建议
  const handleApplySuggestionInternal = useCallback(async (suggestionId: string) => {
    if (!generatedContent || !onApplySuggestion || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const updatedContent = await onApplySuggestion(suggestionId, generatedContent);
      setGeneratedContent(updatedContent);
      const updatedQualityResult = await onEvaluateQuality(updatedContent);
      setQualityResult(updatedQualityResult);
    } catch (err) {
      setError({ type: 'suggestion', message: '应用建议失败', details: err instanceof Error ? err.message : undefined });
    } finally {
      setIsProcessing(false);
    }
  }, [generatedContent, onApplySuggestion, onEvaluateQuality, isProcessing]);
  
  // 处理导出报告
  const handleExportReportInternal = useCallback(async (format: 'markdown' | 'json' | 'text') => {
    if (!qualityResult || !onExportReport) return;
    try {
      await onExportReport(qualityResult, format);
    } catch (err) {
      setError({ type: 'export', message: '导出报告失败', details: err instanceof Error ? err.message : undefined });
    }
  }, [qualityResult, onExportReport]);
  
  // 处理导出内容
  const handleExportContentInternal = useCallback(async () => {
    if (!generatedContent) return;
    
    try {
      // 创建内容文本，智能处理参考文档
      let contentText = generatedContent.content;
      let references: string[] = [];
      
      // 提取参考文档信息
      const referencePatterns = [
        /\[参考文档[^\]]*\]/g,
        /参考资料[:：][^\n]*/g,
        /\*\*参考[^*]*\*\*/g,
        /来源[:：][^\n]*/g,
        /引用[:：][^\n]*/g,
        /资料来源[:：][^\n]*/g
      ];
      
      referencePatterns.forEach(pattern => {
        const matches = contentText.match(pattern);
        if (matches) {
          references.push(...matches);
        }
      });
      
      // 清理参考文档标记，但保留内容
      contentText = contentText.replace(/\[参考文档[^\]]*\]/g, '');
      contentText = contentText.replace(/参考资料[:：][^\n]*/g, '');
      contentText = contentText.replace(/\*\*参考[^*]*\*\*/g, '');
      contentText = contentText.replace(/来源[:：][^\n]*/g, '');
      contentText = contentText.replace(/引用[:：][^\n]*/g, '');
      contentText = contentText.replace(/资料来源[:：][^\n]*/g, '');
      
      // 清理多余的空行和空格
      contentText = contentText.replace(/\n\s*\n\s*\n/g, '\n\n');
      contentText = contentText.replace(/\s+$/gm, ''); // 清理行尾空格
      contentText = contentText.trim();
      
      // 创建导出内容
      const exportContent = `# ${generatedContent.platform.name} 内容

## 生成内容

${contentText}

## 内容信息

- **平台**: ${generatedContent.platform.name}
- **字符数**: ${generatedContent.content.length}
- **质量评分**: ${generatedContent.qualityScore}/100
- **生成时间**: ${new Date().toLocaleString()}

${generatedContent.warnings.length > 0 ? `## 注意事项

${generatedContent.warnings.map(warning => `- ${warning}`).join('\n')}` : ''}

${references.length > 0 ? `## 参考信息

${references.map(ref => `- ${ref.replace(/^[参考资料来源引用：:]+\s*/, '')}`).join('\n')}

> 注：参考信息已从正文中移除，以确保内容的简洁性和可读性。` : ''}
`;

      // 使用浏览器下载
      const blob = new Blob([exportContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generatedContent.platform.name}_内容_${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Export content failed:', err);
      setError({
        type: 'export',
        message: '导出内容失败',
        details: err instanceof Error ? err.message : '未知错误'
      });
    }
  }, [generatedContent]);
  
  // 获取工作流状态显示文本
  const getWorkflowStatusText = () => {
    switch (workflowState) {
      case 'input': return '请输入内容主题和参数';
      case 'generating': return '正在生成内容...';
      case 'evaluating': return '正在评估质量...';
      case 'completed': return '生成完成';
      case 'error': return '处理出错';
      default: return '';
    }
  };
  
  // 获取工作流进度百分比
  const getWorkflowProgress = () => {
    switch (workflowState) {
      case 'input': return 0;
      case 'generating': return 30;
      case 'evaluating': return 70;
      case 'completed': return 100;
      case 'error': return 0;
      default: return 0;
    }
  };
  
  return (
    <div className={`social-media-content-ui modal-social-media-ui ${className || ''}`}>
      {/* Global Error Display */}
      {error && (
        <div className="sm-error-banner">
          <div className="sm-error-icon">⚠️</div>
          <div className="sm-error-text">
            <div className="sm-error-message">{error.message}</div>
            {error.details && (
              <div className="sm-error-details">{error.details}</div>
            )}
          </div>
          <button className="sm-error-close" onClick={clearError} title="关闭错误提示">
            ✕
          </button>
        </div>
      )}

      {/* Main Scrollable Content Area */}
      <div className="sm-main-content-area">
        <ContentGenerationPanel
          platforms={platforms}
          onGenerate={async (request) => {
            const formState: GenerationFormState = {
              selectedPlatform: request.platform,
              theme: request.theme,
              contentLength: request.parameters.contentLength,
              writingStyle: request.parameters.writingStyle,
              keywords: request.parameters.keywords,
              includeCurrentNote: request.parameters.includeCurrentNote,
              errors: {},
              touched: {}
            };
            await handleGenerateContentInternal(formState);
          }}
          isLoading={isProcessing && (workflowState === 'generating' || workflowState === 'evaluating')}
          isGenerating={workflowState === 'generating'}
          // error prop for ContentGenerationPanel can be used for form-specific errors if needed in future
          defaultPlatform={defaultPlatform}
          defaultTheme={defaultTheme}
          defaultContentLength={defaultContentLength}
          defaultWritingStyle={defaultWritingStyle}
          defaultKeywords={defaultKeywords}
          defaultIncludeCurrentNote={defaultIncludeCurrentNote}
          className="sm-content-generation-panel-embedded" // New class for specific styling
          variant="plain" // Use plain variant to remove its own card-like styling
          showHeader={false} // No redundant header for the panel
        />

        {/* Loading Indicators */}
        {workflowState === 'generating' && (
          <div className="sm-loading-indicator">
            <div className="sm-spinner"></div>
            正在生成内容，请稍候...
          </div>
        )}
        {workflowState === 'evaluating' && (
          <div className="sm-loading-indicator">
            <div className="sm-spinner"></div>
            正在评估质量...
          </div>
        )}

        {/* Generated Content Section */}
        {generatedContent && (workflowState === 'completed' || workflowState === 'error' && generatedContent) && (
          <div className="sm-generated-content-wrapper">
            <div className="sm-section-header">
              <h3>生成的内容</h3>
              <div className="sm-content-meta">
                <span className="sm-platform-badge">{generatedContent.platform.name}</span>
                <span>{generatedContent.content.length} 字符</span>
                {generatedContent.qualityScore && <span>质量: {generatedContent.qualityScore}/100</span>}
                {/* Added performance metric display for development mode */}
                {process.env.NODE_ENV === 'development' && performanceMetrics.generationTime > 0 && (
                  <span className="sm-dev-metric">生成耗时：{(performanceMetrics.generationTime / 1000).toFixed(2)}s</span>
                )}
              </div>
            </div>
            <ContentPreviewWithReferences content={generatedContent.content} plugin={plugin} />
            
            {generatedContent.warnings && generatedContent.warnings.length > 0 && (
              <div className="sm-content-warnings">
                <h4>⚠️ 注意事项</h4>
                <ul>
                  {generatedContent.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {qualityResult && workflowState === 'completed' && (
              <div className="sm-quality-display-wrapper">
                <div className="sm-section-header">
                  <h3>质量评估摘要</h3>
                  <button className="sm-link-button" onClick={() => setShowQualityModal(true)}>查看详细报告</button>
                </div>
                {/* Simplified preview of quality or key metrics */}
                <div className="sm-quality-summary">
                  <span>总分: {qualityResult.overall.total}/100 ({qualityResult.overall.grade})</span>
                  {qualityResult.report.summary.topRecommendations.slice(0,1).map(rec => (
                    <span key={rec.title}>建议: {rec.title}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="sm-generated-actions">
              <button className="mod-cta" onClick={resetWorkflow} disabled={isProcessing && workflowState !== 'error'}>
                ✨ 重新生成另一篇
              </button>
              <button onClick={handleExportContentInternal} disabled={isProcessing}>
                导出这篇内容
              </button>
              <button onClick={() => setShowQualityModal(true)} disabled={!qualityResult || isProcessing}>
                查看详细质量报告
              </button>
            </div>
          </div>
        )}

        {/* Placeholder for when no content is generated and not processing */}
        {!generatedContent && workflowState === 'input' && (
          <div className="sm-placeholder-section">
            <div className="sm-placeholder-icon">✍️</div>
            <h3>开始您的内容创作之旅</h3>
            <p>请在上方配置平台、输入您的内容主题和相关参数，然后点击"生成内容"按钮，AI 将为您量身打造精彩的社交媒体帖子。</p>
          </div>
        )}
      </div>

      {/* Quality Assessment Modal (Full Report) */}
      {showQualityModal && qualityResult && (
        <div className="quality-modal">
          <div className="quality-modal-content">
            <div className="quality-modal-header">
              <h2>详细质量评估报告</h2>
              <span className="quality-modal-close" onClick={() => setShowQualityModal(false)} title="关闭报告">
                ✕
              </span>
            </div>
            <div className="quality-modal-body">
              <QualityDisplayComponent
                evaluationResult={qualityResult}
                onRefresh={handleRefreshQuality}
                onApplySuggestion={onApplySuggestion ? handleApplySuggestionInternal : undefined}
                onExportReport={onExportReport ? handleExportReportInternal : undefined}
                className="modal-quality-display"
              />
            </div>
          </div>
        </div>
      )}
      {showQualityModal && !qualityResult && (
         <div className="quality-modal">
         <div className="quality-modal-content">
           <div className="quality-modal-header">
             <h2>质量评估报告</h2>
             <span className="quality-modal-close" onClick={() => setShowQualityModal(false)} title="关闭报告">✕</span>
           </div>
           <div className="quality-modal-body">
             <div className="sm-placeholder-section" style={{padding: 'var(--size-4-8)'}}>
               <div className="sm-placeholder-icon">📊</div>
               <h3>暂无评估数据</h3>
               <p>请先生成内容。内容生成后，系统将自动进行初步评估，您也可以在此查看详细报告。</p>
               <button onClick={() => setShowQualityModal(false)}>明白了</button>
             </div>
           </div>
         </div>
       </div>
      )}
    </div>
  );
}; 