'use client'

import { Reveal } from './Reveal'

const features = [
  {
    title: 'Confidentiality by Design',
    body: 'ChatGPT and cloud AI tools cannot guarantee attorney-client privilege. Justice AI runs entirely on your machine. No black box systems. No data ownership risks. Your case files stay yours.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 3L5 7.5v8c0 6.08 4.67 11.77 11 13 6.33-1.23 11-6.92 11-13v-8L16 3z"
          stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <rect x="11.5" y="14" width="9" height="7" rx="1.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" fill="none" />
        <path d="M13 14v-2.5a3 3 0 016 0V14" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <circle cx="16" cy="17.5" r="1.2" fill="rgba(255,255,255,0.55)" />
        <rect x="15.4" y="17.5" width="1.2" height="2" rx="0.6" fill="rgba(255,255,255,0.55)" />
      </svg>
    ),
  },
  {
    title: 'Zero Hallucinations',
    body: 'Every answer is grounded strictly in the documents you load. If the answer is not in your files, Justice AI says so — clearly. No fabrications. No filling gaps with pretrained knowledge.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" fill="none" />
        <path d="M10 16.5l4 4 8-8" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Efficiency for Legal Professionals',
    body: "Your time is too valuable to manually search hundreds of case files. Let Justice AI do the retrieval. You focus on analysis, strategy, and the legal conclusions only you can make.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" fill="none" />
        <path d="M16 10v6l4 2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Plug-and-Play for Any Specialty',
    body: 'Immigration attorney? Load immigration case files. Contracts lawyer? Load contracts. Justice AI adapts to your practice area through the documents you provide — no configuration required.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 4h11l5 5v19H8V4z" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M19 4v5h5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinejoin="round" />
        <line x1="12" y1="20" x2="20" y2="20" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="12" y1="23" x2="17" y2="23" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Sustainable by Default',
    body: 'Running a small local model instead of hitting a massive data center cuts your AI energy footprint dramatically. Justice AI is not just better for your clients — it is better for the planet.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4z"
          stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" fill="none" />
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

        <Reveal className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Why Justice AI?
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Built for legal professionals who cannot afford confidentiality risks — or wasted time.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {features.slice(0, 3).map((feature, i) => (
            <Reveal key={feature.title} variant="scale" delay={i * 100}>
              <FeatureCard feature={feature} />
            </Reveal>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:max-w-2xl md:mx-auto">
          {features.slice(3).map((feature, i) => (
            <Reveal key={feature.title} variant="scale" delay={(i + 3) * 100}>
              <FeatureCard feature={feature} />
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
      className="card-lift relative h-full rounded-xl p-7 flex flex-col gap-5"
      style={{
        background: '#0f0f0f',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="w-9 h-9 flex items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {feature.icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white mb-2 leading-snug tracking-tight">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {feature.body}
        </p>
      </div>
    </div>
  )
}
