import { AIProvider } from './AIProvider';
import { Message, MessageRole } from '../types/message';

export class LocalProvider implements AIProvider {
  async sendMessage(message: Message): Promise<Message> {
    return {
      id: Date.now().toString(),
      role: 'assistant' as MessageRole,
      content: 'LocalProvider mock response',
      timestamp: Date.now(),
    };
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    return Array(1536).fill(0).map(() => Math.random());
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
} 