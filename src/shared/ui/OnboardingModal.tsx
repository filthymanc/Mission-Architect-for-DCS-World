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

import React from "react";
import { APP_VERSION, APP_NAME } from "../../core/version";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const modalRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app-overlay/90 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-app-surface border border-app-border rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] focus:outline-none"
      >
        {/* Header */}
        <div className="p-6 border-b border-app-border bg-app-frame/50 rounded-t-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded bg-app-brand flex items-center justify-center text-app-canvas font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1
              id="onboarding-title"
              className="text-2xl font-bold text-app-primary tracking-wide"
            >
              {APP_NAME} <span className="text-app-brand">v{APP_VERSION}</span>
            </h1>
          </div>
          <p className="text-app-secondary">
            Welcome, Commander. Before you begin scripting, please review the
            core operational protocols.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* 1. The Environment Law */}
          <div className="flex gap-4">
            <div className="flex-none w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
              1
            </div>
            <div>
              <h3 className="font-bold text-app-primary mb-1">
                Sanitized Environment Protocol
              </h3>
              <p className="text-sm text-app-secondary leading-relaxed">
                By default, DCS disables{" "}
                <code className="text-blue-300">os</code>,{" "}
                <code className="text-blue-300">io</code>, and{" "}
                <code className="text-blue-300">lfs</code> libraries to prevent
                malicious code execution.
                <br />
                <br />
                This AI assumes a <strong>SANITIZED</strong> environment. It
                will refuse to generate file-system code unless you explicitly
                enable{" "}
                <span className="text-red-400 font-bold">UNSAFE MODE</span> in
                the top toolbar.
              </p>
            </div>
          </div>

          {/* 2. The Verification Law */}
          <div className="flex gap-4">
            <div className="flex-none w-8 h-8 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
              2
            </div>
            <div>
              <h3 className="font-bold text-app-primary mb-1">
                Anti-Hallucination Mandate
              </h3>
              <p className="text-sm text-app-secondary leading-relaxed">
                DCS scripting engines (MOOSE/DCS API) are strict. To prevent
                crashes, the AI is programmed to{" "}
                <strong>Verify before Writing</strong>.
                <br />
                If it cannot find a documented method (e.g., in the MOOSE docs),
                it will fallback to standard Lua math rather than guessing.
              </p>
            </div>
          </div>

          {/* 3. The Persistence Law */}
          <div className="flex gap-4">
            <div className="flex-none w-8 h-8 rounded-full bg-orange-900/30 text-orange-400 flex items-center justify-center font-bold border border-orange-500/30">
              3
            </div>
            <div>
              <h3 className="font-bold text-app-primary mb-1">
                Manual Save Required
              </h3>
              <p className="text-sm text-app-secondary leading-relaxed">
                The Mission Editor's "DO SCRIPT" box does <strong>NOT</strong>{" "}
                auto-save.
                <br />
                After pasting generated code, you MUST press{" "}
                <kbd className="bg-app-canvas px-1 rounded border border-app-border">
                  Ctrl+S
                </kbd>{" "}
                (File &gt; Save) in the Mission Editor, or your changes will
                disappear on mission launch.
              </p>
            </div>
          </div>

          <div className="bg-app-canvas p-4 rounded-xl border border-app-border flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-app-brand mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <div className="text-xs text-app-tertiary">
              <strong className="text-app-secondary block mb-1">
                Data Sovereignty & Privacy
              </strong>
              Your API Key and Chat History are stored <strong>locally</strong>{" "}
              in your browser. Nothing is sent to the app host (GitHub Pages).
              <br />
              <br />
              <span className="opacity-75">
                However, your prompts are processed by the{" "}
                <strong>Google Gemini API</strong>.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-app-border bg-app-frame/50 rounded-b-2xl flex justify-end">
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-app-brand hover:bg-opacity-90 text-white font-bold rounded-lg transition-all shadow-lg shadow-app-brand/20 flex items-center gap-2 group"
          >
            ACKNOWLEDGE PROTOCOLS
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:translate-x-1 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
