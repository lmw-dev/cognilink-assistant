import { Plugin } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from '../types/settings';

export class SettingsStorage {
  private plugin: Plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    console.log('[SettingsStorage] initialized');
  }

  /**
   * 获取默认设置
   */
  getDefaultSettings(): PluginSettings {
    console.log('[SettingsStorage] getDefaultSettings:', DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * 加载设置
   */
  async loadSettings(): Promise<PluginSettings> {
    console.log('[SettingsStorage] loadSettings called');
    try {
      const settings = await this.plugin.loadData();
      console.log('[SettingsStorage] loaded from storage:', settings);
      if (!settings) {
        console.log('[SettingsStorage] No saved settings, using defaults');
        return { ...DEFAULT_SETTINGS };
      }
      const mergedSettings = {
        ...DEFAULT_SETTINGS,
        ...settings,
        ui: { ...DEFAULT_SETTINGS.ui, ...(settings.ui || {}) },
        ai: { ...DEFAULT_SETTINGS.ai, ...(settings.ai || {}) },
        shortcuts: { ...DEFAULT_SETTINGS.shortcuts, ...(settings.shortcuts || {}) }
      };
      console.log('[SettingsStorage] merged settings:', mergedSettings);
      return mergedSettings;
    } catch (error) {
      console.error('[SettingsStorage] Error loading settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * 保存设置
   */
  async saveSettings(settings: PluginSettings): Promise<void> {
    console.log('[SettingsStorage] saveSettings called with:', settings);
    try {
      await this.plugin.saveData(settings);
      console.log('[SettingsStorage] Settings saved');
    } catch (error) {
      console.error('[SettingsStorage] Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * 清除设置
   */
  async clear(): Promise<void> {
    console.log('[SettingsStorage] clear called');
    try {
      await this.plugin.saveData({});
      console.log('[SettingsStorage] Settings cleared');
    } catch (error) {
      console.error('[SettingsStorage] Error clearing settings:', error);
      throw new Error('Failed to clear settings');
    }
  }
} 