'use client'

import { useState } from 'react'

const requirements = [
  { label: 'Chip', value: 'Apple Silicon (M1 / M2 / M3) or Intel Mac' },
  { label: 'macOS', value: 'macOS 12 Monterey or later' },
  { label: 'RAM', value: '16 GB recommended (8 GB minimum)' },
  { label: 'Storage', value: '~8 GB free (for model files)' },
  { label: 'Dependency', value: 'Ollama (ollama.ai) must be installed' },
]

export default function Download() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <section id="download" className="py-24 px-6" style={{ background: '#0a0a0a' }}>
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-[#2a2a2a] mb-24" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Download Justice AI
            </h2>
            <p className="text-[#8a8a8a] text-lg">
              Free and open source. Your machine, your data, your justice.
            </p>
          </div>

          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#c9a84c] via-[#e8c97e] to-[#c9a84c]" />

            <div className="p-10 sm:p-12">
              <div className="flex flex-col items-center text-center mb-12">
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-3 bg-[#c9a84c] text-[#0a0a0a] font-bold text-lg px-10 py-5 rounded-xl hover:bg-[#e8c97e] transition-colors duration-200 shadow-[0_4px_32px_rgba(201,168,76,0.25)] mb-5 cursor-pointer"
                >
                  <svg width="22" height="27" viewBox="0 0 18 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.94 11.44c-.02-2.53 2.06-3.75 2.16-3.81-1.18-1.72-3.01-1.96-3.66-1.98-1.56-.16-3.05.92-3.84.92-.79 0-2.01-.9-3.31-.88-1.7.03-3.27 1-4.14 2.52-1.77 3.07-.45 7.61 1.27 10.1.84 1.22 1.85 2.59 3.17 2.54 1.28-.05 1.76-.82 3.31-.82 1.54 0 1.98.82 3.33.8 1.37-.03 2.24-1.24 3.07-2.47.97-1.41 1.37-2.78 1.39-2.85-.03-.01-2.67-1.02-2.69-4.06zM12.47 3.8c.7-.85 1.17-2.02 1.04-3.2-1.01.04-2.22.67-2.94 1.52-.65.75-1.21 1.95-1.06 3.1 1.12.09 2.27-.57 2.96-1.42z" />
                  </svg>
                  Download for macOS
                </button>
                <div className="text-[#8a8a8a] text-sm">Version 1.0.0 &nbsp;&middot;&nbsp; macOS Universal</div>
              </div>

              <div className="border-t border-[#2a2a2a] mb-10" />

              <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-6 text-center opacity-60">
                System Requirements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {requirements.map((req) => (
                  <div key={req.label} className="flex items-start gap-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3.5">
                    <div>
                      <span className="block text-[#8a8a8a] text-xs uppercase tracking-wider mb-0.5 font-medium">{req.label}</span>
                      <span className="text-white text-sm leading-snug">{req.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#2a2a2a] mt-10 mb-8" />

              <p className="text-[#8a8a8a] text-sm leading-relaxed">
                <span className="text-white font-medium">Justice AI is fully offline.</span>{' '}
                After downloading the model once, it works without internet. No data ever leaves your machine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative bg-[#141414] border border-[#2a2a2a] rounded-2xl p-10 max-w-md w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c9a84c] via-[#e8c97e] to-[#c9a84c] rounded-t-2xl" />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#8a8a8a] hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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

            <h3 className="text-xl font-bold text-white mb-3">Coming Soon</h3>
            <p className="text-[#8a8a8a] text-sm leading-relaxed mb-6">
              The macOS app is currently in development. Check back here for the download link once it is available.
            </p>
            <p className="text-[#8a8a8a] text-xs leading-relaxed border border-[#2a2a2a] rounded-lg px-4 py-3 bg-[#0a0a0a]">
              Want to be notified at launch? Star the project on GitHub to follow along.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-[#c9a84c] text-[#0a0a0a] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#e8c97e] transition-colors duration-200"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
