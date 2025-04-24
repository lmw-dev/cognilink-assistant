import { Notice } from 'obsidian';
import { ErrorHandler } from '../ErrorHandler';
import { AIServiceError, ConfigurationError, APIError, NetworkError } from '../../services/AIService';

// Mock Obsidian Notice
jest.mock('obsidian', () => ({
  Notice: jest.fn().mockImplementation(function(this: any) {
    this.noticeEl = {
      createEl: jest.fn().mockReturnValue({
        style: {},
        onclick: null
      })
    };
    this.hide = jest.fn();
  })
}));

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    (Notice as jest.Mock).mockClear();
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  describe('handleError', () => {
    it('should handle ConfigurationError with correct message and duration', () => {
      const error = new ConfigurationError('API key not configured');
      errorHandler.handleError(error);

      expect(Notice).toHaveBeenCalledWith('⚙️ API key not configured', 10000);
      expect(mockConsoleError).toHaveBeenCalledWith('Error occurred:', error);
    });

    it('should handle APIError with retry button', () => {
      const error = new APIError('API request failed');
      const retryCallback = jest.fn();
      errorHandler.handleError(error, retryCallback);

      expect(Notice).toHaveBeenCalledWith('🔌 API request failed', 5000);
      expect(mockConsoleError).toHaveBeenCalledWith('Error occurred:', error);

      // Verify retry button creation
      const mockNotice = (Notice as jest.Mock).mock.instances[0];
      expect(mockNotice.noticeEl.createEl).toHaveBeenCalledWith('button', {
        text: 'Retry',
        cls: 'mod-cta'
      });
    });

    it('should handle NetworkError with retry button', () => {
      const error = new NetworkError('Connection failed');
      errorHandler.handleError(error);

      expect(Notice).toHaveBeenCalledWith('🌐 Connection failed', 5000);
      expect(mockConsoleError).toHaveBeenCalledWith('Error occurred:', error);
    });

    it('should handle unknown errors with default message', () => {
      const error = new Error('Unknown error');
      errorHandler.handleError(error);

      expect(Notice).toHaveBeenCalledWith('An unexpected error occurred. Please try again later.');
      expect(mockConsoleError).toHaveBeenCalledWith('Error occurred:', error);
    });
  });

  describe('notification methods', () => {
    it('should show success message', () => {
      errorHandler.showSuccess('Operation completed');
      expect(Notice).toHaveBeenCalledWith('✅ Operation completed', 3000);
    });

    it('should show info message', () => {
      errorHandler.showInfo('Information message');
      expect(Notice).toHaveBeenCalledWith('ℹ️ Information message', 4000);
    });

    it('should show warning message', () => {
      errorHandler.showWarning('Warning message');
      expect(Notice).toHaveBeenCalledWith('⚠️ Warning message', 5000);
    });
  });

  describe('retry mechanism', () => {
    it('should execute retry callback successfully', async () => {
      const error = new APIError('API request failed');
      const retryCallback = jest.fn().mockResolvedValue(undefined);
      errorHandler.handleError(error, retryCallback);

      // Get retry button click handler
      const mockNotice = (Notice as jest.Mock).mock.instances[0];
      const retryButton = mockNotice.noticeEl.createEl.mock.results[0].value;
      
      // Simulate click
      await retryButton.onclick();

      expect(retryCallback).toHaveBeenCalled();
      expect(mockNotice.hide).toHaveBeenCalled();
    });

    it('should handle retry failure', async () => {
      const error = new APIError('API request failed');
      const retryError = new APIError('Retry failed');
      const retryCallback = jest.fn().mockRejectedValue(retryError);
      errorHandler.handleError(error, retryCallback);

      const mockNotice = (Notice as jest.Mock).mock.instances[0];
      const retryButton = mockNotice.noticeEl.createEl.mock.results[0].value;
      
      await retryButton.onclick();

      expect(retryCallback).toHaveBeenCalled();
      expect(mockNotice.hide).toHaveBeenCalled();
      expect(Notice).toHaveBeenCalledWith('🔌 Retry failed', 5000);
    });
  });
}); 