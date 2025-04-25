import { App, Scope, Command, Hotkey } from 'obsidian';
import CogniLinkPlugin from '../main';

export interface KeyboardShortcut {
  id: string;
  name: string;
  callback: () => void | Promise<void>;
  hotkeys?: Hotkey[];
}

export class KeyboardManager {
  private plugin: CogniLinkPlugin;
  private app: App;
  private scope: Scope;
  private registeredCommands: Map<string, Command> = new Map();

  constructor(app: App, plugin: CogniLinkPlugin) {
    this.app = app;
    this.plugin = plugin;
    this.scope = new Scope();
  }

  /**
   * 注册快捷键命令
   */
  registerCommand(shortcut: KeyboardShortcut): void {
    const command = this.plugin.addCommand({
      id: shortcut.id,
      name: shortcut.name,
      callback: shortcut.callback,
      hotkeys: shortcut.hotkeys,
    });

    this.registeredCommands.set(shortcut.id, command);
  }

  /**
   * 更新快捷键
   */
  updateHotkey(commandId: string, hotkeys: Hotkey[]): void {
    const command = this.registeredCommands.get(commandId);
    if (command) {
      command.hotkeys = hotkeys;
    }
  }

  /**
   * 注册默认快捷键
   */
  registerDefaultShortcuts(): void {
    // 切换聊天窗口
    this.registerCommand({
      id: 'toggle-cognilink-chat',
      name: '切换聊天窗口',
      callback: () => this.plugin.activateView(),
      hotkeys: [{
        modifiers: ['Mod', 'Shift'],
        key: 'C',
      } as Hotkey],
    });

    // 新建聊天
    this.registerCommand({
      id: 'new-cognilink-chat',
      name: '新建聊天',
      callback: () => this.plugin.activateView(),
      hotkeys: [{
        modifiers: ['Mod', 'Shift'],
        key: 'N',
      } as Hotkey],
    });

    // 聚焦输入框
    this.registerCommand({
      id: 'focus-cognilink-input',
      name: '聚焦输入框',
      callback: () => this.plugin.activateView(),
      hotkeys: [{
        modifiers: ['Mod', 'Shift'],
        key: 'I',
      } as Hotkey],
    });

    // 清空聊天记录
    this.registerCommand({
      id: 'clear-cognilink-chat',
      name: '清空聊天记录',
      callback: () => this.plugin.chatManager.clearChat(),
      hotkeys: [{
        modifiers: ['Mod', 'Shift'],
        key: 'L',
      } as Hotkey],
    });

    // 复制最后一条消息
    this.registerCommand({
      id: 'copy-last-message',
      name: '复制最后一条消息',
      callback: () => this.plugin.chatManager.copyLastMessage(),
      hotkeys: [{
        modifiers: ['Mod', 'Shift'],
        key: 'V',
      } as Hotkey],
    });
  }

  /**
   * 注册全局快捷键作用域
   */
  registerScope(): void {
    // 注册 scope 到全局作用域，优先级为 100
    this.app.keymap.pushScope(this.scope);
  }

  /**
   * 取消注册全局快捷键作用域
   */
  unregisterScope(): void {
    this.app.keymap.popScope(this.scope);
  }
} 