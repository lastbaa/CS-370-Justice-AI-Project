'use client'

const items = [
  '100% Local Execution',
  'Zero External Data',
  'Attorney-Client Safe',
  'Open Source',
  'No Telemetry',
  'Fully Air-Gapped',
  'Citation-First Answers',
  'No Cloud. No Compromise.',
]

export function Marquee() {
  // Duplicate for seamless loop
  const all = [...items, ...items]

  return (
    <div
      className="relative overflow-hidden py-4 select-none"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#080808' }}
    >
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #080808, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #080808, transparent)' }} />

      <div className="marquee-track flex items-center gap-0 whitespace-nowrap">
        {all.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 px-6">
            <span className="text-xs font-medium tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {item}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.4rem' }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
