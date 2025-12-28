"use client";

import { ChatWidget } from "@portfolio/chat-ui";
import { useCallback } from "react";

/**
 * Chat component that integrates the chat-ui package
 * Provides a floating chat widget for user interactions
 */
export const Chat = () => {
  // Handler for sending messages
  // This can be connected to an API endpoint for AI responses
  const handleSendMessage = useCallback(async (message: string): Promise<string> => {
    // Simulate API delay for now
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Return a simulated response
    // In production, this would call an API endpoint
    return `Thanks for your message: "${message}". This is a placeholder response. Connect to an AI service for real responses.`;
  }, []);

  return (
    <ChatWidget
      title="Chat"
      placeholder="Ask me anything..."
      onSendMessage={handleSendMessage}
    />
  );
};
