import * as React from 'react';
import { useState, useEffect, useCallback, memo } from 'react';
import { SocialMediaPlatform, ContentGenerationOptions, GeneratedContent } from '../types/social-media';
import CogniLinkPlugin from '../main';

// 生成请求接口定义
export interface GenerationRequest {
  platform: SocialMediaPlatform;
  theme: string;
  parameters: {
    contentLength: 'short' | 'medium' | 'long';
    writingStyle: 'formal' | 'casual' | 'professional' | 'humorous';
    keywords: string[];
    includeCurrentNote: boolean;
    currentNoteContent?: string;
  };
  options?: {
    maxRetries?: number;
    timeout?: number;
  };
}

// 表单状态接口
export interface GenerationFormState {
  selectedPlatform: SocialMediaPlatform | null;
  theme: string;
  contentLength: 'short' | 'medium' | 'long';
  writingStyle: 'formal' | 'casual' | 'professional' | 'humorous';
  keywords: string[];
  includeCurrentNote: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// 主组件Props接口
export interface ContentGenerationPanelProps {
  // 生成控制
  onGenerate: (request: GenerationRequest) => Promise<void>;
  onCancel?: () => void;
  
  // 状态管理
  isLoading?: boolean;
  isGenerating?: boolean;
  error?: string;
  
  // 配置数据
  platforms: SocialMediaPlatform[];
  defaultPlatform?: string;
  
  // 预填充数据
  defaultTheme?: string;
  defaultContentLength?: 'short' | 'medium' | 'long';
  defaultWritingStyle?: 'formal' | 'casual' | 'professional' | 'humorous';
  defaultKeywords?: string[];
  defaultIncludeCurrentNote?: boolean;
  
  // 上下文数据
  currentNoteContent?: string;
  availableKeywords?: string[];
  
  // UI控制
  className?: string;
  onClose?: () => void;
  
  // 插件实例
  plugin?: CogniLinkPlugin;
  
  // 新增 variant 属性
  variant?: 'default' | 'plain';
  
  // 新增 showHeader 属性
  showHeader?: boolean;
}

// 平台选择器组件 - 改为紧凑下拉框形式
const PlatformSelector = memo<{
  platforms: SocialMediaPlatform[];
  selected: SocialMediaPlatform | null;
  onChange: (platform: SocialMediaPlatform) => void;
  error?: string;
}>(({ platforms, selected, onChange, error }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // 平台图标映射
  const getPlatformIcon = (platformId: string): string => {
    const iconMap: Record<string, string> = {
      'xiaohongshu': '📱',
      'twitter': '🐦',
      'wechat': '💬',
      'blog': '📝',
      'toutiao': '📰'
    };
    return iconMap[platformId] || '📄';
  };

  // 处理平台选择变化
  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const platformId = e.target.value;
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      onChange(platform);
    }
  };

  return (
    <div className="platform-selector-compact">
      <div className="setting-item-name">
        <span className="setting-icon">🎯</span>
        目标平台
      </div>
      <div className="setting-item-description">
        选择内容发布平台
      </div>
      
      <div className="platform-dropdown-container">
        <select 
          className={`platform-select dropdown ${error ? 'has-error' : ''}`}
          value={selected?.id || ''} 
          onChange={handlePlatformChange}
        >
          <option value="">请选择发布平台</option>
          {platforms.map(platform => (
            <option key={platform.id} value={platform.id}>
              {getPlatformIcon(platform.id)} {platform.name} (最大 {platform.maxLength} 字符)
            </option>
          ))}
        </select>
        
        {/* 错误提示 */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        {/* 选中平台的详细信息显示 */}
        {selected && (
          <div className="platform-info-tooltip">
            <div className="platform-quick-info">
              <div className="platform-emoji">{getPlatformIcon(selected.id)}</div>
              <div className="platform-meta">
                <div className="platform-name">{selected.name}</div>
                <div className="platform-limit">最大 {selected.maxLength} 字符</div>
              </div>
              <button 
                className="info-btn"
                onClick={() => setShowTooltip(!showTooltip)}
                title="查看平台详细信息"
              >
                ℹ️
              </button>
            </div>
            
            {/* 平台特性标签 */}
            {selected.features && selected.features.length > 0 && (
              <div className="platform-features-compact">
                {selected.features.slice(0, 3).map((feature, index) => (
                  <span key={index} className="feature-tag-small">
                    {feature}
                  </span>
                ))}
                {selected.features.length > 3 && (
                  <span className="feature-more-small">
                    +{selected.features.length - 3}
                  </span>
                )}
              </div>
            )}
            
            {/* 详细信息气泡 */}
            {showTooltip && (
              <div className="platform-detailed-tooltip">
                <div className="tooltip-content">
                  <div className="tooltip-section">
                    <strong>平台特性</strong>
                    <div>
                      {selected.features?.join(' • ') || '暂无特性信息'}
                    </div>
                  </div>
                  {selected.styleKeywords && selected.styleKeywords.length > 0 && (
                    <div className="tooltip-section">
                      <strong>推荐关键词</strong>
                      <div>
                        {selected.styleKeywords.join(' • ')}
                      </div>
                    </div>
                  )}
                  {selected.requiredElements && selected.requiredElements.length > 0 && (
                    <div className="tooltip-section">
                      <strong>内容要求</strong>
                      <div>
                        {selected.requiredElements.join(' • ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

PlatformSelector.displayName = 'PlatformSelector';

// 主题输入组件 - 优化版本
const ThemeInput = memo<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
}>(({ value, onChange, error, maxLength = 500 }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // 计算字符使用率
  const usagePercentage = (value.length / maxLength) * 100;
  
  // 获取字符计数状态
  const getCharCountStatus = () => {
    if (usagePercentage >= 95) return 'critical';
    if (usagePercentage >= 80) return 'warning';
    if (usagePercentage >= 60) return 'good';
    return 'normal';
  };

  // 智能提示文本
  const getPlaceholderText = () => {
    const placeholders = [
      "例如：介绍人工智能在教育领域的应用前景和发展趋势...",
      "例如：分享TypeScript开发的最佳实践和常见陷阱...",
      "例如：探讨远程工作对现代职场文化的影响...",
      "例如：推荐几款提升工作效率的数字化工具...",
      "例如：解析区块链技术在金融行业的创新应用..."
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  const [placeholder] = useState(getPlaceholderText());

  return (
    <div className="setting-item theme-input">
      <div className="setting-item-name">
        <span className="theme-icon">💡</span>
        内容主题
        {value.length > 0 && (
          <span className="theme-preview-badge">
            {value.length > 30 ? value.substring(0, 30) + '...' : value}
          </span>
        )}
      </div>
      <div className="setting-item-description">
        详细描述您想要生成的内容主题、核心观点和期望的表达方式
      </div>
      
      <div className={`theme-input-container ${isFocused ? 'focused' : ''} ${error ? 'has-error' : ''}`}>
        <div className="input-wrapper">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            rows={4}
            maxLength={maxLength}
            className="theme-textarea"
          />
          
          {/* 字符计数指示器 */}
          <div className="char-indicator-container">
            <div className="char-progress-ring">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="var(--background-modifier-border)"
                  strokeWidth="3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke={
                    getCharCountStatus() === 'critical' ? 'var(--color-red)' :
                    getCharCountStatus() === 'warning' ? 'var(--color-orange)' :
                    getCharCountStatus() === 'good' ? 'var(--color-green)' :
                    'var(--interactive-accent)'
                  }
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${usagePercentage * 1.005} 100.5`}
                  transform="rotate(-90 20 20)"
                  className="progress-circle"
                />
              </svg>
              <div className="char-count-text">
                <span className={`char-count ${getCharCountStatus()}`}>
                  {value.length}
                </span>
                <span className="char-max">/{maxLength}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 输入提示和状态 */}
        <div className="input-meta">
          <div className="input-status">
            {value.length === 0 && (
              <span className="status-hint">
                <span className="hint-icon">✍️</span>
                开始输入您的创作主题...
              </span>
            )}
            {value.length > 0 && value.length < 10 && (
              <span className="status-hint warning">
                <span className="hint-icon">⚠️</span>
                主题描述过于简短，建议详细描述
              </span>
            )}
            {value.length >= 10 && value.length < 50 && (
              <span className="status-hint good">
                <span className="hint-icon">👍</span>
                主题描述清晰，可以继续完善
              </span>
            )}
            {value.length >= 50 && (
              <span className="status-hint excellent">
                <span className="hint-icon">✨</span>
                主题描述详细，有助于生成高质量内容
              </span>
            )}
          </div>
          
          {error && (
            <div className="error-message">
              <span className="error-icon">❌</span>
              <span className="error-text">{error}</span>
            </div>
          )}
        </div>
        
        {/* 智能建议 */}
        {value.length > 20 && !error && (
          <div className="smart-suggestions">
            <div className="suggestions-header">
              <span className="suggestions-icon">💭</span>
              <span>智能建议</span>
            </div>
            <div className="suggestions-list">
              {value.includes('AI') || value.includes('人工智能') ? (
                <span className="suggestion-tag">可以加入具体的AI应用场景</span>
              ) : null}
              {value.includes('技术') || value.includes('开发') ? (
                <span className="suggestion-tag">建议包含实际案例或代码示例</span>
              ) : null}
              {value.includes('教程') || value.includes('指南') ? (
                <span className="suggestion-tag">可以添加步骤说明或注意事项</span>
              ) : null}
              {!value.includes('?') && !value.includes('？') ? (
                <span className="suggestion-tag">考虑加入问题引导读者思考</span>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ThemeInput.displayName = 'ThemeInput';

// 紧凑参数配置组件
const CompactParameters = memo<{
  contentLength: 'short' | 'medium' | 'long';
  writingStyle: 'formal' | 'casual' | 'professional' | 'humorous';
  includeCurrentNote: boolean;
  selectedPlatform: SocialMediaPlatform | null;
  onParameterChange: (key: string, value: any) => void;
}>(({ contentLength, writingStyle, includeCurrentNote, selectedPlatform, onParameterChange }) => {
  
  // 根据选择的平台动态生成内容长度选项
  const getContentLengthOptions = () => {
    if (!selectedPlatform) {
      return [
        { value: 'short', label: '短文', desc: '100-200字' },
        { value: 'medium', label: '中等', desc: '200-500字' },
        { value: 'long', label: '长文', desc: '500-1000字' }
      ];
    }

    const maxLength = selectedPlatform.maxLength;
    
    if (maxLength <= 300) {
      // 短平台如Twitter
      return [
        { value: 'short', label: '简短', desc: `50-${Math.floor(maxLength * 0.5)}字` },
        { value: 'medium', label: '中等', desc: `${Math.floor(maxLength * 0.5)}-${Math.floor(maxLength * 0.8)}字` },
        { value: 'long', label: '最长', desc: `${Math.floor(maxLength * 0.8)}-${maxLength}字` }
      ];
    } else if (maxLength <= 800) {
      // 中等平台如小红书
      return [
        { value: 'short', label: '短文', desc: `100-${Math.floor(maxLength * 0.3)}字` },
        { value: 'medium', label: '中等', desc: `${Math.floor(maxLength * 0.3)}-${Math.floor(maxLength * 0.7)}字` },
        { value: 'long', label: '长文', desc: `${Math.floor(maxLength * 0.7)}-${maxLength}字` }
      ];
    } else {
      // 长平台如微信公众号
      return [
        { value: 'short', label: '短文', desc: `200-${Math.floor(maxLength * 0.2)}字` },
        { value: 'medium', label: '中等', desc: `${Math.floor(maxLength * 0.2)}-${Math.floor(maxLength * 0.6)}字` },
        { value: 'long', label: '长文', desc: `${Math.floor(maxLength * 0.6)}-${maxLength}字` }
      ];
    }
  };

  const contentLengthOptions = getContentLengthOptions();

  // 写作风格选项
  const writingStyleOptions = [
    { value: 'formal', label: '正式', icon: '🎩' },
    { value: 'casual', label: '轻松', icon: '😊' },
    { value: 'professional', label: '专业', icon: '💼' },
    { value: 'humorous', label: '幽默', icon: '😄' }
  ];

  return (
    <div className="compact-parameters">
      {/* 内容长度 - 根据平台动态调整 */}
      <div className="setting-item compact">
        <div className="setting-item-name">
          <span className="setting-icon">📏</span>
          内容长度
          {selectedPlatform && (
            <span style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginLeft: '8px' }}>
              (适配{selectedPlatform.name})
            </span>
          )}
        </div>
        <select 
          className="dropdown compact"
          value={contentLength} 
          onChange={(e) => onParameterChange('contentLength', e.target.value as 'short' | 'medium' | 'long')}
        >
          {contentLengthOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.desc})
            </option>
          ))}
        </select>
      </div>
      
      {/* 写作风格 */}
      <div className="setting-item compact">
        <div className="setting-item-name">
          <span className="setting-icon">🎨</span>
          写作风格
        </div>
        <select 
          className="dropdown compact"
          value={writingStyle} 
          onChange={(e) => onParameterChange('writingStyle', e.target.value as 'formal' | 'casual' | 'professional' | 'humorous')}
        >
          {writingStyleOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* 包含当前笔记 - 优化结构 */}
      <div className="setting-item compact">
        <div className="setting-item-name">
          <span className="setting-icon">📝</span>
          使用当前笔记
        </div>
        <label className={`compact-switch ${includeCurrentNote ? 'checked' : ''}`}>
          <div className="switch-label">
            <div className="main-text">包含当前笔记内容</div>
            <div className="sub-text">
              {includeCurrentNote ? '已启用，将使用当前笔记作为参考' : '未启用，仅基于主题生成内容'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={includeCurrentNote}
            onChange={(e) => onParameterChange('includeCurrentNote', e.target.checked)}
          />
        </label>
        
        {/* 当前笔记状态指示器 */}
        <div className={`current-note-status ${includeCurrentNote ? 'enabled' : 'disabled'}`}>
          <span className="note-status-icon">
            {includeCurrentNote ? '✅' : '📄'}
          </span>
          <span className="note-status-text">
            {includeCurrentNote 
              ? '当前笔记内容将作为背景信息，帮助生成更相关的内容'
              : '仅基于输入的主题进行内容生成'
            }
          </span>
        </div>
      </div>
    </div>
  );
});

CompactParameters.displayName = 'CompactParameters';

// 生成控制按钮组件
const GenerationControls = memo<{
  onGenerate: () => void;
  onCancel?: () => void;
  isLoading: boolean;
  canGenerate: boolean;
}>(({ onGenerate, onCancel, isLoading, canGenerate }) => {
  return (
    <div className="generation-controls">
      <button 
        className="mod-cta"
        onClick={onGenerate}
        disabled={!canGenerate || isLoading}
        type="button"
      >
        {isLoading ? '生成中...' : '生成内容'}
      </button>
      
      {isLoading && onCancel && (
        <button onClick={onCancel} type="button">
          取消
        </button>
      )}
      
      {isLoading && (
        <div className="progress-indicator">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <span className="progress-text">正在生成内容，请稍候...</span>
        </div>
      )}
    </div>
  );
});

GenerationControls.displayName = 'GenerationControls';

// 主组件 - 重新组织为两列布局
export const ContentGenerationPanel: React.FC<ContentGenerationPanelProps> = ({
  onGenerate,
  onCancel,
  isLoading,
  isGenerating,
  error,
  platforms,
  defaultPlatform,
  defaultTheme,
  defaultContentLength,
  defaultWritingStyle,
  defaultKeywords,
  defaultIncludeCurrentNote,
  currentNoteContent,
  availableKeywords,
  className,
  onClose,
  plugin,
  variant = 'default',
  showHeader = true
}) => {
  // 表单状态管理
  const [formState, setFormState] = useState<GenerationFormState>(() => {
    return {
      selectedPlatform: null,
      theme: defaultTheme || '',
      contentLength: defaultContentLength || 'medium',
      writingStyle: defaultWritingStyle || 'casual',
      keywords: defaultKeywords || [],
      includeCurrentNote: defaultIncludeCurrentNote || false,
      errors: {},
      touched: {}
    };
  });

  // 初始化默认平台
  useEffect(() => {
    if (defaultPlatform && platforms.length > 0) {
      const platform = platforms.find(p => p.id === defaultPlatform);
      if (platform) {
        setFormState(prev => ({ ...prev, selectedPlatform: platform }));
      }
    }
  }, [defaultPlatform, platforms]);

  // 监听默认值变化并更新表单状态
  useEffect(() => {
    setFormState(prev => ({
      ...prev,
      theme: defaultTheme || prev.theme,
      contentLength: defaultContentLength || prev.contentLength,
      writingStyle: defaultWritingStyle || prev.writingStyle,
      keywords: defaultKeywords || prev.keywords,
      includeCurrentNote: defaultIncludeCurrentNote !== undefined ? defaultIncludeCurrentNote : prev.includeCurrentNote
    }));
  }, [defaultTheme, defaultContentLength, defaultWritingStyle, defaultKeywords, defaultIncludeCurrentNote]);

  // 表单验证
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formState.selectedPlatform) {
      errors.platform = '请选择目标平台';
    }

    if (!formState.theme.trim()) {
      errors.theme = '请输入内容主题';
    } else if (formState.theme.trim().length < 5) {
      errors.theme = '主题描述至少需要5个字符';
    }

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [formState.selectedPlatform, formState.theme]);

  // 处理表单字段变化
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      touched: { ...prev.touched, [field]: true },
      errors: { ...prev.errors, [field]: '' }
    }));
  }, []);

  // 处理平台选择变化
  const handlePlatformChange = useCallback((platform: SocialMediaPlatform) => {
    setFormState(prev => ({
      ...prev,
      selectedPlatform: platform,
      touched: { ...prev.touched, platform: true },
      errors: { ...prev.errors, platform: '' }
    }));
  }, []);

  // 处理生成请求
  const handleGenerate = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    const request: GenerationRequest = {
      platform: formState.selectedPlatform!,
      theme: formState.theme.trim(),
      parameters: {
        contentLength: formState.contentLength,
        writingStyle: formState.writingStyle,
        keywords: formState.keywords,
        includeCurrentNote: formState.includeCurrentNote,
        currentNoteContent: formState.includeCurrentNote ? currentNoteContent : undefined
      },
      options: {
        maxRetries: 3,
        timeout: 30000
      }
    };

    try {
      await onGenerate(request);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  }, [formState, validateForm, onGenerate, currentNoteContent]);

  // 关键词处理
  const [keywordInput, setKeywordInput] = useState('');

  const addKeyword = useCallback(() => {
    if (keywordInput.trim() && !formState.keywords.includes(keywordInput.trim())) {
      handleFieldChange('keywords', [...formState.keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  }, [keywordInput, formState.keywords, handleFieldChange]);

  const removeKeyword = useCallback((keyword: string) => {
    handleFieldChange('keywords', formState.keywords.filter(k => k !== keyword));
  }, [formState.keywords, handleFieldChange]);

  const handleKeywordInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  }, [addKeyword]);

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isLoading && onCancel) {
          onCancel();
        } else if (onClose) {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, isLoading, onCancel, onClose]);

  // 检查是否可以生成
  const canGenerate = Boolean(formState.selectedPlatform) && formState.theme.trim().length >= 5;

  return (
    <div className={`content-generation-panel two-column ${className || ''} ${variant === 'plain' ? 'panel-plain' : ''}`} style={variant === 'plain' ? {background: 'transparent', boxShadow: 'none', border: 'none', padding: 0, margin: 0, borderRadius: 0} : {}}>
      {showHeader && (
        <div className="panel-header">
          <h3>社交媒体内容生成</h3>
          {onClose && (
            <button className="panel-close" onClick={onClose} type="button">
              ×
            </button>
          )}
        </div>
      )}

      <div className="panel-content two-column-layout">
        {/* 全局错误提示 */}
        {error && (
          <div className="error-banner column-span-full">
            <span className="error-icon">⚠</span>
            <span className="error-message">{error}</span>
          </div>
        )}

        {/* 左列：紧凑配置区 */}
        <div className="config-column">
          <div className="config-section">
            <h4 className="section-title">
              <span className="title-icon">⚙️</span>
              配置选项
            </h4>
            
            {/* 平台选择器 */}
            <PlatformSelector
              platforms={platforms}
              selected={formState.selectedPlatform}
              onChange={handlePlatformChange}
              error={formState.errors.platform}
            />

            {/* 紧凑参数配置 */}
            <CompactParameters
              contentLength={formState.contentLength}
              writingStyle={formState.writingStyle}
              includeCurrentNote={formState.includeCurrentNote}
              selectedPlatform={formState.selectedPlatform}
              onParameterChange={handleFieldChange}
            />
          </div>
        </div>

        {/* 右列：主要内容区 */}
        <div className="content-column">
          <div className="content-section">
            <h4 className="section-title">
              <span className="title-icon">✍️</span>
              内容创作
            </h4>
            
            {/* 主题输入 */}
            <ThemeInput
              value={formState.theme}
              onChange={(value) => handleFieldChange('theme', value)}
              error={formState.errors.theme}
              maxLength={500}
            />

            {/* 关键词标签 */}
            <div className="setting-item">
              <div className="setting-item-name">
                <span className="setting-icon">🏷️</span>
                关键词标签
              </div>
              <div className="setting-item-description">
                添加相关关键词，帮助生成更精准的内容
              </div>
              <div className="keyword-input-container">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordInputKeyDown}
                  placeholder="输入关键词后按回车添加"
                />
                <button type="button" onClick={addKeyword} disabled={!keywordInput.trim()}>
                  添加
                </button>
              </div>
              {formState.keywords.length > 0 && (
                <div className="keyword-tags">
                  {formState.keywords.map((keyword, index) => (
                    <span key={index} className="keyword-tag">
                      {keyword}
                      <button 
                        type="button" 
                        onClick={() => removeKeyword(keyword)}
                        className="keyword-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* Suggested Keywords Section */}
              {availableKeywords && availableKeywords.length > 0 && (
                <div className="suggested-keywords-section" style={{ marginTop: '10px' }}>
                  <div className="setting-item-name" style={{ marginBottom: '5px' }}>
                    <span className="setting-icon">💡</span>
                    建议关键词：
                  </div>
                  <div className="suggested-keyword-tags">
                    {availableKeywords.map((keyword, index) => (
                      <button
                        key={index}
                        type="button"
                        className="suggested-keyword-tag"
                        onClick={() => {
                          if (!formState.keywords.includes(keyword)) {
                            handleFieldChange('keywords', [...formState.keywords, keyword]);
                          }
                        }}
                        style={{ 
                          marginRight: '5px', 
                          marginBottom: '5px', 
                          padding: '3px 8px',
                          border: '1px solid var(--text-faint)',
                          borderRadius: '4px',
                          background: 'var(--background-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 生成控制 */}
            <GenerationControls
              onGenerate={handleGenerate}
              onCancel={onCancel}
              isLoading={isLoading || isGenerating || false}
              canGenerate={canGenerate}
            />

            {/* 快捷键提示 */}
            <div className="keyboard-shortcuts compact">
              <span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> 快速生成</span>
              <span><kbd>Esc</kbd> 取消操作</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 