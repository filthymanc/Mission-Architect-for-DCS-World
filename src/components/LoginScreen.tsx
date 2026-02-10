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

import React, { useState } from 'react';
import { APP_VERSION, APP_NAME, AUTHOR_CREDIT } from '../version';
import { SpinnerIcon, BookIcon, CheckIcon, AlertIcon } from './Icons';

interface LoginScreenProps {
  onLogin: (key: string) => void;
  isVerifying: boolean;
  authError: string | null;
  onOpenFieldManual: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isVerifying, authError, onOpenFieldManual }) => {
  const [tempKey, setTempKey] = useState('');

  return (
    <div className="flex flex-col h-screen bg-app-canvas text-app-primary items-center justify-center p-6 select-none relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-app-brand opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md w-full bg-app-frame/80 backdrop-blur-xl border border-app-border rounded-2xl p-8 shadow-2xl relative z-10">
            
            {/* Logo Area */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-xl bg-app-brand flex items-center justify-center text-white shadow-lg shadow-app-brand/40 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-app-primary tracking-tight">{APP_NAME}</h1>
                <p className="text-app-tertiary text-sm mt-1 font-mono">Mission Building Intelligence v{APP_VERSION}</p>
            </div>

            {/* Security Assurance Badge */}
            <div className="bg-app-canvas/50 border border-app-border rounded-lg p-3 mb-6 flex items-start gap-3">
                <div className="p-1.5 bg-app-brand/10 rounded-md text-app-brand mt-0.5">
                    <CheckIcon className="h-4 w-4" />
                </div>
                <div className="text-xs text-app-secondary leading-relaxed">
                    <strong className="text-app-primary block mb-0.5">Your Key is Safe</strong>
                    Stored locally in your browser. Never sent to our servers. Direct connection to Google APIs.
                </div>
            </div>

            {/* Login Form */}
            <form onSubmit={(e) => { e.preventDefault(); onLogin(tempKey); }} className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-bold text-app-secondary uppercase tracking-wider">Gemini API Key</label>
                        <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-app-brand hover:text-opacity-80 hover:underline flex items-center gap-1"
                        >
                            Get a free key
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={tempKey}
                            onChange={(e) => setTempKey(e.target.value)}
                            placeholder="Paste your key here..."
                            disabled={isVerifying}
                            className="w-full bg-app-canvas border border-app-highlight rounded-lg pl-4 pr-10 py-3 text-app-primary focus:outline-none focus:border-app-brand focus:ring-1 focus:ring-app-brand disabled:opacity-50 transition-all text-sm placeholder-app-tertiary"
                        />
                        <div className="absolute right-3 top-3 text-app-tertiary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 14l-1 1-2.66 2.66a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a6 6 0 01.94-2.61L10 8l-1-1m4-4a3 3 0 100 6 3 3 0 000-6z" />
                            </svg>
                        </div>
                    </div>
                    
                    {authError && (
                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/10 p-2 rounded border border-red-500/20 animate-fadeIn">
                            <AlertIcon className="h-4 w-4" />
                            {authError}
                        </div>
                    )}
                </div>
                
                <button 
                    type="submit"
                    disabled={!tempKey.trim() || isVerifying}
                    className="w-full py-3 bg-app-brand hover:bg-opacity-90 disabled:bg-app-surface disabled:text-app-tertiary text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-app-brand/20 disabled:shadow-none"
                >
                    {isVerifying ? (
                        <>
                            <SpinnerIcon className="h-5 w-5 text-white" />
                            Verifying Credentials...
                        </>
                    ) : "Initialize System"}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-app-border text-center">
                <button 
                    onClick={onOpenFieldManual}
                    className="px-4 py-2 bg-app-canvas hover:bg-app-surface text-app-secondary hover:text-app-primary rounded-lg text-xs font-bold transition-all border border-app-border hover:border-app-highlight flex items-center justify-center gap-2 mx-auto"
                >
                    <BookIcon className="h-4 w-4" />
                    READ FIELD MANUAL
                </button>
            </div>
        </div>
        
        <div className="absolute bottom-4 text-[10px] text-app-tertiary font-mono text-center">
            <p className="font-bold text-app-secondary mb-1">{AUTHOR_CREDIT}</p>
            <p className="opacity-75">Not affiliated with Eagle Dynamics or FlightControl</p>
        </div>
    </div>
  );
};

export default LoginScreen;