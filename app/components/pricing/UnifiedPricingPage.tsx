import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { PUBLIC_OFFERS } from '@/lib/public-offers';

const commitmentNotes = [
  'No automatic purchase from the public site',
  'No hidden subscription or renewal',
  'Scope and payment are confirmed before work begins',
];

export default function UnifiedPricingPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 md:py-28">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Pricing</p>
          <h1 className="mt-5 font-playfair text-5xl font-black leading-tight md:text-7xl">Know the commitment before you start.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#50675e]">The targeted fix has one published price. Automation system setup is priced in a written proposal.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-16 sm:px-8 md:py-24 md:grid-cols-2">
        <article id="website-improvement" className="rounded-3xl border border-[#183229]/15 bg-white p-8">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-[#126b4e]">Targeted fix</p>
          <h2 className="mt-4 font-playfair text-4xl font-black">$500 total</h2>
          <p className="mt-4 leading-7 text-[#50675e]">One focused review and one agreed website fix.</p>
          <div className="mt-8 rounded-2xl bg-[#e4eee6] p-5">
            <p className="text-2xl font-black">50 / 50</p>
            <p className="mt-2 text-sm leading-6 text-[#40564e]">$250 manual invoice to begin. $250 manual invoice after the agreed fix is delivered.</p>
          </div>
          <ul className="mt-7 space-y-3 text-sm leading-6 text-[#40564e]">
            {['One contained scope', 'One delivery handoff', 'No recurring payment'].map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#126b4e]" aria-hidden="true" />{item}</li>)}
          </ul>
          <Link href={PUBLIC_OFFERS['website-improvement'].contactHref} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-6 py-3 font-bold text-white">Request the targeted fix <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </article>

        <article id="ai-operator" className="rounded-3xl bg-[#18372e] p-8 text-white">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-emerald-200">Automation system setup</p>
          <h2 className="mt-4 font-playfair text-4xl font-black">Proposal-based</h2>
          <p className="mt-4 leading-7 text-emerald-50/75">Price follows the agreed system, scope, and commitment.</p>
          <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="text-2xl font-black">Written proposal</p>
            <p className="mt-2 text-sm leading-6 text-emerald-50/75">The proposal states the result, work included, payment terms, and approval boundary before setup begins.</p>
          </div>
          <ul className="mt-7 space-y-3 text-sm leading-6 text-emerald-50/85">
            {['No open-ended commitment', 'No automatic renewal', 'Expansion is separately agreed'].map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />{item}</li>)}
          </ul>
          <Link href={PUBLIC_OFFERS['ai-operator'].contactHref} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-300 px-6 py-3 font-bold text-[#18372e]">Request a proposal <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </article>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        <div className="rounded-3xl border border-[#183229]/10 bg-white/70 p-8 text-center">
          <h2 className="font-playfair text-3xl font-black">A clear commitment protects the work.</h2>
          <div className="mx-auto mt-6 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
            {commitmentNotes.map((item) => <p key={item} className="flex gap-3 rounded-2xl bg-[#e4eee6] p-4 text-sm font-semibold leading-6"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#126b4e]" aria-hidden="true" />{item}</p>)}
          </div>
          <Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full border border-[#183229]/20 px-7 py-3 font-bold hover:bg-white">Contact <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
