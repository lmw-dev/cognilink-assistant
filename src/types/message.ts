export type MessageStatus = 'sending' | 'sent' | 'failed' | 'loading' | 'typing';

export interface MessageState {
  status: MessageStatus;
  error?: Error;
  progress?: number;
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