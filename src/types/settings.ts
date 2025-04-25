export type AIProvider = 'openai' | 'anthropic' | 'local';
export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-2' | 'claude-instant';
export type Theme = 'system' | 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
export type MessageSpacing = 'compact' | 'comfortable' | 'spacious';

export interface UISettings {
  theme: Theme;
  fontSize: FontSize;
  messageSpacing: MessageSpacing;
  showTimestamp: boolean;
  enableAnimations: boolean;
}

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: AIModel;
  temperature: number;
  maxTokens: number;
  defaultSystemPrompt: string;
}

export interface PluginSettings {
  ui: UISettings;
  ai: AISettings;
  shortcuts: {
    toggleChat: string;
    newChat: string;
    focusInput: string;
  };
}

export const DEFAULT_SETTINGS: PluginSettings = {
  ui: {
    theme: 'system',
    fontSize: 'medium',
    messageSpacing: 'comfortable',
    showTimestamp: true,
    enableAnimations: true,
  },
  ai: {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    defaultSystemPrompt: '你是一个智能助手，请帮助我完成任务。',
  },
  shortcuts: {
    toggleChat: 'Mod+Shift+C',
    newChat: 'Mod+Shift+N',
    focusInput: 'Mod+Shift+I',
  },
};
