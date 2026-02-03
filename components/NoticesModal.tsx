
import React from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface NoticesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6 border-b border-slate-800 pb-4 last:border-0 last:pb-0">
    <h3 className="text-emerald-500 font-bold text-xs uppercase tracking-wider mb-3">{title}</h3>
    <div className="space-y-3">
        {children}
    </div>
  </div>
);

const LibraryItem: React.FC<{ name: string; author: string; license: string; link: string; desc?: string }> = ({ name, author, license, link, desc }) => (
  <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
    <div className="flex justify-between items-start mb-1">
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-200 hover:text-blue-400 hover:underline">
            {name}
        </a>
        <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">{license}</span>
    </div>
    <div className="text-xs text-slate-500 mb-1">{author}</div>
    {desc && <div className="text-xs text-slate-400 leading-relaxed mt-2 pt-2 border-t border-slate-800/50">{desc}</div>}
  </div>
);

const NoticesModal: React.FC<NoticesModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="notices-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] focus:outline-none"
      >
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
          <h2 id="notices-title" className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Third-Party Notices
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors" aria-label="Close Notices">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-slate-300">
          <div className="text-xs text-slate-400 mb-6 bg-blue-900/10 border border-blue-500/20 p-3 rounded">
            This application utilizes several third-party libraries and frameworks. We gratefully acknowledge the contributions of the following open-source projects.
          </div>

          <Section title="Development Team">
             <LibraryItem 
                name="The filthymanc"
                author="Developer"
                license="MIT"
                link="https://github.com/filthymanc"
                desc="Concept, Design, and Full-Stack Implementation."
             />
          </Section>

          <Section title="DCS World Frameworks">
             <LibraryItem 
                name="MOOSE (Mission Object Oriented Scripting Environment)"
                author="by FlightControl-Master & Community"
                license="GNU GPL v3.0"
                link="https://github.com/FlightControl-Master/MOOSE"
                desc="A mission design framework for DCS World that allows mission designers to write missions using object-oriented scripting."
             />
             <LibraryItem 
                name="DML (Dynamic Mission Library)"
                author="by Christian Franz (cfrag)"
                license="MIT (Implied)"
                link="https://github.com/csofranz/DML"
                desc="A library for DCS World mission creation that emphasizes Mission Editor attributes over complex Lua scripting."
             />
          </Section>

          <Section title="Web Application Stack">
             <LibraryItem 
                name="React"
                author="by Meta Platforms, Inc."
                license="MIT"
                link="https://react.dev/"
             />
             <LibraryItem 
                name="Google GenAI SDK"
                author="by Google LLC"
                license="Apache 2.0"
                link="https://github.com/google/generative-ai-js"
             />
             <LibraryItem 
                name="Tailwind CSS"
                author="by Tailwind Labs Inc."
                license="MIT"
                link="https://tailwindcss.com/"
             />
             <LibraryItem 
                name="React Markdown"
                author="by Titus Wormer & Community"
                license="MIT"
                link="https://github.com/remarkjs/react-markdown"
             />
          </Section>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Disclaimer</p>
             <p className="text-xs text-slate-400 italic">
                "Mission Architect for DCS" is a community-created tool and is not affiliated with, endorsed by, or sponsored by Eagle Dynamics SA, the creators of DCS World. "DCS World" is a trademark of Eagle Dynamics SA.
             </p>
          </div>
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end rounded-b-2xl">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded transition-colors text-xs"
            >
                CLOSE
            </button>
        </div>
      </div>
    </div>
  );
};

export default NoticesModal;
