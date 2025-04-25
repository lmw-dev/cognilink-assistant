import { App } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from '../types/settings';
import CogniLinkPlugin from '../main';
import { EventEmitter } from 'events';
import { validateSettings } from '../utils/settingsValidator';
import { SettingsStorage } from '../utils/SettingsStorage';

export type SettingsChangeListener = (settings: PluginSettings) => void;

export class SettingsManager extends EventEmitter {
  private settings: PluginSettings;
  private plugin: CogniLinkPlugin;
  private app: App;
  private storage: SettingsStorage;
  private settingsChangeListeners: SettingsChangeListener[] = [];

  constructor(app: App, plugin: CogniLinkPlugin, storage: SettingsStorage) {
    super();
    this.app = app;
    this.plugin = plugin;
    this.settings = { ...DEFAULT_SETTINGS };
    this.storage = storage;
  }

  /**
   * 加载设置
   */
  async loadSettings(): Promise<PluginSettings> {
    try {
      this.settings = await this.storage.loadSettings();
      return this.settings;
    } catch (error) {
      throw new Error(`Failed to load settings: ${error.message}`);
    }
  }

  /**
   * 保存设置
   */
  async saveSettings(settings: PluginSettings): Promise<void> {
    try {
      await validateSettings(settings);
      await this.storage.saveSettings(settings);
      this.settings = settings;
      this.notifyListeners(settings);
    } catch (error) {
      throw new Error(`Failed to save settings: ${error.message}`);
    }
  }

  /**
   * 更新设置
   * @param partialSettings - 部分新的设置
   */
  async updateSettings(partialSettings: Partial<PluginSettings>): Promise<void> {
    const newSettings = { ...this.settings, ...partialSettings };
    await this.saveSettings(newSettings);
  }

  /**
   * 更新 AI 设置
   * @param aiSettings - AI 设置部分
   */
  async updateAISettings(aiSettings: Partial<PluginSettings['ai']>): Promise<void> {
    await this.updateSettings({
      ai: {
        ...this.settings.ai,
        ...aiSettings,
      },
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
   * 获取设置
   */
  getSettings(): PluginSettings {
    return this.settings;
  }

  /**
   * 重置设置
   */
  async resetSettings(): Promise<void> {
    const defaultSettings = await this.storage.getDefaultSettings();
    await this.saveSettings(defaultSettings);
  }

  /**
   * 验证设置
   * @returns 验证结果
   */
  validateSettings(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证 AI 设置
    if (this.settings.ai.provider === 'openai' || this.settings.ai.provider === 'anthropic') {
      if (!this.settings.ai.apiKey) {
        errors.push('API 密钥不能为空');
      }
    }

    // 验证快捷键设置
    const shortcuts = new Set([
      this.settings.shortcuts.toggleChat,
      this.settings.shortcuts.newChat,
      this.settings.shortcuts.focusInput,
    ]);
    if (shortcuts.size !== 3) {
      errors.push('快捷键不能重复');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
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
      await this.saveSettings(settings);
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
}
