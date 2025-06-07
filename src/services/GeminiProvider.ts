import { AIProvider } from './AIProvider';
import { Message, MessageRole } from '../types/message';
import { requestUrl } from 'obsidian';
import { APIError, NetworkError } from './AIService';

export interface GeminiProviderOptions {
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt?: string;
}

export class GeminiProvider implements AIProvider {
  private options: GeminiProviderOptions;

  constructor(options: GeminiProviderOptions) {
    this.options = options;
  }

  async sendMessage(message: Message): Promise<Message> {
    const { apiKey, endpoint, model, maxTokens, temperature, systemPrompt } = this.options;
    const url = `${endpoint}/v1beta/models/${model}:generateContent`;
    const headers = {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    };
    const body = {
      contents: [
        { role: 'user', parts: [{ text: message.content }] }
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      }
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
        throw new APIError(`Gemini API error: ${response.status} ${response.text}`);
      }
      const data = response.json;
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
      return {
        id: Date.now().toString(),
        role: 'assistant' as MessageRole,
        content,
        timestamp: Date.now(),
      };
    } catch (err: any) {
      if (err instanceof APIError) throw err;
      if (err.message && err.message.includes('network')) {
        throw new NetworkError(`Gemini 网络错误: ${err.message}`);
      }
      throw new APIError(`Gemini API 调用失败: ${err.message || err}`);
    }
  }

  async testConnection(): Promise<boolean> {
    const url = `${this.options.endpoint}/v1beta/models`;
    const headers = {
      'x-goog-api-key': this.options.apiKey,
      'Content-Type': 'application/json',
    };
    try {
      const response = await requestUrl({ url, method: 'GET', headers, throw: false });
      if (response.status === 200) return true;
      throw new APIError(`连接失败: ${response.status} ${response.text}`);
    } catch (err: any) {
      if (err instanceof APIError) throw err;
      if (err.message && err.message.includes('network')) {
        throw new NetworkError(`Gemini 网络错误: ${err.message}`);
      }
      throw new APIError(`Gemini Endpoint 连接失败: ${err.message || err}`);
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    const { apiKey, endpoint, model } = this.options;
    // Gemini embedding API endpoint
    const url = `${endpoint}/v1beta/models/${model}:embedContent`;
    const headers = {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    };
    const body = {
      content: {
        parts: [{ text }]
      }
    };
    try {
      const response = await requestUrl({
        url,
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        throw: false,
      });
      const rawText = response.text;
      if (response.status !== 200) {
        throw new APIError(`Gemini Embedding API error: ${response.status} ${rawText}`);
      }
      let data: any;
      try {
        data = response.json;
      } catch (e) {
        throw new APIError(`Gemini Embedding API 非 JSON 返回: ${rawText}`);
      }
      // Gemini embedding API 返回格式: { embedding: { values: number[] } }
      const embedding = data?.embedding?.values;
      if (Array.isArray(embedding)) {
        return embedding;
      }
      throw new APIError(`Gemini Embedding API: No embedding returned, 原始返回: ${rawText}`);
    } catch (err: any) {
      if (err instanceof APIError) throw err;
      if (err.message && err.message.includes('network')) {
        throw new NetworkError(`Gemini 网络错误: ${err.message}`);
      }
      throw new APIError(`Gemini Embedding API 调用失败: ${err.message || err}`);
    }
  }
} 