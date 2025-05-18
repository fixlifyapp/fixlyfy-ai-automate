
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: string;
  isLoading?: boolean;
}

export interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface FeedbackType {
  messageId: string;
  isPositive: boolean;
  timestamp: string;
}
