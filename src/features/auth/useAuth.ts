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

import { useState, useEffect } from "react";
import { validateApiKey } from "../librarian/geminiService";
import { STORAGE_KEYS } from "../../core/constants";

export const useAuth = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (stored) {
      setApiKey(stored);
      setHasApiKey(true);
    }
  }, []);

  const login = async (keyInput: string): Promise<boolean> => {
    const key = keyInput.trim();
    if (!key) return false;

    setIsVerifying(true);
    setAuthError(null);

    try {
      const isValid = await validateApiKey(key);
      if (isValid) {
        setApiKey(key);
        setHasApiKey(true);
        localStorage.setItem(STORAGE_KEYS.API_KEY, key);
        setIsVerifying(false);
        return true;
      } else {
        setAuthError("Invalid API Key. Please check your credentials.");
        setIsVerifying(false);
        return false;
      }
    } catch (err) {
      setAuthError("Connection failed. Please check your network.");
      setIsVerifying(false);
      return false;
    }
  };

  const logout = () => {
    setApiKey("");
    setHasApiKey(false);
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    // Optional: Reload to clear memory states
    window.location.reload();
  };

  return {
    apiKey,
    hasApiKey,
    isVerifying,
    authError,
    login,
    logout,
  };
};
