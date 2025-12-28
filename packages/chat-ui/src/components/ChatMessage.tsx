'use client';

import React from 'react';
import type { ChatMessageProps } from '../types';

/**
 * Renders a single chat message with appropriate styling based on role
 */
export function ChatMessageComponent({ message, className = '' }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const baseStyles = {
    display: 'flex',
    flexDirection: isUser ? 'row-reverse' : 'row',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  } as const;

  const bubbleStyles = {
    maxWidth: '80%',
    padding: '0.75rem 1rem',
    borderRadius: '1rem',
    backgroundColor: isUser
      ? 'var(--accent, #3b82f6)'
      : isSystem
        ? 'var(--surface-secondary, #f3f4f6)'
        : 'var(--surface, #f1f5f9)',
    color: isUser ? 'white' : 'var(--foreground, #1f2937)',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    borderBottomRightRadius: isUser ? '0.25rem' : '1rem',
    borderBottomLeftRadius: isUser ? '1rem' : '0.25rem',
  } as const;

  const timeStyles = {
    fontSize: '0.625rem',
    color: 'var(--muted, #9ca3af)',
    marginTop: '0.25rem',
    textAlign: isUser ? 'right' : 'left',
  } as const;

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date instanceof Date ? date : new Date(date));
  };

  return (
    <div style={baseStyles} className={className} data-testid="chat-message">
      <div>
        <div style={bubbleStyles}>{message.content}</div>
        <div style={timeStyles}>{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
}
