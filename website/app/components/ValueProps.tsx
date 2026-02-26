'use client'

import { Reveal } from './Reveal'
import { WordReveal } from './WordReveal'

const features = [
  {
    title: 'Attorney-Client Privilege, Preserved',
    body: 'The moment you paste a document into ChatGPT or any cloud tool, you may have waived privilege. Justice AI never transmits your files — they never leave your hard drive.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <path d="M16 3L5 7.5v8c0 6.08 4.67 11.77 11 13 6.33-1.23 11-6.92 11-13v-8L16 3z" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <rect x="11.5" y="14" width="9" height="7" rx="1.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" fill="none" />
        <path d="M13 14v-2.5a3 3 0 016 0V14" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <circle cx="16" cy="17.5" r="1.2" fill="rgba(255,255,255,0.55)" />
      </svg>
    ),
  },
  {
    title: 'Grounded Answers Only',
    body: "Justice AI cannot hallucinate. Every response is anchored to text in your documents. If the answer isn't there, it says so — no fabrications, no assumptions, no guesswork.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" fill="none" />
        <path d="M10 16.5l4 4 8-8" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Hours of Search in Seconds',
    body: 'A junior associate might spend half a day searching a 500-page deposition. Justice AI returns a cited excerpt in under ten seconds — letting your team focus on analysis, not retrieval.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" fill="none" />
        <path d="M16 10v6l4 2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Your Documents Define Its Knowledge',
    body: 'There is no shared model memory, no fine-tuning required. Load the files relevant to a matter and Justice AI instantly knows only what those documents contain.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <path d="M8 4h11l5 5v19H8V4z" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M19 4v5h5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinejoin="round" />
        <line x1="12" y1="20" x2="20" y2="20" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="12" y1="23" x2="17" y2="23" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Dramatically Lower Energy Footprint',
    body: "Running a compact local model uses a fraction of the compute of a cloud API call. Justice AI isn't just better for your clients — it's a more responsible choice for the environment.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4z" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" fill="none" />
        <path d="M16 4c0 6-4 10-4 10s4 2 4 8" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M28 16c-6 0-10-4-10-4s-2 4-8 4" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
]

export default function ValueProps() {
  return (
    <section className="py-32 px-6" style={{ background: '#080808' }}>
      <div className="max-w-6xl mx-auto">

        <Reveal className="flex justify-center mb-6">
          <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'rgba(201,168,76,0.55)' }}>
            01 — Why It Matters
          </span>
        </Reveal>

        <div className="text-center mb-5">
          <WordReveal
            text="Built for What Lawyers Actually Need"
            as="h2"
            stagger={75}
            className="text-3xl sm:text-4xl font-bold text-white"
            style={{ letterSpacing: '-0.02em' }}
          />
        </div>

        <Reveal className="text-center mb-20">
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Not a generic AI chatbot. A research tool engineered around the specific constraints of legal practice.
          </p>
        </Reveal>

        {/* 3-col top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {features.slice(0, 3).map((f, i) => (
            <Reveal key={f.title} variant="scale" delay={i * 100}>
              <FeatureCard feature={f} />
            </Reveal>
          ))}
        </div>
        {/* 2-col bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:max-w-[calc(66.67%+0.5rem)] md:mx-auto">
          {features.slice(3).map((f, i) => (
            <Reveal key={f.title} variant="scale" delay={(i + 3) * 100}>
              <FeatureCard feature={f} />
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  return (
    <div
      className="card-lift h-full rounded-xl p-7 flex flex-col gap-4"
      style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center rounded-lg"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {feature.icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white mb-2 leading-snug" style={{ letterSpacing: '-0.01em' }}>
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {feature.body}
        </p>
      </div>
    </div>
  )
}
