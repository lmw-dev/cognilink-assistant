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
  
  // 上下文数据
  currentNoteContent?: string;
  availableKeywords?: string[];
  
  // UI控制
  className?: string;
  onClose?: () => void;
  
  // 插件实例
  plugin?: CogniLinkPlugin;
}

// 平台选择器组件
const PlatformSelector = memo<{
  platforms: SocialMediaPlatform[];
  selected: SocialMediaPlatform | null;
  onChange: (platform: SocialMediaPlatform) => void;
  error?: string;
}>(({ platforms, selected, onChange, error }) => {
  return (
    <div className="setting-item">
      <div className="setting-item-name">目标平台</div>
      <div className="setting-item-description">
        选择要生成内容的社交媒体平台
      </div>
      <select 
        value={selected?.id || ''} 
        onChange={(e) => {
          const platform = platforms.find(p => p.id === e.target.value);
          if (platform) onChange(platform);
        }}
        className={error ? 'has-error' : ''}
      >
        <option value="">请选择平台</option>
        {platforms.map(platform => (
          <option key={platform.id} value={platform.id}>
            {platform.name} (最大{platform.maxLength}字符)
          </option>
        ))}
      </select>
      {error && <div className="error-text">{error}</div>}
      {selected && (
        <div className="platform-info">
          <div className="platform-features">
            特性: {selected.features?.join(', ') || '无特殊要求'}
          </div>
          <div className="platform-keywords">
            风格关键词: {selected.styleKeywords.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
});

PlatformSelector.displayName = 'PlatformSelector';

// 主题输入组件
const ThemeInput = memo<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
}>(({ value, onChange, error, maxLength = 500 }) => {
  return (
    <div className="setting-item">
      <div className="setting-item-name">内容主题</div>
      <div className="setting-item-description">
        描述您想要生成的内容主题和要点
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例如：介绍人工智能在教育领域的应用前景..."
        rows={4}
        maxLength={maxLength}
        className={error ? 'has-error' : ''}
      />
      <div className="input-meta">
        <span className={`char-count ${value.length > maxLength * 0.9 ? 'warning' : ''}`}>
          {value.length}/{maxLength}
        </span>
        {error && <span className="error-text">{error}</span>}
      </div>
    </div>
  );
});

ThemeInput.displayName = 'ThemeInput';

// 生成参数配置组件
const GenerationParameters = memo<{
  contentLength: 'short' | 'medium' | 'long';
  writingStyle: 'formal' | 'casual' | 'professional' | 'humorous';
  keywords: string[];
  includeCurrentNote: boolean;
  onParameterChange: (key: string, value: any) => void;
  availableKeywords?: string[];
}>(({ contentLength, writingStyle, keywords, includeCurrentNote, onParameterChange, availableKeywords }) => {
  const [keywordInput, setKeywordInput] = useState('');

  const addKeyword = useCallback(() => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      onParameterChange('keywords', [...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  }, [keywordInput, keywords, onParameterChange]);

  const removeKeyword = useCallback((keyword: string) => {
    onParameterChange('keywords', keywords.filter(k => k !== keyword));
  }, [keywords, onParameterChange]);

  const handleKeywordInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  }, [addKeyword]);

  return (
    <div className="generation-parameters">
      {/* 内容长度选择 */}
      <div className="setting-item">
        <div className="setting-item-name">内容长度</div>
        <select 
          value={contentLength} 
          onChange={(e) => onParameterChange('contentLength', e.target.value)}
        >
          <option value="short">短文 (100-200字)</option>
          <option value="medium">中等 (200-500字)</option>
          <option value="long">长文 (500-1000字)</option>
        </select>
      </div>
      
      {/* 写作风格选择 */}
      <div className="setting-item">
        <div className="setting-item-name">写作风格</div>
        <select 
          value={writingStyle} 
          onChange={(e) => onParameterChange('writingStyle', e.target.value)}
        >
          <option value="formal">正式</option>
          <option value="casual">轻松</option>
          <option value="professional">专业</option>
          <option value="humorous">幽默</option>
        </select>
      </div>
      
      {/* 关键词标签 */}
      <div className="setting-item">
        <div className="setting-item-name">关键词标签</div>
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
        {keywords.length > 0 && (
          <div className="keyword-tags">
            {keywords.map((keyword, index) => (
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
        {availableKeywords && availableKeywords.length > 0 && (
          <div className="available-keywords">
            <div className="available-keywords-label">建议关键词：</div>
            {availableKeywords.slice(0, 5).map((keyword, index) => (
              <button
                key={index}
                type="button"
                className="suggested-keyword"
                onClick={() => {
                  if (!keywords.includes(keyword)) {
                    onParameterChange('keywords', [...keywords, keyword]);
                  }
                }}
                disabled={keywords.includes(keyword)}
              >
                {keyword}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 包含当前笔记内容 */}
      <div className="setting-item">
        <div className="setting-item-name">包含当前笔记内容</div>
        <div className="setting-item-description">
          将当前笔记内容作为上下文参与生成
        </div>
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={includeCurrentNote}
            onChange={(e) => onParameterChange('includeCurrentNote', e.target.checked)}
          />
          <span className="checkmark"></span>
          使用当前笔记作为上下文
        </label>
      </div>
    </div>
  );
});

GenerationParameters.displayName = 'GenerationParameters';

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

// 主组件
export const ContentGenerationPanel: React.FC<ContentGenerationPanelProps> = ({
  onGenerate,
  onCancel,
  isLoading,
  isGenerating,
  error,
  platforms,
  defaultPlatform,
  currentNoteContent,
  availableKeywords,
  className,
  onClose,
  plugin
}) => {
  // 表单状态管理
  const [formState, setFormState] = useState<GenerationFormState>({
    selectedPlatform: null,
    theme: '',
    contentLength: 'medium',
    writingStyle: 'professional',
    keywords: [],
    includeCurrentNote: false,
    errors: {},
    touched: {}
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
      errors: { ...prev.errors, [field]: '' } // 清除该字段的错误
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
    <div className={`content-generation-panel ${className || ''}`}>
      <div className="panel-header">
        <h3>社交媒体内容生成</h3>
        {onClose && (
          <button className="panel-close" onClick={onClose} type="button">
            ×
          </button>
        )}
      </div>

      <div className="panel-content">
        {/* 全局错误提示 */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠</span>
            <span className="error-message">{error}</span>
          </div>
        )}

        {/* 平台选择器 */}
        <PlatformSelector
          platforms={platforms}
          selected={formState.selectedPlatform}
          onChange={handlePlatformChange}
          error={formState.errors.platform}
        />

        {/* 主题输入 */}
        <ThemeInput
          value={formState.theme}
          onChange={(value) => handleFieldChange('theme', value)}
          error={formState.errors.theme}
          maxLength={500}
        />

        {/* 生成参数配置 */}
        <GenerationParameters
          contentLength={formState.contentLength}
          writingStyle={formState.writingStyle}
          keywords={formState.keywords}
          includeCurrentNote={formState.includeCurrentNote}
          onParameterChange={handleFieldChange}
          availableKeywords={availableKeywords}
        />

        {/* 生成控制 */}
        <GenerationControls
          onGenerate={handleGenerate}
          onCancel={onCancel}
          isLoading={isLoading || isGenerating || false}
          canGenerate={canGenerate}
        />

        {/* 快捷键提示 */}
        <div className="keyboard-shortcuts">
          <div className="shortcuts-title">快捷键：</div>
          <div className="shortcuts-list">
            <span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> 快速生成</span>
            <span><kbd>Esc</kbd> 取消操作</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 