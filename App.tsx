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


import React, { useState, useRef, useEffect } from 'react';
import { useSettings, SettingsProvider } from './contexts/SettingsContext';
import { useAuth } from './hooks/useAuth';
import { useSessionManager } from './hooks/useSessionManager';
import { useSessionData } from './hooks/useSessionData';
import { useChatEngine } from './hooks/useChatEngine';
import { useScrollManager } from './hooks/useScrollManager';
import { useNetworkStatus } from './hooks/useNetworkStatus'; // New Import
import { validateImportData } from './services/migrationService'; 
import { APP_NAME } from './version';
import { MODELS, STORAGE_KEYS } from './constants';

import ChatMessage from './components/ChatMessage';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import LoginScreen from './components/LoginScreen'; 
import FieldManual from './components/FieldManual'; 
import OnboardingModal from './components/OnboardingModal';
import Toast from './components/Toast';
import Dashboard from './components/Dashboard';
import { MenuIcon, SendIcon, TrashIcon, XIcon, RefreshIcon, AlertIcon } from './components/Icons';

// --- MAIN LAYOUT COMPONENT ---
const AppContent: React.FC = () => {
  // Global State
  const { settings, apiStatus, updateSettings, setApiStatus } = useSettings();
  const { apiKey, hasApiKey, isVerifying, authError, login, logout } = useAuth();
  
  // Network State
  const { isOnline } = useNetworkStatus();

  // Session State
  const { 
    sessions, activeSessionId, isReady,
    setActiveSessionId, createSession, deleteSession, renameSession, touchSession, mergeSessions 
  } = useSessionManager();

  // Active Session Data (Lazy Loaded)
  const { messages, setMessages, clearMessages, isLoadingData } = useSessionData(activeSessionId);

  // Chat Engine
  const { sendMessage, stopGeneration, isLoading: isGenerating, apiStatus: chatApiStatus } = useChatEngine({
    apiKey,
    model: settings.model,
    isDesanitized: settings.isDesanitized,
    messages,
    setMessages,
    sessionId: activeSessionId,
    isHistoryLoading: isLoadingData, 
    onActivity: () => activeSessionId && touchSession(activeSessionId)
  });

  // UI State
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFieldManualOpen, setIsFieldManualOpen] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); 

  // Touch Gesture Refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Scroll Manager
  const { messagesEndRef, scrollContainerRef, handleScroll } = useScrollManager(messages, isGenerating);

  // --- HANDLERS ---
  
  // Sync offline status to global context
  useEffect(() => {
    if (!isOnline) {
        setApiStatus('offline');
    } else if (chatApiStatus !== 'idle') {
        setApiStatus(chatApiStatus);
    } else {
        setApiStatus('idle');
    }
  }, [isOnline, chatApiStatus, setApiStatus]);


  // Check Onboarding Status on Load
  useEffect(() => {
    if (hasApiKey) {
        const hasOnboarded = localStorage.getItem(STORAGE_KEYS.ONBOARDED);
        if (!hasOnboarded) {
            setIsOnboarding(true);
        }
    }
  }, [hasApiKey]);

  // Global Keyboard Shortcuts
  useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
          if (e.key === '?' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
              e.preventDefault();
              setIsFieldManualOpen(prev => !prev);
              return;
          }
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
              e.preventDefault();
              setIsSidebarOpen(prev => !prev);
              return;
          }
          if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
              e.preventDefault();
              textareaRef.current?.focus();
              return;
          }
          if (e.altKey && e.key.toLowerCase() === 'n') {
              e.preventDefault();
              createSession();
              return;
          }
          if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
              e.preventDefault();
              const currentIndex = sessions.findIndex(s => s.id === activeSessionId);
              if (currentIndex === -1) return;

              let nextIndex = e.key === 'ArrowLeft' ? currentIndex - 1 : currentIndex + 1;
              if (nextIndex < 0) nextIndex = sessions.length - 1;
              if (nextIndex >= sessions.length) nextIndex = 0;

              setActiveSessionId(sessions[nextIndex].id);
              return;
          }
          if (e.key === 'Escape') {
              if (isFieldManualOpen) {
                  setIsFieldManualOpen(false);
                  return;
              }
              if (isGenerating) {
                  stopGeneration();
                  return;
              }
              if (isSidebarOpen) {
                  setIsSidebarOpen(false);
                  return;
              }
          }
      };

      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isGenerating, isFieldManualOpen, isSidebarOpen, sessions, activeSessionId, createSession, stopGeneration, setActiveSessionId]);


  const completeOnboarding = () => {
      localStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
      setIsOnboarding(false);
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && isSidebarOpen) {
        setIsSidebarOpen(false);
    }
    
    if (isRightSwipe && !isSidebarOpen && touchStartX.current < 50) {
        setIsSidebarOpen(true);
    }
  };

  const handleSendMessage = (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    if (!isOnline) return;

    const text = textOverride || inputValue;
    if (!text.trim() || isGenerating) return;

    sendMessage(text);
    setInputValue('');
    setIsConfirmingClear(false);
    
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          handleSendMessage();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
          e.preventDefault();
          handleClearSession();
      }
  };

  const handleClearSession = () => {
    if (!isConfirmingClear) {
        setIsConfirmingClear(true);
        setTimeout(() => setIsConfirmingClear(false), 3000);
        return;
    }
    clearMessages();
    setIsConfirmingClear(false);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        const rawData = JSON.parse(text);
        const { validSessions, validMessages } = validateImportData(rawData);
        
        if (validSessions.length > 0) {
            mergeSessions(validSessions);
            Object.keys(validMessages).forEach(id => {
                 localStorage.setItem(`${STORAGE_KEYS.SESSION_PREFIX}${id}`, JSON.stringify(validMessages[id]));
            });
            setToast({ message: `Successfully imported ${validSessions.length} sessions.`, type: 'success' });
        } else {
            setToast({ message: "No valid mission data found in file.", type: 'error' });
        }
    } catch (err) {
        console.error("Import Error:", err);
        setToast({ message: "Import failed. Invalid file format.", type: 'error' });
    }
    e.target.value = ''; 
  };

  const handleExportData = () => {
      const exportData: any = {
          version: '2.4b',
          exportDate: new Date().toISOString(),
          settings,
          sessions,
          messages: {}
      };
      sessions.forEach(s => {
          const raw = localStorage.getItem(`${STORAGE_KEYS.SESSION_PREFIX}${s.id}`);
          if (raw) exportData.messages[s.id] = JSON.parse(raw);
      });
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dcs_architect_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  // --- RENDER: LOGIN SCREEN ---
  if (!hasApiKey) {
      return (
        <>
            <LoginScreen 
                onLogin={login}
                isVerifying={isVerifying}
                authError={authError}
                onOpenFieldManual={() => setIsFieldManualOpen(true)}
            />
            <FieldManual isOpen={isFieldManualOpen} onClose={() => setIsFieldManualOpen(false)} />
        </>
      );
  }

  const getStatusColor = () => {
      if (!isOnline) return 'bg-slate-500'; // Gray for offline
      switch (chatApiStatus) {
          case 'idle': return 'bg-emerald-500';
          case 'connecting': return 'bg-blue-500 animate-pulse';
          case 'streaming': return 'bg-emerald-400 animate-pulse';
          case 'error': return 'bg-red-500';
          default: return 'bg-slate-500';
      }
  };

  const getStatusText = () => {
      if (!isOnline) return 'OFFLINE';
      return chatApiStatus === 'idle' ? 'Ready' : chatApiStatus;
  }

  return (
    <div 
        className="flex h-full w-full bg-slate-900 text-slate-200 overflow-hidden font-sans selection:bg-emerald-500/30 select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
        <input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden" accept=".json" />
        
        <Sidebar 
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => { setActiveSessionId(id); setIsSidebarOpen(false); }}
            onCreateSession={createSession}
            onDeleteSession={deleteSession}
            onRenameSession={renameSession}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onDisconnect={logout}
            onExportData={handleExportData}
            onImportData={() => fileInputRef.current?.click()}
            onOpenFieldManual={() => setIsFieldManualOpen(true)}
            isLoading={isGenerating}
        />

        <FieldManual isOpen={isFieldManualOpen} onClose={() => setIsFieldManualOpen(false)} />
        <OnboardingModal isOpen={isOnboarding} onComplete={completeOnboarding} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-900 relative">
            {/* HEADER */}
            <header className="flex-none bg-slate-950 border-b border-slate-800 shadow-md z-10 pt-[env(safe-area-inset-top)]">
                <div className="h-16 flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"
                            aria-label="Open Mission Sidebar"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                        <div className="flex-col hidden sm:flex">
                            <h1 className="font-bold text-sm tracking-wide text-slate-100 truncate max-w-[150px] lg:max-w-xs">
                                {sessions.find(s => s.id === activeSessionId)?.name || APP_NAME}
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">
                                    {getStatusText()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Model Switcher */}
                        <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5" role="group" aria-label="Model Selection">
                            <button 
                                onClick={() => updateSettings({ model: MODELS.FLASH.id })}
                                className={`px-3 py-2 md:py-1 text-[10px] font-bold rounded-md transition-all ${settings.model === MODELS.FLASH.id ? 'bg-slate-800 text-emerald-400 shadow-sm ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                                aria-pressed={settings.model === MODELS.FLASH.id}
                            >
                                FLASH
                            </button>
                            <button 
                                onClick={() => updateSettings({ model: MODELS.PRO.id })}
                                className={`px-3 py-2 md:py-1 text-[10px] font-bold rounded-md transition-all ${settings.model === MODELS.PRO.id ? 'bg-slate-800 text-blue-400 shadow-sm ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                                aria-pressed={settings.model === MODELS.PRO.id}
                            >
                                PRO
                            </button>
                        </div>

                        <div className="h-6 w-px bg-slate-800 mx-1 hidden md:block"></div>

                        {/* Unsafe Toggle */}
                        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                            <button 
                                onClick={() => updateSettings({ isDesanitized: !settings.isDesanitized })}
                                className={`flex items-center gap-2 px-2 py-0.5 rounded transition-all ${settings.isDesanitized ? 'text-red-400' : 'text-emerald-500 opacity-60'}`}
                                title={settings.isDesanitized ? "UNSAFE MODE" : "SANITIZED MODE"}
                                aria-label={settings.isDesanitized ? "Disable Unsafe Mode" : "Enable Unsafe Mode"}
                                aria-pressed={settings.isDesanitized}
                            >
                                <span className="text-[10px] font-mono font-bold uppercase hidden lg:block">
                                    {settings.isDesanitized ? 'UNSAFE' : 'SAFE'}
                                </span>
                                <div className={`w-6 h-3 rounded-full relative transition-colors ${settings.isDesanitized ? 'bg-red-500' : 'bg-slate-700'}`}>
                                    <div className={`absolute top-0.5 bg-white w-2 h-2 rounded-full transition-transform ${settings.isDesanitized ? 'left-3.5' : 'left-0.5'}`}></div>
                                </div>
                            </button>
                        </div>

                        <button 
                            onClick={handleClearSession} 
                            className={`p-2 rounded hover:bg-slate-900 transition-colors ${isConfirmingClear ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}
                            title="Clear History"
                            aria-label="Clear Session History"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CHAT AREA */}
            <main 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth"
            >
                <div className="max-w-4xl mx-auto">
                    {messages.length === 0 && isLoadingData ? (
                        <div className="flex justify-center items-center h-40">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : (
                        <>
                            {messages.length <= 1 && !isGenerating ? (
                                <Dashboard 
                                    settings={settings}
                                    apiStatus={isOnline ? chatApiStatus : 'offline'} 
                                    sessions={sessions}
                                    activeSessionId={activeSessionId}
                                    onSelectSession={setActiveSessionId}
                                    onCreateSession={createSession}
                                    onImportData={() => fileInputRef.current?.click()}
                                    onPrompt={(text) => handleSendMessage(undefined, text)}
                                />
                            ) : (
                                messages.map((msg) => (
                                    <ErrorBoundary key={msg.id} scope="message">
                                        <ChatMessage message={msg} />
                                    </ErrorBoundary>
                                ))
                            )}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* INPUT FOOTER */}
            <div className="flex-none bg-slate-950 border-t border-slate-800 p-4 md:p-6 z-10 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                <div className="max-w-4xl mx-auto space-y-4">
                    
                    <form 
                        onSubmit={handleSendMessage} 
                        className={`relative flex items-end gap-2 bg-slate-900 rounded-xl border border-slate-800 transition-all p-2 shadow-sm ${!isOnline ? 'opacity-50 cursor-not-allowed' : 'focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500'}`}
                    >
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={!isOnline ? "Waiting for connection..." : (settings.isDesanitized ? "Environment UNSAFE. Input mission parameters..." : "Input mission parameters...")}
                            disabled={isGenerating || !isOnline}
                            rows={1}
                            className={`w-full bg-transparent text-slate-100 placeholder-slate-600 px-2 py-3 focus:outline-none disabled:opacity-50 resize-none custom-scrollbar max-h-[200px] leading-relaxed select-text`}
                            style={{ minHeight: '48px' }}
                        />
                        
                        <div className="flex-none pb-1 pr-1">
                             {isGenerating ? (
                                <button 
                                    type="button" 
                                    onClick={stopGeneration} 
                                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20"
                                    title="Stop Generation (Esc)"
                                    aria-label="Stop Generation"
                                >
                                    <XIcon className="h-6 w-6" />
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    disabled={!inputValue.trim() || isGenerating || !isOnline} 
                                    className={`p-2 rounded-lg transition-colors shadow-sm ${
                                        (!inputValue.trim() || !isOnline)
                                            ? 'text-slate-600 bg-slate-800 cursor-not-allowed' 
                                            : settings.isDesanitized 
                                                ? 'bg-red-600 text-white hover:bg-red-500 shadow-red-900/20' 
                                                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/20'
                                    }`}
                                    aria-label="Send Message (Ctrl+Enter)"
                                >
                                    <SendIcon className="h-6 w-6 transform rotate-90" />
                                </button>
                            )}
                        </div>
                    </form>
                    <div className="text-[10px] text-center text-slate-600 font-mono">
                        {!isOnline ? (
                             <span className="text-slate-500">Offline Mode Active. Connect to network to continue.</span>
                        ) : settings.isDesanitized ? (
                            <span className="text-red-900/50 flex items-center justify-center gap-1">
                                <AlertIcon className="w-3 h-3" />
                                UNSAFE MODE ACTIVE
                            </span> 
                        ) : (
                            <span>AI can make mistakes. Ctrl+Enter to Send.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;
