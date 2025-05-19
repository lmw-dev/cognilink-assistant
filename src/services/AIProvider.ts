import { Message } from '../types/message';

export interface AIProvider {
  sendMessage(message: Message): Promise<Message>;
  generateEmbeddings(text: string): Promise<number[]>;
  testConnection?(): Promise<boolean>;
} 