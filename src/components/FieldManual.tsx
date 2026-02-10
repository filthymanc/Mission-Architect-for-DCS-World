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
import { useFocusTrap } from '../hooks/useFocusTrap';
import { APP_VERSION } from '../version';
import { MANUAL_CONTENT } from '../data/manualContent';

interface FieldManualProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'briefing' | 'systems' | 'controls' | 'tactics' | 'developer' | 'intel' | 'legal';

// Helper: Renders text with basic bolding (**text**) support
const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
    });
};

// Helper: Shortcut Row
const ShortcutRow: React.FC<{ keys: string[]; description: string }> = ({ keys, description }) => (
    <div className="flex items-center justify-between py-2 border-b border-app-border/50 last:border-0">
      <span className="text-sm text-app-secondary">{description}</span>
      <div className="flex gap-1">
        {keys.map((k, i) => (
          <React.Fragment key={k}>
            <kbd className="min-w-[24px] px-2 py-1 bg-app-surface border-b-2 border-app-border rounded text-xs font-mono font-bold text-app-tertiary flex items-center justify-center">
              {k}
            </kbd>
            {i < keys.length - 1 && <span className="text-app-tertiary self-center">+</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
);

const FieldManual: React.FC<FieldManualProps> = ({ isOpen, onClose }) => {
  const modalRef = useFocusTrap(isOpen);
  const [activeTab, setActiveTab] = useState<TabId>('briefing');

  if (!isOpen) return null;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'briefing', label: 'Briefing', icon: <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
    { id: 'systems', label: 'Systems', icon: <><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></> },
    { id: 'controls', label: 'Controls', icon: <path d="M3 5a1 1 0 011-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm7 1a1 1 0 011 1v7a1 1 0 01-1 1h-2a1 1 0 01-1-1V7a1 1 0 011-1h2z" /> },
    { id: 'tactics', label: 'Comms', icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" /> },
    { id: 'developer', label: 'A Word from the Dev', icon: <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /> },
    { id: 'intel', label: 'Community Resources', icon: <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /> },
    { id: 'legal', label: 'Legal', icon: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> }
  ];

  const content = MANUAL_CONTENT;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app-overlay/80 backdrop-blur-md animate-fadeIn"
        role="dialog"
        aria-modal="true"
    >
      <div 
        ref={modalRef}
        className="bg-app-frame border border-app-border rounded-2xl shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col md:flex-row overflow-hidden"
      >
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 bg-app-surface border-b md:border-b-0 md:border-r border-app-border flex flex-col">
            <div className="p-6 border-b border-app-border bg-app-surface/50">
                <h2 className="text-xl font-bold text-app-primary tracking-wide">FIELD MANUAL</h2>
                <p className="text-xs text-app-tertiary font-mono mt-1">v{APP_VERSION} Reference</p>
            </div>
            
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                            activeTab === tab.id 
                            ? 'bg-app-canvas text-app-brand border border-app-highlight shadow-sm' 
                            : 'text-app-secondary hover:text-app-primary hover:bg-app-canvas'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {tab.icon}
                        </svg>
                        {tab.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-app-border md:block hidden">
                <button 
                    onClick={onClose}
                    className="w-full py-2 bg-app-canvas hover:bg-app-surface text-app-secondary hover:text-app-primary rounded font-bold text-xs"
                >
                    CLOSE MANUAL
                </button>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col bg-app-frame min-w-0 text-app-primary">
            {/* Mobile Header (Close Button) */}
            <div className="md:hidden p-4 border-b border-app-border flex justify-end">
                 <button onClick={onClose} className="text-app-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                
                {/* --- TAB: BRIEFING (Brand Color) --- */}
                {activeTab === 'briefing' && (
                    <div className="space-y-8 max-w-2xl animate-fadeIn">
                        <div>
                            <h3 className="text-app-brand font-bold text-sm uppercase tracking-wider mb-2">{content.briefing.concept.subtitle}</h3>
                            <h1 className="text-3xl font-bold text-app-primary mb-4">{content.briefing.concept.title}</h1>
                            <p className="text-app-secondary leading-relaxed text-lg">
                                {content.briefing.concept.text}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {content.briefing.features.map((feature, idx) => (
                                 <div key={idx} className="p-5 bg-app-canvas rounded-xl border border-app-border">
                                    <h4 className="font-bold text-app-primary mb-2 flex items-center gap-2">
                                        {feature.iconType === 'device' && <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                                        {feature.iconType === 'lock' && <svg className="h-5 w-5 text-app-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                                        {feature.title}
                                    </h4>
                                    <p className="text-sm text-app-tertiary">
                                        {renderText(feature.text)}
                                    </p>
                                 </div>
                             ))}
                        </div>

                        <div>
                            <h3 className="text-app-brand font-bold text-sm uppercase tracking-wider mb-2">{content.briefing.engine.subtitle}</h3>
                            <p className="text-app-secondary leading-relaxed text-sm">
                                {renderText(content.briefing.engine.text)}
                            </p>
                        </div>
                    </div>
                )}

                {/* --- TAB: SYSTEMS (Blue) --- */}
                {activeTab === 'systems' && (
                    <div className="space-y-8 max-w-2xl animate-fadeIn">
                        <div>
                            <h3 className="text-blue-500 font-bold text-sm uppercase tracking-wider mb-4">{content.systems.interface.subtitle}</h3>
                            
                            <div className="space-y-4">
                                {content.systems.interface.sections.map((section, idx) => (
                                    <div key={idx} className="bg-app-canvas border border-app-border rounded-lg overflow-hidden">
                                        <div className="px-4 py-2 bg-app-surface border-b border-app-border font-bold text-app-primary text-xs uppercase">{section.title}</div>
                                        <div className="divide-y divide-app-border">
                                            {section.items.map((item, i) => (
                                                <div key={i} className="p-3 flex gap-4">
                                                    <span className={`font-mono text-${item.color}-400 text-xs w-24 shrink-0`}>{item.label}</span>
                                                    <p className="text-app-secondary text-sm">{renderText(item.text)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-blue-500 font-bold text-sm uppercase tracking-wider mb-2">{content.systems.librarian.subtitle}</h3>
                            <p className="text-app-secondary leading-relaxed text-sm">
                                {renderText(content.systems.librarian.text)}
                            </p>
                        </div>
                    </div>
                )}

                {/* --- TAB: CONTROLS (Yellow) --- */}
                {activeTab === 'controls' && (
                    <div className="max-w-2xl animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <div>
                                <h3 className="text-xs font-bold text-app-brand uppercase tracking-wider mb-4">{content.controls.navigation.title}</h3>
                                <div className="space-y-1">
                                    {content.controls.navigation.items.map((item, idx) => (
                                        <ShortcutRow key={idx} keys={item.keys} description={item.description} />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-4">{content.controls.editor.title}</h3>
                                <div className="space-y-1">
                                     {content.controls.editor.items.map((item, idx) => (
                                        <ShortcutRow key={idx} keys={item.keys} description={item.description} />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4">{content.controls.system.title}</h3>
                                <div className="space-y-1">
                                     {content.controls.system.items.map((item, idx) => (
                                        <ShortcutRow key={idx} keys={item.keys} description={item.description} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: COMMS (Tactics) (Purple) --- */}
                {activeTab === 'tactics' && (
                    <div className="space-y-8 max-w-2xl animate-fadeIn">
                         <div>
                            <h3 className="text-purple-500 font-bold text-sm uppercase tracking-wider mb-2">{content.tactics.prompt.subtitle}</h3>
                            <div className="space-y-3">
                                {content.tactics.prompt.cards.map((card, idx) => (
                                    <div key={idx} className={`p-4 bg-app-canvas border border-app-border rounded-xl border-l-4 ${card.type === 'trap' ? 'border-l-red-500' : 'border-l-app-brand'}`}>
                                        <strong className={`${card.type === 'trap' ? 'text-red-400' : 'text-app-brand'} text-xs uppercase block mb-1`}>{card.title}</strong>
                                        <p className="text-sm text-app-secondary italic">{card.example}</p>
                                        <p className="text-sm text-app-tertiary mt-2">
                                            <span className="font-bold">{card.explanationLabel}</span> {card.explanation}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-purple-500 font-bold text-sm uppercase tracking-wider mb-2">{content.tactics.errors.subtitle}</h3>
                            <div className="space-y-3">
                                {content.tactics.errors.items.map((item, idx) => {
                                    const styles = [
                                        { border: 'border-l-orange-500', title: 'text-orange-400' }, 
                                        { border: 'border-l-blue-500', title: 'text-blue-400' },     
                                        { border: 'border-l-pink-500', title: 'text-pink-400' }      
                                    ];
                                    const style = styles[idx % styles.length];

                                    return (
                                        <div key={idx} className={`p-4 bg-app-canvas border border-app-border rounded-xl border-l-4 ${style.border}`}>
                                            <strong className={`${style.title} font-bold text-sm mb-1 block`}>{item.label}</strong>
                                            <p className="text-sm text-app-secondary leading-relaxed">
                                                {renderText(item.text)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                 {/* --- TAB: DEV (Slate) --- */}
                 {activeTab === 'developer' && (
                    <div className="space-y-8 max-w-2xl animate-fadeIn">
                        <div>
                            <h3 className="text-app-tertiary font-bold text-sm uppercase tracking-wider mb-2">{content.developer.intent.subtitle}</h3>
                            <p className="text-app-secondary leading-relaxed">
                                {renderText(content.developer.intent.text)}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-app-tertiary font-bold text-sm uppercase tracking-wider mb-2">{content.developer.inspiration.subtitle}</h3>
                            <div className="p-6 bg-app-canvas border border-app-border rounded-xl italic text-app-secondary text-sm leading-relaxed">
                                {renderText(content.developer.inspiration.text)}
                                <br/>
                                <span className="block mt-4 text-xs font-bold not-italic text-app-tertiary">{content.developer.inspiration.author}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-app-tertiary font-bold text-sm uppercase tracking-wider mb-2">{content.developer.stack.subtitle}</h3>
                            <ul className="text-xs text-app-tertiary font-mono space-y-1">
                                {content.developer.stack.items.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* --- TAB: RESOURCES (Orange) --- */}
                {activeTab === 'intel' && (
                     <div className="space-y-6 max-w-2xl animate-fadeIn">
                        <h3 className="text-orange-500 font-bold text-sm uppercase tracking-wider mb-2">{content.intel.subtitle}</h3>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {content.intel.links.map((link, idx) => (
                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="block p-5 bg-app-canvas border border-app-border hover:border-orange-500/50 hover:bg-app-surface rounded-xl transition-all group border-l-4 border-l-orange-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-app-primary group-hover:text-orange-400 transition-colors flex items-center gap-2">
                                                {link.title}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </h4>
                                            <p className="text-xs font-bold text-app-tertiary mt-1 mb-2">{link.author}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-app-secondary leading-relaxed">{link.description}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB: LEGAL (Red) --- */}
                {activeTab === 'legal' && (
                    <div className="space-y-8 max-w-2xl animate-fadeIn">
                        {/* Privacy Section */}
                        <div className="pb-8 border-b border-app-border">
                             <h3 className="text-red-500 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                {content.legal.sovereignty.subtitle}
                             </h3>
                             <div className="space-y-3 text-sm text-app-secondary">
                                {content.legal.sovereignty.items.map((item, idx) => (
                                    <p key={idx}><strong className="text-app-primary">{item.label}</strong> {item.text}</p>
                                ))}
                             </div>
                        </div>

                        {/* Credits Section */}
                        <div>
                             <h3 className="text-red-500 font-bold text-sm uppercase tracking-wider mb-4">{content.legal.credits.subtitle}</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {content.legal.credits.items.map((credit, idx) => (
                                    <div key={idx} className="p-4 bg-app-canvas border border-app-border rounded-xl border-l-4 border-l-app-border">
                                        <div className="font-bold text-app-primary text-sm">{credit.title}</div>
                                        <div className="text-xs font-bold text-app-tertiary mt-1">{credit.author}</div>
                                        <div className="text-xs text-app-tertiary font-mono mt-2 pt-2 border-t border-app-border/50">{credit.license}</div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        {/* License Section */}
                        <div>
                             <h3 className="text-app-tertiary font-bold text-sm uppercase tracking-wider mb-4">{content.legal.license.subtitle}</h3>
                             <div className="p-4 bg-app-frame border border-app-border rounded-lg overflow-auto max-h-64 custom-scrollbar">
                                <pre className="text-[10px] text-app-tertiary font-mono whitespace-pre-wrap leading-relaxed">
                                    {content.legal.license.text}
                                </pre>
                             </div>
                             <p className="text-[10px] text-app-tertiary mt-6 italic">
                                {content.legal.license.disclaimer}
                             </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default FieldManual;