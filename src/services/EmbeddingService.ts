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
        this.logger.info(`[EmbeddingService] 加载缓存索引: ${Object.keys(this.embeddings).length} 个条目`);
        
        // 显示一些示例条目的时间戳
        const sampleKeys = Object.keys(this.embeddings).slice(0, 3);
        for (const key of sampleKeys) {
          const item = this.embeddings[key];
          this.logger.info(`[EmbeddingService] 缓存示例 ${key}: 更新时间 ${new Date(item.updated).toISOString()}`);
        }
      } else {
        this.embeddings = {};
        this.logger.info('[EmbeddingService] 未找到缓存索引文件，从头开始');
      }
      this.isLoaded = true;
    } catch (e) {
      this.logger.error('[EmbeddingService] 加载缓存索引失败', e);
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
   * 删除指定路径的 embedding
   */
  async removeEmbedding(filePath: string): Promise<void> {
    try {
      // 删除主文件的 embedding
      if (this.embeddings[filePath]) {
        delete this.embeddings[filePath];
        this.logger.info(`[EmbeddingService] 删除 embedding: ${filePath}`);
      }

      // 删除分片的 embedding
      const partKeys = Object.keys(this.embeddings).filter(key => key.startsWith(filePath + '#part'));
      for (const partKey of partKeys) {
        delete this.embeddings[partKey];
        this.logger.info(`[EmbeddingService] 删除分片 embedding: ${partKey}`);
      }

      // 保存更新后的索引
      await this.saveEmbeddings();
    } catch (e) {
      this.logger.error(`[EmbeddingService] 删除 embedding 失败: ${filePath}`, e);
    }
  }

  /**
   * findRelevantNotes: 优化版本 - 懒加载 + 数据库优先策略
   */
  async findRelevantNotes(query: string, topK = 5, threshold = 0.75, minScore = 0.82): Promise<Note[]> {
    try {
      await this.loadEmbeddings();
      
      this.logger.info(`[RAG] 开始检索，查询: "${query}"`);
      
      // 1. 首先尝试从现有缓存中进行语义检索
      const cachedResults = await this.searchFromCache(query, topK, minScore);
      
      if (cachedResults.length > 0) {
        this.logger.info(`[RAG] 从缓存中找到 ${cachedResults.length} 个相关结果`);
        return cachedResults;
      }
      
      // 2. 如果缓存中没有足够的结果，进行关键词检索并按需更新
      this.logger.info(`[RAG] 缓存结果不足，进行关键词检索和按需更新`);
      const keywordResults = await this.searchByKeywordsAndUpdate(query, topK);
      
      if (keywordResults.length > 0) {
        return keywordResults;
      }
      
      // 3. 最后的兜底策略：返回任何可用的缓存结果
      this.logger.info(`[RAG] 使用兜底策略，返回可用的缓存结果`);
      return this.getFallbackResults(topK);
      
    } catch (err: any) {
      this.logger.error('[RAG] findRelevantNotes error:', err);
      return [];
    }
  }

  /**
   * 从缓存中进行语义检索
   */
  private async searchFromCache(query: string, topK: number, minScore: number): Promise<Note[]> {
    const cachedPaths = Object.keys(this.embeddings);
    if (cachedPaths.length === 0) {
      this.logger.info('[RAG] 缓存为空，跳过缓存检索');
      return [];
    }
    
    this.logger.info(`[RAG] 从 ${cachedPaths.length} 个缓存条目中检索`);
    
    // 获取 query 嵌入
    const queryEmbedding = await this.aiService.generateEmbeddings(query);
    
    // 计算相似度
    const scores: Array<{path: string, score: number, item: EmbeddingIndexItem}> = [];
    
    for (const path of cachedPaths) {
      const item = this.embeddings[path];
      if (!item.embedding) continue;
      
      const score = 1 - cosineDistance(queryEmbedding, item.embedding);
      if (score >= minScore) {
        scores.push({ path, score, item });
      }
    }
    
    // 排序并取前 topK
    scores.sort((a, b) => b.score - a.score);
    const topResults = scores.slice(0, topK);
    
    this.logger.info(`[RAG] 缓存检索找到 ${topResults.length} 个高分结果`);
    
    // 构建结果，只读取需要的文件内容
    const results: Note[] = [];
    for (const result of topResults) {
      try {
        const file = this.plugin.app.vault.getAbstractFileByPath(result.path) as TFile;
        if (file) {
          // 检查文件是否需要更新
          if (result.item.updated < file.stat.mtime) {
            this.logger.info(`[RAG] 文件已更新，跳过: ${result.path}`);
            continue;
          }
          
          const content = await this.plugin.app.vault.read(file);
          const meta = this.plugin.app.metadataCache.getFileCache(file);
          const tags = (meta?.tags ?? []).map(t => t.tag);
          
          results.push({
            title: file.basename,
            content,
            link: this.createNoteLink(file),
            path: file.path,
            tags,
            updated: file.stat.mtime,
            embedding: result.item.embedding,
          });
        }
      } catch (e) {
        this.logger.error(`[RAG] 读取缓存结果文件失败: ${result.path}`, e);
      }
    }
    
    return results;
  }

  /**
   * 通过关键词检索并按需更新 embeddings
   */
  private async searchByKeywordsAndUpdate(query: string, topK: number): Promise<Note[]> {
    const vault = this.plugin.app.vault;
    const allFiles = vault.getMarkdownFiles();
    
    // 关键词过滤
    const keywords = query.split(/\s+|,|，|。|\.|;|；|:|：|\||\//).filter(Boolean);
    const candidateFiles = allFiles.filter(file => {
      return keywords.some(keyword => 
        file.basename.includes(keyword) || 
        file.path.includes(keyword)
      );
    });
    
    this.logger.info(`[RAG] 关键词检索找到 ${candidateFiles.length} 个候选文件`);
    
    if (candidateFiles.length === 0) {
      return [];
    }
    
    // 限制处理数量，避免一次处理太多文件
    const filesToProcess = candidateFiles.slice(0, Math.min(20, candidateFiles.length));
    const results: Note[] = [];
    
    for (const file of filesToProcess) {
      try {
        const cached = this.embeddings[file.path];
        let needsUpdate = false;
        
        if (!cached) {
          needsUpdate = true;
          this.logger.info(`[RAG] 新文件需要生成 embedding: ${file.path}`);
        } else if (cached.updated < file.stat.mtime) {
          needsUpdate = true;
          this.logger.info(`[RAG] 文件已更新，需要重新生成 embedding: ${file.path}`);
        }
        
        if (needsUpdate) {
          // 按需更新单个文件的 embedding
          const content = await vault.read(file);
          const meta = this.plugin.app.metadataCache.getFileCache(file);
          const tags = (meta?.tags ?? []).map(t => t.tag);
          
          const note: Note = {
            title: file.basename,
            content,
            link: this.createNoteLink(file),
            path: file.path,
            tags,
            updated: file.stat.mtime,
          };
          
          await this.updateEmbedding(note);
          results.push(note);
        } else {
          // 使用缓存的 embedding
          const content = await vault.read(file);
          const meta = this.plugin.app.metadataCache.getFileCache(file);
          const tags = (meta?.tags ?? []).map(t => t.tag);
          
          results.push({
            title: file.basename,
            content,
            link: this.createNoteLink(file),
            path: file.path,
            tags,
            updated: file.stat.mtime,
            embedding: cached.embedding,
          });
        }
      } catch (e) {
        this.logger.error(`[RAG] 处理文件失败: ${file.path}`, e);
      }
    }
    
    this.logger.info(`[RAG] 关键词检索处理完成，返回 ${results.length} 个结果`);
    return results.slice(0, topK);
  }

  /**
   * 兜底策略：返回任何可用的缓存结果
   */
  private getFallbackResults(topK: number): Note[] {
    const cachedPaths = Object.keys(this.embeddings).slice(0, topK);
    const results: Note[] = [];
    
    for (const path of cachedPaths) {
      try {
        const file = this.plugin.app.vault.getAbstractFileByPath(path) as TFile;
        if (file) {
          const item = this.embeddings[path];
          results.push({
            title: file.basename,
            content: '', // 兜底策略不读取内容
            link: this.createNoteLink(file),
            path: file.path,
            tags: [],
            updated: file.stat.mtime,
            embedding: item.embedding,
          });
        }
      } catch (e) {
        // 忽略错误，继续处理下一个
      }
    }
    
    this.logger.info(`[RAG] 兜底策略返回 ${results.length} 个结果`);
    return results;
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
