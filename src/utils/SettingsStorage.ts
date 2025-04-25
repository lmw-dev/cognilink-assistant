import { PluginSettings, DEFAULT_SETTINGS } from '../types/settings';

const SETTINGS_KEY = 'cognilink_settings';

export class SettingsStorage {
  async loadSettings(): Promise<PluginSettings> {
    try {
      const settingsJson = localStorage.getItem(SETTINGS_KEY);
      if (!settingsJson) return { ...DEFAULT_SETTINGS };
      return JSON.parse(settingsJson) as PluginSettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  async saveSettings(settings: PluginSettings): Promise<void> {
    try {
      const settingsJson = JSON.stringify(settings);
      localStorage.setItem(SETTINGS_KEY, settingsJson);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  async getDefaultSettings(): Promise<PluginSettings> {
    return { ...DEFAULT_SETTINGS };
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Failed to clear settings:', error);
      throw new Error('Failed to clear settings');
    }
  }
}
