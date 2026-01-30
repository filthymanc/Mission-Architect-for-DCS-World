import React from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutRow: React.FC<{ keys: string[]; description: string }> = ({ keys, description }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
    <span className="text-sm text-slate-300">{description}</span>
    <div className="flex gap-1">
      {keys.map((k, i) => (
        <React.Fragment key={k}>
          <kbd className="min-w-[24px] px-2 py-1 bg-slate-800 border-b-2 border-slate-700 rounded text-xs font-mono font-bold text-slate-400 flex items-center justify-center">
            {k}
          </kbd>
          {i < keys.length - 1 && <span className="text-slate-600 self-center">+</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden focus:outline-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 id="shortcuts-title" className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm7 1a1 1 0 011 1v7a1 1 0 01-1 1h-2a1 1 0 01-1-1V7a1 1 0 011-1h2z" clipRule="evenodd" />
            </svg>
            Keyboard Controls
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors" aria-label="Close Shortcuts">
            <kbd className="hidden sm:inline-block px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-500 mr-2">ESC</kbd>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            
            {/* Column 1 */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Global Navigation</h3>
                    <ShortcutRow keys={['?']} description="Toggle this Controls Menu" />
                    <ShortcutRow keys={['Ctrl', 'B']} description="Toggle Sidebar" />
                    <ShortcutRow keys={['Alt', 'N']} description="Create New Mission" />
                    <ShortcutRow keys={['Alt', '←/→']} description="Cycle Missions" />
                </div>

                <div>
                    <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Editor</h3>
                    <ShortcutRow keys={['Ctrl', 'Enter']} description="Send Message" />
                    <ShortcutRow keys={['Enter']} description="Insert New Line" />
                    <ShortcutRow keys={['/']} description="Focus Input Box" />
                </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
                 <div>
                    <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">System & Safety</h3>
                    <ShortcutRow keys={['Esc']} description="Stop Generation / Close" />
                    <ShortcutRow keys={['Ctrl', 'L']} description="Clear Chat History" />
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mt-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pro Tip</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Use <kbd className="font-mono text-slate-300">Space</kbd> or <kbd className="font-mono text-slate-300">Enter</kbd> to activate focused buttons when navigating via <kbd className="font-mono text-slate-300">Tab</kbd>.
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;