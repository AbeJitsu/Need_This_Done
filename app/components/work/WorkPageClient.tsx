import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const examples = [
  {
    title: 'Make an important page easier to act on',
    area: 'Website Fix example',
    before: 'A visitor reaches an important page but the hierarchy and next action are difficult to understand.',
    better: 'One agreed page or component presents the message and next step more clearly.',
    boundary: 'Representative scenario only. It is not a client result or a promise of conversion improvement.',
  },
  {
    title: 'Give repeated requests a clearer path',
    area: 'Managed Automation example',
    before: 'A recurring request moves between messages, notes, and tools with no dependable view of what happens next.',
    better: 'The desired outcome, decisions, and focused path forward are defined in a written proposal.',
    boundary: 'Representative scenario only. No time saving, delivery result, or live automation is claimed.',
  },
  {
    title: 'Turn a broad idea into one useful move',
    area: 'Vision-first example',
    before: 'An owner can see a better experience but does not yet have a technical brief or a named service.',
    better: 'The vision becomes a clear outcome and a bounded starting point the owner can evaluate.',
    boundary: 'Representative scenario only. Scope and commitment would still be confirmed separately.',
  },
] as const;

export default function WorkPageClient() {
  return (
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10 bg-[#18372e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">Examples</p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">What better can look like.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#dce8dd]">These are hypothetical, representative before-and-after scenarios. They are not client work, paid outcomes, or delivery proof.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="example-list-heading">
        <h2 id="example-list-heading" className="sr-only">Representative examples</h2>
        <div className="divide-y divide-[#183229]/15 border-y border-[#183229]/15">
          {examples.map((example, index) => (
            <article key={example.title} className="grid gap-7 py-10 lg:grid-cols-[4rem_.8fr_1.2fr] lg:gap-10">
              <span className="text-sm font-bold text-[#775d22]">{String(index + 1).padStart(2, '0')}</span>
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">{example.area}</p><h3 className="mt-4 font-playfair text-3xl font-black">{example.title}</h3></div>
              <div><dl className="grid gap-6 sm:grid-cols-2"><div><dt className="font-bold">Before</dt><dd className="mt-2 leading-7 text-[#50675e]">{example.before}</dd></div><div><dt className="font-bold">A better state</dt><dd className="mt-2 leading-7 text-[#50675e]">{example.better}</dd></div></dl><p className="mt-6 border-l-2 border-[#d0a94f] pl-4 text-sm leading-6 text-[#50675e]">{example.boundary}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[#183229]/10 bg-[#e8e2d5]"><div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24"><h2 className="font-playfair text-4xl font-black md:text-5xl">What would better look like for you?</h2><p className="mx-auto mt-5 max-w-xl leading-7 text-[#50675e]">Bring the vision, even if the path is still unclear.</p><Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Share your vision <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>
    </main>
  );
}
