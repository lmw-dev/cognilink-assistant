export type AIProvider = 'openai' | 'anthropic' | 'local';

export interface UISettings {
  theme: 'system' | 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  messageSpacing: 'compact' | 'comfortable';
  showTimestamp: boolean;
  enableAnimations: boolean;
}

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
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
