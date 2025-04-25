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
      },
      app: {
        vault: {
          getMarkdownFiles: jest.fn().mockReturnValue([]),
          read: jest.fn().mockResolvedValue(''),
          getName: jest.fn().mockReturnValue('test-vault'),
        },
      },
    } as unknown as CogniLinkPlugin;

    embeddingService = new EmbeddingService(plugin);
  });

  describe('findRelevantNotes', () => {
    it('should return empty array when no notes are found', async () => {
      const result = await embeddingService.findRelevantNotes('test query');
      expect(result).toEqual([]);
    });

    it('should return relevant notes when found', async () => {
      const mockFiles = [
        { basename: 'note1', path: 'note1.md' },
        { basename: 'note2', path: 'note2.md' },
      ] as TFile[];

      plugin.app.vault.getMarkdownFiles = jest.fn().mockReturnValue(mockFiles);
      plugin.app.vault.read = jest.fn().mockResolvedValue('test content');

      const result = await embeddingService.findRelevantNotes('test query');
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
}); 