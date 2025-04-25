import { Plugin } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from '../types/settings';

export class SettingsStorage {
  private plugin: Plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  /**
   * 获取默认设置
   */
  getDefaultSettings(): PluginSettings {
    return DEFAULT_SETTINGS;
  }

  /**
   * 加载设置
   */
  async loadSettings(): Promise<PluginSettings> {
    const settings = await this.plugin.loadData();
    return { ...DEFAULT_SETTINGS, ...settings };
  }

  /**
   * 保存设置
   */
  async saveSettings(settings: PluginSettings): Promise<void> {
    await this.plugin.saveData(settings);
  }

  /**
   * 清除设置
   */
  async clear(): Promise<void> {
    await this.plugin.saveData({});
  }
} 