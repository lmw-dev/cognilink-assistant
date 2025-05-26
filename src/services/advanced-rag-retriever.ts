import { OptimizedVectorStore } from './optimized-vector-store';
import { SearchResult, SearchOptions } from '../types/vector-storage';
import { EmbeddingService } from './EmbeddingService';
import { Logger } from '../utils/logger';
import { cosineDistance } from '../utils/math';

export interface AdvancedRAGOptions {
  keywordWeight: number;        // 关键词权重 (默认: 0.3)
  diversityThreshold: number;   // 多样性阈值 (默认: 0.85)
  maxResults: number;           // 最大返回结果数 (默认: 8)
}

export interface RetrievalOptions {
  topK?: number;               // 返回结果数量
  minScore?: number;           // 最小相似度阈值
  includeMetadata?: boolean;   // 是否包含元数据
  filter?: Record<string, any>; // 过滤条件
}

export interface EnhancedSearchResult extends SearchResult {
  keywordScore: number;        // 关键词匹配分数
  combinedScore: number;       // 综合评分
  diversityRank: number;       // 多样性排名
  matchedKeywords: string[];   // 匹配的关键词
}

export class AdvancedRAGRetriever {
  private vectorStore: OptimizedVectorStore;
  private embeddingService: EmbeddingService;
  private options: AdvancedRAGOptions;
  private logger: Logger;

  constructor(
    vectorStore: OptimizedVectorStore,
    embeddingService: EmbeddingService,
    options?: Partial<AdvancedRAGOptions>
  ) {
    this.vectorStore = vectorStore;
    this.embeddingService = embeddingService;
    this.options = {
      keywordWeight: 0.3,
      diversityThreshold: 0.85,
      maxResults: 8,
      ...options,
    };
    this.logger = new Logger('AdvancedRAGRetriever');
  }

  /**
   * 多阶段检索主方法
   */
  async retrieve(
    query: string, 
    options?: RetrievalOptions
  ): Promise<EnhancedSearchResult[]> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Starting advanced RAG retrieval for query: "${query}"`);
      
      // 阶段1: 语义检索
      const semanticResults = await this._semanticSearch(query, options);
      this.logger.info(`Semantic search returned ${semanticResults.length} results`);
      
      // 阶段2: 关键词增强
      const enhancedResults = await this._enhanceWithKeywords(semanticResults, query);
      this.logger.info(`Keyword enhancement completed`);
      
      // 阶段3: 多样性重排序
      const finalResults = await this._diversifyResults(enhancedResults, options?.topK);
      this.logger.info(`Diversity reranking completed, final results: ${finalResults.length}`);
      
      const endTime = Date.now();
      this.logger.info(`Advanced RAG retrieval completed in ${endTime - startTime}ms`);
      
      return finalResults;
    } catch (error) {
      this.logger.error('Advanced RAG retrieval failed', error);
      // 降级到简单检索
      return this._fallbackRetrieval(query, options);
    }
  }

  /**
   * 阶段1: 语义检索
   */
  private async _semanticSearch(query: string, options?: RetrievalOptions): Promise<SearchResult[]> {
    try {
      // 生成查询向量
      const queryEmbedding = await this.embeddingService.generateEmbeddingForText(query);
      
      // 扩大检索范围，为后续阶段提供更多候选
      const expandedTopK = (options?.topK || this.options.maxResults) * 2;
      const minScore = options?.minScore || 0.7;
      
      const searchOptions: SearchOptions = {
        limit: expandedTopK,
        threshold: minScore,
        filter: options?.filter,
      };
      
      // 执行向量搜索
      const results = await this.vectorStore.searchByVector(queryEmbedding, searchOptions);
      
      this.logger.info(`Semantic search found ${results.length} results above threshold ${minScore}`);
      return results;
    } catch (error) {
      this.logger.error('Semantic search failed', error);
      throw error;
    }
  }

  /**
   * 阶段2: 关键词匹配增强
   */
  private async _enhanceWithKeywords(
    results: SearchResult[], 
    query: string
  ): Promise<EnhancedSearchResult[]> {
    const queryTerms = this._extractKeywords(query);
    this.logger.info(`Extracted keywords: ${queryTerms.join(', ')}`);
    
    const enhancedResults: EnhancedSearchResult[] = results.map(result => {
      const keywordAnalysis = this._analyzeKeywordMatches(result, queryTerms);
      const semanticScore = result.score;
      
      // 计算综合评分
      const combinedScore = this._calculateCombinedScore(
        semanticScore, 
        keywordAnalysis.score, 
        this.options.keywordWeight
      );
      
      return {
        ...result,
        keywordScore: keywordAnalysis.score,
        combinedScore,
        diversityRank: 0, // 将在多样性重排序阶段设置
        matchedKeywords: keywordAnalysis.matchedKeywords,
      };
    });
    
    // 按综合评分排序
    enhancedResults.sort((a, b) => b.combinedScore - a.combinedScore);
    
    return enhancedResults;
  }

  /**
   * 阶段3: 多样性重排序
   */
  private async _diversifyResults(
    results: EnhancedSearchResult[], 
    topK?: number
  ): Promise<EnhancedSearchResult[]> {
    const targetCount = topK || this.options.maxResults;
    
    if (results.length <= targetCount) {
      return results.map((result, index) => ({
        ...result,
        diversityRank: index + 1,
      }));
    }
    
    const diversifiedResults: EnhancedSearchResult[] = [];
    const remainingResults = [...results];
    
    // 选择第一个最高分结果
    if (remainingResults.length > 0) {
      const topResult = remainingResults.shift()!;
      topResult.diversityRank = 1;
      diversifiedResults.push(topResult);
    }
    
    // 迭代选择多样性最佳的结果
    while (diversifiedResults.length < targetCount && remainingResults.length > 0) {
      let bestIndex = 0;
      let bestDiversityScore = -1;
      
      for (let i = 0; i < remainingResults.length; i++) {
        const candidate = remainingResults[i];
        const diversityScore = this._calculateDiversityScore(candidate, diversifiedResults);
        
        if (diversityScore > bestDiversityScore) {
          bestDiversityScore = diversityScore;
          bestIndex = i;
        }
      }
      
      const selectedResult = remainingResults.splice(bestIndex, 1)[0];
      selectedResult.diversityRank = diversifiedResults.length + 1;
      diversifiedResults.push(selectedResult);
    }
    
    this.logger.info(`Diversity reranking: selected ${diversifiedResults.length} from ${results.length} candidates`);
    return diversifiedResults;
  }

  /**
   * 提取关键词
   */
  private _extractKeywords(query: string): string[] {
    // 简单的关键词提取：分词、去除停用词、转小写
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    return query
      .toLowerCase()
      .split(/\s+|,|，|。|\.|;|；|:|：|\||\//)
      .map(term => term.trim())
      .filter(term => term.length > 1 && !stopWords.has(term));
  }

  /**
   * 分析关键词匹配
   */
  private _analyzeKeywordMatches(
    result: SearchResult, 
    queryTerms: string[]
  ): { score: number; matchedKeywords: string[] } {
    const document = result.document;
    const content = document.content.toLowerCase();
    const title = document.title?.toLowerCase() || '';
    const tags = document.tags?.map(tag => tag.toLowerCase()).join(' ') || '';
    
    let totalScore = 0;
    const matchedKeywords: string[] = [];
    
    for (const term of queryTerms) {
      let termScore = 0;
      
      // 标题匹配（权重最高）
      if (title.includes(term)) {
        termScore += 3;
        matchedKeywords.push(term);
      }
      
      // 标签匹配（权重中等）
      if (tags.includes(term)) {
        termScore += 2;
        if (!matchedKeywords.includes(term)) {
          matchedKeywords.push(term);
        }
      }
      
      // 内容匹配（权重较低）
      const contentMatches = (content.match(new RegExp(term, 'g')) || []).length;
      if (contentMatches > 0) {
        termScore += Math.min(contentMatches * 0.5, 2); // 限制单个词的最大贡献
        if (!matchedKeywords.includes(term)) {
          matchedKeywords.push(term);
        }
      }
      
      totalScore += termScore;
    }
    
    // 归一化分数
    const normalizedScore = Math.min(totalScore / queryTerms.length, 1);
    
    return {
      score: normalizedScore,
      matchedKeywords,
    };
  }

  /**
   * 计算综合评分
   */
  private _calculateCombinedScore(
    semanticScore: number, 
    keywordScore: number, 
    keywordWeight: number
  ): number {
    return semanticScore * (1 - keywordWeight) + keywordScore * keywordWeight;
  }

  /**
   * 计算多样性分数
   */
  private _calculateDiversityScore(
    candidate: EnhancedSearchResult, 
    selectedResults: EnhancedSearchResult[]
  ): number {
    if (selectedResults.length === 0) {
      return candidate.combinedScore;
    }
    
    // 计算与已选结果的最小相似度
    let minSimilarity = 1;
    
    for (const selected of selectedResults) {
      const similarity = this._calculateContentSimilarity(candidate, selected);
      minSimilarity = Math.min(minSimilarity, similarity);
    }
    
    // 多样性分数 = 综合评分 * (1 - 最大相似度)
    const diversityBonus = 1 - minSimilarity;
    return candidate.combinedScore * (0.7 + 0.3 * diversityBonus);
  }

  /**
   * 计算内容相似度
   */
  private _calculateContentSimilarity(
    result1: EnhancedSearchResult, 
    result2: EnhancedSearchResult
  ): number {
    // 如果有向量，使用向量相似度
    if (result1.document.vector && result2.document.vector) {
      return 1 - cosineDistance(result1.document.vector, result2.document.vector);
    }
    
    // 否则使用简单的文本相似度
    return this._calculateTextSimilarity(
      result1.document.content, 
      result2.document.content
    );
  }

  /**
   * 计算文本相似度（简单实现）
   */
  private _calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size; // Jaccard相似度
  }

  /**
   * 降级检索策略
   */
  private async _fallbackRetrieval(
    query: string, 
    options?: RetrievalOptions
  ): Promise<EnhancedSearchResult[]> {
    this.logger.warn('Using fallback retrieval strategy');
    
    try {
             // 尝试简单的向量检索
       const queryEmbedding = await this.embeddingService.generateEmbeddingForText(query);
      const results = await this.vectorStore.searchByVector(queryEmbedding, {
        limit: options?.topK || this.options.maxResults,
        threshold: options?.minScore || 0.5,
      });
      
      // 转换为增强结果格式
      return results.map((result, index) => ({
        ...result,
        keywordScore: 0,
        combinedScore: result.score,
        diversityRank: index + 1,
        matchedKeywords: [],
      }));
    } catch (error) {
      this.logger.error('Fallback retrieval also failed', error);
      return [];
    }
  }

  /**
   * 获取检索统计信息
   */
  getRetrievalStats(results: EnhancedSearchResult[]): {
    totalResults: number;
    averageSemanticScore: number;
    averageKeywordScore: number;
    averageCombinedScore: number;
    keywordCoverage: number;
    diversityMetrics: {
      averageSimilarity: number;
      duplicateCount: number;
    };
  } {
    if (results.length === 0) {
      return {
        totalResults: 0,
        averageSemanticScore: 0,
        averageKeywordScore: 0,
        averageCombinedScore: 0,
        keywordCoverage: 0,
        diversityMetrics: {
          averageSimilarity: 0,
          duplicateCount: 0,
        },
      };
    }

    const semanticScores = results.map(r => r.score);
    const keywordScores = results.map(r => r.keywordScore);
    const combinedScores = results.map(r => r.combinedScore);
    
    // 计算关键词覆盖率
    const totalKeywords = results.reduce((sum, r) => sum + r.matchedKeywords.length, 0);
    const keywordCoverage = totalKeywords / results.length;
    
    // 计算多样性指标
    let totalSimilarity = 0;
    let pairCount = 0;
    let duplicateCount = 0;
    
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const similarity = this._calculateContentSimilarity(results[i], results[j]);
        totalSimilarity += similarity;
        pairCount++;
        
        if (similarity > this.options.diversityThreshold) {
          duplicateCount++;
        }
      }
    }
    
    return {
      totalResults: results.length,
      averageSemanticScore: semanticScores.reduce((a, b) => a + b, 0) / results.length,
      averageKeywordScore: keywordScores.reduce((a, b) => a + b, 0) / results.length,
      averageCombinedScore: combinedScores.reduce((a, b) => a + b, 0) / results.length,
      keywordCoverage,
      diversityMetrics: {
        averageSimilarity: pairCount > 0 ? totalSimilarity / pairCount : 0,
        duplicateCount,
      },
    };
  }
} 