"use client";

import VaporizeTextCycle, { Tag } from "@/components/ui/vapour-text-effect";
import { Reveal } from "./Reveal";

// Cycling phrases that showcase Justice AI's privacy & speed story
const STATS_PHRASES = [
  "100% On-Device",
  "Zero Cloud Calls",
  "Cited Sources Only",
  "No Subscriptions",
  "Air-Gapped Safe",
  "No Hallucinations",
  "Your Data Stays Yours",
];

export default function VaporizeStats() {
  return (
    <section
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto relative">

        {/* Label */}
        <Reveal className="flex justify-center mb-4">
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase"
            style={{ color: 'rgba(201,168,76,0.45)' }}
          >
            Privacy by design
          </span>
        </Reveal>

        {/* Vaporize canvas — tall enough for ~96px text */}
        <div style={{ height: 120, width: '100%', position: 'relative' }}>
          <VaporizeTextCycle
            texts={STATS_PHRASES}
            font={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: "72px",
              fontWeight: 700,
            }}
            color="rgb(255, 255, 255)"
            spread={6}
            density={6}
            animation={{
              vaporizeDuration: 1.8,
              fadeInDuration: 0.9,
              waitDuration: 1.2,
            }}
            direction="left-to-right"
            alignment="center"
            tag={Tag.H2}
          />
        </div>

        {/* Supporting sub-line */}
        <Reveal className="flex justify-center mt-6">
          <p
            className="text-sm sm:text-base text-center leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.28)', maxWidth: 440 }}
          >
            Legal research demands confidentiality. Justice AI processes everything on your machine — your documents, your queries, and your answers never leave your device.
          </p>
        </Reveal>

        {/* Stat pills */}
        <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
          {[
            { stat: '100%', label: 'Local Processing', sub: 'No cloud compute' },
            { stat: '0 bytes', label: 'Sent Externally', sub: 'Total network traffic' },
            { stat: '<5s', label: 'Search Time', sub: 'Across loaded documents' },
            { stat: '∞', label: 'Documents', sub: 'No per-file limits' },
          ].map(({ stat, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center px-6 py-4 rounded-2xl"
              style={{
                background: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.07)',
                minWidth: 120,
              }}
            >
              <span
                className="text-2xl font-bold leading-none"
                style={{ color: '#c9a84c', letterSpacing: '-0.03em' }}
              >
                {stat}
              </span>
              <span
                className="text-[11px] mt-1 font-semibold text-center leading-snug"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {label}
              </span>
              <span
                className="text-[10px] mt-0.5 text-center leading-snug"
                style={{ color: 'rgba(255,255,255,0.22)' }}
              >
                {sub}
              </span>
            </div>
          ))}
        </Reveal>

      </div>
    </section>
  );
}
