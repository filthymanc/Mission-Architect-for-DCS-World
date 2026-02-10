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

import { useState, useRef, useEffect } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { Message, ApiStatus, TokenUsage, Source, ModelType } from '../types';
import { startNewSession, sendMessageStream } from '../services/geminiService';

interface ChatEngineProps {
  apiKey: string;
  model: ModelType;
  isDesanitized: boolean;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  sessionId: string | null;
  isHistoryLoading: boolean; 
  onActivity?: () => void;
}

export const useChatEngine = ({
  apiKey,
  model,
  isDesanitized,
  messages,
  setMessages,
  sessionId,
  isHistoryLoading,
  onActivity
}: ChatEngineProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');
  
  const chatSessionRef = useRef<Chat | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionConfigRef = useRef<{model: string, safe: boolean, sessionId: string | null} | null>(null);

  useEffect(() => {
    if (!apiKey || isHistoryLoading) {
        chatSessionRef.current = null;
        return;
    }

    const needsRefresh = !chatSessionRef.current || 
                        sessionConfigRef.current?.model !== model ||
                        sessionConfigRef.current?.safe !== isDesanitized ||
                        sessionConfigRef.current?.sessionId !== sessionId;

    if (needsRefresh) {
        const history = messages.filter(m => !m.isStreaming);
        try {
            chatSessionRef.current = startNewSession(apiKey, history, model, isDesanitized);
            sessionConfigRef.current = { model, safe: isDesanitized, sessionId };
        } catch (e) {
            setApiStatus('error');
        }
    }
  }, [apiKey, model, isDesanitized, sessionId, isHistoryLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !apiKey) return;

    // PRE-FLIGHT CHECK: Network
    if (!navigator.onLine) {
        const offlineMsg: Message = { 
            id: Date.now().toString(), 
            role: 'model', 
            text: "**OFFLINE MODE:**\n\nI cannot contact the neural engine because your device is offline. Please check your internet connection.", 
            timestamp: new Date(),
            isStreaming: false
        };
        // Add user message then offline system message
        const userMsg: Message = { id: (Date.now()-1).toString(), role: 'user', text, timestamp: new Date() };
        setMessages([...messages, userMsg, offlineMsg]);
        return;
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    const modelMessageId = (Date.now() + 1).toString();
    const modelMessage: Message = {
      id: modelMessageId,
      role: 'model',
      text: '',
      timestamp: new Date(),
      isStreaming: true,
      modelUsed: model
    };

    const newHistory = [...messages, userMessage, modelMessage];
    setMessages(newHistory);
    if (onActivity) onActivity();

    setIsLoading(true);
    setApiStatus('connecting');
    abortControllerRef.current = new AbortController();

    let fullText = '';
    let startTime = Date.now();
    let currentLibrarianStatus = '';

    try {
        if (!chatSessionRef.current) {
             chatSessionRef.current = startNewSession(apiKey, messages.filter(m => !m.isStreaming), model, isDesanitized);
        }

        const stream = await sendMessageStream(chatSessionRef.current, text);
        setApiStatus('streaming');

        for await (const chunk of stream) {
            if (abortControllerRef.current?.signal.aborted) break;
            
            const contentResponse = chunk as GenerateContentResponse;
            
            // CRITICAL FIX: Manually extract text to avoid SDK warning about "non-text parts functionCall"
            const parts = contentResponse.candidates?.[0]?.content?.parts || [];
            const textContent = parts
                .filter(p => p.text)
                .map(p => p.text)
                .join('');
                
            fullText += textContent;

            // Extract Librarian Call Progress
            const call = parts.find(p => p.functionCall);
            if (call?.functionCall) {
                const module = call.functionCall.args['module_name'] || 'Documentation';
                currentLibrarianStatus = `Librarian: Fetching ${module}...`;
            } else if (textContent && textContent.length > 5) {
                currentLibrarianStatus = ''; 
            }

            const verifiedModel = contentResponse.modelVersion;
            let tokenUsage: TokenUsage | undefined;
            if (contentResponse.usageMetadata) {
                tokenUsage = {
                    promptTokens: contentResponse.usageMetadata.promptTokenCount || 0,
                    responseTokens: contentResponse.usageMetadata.candidatesTokenCount || 0,
                    totalTokens: contentResponse.usageMetadata.totalTokenCount || 0
                };
            }

            const sourcesMap = new Map<string, string>();
            contentResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((c: any) => {
                if (c.web) sourcesMap.set(c.web.uri, c.web.title);
            });
            const sources: Source[] = Array.from(sourcesMap.entries()).map(([uri, title]) => ({ uri, title }));

            setMessages(newHistory.map(msg => 
                msg.id === modelMessageId ? {
                    ...msg,
                    text: fullText,
                    sources: sources.length > 0 ? sources : undefined,
                    verifiedModel,
                    tokenUsage,
                    librarianStatus: currentLibrarianStatus || undefined, 
                    timingMs: Date.now() - startTime
                } : msg
            ));
        }

        setMessages(newHistory.map(msg => 
            msg.id === modelMessageId ? {
                ...msg,
                text: fullText,
                isStreaming: false,
                librarianStatus: undefined, 
                timingMs: Date.now() - startTime
            } : msg
        ));
        setApiStatus('idle');

    } catch (error: any) {
        console.error(error);
        
        // SANITIZE ERROR MESSAGE
        let cleanError = "An unexpected system error occurred.";
        
        if (error.toString().includes('Failed to fetch') || error.toString().includes('NetworkError')) {
             cleanError = "**NETWORK ERROR**\n\nConnection lost during transmission. Please check your internet.";
             setApiStatus('offline');
        } else {
             cleanError = "**SYSTEM ERROR**\n\n" + (error.message || error.toString());
             setApiStatus('error');
        }

        setMessages(newHistory.map(msg => 
            msg.id === modelMessageId ? { ...msg, text: fullText || cleanError, isStreaming: false } : msg
        ));
        
    } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setMessages(messages.map(msg => msg.isStreaming ? { ...msg, isStreaming: false, text: msg.text + "\n\n**[GENERATION ABORTED]**" } : msg));
    }
  };

  return { sendMessage, stopGeneration, isLoading, apiStatus };
};