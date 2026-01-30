import { useState, useEffect, useCallback } from 'react';
import { Session, Message } from '../types';
import * as storage from '../services/storageService';

export const useSessionManager = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Load Session Index on Mount
  useEffect(() => {
    let loadedSessions = storage.loadSessionIndex();
    
    // Auto-Create Default Session if empty
    if (loadedSessions.length === 0) {
        const defaultId = Date.now().toString();
        const defaultSession: Session = {
            id: defaultId,
            name: "Mission 1",
            createdAt: new Date(),
            lastModified: new Date()
        };
        
        // Save initial session immediately to disk
        storage.saveSessionIndex([defaultSession]);
        
        // Save initial welcome message to disk
        const welcomeMsg: Message = {
            id: 'init-' + defaultId,
            role: 'model',
            text: "**DCS MISSION ARCHITECT ONLINE**\n\nSafety Protocols: **ACTIVE**\nReady to assist with MOOSE scripting and DML attribute configuration.\n\nPlease define your mission objective.",
            timestamp: new Date(),
            isStreaming: false
        };
        storage.saveSessionMessages(defaultId, [welcomeMsg]);

        loadedSessions = [defaultSession];
    }
    
    setSessions(loadedSessions);
    setActiveSessionId(loadedSessions[0].id);
    setIsReady(true);
  }, []);

  // Persist Index whenever sessions change
  useEffect(() => {
    if (isReady) {
      storage.saveSessionIndex(sessions);
    }
  }, [sessions, isReady]);

  const createSession = useCallback((nameOverride?: string): string => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    const name = nameOverride || `Mission ${sessions.length + 1}`;
    
    const newSession: Session = {
      id,
      name,
      createdAt: new Date(),
      lastModified: new Date()
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(id);

    // Initialize with a welcome message
    const welcomeMsg: Message = {
      id: 'init-' + id,
      role: 'model',
      text: "**DCS MISSION ARCHITECT ONLINE**\n\nSafety Protocols: **ACTIVE**\nReady to assist with MOOSE scripting and DML attribute configuration.\n\nPlease define your mission objective.",
      timestamp: new Date(),
      isStreaming: false
    };
    storage.saveSessionMessages(id, [welcomeMsg]);
    
    return id;
  }, [sessions]);

  const deleteSession = useCallback((id: string) => {
    // 1. Remove from index
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    
    // 2. Remove data from storage
    storage.deleteSessionData(id);

    // 3. Handle active ID switch
    if (activeSessionId === id) {
      if (newSessions.length > 0) {
        setActiveSessionId(newSessions[0].id);
      } else {
        // If we delete the last session, create a new one to prevent Ghost Chat
        const newId = createSession();
        // createSession handles setActiveSessionId internally
      }
    }
  }, [sessions, activeSessionId, createSession]);

  const renameSession = useCallback((id: string, newName: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  }, []);

  const touchSession = useCallback((id: string) => {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, lastModified: new Date() } : s));
  }, []);

  // Handler for importing sessions (merging logic)
  const mergeSessions = useCallback((newSessions: Session[]) => {
      setSessions(prev => {
          const incomingIds = new Set(newSessions.map(s => s.id));
          const existing = prev.filter(s => !incomingIds.has(s.id));
          return [...newSessions, ...existing].sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
      });
      
      if (newSessions.length > 0) {
          setActiveSessionId(newSessions[0].id);
      }
  }, []);

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    renameSession,
    touchSession,
    mergeSessions,
    isReady
  };
};
