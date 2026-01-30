
export interface Source {
  title: string;
  uri: string;
}

export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  sources?: Source[];
  modelUsed?: string;          // The model requested by the UI
  verifiedModel?: string;      // The model version reported by the API response
  tokenUsage?: TokenUsage;     // Token counts reported by the API
  timingMs?: number;           // Generation duration
  librarianStatus?: string;    // Current status of the Librarian tool (e.g., "Fetching SPAWN...")
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface Session {
  id: string;
  name: string;
  createdAt: Date;
  lastModified: Date;
}

export type ModelType = 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
export type ApiStatus = 'idle' | 'connecting' | 'thinking' | 'error' | 'streaming';

export interface AppSettings {
  model: ModelType;
  isDesanitized: boolean;
}
