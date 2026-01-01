import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatWidget } from './ChatWidget';

describe('ChatWidget', () => {
  it('should render toggle button', () => {
    render(<ChatWidget />);
    expect(screen.getByTestId('chat-toggle-button')).toBeInTheDocument();
  });

  it('should not show chat panel by default', () => {
    render(<ChatWidget />);
    expect(screen.queryByTestId('chat-widget-panel')).not.toBeInTheDocument();
  });

  it('should show chat panel when defaultOpen is true', () => {
    render(<ChatWidget defaultOpen={true} />);
    expect(screen.getByTestId('chat-widget-panel')).toBeInTheDocument();
  });

  it('should toggle chat panel when button is clicked', () => {
    render(<ChatWidget />);
    
    const toggleButton = screen.getByTestId('chat-toggle-button');
    fireEvent.click(toggleButton);
    
    expect(screen.getByTestId('chat-widget-panel')).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(screen.queryByTestId('chat-widget-panel')).not.toBeInTheDocument();
  });

  it('should render custom title', () => {
    render(<ChatWidget defaultOpen={true} title="Support Chat" />);
    expect(screen.getByText('Support Chat')).toBeInTheDocument();
  });

  it('should close chat when close button is clicked', () => {
    render(<ChatWidget defaultOpen={true} />);
    
    const closeButton = screen.getByTestId('chat-close-button');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('chat-widget-panel')).not.toBeInTheDocument();
  });

  it('should show empty state when no messages', () => {
    render(<ChatWidget defaultOpen={true} />);
    expect(screen.getByText('Start a conversation')).toBeInTheDocument();
  });

  it('should render initial messages', () => {
    const initialMessages = [
      {
        id: '1',
        content: 'Hello there!',
        role: 'user' as const,
        timestamp: new Date(),
      },
    ];
    
    render(<ChatWidget defaultOpen={true} initialMessages={initialMessages} />);
    expect(screen.getByText('Hello there!')).toBeInTheDocument();
  });

  it('should send message when input is submitted', async () => {
    const mockOnSendMessage = jest.fn().mockResolvedValue('Response');
    
    render(<ChatWidget defaultOpen={true} onSendMessage={mockOnSendMessage} />);
    
    const textarea = screen.getByTestId('chat-input-textarea');
    const sendButton = screen.getByTestId('chat-input-send');
    
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should clear messages when clear button is clicked', async () => {
    const initialMessages = [
      {
        id: '1',
        content: 'Hello',
        role: 'user' as const,
        timestamp: new Date(),
      },
    ];
    
    render(<ChatWidget defaultOpen={true} initialMessages={initialMessages} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    
    const clearButton = screen.getByTestId('chat-clear-button');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    });
  });
});
