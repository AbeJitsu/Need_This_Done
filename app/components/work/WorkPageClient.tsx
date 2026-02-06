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
            What I{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Build
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mb-12">
            Full-stack applications, data automation, and AI integrations.
            Here&apos;s what that looks like in practice.
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Featured Project
            </span>
          </div>

          <CaseStudyCard study={caseStudies[0]} />

          {/* Architecture diagram */}
          <div className="mt-10">
            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-4">
              System Architecture
            </h4>
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Client Work
            </span>
          </div>

          <CaseStudyCard study={caseStudies[1]} />
        </div>
      </section>

      {/* ================================================================
          Case Study: Bridgette Automation
          ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 md:px-12 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-purple-400 to-amber-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">
              Side Project
            </span>
          </div>

          <CaseStudyCard study={caseStudies[2]} />
        </div>
      </section>

      {/* ================================================================
          How I Work - Light Section
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
              How I work
            </h2>
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
            Let&apos;s build something together
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Whether you need a full application, data automation, or just want to chat about a project idea — I&apos;m here to help.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="green" href="/contact" size="lg" className="shadow-lg shadow-emerald-500/25">
              Start a Project
            </Button>
            <Button variant="blue" href="/resume" size="lg" className="shadow-lg shadow-blue-500/25">
              View Resume
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
