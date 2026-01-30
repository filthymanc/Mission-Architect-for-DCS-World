
import { Session, Message } from '../types';
import { STORAGE_VERSION_TAG } from '../version';

// Storage Keys
const KEYS = {
  INDEX: `dcs-architect-${STORAGE_VERSION_TAG}-index`,         // Stores Session[] (Lightweight)
  SESSION_PREFIX: 'dcs-mission-',            // Prefix for individual message history
  
  // Legacy Keys
  V1_7_INDEX: 'dcs-architect-v1.7-index',  // v1.7
  LEGACY_SESSIONS: 'dcs-architect-sessions-v1', // v1.6
  LEGACY_MESSAGES: 'dcs-architect-messages-v1'
};

/**
 * Loads the Session Index.
 * Includes AUTO-MIGRATION from v1.7 and v1.6.
 */
export const loadSessionIndex = (): Session[] => {
  try {
    const raw = localStorage.getItem(KEYS.INDEX);
    
    // CASE 1: Data exists in new format (Current Version)
    if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            lastModified: new Date(s.lastModified)
            }));
        }
    }

    // CASE 2: Check for v1.7 Data (Migration)
    const v17Raw = localStorage.getItem(KEYS.V1_7_INDEX);
    if (v17Raw) {
         console.log("[Storage] Migrating index from v1.7 to Current Version...");
         try {
             const sessions = JSON.parse(v17Raw);
             saveSessionIndex(sessions); // Save to new key
             
             // v1.7 and v1.8 share the same session prefix structure, so no message migration needed.
             return sessions.map((s: any) => ({
                ...s,
                createdAt: new Date(s.createdAt),
                lastModified: new Date(s.lastModified)
             }));
         } catch (e) {
             console.error("[Storage] v1.7 Migration Failed", e);
         }
    }

    // CASE 3: No new data, check for Legacy Data (v1.6 Migration)
    const legacySessionsRaw = localStorage.getItem(KEYS.LEGACY_SESSIONS);
    if (legacySessionsRaw) {
        console.log("[Storage] Migrating data from v1.6 to Current Version...");
        return migrateLegacyData(legacySessionsRaw);
    }

    return [];
  } catch (e) {
    console.error("Storage Error: Failed to load session index", e);
    return [];
  }
};

/**
 * Migrates v1.6 Monolithic Storage to v1.8 Lazy Storage
 */
const migrateLegacyData = (rawSessions: string): Session[] => {
    try {
        // 1. Parse Sessions
        const sessions = JSON.parse(rawSessions).map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            lastModified: new Date(s.lastModified)
        }));

        // 2. Parse Messages (The Monolith)
        const rawMessages = localStorage.getItem(KEYS.LEGACY_MESSAGES);
        if (rawMessages) {
            const allMessages = JSON.parse(rawMessages);
            
            // 3. Split and Save (Lazy Storage)
            sessions.forEach((session: Session) => {
                const sessionMsgs = allMessages[session.id];
                if (sessionMsgs && Array.isArray(sessionMsgs)) {
                    saveSessionMessages(session.id, sessionMsgs);
                }
            });
        }

        // 4. Save Index (New Format)
        saveSessionIndex(sessions);
        
        console.log(`[Storage] Migration Complete. ${sessions.length} sessions migrated.`);
        return sessions;
    } catch (e) {
        console.error("[Storage] Migration Failed", e);
        return [];
    }
}

/**
 * Saves the Session Index
 */
export const saveSessionIndex = (sessions: Session[]) => {
  try {
    localStorage.setItem(KEYS.INDEX, JSON.stringify(sessions));
  } catch (e) {
    console.error("Storage Error: Failed to save session index", e);
  }
};

/**
 * Loads messages for a specific session ID (Lazy Load)
 */
export const loadSessionMessages = (sessionId: string): Message[] => {
  try {
    const key = `${KEYS.SESSION_PREFIX}${sessionId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Hydrate Dates
    return parsed.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp),
      isStreaming: false // Always reset streaming state on load
    }));
  } catch (e) {
    console.error(`Storage Error: Failed to load messages for session ${sessionId}`, e);
    return [];
  }
};

/**
 * Saves messages for a specific session ID
 */
export const saveSessionMessages = (sessionId: string, messages: Message[]) => {
  try {
    const key = `${KEYS.SESSION_PREFIX}${sessionId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (e) {
    console.error(`Storage Error: Failed to save messages for session ${sessionId}`, e);
  }
};

/**
 * Deletes a specific session's message history
 */
export const deleteSessionData = (sessionId: string) => {
  try {
    const key = `${KEYS.SESSION_PREFIX}${sessionId}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Storage Error: Failed to delete session data ${sessionId}`, e);
  }
};

/**
 * Clears all app data (Factory Reset)
 * Updated for Phase 9 to include Librarian Tree Caches and Settings.
 */
export const clearAllData = () => {
    try {
        const keysToRemove = [
            KEYS.INDEX, KEYS.V1_7_INDEX, KEYS.LEGACY_SESSIONS, KEYS.LEGACY_MESSAGES,
            'dcs-architect-api-key',
            'dcs-architect-settings-v2',
            'dcs-architect-onboarded'
        ];
        
        keysToRemove.forEach(k => localStorage.removeItem(k));
        
        // Pattern Matching Removals for Sessions and Caches
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(KEYS.SESSION_PREFIX) || key.startsWith('dcs-architect-tree-')) {
                localStorage.removeItem(key);
            }
        });
        
        console.log("Factory Reset Complete: All local data wiped.");
    } catch (e) {
        console.error("Storage Error: Failed to clear all data", e);
    }
};
