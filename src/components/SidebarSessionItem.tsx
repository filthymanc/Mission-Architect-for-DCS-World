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

import React, { useRef, useEffect, useState } from 'react';
import { Session } from '../types';
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from './Icons';

interface SidebarSessionItemProps {
  session: Session;
  isActive: boolean;
  isEditing: boolean;
  isDeleteConfirming: boolean;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onStartEdit: (id: string) => void;
  onConfirmEdit: (id: string, newName: string) => void;
  onCancelEdit: () => void;
  onStartDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

const SidebarSessionItem: React.FC<SidebarSessionItemProps> = ({
  session,
  isActive,
  isEditing,
  isDeleteConfirming,
  isLoading,
  onSelect,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  onStartDelete,
  onConfirmDelete,
  onCancelDelete
}) => {
  const [editName, setEditName] = useState(session.name);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      setEditName(session.name); // Reset name to current on open
    }
  }, [isEditing, session.name]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onConfirmEdit(session.id, editName);
    if (e.key === 'Escape') onCancelEdit();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div
      onClick={() => { if (!isLoading && !isEditing) onSelect(session.id); }}
      className={`
        group relative p-3 rounded-lg cursor-pointer transition-all border
        ${isActive 
          ? 'bg-app-surface border-app-border shadow-sm' 
          : 'bg-transparent border-transparent hover:bg-app-canvas hover:border-app-border text-app-secondary hover:text-app-primary'
        }
      `}
      role="button"
      tabIndex={0}
      aria-current={isActive ? 'page' : undefined}
    >
      {isEditing ? (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <input
            ref={editInputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={() => onConfirmEdit(session.id, editName)}
            onKeyDown={handleKeyDown}
            className="w-full bg-app-canvas text-app-primary text-sm px-2 py-1 rounded border border-app-brand focus:outline-none select-text"
            aria-label="Edit Mission Name"
          />
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm truncate mb-1 ${isActive ? 'text-app-primary' : ''}`}>
              {session.name}
            </h3>
            <p className="text-[10px] text-app-tertiary font-mono">
              {formatDate(session.lastModified)}
            </p>
          </div>

          {/* Action Buttons */}
          {isDeleteConfirming ? (
            <div className="flex items-center gap-1 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => { e.stopPropagation(); onConfirmDelete(session.id); }}
                className="p-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors"
                title="Confirm Delete"
                aria-label="Confirm Delete"
              >
                <CheckIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onCancelDelete(); }}
                className="p-1 bg-app-canvas text-app-secondary hover:bg-app-frame hover:text-app-primary rounded transition-colors"
                title="Cancel"
                aria-label="Cancel Delete"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className={`flex items-center gap-1 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
              <button
                onClick={(e) => { e.stopPropagation(); if(!isLoading) onStartEdit(session.id); }}
                className="p-1 hover:bg-app-canvas rounded text-app-tertiary hover:text-blue-400"
                title="Rename"
                aria-label="Rename Mission"
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); if(!isLoading) onStartDelete(session.id); }}
                className="p-1 hover:bg-app-canvas rounded text-app-tertiary hover:text-red-400"
                title="Delete"
                aria-label="Delete Mission"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SidebarSessionItem;