'use client'

const features = [
  {
    title: 'Confidentiality by Design',
    body: 'ChatGPT and cloud AI tools cannot guarantee attorney-client privilege. Justice AI runs entirely on your machine. No black box systems. No data ownership risks. Your case files stay yours.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 3L5 7.5v8c0 6.08 4.67 11.77 11 13 6.33-1.23 11-6.92 11-13v-8L16 3z"
          stroke="#c9a84c" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <rect x="11.5" y="14" width="9" height="7" rx="1.5" stroke="#c9a84c" strokeWidth="1.6" fill="none" />
        <path d="M13 14v-2.5a3 3 0 016 0V14" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <circle cx="16" cy="17.5" r="1.2" fill="#c9a84c" />
        <rect x="15.4" y="17.5" width="1.2" height="2" rx="0.6" fill="#c9a84c" />
      </svg>
    ),
  },
  {
    title: 'Zero Hallucinations',
    body: 'Every answer is grounded strictly in the documents you load. If the answer is not in your files, Justice AI says so — clearly. No fabrications. No filling gaps with pretrained knowledge.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" stroke="#c9a84c" strokeWidth="1.8" fill="none" />
        <path d="M10 16.5l4 4 8-8" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Efficiency for Legal Professionals',
    body: "Your time is too valuable to manually search through hundreds of case files. Let Justice AI do the retrieval. You focus on analysis, strategy, and the legal conclusions only you can make.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" stroke="#c9a84c" strokeWidth="1.8" fill="none" />
        <path d="M16 10v6l4 2" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Plug-and-Play for Any Specialty',
    body: 'Immigration attorney? Load immigration case files. Contracts lawyer? Load contracts. Justice AI adapts to your practice area through the documents you provide — no configuration required.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 4h11l5 5v19H8V4z" stroke="#c9a84c" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M19 4v5h5" stroke="#c9a84c" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 15c0-1.1.9-2 2-2h.5v2.5H12V15zm4.5 0c0-1.1.9-2 2-2h.5v2.5h-2.5V15z" fill="#c9a84c" />
        <line x1="12" y1="20" x2="20" y2="20" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="12" y1="23" x2="17" y2="23" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Sustainable by Default',
    body: 'Running a small local model instead of hitting a massive data center cuts your AI energy footprint dramatically. Justice AI is not just better for your clients — it is better for the planet.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4z"
          stroke="#c9a84c" strokeWidth="1.8" fill="none" />
        <path d="M16 4c0 6-4 10-4 10s4 2 4 8" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M28 16c-6 0-10-4-10-4s-2 4-8 4" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
]

export default function ValueProps() {
  return (
    <section className="py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Why Justice AI?
          </h2>
          <p className="text-[#8a8a8a] text-lg max-w-xl mx-auto">
            Built for legal professionals who cannot afford confidentiality risks — or wasted time.
          </p>
        </div>

        {/* Cards grid — 3 on top, 2 centered below */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {features.slice(0, 3).map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:max-w-2xl md:mx-auto">
          {features.slice(3).map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  return (
    <div
      className="relative bg-[#141414] border border-[#2a2a2a] rounded-xl p-8 flex flex-col gap-5 group hover:border-[#c9a84c]/40 transition-colors duration-300"
      style={{ borderTop: '2px solid #c9a84c' }}
    >
      <div className="w-12 h-12 flex items-center justify-center">
        {feature.icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 leading-snug">
          {feature.title}
        </h3>
        <p className="text-[#8a8a8a] text-sm leading-relaxed">
          {feature.body}
        </p>
      </div>
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(201,168,76,0.05) 0%, transparent 70%)' }}
      />
    </div>
  )
}
