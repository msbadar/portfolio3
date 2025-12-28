import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatMessageComponent } from './ChatMessage';
import type { ChatMessage } from '../types';

describe('ChatMessageComponent', () => {
  const userMessage: ChatMessage = {
    id: '1',
    content: 'Hello, how are you?',
    role: 'user',
    timestamp: new Date('2024-01-15T10:30:00'),
  };

  const assistantMessage: ChatMessage = {
    id: '2',
    content: 'I am doing well, thank you!',
    role: 'assistant',
    timestamp: new Date('2024-01-15T10:31:00'),
  };

  const systemMessage: ChatMessage = {
    id: '3',
    content: 'System notification',
    role: 'system',
    timestamp: new Date('2024-01-15T10:32:00'),
  };

  it('should render user message content', () => {
    render(<ChatMessageComponent message={userMessage} />);
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
  });

  it('should render assistant message content', () => {
    render(<ChatMessageComponent message={assistantMessage} />);
    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
  });

  it('should render system message content', () => {
    render(<ChatMessageComponent message={systemMessage} />);
    expect(screen.getByText('System notification')).toBeInTheDocument();
  });

  it('should render message timestamp', () => {
    render(<ChatMessageComponent message={userMessage} />);
    // Check that time format is displayed (e.g., "10:30 AM")
    expect(screen.getByTestId('chat-message')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<ChatMessageComponent message={userMessage} className="custom-class" />);
    const messageElement = screen.getByTestId('chat-message');
    expect(messageElement).toHaveClass('custom-class');
  });
});
