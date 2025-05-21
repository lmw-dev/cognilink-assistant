import { AIProvider } from './AIProvider';
import { Message, MessageRole } from '../types/message';
import { requestUrl } from 'obsidian';
import { APIError, NetworkError } from './AIService';
import { Logger } from '../utils/logger';

export interface OpenAIProviderOptions {
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt?: string;
}

export class OpenAIProvider implements AIProvider {
  private options: OpenAIProviderOptions;
  private logger: Logger;

  constructor(options: OpenAIProviderOptions) {
    this.options = options;
    this.logger = new Logger('OpenAIProvider');
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
    console.log('[OpenAIProvider][sendMessage] url:', url);
    console.log('[OpenAIProvider][sendMessage] headers:', headers);
    console.log('[OpenAIProvider][sendMessage] body:', body);
    try {
      const response = await requestUrl({
        url,
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        throw: false,
      });
      if (response.status !== 200) {
        throw new APIError(`OpenAI API error: ${response.status} ${response.text}`);
      }
      const data = response.json;
      const content = data.choices?.[0]?.message?.content || 'No response from OpenAI.';
      return {
        id: Date.now().toString(),
        role: 'assistant' as MessageRole,
        content,
        timestamp: Date.now(),
      };
    } catch (err: any) {
      if (err instanceof APIError) throw err;
      if (err.message && err.message.includes('network')) {
        throw new NetworkError(`OpenAI 网络错误: ${err.message}`);
      }
      throw new APIError(`OpenAI API 调用失败: ${err.message || err}`);
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
      model: 'text-embedding-ada-002',
      input: text,
    };
    console.log('[OpenAIProvider][generateEmbeddings] url:', url);
    console.log('[OpenAIProvider][generateEmbeddings] headers:', headers);
    console.log('[OpenAIProvider][generateEmbeddings] body:', body);
    try {
      const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new APIError('OpenAI Embedding API 超时（30秒）')), 30000));
      const response = await Promise.race([
        requestUrl({
          url,
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          throw: false,
        }),
        timeoutPromise
      ]);
      if (response.status !== 200) {
        this.logger.error('OpenAI Embedding API error:', new Error(`${response.status} ${response.text}`));
        throw new APIError(`OpenAI Embedding API error: ${response.status} ${response.text}`);
      }
      const data = response.json;
      const embedding = data.data?.[0]?.embedding;
      if (Array.isArray(embedding)) {
        return embedding;
      }
      this.logger.error('OpenAI Embedding API: No embedding returned', new Error(JSON.stringify(data)));
      throw new APIError('OpenAI Embedding API: No embedding returned');
    } catch (err: any) {
      this.logger.error('generateEmbeddings error:', err instanceof Error ? err : new Error(String(err)));
      if (err instanceof APIError) throw err;
      if (err.message && err.message.includes('network')) {
        throw new NetworkError(`OpenAI 网络错误: ${err.message}`);
      }
      throw new APIError(`OpenAI Embedding API 调用失败: ${err.message || err}`);
    }
  }

  async testConnection(): Promise<boolean> {
    const url = `${this.options.endpoint}/models`;
    const headers = {
      'Authorization': `Bearer ${this.options.apiKey}`,
      'Content-Type': 'application/json',
    };
    console.log('[OpenAIProvider][testConnection] url:', url);
    console.log('[OpenAIProvider][testConnection] headers:', headers);
    try {
      const response = await requestUrl({ url, method: 'GET', headers, throw: false });
      console.log('[OpenAIProvider][testConnection] response.status:', response.status);
      console.log('[OpenAIProvider][testConnection] response.text:', response.text);
      try {
        console.log('[OpenAIProvider][testConnection] response.json:', response.json);
      } catch (e) {
        // response 不是 json 时忽略
      }
      if (response.status === 200) return true;
      throw new APIError(`连接失败: ${response.status} ${response.text}`);
    } catch (err: any) {
      if (err instanceof APIError) throw err;
      if (err.message && err.message.includes('network')) {
        throw new NetworkError(`OpenAI 网络错误: ${err.message}`);
      }
      throw new APIError(`OpenAI Endpoint 连接失败: ${err.message || err}`);
    }
  }

  async validateApiKey(): Promise<{ valid: boolean; error?: string }> {
    const url = `${this.options.endpoint}/models`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.options.apiKey}`,
    };
    try {
      const response = await requestUrl({
        url,
        method: 'GET',
        headers,
        throw: false,
      });
      if (response.status === 401 || response.status === 403) {
        return { valid: false, error: 'API Key 无效或无权限' };
      }
      if (response.status !== 200) {
        return { valid: false, error: `OpenAI API 错误: ${response.status}` };
      }
      return { valid: true };
    } catch (err: any) {
      return { valid: false, error: err.message || String(err) };
    }
  }
} 