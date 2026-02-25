'use client'

const steps = [
  {
    number: '1',
    title: 'Load Your Documents',
    body: 'Drag in a folder of case files, contracts, or briefs. Justice AI accepts PDF and Word documents. All parsing happens locally — nothing is transmitted.',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Folder */}
        <path
          d="M3 8a2 2 0 012-2h5l2 2h11a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
          stroke="#c9a84c"
          strokeWidth="1.6"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Upload arrow */}
        <path
          d="M14 21v-7m-3 3l3-3 3 3"
          stroke="#c9a84c"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    number: '2',
    title: 'Ask Your Question',
    body: "Type any legal question in plain English. 'What does clause 7 say about termination?' or 'Find all references to the indemnification period.'",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chat bubble */}
        <path
          d="M5 6a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H9l-4 4V6z"
          stroke="#c9a84c"
          strokeWidth="1.6"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Text lines */}
        <line x1="10" y1="10" x2="18" y2="10" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="10" y1="14" x2="15" y2="14" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '3',
    title: 'Get Cited Answers',
    body: 'Receive a direct answer with source citations — filename, page number, and exact quoted text. Verify every answer instantly.',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Document with checkmark */}
        <path
          d="M7 4h10l4 4v16H7V4z"
          stroke="#c9a84c"
          strokeWidth="1.6"
          fill="none"
          strokeLinejoin="round"
        />
        <path
          d="M17 4v4h4"
          stroke="#c9a84c"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Checkmark */}
        <path
          d="M11 14.5l2.5 2.5 5-5"
          stroke="#c9a84c"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-[#0a0a0a]">
      {/* Top divider */}
      <div className="max-w-6xl mx-auto">
        <div className="border-t border-[#2a2a2a] mb-24" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-[#8a8a8a] text-lg max-w-xl mx-auto">
            Three steps from document to verified, cited answer — all on your machine.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-[3.25rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-[#2a2a2a]" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Step number bubble */}
                <div className="relative z-10 w-[4.5rem] h-[4.5rem] rounded-full border-2 border-[#c9a84c] bg-[#0a0a0a] flex flex-col items-center justify-center mb-8 shadow-[0_0_24px_rgba(201,168,76,0.12)]">
                  <span className="text-2xl font-bold text-[#c9a84c] leading-none">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-5 w-10 h-10 flex items-center justify-center">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-[#8a8a8a] text-sm leading-relaxed max-w-xs mx-auto">
                  {step.body}
                </p>

                {/* Mobile connector (between steps) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden mt-8 w-px h-12 bg-[#2a2a2a]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom callout */}
        <div className="mt-20 bg-[#141414] border border-[#2a2a2a] rounded-xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="#c9a84c" strokeWidth="1.6" />
              <path d="M12 8v4m0 4h.01" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[#8a8a8a] text-sm leading-relaxed">
            <span className="text-white font-medium">Fully air-gapped operation.</span>{' '}
            After the initial model download, Justice AI requires no internet connection. Everything
            — embedding, retrieval, and generation — runs on your hardware. Nothing leaves your machine.
          </p>
        </div>
      </div>
    </section>
  )
}
