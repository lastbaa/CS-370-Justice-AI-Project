'use client'

import { Reveal } from './Reveal'
import { WordReveal } from './WordReveal'

const cases = [
  {
    area: 'Contract Review',
    query: '"Flag every clause that deviates from our standard indemnification language."',
    body: 'Load a batch of contracts. Justice AI surfaces non-standard terms, missing clauses, and unusual provisions — across hundreds of documents at once.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12h6M9 16h4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    area: 'Litigation Preparation',
    query: '"What does the plaintiff allege regarding the breach in the amended complaint?"',
    body: 'Surface key allegations, admissions, and precedents buried across thousands of pages of discovery, pleadings, and case law — in seconds.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 6l9-3 9 3v6c0 5.25-3.75 9-9 10.5C6.75 21 3 17.25 3 12V6z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M9 12l2 2 4-4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    area: 'Immigration Law',
    query: '"Does this applicant\'s employment history satisfy the EB-2 NIW criteria?"',
    body: 'Cross-reference applications, country condition reports, and USCIS policy memos without exposing any client data to external AI services.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
        <path d="M12 3c0 4-3 7-3 9s3 5 3 9M3 12h18" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    area: 'Corporate M&A Due Diligence',
    query: '"List every material adverse change clause across the target\'s agreements."',
    body: 'Run due diligence across an entire data room locally. No files leave your machine, no vendor agreements required, no billable hours on search.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M2 9h20M2 15h20M12 3v18" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    area: 'Real Estate',
    query: '"What are the renewal options and rent escalation terms in this lease?"',
    body: 'Extract key dates, conditions, and obligations from complex lease agreements, title documents, and purchase contracts without manual page-turning.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l9-7 9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    area: 'Regulatory Compliance',
    query: '"Does our privacy policy satisfy the data residency requirements in these regulations?"',
    body: 'Map internal policies against regulatory requirements, flag gaps, and document your compliance reasoning — without sending sensitive policy documents to the cloud.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
        <path d="M9 12l2 2 4-4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function UseCases() {
  return (
    <section className="py-32 px-6" style={{ background: '#080808' }}>
      <div className="max-w-6xl mx-auto">
        <div className="border-t mb-32" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
      </div>

      <div className="max-w-6xl mx-auto">
        <Reveal className="flex justify-center mb-6">
          <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'rgba(201,168,76,0.55)' }}>
            02 — Practice Areas
          </span>
        </Reveal>

        <div className="text-center mb-5">
          <WordReveal
            text="Built for Every Specialty"
            as="h2"
            stagger={80}
            className="text-3xl sm:text-4xl font-bold text-white"
            style={{ letterSpacing: '-0.02em' }}
          />
        </div>

        <Reveal className="text-center mb-20">
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Your documents define your knowledge base. Justice AI adapts to any practice area the moment you load your files.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c, i) => (
            <Reveal key={c.area} variant="scale" delay={i * 80}>
              <div
                className="card-lift h-full rounded-xl p-6 flex flex-col gap-4"
                style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {c.icon}
                  </div>
                  <span className="text-xs font-semibold text-white tracking-tight">{c.area}</span>
                </div>

                <p
                  className="text-xs leading-relaxed rounded-lg px-3 py-2.5 italic"
                  style={{ color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {c.query}
                </p>

                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {c.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
