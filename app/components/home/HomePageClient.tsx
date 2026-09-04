import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const principles = [
  ['Outcome-led thinking', 'We begin with what should be better, then shape the work around that result.'],
  ['Clarity before commitment', 'You see the focus, boundary, price, and next step before work begins.'],
  ['Focused work', 'We choose the smallest meaningful move instead of making the engagement needlessly broad.'],
  ['Honest boundaries', 'We say what is included, what is not, and what still needs to be learned.'],
] as const;

const examples = [
  {
    title: 'A website that earns the next click',
    before: 'An important page feels unclear, slow, inaccessible, or difficult to use.',
    after: 'One agreed page or component is made meaningfully better and handed back with a clear record.',
  },
  {
    title: 'A better way through repeated work',
    before: 'A recurring task keeps crossing inboxes, documents, and tools without a dependable path.',
    after: 'The desired result is made clear and a focused proposal defines how to move it forward.',
  },
] as const;

export default function HomePageClient() {
  return (
    <main id="main-content" className="overflow-hidden bg-[#f7f4ed] text-[#183229]">
      <section className="relative border-b border-[#183229]/10">
        <div className="pointer-events-none absolute right-[-12rem] top-[-15rem] h-[34rem] w-[34rem] rounded-full bg-[#d0a94f]/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28 lg:py-36">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">For owners and founders</p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.96] tracking-tight sm:text-6xl md:text-8xl">Your vision, brought to life.</h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#50675e] md:text-xl">NeedThisDone turns your vision for something better into a clear, focused result. You do not need to arrive with a technical brief—only a sense of what you want to change.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e]">Share your vision <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="#what-we-do" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#183229]/25 px-7 py-3 font-bold transition hover:border-[#126b4e] hover:text-[#126b4e]">See what we do</Link>
          </div>
        </div>
      </section>

      <section id="what-we-do" aria-labelledby="what-we-do-heading" className="scroll-mt-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">What we do</p>
            <h2 id="what-we-do-heading" className="mt-5 font-playfair text-4xl font-black leading-tight md:text-5xl">Better websites. Better ways of working.</h2>
          </div>
          <div className="divide-y divide-[#183229]/15 border-y border-[#183229]/15">
            <article className="py-7"><h3 className="font-playfair text-3xl font-black">Website Fix</h3><p className="mt-3 max-w-2xl leading-7 text-[#50675e]">A $500 evidence-based review and one agreed, contained fix for a page, path, or component that needs to work better.</p><Link href="/website-fix" className="mt-5 inline-flex items-center gap-2 font-bold text-[#126b4e]">Explore Website Fix <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></article>
            <article className="py-7"><h3 className="font-playfair text-3xl font-black">Managed Automation</h3><p className="mt-3 max-w-2xl leading-7 text-[#50675e]">A proposal-based way to improve one repeated problem at work, beginning with the result you want rather than the mechanics.</p><Link href="/managed-automation" className="mt-5 inline-flex items-center gap-2 font-bold text-[#126b4e]">Explore Managed Automation <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></article>
          </div>
        </div>
      </section>

      <section id="why-us" aria-labelledby="why-us-heading" className="scroll-mt-24 border-y border-[#183229]/10 bg-[#18372e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">Why Need This Done</p><h2 id="why-us-heading" className="mt-5 font-playfair text-4xl font-black leading-tight md:text-6xl">The idea stays visible. The work gets clearer.</h2></div>
          <dl className="mt-14 grid gap-x-10 gap-y-9 border-t border-white/15 pt-10 md:grid-cols-2">{principles.map(([term, description]) => <div key={term}><dt className="font-playfair text-2xl font-black text-white">{term}</dt><dd className="mt-3 max-w-lg leading-7 text-[#dce8dd]">{description}</dd></div>)}</dl>
        </div>
      </section>

      <section aria-labelledby="examples-heading">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">Representative examples—not client results</p>
          <h2 id="examples-heading" className="mt-5 max-w-3xl font-playfair text-4xl font-black leading-tight md:text-5xl">What better can look like.</h2>
          <div className="mt-12 divide-y divide-[#183229]/15 border-y border-[#183229]/15">{examples.map((example) => <article key={example.title} className="grid gap-6 py-9 md:grid-cols-[.7fr_1fr] md:gap-14"><h3 className="font-playfair text-3xl font-black">{example.title}</h3><dl className="grid gap-6 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-[.16em] text-[#775d22]">Before</dt><dd className="mt-3 leading-7 text-[#50675e]">{example.before}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[.16em] text-[#126b4e]">A better state</dt><dd className="mt-3 leading-7 text-[#50675e]">{example.after}</dd></div></dl></article>)}</div>
          <Link href="/work" className="mt-7 inline-flex items-center gap-2 font-bold text-[#126b4e]">See more examples <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="border-t border-[#183229]/10 bg-[#e8e2d5]">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 md:py-28"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">The next move</p><h2 className="mt-5 font-playfair text-4xl font-black md:text-6xl">Ready to bring it to life?</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#50675e]">Share what you want to make better. We will help turn it into a focused next step.</p><Link href="/contact" className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Share your vision <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </section>
    </main>
  );
}
