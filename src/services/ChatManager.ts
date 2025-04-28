import { Notice } from 'obsidian';
import CogniLinkPlugin from '../main';

export class ChatManager {
  private plugin: CogniLinkPlugin;

  constructor(plugin: CogniLinkPlugin) {
    this.plugin = plugin;
  }

  startNewChat(): void {
    // TODO: 实现新建聊天逻辑
    new Notice('已新建聊天会话');
  }

  clearChat(): void {
    // TODO: 实现清空聊天记录的功能
    new Notice('聊天记录已清空');
  }

  copyLastMessage(): void {
    // TODO: 实现复制最后一条消息的功能
    new Notice('已复制最后一条消息');
  }
} 