import * as React from 'react';
import { useState, useEffect, useCallback, memo } from 'react';
import { 
  QualityEvaluationResult, 
  DuplicateSegment, 
  ComplianceEvaluationResult,
  ImprovementSuggestion,
  QualityGrade,
  RuleCheckResult
} from '../types/quality-assessment';
import { SocialMediaPlatform } from '../types/social-media';

// 主组件Props接口
export interface QualityDisplayProps {
  // 评估结果数据
  evaluationResult: QualityEvaluationResult;
  
  // 显示控制
  showDetailedReport?: boolean;
  showOriginalityDetails?: boolean;
  showComplianceDetails?: boolean;
  
  // 交互控制
  onRefresh?: () => void;
  onExportReport?: (format: 'markdown' | 'json' | 'text') => void;
  onApplySuggestion?: (suggestionId: string) => void;
  
  // UI控制
  className?: string;
  compact?: boolean;
}

// 评分可视化组件Props
interface ScoreVisualizationProps {
  score: number;
  maxScore: number;
  label: string;
  size: 'large' | 'medium' | 'small';
  showAnimation?: boolean;
}

// 原创性结果组件Props
interface OriginalityResultProps {
  isOriginal: boolean;
  score: number;
  duplicateSegments: DuplicateSegment[];
  similarSources: any[];
  onShowDetails?: () => void;
}

// 平台适配度组件Props
interface ComplianceResultProps {
  complianceResult: ComplianceEvaluationResult;
  platform: SocialMediaPlatform;
  onShowDetails?: () => void;
}

// 改进建议组件Props
interface ImprovementSuggestionsProps {
  suggestions: ImprovementSuggestion[];
  onApplySuggestion?: (suggestionId: string) => void;
}

// 评分可视化组件
const ScoreVisualization = memo<ScoreVisualizationProps>(({ 
  score, 
  maxScore, 
  label, 
  size, 
  showAnimation = true 
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => setAnimatedScore(score), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedScore(score);
    }
  }, [score, showAnimation]);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--color-green)';
    if (score >= 60) return 'var(--color-yellow)';
    return 'var(--color-red)';
  };
  
  const percentage = Math.round((animatedScore / maxScore) * 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  
  return (
    <div className={`score-visualization ${size}`}>
      <div className="score-circle">
        <svg viewBox="0 0 100 100" className="score-svg">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--background-modifier-border)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getScoreColor(animatedScore)}
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            style={{
              transition: showAnimation ? 'stroke-dasharray 1s ease-out' : 'none',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%'
            }}
          />
        </svg>
        <div className="score-text">
          <span className="score-number">{Math.round(animatedScore)}</span>
          <span className="score-max">/{maxScore}</span>
        </div>
      </div>
      <div className="score-label">{label}</div>
    </div>
  );
});

ScoreVisualization.displayName = 'ScoreVisualization';

// 原创性结果展示组件
const OriginalityResult = memo<OriginalityResultProps>(({ 
  isOriginal, 
  score, 
  duplicateSegments, 
  similarSources, 
  onShowDetails 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="originality-result">
      <div className="result-header">
        <div className="result-status">
          <span className={`status-icon ${isOriginal ? 'original' : 'duplicate'}`}>
            {isOriginal ? '✓' : '⚠'}
          </span>
          <span className="status-text">
            {isOriginal ? '内容原创' : '检测到重复'}
          </span>
        </div>
        <div className="result-score">
          原创性: {score}%
        </div>
      </div>
      
      {duplicateSegments.length > 0 && (
        <div className="duplicate-segments">
          <h4>重复片段 ({duplicateSegments.length})</h4>
          {duplicateSegments.slice(0, 3).map((segment, index) => (
            <div key={index} className="duplicate-segment">
              <div className="segment-text">"{segment.content}"</div>
              <div className="segment-similarity">
                相似度: {Math.round(segment.similarity * 100)}%
              </div>
              <div className="segment-source">
                来源: {segment.sourceNote.title}
              </div>
            </div>
          ))}
          {duplicateSegments.length > 3 && (
            <button 
              className="show-more-btn"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '收起' : `查看全部 ${duplicateSegments.length} 个`}
            </button>
          )}
          
          {showDetails && duplicateSegments.slice(3).map((segment, index) => (
            <div key={index + 3} className="duplicate-segment">
              <div className="segment-text">"{segment.content}"</div>
              <div className="segment-similarity">
                相似度: {Math.round(segment.similarity * 100)}%
              </div>
              <div className="segment-source">
                来源: {segment.sourceNote.title}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {similarSources.length > 0 && (
        <div className="similar-sources">
          <h4>相似来源</h4>
          {similarSources.map((source, index) => (
            <div key={index} className="similar-source">
              <div className="source-title">{source.title}</div>
              <div className="source-similarity">
                相似度: {Math.round(source.similarity * 100)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

OriginalityResult.displayName = 'OriginalityResult';

// 平台适配度展示组件
const ComplianceResult = memo<ComplianceResultProps>(({ 
  complianceResult, 
  platform, 
  onShowDetails 
}) => {
  return (
    <div className="compliance-result">
      <div className="result-header">
        <h3>{platform.name} 适配度</h3>
        <div className="compliance-score">
          {Math.round(complianceResult.overallScore)}%
        </div>
      </div>
      
      <div className="rule-checks">
        {complianceResult.ruleChecks.map((check, index) => (
          <div key={index} className={`rule-check ${check.passed ? 'passed' : 'failed'}`}>
            <span className="check-icon">
              {check.passed ? '✓' : '✗'}
            </span>
            <span className="check-name">{check.ruleName}</span>
            {!check.passed && (
              <span className="check-message">{check.details}</span>
            )}
          </div>
        ))}
      </div>
      
      {complianceResult.improvements.length > 0 && (
        <div className="compliance-suggestions">
          <h4>优化建议</h4>
          {complianceResult.improvements.map((suggestion, index) => (
            <div key={index} className="suggestion-item">
              <div className="suggestion-text">{suggestion.description}</div>
              <div className="suggestion-impact">
                预期提升: +{suggestion.expectedImpact}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ComplianceResult.displayName = 'ComplianceResult';

// 改进建议展示组件
const ImprovementSuggestions = memo<ImprovementSuggestionsProps>(({ 
  suggestions, 
  onApplySuggestion 
}) => {
  const sortedSuggestions = suggestions.sort((a, b) => b.priority - a.priority);
  
  const getPriorityLabel = (priority: number) => {
    if (priority >= 80) return '高';
    if (priority >= 50) return '中';
    return '低';
  };
  
  const getPriorityClass = (priority: number) => {
    if (priority >= 80) return 'priority-high';
    if (priority >= 50) return 'priority-medium';
    return 'priority-low';
  };
  
  return (
    <div className="improvement-suggestions">
      <h3>改进建议</h3>
      {sortedSuggestions.map((suggestion, index) => (
        <div key={index} className="suggestion-card">
          <div className="suggestion-header">
            <span className={`priority-badge ${getPriorityClass(suggestion.priority)}`}>
              {getPriorityLabel(suggestion.priority)}
            </span>
            <span className="suggestion-category">{suggestion.category}</span>
          </div>
          
          <div className="suggestion-content">
            <div className="suggestion-title">{suggestion.title}</div>
            <div className="suggestion-description">{suggestion.description}</div>
          </div>
          
          <div className="suggestion-footer">
            <div className="expected-improvement">
              预期提升: +{suggestion.expectedImpact}分
            </div>
            {onApplySuggestion && suggestion.actionable && (
              <button 
                className="apply-suggestion-btn"
                onClick={() => onApplySuggestion(`${index}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onApplySuggestion(`${index}`);
                  }
                }}
                tabIndex={0}
              >
                应用建议
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

ImprovementSuggestions.displayName = 'ImprovementSuggestions';

// 紧凑质量概要组件
const QualityCompactSummary = memo<{
  result: QualityEvaluationResult;
  onExpand: () => void;
}>(({ result, onExpand }) => {
  // 计算总体评分等级
  const getScoreGrade = (score: number): { grade: string; className: string; icon: string } => {
    if (score >= 90) return { grade: '优秀', className: 'excellent', icon: '🌟' };
    if (score >= 80) return { grade: '良好', className: 'good', icon: '👍' };
    if (score >= 60) return { grade: '一般', className: 'warning', icon: '⚠️' };
    return { grade: '待改进', className: 'poor', icon: '❌' };
  };

  const overallGrade = getScoreGrade(result.overall.total);

  // 获取最重要的建议
  const getTopSuggestions = () => {
    if (!result.report?.improvements?.priority || result.report.improvements.priority.length === 0) return [];
    return result.report.improvements.priority
      .slice(0, 2)
      .map(s => s.title);
  };

  const topSuggestions = getTopSuggestions();

  return (
    <div className="quality-compact-container">
      {/* 快速评分显示 */}
      <div className="quality-quick-score">
        <div className={`quality-score-circle ${overallGrade.className}`}>
          {result.overall.total}
        </div>
        <div className="quality-score-info">
          <div className="quality-score-label">
            {overallGrade.icon} 总体质量：{overallGrade.grade}
          </div>
          <div className="quality-score-details">
            处理时间 {result.processingTime}ms • 置信度 {Math.round(result.confidence * 100)}%
          </div>
        </div>
      </div>

      {/* 关键指标摘要 */}
      <div className="quality-summary-compact">
        <div className="quality-summary-row">
          <div className="quality-metric">
            <span className="quality-metric-icon">🔍</span>
            <span className="quality-metric-label">原创性</span>
            <span className={`quality-metric-value ${result.originality?.isOriginal ? 'excellent' : 'warning'}`}>
              {result.originality?.isOriginal ? '✓ 原创' : '⚠ 需检查'}
            </span>
          </div>
          <div className="quality-metric">
            <span className="quality-metric-icon">📋</span>
            <span className="quality-metric-label">平台适配</span>
            <span className={`quality-metric-value ${(result.platformCompliance?.overallScore ?? 0) >= 80 ? 'excellent' : (result.platformCompliance?.overallScore ?? 0) >= 60 ? 'good' : 'warning'}`}>
              {result.platformCompliance?.overallScore ?? 0}分
            </span>
          </div>
        </div>
        
        <div className="quality-summary-row">
          <div className="quality-metric">
            <span className="quality-metric-icon">📖</span>
            <span className="quality-metric-label">可读性</span>
            <span className={`quality-metric-value ${result.overall.dimensions.readability >= 80 ? 'excellent' : result.overall.dimensions.readability >= 60 ? 'good' : 'warning'}`}>
              {result.overall.dimensions.readability}分
            </span>
          </div>
          <div className="quality-metric">
            <span className="quality-metric-icon">✨</span>
            <span className="quality-metric-label">吸引力</span>
            <span className={`quality-metric-value ${result.overall.dimensions.attractiveness >= 80 ? 'excellent' : result.overall.dimensions.attractiveness >= 60 ? 'good' : 'warning'}`}>
              {result.overall.dimensions.attractiveness}分
            </span>
          </div>
        </div>
      </div>

      {/* 快速操作建议 */}
      {topSuggestions.length > 0 && (
        <div className="quality-quick-actions">
          {topSuggestions.map((suggestion, index) => (
            <span key={index} className="quality-quick-action priority-high">
              {suggestion}
            </span>
          ))}
          {result.report?.improvements?.priority && result.report.improvements.priority.length > 2 && (
            <span className="quality-quick-action">
              +{result.report.improvements.priority.length - 2} 更多建议
            </span>
          )}
        </div>
      )}

      {/* 展开按钮 */}
      <button className="quality-toggle-btn" onClick={onExpand}>
        <span className="toggle-icon">🔍</span>
        <span className="toggle-text">查看详细报告</span>
        <span className="toggle-icon">▼</span>
      </button>
    </div>
  );
});

QualityCompactSummary.displayName = 'QualityCompactSummary';

// 主组件
export const QualityDisplayComponent: React.FC<QualityDisplayProps> = ({
  evaluationResult,
  showDetailedReport = false,
  showOriginalityDetails = false,
  showComplianceDetails = false,
  onRefresh,
  onExportReport,
  onApplySuggestion,
  className,
  compact = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'originality' | 'compliance' | 'suggestions'>('overview');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // 获取质量等级的颜色
  const getGradeColor = (grade: QualityGrade) => {
    switch (grade) {
      case 'excellent': return 'var(--color-green)';
      case 'good': return 'var(--color-blue)';
      case 'fair': return 'var(--color-yellow)';
      case 'poor': return 'var(--color-orange)';
      case 'unacceptable': return 'var(--color-red)';
      default: return 'var(--text-muted)';
    }
  };
  
  // 获取质量等级的中文标签
  const getGradeLabel = (grade: QualityGrade) => {
    switch (grade) {
      case 'excellent': return '优秀';
      case 'good': return '良好';
      case 'fair': return '一般';
      case 'poor': return '较差';
      case 'unacceptable': return '不合格';
      default: return '未知';
    }
  };
  
  // 处理导出报告
  const handleExportReport = useCallback(async (format: 'markdown' | 'json' | 'text') => {
    if (!onExportReport) return;
    
    setIsExporting(true);
    try {
      await onExportReport(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [onExportReport]);
  
  // 处理刷新
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);
  
  // 处理展开/折叠
  const handleToggleExpand = useCallback(async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsExpanded(!isExpanded);
    
    // 动画完成后重置状态
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [isExpanded, isAnimating]);
  
  const containerClassName = [
    'quality-display-component',
    isExpanded ? 'expanded-mode' : 'compact-mode',
    isAnimating ? (isExpanded ? 'expanding' : 'collapsing') : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassName}>
      {/* 紧凑模式显示 */}
      {!isExpanded && (
        <QualityCompactSummary 
          result={evaluationResult} 
          onExpand={handleToggleExpand}
        />
      )}

      {/* 完整报告模式显示 */}
      {isExpanded && (
        <>
          {/* 头部控制区域 */}
          <div className="quality-header">
            <div className="header-title">
              <h3>📊 质量评估报告</h3>
            </div>
            <div className="processing-info">
              <span>处理时间: {evaluationResult.processingTime}ms</span>
              <span>置信度: {Math.round(evaluationResult.confidence * 100)}%</span>
            </div>
            <div className="header-controls">
              <button 
                className="quality-toggle-btn expanded" 
                onClick={handleToggleExpand}
              >
                <span className="toggle-icon">▲</span>
                <span className="toggle-text">收起报告</span>
              </button>
              {onExportReport && (
                <button onClick={() => handleExportReport('markdown')}>
                  导出报告
                </button>
              )}
            </div>
          </div>

          {/* 标签页导航 */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn overview ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              概览
            </button>
            <button 
              className={`tab-btn originality ${activeTab === 'originality' ? 'active' : ''}`}
              onClick={() => setActiveTab('originality')}
            >
              原创性
            </button>
            <button 
              className={`tab-btn compliance ${activeTab === 'compliance' ? 'active' : ''}`}
              onClick={() => setActiveTab('compliance')}
            >
              平台适配
            </button>
            <button 
              className={`tab-btn suggestions ${activeTab === 'suggestions' ? 'active' : ''}`}
              onClick={() => setActiveTab('suggestions')}
            >
              改进建议
            </button>
          </div>

          {/* 标签页内容 */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <div className="report-summary">
                  <h4>报告摘要</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">总体评分</span>
                      <span className="summary-value">{evaluationResult.report.summary.overallScore}/100</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">风险等级</span>
                      <span className={`summary-value risk-${evaluationResult.report.summary.riskLevel}`}>
                        {evaluationResult.report.summary.riskLevel === 'low' ? '低' : 
                         evaluationResult.report.summary.riskLevel === 'medium' ? '中' : '高'}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">处理时间</span>
                      <span className="summary-value">{evaluationResult.report.summary.processingTime}ms</span>
                    </div>
                  </div>
                  
                  {evaluationResult.report.summary.keyStrengths.length > 0 && (
                    <div className="key-points">
                      <h5>主要优势</h5>
                      <ul>
                        {evaluationResult.report.summary.keyStrengths.map((strength, index) => (
                          <li key={index} className="strength-item">{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {evaluationResult.report.summary.keyWeaknesses.length > 0 && (
                    <div className="key-points">
                      <h5>主要问题</h5>
                      <ul>
                        {evaluationResult.report.summary.keyWeaknesses.map((weakness, index) => (
                          <li key={index} className="weakness-item">{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'originality' && evaluationResult.originality && (
              <OriginalityResult
                isOriginal={evaluationResult.originality.isOriginal}
                score={evaluationResult.originality.overallScore}
                duplicateSegments={evaluationResult.originality.duplicateSegments}
                similarSources={evaluationResult.originality.mostSimilarSource ? [evaluationResult.originality.mostSimilarSource] : []}
                onShowDetails={() => {}}
              />
            )}
            
            {activeTab === 'compliance' && evaluationResult.platformCompliance && (
              <ComplianceResult
                complianceResult={evaluationResult.platformCompliance}
                platform={{
                  id: evaluationResult.metadata.platform,
                  name: evaluationResult.metadata.platform,
                  maxLength: 1000,
                  styleKeywords: [],
                  requiredElements: [],
                  formatRules: {}
                }}
                onShowDetails={() => {}}
              />
            )}
            
            {activeTab === 'suggestions' && (
              <ImprovementSuggestions
                suggestions={evaluationResult.report.improvements.priority.concat(
                  evaluationResult.report.improvements.optional
                )}
                onApplySuggestion={onApplySuggestion}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}; 