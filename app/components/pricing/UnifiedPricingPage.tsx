import Link from 'next/link';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { OFFERING_CATALOG } from '@/lib/offering-catalog';

export default function UnifiedPricingPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 md:py-28">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Start with a supervised role</p>
          <h1 className="mt-5 font-playfair text-5xl font-black leading-tight md:text-7xl">Two stages. One accountable growth employee.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#50675e]">Pricing is proposal-based while the internal pilot establishes reliable effort and operating costs. Scope and approval rules are agreed before work begins.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
        {OFFERING_CATALOG.map((offering, index) => (
          <article key={offering.slug} className={index === 0 ? 'rounded-3xl border border-[#183229]/15 bg-white p-8' : 'rounded-3xl bg-[#18372e] p-8 text-white'}>
            <p className={index === 0 ? 'text-sm font-bold text-[#126b4e]' : 'text-sm font-bold text-emerald-200'}>Stage {index + 1}</p>
            <h2 className="mt-3 text-3xl font-black">{offering.name}</h2>
            <p className={index === 0 ? 'mt-4 leading-7 text-[#50675e]' : 'mt-4 leading-7 text-emerald-50/75'}>{offering.description}</p>
            <p className="mt-6 text-lg font-bold">Proposal-based</p>
            <ul className="mt-7 space-y-3">
              {offering.included.map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" /><span>{item}</span></li>)}
            </ul>
          </article>
        ))}
      </section>
      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        <div className="rounded-3xl bg-[#e4eee6] p-8 text-center">
          <ShieldCheck className="mx-auto h-7 w-7 text-[#126b4e]" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-black">External actions always require approval.</h2>
          <p className="mx-auto mt-3 max-w-xl text-[#50675e]">The initial product does not automatically send outreach, publish content, modify systems, or spend money.</p>
          <Link href="/contact" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Design My AI Employee <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
