'use client'

import { useState } from 'react'
import { Reveal } from './Reveal'

const platforms = [
  {
    key: 'mac',
    label: 'Download for macOS',
    sub: 'Universal · macOS 12+',
    icon: (
      <svg width="18" height="22" viewBox="0 0 18 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.94 11.44c-.02-2.53 2.06-3.75 2.16-3.81-1.18-1.72-3.01-1.96-3.66-1.98-1.56-.16-3.05.92-3.84.92-.79 0-2.01-.9-3.31-.88-1.7.03-3.27 1-4.14 2.52-1.77 3.07-.45 7.61 1.27 10.1.84 1.22 1.85 2.59 3.17 2.54 1.28-.05 1.76-.82 3.31-.82 1.54 0 1.98.82 3.33.8 1.37-.03 2.24-1.24 3.07-2.47.97-1.41 1.37-2.78 1.39-2.85-.03-.01-2.67-1.02-2.69-4.06zM12.47 3.8c.7-.85 1.17-2.02 1.04-3.2-1.01.04-2.22.67-2.94 1.52-.65.75-1.21 1.95-1.06 3.1 1.12.09 2.27-.57 2.96-1.42z" />
      </svg>
    ),
    primary: true,
  },
  {
    key: 'windows',
    label: 'Download for Windows',
    sub: 'Windows 10/11 · x64',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.8" />
      </svg>
    ),
    primary: false,
  },
  {
    key: 'linux',
    label: 'Download for Linux',
    sub: 'AppImage · x86_64',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.504 0c-.155 0-.315.008-.48.021C7.309.191 4.693 2.688 4.693 6.036c0 1.715.565 3.138 1.489 4.206-.226 1.09-.697 2.457-.697 3.768 0 2.316.792 4.142 2.305 5.354 1.226 1.205 2.978 1.862 5.042 1.862 2.163 0 3.985-.78 5.33-2.199.966-1.133 1.518-2.681 1.518-4.381 0-1.232-.308-2.46-.791-3.509l-.106-.222c.888-1.032 1.394-2.374 1.394-3.879 0-3.382-2.636-5.993-7.673-6.036zm.087 1.485c4.315.039 6.405 2.241 6.405 5.016 0 1.316-.458 2.5-1.244 3.328l-.344.363.219.451c.486 1.002.79 2.167.79 3.274 0 1.434-.473 2.724-1.285 3.681-1.111 1.217-2.659 1.856-4.519 1.856-1.787 0-3.271-.549-4.296-1.588-1.253-1.012-1.9-2.573-1.9-4.554 0-1.175.447-2.477.67-3.438l.115-.495-.355-.373C5.897 9.169 5.367 7.866 5.367 6.29c0-2.809 2.122-4.739 6.224-4.8l.085-.005h.915zm.404 6.435c-1.085 0-1.965.88-1.965 1.965s.88 1.965 1.965 1.965 1.965-.88 1.965-1.965-.88-1.965-1.965-1.965zm-4.929 0c-1.085 0-1.965.88-1.965 1.965s.88 1.965 1.965 1.965 1.965-.88 1.965-1.965-.88-1.965-1.965-1.965zm2.468 5.21c-.485 0-.921.145-1.278.388l-.194.134-.207-.117c-.362-.206-.788-.32-1.242-.32-.949 0-1.772.474-2.178 1.225l-.155.289.264.209c.695.546 1.569.871 2.516.871.482 0 .941-.085 1.363-.238l.24-.089.193.163c.376.317.875.513 1.424.513.554 0 1.055-.199 1.431-.52l.193-.162.242.089c.421.153.88.238 1.363.238.947 0 1.82-.325 2.516-.871l.265-.209-.156-.289c-.406-.751-1.228-1.225-2.177-1.225-.454 0-.88.114-1.242.32l-.207.117-.194-.134c-.357-.243-.793-.388-1.278-.388h-.112z" />
      </svg>
    ),
    primary: false,
  },
]

const requirements = [
  { label: 'macOS', value: 'macOS 12 Monterey or later (M1/M2/M3 or Intel)' },
  { label: 'Windows', value: 'Windows 10 or later · 64-bit' },
  { label: 'Linux', value: 'Any modern distro · x86_64 AppImage' },
  { label: 'RAM', value: '16 GB recommended (8 GB minimum)' },
  { label: 'Storage', value: '~8 GB free (for model files)' },
  { label: 'Dependency', value: 'Ollama (ollama.ai) must be installed' },
]

export default function Download() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <section id="download" className="py-28 px-6" style={{ background: '#080808' }}>
        <div className="max-w-6xl mx-auto">
          <div className="border-t mb-28" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
        </div>

        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Download Justice AI
            </h2>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Free and open source. Your machine, your data, your justice.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)' }} />

              <div className="p-10 sm:p-12">
                {/* Download buttons */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-10">
                  {platforms.map((p) => (
                    p.primary ? (
                      <button
                        key={p.key}
                        onClick={() => setShowModal(true)}
                        className="flex-1 inline-flex flex-col items-center justify-center gap-1.5 font-semibold text-sm px-6 py-4 rounded-xl transition-all duration-200 cursor-pointer"
                        style={{ background: '#c9a84c', color: '#080808' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#dbb85e' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#c9a84c' }}
                      >
                        <span className="flex items-center gap-2">
                          {p.icon}
                          {p.label}
                        </span>
                        <span className="text-xs font-normal opacity-70">{p.sub}</span>
                      </button>
                    ) : (
                      <button
                        key={p.key}
                        onClick={() => setShowModal(true)}
                        className="flex-1 inline-flex flex-col items-center justify-center gap-1.5 text-sm px-6 py-4 rounded-xl transition-all duration-200 cursor-pointer"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', background: 'transparent' }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)'
                          ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'
                          ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'
                        }}
                      >
                        <span className="flex items-center gap-2 font-medium">
                          {p.icon}
                          {p.label}
                        </span>
                        <span className="text-xs opacity-50">{p.sub}</span>
                      </button>
                    )
                  ))}
                </div>

                <div className="border-t mb-8" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] mb-5 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  System Requirements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {requirements.map((req) => (
                    <div
                      key={req.label}
                      className="flex items-start gap-3 rounded-lg px-4 py-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div>
                        <span className="block text-xs uppercase tracking-wider mb-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>{req.label}</span>
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{req.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-8 mb-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <span className="text-white font-medium">Justice AI is fully offline.</span>{' '}
                  After downloading the model once, it works without internet. No data ever leaves your machine.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative rounded-2xl p-10 max-w-sm w-full text-center"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)' }} />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)' }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="5" r="1.5" fill="#c9a84c" />
                  <rect x="13.25" y="5" width="1.5" height="16" fill="#c9a84c" />
                  <rect x="9" y="21" width="10" height="1.5" rx="0.75" fill="#c9a84c" />
                  <rect x="5" y="8.25" width="18" height="1.5" rx="0.75" fill="#c9a84c" />
                  <line x1="7" y1="9.75" x2="5.5" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="21" y1="9.75" x2="22.5" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M3 17 Q5.5 20 8 17" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                  <path d="M20 17 Q22.5 20 25 17" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Justice AI is currently in development. Check back here for the download link once it is available for your platform.
            </p>
            <a
              href="https://github.com/lastbaa/CS-370-Justice-AI-Project"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs leading-relaxed rounded-lg px-4 py-3 mb-5 transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)' }}
            >
              Star the project on GitHub to follow along →
            </a>
            <button
              onClick={() => setShowModal(false)}
              className="w-full font-semibold text-sm px-6 py-3 rounded-lg transition-colors duration-200"
              style={{ background: '#c9a84c', color: '#080808' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#dbb85e' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#c9a84c' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
