'use client';

import { useState, useCallback } from 'react';
import type { ChatMessage, UseChatReturn } from '../types';

/**
 * Generates a unique ID for messages
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Hook for managing chat state and interactions
 * @param onSendMessage - Optional callback to handle message sending (e.g., API call)
 * @param initialMessages - Optional initial messages to display
 */
export function useChat(
  onSendMessage?: (message: string) => Promise<string>,
  initialMessages: ChatMessage[] = []
): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        content: content.trim(),
        role: 'user',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setError(null);
      setIsLoading(true);

      try {
        // If onSendMessage is provided, call it and add the response
        if (onSendMessage) {
          const response = await onSendMessage(content);
          const assistantMessage: ChatMessage = {
            id: generateId(),
            content: response,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [onSendMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
