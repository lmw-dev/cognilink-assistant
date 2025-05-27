/**
 * TOM-110: 原创性检测算法实现
 * 基于现有OriginalityService扩展，提供高级原创性检测功能
 */

import { EmbeddingService } from './EmbeddingService';
import { cosineDistance } from '../utils/math';
import {
  Note,
  OriginalityDetectionOptions,
  OriginalityDetectionResult,
  OriginalityDetectionRequest,
  BatchOriginalityResult,
  DuplicateSegment,
  MostSimilarSource,
  SimilarityMethod,
  QualityAssessmentError,
  QualityAssessmentErrorType
} from '../types/quality-assessment';

/**
 * 原创性检测器
 * 提供内容原创性检测、重复片段识别、相似度计算等功能
 */
export class OriginalityDetector {
  private embeddingService: EmbeddingService;
  private cache: Map<string, OriginalityDetectionResult>;
  private readonly defaultOptions: Required<OriginalityDetectionOptions>;

  constructor(embeddingService: EmbeddingService) {
    this.embeddingService = embeddingService;
    this.cache = new Map();
    
    // 默认配置
    this.defaultOptions = {
      threshold: 0.8,
      method: 'cosine',
      segmentSize: 200,
      overlap: 50,
      enableCache: true,
      maxSourceNotes: 100,
      includeMetadata: true,
      strictMode: false
    };
  }

  /**
   * 检测内容原创性
   */
  async detectOriginality(
    content: string,
    sourceNotes: Note[],
    options?: OriginalityDetectionOptions
  ): Promise<OriginalityDetectionResult> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };

    try {
      // 输入验证
      this.validateInput(content, sourceNotes);

      // 缓存检查
      const cacheKey = this.generateCacheKey(content, sourceNotes, opts);
      if (opts.enableCache && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      // 限制源笔记数量
      const limitedSourceNotes = sourceNotes.slice(0, opts.maxSourceNotes);

      // 分段处理
      const segments = this.segmentContent(content, opts.segmentSize, opts.overlap);

      // 检测重复片段
      const duplicateSegments = limitedSourceNotes.length > 0 
        ? await this.identifyDuplicateSegments(content, limitedSourceNotes, opts.threshold)
        : [];

      // 找到最相似的源笔记
      const mostSimilarSource = limitedSourceNotes.length > 0
        ? await this.findMostSimilarSource(content, limitedSourceNotes, opts.method)
        : null;

      // 计算总体原创性评分
      const overallScore = this.calculateOriginalityScore(
        duplicateSegments,
        mostSimilarSource,
        content.length,
        opts.strictMode
      );

      // 计算最高相似度
      const maxSimilarity = Math.max(
        mostSimilarSource?.similarity || 0,
        ...duplicateSegments.map(seg => seg.similarity)
      );

      // 判断是否原创
      const isOriginal = overallScore >= 70 && maxSimilarity < opts.threshold;

      // 计算置信度
      const confidence = this.calculateConfidence(
        duplicateSegments,
        mostSimilarSource,
        limitedSourceNotes.length
      );

      const processingTime = Date.now() - startTime;

      const result: OriginalityDetectionResult = {
        overallScore,
        similarity: maxSimilarity,
        duplicateSegments,
        mostSimilarSource,
        isOriginal,
        confidence,
        processingTime,
        metadata: {
          totalSegments: segments.length,
          duplicateCount: duplicateSegments.length,
          uniqueSourceCount: new Set(duplicateSegments.map(seg => seg.sourceNote.path)).size,
          averageSimilarity: duplicateSegments.length > 0 
            ? duplicateSegments.reduce((sum, seg) => sum + seg.similarity, 0) / duplicateSegments.length 
            : 0,
          method: opts.method,
          threshold: opts.threshold
        }
      };

      // 缓存结果
      if (opts.enableCache) {
        this.cache.set(cacheKey, result);
      }

      return result;

    } catch (error) {
      throw new QualityAssessmentError(
        `原创性检测失败: ${error.message}`,
        QualityAssessmentErrorType.ORIGINALITY_DETECTION_ERROR,
        { content: content.substring(0, 100), sourceNotesCount: sourceNotes.length }
      );
    }
  }

  /**
   * 识别重复片段
   */
  async identifyDuplicateSegments(
    content: string,
    sourceNotes: Note[],
    threshold: number = 0.8
  ): Promise<DuplicateSegment[]> {
    const duplicateSegments: DuplicateSegment[] = [];
    const segments = this.segmentContent(content, 200, 50);

    // 为每个片段生成embedding
    const segmentEmbeddings = await Promise.all(
      segments.map(async (segment) => ({
        segment,
        embedding: await this.embeddingService.generateEmbeddingForText(segment.content)
      }))
    );

    // 为源笔记生成embedding
    const sourceEmbeddings = await Promise.all(
      sourceNotes.map(async (note) => ({
        note,
        embedding: await this.embeddingService.generateEmbeddingForText(note.content)
      }))
    );

    // 比较每个片段与源笔记
    for (const { segment, embedding } of segmentEmbeddings) {
      for (const { note, embedding: sourceEmbedding } of sourceEmbeddings) {
        const similarity = 1 - cosineDistance(embedding, sourceEmbedding);
        
        if (similarity >= threshold) {
          // 找到最相似的源片段
          const sourceSegment = await this.findMostSimilarSourceSegment(
            segment.content,
            note.content,
            embedding
          );

          duplicateSegments.push({
            content: segment.content,
            startIndex: segment.startIndex,
            endIndex: segment.endIndex,
            similarity,
            sourceNote: note,
            sourceSegment,
            confidence: this.calculateSegmentConfidence(similarity, segment.content.length),
            type: this.classifyDuplicateType(similarity)
          });
        }
      }
    }

    // 按相似度排序
    return duplicateSegments.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * 计算相似度
   */
  async calculateSimilarity(
    text1: string,
    text2: string,
    method: SimilarityMethod = 'cosine'
  ): Promise<number> {
    const embedding1 = await this.embeddingService.generateEmbeddingForText(text1);
    const embedding2 = await this.embeddingService.generateEmbeddingForText(text2);

    switch (method) {
      case 'cosine':
        return Math.max(0, Math.min(1, 1 - cosineDistance(embedding1, embedding2)));
      case 'euclidean':
        return Math.max(0, Math.min(1, 1 / (1 + this.euclideanDistance(embedding1, embedding2))));
      case 'manhattan':
        return Math.max(0, Math.min(1, 1 / (1 + this.manhattanDistance(embedding1, embedding2))));
      case 'jaccard':
        return Math.max(0, Math.min(1, this.jaccardSimilarity(text1, text2)));
      default:
        return Math.max(0, Math.min(1, 1 - cosineDistance(embedding1, embedding2)));
    }
  }

  /**
   * 批量检测
   */
  async batchDetect(
    requests: OriginalityDetectionRequest[]
  ): Promise<BatchOriginalityResult> {
    const results: OriginalityDetectionResult[] = [];
    const errors: Array<{ requestId: string; error: Error }> = [];
    const startTime = Date.now();

    for (const request of requests) {
      try {
        const result = await this.detectOriginality(
          request.content,
          request.sourceNotes,
          request.options
        );
        results.push(result);
      } catch (error) {
        errors.push({
          requestId: request.id,
          error: error as Error
        });
      }
    }

    const processingTime = Date.now() - startTime;
    const originalCount = results.filter(r => r.isOriginal).length;
    const duplicateCount = results.length - originalCount;
    const averageScore = results.length > 0 
      ? results.reduce((sum, r) => sum + r.overallScore, 0) / results.length 
      : 0;

    return {
      results,
      summary: {
        total: requests.length,
        originalCount,
        duplicateCount,
        averageScore,
        processingTime
      },
      errors
    };
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; hitRate: number } {
    // 简化实现，实际应该跟踪命中率
    return {
      size: this.cache.size,
      hitRate: 0.8 // 模拟值
    };
  }

  // ==================== 私有方法 ====================

  /**
   * 输入验证
   */
  private validateInput(content: string, sourceNotes: Note[]): void {
    if (!content || content.trim().length === 0) {
      throw new Error('内容不能为空');
    }
    if (!sourceNotes) {
      throw new Error('源笔记参数不能为null');
    }
    if (content.length > 50000) {
      throw new Error('内容长度不能超过50000字符');
    }
    // 注意：空的源笔记数组是允许的，表示没有参考内容
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(
    content: string,
    sourceNotes: Note[],
    options: Required<OriginalityDetectionOptions>
  ): string {
    const contentHash = this.simpleHash(content);
    const sourceHash = this.simpleHash(sourceNotes.map(n => n.path).join(','));
    const optionsHash = this.simpleHash(JSON.stringify(options));
    return `${contentHash}-${sourceHash}-${optionsHash}`;
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
    return Math.abs(hash).toString(36);
  }

  /**
   * 内容分段
   */
  private segmentContent(
    content: string,
    segmentSize: number,
    overlap: number
  ): Array<{ content: string; startIndex: number; endIndex: number }> {
    const segments: Array<{ content: string; startIndex: number; endIndex: number }> = [];
    const step = segmentSize - overlap;

    for (let i = 0; i < content.length; i += step) {
      const endIndex = Math.min(i + segmentSize, content.length);
      const segmentContent = content.substring(i, endIndex);
      
      if (segmentContent.trim().length > 0) {
        segments.push({
          content: segmentContent,
          startIndex: i,
          endIndex
        });
      }

      if (endIndex >= content.length) break;
    }

    return segments;
  }

  /**
   * 找到最相似的源笔记
   */
  private async findMostSimilarSource(
    content: string,
    sourceNotes: Note[],
    method: SimilarityMethod
  ): Promise<MostSimilarSource | null> {
    if (sourceNotes.length === 0) return null;

    const contentEmbedding = await this.embeddingService.generateEmbeddingForText(content);
    let maxSimilarity = 0;
    let bestNote: Note | null = null;
    let matchedSegments: string[] = [];

    for (const note of sourceNotes) {
      const noteEmbedding = await this.embeddingService.generateEmbeddingForText(note.content);
      const similarity = method === 'cosine' 
        ? 1 - cosineDistance(contentEmbedding, noteEmbedding)
        : await this.calculateSimilarity(content, note.content, method);

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestNote = note;
        // 找到匹配的片段
        matchedSegments = await this.findMatchedSegments(content, note.content);
      }
    }

    if (!bestNote) return null;

    return {
      note: bestNote,
      similarity: maxSimilarity,
      matchedSegments,
      coverage: this.calculateCoverage(matchedSegments, content),
      confidence: this.calculateSourceConfidence(maxSimilarity, matchedSegments.length)
    };
  }

  /**
   * 找到最相似的源片段
   */
  private async findMostSimilarSourceSegment(
    segmentContent: string,
    sourceContent: string,
    segmentEmbedding: number[]
  ): Promise<string> {
    const sourceSegments = this.segmentContent(sourceContent, 200, 50);
    let maxSimilarity = 0;
    let bestSegment = sourceContent.substring(0, 200);

    for (const sourceSegment of sourceSegments) {
      const sourceEmbedding = await this.embeddingService.generateEmbeddingForText(sourceSegment.content);
      const similarity = 1 - cosineDistance(segmentEmbedding, sourceEmbedding);
      
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestSegment = sourceSegment.content;
      }
    }

    return bestSegment;
  }

  /**
   * 找到匹配的片段
   */
  private async findMatchedSegments(content: string, sourceContent: string): Promise<string[]> {
    const contentSegments = this.segmentContent(content, 100, 25);
    const matchedSegments: string[] = [];

    for (const segment of contentSegments) {
      const similarity = await this.calculateSimilarity(segment.content, sourceContent, 'cosine');
      if (similarity > 0.7) {
        matchedSegments.push(segment.content);
      }
    }

    return matchedSegments;
  }

  /**
   * 计算原创性评分
   */
  private calculateOriginalityScore(
    duplicateSegments: DuplicateSegment[],
    mostSimilarSource: MostSimilarSource | null,
    contentLength: number,
    strictMode: boolean
  ): number {
    if (duplicateSegments.length === 0) return 100;

    // 计算重复内容的总长度
    const duplicateLength = duplicateSegments.reduce((sum, seg) => sum + seg.content.length, 0);
    const duplicateRatio = duplicateLength / contentLength;

    // 基础评分
    let score = Math.max(0, 100 - (duplicateRatio * 100));

    // 考虑最高相似度
    if (mostSimilarSource) {
      const similarityPenalty = mostSimilarSource.similarity * 30;
      score -= similarityPenalty;
    }

    // 严格模式下的额外惩罚
    if (strictMode) {
      score *= 0.8;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(
    duplicateSegments: DuplicateSegment[],
    mostSimilarSource: MostSimilarSource | null,
    sourceNotesCount: number
  ): number {
    let confidence = 0.8; // 基础置信度

    // 源笔记数量影响置信度
    if (sourceNotesCount > 50) confidence += 0.1;
    if (sourceNotesCount > 100) confidence += 0.1;

    // 检测到的重复片段影响置信度
    if (duplicateSegments.length > 0) {
      const avgConfidence = duplicateSegments.reduce((sum, seg) => sum + seg.confidence, 0) / duplicateSegments.length;
      confidence = (confidence + avgConfidence) / 2;
    }

    return Math.min(1, confidence);
  }

  /**
   * 计算片段置信度
   */
  private calculateSegmentConfidence(similarity: number, segmentLength: number): number {
    let confidence = similarity;
    
    // 片段长度影响置信度
    if (segmentLength > 100) confidence += 0.1;
    if (segmentLength > 200) confidence += 0.1;
    
    return Math.min(1, confidence);
  }

  /**
   * 计算源笔记置信度
   */
  private calculateSourceConfidence(similarity: number, matchedSegmentsCount: number): number {
    let confidence = similarity;
    
    // 匹配片段数量影响置信度
    if (matchedSegmentsCount > 3) confidence += 0.1;
    if (matchedSegmentsCount > 5) confidence += 0.1;
    
    return Math.min(1, confidence);
  }

  /**
   * 计算覆盖率
   */
  private calculateCoverage(matchedSegments: string[], content: string): number {
    const matchedLength = matchedSegments.reduce((sum, seg) => sum + seg.length, 0);
    return Math.min(1, matchedLength / content.length);
  }

  /**
   * 分类重复类型
   */
  private classifyDuplicateType(similarity: number): 'exact' | 'semantic' | 'paraphrase' {
    if (similarity >= 0.95) return 'exact';
    if (similarity >= 0.85) return 'semantic';
    return 'paraphrase';
  }

  /**
   * 欧几里得距离
   */
  private euclideanDistance(vec1: number[], vec2: number[]): number {
    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
      sum += Math.pow(vec1[i] - vec2[i], 2);
    }
    return Math.sqrt(sum);
  }

  /**
   * 曼哈顿距离
   */
  private manhattanDistance(vec1: number[], vec2: number[]): number {
    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
      sum += Math.abs(vec1[i] - vec2[i]);
    }
    return sum;
  }

  /**
   * Jaccard相似度
   */
  private jaccardSimilarity(text1: string, text2: string): number {
    const set1 = new Set(text1.toLowerCase().split(/\s+/));
    const set2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
} 