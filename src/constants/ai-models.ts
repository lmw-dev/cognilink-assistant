export const AI_MODELS = {
  openai: [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4o', label: 'GPT-4o' },
  ],
  anthropic: [
    { value: 'claude-2', label: 'Claude 2' },
    { value: 'claude-instant', label: 'Claude Instant' },
  ],
  local: [
    { value: 'local-mock', label: 'Local Mock' },
  ],
} as const;

export type ProviderModelValue = typeof AI_MODELS[keyof typeof AI_MODELS][number]['value']; 