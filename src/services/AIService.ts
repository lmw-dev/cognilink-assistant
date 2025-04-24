import { Notice } from 'obsidian';
import CogniLinkPlugin from '../main';
import { ChatMessage, AIResponse } from '../types/chat';
import { EmbeddingService } from './EmbeddingService';

export class AIService {
  private plugin: CogniLinkPlugin;
  private embeddingService: EmbeddingService;

  constructor(plugin: CogniLinkPlugin) {
    this.plugin = plugin;
    this.embeddingService = new EmbeddingService(plugin);
  }

  async sendMessage(message: string, history: ChatMessage[]): Promise<AIResponse> {
    const { apiProvider, apiKey } = this.plugin.settings;

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    // Get relevant context from the vault
    const relevantNotes = await this.embeddingService.findRelevantNotes(message);
    
    // Prepare context for the AI
    const context = this.prepareContext(relevantNotes);
    
    // Prepare messages array for the API
    const messages = [
      {
        role: 'system',
        content: this.plugin.settings.defaultSystemPrompt
      },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: `${context}\n\nUser message: ${message}`
      }
    ];

    try {
      let response: AIResponse;

      switch (apiProvider) {
        case 'openai':
          response = await this.callOpenAI(messages);
          break;
        case 'anthropic':
          response = await this.callAnthropic(messages);
          break;
        case 'local':
          response = await this.callLocalModel(messages);
          break;
        default:
          throw new Error('Unsupported API provider');
      }

      return {
        content: response.content,
        sources: relevantNotes.map(note => ({
          title: note.title,
          link: note.link
        }))
      };
    } catch (error) {
      console.error('Error calling AI service:', error);
      new Notice('Error: Failed to get AI response');
      throw error;
    }
  }

  private prepareContext(notes: any[]): string {
    // TODO: Implement context preparation from relevant notes
    return notes.map(note => `${note.title}:\n${note.content}`).join('\n\n');
  }

  private async callOpenAI(messages: any[]): Promise<AIResponse> {
    // TODO: Implement OpenAI API call
    throw new Error('OpenAI integration not implemented yet');
  }

  private async callAnthropic(messages: any[]): Promise<AIResponse> {
    // TODO: Implement Anthropic API call
    throw new Error('Anthropic integration not implemented yet');
  }

  private async callLocalModel(messages: any[]): Promise<AIResponse> {
    // TODO: Implement local model API call
    throw new Error('Local model integration not implemented yet');
  }
} 