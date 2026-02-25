# Justice AI

**Secure legal research for legal professionals. Runs entirely on your machine.**

---

## Purpose

Enterprise tools like ChatGPT cannot guarantee confidentiality. When sensitive case files, client communications, or privileged materials are sent to a third-party server, attorney-client privilege is put at risk. Justice AI eliminates this problem entirely by running a local LLM on the user's machine — no data ever leaves their control.

Justice AI is an **enhancement tool for legal professionals**. It searches through your case files so you can focus on analysis and strategy. It does not replace legal judgment.

> **Important:** Justice AI does not provide legal advice. Its output does not constitute legal conclusions. A computer cannot be held accountable for legal decisions. The attorney using this tool is responsible for all legal analysis and advice given to their clients.

---

## Key Objectives

- **Privacy** — No data leaves the machine. No cloud upload, no telemetry, no external API calls.
- **Accuracy** — Every answer is grounded strictly in the documents you load. If the answer is not in the files, Justice AI says so.
- **Efficiency** — Let AI do the document searching. Legal professionals focus on the thinking.
- **Flexibility** — Load any set of documents for any legal specialty. Immigration files, contracts, case law, deposition transcripts — the tool adapts to what you provide.
- **Sustainability** — Running a small local model instead of hitting a massive data center dramatically reduces energy usage. Responsible AI starts with the hardware choices we make.

---

## Project Structure

```
/
├── website/      # Next.js marketing site
├── app/          # Electron + React desktop app
└── shared/       # Shared TypeScript types
```

---

## Desktop App Setup

### Prerequisites

1. **Ollama** — Install from [ollama.ai](https://ollama.ai)
2. **Pull the LLM model:**
   ```bash
   ollama pull saul-7b
   ```
3. **Pull the embedding model:**
   ```bash
   ollama pull nomic-embed-text
   ```

### Run in development

```bash
# From the repo root
npm install
npm run app
```

### Build for distribution

```bash
cd app
npm run package
# Output: app/dist/Justice AI.dmg
```

### System Requirements

| Requirement | Minimum |
|---|---|
| Mac chip | Apple Silicon (M1/M2/M3) or Intel |
| macOS | 12 Monterey or later |
| RAM | 8 GB (16 GB recommended) |
| Free storage | ~8 GB (for model weights) |

---

## Website Setup

```bash
cd website
npm install
npm run dev       # Development at http://localhost:3000
npm run build     # Production build
```

---

## How It Works

1. **Load documents** — Drop in a folder of PDFs and DOCX files. All parsing happens locally.
2. **Chunking & embedding** — Documents are split into ~500-token chunks and embedded using `nomic-embed-text` via Ollama. Embeddings are stored in a local vector index (Vectra).
3. **Query** — Your question is embedded and matched against the vector index. The top-K most relevant chunks are retrieved.
4. **Answer** — The retrieved chunks and your question are passed to `saul-7b` with a strict system prompt that enforces citation-only answers and prohibits hallucination.
5. **Citations** — Every answer includes the filename, page number, and a direct quoted excerpt from the source document.

---

## Privacy Guarantee

- No network requests are made except to `localhost:11434` (your local Ollama instance)
- No telemetry, no analytics, no crash reporting
- Chat history is stored locally and encrypted on disk
- The app works fully offline after the initial model download

---

## License

MIT
