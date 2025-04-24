import { App, PluginSettingTab, Setting } from 'obsidian';
import CogniLinkPlugin from '../main';
import { AIProvider, PluginSettings } from '../types/settings';

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

    this.addTitle('CogniLink 设置');
    this.addAISection();
    this.addUISection();
    this.addShortcutsSection();
  }

  private addTitle(text: string) {
    const title = this.containerEl.createEl('h2', { text });
    title.addClass('cognilink-settings-title');
  }

  private addAISection() {
    this.addTitle('AI 服务设置');

    // AI 提供商选择
    new Setting(this.containerEl)
      .setName('AI 提供商')
      .setDesc('选择要使用的 AI 服务提供商')
      .addDropdown(dropdown => {
        const providers: Record<AIProvider, string> = {
          openai: 'OpenAI',
          anthropic: 'Anthropic',
          local: '本地模型',
        };

        Object.entries(providers).forEach(([value, name]) => {
          dropdown.addOption(value, name);
        });

        dropdown
          .setValue(this.settings.ai.provider)
          .onChange(async (value: AIProvider) => {
            this.settings.ai.provider = value;
            await this.plugin.saveSettings();
          });
      });

    // API 密钥
    new Setting(this.containerEl)
      .setName('API 密钥')
      .setDesc('输入 AI 服务的 API 密钥')
      .addText(text => {
        text.setPlaceholder('输入 API 密钥')
          .setValue(this.settings.ai.apiKey)
          .onChange(async (value) => {
            this.settings.ai.apiKey = value;
            await this.plugin.saveSettings();
          });

        // 密码输入框
        const inputEl = text.inputEl;
        inputEl.type = 'password';
        inputEl.addClass('cognilink-api-key-input');
      });

    // 模型选择
    new Setting(this.containerEl)
      .setName('模型')
      .setDesc('选择要使用的模型')
      .addDropdown(dropdown => {
        const models = this.getAvailableModels();
        models.forEach(model => {
          dropdown.addOption(model, model);
        });

        dropdown
          .setValue(this.settings.ai.model)
          .onChange(async (value) => {
            this.settings.ai.model = value;
            await this.plugin.saveSettings();
          });
      });

    // 温度设置
    new Setting(this.containerEl)
      .setName('温度')
      .setDesc('控制输出的随机性（0-1）')
      .addSlider(slider => {
        slider
          .setLimits(0, 1, 0.1)
          .setValue(this.settings.ai.temperature)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.settings.ai.temperature = value;
            await this.plugin.saveSettings();
          });
      });

    // 最大 Token
    new Setting(this.containerEl)
      .setName('最大 Token')
      .setDesc('单次对话最大 Token 数量')
      .addText(text => {
        text.setPlaceholder('2000')
          .setValue(String(this.settings.ai.maxTokens))
          .onChange(async (value) => {
            const tokens = parseInt(value);
            if (!isNaN(tokens) && tokens > 0) {
              this.settings.ai.maxTokens = tokens;
              await this.plugin.saveSettings();
            }
          });
      });

    // 系统提示词
    new Setting(this.containerEl)
      .setName('系统提示词')
      .setDesc('设置与 AI 对话的系统提示词')
      .addTextArea(text => {
        text.setPlaceholder('输入系统提示词')
          .setValue(this.settings.ai.defaultSystemPrompt)
          .onChange(async (value) => {
            this.settings.ai.defaultSystemPrompt = value;
            await this.plugin.saveSettings();
          });

        // 调整文本框大小
        const textEl = text.inputEl;
        textEl.addClass('cognilink-system-prompt');
        textEl.rows = 4;
      });
  }

  private addUISection() {
    this.addTitle('界面设置');

    // 主题设置
    new Setting(this.containerEl)
      .setName('主题')
      .setDesc('选择界面主题')
      .addDropdown(dropdown => {
        const themes = {
          system: '跟随系统',
          light: '浅色',
          dark: '深色',
        };

        Object.entries(themes).forEach(([value, name]) => {
          dropdown.addOption(value, name);
        });

        dropdown
          .setValue(this.settings.ui.theme)
          .onChange(async (value: any) => {
            this.settings.ui.theme = value;
            await this.plugin.saveSettings();
          });
      });

    // 字体大小
    new Setting(this.containerEl)
      .setName('字体大小')
      .setDesc('设置界面字体大小')
      .addDropdown(dropdown => {
        const sizes = {
          small: '小',
          medium: '中',
          large: '大',
        };

        Object.entries(sizes).forEach(([value, name]) => {
          dropdown.addOption(value, name);
        });

        dropdown
          .setValue(this.settings.ui.fontSize)
          .onChange(async (value: any) => {
            this.settings.ui.fontSize = value;
            await this.plugin.saveSettings();
          });
      });

    // 消息间距
    new Setting(this.containerEl)
      .setName('消息间距')
      .setDesc('设置消息之间的间距')
      .addDropdown(dropdown => {
        const spacing = {
          compact: '紧凑',
          comfortable: '舒适',
        };

        Object.entries(spacing).forEach(([value, name]) => {
          dropdown.addOption(value, name);
        });

        dropdown
          .setValue(this.settings.ui.messageSpacing)
          .onChange(async (value: any) => {
            this.settings.ui.messageSpacing = value;
            await this.plugin.saveSettings();
          });
      });

    // 显示时间戳
    new Setting(this.containerEl)
      .setName('显示时间戳')
      .setDesc('在消息中显示发送时间')
      .addToggle(toggle => {
        toggle
          .setValue(this.settings.ui.showTimestamp)
          .onChange(async (value) => {
            this.settings.ui.showTimestamp = value;
            await this.plugin.saveSettings();
          });
      });

    // 启用动画
    new Setting(this.containerEl)
      .setName('启用动画')
      .setDesc('启用界面过渡动画')
      .addToggle(toggle => {
        toggle
          .setValue(this.settings.ui.enableAnimations)
          .onChange(async (value) => {
            this.settings.ui.enableAnimations = value;
            await this.plugin.saveSettings();
          });
      });
  }

  private addShortcutsSection() {
    this.addTitle('快捷键设置');

    // 切换聊天
    new Setting(this.containerEl)
      .setName('切换聊天')
      .setDesc('显示/隐藏聊天界面')
      .addText(text => {
        text.setPlaceholder('Mod+Shift+C')
          .setValue(this.settings.shortcuts.toggleChat)
          .onChange(async (value) => {
            this.settings.shortcuts.toggleChat = value;
            await this.plugin.saveSettings();
          });
      });

    // 新建聊天
    new Setting(this.containerEl)
      .setName('新建聊天')
      .setDesc('创建新的聊天')
      .addText(text => {
        text.setPlaceholder('Mod+Shift+N')
          .setValue(this.settings.shortcuts.newChat)
          .onChange(async (value) => {
            this.settings.shortcuts.newChat = value;
            await this.plugin.saveSettings();
          });
      });

    // 聚焦输入框
    new Setting(this.containerEl)
      .setName('聚焦输入框')
      .setDesc('将焦点移至输入框')
      .addText(text => {
        text.setPlaceholder('Mod+Shift+I')
          .setValue(this.settings.shortcuts.focusInput)
          .onChange(async (value) => {
            this.settings.shortcuts.focusInput = value;
            await this.plugin.saveSettings();
          });
      });
  }

  private getAvailableModels(): string[] {
    switch (this.settings.ai.provider) {
      case 'openai':
        return ['gpt-4', 'gpt-3.5-turbo'];
      case 'anthropic':
        return ['claude-2', 'claude-instant'];
      case 'local':
        return ['llama2', 'mistral'];
      default:
        return [];
    }
  }
} 