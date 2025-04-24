import React, { useEffect, useState } from 'react';
import { MessageState, MessageLoadingState, MessageTypingState } from '../types/message';
import { MessageStateManager } from '../utils/messageStateManager';

interface MessageStatusProps {
  messageId: string;
  stateManager: MessageStateManager;
  onRetry?: () => void;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({
  messageId,
  stateManager,
  onRetry,
}) => {
  const [messageState, setMessageState] = useState<MessageState>(stateManager.getMessageState());
  const [loadingState, setLoadingState] = useState<MessageLoadingState>(stateManager.getLoadingState());
  const [typingState, setTypingState] = useState<MessageTypingState>(stateManager.getTypingState());

  useEffect(() => {
    const unsubscribeMessage = stateManager.subscribeToMessageState(setMessageState);
    const unsubscribeLoading = stateManager.subscribeToLoadingState(setLoadingState);
    const unsubscribeTyping = stateManager.subscribeToTypingState(setTypingState);

    return () => {
      unsubscribeMessage();
      unsubscribeLoading();
      unsubscribeTyping();
    };
  }, [stateManager]);

  const renderStatus = () => {
    switch (messageState.status) {
      case 'sending':
        return (
          <div className="cognilink-message-status sending">
            <div className="cognilink-loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="cognilink-message-status failed">
            <span className="cognilink-error-icon">❌</span>
            {onRetry && (
              <button className="cognilink-retry-button" onClick={onRetry}>
                重试
              </button>
            )}
          </div>
        );

      case 'loading':
        return (
          <div className="cognilink-message-status loading">
            <div className="cognilink-progress-bar">
              <div
                className="cognilink-progress-fill"
                style={{ width: `${(loadingState.progress / loadingState.total) * 100}%` }}
              />
            </div>
          </div>
        );

      case 'typing':
        return (
          <div className="cognilink-message-status typing">
            <span className="cognilink-typing-text">{typingState.displayedText}</span>
            {typingState.isTyping && (
              <div className="cognilink-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="cognilink-message-status-container">{renderStatus()}</div>;
}; 