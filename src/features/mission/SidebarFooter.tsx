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

import React, { useState } from "react";
import { useSettings } from "../../core/SettingsContext";
import {
  UploadIcon,
  ExportIcon,
  BookIcon,
  AlertIcon,
  LogoutIcon,
  CheckIcon,
  RefreshIcon,
  GithubIcon,
} from "../../shared/ui/Icons";
import { clearAllData } from "../../shared/services/storageService";
import { APP_VERSION, AUTHOR_CREDIT } from "../../core/version";
import { ThemeMode, ThemeAccent } from "../../core/types";

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
  onDisconnect,
}) => {
  const { settings, updateSettings } = useSettings();
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

  const handleFactoryReset = async () => {
    if (isResetConfirming) {
      await clearAllData();
      window.location.reload();
    } else {
      setIsResetConfirming(true);
      setTimeout(() => setIsResetConfirming(false), 3000);
    }
  };

  const modes: { id: ThemeMode; label: string }[] = [
    { id: "standard", label: "Std" },
    { id: "carbon", label: "Cbn" },
    { id: "oled", label: "Oled" },
    { id: "paper", label: "Ppr" },
  ];

  const accents: { id: ThemeAccent; color: string }[] = [
    { id: "emerald", color: "#10b981" },
    { id: "cyan", color: "#06b6d4" },
    { id: "amber", color: "#f59e0b" },
    { id: "rose", color: "#f43f5e" },
    { id: "violet", color: "#8b5cf6" },
  ];

  return (
    <div className="p-4 border-t border-app-border space-y-3 bg-app-frame">
      {/* THEME SETTINGS */}
      <div className="space-y-2 pb-2 border-b border-app-border">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-app-tertiary uppercase tracking-wider">
            Interface Mode
          </span>
        </div>
        <div className="flex bg-app-canvas p-1 rounded-lg border border-app-border">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => updateSettings({ themeMode: mode.id })}
              className={`flex-1 py-1 text-[10px] font-bold rounded uppercase transition-all ${
                settings.themeMode === mode.id
                  ? "bg-app-surface text-app-primary shadow-sm"
                  : "text-app-tertiary hover:text-app-secondary"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-bold text-app-tertiary uppercase tracking-wider">
            Command Accent
          </span>
        </div>
        <div className="flex justify-between px-1">
          {accents.map((accent) => (
            <button
              key={accent.id}
              onClick={() => updateSettings({ themeAccent: accent.id })}
              className={`w-5 h-5 rounded-full transition-transform border border-transparent ${
                settings.themeAccent === accent.id
                  ? "scale-125 ring-2 ring-app-primary border-app-canvas"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: accent.color }}
              aria-label={`Set Accent ${accent.id}`}
            />
          ))}
        </div>
      </div>

      {/* 2x2 Grid for Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onImportData}
          className="py-1.5 px-1 bg-app-canvas border border-app-border hover:bg-purple-500/10 hover:border-purple-500/50 text-app-secondary hover:text-purple-400 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1"
          title="Import JSON Backup"
          aria-label="Import Backup"
        >
          <UploadIcon className="h-3 w-3" />
          IMPORT
        </button>
        <button
          onClick={onExportData}
          className="py-1.5 px-1 bg-app-canvas border border-app-border hover:bg-app-brand/10 hover:border-app-brand/50 text-app-secondary hover:text-app-brand rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1"
          title="Export Database to JSON"
          aria-label="Export Backup"
        >
          <ExportIcon className="h-3 w-3" />
          EXPORT
        </button>
      </div>

      <button
        onClick={onOpenFieldManual}
        className="w-full py-2 px-3 bg-app-surface border border-app-border hover:bg-app-canvas hover:text-app-primary text-app-secondary rounded text-xs font-bold transition-all flex items-center justify-center gap-2"
        title="Open Field Manual"
      >
        <BookIcon className="h-4 w-4" />
        FIELD MANUAL
      </button>

      <button
        onClick={handleDisconnectClick}
        className={`
            w-full py-2 px-3 border rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2
            ${
              isDisconnectConfirming
                ? "bg-orange-600 text-white border-orange-500 animate-pulse hover:bg-orange-500"
                : "bg-app-canvas border-app-border hover:border-yellow-500/50 hover:bg-yellow-500/10 text-app-secondary hover:text-yellow-400"
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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFactoryReset();
        }}
        className={`
            w-full py-2 rounded text-[10px] uppercase tracking-wider font-bold 
            flex items-center justify-center gap-2 transition-all duration-200
            ${
              isResetConfirming
                ? "bg-red-600 text-white hover:bg-red-500 animate-pulse shadow-red-900/50 shadow-lg"
                : "bg-transparent text-app-tertiary hover:text-red-500 opacity-70 hover:opacity-100"
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

      <div className="flex justify-center gap-4 pt-2 border-t border-app-border/30">
        <a
          href="https://github.com/filthymanc/Mission-Architect-for-DCS-World"
          target="_blank"
          rel="noopener noreferrer"
          className="text-app-tertiary hover:text-app-primary transition-colors"
          title="GitHub Repository"
        >
          <GithubIcon className="h-4 w-4" />
        </a>
        <a
          href="https://github.com/filthymanc/Mission-Architect-for-DCS-World/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-app-tertiary hover:text-red-400 transition-colors"
          title="Report Issue / Contact Developer"
        >
          <AlertIcon className="h-4 w-4" />
        </a>
      </div>

      <div className="text-[10px] text-app-tertiary text-center flex flex-col items-center gap-1">
        <p className="font-mono">v{APP_VERSION}</p>
        <p className="opacity-75">{AUTHOR_CREDIT}</p>
        <p className="opacity-50 text-[9px] leading-tight max-w-[200px]">
          DCS World is a trademark of Eagle Dynamics SA.
        </p>
      </div>
    </div>
  );
};

export default SidebarFooter;
