
# Mission Architect for DCS

![Version](https://img.shields.io/badge/version-2.4.6b-blue)
![Status](https://img.shields.io/badge/status-Live-emerald)
![Tech](https://img.shields.io/badge/Powered_by-Gemini_3.0-orange)
![License](https://img.shields.io/badge/license-GPLv3-blue)

**[🔴 LAUNCH LIVE APP](https://filthymanc.github.io/Mission-Architect-for-DCS-World/)**

The **Mission Architect** is an AI-powered Progressive Web App (PWA) designed to assist **DCS World** mission builders. It specializes in generating copyright-safe, error-checked scripts for **MOOSE**, **DML**, and the **Standard Scripting Engine (SSE)**.

## 🚀 Key Features

*   **The Semantic Architect (v2.1+)**: Analyze massive Lua files (like `Airboss.lua`) directly from GitHub without hitting token limits.
*   **The Librarian**: A built-in tool that searches the official MOOSE and DML repositories in real-time.
*   **Safety First**:
    *   **Hard Deck Protocols**: Prevents the AI from hallucinating functions that don't exist.
    *   **Sanitized Mode**: By default, the AI will not generate code that requires desanitizing your DCS install.
*   **Local & Private**: All your API keys and data are stored **locally** in your browser.
*   **Offline Capable (v2.2+)**: Installable as a native app on Windows, Android, and iOS via PWA technology.

## 💻 How to Run

### Option A: Use the Public Web App
Simply visit the [GitHub Pages Deployment](https://filthymanc.github.io/Mission-Architect-for-DCS-World/).
*   **Android/iOS**: Tap "Share" -> "Add to Home Screen" to install it as a full-screen app.
*   **PC**: Click the "Install" icon in the Chrome/Edge address bar.

### Option B: Developer Setup (Run Locally)
This project uses **Vite** for building. You need [Node.js](https://nodejs.org/) installed.

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173` in your browser.

## 🔑 Setup
1.  Get a **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Paste the key when prompted on the launch screen.

## ⚖️ The 6 Immutable Laws
The AI is governed by strict protocols to ensure code safety:
1.  **Law of Environment**: Assume a "Sanitized" DCS environment by default.
2.  **Law of Verification**: Verify method existence via the Librarian.
3.  **Law of Discovery**: Use dynamic tree search to find modules.
4.  **Law of Provenance**: Cite the source branch and version.
5.  **Law of Persistence**: Remind the user to `File > Save` in the Mission Editor.
6.  **Law of The ASCII Mandate**: Avoid UTF-8 symbols that break DCS serialization.

## ⚠️ Disclaimer
This tool is a community project and is not affiliated with Eagle Dynamics, FlightControl (MOOSE), or cfrag (DML).

## License
**Mission Architect for DCS** is open-source software licensed under the **GNU General Public License v3.0**.

You are free to use, modify, and distribute this software, but any modifications you distribute must also be open-source under the same license.
See the [LICENSE](LICENSE) file for details.