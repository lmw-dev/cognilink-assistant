import { App, PluginSettingTab, Setting, setTooltip, Notice, setIcon } from 'obsidian';
import CogniLinkPlugin from '../main';
import { PluginSettings, AIProvider, AIModel, Theme, MessageSpacing, PromptTemplate, DEFAULT_PROMPT_TEMPLATES, DEFAULT_SETTINGS } from '../types/settings';
import { AnthropicProvider } from '../services/AnthropicProvider';
import { OpenAIProvider } from '../services/OpenAIProvider';
import { AI_MODELS, EMBEDDING_MODELS } from '../constants/ai-models';
import { ConfigurationError, APIError, NetworkError } from '../services/AIService';
import { Modal } from 'obsidian';
import { PromptTemplateService } from '../services/PromptTemplateService';
import { DeepSeekProvider } from '../services/DeepSeekProvider';
import { GeminiProvider } from '../services/GeminiProvider';
import { renderPlatformTemplateManager } from './PlatformTemplateManager';

export class SettingsTab extends PluginSettingTab {
  plugin: CogniLinkPlugin;
  settings: PluginSettings;
  private showAnthropicKey: boolean = false;
  private showOpenAIKey: boolean = false;
  private testResultAI: string = '';
  private testResultColorAI: string = '';
  private testResultEmbedding: string = '';
  private testResultColorEmbedding: string = '';
  private embeddingRebuildStatus: {
    running: boolean;
    current: number;
    total: number;
    success: number;
    fail: number;
    failedFiles: string[];
    message: string;
  } | null = null;

  constructor(app: App, plugin: CogniLinkPlugin) {
    super(app, plugin);
    console.log('SettingsTab constructor called');
    this.plugin = plugin;
    this.settings = plugin.settings || JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    console.log('SettingsTab settings:', this.settings);
    // Initialize customAdvancedTemplates and defaultAdvancedTemplates if they are undefined
    if (typeof this.settings.customAdvancedTemplates === 'undefined') {
        this.settings.customAdvancedTemplates = [];
    }
    if (typeof this.settings.defaultAdvancedTemplates === 'undefined') {
        // Initialize with ALL_DEFINED_PLATFORMS from settings.ts or a local equivalent
        const ALL_DEFINED_PLATFORMS_FOR_SETTINGS_TAB = [
            'xiaohongshu', 'twitter', 'wechat', 'blog', 'toutiao', 'zhihu', 'douyin', 'linkedin'
        ];
        this.settings.defaultAdvancedTemplates = ALL_DEFINED_PLATFORMS_FOR_SETTINGS_TAB.reduce((acc, platformId) => {
            acc[platformId as keyof typeof acc] = null;
            return acc;
        }, {} as Record<keyof any, string | null>); // Adjusted type for safety
    }
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

    // 保证 embedding 配置已初始化
    if (!this.settings.embedding) {
      this.settings.embedding = {
        embeddingProvider: 'openai',
        openai: {
          apiKey: '',
          model: 'text-embedding-ada-002',
          endpoint: 'https://api.openai.com/v1',
        },
        gemini: {
          apiKey: '',
          model: 'gemini-embedding-exp-03-07',
          endpoint: 'https://generativelanguage.googleapis.com',
        },
      };
    }

    console.log('Settings validation passed, rendering settings UI');

    containerEl.createEl('h1', { text: 'CogniLink 助理设置' });

    // === AI 服务配置区（内容生成/对话） ===
    containerEl.createEl('h2', { text: '🤖 AI 服务配置（内容生成/对话）' });
    // Provider
    new Setting(containerEl)
      .setName('AI Provider')
      .setDesc('选择内容生成/对话的 AI 服务商')
      .addDropdown(dropdown => {
        dropdown
        .addOption('openai', 'OpenAI')
        .addOption('deepseek', 'DeepSeek')
          .addOption('gemini', 'Gemini')
          .addOption('anthropic', 'Anthropic')
          .addOption('local', 'Local')
        .setValue(this.settings.ai.provider)
          .onChange(async (value) => {
            this.settings.ai.provider = value as any;
          await this.plugin.saveSettings();
          this.display();
          });
      });
    // Model
    new Setting(containerEl)
      .setName('AI Model')
      .setDesc('选择用于内容生成的模型')
      .addDropdown(dropdown => {
        const provider = this.settings.ai.provider;
        const models = AI_MODELS[provider] || [];
        if (!Array.isArray(models) || !models.length) {
          dropdown.setDisabled(true);
        } else {
          models.forEach((m: { value: string; label: string }) => dropdown.addOption(m.value, m.label));
        }
        const current = (Array.isArray(models) && models.length)
          ? (models.find(m => m.value === this.settings.ai.model)?.value || models[0].value)
          : '';
        return dropdown
          .setValue(current)
          .onChange(async (value) => {
            this.settings.ai.model = value as any;
            await this.plugin.saveSettings();
          });
      });
    // API Key
    new Setting(containerEl)
      .setName('AI API Key')
      .setDesc('内容生成/对话用的 API Key')
        .addText(text => {
        text.inputEl.type = 'password';
        // 根据 provider 选择对应的 key 字段
        let key = '';
        switch (this.settings.ai.provider) {
          case 'openai': key = this.settings.ai.openAIApiKey || ''; break;
          case 'gemini': key = this.settings.ai.geminiApiKey || ''; break;
          case 'anthropic': key = this.settings.ai.anthropicApiKey || ''; break;
          case 'deepseek': key = this.settings.ai.deepseekApiKey || ''; break;
          default: key = ''; break;
        }
        text.setValue(key)
            .onChange(async (value) => {
            switch (this.settings.ai.provider) {
              case 'openai': this.settings.ai.openAIApiKey = value; break;
              case 'gemini': this.settings.ai.geminiApiKey = value; break;
              case 'anthropic': this.settings.ai.anthropicApiKey = value; break;
              case 'deepseek': this.settings.ai.deepseekApiKey = value; break;
              default: break;
            }
              await this.plugin.saveSettings();
            });
      });
    // Endpoint
    new Setting(containerEl)
      .setName('AI Endpoint')
      .setDesc('内容生成/对话用的 API Endpoint')
        .addText(text => {
        // 根据 provider 选择对应的 endpoint 字段
        let endpoint = '';
        switch (this.settings.ai.provider) {
          case 'openai': endpoint = this.settings.ai.openAIEndpoint || ''; break;
          case 'gemini': endpoint = this.settings.ai.geminiEndpoint || ''; break;
          case 'anthropic': endpoint = this.settings.ai.anthropicEndpoint || ''; break;
          case 'deepseek': endpoint = this.settings.ai.deepseekEndpoint || ''; break;
          default: endpoint = ''; break;
        }
        text.setValue(endpoint)
            .onChange(async (value) => {
            switch (this.settings.ai.provider) {
              case 'openai': this.settings.ai.openAIEndpoint = value; break;
              case 'gemini': this.settings.ai.geminiEndpoint = value; break;
              case 'anthropic': this.settings.ai.anthropicEndpoint = value; break;
              case 'deepseek': this.settings.ai.deepseekEndpoint = value; break;
              default: break;
            }
              await this.plugin.saveSettings();
            });
      });
    // 测试连接按钮（AI）
    new Setting(containerEl)
      .addButton(btn => btn
        .setButtonText('测试 AI 连接')
        .onClick(async () => {
          this.testResultAI = '测试中...';
          this.testResultColorAI = 'var(--text-warning)';
          this.display();
          try {
            let providerInstance: any = null;
            switch (this.settings.ai.provider) {
              case 'openai':
                console.log('[SettingsTab] 测试 OpenAI 连接');
                providerInstance = new OpenAIProvider({
              apiKey: this.settings.ai.openAIApiKey || '',
                  endpoint: this.settings.ai.openAIEndpoint || '',
                  model: this.settings.ai.model || '',
              maxTokens: 1,
              temperature: 0,
            });
                break;
              case 'gemini':
                console.log('[SettingsTab] 测试 Gemini 连接');
                providerInstance = new GeminiProvider({
                  apiKey: this.settings.ai.geminiApiKey || '',
                  endpoint: this.settings.ai.geminiEndpoint || '',
                  model: this.settings.ai.model || '',
                  maxTokens: 1,
                  temperature: 0,
                });
                break;
              case 'anthropic':
                console.log('[SettingsTab] 测试 Anthropic 连接');
                providerInstance = new AnthropicProvider({
                  apiKey: this.settings.ai.anthropicApiKey || '',
                  endpoint: this.settings.ai.anthropicEndpoint || '',
                  model: this.settings.ai.model || '',
                  maxTokens: 1,
                  temperature: 0,
                });
                break;
              case 'deepseek':
                console.log('[SettingsTab] 测试 DeepSeek 连接');
                providerInstance = new DeepSeekProvider({
                  apiKey: this.settings.ai.deepseekApiKey || '',
                  endpoint: this.settings.ai.deepseekEndpoint || '',
                  model: this.settings.ai.model || '',
                  maxTokens: 1,
                  temperature: 0,
                });
                break;
              case 'local':
                console.log('[SettingsTab] 测试 Local 连接（本地模式无需测试）');
                providerInstance = { testConnection: async () => { return '本地模式无需测试'; } };
                break;
              default:
                throw new Error('暂不支持的 AI Provider');
            }
            if (providerInstance && providerInstance.testConnection) {
              await providerInstance.testConnection();
            }
            this.testResultAI = '连接成功！';
            this.testResultColorAI = 'var(--text-success)';
          } catch (err: any) {
            this.testResultAI = 'AI 连接失败：' + (err?.message || err);
            this.testResultColorAI = 'var(--text-error)';
            new Notice(this.testResultAI);
          }
          this.display();
        }))
      .settingEl.appendChild((() => {
        const resultEl = document.createElement('div');
        resultEl.textContent = this.testResultAI;
        resultEl.style.color = this.testResultColorAI;
        resultEl.style.marginTop = '4px';
        return resultEl;
      })());

    // === Embedding 服务配置区（文本向量化） ===
    containerEl.createEl('h2', { text: '🔗 Embedding 服务配置（文本向量化）' });
    // Provider
      new Setting(containerEl)
      .setName('Embedding Provider')
      .setDesc('选择文本向量化的服务商')
      .addDropdown(dropdown => {
        dropdown
          .addOption('openai', 'OpenAI')
          .addOption('gemini', 'Gemini')
          .setValue(this.settings.embedding.embeddingProvider)
            .onChange(async (value) => {
            this.settings.embedding.embeddingProvider = value as any;
              await this.plugin.saveSettings();
            this.display();
          });
      });

    // 获取当前 provider 的配置对象
    const embeddingProvider = this.settings.embedding.embeddingProvider;
    const providerConfig = this.settings.embedding[embeddingProvider];

    // Model
    new Setting(containerEl)
      .setName('Embedding Model')
      .setDesc('选择用于向量化的模型')
      .addDropdown(dropdown => {
        const models = EMBEDDING_MODELS[embeddingProvider] || [];
        if (!Array.isArray(models) || !models.length) {
          dropdown.setDisabled(true);
        } else {
          models.forEach((m: { value: string; label: string }) => dropdown.addOption(m.value, m.label));
        }
        const current = (Array.isArray(models) && models.length)
          ? (models.find(m => m.value === providerConfig.model)?.value || models[0].value)
          : '';
        return dropdown
          .setValue(current)
            .onChange(async (value) => {
            providerConfig.model = value as any;
              await this.plugin.saveSettings();
            });
      });
    // API Key
      new Setting(containerEl)
      .setName('Embedding API Key')
      .setDesc('文本向量化用的 API Key')
      .addText(text => {
        text.inputEl.type = 'password';
        text.setValue(providerConfig.apiKey)
            .onChange(async (value) => {
            providerConfig.apiKey = value;
              await this.plugin.saveSettings();
            });
        });
    // Endpoint
    new Setting(containerEl)
      .setName('Embedding Endpoint')
      .setDesc('文本向量化用的 API Endpoint')
        .addText(text => {
        text.setValue(providerConfig.endpoint)
            .onChange(async (value) => {
            providerConfig.endpoint = value;
              await this.plugin.saveSettings();
            });
      });
    // 测试连接按钮（Embedding）
    new Setting(containerEl)
      .addButton(btn => btn
        .setButtonText('测试 Embedding 连接')
        .onClick(async () => {
          this.testResultEmbedding = '测试中...';
          this.testResultColorEmbedding = 'var(--text-warning)';
          this.display();
          try {
            let providerInstance: any = null;
            switch (embeddingProvider) {
              case 'openai':
                providerInstance = new OpenAIProvider({
                  apiKey: providerConfig.apiKey || '',
                  endpoint: providerConfig.endpoint || '',
                  model: providerConfig.model || '',
              maxTokens: 1,
              temperature: 0,
            });
                break;
              case 'gemini':
                providerInstance = new GeminiProvider({
                  apiKey: providerConfig.apiKey || '',
                  endpoint: providerConfig.endpoint || '',
                  model: providerConfig.model || '',
                  maxTokens: 1,
                  temperature: 0,
                });
                break;
              default:
                throw new Error('暂不支持的 Embedding Provider');
            }
            if (providerInstance && providerInstance.generateEmbeddings) {
              const result = await providerInstance.generateEmbeddings('test connection');
              if (!Array.isArray(result) || result.length === 0) {
                throw new Error('API 返回无 embedding 数据');
              }
            }
            this.testResultEmbedding = '连接成功！';
            this.testResultColorEmbedding = 'var(--text-success)';
          } catch (err: any) {
            this.testResultEmbedding = 'Embedding 连接失败：' + (err?.message || err);
            this.testResultColorEmbedding = 'var(--text-error)';
            new Notice(this.testResultEmbedding);
          }
          this.display();
        }))
      .settingEl.appendChild((() => {
        const resultEl = document.createElement('div');
        resultEl.textContent = this.testResultEmbedding;
        resultEl.style.color = this.testResultColorEmbedding;
        resultEl.style.marginTop = '4px';
        return resultEl;
      })());

    // === RAG 检索参数设置 ===
    containerEl.createEl('h3', { text: 'RAG 检索参数' });
    new Setting(containerEl)
      .setName('检索数量 (topK)')
      .setDesc('每次检索返回的笔记数量')
      .addText(text => text
        .setValue(String(this.settings.rag?.topK ?? 8))
        .onChange(async (value) => {
          if (!this.settings.rag) this.settings.rag = { topK: 8, threshold: 0.7, dedupThreshold: 0.98 };
          this.settings.rag.topK = Number(value);
          await this.plugin.saveSettings();
        }));
    new Setting(containerEl)
      .setName('相似度阈值')
      .setDesc('检索时的相似度阈值，0~1，越高越严格')
      .addText(text => text
        .setValue(String(this.settings.rag?.threshold ?? 0.7))
        .onChange(async (value) => {
          if (!this.settings.rag) this.settings.rag = { topK: 8, threshold: 0.7, dedupThreshold: 0.98 };
          this.settings.rag.threshold = Number(value);
          await this.plugin.saveSettings();
        }));
    new Setting(containerEl)
      .setName('去重阈值')
      .setDesc('内容去重时的相似度阈值，0~1，越高越严格')
      .addText(text => text
        .setValue(String(this.settings.rag?.dedupThreshold ?? 0.98))
        .onChange(async (value) => {
          if (!this.settings.rag) this.settings.rag = { topK: 8, threshold: 0.7, dedupThreshold: 0.98 };
          this.settings.rag.dedupThreshold = Number(value);
          await this.plugin.saveSettings();
        }));

    // === RAG 索引范围配置（白名单/黑名单文件夹） ===
    containerEl.createEl('h3', { text: 'RAG 索引范围配置' });
    const allFiles = this.app.vault.getAllLoadedFiles();
    const allFolders = Array.from(new Set(
      allFiles
        .map(f => f.path)
        .filter(p => p.includes('/'))
        .map(p => p.substring(0, p.lastIndexOf('/') + 1))
    ));
    // 工具函数：渲染多选输入
    function renderMultiSelect(
      label: string,
      selected: string[],
      onChange: (val: string[]) => void,
      placeholder: string
    ) {
      const setting = new Setting(containerEl)
        .setName(label)
        .setDesc(placeholder);
      const input = setting.controlEl.createEl('input', {
        type: 'text',
        placeholder: '输入或选择文件夹路径，回车添加',
        cls: 'rag-folder-input',
      });
      input.style.minWidth = '260px';
      // 补全建议下拉
      const suggestBox = setting.controlEl.createEl('div', { cls: 'rag-suggest-box' });
      suggestBox.style.position = 'absolute';
      suggestBox.style.background = '#fff';
      suggestBox.style.border = '1px solid #ccc';
      suggestBox.style.zIndex = '1000';
      suggestBox.style.display = 'none';
      suggestBox.style.maxHeight = '120px';
      suggestBox.style.overflowY = 'auto';
      // 已选标签
      const tagBox = setting.controlEl.createEl('div', { cls: 'rag-tag-box' });
      tagBox.style.display = 'flex';
      tagBox.style.flexWrap = 'wrap';
      tagBox.style.gap = '4px';
      tagBox.style.margin = '4px 0';
      function renderTags() {
        tagBox.empty();
        selected.forEach((val, idx) => {
          const tag = tagBox.createEl('span', { text: val, cls: 'rag-tag' });
          tag.style.background = '#e0e7ef';
          tag.style.borderRadius = '4px';
          tag.style.padding = '2px 8px';
          tag.style.fontSize = '0.95em';
          tag.style.display = 'inline-flex';
          tag.style.alignItems = 'center';
          tag.style.gap = '4px';
          const del = tag.createEl('span', { text: '×', cls: 'rag-tag-del' });
          del.style.cursor = 'pointer';
          del.onclick = () => {
            const newArr = selected.slice();
            newArr.splice(idx, 1);
            onChange(newArr);
            renderTags();
          };
        });
      }
      renderTags();
      // 输入事件
      input.oninput = () => {
        const val = input.value.trim();
        if (!val) {
          suggestBox.style.display = 'none';
          suggestBox.empty();
          return;
        }
        const suggestions = allFolders.filter(f => f.startsWith(val) && !selected.includes(f));
        suggestBox.empty();
        if (suggestions.length > 0) {
          suggestions.forEach(s => {
            const item = suggestBox.createEl('div', { text: s, cls: 'rag-suggest-item' });
            item.style.padding = '4px 8px';
            item.style.cursor = 'pointer';
            item.onmousedown = () => {
              onChange([...selected, s]);
              input.value = '';
              suggestBox.style.display = 'none';
              renderTags();
            };
          });
          suggestBox.style.display = 'block';
        } else {
          suggestBox.style.display = 'none';
        }
      };
      // 回车添加
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          const val = input.value.trim();
          if (val && !selected.includes(val)) {
            onChange([...selected, val]);
            input.value = '';
            renderTags();
          }
          suggestBox.style.display = 'none';
        }
      };
      // 失焦隐藏建议
      input.onblur = () => {
        setTimeout(() => { suggestBox.style.display = 'none'; }, 150);
      };
      // 初始渲染
      renderTags();
      setting.controlEl.appendChild(tagBox);
      setting.controlEl.appendChild(suggestBox);
      return setting;
    }
    // 白名单
    renderMultiSelect(
      '白名单文件夹',
      this.settings.rag?.indexWhitelist || [],
      async (val) => {
        if (!this.settings.rag) this.settings.rag = {};
        this.settings.rag.indexWhitelist = val;
        await this.plugin.saveSettings();
      },
      '仅索引这些文件夹下的内容（留空则不限）'
    );
    // 黑名单
    renderMultiSelect(
      '黑名单文件夹',
      this.settings.rag?.indexBlacklist || [],
      async (val) => {
        if (!this.settings.rag) this.settings.rag = {};
        this.settings.rag.indexBlacklist = val;
        await this.plugin.saveSettings();
      },
      '排除这些文件夹下的内容（留空则不过滤）'
    );
    // 恢复默认按钮
    new Setting(containerEl)
      .addButton(btn => btn
        .setButtonText('恢复默认索引范围')
        .setWarning()
        .onClick(async () => {
          if (!this.settings.rag) this.settings.rag = {};
          this.settings.rag.indexWhitelist = ['Golden-Knowledge/'];
          this.settings.rag.indexBlacklist = ['Clippings/', '_resources/'];
          await this.plugin.saveSettings();
          this.display();
        }));

    // === 原创性检测参数设置 ===
    containerEl.createEl('h3', { text: '原创性检测' });
    if (!this.settings.rag) this.settings.rag = {};
    if (!this.settings.rag.originality) this.settings.rag.originality = { threshold: 0.8, granularity: 'paragraph' };
    const originality = this.settings.rag.originality;
    new Setting(containerEl)
      .setName('相似度阈值')
      .setDesc('相似度超过该值将高亮（0.7~0.99）')
      .addSlider(slider => slider
        .setLimits(0.7, 0.99, 0.01)
        .setValue(originality.threshold)
        .setDynamicTooltip()
        .onChange(async (value) => {
          originality.threshold = value;
          await this.plugin.saveSettings();
        }));
    new Setting(containerEl)
      .setName('检测粒度')
      .setDesc('选择检测粒度')
      .addDropdown(dropdown => dropdown
        .addOption('paragraph', '段落')
        .addOption('sentence', '句子')
        .setValue(originality.granularity)
        .onChange(async (value) => {
          originality.granularity = value as 'paragraph' | 'sentence';
          await this.plugin.saveSettings();
        }));

    // === Prompt 模板管理 ===
    containerEl.createEl('h3', { text: 'Prompt 模板管理' });
    const rag = this.settings.rag ?? (this.settings.rag = {});
    if (!rag.promptTemplates) rag.promptTemplates = DEFAULT_PROMPT_TEMPLATES.slice();
    if (!rag.defaultPromptTemplateId) rag.defaultPromptTemplateId = 'default';
    rag.promptTemplates.forEach((tpl, idx) => {
      new Setting(containerEl)
        .setName(tpl.name)
        .setDesc(tpl.content.slice(0, 60) + '...')
        .addButton(btn => btn
          .setButtonText('编辑')
          .onClick(() => {
            const modal = new Modal(this.app);
            modal.titleEl.setText('编辑模板');
            const textarea = modal.contentEl.createEl('textarea');
            textarea.value = tpl.content;
            textarea.rows = 8;
            textarea.style.width = '100%';
            modal.contentEl.createEl('br');
            new Setting(modal.contentEl)
              .addButton(b => b.setButtonText('保存').onClick(async () => {
                tpl.content = textarea.value;
                await this.plugin.saveSettings();
                modal.close();
                this.display();
              }))
              .addButton(b => b.setButtonText('取消').onClick(() => modal.close()));
            modal.open();
          }))
        .addButton(btn => btn
          .setButtonText('删除')
          .setWarning()
          .onClick(async () => {
            rag.promptTemplates!.splice(idx, 1);
            await this.plugin.saveSettings();
            this.display();
          }))
        .addExtraButton(btn => {
          btn.setIcon('star');
          btn.setTooltip('设为默认');
          if (rag.defaultPromptTemplateId === tpl.id) btn.extraSettingsEl.addClass('is-active');
          btn.onClick(async () => {
            rag.defaultPromptTemplateId = tpl.id;
            await this.plugin.saveSettings();
            this.display();
          });
        });
    });
    new Setting(containerEl)
      .addButton(btn => btn
        .setButtonText('新增模板')
        .onClick(() => {
          const modal = new Modal(this.app);
          modal.titleEl.setText('新增模板');
          const nameInput = modal.contentEl.createEl('input', { type: 'text', placeholder: '模板名称' });
          modal.contentEl.createEl('br');
          const textarea = modal.contentEl.createEl('textarea');
          textarea.rows = 8;
          textarea.style.width = '100%';
          modal.contentEl.createEl('br');
          new Setting(modal.contentEl)
            .addButton(b => b.setButtonText('添加').onClick(async () => {
              const id = Date.now().toString();
              rag.promptTemplates!.push({ id, name: nameInput.value || '新模板', content: textarea.value });
              await this.plugin.saveSettings();
              modal.close();
              this.display();
            }))
            .addButton(b => b.setButtonText('取消').onClick(() => modal.close()));
          modal.open();
        }));
    new Setting(containerEl)
      .addButton(btn => btn
        .setButtonText('恢复默认模板')
        .onClick(async () => {
          rag.promptTemplates = DEFAULT_PROMPT_TEMPLATES.slice();
          rag.defaultPromptTemplateId = 'default';
          await this.plugin.saveSettings();
          this.display();
        }));

    // === 手动重建 embedding 索引 ===
    containerEl.createEl('h3', { text: 'Embedding 索引管理' });
    // Embedding 最大内容长度设置
    new Setting(containerEl)
      .setName('Embedding 最大内容长度')
      .setDesc('每篇笔记用于 embedding 的最大字符数，超出将自动截断（默认12000）')
      .addText(text => text
        .setValue(String((this.settings as any).embeddingMaxLength ?? 12000))
        .onChange(async (value) => {
          (this.settings as any).embeddingMaxLength = Number(value) || 12000;
          await this.plugin.saveSettings();
        }));

    // 进度与结果展示
    let statusDiv: HTMLDivElement | null = null;
    if (this.embeddingRebuildStatus) {
      const status = this.embeddingRebuildStatus;
      statusDiv = containerEl.createEl('div', { cls: 'embedding-rebuild-status' });
      statusDiv.style.margin = '8px 0';
      statusDiv.style.fontSize = '0.95em';
      if (status.running) {
        statusDiv.textContent = `重建中... (${status.current}/${status.total}) 成功: ${status.success} 失败: ${status.fail}`;
      } else {
        statusDiv.textContent = status.message;
      }
      if (status.failedFiles.length > 0) {
        const failTitle = statusDiv.createEl('div', { text: '失败文件列表：', cls: 'embedding-fail-title' });
        failTitle.style.marginTop = '4px';
        const failList = statusDiv.createEl('ul', { cls: 'embedding-fail-list' });
        failList.style.maxHeight = '120px';
        failList.style.overflowY = 'auto';
        status.failedFiles.forEach(f => failList.createEl('li', { text: f }));
      }
    }

    new Setting(containerEl)
      .setName('手动重建 embedding 索引')
      .setDesc('强制对所有笔记重新生成 embedding，适用于索引异常或文档变更后。')
      .addButton(btn => btn
        .setButtonText('重建')
        .setCta()
        .onClick(async () => {
          const files = this.plugin.app.vault.getMarkdownFiles();
          this.embeddingRebuildStatus = {
            running: true,
            current: 0,
            total: files.length,
            success: 0,
            fail: 0,
            failedFiles: [],
            message: ''
          };
          this.display();
          // 获取最大长度
          const maxLen = (this.settings as any).embeddingMaxLength ?? 12000;
          for (let i = 0; i < files.length; i++) {
            try {
              let content = await this.plugin.app.vault.read(files[i]);
              if (content.length > maxLen) {
                content = content.slice(0, maxLen);
                // 直接用 console.info 记录
                console.info(`内容过长，已截断: ${files[i].path} (${content.length} > ${maxLen})`);
              }
              let tags: string[] = [];
              try {
                const meta = this.plugin.app.metadataCache.getFileCache(files[i]);
                tags = (meta?.tags ?? []).map((t: any) => t.tag);
              } catch { /* 忽略元数据异常 */ }
              // 本地实现 createNoteLink
              const noteLink = `obsidian://open?vault=${encodeURIComponent(this.plugin.app.vault.getName())}&file=${encodeURIComponent(files[i].path)}`;
              await this.plugin.embeddingService.updateEmbedding({
                title: files[i].basename,
                content,
                link: noteLink,
                path: files[i].path,
                tags,
                updated: files[i].stat.mtime,
              });
              this.embeddingRebuildStatus.success++;
            } catch (e) {
              this.embeddingRebuildStatus.fail++;
              this.embeddingRebuildStatus.failedFiles.push(files[i].path);
            }
            this.embeddingRebuildStatus.current = i + 1;
            this.display();
            // 避免 UI 卡死
            await new Promise(res => setTimeout(res, 10));
          }
          this.embeddingRebuildStatus.running = false;
          this.embeddingRebuildStatus.message = `重建完成：成功 ${this.embeddingRebuildStatus.success}，失败 ${this.embeddingRebuildStatus.fail}`;
          this.display();
        })
      );

    // UI Settings Section
    containerEl.createEl('h2', { text: '🎨 UI 个性化设置' });

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
