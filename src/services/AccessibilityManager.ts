import { App } from 'obsidian';
import CogniLinkPlugin from '../main';

export class AccessibilityManager {
  private plugin: CogniLinkPlugin;
  private app: App;
  private observer: MutationObserver;

  constructor(app: App, plugin: CogniLinkPlugin) {
    this.app = app;
    this.plugin = plugin;
    this.initializeObserver();
  }

  /**
   * 初始化 DOM 观察器
   */
  private initializeObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.updateAccessibility();
        }
      });
    });

    // 开始观察 DOM 变化
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * 更新可访问性属性
   */
  public updateAccessibility(): void {
    this.updateARIALabels();
    this.updateARIALandmarks();
    this.updateARIALive();
    this.updateFocusManagement();
  }

  /**
   * 更新 ARIA 标签
   */
  private updateARIALabels(): void {
    // 更新聊天容器
    const chatContainer = document.querySelector('.cognilink-chat-container');
    if (chatContainer instanceof HTMLElement) {
      chatContainer.setAttribute('role', 'main');
      chatContainer.setAttribute('aria-label', '聊天窗口');
    }

    // 更新消息列表
    const messageList = document.querySelector('.cognilink-message-list');
    if (messageList instanceof HTMLElement) {
      messageList.setAttribute('role', 'log');
      messageList.setAttribute('aria-label', '聊天消息列表');
    }

    // 更新输入区域
    const inputArea = document.querySelector('.cognilink-input-area');
    if (inputArea instanceof HTMLElement) {
      inputArea.setAttribute('role', 'form');
      inputArea.setAttribute('aria-label', '消息输入区域');
    }

    // 更新按钮
    document.querySelectorAll('button').forEach((button) => {
      if (!button.getAttribute('aria-label')) {
        button.setAttribute('aria-label', button.textContent || '按钮');
      }
    });
  }

  /**
   * 更新 ARIA 地标
   */
  private updateARIALandmarks(): void {
    // 主要内容区域
    const mainContent = document.querySelector('.cognilink-chat-container');
    if (mainContent instanceof HTMLElement) {
      mainContent.setAttribute('role', 'main');
    }

    // 导航区域
    const navigation = document.querySelector('.cognilink-sidebar');
    if (navigation instanceof HTMLElement) {
      navigation.setAttribute('role', 'navigation');
      navigation.setAttribute('aria-label', '聊天导航');
    }

    // 工具栏
    const toolbar = document.querySelector('.cognilink-toolbar');
    if (toolbar instanceof HTMLElement) {
      toolbar.setAttribute('role', 'toolbar');
      toolbar.setAttribute('aria-label', '工具栏');
    }
  }

  /**
   * 更新实时区域
   */
  private updateARIALive(): void {
    // 消息更新区域
    const messageList = document.querySelector('.cognilink-message-list');
    if (messageList instanceof HTMLElement) {
      messageList.setAttribute('aria-live', 'polite');
      messageList.setAttribute('aria-atomic', 'false');
    }

    // 状态更新区域
    const status = document.querySelector('.cognilink-status');
    if (status instanceof HTMLElement) {
      status.setAttribute('aria-live', 'assertive');
      status.setAttribute('role', 'status');
    }
  }

  /**
   * 更新焦点管理
   */
  private updateFocusManagement(): void {
    // 设置所有可聚焦元素的 tabindex
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        // 确保元素可以通过键盘访问
        if (!element.getAttribute('tabindex')) {
          element.setAttribute('tabindex', '0');
        }

        // 添加键盘事件监听器
        element.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            element.click();
          }
        });
      }
    });
  }

  /**
   * 添加跳过链接
   */
  public addSkipLinks(): void {
    const skipLink = document.createElement('a');
    skipLink.href = '#cognilink-main-content';
    skipLink.className = 'cognilink-skip-link';
    skipLink.textContent = '跳转到主要内容';
    skipLink.setAttribute('aria-label', '跳转到主要内容');
    
    // 样式设置
    skipLink.style.position = 'absolute';
    skipLink.style.left = '-9999px';
    skipLink.style.top = '0';
    skipLink.style.zIndex = '9999';
    
    // 当获得焦点时显示
    skipLink.addEventListener('focus', () => {
      skipLink.style.left = '0';
    });
    
    // 当失去焦点时隐藏
    skipLink.addEventListener('blur', () => {
      skipLink.style.left = '-9999px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
} 