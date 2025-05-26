import { Notice } from 'obsidian';
import CogniLinkPlugin from '../main';
import { Message } from '../types/message';
import { Logger } from '../utils/logger';
import { Settings } from '../types/settings';
import { AIProvider } from './AIProvider';
import { AnthropicProvider, AnthropicProviderOptions } from './AnthropicProvider';
import { LocalProvider } from './LocalProvider';
import { OpenAIProvider, OpenAIProviderOptions } from './OpenAIProvider';
import { request } from 'obsidian';

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
      
      // 集成 RAG 功能：检索相关文档并增强消息内容
      const enhancedMessage = await this.enhanceMessageWithRAG(message);
      
      return await provider.sendMessage(enhancedMessage);
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

  /**
   * 使用 RAG 增强消息内容
   */
  private async enhanceMessageWithRAG(message: Message): Promise<Message> {
    try {
      // 检查是否启用 RAG 功能
      const ragSettings = this.settings.rag;
      if (!ragSettings || !this.plugin.embeddingService) {
        this.logger.info('[AIService] RAG 功能未启用或服务不可用，使用原始消息');
        return message;
      }

      const query = message.content;
      this.logger.info(`[AIService] 开始 RAG 检索，查询: "${query}"`);

      // 使用 EmbeddingService 检索相关文档
      const relevantNotes = await this.plugin.embeddingService.findRelevantNotes(
        query,
        ragSettings.topK || 5,
        ragSettings.threshold || 0.7
      );

      if (relevantNotes.length === 0) {
        this.logger.info('[AIService] 未找到相关文档，使用原始消息');
        return message;
      }

      this.logger.info(`[AIService] 找到 ${relevantNotes.length} 个相关文档`);

      // 构建带上下文的增强消息
      const contextParts: string[] = [];
      relevantNotes.forEach((note, index) => {
        const noteContent = note.content.length > 500 
          ? note.content.substring(0, 500) + '...' 
          : note.content;
        
        contextParts.push(`【参考资料${index + 1}】来源：${note.title}\n${noteContent}`);
      });

      const context = contextParts.join('\n\n');
      
      // 构建增强的提示词
      const enhancedContent = `请基于以下参考资料回答用户问题，如果参考资料中没有相关信息，请明确说明并基于你的知识回答。请在回答中标注信息来源。

参考资料：
${context}

用户问题：${query}

请提供详细、准确的回答，并在适当位置标注参考资料来源（如：根据【参考资料1】...）。`;

      this.logger.info(`[AIService] RAG 增强完成，上下文长度: ${context.length} 字符`);

      return {
        ...message,
        content: enhancedContent
      };

    } catch (error) {
      this.logger.error('[AIService] RAG 增强失败:', error);
      // RAG 失败时回退到原始消息
      return message;
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    const MAX_SAFE_LENGTH = 4000; // 可根据模型实际 token 限制调整
    try {
      this.logger.info('[AIService] generateEmbeddings called with text length:', text.length);
      return await this.provider.generateEmbeddings(text);
    } catch (err: any) {
      // OpenAIProvider 400 context length 超限特殊处理
      if (typeof err?.message === 'string' && err.message.includes('maximum context length')) {
        this.logger.warn('[AIService] 捕获到 context 超限错误，自动降级分片重试');
        // 自动分片递归处理
        const chunkSize = 2000;
        if (text.length <= chunkSize) {
          // 已无法再分片，直接抛出
          this.logger.error('[AIService] 单片内容仍超长，无法处理');
          throw err;
        }
        // 按 chunkSize 分片
        const chunks: string[] = [];
        for (let i = 0; i < text.length; i += chunkSize) {
          chunks.push(text.slice(i, i + chunkSize));
        }
        this.logger.info(`[AIService] 自动降级分片为 ${chunks.length} 片，每片 <= ${chunkSize} 字`);
        const embeddings: number[][] = [];
        for (let i = 0; i < chunks.length; i++) {
          try {
            embeddings.push(await this.generateEmbeddings(chunks[i]));
          } catch (e) {
            this.logger.error(`[AIService] 分片 ${i+1} 生成 embedding 失败`, e);
          }
        }
        if (embeddings.length === 0) throw err;
        // 均值聚合
        const dim = embeddings[0].length;
        const avg: number[] = Array(dim).fill(0);
        for (const emb of embeddings) {
          for (let i = 0; i < dim; i++) avg[i] += emb[i];
        }
        for (let i = 0; i < dim; i++) avg[i] /= embeddings.length;
        this.logger.info(`[AIService] 自动降级分片后返回均值 embedding, 分片数: ${embeddings.length}`);
        return avg;
      }
      this.logger.error('generateEmbeddings error:', err);
      throw err;
    }
  }

  /**
   * 根据主题和上下文生成原创文档（自动分流到当前 Provider）
   */
  async generateOriginalDoc(theme: string, context: string): Promise<string> {
    const { provider, openAIApiKey, openAIEndpoint, anthropicApiKey, anthropicEndpoint, model, maxTokens, temperature, defaultSystemPrompt } = this.settings.ai;

    const prompt = `请根据主题"${theme}"${context ? '，并结合以下内容：\n' + context : ''}，生成一篇结构清晰、内容丰富的原创文档。`;
    console.log('[AIService] generateOriginalDoc called', { provider, model, prompt, context });

    if (provider === 'openai') {
      if (!openAIApiKey) throw new ConfigurationError('OpenAI API Key 未配置');
      let endpoint = openAIEndpoint?.trim() || 'https://api.openai.com/v1';
      endpoint = endpoint.replace(/\/+$/, '');
      endpoint += '/chat/completions';
      const body = {
        model: model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: defaultSystemPrompt || '你是专业的中文文档写作助手。' },
          { role: 'user', content: prompt }
        ],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 2048
      };
      console.log('[AIService] OpenAI request', { endpoint, body });
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        console.log('[AIService] fetch response', data);
        if (!res.ok) {
          let userMsg = 'OpenAI 生成失败';
          if (data?.error) {
            if (res.status === 429 || data.error.code === 'rate_limit_exceeded') {
              userMsg = 'OpenAI 速率/额度限制：' + (data.error.message || '请稍后重试或降低 max_tokens。');
            } else if (data.error.message) {
              userMsg = 'OpenAI 错误：' + data.error.message;
            }
          }
          throw new APIError(userMsg);
        }
        return data.choices?.[0]?.message?.content?.trim() || '生成失败';
      } catch (err) {
        console.error('[AIService] fetch error', err);
        throw new APIError(err?.message || 'OpenAI 生成失败');
      }
    } else if (provider === 'anthropic') {
      if (!anthropicApiKey) throw new ConfigurationError('Anthropic API Key 未配置');
      const endpoint = (anthropicEndpoint || 'https://api.anthropic.com/v1/messages').replace(/\/+$/, '') + '/messages';
      try {
        const res = await request({
          url: endpoint,
          method: 'POST',
          headers: {
            'x-api-key': anthropicApiKey,
            'content-type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model || 'claude-3-haiku-20240307',
            max_tokens: maxTokens ?? 2048,
            temperature: temperature ?? 0.7,
            system: defaultSystemPrompt || '你是专业的中文文档写作助手。',
            messages: [
              { role: 'user', content: prompt }
            ]
          })
        });
        const data = JSON.parse(res);
        if (Array.isArray(data.content) && data.content[0]?.text) {
          return data.content[0].text.trim();
        }
        return '生成失败';
      } catch (err: any) {
        throw new APIError('Anthropic 生成失败: ' + (err?.message || err));
      }
    } else {
      throw new ConfigurationError('未配置有效的 AI Provider');
    }
  }
}
