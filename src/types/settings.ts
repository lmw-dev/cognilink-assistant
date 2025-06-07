import type { ProviderModelValue, EmbeddingModelValue } from '../constants/ai-models';
import { App } from 'obsidian';
import { AdvancedPromptTemplate, PlatformId } from './prompt-advanced';
import { Conversation } from './conversation';
import { EmbeddingProvider } from '../constants/ai-models';

export type AIProvider = 'anthropic' | 'openai' | 'local' | 'gemini' | 'deepseek';
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
  geminiApiKey?: string;
  geminiEndpoint?: string;
  deepseekApiKey?: string;
  deepseekEndpoint?: string;
  temperature: number;
  maxTokens: number;
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
  /** TOM-122: 支持RAG白名单/黑名单文件夹索引范围配置 */
  indexWhitelist?: string[];
  indexBlacklist?: string[];
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

export interface EmbeddingProviderConfig {
  model: EmbeddingModelValue;
  apiKey: string;
  endpoint: string;
}

export interface EmbeddingSettings {
  embeddingProvider: 'openai' | 'gemini';
  openai: EmbeddingProviderConfig;
  gemini: EmbeddingProviderConfig;
}

export interface Settings {
  ui: UISettings;
  ai: AISettings;
  embedding: EmbeddingSettings;
  shortcuts: Shortcuts;
  rag?: RAGSettings;
  promptModule: PromptModuleSettings;
}

export interface AIServiceError {
  code: string | number;
  message: string;
  type?: string;
  param?: string;
}

const ALL_DEFINED_PLATFORMS_FOR_DEFAULT: PlatformId[] = [
    'xiaohongshu', 'twitter', 'wechat', 'blog', 'toutiao', 'zhihu', 'douyin', 'linkedin'
];

export interface PluginSettings {
  ui: UISettings;
  ai: AISettings;
  embedding: EmbeddingSettings;
  shortcuts: Shortcuts;
  rag?: RAGSettings;
  promptModule: PromptModuleSettings;
  showConversationsInRibbon: boolean;
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  promptTemplates: { [key: string]: string };
  currentConversationId: string | null;
  conversations: Array<Conversation>;
  enableMemory: boolean;
  maxMemoryTokens: number;
  autoSaveConversations: boolean;
  debugMode: boolean;
  aiProvider: AIProvider;
  apiKey: string;
  openAIBaseUrl?: string;
  googleCloudApiKey?: string;
  anthropicApiKey?: string;
  groqApiKey?: string;
  cohereApiKey?: string;
  deepSeekApiKey?: string;
  geminiModelName?: string;
  openAIModelName?: string;
  anthropicModelName?: string;
  groqModelName?: string;
  cohereModelName?: string;
  deepSeekModelName?: string;
  embeddingProvider: EmbeddingProvider;
  embeddingModelName?: string;
  showProviderInStatusBar: boolean;
  customAdvancedTemplates: AdvancedPromptTemplate[];
  defaultAdvancedTemplates: Record<PlatformId, string | null>;
}

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
    geminiApiKey: '',
    geminiEndpoint: 'https://api.gemini.com',
    deepseekApiKey: '',
    deepseekEndpoint: 'https://api.deepseek.com',
    maxTokens: 2000,
    temperature: 0.7,
    defaultSystemPrompt: 'You are a helpful AI assistant.'
  },
  embedding: {
    embeddingProvider: 'openai',
    openai: {
      model: 'text-embedding-ada-002',
      apiKey: '',
      endpoint: 'https://api.openai.com/v1'
    },
    gemini: {
      model: 'gemini-embedding-exp-03-07',
      apiKey: '',
      endpoint: 'https://generativelanguage.googleapis.com'
    },
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
    dedupThreshold: 0.98,
    /** TOM-122: 默认白名单/黑名单配置 */
    indexWhitelist: ['Golden-Knowledge/'],
    indexBlacklist: ['Clippings/', '_resources/']
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
  },
  showConversationsInRibbon: true,
  defaultModel: 'gpt-3.5-turbo',
  defaultTemperature: 0.7,
  defaultMaxTokens: 2000,
  promptTemplates: {},
  currentConversationId: null,
  conversations: [],
  enableMemory: true,
  maxMemoryTokens: 4000,
  autoSaveConversations: true,
  debugMode: false,
  aiProvider: 'openai',
  apiKey: '',
  showProviderInStatusBar: true,
  embeddingProvider: 'openai',
  customAdvancedTemplates: [],
  defaultAdvancedTemplates: ALL_DEFINED_PLATFORMS_FOR_DEFAULT.reduce((acc, platformId) => {
    acc[platformId] = null;
    return acc;
  }, {} as Record<PlatformId, string | null>),
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

export const AI_PROVIDERS = [
  'anthropic',
  'openai',
  'local',
  'gemini',
  'deepseek'
];
