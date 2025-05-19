import { AnthropicProvider } from '../../services/AnthropicProvider';
import { OpenAIProvider } from '../../services/OpenAIProvider';
import { SettingsTab } from '../SettingsTab';
import CogniLinkPlugin from '../../main';
import { App } from 'obsidian';
import { DEFAULT_SETTINGS } from '../../types/settings';

jest.mock('../../services/AnthropicProvider', () => ({
  AnthropicProvider: jest.fn().mockImplementation(() => ({
    validateApiKey: jest.fn().mockResolvedValue({ valid: true })
  }))
}));
jest.mock('../../services/OpenAIProvider', () => ({
  OpenAIProvider: jest.fn().mockImplementation(() => ({
    validateApiKey: jest.fn().mockResolvedValue({ valid: true })
  }))
}));

describe('SettingsTab 密钥相关 UI', () => {
  let settingsTab: SettingsTab;
  let mockApp: App;
  let mockPlugin: CogniLinkPlugin;
  let mockContainerEl: HTMLElement;

  beforeEach(() => {
    mockApp = { vault: { getName: jest.fn().mockReturnValue('test-vault') } } as any;
    mockPlugin = {
      settings: { ...DEFAULT_SETTINGS, ai: { ...DEFAULT_SETTINGS.ai, provider: 'anthropic' } },
      saveSettings: jest.fn().mockResolvedValue(undefined),
    } as any;
    mockContainerEl = document.createElement('div');
    settingsTab = new SettingsTab(mockApp, mockPlugin);
    settingsTab.containerEl = mockContainerEl;
    settingsTab.display();
  });

  it('should toggle password visibility for Anthropic API Key', () => {
    // 初始为 password
    const input = mockContainerEl.querySelector('input[type="password"]');
    expect(input).toBeTruthy();
    // 模拟点击显示按钮
    const btn = mockContainerEl.querySelector('.setting-item-extra-button');
    btn?.dispatchEvent(new Event('click'));
    settingsTab.display();
    const input2 = mockContainerEl.querySelector('input[type="text"]');
    expect(input2).toBeTruthy();
  });

  it('should show test result after clicking 测试密钥', async () => {
    const btns = mockContainerEl.querySelectorAll('button');
    const testBtn = Array.from(btns).find(b => b.textContent === '测试密钥');
    expect(testBtn).toBeTruthy();
    testBtn?.dispatchEvent(new Event('click'));
    // 等待异步
    await Promise.resolve();
    settingsTab.display();
    const resultEl = Array.from(mockContainerEl.querySelectorAll('div')).find(el => el.textContent?.includes('密钥有效'));
    expect(resultEl).toBeTruthy();
    expect(resultEl?.style.color).toBe('var(--text-success)');
  });
}); 