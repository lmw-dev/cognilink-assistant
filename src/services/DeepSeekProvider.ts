import { AIProvider } from './AIProvider';
import { Message, MessageRole } from '../types/message';
import { requestUrl } from 'obsidian';
import { APIError, NetworkError } from './AIService';

export interface DeepSeekProviderOptions {
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt?: string;
}

export class DeepSeekProvider implements AIProvider {
  private options: DeepSeekProviderOptions;

  constructor(options: DeepSeekProviderOptions) {
    this.options = options;
  }

  async sendMessage(message: Message): Promise<Message> {
    const { apiKey, endpoint, model, maxTokens, temperature, systemPrompt } = this.options;
    const url = `${endpoint}/chat/completions`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    const body = {
      model,
      messages: [
        systemPrompt ? { role: 'system', content: systemPrompt } : null,
        { role: 'user', content: message.content }
      ].filter(Boolean),
      max_tokens: maxTokens,
      temperature,
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
        throw new APIError(`DeepSeek API error: ${response.status} ${response.text}`);
      }
      const data = response.json;
      const content = data.choices?.[0]?.message?.content || 'No response from DeepSeek.';
      return {
        id: Date.now().toString(),
        role: 'assistant' as MessageRole,
        content,
        timestamp: Date.now(),
      };
    } catch (err: any) {
      if (err instanceof APIError) throw err;
      if (err.message && err.message.includes('network')) {
        throw new NetworkError(`DeepSeek 网络错误: ${err.message}`);
      }
      throw new APIError(`DeepSeek API 调用失败: ${err.message || err}`);
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    const { apiKey, endpoint } = this.options;
    const url = `${endpoint}/embeddings`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    const body = {
      model: 'deepseek-embedding',
      input: text,
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
        throw new APIError(`DeepSeek Embedding API error: ${response.status} ${response.text}`);
      }
      const data = response.json;
      const embedding = data.data?.[0]?.embedding;
      if (Array.isArray(embedding)) {
        return embedding;
      }
      throw new APIError('DeepSeek Embedding API: No embedding returned');
    } catch (err: any) {
      if (err instanceof APIError) throw err;
      if (err.message && err.message.includes('network')) {
        throw new NetworkError(`DeepSeek 网络错误: ${err.message}`);
      }
      throw new APIError(`DeepSeek Embedding API 调用失败: ${err.message || err}`);
    }
  }

  async testConnection(): Promise<boolean> {
    const url = `${this.options.endpoint}/models`;
    const headers = {
      'Authorization': `Bearer ${this.options.apiKey}`,
      'Content-Type': 'application/json',
    };
    try {
      const response = await requestUrl({ url, method: 'GET', headers, throw: false });
      if (response.status === 200) return true;
      throw new APIError(`连接失败: ${response.status} ${response.text}`);
    } catch (err: any) {
      if (err instanceof APIError) throw err;
      if (err.message && err.message.includes('network')) {
        throw new NetworkError(`DeepSeek 网络错误: ${err.message}`);
      }
      throw new APIError(`DeepSeek Endpoint 连接失败: ${err.message || err}`);
    }
  }
} 