import { App, Command, Modifier } from 'obsidian';
import { KeyboardManager } from '../services/KeyboardManager';
import CogniLinkPlugin from '../main';
import { ChatManager } from '../services/ChatManager';

describe('KeyboardManager', () => {
  let keyboardManager: KeyboardManager;
  let mockApp: Partial<App>;
  let mockPlugin: Partial<CogniLinkPlugin>;
  let mockChatManager: jest.Mocked<ChatManager>;

  beforeEach(() => {
    mockApp = {
      keymap: {
        pushScope: jest.fn(),
        popScope: jest.fn(),
      },
    };

    mockChatManager = {
      clearChat: jest.fn(),
      copyLastMessage: jest.fn(),
    } as unknown as jest.Mocked<ChatManager>;

    mockPlugin = {
      addCommand: jest.fn().mockReturnValue({
        id: 'test-command',
        name: 'Test Command',
      }),
      activateView: jest.fn(),
      chatManager: mockChatManager,
    };

    keyboardManager = new KeyboardManager(mockApp as App, mockPlugin as CogniLinkPlugin);
  });

  describe('registerCommand', () => {
    it('should register a command with the plugin', () => {
      const shortcut = {
        id: 'test-command',
        name: 'Test Command',
        callback: jest.fn(),
        hotkeys: [{
          modifiers: ['Mod', 'Shift'] as Modifier[],
          key: 'T',
        }],
      };

      keyboardManager.registerCommand(shortcut);

      expect(mockPlugin.addCommand).toHaveBeenCalledWith({
        id: shortcut.id,
        name: shortcut.name,
        callback: shortcut.callback,
        hotkeys: shortcut.hotkeys,
      });
    });
  });

  describe('updateHotkey', () => {
    it('should update hotkeys for an existing command', () => {
      const commandId = 'test-command';
      const newHotkeys = [{
        modifiers: ['Mod', 'Shift'] as Modifier[],
        key: 'N',
      }];
      const command = {
        id: commandId,
        name: 'Test Command',
        hotkeys: [],
      } as Command;

      keyboardManager['registeredCommands'].set(commandId, command);
      keyboardManager.updateHotkey(commandId, newHotkeys);

      expect(command.hotkeys).toEqual(newHotkeys);
    });
  });

  describe('registerScope', () => {
    it('should register the keyboard scope', () => {
      keyboardManager.registerScope();
      expect(mockApp.keymap?.pushScope).toHaveBeenCalled();
    });
  });

  describe('unregisterScope', () => {
    it('should unregister the keyboard scope', () => {
      keyboardManager.unregisterScope();
      expect(mockApp.keymap?.popScope).toHaveBeenCalled();
    });
  });
}); 