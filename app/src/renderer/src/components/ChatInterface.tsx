import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { ChatMessage, FileInfo } from '../../../../../shared/src/types'
import MessageBubble from './MessageBubble'

interface Props {
  messages: ChatMessage[]
  isQuerying: boolean
  files: FileInfo[]
  isLoading: boolean
  loadError: string | null
  chatMode: boolean
  onQuery: (question: string) => void
  onNewChat: () => void
  onAddFiles: () => void
  onAddFolder: () => void
  onRemoveFile: (id: string) => void
  onLoadPaths: (paths: string[]) => void
}

// ── Animated product demo ────────────────────────────────────────────────────
const DEMO_Q = 'Does the Calloway contract limit liability for underground infrastructure damage?'
const DEMO_A =
  'Based on Section 8.3 (Page 4), Calloway Landscaping LLC disclaimed liability for "pre-existing or underground utilities not marked by owner." However, Exhibit C confirms a utility map was provided to Calloway prior to excavation — this disclosure likely voids the disclaimer under Georgia O.C.G.A. § 25-9-6.'

function ProductDemo(): JSX.Element {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0)
  const [answerText, setAnswerText] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800)
    const t2 = setTimeout(() => setPhase(2), 1800)
    const t3 = setTimeout(() => {
      setPhase(3)
      let i = 0
      const interval = setInterval(() => {
        i += 3
        setAnswerText(DEMO_A.slice(0, i))
        if (i >= DEMO_A.length) {
          setAnswerText(DEMO_A)
          clearInterval(interval)
        }
      }, 18)
      return () => clearInterval(interval)
    }, 3000)

    // Blinking cursor
    const cursorInterval = setInterval(() => setCursorVisible((v) => !v), 530)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      clearInterval(cursorInterval)
    }
  }, [])

  const isTyping = phase === 3 && answerText.length < DEMO_A.length
  const isDone = phase === 3 && answerText.length >= DEMO_A.length

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#060606' }}
    >
      {/* Fake title bar */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#050505' }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center gap-2">
          <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="3" width="8" height="4" rx="1.25" fill="#c9a84c" transform="rotate(45 5 5)" />
            <line x1="10" y1="10" x2="18" y2="18" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Justice AI — Williams v. Calloway, Decatur GA
          </span>
        </div>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>3 docs</span>
      </div>

      {/* Demo content */}
      <div className="flex" style={{ minHeight: 220 }}>
        {/* Sidebar stub */}
        <div
          className="w-36 shrink-0 border-r p-3 flex flex-col gap-1"
          style={{ borderColor: 'rgba(255,255,255,0.04)', background: '#040404' }}
        >
          <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Williams v. Calloway
          </p>
          {[
            'Williams_v_Calloway_Complaint.pdf',
            'Calloway_Contract_2024.docx',
            'Expert_Arborist_Report.pdf',
          ].map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
              style={{ background: i === 0 ? 'rgba(255,255,255,0.05)' : 'transparent' }}
            >
              <svg width="9" height="9" viewBox="0 0 16 16" fill="rgba(201,168,76,0.5)">
                <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25z" />
              </svg>
              <span
                className="text-[9px] truncate leading-snug"
                style={{ color: i === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col justify-end p-4 gap-3">
          {phase >= 1 && (
            <div
              className="self-end max-w-[65%] rounded-xl rounded-tr-sm px-3.5 py-2.5 text-[11.5px] leading-relaxed"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.75)',
                animation: 'fadeUp 0.3s ease both',
              }}
            >
              {DEMO_Q}
            </div>
          )}

          {phase >= 2 && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}
                >
                  <svg width="9" height="9" viewBox="0 0 20 20" fill="none">
                    <rect x="1" y="3" width="8" height="4" rx="1.25" fill="#c9a84c" transform="rotate(45 5 5)" />
                    <line x1="10" y1="10" x2="18" y2="18" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold" style={{ color: 'rgba(201,168,76,0.6)' }}>
                  Justice AI
                </span>
                {phase === 2 && (
                  <span className="text-[9px] italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    searching…
                  </span>
                )}
              </div>

              {phase === 2 && (
                <div className="flex gap-1.5 pl-7">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.2)', animation: `blink 1.2s ease ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              )}

              {phase >= 3 && (
                <div className="pl-7">
                  <p className="text-[11.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {answerText}
                    {isTyping && cursorVisible && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: '1.5px',
                          height: '0.85em',
                          background: 'rgba(255,255,255,0.5)',
                          marginLeft: '2px',
                          verticalAlign: 'text-bottom',
                        }}
                      />
                    )}
                  </p>
                  {isDone && (
                    <div
                      className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2"
                      style={{
                        background: 'rgba(201,168,76,0.05)',
                        border: '1px solid rgba(201,168,76,0.12)',
                        animation: 'fadeUp 0.3s ease both',
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="rgba(201,168,76,0.7)">
                        <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25z" />
                      </svg>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Calloway_Contract_2024.docx · p. 4
                      </span>
                      <span
                        className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-semibold"
                        style={{
                          background: 'rgba(201,168,76,0.08)',
                          color: 'rgba(201,168,76,0.7)',
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
    </div>
  )
}

// ── Sophisticated multi-step loading indicator ────────────────────────────────
function TypingIndicator(): JSX.Element {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1000),
      setTimeout(() => setStep(2), 2200),
      setTimeout(() => setStep(3), 3400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const steps = [
    { label: 'Reading your documents' },
    { label: 'Finding relevant sections' },
    { label: 'Analyzing legal context' },
    { label: 'Drafting response' },
  ]

  return (
    <div className="flex gap-3 max-w-3xl mx-auto w-full" style={{ animation: 'fadeUp 0.3s ease both' }}>
      <div
        className="flex h-7 w-7 shrink-0 mt-1 items-center justify-center rounded-full"
        style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.22)' }}
      >
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
          <rect x="1" y="3" width="8" height="4" rx="1.25" fill="#c9a84c" transform="rotate(45 5 5)" />
          <line x1="10" y1="10" x2="18" y2="18" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
          <rect x="1" y="17" width="8" height="2" rx="1" fill="#c9a84c" opacity="0.45" />
        </svg>
      </div>

      <div
        className="rounded-2xl rounded-tl-sm px-5 py-4 flex flex-col gap-3"
        style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-[11px] font-semibold" style={{ color: 'rgba(201,168,76,0.65)' }}>
          Justice AI
        </p>

        <div className="flex flex-col gap-2.5">
          {steps.map((s, i) => {
            const isDone = i < step
            const isActive = i === step

            return (
              <div key={s.label} className="flex items-center gap-2.5">
                {/* Status icon */}
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {isDone ? (
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4l2 2 3-3" stroke="#c9a84c" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : isActive ? (
                    <div
                      className="animate-spin w-3.5 h-3.5 rounded-full"
                      style={{ border: '2px solid rgba(201,168,76,0.2)', borderTopColor: '#c9a84c' }}
                    />
                  ) : (
                    <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  )}
                </div>

                <span
                  className="text-[12px]"
                  style={{
                    color: isDone
                      ? 'rgba(255,255,255,0.22)'
                      : isActive
                        ? 'rgba(255,255,255,0.7)'
                        : 'rgba(255,255,255,0.15)',
                    transition: 'color 0.4s ease',
                    textDecoration: isDone ? 'line-through' : 'none',
                    textDecorationColor: 'rgba(255,255,255,0.12)',
                  }}
                >
                  {s.label}
                  {isActive && (
                    <span style={{ color: 'rgba(201,168,76,0.45)' }}>…</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Example questions ────────────────────────────────────────────────────────
const EXAMPLES = [
  'What liability limitations does the Calloway contract include?',
  'What standard of care applies to licensed arborists in Georgia?',
  'Identify all property damage claims in the complaint',
  'When did defendant receive written notice of the foundation damage?',
  'What does the expert arborist report say about root system spread?',
  'Find all references to the irrigation system in the case documents',
]

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatInterface({
  messages,
  isQuerying,
  files,
  isLoading,
  loadError,
  chatMode,
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

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault()
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

  // ── WELCOME SCREEN ──────────────────────────────────────────────────────────
  if (!hasFiles && !chatMode) {
    return (
      <div
        className="flex flex-1 flex-col h-screen overflow-hidden bg-[#080808]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Traffic light zone — matches sidebar's h-11 */}
        <div className="drag-region h-11 shrink-0" />

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center min-h-full px-10 pb-10 pt-8 justify-center">

            {/* Icon */}
            <div
              className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-[20px]"
              style={{
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.18)',
                boxShadow: '0 0 40px rgba(201,168,76,0.06)',
                animation: 'floatY 4s ease-in-out infinite',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
                <rect x="1" y="3" width="8" height="4" rx="1.25" fill="#c9a84c" transform="rotate(45 5 5)" />
                <line x1="10" y1="10" x2="18" y2="18" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
                <rect x="1" y="17" width="8" height="2" rx="1" fill="#c9a84c" opacity="0.45" />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="mb-2 text-[26px] font-bold tracking-[-0.025em] text-white leading-tight text-center">
              Welcome to Justice <span style={{ color: '#c9a84c' }}>AI</span>
            </h1>
            <p
              className="mb-9 text-[13px] text-center leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.32)', maxWidth: 340 }}
            >
              Private legal research powered by a local AI model.
              Your documents never leave this device — ever.
            </p>

            {/* Demo */}
            <div className="w-full mb-8" style={{ maxWidth: 560 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.16em] px-3"
                  style={{ color: 'rgba(201,168,76,0.45)' }}
                >
                  Live Demo
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
              <ProductDemo />
            </div>

            {/* Drop zone */}
            <div
              onClick={onAddFiles}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="w-full rounded-2xl cursor-pointer transition-all"
              style={{
                maxWidth: 560,
                border: `1.5px dashed ${isDragging ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.1)'}`,
                background: isDragging ? 'rgba(201,168,76,0.03)' : 'transparent',
                padding: '28px 32px',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement
                if (!isDragging) {
                  el.style.borderColor = 'rgba(255,255,255,0.18)'
                  el.style.background = 'rgba(255,255,255,0.02)'
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement
                if (!isDragging) {
                  el.style.borderColor = 'rgba(255,255,255,0.1)'
                  el.style.background = 'transparent'
                }
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: isDragging ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isDragging ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 16 16" fill={isDragging ? '#c9a84c' : 'rgba(255,255,255,0.4)'} style={{ transition: 'all 0.2s ease' }}>
                    <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25V1.75zM8.75 9.25a.75.75 0 0 0-1.5 0v1.5H5.75a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0v-1.5h1.5a.75.75 0 0 0 0-1.5H8.75v-1.5z" />
                  </svg>
                </div>

                <p className="text-[14px] font-semibold text-white mb-1">
                  {isDragging ? 'Drop your files here' : 'Load your documents'}
                </p>
                <p className="text-[12px] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Click to browse files · or drag & drop PDF or DOCX documents
                </p>

                {/* Primary CTA */}
                <div
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25V1.75z" />
                  </svg>
                  Browse files
                </div>

                {isLoading && (
                  <p className="mt-3 text-[12px]" style={{ color: '#c9a84c' }}>
                    Processing documents…
                  </p>
                )}
                {loadError && (
                  <p className="mt-3 text-[12px]" style={{ color: '#f85149' }}>
                    {loadError}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onAddFolder}
              className="mt-3 text-[11px] transition-colors no-drag"
              style={{ color: 'rgba(255,255,255,0.2)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)' }}
            >
              Or load an entire folder →
            </button>

            {/* Feature callouts */}
            <div className="mt-10 grid grid-cols-3 gap-3 w-full" style={{ maxWidth: 560 }}>
              {[
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="rgba(201,168,76,0.7)">
                      <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25z" />
                    </svg>
                  ),
                  label: 'Cited answers',
                  body: 'Exact source — file and page',
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1L2 3.5v5c0 3.8 2.6 7.3 6 8 3.4-.7 6-4.2 6-8v-5L8 1z" stroke="rgba(201,168,76,0.7)" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
                      <path d="M5.5 8l2 2 3-3" stroke="rgba(201,168,76,0.7)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  label: 'Fully private',
                  body: 'Nothing leaves your device',
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6.5" stroke="rgba(201,168,76,0.7)" strokeWidth="1.4" />
                      <path d="M5 8l2 2 4-4" stroke="rgba(201,168,76,0.7)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  label: 'No hallucinations',
                  body: 'Document-grounded only',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl px-4 py-4 flex flex-col gap-2"
                  style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {item.icon}
                  <div>
                    <p className="text-[11.5px] font-semibold text-white leading-snug">{item.label}</p>
                    <p className="text-[11px] leading-snug mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    )
  }

  // ── CHAT VIEW ───────────────────────────────────────────────────────────────
  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-1 flex-col h-screen overflow-hidden bg-[#080808]">

      {/* Header — matches sidebar's h-11 traffic zone + content row */}
      <div
        className="drag-region flex h-11 items-center justify-between shrink-0 px-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="no-drag flex items-center gap-2">
          <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="3" width="8" height="4" rx="1.25" fill="rgba(201,168,76,0.5)" transform="rotate(45 5 5)" />
            <line x1="10" y1="10" x2="18" y2="18" stroke="rgba(201,168,76,0.5)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          {isEmpty ? (
            <span className="text-[12.5px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              New Chat
            </span>
          ) : (
            <span
              className="text-[12.5px] font-medium truncate"
              style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 400 }}
            >
              {messages.find((m) => m.role === 'user')?.content.slice(0, 55) ?? 'Chat'}
            </span>
          )}
        </div>

        {/* File chip with popover */}
        <div className="no-drag relative" ref={filePanelRef}>
          <button
            onClick={() => setShowFilePanel((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all"
            style={{
              border: '1px solid rgba(255,255,255,0.07)',
              color: showFilePanel ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.28)',
              background: showFilePanel ? 'rgba(255,255,255,0.05)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!showFilePanel)
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'
            }}
            onMouseLeave={(e) => {
              if (!showFilePanel)
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.28)'
            }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="#c9a84c">
              <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25z" />
            </svg>
            {files.length} {files.length === 1 ? 'doc' : 'docs'}
            <svg
              width="7" height="7" viewBox="0 0 12 12" fill="currentColor"
              style={{ transform: showFilePanel ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
            >
              <path d="M6 8.5L1.5 4h9L6 8.5z" />
            </svg>
          </button>

          {showFilePanel && (
            <div
              className="absolute right-0 top-full mt-1.5 w-72 rounded-xl overflow-hidden"
              style={{
                background: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                animation: 'fadeUp 0.18s ease both',
                zIndex: 50,
              }}
            >
              <div className="px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  Loaded Documents
                </p>
              </div>
              <div className="max-h-52 overflow-y-auto">
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
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                        title={file.fileName}
                      >
                        {file.fileName}
                      </span>
                      <button
                        onClick={() => {
                          onRemoveFile(file.id)
                          if (files.length <= 1) setShowFilePanel(false)
                        }}
                        className="no-drag shrink-0 h-5 w-5 flex items-center justify-center rounded text-[#383838] hover:text-[#f85149] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M1.22 1.22a.75.75 0 0 1 1.06 0L6 4.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L7.06 6l3.72 3.72a.75.75 0 1 1-1.06 1.06L6 7.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06L4.94 6 1.22 2.28a.75.75 0 0 1 0-1.06z" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="px-4 py-2.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => { onAddFiles(); setShowFilePanel(false) }}
                  className="no-drag text-[11px] transition-colors"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.28)' }}
                >
                  + Add more documents
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
            <div
              className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.16)' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="1" y="3" width="8" height="4" rx="1.25" fill="#c9a84c" transform="rotate(45 5 5)" />
                <line x1="10" y1="10" x2="18" y2="18" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
                <rect x="1" y="17" width="8" height="2" rx="1" fill="#c9a84c" opacity="0.45" />
              </svg>
            </div>
            <h3 className="mb-2 text-[18px] font-semibold tracking-[-0.015em] text-white">
              What would you like to know?
            </h3>
            <p className="mb-8 text-[12.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)', maxWidth: 300 }}>
              {hasFiles
                ? `${files.length} ${files.length === 1 ? 'document' : 'documents'} loaded and ready to search`
                : 'Load documents to start searching'}
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {EXAMPLES.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus() }}
                  className="rounded-xl px-4 py-3 text-left text-[12px] leading-snug transition-all"
                  style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.42)' }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.borderColor = 'rgba(201,168,76,0.22)'
                    el.style.color = 'rgba(255,255,255,0.75)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.borderColor = 'rgba(255,255,255,0.07)'
                    el.style.color = 'rgba(255,255,255,0.42)'
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

      {/* Input */}
      <div
        className="shrink-0 px-6 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#080808' }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl transition-colors"
            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.3)'
            }}
            onBlurCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'
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
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <svg width="9" height="9" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="3" width="8" height="4" rx="1.25" fill="rgba(201,168,76,0.3)" transform="rotate(45 5 5)" />
              <line x1="10" y1="10" x2="18" y2="18" stroke="rgba(201,168,76,0.3)" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.13)' }}>
              Justice AI · Enter to send · Answers grounded in your documents
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
