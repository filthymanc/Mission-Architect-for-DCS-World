import React, { ErrorInfo, ReactNode } from "react";
import { STORAGE_VERSION_TAG } from "../version";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  scope?: "app" | "message";
}

interface State {
  hasError: boolean;
  error: Error | null;
  isConfirmingReset: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  // Use class property for state to avoid constructor issues and typing glitches
  state: State = {
    hasError: false,
    error: null,
    isConfirmingReset: false
  };

  static getDerivedStateFromError(error: Error): State {
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
         // Nuclear option: Clear ALL storage keys used by the app
         localStorage.removeItem('dcs-architect-sessions-v1');
         localStorage.removeItem('dcs-architect-messages-v1');
         localStorage.removeItem('dcs-architect-api-key');      // Clear Credentials
         localStorage.removeItem('dcs-architect-settings-v2');   // Clear Preferences
         // Clear index keys
         localStorage.removeItem('dcs-architect-v1.7-index');
         localStorage.removeItem(`dcs-architect-${STORAGE_VERSION_TAG}-index`);
         
         // Clear Phase 8 GitHub Tree Caches
         Object.keys(localStorage).forEach(key => {
             if (key.startsWith('dcs-architect-tree-')) {
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
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