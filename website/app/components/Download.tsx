'use client'

import { useState, useEffect, useRef } from 'react'
import { Reveal } from './Reveal'
import { WordReveal } from './WordReveal'

type PlatformKey = 'mac' | 'windows' | 'linux'
type DownloadState = 'idle' | 'downloading' | 'done'

const platforms: {
  key: PlatformKey
  label: string
  sub: string
  file: string
  installSteps: string[]
  icon: React.ReactNode
}[] = [
  {
    key: 'mac',
    label: 'macOS',
    sub: 'Universal · macOS 12+',
    file: 'https://github.com/lastbaa/CS-370-Justice-AI-Project/releases/download/v1.0.0/Justice%20AI-1.0.0-arm64.dmg',
    installSteps: [
      'Open the downloaded .dmg file',
      'Drag Justice AI to your Applications folder',
      'Right-click Justice AI → Open on first launch (macOS security)',
      'Install Ollama and pull models — see Settings inside the app',
    ],
    icon: (
      <svg width="17" height="21" viewBox="0 0 18 22" fill="currentColor">
        <path d="M14.94 11.44c-.02-2.53 2.06-3.75 2.16-3.81-1.18-1.72-3.01-1.96-3.66-1.98-1.56-.16-3.05.92-3.84.92-.79 0-2.01-.9-3.31-.88-1.7.03-3.27 1-4.14 2.52-1.77 3.07-.45 7.61 1.27 10.1.84 1.22 1.85 2.59 3.17 2.54 1.28-.05 1.76-.82 3.31-.82 1.54 0 1.98.82 3.33.8 1.37-.03 2.24-1.24 3.07-2.47.97-1.41 1.37-2.78 1.39-2.85-.03-.01-2.67-1.02-2.69-4.06zM12.47 3.8c.7-.85 1.17-2.02 1.04-3.2-1.01.04-2.22.67-2.94 1.52-.65.75-1.21 1.95-1.06 3.1 1.12.09 2.27-.57 2.96-1.42z" />
      </svg>
    ),
  },
  {
    key: 'windows',
    label: 'Windows',
    sub: 'Windows 10/11 · x64',
    file: 'https://github.com/lastbaa/CS-370-Justice-AI-Project/releases/tag/v1.0.0',
    installSteps: [
      'Unzip the downloaded archive',
      'Run JusticeAI-Setup.exe and follow the installer',
      'Launch JusticeAI from Start Menu or Desktop shortcut',
      'The AI model launches automatically — no setup required',
    ],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.8" />
      </svg>
    ),
  },
  {
    key: 'linux',
    label: 'Linux',
    sub: 'AppImage · x86_64',
    file: 'https://github.com/lastbaa/CS-370-Justice-AI-Project/releases/tag/v1.0.0',
    installSteps: [
      'Unzip the archive and extract the AppImage',
      'Run: chmod +x JusticeAI.AppImage',
      'Double-click or run ./JusticeAI.AppImage',
      'The AI model launches automatically — no setup required',
    ],
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.504 0c-.155 0-.315.008-.48.021C7.309.191 4.693 2.688 4.693 6.036c0 1.715.565 3.138 1.489 4.206-.226 1.09-.697 2.457-.697 3.768 0 2.316.792 4.142 2.305 5.354 1.226 1.205 2.978 1.862 5.042 1.862 2.163 0 3.985-.78 5.33-2.199.966-1.133 1.518-2.681 1.518-4.381 0-1.232-.308-2.46-.791-3.509l-.106-.222c.888-1.032 1.394-2.374 1.394-3.879 0-3.382-2.636-5.993-7.673-6.036zm.087 1.485c4.315.039 6.405 2.241 6.405 5.016 0 1.316-.458 2.5-1.244 3.328l-.344.363.219.451c.486 1.002.79 2.167.79 3.274 0 1.434-.473 2.724-1.285 3.681-1.111 1.217-2.659 1.856-4.519 1.856-1.787 0-3.271-.549-4.296-1.588-1.253-1.012-1.9-2.573-1.9-4.554 0-1.175.447-2.477.67-3.438l.115-.495-.355-.373C5.897 9.169 5.367 7.866 5.367 6.29c0-2.809 2.122-4.739 6.224-4.8l.085-.005h.915zm.404 6.435c-1.085 0-1.965.88-1.965 1.965s.88 1.965 1.965 1.965 1.965-.88 1.965-1.965-.88-1.965-1.965-1.965zm-4.929 0c-1.085 0-1.965.88-1.965 1.965s.88 1.965 1.965 1.965 1.965-.88 1.965-1.965-.88-1.965-1.965-1.965zm2.468 5.21c-.485 0-.921.145-1.278.388l-.194.134-.207-.117c-.362-.206-.788-.32-1.242-.32-.949 0-1.772.474-2.178 1.225l-.155.289.264.209c.695.546 1.569.871 2.516.871.482 0 .941-.085 1.363-.238l.24-.089.193.163c.376.317.875.513 1.424.513.554 0 1.055-.199 1.431-.52l.193-.162.242.089c.421.153.88.238 1.363.238.947 0 1.82-.325 2.516-.871l.265-.209-.156-.289c-.406-.751-1.228-1.225-2.177-1.225-.454 0-.88.114-1.242.32l-.207.117-.194-.134c-.357-.243-.793-.388-1.278-.388h-.112z" />
      </svg>
    ),
  },
]

const requirements = [
  { label: 'macOS', value: 'macOS 12 Monterey+ · Apple Silicon or Intel' },
  { label: 'Windows', value: 'Windows 10 / 11 · 64-bit' },
  { label: 'Linux', value: 'Any modern distro · x86_64 AppImage' },
  { label: 'RAM', value: '16 GB recommended · 8 GB minimum' },
  { label: 'Storage', value: '~8 GB free for the included AI model' },
  { label: 'Network', value: 'None required — fully offline after install' },
]

export default function Download() {
  const [downloadState, setDownloadState] = useState<Record<PlatformKey, DownloadState>>({
    mac: 'idle', windows: 'idle', linux: 'idle',
  })
  const [progress, setProgress] = useState<Record<PlatformKey, number>>({
    mac: 0, windows: 0, linux: 0,
  })
  const [activePlatform, setActivePlatform] = useState<PlatformKey | null>(null)
  const progressRefs = useRef<Record<PlatformKey, ReturnType<typeof setInterval> | null>>({
    mac: null, windows: null, linux: null,
  })

  // Modal state
  const [modalPlatform, setModalPlatform] = useState<typeof platforms[0] | null>(null)
  const [name, setName] = useState('')
  const [nameSubmitted, setNameSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (modalPlatform && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [modalPlatform])

  function startDownload(platform: typeof platforms[0]) {
    setActivePlatform(platform.key)
    setDownloadState(s => ({ ...s, [platform.key]: 'downloading' }))
    setProgress(p => ({ ...p, [platform.key]: 0 }))

    // GitHub release assets require navigating to the URL directly
    window.open(platform.file, '_blank', 'noopener')

    let current = 0
    progressRefs.current[platform.key] = setInterval(() => {
      const inc = current < 30 ? 4 : current < 70 ? 1.2 : current < 90 ? 0.6 : 2.5
      current = Math.min(current + inc, 100)
      setProgress(p => ({ ...p, [platform.key]: current }))
      if (current >= 100) {
        clearInterval(progressRefs.current[platform.key]!)
        progressRefs.current[platform.key] = null
        setDownloadState(s => ({ ...s, [platform.key]: 'done' }))
      }
    }, 60)
  }

  function handleButtonClick(platform: typeof platforms[0]) {
    if (downloadState[platform.key] !== 'idle') return
    setModalPlatform(platform)
    setNameSubmitted(false)
  }

  function handleModalSubmit() {
    if (!modalPlatform) return
    setNameSubmitted(true)
    setTimeout(() => {
      setModalPlatform(null)
      startDownload(modalPlatform)
    }, 900)
  }

  function handleReset(key: PlatformKey) {
    setDownloadState(s => ({ ...s, [key]: 'idle' }))
    setProgress(p => ({ ...p, [key]: 0 }))
    if (activePlatform === key) setActivePlatform(null)
  }

  useEffect(() => {
    return () => { Object.values(progressRefs.current).forEach(t => t && clearInterval(t)) }
  }, [])

  const donePlatform = activePlatform && downloadState[activePlatform] === 'done'
    ? platforms.find(p => p.key === activePlatform) : null

  const firstName = name.trim().split(' ')[0]

  return (
    <>
      {/* ── Name capture modal ─────────────────────────────────── */}
      {modalPlatform && (
        <div
          className="fixed inset-0 flex items-center justify-center px-6"
          style={{ zIndex: 9000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setModalPlatform(null) }}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: '#0f0f0f',
              border: '1px solid rgba(255,255,255,0.1)',
              animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            <div className="h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
            <div className="p-8">
              {nameSubmitted ? (
                <div className="text-center py-2">
                  <div
                    className="mx-auto mb-5 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                      <path d="M2.5 8.5l3.5 3.5 7-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-white mb-1">
                    {firstName ? `Thanks, ${firstName}.` : 'All set.'}
                  </p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>Your download is starting…</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                    >
                      {modalPlatform.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Download for {modalPlatform.label}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{modalPlatform.sub}</p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-white mb-1">What should we call you?</p>
                  <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Optional — just makes things feel a little more personal.
                  </p>

                  <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleModalSubmit()}
                    placeholder="Your name"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none mb-3"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />

                  <button
                    onClick={handleModalSubmit}
                    className="w-full rounded-xl py-3 text-sm font-semibold text-black transition-all"
                    style={{ background: '#fff' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.88)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
                  >
                    Start Download
                  </button>

                  <button
                    onClick={() => setModalPlatform(null)}
                    className="w-full mt-2 py-2 text-xs transition-colors"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.25)' }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <section id="download" className="py-32 px-6" style={{ background: '#080808' }}>
        <div className="max-w-6xl mx-auto">
          <div className="border-t mb-32" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
        </div>

        <div className="max-w-3xl mx-auto">
          <Reveal className="flex justify-center mb-6">
            <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'rgba(201,168,76,0.55)' }}>04 — Get Started</span>
          </Reveal>

          <div className="text-center mb-4">
            <WordReveal
              text="Download Justice AI"
              as="h2"
              stagger={90}
              className="text-3xl sm:text-4xl font-bold text-white"
              style={{ letterSpacing: '-0.02em' }}
            />
          </div>
          <Reveal className="text-center mb-12">
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Free and open source. Everything included. Just download and open.
            </p>
          </Reveal>

          <Reveal variant="scale" delay={120}>
            <div className="rounded-2xl overflow-hidden" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />

              <div className="p-10 sm:p-12">
                <div className="flex justify-center mb-8">
                  <span className="text-xs font-medium tracking-widest uppercase px-3 py-1 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.02)' }}>
                    v1.0.0 Preview · Open Source · Model Included
                  </span>
                </div>

                {/* Download buttons */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-4">
                  {platforms.map((p) => {
                    const state = downloadState[p.key]
                    const pct = progress[p.key]
                    const isDownloading = state === 'downloading'
                    const isDone = state === 'done'

                    return (
                      <button
                        key={p.key}
                        onClick={() => state === 'idle' ? handleButtonClick(p) : isDone ? handleReset(p.key) : undefined}
                        disabled={isDownloading}
                        className="group flex-1 relative overflow-hidden rounded-2xl text-left"
                        style={{
                          background: isDone ? 'rgba(255,255,255,0.06)' : isDownloading ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isDone ? 'rgba(255,255,255,0.2)' : isDownloading ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
                          cursor: isDownloading ? 'default' : 'pointer',
                          transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={e => {
                          if (state === 'idle') {
                            const el = e.currentTarget as HTMLButtonElement
                            el.style.background = 'rgba(255,255,255,0.06)'
                            el.style.borderColor = 'rgba(255,255,255,0.18)'
                            el.style.transform = 'translateY(-2px)'
                            el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (state === 'idle') {
                            const el = e.currentTarget as HTMLButtonElement
                            el.style.background = 'rgba(255,255,255,0.03)'
                            el.style.borderColor = 'rgba(255,255,255,0.08)'
                            el.style.transform = 'translateY(0)'
                            el.style.boxShadow = 'none'
                          }
                        }}
                      >
                        {isDownloading && (
                          <div className="absolute bottom-0 left-0 h-0.5" style={{ background: 'rgba(255,255,255,0.4)', width: `${pct}%`, transition: 'width 0.06s linear' }} />
                        )}

                        <div className="px-5 py-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDone ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: isDone ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                              {isDownloading ? (
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
                                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                              ) : isDone ? (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M2.5 8.5l3.5 3.5 7-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : p.icon}
                            </div>
                            {state === 'idle' && (
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                  <path d="M8 2v9M4.5 7.5L8 11l3.5-3.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            )}
                            {isDownloading && (
                              <span className="text-xs font-mono tabular-nums" style={{ color: 'rgba(255,255,255,0.5)' }}>{Math.round(pct)}%</span>
                            )}
                          </div>

                          <p className="text-sm font-semibold text-white mb-0.5">
                            {isDone ? 'Downloaded' : isDownloading ? 'Downloading…' : `Download for ${p.label}`}
                          </p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {isDone ? 'Click to reset' : p.sub}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Progress bar */}
                {activePlatform && downloadState[activePlatform] === 'downloading' && (
                  <div className="mb-6 rounded-full overflow-hidden" style={{ height: '2px', background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${progress[activePlatform]}%`, background: 'rgba(255,255,255,0.4)', transition: 'width 0.06s linear' }} />
                  </div>
                )}

                {/* Install instructions */}
                {donePlatform && (
                  <div className="mb-6 rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeUp 0.4s ease both' }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Install Instructions · {donePlatform.label}
                    </p>
                    <ol className="flex flex-col gap-2.5">
                      {donePlatform.installSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-px" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                            {i + 1}
                          </span>
                          <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="border-t mb-8" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] mb-5 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  System Requirements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {requirements.map((req) => (
                    <div key={req.label} className="flex items-start gap-3 rounded-lg px-4 py-3" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <span className="block text-xs uppercase tracking-wider mb-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>{req.label}</span>
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{req.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-8 mb-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <span className="text-white font-medium">Everything is included.</span>{' '}
                  The AI model ships inside the installer. Once open, Justice AI works with no internet connection and no additional setup. Nothing ever leaves your machine.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
