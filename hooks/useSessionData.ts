import { useState, useEffect } from 'react';
import { Message } from '../types';
import * as storage from '../services/storageService';

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
    if (!targetSessionId) {
      setMessages([]);
      setLoadedSessionId(null);
      return;
    }

    // Load data from storage
    // Even though localStorage is synchronous, we treat it as an effect 
    // to keep the render path clean.
    const data = storage.loadSessionMessages(targetSessionId);
    
    setMessages(data);
    setLoadedSessionId(targetSessionId);

  }, [targetSessionId]);

  const updateMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    if (targetSessionId) {
      storage.saveSessionMessages(targetSessionId, newMessages);
    }
  };

  const clearMessages = () => {
      if (!targetSessionId) return;
      
      const welcomeMsg: Message = {
        id: 'init-' + Date.now(),
        role: 'model',
        text: "**DCS MISSION ARCHITECT ONLINE**\n\nSafety Protocols: **ACTIVE**\nReady to assist with MOOSE scripting and DML attribute configuration.\n\nPlease define your mission objective.",
        timestamp: new Date(),
        isStreaming: false
      };
      
      updateMessages([welcomeMsg]);
  };

  return {
    // CRITICAL: Return empty array while loading to prevent 'Ghosting' (showing old session data)
    messages: isLoadingData ? [] : messages,
    setMessages: updateMessages,
    clearMessages,
    isLoadingData
  };
};
