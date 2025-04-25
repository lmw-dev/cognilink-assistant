export type MessageRole = 'user' | 'assistant' | 'system';

export interface Source {
  title: string;
  link: string;
  content?: string;
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface AIResponse {
  content: string;
  sources?: Source[];
}
