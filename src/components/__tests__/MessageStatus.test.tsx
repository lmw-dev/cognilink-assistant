import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageStatus, MessageState } from '../MessageStatus';

describe('MessageStatus', () => {
  it('renders sending state correctly', () => {
    render(<MessageStatus state={MessageState.SENDING} />);
    expect(screen.getByText('发送中')).toBeInTheDocument();
    const dots = screen.getAllByText('.');
    expect(dots).toHaveLength(3);
  });

  it('renders success state with custom message', () => {
    const message = '消息已发送';
    render(<MessageStatus state={MessageState.SUCCESS} message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders success state with default message', () => {
    render(<MessageStatus state={MessageState.SUCCESS} />);
    expect(screen.getByText('发送成功')).toBeInTheDocument();
  });

  it('renders error state with retry button', () => {
    const onRetry = jest.fn();
    render(<MessageStatus state={MessageState.ERROR} onRetry={onRetry} />);
    
    const retryButton = screen.getByText('重试');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders loading state with progress bar', () => {
    const progress = 75;
    render(<MessageStatus state={MessageState.LOADING} progress={progress} />);
    
    const progressFill = screen.getByText('加载中')
      .parentElement?.querySelector('.progress-fill');
    expect(progressFill).toHaveStyle({ width: '75%' });
  });

  it('renders typing state with loading dots', () => {
    render(<MessageStatus state={MessageState.TYPING} />);
    expect(screen.getByText('正在输入')).toBeInTheDocument();
    const dots = screen.getAllByText('.');
    expect(dots).toHaveLength(3);
  });

  it('renders nothing for unknown state', () => {
    const { container } = render(
      <MessageStatus state={'unknown' as MessageState} />
    );
    expect(container.firstChild?.firstChild).toBeNull();
  });
}); 