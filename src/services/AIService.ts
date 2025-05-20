import { Notice } from 'obsidian';
import CogniLinkPlugin from '../main';
import { Message } from '../types/message';
import { Logger } from '../utils/logger';
import { Settings } from '../types/settings';
import { AIProvider } from './AIProvider';
import { AnthropicProvider, AnthropicProviderOptions } from './AnthropicProvider';
import { LocalProvider } from './LocalProvider';
import { OpenAIProvider, OpenAIProviderOptions } from './OpenAIProvider';

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
  private provider: AIProvider;

  constructor(plugin: CogniLinkPlugin) {
    console.log('[AIService] Constructor called');
    this.plugin = plugin;
    this.settings = plugin.settings;
    this.logger = new Logger('AIService');
    this.provider = this.createProvider();
    
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

  private createProvider(): AIProvider {
    const { provider, model, anthropicApiKey, anthropicEndpoint, openAIApiKey, openAIEndpoint, maxTokens, temperature, defaultSystemPrompt } = this.settings.ai;
    
    try {
      if (provider === 'anthropic') {
        if (!anthropicApiKey) {
          console.warn('[AIService] Anthropic API key is missing, falling back to LocalProvider');
          new Notice('Anthropic API key 未配置，请在设置中添加');
          return new LocalProvider();
        }
        const options: AnthropicProviderOptions = {
          apiKey: anthropicApiKey,
          endpoint: anthropicEndpoint || 'https://api.anthropic.com',
          model,
          maxTokens,
          temperature,
          systemPrompt: defaultSystemPrompt,
        };
        return new AnthropicProvider(options);
      } else if (provider === 'openai') {
        if (!openAIApiKey) {
          console.warn('[AIService] OpenAI API key is missing, falling back to LocalProvider');
          new Notice('OpenAI API key 未配置，请在设置中添加');
          return new LocalProvider();
        }
        const options: OpenAIProviderOptions = {
          apiKey: openAIApiKey,
          endpoint: openAIEndpoint || 'https://api.openai.com/v1',
          model,
          maxTokens,
          temperature,
          systemPrompt: defaultSystemPrompt,
        };
        return new OpenAIProvider(options);
      } else if (provider === 'local') {
        return new LocalProvider();
      } else {
        console.warn(`[AIService] Unsupported provider: ${provider}, falling back to LocalProvider`);
        return new LocalProvider();
      }
    } catch (error) {
      console.error('[AIService] Error creating provider:', error);
      return new LocalProvider(); // 异常情况也回退到本地提供商
    }
  }

  async sendMessage(message: Message): Promise<Message> {
    try {
      const provider = this.createProvider();
      return await provider.sendMessage(message);
    } catch (err: any) {
      if (err instanceof ConfigurationError) {
        console.error('[AIService] 配置错误:', err);
        new Notice('AI 配置错误：' + err.message);
        throw err;
      } else if (err instanceof NetworkError) {
        console.error('[AIService] 网络错误:', err);
        new Notice('AI 网络错误：' + err.message);
        throw err;
      } else if (err instanceof APIError) {
        console.error('[AIService] API 错误:', err);
        new Notice('AI API 错误：' + err.message);
        throw err;
      } else {
        console.error('[AIService] 未知错误:', err);
        new Notice('AI 未知错误：' + (err?.message || err));
        throw err;
      }
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    console.log('[AIService] generateEmbeddings called with text length:', text.length);
    
    return this.provider.generateEmbeddings(text);
  }
}
