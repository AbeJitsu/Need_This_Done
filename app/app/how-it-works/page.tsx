import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, CircleCheck, Map, ShieldCheck, Target, Workflow } from 'lucide-react';
import { seoConfig } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: 'How It Works | NeedThisDone',
  description: 'An outcome-first process with visible work and human approval before external action.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How It Works | NeedThisDone',
    description: 'Clear outcomes, visible work, human approval, and a useful handoff.',
    url: `${seoConfig.baseUrl}/how-it-works`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works | NeedThisDone',
    description: 'Clear outcomes, visible work, human approval, and a useful handoff.',
  },
};

const steps = [
  {
    title: 'Name the outcome',
    description: 'Start with the result that should be different when the work is done. That gives every later decision something concrete to serve.',
    details: ['What is stuck now?', 'What would useful improvement look like?', 'What is deliberately outside the request?'],
    icon: Target,
  },
  {
    title: 'Map the work',
    description: 'Trace the inputs, tools, evidence, and handoffs around that result. The smallest useful workflow is easier to review and improve.',
    details: ['Identify the source of truth', 'Separate preparation from decision', 'Set the cost and scope boundary'],
    icon: Map,
  },
  {
    title: 'Coordinate the pieces',
    description: 'The right tools, LLMs, and agents prepare the work in sequence. Each handoff keeps its evidence and status attached.',
    details: ['Research stays linked to sources', 'Drafts keep their versions', 'Blocked work remains visible'],
    icon: Workflow,
  },
  {
    title: 'Review and hand off',
    description: 'A person reviews the evidence, approves the next external action, and records what happened so the system gets better over time.',
    details: ['See what is ready and what it cost', 'Approve, revise, defer, or stop', 'Carry the outcome into the next decision'],
    icon: CircleCheck,
  },
];

export default function HowItWorksPage() {
  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">How it works</p>
          <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-tight md:text-7xl">Work backward from the result.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#50675e]">The useful question is not which tool to add. It is what should improve, what must stay visible, and where a person needs to decide.</p>
        </div>
      </section>

      <section aria-labelledby="process-heading" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">The delivery path</p>
          <h2 id="process-heading" className="mt-4 font-playfair text-4xl font-black leading-tight md:text-5xl">Clarity before motion.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {steps.map(({ title, description, details, icon: Icon }) => (
            <article key={title} className="rounded-3xl border border-[#183229]/15 bg-white p-6 sm:p-8">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e4eee6] text-[#126b4e]"><Icon className="h-6 w-6" aria-hidden="true" /></div>
              <h3 className="mt-7 text-2xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-[#50675e]">{description}</p>
              <ul className="mt-5 space-y-2 text-sm leading-6 text-[#40564e]">
                {details.map((detail) => <li key={detail} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#126b4e]" aria-hidden="true" />{detail}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="boundary-heading" className="bg-[#18372e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="grid gap-10 md:grid-cols-[.8fr_1.2fr] md:items-start">
            <div>
              <ShieldCheck className="h-8 w-8 text-emerald-300" aria-hidden="true" />
              <h2 id="boundary-heading" className="mt-5 font-playfair text-4xl font-black">Review is the boundary.</h2>
              <p className="mt-4 leading-7 text-emerald-50/75">The system can prepare work without quietly acquiring authority to act outside the workspace.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-white/15 bg-white/5 p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-200">Prepared</p><p className="mt-3 font-black">Research, drafts, evidence, and cost</p></article>
              <article className="rounded-2xl border border-white/15 bg-white/5 p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-200">Reviewed</p><p className="mt-3 font-black">The next decision and its tradeoffs</p></article>
              <article className="rounded-2xl border border-white/15 bg-white/5 p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-200">Approved</p><p className="mt-3 font-black">Messages, publishing, changes, and spending</p></article>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-20">
        <h2 className="font-playfair text-3xl font-black md:text-4xl">Ready to make the result concrete?</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#50675e]">Share the problem or workflow. The first conversation is about context, scope, and the next useful decision.</p>
        <Link href="/contact" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Contact <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </section>
    </main>
  );
}
