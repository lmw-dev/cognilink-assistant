import { App, PluginSettingTab, Setting, setTooltip, Notice } from 'obsidian';
import CogniLinkPlugin from '../main';
import { PluginSettings, AIProvider, AIModel, Theme, MessageSpacing } from '../types/settings';
import { AnthropicProvider } from '../services/AnthropicProvider';
import { OpenAIProvider } from '../services/OpenAIProvider';
import { AI_MODELS } from '../constants/ai-models';
import { ConfigurationError, APIError, NetworkError } from '../services/AIService';

export class SettingsTab extends PluginSettingTab {
  plugin: CogniLinkPlugin;
  settings: PluginSettings;
  private showAnthropicKey: boolean = false;
  private showOpenAIKey: boolean = false;
  private testResult: string = '';
  private testResultColor: string = '';

  constructor(app: App, plugin: CogniLinkPlugin) {
    super(app, plugin);
    console.log('SettingsTab constructor called');
    this.plugin = plugin;
    this.settings = plugin.settings;
    console.log('SettingsTab settings:', this.settings);
  }

  display(): void {
    console.log('SettingsTab display called');
    const { containerEl } = this;
    containerEl.empty();

    // 健壮性校验，防止 settings 为空时报错
    if (!this.settings) {
      console.error('Settings is undefined');
      containerEl.createEl('div', { text: '设置加载失败：settings 未定义，请重启插件。' });
      return;
    }

    if (!this.settings.ai) {
      console.error('AI settings is undefined');
      containerEl.createEl('div', { text: '设置加载失败：AI 设置未定义，请重启插件。' });
      return;
    }

    if (!this.settings.ui) {
      console.error('UI settings is undefined');
      containerEl.createEl('div', { text: '设置加载失败：UI 设置未定义，请重启插件。' });
      return;
    }

    console.log('Settings validation passed, rendering settings UI');

    // AI Provider Settings
    new Setting(containerEl)
      .setName('AI Provider')
      .setDesc('选择 AI 服务提供商')
      .addDropdown(dropdown => dropdown
        .addOption('anthropic', 'Anthropic')
        .addOption('openai', 'OpenAI')
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
        const provider = this.settings.ai.provider;
        const models = AI_MODELS[provider] || [];
        models.forEach(m => dropdown.addOption(m.value, m.label));
        return dropdown
          .setValue(this.settings.ai.model)
          .onChange(async (value: AIModel) => {
            this.settings.ai.model = value;
            await this.plugin.saveSettings();
          });
      });

    // Anthropic API Key
    if (this.settings.ai.provider === 'anthropic') {
      let showAnthropicKey = false;
      const setting = new Setting(containerEl)
        .setName('Anthropic API Key')
        .setDesc('输入你的 Anthropic API Key')
        .addText(text => {
          text.inputEl.type = showAnthropicKey ? 'text' : 'password';
          text.setPlaceholder('sk-ant-...')
            .setValue(this.settings.ai.anthropicApiKey)
            .onChange(async (value) => {
              this.settings.ai.anthropicApiKey = value;
              await this.plugin.saveSettings();
            });
          const toggleBtn = document.createElement('button');
          toggleBtn.type = 'button';
          toggleBtn.textContent = showAnthropicKey ? '隐藏' : '显示';
          toggleBtn.style.marginLeft = '8px';
          toggleBtn.onclick = () => {
            showAnthropicKey = !showAnthropicKey;
            text.inputEl.type = showAnthropicKey ? 'text' : 'password';
            toggleBtn.textContent = showAnthropicKey ? '隐藏' : '显示';
          };
          text.inputEl.parentElement?.appendChild(toggleBtn);
        });
      // 安全警告叹号浮窗
      const warn = document.createElement('span');
      warn.textContent = '⚠️';
      warn.style.color = '#d97706';
      warn.style.fontSize = '1.1em';
      warn.style.marginLeft = '8px';
      warn.style.cursor = 'pointer';
      setTooltip(warn, 'API 密钥仅保存在本地，请妥善保管，避免泄露。');
      setting.settingEl.appendChild(warn);
      setting.addButton(btn => {
        btn.setButtonText('测试连接').onClick(async () => {
          this.testResult = '测试中...';
          this.testResultColor = 'var(--text-warning)';
          this.display();
          try {
            const provider = new AnthropicProvider({
              apiKey: this.settings.ai.anthropicApiKey,
              endpoint: this.settings.ai.anthropicEndpoint || 'https://api.anthropic.com',
              model: this.settings.ai.model,
              maxTokens: 1,
              temperature: 0,
            });
            await provider.testConnection();
            this.testResult = '连接成功！';
            this.testResultColor = 'var(--text-success)';
          } catch (err: any) {
            if (err instanceof ConfigurationError) {
              this.testResult = '配置错误：' + err.message;
              this.testResultColor = 'var(--text-error)';
              new Notice(this.testResult);
              console.error('[SettingsTab] 配置错误:', err);
            } else if (err instanceof NetworkError) {
              this.testResult = '网络错误：' + err.message;
              this.testResultColor = 'var(--text-error)';
              new Notice(this.testResult);
              console.error('[SettingsTab] 网络错误:', err);
            } else if (err instanceof APIError) {
              this.testResult = 'API 错误：' + err.message;
              this.testResultColor = 'var(--text-error)';
              new Notice(this.testResult);
              console.error('[SettingsTab] API 错误:', err);
            } else {
              this.testResult = '未知错误：' + (err?.message || err);
              this.testResultColor = 'var(--text-error)';
              new Notice(this.testResult);
              console.error('[SettingsTab] 未知错误:', err);
            }
          }
          this.display();
        });
      });
      if (this.testResult) {
        const resultEl = containerEl.createEl('div', {
          text: this.testResult,
        });
        resultEl.style.color = this.testResultColor;
        resultEl.style.marginTop = '4px';
      }

      // Anthropic Endpoint
      new Setting(containerEl)
        .setName('Anthropic Endpoint')
        .setDesc('自定义 Anthropic API 端点（可选）')
        .addText((text) => {
          text.setPlaceholder('https://api.anthropic.com')
            .setValue(this.settings.ai.anthropicEndpoint || '')
            .onChange(async (value) => {
              if (!/^https?:\/\//.test(value)) {
                new Notice('Endpoint 必须以 http:// 或 https:// 开头');
                return;
              }
              this.settings.ai.anthropicEndpoint = value;
              await this.plugin.saveSettings();
            });
          // 重置按钮
          const resetBtn = document.createElement('button');
          resetBtn.textContent = '重置为默认';
          resetBtn.style.marginLeft = '8px';
          resetBtn.onclick = async () => {
            this.settings.ai.anthropicEndpoint = 'https://api.anthropic.com';
            text.setValue('https://api.anthropic.com');
            await this.plugin.saveSettings();
          };
          text.inputEl.parentElement?.appendChild(resetBtn);
        });
    }

    // OpenAI API Key
    if (this.settings.ai.provider === 'openai') {
      let showOpenAIKey = false;
      const setting = new Setting(containerEl)
        .setName('OpenAI API Key')
        .setDesc('输入你的 OpenAI API Key')
        .addText(text => {
          text.inputEl.type = showOpenAIKey ? 'text' : 'password';
          text.setPlaceholder('sk-...')
            .setValue(this.settings.ai.openAIApiKey || '')
            .onChange(async (value) => {
              this.settings.ai.openAIApiKey = value;
              await this.plugin.saveSettings();
            });
          const toggleBtn = document.createElement('button');
          toggleBtn.type = 'button';
          toggleBtn.textContent = showOpenAIKey ? '隐藏' : '显示';
          toggleBtn.style.marginLeft = '8px';
          toggleBtn.onclick = () => {
            showOpenAIKey = !showOpenAIKey;
            text.inputEl.type = showOpenAIKey ? 'text' : 'password';
            toggleBtn.textContent = showOpenAIKey ? '隐藏' : '显示';
          };
          text.inputEl.parentElement?.appendChild(toggleBtn);
        });
      // 安全警告叹号浮窗
      const warn = document.createElement('span');
      warn.textContent = '⚠️';
      warn.style.color = '#d97706';
      warn.style.fontSize = '1.1em';
      warn.style.marginLeft = '8px';
      warn.style.cursor = 'pointer';
      setTooltip(warn, 'API 密钥仅保存在本地，请妥善保管，避免泄露。');
      setting.settingEl.appendChild(warn);
      setting.addButton(btn => {
        btn.setButtonText('测试连接').onClick(async () => {
          this.testResult = '测试中...';
          this.testResultColor = 'var(--text-warning)';
          this.display();
          try {
            const provider = new OpenAIProvider({
              apiKey: this.settings.ai.openAIApiKey || '',
              endpoint: this.settings.ai.openAIEndpoint || 'https://api.openai.com/v1',
              model: this.settings.ai.model,
              maxTokens: 1,
              temperature: 0,
            });
            await provider.testConnection();
            this.testResult = '连接成功！';
            this.testResultColor = 'var(--text-success)';
          } catch (err: any) {
            if (err instanceof ConfigurationError) {
              this.testResult = '配置错误：' + err.message;
              this.testResultColor = 'var(--text-error)';
              new Notice(this.testResult);
              console.error('[SettingsTab] 配置错误:', err);
            } else if (err instanceof NetworkError) {
              this.testResult = '网络错误：' + err.message;
              this.testResultColor = 'var(--text-error)';
              new Notice(this.testResult);
              console.error('[SettingsTab] 网络错误:', err);
            } else if (err instanceof APIError) {
              this.testResult = 'API 错误：' + err.message;
              this.testResultColor = 'var(--text-error)';
              new Notice(this.testResult);
              console.error('[SettingsTab] API 错误:', err);
            } else {
              this.testResult = '未知错误：' + (err?.message || err);
              this.testResultColor = 'var(--text-error)';
              new Notice(this.testResult);
              console.error('[SettingsTab] 未知错误:', err);
            }
          }
          this.display();
        });
      });
      if (this.testResult) {
        const resultEl = containerEl.createEl('div', {
          text: this.testResult,
        });
        resultEl.style.color = this.testResultColor;
        resultEl.style.marginTop = '4px';
      }
      
      // OpenAI Endpoint
      new Setting(containerEl)
        .setName('OpenAI Endpoint')
        .setDesc('自定义 OpenAI API 端点（可选）')
        .addText((text) => {
          text.setPlaceholder('https://api.openai.com/v1')
            .setValue(this.settings.ai.openAIEndpoint || '')
            .onChange(async (value) => {
              if (!/^https?:\/\//.test(value)) {
                new Notice('Endpoint 必须以 http:// 或 https:// 开头');
                return;
              }
              this.settings.ai.openAIEndpoint = value;
              await this.plugin.saveSettings();
            });
          // 重置按钮
          const resetBtn = document.createElement('button');
          resetBtn.textContent = '重置为默认';
          resetBtn.style.marginLeft = '8px';
          resetBtn.onclick = async () => {
            this.settings.ai.openAIEndpoint = 'https://api.openai.com/v1';
            text.setValue('https://api.openai.com/v1');
            await this.plugin.saveSettings();
          };
          text.inputEl.parentElement?.appendChild(resetBtn);
        });
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
