import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { OutcomeFocusFlow } from '@/components/public/PublicServiceVisuals';
import { PUBLIC_OFFERS } from '@/lib/public-offers';

const examples = [
  {
    offer: 'Website Fix',
    stuck: 'One important page is unclear, slow, inaccessible, or hard to use.',
    outcome: 'One agreed page or component fix is completed and handed off with what changed.',
    href: PUBLIC_OFFERS['website-improvement'].contactHref,
    cta: 'Start a Website Fix',
  },
  {
    offer: 'Managed Automation',
    stuck: 'One repeated problem keeps crossing inboxes, documents, or tools.',
    outcome: 'A shared picture of the better result keeps the work focused on moving that result forward.',
    href: PUBLIC_OFFERS['ai-operator'].contactHref,
    cta: 'Discuss Managed Automation',
  },
] as const;

export default function WorkPageClient() {
  return (
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10 bg-[#18372e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Process examples</p>
          <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">See how a contained handoff works.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-50/75">These are examples of how we work—not paid client outcomes.</p>
        </div>
      </section>

      <section aria-labelledby="example-heading" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">From problem to handoff</p>
        <h2 id="example-heading" className="mt-4 font-playfair text-4xl font-black">Two examples, without invented results.</h2>
        <div className="mt-10 divide-y divide-[#183229]/15 border-y border-[#183229]/15">
          {examples.map((example) => (
            <article key={example.offer} className="grid gap-6 py-8 md:grid-cols-[11rem_1fr_1fr_auto] md:items-start">
              <h3 className="font-playfair text-2xl font-black">{example.offer}</h3>
              <div><p className="text-xs font-bold uppercase tracking-wider text-[#126b4e]">What might be stuck</p><p className="mt-3 leading-7 text-[#50675e]">{example.stuck}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wider text-[#126b4e]">What the handoff contains</p><p className="mt-3 leading-7 text-[#50675e]">{example.outcome}</p></div>
              <Link href={example.href} className="inline-flex min-h-11 items-center gap-2 font-bold text-[#126b4e] underline decoration-[#126b4e]/30 underline-offset-4">{example.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#183229]/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">A clear result</p>
            <h2 className="mt-4 font-playfair text-4xl font-black">Keep the work aimed at what should be better.</h2>
            <p className="mt-5 leading-7 text-[#50675e]">A shared picture of the better result keeps the work focused without promising it before the proposal.</p>
          </div>
          <OutcomeFocusFlow />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
        <h2 className="font-playfair text-4xl font-black">Bring the work that is hard to finish.</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#50675e]">We will help turn it into one clear outcome and one useful handoff.</p>
        <Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Tell us what’s stuck <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </section>
    </main>
  );
}
