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

import React, { createContext, useContext, useState, useEffect } from "react";
import { ApiStatus, AppSettings } from "./types";
import { STORAGE_KEYS, MODELS } from "./constants";

interface SettingsContextType {
  settings: AppSettings;
  apiStatus: ApiStatus;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setApiStatus: (status: ApiStatus) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    let initialSettings: AppSettings = {
      model: MODELS.FLASH.id,
      isDesanitized: false,
      themeMode: "standard",
      themeAccent: "emerald",
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        initialSettings = {
          model: parsed.model || MODELS.FLASH.id,
          isDesanitized: parsed.isDesanitized || false,
          themeMode: parsed.themeMode || "standard",
          themeAccent: parsed.themeAccent || "emerald",
        };
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }

    // DIRECT DOM MANIPULATION: Apply theme immediately on hydration
    // This bypasses the useEffect cycle for the first render
    if (typeof document !== "undefined" && document.body) {
      document.body.className = `mode-${initialSettings.themeMode} accent-${initialSettings.themeAccent}`;
    }

    return initialSettings;
  });

  const [apiStatus, setApiStatus] = useState<ApiStatus>("idle");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    // Apply theme classes on update
    if (typeof document !== "undefined" && document.body) {
      console.log(`[Theme System] Applying: mode-${settings.themeMode} accent-${settings.themeAccent}`);
      document.body.className = `mode-${settings.themeMode} accent-${settings.themeAccent}`;
    }
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        apiStatus,
        updateSettings: (u) => {
            console.log("[Settings] Updating:", u);
            setSettings((prev) => ({ ...prev, ...u }));
        },
        setApiStatus,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
