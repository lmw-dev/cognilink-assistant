import { MessageState, MessageStatus, MessageLoadingState, MessageTypingState } from '../types/message';

type MessageStateObserver = (state: MessageState) => void;
type LoadingStateObserver = (state: MessageLoadingState) => void;
type TypingStateObserver = (state: MessageTypingState) => void;

export class MessageStateManager {
  private messageState: MessageState = { status: 'sent' };
  private loadingState: MessageLoadingState = { isLoading: false, progress: 0, total: 0 };
  private typingState: MessageTypingState = {
    isTyping: false,
    text: '',
    displayedText: '',
    typingSpeed: 50,
  };

  private messageObservers: MessageStateObserver[] = [];
  private loadingObservers: LoadingStateObserver[] = [];
  private typingObservers: TypingStateObserver[] = [];

  // Message State Management
  setMessageStatus(status: MessageStatus, error?: Error) {
    this.messageState = {
      ...this.messageState,
      status,
      error,
      retryCount: status === 'failed' ? (this.messageState.retryCount || 0) + 1 : 0,
    };
    this.notifyMessageObservers();
  }

  // Loading State Management
  startLoading(total: number) {
    this.loadingState = { isLoading: true, progress: 0, total };
    this.notifyLoadingObservers();
  }

  updateProgress(progress: number) {
    this.loadingState = { ...this.loadingState, progress };
    this.notifyLoadingObservers();
  }

  finishLoading() {
    this.loadingState = { isLoading: false, progress: this.loadingState.total, total: this.loadingState.total };
    this.notifyLoadingObservers();
  }

  // Typing State Management
  startTyping(text: string, speed: number = 50) {
    this.typingState = {
      isTyping: true,
      text,
      displayedText: '',
      typingSpeed: speed,
    };
    this.notifyTypingObservers();
    this.animateTyping();
  }

  private async animateTyping() {
    const { text, typingSpeed } = this.typingState;
    let currentIndex = 0;

    while (currentIndex < text.length && this.typingState.isTyping) {
      await new Promise(resolve => setTimeout(resolve, typingSpeed));
      currentIndex++;
      this.typingState = {
        ...this.typingState,
        displayedText: text.substring(0, currentIndex),
      };
      this.notifyTypingObservers();
    }

    if (currentIndex >= text.length) {
      this.stopTyping();
    }
  }

  stopTyping() {
    this.typingState = {
      ...this.typingState,
      isTyping: false,
      displayedText: this.typingState.text,
    };
    this.notifyTypingObservers();
  }

  // Observer Pattern Implementation
  subscribeToMessageState(observer: MessageStateObserver) {
    this.messageObservers.push(observer);
    return () => {
      this.messageObservers = this.messageObservers.filter(obs => obs !== observer);
    };
  }

  subscribeToLoadingState(observer: LoadingStateObserver) {
    this.loadingObservers.push(observer);
    return () => {
      this.loadingObservers = this.loadingObservers.filter(obs => obs !== observer);
    };
  }

  subscribeToTypingState(observer: TypingStateObserver) {
    this.typingObservers.push(observer);
    return () => {
      this.typingObservers = this.typingObservers.filter(obs => obs !== observer);
    };
  }

  private notifyMessageObservers() {
    this.messageObservers.forEach(observer => observer(this.messageState));
  }

  private notifyLoadingObservers() {
    this.loadingObservers.forEach(observer => observer(this.loadingState));
  }

  private notifyTypingObservers() {
    this.typingObservers.forEach(observer => observer(this.typingState));
  }

  // Getters
  getMessageState(): MessageState {
    return { ...this.messageState };
  }

  getLoadingState(): MessageLoadingState {
    return { ...this.loadingState };
  }

  getTypingState(): MessageTypingState {
    return { ...this.typingState };
  }
} 