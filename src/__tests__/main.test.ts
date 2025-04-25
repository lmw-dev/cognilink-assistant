import { App, Notice, Plugin, PluginSettingTab } from 'obsidian';
import CogniLinkPlugin from '../main';
import { SettingsManager } from '../services/SettingsManager';

// Mock the Obsidian modules
jest.mock('obsidian', () => ({
  Notice: jest.fn().mockImplementation(function(this: any) {
    this.noticeEl = {
      createEl: jest.fn().mockReturnValue({
        style: {},
        onclick: null,
      }),
    };
    this.hide = jest.fn();
  }),
  Plugin: jest.fn().mockImplementation(function(app) {
    this.app = app;
    this.addSettingTab = jest.fn();
    this.registerView = jest.fn();
    this.addRibbonIcon = jest.fn();
    this.addCommand = jest.fn();
  }),
  PluginSettingTab: jest.fn().mockImplementation(function() {
    this.display = jest.fn();
  }),
  ItemView: jest.fn().mockImplementation(function() {
    this.contentEl = document.createElement('div');
    this.getViewType = jest.fn().mockReturnValue('cognilink-chat');
    this.getDisplayText = jest.fn().mockReturnValue('CogniLink Chat');
    this.onOpen = jest.fn().mockResolvedValue(undefined);
    this.onClose = jest.fn().mockResolvedValue(undefined);
  }),
  addIcon: jest.fn(),
}));

describe('CogniLinkPlugin', () => {
  let plugin: CogniLinkPlugin;
  let mockApp: App;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock app
    mockApp = {
      workspace: {
        onLayoutReady: jest.fn().mockImplementation(cb => cb()),
        getLeaf: jest.fn().mockReturnValue({
          setViewState: jest.fn().mockResolvedValue(undefined),
        }),
        getLeavesOfType: jest.fn().mockReturnValue([]),
        getLeftLeaf: jest.fn().mockReturnValue({
          setViewState: jest.fn().mockResolvedValue(undefined),
        }),
      },
      vault: {},
    } as any;

    // Create plugin instance with manifest
    plugin = new CogniLinkPlugin(mockApp, {
      id: 'cognilink-assistant',
      name: 'CogniLink Assistant',
      version: '1.0.0',
      minAppVersion: '1.0.0',
      author: 'CogniLink Team',
      description: 'An AI-powered assistant for enhancing your knowledge management in Obsidian',
      isDesktopOnly: true,
    });
  });

  describe('onload', () => {
    it('should initialize settings and show load notice', async () => {
      // Mock SettingsManager
      const mockLoadSettings = jest.fn();
      const mockGetSettings = jest.fn().mockReturnValue({});
      jest.spyOn(SettingsManager.prototype, 'loadSettings').mockImplementation(mockLoadSettings);
      jest.spyOn(SettingsManager.prototype, 'getSettings').mockImplementation(mockGetSettings);

      // Call onload
      await plugin.onload();

      // Verify settings initialization
      expect(mockLoadSettings).toHaveBeenCalled();
      expect(mockGetSettings).toHaveBeenCalled();
      expect(plugin.settings).toBeDefined();

      // Verify setting tab was added
      expect(plugin.addSettingTab).toHaveBeenCalled();

      // Verify load notice was shown
      expect(Notice).toHaveBeenCalledWith('CogniLink 插件已加载');
    });
  });

  describe('onunload', () => {
    it('should show unload notice', async () => {
      // Call onunload
      await plugin.onunload();

      // Verify unload notice was shown
      expect(Notice).toHaveBeenCalledWith('CogniLink 插件已卸载');
    });
  });
}); 