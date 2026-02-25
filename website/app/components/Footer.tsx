'use client'

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#2a2a2a] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Left: logo + tagline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <svg
                width="22"
                height="22"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="14" cy="5" r="1.5" fill="#c9a84c" />
                <rect x="13.25" y="5" width="1.5" height="16" fill="#c9a84c" />
                <rect x="9" y="21" width="10" height="1.5" rx="0.75" fill="#c9a84c" />
                <rect x="12" y="22.5" width="4" height="1.5" rx="0.75" fill="#c9a84c" />
                <rect x="5" y="8.25" width="18" height="1.5" rx="0.75" fill="#c9a84c" />
                <line x1="7" y1="9.75" x2="5.5" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="21" y1="9.75" x2="22.5" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M3 17 Q5.5 20 8 17" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                <path d="M20 17 Q22.5 20 25 17" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              </svg>
              <span className="text-[#c9a84c] font-semibold text-base tracking-tight">
                Justice AI
              </span>
            </div>
            <p className="text-[#8a8a8a] text-sm max-w-xs">
              Built for legal professionals who demand privacy.
            </p>
          </div>

          {/* Right: links + copyright */}
          <div className="flex flex-col items-start md:items-end gap-4">
            {/* Nav links */}
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-[#8a8a8a] text-sm hover:text-[#c9a84c] transition-colors duration-200"
              >
                {/* GitHub icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
              <a
                href="#"
                className="text-[#8a8a8a] text-sm hover:text-[#c9a84c] transition-colors duration-200"
              >
                License
              </a>
            </div>

            {/* Copyright */}
            <p className="text-[#8a8a8a] text-xs">
              &copy; 2025 Justice AI. All rights reserved.
            </p>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-10 pt-6 border-t border-[#2a2a2a]">
          <p className="text-[#8a8a8a] text-xs text-center">
            Justice AI is open-source software. Your documents never leave your machine.
            No telemetry. No cloud. No compromise.
          </p>
        </div>
      </div>
    </footer>
  )
}
