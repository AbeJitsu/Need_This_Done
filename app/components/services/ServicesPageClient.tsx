import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HumanControlFlow, OfferComparison } from '@/components/public/PublicServiceVisuals';
import { PUBLIC_OFFERS } from '@/lib/public-offers';

export default function ServicesPageClient() {
  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10 bg-[#18372e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Services</p>
          <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">Choose one clear outcome.</h1>
          <div className="mt-9 grid gap-8 border-t border-white/15 pt-8 md:grid-cols-2">
            <div>
              <p className="font-black text-emerald-200">Website Fix</p>
              <p className="mt-3 max-w-xl text-lg leading-8 text-emerald-50/75">{PUBLIC_OFFERS['website-improvement'].summary}</p>
            </div>
            <div>
              <p className="font-black text-emerald-200">Managed Automation</p>
              <p className="mt-3 max-w-xl text-lg leading-8 text-emerald-50/75">{PUBLIC_OFFERS['ai-operator'].summary}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 md:py-24" id="website-fix">
        <span id="website-improvement" className="absolute top-0 scroll-mt-24" aria-hidden="true" />
        <span id="ai-operator" className="absolute top-0 scroll-mt-24" aria-hidden="true" />
        <span id="managed-automation" className="absolute top-0 scroll-mt-24" aria-hidden="true" />
        <OfferComparison heading="Choose this when the finish line can be stated plainly." />
      </div>

      <section className="border-y border-[#183229]/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">What stays true</p>
            <h2 className="mt-4 font-playfair text-4xl font-black">The work stays contained and human-led.</h2>
            <p className="mt-5 leading-7 text-[#50675e]">We confirm what is included, what success looks like, and what still needs your say before work begins.</p>
            <Link href="/contact" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full border border-[#183229]/20 px-6 py-3 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#126b4e]">
              Tell us what’s stuck <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <HumanControlFlow />
        </div>
      </section>
    </main>
  );
}
