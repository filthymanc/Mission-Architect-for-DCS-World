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

import React, { Component, ErrorInfo, ReactNode } from "react";
import { STORAGE_KEYS } from "../constants";
import { AlertIcon } from "./Icons";

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
  scope?: "app" | "message";
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isConfirmingReset: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isConfirmingReset: false
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, isConfirmingReset: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary - ${this.props.scope || 'general'}] Uncaught error:`, error, errorInfo);
  }

  handleSoftReset = () => {
    this.setState({ hasError: false, error: null, isConfirmingReset: false });
  };

  toggleResetConfirmation = () => {
    // using a functional update to ensure state consistency
    this.setState((prevState) => ({ isConfirmingReset: !prevState.isConfirmingReset }));
  };

  executeHardReset = () => {
     try {
         console.log("Executing Factory Reset...");
         const keysToRemove = [
            STORAGE_KEYS.INDEX, 
            STORAGE_KEYS.API_KEY,
            STORAGE_KEYS.SETTINGS,
            STORAGE_KEYS.ONBOARDED
        ];
        
        keysToRemove.forEach(k => localStorage.removeItem(k));
         
         // Clear Phase 8 GitHub Tree Caches and Sessions by prefix
         Object.keys(localStorage).forEach(key => {
             if (key.startsWith(STORAGE_KEYS.TREE_CACHE_PREFIX) || key.startsWith(STORAGE_KEYS.SESSION_PREFIX)) {
                 localStorage.removeItem(key);
             }
         });
         
     } catch (e) {
         console.error("Failed to clear local storage", e);
     }
     
     // Force reload
     window.location.href = window.location.href.split('#')[0]; 
  };

  render() {
    if (this.state.hasError) {
       if (this.props.fallback) {
           return this.props.fallback;
       }

       // Compact fallback for individual messages
       if (this.props.scope === 'message') {
           return (
            <div className="p-3 bg-red-900/10 border border-red-500/20 rounded text-sm text-red-300 font-mono">
                <div className="flex items-center gap-2 mb-1 font-bold text-xs uppercase tracking-wider opacity-70">
                    <AlertIcon className="h-4 w-4" />
                    Rendering Error
                </div>
                <p className="opacity-80">This message contains content that could not be displayed.</p>
                <div className="mt-2 text-[10px] bg-slate-950 p-2 rounded overflow-auto max-h-20 opacity-60">
                    {this.state.error?.toString()}
                </div>
                <button 
                    onClick={this.handleSoftReset}
                    className="mt-2 text-[10px] font-bold text-red-400 hover:text-red-300 underline uppercase"
                >
                    Retry Render
                </button>
            </div>
           );
       }

       // Full App Fallback
       return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center bg-slate-900 text-slate-200">
          <div className="max-w-md w-full bg-slate-950 border border-slate-800 p-8 rounded-2xl shadow-2xl">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertIcon className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Critical System Error</h2>
            <p className="text-slate-400 mb-6 text-sm">
                The Mission Architect encountered an unexpected crash.
            </p>
            <div className="bg-slate-900 p-3 rounded text-left text-xs font-mono text-red-300 overflow-auto max-h-32 mb-6 border border-slate-800">
                {this.state.error?.toString()}
            </div>
            
            <div className="space-y-3">
                {!this.state.isConfirmingReset ? (
                    <>
                        <button
                            type="button"
                            onClick={this.handleSoftReset}
                            className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors text-sm uppercase tracking-wide shadow-lg shadow-red-900/20"
                        >
                            Restore System
                        </button>
                        
                        <div className="pt-2 border-t border-slate-800">
                             <button
                                type="button"
                                onClick={this.toggleResetConfirmation}
                                className="text-xs text-slate-600 hover:text-red-500 transition-colors"
                            >
                                Perform Factory Reset (Clear Data)
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-lg animate-fadeIn">
                        <p className="text-red-300 font-bold text-sm mb-1">WARNING: Permanent Data Loss</p>
                        <p className="text-slate-400 text-xs mb-4">
                            This will wipe your API Key, Sessions, and Settings. You will need to log in again.
                        </p>
                        <div className="flex gap-2">
                             <button
                                onClick={this.executeHardReset}
                                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs"
                            >
                                YES, DELETE ALL
                            </button>
                             <button
                                onClick={this.toggleResetConfirmation}
                                className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-xs"
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;