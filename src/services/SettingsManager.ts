import { App } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from '../types/settings';
import CogniLinkPlugin from '../main';
import { EventEmitter } from 'events';
import { validateSettings } from '../utils/settingsValidator';
import { SettingsStorage } from './SettingsStorage';

export type SettingsChangeListener = (settings: PluginSettings) => void;

export class SettingsManager extends EventEmitter {
  private settings: PluginSettings;
  private storage: SettingsStorage;
  private app: App;
  private plugin: CogniLinkPlugin;
  private settingsChangeListeners: SettingsChangeListener[] = [];

  constructor(app: App, plugin: CogniLinkPlugin, storage: SettingsStorage) {
    super();
    console.log('[SettingsManager] constructor');
    this.app = app;
    this.plugin = plugin;
    this.storage = storage;
    
    // 确保使用完整的默认设置
    this.settings = {
      ...DEFAULT_SETTINGS,
      ui: { ...DEFAULT_SETTINGS.ui },
      ai: { ...DEFAULT_SETTINGS.ai },
      shortcuts: { ...DEFAULT_SETTINGS.shortcuts }
    };
    
    console.log('[SettingsManager] initial settings:', this.settings);
  }

  /**
   * 获取当前设置
   */
  getSettings(): PluginSettings {
    console.log('[SettingsManager] getSettings:', this.settings);
    return this.settings;
  }

  /**
   * 加载设置
   */
  async loadSettings(): Promise<void> {
    console.log('[SettingsManager] loadSettings called');
    try {
      const savedSettings = await this.storage.loadSettings();
      console.log('[SettingsManager] loaded from storage:', savedSettings);
      
      this.settings = {
        ...DEFAULT_SETTINGS,
        ...savedSettings,
        ui: { ...DEFAULT_SETTINGS.ui, ...(savedSettings?.ui || {}) },
        ai: { ...DEFAULT_SETTINGS.ai, ...(savedSettings?.ai || {}) },
        shortcuts: { ...DEFAULT_SETTINGS.shortcuts, ...(savedSettings?.shortcuts || {}) }
      };
      
      console.log('[SettingsManager] merged settings:', this.settings);
      this.plugin.settings = this.settings;
      this.emit('settingsChanged', this.settings);
    } catch (error) {
      console.error('[SettingsManager] Error loading settings:', error);
      // 确保在错误情况下也使用完整的默认设置
      this.settings = {
        ...DEFAULT_SETTINGS,
        ui: { ...DEFAULT_SETTINGS.ui },
        ai: { ...DEFAULT_SETTINGS.ai },
        shortcuts: { ...DEFAULT_SETTINGS.shortcuts }
      };
      this.plugin.settings = this.settings;
    }
  }

  /**
   * 保存设置
   */
  async saveSettings(): Promise<void> {
    console.log('[SettingsManager] saveSettings called with:', this.settings);
    try {
      await this.storage.saveSettings(this.settings);
      console.log('[SettingsManager] Settings saved');
      this.plugin.settings = this.settings;
      this.emit('settingsChanged', this.settings);
    } catch (error) {
      console.error('[SettingsManager] Error saving settings:', error);
      throw error;
    }
  }

  /**
   * 更新设置
   * @param settings - 要更新的设置
   */
  async updateSettings(settings: Partial<PluginSettings>): Promise<void> {
    console.log('[SettingsManager] updateSettings called with:', settings);
    this.settings = {
      ...this.settings,
      ...settings,
      ai: settings.ai
        ? { ...DEFAULT_SETTINGS.ai, ...this.settings.ai, ...settings.ai }
        : this.settings.ai,
    };
    console.log('[SettingsManager] updated settings:', this.settings);
    this.plugin.settings = this.settings;
    await this.saveSettings();
  }

  /**
   * 更新 AI 设置
   * @param aiSettings - AI 设置部分
   */
  async updateAISettings(aiSettings: Partial<PluginSettings['ai']>): Promise<void> {
    const updatedAISettings = {
      ...DEFAULT_SETTINGS.ai,
      ...this.settings.ai,
      ...aiSettings,
    };
    await this.updateSettings({
      ai: updatedAISettings,
    });
  }

  /**
   * 更新 UI 设置
   * @param uiSettings - UI 设置部分
   */
  async updateUISettings(uiSettings: Partial<PluginSettings['ui']>): Promise<void> {
    await this.updateSettings({
      ui: {
        ...this.settings.ui,
        ...uiSettings,
      },
    });
  }

  /**
   * 更新快捷键设置
   * @param shortcuts - 快捷键设置部分
   */
  async updateShortcuts(shortcuts: Partial<PluginSettings['shortcuts']>): Promise<void> {
    await this.updateSettings({
      shortcuts: {
        ...this.settings.shortcuts,
        ...shortcuts,
      },
    });
  }

  /**
   * 重置设置
   */
  async resetSettings(): Promise<void> {
    const defaultSettings = await this.storage.getDefaultSettings();
    await this.saveSettings();
  }

  /**
   * 验证设置
   */
  validateSettings(): boolean {
    return validateSettings(this.settings);
  }

  /**
   * 导出设置
   */
  async exportSettings(): Promise<string> {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * 导入设置
   * @param jsonString - 设置 JSON 字符串
   */
  async importSettings(jsonString: string): Promise<void> {
    try {
      const settings = JSON.parse(jsonString) as PluginSettings;
      await this.saveSettings();
    } catch (error) {
      throw new Error(`Failed to import settings: ${error.message}`);
    }
  }

  /**
   * 添加设置变更监听器
   */
  public addSettingsChangeListener(listener: SettingsChangeListener): void {
    this.settingsChangeListeners.push(listener);
  }

  /**
   * 移除设置变更监听器
   */
  public removeSettingsChangeListener(listener: SettingsChangeListener): void {
    const index = this.settingsChangeListeners.indexOf(listener);
    if (index !== -1) {
      this.settingsChangeListeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(settings: PluginSettings): void {
    this.settingsChangeListeners.forEach(listener => listener(settings));
  }

  /**
   * 仅用于测试：直接设置设置
   */
  public setSettingsForTesting(settings: PluginSettings): void {
    if (process.env.NODE_ENV === 'test') {
      this.settings = settings;
    }
  }

  /**
   * 验证 AI 提供商设置
   */
  private validateProvider(): boolean {
    const { provider } = this.settings.ai;
    if (provider === 'anthropic' && !this.settings.ai.anthropicApiKey) {
      return false;
    }
    return true;
  }
}
