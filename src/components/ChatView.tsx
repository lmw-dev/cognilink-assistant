import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Chat } from './Chat';
import CogniLinkPlugin from '../main';

export class ChatView extends ItemView {
  root: Root | null = null;
  plugin: CogniLinkPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: CogniLinkPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return 'cognilink-chat';
  }

  getDisplayText(): string {
    return 'CogniLink Chat';
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl('div', { attr: { id: 'cognilink-chat-root' } });

    this.root = createRoot(container.children[0] as HTMLElement);
    this.root.render(
      <React.StrictMode>
        <Chat plugin={this.plugin} />
      </React.StrictMode>
    );
  }

  async onClose(): Promise<void> {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
