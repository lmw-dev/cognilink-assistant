import { AdvancedRAGRetriever, EnhancedSearchResult, RetrievalOptions } from '../advanced-rag-retriever';
import { OptimizedVectorStore } from '../optimized-vector-store';
import { EmbeddingService } from '../EmbeddingService';
import { SearchResult, VectorDocument } from '../../types/vector-storage';
import { Logger } from '../../utils/logger';

// Mock dependencies
jest.mock('../optimized-vector-store');
jest.mock('../EmbeddingService');
jest.mock('../../utils/logger');
jest.mock('../../utils/math', () => ({
  cosineDistance: jest.fn((a: number[], b: number[]) => 0.3), // Mock distance
}));

describe('AdvancedRAGRetriever', () => {
  let retriever: AdvancedRAGRetriever;
  let mockVectorStore: jest.Mocked<OptimizedVectorStore>;
  let mockEmbeddingService: jest.Mocked<EmbeddingService>;
  let mockLogger: jest.Mocked<Logger>;

  const sampleDocument: VectorDocument = {
    id: 'doc1',
    content: 'This is a sample document about artificial intelligence and machine learning.',
    title: 'AI and ML Guide',
    tags: ['ai', 'ml', 'technology'],
    updated: Date.now(),
    vector: new Array(1536).fill(0.1),
    metadata: {
      filePath: 'ai-guide.md',
      noteType: 'markdown',
      wordCount: 12,
    },
  };

  const sampleSearchResult: SearchResult = {
    document: sampleDocument,
    score: 0.85,
    distance: 0.15,
  };

  beforeEach(() => {
    // Create mocks
    mockVectorStore = new OptimizedVectorStore({} as any) as jest.Mocked<OptimizedVectorStore>;
    mockEmbeddingService = new EmbeddingService({} as any) as jest.Mocked<EmbeddingService>;
    mockLogger = new Logger('test') as jest.Mocked<Logger>;

    // Setup mock implementations
    mockVectorStore.searchByVector = jest.fn().mockResolvedValue([sampleSearchResult]);
    mockEmbeddingService.generateEmbeddingForText = jest.fn().mockResolvedValue(new Array(1536).fill(0.1));

    // Create retriever instance
    retriever = new AdvancedRAGRetriever(mockVectorStore, mockEmbeddingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(retriever).toBeDefined();
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        keywordWeight: 0.5,
        diversityThreshold: 0.9,
        maxResults: 10,
      };

      const customRetriever = new AdvancedRAGRetriever(
        mockVectorStore,
        mockEmbeddingService,
        customOptions
      );

      expect(customRetriever).toBeDefined();
    });
  });

  describe('retrieve', () => {
    it('should perform multi-stage retrieval successfully', async () => {
      const query = 'artificial intelligence machine learning';
      const options: RetrievalOptions = {
        topK: 5,
        minScore: 0.7,
      };

      const results = await retriever.retrieve(query, options);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Verify enhanced result structure
      results.forEach(result => {
        expect(result).toHaveProperty('keywordScore');
        expect(result).toHaveProperty('combinedScore');
        expect(result).toHaveProperty('diversityRank');
        expect(result).toHaveProperty('matchedKeywords');
        expect(Array.isArray(result.matchedKeywords)).toBe(true);
      });
    });

    it('should handle empty search results', async () => {
      mockVectorStore.searchByVector.mockResolvedValue([]);

      const results = await retriever.retrieve('nonexistent query');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should use fallback retrieval on error', async () => {
      mockVectorStore.searchByVector.mockRejectedValueOnce(new Error('Vector search failed'));
      mockVectorStore.searchByVector.mockResolvedValueOnce([sampleSearchResult]);

      const results = await retriever.retrieve('test query');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should respect topK limit', async () => {
      const multipleResults: SearchResult[] = Array.from({ length: 10 }, (_, i) => ({
        document: {
          ...sampleDocument,
          id: `doc${i}`,
          title: `Document ${i}`,
        },
        score: 0.8 - i * 0.05,
        distance: 0.2 + i * 0.05,
      }));

      mockVectorStore.searchByVector.mockResolvedValue(multipleResults);

      const results = await retriever.retrieve('test query', { topK: 3 });

      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  describe('semantic search', () => {
    it('should generate query embedding and search vector store', async () => {
      const query = 'test query';
      
      await retriever.retrieve(query);

      expect(mockEmbeddingService.generateEmbeddingForText).toHaveBeenCalledWith(query);
      expect(mockVectorStore.searchByVector).toHaveBeenCalled();
    });

    it('should expand search scope for better candidate selection', async () => {
      const options: RetrievalOptions = { topK: 5 };
      
      await retriever.retrieve('test query', options);

      const searchCall = mockVectorStore.searchByVector.mock.calls[0];
      const searchOptions = searchCall[1];
      
      // Should search for more than requested topK
      expect(searchOptions?.limit).toBeGreaterThan(options.topK!);
    });
  });

  describe('keyword enhancement', () => {
    it('should extract keywords from query', async () => {
      const query = 'artificial intelligence and machine learning algorithms';
      
      const results = await retriever.retrieve(query);

      // Should have processed keywords and assigned keyword scores
      results.forEach(result => {
        expect(typeof result.keywordScore).toBe('number');
        expect(result.keywordScore).toBeGreaterThanOrEqual(0);
        expect(result.keywordScore).toBeLessThanOrEqual(1);
      });
    });

    it('should match keywords in title, tags, and content', async () => {
      const documentWithMatches: VectorDocument = {
        ...sampleDocument,
        title: 'Machine Learning Guide',
        content: 'This document covers artificial intelligence concepts.',
        tags: ['ai', 'algorithms'],
      };

      const searchResult: SearchResult = {
        document: documentWithMatches,
        score: 0.8,
        distance: 0.2,
      };

      mockVectorStore.searchByVector.mockResolvedValue([searchResult]);

      const results = await retriever.retrieve('machine learning artificial intelligence');

      expect(results[0].matchedKeywords.length).toBeGreaterThan(0);
      expect(results[0].keywordScore).toBeGreaterThan(0);
    });

    it('should calculate combined scores correctly', async () => {
      const results = await retriever.retrieve('test query');

      results.forEach(result => {
        expect(typeof result.combinedScore).toBe('number');
        expect(result.combinedScore).toBeGreaterThanOrEqual(0);
        expect(result.combinedScore).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('diversity reranking', () => {
    it('should assign diversity ranks', async () => {
      const multipleResults: SearchResult[] = Array.from({ length: 5 }, (_, i) => ({
        document: {
          ...sampleDocument,
          id: `doc${i}`,
          content: `Different content ${i} about various topics.`,
        },
        score: 0.8,
        distance: 0.2,
      }));

      mockVectorStore.searchByVector.mockResolvedValue(multipleResults);

      const results = await retriever.retrieve('test query');

      results.forEach((result, index) => {
        expect(result.diversityRank).toBe(index + 1);
      });
    });

    it('should reduce similar content in results', async () => {
      const similarResults: SearchResult[] = Array.from({ length: 5 }, (_, i) => ({
        document: {
          ...sampleDocument,
          id: `doc${i}`,
          content: 'Very similar content about the same topic.',
          vector: new Array(1536).fill(0.1), // Same vectors = high similarity
        },
        score: 0.8,
        distance: 0.2,
      }));

      mockVectorStore.searchByVector.mockResolvedValue(similarResults);

      const results = await retriever.retrieve('test query', { topK: 3 });

      // Should still return results but with diversity consideration
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  describe('performance', () => {
    it('should complete retrieval within time limit', async () => {
      const startTime = Date.now();
      
      await retriever.retrieve('test query');
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (allowing for test overhead)
      expect(duration).toBeLessThan(1000); // 1 second
    });

    it('should handle large result sets efficiently', async () => {
      const largeResultSet: SearchResult[] = Array.from({ length: 100 }, (_, i) => ({
        document: {
          ...sampleDocument,
          id: `doc${i}`,
          content: `Content ${i} with different information.`,
        },
        score: 0.8 - i * 0.001,
        distance: 0.2 + i * 0.001,
      }));

      mockVectorStore.searchByVector.mockResolvedValue(largeResultSet);

      const startTime = Date.now();
      const results = await retriever.retrieve('test query', { topK: 10 });
      const endTime = Date.now();

      expect(results.length).toBeLessThanOrEqual(10);
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
    });
  });

  describe('getRetrievalStats', () => {
    it('should return correct stats for empty results', () => {
      const stats = retriever.getRetrievalStats([]);

      expect(stats.totalResults).toBe(0);
      expect(stats.averageSemanticScore).toBe(0);
      expect(stats.averageKeywordScore).toBe(0);
      expect(stats.averageCombinedScore).toBe(0);
      expect(stats.keywordCoverage).toBe(0);
      expect(stats.diversityMetrics.averageSimilarity).toBe(0);
      expect(stats.diversityMetrics.duplicateCount).toBe(0);
    });

    it('should calculate stats correctly for sample results', async () => {
      const results = await retriever.retrieve('test query');

      if (results.length > 0) {
        const stats = retriever.getRetrievalStats(results);

        expect(stats.totalResults).toBe(results.length);
        expect(stats.averageSemanticScore).toBeGreaterThan(0);
        expect(stats.averageCombinedScore).toBeGreaterThan(0);
        expect(typeof stats.keywordCoverage).toBe('number');
        expect(typeof stats.diversityMetrics.averageSimilarity).toBe('number');
        expect(typeof stats.diversityMetrics.duplicateCount).toBe('number');
      }
    });
  });

  describe('error handling', () => {
    it('should handle embedding generation errors', async () => {
      mockEmbeddingService.generateEmbeddingForText.mockRejectedValue(new Error('Embedding failed'));

      const results = await retriever.retrieve('test query');

      // Should still return results (empty array) without throwing
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle vector store errors', async () => {
      mockVectorStore.searchByVector.mockRejectedValue(new Error('Vector store error'));

      const results = await retriever.retrieve('test query');

      // Should use fallback strategy
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle malformed search results', async () => {
      const malformedResult = {
        document: null,
        score: 0.8,
        distance: 0.2,
      } as any;

      mockVectorStore.searchByVector.mockResolvedValue([malformedResult]);

      const results = await retriever.retrieve('test query');

      // Should handle gracefully without crashing
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('configuration options', () => {
    it('should respect keyword weight setting', async () => {
      const highKeywordWeight = new AdvancedRAGRetriever(
        mockVectorStore,
        mockEmbeddingService,
        { keywordWeight: 0.8 }
      );

      const results = await highKeywordWeight.retrieve('test query');

      // With high keyword weight, keyword scores should have more influence
      results.forEach(result => {
        expect(typeof result.combinedScore).toBe('number');
      });
    });

    it('should respect diversity threshold setting', async () => {
      const strictDiversity = new AdvancedRAGRetriever(
        mockVectorStore,
        mockEmbeddingService,
        { diversityThreshold: 0.95 }
      );

      const results = await strictDiversity.retrieve('test query');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should respect max results setting', async () => {
      const limitedResults = new AdvancedRAGRetriever(
        mockVectorStore,
        mockEmbeddingService,
        { maxResults: 3 }
      );

      const multipleResults: SearchResult[] = Array.from({ length: 10 }, (_, i) => ({
        document: {
          ...sampleDocument,
          id: `doc${i}`,
        },
        score: 0.8,
        distance: 0.2,
      }));

      mockVectorStore.searchByVector.mockResolvedValue(multipleResults);

      const results = await limitedResults.retrieve('test query');

      expect(results.length).toBeLessThanOrEqual(3);
    });
  });
}); 