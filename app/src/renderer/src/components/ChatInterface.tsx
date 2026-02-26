import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { ChatMessage, FileInfo } from '../../../../../shared/src/types'
import MessageBubble from './MessageBubble'

interface Props {
  messages: ChatMessage[]
  isQuerying: boolean
  files: FileInfo[]
  isLoading: boolean
  loadError: string | null
  onQuery: (question: string) => void
  onNewChat: () => void
  onAddFiles: () => void
  onAddFolder: () => void
  onRemoveFile: (id: string) => void
  onLoadPaths: (paths: string[]) => void
}

// ── Mini animated demo ──────────────────────────────────────────────────────
const DEMO_Q = 'What are the termination conditions in the Hendricks agreement?'
const DEMO_A =
  'Based on Section 14.2 (Page 7), either party may terminate upon thirty (30) days\' written notice. Termination for material breach requires no notice if the breaching party fails to cure within 15 business days of written notification.'

function MiniDemo(): JSX.Element {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0)
  const [answerText, setAnswerText] = useState('')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700)
    const t2 = setTimeout(() => setPhase(2), 1600)
    const t3 = setTimeout(() => {
      setPhase(3)
      let i = 0
      const interval = setInterval(() => {
        i += 4
        setAnswerText(DEMO_A.slice(0, i))
        if (i >= DEMO_A.length) {
          setAnswerText(DEMO_A)
          clearInterval(interval)
        }
      }, 20)
      return () => clearInterval(interval)
    }, 2900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div
      className="w-full rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#070707' }}
    >
      {/* Fake title bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#060606' }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>
        <span className="ml-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Justice AI · 3 documents
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3" style={{ minHeight: 160 }}>
        {phase >= 1 && (
          <div
            className="self-end max-w-xs rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-[11px] leading-relaxed"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
              animation: 'fadeUp 0.35s ease both',
            }}
          >
            {DEMO_Q}
          </div>
        )}

        {phase >= 2 && (
          <div
            className="self-start max-w-sm rounded-2xl rounded-tl-sm px-4 py-3"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              animation: 'fadeUp 0.35s ease both',
            }}
          >
            <div
              className="flex items-center gap-1.5 mb-2 pb-2"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="text-[10px] font-semibold" style={{ color: 'rgba(201,168,76,0.6)' }}>
                Justice AI
              </span>
              {phase === 2 && (
                <span className="text-[10px] italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  searching…
                </span>
              )}
            </div>
            {phase === 2 && (
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      animation: `blink 1.2s ease ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
            {phase >= 3 && (
              <div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {answerText}
                </p>
                {answerText.length >= DEMO_A.length && (
                  <div
                    className="mt-2.5 pt-2.5 flex items-center gap-2"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 2h7l3 3v9H3V2z"
                        stroke="rgba(201,168,76,0.5)"
                        strokeWidth="1.2"
                        fill="none"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
                      Hendricks_Partnership_2024.pdf · p. 7–8
                    </span>
                    <span
                      className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        background: 'rgba(201,168,76,0.08)',
                        color: 'rgba(201,168,76,0.6)',
                        border: '1px solid rgba(201,168,76,0.15)',
                      }}
                    >
                      Cited
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Typing indicator ────────────────────────────────────────────────────────
function TypingIndicator(): JSX.Element {
  return (
    <div className="flex gap-3 max-w-3xl mx-auto w-full">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}
      >
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
          <rect x="1" y="3" width="8" height="4" rx="1.25" fill="#c9a84c" transform="rotate(45 5 5)" />
          <line x1="10" y1="10" x2="18" y2="18" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
          <rect x="1" y="17" width="8" height="2" rx="1" fill="#c9a84c" opacity="0.45" />
        </svg>
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 flex flex-col gap-1.5"
        style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.25)',
                animation: `blink 1.2s ease ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </div>
        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Searching documents…
        </p>
      </div>
    </div>
  )
}

// ── Example questions ───────────────────────────────────────────────────────
const EXAMPLES = [
  'What are the termination clauses?',
  'Summarize the key obligations of each party',
  'Find all indemnification references',
  'What are the payment terms and schedule?',
  'List all defined terms in this agreement',
  'Identify any unusual or non-standard provisions',
]

// ── Main component ──────────────────────────────────────────────────────────
export default function ChatInterface({
  messages,
  isQuerying,
  files,
  isLoading,
  loadError,
  onQuery,
  onAddFiles,
  onAddFolder,
  onRemoveFile,
  onLoadPaths,
}: Props): JSX.Element {
  const [input, setInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [showFilePanel, setShowFilePanel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const filePanelRef = useRef<HTMLDivElement>(null)

  const hasFiles = files.length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isQuerying])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 128) + 'px'
  }, [input])

  // Close file panel on outside click
  useEffect(() => {
    function handler(e: MouseEvent): void {
      if (filePanelRef.current && !filePanelRef.current.contains(e.target as Node)) {
        setShowFilePanel(false)
      }
    }
    if (showFilePanel) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showFilePanel])

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

  function handleDragOver(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(): void {
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    setIsDragging(false)
    const paths: string[] = []
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const f = e.dataTransfer.files[i] as File & { path?: string }
      if (f.path) paths.push(f.path)
    }
    if (paths.length > 0) onLoadPaths(paths)
  }

  const isEmpty = messages.length === 0

  // ── Welcome screen (no files loaded) ──────────────────────────────────────
  if (!hasFiles) {
    return (
      <div
        className="flex flex-1 flex-col h-screen overflow-hidden bg-[#080808]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* macOS traffic light spacing */}
        <div className="drag-region h-10 shrink-0" />

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center min-h-full px-8 py-14 justify-center">

            {/* Logo */}
            <div
              className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: 'rgba(201,168,76,0.07)',
                border: '1px solid rgba(201,168,76,0.18)',
                animation: 'floatY 4s ease-in-out infinite',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
                <rect x="1" y="3" width="8" height="4" rx="1.25" fill="#c9a84c" transform="rotate(45 5 5)" />
                <line x1="10" y1="10" x2="18" y2="18" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
                <rect x="1" y="17" width="8" height="2" rx="1" fill="#c9a84c" opacity="0.45" />
              </svg>
            </div>

            {/* Heading */}
            <h1
              className="mb-2 text-[22px] font-bold tracking-[-0.02em] text-white"
            >
              Welcome to Justice <span style={{ color: '#c9a84c' }}>AI</span>
            </h1>
            <p
              className="mb-10 text-[13px] text-center max-w-xs leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Private legal research on your machine. Your documents never leave this device.
            </p>

            {/* Mini demo */}
            <div className="w-full max-w-md mb-9">
              <p
                className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-center"
                style={{ color: 'rgba(201,168,76,0.5)' }}
              >
                See it in action
              </p>
              <MiniDemo />
            </div>

            {/* Drop zone */}
            <div
              onClick={onAddFiles}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="w-full max-w-md rounded-2xl border-2 border-dashed px-8 py-8 text-center cursor-pointer transition-all"
              style={{
                borderColor: isDragging ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.1)',
                background: isDragging ? 'rgba(201,168,76,0.03)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isDragging) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.2)'
                  ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isDragging) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)'
                  ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
                }
              }}
            >
              <div className="flex justify-center mb-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: 'rgba(201,168,76,0.07)',
                    border: '1px solid rgba(201,168,76,0.18)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#c9a84c' }}>
                    <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25V1.75zM8.75 9.25a.75.75 0 0 0-1.5 0v1.5H5.75a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0v-1.5h1.5a.75.75 0 0 0 0-1.5H8.75v-1.5z" />
                  </svg>
                </div>
              </div>
              <p className="text-[13px] font-semibold text-white mb-1">
                {isDragging ? 'Drop your files here' : 'Load your documents'}
              </p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Click to browse · Drag & drop PDF or DOCX files
              </p>
              {isLoading && (
                <p className="mt-3 text-[11px]" style={{ color: '#c9a84c' }}>
                  Processing…
                </p>
              )}
              {loadError && (
                <p className="mt-3 text-[11px]" style={{ color: '#f85149' }}>
                  {loadError}
                </p>
              )}
            </div>

            <button
              onClick={onAddFolder}
              className="mt-3 text-[11px] transition-colors"
              style={{ color: 'rgba(255,255,255,0.22)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.22)'
              }}
            >
              Or load an entire folder →
            </button>

            {/* Three callouts */}
            <div className="mt-10 grid grid-cols-3 gap-3 w-full max-w-md">
              {[
                { label: 'Cited answers', body: 'Every response references its exact source.' },
                { label: 'Fully private', body: 'Nothing leaves your machine, ever.' },
                { label: 'No hallucinations', body: 'Grounded strictly in your documents.' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl p-3.5 text-center"
                  style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <p className="text-[11px] font-semibold text-white mb-1">{item.label}</p>
                  <p className="text-[10.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    )
  }

  // ── Chat view (files loaded) ────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col h-screen overflow-hidden bg-[#080808]">
      {/* Header */}
      <div
        className="drag-region flex items-center justify-between border-b px-5 py-3 shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#080808' }}
      >
        <div className="no-drag flex items-center">
          {isEmpty ? (
            <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
              New Chat
            </span>
          ) : (
            <span
              className="text-[13px] font-medium truncate max-w-[400px]"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              {messages.find((m) => m.role === 'user')?.content.slice(0, 60) ?? 'Chat'}
            </span>
          )}
        </div>

        {/* File count chip with popover */}
        <div className="no-drag relative" ref={filePanelRef}>
          <button
            onClick={() => setShowFilePanel((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              color: showFilePanel ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
              background: showFilePanel ? 'rgba(255,255,255,0.05)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!showFilePanel)
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'
            }}
            onMouseLeave={(e) => {
              if (!showFilePanel)
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'
            }}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="#c9a84c">
              <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25V1.75z" />
            </svg>
            {files.length} {files.length === 1 ? 'doc' : 'docs'}
            <svg width="8" height="8" viewBox="0 0 12 12" fill="currentColor" className="ml-0.5">
              <path d="M6 8.5L1.5 4h9L6 8.5z" />
            </svg>
          </button>

          {showFilePanel && (
            <div
              className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden z-50"
              style={{
                background: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                animation: 'fadeUp 0.2s ease both',
              }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Loaded Documents
                </p>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {files.map((file) => {
                  const ext = file.fileName.split('.').pop()?.toUpperCase() ?? 'DOC'
                  return (
                    <div
                      key={file.id}
                      className="group flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#161616] transition-colors"
                    >
                      <span
                        className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}
                      >
                        {ext}
                      </span>
                      <span
                        className="flex-1 text-[11px] truncate"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                        title={file.fileName}
                      >
                        {file.fileName}
                      </span>
                      <button
                        onClick={() => { onRemoveFile(file.id); if (files.length <= 1) setShowFilePanel(false) }}
                        className="no-drag shrink-0 h-5 w-5 flex items-center justify-center rounded text-[#444] hover:text-[#f85149] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M1.22 1.22a.75.75 0 0 1 1.06 0L6 4.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L7.06 6l3.72 3.72a.75.75 0 1 1-1.06 1.06L6 7.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06L4.94 6 1.22 2.28a.75.75 0 0 1 0-1.06z" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="px-4 py-2.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <button
                  onClick={() => { onAddFiles(); setShowFilePanel(false) }}
                  className="no-drag w-full text-left text-[11px] transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)' }}
                >
                  + Add more documents
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          // Empty state — files loaded, no messages yet
          <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
            <div
              className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.18)' }}
            >
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <rect x="1" y="3" width="8" height="4" rx="1.25" fill="#c9a84c" transform="rotate(45 5 5)" />
                <line x1="10" y1="10" x2="18" y2="18" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
                <rect x="1" y="17" width="8" height="2" rx="1" fill="#c9a84c" opacity="0.45" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-[17px] font-semibold tracking-[-0.01em] text-white">
              What would you like to know?
            </h3>
            <p className="mb-8 text-[12.5px] max-w-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {files.length} {files.length === 1 ? 'document' : 'documents'} ready · Ask anything about
              {files.length === 1 ? ' it' : ' them'}
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {EXAMPLES.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus() }}
                  className="rounded-xl px-3.5 py-3 text-left text-[11.5px] leading-snug transition-all"
                  style={{
                    background: '#0d0d0d',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.borderColor = 'rgba(201,168,76,0.25)'
                    el.style.color = 'rgba(255,255,255,0.75)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.borderColor = 'rgba(255,255,255,0.07)'
                    el.style.color = 'rgba(255,255,255,0.45)'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-7 max-w-3xl mx-auto w-full px-6 py-8">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isQuerying && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        className="shrink-0 px-6 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#080808' }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl transition-all"
            style={{
              background: '#0d0d0d',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocusCapture={(e) => {
              const target = e.currentTarget as HTMLDivElement
              target.style.borderColor = 'rgba(201,168,76,0.35)'
            }}
            onBlurCapture={(e) => {
              const target = e.currentTarget as HTMLDivElement
              target.style.borderColor = 'rgba(255,255,255,0.08)'
            }}
          >
            <div className="flex items-end gap-3 px-4 py-3.5">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isQuerying}
                placeholder="Ask a question about your documents…"
                rows={1}
                className="flex-1 bg-transparent text-[13px] text-white leading-6 outline-none placeholder-white/20 disabled:opacity-50"
                style={{ maxHeight: 128, overflowY: 'auto' }}
              />
              <button
                onClick={handleSend}
                disabled={isQuerying || !input.trim()}
                className="flex shrink-0 h-8 w-8 items-center justify-center rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() ? '#c9a84c' : 'rgba(255,255,255,0.06)',
                  color: input.trim() ? '#080808' : 'rgba(255,255,255,0.3)',
                }}
              >
                {isQuerying ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M.989 8 .064 2.68a1.342 1.342 0 0 1 1.85-1.462l13.402 5.744a1.13 1.13 0 0 1 0 2.076L1.913 14.782a1.342 1.342 0 0 1-1.85-1.463L.99 8zm.603-5.135.024.12L2.15 7.25h6.848a.75.75 0 0 1 0 1.5H2.15l-.534 4.265-.024.12 13.016-5.577z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Enter to send · Shift+Enter for new line · Answers sourced strictly from your documents
          </p>
        </div>
      </div>
    </div>
  )
}
