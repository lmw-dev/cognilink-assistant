import { TFile } from 'obsidian';
import CogniLinkPlugin from '../main';
import OpenAI from 'openai';

interface Note {
  title: string;
  content: string;
  link: string;
  embedding?: number[];
}

export class EmbeddingService {
  private plugin: CogniLinkPlugin;
  private openai: OpenAI;

  constructor(plugin: CogniLinkPlugin) {
    this.plugin = plugin;
    this.openai = new OpenAI({
      apiKey: this.plugin.settings.ai.openAIApiKey,
    });
  }

  async findRelevantNotes(query: string): Promise<Note[]> {
    try {
      // Get query embedding
      const queryEmbedding = await this.getEmbedding(query);
      
      // Load and embed all notes
      const notes = await this.loadNotes();
      const embeddedNotes = await Promise.all(
        notes.map(async (note) => ({
          ...note,
          embedding: await this.getEmbedding(note.content)
        }))
      );

      // Calculate similarities and sort
      const notesWithScores = embeddedNotes.map(note => ({
        note,
        score: this.cosineSimilarity(queryEmbedding, note.embedding!)
      }));

      notesWithScores.sort((a, b) => b.score - a.score);

      // Return top 5 most relevant notes
      return notesWithScores.slice(0, 5).map(item => item.note);
    } catch (error) {
      console.error('Error finding relevant notes:', error);
      return [];
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text.slice(0, 8191), // OpenAI has a token limit
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
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
