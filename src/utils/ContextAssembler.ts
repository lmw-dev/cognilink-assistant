import { countTokens } from './tokenUtils';

export interface ContextPiece {
  id: string;
  content: string;
  pinned?: boolean;
  tokens?: number;
  summary?: string;
}

export interface AssembleContextOptions {
  pieces: ContextPiece[];
  maxTokens: number;
  provider: 'openai' | 'anthropic';
  summaryFn?: (content: string) => Promise<string>;
}

export async function assembleContext({
  pieces,
  maxTokens,
  provider,
  summaryFn
}: AssembleContextOptions): Promise<{ context: string; usedTokens: number; dropped: ContextPiece[] }> {
  const pinned = pieces.filter(p => p.pinned);
  const others = pieces.filter(p => !p.pinned).sort((a, b) => (b.tokens ?? 0) - (a.tokens ?? 0));
  let context = '';
  let usedTokens = 0;
  const dropped: ContextPiece[] = [];

  // 插入 pinned
  for (const p of pinned) {
    const t = countTokens(p.content, provider);
    if (usedTokens + t > maxTokens) break;
    context += p.content + '\n';
    usedTokens += t;
  }

  // 插入相关内容
  for (const p of others) {
    const t = countTokens(p.content, provider);
    if (usedTokens + t > maxTokens) {
      if (summaryFn) {
        const summary = await summaryFn(p.content);
        const st = countTokens(summary, provider);
        if (usedTokens + st <= maxTokens) {
          context += summary + '\n';
          usedTokens += st;
          continue;
        }
      }
      dropped.push(p);
      continue;
    }
    context += p.content + '\n';
    usedTokens += t;
  }

  return { context: context.trim(), usedTokens, dropped };
} 