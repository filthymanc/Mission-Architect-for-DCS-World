
import React, { useState, useRef, useEffect } from 'react';
import { Session } from '../types';
import { clearAllData } from '../services/storageService';
import { APP_VERSION, APP_PHASE } from '../version';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onOpenPrivacy: () => void;
  onOpenShortcuts: () => void;
  onOpenNotices: () => void; // New Prop
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  isOpen,
  onClose,
  onDisconnect,
  onExportData,
  onImportData,
  onOpenPrivacy,
  onOpenShortcuts,
  onOpenNotices,
  isLoading
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isResetConfirming, setIsResetConfirming] = useState(false); // State for Factory Reset
  const [editName, setEditName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleStartEdit = (session: Session, e: React.MouseEvent) => {
    if (isLoading) return;
    e.stopPropagation();
    setEditingId(session.id);
    setEditName(session.name);
    setDeleteConfirmId(null);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onRenameSession(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') setEditingId(null);
  };

  const handleDeleteClick = (session: Session, e: React.MouseEvent) => {
    if (isLoading) return;
    e.stopPropagation();
    setDeleteConfirmId(session.id);
    setEditingId(null);
  };

  const handleConfirmDelete = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(session.id);
    setDeleteConfirmId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  const handleFactoryReset = () => {
      if (isResetConfirming) {
          // 2nd Click: EXECUTE
          clearAllData();
          localStorage.removeItem('dcs-architect-api-key');
          localStorage.removeItem('dcs-architect-settings-v2');
          localStorage.removeItem('dcs-architect-onboarded');
          
          // Force reload to clear memory state
          window.location.reload();
      } else {
          // 1st Click: ARM
          setIsResetConfirming(true);
          // Auto-reset state if not confirmed within 3 seconds
          setTimeout(() => setIsResetConfirming(false), 3000);
      }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      {/* Mobile Overlay (Z-30) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container (Z-40) */}
      <aside 
        className={`
          fixed lg:static top-0 left-0 z-40 h-full w-72 pt-[env(safe-area-inset-top)]
          bg-slate-950 border-r border-slate-800 flex flex-col select-none
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-200 tracking-wide text-sm">MISSIONS</h2>
            <button 
                onClick={onClose} 
                className="lg:hidden p-1 text-slate-400 hover:text-white"
                aria-label="Close Sidebar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>

        {/* New Mission Button */}
        <div className="p-4">
            <button
                onClick={() => { if(!isLoading) { onCreateSession(); onClose(); } }}
                disabled={isLoading}
                className={`
                    w-full flex items-center justify-center gap-2 
                    py-3 rounded-lg font-bold text-sm transition-all shadow-lg 
                    ${isLoading 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                    }
                `}
                aria-label="Create New Mission"
                aria-busy={isLoading}
            >
                {isLoading ? (
                    <svg className="animate-spin h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                )}
                {isLoading ? 'GENERATING...' : 'NEW MISSION'}
            </button>
        </div>

        {/* Session List */}
        <div className={`flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar transition-opacity duration-300 ${isLoading ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
            {sessions.map((session) => (
                <div
                    key={session.id}
                    onClick={() => { if(!isLoading) { onSelectSession(session.id); onClose(); } }}
                    className={`
                        group relative p-3 rounded-lg cursor-pointer transition-all border
                        ${activeSessionId === session.id 
                            ? 'bg-slate-800 border-slate-700 shadow-sm' 
                            : 'bg-transparent border-transparent hover:bg-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                        }
                    `}
                    role="button"
                    tabIndex={0}
                    aria-current={activeSessionId === session.id ? 'page' : undefined}
                >
                    {editingId === session.id ? (
                        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                            <input
                                ref={editInputRef}
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={handleSaveEdit}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-slate-950 text-white text-sm px-2 py-1 rounded border border-emerald-500 focus:outline-none select-text" 
                                aria-label="Edit Mission Name"
                            />
                        </div>
                    ) : (
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-sm truncate mb-1 ${activeSessionId === session.id ? 'text-white' : ''}`}>
                                    {session.name}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-mono">
                                    {formatDate(session.lastModified)}
                                </p>
                            </div>
                            
                            {/* Action Buttons */}
                            {deleteConfirmId === session.id ? (
                                <div className="flex items-center gap-1 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={(e) => handleConfirmDelete(session, e)}
                                        className="p-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors"
                                        title="Confirm Delete"
                                        aria-label="Confirm Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={handleCancelDelete}
                                        className="p-1 bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white rounded transition-colors"
                                        title="Cancel"
                                        aria-label="Cancel Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className={`flex items-center gap-1 ${activeSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                    <button
                                        onClick={(e) => handleStartEdit(session, e)}
                                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400"
                                        title="Rename"
                                        aria-label="Rename Mission"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(session, e)}
                                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"
                                        title="Delete"
                                        aria-label="Delete Mission"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 space-y-3">
            {/* 2x2 Grid for Actions */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={onImportData}
                    className="py-1.5 px-1 bg-slate-900 border border-slate-700 hover:bg-purple-500/10 hover:border-purple-500/50 text-slate-400 hover:text-purple-400 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                    title="Import JSON Backup"
                    aria-label="Import Backup"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    IMPORT
                </button>
                <button
                    onClick={onExportData}
                    className="py-1.5 px-1 bg-slate-900 border border-slate-700 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                    title="Export Database to JSON"
                    aria-label="Export Backup"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    EXPORT
                </button>
                <button
                    onClick={onOpenShortcuts}
                    className="py-1.5 px-1 bg-slate-900 border border-slate-700 hover:bg-blue-500/10 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                    title="Keyboard Shortcuts (?)"
                    aria-label="Keyboard Shortcuts"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm7 1a1 1 0 011 1v7a1 1 0 01-1 1h-2a1 1 0 01-1-1V7a1 1 0 011-1h2z" clipRule="evenodd" />
                    </svg>
                    KEYS
                </button>
                <button
                    onClick={onOpenPrivacy}
                    className="py-1.5 px-1 bg-slate-900 border border-slate-700 hover:bg-blue-500/10 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                    title="Data Privacy Info"
                    aria-label="Privacy Information"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    PRIVACY
                </button>
            </div>

            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDisconnect(); }}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 hover:border-yellow-500/50 hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                aria-label="Disconnect API Key"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                DISCONNECT API KEY
            </button>

            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFactoryReset(); }}
                className={`
                    w-full py-2 rounded text-[10px] uppercase tracking-wider font-bold 
                    flex items-center justify-center gap-2 transition-all duration-200
                    ${isResetConfirming 
                        ? 'bg-red-600 text-white hover:bg-red-500 animate-pulse shadow-red-900/50 shadow-lg' 
                        : 'bg-transparent text-slate-600 hover:text-red-500 opacity-70 hover:opacity-100'
                    }
                `}
                aria-label="Factory Reset"
            >
                {isResetConfirming ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        CONFIRM WIPE?
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        FACTORY RESET
                    </>
                )}
            </button>

            <div className="text-[10px] text-slate-600 text-center flex flex-col items-center gap-1">
                <p>v{APP_VERSION} {APP_PHASE}</p>
                <p className="opacity-75">Development by the filthymanc</p>
                <button 
                    onClick={onOpenNotices}
                    className="hover:text-slate-400 underline decoration-slate-700 underline-offset-2 transition-colors"
                >
                    Third-Party Licenses
                </button>
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
