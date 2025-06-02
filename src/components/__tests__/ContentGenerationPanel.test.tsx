import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentGenerationPanel, ContentGenerationPanelProps, GenerationRequest } from '../ContentGenerationPanel';
import { SocialMediaPlatform } from '../../types/social-media';

// Mock CogniLinkPlugin
const mockPlugin = {
  settings: {},
  aiService: {},
  embeddingService: {}
} as any;

// Mock platforms data
const mockPlatforms: SocialMediaPlatform[] = [
  {
    id: 'xiaohongshu',
    name: '小红书',
    maxLength: 1000,
    styleKeywords: ['生活', '分享', '种草'],
    requiredElements: ['标题', '内容', '标签'],
    formatRules: {
      emojiDensity: 'medium',
      hashtagCount: { min: 3, max: 8 }
    },
    features: ['emoji', 'hashtag', 'interaction']
  },
  {
    id: 'twitter',
    name: 'Twitter',
    maxLength: 280,
    styleKeywords: ['简洁', '观点', '互动'],
    requiredElements: ['内容'],
    formatRules: {
      characterLimit: 280,
      hashtagCount: { min: 1, max: 3 }
    },
    features: ['hashtag', 'mention']
  }
];

// Default props for testing
const defaultProps: ContentGenerationPanelProps = {
  onGenerate: jest.fn(),
  onCancel: jest.fn(),
  isLoading: false,
  platforms: mockPlatforms,
  plugin: mockPlugin
};

describe('ContentGenerationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with basic elements', () => {
    render(<ContentGenerationPanel {...defaultProps} />);
    
    expect(screen.getByText('社交媒体内容生成')).toBeInTheDocument();
    expect(screen.getByText('目标平台')).toBeInTheDocument();
    expect(screen.getByText('内容主题')).toBeInTheDocument();
    expect(screen.getByText('内容长度')).toBeInTheDocument();
    expect(screen.getByText('写作风格')).toBeInTheDocument();
    expect(screen.getByText('关键词标签')).toBeInTheDocument();
    expect(screen.getByText('包含当前笔记内容')).toBeInTheDocument();
  });

  it('displays platform options correctly', () => {
    render(<ContentGenerationPanel {...defaultProps} />);
    
    // Check if platform cards are present instead of select options
    expect(screen.getByText('小红书')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('最大 1000 字符')).toBeInTheDocument();
    expect(screen.getByText('最大 280 字符')).toBeInTheDocument();
  });

  it('shows platform info when platform is selected', async () => {
    render(<ContentGenerationPanel {...defaultProps} />);
    
    // Click on platform card instead of changing select
    const platformCard = screen.getByText('小红书').closest('.platform-card');
    fireEvent.click(platformCard!);
    
    await waitFor(() => {
      expect(screen.getByText('emoji • hashtag • interaction')).toBeInTheDocument();
      expect(screen.getByText('生活 • 分享 • 种草')).toBeInTheDocument();
    });
  });

  it('validates form before submission', async () => {
    const mockOnGenerate = jest.fn();
    render(<ContentGenerationPanel {...defaultProps} onGenerate={mockOnGenerate} />);
    
    const generateButton = screen.getByText('生成内容');
    fireEvent.click(generateButton);
    
    // The validation should prevent generation, button should remain disabled
    expect(generateButton).toBeDisabled();
    expect(mockOnGenerate).not.toHaveBeenCalled();
  });

  it('enables generation when form is valid', async () => {
    const mockOnGenerate = jest.fn();
    render(<ContentGenerationPanel {...defaultProps} onGenerate={mockOnGenerate} />);
    
    // Fill in form
    const platformCard = screen.getByText('小红书').closest('.platform-card');
    fireEvent.click(platformCard!);
    
    const themeTextarea = screen.getByPlaceholderText(/例如：/);
    fireEvent.change(themeTextarea, { target: { value: '人工智能在教育领域的应用' } });
    
    await waitFor(() => {
      const generateButton = screen.getByText('生成内容');
      expect(generateButton).not.toBeDisabled();
    });
  });

  it('calls onGenerate with correct parameters', async () => {
    const mockOnGenerate = jest.fn();
    render(<ContentGenerationPanel {...defaultProps} onGenerate={mockOnGenerate} />);
    
    // Fill in form
    const platformCard = screen.getByText('小红书').closest('.platform-card');
    fireEvent.click(platformCard!);
    
    const themeTextarea = screen.getByPlaceholderText(/例如：/);
    fireEvent.change(themeTextarea, { target: { value: '人工智能在教育领域的应用' } });
    
    // Get select elements by their container
    const selects = screen.getAllByRole('combobox');
    const lengthSelect = selects[0]; // First select is length
    fireEvent.change(lengthSelect, { target: { value: 'long' } });
    
    const styleSelect = selects[1]; // Second select is style
    fireEvent.change(styleSelect, { target: { value: 'casual' } });
    
    // Submit form
    const generateButton = screen.getByText('生成内容');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledWith({
        platform: mockPlatforms[0], // xiaohongshu
        theme: '人工智能在教育领域的应用',
        parameters: {
          contentLength: 'long',
          writingStyle: 'casual',
          keywords: [],
          includeCurrentNote: false,
          currentNoteContent: undefined
        },
        options: {
          maxRetries: 3,
          timeout: 30000
        }
      });
    });
  });

  it('handles keyword management correctly', async () => {
    render(<ContentGenerationPanel {...defaultProps} />);
    
    const keywordInput = screen.getByPlaceholderText('输入关键词后按回车添加');
    const addButton = screen.getByText('添加');
    
    // Add a keyword
    fireEvent.change(keywordInput, { target: { value: '人工智能' } });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('人工智能')).toBeInTheDocument();
    });
    
    // Add another keyword by pressing Enter
    fireEvent.change(keywordInput, { target: { value: '教育' } });
    fireEvent.keyDown(keywordInput, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('教育')).toBeInTheDocument();
    });
    
    // Remove a keyword
    const removeButtons = screen.getAllByText('×');
    fireEvent.click(removeButtons[0]);
    
    await waitFor(() => {
      expect(screen.queryByText('人工智能')).not.toBeInTheDocument();
    });
  });

  it('shows loading state correctly', () => {
    render(<ContentGenerationPanel {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('生成中...')).toBeInTheDocument();
    expect(screen.getByText('正在生成内容，请稍候...')).toBeInTheDocument();
    expect(screen.getByText('取消')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = '生成失败，请重试';
    render(<ContentGenerationPanel {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('handles close button click', () => {
    const mockOnClose = jest.fn();
    render(<ContentGenerationPanel {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles cancel button click during loading', () => {
    const mockOnCancel = jest.fn();
    render(<ContentGenerationPanel {...defaultProps} isLoading={true} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows suggested keywords when provided', () => {
    const availableKeywords = ['AI', '机器学习', '深度学习', '神经网络'];
    render(<ContentGenerationPanel {...defaultProps} availableKeywords={availableKeywords} />);
    
    expect(screen.getByText('建议关键词：')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('机器学习')).toBeInTheDocument();
  });

  it('adds suggested keyword when clicked', async () => {
    const availableKeywords = ['AI', '机器学习'];
    render(<ContentGenerationPanel {...defaultProps} availableKeywords={availableKeywords} />);
    
    const suggestedKeyword = screen.getByRole('button', { name: 'AI' });
    fireEvent.click(suggestedKeyword);
    
    await waitFor(() => {
      // Should appear in the keyword tags area
      const keywordTags = screen.getAllByText('AI');
      const keywordTag = keywordTags.find(el => el.closest('.keyword-tag'));
      expect(keywordTag).toBeInTheDocument();
    });
  });

  it('handles current note content inclusion', async () => {
    const currentNoteContent = '这是当前笔记的内容';
    const mockOnGenerate = jest.fn();
    
    render(
      <ContentGenerationPanel 
        {...defaultProps} 
        currentNoteContent={currentNoteContent}
        onGenerate={mockOnGenerate}
      />
    );
    
    // Fill required fields
    const platformCard = screen.getByText('小红书').closest('.platform-card');
    fireEvent.click(platformCard!);
    
    const themeTextarea = screen.getByPlaceholderText(/例如：/);
    fireEvent.change(themeTextarea, { target: { value: '测试主题内容，这是一个足够长的主题描述' } });
    
    // Enable current note inclusion
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Wait for form to be valid
    await waitFor(() => {
      const generateButton = screen.getByText('生成内容');
      expect(generateButton).not.toBeDisabled();
    });
    
    // Submit
    const generateButton = screen.getByText('生成内容');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: expect.objectContaining({
            includeCurrentNote: true,
            currentNoteContent: currentNoteContent
          })
        })
      );
    });
  });

  it('shows character count and warning', () => {
    render(<ContentGenerationPanel {...defaultProps} />);
    
    const themeTextarea = screen.getByPlaceholderText(/例如：/);
    const longText = 'a'.repeat(460); // Over 90% of 500 to trigger warning
    
    fireEvent.change(themeTextarea, { target: { value: longText } });
    
    expect(screen.getByText('460')).toBeInTheDocument();
    expect(screen.getByText('/500')).toBeInTheDocument();
    expect(screen.getByText('460')).toHaveClass('char-count warning');
  });

  it('handles keyboard shortcuts', () => {
    const mockOnGenerate = jest.fn();
    const mockOnClose = jest.fn();
    
    render(
      <ContentGenerationPanel 
        {...defaultProps} 
        onGenerate={mockOnGenerate}
        onClose={mockOnClose}
      />
    );
    
    // Test Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays default values correctly', () => {
    const defaultProps: ContentGenerationPanelProps = {
      onGenerate: jest.fn(),
      platforms: mockPlatforms,
      defaultTheme: '测试默认主题',
      defaultContentLength: 'long',
      defaultWritingStyle: 'casual',
      defaultKeywords: ['AI', '测试'],
      defaultIncludeCurrentNote: true,
      plugin: mockPlugin
    };

    render(<ContentGenerationPanel {...defaultProps} />);
    
    // Check theme input
    const themeTextarea = screen.getByDisplayValue('测试默认主题');
    expect(themeTextarea).toBeInTheDocument();
    
    // Check select values
    const selects = screen.getAllByRole('combobox');
    const lengthSelect = selects[0] as HTMLSelectElement;
    const styleSelect = selects[1] as HTMLSelectElement;
    
    expect(lengthSelect.value).toBe('long');
    expect(styleSelect.value).toBe('casual');
    
    // Check keywords
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('测试')).toBeInTheDocument();
    
    // Check checkbox
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });
}); 