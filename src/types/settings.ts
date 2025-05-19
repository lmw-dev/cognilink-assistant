export type AIProvider = 'anthropic' | 'local' | 'openai';
export type AIModel = 'claude-2' | 'claude-instant' | 'gpt-3.5-turbo' | 'gpt-4';
export type Theme = 'system' | 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
export type MessageSpacing = 'compact' | 'comfortable' | 'spacious';

export interface ShortcutKey {
  key: string;
  modifiers: string[];
}

export interface Shortcuts {
  toggleChat: ShortcutKey;
  sendMessage: ShortcutKey;
  newChat: ShortcutKey;
  clearChat: ShortcutKey;
}

export interface UISettings {
  fontSize: number;
  fontFamily: string;
  theme: Theme;
  messageSpacing: MessageSpacing;
  showTimestamp: boolean;
  enableAnimations: boolean;
}

export interface AISettings {
  provider: AIProvider;
  model: AIModel;
  anthropicApiKey: string;
  anthropicEndpoint?: string;
  openAIApiKey?: string;
  openAIEndpoint?: string;
  maxTokens: number;
  temperature: number;
  defaultSystemPrompt: string;
}

export interface Settings {
  ui: UISettings;
  ai: AISettings;
  shortcuts: Shortcuts;
}

export type PluginSettings = Settings;

export const DEFAULT_SETTINGS: PluginSettings = {
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
    anthropicApiKey: '',
    anthropicEndpoint: 'https://api.anthropic.com',
    openAIApiKey: '',
    openAIEndpoint: 'https://api.openai.com/v1',
    maxTokens: 2000,
    temperature: 0.7,
    defaultSystemPrompt: 'You are a helpful AI assistant.'
  },
  shortcuts: {
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
  }
};
