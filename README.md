# Mission Architect for DCS

![Version](https://img.shields.io/badge/version-2.5.0-blue)
![Status](https://img.shields.io/badge/status-Live-emerald)
![Tech](https://img.shields.io/badge/Powered_by-Gemini_Pro-orange)
![License](https://img.shields.io/badge/license-GPLv3-blue)

**[🔴 LAUNCH LIVE APP](https://filthymanc.github.io/Mission-Architect-for-DCS-World/)**

The **Mission Architect** is an AI-powered Progressive Web App (PWA) designed to assist **DCS World** mission builders. It specializes in generating copyright-safe, error-checked scripts for **MOOSE**, **DML**, and the **Standard Scripting Engine (SSE)**.

## 🚀 Key Features

- **The Semantic Architect**: Analyze massive Lua files directly from GitHub without hitting token limits.
- **The Librarian**: A built-in tool that searches the official MOOSE and DML repositories in real-time.
- **Safety First**:
  - **Hard Deck Protocols**: Prevents the AI from hallucinating functions that don't exist.
  - **Sanitized Mode**: By default, the AI will not generate code that requires desanitizing your DCS install.
- **Local & Private**: All your API keys and data are stored **locally** in your browser.
- **Offline Capable**: Installable as a native app on Windows, Android, and iOS via PWA technology.

## 💻 Developer Setup

This project uses a standard **Vite + React + TypeScript** architecture.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/filthymanc/Mission-Architect-for-DCS-World.git

# Navigate to the folder
cd Mission-Architect-for-DCS-World

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server
npm run dev
```

The app will launch at `http://localhost:3000` (or similar).

### Building for Production

```bash
# Create a production build
npm run build
```

The output will be in the `dist/` folder.

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
