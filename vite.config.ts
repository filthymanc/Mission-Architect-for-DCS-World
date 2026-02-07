/*
 * DCS Mission Architect
 * Copyright (C) 2026 the filthymanc
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// Read package.json to get the version
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Set base to the specific repo name for GitHub Pages stability
  base: '/Mission-Architect-for-DCS-World/',
  define: {
    // Inject the version from package.json into the app using a global constant
    // This avoids "Cannot read properties of undefined (reading 'PACKAGE_VERSION')" errors
    // caused by import.meta.env sometimes being undefined in certain contexts.
    '__APP_VERSION__': JSON.stringify(packageJson.version),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
});