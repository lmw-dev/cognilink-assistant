import { EmbeddingService } from './EmbeddingService';
import { AIService } from './AIService';
import { cosineDistance } from '../utils/math';

export interface Note {
  title: string;
  content: string;
  link: string;
  path: string;
  tags?: string[];
  embedding?: number[];
  updated?: number;
}

export interface RAGResultGroup {
  tag: string;
  summary: string;
  notes: Note[];
}

export class RAGService {
  private embeddingService: EmbeddingService;
  private aiService: AIService;

  constructor(embeddingService: EmbeddingService, aiService: AIService) {
    this.embeddingService = embeddingService;
    this.aiService = aiService;
  }

  /**
   * 主流程：检索、去重、归类、摘要
   */
  async runRAGPipeline(query: string, topK = 8, threshold = 0.7, dedupThreshold = 0.98): Promise<RAGResultGroup[]> {
    // 1. 检索相关笔记
    const relevantNotes = await this.embeddingService.findRelevantNotes(query, topK, threshold);
    // 2. 去重
    const deduped = this.deduplicateNotes(relevantNotes, dedupThreshold);
    // 3. 归类
    const grouped = this.groupNotesByTag(deduped);
    // 4. 摘要
    const summaries: Record<string, string> = {};
    for (const tag in grouped) {
      summaries[tag] = await this.summarizeGroup(grouped[tag]);
    }
    // 5. 组装结果
    return Object.entries(grouped).map(([tag, notes]) => ({
      tag,
      summary: summaries[tag],
      notes,
    }));
  }

  /**
   * 内容去重：内容全等或 embedding 相似度高视为重复
   */
  deduplicateNotes(notes: Note[], threshold = 0.98): Note[] {
    const unique: Note[] = [];
    for (const note of notes) {
      if (
        !unique.some(
          u =>
            note.content === u.content ||
            (note.embedding && u.embedding && 1 - cosineDistance(note.embedding, u.embedding) > threshold)
        )
      ) {
        unique.push(note);
      }
    }
    return unique;
  }

  /**
   * 按标签归类
   */
  groupNotesByTag(notes: Note[]): Record<string, Note[]> {
    const groups: Record<string, Note[]> = {};
    for (const note of notes) {
      const tags = note.tags && note.tags.length > 0 ? note.tags : ['未分组'];
      for (const tag of tags) {
        if (!groups[tag]) groups[tag] = [];
        groups[tag].push(note);
      }
    }
    return groups;
  }

  /**
   * 对一组内容生成一句话摘要
   */
  async summarizeGroup(notes: Note[]): Promise<string> {
    if (notes.length === 0) return '';
    const content = notes.map(n => n.content).join('\n\n');
    const prompt = `请用一句话总结以下内容：\n${content}`;
    try {
      const res = await this.aiService.sendMessage({
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
        id: Date.now().toString(),
      });
      return res.content;
    } catch (e) {
      return '';
    }
  }

  /**
   * 组装带归因的上下文（编号+来源列表）
   */
  buildContextWithCitations(groups: RAGResultGroup[]): { context: string; sources: string[] } {
    let context = '';
    let sources: string[] = [];
    let idx = 1;
    for (const group of groups) {
      context += `## ${group.tag}\n摘要：${group.summary}\n`;
      for (const note of group.notes) {
        context += `【${idx}】${note.content}\n`;
        sources.push(`[${idx}] ${note.title} (${note.link})`);
        idx++;
      }
    }
    context += '\n来源列表：\n' + sources.join('\n');
    return { context, sources };
  }

  /**
   * 一步完成检索、去重、归类、摘要、归因、LLM内容整合，返回最终 markdown
   */
  async runRAGAndSummarize(query: string, topK = 8, threshold = 0.7, dedupThreshold = 0.98): Promise<string> {
    const groups = await this.runRAGPipeline(query, topK, threshold, dedupThreshold);
    const { context } = this.buildContextWithCitations(groups);
    const prompt = `请基于以下资料，按主题分段整合并归纳总结，内容后附来源编号：\n${context}`;
    try {
      const res = await this.aiService.sendMessage({
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
        id: Date.now().toString(),
      });
      return res.content;
    } catch (e) {
      return '';
    }
  }
} 