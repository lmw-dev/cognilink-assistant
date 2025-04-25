export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'failed' | 'loading' | 'typing';

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: number;
}

export interface MessageState {
  status: MessageStatus;
  error?: Error;
  retryCount?: number;
}

export interface MessageLoadingState {
  isLoading: boolean;
  progress: number;
  total: number;
}

export interface MessageTypingState {
  isTyping: boolean;
  text: string;
  displayedText: string;
  typingSpeed: number;
}

export interface MessageAnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
} 