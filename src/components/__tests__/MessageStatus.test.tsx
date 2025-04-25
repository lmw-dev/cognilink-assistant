import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MessageStatus } from '../MessageStatus';
import { MessageStateManager } from '../../utils/messageStateManager';

describe('MessageStatus', () => {
  let stateManager: MessageStateManager;
  const messageId = 'test-message-id';

  beforeEach(() => {
    stateManager = new MessageStateManager();
  });

  it('renders sending state correctly', () => {
    stateManager.setMessageStatus('sending');
    render(<MessageStatus messageId={messageId} stateManager={stateManager} />);
    expect(screen.getByTestId('loading-dots')).toBeInTheDocument();
  });

  it('renders error state with retry button', () => {
    const onRetry = jest.fn();
    stateManager.setMessageStatus('failed');
    render(<MessageStatus messageId={messageId} stateManager={stateManager} onRetry={onRetry} />);
    
    const retryButton = screen.getByText('重试');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders loading state with progress bar', () => {
    stateManager.setMessageStatus('loading');
    stateManager.startLoading(100);
    stateManager.updateProgress(75);
    render(<MessageStatus messageId={messageId} stateManager={stateManager} />);
    
    const progressFill = screen.getByTestId('progress-fill');
    expect(progressFill).toHaveStyle({ width: '75%' });
  });

  it('renders typing state with indicator', async () => {
    stateManager.setMessageStatus('typing');
    const { container } = render(<MessageStatus messageId={messageId} stateManager={stateManager} />);
    
    await act(async () => {
      stateManager.startTyping('正在输入');
      // Wait for the first character to appear
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(screen.getByText(/正/)).toBeInTheDocument();
    expect(container.querySelector('.cognilink-typing-indicator')).toBeInTheDocument();
  });

  it('renders nothing for unknown state', () => {
    stateManager.setMessageStatus('unknown' as any);
    const { container } = render(
      <MessageStatus messageId={messageId} stateManager={stateManager} />
    );
    expect(container.querySelector('.cognilink-message-status')).toBeNull();
  });
}); 