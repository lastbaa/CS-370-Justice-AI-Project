"use client";

import { Shield, CheckCircle2, Zap, WifiOff, FileText } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { WordReveal } from "./WordReveal";

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={cn("min-h-[14rem] list-none", area)}>
      <div
        className="relative h-full rounded-[1.25rem] p-2 md:rounded-[1.5rem] md:p-3"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
        />
        <div
          className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6"
          style={{
            background: '#0f0f0f',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 0 40px rgba(0,0,0,0.4)',
          }}
        >
          <div className="relative flex flex-1 flex-col justify-between gap-4">
            <div
              className="w-fit rounded-lg p-2.5"
              style={{
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.18)',
              }}
            >
              {icon}
            </div>
            <div className="space-y-2.5">
              <h3
                className="pt-0.5 text-xl font-semibold leading-snug tracking-tight text-white md:text-2xl"
                style={{ letterSpacing: '-0.03em' }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed md:text-base" style={{ color: 'rgba(255,255,255,0.38)' }}>
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default function FeaturesGrid() {
  return (
    <section className="py-32 px-6" style={{ background: '#080808' }}>
      <div className="max-w-6xl mx-auto">

        <Reveal className="flex justify-center mb-6">
          <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'rgba(201,168,76,0.55)' }}>
            01 — Why It Matters
          </span>
        </Reveal>

        <div className="text-center mb-5">
          <WordReveal
            text="Built for What Lawyers Actually Need"
            as="h2"
            stagger={75}
            className="text-3xl sm:text-4xl font-bold text-white"
            style={{ letterSpacing: '-0.02em' }}
          />
        </div>

        <Reveal className="text-center mb-16">
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Not a generic AI chatbot. A research tool engineered around the specific constraints of legal practice.
          </p>
        </Reveal>

        <Reveal variant="scale">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
            <GridItem
              area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
              icon={<Shield className="h-5 w-5" style={{ color: '#c9a84c' }} />}
              title="Attorney-Client Privilege, Preserved"
              description="The moment files touch a cloud AI, privilege may be waived. Justice AI processes everything locally — your documents never transmit anywhere."
            />
            <GridItem
              area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
              icon={<CheckCircle2 className="h-5 w-5" style={{ color: '#c9a84c' }} />}
              title="Grounded Answers Only"
              description="Every response is anchored to exact text in your documents. If the answer isn't there, it says so — no hallucinations, no assumptions."
            />
            <GridItem
              area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
              icon={<Zap className="h-5 w-5" style={{ color: '#c9a84c' }} />}
              title="Hours of Research in Seconds"
              description="A junior associate might spend half a day searching a 500-page deposition. Justice AI returns a cited excerpt in under ten seconds — letting your team focus on analysis, not retrieval."
            />
            <GridItem
              area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
              icon={<WifiOff className="h-5 w-5" style={{ color: '#c9a84c' }} />}
              title="No Cloud. No Compromise."
              description="Air-gapped operation. No API keys, no subscriptions, no telemetry. Runs entirely on your hardware, under your control."
            />
            <GridItem
              area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
              icon={<FileText className="h-5 w-5" style={{ color: '#c9a84c' }} />}
              title="Your Documents Define Its Knowledge"
              description="Load the files relevant to a matter and Justice AI instantly knows only what those documents contain. No shared model memory, no data leakage between matters."
            />
          </ul>
        </Reveal>

      </div>
    </section>
  );
}
