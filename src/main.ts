import { Plugin, PluginSettingTab, App, Notice } from 'obsidian';
import { DEFAULT_SETTINGS } from './constants/settings';
import { CogniLinkSettings } from './types/settings';
import { ChatView } from './components/ChatView';

export default class CogniLinkPlugin extends Plugin {
  settings: CogniLinkSettings;

  async onload() {
    await this.loadSettings();

    // Add a test notification to verify plugin is loaded
    new Notice('CogniLink Assistant plugin loaded successfully! 🎉');

    // Register Chat View
    this.registerView('cognilink-chat', leaf => new ChatView(leaf, this));

    // Add ribbon icon for activating chat
    this.addRibbonIcon('message-square', 'Open CogniLink Chat', () => {
      this.activateView();
    });

    // Add settings tab
    this.addSettingTab(new CogniLinkSettingTab(this.app, this));

    // Add commands
    this.addCommand({
      id: 'open-cognilink-chat',
      name: 'Open Chat',
      callback: () => {
        this.activateView();
      },
    });

    this.addCommand({
      id: 'check-originality',
      name: 'Check Originality',
      editorCallback: editor => {
        const selectedText = editor.getSelection();
        if (selectedText) {
          // TODO: Implement originality check
          new Notice('Originality check coming soon!');
        } else {
          new Notice('Please select some text to check originality.');
        }
      },
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateView() {
    const { workspace } = this.app;

    let leaf = workspace.getLeavesOfType('cognilink-chat')[0];

    if (!leaf) {
      // Create a new leaf in the right sidebar
      leaf = workspace.getLeaf('split');
      await leaf.setViewState({ type: 'cognilink-chat', active: true });
    }

    workspace.revealLeaf(leaf);
  }

  onunload() {
    // Clean up plugin resources
  }
}

class CogniLinkSettingTab extends PluginSettingTab {
  plugin: CogniLinkPlugin;

  constructor(app: App, plugin: CogniLinkPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'CogniLink Settings' });

    // TODO: Add settings UI
  }
}
