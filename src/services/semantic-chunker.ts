import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { countTokens } from '../utils/tokenUtils';
import { Logger } from '../utils/logger';

export interface SemanticChunkerOptions {
  chunkSize: number;           // 目标分块大小 (默认: 512)
  chunkOverlap: number;        // 重叠大小 (默认: 50)
  maxChunkSize: number;        // 最大分块大小 (默认: 600)
  minChunkSize: number;        // 最小分块大小 (默认: 100)
  preserveHeaders: boolean;    // 是否保留标题信息 (默认: true)
  enableSemanticSplit: boolean; // 是否启用语义分割 (默认: true)
}

export interface DocumentMetadata {
  filePath: string;
  title?: string;
  tags?: string[];
  lastModified?: number;
  noteType?: string;
}

export interface ChunkMetadata extends DocumentMetadata {
  chunkIndex: number;          // 分块序号
  headerPath: string[];        // 标题路径 (如: ["# 主标题", "## 子标题"])
  chunkType: 'header' | 'content' | 'code' | 'list'; // 分块类型
  parentChunkId?: string;      // 父分块ID（如果有）
  wordCount: number;           // 词数统计
}

export interface DocumentChunk {
  id: string;                  // 唯一标识符
  content: string;             // 分块内容
  metadata: ChunkMetadata;     // 分块元数据
  startIndex: number;          // 在原文档中的起始位置
  endIndex: number;            // 在原文档中的结束位置
  tokenCount: number;          // Token数量
}

interface HeaderChunk {
  content: string;
  metadata: Record<string, string>;
  startIndex: number;
  endIndex: number;
}

interface SemanticChunk extends HeaderChunk {
  tokenCount: number;
}

export class SemanticChunker {
  private headerSplitter: MarkdownTextSplitter;
  private textSplitter: RecursiveCharacterTextSplitter;
  private options: SemanticChunkerOptions;
  private logger: Logger;

  constructor(options?: Partial<SemanticChunkerOptions>) {
    this.options = {
      chunkSize: 512,
      chunkOverlap: 50,
      maxChunkSize: 600,
      minChunkSize: 100,
      preserveHeaders: true,
      enableSemanticSplit: true,
      ...options,
    };
    
    this.headerSplitter = this.initializeHeaderSplitter();
    this.textSplitter = this.initializeTextSplitter();
    this.logger = new Logger('SemanticChunker');
  }

  /**
   * 初始化标题分割器
   */
  private initializeHeaderSplitter(): MarkdownTextSplitter {
    return new MarkdownTextSplitter({
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap,
    });
  }

  /**
   * 初始化递归字符分割器
   */
  private initializeTextSplitter(): RecursiveCharacterTextSplitter {
    return new RecursiveCharacterTextSplitter({
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap,
      separators: [
        "\n#{1,6} ",   // Markdown标题
        "\n```\n",     // 代码块
        "\n---\n",     // 水平线
        "\n\n",        // 段落分隔
        "\n",          // 行分隔
        ". ",          // 句子分隔
        " ",           // 词分隔
        "",            // 字符分隔
      ],
      lengthFunction: (text: string) => countTokens(text, 'openai'),
    });
  }

  /**
   * 对文档进行分块处理
   */
  async chunkDocument(
    content: string, 
    metadata?: DocumentMetadata
  ): Promise<DocumentChunk[]> {
    return this.chunkMarkdown(content, metadata);
  }

  /**
   * 对Markdown文档进行智能分块
   */
  async chunkMarkdown(
    markdownContent: string, 
    metadata?: DocumentMetadata
  ): Promise<DocumentChunk[]> {
    try {
      this.logger.info(`Starting semantic chunking for document: ${metadata?.filePath || 'unknown'}`);
      
      // 阶段1: 按标题结构分割
      const headerChunks = await this.splitByHeaders(markdownContent);
      this.logger.info(`Header splitting produced ${headerChunks.length} chunks`);
      
      // 阶段2: 语义感知二次分割
      const semanticChunks = await this.splitSemanticChunks(headerChunks);
      this.logger.info(`Semantic splitting produced ${semanticChunks.length} chunks`);
      
      // 阶段3: 后处理和元数据增强
      const finalChunks = await this.postProcessChunks(semanticChunks, metadata);
      this.logger.info(`Final processing produced ${finalChunks.length} chunks`);
      
      return finalChunks;
    } catch (error) {
      this.logger.error('Chunking failed, falling back to simple strategy', error);
      return this.fallbackChunking(markdownContent, metadata);
    }
  }

  /**
   * 按标题结构分割
   */
  private async splitByHeaders(content: string): Promise<HeaderChunk[]> {
    try {
      const headerDocs = await this.headerSplitter.splitText(content);
      
      return headerDocs.map((docContent: string, index: number) => {
        const startIndex = content.indexOf(docContent);
        return {
          content: docContent,
          metadata: {},
          startIndex: startIndex >= 0 ? startIndex : index * 1000, // 估算位置
          endIndex: startIndex >= 0 ? startIndex + docContent.length : (index + 1) * 1000,
        };
      });
    } catch (error) {
      this.logger.warn('Header splitting failed, using whole document', error);
      return [{
        content,
        metadata: {},
        startIndex: 0,
        endIndex: content.length,
      }];
    }
  }

  /**
   * 语义感知二次分割
   */
  private async splitSemanticChunks(headerChunks: HeaderChunk[]): Promise<SemanticChunk[]> {
    const semanticChunks: SemanticChunk[] = [];

    for (const headerChunk of headerChunks) {
      const tokenCount = countTokens(headerChunk.content, 'openai');
      
      // 如果块大小合适，直接使用
      if (tokenCount <= this.options.maxChunkSize && tokenCount >= this.options.minChunkSize) {
        semanticChunks.push({
          ...headerChunk,
          tokenCount,
        });
        continue;
      }

      // 如果块太大，进行二次分割
      if (tokenCount > this.options.maxChunkSize && this.options.enableSemanticSplit) {
        try {
          const subDocs = await this.textSplitter.splitText(headerChunk.content);
          
          subDocs.forEach((subContent, subIndex) => {
            const subTokenCount = countTokens(subContent, 'openai');
            const subStartIndex = headerChunk.content.indexOf(subContent);
            
            semanticChunks.push({
              content: subContent,
                             metadata: {
                 ...headerChunk.metadata,
                 subChunkIndex: subIndex.toString(),
               },
              startIndex: headerChunk.startIndex + (subStartIndex >= 0 ? subStartIndex : subIndex * 100),
              endIndex: headerChunk.startIndex + (subStartIndex >= 0 ? subStartIndex + subContent.length : (subIndex + 1) * 100),
              tokenCount: subTokenCount,
            });
          });
        } catch (error) {
          this.logger.warn('Semantic splitting failed for chunk, using original', error);
          semanticChunks.push({
            ...headerChunk,
            tokenCount,
          });
        }
      } else {
        // 块太小或禁用语义分割，直接使用
        semanticChunks.push({
          ...headerChunk,
          tokenCount,
        });
      }
    }

    return semanticChunks;
  }

  /**
   * 后处理和元数据增强
   */
  private async postProcessChunks(
    chunks: SemanticChunk[], 
    metadata?: DocumentMetadata
  ): Promise<DocumentChunk[]> {
    return chunks.map((chunk, index) => {
      const chunkId = this.generateChunkId(metadata?.filePath || 'unknown', index);
      const headerPath = this.extractHeaderPath(chunk.metadata);
      const chunkType = this.determineChunkType(chunk.content);
      const wordCount = this.countWords(chunk.content);

      return {
        id: chunkId,
        content: chunk.content.trim(),
        metadata: {
          ...metadata,
          chunkIndex: index,
          headerPath,
          chunkType,
          wordCount,
          filePath: metadata?.filePath || 'unknown',
          title: metadata?.title,
          tags: metadata?.tags || [],
          lastModified: metadata?.lastModified,
          noteType: metadata?.noteType || 'markdown',
        },
        startIndex: chunk.startIndex,
        endIndex: chunk.endIndex,
        tokenCount: chunk.tokenCount,
      };
    });
  }

  /**
   * 降级分块策略
   */
  private async fallbackChunking(
    content: string, 
    metadata?: DocumentMetadata
  ): Promise<DocumentChunk[]> {
    this.logger.info('Using fallback chunking strategy');
    
    // 简单的段落分割
    const paragraphs = content.split(/\n{2,}/).filter(p => p.trim().length > 0);
    const chunks: DocumentChunk[] = [];
    let currentIndex = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      const tokenCount = countTokens(paragraph, 'openai');
      const startIndex = content.indexOf(paragraph, currentIndex);
      const endIndex = startIndex + paragraph.length;
      
      chunks.push({
        id: this.generateChunkId(metadata?.filePath || 'unknown', i),
        content: paragraph.trim(),
        metadata: {
          ...metadata,
          chunkIndex: i,
          headerPath: [],
          chunkType: 'content',
          wordCount: this.countWords(paragraph),
          filePath: metadata?.filePath || 'unknown',
          title: metadata?.title,
          tags: metadata?.tags || [],
          lastModified: metadata?.lastModified,
          noteType: metadata?.noteType || 'markdown',
        },
        startIndex,
        endIndex,
        tokenCount,
      });

      currentIndex = endIndex;
    }

    return chunks;
  }

  /**
   * 生成分块ID
   */
  private generateChunkId(filePath: string, index: number): string {
    const timestamp = Date.now();
    const pathHash = this.simpleHash(filePath);
    return `chunk_${pathHash}_${index}_${timestamp}`;
  }

  /**
   * 提取标题路径
   */
  private extractHeaderPath(metadata: Record<string, string>): string[] {
    const headerPath: string[] = [];
    
    // 从metadata中提取标题信息
    for (let i = 1; i <= 4; i++) {
      const headerKey = `Header ${i}`;
      if (metadata[headerKey]) {
        headerPath.push(`${'#'.repeat(i)} ${metadata[headerKey]}`);
      }
    }
    
    return headerPath;
  }

  /**
   * 确定分块类型
   */
  private determineChunkType(content: string): 'header' | 'content' | 'code' | 'list' {
    const trimmedContent = content.trim();
    
    if (trimmedContent.startsWith('#')) {
      return 'header';
    }
    
    if (trimmedContent.includes('```')) {
      return 'code';
    }
    
    if (trimmedContent.match(/^[\s]*[-*+]\s/m) || trimmedContent.match(/^[\s]*\d+\.\s/m)) {
      return 'list';
    }
    
    return 'content';
  }

  /**
   * 计算词数
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * 简单哈希函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 获取分块质量统计
   */
  getChunkingStats(chunks: DocumentChunk[]): {
    totalChunks: number;
    averageTokenCount: number;
    averageWordCount: number;
    sizeDistribution: { min: number; max: number; median: number };
    typeDistribution: Record<string, number>;
  } {
    if (chunks.length === 0) {
      return {
        totalChunks: 0,
        averageTokenCount: 0,
        averageWordCount: 0,
        sizeDistribution: { min: 0, max: 0, median: 0 },
        typeDistribution: {},
      };
    }

    const tokenCounts = chunks.map(c => c.tokenCount);
    const wordCounts = chunks.map(c => c.metadata.wordCount);
    const sortedTokenCounts = [...tokenCounts].sort((a, b) => a - b);
    
    const typeDistribution: Record<string, number> = {};
    chunks.forEach(chunk => {
      const type = chunk.metadata.chunkType;
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    return {
      totalChunks: chunks.length,
      averageTokenCount: tokenCounts.reduce((a, b) => a + b, 0) / chunks.length,
      averageWordCount: wordCounts.reduce((a, b) => a + b, 0) / chunks.length,
      sizeDistribution: {
        min: Math.min(...tokenCounts),
        max: Math.max(...tokenCounts),
        median: sortedTokenCounts[Math.floor(sortedTokenCounts.length / 2)],
      },
      typeDistribution,
    };
  }
} 