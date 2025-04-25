import { PluginSettings } from '../types/settings';

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
    openAIApiKey: '',
    anthropicApiKey: '',
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
