import { App } from 'obsidian';
import { SettingsManager } from '../SettingsManager';
import { SettingsStorage } from '../SettingsStorage';
import { DEFAULT_UI_SETTINGS, DEFAULT_AI_SETTINGS, DEFAULT_SHORTCUTS } from '../../constants/settings';
import { PluginSettings, DEFAULT_SETTINGS } from '../../types/settings';
import CogniLinkPlugin from '../../main';

describe('SettingsManager', () => {
  let settingsManager: SettingsManager;
  let mockStorage: jest.Mocked<SettingsStorage>;
  let mockApp: any;
  let mockPlugin: any;

  const defaultSettings: PluginSettings = DEFAULT_SETTINGS;

  beforeEach(() => {
    mockStorage = {
      loadSettings: jest.fn(),
      saveSettings: jest.fn(),
    } as any;

    mockApp = {};
    mockPlugin = {
      settings: { ...defaultSettings }
    };

    settingsManager = new SettingsManager(mockApp, mockPlugin, mockStorage);
  });

  describe('loadSettings', () => {
    it('should load settings from storage', async () => {
      const storedSettings = {
        ...defaultSettings,
        ai: {
          ...defaultSettings.ai,
          anthropicApiKey: 'new-key',
          openAIApiKey: defaultSettings.ai.openAIApiKey || '',
          openAIEndpoint: defaultSettings.ai.openAIEndpoint || 'https://api.openai.com/v1',
        }
      };

      mockStorage.loadSettings.mockResolvedValue(storedSettings);

      await settingsManager.loadSettings();

      expect(settingsManager.getSettings().ai.anthropicApiKey).toBe('new-key');
      expect(mockStorage.loadSettings).toHaveBeenCalled();
    });
  });

  describe('saveSettings', () => {
    it('should save settings to storage', async () => {
      const newSettings = {
        ...defaultSettings,
        ai: {
          ...defaultSettings.ai,
          anthropicApiKey: 'new-key',
          openAIApiKey: defaultSettings.ai.openAIApiKey || '',
          openAIEndpoint: defaultSettings.ai.openAIEndpoint || 'https://api.openai.com/v1',
        }
      };

      await settingsManager.updateSettings(newSettings);

      expect(mockStorage.saveSettings).toHaveBeenCalledWith(expect.objectContaining({
        ai: expect.objectContaining({
          anthropicApiKey: 'new-key'
        })
      }));
    });
  });

  describe('updateSettings', () => {
    it('should update settings and save them', async () => {
      const partialSettings = {
        ai: {
          ...defaultSettings.ai,
          anthropicApiKey: 'new-key',
          openAIApiKey: defaultSettings.ai.openAIApiKey || '',
          openAIEndpoint: defaultSettings.ai.openAIEndpoint || 'https://api.openai.com/v1',
        }
      };

      await settingsManager.updateSettings(partialSettings);

      const updatedSettings = settingsManager.getSettings();
      expect(updatedSettings.ai.anthropicApiKey).toBe('new-key');
      expect(mockStorage.saveSettings).toHaveBeenCalled();
    });
  });

  describe('Settings Management', () => {
    it('should initialize with default settings', () => {
      expect(settingsManager.getSettings()).toMatchObject(defaultSettings);
    });

    it('should notify listeners of settings changes', async () => {
      const listener = jest.fn();
      settingsManager.addListener('settingsChanged', listener);

      await settingsManager.updateSettings({
        ai: {
          ...defaultSettings.ai,
          anthropicApiKey: 'new-key',
          openAIApiKey: defaultSettings.ai.openAIApiKey || '',
          openAIEndpoint: defaultSettings.ai.openAIEndpoint || 'https://api.openai.com/v1',
        },
      });

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(settingsManager.getSettings());
    });

    it('should validate settings', () => {
      const invalidSettings: PluginSettings = {
        ...defaultSettings,
        ai: {
          ...defaultSettings.ai,
          provider: 'anthropic',
          anthropicApiKey: '', // Invalid: empty API key
          openAIApiKey: defaultSettings.ai.openAIApiKey || '',
          openAIEndpoint: defaultSettings.ai.openAIEndpoint || 'https://api.openai.com/v1',
        },
      };

      const result = settingsManager.validateSettings();
      expect(result).toBe(false);
    });

    it('should update AI settings correctly', async () => {
      await settingsManager.updateAISettings({
        anthropicApiKey: 'new-key',
        openAIApiKey: defaultSettings.ai.openAIApiKey || '',
        openAIEndpoint: defaultSettings.ai.openAIEndpoint || 'https://api.openai.com/v1',
      });

      const updatedSettings = settingsManager.getSettings();
      expect(updatedSettings.ai.anthropicApiKey).toBe('new-key');
    });
  });
});
