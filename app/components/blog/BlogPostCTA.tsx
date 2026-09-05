// ============================================================================
// BlogPostCTA — Calm next-step CTA for individual insight posts
// ============================================================================
// Client component so it can use RevealSection (which depends on useInView).
// Keeps the article handoff aligned with the public site's forest palette.

'use client';

import Link from 'next/link';
import { PUBLIC_OFFERS, type PublicOfferId } from '@/lib/public-offers';
import { ArrowRight } from 'lucide-react';

export default function BlogPostCTA({ offerId }: { offerId: PublicOfferId }) {
  const offer = PUBLIC_OFFERS[offerId];
  return (
    <>
      <div className="relative mt-16 overflow-hidden rounded-[2rem] bg-[var(--public-dark)] p-8 text-white sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#d9b96e]/20 blur-3xl" aria-hidden="true" />

        <p className="relative mb-6"><Link href={offer.detailHref} className="underline text-white">Explore {offer.name}</Link></p>
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[60ch]">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Make it concrete</p>
            <h2 className="mb-3 mt-4 font-playfair text-3xl font-black tracking-tight sm:text-4xl">
              What would you like to improve?
            </h2>
            <p className="text-lg leading-8 text-emerald-50/75">
              Bring the context and the result you want. We&apos;ll help define the smallest useful next step.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-300 px-7 py-3 font-bold text-[var(--public-dark)] transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--public-dark)]"
          >
            Share Your Vision <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  );
}
