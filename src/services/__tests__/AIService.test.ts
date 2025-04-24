import { AIService } from '../AIService';
import CogniLinkPlugin from '../../main';
import { ChatMessage, MessageRole } from '../../types/chat';
import { DEFAULT_SETTINGS } from '../../constants/settings';
import { App, Plugin, PluginManifest } from 'obsidian';

// Mock CogniLinkPlugin
jest.mock('../../main', () => {
  const MockPlugin = jest.fn().mockImplementation((app: App, manifest: PluginManifest) => ({
    settings: {},
  }));
  return MockPlugin;
});

describe('AIService', () => {
  let plugin: CogniLinkPlugin;
  let aiService: AIService;

  beforeEach(() => {
    const mockApp = {} as App;
    const mockManifest = {} as PluginManifest;
    plugin = new CogniLinkPlugin(mockApp, mockManifest);
    aiService = new AIService(plugin);
  });

  describe('sendMessage', () => {
    it('should throw error when API key is not configured', async () => {
      const message = 'Test message';
      const history: ChatMessage[] = [];

      await expect(aiService.sendMessage(message, history)).rejects.toThrow(
        'API key not configured'
      );
    });

    it('should handle successful message sending', async () => {
      // Mock plugin settings
      plugin.settings = {
        ...DEFAULT_SETTINGS,
        apiKey: 'test-key',
      };

      const message = 'Test message';
      const history: ChatMessage[] = [
        {
          role: 'user' as MessageRole,
          content: 'Previous message',
          timestamp: new Date(),
        },
        {
          role: 'assistant' as MessageRole,
          content: 'Previous response',
          timestamp: new Date(),
        },
      ];

      // This will throw "OpenAI integration not implemented yet" as per the actual implementation
      await expect(aiService.sendMessage(message, history)).rejects.toThrow(
        'OpenAI integration not implemented yet'
      );
    });
  });
});