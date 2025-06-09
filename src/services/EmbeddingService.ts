import { TFile } from 'obsidian';
import CogniLinkPlugin from '../main';
import { cosineDistance } from '../utils/math';
import { ConfigurationError, APIError, NetworkError, AIService } from './AIService';
import { Logger } from '../utils/logger';
import { OpenAIProvider } from './OpenAIProvider';
import { GeminiProvider } from './GeminiProvider';
import { AIProvider } from './AIProvider';
import { OptimizedVectorStore } from './optimized-vector-store';
import type { VectorDocument } from '../types/vector-storage';

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

// 近似分词分片
function splitContentByEstimatedTokens(content: string, maxTokens: number): string[] {
  const words = content.match(/[\u4e00-\u9fa5]|[a-zA-Z0-9]+|[.,!?;:，。！？；：]/g) || [];
  const chunks: string[] = [];
  let buf: string[] = [];
  for (let i = 0; i < words.length; i++) {
    buf.push(words[i]);
    if (buf.length >= maxTokens) {
      chunks.push(buf.join(''));
      buf = [];
    }
  }
  if (buf.length > 0) chunks.push(buf.join(''));
  return chunks;
}

// 工具函数：sleep
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 新增：统一的白名单/黑名单过滤工具函数
function shouldIndexFile(path: string, whitelist: string[], blacklist: string[]): boolean {
  const norm = (s: string) => s.trim().replace(/\\/g, '/');
  path = norm(path);
  if (blacklist.some(b => path.startsWith(norm(b)))) return false;
  if (whitelist.length === 0) return true;
  return whitelist.some(w => path.startsWith(norm(w)));
}

export class EmbeddingService {
  private plugin: CogniLinkPlugin;
  private logger: Logger;
  private embeddingProvider: AIProvider;
  private vectorStore: OptimizedVectorStore;

  constructor(plugin: CogniLinkPlugin) {
    this.plugin = plugin;
    this.logger = new Logger('EmbeddingService');
    this.embeddingProvider = this.createEmbeddingProvider();
    // 初始化 LanceDB 向量存储
    this.vectorStore = new OptimizedVectorStore({
      dbPath: 'lancedb',
      tableName: 'embeddings',
      vectorDimension: 1536, // 需与实际 embedding 维度一致
      enableBackup: false,
      backupInterval: 0,
    });
    this.vectorStore.initialize().catch(e => this.logger.error('LanceDB 初始化失败', e));
    this.logger.info('EmbeddingService initialized (LanceDB)');
  }

  private createEmbeddingProvider(): AIProvider {
    const embedding = this.plugin.settings.embedding;
    if (!embedding) {
      throw new Error('Embedding 配置未找到');
    }
    const providerConfig = embedding[embedding.embeddingProvider];
    if (!providerConfig) {
      throw new Error(`Embedding 配置缺少 provider 字段: ${embedding.embeddingProvider}`);
    }
    if (embedding.embeddingProvider === 'openai') {
      return new OpenAIProvider({
        apiKey: providerConfig.apiKey,
        endpoint: providerConfig.endpoint || 'https://api.openai.com/v1',
        model: providerConfig.model || 'text-embedding-ada-002',
        maxTokens: 1,
        temperature: 0,
      });
    } else if (embedding.embeddingProvider === 'gemini') {
      return new GeminiProvider({
        apiKey: providerConfig.apiKey,
        endpoint: providerConfig.endpoint || 'https://generativelanguage.googleapis.com',
        model: providerConfig.model || 'gemini-embedding-exp-03-07',
        maxTokens: 1,
        temperature: 0,
      });
    }
    throw new Error('不支持的 embedding provider: ' + embedding.embeddingProvider);
  }

  /**
   * 更新指定笔记的嵌入，支持分片，写入 LanceDB
   */
  async updateEmbedding(note: Note, chunkPrefix = ''): Promise<void> {
    // 新增：RAG 白/黑名单过滤
    const rag = this.plugin.settings.rag || {};
    const whitelist: string[] = rag.indexWhitelist || [];
    const blacklist: string[] = rag.indexBlacklist || [];
    if (!shouldIndexFile(note.path, whitelist, blacklist)) {
      this.logger.info(`[EmbeddingService] 跳过黑/白名单过滤的文件: ${note.path}`);
      return;
    }
    const maxChunkTokens = (this.plugin.settings as any).embeddingMaxTokens || 2000;
    const rateLimitMs = (this.plugin.settings as any).embeddingRateLimitMs || 1000;
    const chunks = splitContentByEstimatedTokens(note.content, maxChunkTokens);
    const docs: VectorDocument[] = [];
    if (chunks.length > 1) {
      this.logger.info(`分片处理: ${note.path} 共 ${chunks.length} 片，每片最大 ${maxChunkTokens} tokens(近似)`);
      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        const partKey = chunkPrefix ? `${chunkPrefix}-${i+1}` : `${i+1}`;
        try {
          const embedding = await this.embeddingProvider.generateEmbeddings(chunkContent);
          docs.push({
            id: `${note.path}#part${partKey}`,
            content: chunkContent,
            title: `${note.title} (分片${partKey})`,
            tags: note.tags || [],
            updated: note.updated || Date.now(),
            vector: embedding,
            metadata: {
              filePath: note.path,
              noteType: 'markdown',
              wordCount: chunkContent.length,
            },
          });
          await sleep(rateLimitMs);
        } catch (e: any) {
          if (e instanceof Error && String(e.message).includes('maximum context length')) {
            if (chunkContent.length > 100) {
              this.logger.warn(`分片过大，自动递归拆分: ${note.path} 分片${partKey}`);
              const subNote = { ...note, content: chunkContent, title: `${note.title} (递归分片)` };
              await this.updateEmbedding(subNote, partKey);
              continue;
            }
          }
          this.logger.error(`分片 ${partKey} 生成 embedding 失败: ${note.path}`, e);
        }
      }
    } else {
      try {
        const embedding = await this.embeddingProvider.generateEmbeddings(note.content);
        docs.push({
          id: note.path,
          content: note.content,
          title: note.title,
          tags: note.tags || [],
          updated: note.updated || Date.now(),
          vector: embedding,
          metadata: {
            filePath: note.path,
            noteType: 'markdown',
            wordCount: note.content.length,
          },
        });
      } catch (e: any) {
        if (e instanceof Error && String(e.message).includes('maximum context length')) {
          if (note.content.length > 100) {
            this.logger.warn(`单片过大，自动递归拆分: ${note.path}`);
            const subChunks = splitContentByEstimatedTokens(note.content, Math.floor(maxChunkTokens / 2));
            for (let j = 0; j < subChunks.length; j++) {
              const subNote = { ...note, content: subChunks[j], title: `${note.title} (递归分片)` };
              await this.updateEmbedding(subNote, `${chunkPrefix ? chunkPrefix + '-' : ''}${j+1}`);
            }
            return;
          }
        }
        this.logger.error(`单片生成 embedding 失败: ${note.path}`, e);
      }
    }
    if (docs.length > 0) {
      await this.vectorStore.addDocuments(docs);
      this.logger.info(`[LanceDB] 已写入 ${docs.length} 条 embedding: ${note.path}`);
      console.log('[LanceDB][updateEmbedding] 写入文档ID:', docs.map(d => d.id));
    }
  }

  /**
   * 删除指定路径的 embedding（主文件及分片）
   */
  async removeEmbedding(filePath: string): Promise<void> {
    try {
      await this.vectorStore.deleteDocument(filePath);
      // 删除所有分片
      for (let i = 1; i < 20; i++) {
        const partId = `${filePath}#part${i}`;
        await this.vectorStore.deleteDocument(partId);
      }
      this.logger.info(`[LanceDB] 删除 embedding: ${filePath} 及分片`);
    } catch (e) {
      this.logger.error(`[LanceDB] 删除 embedding 失败: ${filePath}`, e);
    }
  }

  /**
   * 检索相关笔记（LanceDB 向量检索）
   */
  async findRelevantNotes(query: string, topK = 5, threshold = 0.75, minScore = 0.82): Promise<Note[]> {
    try {
      // === TOM-122: 获取白名单/黑名单配置 ===
      const rag = this.plugin.settings.rag || {};
      const whitelist: string[] = rag.indexWhitelist || [];
      const blacklist: string[] = rag.indexBlacklist || [];
      console.log('[LanceDB][findRelevantNotes] 当前白名单:', whitelist, '黑名单:', blacklist);
      // 生成 query embedding
      const queryEmbedding = await this.embeddingProvider.generateEmbeddings(query);
      // 构建 filter
      const filter: Record<string, any> = {};
      if (whitelist.length > 0) filter['metadata.filePath'] = whitelist;
      if (blacklist.length > 0) filter['metadata.filePath!'] = blacklist;
      console.log('[LanceDB][findRelevantNotes] 传递给 LanceDB 的 filter:', filter);
      const results = await this.vectorStore.searchByVector(queryEmbedding, {
        limit: topK,
        threshold: minScore,
        filter,
      });
      this.logger.info(`[LanceDB] 检索到 ${results.length} 条相关 embedding`);
      console.log('[LanceDB][findRelevantNotes] 检索到文档ID:', results.map(r => r.document.id));
      return results.map(r => ({
        title: r.document.title,
        content: r.document.content,
        link: this.createNoteLinkFromPath(r.document.metadata?.filePath || r.document.id),
        path: r.document.metadata?.filePath || r.document.id,
        tags: r.document.tags,
        updated: r.document.updated,
        embedding: r.document.vector,
      }));
    } catch (err: any) {
      this.logger.error('[LanceDB] findRelevantNotes error:', err);
      return [];
    }
  }

  /**
   * 生成任意文本的 embedding
   */
  public async generateEmbeddingForText(text: string): Promise<number[]> {
    return this.embeddingProvider.generateEmbeddings(text);
  }

  /**
   * 强制重建所有笔记的 embedding 索引（LanceDB 批量写入）
   */
  public async rebuildAllEmbeddings(): Promise<void> {
    const vault = this.plugin.app.vault;
    const files = vault.getMarkdownFiles();
    let success = 0, fail = 0;
    const failedFiles: string[] = [];
    const docs: VectorDocument[] = [];
    const maxLen = (this.plugin.settings as any).embeddingMaxLength ?? 12000;
    // 新增：获取 RAG 白名单/黑名单
    const rag = this.plugin.settings.rag || {};
    const whitelist: string[] = rag.indexWhitelist || [];
    const blacklist: string[] = rag.indexBlacklist || [];
    for (const file of files) {
      // 新增：写入 embedding 前先过滤
      if (!shouldIndexFile(file.path, whitelist, blacklist)) continue;
      try {
        let content = await vault.read(file);
        if (content.length > maxLen) {
          content = content.slice(0, maxLen);
        }
        let tags: string[] = [];
        try {
          const meta = this.plugin.app.metadataCache.getFileCache(file);
          tags = (meta?.tags ?? []).map((t: any) => t.tag);
        } catch { /* 忽略元数据异常 */ }
        docs.push({
          id: file.path,
          content,
          title: file.basename,
          tags,
          updated: file.stat.mtime,
          vector: await this.embeddingProvider.generateEmbeddings(content),
          metadata: {
            filePath: file.path,
            noteType: 'markdown',
            wordCount: content.length,
          },
        });
        success++;
      } catch (e) {
        fail++;
        failedFiles.push(file.path);
      }
    }
    if (docs.length > 0) {
      await this.vectorStore.batchAdd(docs);
      this.logger.info(`[LanceDB] 批量写入 ${docs.length} 条 embedding`);
      console.log('[LanceDB][rebuildAllEmbeddings] 批量写入文档ID:', docs.map(d => d.id));
    }
    // 通知用户
    if (typeof window !== 'undefined' && (window as any).app && (window as any).app.plugins) {
      new (window as any).Notice(`Embedding 重建完成：成功 ${success}，失败 ${fail}${fail > 0 ? '，失败文件见日志' : ''}`);
    }
    if (fail > 0) {
      this.logger.error('Embedding 失败文件列表: ' + JSON.stringify(failedFiles));
    }
  }

  private createNoteLinkFromPath(path: string): string {
    return `obsidian://open?vault=${encodeURIComponent(this.plugin.app.vault.getName())}&file=${encodeURIComponent(path)}`;
  }
}
