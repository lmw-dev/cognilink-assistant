import { App, Scope, Command, Hotkey } from 'obsidian';
import CogniLinkPlugin from '../main';

export interface KeyboardShortcut {
  id: string;
  name: string;
  callback: () => void | Promise<void>;
  hotkeys?: Hotkey[];
  ariaLabel?: string;
}

export class KeyboardManager {
  private plugin: CogniLinkPlugin;
  private app: App;
  private scope: Scope;
  private registeredCommands: Map<string, Command> = new Map();
  private focusableElements: HTMLElement[] = [];
  private currentFocusIndex: number = -1;

  constructor(app: App, plugin: CogniLinkPlugin) {
    this.app = app;
    this.plugin = plugin;
    this.scope = new Scope();
    this.initializeKeyboardNavigation();
  }

  /**
   * 初始化键盘导航
   */
  private initializeKeyboardNavigation(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || (e.target as HTMLElement).isContentEditable;
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          this.focusPrevious();
        } else {
          this.focusNext();
        }
        e.preventDefault();
      }

      // Escape 键处理
      if (e.key === 'Escape') {
        this.handleEscape();
      }

      // 只在非输入区域时处理空格/回车
      if (!isInput && (e.key === ' ' || e.key === 'Enter') && document.activeElement instanceof HTMLElement) {
        document.activeElement.click();
        e.preventDefault();
      }
    });
  }

  /**
   * 更新可聚焦元素列表
   */
  public updateFocusableElements(): void {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.focusableElements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    
    // 设置正确的 tabindex
    this.focusableElements.forEach((el, index) => {
      el.setAttribute('tabindex', '0');
      
      // 添加 ARIA 标签
      if (!el.getAttribute('aria-label')) {
        el.setAttribute('aria-label', el.textContent || `可聚焦元素 ${index + 1}`);
      }
    });
  }

  /**
   * 聚焦下一个元素
   */
  private focusNext(): void {
    if (this.focusableElements.length === 0) {
      this.updateFocusableElements();
    }
    
    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentFocusIndex]?.focus();
  }

  /**
   * 聚焦上一个元素
   */
  private focusPrevious(): void {
    if (this.focusableElements.length === 0) {
      this.updateFocusableElements();
    }
    
    this.currentFocusIndex = this.currentFocusIndex <= 0 
      ? this.focusableElements.length - 1 
      : this.currentFocusIndex - 1;
    this.focusableElements[this.currentFocusIndex]?.focus();
  }

  /**
   * 处理 Escape 键
   */
  private handleEscape(): void {
    const modal = document.querySelector('.modal-container');
    if (modal) {
      // 关闭模态框
      (modal as HTMLElement).click();
    } else {
      // 返回到主要内容区域
      this.focusMainContent();
    }
  }

  /**
   * 聚焦主要内容区域
   */
  private focusMainContent(): void {
    const mainContent = document.querySelector('.cognilink-chat-container');
    if (mainContent instanceof HTMLElement) {
      mainContent.focus();
    }
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

    // 添加 ARIA 标签
    if (shortcut.ariaLabel) {
      const element = document.querySelector(`[data-command-id="${shortcut.id}"]`);
      if (element instanceof HTMLElement) {
        element.setAttribute('aria-label', shortcut.ariaLabel);
      }
    }
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
      ariaLabel: '切换聊天窗口，快捷键 Ctrl+Shift+C',
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
      ariaLabel: '新建聊天，快捷键 Ctrl+Shift+N',
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
      ariaLabel: '聚焦输入框，快捷键 Ctrl+Shift+I',
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
      ariaLabel: '清空聊天记录，快捷键 Ctrl+Shift+L',
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
      ariaLabel: '复制最后一条消息，快捷键 Ctrl+Shift+V',
    });

    // 导航到上一条消息
    this.registerCommand({
      id: 'navigate-previous-message',
      name: '导航到上一条消息',
      callback: () => this.navigateMessages('previous'),
      hotkeys: [{
        modifiers: ['Alt'],
        key: 'ArrowUp',
      } as Hotkey],
      ariaLabel: '导航到上一条消息，快捷键 Alt+上箭头',
    });

    // 导航到下一条消息
    this.registerCommand({
      id: 'navigate-next-message',
      name: '导航到下一条消息',
      callback: () => this.navigateMessages('next'),
      hotkeys: [{
        modifiers: ['Alt'],
        key: 'ArrowDown',
      } as Hotkey],
      ariaLabel: '导航到下一条消息，快捷键 Alt+下箭头',
    });
  }

  /**
   * 消息导航
   */
  private navigateMessages(direction: 'previous' | 'next'): void {
    const messages = document.querySelectorAll('.cognilink-message');
    if (messages.length === 0) return;

    const currentFocused = document.activeElement;
    let currentIndex = Array.from(messages).findIndex(msg => msg === currentFocused);

    if (currentIndex === -1) {
      currentIndex = direction === 'previous' ? messages.length - 1 : 0;
    } else {
      currentIndex = direction === 'previous' 
        ? (currentIndex - 1 + messages.length) % messages.length
        : (currentIndex + 1) % messages.length;
    }

    (messages[currentIndex] as HTMLElement).focus();
  }

  /**
   * 注册全局快捷键作用域
   */
  registerScope(): void {
    this.app.keymap.pushScope(this.scope);
    this.updateFocusableElements();
  }

  /**
   * 取消注册全局快捷键作用域
   */
  unregisterScope(): void {
    this.app.keymap.popScope(this.scope);
  }
} 