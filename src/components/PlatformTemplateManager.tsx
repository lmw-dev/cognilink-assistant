import { App, Notice, Setting, DropdownComponent, Modal, TextAreaComponent, setTooltip } from 'obsidian';
import CogniLinkPlugin from '../main';
import { PluginSettings } from '../types/settings';
import { AdvancedPromptTemplate, PlatformId, PromptCategory } from '../types/prompt-advanced';
import { ADVANCED_PLATFORM_TEMPLATES } from '../config/advanced-platform-templates';
import { AdvancedPromptTemplateEditModal } from './AdvancedPromptTemplateEditModal'; // Import the modal
import { confirmModal } from '../utils/confirm-modal';
import { deepCopy } from '../utils/deep-copy';

interface PlatformTemplateManagerProps {
  app: App;
  plugin: CogniLinkPlugin;
  settings: PluginSettings;
  onSettingsChange: (newSettings: PluginSettings) => Promise<void>;
}

const ALL_DEFINED_PLATFORMS_FOR_MANAGER: PlatformId[] = [
    'xiaohongshu', 'twitter', 'wechat', 'blog', 'toutiao', 'zhihu', 'douyin', 'linkedin'
];

let customTemplates: AdvancedPromptTemplate[] = []; 

// Correctly initialize module-level defaultTemplatesByPlatform to satisfy the type
let defaultTemplatesByPlatform: Record<PlatformId, string | null> = 
    ALL_DEFINED_PLATFORMS_FOR_MANAGER.reduce((acc, platformId) => {
        acc[platformId] = null;
        return acc;
    }, {} as Record<PlatformId, string | null>);

let currentProps: PlatformTemplateManagerProps | null = null; // To access props in saveCustomTemplates

// Function to initialize module-level state from props
function initializeManagerState(props: PlatformTemplateManagerProps) {
    currentProps = props;
    // Deep copy to avoid direct mutation of settings object if templates are complex
    customTemplates = deepCopy(props.settings.customAdvancedTemplates || []);
    
    const loadedDefaults = props.settings.defaultAdvancedTemplates || {};
    // Overwrite with loaded settings, ensuring all platforms are covered
    defaultTemplatesByPlatform = ALL_DEFINED_PLATFORMS_FOR_MANAGER.reduce((acc, platformId) => {
        acc[platformId] = loadedDefaults[platformId] || null;
        return acc;
    }, {} as Record<PlatformId, string | null>);
}

async function saveChanges() {
  if (!currentProps) {
    console.error("PlatformTemplateManager: Props not initialized, cannot save changes.");
    new Notice("错误：无法保存模板更改，请重试。");
    return;
  }
  
  new Notice("正在保存高级模板设置...", 3000); // Added: Saving notice with 3s duration

  currentProps.settings.customAdvancedTemplates = deepCopy(customTemplates);
  currentProps.settings.defaultAdvancedTemplates = deepCopy(defaultTemplatesByPlatform);
  try {
    await currentProps.onSettingsChange(currentProps.settings);
    console.log("Advanced templates and defaults saved to settings.");
    // new Notice("模板更改已保存。"); // Success notice handled by individual actions calling saveChanges
  } catch (error) {
    console.error("Failed to save advanced templates settings:", error);
    new Notice("保存模板设置失败，请查看控制台了解详情。");
    // Re-throw or handle more gracefully if needed, so calling functions know save failed.
    throw error; 
  }
}

function getAllTemplates(): AdvancedPromptTemplate[] {
  return [...ADVANCED_PLATFORM_TEMPLATES, ...customTemplates];
}

class ExportTemplatesModal extends Modal {
  jsonData: string;

  constructor(app: App, jsonData: string) {
    super(app);
    this.jsonData = jsonData;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '导出自定义模板' });
    contentEl.createEl('p', { text: '以下是您的自定义模板的 JSON 数据。请复制并保存到安全的地方。' });

    const textArea = new TextAreaComponent(contentEl)
      .setValue(this.jsonData)
      .setDisabled(true);
    textArea.inputEl.style.width = '100%';
    textArea.inputEl.style.minHeight = '200px';
    textArea.inputEl.style.fontFamily = 'monospace';

    new Setting(contentEl)
      .addButton(button => button
        .setButtonText('复制到剪贴板')
        .setCta()
        .onClick(() => {
          navigator.clipboard.writeText(this.jsonData).then(() => {
            new Notice('已复制到剪贴板！');
          }).catch(err => {
            new Notice('复制失败，请手动复制。');
            console.error('Failed to copy to clipboard:', err);
          });
        }))
      .addButton(button => button
        .setButtonText('关闭')
        .onClick(() => this.close()));
  }

  onClose() {
    this.contentEl.empty();
  }
}

// Helper function to process imported template data
export function processImportedTemplates(jsonData: string, existingTemplatesGetter: () => AdvancedPromptTemplate[]): {
  processedTemplates: AdvancedPromptTemplate[];
  errorMessages: string[];
  warningMessages: string[];
  successCount: number;
} {
  const processedTemplates: AdvancedPromptTemplate[] = [];
  const errorMessages: string[] = [];
  const warningMessages: string[] = [];
  let successCount = 0;

  if (!jsonData.trim()) {
    errorMessages.push('请输入 JSON 数据。');
    return { processedTemplates, errorMessages, warningMessages, successCount };
  }

  try {
    const parsedData = JSON.parse(jsonData);
    if (!Array.isArray(parsedData)) {
      errorMessages.push('导入失败：JSON 数据必须是一个数组。');
      return { processedTemplates, errorMessages, warningMessages, successCount };
    }

    const existingTemplates = existingTemplatesGetter(); // Get current templates for conflict checking

    for (const item of parsedData) {
      if (item && typeof item.id === 'string' && typeof item.name === 'string' && item.platform && item.systemPrompt) {
        let newId = item.id;
        let newName = item.name;
        
        if (existingTemplates.some(t => t.id === newId)) {
          newId = `${item.id}-imported-${Date.now()}`;
          newName = `${item.name} (导入)`;
          warningMessages.push(`模板 "${item.name}" (ID: ${item.id}) 已存在，已重命名为 "${newName}" (ID: ${newId})。`);
        }

        // Ensure all required fields are present and provide defaults for optional ones
        const templateToAdd: AdvancedPromptTemplate = {
          id: newId,
          name: newName,
          platform: item.platform as PlatformId, // Assume valid PlatformId for now, could add validation
          category: (item.category || 'custom') as PromptCategory,
          systemPrompt: item.systemPrompt,
          taskPrompt: item.taskPrompt || '', // Default to empty string if missing
          contextPrompt: item.contextPrompt || '',
          outputPrompt: item.outputPrompt || '',
          tags: Array.isArray(item.tags) ? item.tags : [],
          variables: Array.isArray(item.variables) ? item.variables : [],
          examples: Array.isArray(item.examples) ? item.examples : [],
          qualityRules: Array.isArray(item.qualityRules) ? item.qualityRules : [],
          antiAISettings: typeof item.antiAISettings === 'object' && item.antiAISettings !== null ? item.antiAISettings : { languageNaturalization: {enabled:false, sentenceVariation:{enabled:false,level:0,patterns:[]}, colloquialLevel:{enabled:false,intensity:0,targetExpressions:[]}, emotionalNuance:{enabled:false,depth:0,emotionalMarkers:[]}}, personalizationInjection:{enabled:false,userStyleMimicry:{enabled:false,styleProfile:{},adaptationLevel:0},personalExperience:{enabled:false,experienceLevel:0,contextualRelevance:0},uniquePerspective:{enabled:false,originalityLevel:0,viewpointDiversity:0}}, moderateImperfection:{enabled:false,minorInconsistency:{enabled:false,frequency:0,types:[]},naturalPauses:{enabled:false,frequency:0,pauseTypes:[]},colloquialErrors:{enabled:false,frequency:0,errorTypes:[]}} },
          version: item.version || '1.0.0',
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(), // Ensure valid date or create new
          updatedAt: new Date(),
          usageCount: typeof item.usageCount === 'number' ? item.usageCount : 0,
          description: item.description || '',
          performanceMetrics: item.performanceMetrics, // Can be undefined
        };
        processedTemplates.push(templateToAdd);
        successCount++;
      } else {
        warningMessages.push(`跳过无效的模板数据项: ${JSON.stringify(item).substring(0, 100)}...`);
      }
    }
  } catch (e: any) {
    errorMessages.push(`导入失败：JSON 解析错误或数据格式无效 (${e.message})。请检查控制台。`);
    console.error('Failed to parse or process imported JSON:', e);
  }
  return { processedTemplates, errorMessages, warningMessages, successCount };
}

class ImportTemplatesModal extends Modal {
  onSubmit: (templates: AdvancedPromptTemplate[]) => void;
  existingTemplatesGetter: () => AdvancedPromptTemplate[];

  constructor(app: App, existingTemplatesGetter: () => AdvancedPromptTemplate[], onSubmit: (templates: AdvancedPromptTemplate[]) => void) {
    super(app);
    this.onSubmit = onSubmit;
    this.existingTemplatesGetter = existingTemplatesGetter;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '导入自定义模板' });
    contentEl.createEl('p', { text: '在此处粘贴自定义模板的 JSON 数据。确保 JSON 是一个包含模板对象的数组。' });

    const textArea = new TextAreaComponent(contentEl);
    textArea.inputEl.style.width = '100%';
    textArea.inputEl.style.minHeight = '200px';
    textArea.inputEl.placeholder = `[
  {
    "id": "custom-example-1",
    "name": "我的导入模板",
    "platform": "blog",
    "category": "custom",
    "systemPrompt": "你是一个助手。",
    "taskPrompt": "写一篇关于...的文章",
    "contextPrompt": "使用以下信息：{context}",
    "outputPrompt": "以 Markdown 格式输出。"
    // ... other valid AdvancedPromptTemplate properties ...
  }
]`;

    new Setting(contentEl)
      .addButton(button => button
        .setButtonText('导入')
        .setCta()
        .onClick(() => {
          const jsonData = textArea.getValue();
          const { processedTemplates, errorMessages, warningMessages, successCount } = 
            processImportedTemplates(jsonData, this.existingTemplatesGetter);

          warningMessages.forEach(warn => new Notice(warn, 7000)); // Show warnings longer
          errorMessages.forEach(err => new Notice(err, 7000));

          if (successCount > 0) {
            this.onSubmit(processedTemplates);
            new Notice(`${successCount} 个模板已成功准备导入。`);
            this.close();
          } else if (errorMessages.length === 0 && warningMessages.length > 0 && processedTemplates.length === 0) {
            // Only warnings, no actual successes, no hard errors
            new Notice('没有模板被导入，但有一些警告。请检查您的数据。');
          } else if (errorMessages.length === 0 && processedTemplates.length === 0) {
             new Notice('没有从提供的 JSON 中找到有效的模板数据。');
          }
          // If there were errors, modal stays open for user to correct data or see console
        }))
      .addButton(button => button
        .setButtonText('取消')
        .onClick(() => this.close()));
  }

  onClose() {
    this.contentEl.empty();
  }
}

// This will manage the state and rendering for the platform template manager UI.
export function renderPlatformTemplateManager(containerEl: HTMLElement, props: PlatformTemplateManagerProps): void {
  initializeManagerState(props); // Load settings into module-level state
  
  containerEl.empty(); // Clear previous content
  containerEl.createEl('h2', { text: '平台模板管理 (Platform Template Manager)' });

  let selectedPlatform: PlatformId | 'all' = 'all';

  const platformOptions: Record<string, string> = { 'all': '所有平台' };
  const availablePlatforms = getAllTemplates().reduce((acc, tpl) => {
    if (tpl.platform && !acc.includes(tpl.platform)) {
      acc.push(tpl.platform);
    }
    return acc;
  }, [] as PlatformId[]);

  availablePlatforms.forEach(p => platformOptions[p] = p);

  new Setting(containerEl)
    .setName('选择平台')
    .setDesc('选择要管理的平台模板')
    .addDropdown((dropdown: DropdownComponent) => {
      dropdown
        .addOptions(platformOptions)
        .setValue(selectedPlatform)
        .onChange((value: PlatformId | 'all') => {
          selectedPlatform = value;
          renderTemplateList();
        });
    });

  const templateListContainer = containerEl.createDiv('template-list-container');

  function renderTemplateList() {
    templateListContainer.empty();
    const allCurrentTemplates = getAllTemplates(); 

    const templatesToShow = selectedPlatform === 'all' 
      ? allCurrentTemplates 
      : allCurrentTemplates.filter(t => t.platform === selectedPlatform);

    if (templatesToShow.length === 0) {
      templateListContainer.createEl('p', { text: '当前平台没有可用的模板。' });
    } else {
      templatesToShow.forEach(template => {
        const isCustom = customTemplates.some(ct => ct.id === template.id);
        const isBuiltIn = ADVANCED_PLATFORM_TEMPLATES.some(bt => bt.id === template.id);
        const isDefault = selectedPlatform !== 'all' && defaultTemplatesByPlatform[selectedPlatform] === template.id;

        const itemEl = templateListContainer.createDiv({ cls: 'template-item setting-item' });
        const nameEl = itemEl.createDiv({ cls: 'setting-item-info' });
        nameEl.createEl('span', { text: `${template.name} ${isDefault ? '(默认)' : ''}` });
        nameEl.createEl('small', { 
          text: `平台: ${template.platform} | 分类: ${template.category} ${isBuiltIn ? '(内置)' : ''} ${isCustom && !isBuiltIn ? '(自定义)' : ''}`,
          cls: 'setting-item-description' 
        });
        
        const controlsEl = itemEl.createDiv({ cls: 'setting-item-control' });

        if (selectedPlatform !== 'all') {
          new Setting(controlsEl)
            .addButton(button => button
              .setButtonText(isDefault ? '取消默认' : '设为默认')
              .setTooltip(isDefault ? '取消此模板作为当前平台的默认模板' : '将此模板设为当前平台的默认模板')
              .onClick(async () => {
                if (selectedPlatform !== 'all') { 
                  if (isDefault) {
                    defaultTemplatesByPlatform[selectedPlatform] = null;
                  } else {
                    defaultTemplatesByPlatform[selectedPlatform] = template.id;
                  }
                  await saveChanges(); 
                  renderTemplateList(); 
                  new Notice(`模板已${isDefault ? '取消' : '设为'}${selectedPlatform}平台的默认模板。`);
                }
              }));
        }

        if (isCustom) {
          new Setting(controlsEl)
            .addButton(button => button
              .setIcon('pencil')
              .setTooltip('编辑模板')
              .onClick(() => {
                const modal = new AdvancedPromptTemplateEditModal(props.app, deepCopy(template), async (updatedTemplate) => {
                  const index = customTemplates.findIndex(t => t.id === updatedTemplate.id);
                  if (index > -1) {
                    customTemplates[index] = updatedTemplate;
                  } else { 
                    customTemplates.push(updatedTemplate); 
                  }
                  await saveChanges();
                  renderTemplateList();
                  new Notice('模板已更新！');
                });
                modal.open();
              }));
          new Setting(controlsEl)
            .addButton(button => button
              .setIcon('trash')
              .setTooltip('删除模板')
              .setWarning()
              .onClick(async () => {
                if (await confirmModal(props.app, '确认删除', `您确定要删除模板 "${template.name}" 吗？此操作无法撤销。`)) {
                  customTemplates = customTemplates.filter(t => t.id !== template.id);
                  if (selectedPlatform !== 'all' && defaultTemplatesByPlatform[selectedPlatform] === template.id) {
                    defaultTemplatesByPlatform[selectedPlatform] = null;
                  }
                  await saveChanges();
                  renderTemplateList();
                  new Notice('模板已删除。');
                }
              }));
        } else if (isBuiltIn) {
          new Setting(controlsEl)
            .addButton(button => button
              .setIcon('copy')
              .setTooltip('复制为自定义模板')
              .onClick(async () => {
                const newCustomTemplate: AdvancedPromptTemplate = {
                  ...deepCopy(template),
                  id: `custom-${Date.now()}`,
                  name: `${template.name} (自定义副本)`,
                  category: 'custom' 
                };
                customTemplates.push(newCustomTemplate);
                await saveChanges();
                renderTemplateList();
                new Notice('模板已复制为自定义模板。');
              }));
        }
      });
    }
  }

  renderTemplateList();

  new Setting(containerEl)
    .setName('模板操作')
    .addButton(button => button
      .setButtonText('新增自定义模板')
      .setTooltip('创建并配置一个新的自定义平台 Prompt 模板')
      .setCta()
      .onClick(() => {
        new AdvancedPromptTemplateEditModal(props.app, null, async (newTemplate) => {
          customTemplates.push(newTemplate);
          await saveChanges();
          renderTemplateList();
          new Notice('自定义模板已添加！');
        }).open();
      }));

  const actionsContainer = containerEl.createDiv({ cls: 'template-actions-container setting-item' });
  const actionsControls = actionsContainer.createDiv({cls: 'setting-item-control'});

  // Export Button
  const exportButton = actionsControls.createEl('button', { text: '导出自定义模板'});
  exportButton.addClass('mod-cta'); // Optional: make it look like a primary button
  setTooltip(exportButton, '将所有自定义模板导出为 JSON 文件内容。');
  exportButton.addEventListener('click', () => {
    if (customTemplates.length === 0) {
      new Notice('没有可导出的自定义模板。');
      return;
    }
    const jsonData = JSON.stringify(customTemplates, null, 2);
    new ExportTemplatesModal(props.app, jsonData).open();
  });
  
  // Import Button
  const importButton = actionsControls.createEl('button', { text: '导入模板' });
  setTooltip(importButton, '从 JSON 数据导入自定义模板。');
  importButton.addEventListener('click', () => {
    // Pass getAllTemplates as the getter for existing templates
    new ImportTemplatesModal(props.app, getAllTemplates, async (importedTemplates) => {
      if (importedTemplates && importedTemplates.length > 0) {
        customTemplates.push(...importedTemplates);
        try {
          await saveChanges();
          new Notice('模板已成功导入并保存。');
        } catch (error) {
          new Notice('模板导入后保存失败，部分更改可能未生效。');
        }
        renderTemplateList(); // Refresh the list in the UI
      }
    }).open();
  });
  
  containerEl.createEl('p', {
    text: '提示: 内置模板只读。自定义模板和默认设置将保存到插件配置中。'
  }).setAttribute('style', 'font-size: var(--font-ui-small); color: var(--text-muted);');
}