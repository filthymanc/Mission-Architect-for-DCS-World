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

import React, { useState } from 'react';
import { UploadIcon, ExportIcon, BookIcon, AlertIcon, LogoutIcon, CheckIcon, RefreshIcon } from './Icons';
import { clearAllData } from '../services/storageService';
import { APP_VERSION, AUTHOR_CREDIT } from '../version';

interface SidebarFooterProps {
  onImportData: () => void;
  onExportData: () => void;
  onOpenFieldManual: () => void;
  onDisconnect: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  onImportData,
  onExportData,
  onOpenFieldManual,
  onDisconnect
}) => {
  // Local state for safety switches - removed from main Sidebar to clean up logic
  const [isResetConfirming, setIsResetConfirming] = useState(false);
  const [isDisconnectConfirming, setIsDisconnectConfirming] = useState(false);

  const handleDisconnectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDisconnectConfirming) {
      onDisconnect();
    } else {
      setIsDisconnectConfirming(true);
      setTimeout(() => setIsDisconnectConfirming(false), 3000);
    }
  };

  const handleFactoryReset = () => {
    if (isResetConfirming) {
      // 2nd Click: EXECUTE
      clearAllData();
      // Force reload to clear memory state
      window.location.reload();
    } else {
      // 1st Click: ARM
      setIsResetConfirming(true);
      // Auto-reset state if not confirmed within 3 seconds
      setTimeout(() => setIsResetConfirming(false), 3000);
    }
  };

  return (
    <div className="p-4 border-t border-slate-800 space-y-3">
      {/* 2x2 Grid for Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onImportData}
          className="py-1.5 px-1 bg-slate-900 border border-slate-700 hover:bg-purple-500/10 hover:border-purple-500/50 text-slate-400 hover:text-purple-400 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1"
          title="Import JSON Backup"
          aria-label="Import Backup"
        >
          <UploadIcon className="h-3 w-3" />
          IMPORT
        </button>
        <button
          onClick={onExportData}
          className="py-1.5 px-1 bg-slate-900 border border-slate-700 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1"
          title="Export Database to JSON"
          aria-label="Export Backup"
        >
          <ExportIcon className="h-3 w-3" />
          EXPORT
        </button>
      </div>

      <button
        onClick={onOpenFieldManual}
        className="w-full py-2 px-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white text-slate-300 rounded text-xs font-bold transition-all flex items-center justify-center gap-2"
        title="Open Field Manual"
      >
        <BookIcon className="h-4 w-4" />
        FIELD MANUAL
      </button>

      <button
        onClick={handleDisconnectClick}
        className={`
            w-full py-2 px-3 border rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2
            ${isDisconnectConfirming
            ? 'bg-orange-600 text-white border-orange-500 animate-pulse hover:bg-orange-500'
            : 'bg-slate-900 border-slate-700 hover:border-yellow-500/50 hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400'
          }
        `}
        aria-label="Disconnect API Key"
      >
        {isDisconnectConfirming ? (
          <>
            <AlertIcon className="h-3.5 w-3.5" />
            CONFIRM EXIT?
          </>
        ) : (
          <>
            <LogoutIcon className="h-3.5 w-3.5" />
            DISCONNECT API KEY
          </>
        )}
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
            <CheckIcon className="h-3 w-3" />
            CONFIRM WIPE?
          </>
        ) : (
          <>
            <RefreshIcon className="h-3 w-3" />
            FACTORY RESET
          </>
        )}
      </button>

      <div className="text-[10px] text-slate-600 text-center flex flex-col items-center gap-1">
        <p>v{APP_VERSION}</p>
        <p className="opacity-75">{AUTHOR_CREDIT}</p>
      </div>
    </div>
  );
};

export default SidebarFooter;