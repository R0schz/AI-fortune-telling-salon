export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type ChatMode = 'fortune' | 'general' | 'tarot' | 'numerology';

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  mode: ChatMode;
}
