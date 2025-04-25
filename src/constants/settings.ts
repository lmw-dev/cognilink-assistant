import { PluginSettings } from '../types/settings';

export const DEFAULT_UI_SETTINGS: PluginSettings['ui'] = {
  theme: 'system',
  fontSize: 16,
  fontFamily: 'Arial',
  messageSpacing: 'comfortable',
  showTimestamp: true,
  enableAnimations: true
};

export const DEFAULT_AI_SETTINGS: PluginSettings['ai'] = {
  provider: 'anthropic',
  model: 'claude-2',
  anthropicApiKey: '',
  maxTokens: 2000,
  temperature: 0.7,
  defaultSystemPrompt: 'You are a helpful AI assistant.'
};

export const DEFAULT_SHORTCUTS: PluginSettings['shortcuts'] = {
  toggleChat: {
    key: 'c',
    modifiers: ['Mod', 'Shift']
  },
  sendMessage: {
    key: 'Enter',
    modifiers: ['Mod']
  },
  newChat: {
    key: 'n',
    modifiers: ['Mod', 'Shift']
  },
  clearChat: {
    key: 'l',
    modifiers: ['Mod', 'Shift']
  }
};
