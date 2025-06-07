import { Message } from '../types/message';

export interface AIProvider {
  sendMessage(message: Message): Promise<Message>;
  generateEmbeddings(text: string): Promise<number[]>;
  testConnection?(): Promise<boolean>;
  generateOriginalDoc?(theme: string, context: string): Promise<string>;
  // 预留 Google Gemini 和 DeepSeek 方法（可与 OpenAI 兼容）
} 