import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  architectureLayers,
  caseStudies,
  heroStats,
  processSteps,
} from "@/lib/portfolio-data";
import { PUBLIC_CAPABILITIES } from "@/lib/public-capabilities";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";
import ArchitectureDiagram from "./ArchitectureDiagram";
import CaseStudyCard from "./CaseStudyCard";
import StatCounter from "./StatCounter";

const nextStep = PUBLIC_ROUTE_STAGES["/work"].secondary;

const proofNotes = [
  {
    title: "I show the system, not only the screenshot",
    description: "The useful proof is the path behind the interface: data, permissions, APIs, failure states, and checks.",
  },
  {
    title: "Independent work stays labeled honestly",
    description: "These are self-directed builds and technical operations projects. They are evidence of capability, not invented client results.",
  },
  {
    title: "The small details are part of the work",
    description: "Accessibility, responsive behavior, recovery states, migrations, and documentation are included in the build story.",
  },
  {
    title: "The next decision stays visible",
    description: "Each project records what is working, what remains experimental, and where a human decision still belongs.",
  },
] as const;

export default function WorkPageClient() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="public-page-hero border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">Selected work</p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            Projects that show how I think across the stack.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd]">
            A mix of product systems, technical operations, and small experiments.
            The common thread is making complicated work more observable and useful.
          </p>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#101d1a] py-12 text-white" aria-label="Build facts">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 sm:px-8 md:grid-cols-4">
          {heroStats.map((stat) => <StatCounter key={stat.label} {...stat} />)}
        </div>
      </section>

      <section id="case-studies" className="bg-[#101d1a] px-5 py-16 text-white sm:px-8 md:py-24" aria-labelledby="case-studies-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-300">Case studies</p>
            <h2 id="case-studies-heading" className="mt-5 font-playfair text-4xl font-black md:text-5xl">The work behind the pages.</h2>
            <p className="mt-5 max-w-[60ch] text-lg leading-8 text-slate-300">These projects are the clearest way to see the range: building product surfaces, making data reliable, connecting tools, and proving the important paths.</p>
          </div>
          <div className="mt-12 grid gap-6">
            {caseStudies.map((study) => <CaseStudyCard key={study.id} study={study} />)}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-cream)] px-5 py-16 sm:px-8 md:py-24" aria-labelledby="range-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">Technical range</p>
            <h2 id="range-heading" className="mt-5 font-playfair text-4xl font-black md:text-5xl">The layers I can move between.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PUBLIC_CAPABILITIES.map((capability, index) => (
              <article key={capability.title} data-public-capability-card className="rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-white/70 p-6 shadow-[0_1.25rem_3rem_rgba(24,55,46,.06)] sm:p-7">
                <span className="text-sm font-black tracking-[.14em] text-[#775d22]">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 font-playfair text-2xl font-black leading-tight">{capability.title}</h3>
                <p className="mt-4 leading-7 text-[var(--public-muted)]">{capability.description}</p>
                <ul className="mt-6 space-y-2 text-sm font-semibold leading-6 text-[var(--public-green)]">{capability.examples.map((example) => <li key={example}>{example}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-sand)] px-5 py-16 sm:px-8 md:py-24" aria-labelledby="architecture-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">One system, many layers</p>
            <h2 id="architecture-heading" className="mt-5 font-playfair text-4xl font-black md:text-5xl">NeedThisDone is a useful technical case study.</h2>
            <p className="mt-5 max-w-[60ch] leading-7 text-[var(--public-muted)]">The point is not that every project needs this much infrastructure. The point is that I can reason across the public experience, private operations, durable data, and temporary coordination underneath it.</p>
          </div>
          <div className="mt-12 rounded-[2rem] bg-[#101d1a] p-5 sm:p-8 md:p-12"><ArchitectureDiagram layers={architectureLayers} /></div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {proofNotes.map((item, index) => <article key={item.title} data-public-proof-card className="rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-white/70 p-6 shadow-[0_1.25rem_3rem_rgba(24,55,46,.06)] sm:p-8"><span className="text-sm font-black tracking-[.14em] text-[#775d22]">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-6 font-playfair text-2xl font-black leading-tight">{item.title}</h3><p className="mt-4 leading-7 text-[var(--public-muted)]">{item.description}</p></article>)}
          </div>
          <div className="mt-10 text-center"><Link href="/system" className="public-button inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--public-ink)]/20 px-5 py-2.5 font-bold text-[var(--public-ink)]">Read the NeedThisDone system note <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-cream)] px-5 py-16 sm:px-8 md:py-24" aria-labelledby="process-heading">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">How I work</p><h2 id="process-heading" className="mt-5 font-playfair text-4xl font-black md:text-5xl">Make the next technical decision easier to see.</h2></div>
          <ol className="mt-12 grid gap-5 md:grid-cols-2">
            {processSteps.map((step) => <li key={step.title} className="rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-white/70 p-6 sm:p-8"><span className="text-4xl font-black text-[var(--public-green)]">{String(step.number).padStart(2, "0")}</span><h3 className="mt-6 font-playfair text-2xl font-black">{step.title}</h3><p className="mt-3 leading-7 text-[var(--public-muted)]">{step.description}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-cream)] px-5 py-16 text-center sm:px-8 md:py-24">
        <h2 className="font-playfair text-4xl font-black md:text-5xl">Want to see the source?</h2>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--public-muted)]">The repository is part of the portfolio. Read the code, the docs, and the proof boundaries behind the public surface.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="https://github.com/AbeJitsu/Need_This_Done" target="_blank" rel="noopener noreferrer" className="public-button inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white">Open the GitHub repository <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
          <Link href="/contact" className="public-button inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--public-ink)]/20 px-7 py-3 font-bold text-[var(--public-ink)]">Start a conversation <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        {nextStep && <p className="mt-5"><Link href={nextStep.href} className="font-semibold text-[var(--public-green)] underline">{nextStep.label}</Link></p>}
      </section>
    </main>
  );
}
