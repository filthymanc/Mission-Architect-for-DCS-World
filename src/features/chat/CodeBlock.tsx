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

import React, { useState } from "react";

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
  inline?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  className,
  children,
  inline,
}) => {
  const [copied, setCopied] = useState(false);

  // Extract language from className (format: "language-lua")
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "lua"; // Default to Lua for DCS context

  // Robustly extract text from children
  const extractText = (source: React.ReactNode): string => {
    if (typeof source === "string") return source;
    if (typeof source === "number") return String(source);

    if (Array.isArray(source)) {
      return source.map(extractText).join("");
    }

    if (React.isValidElement(source) && source.props) {
      // @ts-expect-error: accessing children on generic props
      return extractText(source.props.children);
    }

    return "";
  };

  const codeText = extractText(children).replace(/\n$/, "");

  // INLINE DETECTION STRATEGY
  const isInline =
    inline || (!match && !codeText.includes("\n") && codeText.length < 100);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([codeText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Set extension based on language
    const ext = language === "lua" ? "lua" : "txt";
    a.download = `mission_script_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Inline Code (Single tick)
  if (isInline) {
    return (
      <code className="text-app-brand font-bold font-mono text-[calc(1em-1px)]">
        {codeText || children}
      </code>
    );
  }

  // Block Code (Triple tick)
  if (!codeText) return null;

  // Custom Lightweight Highlighter
  const LightweightHighlighter = ({ code }: { code: string }) => {
    const tokenRegex =
      /(--\[\[[\s\S]*?\]\]|--.*$)|("[^"]*"|'[^']*')|(\b(?:local|function|end|if|then|else|elseif|for|in|do|while|repeat|until|return|break|true|false|nil|and|or|not)\b)|(\b\d+(?:\.\d+)?\b)|(\b[A-Z_][A-Z0-9_]*\b)/gm;

    const parts = code.split(tokenRegex);

    return (
      <>
        {parts.map((part, i) => {
          if (!part) return null;

          // Comments
          if (part.startsWith("--")) {
            return (
              <span key={i} className="text-app-tertiary italic">
                {part}
              </span>
            );
          }
          // Strings
          if (part.startsWith('"') || part.startsWith("'")) {
            return (
              <span key={i} className="text-emerald-400">
                {part}
              </span>
            );
          }
          // Keywords
          if (
            /^(local|function|end|if|then|else|elseif|for|in|do|while|repeat|until|return|break|true|false|nil|and|or|not)$/.test(
              part,
            )
          ) {
            return (
              <span key={i} className="text-purple-400 font-bold">
                {part}
              </span>
            );
          }
          // Numbers
          if (/^\d+(\.\d+)?$/.test(part)) {
            return (
              <span key={i} className="text-orange-400">
                {part}
              </span>
            );
          }
          // MOOSE Constants (All Caps, length > 1)
          if (/^[A-Z_][A-Z0-9_]*$/.test(part) && part.length > 1) {
            return (
              <span key={i} className="text-blue-300">
                {part}
              </span>
            );
          }

          // Default
          return (
            <span key={i} className="text-slate-300">
              {part}
            </span>
          );
        })}
      </>
    );
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-app-border bg-app-frame shadow-sm not-prose">
      <div className="flex items-center justify-between px-4 py-2 bg-app-canvas border-b border-app-border">
        <span className="text-xs font-mono text-app-tertiary uppercase tracking-wider font-bold">
          {language}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="text-xs text-app-secondary hover:text-blue-400 transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-app-surface"
            title="Download as File"
            aria-label="Download Code"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="font-semibold">SAVE</span>
          </button>

          <button
            onClick={handleCopy}
            className="text-xs text-app-secondary hover:text-app-brand transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-app-surface"
            aria-label="Copy Code to Clipboard"
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">COPIED</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>COPY</span>
              </>
            )}
          </button>
        </div>
      </div>
      {/* Code body background is set to app-frame (or slightly darker) to contrast with chat bubble */}
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed bg-app-canvas whitespace-pre">
        <LightweightHighlighter code={codeText} />
      </div>
    </div>
  );
};

export default CodeBlock;
