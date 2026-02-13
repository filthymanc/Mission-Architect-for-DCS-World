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

import { useState, useEffect, useCallback } from "react";
import { Session, Message } from "../../core/types";
import * as storage from "../../shared/services/storageService";
import { WELCOME_MESSAGE_TEXT } from "../../core/constants";

export const useSessionManager = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Load Session Index on Mount
  useEffect(() => {
    const init = async () => {
      // Initialize IDB / Cleanup Legacy
      await storage.initializeStorage();

      let loadedSessions = await storage.loadSessionIndex();

      // Auto-Create Default Session if empty
      if (loadedSessions.length === 0) {
        const defaultId = Date.now().toString();
        const defaultSession: Session = {
          id: defaultId,
          name: "Mission 1",
          createdAt: new Date(),
          lastModified: new Date(),
        };

        // Save initial session immediately to disk
        // We await here to ensure DB is primed before UI renders ready
        await storage.saveSessionIndex([defaultSession]);

        // Save initial welcome message to disk
        const welcomeMsg: Message = {
          id: "init-" + defaultId,
          role: "model",
          text: WELCOME_MESSAGE_TEXT,
          timestamp: new Date(),
          isStreaming: false,
        };
        await storage.saveSessionMessages(defaultId, [welcomeMsg]);

        loadedSessions = [defaultSession];
      }

      setSessions(loadedSessions);
      setActiveSessionId(loadedSessions[0].id);
      setIsReady(true);
    };

    init();
  }, []);

  // Persist Index whenever sessions change
  useEffect(() => {
    if (isReady) {
      storage.saveSessionIndex(sessions).catch((e) => {
        console.error("Failed to sync sessions index", e);
      });
    }
  }, [sessions, isReady]);

  const createSession = useCallback(
    (nameOverride?: string): string => {
      const id = Date.now().toString() + Math.random().toString().slice(2, 6);

      let name = nameOverride;
      if (!name) {
        // Strategy: Natural Sequence Scanning
        // Finds the highest "Mission X" number and adds 1.
        const existingNumbers = sessions.map((s) => {
          const match = s.name.match(/^Mission\s+(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        });

        const maxNum = existingNumbers.reduce(
          (max, current) => (current > max ? current : max),
          0,
        );
        name = `Mission ${maxNum + 1}`;
      }

      const newSession: Session = {
        id,
        name,
        createdAt: new Date(),
        lastModified: new Date(),
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(id);

      // Initialize with a welcome message (Async side-effect)
      const welcomeMsg: Message = {
        id: "init-" + id,
        role: "model",
        text: WELCOME_MESSAGE_TEXT,
        timestamp: new Date(),
        isStreaming: false,
      };
      storage.saveSessionMessages(id, [welcomeMsg]).catch(console.error);

      return id;
    },
    [sessions],
  );

  const deleteSession = useCallback(
    (id: string) => {
      // 1. Remove from index
      const newSessions = sessions.filter((s) => s.id !== id);
      setSessions(newSessions);

      // 2. Remove data from storage (Async side-effect)
      storage.deleteSessionData(id).catch(console.error);

      // 3. Handle active ID switch
      if (activeSessionId === id) {
        if (newSessions.length > 0) {
          setActiveSessionId(newSessions[0].id);
        } else {
          // If we delete the last session, create a new one to prevent Ghost Chat
          createSession();
          // createSession handles setActiveSessionId internally
        }
      }
    },
    [sessions, activeSessionId, createSession],
  );

  const renameSession = useCallback((id: string, newName: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s)),
    );
  }, []);

  const touchSession = useCallback((id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, lastModified: new Date() } : s)),
    );
  }, []);

  // Handler for importing sessions (merging logic)
  const mergeSessions = useCallback((newSessions: Session[]) => {
    setSessions((prev) => {
      const incomingIds = new Set(newSessions.map((s) => s.id));
      const existing = prev.filter((s) => !incomingIds.has(s.id));
      return [...newSessions, ...existing].sort(
        (a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
      );
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
    isReady,
  };
};
