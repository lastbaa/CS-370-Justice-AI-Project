'use client'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0a0a0a] border-b border-[#2a2a2a]">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            {/* Scales of Justice */}
            {/* Top center beam pivot */}
            <circle cx="14" cy="5" r="1.5" fill="#c9a84c" />
            {/* Vertical column */}
            <rect x="13.25" y="5" width="1.5" height="16" fill="#c9a84c" />
            {/* Base */}
            <rect x="9" y="21" width="10" height="1.5" rx="0.75" fill="#c9a84c" />
            <rect x="12" y="22.5" width="4" height="1.5" rx="0.75" fill="#c9a84c" />
            {/* Horizontal beam */}
            <rect x="5" y="8.25" width="18" height="1.5" rx="0.75" fill="#c9a84c" />
            {/* Left chain */}
            <line x1="7" y1="9.75" x2="5.5" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
            {/* Right chain */}
            <line x1="21" y1="9.75" x2="22.5" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
            {/* Left pan */}
            <path d="M3 17 Q5.5 20 8 17" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            {/* Right pan */}
            <path d="M20 17 Q22.5 20 25 17" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          </svg>
          <span className="text-[#c9a84c] font-semibold text-lg tracking-tight">
            Justice AI
          </span>
        </a>

        {/* Right CTA */}
        <a
          href="#download"
          className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#0a0a0a] font-semibold text-sm px-5 py-2 rounded-md hover:bg-[#e8c97e] transition-colors duration-200"
        >
          Download
        </a>
      </div>
    </nav>
  )
}
