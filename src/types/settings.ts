import type { ProviderModelValue } from '../constants/ai-models';

export type AIProvider = 'anthropic' | 'local' | 'openai';
export type AIModel = ProviderModelValue;
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

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
}

export interface RAGSettings {
  topK?: number;
  threshold?: number;
  dedupThreshold?: number;
  promptTemplates?: PromptTemplate[];
  defaultPromptTemplateId?: string;
  originality?: {
    threshold: number;
    granularity: 'paragraph' | 'sentence';
  };
}

export interface Settings {
  ui: UISettings;
  ai: AISettings;
  shortcuts: Shortcuts;
  rag?: RAGSettings;
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
  },
  rag: {
    topK: 8,
    threshold: 0.7,
    dedupThreshold: 0.98
  }
};

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'default',
    name: '标准结构',
    content: '请根据主题"${theme}"，结合以下内容：\n${context}\n生成结构清晰、内容丰富的原创文档。'
  },
  {
    id: 'imrad',
    name: '引言-方法-结果-讨论',
    content: '# 引言\n${theme}\n\n# 方法\n${context}\n\n# 结果\n${pinned}\n\n# 讨论\n请基于以上内容生成完整文档。'
  }
];
