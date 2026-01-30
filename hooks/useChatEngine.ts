
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
            // The SDK's .text getter warns if it encounters a functionCall part.
            const parts = contentResponse.candidates?.[0]?.content?.parts || [];
            const textContent = parts
                .filter(p => p.text)
                .map(p => p.text)
                .join('');
                
            fullText += textContent;

            // Extract Librarian Call Progress
            // We look for functionCalls to update UI status
            const call = parts.find(p => p.functionCall);
            if (call?.functionCall) {
                const module = call.functionCall.args['module_name'] || 'Documentation';
                currentLibrarianStatus = `Librarian: Fetching ${module}...`;
            } else if (textContent && textContent.length > 5) {
                // If we are getting substantial text, clear the status
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

            // Sources Extraction
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
                    librarianStatus: currentLibrarianStatus || undefined, // Update status
                    timingMs: Date.now() - startTime
                } : msg
            ));
        }

        setMessages(newHistory.map(msg => 
            msg.id === modelMessageId ? {
                ...msg,
                text: fullText,
                isStreaming: false,
                librarianStatus: undefined, // Clear status on finish
                timingMs: Date.now() - startTime
            } : msg
        ));
        setApiStatus('idle');

    } catch (error: any) {
        console.error(error);
        setMessages(newHistory.map(msg => 
            msg.id === modelMessageId ? { ...msg, text: fullText || "Connection interrupted. The AI Model may be overloaded or the API key is invalid.", isStreaming: false } : msg
        ));
        setApiStatus('error');
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
