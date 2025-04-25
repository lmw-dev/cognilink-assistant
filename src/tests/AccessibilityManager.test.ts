import { App } from 'obsidian';
import { AccessibilityManager } from '../services/AccessibilityManager';
import CogniLinkPlugin from '../main';

describe('AccessibilityManager', () => {
  let accessibilityManager: AccessibilityManager;
  let mockApp: Partial<App>;
  let mockPlugin: Partial<CogniLinkPlugin>;
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockApp = {};
    mockPlugin = {};

    // 创建模拟 DOM 元素
    mockElement = document.createElement('div');
    mockElement.className = 'cognilink-chat-container';
    document.body.appendChild(mockElement);

    accessibilityManager = new AccessibilityManager(mockApp as App, mockPlugin as CogniLinkPlugin);
  });

  afterEach(() => {
    // 清理 DOM
    document.body.innerHTML = '';
    accessibilityManager.cleanup();
  });

  describe('updateAccessibility', () => {
    it('should update ARIA labels', () => {
      accessibilityManager.updateAccessibility();
      expect(mockElement.getAttribute('role')).toBe('main');
      expect(mockElement.getAttribute('aria-label')).toBe('聊天窗口');
    });
  });

  describe('addSkipLinks', () => {
    it('should add skip link to the document', () => {
      accessibilityManager.addSkipLinks();
      const skipLink = document.querySelector('.cognilink-skip-link');
      expect(skipLink).toBeTruthy();
      expect(skipLink?.getAttribute('aria-label')).toBe('跳转到主要内容');
    });

    it('should show skip link on focus', () => {
      accessibilityManager.addSkipLinks();
      const skipLink = document.querySelector('.cognilink-skip-link') as HTMLElement;
      
      // 模拟焦点事件
      skipLink.dispatchEvent(new Event('focus'));
      expect(skipLink.style.left).toBe('0px');

      // 模拟失去焦点事件
      skipLink.dispatchEvent(new Event('blur'));
      expect(skipLink.style.left).toBe('-9999px');
    });
  });

  describe('cleanup', () => {
    it('should disconnect the observer', () => {
      const disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');
      accessibilityManager.cleanup();
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
}); 