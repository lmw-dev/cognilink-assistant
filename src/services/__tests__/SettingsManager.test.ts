import { App } from 'obsidian';
import { SettingsManager } from '../SettingsManager';
import { PluginSettings, DEFAULT_SETTINGS } from '../../types/settings';
import CogniLinkPlugin from '../../main';
import { SettingsStorage } from '../../utils/SettingsStorage';

describe('SettingsManager', () => {
  let mockApp: App;
  let mockPlugin: CogniLinkPlugin;
  let mockStorage: SettingsStorage;
  let settingsManager: SettingsManager;

  beforeEach(() => {
    mockApp = {} as App;
    mockPlugin = {
      settings: { ...DEFAULT_SETTINGS },
    } as CogniLinkPlugin;
    mockStorage = {
      loadSettings: jest.fn().mockResolvedValue(DEFAULT_SETTINGS),
      saveSettings: jest.fn().mockResolvedValue(undefined),
      getDefaultSettings: jest.fn().mockResolvedValue(DEFAULT_SETTINGS),
    } as any;
    settingsManager = new SettingsManager(mockApp, mockPlugin, mockStorage);
  });

  describe('Settings Change Events', () => {
    it('should notify listeners when settings change', async () => {
      const listener = jest.fn();
      settingsManager.addSettingsChangeListener(listener);

      const newSettings: PluginSettings = {
        ...DEFAULT_SETTINGS,
        ai: {
          ...DEFAULT_SETTINGS.ai,
          apiKey: 'new-key',
        },
      };

      await settingsManager.saveSettings(newSettings);
      expect(listener).toHaveBeenCalledWith(newSettings);
    });

    it('should remove listeners correctly', async () => {
      const listener = jest.fn();
      settingsManager.addSettingsChangeListener(listener);
      settingsManager.removeSettingsChangeListener(listener);

      const newSettings: PluginSettings = {
        ...DEFAULT_SETTINGS,
        ai: {
          ...DEFAULT_SETTINGS.ai,
          apiKey: 'new-key',
        },
      };

      await settingsManager.saveSettings(newSettings);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Settings Validation', () => {
    it('should validate settings correctly', () => {
      // 设置有效的 API 密钥
      settingsManager.setSettingsForTesting({
        ...DEFAULT_SETTINGS,
        ai: {
          ...DEFAULT_SETTINGS.ai,
          provider: 'local', // 使用本地模型，不需要 API 密钥
        },
      });
      const result = settingsManager.validateSettings();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid settings', () => {
      const invalidSettings: PluginSettings = {
        ...DEFAULT_SETTINGS,
        ai: {
          ...DEFAULT_SETTINGS.ai,
          provider: 'openai',
          apiKey: '', // Invalid: empty API key
        },
      };

      settingsManager.setSettingsForTesting(invalidSettings);
      const result = settingsManager.validateSettings();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('API 密钥不能为空');
    });
  });

  describe('Settings Updates', () => {
    it('should update partial settings correctly', async () => {
      const listener = jest.fn();
      settingsManager.addSettingsChangeListener(listener);

      await settingsManager.updateAISettings({
        apiKey: 'new-key',
        model: 'gpt-4',
      });

      const updatedSettings = settingsManager.getSettings();
      expect(updatedSettings.ai.apiKey).toBe('new-key');
      expect(updatedSettings.ai.model).toBe('gpt-4');
      expect(listener).toHaveBeenCalled();
    });

    it('should handle settings reset correctly', async () => {
      const listener = jest.fn();
      settingsManager.addSettingsChangeListener(listener);

      await settingsManager.resetSettings();

      const resetSettings = settingsManager.getSettings();
      expect(resetSettings).toEqual(DEFAULT_SETTINGS);
      expect(listener).toHaveBeenCalledWith(DEFAULT_SETTINGS);
    });
  });
});
