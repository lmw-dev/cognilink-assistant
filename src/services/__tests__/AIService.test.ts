import { AIService } from '../AIService';
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
          apiKey: 'test-key',
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

  it('should throw error when API key is not configured', async () => {
    plugin.settings.ai.apiKey = '';
    const message: Message = {
      id: 'test-id',
      content: 'Hello',
      role: 'user',
      timestamp: Date.now(),
    };

    await expect(aiService.sendMessage(message)).rejects.toThrow('API 密钥未配置');
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
