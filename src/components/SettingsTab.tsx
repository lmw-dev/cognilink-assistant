import { App, PluginSettingTab, Setting } from 'obsidian';
import CogniLinkPlugin from '../main';
import { PluginSettings, AIProvider, AIModel, Theme, MessageSpacing } from '../types/settings';

export class SettingsTab extends PluginSettingTab {
  plugin: CogniLinkPlugin;
  settings: PluginSettings;

  constructor(app: App, plugin: CogniLinkPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.settings = plugin.settings;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // 健壮性校验，防止 settings 为空时报错
    if (!this.settings || !this.settings.ai || !this.settings.ui) {
      containerEl.createEl('div', { text: '设置加载失败，请重启插件。' });
      return;
    }

    // AI Provider Settings
    new Setting(containerEl)
      .setName('AI Provider')
      .setDesc('选择 AI 服务提供商')
      .addDropdown(dropdown => dropdown
        .addOption('anthropic', 'Anthropic')
        .addOption('local', 'Local')
        .setValue(this.settings.ai.provider)
        .onChange(async (value: AIProvider) => {
          this.settings.ai.provider = value;
          await this.plugin.saveSettings();
          this.display();
        }));

    // Model Selection
    new Setting(containerEl)
      .setName('AI Model')
      .setDesc('选择 AI 模型')
      .addDropdown(dropdown => {
        if (this.settings.ai.provider === 'anthropic') {
          dropdown
            .addOption('claude-2', 'Claude 2')
            .addOption('claude-instant', 'Claude Instant');
        }
        return dropdown
          .setValue(this.settings.ai.model)
          .onChange(async (value: AIModel) => {
            this.settings.ai.model = value;
            await this.plugin.saveSettings();
          });
      });

    // Anthropic API Key
    if (this.settings.ai.provider === 'anthropic') {
      new Setting(containerEl)
        .setName('Anthropic API Key')
        .setDesc('输入你的 Anthropic API Key')
        .addText(text => text
          .setPlaceholder('sk-ant-...')
          .setValue(this.settings.ai.anthropicApiKey)
          .onChange(async (value) => {
            this.settings.ai.anthropicApiKey = value;
            await this.plugin.saveSettings();
          }));
    }

    // Temperature
    new Setting(containerEl)
      .setName('Temperature')
      .setDesc('控制 AI 回复的随机性（0-1），越高越具有创造性')
      .addSlider(slider => slider
        .setLimits(0, 1, 0.1)
        .setValue(this.settings.ai.temperature)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.settings.ai.temperature = value;
          await this.plugin.saveSettings();
        }));

    // Max Tokens
    new Setting(containerEl)
      .setName('Max Tokens')
      .setDesc('单次对话最大 token 数量')
      .addSlider(slider => slider
        .setLimits(1000, 4000, 100)
        .setValue(this.settings.ai.maxTokens)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.settings.ai.maxTokens = value;
          await this.plugin.saveSettings();
        }));

    // System Prompt
    new Setting(containerEl)
      .setName('System Prompt')
      .setDesc('设置 AI 助手的系统提示词')
      .addTextArea(text => text
        .setValue(this.settings.ai.defaultSystemPrompt)
        .onChange(async (value) => {
          this.settings.ai.defaultSystemPrompt = value;
          await this.plugin.saveSettings();
        }));

    // UI Settings
    containerEl.createEl('h3', { text: 'UI Settings' });

    // Theme
    new Setting(containerEl)
      .setName('Theme')
      .setDesc('选择界面主题')
      .addDropdown(dropdown => dropdown
        .addOption('light', 'Light')
        .addOption('dark', 'Dark')
        .addOption('system', 'System')
        .setValue(this.settings.ui.theme)
        .onChange(async (value: Theme) => {
          this.settings.ui.theme = value;
          await this.plugin.saveSettings();
        }));

    // Font Size
    new Setting(containerEl)
      .setName('Font Size')
      .setDesc('设置字体大小')
      .addSlider(slider => slider
        .setLimits(12, 24, 1)
        .setValue(this.settings.ui.fontSize)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.settings.ui.fontSize = value;
          await this.plugin.saveSettings();
        }));

    // Font Family
    new Setting(containerEl)
      .setName('Font Family')
      .setDesc('设置字体')
      .addText(text => text
        .setValue(this.settings.ui.fontFamily)
        .onChange(async (value) => {
          this.settings.ui.fontFamily = value;
          await this.plugin.saveSettings();
        }));

    // Message Spacing
    new Setting(containerEl)
      .setName('Message Spacing')
      .setDesc('设置消息间距')
      .addDropdown(dropdown => dropdown
        .addOption('compact', 'Compact')
        .addOption('comfortable', 'Comfortable')
        .addOption('spacious', 'Spacious')
        .setValue(this.settings.ui.messageSpacing)
        .onChange(async (value: MessageSpacing) => {
          this.settings.ui.messageSpacing = value;
          await this.plugin.saveSettings();
        }));

    // Show Timestamp
    new Setting(containerEl)
      .setName('Show Timestamp')
      .setDesc('显示消息时间戳')
      .addToggle(toggle => toggle
        .setValue(this.settings.ui.showTimestamp)
        .onChange(async (value) => {
          this.settings.ui.showTimestamp = value;
          await this.plugin.saveSettings();
        }));

    // Enable Animations
    new Setting(containerEl)
      .setName('Enable Animations')
      .setDesc('启用界面动画')
      .addToggle(toggle => toggle
        .setValue(this.settings.ui.enableAnimations)
        .onChange(async (value) => {
          this.settings.ui.enableAnimations = value;
          await this.plugin.saveSettings();
        }));
  }
}
