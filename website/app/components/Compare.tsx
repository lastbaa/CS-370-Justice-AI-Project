'use client'

import { Reveal } from './Reveal'
import { WordReveal } from './WordReveal'

const rows = [
  {
    feature: 'Data privacy',
    cloud: 'Files transmitted to third-party servers',
    local: 'Everything stays on your machine',
  },
  {
    feature: 'Answer accuracy',
    cloud: 'Hallucinations — model may confabulate',
    local: 'Grounded strictly in your documents',
  },
  {
    feature: 'Cost',
    cloud: 'Monthly subscription or per-query pricing',
    local: 'Free and open source — forever',
  },
  {
    feature: 'Connectivity',
    cloud: 'Requires active internet connection',
    local: 'Fully offline after initial setup',
  },
  {
    feature: 'Attorney-client privilege',
    cloud: 'Risk of waiver when files leave your control',
    local: 'Privilege preserved — always',
  },
  {
    feature: 'Source citations',
    cloud: 'No verifiable source references',
    local: 'Every answer cites filename and page',
  },
]

export default function Compare() {
  return (
    <section className="py-24 px-6" style={{ background: '#080808' }}>
      <div className="max-w-6xl mx-auto">
        <div className="border-t mb-24" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
      </div>

      <div className="max-w-5xl mx-auto">
        <Reveal className="flex justify-center mb-6">
          <span
            className="text-xs font-medium tracking-[0.2em] uppercase"
            style={{ color: 'rgba(201,168,76,0.55)' }}
          >
            The Difference
          </span>
        </Reveal>

        <div className="text-center mb-5">
          <WordReveal
            text="Not All AI Is the Same"
            as="h2"
            stagger={80}
            className="text-3xl sm:text-4xl font-bold text-white"
            style={{ letterSpacing: '-0.02em' }}
          />
        </div>

        <Reveal className="text-center mb-14">
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Cloud AI tools were built for convenience, not legal practice. The difference in
            how they handle your data isn't a detail — it's everything.
          </p>
        </Reveal>

        <Reveal variant="scale" delay={100}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0a' }}
          >
            {/* Column headers */}
            <div
              className="grid border-b"
              style={{
                gridTemplateColumns: '1fr 1fr 1fr',
                borderColor: 'rgba(255,255,255,0.07)',
                background: '#070707',
              }}
            >
              <div className="px-6 py-4">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                >
                  Feature
                </span>
              </div>
              <div
                className="px-6 py-4 border-l"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'rgba(248,81,73,0.7)' }}
                  />
                  <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Cloud AI Tools
                  </span>
                </div>
              </div>
              <div
                className="px-6 py-4 border-l"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: 'rgba(201,168,76,0.03)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#c9a84c' }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'rgba(201,168,76,0.85)' }}
                  >
                    Justice AI
                  </span>
                </div>
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={row.feature}
                className="grid border-b"
                style={{
                  gridTemplateColumns: '1fr 1fr 1fr',
                  borderColor: 'rgba(255,255,255,0.04)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}
              >
                <div className="px-6 py-4 flex items-center">
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    {row.feature}
                  </span>
                </div>

                <div
                  className="px-6 py-4 border-l flex items-start gap-2.5"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="shrink-0 mt-0.5"
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="6"
                      fill="rgba(248,81,73,0.08)"
                      stroke="rgba(248,81,73,0.2)"
                      strokeWidth="1"
                    />
                    <path
                      d="M4.5 4.5l5 5M9.5 4.5l-5 5"
                      stroke="#f85149"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    className="text-xs leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.33)' }}
                  >
                    {row.cloud}
                  </span>
                </div>

                <div
                  className="px-6 py-4 border-l flex items-start gap-2.5"
                  style={{
                    borderColor: 'rgba(255,255,255,0.04)',
                    background: 'rgba(201,168,76,0.02)',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="shrink-0 mt-0.5"
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="6"
                      fill="rgba(201,168,76,0.1)"
                      stroke="rgba(201,168,76,0.25)"
                      strokeWidth="1"
                    />
                    <path
                      d="M4 7l2 2.5 4-4"
                      stroke="#c9a84c"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    className="text-xs leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {row.local}
                  </span>
                </div>
              </div>
            ))}

            {/* Footer note */}
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{ background: 'rgba(201,168,76,0.03)', borderTop: '1px solid rgba(201,168,76,0.08)' }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L2 3.5v5c0 3.8 2.6 7.3 6 8 3.4-.7 6-4.2 6-8v-5L8 1z"
                  stroke="rgba(201,168,76,0.6)"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <span style={{ color: 'rgba(201,168,76,0.7)' }}>
                  Justice AI is the only choice
                </span>{' '}
                when your ethical obligations require it — not a convenience, a requirement.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
