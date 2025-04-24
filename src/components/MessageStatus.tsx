import * as React from 'react';
import { Notice } from 'obsidian';

export enum MessageState {
  SENDING = 'sending',
  SUCCESS = 'success',
  ERROR = 'error',
  LOADING = 'loading',
  TYPING = 'typing',
}

interface MessageStatusProps {
  state: MessageState;
  message?: string;
  progress?: number;
  onRetry?: () => void;
}

interface LoadingDotsProps {
  color?: string;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ color = 'var(--text-muted)' }) => {
  return (
    <div className="loading-dots" style={{ color }}>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  );
};

export const MessageStatus: React.FC<MessageStatusProps> = ({
  state,
  message,
  progress,
  onRetry,
}: MessageStatusProps) => {
  const renderStatus = () => {
    switch (state) {
      case MessageState.SENDING:
        return (
          <div className="message-status sending">
            <span className="status-icon">📤</span>
            <span className="status-text">发送中</span>
            <LoadingDots />
          </div>
        );

      case MessageState.SUCCESS:
        return (
          <div className="message-status success">
            <span className="status-icon">✅</span>
            <span className="status-text">{message || '发送成功'}</span>
          </div>
        );

      case MessageState.ERROR:
        return (
          <div className="message-status error">
            <span className="status-icon">❌</span>
            <span className="status-text">{message || '发送失败'}</span>
            {onRetry && (
              <button className="retry-button" onClick={onRetry}>
                重试
              </button>
            )}
          </div>
        );

      case MessageState.LOADING:
        return (
          <div className="message-status loading">
            <span className="status-icon">⏳</span>
            <span className="status-text">{message || '加载中'}</span>
            {progress !== undefined && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        );

      case MessageState.TYPING:
        return (
          <div className="message-status typing">
            <span className="status-icon">✍️</span>
            <span className="status-text">正在输入</span>
            <LoadingDots />
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="message-status-container">{renderStatus()}</div>;
}; 