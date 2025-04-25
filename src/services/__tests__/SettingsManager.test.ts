import { App } from 'obsidian';
import { SettingsManager } from '../SettingsManager';
import { DEFAULT_SETTINGS } from '../../constants/settings';
import { PluginSettings } from '../../types/settings';
import CogniLinkPlugin from '../../main';

describe('SettingsManager', () => {
  let settingsManager: SettingsManager;
  let mockStorage: any;
  let mockApp: App;
  let mockPlugin: CogniLinkPlugin;

  beforeEach(() => {
    mockApp = {} as App;
    mockPlugin = {
      settings: { ...DEFAULT_SETTINGS },
    } as CogniLinkPlugin;
    mockStorage = {
      loadSettings: jest.fn().mockResolvedValue(DEFAULT_SETTINGS),
      saveSettings: jest.fn().mockResolvedValue(undefined),
    };

    settingsManager = new SettingsManager(mockApp, mockPlugin, mockStorage);
  });

  describe('Settings Management', () => {
    it('should initialize with default settings', () => {
      expect(settingsManager.getSettings()).toEqual(DEFAULT_SETTINGS);
    });

    it('should update settings correctly', async () => {
      await settingsManager.updateSettings({
        ai: {
          ...DEFAULT_SETTINGS.ai,
          openAIApiKey: 'new-key',
        },
      });

      expect(settingsManager.getSettings().ai.openAIApiKey).toBe('new-key');
    });

    it('should notify listeners of settings changes', async () => {
      const listener = jest.fn();
      settingsManager.addListener('settingsChanged', listener);

      await settingsManager.updateSettings({
        ai: {
          ...DEFAULT_SETTINGS.ai,
          openAIApiKey: 'new-key',
        },
      });

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(settingsManager.getSettings());
    });

    it('should validate settings', () => {
      const invalidSettings: PluginSettings = {
        ...DEFAULT_SETTINGS,
        ai: {
          ...DEFAULT_SETTINGS.ai,
          provider: 'openai',
          openAIApiKey: '', // Invalid: empty API key
        },
      };

      const result = settingsManager.validateSettings();
      expect(result).toBe(false);
    });

    it('should update AI settings correctly', async () => {
      await settingsManager.updateAISettings({
        openAIApiKey: 'new-key',
      });

      const updatedSettings = settingsManager.getSettings();
      expect(updatedSettings.ai.openAIApiKey).toBe('new-key');
    });
  });
});
