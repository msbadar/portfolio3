'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessageComponent } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat } from '../hooks/useChat';
import type { ChatWidgetProps } from '../types';

/**
 * A complete chat widget component with collapsible interface
 */
export function ChatWidget({
  onSendMessage,
  initialMessages = [],
  placeholder = 'Type a message...',
  title = 'Chat',
  defaultOpen = false,
  className = '',
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat(
    onSendMessage,
    initialMessages
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isOpen && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const containerStyles = {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    zIndex: 1000,
  } as const;

  const buttonStyles = {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '50%',
    backgroundColor: 'var(--accent, #3b82f6)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  } as const;

  const widgetStyles = {
    position: 'absolute',
    bottom: '4.5rem',
    right: 0,
    width: '22rem',
    maxHeight: '32rem',
    backgroundColor: 'var(--background, #ffffff)',
    borderRadius: '1rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid var(--border, #e5e7eb)',
  } as const;

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border, #e5e7eb)',
    backgroundColor: 'var(--surface, #f9fafb)',
  } as const;

  const titleStyles = {
    fontWeight: 600,
    fontSize: '0.9375rem',
    color: 'var(--foreground, #1f2937)',
  } as const;

  const messagesContainerStyles = {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    minHeight: '16rem',
    maxHeight: '20rem',
  } as const;

  const loadingStyles = {
    display: 'flex',
    gap: '0.25rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--surface, #f1f5f9)',
    borderRadius: '1rem',
    marginBottom: '0.75rem',
    width: 'fit-content',
  } as const;

  const dotStyles = {
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '50%',
    backgroundColor: 'var(--muted, #9ca3af)',
    animation: 'pulse 1.5s ease-in-out infinite',
  } as const;

  const errorStyles = {
    padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--error-bg, #fef2f2)',
    color: 'var(--error, #dc2626)',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    marginBottom: '0.5rem',
  } as const;

  const emptyStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--muted, #9ca3af)',
    fontSize: '0.875rem',
    textAlign: 'center',
    padding: '2rem',
  } as const;

  const headerButtonStyles = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--muted, #9ca3af)',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.375rem',
    transition: 'color 0.2s',
  } as const;

  return (
    <div style={containerStyles} className={className} data-testid="chat-widget">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={buttonStyles}
        data-testid="chat-toggle-button"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div style={widgetStyles} data-testid="chat-widget-panel">
          {/* Header */}
          <div style={headerStyles}>
            <span style={titleStyles}>{title}</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearMessages}
                  style={headerButtonStyles}
                  title="Clear messages"
                  data-testid="chat-clear-button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={headerButtonStyles}
                title="Close chat"
                data-testid="chat-close-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={messagesContainerStyles}>
            {messages.length === 0 ? (
              <div style={emptyStyles}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginBottom: '0.75rem' }}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Start a conversation</span>
              </div>
            ) : (
              <>
                {error && <div style={errorStyles}>{error}</div>}
                {messages.map((message) => (
                  <ChatMessageComponent key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div style={loadingStyles}>
                    <span style={{ ...dotStyles, animationDelay: '0s' }}></span>
                    <span style={{ ...dotStyles, animationDelay: '0.2s' }}></span>
                    <span style={{ ...dotStyles, animationDelay: '0.4s' }}></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <ChatInput
            onSend={sendMessage}
            placeholder={placeholder}
            disabled={isLoading}
          />
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
