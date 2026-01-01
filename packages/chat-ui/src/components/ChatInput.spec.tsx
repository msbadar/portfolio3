import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  it('should render textarea and send button', () => {
    render(<ChatInput onSend={jest.fn()} />);
    
    expect(screen.getByTestId('chat-input-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input-send')).toBeInTheDocument();
  });

  it('should render custom placeholder', () => {
    render(<ChatInput onSend={jest.fn()} placeholder="Ask a question..." />);
    
    const textarea = screen.getByTestId('chat-input-textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Ask a question...');
  });

  it('should call onSend when send button is clicked', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    const textarea = screen.getByTestId('chat-input-textarea');
    const sendButton = screen.getByTestId('chat-input-send');
    
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello');
  });

  it('should call onSend when Enter is pressed', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    const textarea = screen.getByTestId('chat-input-textarea');
    
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello');
  });

  it('should not call onSend when Shift+Enter is pressed', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    const textarea = screen.getByTestId('chat-input-textarea');
    
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('should clear input after sending', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    const textarea = screen.getByTestId('chat-input-textarea') as HTMLTextAreaElement;
    const sendButton = screen.getByTestId('chat-input-send');
    
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);
    
    expect(textarea.value).toBe('');
  });

  it('should not send empty messages', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    const sendButton = screen.getByTestId('chat-input-send');
    fireEvent.click(sendButton);
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} disabled={true} />);
    
    const textarea = screen.getByTestId('chat-input-textarea');
    const sendButton = screen.getByTestId('chat-input-send');
    
    expect(textarea).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });
});
