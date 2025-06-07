export const AI_MODELS = {
  openai: [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4o-2024-08-06', label: 'GPT-4o' },
    { value: 'gpt-4.1-mini-2025-04-14', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4.1-nano-2025-04-14', label: 'GPT-4.1 Nano' },
    { value: 'gpt-4.1-2025-04-14', label: 'GPT-4.1' },
  ],
  anthropic: [
    { value: 'claude-2', label: 'Claude 2' },
    { value: 'claude-instant', label: 'Claude Instant' },
  ],
  local: [
    { value: 'local-mock', label: 'Local Mock' },
  ],
  deepseek: [
    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
  ],
  gemini: [
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Exp' },
  ],
} as const;

// Embedding 专用模型配置
export const EMBEDDING_MODELS = {
  openai: [
    { value: 'text-embedding-ada-002', label: 'text-embedding-ada-002' },
    { value: 'text-embedding-3-small', label: 'text-embedding-3-small' },
    { value: 'text-embedding-3-large', label: 'text-embedding-3-large' },
  ],
  gemini: [
    { value: 'gemini-embedding-exp-03-07', label: 'gemini-embedding-exp-03-07' },
  ],
} as const;

export type ProviderModelValue = typeof AI_MODELS[keyof typeof AI_MODELS][number]['value'];
export type EmbeddingModelValue = typeof EMBEDDING_MODELS[keyof typeof EMBEDDING_MODELS][number]['value'];

// 新增 EmbeddingProvider 类型
export type EmbeddingProvider = 'openai' | 'gemini'; 