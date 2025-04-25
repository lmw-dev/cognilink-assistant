import { App, PluginSettingTab, Setting } from 'obsidian';
import CogniLinkPlugin from '../main';
import { AIProvider, Theme, FontSize, MessageSpacing, AIModel } from '../types/settings';

export class SettingsTab extends PluginSettingTab {
  plugin: CogniLinkPlugin;

  constructor(app: App, plugin: CogniLinkPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // 主标题
    containerEl.createEl('h2', { text: 'CogniLink 设置' });

    // AI 服务设置
    containerEl.createEl('h3', { text: 'AI 服务设置' });

    // AI 提供商
    new Setting(containerEl)
      .setName('AI 提供商')
      .setDesc('选择要使用的 AI 服务提供商')
      .addDropdown(dropdown => {
        dropdown
          .addOption('openai', 'OpenAI')
          .addOption('anthropic', 'Anthropic')
          .addOption('local', '本地模型')
          .setValue(this.plugin.settings.ai.provider)
          .onChange(async (value: string) => {
            const provider = value as AIProvider;
            let defaultModel: AIModel;
            
            // 根据提供商设置默认模型
            if (provider === 'openai') {
              defaultModel = 'gpt-4';
            } else if (provider === 'anthropic') {
              defaultModel = 'claude-2';
            } else {
              defaultModel = 'gpt-4'; // 本地模型默认使用 gpt-4
            }

            await this.plugin.settingsManager.updateAISettings({
              provider,
              model: defaultModel,
            });
            
            // 重新渲染设置页面
            this.display();
          });
        return dropdown;
      });

    // API 密钥
    if (this.plugin.settings.ai.provider === 'openai') {
      new Setting(containerEl)
        .setName('OpenAI API 密钥')
        .setDesc('输入 OpenAI 服务的 API 密钥')
        .addText(text => text
          .setPlaceholder('输入 OpenAI API 密钥')
          .setValue(this.plugin.settings.ai.openAIApiKey)
          .onChange(async (value: string) => {
            await this.plugin.settingsManager.updateAISettings({
              openAIApiKey: value,
            });
          }));
    }

    // Anthropic API 密钥
    if (this.plugin.settings.ai.provider === 'anthropic') {
      new Setting(containerEl)
        .setName('Anthropic API 密钥')
        .setDesc('输入 Anthropic 服务的 API 密钥')
        .addText(text => text
          .setPlaceholder('输入 Anthropic API 密钥')
          .setValue(this.plugin.settings.ai.anthropicApiKey)
          .onChange(async (value: string) => {
            await this.plugin.settingsManager.updateAISettings({
              anthropicApiKey: value,
            });
          }));
    }

    // 模型选择
    new Setting(containerEl)
      .setName('AI 模型')
      .setDesc('选择要使用的 AI 模型')
      .addDropdown(dropdown => {
        if (this.plugin.settings.ai.provider === 'openai') {
          dropdown
            .addOption('gpt-4', 'GPT-4')
            .addOption('gpt-3.5-turbo', 'GPT-3.5 Turbo');
        } else if (this.plugin.settings.ai.provider === 'anthropic') {
          dropdown
            .addOption('claude-2', 'Claude 2')
            .addOption('claude-instant', 'Claude Instant');
        }
        dropdown.setValue(this.plugin.settings.ai.model)
          .onChange(async (value: string) => {
            await this.plugin.settingsManager.updateAISettings({
              model: value as AIModel,
            });
            // 重新渲染设置页面
            this.display();
          });
        return dropdown;
      });

    // 温度参数
    new Setting(containerEl)
      .setName('温度')
      .setDesc('控制 AI 回复的随机性（0-1），越高越具有创造性，越低越保守')
      .addSlider(slider => {
        slider
          .setLimits(0, 1, 0.1)
          .setValue(this.plugin.settings.ai.temperature)
          .onChange(async (value: number) => {
            await this.plugin.settingsManager.updateAISettings({
              temperature: value,
            });
          });
        return slider;
      });

    // 最大 Token 数
    new Setting(containerEl)
      .setName('最大 Token 数')
      .setDesc('单次对话最大 token 数量（1000-4000）')
      .addSlider(slider => {
        slider
          .setLimits(1000, 4000, 100)
          .setValue(this.plugin.settings.ai.maxTokens)
          .onChange(async (value: number) => {
            await this.plugin.settingsManager.updateAISettings({
              maxTokens: value,
            });
          });
        return slider;
      });

    // 系统提示词
    new Setting(containerEl)
      .setName('系统提示词')
      .setDesc('设置 AI 助手的角色和行为')
      .addTextArea(text => text
        .setPlaceholder('输入系统提示词')
        .setValue(this.plugin.settings.ai.defaultSystemPrompt)
        .onChange(async (value: string) => {
          await this.plugin.settingsManager.updateAISettings({
            defaultSystemPrompt: value,
          });
        }));

    // 界面设置
    containerEl.createEl('h3', { text: '界面设置' });

    // 主题
    new Setting(containerEl)
      .setName('主题')
      .setDesc('选择界面主题')
      .addDropdown(dropdown => {
        dropdown
          .addOption('system', '跟随系统')
          .addOption('light', '浅色')
          .addOption('dark', '深色')
          .setValue(this.plugin.settings.ui.theme)
          .onChange(async (value: string) => {
            await this.plugin.settingsManager.updateUISettings({
              theme: value as Theme,
            });
          });
        return dropdown;
      });

    // 字体大小
    new Setting(containerEl)
      .setName('字体大小')
      .setDesc('调整界面字体大小')
      .addDropdown(dropdown => {
        dropdown
          .addOption('small', '小')
          .addOption('medium', '中')
          .addOption('large', '大')
          .setValue(this.plugin.settings.ui.fontSize)
          .onChange(async (value: string) => {
            await this.plugin.settingsManager.updateUISettings({
              fontSize: value as FontSize,
            });
          });
        return dropdown;
      });

    // 消息间距
    new Setting(containerEl)
      .setName('消息间距')
      .setDesc('调整消息之间的间距')
      .addDropdown(dropdown => {
        dropdown
          .addOption('compact', '紧凑')
          .addOption('comfortable', '舒适')
          .addOption('spacious', '宽松')
          .setValue(this.plugin.settings.ui.messageSpacing)
          .onChange(async (value: string) => {
            await this.plugin.settingsManager.updateUISettings({
              messageSpacing: value as MessageSpacing,
            });
          });
        return dropdown;
      });

    // 时间戳显示
    new Setting(containerEl)
      .setName('显示时间戳')
      .setDesc('在消息中显示发送时间')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.ui.showTimestamp)
          .onChange(async (value: boolean) => {
            await this.plugin.settingsManager.updateUISettings({
              showTimestamp: value,
            });
          });
        return toggle;
      });

    // 动画效果
    new Setting(containerEl)
      .setName('启用动画')
      .setDesc('启用界面过渡动画效果')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.ui.enableAnimations)
          .onChange(async (value: boolean) => {
            await this.plugin.settingsManager.updateUISettings({
              enableAnimations: value,
            });
          });
        return toggle;
      });
  }
}
