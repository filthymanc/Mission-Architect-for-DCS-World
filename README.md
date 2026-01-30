
# Mission Architect for DCS

![Version](https://img.shields.io/badge/version-2.2-blue)
![Status](https://img.shields.io/badge/status-Stable-green)
![Tech](https://img.shields.io/badge/Powered_by-Gemini_3.0-orange)
![License](https://img.shields.io/badge/license-MIT-purple)

The **Mission Architect** is an AI-powered Progressive Web App (PWA) designed to assist **DCS World** mission builders. It specializes in generating copyright-safe, error-checked scripts for **MOOSE**, **DML**, and the **Standard Scripting Engine (SSE)**.

## 🚀 Key Features

*   **The Semantic Architect (v2.1+)**: Analyze massive Lua files (like `Airboss.lua`) directly from GitHub without hitting token limits. The app "compresses" the source code client-side, stripping implementation logic while keeping the API definitions intact.
*   **The Librarian**: A built-in tool that searches the official MOOSE and DML repositories in real-time to find the exact documentation you need.
*   **Safety First**:
    *   **Hard Deck Protocols**: Prevents the AI from hallucinating functions that don't exist in the DCS environment.
    *   **Sanitized Mode**: By default, the AI will not generate code that requires desanitizing your DCS install (no `os` or `io` libraries).
*   **Local & Private**: All your API keys, mission scripts, and chat history are stored **locally** on your device. Nothing is sent to our servers.

## 💻 How to Run (No Installation Required)

This is a modern **Serverless React App** using ES Modules. You do not need `npm`, `node_modules`, or a build step to run it locally.

### Option 1: GitHub Pages (Recommended)
Simply visit the hosted URL (if you have deployed it).

### Option 2: Run Locally
1.  Download this repository.
2.  You need a basic HTTP Server (browsers block scripts running from `file://` for security).
3.  **Using Python (Pre-installed on most systems):**
    ```bash
    python3 -m http.server 8000
    ```
4.  Open `http://localhost:8000` in your browser.

### Option 3: Install as App (PWA)
1.  Open the site in Chrome, Edge, or Vivaldi.
2.  Click the "Install App" icon in the address bar (or "Add to Home Screen" on Mobile).
3.  The Mission Architect will run as a native-like standalone application.

## 🔑 Setup
1.  Get a **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Paste the key when prompted on the launch screen.
3.  **Note:** The "Pro" model requires a paid tier key for high-volume usage, but the "Flash" model is free for most use cases.

## ⚖️ The 6 Immutable Laws
The AI is governed by strict protocols to ensure code safety:
1.  **Law of Environment**: Assume a "Sanitized" DCS environment by default.
2.  **Law of Verification**: Verify method existence via the Librarian. No guessing.
3.  **Law of Discovery**: Use dynamic tree search to find modules.
4.  **Law of Provenance**: Cite the source branch and version of any analyzed code.
5.  **Law of Persistence**: Remind the user to `File > Save` in the Mission Editor.
6.  **Law of The ASCII Mandate**: Avoid UTF-8 symbols that break DCS serialization.

## ⚠️ Disclaimer
This tool is a community project and is not affiliated with Eagle Dynamics, FlightControl (MOOSE), or cfrag (DML). Use generated scripts at your own risk and always backup your `.miz` files.

## License
MIT License. Free to use and modify for the DCS Community.
    