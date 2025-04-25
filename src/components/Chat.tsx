import * as React from 'react';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import CogniLinkPlugin from '../main';
import { Message } from '../types/message';
import { v4 as uuidv4 } from 'uuid';

interface ChatProps {
  plugin: CogniLinkPlugin;
}

const ChatMessage = memo(({ message }: { message: Message }) => (
  <div className={`chat-message ${message.role}`}>
    <div className="message-content">{message.content}</div>
    <div className="message-timestamp">
      {new Date(message.timestamp).toLocaleTimeString()}
    </div>
  </div>
));

ChatMessage.displayName = 'ChatMessage';

export const Chat: React.FC<ChatProps> = ({ plugin }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Chat component mounted');
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    console.log('Submitting message...');
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Calling AIService.sendMessage...');
      const response = await plugin.aiService.sendMessage(userMessage);
      console.log('AIService response:', response);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          role: 'error',
          content: '消息发送失败，请重试',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <div className="cognilink-chat" ref={chatContainerRef}>
      <div className="chat-messages">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '发送中...' : '发送'}
        </button>
      </form>
    </div>
  );
};
