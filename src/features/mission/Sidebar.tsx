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
import { Session } from "../../core/types";
import { SpinnerIcon, PlusIcon, XIcon } from "../../shared/ui/Icons";
import SidebarSessionItem from "./SidebarSessionItem";
import SidebarFooter from "./SidebarFooter";

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => string;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onOpenFieldManual: () => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  isOpen,
  onClose,
  onDisconnect,
  onExportData,
  onImportData,
  onOpenFieldManual,
  isLoading,
}) => {
  // Logic for List Management is still orchestrated here to ensure mutual exclusivity
  // (e.g., only one row can be edited or deleted at a time)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleStartEdit = (id: string) => {
    setEditingId(id);
    setDeleteConfirmId(null);
  };

  const handleConfirmEdit = (id: string, newName: string) => {
    if (newName.trim()) {
      onRenameSession(id, newName.trim());
    }
    setEditingId(null);
  };

  const handleStartDelete = (id: string) => {
    setDeleteConfirmId(id);
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Overlay (Z-30) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-app-overlay/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container (Z-40) */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-40 h-full w-72 pt-[env(safe-area-inset-top)]
          bg-app-frame border-r border-app-border flex flex-col select-none
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-app-border flex items-center justify-between">
          <h2 className="font-bold text-app-primary tracking-wide text-sm">
            MISSIONS
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-app-secondary hover:text-app-primary"
            aria-label="Close Sidebar"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* New Mission Button */}
        <div className="p-4">
          <button
            onClick={() => {
              if (!isLoading) {
                const newId = onCreateSession();
                setEditingId(newId);
                // We do NOT call onClose() here, so the user can see the edit input immediately
              }
            }}
            disabled={isLoading}
            className={`
                    w-full flex items-center justify-center gap-2 
                    py-3 rounded-lg font-bold text-sm transition-all shadow-lg 
                    ${
                      isLoading
                        ? "bg-app-surface text-app-tertiary cursor-not-allowed shadow-none"
                        : "bg-app-brand hover:bg-opacity-90 text-white shadow-app-brand/20"
                    }
                `}
            aria-label="Create New Mission"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <SpinnerIcon className="h-4 w-4 text-app-tertiary" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            {isLoading ? "GENERATING..." : "NEW MISSION"}
          </button>
        </div>

        {/* Session List */}
        <div
          className={`flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar transition-opacity duration-300 ${isLoading ? "opacity-40 pointer-events-none select-none" : "opacity-100"}`}
        >
          {sessions.map((session) => (
            <SidebarSessionItem
              key={session.id}
              session={session}
              isActive={activeSessionId === session.id}
              isEditing={editingId === session.id}
              isDeleteConfirming={deleteConfirmId === session.id}
              isLoading={isLoading}
              onSelect={(id) => {
                onSelectSession(id);
                onClose();
              }}
              onStartEdit={handleStartEdit}
              onConfirmEdit={handleConfirmEdit}
              onCancelEdit={() => setEditingId(null)}
              onStartDelete={handleStartDelete}
              onConfirmDelete={(id) => {
                onDeleteSession(id);
                setDeleteConfirmId(null);
              }}
              onCancelDelete={() => setDeleteConfirmId(null)}
            />
          ))}
        </div>

        {/* Footer info & Actions */}
        <SidebarFooter
          onImportData={onImportData}
          onExportData={onExportData}
          onOpenFieldManual={onOpenFieldManual}
          onDisconnect={onDisconnect}
        />
      </aside>
    </>
  );
};

export default Sidebar;
