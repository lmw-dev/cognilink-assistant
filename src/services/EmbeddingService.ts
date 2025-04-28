import { TFile } from 'obsidian';
import CogniLinkPlugin from '../main';
import { cosineDistance } from '../utils/math';
import { ConfigurationError, APIError, NetworkError, AIService } from './AIService';
import { Logger } from '../utils/logger';

interface Note {
  title: string;
  content: string;
  link: string;
  embedding?: number[];
}

export class EmbeddingService {
  private plugin: CogniLinkPlugin;
  private logger: Logger;
  private aiService: AIService;

  constructor(plugin: CogniLinkPlugin) {
    this.plugin = plugin;
    this.logger = new Logger('EmbeddingService');
    this.aiService = new AIService(plugin);
    this.logger.info('EmbeddingService initialized');
  }

  async findRelevantNotes(query: string): Promise<Note[]> {
    try {
      // Get query embedding
      const queryEmbedding = await this.aiService.generateEmbeddings(query);
      
      // Load and embed all notes
      const notes = await this.loadNotes();
      const embeddedNotes = await Promise.all(
        notes.map(async (note) => ({
          ...note,
          embedding: await this.aiService.generateEmbeddings(note.content)
        }))
      );

      // Calculate similarities and sort
      const notesWithScores = embeddedNotes.map(note => ({
        note,
        score: note.embedding ? 1 - cosineDistance(queryEmbedding, note.embedding) : 0
      }));

      notesWithScores.sort((a, b) => b.score - a.score);

      // Return top 5 most relevant notes
      return notesWithScores.slice(0, 5).map(item => item.note);
    } catch (error) {
      this.logger.error('Error finding relevant notes:', error);
      return [];
    }
  }

  private async loadNotes(): Promise<Note[]> {
    const vault = this.plugin.app.vault;
    const notes: Note[] = [];

    for (const file of vault.getMarkdownFiles()) {
      const content = await vault.read(file);
      notes.push({
        title: file.basename,
        content: content,
        link: this.createNoteLink(file),
      });
    }

    return notes;
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
}
