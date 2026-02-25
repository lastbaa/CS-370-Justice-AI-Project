import { useState } from 'react'
import { OllamaStatus } from '../../../../../shared/src/types'

interface Props {
  ollamaStatus: OllamaStatus | null
  onRetry: () => Promise<void>
  onComplete: () => void
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }): JSX.Element {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${ok ? 'text-[#3fb950]' : 'text-[#8b949e]'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-[#3fb950]' : 'bg-[#1e1e1e]'}`} />
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
    <div className="relative flex items-center justify-between rounded-lg bg-[#080808] border border-[#1e1e1e] px-4 py-3 font-mono text-sm text-[#ffffff] group">
      <span className="text-[#79c0ff]">{children}</span>
      <button
        onClick={copy}
        className="ml-4 text-xs text-[#8b949e] hover:text-[#c9a84c] transition-colors no-drag opacity-0 group-hover:opacity-100"
      >
        {copied ? '✓ Copied' : 'Copy'}
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

  const llmModel = ollamaStatus?.llmModelName ?? 'llama3.2'
  const embedModel = ollamaStatus?.embedModelName ?? 'nomic-embed-text'

  async function handleRetry(): Promise<void> {
    setRetrying(true)
    try {
      await onRetry()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#080808] px-8 overflow-auto">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1e1e1e] bg-[#0d0d0d]">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="6" r="3" fill="#c9a84c" />
            <rect x="23" y="6" width="2" height="28" fill="#c9a84c" />
            <rect x="6" y="8" width="36" height="2" rx="1" fill="#c9a84c" />
            <ellipse cx="12" cy="22" rx="8" ry="4" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="4" y1="22" x2="20" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="8" y1="9" x2="4" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="16" y1="9" x2="20" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
            <ellipse cx="36" cy="22" rx="8" ry="4" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="28" y1="22" x2="44" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="32" y1="9" x2="28" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
            <line x1="40" y1="9" x2="44" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
            <rect x="18" y="36" width="12" height="2" rx="1" fill="#c9a84c" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Justice AI</h1>
          <p className="text-sm text-[#8b949e] mt-1">Private Legal Research · Local Model Required</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-[#1e1e1e] bg-[#0d0d0d] overflow-hidden shadow-2xl">

        {/* Status bar at top */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#1e1e1e] bg-[#080808]">
          <StatusBadge ok={isRunning} label={isRunning ? 'Ollama running' : 'Ollama not detected'} />
          <StatusBadge ok={hasLlm} label={hasLlm ? `${llmModel} ready` : `${llmModel} missing`} />
          <StatusBadge ok={hasEmbed} label={hasEmbed ? 'Embed model ready' : 'Embed model missing'} />
        </div>

        <div className="p-7">
          <h2 className="text-base font-semibold text-[#ffffff] mb-1">Set up your local model</h2>
          <p className="text-sm text-[#8b949e] mb-7 leading-relaxed">
            Justice AI runs entirely on your machine — no data leaves your device. You need Ollama and two models to get started.
          </p>

          <div className="flex flex-col gap-5">
            {/* Step 1 */}
            <div className={`rounded-xl border p-4 transition-colors ${isRunning ? 'border-[#3fb950]/20 bg-[#3fb950]/5' : 'border-[#1e1e1e] bg-[#141414]'}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${isRunning ? 'bg-[#3fb950] text-[#080808]' : 'bg-[#1e1e1e] text-[#8b949e]'}`}>
                  {isRunning ? '✓' : '1'}
                </span>
                <span className="text-sm font-medium text-[#ffffff]">Install &amp; start Ollama</span>
              </div>
              <p className="ml-8 text-xs text-[#8b949e] leading-relaxed">
                Download from <span className="text-[#c9a84c]">ollama.ai</span> and run it. It will appear in your menu bar.
              </p>
            </div>

            {/* Step 2 */}
            <div className={`rounded-xl border p-4 transition-colors ${hasLlm ? 'border-[#3fb950]/20 bg-[#3fb950]/5' : 'border-[#1e1e1e] bg-[#141414]'}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${hasLlm ? 'bg-[#3fb950] text-[#080808]' : 'bg-[#1e1e1e] text-[#8b949e]'}`}>
                  {hasLlm ? '✓' : '2'}
                </span>
                <span className="text-sm font-medium text-[#ffffff]">Pull language model</span>
                <span className="ml-auto text-[10px] text-[#8b949e]">~2 GB</span>
              </div>
              <div className="ml-8">
                <CodeBlock>ollama pull {llmModel}</CodeBlock>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`rounded-xl border p-4 transition-colors ${hasEmbed ? 'border-[#3fb950]/20 bg-[#3fb950]/5' : 'border-[#1e1e1e] bg-[#141414]'}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${hasEmbed ? 'bg-[#3fb950] text-[#080808]' : 'bg-[#1e1e1e] text-[#8b949e]'}`}>
                  {hasEmbed ? '✓' : '3'}
                </span>
                <span className="text-sm font-medium text-[#ffffff]">Pull embedding model</span>
                <span className="ml-auto text-[10px] text-[#8b949e]">~274 MB</span>
              </div>
              <div className="ml-8">
                <CodeBlock>ollama pull {embedModel}</CodeBlock>
              </div>
            </div>
          </div>

          {allGood && (
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#3fb950]/10 border border-[#3fb950]/20 px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="#3fb950">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
              </svg>
              <span className="text-xs text-[#3fb950] font-medium">All systems ready — you can open Justice AI</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="no-drag flex-1 rounded-xl border border-[#1e1e1e] bg-[#141414] px-4 py-2.5 text-sm font-medium text-[#8b949e] hover:text-[#ffffff] hover:border-[#8b949e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {retrying ? 'Checking…' : 'Check Again'}
            </button>
            <button
              onClick={onComplete}
              className="no-drag flex-1 rounded-xl bg-[#c9a84c] px-4 py-2.5 text-sm font-semibold text-[#080808] hover:bg-[#e8c97e] transition-colors"
            >
              {allGood ? 'Open Justice AI' : 'Continue Anyway'}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-[#8b949e] max-w-sm leading-relaxed">
        All processing is local. No API keys, no subscriptions, no data sent anywhere.
      </p>
    </div>
  )
}
