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
  
  // UI控制
  className?: string;
  defaultPlatform?: string;
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
  defaultPlatform
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
  
  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
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
  const handleGenerateContent = useCallback(async (formState: GenerationFormState) => {
    if (isProcessing) return;
    
    const startTime = Date.now();
    setIsProcessing(true);
    setWorkflowState('generating');
    clearError();
    
    try {
      // 查找选中的平台
      const selectedPlatform = formState.selectedPlatform;
      if (!selectedPlatform) {
        throw new Error('请选择目标平台');
      }
      
      // 构建生成选项
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
      
      // 生成内容
      const content = await onGenerateContent(selectedPlatform, formState.theme, options);
      const generationTime = Date.now() - startTime;
      
      setGeneratedContent(content);
      setPerformanceMetrics(prev => ({ ...prev, generationTime }));
      
      // 自动进行质量评估
      setWorkflowState('evaluating');
      const evaluationStartTime = Date.now();
      
      const qualityResult = await onEvaluateQuality(content);
      const evaluationTime = Date.now() - evaluationStartTime;
      const totalTime = Date.now() - startTime;
      
      setQualityResult(qualityResult);
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
  }, [platforms, onGenerateContent, onEvaluateQuality, isProcessing, clearError]);
  
  // 处理质量评估刷新
  const handleRefreshQuality = useCallback(async () => {
    if (!generatedContent || isProcessing) return;
    
    setIsProcessing(true);
    clearError();
    
    try {
      const startTime = Date.now();
      const qualityResult = await onEvaluateQuality(generatedContent);
      const evaluationTime = Date.now() - startTime;
      
      setQualityResult(qualityResult);
      setPerformanceMetrics(prev => ({ ...prev, evaluationTime }));
      
    } catch (err) {
      console.error('Quality evaluation failed:', err);
      setError({
        type: 'evaluation',
        message: '质量评估失败',
        details: err instanceof Error ? err.message : '未知错误'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [generatedContent, onEvaluateQuality, isProcessing, clearError]);
  
  // 处理应用建议
  const handleApplySuggestion = useCallback(async (suggestionId: string) => {
    if (!generatedContent || !onApplySuggestion || isProcessing) return;
    
    setIsProcessing(true);
    clearError();
    
    try {
      const updatedContent = await onApplySuggestion(suggestionId, generatedContent);
      setGeneratedContent(updatedContent);
      
      // 重新评估质量
      const qualityResult = await onEvaluateQuality(updatedContent);
      setQualityResult(qualityResult);
      
    } catch (err) {
      console.error('Apply suggestion failed:', err);
      setError({
        type: 'suggestion',
        message: '应用建议失败',
        details: err instanceof Error ? err.message : '未知错误'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [generatedContent, onApplySuggestion, onEvaluateQuality, isProcessing, clearError]);
  
  // 处理导出报告
  const handleExportReport = useCallback(async (format: 'markdown' | 'json' | 'text') => {
    if (!qualityResult || !onExportReport) return;
    
    try {
      await onExportReport(qualityResult, format);
    } catch (err) {
      console.error('Export report failed:', err);
      setError({
        type: 'export',
        message: '导出报告失败',
        details: err instanceof Error ? err.message : '未知错误'
      });
    }
  }, [qualityResult, onExportReport]);
  
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
    <div className={`social-media-content-ui ${className || ''}`}>
      {/* 工作流状态栏 */}
      <div className="workflow-status">
        <div className="status-header">
          <h2>社交媒体内容生成</h2>
          <div className="status-info">
            <span className="status-text">{getWorkflowStatusText()}</span>
            {performanceMetrics.totalTime > 0 && (
              <span className="performance-info">
                总耗时: {performanceMetrics.totalTime}ms
              </span>
            )}
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${getWorkflowProgress()}%` }}
          />
        </div>
        
        {/* 错误显示 */}
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <div className="error-text">
                <div className="error-message">{error.message}</div>
                {error.details && (
                  <div className="error-details">{error.details}</div>
                )}
              </div>
              <button className="error-close" onClick={clearError}>
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 主要内容区域 */}
      <div className="content-area">
        {/* 左侧：内容生成面板 */}
        <div className="generation-panel">
          <ContentGenerationPanel
            platforms={platforms}
            onGenerate={async (request) => {
              // 将GenerationRequest转换为我们需要的格式
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
              await handleGenerateContent(formState);
            }}
            isGenerating={workflowState === 'generating' || workflowState === 'evaluating'}
            defaultPlatform={defaultPlatform}
            className="generation-form"
          />
          
          {/* 生成的内容预览 */}
          {generatedContent && (
            <div className="content-preview">
              <div className="preview-header">
                <h3>生成的内容</h3>
                <div className="content-meta">
                  <span className="platform-name">{generatedContent.platform.name}</span>
                  <span className="content-length">
                    {generatedContent.content.length} 字符
                  </span>
                  <span className="quality-score">
                    质量评分: {generatedContent.qualityScore}/100
                  </span>
                </div>
              </div>
              
              <div className="preview-content">
                <div className="content-text">
                  {generatedContent.content}
                </div>
                
                {generatedContent.warnings.length > 0 && (
                  <div className="content-warnings">
                    <h4>注意事项</h4>
                    <ul>
                      {generatedContent.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="preview-actions">
                <button 
                  className="regenerate-btn"
                  onClick={resetWorkflow}
                  disabled={isProcessing}
                >
                  重新生成
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* 右侧：质量评估结果 */}
        {qualityResult && (
          <div className="quality-panel">
            <QualityDisplayComponent
              evaluationResult={qualityResult}
              onRefresh={handleRefreshQuality}
              onExportReport={handleExportReport}
              onApplySuggestion={onApplySuggestion ? handleApplySuggestion : undefined}
              className="quality-display"
            />
          </div>
        )}
      </div>
      
      {/* 性能指标面板（开发模式） */}
      {process.env.NODE_ENV === 'development' && performanceMetrics.totalTime > 0 && (
        <div className="performance-panel">
          <h4>性能指标</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">内容生成</span>
              <span className="metric-value">{performanceMetrics.generationTime}ms</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">质量评估</span>
              <span className="metric-value">{performanceMetrics.evaluationTime}ms</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">总耗时</span>
              <span className="metric-value">{performanceMetrics.totalTime}ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 