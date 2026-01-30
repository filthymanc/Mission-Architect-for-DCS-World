
# DCS Mission Architect - Project Development Plan

## OVERVIEW
**Current Version:** v2.2 Phase 10 (Pre-Flight)
**Status:** Active Development
**Focus:** Cleanup, Documentation, and Publication Readiness

We have entered the final hardening phase before public release on GitHub Pages. Phase 9 successfully validated the "Semantic Architect" core logic. Phase 10 is dedicated to polishing the repository, removing development artifacts, and finalizing the offline strategy.

---

## 🚧 PHASE 10: Pre-Flight & Publication - [ACTIVE]

*   **Goal:** Ensure the repository is clean, professional, and ready for public hosting on GitHub Pages.
*   **Audit & Cleanup:**
    *   Remove deprecated files (e.g., `catalogs.ts`, temporary provenance drafts).
    *   Consolidate internal analysis notes (`DML_PROVENANCE_ANALYSIS.md`, etc.) into a cohesive Developer Wiki or remove if no longer needed.
    *   Verify `manifest.json` and PWA settings for "Add to Homescreen" reliability.
*   **Documentation:**
    *   Update `README.md` with clear installation/hosting instructions for end-users.
    *   Verify `LICENSE` and `NOTICE.md` compliance.
*   **Offline Strategy (The Bundler Migration):**
    *   Prepare the codebase for migration from CDN imports (`esm.sh`) to a bundled build (Vite/Webpack). This is required to solve the Phase 9 offline failure.

---

## ✅ COMPLETED HISTORY

### PHASE 9: The Semantic Architect (Complete - v2.1)
*   **Semantic Compression**: Implemented client-side Lua Parser to strip implementation logic from MOOSE files, reducing token usage by ~85%.
*   **SSE Hard-Deck**: Created `data/sse-definitions.ts` to prevent hallucinations of standard DCS functions.
*   **Field Tested**: Validated on Android/Vivaldi. Core logic passed; Offline PWA identified as the next major target.

### PHASE 8: The Code-First Librarian (Complete - v2.0)
*   **Dynamic Discovery**: Implemented GitHub Tree API to map repositories.
*   **Raw Ingestion**: Switched from HTML parsing to `raw.githubusercontent` fetching.
*   **Governance**: Enforced "Law of Provenance".

### PHASE 7: Framework Currency (Complete - v1.9)
*   **The Librarian**: Transitioned from static knowledge to tool-based retrieval.
*   **Copyright Remediation**: Removed all hardcoded manual text.

### PHASE 6: Stable Hardening (Complete - v1.8)
*   **Accessibility**: Full keyboard navigation audit and ARIA labeling.
*   **Visual Fidelity**: Refined inline code sizes and mobile safe-area compliance.

### PHASE 5: Architecture Professionalization (Complete)
*   **Decoupling**: Extracted logic into modular hooks.
*   **Performance**: Implemented Lazy Loading.

### PHASE 4: Resilience & Portability (Complete)
*   **Offline**: PWA support with Service Worker.
*   **Backup**: JSON-based Import/Export.

### PHASES 1 - 3: Foundation (Complete)
*   Established **The 6 Immutable Laws**.
*   Integrated dual-model support and Environment Safety Toggles.
