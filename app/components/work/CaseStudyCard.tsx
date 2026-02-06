'use client';

import type { CaseStudy } from '@/lib/portfolio-data';
import TechStackBadge from './TechStackBadge';

// ============================================================================
// Case Study Card - Dark glass card for a portfolio project
// ============================================================================

const borderHover: Record<string, string> = {
  emerald: 'hover:border-emerald-500/40 hover:ring-1 hover:ring-emerald-500/20',
  blue: 'hover:border-blue-500/40 hover:ring-1 hover:ring-blue-500/20',
  purple: 'hover:border-purple-500/40 hover:ring-1 hover:ring-purple-500/20',
  amber: 'hover:border-amber-500/40 hover:ring-1 hover:ring-amber-500/20',
};

const accentDot: Record<string, string> = {
  emerald: 'bg-emerald-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
  amber: 'bg-amber-400',
};

const titleColor: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  amber: 'text-amber-400',
};

const badgeBg: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

interface CaseStudyCardProps {
  study: CaseStudy;
}

export default function CaseStudyCard({ study }: CaseStudyCardProps) {
  return (
    <div
      className={`p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 ${borderHover[study.color]}`}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
            {study.title}
          </h3>
          {study.links && study.links.length > 0 && (
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border uppercase tracking-wider ${badgeBg[study.color]}`}
            >
              Live
            </span>
          )}
        </div>
        <p className={`text-sm font-bold tracking-wider uppercase mb-2 ${titleColor[study.color]}`}>
          {study.subtitle}
        </p>
        <p className="text-sm text-slate-500 mb-4">
          {study.role} &middot; {study.period}
        </p>
        <p className="text-lg text-slate-300 leading-relaxed">{study.description}</p>
      </div>

      {/* Impact */}
      <div className="mb-8">
        <h4 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-4">
          Impact
        </h4>
        <ul className="space-y-2.5">
          {study.impact.map((item) => (
            <li key={item} className="flex items-start gap-3 text-base text-slate-300">
              <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${accentDot[study.color]}`} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Features grid */}
      {study.features.length > 5 && (
        <div className="mb-8">
          <h4 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-4">
            Key Features
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {study.features.map((feature) => (
              <div key={feature} className="flex items-start gap-3 text-sm text-slate-400">
                <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${accentDot[study.color]}`} />
                {feature}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tech stack */}
      <div className="mb-6">
        <h4 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-3">
          Tech Stack
        </h4>
        <div className="flex flex-wrap gap-2">
          {study.tech.map((t) => (
            <TechStackBadge key={t} name={t} />
          ))}
        </div>
      </div>

      {/* Links */}
      {study.links && study.links.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-2">
          {study.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-white/10 text-slate-300 hover:border-white/20 hover:text-white transition-colors`}
            >
              {link.label}
              <span className="text-xs">&#8599;</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
