import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HumanControlFlow, ThreeStepFlow } from '@/components/public/PublicServiceVisuals';
import { seoConfig } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: 'How It Works | NeedThisDone',
  description: 'Tell us what is stuck, agree on one outcome, and receive the completed work with a clear handoff.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How It Works | NeedThisDone',
    description: 'A three-step, human-led path from a stuck task to a clear handoff.',
    url: `${seoConfig.baseUrl}/how-it-works`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works | NeedThisDone',
    description: 'A three-step, human-led path from a stuck task to a clear handoff.',
  },
};

export default function HowItWorksPage() {
  return (
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10 bg-[#18372e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">How it works</p>
          <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">Start with what should be different.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-50/75 md:text-xl">You do not need a technical brief. Name the website problem or repeated task, and we will make the smallest useful finish line clear.</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <ThreeStepFlow />
      </div>

      <section className="border-y border-[#183229]/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Who decides</p>
            <h2 className="mt-4 font-playfair text-4xl font-black">Important actions always wait for a person.</h2>
            <p className="mt-5 leading-7 text-[#50675e]">We can prepare work and recommendations. Messages, publication, account changes, and spending move only after a clear human decision.</p>
          </div>
          <HumanControlFlow />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
        <h2 className="font-playfair text-4xl font-black">Ready to name the finish line?</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#50675e]">Share the context you have. We will help narrow it to one outcome before work begins.</p>
        <Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Tell us what’s stuck <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </section>
    </main>
  );
}
