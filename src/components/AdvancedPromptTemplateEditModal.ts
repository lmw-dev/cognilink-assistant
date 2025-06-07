import { App, Modal, Setting, TextAreaComponent, Notice, DropdownComponent, request, TFile } from 'obsidian';
import { AdvancedPromptTemplate, PlatformId, PromptCategory, PromptVariable, FewShotExample, QualityRule, AntiAIDetectionStrategy } from '../types/prompt-advanced';
import { ADVANCED_PLATFORM_TEMPLATES } from '../config/advanced-platform-templates'; // For platform/category options

// Extract available platforms and categories for dropdowns
const ALL_PLATFORMS: PlatformId[] = ADVANCED_PLATFORM_TEMPLATES.reduce((acc, tpl) => {
    if (tpl.platform && !acc.includes(tpl.platform)) {
        acc.push(tpl.platform);
    }
    return acc;
}, [] as PlatformId[]);

const ALL_CATEGORIES: PromptCategory[] = ADVANCED_PLATFORM_TEMPLATES.reduce((acc, tpl) => {
    if (tpl.category && !acc.includes(tpl.category)) {
        acc.push(tpl.category);
    }
    return acc;
}, [] as PromptCategory[]);
if (!ALL_CATEGORIES.includes('custom')) ALL_CATEGORIES.push('custom');

// Helper function to parse suggestions from Markdown
const parsePlatformSuggestions = (markdownContent: string): Record<string, string> => {
    const suggestions: Record<string, string> = {};
    const lines = markdownContent.split('\n');
    let currentPlatformKey: string | null = null;
    let currentSuggestion = '';

    const platformKeywords: Record<PlatformId, string[]> = {
        'xiaohongshu': ['小红书', 'Xiaohongshu'],
        'twitter': ['Twitter', '推特'],
        'wechat': ['微信公众号', 'WeChat Official Account', '微信'],
        'blog': ['博客', 'Blog'],
        'toutiao': ['头条号', 'Toutiao'],
        'zhihu': ['知乎', 'Zhihu'],
        'douyin': ['抖音', 'Douyin'],
        'linkedin': ['领英', 'LinkedIn'],
        // Add other platforms as needed
    };

    for (const line of lines) {
        if (line.startsWith('### ') || line.startsWith('## ')) { // New section starts
            if (currentPlatformKey && currentSuggestion.trim()) {
                suggestions[currentPlatformKey] = currentSuggestion.trim();
            }
            currentPlatformKey = null;
            currentSuggestion = '';

            const headingText = line.substring(line.startsWith('### ') ? 4 : 3).trim();
            for (const platform in platformKeywords) {
                if (platformKeywords[platform as PlatformId].some(keyword => headingText.includes(keyword))) {
                    currentPlatformKey = platform;
                    break;
                }
            }
        } else if (currentPlatformKey) {
            currentSuggestion += line + '\n';
        }
    }
    // Add the last collected suggestion
    if (currentPlatformKey && currentSuggestion.trim()) {
        suggestions[currentPlatformKey] = currentSuggestion.trim();
    }
    return suggestions;
};

export class AdvancedPromptTemplateEditModal extends Modal {
  template: Partial<AdvancedPromptTemplate>;
  isNewTemplate: boolean;
  onSubmit: (template: AdvancedPromptTemplate) => void;
  private previewEl: HTMLDivElement;
  private suggestionsEl: HTMLDivElement;
  private platformSuggestions: Record<string, string> = {};

  constructor(
    app: App, 
    template: Partial<AdvancedPromptTemplate> | null,
    onSubmit: (template: AdvancedPromptTemplate) => void
  ) {
    super(app);
    this.isNewTemplate = template === null;
    this.template = template || {
      id: `custom-${Date.now()}`,
      name: '新的自定义模板',
      platform: ALL_PLATFORMS.length > 0 ? ALL_PLATFORMS[0] : 'blog', // Default platform
      category: 'custom', // Default category
      tags: [],
      systemPrompt: '',
      taskPrompt: '',
      contextPrompt: '',
      outputPrompt: '',
      variables: [] as PromptVariable[],
      examples: [] as FewShotExample[],
      qualityRules: [] as QualityRule[],
      antiAISettings: {} as AntiAIDetectionStrategy, // Simplified for now
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
    };
    this.onSubmit = onSubmit;
    this.previewEl = document.createElement('div'); // Initialize previewEl
    this.suggestionsEl = document.createElement('div');
    this.loadSuggestions(); // Load suggestions on init
  }

  async loadSuggestions() {
    try {
      // Assuming the suggestions file is in the vault. 
      // For a plugin, you might bundle this file or fetch it differently.
      const suggestionsFile = this.app.vault.getAbstractFileByPath('docs/06-tmp/02-优化中文提示词 自媒体爆款文章.md');
      if (suggestionsFile instanceof TFile && suggestionsFile.extension === 'md') {
        const markdownContent = await this.app.vault.cachedRead(suggestionsFile);
        this.platformSuggestions = parsePlatformSuggestions(markdownContent);
      } else {
        console.warn('Platform suggestions Markdown file not found or not a .md file.');
        this.platformSuggestions = {}; // Fallback to empty
      }
    } catch (error) {
      console.error('Error loading platform suggestions:', error);
      this.platformSuggestions = {}; // Fallback
    }
    this.updateSuggestionsDisplay(); // Update display after loading
  }

  updateSuggestionsDisplay() {
    if (!this.suggestionsEl) return;
    this.suggestionsEl.empty(); // Clear previous suggestions
    const platform = this.template.platform;
    if (platform && this.platformSuggestions[platform]) {
        // Displaying as preformatted text for now. 
        // Could use app.plugins.plugins.markdown.MarkdownRenderer.renderMarkdown for richer display if available
        const suggestionText = this.platformSuggestions[platform];
        const pre = this.suggestionsEl.createEl('pre', { text: suggestionText });
        pre.setAttribute('style', 'white-space: pre-wrap; font-size: var(--font-ui-small);');
    } else {
        this.suggestionsEl.createEl('p', { text: '当前平台暂无特定优化建议。' , cls: 'text-muted'});
    }
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: this.isNewTemplate ? '新增平台模板' : '编辑平台模板' });

    // --- Basic Info --- 
    new Setting(contentEl)
      .setName('模板名称')
      .addText(text => text
        .setPlaceholder('例如：小红书爆款种草笔记')
        .setValue(this.template.name || '')
        .onChange(value => {
            this.template.name = value;
            this.updatePreview(); // Update preview if name is part of it (it's not currently)
        }));

    new Setting(contentEl)
      .setName('目标平台')
      .addDropdown(dropdown => {
        ALL_PLATFORMS.forEach(p => dropdown.addOption(p, p));
        dropdown.setValue(this.template.platform || (ALL_PLATFORMS.length > 0 ? ALL_PLATFORMS[0] : 'blog'))
        .onChange(value => {
            this.template.platform = value as PlatformId;
            this.updatePreview();
            this.updateSuggestionsDisplay(); // Update suggestions when platform changes
        });
      });

    new Setting(contentEl)
      .setName('模板分类')
      .addDropdown(dropdown => {
        ALL_CATEGORIES.forEach(c => dropdown.addOption(c, c));
        dropdown.setValue(this.template.category || 'custom')
        .onChange(value => {
            this.template.category = value as PromptCategory;
            this.updatePreview();
        });
      });
    
    new Setting(contentEl)
      .setName('模板描述')
      .addTextArea(text => text
        .setPlaceholder('简要描述模板的用途和特点...')
        .setValue(this.template.description || '')
        .onChange(value => {
            this.template.description = value;
            this.updatePreview();
        }));

    // --- Prompt Layers --- 
    contentEl.createEl('h3', { text: '分层 Prompt 内容' });

    this.createPromptTextArea(contentEl, 'System Prompt (系统层)', '角色定义、基础规则、风格指令等', 'systemPrompt');
    this.createPromptTextArea(contentEl, 'Task Prompt (任务层)', '具体任务、目标、核心要求等', 'taskPrompt');
    this.createPromptTextArea(contentEl, 'Context Prompt (上下文层)', '如何处理用户输入、背景信息、变量等', 'contextPrompt');
    this.createPromptTextArea(contentEl, 'Output Prompt (输出层)', '输出格式、长度、质量标准、语气要求等', 'outputPrompt');

    // --- Live Preview Section ---
    contentEl.createEl('h3', { text: '实时 Prompt 预览' });
    this.previewEl = contentEl.createDiv('prompt-preview');
    this.previewEl.setAttribute('style', 'white-space: pre-wrap; background-color: var(--background-secondary); padding: 10px; border-radius: var(--radius-m); margin-bottom: 10px; max-height: 200px; overflow-y: auto; font-family: var(--font-monospace);');
    this.updatePreview(); // Initial preview

    // --- Platform Prompt Optimization Suggestions ---
    contentEl.createEl('h3', { text: '平台 Prompt 优化建议' });
    this.suggestionsEl = contentEl.createDiv('prompt-suggestions');
    this.suggestionsEl.setAttribute('style', 'background-color: var(--background-secondary); padding: 10px; border-radius: var(--radius-m); margin-bottom: 10px; max-height: 200px; overflow-y: auto;');
    this.updateSuggestionsDisplay(); // Initial display of suggestions

    // --- Advanced JSON Editor (for other properties) --- 
    contentEl.createEl('h3', { text: '高级属性 (JSON 编辑)' });
    contentEl.createEl('p', { text: '以下属性 (如 variables, examples, qualityRules, antiAISettings, tags, version) 请暂时使用 JSON 编辑。后续将提供可视化编辑器。'})
        .setAttribute('style', 'font-size: var(--font-ui-small); color: var(--text-muted);');

    const advancedProps: Partial<AdvancedPromptTemplate> = { ...this.template };
    delete advancedProps.id; // Handled automatically or by user in specific cases
    delete advancedProps.name;
    delete advancedProps.platform;
    delete advancedProps.category;
    delete advancedProps.description;
    delete advancedProps.systemPrompt;
    delete advancedProps.taskPrompt;
    delete advancedProps.contextPrompt;
    delete advancedProps.outputPrompt;
    delete advancedProps.createdAt;
    delete advancedProps.updatedAt;
    delete advancedProps.usageCount;

    const jsonEditor = new TextAreaComponent(contentEl)
      .setValue(JSON.stringify(advancedProps, null, 2))
      .setPlaceholder('编辑高级属性如 variables, examples, qualityRules...');
    jsonEditor.inputEl.style.width = '100%';
    jsonEditor.inputEl.style.height = '250px';
    jsonEditor.inputEl.style.minHeight = '150px';

    // --- Actions --- 
    new Setting(contentEl)
      .addButton(button => button
        .setButtonText(this.isNewTemplate ? '创建模板' : '保存更改')
        .setCta()
        .onClick(() => {
          try {
            const advancedPropsUpdated = JSON.parse(jsonEditor.getValue());
            const finalTemplate: Partial<AdvancedPromptTemplate> = {
                ...this.template, // Contains name, platform, category, description, and prompts from direct inputs
                ...advancedPropsUpdated, // Contains other props from JSON editor
            };

            if (!finalTemplate.id) finalTemplate.id = `custom-${Date.now()}`;
            if (!finalTemplate.createdAt && this.isNewTemplate) finalTemplate.createdAt = new Date();
            finalTemplate.updatedAt = new Date();
            if (this.isNewTemplate && finalTemplate.usageCount === undefined) finalTemplate.usageCount = 0;
            if (!finalTemplate.version) finalTemplate.version = '1.0.0';

            if (!finalTemplate.name || !finalTemplate.platform || !finalTemplate.systemPrompt) {
                new Notice('错误：模板名称、平台和系统提示不能为空！');
                return;
            }

            this.onSubmit(finalTemplate as AdvancedPromptTemplate);
            this.close();
          } catch (e) {
            console.error("Error parsing advanced properties JSON:", e);
            new Notice('保存模板失败：高级属性 JSON 格式无效。请检查控制台获取更多信息。');
          }
        }))
      .addButton(button => button
        .setButtonText('取消')
        .onClick(() => this.close()));
  }

  createPromptTextArea(containerEl: HTMLElement, name: string, placeholder: string, propertyName: keyof Pick<AdvancedPromptTemplate, 'systemPrompt' | 'taskPrompt' | 'contextPrompt' | 'outputPrompt'>) {
    new Setting(containerEl)
        .setName(name)
        .setDesc(placeholder)
        .setClass('cognilink-prompt-textarea-setting') // Add a class for custom styling
        .addTextArea(text => {
            text.setPlaceholder(placeholder)
                .setValue(this.template[propertyName] || '')
                .onChange(value => {
                    this.template[propertyName] = value;
                    this.updatePreview(); // Update preview when text changes
                });
            text.inputEl.style.minHeight = '100px';
            text.inputEl.style.width = '100%'; // Ensure it takes full width
        });
  }

  updatePreview() {
    if (!this.previewEl) return;
    const { systemPrompt = '', taskPrompt = '', contextPrompt = '', outputPrompt = '' } = this.template;
    // A simple concatenation for preview. This could be made more sophisticated later
    // to show variable placeholders more clearly, etc.
    const previewContent = 
`--- SYSTEM PROMPT ---
${systemPrompt}

--- TASK PROMPT ---
${taskPrompt}

--- CONTEXT PROMPT ---
${contextPrompt}

--- OUTPUT PROMPT ---
${outputPrompt}`;
    this.previewEl.textContent = previewContent;
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
} 