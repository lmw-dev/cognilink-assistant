import { Message } from './message';

export interface Conversation {
  id: string;
  title?: string; // Optional title for the conversation
  messages: Message[];
  createdAt: number; // Timestamp of creation
  updatedAt: number; // Timestamp of last update
  // You can add other metadata here if needed, e.g.:
  // currentModel?: string;
  // temperature?: number;
  // context?: any; // For RAG or specific session context
} 