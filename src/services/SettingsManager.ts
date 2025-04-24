import { App, PluginSettingTab } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from '../types/settings';
import CogniLinkPlugin from '../main';
import { EventEmitter } from 'events';

export class SettingsManager extends EventEmitter {
  private settings: PluginSettings;
  private plugin: CogniLinkPlugin;
  private app: App;

  constructor(app: App, plugin: CogniLinkPlugin) {
    super();
    this.app = app;
    this.plugin = plugin;
    this.settings = DEFAULT_SETTINGS;
  }

  /**
   * 加载设置
   */
  async loadSettings(): Promise<void> {
    const loadedData = await this.plugin.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
    this.emit('settings:loaded', this.settings);
  }

  /**
   * 保存设置
   */
  async saveSettings(): Promise<void> {
    await this.plugin.saveData(this.settings);
    this.emit('settings:saved', this.settings);
  }

  /**
   * 更新设置
   * @param partialSettings - 部分设置
   */
  async updateSettings(partialSettings: Partial<PluginSettings>): Promise<void> {
    this.settings = {
      ...this.settings,
      ...partialSettings,
    };
    await this.saveSettings();
  }

  /**
   * 获取设置
   */
  getSettings(): PluginSettings {
    return { ...this.settings };
  }

  /**
   * 重置设置
   */
  async resetSettings(): Promise<void> {
    this.settings = { ...DEFAULT_SETTINGS };
    await this.saveSettings();
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

    // 验证 UI 设置
    if (
      Number(this.settings.ui.fontSize) < 12 || 
      Number(this.settings.ui.fontSize) > 24
    ) {
      errors.push('字体大小必须在 12-24 之间');
    }

    if (
      Number(this.settings.ui.messageSpacing) < 4 || 
      Number(this.settings.ui.messageSpacing) > 24
    ) {
      errors.push('消息间距必须在 4-24 之间');
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
  exportSettings(): string {
    const settings = this.getSettings();
    // 移除敏感信息
    const exportData = {
      ...settings,
      ai: {
        ...settings.ai,
        apiKey: '', // 不导出 API 密钥
      },
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 导入设置
   * @param jsonString - 设置 JSON 字符串
   */
  async importSettings(jsonString: string): Promise<void> {
    try {
      const importedSettings = JSON.parse(jsonString);
      // 保留原有的 API 密钥
      const currentApiKey = this.settings.ai.apiKey;
      await this.updateSettings(importedSettings);
      await this.updateSettings({
        ai: {
          ...this.settings.ai,
          apiKey: currentApiKey,
        },
      });
    } catch (error) {
      throw new Error('设置导入失败：无效的 JSON 格式');
    }
  }

  /**
   * 监听设置变化
   * @param callback - 回调函数
   */
  onSettingsChanged(callback: (settings: PluginSettings) => void): void {
    this.on('settings:saved', callback);
  }

  /**
   * 移除设置变化监听
   * @param callback - 回调函数
   */
  offSettingsChanged(callback: (settings: PluginSettings) => void): void {
    this.off('settings:saved', callback);
  }
} 