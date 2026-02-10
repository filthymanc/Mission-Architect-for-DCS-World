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

import React, { useEffect } from 'react';
import { AlertIcon, CheckIcon, XIcon } from './Icons';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColors = {
    success: 'bg-app-brand/90 border-app-brand shadow-app-brand/20',
    error: 'bg-red-600/90 border-red-500 shadow-red-900/20',
    info: 'bg-app-surface/90 border-app-border shadow-app-overlay/20'
  };

  return (
    <div role="alert" className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-3 px-6 py-3 rounded-lg shadow-2xl backdrop-blur-sm border ${bgColors[type]} text-white animate-bounce`}>
      {type === 'success' && (
        <CheckIcon className="h-5 w-5" />
      )}
      {type === 'error' && (
        <AlertIcon className="h-5 w-5" />
      )}
      <span className="font-semibold text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100" aria-label="Close Notification">
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;