# Getting Started Again

If you want to revisit this project, here's what you need to know.

## What was deleted

The app data directory at `~/Library/Application Support/com.justiceai.app/` was removed. This contained:

- **Qwen3-8B GGUF model** (~4.7 GB) — the local LLM
- **fastembed BGE-small-en-v1.5** (~33 MB) — the embedding model (ONNX)
- **OCR models** (~10 MB) — text detection/recognition for image parsing
- **chunks.json** — embedded document chunks (vector store)
- **sessions.json** — chat history
- **settings.json, cases.json, file_registry.json** — user settings and file metadata

## How to restore everything

### Prerequisites

- Node.js 20+
- Rust toolchain (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- Tauri prerequisites: https://v2.tauri.app/start/prerequisites/

### Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app in dev mode:
   ```bash
   npm run app
   ```

3. On first launch, the **ModelSetup** screen will appear and automatically download:
   - Qwen3-8B Q4_K_M GGUF (~5 GB) from HuggingFace
   - fastembed BGE-small-en-v1.5 (~33 MB)
   - OCR detection + recognition models (~10 MB)

4. Once models download, you're back to a working app. Load documents and query.

### Build for production

```bash
npm run build:app
```

This produces a `.dmg` installer in `app/src-tauri/target/release/bundle/`.

## Architecture reminder

- All processing is local — no API keys, no cloud services
- Rust backend (`app/src-tauri/src/`) handles RAG pipeline, LLM inference, document parsing
- React frontend (`app/src/renderer/src/`) is the UI
- Shared types in `shared/src/types.ts`
- Eval harness: `cd app/src-tauri && cargo run --bin harness`
