// ============================================================================
// BlogPostCTA — Calm next-step CTA for individual insight posts
// ============================================================================
// Client component so it can use RevealSection (which depends on useInView).
// Keeps the article handoff aligned with the public site's forest palette.

'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { RevealSection } from '@/components/motion';

export default function BlogPostCTA() {
  return (
    <RevealSection>
      <div className="relative mt-16 overflow-hidden rounded-[2rem] bg-[#18372e] p-8 text-white sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#d9b96e]/20 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Make it concrete</p>
            <h2 className="mb-3 mt-4 font-playfair text-3xl font-black tracking-tight sm:text-4xl">
              Have a workflow to untangle?
            </h2>
            <p className="text-lg leading-8 text-emerald-50/75">
              Bring the context and the result you want. We&apos;ll help define the smallest useful next step.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-300 px-7 py-3 font-bold text-[#18372e] transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18372e]"
          >
            Contact <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </RevealSection>
  );
}
