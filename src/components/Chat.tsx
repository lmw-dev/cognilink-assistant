import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import CogniLinkPlugin from '../main';
import { ChatMessage } from '../types/chat';
import { AIService } from '../services/AIService';

interface ChatProps {
  plugin: CogniLinkPlugin;
}

export const Chat: React.FC<ChatProps> = ({ plugin }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiService = new AIService(plugin);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(input, messages);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        sources: response.sources,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Show error in UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cognilink-chat">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.role}`}
          >
            <div className="message-content">
              {message.content}
            </div>
            {message.sources && (
              <div className="message-sources">
                <small>Sources:</small>
                <ul>
                  {message.sources.map((source, idx) => (
                    <li key={idx}>
                      <a href={source.link}>{source.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}; 