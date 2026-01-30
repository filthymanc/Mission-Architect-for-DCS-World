import { useState, useEffect } from 'react';
import { validateApiKey } from '../services/geminiService';

const KEY_STORAGE_NAME = 'dcs-architect-api-key';

export const useAuth = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    const stored = localStorage.getItem(KEY_STORAGE_NAME);
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
        localStorage.setItem(KEY_STORAGE_NAME, key);
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
    setApiKey('');
    setHasApiKey(false);
    localStorage.removeItem(KEY_STORAGE_NAME);
    // Optional: Reload to clear memory states
    window.location.reload();
  };

  return {
    apiKey,
    hasApiKey,
    isVerifying,
    authError,
    login,
    logout
  };
};
