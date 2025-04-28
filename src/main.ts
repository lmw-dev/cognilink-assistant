import { Plugin, Notice, addIcon, WorkspaceLeaf, ViewState } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from './types/settings';
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

  async onload() {
    try {
      console.log('CogniLink plugin loading...');
      
      // Initialize settings first
      const storage = new SettingsStorage(this);
      this.settingsManager = new SettingsManager(this.app, this, storage);
      await this.settingsManager.loadSettings();
      this.settings = this.settingsManager.getSettings();
      console.log('Settings loaded:', this.settings);

      // Initialize services one by one with error handling
      try {
        this.embeddingService = new EmbeddingService(this);
        console.log('EmbeddingService initialized');
      } catch (error) {
        console.error('Failed to initialize EmbeddingService:', error);
      }

      try {
        this.aiService = new AIService(this);
        console.log('AIService initialized');
      } catch (error) {
        console.error('Failed to initialize AIService:', error);
      }

      try {
        this.chatManager = new ChatManager(this);
        console.log('ChatManager initialized');
      } catch (error) {
        console.error('Failed to initialize ChatManager:', error);
      }

      try {
        this.keyboardManager = new KeyboardManager(this.app, this);
        console.log('KeyboardManager initialized');
      } catch (error) {
        console.error('Failed to initialize KeyboardManager:', error);
      }

      try {
        this.accessibilityManager = new AccessibilityManager(this.app, this);
        console.log('AccessibilityManager initialized');
      } catch (error) {
        console.error('Failed to initialize AccessibilityManager:', error);
      }

      // Register views and commands
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
      console.log('Plugin commands registered.');

      // 注册 SettingsTab 必须在 settings 加载后
      this.addSettingTab(new SettingsTab(this.app, this));

      // Initialize the view
      this.app.workspace.onLayoutReady(() => {
        console.log('Layout ready, initializing leaf');
        this.initLeaf();
      });

      console.log('CogniLink plugin loaded successfully');
      new Notice('CogniLink 插件已加载');
    } catch (error) {
      console.error('Failed to load CogniLink plugin:', error);
      new Notice('CogniLink 插件加载失败');
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
}
