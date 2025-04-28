jest.mock('../services/ChatManager', () => {
  return {
    ChatManager: jest.fn().mockImplementation(() => ({
      startNewChat: jest.fn(),
      clearChat: jest.fn(),
      copyLastMessage: jest.fn(),
    })),
  };
});

import { App, Notice, Plugin, PluginSettingTab } from 'obsidian';
import CogniLinkPlugin from '../main';
import { SettingsManager } from '../services/SettingsManager';
import { ChatManager } from '../services/ChatManager';

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
  Scope: jest.fn().mockImplementation(() => ({})),
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
    // 修复：确保 settings 结构完整，避免 provider undefined
    plugin.settings = {
      ui: {
        theme: 'system',
        fontSize: 16,
        fontFamily: 'Arial',
        messageSpacing: 'comfortable',
        showTimestamp: true,
        enableAnimations: true
      },
      ai: {
        provider: 'anthropic',
        model: 'claude-2',
        anthropicApiKey: 'test-key',
        maxTokens: 2000,
        temperature: 0.7,
        defaultSystemPrompt: 'You are a helpful AI assistant.'
      },
      shortcuts: {
        toggleChat: { key: 'c', modifiers: ['Mod', 'Shift'] },
        sendMessage: { key: 'Enter', modifiers: ['Mod'] },
        newChat: { key: 'n', modifiers: ['Mod', 'Shift'] },
        clearChat: { key: 'l', modifiers: ['Mod', 'Shift'] }
      }
    };
  });

  describe('onload', () => {
    it('should initialize settings and show load notice', async () => {
      // Mock SettingsManager
      const mockLoadSettings = jest.fn();
      const mockGetSettings = jest.fn().mockReturnValue({
        ui: {
          theme: 'system',
          fontSize: 16,
          fontFamily: 'Arial',
          messageSpacing: 'comfortable',
          showTimestamp: true,
          enableAnimations: true
        },
        ai: {
          provider: 'anthropic',
          model: 'claude-2',
          anthropicApiKey: 'test-key',
          maxTokens: 2000,
          temperature: 0.7,
          defaultSystemPrompt: 'You are a helpful AI assistant.'
        },
        shortcuts: {
          toggleChat: { key: 'c', modifiers: ['Mod', 'Shift'] },
          sendMessage: { key: 'Enter', modifiers: ['Mod'] },
          newChat: { key: 'n', modifiers: ['Mod', 'Shift'] },
          clearChat: { key: 'l', modifiers: ['Mod', 'Shift'] }
        }
      });
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

  describe('command registration', () => {
    it('should register and call start-new-chat command', async () => {
      const commands: any[] = [];
      plugin.addCommand = ((cmd: any) => { commands.push(cmd); return cmd; }) as any;
      await plugin.onload();
      const startCmd = commands.find(c => c.id === 'start-new-chat');
      expect(startCmd).toBeDefined();
      startCmd.callback();
      const chatManagerInstance = (ChatManager as jest.Mock).mock.instances[0];
      console.log('plugin.chatManager:', plugin.chatManager);
      console.log('ChatManager mock instances:', (ChatManager as jest.Mock).mock.instances);
      expect(plugin.chatManager.startNewChat).toHaveBeenCalled();
    });

    it('should register and call clear-chat-history command', async () => {
      const commands: any[] = [];
      plugin.addCommand = ((cmd: any) => { commands.push(cmd); return cmd; }) as any;
      await plugin.onload();
      const clearCmd = commands.find(c => c.id === 'clear-chat-history');
      expect(clearCmd).toBeDefined();
      clearCmd.callback();
      const chatManagerInstance = (ChatManager as jest.Mock).mock.instances[0];
      console.log('plugin.chatManager:', plugin.chatManager);
      console.log('ChatManager mock instances:', (ChatManager as jest.Mock).mock.instances);
      expect(plugin.chatManager.clearChat).toHaveBeenCalled();
    });

    it('should register and call copy-last-message command', async () => {
      const commands: any[] = [];
      plugin.addCommand = ((cmd: any) => { commands.push(cmd); return cmd; }) as any;
      await plugin.onload();
      const copyCmd = commands.find(c => c.id === 'copy-last-message');
      expect(copyCmd).toBeDefined();
      copyCmd.callback();
      const chatManagerInstance = (ChatManager as jest.Mock).mock.instances[0];
      console.log('plugin.chatManager:', plugin.chatManager);
      console.log('ChatManager mock instances:', (ChatManager as jest.Mock).mock.instances);
      expect(plugin.chatManager.copyLastMessage).toHaveBeenCalled();
    });
  });
}); 