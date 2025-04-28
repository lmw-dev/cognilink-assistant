import { AIService, ConfigurationError } from '../AIService';
import { PluginSettings } from '../../types/settings';
import { DEFAULT_SETTINGS } from '../../types/settings';
import { requestUrl } from 'obsidian';

jest.mock('obsidian', () => ({
  requestUrl: jest.fn(),
}));

describe('AIService', () => {
  let plugin: { settings: PluginSettings };
  let service: AIService;

  beforeEach(() => {
    plugin = {
      settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
    };
    plugin.settings.ai.provider = 'local';
    service = new AIService(plugin as any);
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should throw ConfigurationError when Anthropic API key is missing', async () => {
      plugin.settings.ai.provider = 'anthropic';
      plugin.settings.ai.anthropicApiKey = '';
      service = new AIService(plugin as any);
      let errorCaught = false;
      try {
        await service.sendMessage({
          id: '1',
          role: 'user',
          content: 'test message',
          timestamp: Date.now()
        });
      } catch (e: any) {
        errorCaught = true;
        console.log('实际异常内容:', e, 'message:', e?.message);
        expect(e && e.message ? e.message : e).toContain('Anthropic API key is missing');
      }
      if (!errorCaught) {
        fail('Expected error was not thrown');
      }
    });

    it('should throw error for unsupported provider', async () => {
      (plugin.settings.ai.provider as any) = 'unsupported';
      service = new AIService(plugin as any);
      let errorCaught = false;
      try {
        await service.sendMessage({
          id: '1',
          role: 'user',
          content: 'test message',
          timestamp: Date.now()
        });
      } catch (e: any) {
        errorCaught = true;
        console.log('实际异常内容:', e, 'message:', e?.message);
        expect(e && e.message ? e.message : e).toContain('Unsupported AI provider');
      }
      if (!errorCaught) {
        fail('Expected error was not thrown');
      }
    });

    it('should return OpenAI assistant message', async () => {
      plugin.settings.ai.provider = 'openai';
      plugin.settings.ai.openAIApiKey = 'test-key';
      plugin.settings.ai.model = 'gpt-3.5-turbo';
      service = new AIService(plugin as any);
      (requestUrl as jest.Mock).mockResolvedValue({
        status: 200,
        json: {
          choices: [ { message: { content: 'Hi from OpenAI!' } } ]
        }
      });
      const res = await service.sendMessage({
        id: '1',
        role: 'user',
        content: 'hello',
        timestamp: Date.now()
      });
      expect(res.role).toBe('assistant');
      expect(res.content).toBe('Hi from OpenAI!');
    });

    it('should return Anthropic assistant message', async () => {
      plugin.settings.ai.provider = 'anthropic';
      plugin.settings.ai.anthropicApiKey = 'test-anthropic-key';
      plugin.settings.ai.model = 'claude-2';
      service = new AIService(plugin as any);
      (requestUrl as jest.Mock).mockResolvedValue({
        status: 200,
        json: {
          content: [ { text: 'Hi from Claude!' } ]
        }
      });
      const res = await service.sendMessage({
        id: '1',
        role: 'user',
        content: 'hello',
        timestamp: Date.now()
      });
      expect(res.role).toBe('assistant');
      expect(res.content).toBe('Hi from Claude!');
    });

    it('should return LocalProvider mock response', async () => {
      plugin.settings.ai.provider = 'local';
      service = new AIService(plugin as any);
      const res = await service.sendMessage({
        id: '1',
        role: 'user',
        content: 'hello',
        timestamp: Date.now()
      });
      expect(res.role).toBe('assistant');
      expect(res.content).toMatch(/LocalProvider mock response/);
    });

    it('should throw ConfigurationError when Anthropic API key is missing (sync)', () => {
      plugin.settings.ai.provider = 'anthropic';
      plugin.settings.ai.anthropicApiKey = '';
      service = new AIService(plugin as any);
      try {
        service['createProvider']();
        fail('Expected error was not thrown');
      } catch (e: any) {
        console.log('实际异常内容:', e, 'message:', e?.message);
        expect(e && e.message ? e.message : e).toContain('Anthropic API key is missing');
      }
    });

    it('should throw error for unsupported provider (sync)', () => {
      (plugin.settings.ai.provider as any) = 'unsupported';
      service = new AIService(plugin as any);
      try {
        service['createProvider']();
        fail('Expected error was not thrown');
      } catch (e: any) {
        console.log('实际异常内容:', e, 'message:', e?.message);
        expect(e && e.message ? e.message : e).toContain('Unsupported AI provider');
      }
    });
  });
});
