import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const principles = [
  ['Outcome-led thinking', 'We begin with what should be better, then shape the work around that result.'],
  ['Clarity before commitment', 'You see the focus, boundary, price, and next step before work begins.'],
  ['Focused work', 'We choose the smallest meaningful move instead of making the engagement needlessly broad.'],
  ['Honest boundaries', 'We say what is included, what is not, and what still needs to be learned.'],
] as const;

export const metadata: Metadata = {
  title: 'Why Us | NeedThisDone',
  description: 'How NeedThisDone keeps the desired outcome visible, the next step clear, and the work honestly bounded.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Why Us | NeedThisDone',
    description: 'Outcome-led help with clear focus and honest boundaries.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10 bg-[#18372e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">Why NeedThisDone</p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">The idea stays visible. The work gets clearer.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#dce8dd] md:text-xl">We help owners and founders turn a better future they can see into a focused next step—without pretending the path is clearer than it is.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="principles-heading">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">The way we work</p>
          <h2 id="principles-heading" className="mt-5 font-playfair text-4xl font-black leading-tight md:text-5xl">A useful partnership makes the next move easier to see.</h2>
        </div>
        <dl className="mt-14 grid gap-x-10 gap-y-10 border-y border-[#183229]/15 py-10 md:grid-cols-2">
          {principles.map(([term, description]) => (
            <div key={term}>
              <dt className="font-playfair text-2xl font-black">{term}</dt>
              <dd className="mt-3 max-w-lg leading-7 text-[#50675e]">{description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-[#183229]/10 bg-[#e8e2d5]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">Bring the vision, even if the path is still unclear.</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#50675e]">Share what you want to make better and the result you want. We will help shape the next useful step; choosing a service is optional.</p>
          <Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e]">Share your vision <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
