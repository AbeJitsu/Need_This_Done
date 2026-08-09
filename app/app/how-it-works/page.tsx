import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, FileSearch, ShieldCheck, Wrench } from 'lucide-react';
import { seoConfig } from '@/lib/seo-config';
import { PUBLIC_OFFERS } from '@/lib/public-offers';

export const metadata: Metadata = {
  title: 'How It Works | NeedThisDone',
  description: 'A shared, human-led process for a $500 website improvement or a proposal-based 30-day managed AI operator pilot.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How It Works | NeedThisDone',
    description: 'Clear scope, human approval, and a useful handoff for both offers.',
    url: `${seoConfig.baseUrl}/how-it-works`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works | NeedThisDone',
    description: 'Clear scope, human approval, and a useful handoff for both offers.',
  },
};

const steps = [
  {
    title: 'Choose the right starting point',
    description: 'Select Website Improvement when one visible website problem needs a contained fix. Select Managed AI Operator when a recurring bottleneck needs a supervised 30-day pilot.',
    details: ['The intake asks only for the context needed for that offer', 'The free site audit can feed directly into the website-improvement path'],
  },
  {
    title: 'Confirm the scope before work begins',
    description: 'We turn the request into a specific agreement. Nothing becomes an open-ended build, automatic agent, or hidden subscription.',
    details: ['Website Improvement: $500 audit plus one agreed contained fix', 'AI Operator: proposal defines the pilot, measures, payment terms, and prohibited actions'],
  },
  {
    title: 'Work in the open where judgment matters',
    description: 'The team documents evidence, work, approvals, and outcomes. External messages, publishing, system changes, and spending remain human-approved.',
    details: ['Website work is reviewed against the agreed fix', 'Abe and Andrea operate the AI role privately; clients are not asked to run a dashboard'],
  },
  {
    title: 'Deliver a useful handoff',
    description: 'The website engagement closes with the completed fix and a before/after explanation. The AI pilot closes with four weekly briefs and a recorded recommendation for the next step.',
    details: ['Website payment: 50% manual invoice to begin and 50% after delivery', 'AI pilot continuation is a separate decision, not an automatic renewal'],
  },
];

export default function HowItWorksPage() {
  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Shared delivery process</p>
          <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-tight md:text-7xl">A clear scope first. Human judgment throughout.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#50675e]">The two offers use the same delivery discipline: agree on the job, preserve the approval boundary, and leave the client with a result they can understand.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24">
        <ol className="space-y-6">
          {steps.map((step, index) => (
            <li key={step.title} className="grid gap-6 rounded-3xl border border-[#183229]/15 bg-white p-6 sm:grid-cols-[auto_1fr] sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#126b4e] text-xl font-black text-white">{index + 1}</span>
              <div>
                <h2 className="text-2xl font-black">{step.title}</h2>
                <p className="mt-3 leading-7 text-[#50675e]">{step.description}</p>
                <ul className="mt-5 space-y-2 text-sm leading-6 text-[#40564e]">
                  {step.details.map((detail) => <li key={detail} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#126b4e]" aria-hidden="true" />{detail}</li>)}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-[#18372e] text-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-20">
          <article className="rounded-3xl border border-white/15 bg-white/5 p-7"><FileSearch className="h-7 w-7 text-emerald-300" aria-hidden="true" /><h2 className="mt-5 text-3xl font-black">One website fix</h2><p className="mt-3 leading-7 text-emerald-50/75">Bring a report or a known website problem. We will confirm that the requested work fits one contained $500 improvement.</p><Link href={PUBLIC_OFFERS['website-improvement'].contactHref} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-300 px-5 py-2 font-bold text-[#18372e]">Start website improvement <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></article>
          <article className="rounded-3xl border border-white/15 bg-white/5 p-7"><Wrench className="h-7 w-7 text-emerald-300" aria-hidden="true" /><h2 className="mt-5 text-3xl font-black">One supervised operator pilot</h2><p className="mt-3 leading-7 text-emerald-50/75">Bring a recurring bottleneck. We will define the private operating role and a 30-day proposal before work begins.</p><Link href={PUBLIC_OFFERS['ai-operator'].contactHref} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-300 px-5 py-2 font-bold text-[#18372e]">Discuss the pilot <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></article>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 md:py-20"><ShieldCheck className="mx-auto h-7 w-7 text-[#126b4e]" aria-hidden="true" /><h2 className="mt-4 font-playfair text-3xl font-black">No hidden automation boundary</h2><p className="mt-4 leading-7 text-[#50675e]">Private operating tools help the team prepare work. They do not authorize the worker to contact people, publish, change systems, or spend money on its own.</p></section>
    </main>
  );
}
