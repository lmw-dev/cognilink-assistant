import { AIProvider } from './AIProvider';
import { Message, MessageRole } from '../types/message';
import { requestUrl } from 'obsidian';

export interface AnthropicProviderOptions {
  apiKey: string;
  endpoint?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt?: string;
}

export class AnthropicProvider implements AIProvider {
  private options: AnthropicProviderOptions;

  constructor(options: AnthropicProviderOptions) {
    this.options = options;
  }

  async sendMessage(message: Message): Promise<Message> {
    const { apiKey, endpoint = 'https://api.anthropic.com', model, maxTokens, temperature, systemPrompt } = this.options;
    const url = `${endpoint}/v1/messages`;
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    };
    const body = {
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt || '',
      messages: [
        { role: 'user', content: message.content }
      ]
    };
    try {
      const response = await requestUrl({
        url,
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        throw: false,
      });
      if (response.status !== 200) {
        throw new Error(`Anthropic API error: ${response.status} ${response.text}`);
      }
      const data = response.json;
      const content = data.content?.[0]?.text || 'No response from Anthropic.';
      return {
        id: Date.now().toString(),
        role: 'assistant' as MessageRole,
        content,
        timestamp: Date.now(),
      };
    } catch (err: any) {
      return {
        id: Date.now().toString(),
        role: 'error' as MessageRole,
        content: `Anthropic API 调用失败: ${err.message || err}`,
        timestamp: Date.now(),
      };
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    // TODO: Anthropic 暂无公开 embedding API，返回 mock
    return Array(1536).fill(0).map(() => Math.random());
  }

  async testConnection(): Promise<boolean> {
    // TODO: 实现 API 连通性测试
    return true;
  }

  async validateApiKey(): Promise<{ valid: boolean; error?: string }> {
    const { apiKey, endpoint = 'https://api.anthropic.com' } = this.options;
    const url = `${endpoint}/v1/messages`;
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    };
    // 发送一个无效内容的请求，只校验 key 是否被拒绝
    const body = {
      model: this.options.model,
      max_tokens: 1,
      temperature: 0,
      system: '',
      messages: [
        { role: 'user', content: 'ping' }
      ]
    };
    try {
      const response = await requestUrl({
        url,
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        throw: false,
      });
      if (response.status === 401 || response.status === 403) {
        return { valid: false, error: 'API Key 无效或无权限' };
      }
      if (response.status !== 200) {
        return { valid: false, error: `Anthropic API 错误: ${response.status}` };
      }
      return { valid: true };
    } catch (err: any) {
      return { valid: false, error: err.message || String(err) };
    }
  }
} 