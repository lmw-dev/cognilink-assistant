// Mock Obsidian's PluginSettingTab and HTMLElement extensions
jest.mock('obsidian', () => {
  // Mock HTMLElement extensions
  HTMLElement.prototype.empty = function() {
    this.innerHTML = '';
  };
  
  HTMLElement.prototype.createEl = function<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs?: { text?: string }
  ): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    if (attrs?.text) {
      el.textContent = attrs.text;
    }
    this.appendChild(el);
    return el;
  };

  class Setting {
    settingEl: HTMLElement;
    
    constructor(containerEl: HTMLElement) {
      this.settingEl = document.createElement('div');
      this.settingEl.className = 'setting-item';
      containerEl.appendChild(this.settingEl);
    }

    setName(name: string) {
      const nameEl = document.createElement('div');
      nameEl.className = 'setting-item-name';
      nameEl.textContent = name;
      this.settingEl.appendChild(nameEl);
      return this;
    }

    setDesc(desc: string) {
      const descEl = document.createElement('div');
      descEl.className = 'setting-item-description';
      descEl.textContent = desc;
      this.settingEl.appendChild(descEl);
      return this;
    }

    addDropdown(cb: (dropdown: any) => any) {
      const select = document.createElement('select');
      this.settingEl.appendChild(select);
      
      const api = {
        addOption(value: string, display: string) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = display;
          select.appendChild(option);
          return api;
        },
        setValue(value: string) {
          select.value = value;
          return api;
        },
        onChange(callback: (value: string) => void) {
          select.addEventListener('change', (e) => {
            callback((e.target as HTMLSelectElement).value);
          });
          return api;
        }
      };
      
      cb(api);
      return this;
    }

    addText(cb: (text: any) => any) {
      const input = document.createElement('input');
      input.type = 'text';
      this.settingEl.appendChild(input);
      
      const api = {
        setPlaceholder(placeholder: string) {
          input.placeholder = placeholder;
          return api;
        },
        setValue(value: string) {
          input.value = value;
          return api;
        },
        onChange(callback: (value: string) => void) {
          input.addEventListener('change', (e) => {
            callback((e.target as HTMLInputElement).value);
          });
          return api;
        }
      };
      
      cb(api);
      return this;
    }

    addSlider(cb: (slider: any) => any) {
      const slider = document.createElement('input');
      slider.type = 'range';
      this.settingEl.appendChild(slider);
      
      const api = {
        setLimits(min: number, max: number, step: number) {
          slider.min = min.toString();
          slider.max = max.toString();
          slider.step = step.toString();
          return api;
        },
        setValue(value: number) {
          slider.value = value.toString();
          return api;
        },
        onChange(callback: (value: number) => void) {
          slider.addEventListener('change', (e) => {
            callback(parseFloat((e.target as HTMLInputElement).value));
          });
          return api;
        }
      };
      
      cb(api);
      return this;
    }

    addTextArea(cb: (textarea: any) => any) {
      const textarea = document.createElement('textarea');
      this.settingEl.appendChild(textarea);
      
      const api = {
        setPlaceholder(placeholder: string) {
          textarea.placeholder = placeholder;
          return api;
        },
        setValue(value: string) {
          textarea.value = value;
          return api;
        },
        onChange(callback: (value: string) => void) {
          textarea.addEventListener('change', (e) => {
            callback((e.target as HTMLTextAreaElement).value);
          });
          return api;
        }
      };
      
      cb(api);
      return this;
    }

    addToggle(cb: (toggle: any) => any) {
      const input = document.createElement('input');
      input.type = 'checkbox';
      this.settingEl.appendChild(input);
      
      const api = {
        setValue(value: boolean) {
          input.checked = value;
          return api;
        },
        onChange(callback: (value: boolean) => void) {
          input.addEventListener('change', (e) => {
            callback((e.target as HTMLInputElement).checked);
          });
          return api;
        }
      };
      
      cb(api);
      return this;
    }
  }

  return {
    App: jest.fn(),
    PluginSettingTab: class {
      app: any;
      containerEl: HTMLElement;
      constructor(app: any) {
        this.app = app;
        this.containerEl = document.createElement('div');
      }
    },
    Setting
  };
});

import { App } from 'obsidian';
import { SettingsTab } from '../SettingsTab';
import CogniLinkPlugin from '../../main';
import { DEFAULT_SETTINGS } from '../../types/settings';

describe('SettingsTab', () => {
  let settingsTab: SettingsTab;
  let mockApp: App;
  let mockPlugin: CogniLinkPlugin;
  let mockContainerEl: HTMLElement;

  beforeEach(() => {
    // Mock app
    mockApp = {
      vault: {
        getName: jest.fn().mockReturnValue('test-vault'),
      },
    } as any;

    // Mock plugin
    mockPlugin = {
      settings: { ...DEFAULT_SETTINGS },
      settingsManager: {
        updateAISettings: jest.fn().mockResolvedValue(undefined),
        updateUISettings: jest.fn().mockResolvedValue(undefined),
        saveSettings: jest.fn().mockResolvedValue(undefined),
      },
    } as any;

    // Create container element
    mockContainerEl = document.createElement('div');

    // Create settings tab instance
    settingsTab = new SettingsTab(mockApp, mockPlugin);
    settingsTab.containerEl = mockContainerEl;
  });

  describe('display', () => {
    beforeEach(() => {
      // Clear container before each test
      mockContainerEl.innerHTML = '';
      // Call display to render settings
      settingsTab.display();
    });

    it('should render settings title', () => {
      const title = mockContainerEl.querySelector('h2');
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('CogniLink 设置');
    });

    it('should render AI provider setting', () => {
      const setting = mockContainerEl.querySelector('.setting-item');
      expect(setting).toBeTruthy();
      
      const name = setting?.querySelector('.setting-item-name');
      expect(name?.textContent).toBe('AI 提供商');
      
      const desc = setting?.querySelector('.setting-item-description');
      expect(desc?.textContent).toBe('选择要使用的 AI 服务提供商');
      
      const dropdown = setting?.querySelector('select');
      expect(dropdown).toBeTruthy();
    });

    it('should render API key setting', () => {
      const settings = mockContainerEl.querySelectorAll('.setting-item');
      const apiKeySetting = settings[1];
      expect(apiKeySetting).toBeTruthy();
      
      const name = apiKeySetting?.querySelector('.setting-item-name');
      expect(name?.textContent).toBe('API 密钥');
      
      const desc = apiKeySetting?.querySelector('.setting-item-description');
      expect(desc?.textContent).toBe('输入 AI 服务的 API 密钥');
      
      const input = apiKeySetting?.querySelector('input');
      expect(input).toBeTruthy();
      expect(input?.type).toBe('text');
    });
  });

  describe('settings changes', () => {
    beforeEach(() => {
      settingsTab.display();
    });

    it('should save settings when AI provider changes', async () => {
      const dropdown = mockContainerEl.querySelector('select') as HTMLSelectElement;
      expect(dropdown).toBeTruthy();
      
      // Simulate change event
      dropdown.value = 'anthropic';
      dropdown.dispatchEvent(new Event('change'));

      expect(mockPlugin.settingsManager.updateAISettings).toHaveBeenCalledWith({
        provider: 'anthropic',
      });
    });

    it('should save settings when API key changes', async () => {
      const input = mockContainerEl.querySelector('input[type="text"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      
      // Simulate change event
      const newValue = 'test-api-key';
      input.value = newValue;
      input.dispatchEvent(new Event('change'));

      expect(mockPlugin.settingsManager.updateAISettings).toHaveBeenCalledWith({
        apiKey: newValue,
      });
    });
  });
}); 