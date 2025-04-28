import { Notice } from 'obsidian';
import CogniLinkPlugin from '../main';
import { Message, MessageRole } from '../types/message';
import { PluginSettings } from '../types/settings';
import { Logger } from '../utils/logger';
import { Settings } from '../types/settings';

export class AIServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class APIError extends AIServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends AIServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AIService {
  private plugin: CogniLinkPlugin;
  private settings: Settings;
  private logger: Logger;

  constructor(plugin: CogniLinkPlugin) {
    console.log('[AIService] Constructor called');
    this.plugin = plugin;
    this.settings = plugin.settings;
    this.logger = new Logger('AIService');
    
    // 详细记录初始化信息
    console.log('[AIService] Initializing with settings:', {
      provider: this.settings.ai.provider,
      model: this.settings.ai.model,
      hasAnthropicKey: !!this.settings.ai.anthropicApiKey,
    });
    
    // 记录加载的模块
    console.log('[AIService] Loaded modules:', {
      obsidian: !!Notice,
      settings: !!this.settings,
      logger: !!this.logger,
    });
  }

  async sendMessage(message: Message): Promise<Message> {
    console.log('[AIService] sendMessage called with:', {
      messageId: message.id,
      role: message.role,
      timestamp: message.timestamp,
    });
    
    this.logger.info('Sending message', { 
      provider: this.settings.ai.provider,
      model: this.settings.ai.model,
    });
    
    // 新增异常处理逻辑
    if (this.settings.ai.provider === 'anthropic' && !this.settings.ai.anthropicApiKey) {
      throw new ConfigurationError('Anthropic API key is missing');
    }
    if (this.settings.ai.provider !== 'anthropic' && this.settings.ai.provider !== 'local') {
      throw new Error('Unsupported AI provider');
    }
    
    // 临时返回模拟响应
    const response: Message = {
      id: Date.now().toString(),
      role: 'assistant' as MessageRole,
      content: '这是一个模拟响应。AI 功能正在开发中。',
      timestamp: Date.now(),
    };
    
    console.log('[AIService] Returning mock response:', response);
    return response;
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    console.log('[AIService] generateEmbeddings called with text length:', text.length);
    
    // 临时返回模拟的嵌入向量
    const embeddings = Array(1536).fill(0).map(() => Math.random());
    console.log('[AIService] Returning mock embeddings of length:', embeddings.length);
    return embeddings;
  }
}
