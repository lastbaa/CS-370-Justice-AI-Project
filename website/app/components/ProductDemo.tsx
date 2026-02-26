'use client'

import { useEffect, useRef, useState } from 'react'
import { Reveal } from './Reveal'
import { WordReveal } from './WordReveal'

const QUESTION = 'What standard of care was Calloway Landscaping held to under the arborist contract?'

const ANSWER_PARTS = [
  { delay: 0,    text: 'Based on ' },
  { delay: 60,   text: 'Section 4.1' },
  { delay: 160,  text: ' of ' },
  { delay: 220,  text: 'Calloway_Contract_2024.pdf' },
  { delay: 400,  text: ' (Page 3):\n\n' },
  { delay: 600,  text: '"Contractor shall perform all work in accordance with ' },
  { delay: 900,  text: 'ISA ANSI A300 standards' },
  { delay: 1100, text: ' and applicable Georgia arborist licensing requirements. Failure to comply constitutes ' },
  { delay: 1600, text: 'material breach' },
  { delay: 1750, text: ' of this Agreement."\n\n' },
  { delay: 2000, text: 'The Expert Arborist Report (Page 6) confirms the oak removal deviated from ANSI A300 Part 1 Section 5.2, establishing the standard of care violation central to the plaintiff\'s negligence claim.' },
]

const FULL_ANSWER = ANSWER_PARTS.map(p => p.text).join('')

const files = [
  { name: 'Williams_v_Calloway_Complaint.pdf', pages: 18, size: '1.1 MB' },
  { name: 'Calloway_Contract_2024.pdf', pages: 12, size: '620 KB' },
  { name: 'Expert_Arborist_Report.pdf', pages: 24, size: '2.3 MB' },
]

export default function ProductDemo() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const [showQ, setShowQ] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) { setStarted(true); obs.unobserve(el) } },
      { threshold: 0.25 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    // Show question after 600ms
    const t1 = setTimeout(() => setShowQ(true), 600)
    // Show thinking after 1400ms
    const t2 = setTimeout(() => setThinking(true), 1400)
    // Start typing answer after 2600ms
    const t3 = setTimeout(() => {
      setThinking(false)
      let built = ''
      const timers: ReturnType<typeof setTimeout>[] = []
      ANSWER_PARTS.forEach(part => {
        const t = setTimeout(() => {
          built += part.text
          setAnswerText(built)
        }, part.delay)
        timers.push(t)
      })
      const lastDelay = ANSWER_PARTS[ANSWER_PARTS.length - 1].delay + 200
      const tf = setTimeout(() => setDone(true), lastDelay)
      timers.push(tf)
      return () => timers.forEach(clearTimeout)
    }, 2600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [started])

  const formatAnswer = (text: string) =>
    text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(Section \d+\.\d+|Page \d+|ISA ANSI A300|ANSI A300 Part \d+|material breach|Calloway_Contract_2024\.pdf)/).map((chunk, j) =>
          /Section \d+\.\d+|Page \d+|ISA ANSI|ANSI A300|material breach|Calloway_Contract/.test(chunk)
            ? <span key={j} style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{chunk}</span>
            : chunk
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ))

  return (
    <section id="product" className="py-32 px-6" style={{ background: '#080808' }}>
      <div className="max-w-6xl mx-auto">
        <div className="border-t mb-32" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <Reveal className="flex justify-center mb-6">
          <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'rgba(201,168,76,0.55)' }}>
            00 — The Product
          </span>
        </Reveal>

        <div className="text-center mb-5">
          <WordReveal
            text="See Justice AI In Action"
            as="h2"
            stagger={85}
            className="text-3xl sm:text-4xl font-bold text-white"
            style={{ letterSpacing: '-0.02em' }}
          />
        </div>

        <Reveal className="text-center mb-16">
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Load your documents, ask a question in plain English, get a cited answer — all without leaving your machine.
          </p>
        </Reveal>

        {/* App mockup */}
        <Reveal variant="scale" delay={100}>
          <div
            ref={sectionRef}
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0c0c0c' }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-3 px-5 py-3.5 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0a0a0a' }}
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>
              <div className="flex-1 flex items-center justify-center gap-2">
                <svg width="12" height="12" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="5" r="1.5" fill="#c9a84c" />
                  <rect x="13.25" y="5" width="1.5" height="16" fill="#c9a84c" />
                  <rect x="9" y="21" width="10" height="1.5" rx="0.75" fill="#c9a84c" />
                  <rect x="5" y="8.25" width="18" height="1.5" rx="0.75" fill="#c9a84c" />
                  <line x1="7" y1="9.75" x2="5.5" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="21" y1="9.75" x2="22.5" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M3 17 Q5.5 20 8 17" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                  <path d="M20 17 Q22.5 20 25 17" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                </svg>
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Justice AI</span>
              </div>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Williams v. Calloway · Decatur, GA</span>
            </div>

            <div className="flex flex-col md:flex-row" style={{ minHeight: '420px' }}>

              {/* Sidebar */}
              <div
                className="md:w-56 shrink-0 p-4 border-b md:border-b-0 md:border-r"
                style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#090909' }}
              >
                <p className="text-xs uppercase tracking-widest mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Loaded Files
                </p>
                <div className="flex flex-col gap-1.5">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
                      style={{ background: i === 0 ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                        <path d="M3 2h7l3 3v9H3V2z" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
                        <path d="M10 2v3h3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinejoin="round" />
                      </svg>
                      <div>
                        <p className="text-xs leading-snug" style={{ color: i === 0 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)', wordBreak: 'break-all' }}>
                          {f.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                          {f.pages}p · {f.size}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat area */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-5 sm:p-7 flex flex-col gap-5 overflow-hidden">

                  {/* User message */}
                  {showQ && (
                    <div
                      className="self-end max-w-md rounded-xl rounded-br-sm px-4 py-3"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        animation: 'fadeUp 0.4s ease both',
                      }}
                    >
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {QUESTION}
                      </p>
                    </div>
                  )}

                  {/* AI response */}
                  {(thinking || answerText) && (
                    <div
                      className="self-start max-w-2xl w-full rounded-xl rounded-bl-sm px-5 py-4"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        animation: 'fadeUp 0.4s ease both',
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <svg width="11" height="11" viewBox="0 0 28 28" fill="none">
                          <circle cx="14" cy="5" r="1.5" fill="#c9a84c" />
                          <rect x="13.25" y="5" width="1.5" height="16" fill="#c9a84c" />
                          <rect x="9" y="21" width="10" height="1.5" rx="0.75" fill="#c9a84c" />
                          <rect x="5" y="8.25" width="18" height="1.5" rx="0.75" fill="#c9a84c" />
                          <line x1="7" y1="9.75" x2="5.5" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                          <line x1="21" y1="9.75" x2="22.5" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                          <path d="M3 17 Q5.5 20 8 17" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                          <path d="M20 17 Q22.5 20 25 17" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                        </svg>
                        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Justice AI</span>
                        {thinking && (
                          <span className="text-xs italic" style={{ color: 'rgba(255,255,255,0.25)' }}>searching documents…</span>
                        )}
                      </div>

                      {thinking && (
                        <div className="flex gap-1.5 items-center">
                          {[0, 1, 2].map(i => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background: 'rgba(255,255,255,0.3)',
                                animation: `blink 1.2s ease ${i * 0.2}s infinite`,
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {answerText && (
                        <div>
                          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'inherit' }}>
                            {formatAnswer(answerText)}
                            {!done && (
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: '2px',
                                  height: '0.9em',
                                  background: 'rgba(255,255,255,0.5)',
                                  marginLeft: '2px',
                                  verticalAlign: 'text-bottom',
                                  animation: 'blink 0.9s step-end infinite',
                                }}
                              />
                            )}
                          </p>

                          {done && (
                            <div
                              className="mt-4 pt-3 flex items-center gap-2"
                              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                            >
                              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                                <path d="M3 2h7l3 3v9H3V2z" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
                              </svg>
                              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
                                Calloway_Contract_2024.pdf · Page 3
                              </span>
                              <span className="ml-auto text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                Verified citation
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Input bar */}
                <div className="px-5 sm:px-7 pb-5">
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <span className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Ask anything about your documents…</span>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3l5 5-5 5M3 8h10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Callout below demo */}
        <Reveal delay={200} className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Every answer is cited', body: 'Filename, page number, and direct quote. Nothing fabricated.' },
            { label: 'Strictly document-grounded', body: "If the answer isn't in your files, Justice AI says so explicitly." },
            { label: 'Runs without internet', body: 'After setup, fully air-gapped. No server calls, ever.' },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl px-5 py-4"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-xs font-semibold text-white mb-1.5">{item.label}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
