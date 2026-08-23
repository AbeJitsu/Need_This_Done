import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HumanControlFlow, OfferComparison, ThreeStepFlow } from '@/components/public/PublicServiceVisuals';

export default function HomePageClient() {
  return (
    <main className="overflow-hidden bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[.88fr_1.12fr] lg:px-12 lg:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">NeedThisDone</p>
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

          <div className="overflow-hidden rounded-[2rem] border border-[#183229]/10 bg-[#efe8d8] shadow-xl shadow-emerald-950/10" aria-hidden="true">
            <Image
              src="/needthisdone-work-to-outcome-v2.png"
              alt=""
              width={1600}
              height={1000}
              preload
              unoptimized
              sizes="(max-width: 1023px) 100vw, 56vw"
              className="h-auto w-full object-cover"
            />
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
