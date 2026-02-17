// ============================================================================
// BlogPostCTA — Dark editorial CTA for individual blog posts
// ============================================================================
// Client component so it can use RevealSection (which depends on useInView).
// Matches the dark editorial CTA on the blog listing page.

'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { RevealSection } from '@/components/motion';

export default function BlogPostCTA() {
  return (
    <RevealSection>
      <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 p-10 md:p-14">
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-purple-400 to-amber-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Get Started</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              Need help getting things done?
            </h2>
            <p className="text-lg text-slate-400">
              Let&apos;s turn your ideas into reality. Free consultation, no pressure.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base bg-white text-gray-900 hover:bg-white/90 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:-translate-y-1 whitespace-nowrap"
          >
            Get in Touch <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </RevealSection>
  );
}
