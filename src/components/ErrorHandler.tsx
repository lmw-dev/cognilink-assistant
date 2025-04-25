import React from 'react';
import { AIServiceError, ConfigurationError, APIError, NetworkError } from '../services/AIService';

interface ErrorHandlerProps {
  error: AIServiceError | Error;
  onRetry?: () => void;
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({ error, onRetry }) => {
  let message = '发生错误';
  let showRetry = false;

  if (error instanceof ConfigurationError) {
    message = '配置错误：' + error.message;
    showRetry = false;
  } else if (error instanceof APIError) {
    message = 'API 错误：' + error.message;
    showRetry = true;
  } else if (error instanceof NetworkError) {
    message = '网络错误：' + error.message;
    showRetry = true;
  } else {
    message = '未知错误：' + error.message;
    showRetry = true;
  }

  return (
    <div className="error-container">
      <div className="error-message">{message}</div>
      {showRetry && onRetry && (
        <button className="retry-button" onClick={onRetry}>
          重试
        </button>
      )}
    </div>
  );
};
