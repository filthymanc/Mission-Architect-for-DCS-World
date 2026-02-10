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

import { Session, Message } from '../types';

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