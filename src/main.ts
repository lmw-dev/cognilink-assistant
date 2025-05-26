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
import { OriginalityService, OriginalityResult } from './services/OriginalityService';

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
      
      // 设置文件变化监听
      this.setupFileWatcher();
      
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
      onSubmit: async (theme, includeContext, close, setLoading, setError, mode = 'smart') => {
        try {
          setLoading(true);
          let context = '';
          if (includeContext) {
            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView) {
              context = activeView.editor.getValue();
            }
          }
          if (mode === 'fast') {
            // 极速生成：只用 LLM
            const result = await this.aiService.generateOriginalDoc(theme, context);
            setLoading(false);
            close();
            new PreviewModal(this.app, result, (content, insertToNewNote) => {
              if (insertToNewNote) {
                this.app.vault.create('新建原创文档.md', content);
              } else {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (activeView) {
                  activeView.editor.replaceRange(content, activeView.editor.getCursor());
                }
              }
            }, []).open();
          } else {
            // 智能生成：embedding 检索+引用
            const relatedNotes = await this.embeddingService.findRelevantNotes(theme, 8);
            const ragContext = relatedNotes.map((n, i) => `【${i + 1}】${n.content}`).join('\n\n');
            const sourceList = relatedNotes.map((n, i) => `[${i + 1}] ${n.title} (obsidian://open?path=${encodeURIComponent(n.path)})`);
            const finalContext = (context ? context + '\n\n' : '') + ragContext;
            // === Prompt 模板渲染，要求 LLM 按 [n] 引用 ===
            const rag = this.settings.rag ?? (this.settings.rag = {});
            const promptService = new PromptTemplateService(
              rag.promptTemplates || DEFAULT_PROMPT_TEMPLATES,
              rag.defaultPromptTemplateId || 'default'
            );
            const template = promptService.getDefault();
            const prompt = `${promptService.render(template, {
              theme,
              context: finalContext,
              pinned: ''
            })}\n\n请在正文引用相关内容时加上对应的 [n] 编号，文末不需要重复列出来源。`;
            const result = await this.aiService.generateOriginalDoc(theme, prompt);
            setLoading(false);
            close();
            new PreviewModal(this.app, result, (content, insertToNewNote) => {
              if (insertToNewNote) {
                this.app.vault.create('新建原创文档.md', content);
              } else {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (activeView) {
                  activeView.editor.replaceRange(content, activeView.editor.getCursor());
                }
              }
            }, sourceList).open();
          }
        } catch (e: any) {
          setError(e?.message || '生成失败');
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

  /**
   * 设置文件变化监听
   */
  private setupFileWatcher(): void {
    console.log('[main] 设置文件变化监听');
    
    // 监听文件创建
    this.registerEvent(
      this.app.vault.on('create', async (file) => {
        if (file instanceof TFile && file.extension === 'md') {
          console.log(`[FileWatcher] 检测到新文件: ${file.path}`);
          await this.handleFileChange(file, 'create');
        }
      })
    );

    // 监听文件修改
    this.registerEvent(
      this.app.vault.on('modify', async (file) => {
        if (file instanceof TFile && file.extension === 'md') {
          console.log(`[FileWatcher] 检测到文件修改: ${file.path}`);
          await this.handleFileChange(file, 'modify');
        }
      })
    );

    // 监听文件删除
    this.registerEvent(
      this.app.vault.on('delete', async (file) => {
        if (file instanceof TFile && file.extension === 'md') {
          console.log(`[FileWatcher] 检测到文件删除: ${file.path}`);
          await this.handleFileChange(file, 'delete');
        }
      })
    );

    // 监听文件重命名
    this.registerEvent(
      this.app.vault.on('rename', async (file, oldPath) => {
        if (file instanceof TFile && file.extension === 'md') {
          console.log(`[FileWatcher] 检测到文件重命名: ${oldPath} -> ${file.path}`);
          await this.handleFileChange(file, 'rename', oldPath);
        }
      })
    );
  }

  /**
   * 处理文件变化
   */
  private async handleFileChange(file: TFile, action: 'create' | 'modify' | 'delete' | 'rename', oldPath?: string): Promise<void> {
    try {
      // 检查是否启用 RAG 功能
      if (!this.settings.rag || !this.embeddingService) {
        return;
      }

      switch (action) {
        case 'create':
        case 'modify':
          // 延迟处理，避免频繁的文件修改触发过多更新
          setTimeout(async () => {
            try {
              const content = await this.app.vault.read(file);
              let tags: string[] = [];
              try {
                const meta = this.app.metadataCache.getFileCache(file);
                tags = (meta?.tags ?? []).map(t => t.tag);
              } catch { /* 忽略元数据异常 */ }

              const note = {
                title: file.basename,
                content,
                link: `obsidian://open?vault=${encodeURIComponent(this.app.vault.getName())}&file=${encodeURIComponent(file.path)}`,
                path: file.path,
                tags,
                updated: file.stat.mtime,
              };

              await this.embeddingService.updateEmbedding(note);
              console.log(`[FileWatcher] 已更新 embedding: ${file.path}`);
            } catch (error) {
              console.error(`[FileWatcher] 更新 embedding 失败: ${file.path}`, error);
            }
          }, 1000); // 延迟1秒处理
          break;

        case 'delete':
          // 从缓存中删除对应的 embedding
          await this.embeddingService.removeEmbedding(file.path);
          console.log(`[FileWatcher] 已删除 embedding: ${file.path}`);
          break;

        case 'rename':
          if (oldPath) {
            // 删除旧路径的 embedding，添加新路径的 embedding
            await this.embeddingService.removeEmbedding(oldPath);
            
            const content = await this.app.vault.read(file);
            let tags: string[] = [];
            try {
              const meta = this.app.metadataCache.getFileCache(file);
              tags = (meta?.tags ?? []).map(t => t.tag);
            } catch { /* 忽略元数据异常 */ }

            const note = {
              title: file.basename,
              content,
              link: `obsidian://open?vault=${encodeURIComponent(this.app.vault.getName())}&file=${encodeURIComponent(file.path)}`,
              path: file.path,
              tags,
              updated: file.stat.mtime,
            };

            await this.embeddingService.updateEmbedding(note);
            console.log(`[FileWatcher] 已重命名 embedding: ${oldPath} -> ${file.path}`);
          }
          break;
      }
    } catch (error) {
      console.error(`[FileWatcher] 处理文件变化失败: ${file.path}`, error);
    }
  }
}

// 生成结果预览 Modal
class PreviewModal extends Modal {
  private content: string;
  private onInsert: (content: string, insertToNewNote: boolean) => void;
  private originalityService: OriginalityService;
  private originalityResults: OriginalityResult[] = [];
  private onlyShowHighlight: boolean = false;
  private threshold: number;
  private granularity: 'paragraph' | 'sentence';
  private sources: string[];
  constructor(app: App, content: string, onInsert: (content: string, insertToNewNote: boolean) => void, sources: string[] = []) {
    super(app);
    this.content = content;
    this.onInsert = onInsert;
    this.sources = sources;
    // 获取依赖
    const plugin = (window as any).plugin;
    this.originalityService = new OriginalityService(plugin.embeddingService);
    const settings = plugin.settings;
    this.threshold = settings.rag?.originality?.threshold ?? 0.8;
    this.granularity = settings.rag?.originality?.granularity ?? 'paragraph';
  }
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '生成结果预览' });
    // 检测区
    const originalityDiv = contentEl.createDiv({ cls: 'originality-check-bar' });
    const checkBtn = originalityDiv.createEl('button', { text: '重新检测' });
    const toggleBtn = originalityDiv.createEl('button', { text: '只看高亮' });
    let infoSpan = originalityDiv.createEl('span', { text: '' });
    checkBtn.onclick = async () => {
      infoSpan.textContent = '检测中...';
      await this.runOriginalityCheck();
      infoSpan.textContent = `检测完成，共${this.originalityResults.filter(r => r.similarity >= this.threshold).length}段高亮`;
      this.renderContent();
    };
    toggleBtn.onclick = () => {
      this.onlyShowHighlight = !this.onlyShowHighlight;
      toggleBtn.textContent = this.onlyShowHighlight ? '显示全部' : '只看高亮';
      this.renderContent();
    };
    // 检测并渲染
    infoSpan.textContent = '检测中...';
    await this.runOriginalityCheck();
    infoSpan.textContent = `检测完成，共${this.originalityResults.filter(r => r.similarity >= this.threshold).length}段高亮`;
    this.renderContent();
    // 按钮区
    const btnRow = contentEl.createDiv({ cls: 'theme-modal-btn-row' });
    const insertBtn = btnRow.createEl('button', { text: '插入到当前笔记', cls: 'mod-cta' });
    insertBtn.onclick = () => {
      // 拼接当前高亮内容插入
      const text = this.originalityResults.map(r => r.text).join(this.granularity === 'sentence' ? '' : '\n\n');
      this.onInsert(text, false);
      this.close();
    };
    const newNoteBtn = btnRow.createEl('button', { text: '插入到新建笔记' });
    newNoteBtn.onclick = () => {
      const text = this.originalityResults.map(r => r.text).join(this.granularity === 'sentence' ? '' : '\n\n');
      this.onInsert(text, true);
      this.close();
    };
    const cancelBtn = btnRow.createEl('button', { text: '取消' });
    cancelBtn.onclick = () => this.close();
  }
  async runOriginalityCheck() {
    // 按粒度切分
    let segments: string[];
    if (this.granularity === 'sentence') {
      segments = this.content.split(/(?<=[。！？.!?])\s*/).map(t => t.trim()).filter(Boolean);
    } else {
      segments = this.content.split(/\n{2,}/).map(t => t.trim()).filter(Boolean);
    }
    this.originalityResults = await this.originalityService.checkOriginality(this.content, this.threshold);
  }
  renderContent() {
    const { contentEl } = this;
    // 移除旧的高亮区块
    contentEl.querySelectorAll('.originality-preview').forEach(el => el.remove());
    let displayResults = this.originalityResults;
    if (this.onlyShowHighlight) {
      displayResults = displayResults.filter(r => r.similarity >= this.threshold);
    }
    const previewDiv = contentEl.createDiv({ cls: 'originality-preview' });
    previewDiv.style.background = '#f8fafc';
    previewDiv.style.border = '1px solid #e5e7eb';
    previewDiv.style.borderRadius = '8px';
    previewDiv.style.padding = '12px';
    previewDiv.style.marginTop = '10px';
    previewDiv.style.maxHeight = '260px';
    previewDiv.style.overflow = 'auto';
    previewDiv.style.fontSize = '1em';
    displayResults.forEach((r, idx) => {
      const para = previewDiv.createDiv();
      para.style.whiteSpace = 'pre-line';
      para.style.margin = '6px 0';
      para.textContent = r.text;
      if (r.similarity >= this.threshold) {
        para.style.background = '#fef3c7';
        para.style.borderRadius = '4px';
        para.style.position = 'relative';
        para.style.cursor = 'pointer';
        para.onmouseenter = () => {
          para.style.background = '#fde68a';
        };
        para.onmouseleave = () => {
          para.style.background = '#fef3c7';
        };
        para.onclick = (e) => {
          new Notice(`相似度：${(r.similarity * 100).toFixed(1)}%，来源：${r.sourceTitle}`);
        };
        para.setAttr('title', `相似度：${(r.similarity * 100).toFixed(1)}%，来源：${r.sourceTitle}`);
      }
    });
  }
}
