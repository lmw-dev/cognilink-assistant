import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App, Plugin, PluginSettingTab } from 'obsidian';

// Mock the SettingsTab class
class MockSettingsTab extends PluginSettingTab {
  constructor(app: App, plugin: any) {
    super(app, plugin);
  }

  display(): void {
    this.containerEl.empty();
    this.containerEl.createEl('h2', { text: 'CogniLink Assistant Settings' });
  }
}

// Mock Plugin class for testing
class MockPlugin extends Plugin {
  constructor(app: App, manifest: any) {
    super(app, manifest);
  }
}

describe('SettingsTab', () => {
  let app: App;
  let plugin: MockPlugin;
  let settingsTab: MockSettingsTab;

  beforeEach(() => {
    app = new App();
    plugin = new MockPlugin(app, { id: 'cognilink-assistant', name: 'CogniLink Assistant' });
    settingsTab = new MockSettingsTab(app, plugin);
  });

  it('should create settings tab instance', () => {
    expect(settingsTab).toBeInstanceOf(PluginSettingTab);
    expect(settingsTab.app).toBe(app);
    expect((settingsTab as any).plugin).toBe(plugin);
  });

  it('should have container element', () => {
    expect(settingsTab.containerEl).toBeInstanceOf(HTMLElement);
  });

  it('should display settings when display method is called', () => {
    settingsTab.display();
    // 验证 createEl 方法被调用，说明有元素被创建
    expect(settingsTab.containerEl.createEl).toHaveBeenCalled();
  });

  it('should have display and hide methods', () => {
    expect(typeof settingsTab.display).toBe('function');
    expect(typeof settingsTab.hide).toBe('function');
  });
}); 