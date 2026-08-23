import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HumanControlFlow, OfferComparison, ThreeStepFlow } from '@/components/public/PublicServiceVisuals';

export default function HomePageClient() {
  return (
    <main id="main-content" className="overflow-hidden bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[.88fr_1.12fr] lg:px-12 lg:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Need This Done</p>
            <h1 className="mt-5 font-playfair text-5xl font-black leading-[.98] tracking-tight sm:text-6xl md:text-7xl">
              Fix the work that’s slowing you down.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#50675e] md:text-xl">
              Bring us one website problem or one repeated task. We agree on a clear outcome, do the contained work, and hand it back with a useful record.
            </p>
            <Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#126b4e] focus-visible:ring-offset-4">
              Tell us what’s stuck <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="mt-5 text-sm font-semibold text-[#50675e]">One problem. One agreed outcome. A clear handoff.</p>
          </div>

          <div className="grid gap-4 border-y border-[#183229]/10 py-5 text-left sm:grid-cols-2" aria-label="Choose an offer">
            <Link href="/website-fix" className="rounded-2xl border border-[#183229]/10 bg-white p-6 transition hover:border-[#126b4e]"><p className="font-playfair text-3xl font-black">Website Fix</p><p className="mt-3 text-sm leading-6 text-[#50675e]">$500. Evidence-based review and one agreed contained fix.</p><span className="mt-5 inline-block text-sm font-bold text-[#126b4e]">Explore Website Fix →</span></Link>
            <Link href="/managed-automation" className="rounded-2xl border border-[#183229]/10 bg-[#e4eee6] p-6 transition hover:border-[#126b4e]"><p className="font-playfair text-3xl font-black">Managed Automation</p><p className="mt-3 text-sm leading-6 text-[#50675e]">Proposal-based. A human-led 30-day pilot for one repeated task.</p><span className="mt-5 inline-block text-sm font-bold text-[#126b4e]">Explore Managed Automation →</span></Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <OfferComparison heading="Choose the work that needs attention now." />
      </div>

      <section className="border-y border-[#183229]/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <ThreeStepFlow />
          <HumanControlFlow />
        </div>
      </section>
    </main>
  );
}
