import { Plugin, Notice, addIcon, WorkspaceLeaf, ViewState } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS, DEFAULT_PROMPT_TEMPLATES } from './types/settings';
import { SettingsTab } from './components/SettingsTab';
import { SettingsManager } from './services/SettingsManager';
import { SettingsStorage } from './services/SettingsStorage';
import { ChatView } from './components/ChatView';
import { ChatManager } from './services/ChatManager';
import { KeyboardManager } from './services/KeyboardManager';
import { AccessibilityManager } from './services/AccessibilityManager';
import { EmbeddingService } from './services/EmbeddingService';
import { AIService } from './services/AIService';
import { NoteMetaService } from './services/NoteMetaService';
import { ThemeInputModal } from './components/ThemeInputModal';
import { MarkdownView, TFile, Modal, App } from 'obsidian';
import { RAGService } from './services/RAGService';
import { RAGResultModal } from './components/RAGResultModal';
import { PromptTemplateService } from './services/PromptTemplateService';

// Define the chat icon
const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
</svg>`;

export const VIEW_TYPE_CHAT = 'cognilink-chat';

export default class CogniLinkPlugin extends Plugin {
  settings: PluginSettings;
  settingsManager: SettingsManager;
  chatManager: ChatManager;
  keyboardManager: KeyboardManager;
  accessibilityManager: AccessibilityManager;
  embeddingService: EmbeddingService;
  aiService: AIService;
  ragService: RAGService;

  async onload() {
    try {
      console.log('[main] onload called');
      // 初始化 SettingsStorage
      const storage = new SettingsStorage(this);
      console.log('[main] SettingsStorage created:', storage);
      // 初始化 SettingsManager
      this.settingsManager = new SettingsManager(this.app, this, storage);
      console.log('[main] SettingsManager created:', this.settingsManager);
      // 加载设置
      await this.settingsManager.loadSettings();
      this.settings = this.settingsManager.getSettings();
      console.log('[main] settings loaded:', this.settings);
      // 初始化服务
      console.log('[main] initializing EmbeddingService');
      this.embeddingService = new EmbeddingService(this);
      console.log('[main] EmbeddingService initialized');
      console.log('[main] initializing AIService');
      this.aiService = new AIService(this);
      console.log('[main] AIService initialized');
      console.log('[main] initializing ChatManager');
      this.chatManager = new ChatManager(this);
      console.log('[main] ChatManager initialized');
      console.log('[main] initializing KeyboardManager');
      this.keyboardManager = new KeyboardManager(this.app, this);
      console.log('[main] KeyboardManager initialized');
      console.log('[main] initializing AccessibilityManager');
      this.accessibilityManager = new AccessibilityManager(this.app, this);
      console.log('[main] AccessibilityManager initialized');
      // 注册视图和命令
      addIcon('cognilink-chat', CHAT_ICON);
      this.registerView(
        VIEW_TYPE_CHAT,
        (leaf) => {
          console.log('Creating new ChatView');
          return new ChatView(leaf, this);
        }
      );
      this.addRibbonIcon('cognilink-chat', 'CogniLink Assistant', async () => {
        console.log('Ribbon icon clicked');
        await this.activateView();
      });
      this.addCommand({
        id: 'toggle-cognilink-chat',
        name: 'Toggle CogniLink Chat',
        callback: () => {
          console.log('Toggle chat command triggered');
          this.activateView();
        },
        hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'c' }],
      });

      this.addCommand({
        id: 'test-note-meta',
        name: '测试笔记元数据解析',
        callback: async () => {
          const service = new NoteMetaService(this.app);
          const notes = await service.getAllNotesMeta();
          new Notice(`共解析到 ${notes.length} 个笔记`);
          console.log('NoteMetaService 测试结果:', notes);
        }
      });

      console.log('Registering plugin commands...');
      this.addCommand({
        id: 'start-new-chat',
        name: '新建聊天',
        callback: () => {
          this.chatManager?.startNewChat?.();
        }
      });
      this.addCommand({
        id: 'clear-chat-history',
        name: '清空聊天记录',
        callback: () => {
          this.chatManager?.clearChat?.();
        }
      });
      this.addCommand({
        id: 'copy-last-message',
        name: '复制最后一条消息',
        callback: () => {
          this.chatManager?.copyLastMessage?.();
        }
      });
      this.addCommand({
        id: 'check-originality',
        name: '检查原创性',
        callback: () => {
          // TODO: 调用原创性检测服务
          new Notice('原创性检测功能开发中');
        }
      });
      this.addCommand({
        id: 'generate-original-doc-from-theme',
        name: '主题驱动原创文档生成',
        callback: () => {
          this.showThemeInputModal();
        },
        hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'g' }],
      });
      // 编辑区右键菜单入口
      this.addCommand({
        id: 'generate-original-doc-from-selection',
        name: '以选中文本为主题生成原创文档',
        editorCallback: (editor) => {
          const selected = editor.getSelection();
          this.showThemeInputModal(selected);
        },
      });
      // Ribbon 工具栏按钮也支持主题生成
      this.addRibbonIcon('cognilink-chat', 'CogniLink Assistant', async () => {
        this.showThemeInputModal();
      });
      console.log('Plugin commands registered.');

      // 注册 SettingsTab 必须在 settings 加载后
      this.addSettingTab(new SettingsTab(this.app, this));
      console.log('[main] SettingsTab added');
      // 自动保存一次设置，确保 data.json 自动生成
      await this.settingsManager.saveSettings();
      // Initialize the view
      this.app.workspace.onLayoutReady(() => {
        console.log('Layout ready, initializing leaf');
        this.initLeaf();
      });
      console.log('CogniLink plugin loaded successfully');
      new Notice('CogniLink 插件已加载');

      this.ragService = new RAGService(this.embeddingService, this.aiService);
      // @ts-expect-error: Obsidian 插件全局挂载 ragService 实例，类型检查可忽略
      window.ragService = this.ragService;
      // @ts-expect-error: Obsidian 插件全局挂载 RAGService 类，便于控制台 new
      window.RAGService = RAGService;
      // @ts-expect-error: Obsidian 插件全局挂载 plugin 实例，便于控制台调试
      window.plugin = this;
      // 注册 RAG 结果展示命令
      this.addCommand({
        id: 'show-rag-result-modal',
        name: '智能检索与内容整合',
        callback: () => {
          new RAGResultModal(this.app, this.ragService).open();
        }
      });
    } catch (error) {
      console.error('[main] onload error:', error);
      new Notice('CogniLink 插件加载失败: ' + error.message);
      throw error;
    }
  }

  async onunload() {
    console.log('Unloading CogniLink plugin...');
    if (this.keyboardManager) {
      this.keyboardManager.unregisterScope();
    }
    if (this.accessibilityManager) {
      this.accessibilityManager.cleanup();
    }
    new Notice('CogniLink 插件已卸载');
  }

  async activateView() {
    const { workspace } = this.app;
    
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_CHAT)[0];
    
    if (!leaf) {
      const newLeaf = workspace.getRightLeaf(false);
      if (newLeaf) {
        await newLeaf.setViewState({ type: VIEW_TYPE_CHAT });
        leaf = newLeaf;
      }
    }
    
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
    
    // 更新可访问性状态
    this.accessibilityManager.updateAccessibility();
  }

  async initLeaf() {
    const { workspace } = this.app;
    
    // Check if view already exists
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_CHAT)[0];
    
    if (!leaf) {
      // Create leaf in left sidebar
      const newLeaf = workspace.getLeftLeaf(false);
      if (newLeaf) {
        await newLeaf.setViewState({
          type: VIEW_TYPE_CHAT,
          active: true,
        } as ViewState);
      }
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // 主题输入弹窗（Modal）入口，集成生成与预览插入主流程
  showThemeInputModal(selectedText?: string) {
    const initialTheme = selectedText || '';
    new ThemeInputModal({
      app: this.app,
      initialTheme,
      onSubmit: async (theme, includeContext, close, setLoading, setError) => {
        try {
          setLoading(true);
          let context = '';
          if (includeContext) {
            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView) {
              context = activeView.editor.getValue();
            }
          }
          const relatedNotes = await this.embeddingService.findRelevantNotes(theme, 5);
          const ragContext = relatedNotes.map(n => `【${n.title}】\n${n.content}`).join('\n\n');
          const finalContext = (context ? context + '\n\n' : '') + ragContext;
          // === 新增：Prompt 模板渲染 ===
          const rag = this.settings.rag ?? (this.settings.rag = {});
          const promptService = new PromptTemplateService(
            rag.promptTemplates || DEFAULT_PROMPT_TEMPLATES,
            rag.defaultPromptTemplateId || 'default'
          );
          const template = promptService.getDefault();
          const prompt = promptService.render(template, {
            theme,
            context: finalContext,
            pinned: '' // 可后续支持钉住内容
          });
          const result = await this.aiService.generateOriginalDoc(theme, prompt);
          setLoading(false);
          close();
          new PreviewModal(this.app, result, (finalContent, insertToNewNote) => {
            if (insertToNewNote) {
              this.insertToNewNote(finalContent, theme);
            } else {
              this.insertToCurrentNote(finalContent);
            }
          }).open();
        } catch (e) {
          setLoading(false);
          setError(e?.message || '生成失败，请重试');
        }
      }
    }).open();
  }

  // 插入到当前笔记
  insertToCurrentNote(content: string) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view) {
      const editor = view.editor;
      editor.replaceSelection(content);
      new Notice('已插入到当前笔记');
    } else {
      new Notice('未找到可用的 Markdown 编辑器');
    }
  }

  // 插入到新建笔记
  async insertToNewNote(content: string, theme: string) {
    const file = await this.app.vault.create(`${theme || '原创文档'}-${Date.now()}.md`, content);
    await this.app.workspace.getLeaf(true).openFile(file as TFile);
    new Notice('已插入到新建笔记');
  }
}

// 生成结果预览 Modal
class PreviewModal extends Modal {
  private content: string;
  private onInsert: (content: string, insertToNewNote: boolean) => void;
  private textarea: HTMLTextAreaElement;
  constructor(app: App, content: string, onInsert: (content: string, insertToNewNote: boolean) => void) {
    super(app);
    this.content = content;
    this.onInsert = onInsert;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '生成结果预览' });
    this.textarea = contentEl.createEl('textarea');
    this.textarea.style.width = '100%';
    this.textarea.style.height = '300px';
    this.textarea.value = this.content;
    // 按钮区
    const btnRow = contentEl.createDiv({ cls: 'theme-modal-btn-row' });
    const insertBtn = btnRow.createEl('button', { text: '插入到当前笔记', cls: 'mod-cta' });
    insertBtn.onclick = () => {
      this.onInsert(this.textarea.value, false);
      this.close();
    };
    const newNoteBtn = btnRow.createEl('button', { text: '插入到新建笔记' });
    newNoteBtn.onclick = () => {
      this.onInsert(this.textarea.value, true);
      this.close();
    };
    const cancelBtn = btnRow.createEl('button', { text: '取消' });
    cancelBtn.onclick = () => this.close();
  }
}

// 使用 CommonJS 导出以确保 Obsidian 能加载插件
module.exports = CogniLinkPlugin;
