import { Plugin, Notice, addIcon, WorkspaceLeaf, ViewState } from 'obsidian';
import { PluginSettings } from './types/settings';
import { SettingsTab } from './components/SettingsTab';
import { SettingsManager } from './services/SettingsManager';
import { SettingsStorage } from './utils/SettingsStorage';
import { ChatView } from './components/ChatView';

// Define the chat icon
const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
</svg>`;

export const VIEW_TYPE_CHAT = 'cognilink-chat';

export default class CogniLinkPlugin extends Plugin {
  settings: PluginSettings;
  settingsManager: SettingsManager;

  async onload() {
    const storage = new SettingsStorage();
    this.settingsManager = new SettingsManager(this.app, this, storage);
    await this.settingsManager.loadSettings();
    this.settings = this.settingsManager.getSettings();

    // Register chat icon
    addIcon('cognilink-chat', CHAT_ICON);

    // Register chat view type
    this.registerView(
      VIEW_TYPE_CHAT,
      (leaf) => new ChatView(leaf, this)
    );

    // Add ribbon icon
    this.addRibbonIcon('cognilink-chat', 'CogniLink Assistant', async () => {
      await this.activateView();
    });

    // Add command to toggle chat
    this.addCommand({
      id: 'toggle-cognilink-chat',
      name: 'Toggle CogniLink Chat',
      callback: () => this.activateView(),
      hotkeys: [
        {
          modifiers: ['Mod', 'Shift'],
          key: 'c',
        },
      ],
    });

    // Initialize the view
    this.app.workspace.onLayoutReady(() => {
      this.initLeaf();
    });

    // 添加设置面板
    this.addSettingTab(new SettingsTab(this.app, this));

    // 添加通知以验证插件已加载
    new Notice('CogniLink 插件已加载');
  }

  async onunload() {
    // 清理资源
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
}
