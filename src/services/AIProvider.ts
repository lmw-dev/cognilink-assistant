import { Message } from '../types/message';

export interface AIProvider {
  sendMessage(message: Message): Promise<Message>;
  generateEmbeddings(text: string): Promise<number[]>;
  testConnection?(): Promise<boolean>;
  generateOriginalDoc?(theme: string, context: string): Promise<string>;
} 