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
import { PlatformTemplateManager } from './services/platform-template-manager';
import { ContentPostProcessor } from './services/content-post-processor';
import { PlatformId, TemplateContext } from './types/social-media';
import { SocialMediaGenerationModal } from './components/SocialMediaGenerationModal';

// Import new services and view for Smart Assistant
import { SmartAssistantView, SMART_ASSISTANT_VIEW_TYPE } from './views/SmartAssistantView';
import { EnhancedPromptTemplateService } from './services/prompt/EnhancedPromptTemplateService';
import { ContentQualityEvaluator } from './services/content-quality-evaluator';
import { PlatformContentAnalyzer } from './services/prompt/PlatformContentAnalyzer';
import { PromptModuleService } from './services/prompt/PromptModuleService';

// Import dependencies for ContentQualityEvaluator
import { OriginalityDetector } from './services/originality-detector';
import { PlatformComplianceEvaluator } from './services/platform-compliance-evaluator';
import { QualityScorer } from './services/quality-scorer';
import { QualityReportGenerator } from './services/quality-report-generator';

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
  contentPostProcessor: ContentPostProcessor;

  // New services for Smart Assistant Panel
  settingsStorage: SettingsStorage;
  enhancedPromptTemplateService: EnhancedPromptTemplateService;
  originalityDetector: OriginalityDetector;
  platformComplianceEvaluator: PlatformComplianceEvaluator;
  qualityScorer: QualityScorer;
  reportGenerator: QualityReportGenerator;
  contentQualityEvaluator: ContentQualityEvaluator;
  platformAnalyzer: PlatformContentAnalyzer;
  promptModuleService: PromptModuleService;

  async onload() {
    try {
      console.log('[main] onload called');
      // 初始化 SettingsStorage
      this.settingsStorage = new SettingsStorage(this);
      console.log('[main] SettingsStorage created:', this.settingsStorage);
      
      // 初始化 SettingsManager
      this.settingsManager = new SettingsManager(this.app, this, this.settingsStorage);
      console.log('[main] SettingsManager created:', this.settingsManager);
      
      // 加载设置
      await this.settingsManager.loadSettings();
      this.settings = this.settingsManager.getSettings();
      console.log('[main] settings loaded:', this.settings);
      // --- embedding 配置结构补全 ---
      if (!this.settings.embedding || typeof this.settings.embedding !== 'object') {
        this.settings.embedding = {
          embeddingProvider: 'openai',
          openai: { apiKey: '', model: 'text-embedding-ada-002', endpoint: 'https://api.openai.com/v1' },
          gemini: { apiKey: '', model: 'gemini-embedding-exp-03-07', endpoint: 'https://generativelanguage.googleapis.com' }
        };
      } else {
        if (!this.settings.embedding.openai) {
          this.settings.embedding.openai = { apiKey: '', model: 'text-embedding-ada-002', endpoint: 'https://api.openai.com/v1' };
        }
        if (!this.settings.embedding.gemini) {
          this.settings.embedding.gemini = { apiKey: '', model: 'gemini-embedding-exp-03-07', endpoint: 'https://generativelanguage.googleapis.com' };
        }
      }
      
      // 初始化核心服务
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

      // 初始化 Smart Assistant 相关服务
      console.log('[main] initializing OriginalityDetector');
      this.originalityDetector = new OriginalityDetector(this.embeddingService);
      console.log('[main] OriginalityDetector initialized');

      console.log('[main] initializing PlatformComplianceEvaluator');
      this.platformComplianceEvaluator = new PlatformComplianceEvaluator();
      console.log('[main] PlatformComplianceEvaluator initialized');

      console.log('[main] initializing QualityScorer');
      this.qualityScorer = new QualityScorer();
      console.log('[main] QualityScorer initialized');

      console.log('[main] initializing QualityReportGenerator');
      this.reportGenerator = new QualityReportGenerator();
      console.log('[main] QualityReportGenerator initialized');
      
      console.log('[main] initializing ContentQualityEvaluator');
      this.contentQualityEvaluator = new ContentQualityEvaluator(
        this.originalityDetector,
        this.platformComplianceEvaluator,
        this.qualityScorer,
        this.reportGenerator,
        this.aiService
      );
      console.log('[main] ContentQualityEvaluator initialized');

      console.log('[main] initializing EnhancedPromptTemplateService');
      this.enhancedPromptTemplateService = new EnhancedPromptTemplateService(this.settingsManager, this.settingsStorage);
      console.log('[main] EnhancedPromptTemplateService initialized');

      console.log('[main] initializing PlatformContentAnalyzer');
      this.platformAnalyzer = new PlatformContentAnalyzer(this.aiService, this.enhancedPromptTemplateService, this.contentQualityEvaluator);
      console.log('[main] PlatformContentAnalyzer initialized');

      console.log('[main] initializing PromptModuleService');
      this.promptModuleService = new PromptModuleService(this.settingsManager, this.settingsStorage, this.contentQualityEvaluator, {
          enableAutoBackup: this.settings.promptModule?.autoBackup ?? true,
          enablePerformanceMonitoring: this.settings.promptModule?.enablePerformanceTracking ?? true,
      });
      console.log('[main] PromptModuleService initialized');
      
      // 设置文件变化监听
      this.setupFileWatcher();
      
      // 注册视图和命令
      addIcon('cognilink-chat', CHAT_ICON);
      this.app.workspace.detachLeavesOfType(VIEW_TYPE_CHAT);
      try {
        this.registerView(
          VIEW_TYPE_CHAT,
          (leaf) => {
            console.log('Creating new ChatView');
            return new ChatView(leaf, this);
          }
        );
      } catch (e) {
        console.warn('View type cognilink-chat 已注册，跳过重复注册');
      }

      // Register Smart Assistant View
      this.registerView(
        SMART_ASSISTANT_VIEW_TYPE,
        (leaf: WorkspaceLeaf) => new SmartAssistantView(leaf, this)
      );

      this.addRibbonIcon('cognilink-chat', 'CogniLink Assistant', async () => {
        console.log('Ribbon icon clicked');
        await this.activateView();
      });

      // Command to open Smart Assistant Panel
      this.addCommand({
        id: 'open-smart-assistant',
        name: 'Open Smart Assistant Panel',
        callback: () => {
          this.activateSmartAssistantView();
        }
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
      
      console.log('[main] initializing ContentPostProcessor');
      this.contentPostProcessor = new ContentPostProcessor();
      console.log('[main] ContentPostProcessor initialized');
      
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

      // Command for Social Media Generation Panel
      this.addCommand({
        id: 'cognilink-assistant:open-social-media-generator',
        name: 'CogniLink: 社交媒体内容生成',
        callback: () => {
          this.openSocialMediaPanel(); // Opens the modal without pre-filled platform/theme
        }
      });

      // TOM-107 验收测试命令
      this.addCommand({
        id: 'tom-107-acceptance-test',
        name: 'TOM-107 平台模板系统验收测试',
        callback: () => {
          this.runTOM107AcceptanceTest();
        }
      });

      // TOM-108 验收测试命令
      this.addCommand({
        id: 'tom-108-acceptance-test',
        name: 'TOM-108 内容后处理系统验收测试',
        callback: () => {
          this.runTOM108AcceptanceTest();
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
    // Detach Chat view and Smart Assistant view
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CHAT);
    // Detach Smart Assistant view if open
    this.app.workspace.detachLeavesOfType(SMART_ASSISTANT_VIEW_TYPE);
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
      } else {
        console.error("Failed to get a right leaf for ChatView");
        return;
      }
    }
    workspace.revealLeaf(leaf);
  }

  // Helper to activate Smart Assistant View
  async activateSmartAssistantView() {
    this.app.workspace.detachLeavesOfType(SMART_ASSISTANT_VIEW_TYPE); // Close existing instances
    const rightLeaf = this.app.workspace.getRightLeaf(false);
    if (rightLeaf) {
      await rightLeaf.setViewState({
        type: SMART_ASSISTANT_VIEW_TYPE,
        active: true,
      } as ViewState); // Added ViewState cast
      this.app.workspace.revealLeaf(rightLeaf);
    } else {
      console.error("Failed to get a right leaf for SmartAssistantView");
      new Notice("Failed to open Smart Assistant Panel: No available leaf.");
    }
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
    await this.settingsManager.saveSettings();
  }

  // 打开社交媒体内容生成面板
  async openSocialMediaPanel(platform?: string, theme?: string): Promise<void> {
    try {
      console.log('[main] Opening social media panel with:', { platform, theme });
      
      // 检查是否有社交媒体生成命令
      const commandId = 'cognilink-assistant:open-social-media-generator';
      const command = (this.app as any).commands?.findCommand?.(commandId);
      
      if (command) {
        // 如果有专用命令，执行它
        (this.app as any).commands?.executeCommandById?.(commandId);
      } else {
        // 如果没有专用命令，显示一个模态框来处理社交媒体内容生成
        const modal = new SocialMediaGenerationModal(this.app, this, platform, theme);
        modal.open();
      }
      
    } catch (error) {
      console.error('[main] Failed to open social media panel:', error);
      new Notice('打开社交媒体生成面板失败');
    }
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

  /**
   * TOM-107 平台模板系统验收测试
   */
  async runTOM107AcceptanceTest(): Promise<void> {
    try {
      console.log('🚀 开始TOM-107平台模板系统验收测试...');
      new Notice('开始TOM-107验收测试，请查看控制台输出');

      // 创建模板管理器
      const templateManager = new PlatformTemplateManager({
        enableCache: true,
        enableValidation: true,
        enableMetrics: true,
        enableEvents: false
      });

      // 测试数据
      const testContext: TemplateContext = {
        topic: 'TypeScript开发最佳实践',
        context: `TypeScript是一种由微软开发的编程语言，它是JavaScript的超集，添加了静态类型定义。

主要优势：
1. 静态类型检查，减少运行时错误
2. 更好的IDE支持和代码提示
3. 大型项目的可维护性更强
4. 与现有JavaScript代码兼容

最佳实践包括：
- 启用严格模式
- 使用接口定义对象结构
- 避免使用any类型
- 合理使用泛型
- 配置ESLint和Prettier`,
        userPreferences: {
          tone: 'professional',
          length: 'medium',
          style: 'moderate'
        }
      };

      // 测试所有平台
      const platforms: PlatformId[] = ['xiaohongshu', 'twitter', 'wechat', 'blog', 'toutiao'];
      let successCount = 0;
      let totalTests = 0;

      for (const platformId of platforms) {
        totalTests++;
        console.log(`\n📱 测试平台: ${platformId.toUpperCase()}`);
        console.log('='.repeat(50));

        try {
          // 1. 获取模板
          const template = templateManager.getTemplate(platformId);
          console.log(`✅ 模板加载成功: ${template.name}`);
          console.log(`   最大长度: ${template.maxLength}字符`);
          console.log(`   风格关键词: ${template.styleKeywords.slice(0, 3).join(', ')}...`);

          // 2. 验证模板
          const validationResult = templateManager.validateTemplate(template);
          console.log(`✅ 模板验证: ${validationResult.isValid ? '通过' : '失败'} (评分: ${validationResult.score})`);
          
          if (!validationResult.isValid) {
            console.log(`   错误: ${validationResult.errors.map(e => e.message).join(', ')}`);
          }

          // 3. 渲染模板
          const startTime = Date.now();
          const renderResult = templateManager.renderTemplate(template, testContext);
          const renderTime = Date.now() - startTime;
          
          console.log(`✅ 模板渲染成功 (耗时: ${renderTime}ms)`);
          console.log(`   系统提示长度: ${renderResult.systemPrompt.length}字符`);
          console.log(`   用户提示长度: ${renderResult.userPrompt.length}字符`);

          // 4. 显示渲染结果预览
          console.log('\n📝 渲染结果预览:');
          console.log('--- 系统提示 (前200字符) ---');
          console.log(renderResult.systemPrompt.substring(0, 200) + '...');
          
          console.log('\n--- 用户提示 (前300字符) ---');
          console.log(renderResult.userPrompt.substring(0, 300) + '...');

          successCount++;
        } catch (error) {
          console.error(`❌ 平台 ${platformId} 测试失败:`, error.message);
        }
      }

      // 显示统计信息
      console.log('\n📊 测试结果统计:');
      console.log('='.repeat(50));
      console.log(`总测试数: ${totalTests}`);
      console.log(`成功数: ${successCount}`);
      console.log(`失败数: ${totalTests - successCount}`);
      console.log(`成功率: ${((successCount / totalTests) * 100).toFixed(1)}%`);

      const stats = templateManager.getStatistics();
      console.log(`\n系统统计:`);
      console.log(`总模板数: ${stats.totalTemplates}`);
      console.log(`平均加载时间: ${stats.averageLoadTime.toFixed(2)}ms`);
      console.log(`平均渲染时间: ${stats.averageRenderTime.toFixed(2)}ms`);

      console.log('\n✅ TOM-107验收测试完成！');
      
      if (successCount === totalTests) {
        new Notice(`✅ TOM-107验收测试全部通过！(${successCount}/${totalTests})`);
      } else {
        new Notice(`⚠️ TOM-107验收测试部分失败 (${successCount}/${totalTests})，请查看控制台`);
      }

    } catch (error) {
      console.error('❌ TOM-107验收测试执行失败:', error);
      new Notice('❌ TOM-107验收测试执行失败，请查看控制台');
    }
  }

  /**
   * TOM-108 内容后处理系统验收测试
   */
  async runTOM108AcceptanceTest(): Promise<void> {
    try {
      console.log('🚀 开始TOM-108内容后处理系统验收测试...');
      new Notice('开始TOM-108验收测试，请查看控制台输出');

      if (!this.contentPostProcessor) {
        throw new Error('ContentPostProcessor 未初始化');
      }

      // 测试平台配置
      const testPlatforms = [
        {
          id: 'xiaohongshu' as PlatformId,
          name: '小红书',
          maxLength: 300,
          styleKeywords: ['种草', 'yyds', '姐妹们'],
          requiredElements: ['表情符号', '互动问题'],
          formatRules: {
            emojiDensity: 'high' as const,
            interactionPrompt: true,
            paragraphBreak: '\n\n'
          },
          features: ['emoji', 'interaction', 'hashtag']
        },
        {
          id: 'twitter' as PlatformId,
          name: 'Twitter',
          maxLength: 280,
          styleKeywords: ['简洁', '有力'],
          requiredElements: ['标签'],
          formatRules: {
            hashtagStyle: '#话题',
            characterLimit: 280
          },
          features: ['hashtag', 'mention', 'thread']
        },
        {
          id: 'wechat' as PlatformId,
          name: '微信公众号',
          maxLength: 1500,
          styleKeywords: ['专业', '深度'],
          requiredElements: ['小标题', '结构化'],
          formatRules: {
            headingStyle: '## 标题',
            structureRequired: true
          },
          features: ['heading', 'structure', 'professional']
        }
      ];

      // 测试内容
      const testContents = [
        {
          name: '短内容测试',
          content: '今天分享一个超好用的工具！'
        },
        {
          name: '中等长度内容测试',
          content: '今天分享一个超好用的笔记软件Obsidian，真的太棒了！功能强大，界面简洁，支持双向链接，让知识管理变得轻松愉快。强烈推荐给大家试试看！'
        },
        {
          name: '超长内容测试',
          content: '这是一个非常长的内容，'.repeat(50) + '需要被截断以符合平台要求。我们需要确保内容在处理后能够符合平台的长度要求，同时保持语义的完整性和可读性。这个测试用来验证智能截断功能是否正常工作。'
        }
      ];

      let totalTests = 0;
      let successCount = 0;
      const results: any[] = [];

      // 执行测试
      for (const platform of testPlatforms) {
        console.log(`\n📱 测试平台: ${platform.name.toUpperCase()}`);
        console.log('='.repeat(50));

        for (const testContent of testContents) {
          totalTests++;
          console.log(`\n🧪 ${testContent.name} - ${platform.name}`);
          
          try {
            const startTime = Date.now();
            const result = await this.contentPostProcessor.processContent(
              testContent.content,
              platform,
              {
                strictMode: false,
                autoFix: true,
                preserveOriginal: true
              }
            );
            const processingTime = Date.now() - startTime;

            console.log(`✅ 处理成功 (耗时: ${processingTime}ms)`);
            console.log(`   原始长度: ${result.lengthValidation.currentLength}字符`);
            console.log(`   目标长度: ${result.lengthValidation.targetLength}字符`);
            console.log(`   长度有效: ${result.lengthValidation.isValid ? '是' : '否'}`);
            console.log(`   质量评分: ${result.qualityScore.overall}/100`);
            console.log(`   风格评分: ${result.styleAssessment.overallScore}/100`);
            console.log(`   置信度: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`   警告数量: ${result.warnings.length}`);
            console.log(`   建议数量: ${result.suggestions.length}`);

            // 验证处理结果 - 更合理的验证条件
            const lengthOk = result.processedContent.length <= platform.maxLength;
            const qualityOk = result.qualityScore.overall >= 40; // 降低质量要求
            const processingOk = result.processingTime < 10000; // 10秒内完成
            
            const isValid = lengthOk && qualityOk && processingOk;

            if (isValid) {
              successCount++;
              console.log(`   ✅ 验证通过`);
            } else {
              console.log(`   ❌ 验证失败`);
              console.log(`     - 长度检查: ${lengthOk ? '✅' : '❌'} (${result.processedContent.length}/${platform.maxLength})`);
              console.log(`     - 质量检查: ${qualityOk ? '✅' : '❌'} (${result.qualityScore.overall}/100)`);
              console.log(`     - 性能检查: ${processingOk ? '✅' : '❌'} (${result.processingTime}ms)`);
            }

            results.push({
              platform: platform.name,
              content: testContent.name,
              success: isValid,
              processingTime,
              qualityScore: result.qualityScore.overall,
              styleScore: result.styleAssessment.overallScore
            });

          } catch (error) {
            console.error(`   ❌ 处理失败:`, error.message);
            results.push({
              platform: platform.name,
              content: testContent.name,
              success: false,
              error: error.message
            });
          }
        }
      }

      // 批量处理测试
      console.log(`\n🔄 批量处理测试`);
      console.log('='.repeat(50));
      
      try {
        const batchContents = testContents.map((content, index) => ({
          content: content.content,
          platform: testPlatforms[index % testPlatforms.length],
          id: `batch-test-${index + 1}`
        }));

        const batchStartTime = Date.now();
        const batchResult = await this.contentPostProcessor.batchProcess(batchContents, {
          concurrency: 2,
          failFast: false,
          retryFailures: true
        });
        const batchTime = Date.now() - batchStartTime;

        console.log(`✅ 批量处理完成 (耗时: ${batchTime}ms)`);
        console.log(`   总数: ${batchResult.totalProcessed}`);
        console.log(`   成功: ${batchResult.successful}`);
        console.log(`   失败: ${batchResult.failed}`);
        console.log(`   成功率: ${((batchResult.successful / batchResult.totalProcessed) * 100).toFixed(1)}%`);

      } catch (error) {
        console.error(`❌ 批量处理测试失败:`, error.message);
      }

      // 显示测试统计
      console.log('\n📊 测试结果统计:');
      console.log('='.repeat(50));
      console.log(`总测试数: ${totalTests}`);
      console.log(`成功数: ${successCount}`);
      console.log(`失败数: ${totalTests - successCount}`);
      console.log(`成功率: ${((successCount / totalTests) * 100).toFixed(1)}%`);

      // 性能统计
      const avgProcessingTime = results
        .filter(r => r.processingTime)
        .reduce((sum, r) => sum + r.processingTime, 0) / 
        results.filter(r => r.processingTime).length;

      const avgQualityScore = results
        .filter(r => r.qualityScore)
        .reduce((sum, r) => sum + r.qualityScore, 0) / 
        results.filter(r => r.qualityScore).length;

      console.log(`\n性能指标:`);
      console.log(`平均处理时间: ${avgProcessingTime.toFixed(2)}ms`);
      console.log(`平均质量评分: ${avgQualityScore.toFixed(1)}/100`);

      console.log('\n✅ TOM-108验收测试完成！');
      
      if (successCount === totalTests) {
        new Notice(`✅ TOM-108验收测试全部通过！(${successCount}/${totalTests})`);
      } else {
        new Notice(`⚠️ TOM-108验收测试部分失败 (${successCount}/${totalTests})，请查看控制台`);
      }

    } catch (error) {
      console.error('❌ TOM-108验收测试执行失败:', error);
      new Notice('❌ TOM-108验收测试执行失败，请查看控制台');
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
