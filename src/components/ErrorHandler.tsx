import { Notice } from 'obsidian';
import { AIServiceError } from '../services/AIService';

export class ErrorHandler {
  private static instance: ErrorHandler;
  private retryCallbacks: Map<string, () => Promise<void>> = new Map();

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error, retryCallback?: () => Promise<void>): void {
    console.error('Error occurred:', error);

    if (error instanceof AIServiceError) {
      this.handleAIServiceError(error, retryCallback);
    } else {
      new Notice('An unexpected error occurred. Please try again later.');
    }
  }

  private handleAIServiceError(error: AIServiceError, retryCallback?: () => Promise<void>): void {
    let message: string;
    let duration = 5000;
    let showRetry = false;

    switch (error.code) {
      case 'CONFIGURATION_ERROR':
        message = '⚙️ ' + error.message;
        duration = 10000; // Give more time to read configuration errors
        break;
      case 'API_ERROR':
        message = '🔌 ' + error.message;
        showRetry = true;
        break;
      case 'NETWORK_ERROR':
        message = '🌐 ' + error.message;
        showRetry = true;
        break;
      case 'VALIDATION_ERROR':
        message = '⚠️ ' + error.message;
        break;
      default:
        message = '❌ ' + error.message;
        showRetry = true;
    }

    const notice = new Notice(message, duration);

    if (showRetry && retryCallback) {
      const retryId = Math.random().toString(36).substring(7);
      this.retryCallbacks.set(retryId, retryCallback);

      // Add retry button to notice
      const retryButton = notice.noticeEl.createEl('button', {
        text: 'Retry',
        cls: 'mod-cta',
      });

      retryButton.style.marginTop = '8px';
      retryButton.onclick = async () => {
        notice.hide();
        const callback = this.retryCallbacks.get(retryId);
        if (callback) {
          try {
            await callback();
            this.retryCallbacks.delete(retryId);
          } catch (retryError) {
            this.handleError(
              retryError instanceof Error ? retryError : new Error(String(retryError))
            );
          }
        }
      };
    }
  }

  showSuccess(message: string): void {
    new Notice('✅ ' + message, 3000);
  }

  showInfo(message: string): void {
    new Notice('ℹ️ ' + message, 4000);
  }

  showWarning(message: string): void {
    new Notice('⚠️ ' + message, 5000);
  }
} 