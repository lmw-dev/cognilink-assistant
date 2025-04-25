import { AIService, ConfigurationError } from '../AIService';
import CogniLinkPlugin from '../../main';
import { Message } from '../../types/message';

describe('AIService', () => {
  let plugin: CogniLinkPlugin;
  let aiService: AIService;

  beforeEach(() => {
    plugin = {
      settings: {
        ai: {
          provider: 'openai',
          openAIApiKey: 'test-openai-key',
          anthropicApiKey: 'test-anthropic-key',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          defaultSystemPrompt: '你是一个智能助手',
        },
        ui: {
          theme: 'system',
          fontSize: 'medium',
          messageSpacing: 'comfortable',
          showTimestamp: true,
          enableAnimations: true,
        },
        shortcuts: {
          toggleChat: 'Mod+Shift+C',
          newChat: 'Mod+Shift+N',
          focusInput: 'Mod+Shift+I',
        },
      },
    } as CogniLinkPlugin;

    aiService = new AIService(plugin);
  });

  describe('OpenAI provider', () => {
    it('should throw error when OpenAI API key is not configured', async () => {
      plugin.settings.ai.provider = 'openai';
      plugin.settings.ai.openAIApiKey = '';
      const message: Message = {
        id: 'test-id',
        content: 'Hello',
        role: 'user',
        timestamp: Date.now(),
      };

      await expect(aiService.sendMessage(message)).rejects.toThrow('OpenAI API 密钥未配置');
    });
  });

  describe('Anthropic provider', () => {
    it('should throw error when Anthropic API key is not configured', async () => {
      plugin.settings.ai.provider = 'anthropic';
      plugin.settings.ai.anthropicApiKey = '';
      const message: Message = {
        id: 'test-id',
        content: 'Hello',
        role: 'user',
        timestamp: Date.now(),
      };

      await expect(aiService.sendMessage(message)).rejects.toThrow('Anthropic API 密钥未配置');
    });
  });

  it('should throw error for unsupported provider', async () => {
    plugin.settings.ai.provider = 'unsupported' as any;
    const message: Message = {
      id: 'test-id',
      content: 'Hello',
      role: 'user',
      timestamp: Date.now(),
    };

    await expect(aiService.sendMessage(message)).rejects.toThrow('不支持的 AI 提供商');
  });
});
