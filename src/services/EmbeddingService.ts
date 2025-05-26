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

function splitContentByParagraph(content: string, maxLen: number): string[] {
  const paras = content.split(/\n{2,}/);
  const chunks: string[] = [];
  let buf = '';
  for (const para of paras) {
    if ((buf + para).length > maxLen && buf.length > 0) {
      chunks.push(buf);
      buf = '';
    }
    buf += para + '\n\n';
  }
  if (buf.trim().length > 0) chunks.push(buf);
  return chunks;
}

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
   * 更新指定笔记的嵌入，支持分片
   */
  async updateEmbedding(note: Note): Promise<void> {
    // 获取最大分片长度
    const maxChunkLen = (this.plugin.settings as any).embeddingChunkLength || 4000;
    if (note.content.length > maxChunkLen) {
      const chunks = splitContentByParagraph(note.content, maxChunkLen);
      this.logger.info(`分片处理: ${note.path} 共 ${chunks.length} 片，每片最大 ${maxChunkLen} 字`);
      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        try {
          // 这里每片都用 AIService.generateEmbeddings（已递归防御超长）
          const embedding = await this.aiService.generateEmbeddings(chunkContent);
          this.embeddings[`${note.path}#part${i+1}`] = {
            path: `${note.path}#part${i+1}`,
            embedding,
            updated: Date.now(),
            title: `${note.title} (分片${i+1})`,
            tags: note.tags || [],
          };
        } catch (e) {
          this.logger.error(`分片 ${i+1} 生成 embedding 失败: ${note.path}`, e);
        }
      }
    } else {
      try {
        const embedding = await this.aiService.generateEmbeddings(note.content);
        this.embeddings[note.path] = {
          path: note.path,
          embedding,
          updated: Date.now(),
          title: note.title,
          tags: note.tags || [],
        };
      } catch (e) {
        this.logger.error(`单片生成 embedding 失败: ${note.path}`, e);
      }
    }
    await this.saveEmbeddings();
  }

  /**
   * findRelevantNotes: 支持增量嵌入生成与本地缓存 + 语义检索与排序 + 阈值 + 关键词兜底
   */
  async findRelevantNotes(query: string, topK = 5, threshold = 0.75, minScore = 0.82): Promise<Note[]> {
    try {
      await this.loadEmbeddings();
      // 1. 加载所有笔记
      const vault = this.plugin.app.vault;
      const files = vault.getMarkdownFiles();
      const notes: Note[] = [];
      for (const file of files) {
        const content = await vault.read(file);
        let tags: string[] = [];
        try {
          const meta = this.plugin.app.metadataCache.getFileCache(file);
          tags = (meta?.tags ?? []).map(t => t.tag);
        } catch { /* 忽略元数据异常 */ }
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
      // 4. 计算相似度并排序（支持分片聚合）
      const notesWithScores = notes.map(note => {
        const partKeys = Object.keys(this.embeddings).filter(k => k === note.path || k.startsWith(note.path + '#part'));
        if (partKeys.length === 0) return { note, score: 0, embedding: undefined };
        const allEmbeddings = partKeys.map(k => this.embeddings[k].embedding);
        const dim = allEmbeddings[0].length;
        const avg: number[] = Array(dim).fill(0);
        for (const emb of allEmbeddings) {
          for (let i = 0; i < dim; i++) avg[i] += emb[i];
        }
        for (let i = 0; i < dim; i++) avg[i] /= allEmbeddings.length;
        note.embedding = avg;
        const score = 1 - cosineDistance(queryEmbedding, avg);
        return { note, score, embedding: avg };
      });
      // 5. 只保留高分内容
      const highScore = notesWithScores.filter(item => item.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
      this.logger.info(`[RAG] 高分内容筛选后剩余: ${highScore.length}`);
      // 6. 主题关键词二次过滤
      const themeWords = query.split(/\s+|,|，|。|\.|;|；|:|：|\||\//).filter(Boolean);
      const keywordFiltered = highScore.filter(item => {
        const n = item.note;
        return themeWords.some(word =>
          n.title.includes(word) ||
          (n.tags && n.tags.some(tag => tag.includes(word))) ||
          n.content.includes(word)
        );
      });
      this.logger.info(`[RAG] 主题词二次过滤后剩余: ${keywordFiltered.length}`);
      if (keywordFiltered.length > 0) {
        return keywordFiltered.map(item => item.note);
      }
      // 7. 若无结果，回退到高分 embedding 内容
      if (highScore.length > 0) {
        return highScore.map(item => item.note);
      }
      // 8. 兜底关键词检索（标题/标签），补 embedding 字段
      const keywordHits = notes.filter(n =>
        n.title.includes(query) || (n.tags && n.tags.some(tag => query.includes(tag)))
      ).slice(0, topK);
      for (const n of keywordHits) {
        const partKeys = Object.keys(this.embeddings).filter(k => k === n.path || k.startsWith(n.path + '#part'));
        if (partKeys.length > 0) {
          const allEmbeddings = partKeys.map(k => this.embeddings[k].embedding);
          const dim = allEmbeddings[0].length;
          const avg: number[] = Array(dim).fill(0);
          for (const emb of allEmbeddings) {
            for (let i = 0; i < dim; i++) avg[i] += emb[i];
          }
          for (let i = 0; i < dim; i++) avg[i] /= allEmbeddings.length;
          n.embedding = avg;
        }
      }
      this.logger.info(`[RAG] 兜底关键词检索后剩余: ${keywordHits.length}`);
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

  /**
   * 生成任意文本的 embedding
   */
  public async generateEmbeddingForText(text: string): Promise<number[]> {
    return this.aiService.generateEmbeddings(text);
  }

  /**
   * 强制重建所有笔记的 embedding 索引
   */
  public async rebuildAllEmbeddings(): Promise<void> {
    const vault = this.plugin.app.vault;
    const files = vault.getMarkdownFiles();
    let success = 0, fail = 0;
    const failedFiles: string[] = [];
    for (const file of files) {
      try {
        const content = await vault.read(file);
        let tags: string[] = [];
        try {
          const meta = this.plugin.app.metadataCache.getFileCache(file);
          tags = (meta?.tags ?? []).map(t => t.tag);
        } catch { /* 忽略元数据异常 */ }
        await this.updateEmbedding({
          title: file.basename,
          content,
          link: this.createNoteLink(file),
          path: file.path,
          tags,
          updated: file.stat.mtime,
        });
        success++;
      } catch (e) {
        this.logger.error(`Embedding failed for ${file.path}`, e);
        fail++;
        failedFiles.push(file.path);
      }
    }
    await this.saveEmbeddings();
    // 通知用户
    // @ts-expect-error: Obsidian Notice 类型检查兼容
    if (typeof window !== 'undefined' && window.app && window.app.plugins) {
      // Obsidian Notice
      // @ts-expect-error: Obsidian Notice 类型检查兼容
      new window.Notice(`Embedding 重建完成：成功 ${success}，失败 ${fail}${fail > 0 ? '，失败文件见日志' : ''}`);
    }
    if (fail > 0) {
      this.logger.error('Embedding 失败文件列表: ' + JSON.stringify(failedFiles));
    }
  }
}
