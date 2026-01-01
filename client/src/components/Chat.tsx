"use client";

import { ChatWidget } from "@portfolio/chat-ui";
import { useCallback } from "react";

/**
 * Chat component that integrates the chat-ui package
 * Provides a floating chat widget for contacting the author
 */
export const Chat = () => {
  // Handler for sending messages to the author
  const handleSendMessage = useCallback(async (message: string): Promise<string> => {
    // Simulate sending message to author
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return author's response
    return "Thanks for reaching out! I'll get back to you soon.";
  }, []);

  return (
    <ChatWidget
      title="Chat with Author"
      placeholder="Send a message to the author..."
      onSendMessage={handleSendMessage}
    />
  );
};
