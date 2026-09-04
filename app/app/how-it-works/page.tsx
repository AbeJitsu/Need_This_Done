import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works | NeedThisDone',
  description: 'Share the vision, clarify the outcome and boundary, then decide whether to move forward.',
  alternates: { canonical: '/how-it-works' },
};

const steps = [
  ['Share the vision', 'Tell us what you want to bring to life and what should be better. No technical brief is required.'],
  ['Clarify the focus', 'We shape the idea into a clear outcome, honest boundary, price, and next step.'],
  ['Choose whether to begin', 'You review the proposed commitment. A contact request never starts work automatically.'],
] as const;

export default function HowItWorksPage() {
  return (
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10 bg-[#18372e] text-white"><div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">How it works</p><h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">Start with what you can see.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[#dce8dd]">The vision comes first. We help make the outcome and next useful move clear.</p></div></section>
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="process-heading"><h2 id="process-heading" className="font-playfair text-4xl font-black md:text-5xl">A concise path from idea to decision.</h2><ol className="mt-12 divide-y divide-[#183229]/15 border-y border-[#183229]/15">{steps.map(([title, description], index) => <li key={title} className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr] sm:gap-8"><span className="text-sm font-bold text-[#775d22]">{String(index + 1).padStart(2, '0')}</span><div><h3 className="font-playfair text-2xl font-black">{title}</h3><p className="mt-3 max-w-2xl leading-7 text-[#50675e]">{description}</p></div></li>)}</ol></section>
      <section className="border-t border-[#183229]/10 bg-[#e8e2d5]"><div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24"><h2 className="font-playfair text-4xl font-black md:text-5xl">Ready to make the next move clear?</h2><Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Share your vision <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>
    </main>
  );
}
