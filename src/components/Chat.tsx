import * as React from 'react';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import CogniLinkPlugin from '../main';
import { Message } from '../types/message';
import { v4 as uuidv4 } from 'uuid';

interface ChatProps {
  plugin: CogniLinkPlugin;
}

// 社交媒体平台关键词映射
const PLATFORM_KEYWORDS: Record<string, string[]> = {
  xiaohongshu: ['小红书', '种草', '种草文', '小红书文案', '小红书推荐'],
  twitter: ['twitter', 'Twitter', '推特', '推文', 'tweet'],
  wechat: ['微信公众号', '公众号', '微信文章', '公众号文章'],
  blog: ['博客', '个人博客', '技术博客', '博客文章'],
  toutiao: ['头条', '头条号', '今日头条', '头条文章']
};

// 意图识别结果接口
interface IntentRecognitionResult {
  isSocialMediaRequest: boolean;
  platform?: string;
  theme?: string;
  confidence: number;
}

const ChatMessage = memo(({ message }: { message: Message }) => (
  <div className={`chat-message ${message.role}`}>
    <div className="message-content">{message.content}</div>
    <div className="message-timestamp">
      {new Date(message.timestamp).toLocaleTimeString()}
    </div>
  </div>
));

ChatMessage.displayName = 'ChatMessage';

export const Chat: React.FC<ChatProps> = ({ plugin }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Chat component mounted');
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 社交媒体意图识别
  const recognizeSocialMediaIntent = useCallback((message: string): IntentRecognitionResult => {
    const lowerMessage = message.toLowerCase();
    
    // 检查是否包含生成相关的关键词
    const generationKeywords = ['生成', '写', '创作', '帮我写', '帮我生成', '制作'];
    const hasGenerationKeyword = generationKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (!hasGenerationKeyword) {
      return { isSocialMediaRequest: false, confidence: 0 };
    }
    
    // 检查平台关键词
    let detectedPlatform: string | undefined;
    let maxMatches = 0;
    
    for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
      const matches = keywords.filter(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedPlatform = platform;
      }
    }
    
    // 提取主题
    let theme: string | undefined;
    const themePatterns = [
      /主题[是：:]\s*['"]?([^'"，。！？\n]+)['"]?/,
      /关于\s*['"]?([^'"，。！？\n]+)['"]?/,
      /['"]([^'"，。！？\n]+)['"]?\s*的?[文章内容]/,
      /推荐\s*['"]?([^'"，。！？\n]+)['"]?/
    ];
    
    for (const pattern of themePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        theme = match[1].trim();
        break;
      }
    }
    
    // 如果没有明确主题，尝试从整个消息中提取
    if (!theme && detectedPlatform && PLATFORM_KEYWORDS[detectedPlatform]) {
      // 移除平台关键词和生成关键词，剩余部分可能是主题
      let cleanMessage = message;
      [...generationKeywords, ...PLATFORM_KEYWORDS[detectedPlatform]].forEach(keyword => {
        cleanMessage = cleanMessage.replace(new RegExp(keyword, 'gi'), '');
      });
      
      // 清理标点符号和多余空格
      theme = cleanMessage
        .replace(/[，。！？：:""'']/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (theme.length < 3 || theme.length > 100) {
        theme = undefined;
      }
    }
    
    const confidence = detectedPlatform ? 
      (maxMatches > 0 ? 0.8 + (maxMatches * 0.1) : 0.6) : 
      (hasGenerationKeyword ? 0.3 : 0);
    
    return {
      isSocialMediaRequest: confidence > 0.5,
      platform: detectedPlatform,
      theme,
      confidence
    };
  }, []);

  // 打开社交媒体内容生成面板
  const openSocialMediaPanel = useCallback(async (platform?: string, theme?: string) => {
    try {
      console.log('Opening social media panel with:', { platform, theme });
      
      // 添加系统消息提示用户
      const systemMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `检测到社交媒体内容生成请求，正在为您打开专用生成面板...${platform ? `\n平台：${platform}` : ''}${theme ? `\n主题：${theme}` : ''}`,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
      // 调用插件的社交媒体面板打开方法
      if ('openSocialMediaPanel' in plugin && typeof plugin.openSocialMediaPanel === 'function') {
        await (plugin as any).openSocialMediaPanel(platform, theme);
      } else {
        console.warn('Social media panel method not available');
        // 如果没有专用方法，尝试通过命令调用
        const app = plugin.app as any;
        if (app.commands && app.commands.findCommand) {
          const command = app.commands.findCommand('cognilink-assistant:open-social-media-generator');
          if (command && app.commands.executeCommandById) {
            app.commands.executeCommandById('cognilink-assistant:open-social-media-generator');
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to open social media panel:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'error',
        content: '打开社交媒体生成面板失败，请手动使用命令面板打开',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [plugin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    console.log('Submitting message...');
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    const originalInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // 进行意图识别
      const intent = recognizeSocialMediaIntent(originalInput);
      console.log('Intent recognition result:', intent);
      
      if (intent.isSocialMediaRequest && intent.confidence > 0.7) {
        // 如果是高置信度的社交媒体请求，打开专用面板
        await openSocialMediaPanel(intent.platform, intent.theme);
        return;
      } else if (intent.isSocialMediaRequest && intent.confidence > 0.5) {
        // 中等置信度，询问用户是否要使用专用面板
        const confirmMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `检测到您可能想要生成社交媒体内容。是否使用专用的社交媒体内容生成面板？这样可以获得更好的生成效果和质量评估。\n\n如果是，请回复"是"或"使用面板"；如果不是，我将继续为您提供常规回答。`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, confirmMessage]);
        return;
      }
      
      // 常规消息处理
      console.log('Calling AIService.sendMessage...');
      const response = await plugin.aiService.sendMessage(userMessage);
      console.log('AIService response:', response);
      setMessages(prev => [...prev, response]);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          role: 'error',
          content: '消息发送失败，请重试',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <div className="cognilink-chat" ref={chatContainerRef}>
      <div className="chat-messages">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (支持社交媒体内容生成请求)"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '发送中...' : '发送'}
        </button>
      </form>
    </div>
  );
};
