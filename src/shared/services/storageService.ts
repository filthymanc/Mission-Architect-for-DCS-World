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

import { Session, Message } from "../../core/types";
import { STORAGE_KEYS } from "../../core/constants";

/**
 * Type Guard: Validate Session Object
 */
const isSession = (data: unknown): data is Session => {
  if (typeof data !== "object" || data === null) return false;
  const s = data as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.name === "string" &&
    (typeof s.createdAt === "string" || s.createdAt instanceof Date) &&
    (typeof s.lastModified === "string" || s.lastModified instanceof Date)
  );
};

/**
 * Type Guard: Validate Message Object
 */
const isMessage = (data: unknown): data is Message => {
  if (typeof data !== "object" || data === null) return false;
  const m = data as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    typeof m.text === "string" &&
    (m.role === "user" || m.role === "model") &&
    (typeof m.timestamp === "string" || m.timestamp instanceof Date)
  );
};

/**
 * Loads the Session Index.
 * Direct load for v2.5+ (Standardized Keys)
 */
export const loadSessionIndex = (): Session[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INDEX);

    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(isSession)
          .map((s) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            lastModified: new Date(s.lastModified),
          }));
      }
    }

    return [];
  } catch (e) {
    console.error("Storage Error: Failed to load session index", e);
    return [];
  }
};

/**
 * Saves the Session Index
 */
export const saveSessionIndex = (sessions: Session[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.INDEX, JSON.stringify(sessions));
  } catch (e) {
    console.error("Storage Error: Failed to save session index", e);
  }
};

/**
 * Loads messages for a specific session ID (Lazy Load)
 */
export const loadSessionMessages = (sessionId: string): Message[] => {
  try {
    const key = `${STORAGE_KEYS.SESSION_PREFIX}${sessionId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Hydrate Dates and Filter Invalid Messages
    return parsed
      .filter(isMessage)
      .map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
        isStreaming: false, // Always reset streaming state on load
      }));
  } catch (e) {
    console.error(
      `Storage Error: Failed to load messages for session ${sessionId}`,
      e,
    );
    return [];
  }
};

/**
 * Saves messages for a specific session ID
 */
export const saveSessionMessages = (sessionId: string, messages: Message[]) => {
  try {
    const key = `${STORAGE_KEYS.SESSION_PREFIX}${sessionId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (e) {
    console.error(
      `Storage Error: Failed to save messages for session ${sessionId}`,
      e,
    );
  }
};

/**
 * Deletes a specific session's message history
 */
export const deleteSessionData = (sessionId: string) => {
  try {
    const key = `${STORAGE_KEYS.SESSION_PREFIX}${sessionId}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.error(
      `Storage Error: Failed to delete session data ${sessionId}`,
      e,
    );
  }
};

/**
 * Clears all app data (Factory Reset)
 */
export const clearAllData = () => {
  try {
    const keysToRemove = [
      STORAGE_KEYS.INDEX,
      STORAGE_KEYS.API_KEY,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.ONBOARDED,
    ];

    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // Pattern Matching Removals for Sessions and Caches
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith(STORAGE_KEYS.SESSION_PREFIX) ||
        key.startsWith(STORAGE_KEYS.TREE_CACHE_PREFIX)
      ) {
        localStorage.removeItem(key);
      }
    });

    console.log("Factory Reset Complete: All local data wiped.");
  } catch (e) {
    console.error("Storage Error: Failed to clear all data", e);
  }
};
