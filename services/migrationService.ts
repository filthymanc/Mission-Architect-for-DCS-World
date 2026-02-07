/*
 * DCS Mission Architect
 * Copyright (C) 2026 the filthymanc
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Session, Message } from '../types';

const STORAGE_KEYS = {
    SESSIONS: 'dcs-architect-sessions-v1',
    MESSAGES: 'dcs-architect-messages-v1'
};

export interface AppData {
    sessions: Session[];
    messages: Record<string, Message[]>;
}

// Helper to safely parse dates
const safeDate = (val: any): Date => {
    if (val instanceof Date) return val;
    if (typeof val === 'string' || typeof val === 'number') {
        const d = new Date(val);
        // Check if date is valid
        return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
};

// Validate and patch a single session object
const validateSession = (s: any): Session | null => {
    if (!s || typeof s !== 'object') return null;
    return {
        id: s.id || Date.now().toString(),
        name: s.name || 'Untitled Mission',
        createdAt: safeDate(s.createdAt),
        lastModified: safeDate(s.lastModified)
    };
};

// Validate and patch a single message object
const validateMessage = (m: any): Message | null => {
    if (!m || typeof m !== 'object') return null;
    return {
        ...m, // Keep other properties like modelUsed, tokenUsage, etc.
        id: m.id || Date.now().toString(),
        role: (m.role === 'user' || m.role === 'model') ? m.role : 'model',
        text: typeof m.text === 'string' ? m.text : '',
        timestamp: safeDate(m.timestamp),
        // CRITICAL: Always reset streaming state on load. 
        // If the app was closed while streaming, this prevents it from getting stuck in "thinking" state.
        isStreaming: false 
    };
};

export const validateImportData = (data: any): { validSessions: Session[], validMessages: Record<string, Message[]>, validSettings?: any } => {
    const validSessions: Session[] = [];
    const validMessages: Record<string, Message[]> = {};
    let validSettings = undefined;

    if (!data || typeof data !== 'object') {
        throw new Error("Invalid JSON structure");
    }

    // Sessions
    if (Array.isArray(data.sessions)) {
        data.sessions.forEach((s: any) => {
            const valid = validateSession(s);
            if (valid) validSessions.push(valid);
        });
    }

    // Messages
    if (data.messages && typeof data.messages === 'object') {
        Object.keys(data.messages).forEach(key => {
            if (Array.isArray(data.messages[key])) {
                const msgs = data.messages[key].map(validateMessage).filter((m: any): m is Message => m !== null);
                if (msgs.length > 0) validMessages[key] = msgs;
            }
        });
    }
    
    // Settings (Simple check)
    if (data.settings && typeof data.settings === 'object') {
        validSettings = data.settings;
    }

    return { validSessions, validMessages, validSettings };
};

export const loadAndMigrateData = (): AppData => {
    let sessions: Session[] = [];
    let messages: Record<string, Message[]> = {};

    try {
        // 1. Load Sessions
        const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        if (rawSessions) {
            const parsed = JSON.parse(rawSessions);
            if (Array.isArray(parsed)) {
                sessions = parsed
                    .map(validateSession)
                    .filter((s): s is Session => s !== null)
                    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
            }
        }

        // 2. Load Messages
        const rawMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        if (rawMessages) {
            const parsed = JSON.parse(rawMessages);
            if (typeof parsed === 'object' && parsed !== null) {
                // Iterate over keys to validate each message array
                Object.keys(parsed).forEach(sessionId => {
                    if (Array.isArray(parsed[sessionId])) {
                        const validMsgs = parsed[sessionId]
                            .map(validateMessage)
                            .filter((m: any): m is Message => m !== null);
                        
                        // Only add if there are messages
                        if (validMsgs.length > 0) {
                            messages[sessionId] = validMsgs;
                        }
                    }
                });
            }
        }
        
    } catch (error) {
        console.error("Migration Error: Failed to load or parse data", error);
        // Return defaults so the app can start fresh instead of crashing
    }

    return { sessions, messages };
};

export const saveData = (sessions: Session[], messages: Record<string, Message[]>) => {
    try {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (e) {
        console.error("Save Error: Failed to persist data", e);
    }
};