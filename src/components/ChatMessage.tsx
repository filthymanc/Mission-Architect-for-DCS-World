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

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import CodeBlock from './CodeBlock';

interface ChatMessageProps {
  message: Message;
}

const cleanStreamedContent = (text: string, isStreaming?: boolean) => {
    if (!isStreaming || !text) return text;
    const backticks = (text.match(/```/g) || []).length;
    return backticks % 2 !== 0 ? text + '\n```' : text;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';
  
  const getModelBadge = (model?: string, verifiedModel?: string) => {
    if (!model) return null;
    const isVerified = verifiedModel && verifiedModel.includes(model.replace('gemini-', '').replace('-preview', ''));
    
    if (model.includes('flash')) {
        return (
            <span className="ml-2 px-1.5 py-0.5 rounded border border-app-brand/30 text-[10px] font-mono text-app-brand font-bold bg-app-brand/10 flex items-center whitespace-nowrap">
                v3 FLASH {isVerified && '✓'}
            </span>
        );
    }
    if (model.includes('pro')) {
        return (
            <span className="ml-2 px-1.5 py-0.5 rounded border border-blue-500/30 text-[10px] font-mono text-blue-400 font-bold bg-blue-500/10 flex items-center whitespace-nowrap">
                v3 PRO {isVerified && '✓'}
            </span>
        );
    }
    return null;
  };

  return (
    <div className={`flex w-full mb-6 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] lg:max-w-[75%] rounded-2xl p-5 shadow-lg select-text transition-colors duration-300 ${isModel ? 'bg-app-surface border border-app-border text-app-primary' : 'bg-app-brand text-white rounded-br-sm'}`}>
        <div className="flex flex-wrap items-center gap-2 mb-3 opacity-50 text-xs font-bold tracking-wider uppercase select-none">
          {isModel ? (
            <>
              <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-app-brand animate-pulse"></span>
                  DCS Mission Architect
              </div>
              {getModelBadge(message.modelUsed, message.verifiedModel)}
            </>
          ) : (
            'Operator'
          )}
        </div>
        
        {/* Librarian Status Badge */}
        {isModel && message.librarianStatus && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-app-canvas border border-app-border rounded-lg animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-app-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs font-mono font-bold text-app-brand">{message.librarianStatus}</span>
          </div>
        )}

        <div className={`text-sm md:text-base leading-relaxed ${isModel ? 'markdown-body' : 'whitespace-pre-wrap'}`}>
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                pre: ({children}) => <>{children}</>,
                code({node, inline, className, children, ...props}: any) {
                    return (
                    <CodeBlock inline={inline} className={className} {...props}>
                        {children}
                    </CodeBlock>
                    );
                }
                }}
            >
                {cleanStreamedContent(message.text, message.isStreaming)}
            </ReactMarkdown>
        </div>
        
        {isModel && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-app-border/50">
            <p className="text-[10px] uppercase text-app-tertiary font-bold mb-2 tracking-widest">Librarian Verified Sources</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, idx) => (
                <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1 bg-app-canvas rounded border border-app-border hover:border-app-brand text-xs truncate max-w-[200px] text-app-secondary hover:text-app-brand transition-colors">
                  <span className="truncate">{source.title || new URL(source.uri).hostname}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {isModel && !message.isStreaming && (message.tokenUsage || message.timingMs) && (
            <div className="mt-4 pt-2 border-t border-app-border/30 flex items-center justify-between text-[10px] text-app-tertiary font-mono select-none">
                <div className="flex gap-3">
                   {message.tokenUsage && <span>Tokens: {message.tokenUsage.totalTokens}</span>}
                </div>
                {message.timingMs && <span>{ (message.timingMs / 1000).toFixed(2) }s</span>}
            </div>
        )}

        {isModel && message.isStreaming && !message.librarianStatus && (
            <div className="mt-2 flex gap-1 h-4 items-center">
                <span className="w-1.5 h-1.5 bg-app-brand/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-app-brand/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-app-brand/50 rounded-full animate-bounce"></span>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;