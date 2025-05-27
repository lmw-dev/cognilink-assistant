/**
 * TOM-110: 原创性检测器单元测试
 */

import { OriginalityDetector } from '../originality-detector';
import { EmbeddingService } from '../EmbeddingService';
import { Note, OriginalityDetectionOptions } from '../../types/quality-assessment';

// Mock EmbeddingService
jest.mock('../EmbeddingService');

describe('OriginalityDetector', () => {
  let originalityDetector: OriginalityDetector;
  let mockEmbeddingService: jest.Mocked<EmbeddingService>;

  const mockNotes: Note[] = [
    {
      title: '测试笔记1',
      content: '这是一个关于TypeScript的技术文章，介绍了基本概念和使用方法。',
      link: '[[测试笔记1]]',
      path: 'notes/test1.md',
      tags: ['typescript', 'programming'],
      updated: Date.now()
    },
    {
      title: '测试笔记2',
      content: '这是另一个关于JavaScript的文章，讨论了异步编程的最佳实践。',
      link: '[[测试笔记2]]',
      path: 'notes/test2.md',
      tags: ['javascript', 'async'],
      updated: Date.now()
    }
  ];

  beforeEach(() => {
    mockEmbeddingService = new EmbeddingService({} as any) as jest.Mocked<EmbeddingService>;
    originalityDetector = new OriginalityDetector(mockEmbeddingService);

    // Mock embedding generation
    mockEmbeddingService.generateEmbeddingForText.mockImplementation(async (text: string) => {
      // 简单的mock实现：基于文本长度和内容生成假的embedding
      const hash = text.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      return Array.from({ length: 384 }, (_, i) => Math.sin(hash + i) * 0.1);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('detectOriginality', () => {
    it('应该检测高原创性内容', async () => {
      const content = '这是一个完全原创的内容，讨论了一个全新的技术概念和创新的解决方案。';
      
      const result = await originalityDetector.detectOriginality(content, mockNotes);
      
      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(70);
      expect(result.isOriginal).toBe(true);
      expect(result.duplicateSegments).toHaveLength(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.metadata.totalSegments).toBeGreaterThan(0);
    });

    it('应该检测低原创性内容', async () => {
      // 使用与mock笔记相似的内容
      const content = '这是一个关于TypeScript的技术文章，介绍了基本概念和使用方法。这是重复的内容。';
      
      // Mock高相似度的embedding
      mockEmbeddingService.generateEmbeddingForText.mockImplementation(async (text: string) => {
        if (text.includes('TypeScript')) {
          return Array.from({ length: 384 }, (_, i) => 0.9); // 高相似度
        }
        return Array.from({ length: 384 }, (_, i) => Math.random() * 0.1);
      });
      
      const result = await originalityDetector.detectOriginality(content, mockNotes);
      
      expect(result).toBeDefined();
      expect(result.overallScore).toBeLessThan(70);
      expect(result.isOriginal).toBe(false);
      expect(result.similarity).toBeGreaterThan(0.8);
      expect(result.mostSimilarSource).toBeDefined();
    });

    it('应该处理空源笔记', async () => {
      const content = '这是一个测试内容。';
      
      const result = await originalityDetector.detectOriginality(content, []);
      
      expect(result.overallScore).toBe(100);
      expect(result.isOriginal).toBe(true);
      expect(result.duplicateSegments).toHaveLength(0);
      expect(result.mostSimilarSource).toBeNull();
    });

    it('应该使用缓存', async () => {
      const content = '测试缓存功能的内容。';
      const options: OriginalityDetectionOptions = { enableCache: true };
      
      // 第一次调用
      const result1 = await originalityDetector.detectOriginality(content, mockNotes, options);
      
      // 第二次调用应该使用缓存
      const result2 = await originalityDetector.detectOriginality(content, mockNotes, options);
      
      expect(result1).toEqual(result2);
      // 第二次调用应该更快（使用缓存）
      expect(result2.processingTime).toBeLessThanOrEqual(result1.processingTime);
    });

    it('应该处理自定义选项', async () => {
      const content = '测试自定义选项的内容。';
      const options: OriginalityDetectionOptions = {
        threshold: 0.9,
        method: 'euclidean',
        segmentSize: 100,
        overlap: 25,
        strictMode: true
      };
      
      const result = await originalityDetector.detectOriginality(content, mockNotes, options);
      
      expect(result).toBeDefined();
      expect(result.metadata.method).toBe('euclidean');
      expect(result.metadata.threshold).toBe(0.9);
    });

    it('应该抛出错误当内容为空', async () => {
      await expect(
        originalityDetector.detectOriginality('', mockNotes)
      ).rejects.toThrow('内容不能为空');
    });

    it('应该处理空源笔记数组', async () => {
      const result = await originalityDetector.detectOriginality('测试内容', []);
      
      expect(result.overallScore).toBe(100);
      expect(result.isOriginal).toBe(true);
      expect(result.duplicateSegments).toHaveLength(0);
      expect(result.mostSimilarSource).toBeNull();
    });

    it('应该抛出错误当内容过长', async () => {
      const longContent = 'a'.repeat(50001);
      
      await expect(
        originalityDetector.detectOriginality(longContent, mockNotes)
      ).rejects.toThrow('内容长度不能超过50000字符');
    });
  });

  describe('identifyDuplicateSegments', () => {
    it('应该识别重复片段', async () => {
      const content = '这是一个关于TypeScript的技术文章，介绍了基本概念。';
      
      // Mock高相似度
      mockEmbeddingService.generateEmbeddingForText.mockImplementation(async (text: string) => {
        if (text.includes('TypeScript')) {
          return Array.from({ length: 384 }, () => 0.9);
        }
        return Array.from({ length: 384 }, () => 0.1);
      });
      
      const segments = await originalityDetector.identifyDuplicateSegments(content, mockNotes, 0.8);
      
      expect(segments).toBeDefined();
      expect(Array.isArray(segments)).toBe(true);
      // 应该按相似度排序
      if (segments.length > 1) {
        expect(segments[0].similarity).toBeGreaterThanOrEqual(segments[1].similarity);
      }
    });

    it('应该返回空数组当没有重复', async () => {
      const content = '这是一个完全原创的内容，没有任何重复。';
      
      // Mock低相似度的embedding，确保没有重复
      mockEmbeddingService.generateEmbeddingForText.mockImplementation(async (text: string) => {
        return Array.from({ length: 384 }, () => Math.random() * 0.1); // 低相似度
      });
      
      const segments = await originalityDetector.identifyDuplicateSegments(content, mockNotes, 0.8);
      
      expect(segments).toHaveLength(0);
    });
  });

  describe('calculateSimilarity', () => {
    it('应该计算余弦相似度', async () => {
      const text1 = '这是第一个文本。';
      const text2 = '这是第二个文本。';
      
      const similarity = await originalityDetector.calculateSimilarity(text1, text2, 'cosine');
      
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('应该计算欧几里得相似度', async () => {
      const text1 = '测试文本一。';
      const text2 = '测试文本二。';
      
      const similarity = await originalityDetector.calculateSimilarity(text1, text2, 'euclidean');
      
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('应该计算曼哈顿相似度', async () => {
      const text1 = '测试文本A。';
      const text2 = '测试文本B。';
      
      const similarity = await originalityDetector.calculateSimilarity(text1, text2, 'manhattan');
      
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('应该计算Jaccard相似度', async () => {
      const text1 = '这是一个测试文本。';
      const text2 = '这是另一个测试文本。';
      
      const similarity = await originalityDetector.calculateSimilarity(text1, text2, 'jaccard');
      
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('batchDetect', () => {
    it('应该批量检测多个内容', async () => {
      const requests = [
        {
          id: 'req1',
          content: '第一个测试内容。',
          sourceNotes: mockNotes
        },
        {
          id: 'req2',
          content: '第二个测试内容。',
          sourceNotes: mockNotes
        }
      ];
      
      const result = await originalityDetector.batchDetect(requests);
      
      expect(result).toBeDefined();
      expect(result.results).toHaveLength(2);
      expect(result.summary.total).toBe(2);
      expect(result.summary.processingTime).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it('应该处理批量检测中的错误', async () => {
      const requests = [
        {
          id: 'req1',
          content: '正常内容。',
          sourceNotes: mockNotes
        },
        {
          id: 'req2',
          content: '', // 空内容会导致错误
          sourceNotes: mockNotes
        }
      ];
      
      const result = await originalityDetector.batchDetect(requests);
      
      expect(result.results).toHaveLength(1); // 只有一个成功
      expect(result.errors).toHaveLength(1); // 一个错误
      expect(result.errors[0].requestId).toBe('req2');
    });
  });

  describe('缓存管理', () => {
    it('应该清理缓存', () => {
      originalityDetector.clearCache();
      
      const stats = originalityDetector.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('应该返回缓存统计', () => {
      const stats = originalityDetector.getCacheStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.hitRate).toBe('number');
    });
  });

  describe('性能测试', () => {
    it('应该在2秒内完成检测', async () => {
      const content = '这是一个性能测试的内容，需要在规定时间内完成检测。';
      const startTime = Date.now();
      
      await originalityDetector.detectOriginality(content, mockNotes);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(processingTime).toBeLessThan(2000); // 2秒内完成
    });
  });

  describe('准确率测试', () => {
    it('应该正确识别完全相同的内容', async () => {
      const content = mockNotes[0].content; // 使用完全相同的内容
      
      // Mock完全相同的embedding
      mockEmbeddingService.generateEmbeddingForText.mockImplementation(async (text: string) => {
        if (text === content) {
          return Array.from({ length: 384 }, () => 1.0); // 完全相同
        }
        return Array.from({ length: 384 }, () => 0.0);
      });
      
      const result = await originalityDetector.detectOriginality(content, mockNotes);
      
      expect(result.similarity).toBeGreaterThan(0.95);
      expect(result.isOriginal).toBe(false);
      expect(result.duplicateSegments.length).toBeGreaterThan(0);
    });

    it('应该正确识别完全不同的内容', async () => {
      const content = '这是一个完全不同的内容，与任何现有笔记都没有相似性。';
      
      // Mock完全不同的embedding
      mockEmbeddingService.generateEmbeddingForText.mockImplementation(async (text: string) => {
        if (text === content) {
          return Array.from({ length: 384 }, () => 0.0);
        }
        return Array.from({ length: 384 }, () => 1.0);
      });
      
      const result = await originalityDetector.detectOriginality(content, mockNotes);
      
      expect(result.similarity).toBeLessThan(0.2);
      expect(result.isOriginal).toBe(true);
      expect(result.overallScore).toBeGreaterThan(90);
    });
  });
}); 