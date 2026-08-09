import Link from 'next/link';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { OFFERING_CATALOG } from '@/lib/offering-catalog';
import { PUBLIC_OFFERS } from '@/lib/public-offers';

export default function UnifiedPricingPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 md:py-28">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Simple by design</p>
          <h1 className="mt-5 font-playfair text-5xl font-black leading-tight md:text-7xl">One published price. One proposal-based pilot.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#50675e]">The website engagement is intentionally contained. The managed AI operator is scoped to the client’s bottleneck, approval boundary, and 30-day pilot outcomes before a proposal is accepted.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
        {OFFERING_CATALOG.map((offering) => {
          const website = offering.slug === 'website-improvement';
          const contactHref = website ? PUBLIC_OFFERS['website-improvement'].contactHref : PUBLIC_OFFERS['ai-operator'].contactHref;
          return (
            <article key={offering.slug} id={offering.slug} className={website ? 'rounded-3xl border border-[#183229]/15 bg-white p-8' : 'rounded-3xl bg-[#18372e] p-8 text-white'}>
              <p className={website ? 'text-sm font-bold text-[#126b4e]' : 'text-sm font-bold text-emerald-200'}>{website ? 'Website Improvement' : 'Managed AI Operator'}</p>
              <h2 className="mt-3 text-3xl font-black">{offering.name}</h2>
              <p className={website ? 'mt-4 leading-7 text-[#50675e]' : 'mt-4 leading-7 text-emerald-50/75'}>{offering.description}</p>
              {website ? (
                <div className="mt-7 rounded-2xl bg-[#e4eee6] p-5">
                  <p className="text-4xl font-black">$500</p>
                  <p className="mt-2 text-sm font-semibold text-[#40564e]">$250 manual invoice to begin · $250 manual invoice after the agreed contained fix is delivered.</p>
                </div>
              ) : (
                <div className="mt-7 rounded-2xl border border-white/15 bg-white/5 p-5">
                  <p className="text-xl font-black">Proposal-based</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/75">The 30-day pilot’s price and payment terms are agreed in writing before the work starts.</p>
                </div>
              )}
              <ul className="mt-7 space-y-3">
                {offering.included.map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" /><span>{item}</span></li>)}
              </ul>
              <Link href={contactHref} className={website ? 'mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-6 py-3 font-bold text-white' : 'mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-300 px-6 py-3 font-bold text-[#18372e]'}>
                {website ? 'Start the $500 website improvement' : 'Discuss the 30-day pilot'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        <div className="rounded-3xl bg-[#e4eee6] p-8 text-center">
          <ShieldCheck className="mx-auto h-7 w-7 text-[#126b4e]" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black">Clear scope before work, human approval during work.</h2>
          <p className="mx-auto mt-3 max-w-xl text-[#50675e]">Neither engagement includes an automatic external-action system. Any additional website work or AI-operator continuation is separately scoped.</p>
          <Link href="/contact" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Start a project <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
