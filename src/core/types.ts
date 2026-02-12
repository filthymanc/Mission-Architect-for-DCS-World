/*
 * Mission Architect for DCS
 * Copyright (C) 2026 the filthymanc
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
  role: "user" | "model";
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  sources?: Source[];
  modelUsed?: string; // The model requested by the UI
  verifiedModel?: string; // The model version reported by the API response
  tokenUsage?: TokenUsage; // Token counts reported by the API
  timingMs?: number; // Generation duration
  librarianStatus?: string; // Current status of the Librarian tool (e.g., "Fetching SPAWN...")
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

export type ModelType = "gemini-3-flash-preview" | "gemini-3-pro-preview";
export type ApiStatus =
  | "idle"
  | "connecting"
  | "thinking"
  | "error"
  | "streaming"
  | "offline";

export type ThemeMode = "standard" | "carbon" | "oled" | "paper";
export type ThemeAccent = "emerald" | "cyan" | "amber" | "rose" | "violet";

export interface AppSettings {
  model: ModelType;
  isDesanitized: boolean;
  themeMode: ThemeMode;
  themeAccent: ThemeAccent;
}
