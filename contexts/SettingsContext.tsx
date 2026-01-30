
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ModelType, ApiStatus, AppSettings } from '../types';

interface SettingsContextType {
  settings: AppSettings;
  apiStatus: ApiStatus;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setApiStatus: (status: ApiStatus) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('dcs-architect-settings-v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return {
      model: 'gemini-3-flash-preview',
      isDesanitized: false,
    };
  });

  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');

  useEffect(() => {
    localStorage.setItem('dcs-architect-settings-v2', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <SettingsContext.Provider value={{ settings, apiStatus, updateSettings, setApiStatus }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
