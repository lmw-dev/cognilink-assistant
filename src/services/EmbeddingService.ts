import { TFile } from 'obsidian';
import CogniLinkPlugin from '../main';

interface Note {
  title: string;
  content: string;
  link: string;
  embedding?: number[];
}

export class EmbeddingService {
  private plugin: CogniLinkPlugin;

  constructor(plugin: CogniLinkPlugin) {
    this.plugin = plugin;
  }

  async findRelevantNotes(query: string): Promise<Note[]> {
    // TODO: Implement semantic search using embeddings
    // For now, return empty array
    return [];
  }

  private async getEmbedding(text: string): Promise<number[]> {
    // TODO: Implement embedding generation using OpenAI or local model
    throw new Error('Embedding generation not implemented yet');
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
    // Create an Obsidian URI for the note
    return `obsidian://open?vault=${encodeURIComponent(this.plugin.app.vault.getName())}&file=${encodeURIComponent(file.path)}`;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }

    const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return dotProduct / (magnitudeA * magnitudeB);
  }
} 