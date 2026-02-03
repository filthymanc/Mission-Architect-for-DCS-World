
import React from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="privacy-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden focus:outline-none"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 id="privacy-title" className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Data Sovereignty & Privacy
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors" aria-label="Close Privacy Modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4 text-sm text-slate-300 leading-relaxed">
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
             <h3 className="font-bold text-emerald-400 mb-2 uppercase text-xs tracking-wider">Zero-Logging Architecture</h3>
             <p>
                This application runs entirely in your web browser (Client-Side). 
                <strong className="text-white"> We (the developers/host) cannot see your missions, scripts, or API keys.</strong>
             </p>
          </div>

          <div className="grid gap-4">
             <div>
                <h4 className="font-bold text-white mb-1">API Key Security</h4>
                <p className="text-slate-400 text-xs">
                    Your Google Gemini API Key is stored in your browser's local storage (`localStorage`). 
                    It is never sent to the GitHub Pages host. It is only sent directly to Google APIs for authentication.
                </p>
             </div>
             <div>
                <h4 className="font-bold text-white mb-1">AI Processing</h4>
                <p className="text-slate-400 text-xs">
                    While the host sees nothing, your chat prompts are processed by <strong className="text-slate-200">Google's Gemini API</strong>. 
                    Please refer to Google's Generative AI Terms of Service regarding data usage.
                </p>
             </div>
             <div>
                <h4 className="font-bold text-white mb-1">Mission Data</h4>
                <p className="text-slate-400 text-xs">
                    All chat history and generated scripts are stored locally on your device. 
                    Clearing your browser cache will remove this data unless you export a backup.
                </p>
             </div>
          </div>
          
          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 italic text-center">
                Built by the DCS Community, for the DCS Community.
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors text-sm"
            >
                ACKNOWLEDGE
            </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
