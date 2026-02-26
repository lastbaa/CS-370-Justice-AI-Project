# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Justice AI is a privacy-first legal research desktop app (Electron + React) that runs entirely locally. Documents are processed on-device using a local Ollama LLM — no data leaves the machine.

## Monorepo Structure

```
/
├── app/          # Electron + React desktop app (primary codebase)
├── website/      # Next.js marketing site
├── shared/       # Shared TypeScript types (IPC channels, DTOs, models)
└── package.json  # Workspace root
```

## Commands

All commands run from the **repo root** unless noted:

```bash
npm run app              # Start desktop app in dev mode (hot reload via electron-vite)
npm run website          # Start Next.js site at localhost:3000
npm run build:app        # Build app bundle
npm run build:website    # Build website for production
cd app && npm run package  # Create macOS .dmg → app/dist/
```

There are no lint or test commands configured.

## Prerequisites

Ollama must be running locally before the app is functional:
```bash
ollama pull saul-7b            # Default LLM
ollama pull nomic-embed-text   # Default embedding model
```

## Architecture: Desktop App (`app/`)

The app uses a standard Electron architecture with a strict main/renderer separation enforced by a context bridge preload.

### Main Process (`src/main/`)

All business logic lives here, exposed to the renderer only via IPC:

- **`index.ts`** — Window management, registers all `ipcMain` handlers, wires up services
- **`services/ragPipeline.ts`** — The core RAG pipeline: document chunking (500 tokens, 50 overlap), embedding generation, Vectra vector index management, and citation-grounded answer generation. Vector index stored at `userData/vector-index`.
- **`services/ollama.ts`** — HTTP client for Ollama at `http://localhost:11434`. Endpoints: `/api/embeddings` and `/api/generate`.
- **`services/docParser.ts`** — PDF (via `pdf-parse`) and DOCX (via `mammoth`) parsing with page-level text extraction.

Storage:
- **Settings** — `electron-store` (plain JSON)
- **Chat history** — `electron-store` with AES encryption (key: `'justice-ai-chat-v1-a8f3c2e9b4d7f1a6'`)

### Preload (`src/preload/index.ts`)

Exposes `window.api` to the renderer via `contextBridge`. All IPC channel names are defined in `shared/src/types.ts`.

### Renderer (`src/renderer/src/`)

React app. State management lives in `App.tsx` (messages, files, sessions, settings). Key components:

- **`ChatInterface.tsx`** — Main chat UI. **Note:** currently contains a hardcoded mock response with a 4.2s delay for product demo purposes — real RAG query integration is incomplete.
- **`Sidebar.tsx`** — Session list + file management
- **`Settings.tsx`** — Configures Ollama URL, model names, chunk size, topK

## Shared Types (`shared/src/types.ts`)

All IPC channel names, request/response DTOs, and domain models (`ParsedDocument`, `DocumentChunk`, `ChatMessage`, `AppSettings`, etc.) are defined here. **Always update this file when adding new IPC channels.**

Default settings: `llmModel: 'saul-7b'`, `embedModel: 'nomic-embed-text'`, `chunkSize: 500`, `chunkOverlap: 50`, `topK: 5`.

## Styling

Tailwind CSS with a Navy (`#0d1117`) + Gold (`#c9a84c`) color scheme. Both `app/` and `website/` have their own `tailwind.config.ts`.

## Key Technical Notes

- **No cloud calls** — All processing is localhost Ollama; don't introduce external API calls without explicit user confirmation.
- **Electron security** — `contextBridge` is the only way to communicate between main and renderer. Never add `nodeIntegration: true`.
- **TypeScript** — The app uses project references: `tsconfig.node.json` for main/preload, `tsconfig.web.json` for renderer.
- **Path alias** — `@renderer` resolves to `src/renderer/src` (configured in `electron.vite.config.ts`).
