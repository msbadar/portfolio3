'use client';

import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import type { ChatInputProps } from '../types';

/**
 * Chat input component for sending messages
 */
export function ChatInput({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  className = '',
}: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const containerStyles = {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.75rem',
    borderTop: '1px solid var(--border, #e5e7eb)',
    backgroundColor: 'var(--background, #ffffff)',
  } as const;

  const textareaStyles = {
    flex: 1,
    resize: 'none',
    border: '1px solid var(--border, #e5e7eb)',
    borderRadius: '0.75rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    minHeight: '2.5rem',
    maxHeight: '6rem',
    outline: 'none',
    backgroundColor: 'var(--surface, #f9fafb)',
    color: 'var(--foreground, #1f2937)',
  } as const;

  const buttonStyles = {
    padding: '0.5rem 1rem',
    borderRadius: '0.75rem',
    backgroundColor: disabled ? 'var(--muted, #9ca3af)' : 'var(--accent, #3b82f6)',
    color: 'white',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  } as const;

  return (
    <div style={containerStyles} className={className} data-testid="chat-input">
      <textarea
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={textareaStyles}
        rows={1}
        data-testid="chat-input-textarea"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        style={buttonStyles}
        data-testid="chat-input-send"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  );
}
