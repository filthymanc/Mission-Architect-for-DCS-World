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

import { parseLuaSource } from './luaParserService';

// Service to fetch raw Lua source code via GitHub API
// Implements "Code-First Librarian" & "Semantic Architect" protocols (v2.3)

interface GitHubFile {
    path: string;
    mode: string;
    type: "blob" | "tree";
    sha: string;
    size?: number;
    url: string;
}

interface RepoConfig {
    owner: string;
    repo: string;
    branch: string;
}

const REPOS: Record<string, Record<string, RepoConfig>> = {
    'MOOSE': {
        'STABLE': { owner: 'FlightControl-Master', repo: 'MOOSE', branch: 'master' },
        'DEVELOP': { owner: 'FlightControl-Master', repo: 'MOOSE', branch: 'develop' }
    },
    'DML': {
        'MAIN': { owner: 'csofranz', repo: 'DML', branch: 'main' } // DML uses 'main' typically
    }
};

const CACHE_PREFIX = 'mission-architect-tree-';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 Hours

/**
 * Fetches the recursive file tree from GitHub API.
 * Uses localStorage to cache the tree and avoid Rate Limits (60 req/hr).
 */
const fetchRepoTree = async (config: RepoConfig): Promise<GitHubFile[]> => {
    const cacheKey = `${CACHE_PREFIX}${config.owner}-${config.repo}-${config.branch}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < CACHE_TTL) {
                console.log(`[Librarian] Loaded ${config.repo} tree from cache.`);
                return parsed.tree;
            }
        } catch (e) {
            console.warn("Invalid cache, clearing...");
            localStorage.removeItem(cacheKey);
        }
    }

    console.log(`[Librarian] Fetching fresh tree for ${config.repo}/${config.branch}...`);
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/git/trees/${config.branch}?recursive=1`;
    
    const response = await fetch(url);
    
    if (response.status === 403 || response.status === 429) {
        throw new Error("GitHub API Rate Limit Exceeded. Please wait an hour or try again later.");
    }
    
    if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.truncated) {
        console.warn("[Librarian] Warning: Repository tree is truncated by GitHub (too large).");
    }

    // Cache the result
    try {
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            tree: data.tree
        }));
    } catch (e) {
        console.warn("Failed to cache tree (Storage Quota).");
    }

    return data.tree;
};

/**
 * Fuzzy searches the file tree for a matching Lua file.
 */
const findFileInTree = (tree: GitHubFile[], query: string): GitHubFile | null => {
    const cleanQuery = query.toLowerCase().trim().replace(/\.lua$/, '');
    
    // 1. Exact Name Match (e.g. "Airboss.lua")
    const exactMatch = tree.find(f => {
        const fileName = f.path.split('/').pop()?.toLowerCase() || '';
        return fileName === `${cleanQuery}.lua` || fileName === cleanQuery;
    });
    if (exactMatch) return exactMatch;

    // 2. Path Suffix Match (e.g. "Ops/Airboss.lua" matches "Airboss")
    const suffixMatch = tree.find(f => f.path.toLowerCase().endsWith(`/${cleanQuery}.lua`));
    if (suffixMatch) return suffixMatch;

    // 3. Loose Fuzzy Match (Path contains query) - Riskier
    const fuzzyMatch = tree.find(f => 
        f.type === 'blob' && 
        f.path.endsWith('.lua') && 
        f.path.toLowerCase().includes(cleanQuery)
    );
    
    return fuzzyMatch || null;
};

/**
 * Main Tool Function
 */
export const getFrameworkDocs = async (framework: string, moduleName: string, branch: string = 'DEVELOP'): Promise<string> => {
    try {
        // 1. Determine Repository Config
        const fwKey = framework.toUpperCase();
        let branchKey = branch.toUpperCase();
        
        // Map 'DML' requests to its single config if needed
        if (fwKey === 'DML') branchKey = 'MAIN';

        const config = REPOS[fwKey]?.[branchKey];
        if (!config) {
            return `ERROR: Invalid Framework/Branch configuration: ${framework} [${branch}]`;
        }

        // 2. Fetch/Load File Tree
        let tree: GitHubFile[];
        try {
            tree = await fetchRepoTree(config);
        } catch (e: any) {
            return `ERROR: ${e.message}`;
        }

        // 3. Find File
        const file = findFileInTree(tree, moduleName);
        if (!file) {
            // Generate suggestions from tree
            const suggestions = tree
                .filter(f => f.path.includes(moduleName.slice(0, 3)) && f.path.endsWith('.lua'))
                .slice(0, 5)
                .map(f => f.path);
            return `ERROR: Module '${moduleName}' not found in ${config.repo}. Did you mean: ${suggestions.join(', ')}?`;
        }

        // 4. Fetch Raw Content
        const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${file.path}`;
        console.log(`[Librarian] Fetching Raw Source: ${rawUrl}`);
        
        const response = await fetch(rawUrl);
        if (!response.ok) {
            return `ERROR: Failed to download source file: ${rawUrl}`;
        }

        let content = await response.text();
        const fileSize = content.length;

        // 5. Semantic Compression (Phase 9 -> v2.3 Optimized)
        // If file is > 10KB and is a Lua file, run the compressor.
        // We set a lower threshold than the 150k hard limit because we WANT to save tokens regardless.
        const COMPRESSION_THRESHOLD = 10000; 

        if (file.path.endsWith('.lua') && fileSize > COMPRESSION_THRESHOLD) {
             console.log(`[Librarian] Compressing ${file.path} (${fileSize} bytes)...`);
             content = parseLuaSource(content);
        } else {
             console.log(`[Librarian] Skipping compression for ${file.path} (Size: ${fileSize})`);
        }

        const metadata = `[Librarian Source Metadata]
Repo: ${config.owner}/${config.repo}
Branch: ${config.branch}
File: ${file.path}
Original Size: ${fileSize} bytes
Raw URL: ${rawUrl}
--------------------------------------------------
`;

        return metadata + content;

    } catch (error: any) {
        return `ERROR: Librarian System Exception: ${error.message}`;
    }
};