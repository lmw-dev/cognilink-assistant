export interface Source {
  title: string;
  link: string;
  content?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface AIResponse {
  content: string;
  sources?: Source[];
} 