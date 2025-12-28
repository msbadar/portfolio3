/**
 * Represents a chat message
 */
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

/**
 * Represents a chat conversation
 */
export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chat state for the hook
 */
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Props for the ChatWidget component
 */
export interface ChatWidgetProps {
  /** Callback when a message is sent */
  onSendMessage?: (message: string) => Promise<string>;
  /** Initial messages to display */
  initialMessages?: ChatMessage[];
  /** Placeholder text for the input */
  placeholder?: string;
  /** Title for the chat header */
  title?: string;
  /** Whether the chat is initially open */
  defaultOpen?: boolean;
  /** Custom CSS class name */
  className?: string;
}

/**
 * Props for the ChatMessage component
 */
export interface ChatMessageProps {
  message: ChatMessage;
  className?: string;
}

/**
 * Props for the ChatInput component
 */
export interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Return type for the useChat hook
 */
export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}
