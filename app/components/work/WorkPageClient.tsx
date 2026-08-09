'use client';

// ============================================================================
// Work Page Client - Client wrapper for animations and interactivity
// ============================================================================

import Button from '@/components/Button';
import StatCounter from './StatCounter';
import CaseStudyCard from './CaseStudyCard';
import ArchitectureDiagram from './ArchitectureDiagram';
import {
  heroStats,
  caseStudies,
  architectureLayers,
  processSteps,
} from '@/lib/portfolio-data';

const processColors: Record<string, { icon: string; border: string }> = {
  emerald: { icon: 'bg-emerald-100 border-emerald-200', border: 'text-emerald-700' },
  blue: { icon: 'bg-blue-100 border-blue-200', border: 'text-blue-700' },
  purple: { icon: 'bg-purple-100 border-purple-200', border: 'text-purple-700' },
  amber: { icon: 'bg-amber-100 border-amber-200', border: 'text-amber-700' },
};

const stepEmojis = ['🎯', '📐', '🧪', '🚀'];

export default function WorkPageClient() {
  return (
    <div className="min-h-screen">
      {/* ================================================================
          Hero Section - Dark Editorial
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 pt-16 md:pt-24 pb-16 md:pb-20">
          {/* Accent line + label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Portfolio
            </span>
          </div>

          <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Proof of{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              work
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mb-12">
            NeedThisDone is led by Abe Reyes: a full-stack builder and operator focused on clear scope, durable systems, and human-controlled delivery.
          </p>

          {/* Stat counters - BJJ belt progression */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {heroStats.map((stat) => (
              <StatCounter key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          Case Study: NeedThisDone.com
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 py-16 md:py-24">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Featured Project
            </span>
          </div>

          <CaseStudyCard study={caseStudies[0]} />

          {/* Architecture diagram */}
          <div className="mt-20 md:mt-28">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-6">
              System Architecture
            </h3>
            <ArchitectureDiagram layers={architectureLayers} />
          </div>
        </div>
      </section>

      {/* ================================================================
          Case Study: Acadio
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Client Work
            </span>
          </div>

          <CaseStudyCard study={caseStudies[1]} />
        </div>
      </section>

      {/* ================================================================
          Background and practice - consolidates former About/Resume routes
          ================================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12">
          <div className="mb-10 md:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-500">
              Process
            </span>
          </div>
          <h2 className="font-playfair text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Experience and working style
          </h2>
          <p className="mt-4 max-w-3xl text-gray-600 leading-relaxed">Abe brings a background in U.S. Army medical service, seven years at Toyota Finance, and technical-operations work at Acadio to full-stack product delivery. The through line is calm communication, documented decisions, and follow-through under real constraints.</p>
        </div>

          <div className="mb-12 grid gap-5 md:grid-cols-3">
            {[
              ['Clear communication', 'Explain scope, evidence, and tradeoffs in plain language.'],
              ['Reliable follow-through', 'Keep commitments visible and turn handoffs into the next clear decision.'],
              ['Practical systems', 'Use Next.js, TypeScript, Supabase, PostgreSQL, Redis, Playwright, and Vitest where each one solves a defined problem.'],
            ].map(([title, description]) => <article key={title} className="rounded-2xl border border-[#183229]/10 bg-[#f7f4ed] p-5"><h3 className="font-black text-[#183229]">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{description}</p></article>)}
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            {processSteps.map((step, i) => {
              const colors = processColors[step.color];
              return (
                <div key={step.number}>
                  <div className={`w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br ${colors.icon} border flex items-center justify-center`}>
                    <span className="text-2xl">{stepEmojis[i]}</span>
                  </div>
                  <h3 className={`font-black text-lg mb-2 tracking-tight ${colors.border}`}>
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA Section - Dark Editorial
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 md:py-24">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 sm:px-10 md:px-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Let&apos;s Connect
            </span>
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
          </div>

          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Choose the proof that fits the problem
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Start with one contained website improvement or discuss a human-led managed AI operator pilot.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="green" href="/contact?offer=website-improvement" size="lg" className="shadow-lg shadow-emerald-500/25">
              Improve My Website
            </Button>
            <Button variant="blue" href="/contact?offer=ai-operator" size="lg" className="shadow-lg shadow-blue-500/25">
              Discuss an AI Operator
            </Button>
            <a
              href="https://github.com/AbeJitsu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-xl border border-white/10 text-slate-300 hover:border-white/20 hover:text-white transition-colors"
            >
              GitHub
              <span className="text-xs">&#8599;</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
