import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { ChatMessage } from '../../../../../shared/src/types'
import MessageBubble from './MessageBubble'

interface Props {
  messages: ChatMessage[]
  isQuerying: boolean
  hasFiles: boolean
  onQuery: (question: string) => void
}

const EXAMPLE_QUESTIONS = [
  'What are the termination clauses in this contract?',
  'Find all references to indemnification',
  'Summarize the key obligations of each party',
  'What are the payment terms?',
]

function TypingIndicator(): JSX.Element {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/40">
        <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
          <rect x="23" y="6" width="2" height="30" fill="#c9a84c" />
          <rect x="6" y="8" width="36" height="2" rx="1" fill="#c9a84c" />
          <ellipse cx="12" cy="22" rx="7" ry="3.5" fill="none" stroke="#c9a84c" strokeWidth="2" />
          <ellipse cx="36" cy="22" rx="7" ry="3.5" fill="none" stroke="#c9a84c" strokeWidth="2" />
          <line x1="5" y1="22" x2="19" y2="22" stroke="#c9a84c" strokeWidth="2" />
          <line x1="29" y1="22" x2="43" y2="22" stroke="#c9a84c" strokeWidth="2" />
        </svg>
      </div>
      <div className="rounded-xl rounded-tl-sm bg-[#21262d] border border-[#30363d] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#8b949e] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 rounded-full bg-[#8b949e] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 rounded-full bg-[#8b949e] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="mt-1 text-xs text-[#8b949e]">Searching documents...</p>
      </div>
    </div>
  )
}

export default function ChatInterface({ messages, isQuerying, hasFiles, onQuery }: Props): JSX.Element {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isQuerying])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const maxHeight = 5 * 24 // ~5 lines
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
  }, [input])

  function handleSend(): void {
    const trimmed = input.trim()
    if (!trimmed || isQuerying || !hasFiles) return
    setInput('')
    onQuery(trimmed)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-1 flex-col h-screen overflow-hidden bg-[#0d1117]">
      {/* Title bar */}
      <div className="drag-region flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-6 py-3">
        <div className="no-drag flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[#e6edf3]">Legal Research Assistant</h2>
          {messages.length > 0 && (
            <span className="rounded-full bg-[#21262d] border border-[#30363d] px-2 py-0.5 text-[10px] font-medium text-[#8b949e]">
              {messages.filter((m) => m.role === 'user').length} {messages.filter((m) => m.role === 'user').length === 1 ? 'query' : 'queries'}
            </span>
          )}
        </div>
        {!hasFiles && (
          <div className="no-drag flex items-center gap-1.5 text-xs text-amber-400">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.22 1.754a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575zM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-.25-5.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0z" />
            </svg>
            Load documents to begin
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            {/* Empty state */}
            <div className="mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#30363d] bg-[#161b22]">
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="6" r="3" fill="#c9a84c" />
                  <rect x="23" y="6" width="2" height="30" fill="#c9a84c" />
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
              <h3 className="text-lg font-semibold text-[#e6edf3]">Ask a question about your documents</h3>
              <p className="mt-1 text-sm text-[#8b949e]">
                Justice AI searches only your loaded documents — no external data.
              </p>
            </div>

            {hasFiles ? (
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q)
                      textareaRef.current?.focus()
                    }}
                    className="rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-xs text-[#8b949e] hover:border-[#c9a84c]/50 hover:text-[#e6edf3] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8.22 1.754a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575zM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-.25-5.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0z" />
                </svg>
                Load documents in the sidebar to start asking questions.
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isQuerying && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-[#30363d] bg-[#161b22] px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div
            className={`flex items-end gap-3 rounded-xl border bg-[#21262d] px-4 py-3 transition-colors ${
              hasFiles
                ? 'border-[#30363d] focus-within:border-[#c9a84c]/60'
                : 'border-[#30363d] opacity-60'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!hasFiles || isQuerying}
              placeholder={
                hasFiles
                  ? 'Ask a question about your documents...'
                  : 'Load documents first to ask questions'
              }
              rows={1}
              className="flex-1 bg-transparent text-sm text-[#e6edf3] placeholder-[#8b949e] outline-none disabled:cursor-not-allowed leading-6"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />
            <button
              onClick={handleSend}
              disabled={!hasFiles || isQuerying || !input.trim()}
              className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a84c] text-[#0d1117] hover:bg-[#e8c97e] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Send"
            >
              {isQuerying ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.989 8 .064 2.68a1.342 1.342 0 0 1 1.85-1.462l13.402 5.744a1.13 1.13 0 0 1 0 2.076L1.913 14.782a1.342 1.342 0 0 1-1.85-1.463L.99 8zm.603-5.135.024.12L2.15 7.25h6.848a.75.75 0 0 1 0 1.5H2.15l-.534 4.265-.024.12 13.016-5.577z" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-[#8b949e]">
            Enter to send · Shift+Enter for new line · Answers sourced strictly from your documents
          </p>
        </div>
      </div>
    </div>
  )
}
