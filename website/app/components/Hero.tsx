'use client'

import { Typewriter } from './Typewriter'

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

      <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center">

        {/* Icon — gold only here and "AI" text */}
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

        {/* Title */}
        <h1 className="hero-title text-7xl sm:text-8xl lg:text-9xl font-bold tracking-tight leading-none mb-7" style={{ letterSpacing: '-0.03em' }}>
          Justice <span style={{ color: '#c9a84c' }}>AI</span>
        </h1>

        {/* Typewriter subheading — replaces the static hero-sub */}
        <div className="hero-sub mb-6" style={{ minHeight: '2.5rem' }}>
          <p className="text-xl sm:text-2xl font-light tracking-tight" style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '-0.01em' }}>
            <Typewriter
              text="The research assistant that never leaves your office."
              startDelay={900}
              speed={36}
            />
          </p>
        </div>

        {/* Body */}
        <p className="hero-body text-base sm:text-lg leading-relaxed max-w-2xl mb-6" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Enterprise tools like ChatGPT cannot guarantee confidentiality. Justice AI runs entirely on your machine — no data sent externally, ever. Load your case files and get cited answers grounded strictly in your documents.
        </p>

        {/* Disclaimer */}
        <p className="hero-disclaimer text-sm italic mb-10 px-5 py-3 rounded-lg" style={{ color: 'rgba(255,255,255,0.28)', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
          Not legal advice — a research tool for the attorneys who give it.
        </p>

        {/* CTAs */}
        <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Primary: generic Download → scrolls to all OS options */}
          <a
            href="#download"
            className="inline-flex items-center gap-2.5 font-semibold text-sm px-8 py-3.5 rounded-lg transition-all duration-200"
            style={{ background: '#ffffff', color: '#080808' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.88)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#ffffff' }}
          >
            {/* Download arrow icon */}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v9M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 14h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Download
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
