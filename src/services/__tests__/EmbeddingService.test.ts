import { EmbeddingService } from '../EmbeddingService';
import CogniLinkPlugin from '../../main';
import { TFile } from 'obsidian';

jest.mock('openai');

describe('EmbeddingService', () => {
  let plugin: CogniLinkPlugin;
  let embeddingService: EmbeddingService;

  beforeEach(() => {
    plugin = {
      settings: {
        ai: {
          provider: 'openai',
          openAIApiKey: 'test-openai-key',
          anthropicApiKey: 'test-anthropic-key',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          defaultSystemPrompt: '你是一个智能助手',
        },
        ui: {
          theme: 'system',
          fontSize: 'medium',
          messageSpacing: 'comfortable',
          showTimestamp: true,
          enableAnimations: true,
        },
        shortcuts: {
          toggleChat: 'Mod+Shift+C',
          newChat: 'Mod+Shift+N',
          focusInput: 'Mod+Shift+I',
        },
        embedding: {
          embeddingProvider: 'openai',
          openai: { apiKey: 'test', model: 'text-embedding-ada-002', endpoint: 'https://api.openai.com/v1' },
          gemini: { apiKey: 'test', model: 'gemini-embedding-exp-03-07', endpoint: 'https://generativelanguage.googleapis.com' }
        }
      },
      app: {
        vault: {
          getMarkdownFiles: jest.fn().mockReturnValue([]),
          read: jest.fn().mockResolvedValue(''),
          getName: jest.fn().mockReturnValue('test-vault'),
          adapter: {
            exists: jest.fn().mockResolvedValue(false),
            read: jest.fn().mockResolvedValue(''),
          }
        },
      },
    } as unknown as CogniLinkPlugin;

    embeddingService = new EmbeddingService(plugin);
    (embeddingService as any).embeddingProvider = { generateEmbeddings: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]) };
  });

  describe('findRelevantNotes', () => {
    it('should return empty array when no notes are found', async () => {
      const result = await embeddingService.findRelevantNotes('note');
      expect(result).toEqual([]);
    });

    it('should return relevant notes when found', async () => {
      const mockFiles = [
        { basename: 'note1', path: 'note1.md', stat: { mtime: 1 } },
        { basename: 'note2', path: 'note2.md', stat: { mtime: 1 } },
      ] as TFile[];
      plugin.app.vault.getMarkdownFiles = jest.fn().mockReturnValue(mockFiles);
      plugin.app.vault.read = jest.fn().mockResolvedValue('test content');
      plugin.app.metadataCache = { getFileCache: jest.fn().mockReturnValue({ tags: [] }) } as any;
      const result = await embeddingService.findRelevantNotes('note');
      expect(result.length).toBeLessThanOrEqual(5);
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('content');
      expect(result[0]).toHaveProperty('link');
    });
  });

  describe('cosineSimilarity', () => {
    it('should throw error for vectors of different lengths', () => {
      const a = [1, 2, 3];
      const b = [1, 2];
      const service = embeddingService as any;
      expect(() => {
        service.cosineSimilarity(a, b);
      }).toThrow('Vectors must have same length');
    });

    it('should calculate cosine similarity correctly', () => {
      const a = [1, 0, 1];
      const b = [1, 1, 0];
      const service = embeddingService as any;
      const similarity = service.cosineSimilarity(a, b);
      expect(similarity).toBeCloseTo(0.5, 5);
    });
  });

  describe('RAG whitelist/blacklist filtering', () => {
    const mockFiles = [
      { basename: 'golden', path: 'Golden-Knowledge/note1.md', stat: { mtime: 1 } },
      { basename: 'clip', path: 'Clippings/note2.md', stat: { mtime: 1 } },
      { basename: 'root', path: 'note3.md', stat: { mtime: 1 } },
      { basename: 'sub', path: 'Golden-Knowledge/sub/note4.md', stat: { mtime: 1 } },
      { basename: 'res', path: '_resources/note5.md', stat: { mtime: 1 } },
    ] as unknown as TFile[];

    beforeEach(() => {
      plugin.app.vault.getMarkdownFiles = jest.fn().mockReturnValue(mockFiles);
      plugin.app.vault.read = jest.fn().mockResolvedValue('test content');
      plugin.app.metadataCache = { getFileCache: jest.fn().mockReturnValue({ tags: [] }) } as any;
      (embeddingService as any).embeddings = {};
    });

    it('should only return files in whitelist', async () => {
      plugin.settings.rag = { indexWhitelist: ['Golden-Knowledge/'], indexBlacklist: [] };
      const result = await embeddingService.findRelevantNotes('note');
      expect(result.every(n => n.path.startsWith('Golden-Knowledge/'))).toBe(true);
    });

    it('should exclude files in blacklist', async () => {
      plugin.settings.rag = { indexWhitelist: [], indexBlacklist: ['Clippings/', '_resources/'] };
      const result = await embeddingService.findRelevantNotes('note');
      expect(result.some(n => n.path.startsWith('Clippings/'))).toBe(false);
      expect(result.some(n => n.path.startsWith('_resources/'))).toBe(false);
    });

    it('should apply both whitelist and blacklist (blacklist wins)', async () => {
      plugin.settings.rag = { indexWhitelist: ['Golden-Knowledge/', 'Clippings/'], indexBlacklist: ['Clippings/'] };
      const result = await embeddingService.findRelevantNotes('note');
      expect(result.some(n => n.path.startsWith('Clippings/'))).toBe(false);
      expect(result.some(n => n.path.startsWith('Golden-Knowledge/'))).toBe(true);
    });

    it('should not filter if both lists are empty', async () => {
      plugin.settings.rag = { indexWhitelist: [], indexBlacklist: [] };
      const result = await embeddingService.findRelevantNotes('note');
      expect(result.length).toBe(mockFiles.length);
    });

    it('should match subfolders and prefix correctly', async () => {
      plugin.settings.rag = { indexWhitelist: ['Golden-Knowledge/'], indexBlacklist: [] };
      const result = await embeddingService.findRelevantNotes('note');
      expect(result.some(n => n.path === 'Golden-Knowledge/sub/note4.md')).toBe(true);
    });
  });
}); 