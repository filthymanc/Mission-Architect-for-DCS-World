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

/**
 * Lua Parser Service
 *
 * Analyzes raw Lua source code and "compresses" it for AI consumption.
 * - Retains: Documentation (LDoc), Class Definitions, Function Signatures.
 * - Strips: Function Implementation Bodies.
 * - Goal: Reduce token usage by >80%.
 */

export const parseLuaSource = (raw: string): string => {
  if (!raw) return "";

  const lines = raw.split("\n");
  const output: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. HEADER & DOCUMENTATION PRESERVATION
    // Keep lines that look like documentation
    if (trimmed.startsWith("---") || trimmed.startsWith("--")) {
      // Check if it's a "separator" line (e.g., -----------------) -> Skip to save tokens?
      // Actually, separators often denote sections. Let's keep them but maybe compact them?
      if (trimmed.match(/^-{10,}$/)) {
        // It's just a separator line. Skip it to save tokens.
        continue;
      }
      output.push(line);
      continue;
    }

    // 2. CLASS DEFINITIONS
    // Matches: Class = BASE:Inherit(...) or Class = {}
    if (/^[A-Z_0-9]+\s*=\s*[A-Z_0-9.:]+/.test(trimmed)) {
      output.push(line);
      continue;
    }

    // 3. FUNCTION SIGNATURES
    // Matches: function Class:Method(args)
    if (trimmed.startsWith("function")) {
      // Check for one-liners
      if (trimmed.endsWith("end")) {
        output.push(line);
      } else {
        // It's a multi-line function. We want the signature, but not the body.
        // We append a comment indicating hidden logic.
        output.push(`${line} -- [Implementation Hidden by Semantic Architect]`);
        output.push("end"); // Close the block immediately
      }
      continue;
    }

    // 4. PRESERVE SPECIFIC KEYWORDS (Safety Check)
    // Sometimes critical enums are defined at the top level
    if (trimmed.startsWith("local") || /^[A-Z_]+\s*=/.test(trimmed)) {
      // Heuristic: If it's short, keep it.
      if (trimmed.length < 100) {
        output.push(line);
      }
      continue;
    }
  }

  // Post-Processing: Join and Add Metadata
  const compressed = output.join("\n");
  const ratio = ((1 - compressed.length / raw.length) * 100).toFixed(1);

  return `--- [SEMANTIC COMPRESSION ACTIVE]
--- Original Size: ${raw.length} chars
--- Compressed Size: ${compressed.length} chars
--- Compression Ratio: ${ratio}%
--- NOTE: Implementation logic has been stripped. Function signatures are accurate.
--------------------------------------------------------------------------------

${compressed}`;
};
