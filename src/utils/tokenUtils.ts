export function countTokens(text: string, provider: 'openai' | 'anthropic'): number {
  if (!text) return 0;
  if (provider === 'openai') return Math.ceil(text.length / 4);
  if (provider === 'anthropic') return Math.ceil(text.length / 3.5);
  return text.length;
} 