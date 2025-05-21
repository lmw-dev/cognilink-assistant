import { EmbeddingService } from './EmbeddingService';
import { cosineDistance } from '../utils/math';

export interface OriginalityResult {
  text: string;
  index: number;
  similarity: number;
  sourceTitle: string;
  sourcePath: string;
}

export class OriginalityService {
  private embeddingService: EmbeddingService;

  constructor(embeddingService: EmbeddingService) {
    this.embeddingService = embeddingService;
  }

  /**
   * 对 content 按段落切分，分别与库内所有笔记比对，返回每段的相似度、最相似笔记等
   */
  async checkOriginality(content: string, threshold: number = 0.8): Promise<OriginalityResult[]> {
    // 1. 按段落切分
    const paragraphs = content.split(/\n{2,}/).map(t => t.trim()).filter(Boolean);
    // 2. 获取所有笔记
    const notes = await this.embeddingService.findRelevantNotes('', 100, threshold - 0.1); // 获取全部笔记
    // 3. 预生成所有笔记 embedding
    const noteEmbeddings: { note: any; embedding: number[] }[] = [];
    for (const note of notes) {
      const embedding = await this.embeddingService.generateEmbeddingForText(note.content);
      noteEmbeddings.push({ note, embedding });
    }
    // 4. 检查每段
    const results: OriginalityResult[] = [];
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      const paraEmbedding = await this.embeddingService.generateEmbeddingForText(para);
      let maxSim = 0;
      let bestNote = null;
      for (const { note, embedding } of noteEmbeddings) {
        const sim = 1 - cosineDistance(paraEmbedding, embedding);
        if (sim > maxSim) {
          maxSim = sim;
          bestNote = note;
        }
      }
      results.push({
        text: para,
        index: i,
        similarity: maxSim,
        sourceTitle: bestNote?.title || '',
        sourcePath: bestNote?.path || ''
      });
    }
    return results;
  }
} 