import { Notice } from 'obsidian';
import CogniLinkPlugin from '../main';
import { ChatMessage, AIResponse, MessageRole } from '../types/chat';
import { EmbeddingService } from './EmbeddingService';
import { Plugin } from 'obsidian';
import { Message } from '../types/message';
import { PluginSettings } from '../types/settings';

// Custom error types
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class ConfigurationError extends AIServiceError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
  }
}

export class APIError extends AIServiceError {
  constructor(message: string) {
    super(message, 'API_ERROR');
  }
}

export class NetworkError extends AIServiceError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}

interface Note {
  title: string;
  content: string;
  link: string;
}

interface APIMessage {
  role: MessageRole;
  content: string;
}

export class AIService {
  private plugin: CogniLinkPlugin;
  private settings: PluginSettings;
  private embeddingService: EmbeddingService;

  constructor(plugin: CogniLinkPlugin) {
    this.plugin = plugin;
    this.settings = plugin.settings;
    this.embeddingService = new EmbeddingService(plugin);
  }

  async sendMessage(message: Message): Promise<Message> {
    const { provider, apiKey, model } = this.settings.ai;

    if (!apiKey) {
      throw new Error('API 密钥未配置');
    }

    switch (provider) {
      case 'openai':
        return this.sendToOpenAI(message);
      case 'anthropic':
        return this.sendToAnthropic(message);
      case 'local':
        return this.sendToLocal(message);
      default:
        throw new Error('不支持的 AI 提供商');
    }
  }

  private async sendToOpenAI(message: Message): Promise<Message> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.settings.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: this.settings.ai.model,
        messages: [
          {
            role: 'system',
            content: this.settings.ai.defaultSystemPrompt,
          },
          {
            role: 'user',
            content: message.content,
          },
        ],
        temperature: this.settings.ai.temperature,
        max_tokens: this.settings.ai.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API 请求失败');
    }

    const data = await response.json();
    return {
      id: data.id,
      content: data.choices[0].message.content,
      role: 'assistant',
      timestamp: Date.now(),
    };
  }

  private async sendToAnthropic(message: Message): Promise<Message> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.settings.ai.apiKey,
      },
      body: JSON.stringify({
        model: this.settings.ai.model,
        messages: [
          {
            role: 'user',
            content: message.content,
          },
        ],
        system: this.settings.ai.defaultSystemPrompt,
        max_tokens: this.settings.ai.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error('Anthropic API 请求失败');
    }

    const data = await response.json();
    return {
      id: data.id,
      content: data.content,
      role: 'assistant',
      timestamp: Date.now(),
    };
  }

  private async sendToLocal(message: Message): Promise<Message> {
    // 本地模型实现
    throw new Error('本地模型暂未实现');
  }
}
