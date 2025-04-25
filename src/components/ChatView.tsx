import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Chat } from './Chat';
import { VIEW_TYPE_CHAT } from '../main';
import CogniLinkPlugin from '../main';

export class ChatView extends ItemView {
  private root: ReturnType<typeof createRoot> | null = null;
  private plugin: CogniLinkPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: CogniLinkPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_CHAT;
  }

  getDisplayText(): string {
    return 'CogniLink Chat';
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl('div', { attr: { id: 'chat-root' } });
    
    const chatRoot = container.querySelector('#chat-root');
    if (chatRoot) {
      this.root = createRoot(chatRoot);
      this.root.render(
        <React.StrictMode>
          <Chat plugin={this.plugin} />
        </React.StrictMode>
      );
    }
  }

  async onClose(): Promise<void> {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
