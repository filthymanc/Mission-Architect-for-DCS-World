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

import { useState, useEffect } from "react";
import { Message } from "../../core/types";
import * as storage from "../../shared/services/storageService";
import { WELCOME_MESSAGE_TEXT } from "../../core/constants";

/**
 * Manages the message history for the ACTIVE session only.
 * This is the core of the Lazy Loading strategy.
 */
export const useSessionData = (targetSessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null);

  // DERIVED STATE:
  // We determine loading status by checking if the requested ID matches the loaded ID.
  // This is synchronous and safer than useEffect-based state toggling for blocking renders.
  const isLoadingData = targetSessionId !== loadedSessionId;

  useEffect(() => {
    let active = true;

    if (!targetSessionId) {
      setMessages([]);
      setLoadedSessionId(null);
      return;
    }

    // Load data from storage (Async)
    const load = async () => {
      try {
        const data = await storage.loadSessionMessages(targetSessionId);
        if (active) {
          setMessages(data);
          setLoadedSessionId(targetSessionId);
        }
      } catch (e) {
        console.error("Failed to load session messages", e);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [targetSessionId]);

  const updateMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    if (targetSessionId) {
      storage
        .saveSessionMessages(targetSessionId, newMessages)
        .catch(console.error);
    }
  };

  const clearMessages = () => {
    if (!targetSessionId) return;

    const welcomeMsg: Message = {
      id: "init-" + Date.now(),
      role: "model",
      text: WELCOME_MESSAGE_TEXT,
      timestamp: new Date(),
      isStreaming: false,
    };

    updateMessages([welcomeMsg]);
  };

  return {
    // CRITICAL: Return empty array while loading to prevent 'Ghosting' (showing old session data)
    messages: isLoadingData ? [] : messages,
    setMessages: updateMessages,
    clearMessages,
    isLoadingData,
  };
};
