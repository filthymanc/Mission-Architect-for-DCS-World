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

export const APP_NAME = "Mission Architect for DCS World";

// Use the global constant injected by Vite (Source of Truth: package.json)
export const APP_VERSION = __APP_VERSION__;

export const APP_FULL_NAME = `${APP_NAME} v${APP_VERSION}`;
export const AUTHOR_CREDIT = "Developed by the filthymanc";

// Storage Keys
// Changing this tag will segregate data from previous versions (unless migration logic is in place)
export const STORAGE_VERSION_TAG = `v${APP_VERSION}`;
