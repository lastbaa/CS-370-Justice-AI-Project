'use client'

export default function Hero() {
  return (
    <section
      className="relative min-h-[100vh] flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Subtle grid */}
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Faint white radial at top */}
      <div className="absolute top-0 left-0 right-0 h-[60vh] pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.025) 0%, transparent 70%)' }} />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: 'linear-gradient(to top, #080808, transparent)' }} />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">

        {/* Icon — gold is ONLY here and in the "AI" text */}
        <div className="hero-icon mb-10">
          <svg width="68" height="68" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="48" cy="48" r="44" fill="rgba(201,168,76,0.04)" />
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

        {/* Badge */}
        <div className="hero-badge mb-8">
          <span className="text-xs font-medium tracking-[0.18em] uppercase px-4 py-1.5 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.02)' }}>
            Built for Legal Professionals
          </span>
        </div>

        {/* Title — only "AI" stays gold */}
        <h1 className="hero-title text-7xl sm:text-8xl lg:text-9xl font-bold tracking-tight leading-none mb-6" style={{ letterSpacing: '-0.03em' }}>
          Justice <span style={{ color: '#c9a84c' }}>AI</span>
        </h1>

        {/* Subheading */}
        <p className="hero-sub text-xl sm:text-2xl font-light mb-5 tracking-tight" style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '-0.01em' }}>
          The research assistant that never leaves your office.
        </p>

        {/* Body */}
        <p className="hero-body text-base sm:text-lg leading-relaxed max-w-2xl mb-6" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Enterprise tools like ChatGPT cannot guarantee confidentiality. Justice AI runs entirely on your machine — no data sent externally, ever. Load your case files and get cited answers grounded strictly in your documents.
        </p>

        {/* Disclaimer */}
        <p className="hero-disclaimer text-sm italic mb-10 px-5 py-3 rounded-lg" style={{ color: 'rgba(255,255,255,0.28)', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
          Not legal advice — a research tool for the attorneys who give it.
        </p>

        {/* CTAs — white primary, ghost secondary */}
        <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#download"
            className="inline-flex items-center gap-2.5 font-semibold text-sm px-7 py-3.5 rounded-lg transition-all duration-200"
            style={{ background: '#ffffff', color: '#080808' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.88)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#ffffff' }}
          >
            <svg width="15" height="18" viewBox="0 0 18 22" fill="currentColor"><path d="M14.94 11.44c-.02-2.53 2.06-3.75 2.16-3.81-1.18-1.72-3.01-1.96-3.66-1.98-1.56-.16-3.05.92-3.84.92-.79 0-2.01-.9-3.31-.88-1.7.03-3.27 1-4.14 2.52-1.77 3.07-.45 7.61 1.27 10.1.84 1.22 1.85 2.59 3.17 2.54 1.28-.05 1.76-.82 3.31-.82 1.54 0 1.98.82 3.33.8 1.37-.03 2.24-1.24 3.07-2.47.97-1.41 1.37-2.78 1.39-2.85-.03-.01-2.67-1.02-2.69-4.06zM12.47 3.8c.7-.85 1.17-2.02 1.04-3.2-1.01.04-2.22.67-2.94 1.52-.65.75-1.21 1.95-1.06 3.1 1.12.09 2.27-.57 2.96-1.42z" /></svg>
            Download for macOS
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-sm font-medium px-7 py-3.5 rounded-lg transition-all duration-200"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.28)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)' }}
          >
            Learn How It Works
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 3l5 5-5 5M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>

      </div>
    </section>
  )
}
