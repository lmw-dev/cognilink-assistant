import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ErrorHandler } from '../ErrorHandler';
import { ConfigurationError, APIError, NetworkError } from '../../services/AIService';

describe('ErrorHandler', () => {
  it('should display configuration error message', () => {
    const error = new ConfigurationError('API key not configured');
    const { getByText } = render(<ErrorHandler error={error} />);
    
    expect(getByText('配置错误：API key not configured')).toBeInTheDocument();
  });

  it('should display API error message with retry button', () => {
    const error = new APIError('Invalid request');
    const onRetry = jest.fn();
    const { getByText } = render(<ErrorHandler error={error} onRetry={onRetry} />);
    
    expect(getByText('API 错误：Invalid request')).toBeInTheDocument();
    const retryButton = getByText('重试');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('should display network error message with retry button', () => {
    const error = new NetworkError('Connection failed');
    const onRetry = jest.fn();
    const { getByText } = render(<ErrorHandler error={error} onRetry={onRetry} />);
    
    expect(getByText('网络错误：Connection failed')).toBeInTheDocument();
    const retryButton = getByText('重试');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('should display unknown error message with retry button', () => {
    const error = new Error('Unknown error');
    const onRetry = jest.fn();
    const { getByText } = render(<ErrorHandler error={error as any} onRetry={onRetry} />);
    
    expect(getByText('未知错误：Unknown error')).toBeInTheDocument();
    const retryButton = getByText('重试');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });
}); 