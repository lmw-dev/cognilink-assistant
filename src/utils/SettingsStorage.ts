import { PluginSettings, DEFAULT_SETTINGS } from '../types/settings';
import CogniLinkPlugin from '../main';

export class SettingsStorage {
  private plugin: CogniLinkPlugin;

  constructor(plugin: CogniLinkPlugin) {
    this.plugin = plugin;
  }

  async loadSettings(): Promise<PluginSettings> {
    try {
      const settings = await this.plugin.loadData();
      return settings ? { ...DEFAULT_SETTINGS, ...settings } : { ...DEFAULT_SETTINGS };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  async saveSettings(settings: PluginSettings): Promise<void> {
    try {
      await this.plugin.saveData(settings);
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
      await this.plugin.saveData({});
    } catch (error) {
      console.error('Failed to clear settings:', error);
      throw new Error('Failed to clear settings');
    }
  }
}
