import React, { useState, useEffect } from "react";
import { SettingsProvider, useSettings } from "./SettingsContext";
import { useAuth } from "../features/auth/useAuth";
import { useSessionManager } from "../features/mission/useSessionManager";
import { useSessionData } from "../features/mission/useSessionData";
import { useChatEngine } from "../features/chat/useChatEngine";
import { useScrollManager } from "../features/chat/useScrollManager";
import { validateImportData } from "../shared/services/migrationService";

// Components
import Sidebar from "../features/mission/Sidebar";
import Dashboard from "../features/mission/Dashboard";
import ChatMessage from "../features/chat/ChatMessage";
import LoginScreen from "../features/auth/LoginScreen";
import ErrorBoundary from "../shared/ui/ErrorBoundary";
import OnboardingModal from "../shared/ui/OnboardingModal";
import FieldManual from "../shared/ui/FieldManual";
import Toast from "../shared/ui/Toast";
import { MenuIcon, SendIcon, TrashIcon } from "../shared/ui/Icons";
import { STORAGE_KEYS } from "./constants";

const MainLayout: React.FC = () => {
  const { apiKey, hasApiKey, isVerifying, authError, login, logout } =
    useAuth();
  const { settings, apiStatus, updateSettings } = useSettings();

  // Modals & UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFieldManualOpen, setIsFieldManualOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Session Management
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    renameSession,
    touchSession,
    mergeSessions,
  } = useSessionManager();

  // Active Session Data (Lazy Loaded)
  const { messages, setMessages, clearMessages, isLoadingData } =
    useSessionData(activeSessionId);

  // Chat Engine
  const {
    sendMessage,
    stopGeneration,
    isLoading: isGenerating,
  } = useChatEngine({
    apiKey,
    model: settings.model,
    isDesanitized: settings.isDesanitized,
    messages,
    setMessages,
    sessionId: activeSessionId,
    isHistoryLoading: isLoadingData,
    onActivity: () => activeSessionId && touchSession(activeSessionId),
  });

  const { messagesEndRef, scrollContainerRef, handleScroll, scrollToBottom } =
    useScrollManager(messages, isGenerating);
  const [input, setInput] = useState("");

  // --- THEME APPLICATOR (The Professional Fix) ---
  useEffect(() => {
    // Apply theme classes directly to the body.
    // This ensures scrollbars and portals inherit variables correctly.
    document.body.className = `mode-${settings.themeMode} accent-${settings.themeAccent}`;
  }, [settings.themeMode, settings.themeAccent]);

  // Check Onboarding
  useEffect(() => {
    if (hasApiKey) {
      const onboarded = localStorage.getItem(STORAGE_KEYS.ONBOARDED);
      if (!onboarded) setIsOnboardingOpen(true);
    }
  }, [hasApiKey]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, "true");
    setIsOnboardingOpen(false);
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setToast({ message, type });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    scrollToBottom();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSend();
    }
  };

  const handleExport = () => {
    try {
      const exportData = {
        version: "2.4.6",
        timestamp: Date.now(),
        settings,
        sessions: sessions,
        messages: {} as Record<string, unknown>,
      };

      sessions.forEach((s) => {
        const msgs = localStorage.getItem(
          `${STORAGE_KEYS.SESSION_PREFIX}${s.id}`,
        );
        if (msgs) {
          exportData.messages[s.id] = JSON.parse(msgs);
        }
      });

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mission_architect_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Database exported successfully", "success");
    } catch (e) {
      showToast("Export failed", "error");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const raw = JSON.parse(text);
        const { validSessions, validMessages, validSettings } =
          validateImportData(raw);

        if (validSessions.length === 0) {
          throw new Error("No valid sessions found");
        }

        Object.keys(validMessages).forEach((sid) => {
          localStorage.setItem(
            `${STORAGE_KEYS.SESSION_PREFIX}${sid}`,
            JSON.stringify(validMessages[sid]),
          );
        });

        mergeSessions(validSessions);
        if (validSettings) updateSettings(validSettings);

        showToast(`Imported ${validSessions.length} missions`, "success");
      } catch (err) {
        showToast("Invalid Backup File", "error");
        console.error(err);
      }
    };
    input.click();
  };

  if (!hasApiKey) {
    return (
      <LoginScreen
        onLogin={login}
        isVerifying={isVerifying}
        authError={authError}
        onOpenFieldManual={() => setIsFieldManualOpen(true)}
      />
    );
  }

  return (
    // Removed theme classes from here, as they are now on document.body
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-app-canvas text-app-primary font-sans">
      {/* SIDEBAR */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onCreateSession={createSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onDisconnect={logout}
        onExportData={handleExport}
        onImportData={handleImport}
        onOpenFieldManual={() => setIsFieldManualOpen(true)}
        isLoading={isGenerating}
      />

      {/* MAIN AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* HEADER */}
        <header className="h-14 border-b border-app-border bg-app-frame/90 backdrop-blur flex items-center justify-between px-4 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-app-secondary hover:text-app-primary"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <h2 className="font-bold text-sm truncate max-w-[150px] md:max-w-xs">
                {sessions.find((s) => s.id === activeSessionId)?.name ||
                  "Mission Architect"}
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
                <span
                  className={
                    apiStatus === "error" || apiStatus === "offline"
                      ? "text-red-500"
                      : "text-emerald-500"
                  }
                >
                  {apiStatus === "idle" ? "READY" : apiStatus.toUpperCase()}
                </span>
                {isGenerating && (
                  <span className="text-app-tertiary">| PROCESSING</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Unsafe Toggle */}
            <button
              onClick={() =>
                updateSettings({ isDesanitized: !settings.isDesanitized })
              }
              className={`
                            px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-all
                            ${
                              settings.isDesanitized
                                ? "bg-red-900/20 border-red-500 text-red-500 animate-pulse"
                                : "bg-app-surface border-app-border text-app-tertiary hover:border-app-highlight"
                            }
                        `}
              title="Toggle Sanitized Environment Mode"
            >
              {settings.isDesanitized ? "UNSAFE" : "SAFE MODE"}
            </button>

            {/* Clear Chat */}
            <button
              onClick={clearMessages}
              className="p-2 text-app-secondary hover:text-red-400 transition-colors"
              title="Clear History"
              disabled={isGenerating}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* CHAT AREA */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth"
        >
          <div className="max-w-4xl mx-auto min-h-full flex flex-col">
            {messages.length === 0 ||
            (messages.length === 1 &&
              messages[0].role === "model" &&
              !isLoadingData) ? (
              <Dashboard
                settings={settings}
                apiStatus={apiStatus}
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={setActiveSessionId}
                onCreateSession={createSession}
                onImportData={handleImport}
                onPrompt={(text) => {
                  sendMessage(text);
                }}
              />
            ) : (
              <>
                {messages.map((msg) => (
                  <ErrorBoundary key={msg.id} scope="message">
                    <ChatMessage message={msg} />
                  </ErrorBoundary>
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </>
            )}
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="p-4 bg-app-frame border-t border-app-border shrink-0 z-20">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Instruct the Architect... (Ctrl+Enter to send)"
              disabled={isGenerating}
              className="w-full bg-app-surface border border-app-border rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:border-app-brand focus:ring-1 focus:ring-app-brand transition-all resize-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              style={{ minHeight: "52px", maxHeight: "150px" }}
            />

            <div className="absolute right-2 bottom-2">
              {isGenerating ? (
                <button
                  onClick={stopGeneration}
                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                  title="Stop Generation"
                >
                  <div className="w-4 h-4 rounded-sm bg-current" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 bg-app-brand text-white rounded-lg hover:bg-opacity-90 disabled:bg-app-border disabled:text-app-tertiary transition-all shadow-lg shadow-app-brand/20 disabled:shadow-none"
                >
                  <SendIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="max-w-4xl mx-auto mt-2 flex justify-between text-[10px] text-app-tertiary font-mono">
            <span>Model: {settings.model}</span>
            <span>v{import.meta.env.VITE_APP_VERSION || "2.4.6"}</span>
          </div>
        </div>

        {/* MODALS & OVERLAYS */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onComplete={handleOnboardingComplete}
        />
        <FieldManual
          isOpen={isFieldManualOpen}
          onClose={() => setIsFieldManualOpen(false)}
        />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary scope="app">
      <SettingsProvider>
        <MainLayout />
      </SettingsProvider>
    </ErrorBoundary>
  );
};

export default App;
