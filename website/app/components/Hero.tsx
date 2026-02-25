'use client'

export default function Hero() {
  return (
    <section
      className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 90% 60% at 50% 20%, rgba(201,168,76,0.09) 0%, transparent 65%), #0a0a0a',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#c9a84c 1px, transparent 1px), linear-gradient(90deg, #c9a84c 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Decorative scales icon */}
      <div className="relative mb-10">
        <div className="w-24 h-24 flex items-center justify-center">
          <svg
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-90"
          >
            <circle cx="48" cy="48" r="44" fill="rgba(201,168,76,0.06)" />
            <circle cx="48" cy="48" r="32" fill="rgba(201,168,76,0.05)" />
            <circle cx="48" cy="17" r="3.5" fill="#c9a84c" />
            <rect x="46.25" y="17" width="3.5" height="54" fill="#c9a84c" rx="1" />
            <rect x="32" y="71" width="32" height="4" rx="2" fill="#c9a84c" />
            <rect x="40" y="75" width="16" height="4" rx="2" fill="#c9a84c" />
            <rect x="16" y="28" width="64" height="3.5" rx="1.75" fill="#c9a84c" />
            <line x1="23" y1="31.5" x2="18" y2="56" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="73" y1="31.5" x2="78" y2="56" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M8 56 Q18 68 28 56" stroke="#c9a84c" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M68 56 Q78 68 88 56" stroke="#c9a84c" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-[#2a2a2a] bg-[#141414] text-[#8a8a8a] text-xs font-medium px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] inline-block" />
          Built for Legal Professionals
        </div>

        {/* Headline */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-none">
          Justice{' '}
          <span className="text-[#c9a84c]">AI</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl lg:text-3xl font-light text-white mb-6 tracking-tight">
          The research assistant that never leaves your office.
        </p>

        {/* Body */}
        <p className="text-base sm:text-lg text-[#8a8a8a] max-w-2xl mx-auto mb-4 leading-relaxed">
          Enterprise tools like ChatGPT cannot guarantee confidentiality. Justice AI runs entirely
          on your machine &mdash; no data sent externally, ever. Load your case files and get
          cited answers grounded strictly in your documents.
        </p>

        {/* Scope disclaimer */}
        <p className="text-sm text-[#8a8a8a] max-w-xl mx-auto mb-12 leading-relaxed italic border border-[#2a2a2a] rounded-lg px-5 py-3 bg-[#141414]">
          Not legal advice &mdash; a powerful research tool for the attorneys who give it.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#download"
            className="inline-flex items-center gap-3 bg-[#c9a84c] text-[#0a0a0a] font-semibold text-base px-8 py-4 rounded-md hover:bg-[#e8c97e] transition-colors duration-200 shadow-lg"
          >
            <svg width="18" height="22" viewBox="0 0 18 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.94 11.44c-.02-2.53 2.06-3.75 2.16-3.81-1.18-1.72-3.01-1.96-3.66-1.98-1.56-.16-3.05.92-3.84.92-.79 0-2.01-.9-3.31-.88-1.7.03-3.27 1-4.14 2.52-1.77 3.07-.45 7.61 1.27 10.1.84 1.22 1.85 2.59 3.17 2.54 1.28-.05 1.76-.82 3.31-.82 1.54 0 1.98.82 3.33.8 1.37-.03 2.24-1.24 3.07-2.47.97-1.41 1.37-2.78 1.39-2.85-.03-.01-2.67-1.02-2.69-4.06zM12.47 3.8c.7-.85 1.17-2.02 1.04-3.2-1.01.04-2.22.67-2.94 1.52-.65.75-1.21 1.95-1.06 3.1 1.12.09 2.27-.57 2.96-1.42z" />
            </svg>
            Download for macOS
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 border border-[#2a2a2a] text-white font-medium text-base px-8 py-4 rounded-md hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors duration-200"
          >
            Learn How It Works
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3l5 5-5 5M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
    </section>
  )
}
