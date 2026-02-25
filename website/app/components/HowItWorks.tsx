'use client'

import { Reveal } from './Reveal'

const steps = [
  {
    number: '01',
    title: 'Load Your Documents',
    body: 'Drag in a folder of case files, contracts, or briefs. Justice AI accepts PDF and Word documents. All parsing happens locally — nothing is transmitted.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8a2 2 0 012-2h5l2 2h11a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
          stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
        <path d="M14 21v-7m-3 3l3-3 3 3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Ask Your Question',
    body: "Type any legal question in plain English. 'What does clause 7 say about termination?' or 'Find all references to the indemnification period.'",
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 6a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H9l-4 4V6z"
          stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
        <line x1="10" y1="10" x2="18" y2="10" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="10" y1="14" x2="15" y2="14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Get Cited Answers',
    body: 'Receive a direct answer with source citations — filename, page number, and exact quoted text. Verify every answer instantly.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 4h10l4 4v16H7V4z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
        <path d="M17 4v4h4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M11 14.5l2.5 2.5 5-5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6" style={{ background: '#080808' }}>
      <div className="max-w-6xl mx-auto">
        <div className="border-t mb-28" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      </div>

      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            How It Works
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Three steps from document to verified, cited answer — all on your machine.
          </p>
        </Reveal>

        <div className="relative">
          {/* Connector line — desktop only */}
          <div
            className="hidden md:block absolute top-[2.75rem] left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-8">
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 100}>
                <div className="relative flex flex-col items-center text-center">
                  {/* Step number bubble */}
                  <div
                    className="relative z-10 w-[3.5rem] h-[3.5rem] rounded-full flex items-center justify-center mb-7"
                    style={{
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: '#111111',
                    }}
                  >
                    <span className="text-sm font-bold tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-5 w-9 h-9 flex items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {step.icon}
                  </div>

                  <h3 className="text-base font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {step.body}
                  </p>

                  {index < steps.length - 1 && (
                    <div className="md:hidden mt-10 w-px h-10" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Bottom callout */}
        <Reveal delay={300} className="mt-20">
          <div
            className="rounded-xl p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" />
                <path d="M12 8v4m0 4h.01" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span className="text-white font-medium">Fully air-gapped operation.</span>{' '}
              After the initial model download, Justice AI requires no internet connection. Everything
              — embedding, retrieval, and generation — runs on your hardware. Nothing leaves your machine.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
