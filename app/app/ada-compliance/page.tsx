import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, FileSearch, ShieldCheck } from 'lucide-react';
import { seoConfig } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: 'Website Accessibility Checks | NeedThisDone',
  description: 'Learn what a focused website accessibility review can check, what it cannot certify, and how a contained improvement engagement works.',
  alternates: { canonical: '/ada-compliance' },
  openGraph: {
    title: 'Website Accessibility Checks | NeedThisDone',
    description: 'Practical accessibility signals, a clear scope, and no compliance guarantees.',
    url: `${seoConfig.baseUrl}/ada-compliance`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Accessibility Checks | NeedThisDone',
    description: 'Practical accessibility signals, a clear scope, and no compliance guarantees.',
  },
};

const commonChecks = [
  ['Text alternatives', 'Meaningful images need useful text alternatives; decorative images should not create noise for screen-reader users.'],
  ['Form labels', 'Inputs need visible, connected labels so people know what information is being requested.'],
  ['Keyboard access', 'Links, controls, menus, and forms should be reachable and usable without a mouse.'],
  ['Heading structure', 'A clear heading order helps people scan a page and navigate it with assistive technology.'],
  ['Color contrast', 'Text and essential controls need enough contrast to remain readable in real use.'],
  ['Clear links and errors', 'Link text and form feedback should explain what happens next instead of relying only on visual context.'],
];

export default function AdaCompliancePage() {
  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="relative overflow-hidden bg-[#18372e] text-white">
        <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-5 py-20 sm:px-8 md:py-28">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Website accessibility</p>
          <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-tight md:text-7xl">Accessibility checks are a practical starting point—not a certification.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-emerald-50/75">The free audit surfaces selected accessibility, SEO, and performance signals. A focused targeted fix can address one agreed issue; it does not promise legal compliance or replace specialist legal or accessibility advice.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/site-analyzer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-300 px-7 py-3 font-bold text-[#18372e]">Run the free site audit <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/contact?offer=website-improvement" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-7 py-3 font-bold">Discuss one contained fix</Link></div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div><FileSearch className="h-8 w-8 text-[#126b4e]" aria-hidden="true" /><h2 className="mt-5 font-playfair text-4xl font-black">What the audit can help you see</h2></div>
          <div><p className="text-lg leading-8 text-[#50675e]">Automated checks are useful for finding patterns worth reviewing, such as missing labels, weak structure, or page-level signals. They cannot assess every interaction, content decision, assistive-technology experience, or legal requirement.</p><p className="mt-5 rounded-2xl border border-[#183229]/10 bg-white p-5 text-sm leading-6 text-[#40564e]"><strong className="text-[#183229]">Use this information as an implementation conversation starter.</strong> If you need a legal assessment or a full accessibility conformance review, work with a qualified specialist for that purpose.</p></div>
        </div>
      </section>

      <section className="border-y border-[#183229]/10 bg-white"><div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Useful implementation checks</p><h2 className="mt-4 font-playfair text-4xl font-black">Six places a contained improvement may focus</h2><div className="mt-10 grid gap-4 md:grid-cols-2">{commonChecks.map(([title, description]) => <article key={title} className="rounded-2xl border border-[#183229]/10 bg-[#f7f4ed] p-5"><Check className="h-5 w-5 text-[#126b4e]" aria-hidden="true" /><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[#50675e]">{description}</p></article>)}</div></div></section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24"><div className="rounded-3xl bg-[#e4eee6] p-8 text-center"><ShieldCheck className="mx-auto h-7 w-7 text-[#126b4e]" aria-hidden="true" /><h2 className="mt-4 text-3xl font-black">Keep the promise narrower than the problem.</h2><p className="mx-auto mt-3 max-w-2xl leading-7 text-[#50675e]">The $500 targeted fix includes an evidence review and one agreed correction. Larger remediation programs, redesigns, and compliance certification are outside that contained scope.</p><Link href="/contact?offer=website-improvement" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Request the targeted fix <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>
    </main>
  );
}
