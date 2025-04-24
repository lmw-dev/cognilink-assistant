import { Notice } from 'obsidian';
import CogniLinkPlugin from '../main';
import { ChatMessage, AIResponse, MessageRole } from '../types/chat';
import { EmbeddingService } from './EmbeddingService';

// Custom error types
export class AIServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class ConfigurationError extends AIServiceError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
  }
}

export class APIError extends AIServiceError {
  constructor(message: string) {
    super(message, 'API_ERROR');
  }
}

export class NetworkError extends AIServiceError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}

interface Note {
  title: string;
  content: string;
  link: string;
}

interface APIMessage {
  role: MessageRole;
  content: string;
}

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
      throw new ConfigurationError('API key not configured. Please configure your API key in the settings.');
    }

    if (!message.trim()) {
      throw new AIServiceError('Message cannot be empty.', 'VALIDATION_ERROR');
    }

    try {
      // Get relevant context from the vault
      const relevantNotes = await this.embeddingService.findRelevantNotes(message);

      // Prepare context for the AI
      const context = this.prepareContext(relevantNotes);

      // Prepare messages array for the API
      const messages: APIMessage[] = [
        {
          role: 'system' as MessageRole,
          content: this.plugin.settings.defaultSystemPrompt,
        },
        ...history.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user' as MessageRole,
          content: `${context}\n\nUser message: ${message}`,
        },
      ];

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
          throw new ConfigurationError(`Unsupported API provider: ${apiProvider}`);
      }

      return {
        content: response.content,
        sources: relevantNotes.map(note => ({
          title: note.title,
          link: note.link,
        })),
      };
    } catch (error) {
      console.error('Error in AIService:', error);
      
      if (error instanceof AIServiceError) {
        throw error;
      }

      if (error instanceof TypeError || error instanceof NetworkError) {
        throw new NetworkError('Failed to connect to AI service. Please check your internet connection.');
      }

      throw new AIServiceError('An unexpected error occurred while processing your request.', 'UNKNOWN_ERROR');
    }
  }

  private prepareContext(notes: Note[]): string {
    if (!notes.length) {
      return '';
    }

    return `Relevant context from your notes:\n\n${notes
      .map(note => `From "${note.title}":\n${note.content}\n`)
      .join('\n')}`;
  }

  private async callOpenAI(messages: APIMessage[]): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.plugin.settings.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new APIError(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
      };
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      if (error instanceof TypeError) {
        throw new NetworkError('Failed to connect to OpenAI API. Please check your internet connection.');
      }
      throw new APIError('Failed to get response from OpenAI API.');
    }
  }

  private async callAnthropic(messages: APIMessage[]): Promise<AIResponse> {
    // TODO: Implement Anthropic API call
    throw new APIError('Anthropic integration not implemented yet');
  }

  private async callLocalModel(messages: APIMessage[]): Promise<AIResponse> {
    // TODO: Implement local model API call
    throw new APIError('Local model integration not implemented yet');
  }
}
