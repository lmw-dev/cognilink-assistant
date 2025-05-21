import { TFile } from 'obsidian';
import CogniLinkPlugin from '../main';
import { cosineDistance } from '../utils/math';
import { ConfigurationError, APIError, NetworkError, AIService } from './AIService';
import { Logger } from '../utils/logger';

interface Note {
  title: string;
  content: string;
  link: string;
  path: string;
  tags?: string[];
  embedding?: number[];
  updated?: number;
}

interface EmbeddingIndexItem {
  path: string;
  embedding: number[];
  updated: number;
  title: string;
  tags?: string[];
}

const EMBEDDINGS_INDEX_PATH = '.obsidian/plugins/cognilink-assistant/embeddings.json';

export class EmbeddingService {
  private plugin: CogniLinkPlugin;
  private logger: Logger;
  private aiService: AIService;
  private embeddings: Record<string, EmbeddingIndexItem> = {};
  private isLoaded = false;

  constructor(plugin: CogniLinkPlugin) {
    this.plugin = plugin;
    this.logger = new Logger('EmbeddingService');
    this.aiService = new AIService(plugin);
    this.logger.info('EmbeddingService initialized');
  }

  /**
   * 加载本地嵌入索引
   */
  async loadEmbeddings(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const exists = await this.plugin.app.vault.adapter.exists(EMBEDDINGS_INDEX_PATH);
      if (exists) {
        const raw = await this.plugin.app.vault.adapter.read(EMBEDDINGS_INDEX_PATH);
        this.embeddings = JSON.parse(raw);
        this.logger.info('Loaded embeddings index:', Object.keys(this.embeddings).length);
      } else {
        this.embeddings = {};
        this.logger.info('No embeddings index found, starting fresh');
      }
      this.isLoaded = true;
    } catch (e) {
      this.logger.error('Failed to load embeddings index', e);
      this.embeddings = {};
      this.isLoaded = true;
    }
  }

  /**
   * 保存本地嵌入索引
   */
  async saveEmbeddings(): Promise<void> {
    try {
      await this.plugin.app.vault.adapter.mkdir('.obsidian/plugins/cognilink-assistant').catch(() => {});
      await this.plugin.app.vault.adapter.write(EMBEDDINGS_INDEX_PATH, JSON.stringify(this.embeddings, null, 2));
      this.logger.info('Saved embeddings index');
    } catch (e) {
      this.logger.error('Failed to save embeddings index', e);
    }
  }

  /**
   * 更新指定笔记的嵌入
   */
  async updateEmbedding(note: Note): Promise<void> {
    const embedding = await this.aiService.generateEmbeddings(note.content);
    this.embeddings[note.path] = {
      path: note.path,
      embedding,
      updated: Date.now(),
      title: note.title,
      tags: note.tags || [],
    };
    await this.saveEmbeddings();
  }

  /**
   * findRelevantNotes: 支持增量嵌入生成与本地缓存 + 语义检索与排序 + 阈值 + 关键词兜底
   */
  async findRelevantNotes(query: string, topK = 5, threshold = 0.75): Promise<Note[]> {
    try {
      await this.loadEmbeddings();
      // 1. 加载所有笔记
      const vault = this.plugin.app.vault;
      const files = vault.getMarkdownFiles();
      const notes: Note[] = [];
      for (const file of files) {
        const content = await vault.read(file);
        // 获取 tags（可选，需 metadataCache）
        let tags: string[] = [];
        try {
          const meta = this.plugin.app.metadataCache.getFileCache(file);
          tags = (meta?.tags ?? []).map(t => t.tag);
        } catch (e) {
          // 忽略元数据异常
        }
        notes.push({
          title: file.basename,
          content,
          link: this.createNoteLink(file),
          path: file.path,
          tags,
          updated: file.stat.mtime,
        });
      }
      // 2. 检查哪些笔记需要生成嵌入（新增/变更）
      const toUpdate = notes.filter(note => {
        const idx = this.embeddings[note.path];
        return !idx || idx.updated < (note.updated || 0);
      });
      if (toUpdate.length > 0) {
        this.logger.info(`Updating embeddings for ${toUpdate.length} notes...`);
        for (const note of toUpdate) {
          await this.updateEmbedding(note);
        }
      }
      // 3. 获取 query 嵌入
      const queryEmbedding = await this.aiService.generateEmbeddings(query);
      // 4. 计算相似度并排序
      const notesWithScores = notes.map(note => {
        const idx = this.embeddings[note.path];
        const score = idx ? 1 - cosineDistance(queryEmbedding, idx.embedding) : 0;
        return { note, score };
      });
      // 5. 按相似度降序排序，筛选大于阈值的 topK
      const filtered = notesWithScores.filter(item => item.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
      if (filtered.length > 0) {
        return filtered.map(item => item.note);
      }
      // 6. 兜底关键词检索（标题/标签）
      const keywordHits = notes.filter(n =>
        n.title.includes(query) || (n.tags && n.tags.some(tag => query.includes(tag)))
      ).slice(0, topK);
      return keywordHits;
    } catch (err: any) {
      this.logger.error('findRelevantNotes error:', err);
      return [];
    }
  }

  private createNoteLink(file: TFile): string {
    return `obsidian://open?vault=${encodeURIComponent(this.plugin.app.vault.getName())}&file=${encodeURIComponent(file.path)}`;
  }

  public cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) {
      return 0;
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
