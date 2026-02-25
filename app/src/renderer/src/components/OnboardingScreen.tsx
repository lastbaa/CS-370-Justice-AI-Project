import { useState } from 'react'
import { OllamaStatus } from '../../../../../shared/src/types'

interface Props {
  ollamaStatus: OllamaStatus | null
  onRetry: () => Promise<void>
  onComplete: () => void
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }): JSX.Element {
  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${ok ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
      {ok ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
        </svg>
      )}
      {label}
    </div>
  )
}

function CodeBlock({ children }: { children: string }): JSX.Element {
  const [copied, setCopied] = useState(false)
  const copy = (): void => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="relative flex items-center justify-between rounded-md bg-[#0d1117] border border-[#30363d] px-4 py-3 font-mono text-sm text-[#e6edf3]">
      <span>{children}</span>
      <button
        onClick={copy}
        className="ml-4 text-xs text-[#8b949e] hover:text-[#c9a84c] transition-colors no-drag"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

export default function OnboardingScreen({ ollamaStatus, onRetry, onComplete }: Props): JSX.Element {
  const [retrying, setRetrying] = useState(false)

  const isRunning = ollamaStatus?.running ?? false
  const hasLlm = ollamaStatus?.hasLlmModel ?? false
  const hasEmbed = ollamaStatus?.hasEmbedModel ?? false
  const allGood = isRunning && hasLlm && hasEmbed

  async function handleRetry(): Promise<void> {
    setRetrying(true)
    try {
      await onRetry()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0d1117] px-8 overflow-auto">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          {/* Scales of justice SVG */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="6" r="3" fill="#c9a84c" />
            <rect x="23" y="6" width="2" height="30" fill="#c9a84c" />
            <rect x="6" y="8" width="36" height="2" rx="1" fill="#c9a84c" />
            <line x1="8" y1="9" x2="16" y2="9" stroke="#c9a84c" strokeWidth="1.5" />
            <ellipse cx="12" cy="22" rx="8" ry="4" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="4" y1="22" x2="20" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="8" y1="9" x2="4" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="16" y1="9" x2="20" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="32" y1="9" x2="40" y2="9" stroke="#c9a84c" strokeWidth="1.5" />
            <ellipse cx="36" cy="22" rx="8" ry="4" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="28" y1="22" x2="44" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="32" y1="9" x2="28" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="40" y1="9" x2="44" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
            <rect x="18" y="36" width="12" height="2" rx="1" fill="#c9a84c" />
            <rect x="22" y="35" width="4" height="4" rx="1" fill="#c9a84c" />
          </svg>
          <h1 className="text-3xl font-bold text-[#c9a84c] tracking-tight">Justice AI</h1>
        </div>
        <p className="text-[#8b949e] text-sm">Private Legal Research Assistant</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg rounded-xl border border-[#30363d] bg-[#161b22] p-8 shadow-2xl">
        <h2 className="mb-2 text-xl font-semibold text-[#e6edf3]">Welcome to Justice AI</h2>
        <p className="mb-8 text-sm text-[#8b949e]">
          Before you begin, we need to set up your local AI model. All processing happens on your machine — no data ever leaves your device.
        </p>

        {/* Step 1 */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#21262d] text-xs font-bold text-[#c9a84c]">1</span>
              <h3 className="font-medium text-[#e6edf3]">Install Ollama</h3>
            </div>
            <StatusBadge ok={isRunning} label={isRunning ? 'Ollama running' : 'Not detected'} />
          </div>
          <p className="ml-8 text-sm text-[#8b949e]">
            Download and install Ollama from{' '}
            <span className="text-[#c9a84c]">ollama.ai</span>, then start it.
          </p>
        </div>

        {/* Step 2 */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#21262d] text-xs font-bold text-[#c9a84c]">2</span>
              <h3 className="font-medium text-[#e6edf3]">Pull the LLM model</h3>
            </div>
            <StatusBadge ok={hasLlm} label={hasLlm ? 'Model ready' : 'Not found'} />
          </div>
          <p className="ml-8 mb-2 text-sm text-[#8b949e]">Run this command in your terminal:</p>
          <div className="ml-8">
            <CodeBlock>ollama pull saul-7b</CodeBlock>
          </div>
        </div>

        {/* Step 3 */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#21262d] text-xs font-bold text-[#c9a84c]">3</span>
              <h3 className="font-medium text-[#e6edf3]">Pull the embedding model</h3>
            </div>
            <StatusBadge ok={hasEmbed} label={hasEmbed ? 'Model ready' : 'Not found'} />
          </div>
          <p className="ml-8 mb-2 text-sm text-[#8b949e]">Run this command:</p>
          <div className="ml-8">
            <CodeBlock>ollama pull nomic-embed-text</CodeBlock>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="no-drag flex-1 rounded-lg bg-[#c9a84c] px-4 py-2.5 text-sm font-semibold text-[#0d1117] hover:bg-[#e8c97e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {retrying ? 'Checking...' : 'Retry Check'}
          </button>
          <button
            onClick={onComplete}
            className="no-drag flex-1 rounded-lg border border-[#30363d] bg-transparent px-4 py-2.5 text-sm font-medium text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] transition-colors"
          >
            {allGood ? 'Continue' : 'Continue Anyway'}
          </button>
        </div>

        {allGood && (
          <p className="mt-4 text-center text-xs text-[#3fb950]">
            All systems ready. You can continue to the app.
          </p>
        )}
      </div>

      {/* Privacy note */}
      <p className="mt-6 text-center text-xs text-[#8b949e] max-w-md">
        Justice AI runs entirely on your local machine. No data is sent to external servers.
      </p>
    </div>
  )
}
