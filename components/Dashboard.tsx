import React from 'react';
import { AppSettings, ApiStatus, Session } from '../types';
import { SUGGESTED_QUERIES } from '../constants';

interface DashboardProps {
  settings: AppSettings;
  apiStatus: ApiStatus;
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onImportData: () => void;
  onPrompt: (text: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  settings,
  apiStatus,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onImportData,
  onPrompt
}) => {
  // Filter recent sessions (exclude current, sort by date)
  const recentSessions = sessions
    .filter(s => s.id !== activeSessionId)
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 3);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8 animate-fadeIn select-none">
      {/* 1. SYSTEM STATUS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label="System Status">
        {/* API Status */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className={`p-3 rounded-lg ${apiStatus === 'error' ? 'bg-red-900/20 text-red-500' : 'bg-emerald-900/20 text-emerald-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connection</h3>
            <p className={`font-mono font-bold text-sm ${apiStatus === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
              {apiStatus === 'idle' ? 'ONLINE' : apiStatus.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Environment Status */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className={`p-3 rounded-lg ${settings.isDesanitized ? 'bg-red-900/20 text-red-500' : 'bg-blue-900/20 text-blue-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Environment</h3>
            <p className={`font-mono font-bold text-sm ${settings.isDesanitized ? 'text-red-400' : 'text-blue-400'}`}>
              {settings.isDesanitized ? 'UNSAFE (RW)' : 'SANITIZED'}
            </p>
          </div>
        </div>

        {/* Model Status */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-purple-900/20 text-purple-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Neural Engine</h3>
            <p className="font-mono font-bold text-sm text-purple-400">
              {settings.model.includes('flash') ? 'GEMINI FLASH' : 'GEMINI PRO'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. QUICK ACTIONS */}
        <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                    onClick={onCreateSession}
                    className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 rounded-xl transition-all text-left group"
                    aria-label="Create New Mission"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="font-bold text-slate-200 group-hover:text-white">New Mission</span>
                    </div>
                    <p className="text-xs text-slate-500">Initialize a blank workspace with standard safety protocols.</p>
                </button>

                <button 
                    onClick={onImportData}
                    className="p-4 bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800 rounded-xl transition-all text-left group"
                    aria-label="Import Backup File"
                >
                    <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </div>
                        <span className="font-bold text-slate-200 group-hover:text-white">Import Backup</span>
                    </div>
                    <p className="text-xs text-slate-500">Restore a previous mission database from a JSON file.</p>
                </button>
            </div>

            {/* Suggested Queries Grid */}
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1 mt-6">Suggested Parameters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="list">
                {SUGGESTED_QUERIES.map((query, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => onPrompt(query)}
                        className="p-3 text-left text-xs bg-slate-900/50 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-all flex items-center justify-between group"
                        role="listitem"
                    >
                        <span className="truncate pr-2">{query}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform -rotate-90" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                ))}
            </div>
        </div>

        {/* 3. RECENT FILES */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col h-full">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Activity
             </h2>
             
             {recentSessions.length > 0 ? (
                 <div className="space-y-2">
                    {recentSessions.map(session => (
                        <button
                            key={session.id}
                            onClick={() => onSelectSession(session.id)}
                            className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 group"
                        >
                            <div className="font-semibold text-sm text-slate-300 group-hover:text-white truncate">
                                {session.name}
                            </div>
                            <div className="text-[10px] text-slate-600 font-mono mt-1">
                                Modified: {formatDate(session.lastModified)}
                            </div>
                        </button>
                    ))}
                 </div>
             ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-60">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                     </svg>
                     <p className="text-xs">No recent files</p>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;