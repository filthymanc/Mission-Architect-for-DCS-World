
import React, { useState, useRef, useEffect } from 'react';
import { useSettings, SettingsProvider } from './contexts/SettingsContext';
import { useAuth } from './hooks/useAuth';
import { useSessionManager } from './hooks/useSessionManager';
import { useSessionData } from './hooks/useSessionData';
import { useChatEngine } from './hooks/useChatEngine';
import { useScrollManager } from './hooks/useScrollManager';
import { validateImportData } from './services/migrationService'; // Phase 9: Robust Imports
import { APP_VERSION, APP_NAME } from './version';

import ChatMessage from './components/ChatMessage';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import PrivacyModal from './components/PrivacyModal';
import OnboardingModal from './components/OnboardingModal';
import ShortcutsModal from './components/ShortcutsModal';
import Toast from './components/Toast';
import Dashboard from './components/Dashboard';

// --- MAIN LAYOUT COMPONENT ---
const AppContent: React.FC = () => {
  // Global State
  const { settings, apiStatus, updateSettings, setApiStatus } = useSettings();
  const { apiKey, hasApiKey, isVerifying, authError, login, logout } = useAuth();
  
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
    isHistoryLoading: isLoadingData, // CRITICAL: Prevent context contamination
    onActivity: () => activeSessionId && touchSession(activeSessionId)
  });

  // UI State
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // API Key Input State
  const [tempKey, setTempKey] = useState('');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Auto-resize support

  // Touch Gesture Refs (using refs to avoid re-renders on every pixel move)
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Scroll Manager
  const { messagesEndRef, scrollContainerRef, handleScroll } = useScrollManager(messages, isGenerating);

  // --- HANDLERS ---

  // Check Onboarding Status on Load
  useEffect(() => {
    if (hasApiKey) {
        const hasOnboarded = localStorage.getItem('dcs-architect-onboarded');
        if (!hasOnboarded) {
            setIsOnboarding(true);
        }
    }
  }, [hasApiKey]);

  // Global Keyboard Shortcuts
  useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
          // 0. Toggle Shortcuts (?)
          if (e.key === '?' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
              e.preventDefault();
              setIsShortcutsOpen(prev => !prev);
              return;
          }

          // 1. Sidebar Toggle (Ctrl/Cmd + B)
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
              e.preventDefault();
              setIsSidebarOpen(prev => !prev);
              return;
          }

          // 2. Focus Input (/) - Only if not already typing
          if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
              e.preventDefault();
              textareaRef.current?.focus();
              return;
          }

          // 3. New Session (Alt + N)
          if (e.altKey && e.key.toLowerCase() === 'n') {
              e.preventDefault();
              createSession();
              return;
          }

          // 4. Cycle Sessions (Alt + ArrowLeft/Right)
          if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
              e.preventDefault();
              const currentIndex = sessions.findIndex(s => s.id === activeSessionId);
              if (currentIndex === -1) return;

              let nextIndex = e.key === 'ArrowLeft' ? currentIndex - 1 : currentIndex + 1;
              // Wrap around
              if (nextIndex < 0) nextIndex = sessions.length - 1;
              if (nextIndex >= sessions.length) nextIndex = 0;

              setActiveSessionId(sessions[nextIndex].id);
              return;
          }

          // 5. ESCAPE Sequence (Context Aware)
          if (e.key === 'Escape') {
              // Priority 1: Close Shortcuts Modal
              if (isShortcutsOpen) {
                  setIsShortcutsOpen(false);
                  return;
              }
              // Priority 2: Stop Generation
              if (isGenerating) {
                  stopGeneration();
                  return;
              }
              // Priority 3: Close Modals
              if (isPrivacyOpen) {
                  setIsPrivacyOpen(false);
                  return;
              }
              // Priority 4: Close Sidebar
              if (isSidebarOpen) {
                  setIsSidebarOpen(false);
                  return;
              }
          }
      };

      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isGenerating, isPrivacyOpen, isShortcutsOpen, isSidebarOpen, sessions, activeSessionId, createSession, stopGeneration, setActiveSessionId]);


  const completeOnboarding = () => {
      localStorage.setItem('dcs-architect-onboarded', 'true');
      setIsOnboarding(false);
  };

  // Auto-Resize Textarea Effect
  useEffect(() => {
    if (textareaRef.current) {
        // Reset height to auto to allow it to shrink if text is deleted
        textareaRef.current.style.height = 'auto';
        // Set to scrollHeight, capped at 200px
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  // Touch Handlers for Sidebar Gestures
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
    
    // Swipe Left -> Close Sidebar (if open)
    if (isLeftSwipe && isSidebarOpen) {
        setIsSidebarOpen(false);
    }
    
    // Swipe Right -> Open Sidebar (if closed AND started from left edge)
    // Edge threshold: 50px
    if (isRightSwipe && !isSidebarOpen && touchStartX.current < 50) {
        setIsSidebarOpen(true);
    }
  };

  const handleSendMessage = (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const text = textOverride || inputValue;
    if (!text.trim() || isGenerating) return;

    sendMessage(text);
    setInputValue('');
    setIsConfirmingClear(false);
    
    // Reset height after send
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Configuration: Enter = New Line, Ctrl+Enter = Send
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          handleSendMessage();
      }
      
      // Clear Session Shortcut (Ctrl + L) - Terminal Style
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
        
        // Phase 9: Robust Validation via Migration Service
        const { validSessions, validMessages } = validateImportData(rawData);
        
        if (validSessions.length > 0) {
            mergeSessions(validSessions);

            // Persist messages (Bulk Write)
            Object.keys(validMessages).forEach(id => {
                 localStorage.setItem(`dcs-mission-${id}`, JSON.stringify(validMessages[id]));
            });

            setToast({ message: `Successfully imported ${validSessions.length} sessions.`, type: 'success' });
        } else {
            setToast({ message: "No valid mission data found in file.", type: 'error' });
        }
    } catch (err) {
        console.error("Import Error:", err);
        setToast({ message: "Import failed. Invalid file format.", type: 'error' });
    }
    e.target.value = ''; // Reset input
  };

  const handleExportData = () => {
      // We need to gather all data. In Lazy Load, this means reading all keys.
      const exportData: any = {
          version: APP_VERSION,
          exportDate: new Date().toISOString(),
          settings,
          sessions,
          messages: {}
      };

      sessions.forEach(s => {
          const raw = localStorage.getItem(`dcs-mission-${s.id}`);
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
        <div className="flex flex-col h-screen bg-slate-900 text-slate-200 items-center justify-center p-6 select-none relative overflow-hidden">
            
            {/* Background Decor */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

            <div className="max-w-md w-full bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
                
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{APP_NAME}</h1>
                    <p className="text-slate-500 text-sm mt-1 font-mono">Mission Building Intelligence v{APP_VERSION}</p>
                </div>

                {/* Security Assurance Badge */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 mb-6 flex items-start gap-3">
                    <div className="p-1.5 bg-emerald-500/10 rounded-md text-emerald-500 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-200 block mb-0.5">Your Key is Safe</strong>
                        Stored locally in your browser. Never sent to our servers. Direct connection to Google APIs.
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={(e) => { e.preventDefault(); login(tempKey); }} className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gemini API Key</label>
                            <a 
                                href="https://aistudio.google.com/app/apikey" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-500 hover:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                                Get a free key
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                placeholder="Paste your key here..."
                                disabled={isVerifying}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-10 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all text-sm"
                            />
                            <div className="absolute right-3 top-3 text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 14l-1 1-2.66 2.66a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a6 6 0 01.94-2.61L10 8l-1-1m4-4a3 3 0 100 6 3 3 0 000-6z" />
                                </svg>
                            </div>
                        </div>
                        
                        {authError && (
                            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/10 p-2 rounded border border-red-500/20 animate-fadeIn">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {authError}
                            </div>
                        )}
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={!tempKey.trim() || isVerifying}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 disabled:shadow-none"
                    >
                        {isVerifying ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying Credentials...
                            </>
                        ) : "Initialize System"}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                    <button 
                        onClick={() => setIsPrivacyOpen(true)}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Read Privacy Policy
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-4 text-[10px] text-slate-600 font-mono">
                Not affiliated with Eagle Dynamics or FlightControl
            </div>
        </div>
      );
  }

  // --- RENDER: MAIN APP ---
  const getStatusColor = () => {
      switch (chatApiStatus) {
          case 'idle': return 'bg-emerald-500';
          case 'connecting': return 'bg-blue-500 animate-pulse';
          case 'streaming': return 'bg-emerald-400 animate-pulse';
          case 'error': return 'bg-red-500';
          default: return 'bg-slate-500';
      }
  };

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
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)} // Pass Handler
            isLoading={isGenerating}
        />

        <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
        <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
        <OnboardingModal isOpen={isOnboarding} onComplete={completeOnboarding} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-900 relative">
            {/* HEADER (Z-10) with Mobile Safe Area Padding */}
            <header className="flex-none bg-slate-950 border-b border-slate-800 shadow-md z-10 pt-[env(safe-area-inset-top)]">
                <div className="h-16 flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"
                            aria-label="Open Mission Sidebar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex-col hidden sm:flex">
                            <h1 className="font-bold text-sm tracking-wide text-slate-100 truncate max-w-[150px] lg:max-w-xs">
                                {sessions.find(s => s.id === activeSessionId)?.name || APP_NAME}
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">
                                    {chatApiStatus === 'idle' ? 'Ready' : chatApiStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Model Switcher */}
                        <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5" role="group" aria-label="Model Selection">
                            <button 
                                onClick={() => updateSettings({ model: 'gemini-3-flash-preview' })}
                                className={`px-3 py-2 md:py-1 text-[10px] font-bold rounded-md transition-all ${settings.model === 'gemini-3-flash-preview' ? 'bg-slate-800 text-emerald-400 shadow-sm ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                                aria-pressed={settings.model === 'gemini-3-flash-preview'}
                            >
                                FLASH
                            </button>
                            <button 
                                onClick={() => updateSettings({ model: 'gemini-3-pro-preview' })}
                                className={`px-3 py-2 md:py-1 text-[10px] font-bold rounded-md transition-all ${settings.model === 'gemini-3-pro-preview' ? 'bg-slate-800 text-blue-400 shadow-sm ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                                aria-pressed={settings.model === 'gemini-3-pro-preview'}
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
                            {/* EMPTY STATE DASHBOARD: Show when only the initial message (or 0) exists */}
                            {messages.length <= 1 && !isGenerating ? (
                                <Dashboard 
                                    settings={settings}
                                    apiStatus={chatApiStatus}
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

            {/* INPUT FOOTER (Z-10) with Mobile Safe Area Padding */}
            <div className="flex-none bg-slate-950 border-t border-slate-800 p-4 md:p-6 z-10 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                <div className="max-w-4xl mx-auto space-y-4">
                    
                    <form 
                        onSubmit={handleSendMessage} 
                        className="relative flex items-end gap-2 bg-slate-900 rounded-xl border border-slate-800 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all p-2 shadow-sm"
                    >
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={settings.isDesanitized ? "Environment UNSAFE. Input mission parameters..." : "Input mission parameters..."}
                            disabled={isGenerating}
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
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    disabled={!inputValue.trim() || isGenerating} 
                                    className={`p-2 rounded-lg transition-colors shadow-sm ${
                                        !inputValue.trim() 
                                            ? 'text-slate-600 bg-slate-800 cursor-not-allowed' 
                                            : settings.isDesanitized 
                                                ? 'bg-red-600 text-white hover:bg-red-500 shadow-red-900/20' 
                                                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/20'
                                    }`}
                                    aria-label="Send Message (Ctrl+Enter)"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </form>
                    <div className="text-[10px] text-center text-slate-600 font-mono">
                        {settings.isDesanitized ? 
                            <span className="text-red-900/50 flex items-center justify-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                UNSAFE MODE ACTIVE
                            </span> 
                            : 
                            <span>AI can make mistakes. Ctrl+Enter to Send.</span>
                        }
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
