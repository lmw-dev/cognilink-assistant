import type { ProviderModelValue } from '../constants/ai-models';
import { App } from 'obsidian';
import { AdvancedPromptTemplate } from './prompt-advanced';

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

export interface PromptModuleSettings {
  enabled: boolean;
  templates: AdvancedPromptTemplate[];
  enableValidation: boolean;
  enablePerformanceTracking: boolean;
  enableCache: boolean;
  cacheSize: number;
  cacheTTL: number;
  maxTemplates: number;
  autoBackup: boolean;
  backupInterval: number;
  defaultAntiAISettings: {
    languageNaturalization: {
      enabled: boolean;
      sentenceVariation: number;
      colloquialLevel: number;
      emotionalNuance: number;
    };
    personalizationInjection: {
      enabled: boolean;
      userStyleMimicry: boolean;
      personalExperience: boolean;
      uniquePerspective: boolean;
    };
    moderateImperfection: {
      enabled: boolean;
      minorInconsistency: number;
      naturalPauses: boolean;
      colloquialErrors: boolean;
    };
  };
}

export interface Settings {
  ui: UISettings;
  ai: AISettings;
  shortcuts: Shortcuts;
  rag?: RAGSettings;
  promptModule: PromptModuleSettings;
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
  },
  promptModule: {
    enabled: true,
    templates: [],
    enableValidation: true,
    enablePerformanceTracking: true,
    enableCache: true,
    cacheSize: 1000,
    cacheTTL: 3600000,
    maxTemplates: 10000,
    autoBackup: true,
    backupInterval: 86400000,
    defaultAntiAISettings: {
      languageNaturalization: {
        enabled: true,
        sentenceVariation: 0.7,
        colloquialLevel: 0.5,
        emotionalNuance: 0.6
      },
      personalizationInjection: {
        enabled: true,
        userStyleMimicry: true,
        personalExperience: true,
        uniquePerspective: true
      },
      moderateImperfection: {
        enabled: true,
        minorInconsistency: 0.03,
        naturalPauses: true,
        colloquialErrors: false
      }
    }
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

export const DEFAULT_PROMPT_MODULE_SETTINGS: PromptModuleSettings = {
  enabled: true,
  templates: [],
  enableValidation: true,
  enablePerformanceTracking: true,
  enableCache: true,
  cacheSize: 1000,
  cacheTTL: 3600000,
  maxTemplates: 10000,
  autoBackup: true,
  backupInterval: 86400000,
  defaultAntiAISettings: {
    languageNaturalization: {
      enabled: true,
      sentenceVariation: 0.7,
      colloquialLevel: 0.5,
      emotionalNuance: 0.6
    },
    personalizationInjection: {
      enabled: true,
      userStyleMimicry: true,
      personalExperience: true,
      uniquePerspective: true
    },
    moderateImperfection: {
      enabled: true,
      minorInconsistency: 0.03,
      naturalPauses: true,
      colloquialErrors: false
    }
  }
};
