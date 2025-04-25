import { AIService, ConfigurationError } from '../AIService';
import { PluginSettings } from '../../types/settings';
import { DEFAULT_SETTINGS } from '../../types/settings';

describe('AIService', () => {
  let plugin: { settings: PluginSettings };
  let service: AIService;

  beforeEach(() => {
    plugin = {
      settings: DEFAULT_SETTINGS
    };
    service = new AIService(plugin as any);
  });

  describe('sendMessage', () => {
    it('should throw ConfigurationError when Anthropic API key is missing', async () => {
      plugin.settings.ai.provider = 'anthropic';
      plugin.settings.ai.anthropicApiKey = '';

      await expect(service.sendMessage({
        id: '1',
        role: 'user',
        content: 'test message',
        timestamp: Date.now()
      })).rejects.toThrow(ConfigurationError);
    });

    it('should throw error for unsupported provider', async () => {
      (plugin.settings.ai.provider as any) = 'unsupported';

      await expect(service.sendMessage({
        id: '1',
        role: 'user',
        content: 'test message',
        timestamp: Date.now()
      })).rejects.toThrow('Unsupported AI provider');
    });
  });
});
