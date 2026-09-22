import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUBLIC_CAPABILITIES, PUBLIC_CAPABILITIES_INTRO } from "@/lib/public-capabilities";
import PublicPageVisual from "@/components/public/PublicPageVisual";

const stack = [
  "React",
  "Next.js",
  "TypeScript",
  "Postgres / Supabase",
  "REST and MCP APIs",
  "Redis",
  "Playwright",
  "Vitest",
  "GitHub",
];

export default function ServicesPageClient() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="public-page-hero border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">Capabilities</p>
            <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
              Practical work across the layers of a technical problem.
            </h1>
            <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
              {PUBLIC_CAPABILITIES_INTRO}
            </p>
          </div>
          <PublicPageVisual kind="interface-craft" priority />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="capabilities-heading">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">Capabilities</p>
          <h2 id="capabilities-heading" className="mt-5 font-playfair text-4xl font-black md:text-5xl">A generalist range with concrete edges.</h2>
          <p className="mt-5 max-w-[60ch] leading-7 text-[var(--public-muted)]">“Generalist” does not mean every tool or every project. It means following the problem across the layers that need to cooperate.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PUBLIC_CAPABILITIES.map((capability, index) => (
            <article key={capability.title} data-public-capability-card className="rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-white/80 p-6 shadow-[0_1.25rem_3rem_rgba(24,55,46,.06)] sm:p-7">
              <span className="text-sm font-black tracking-[.14em] text-[#775d22]">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 font-playfair text-2xl font-black leading-tight">{capability.title}</h3>
              <p className="mt-4 leading-7 text-[var(--public-muted)]">{capability.description}</p>
              <ul className="mt-6 space-y-2 text-sm font-semibold leading-6 text-[var(--public-green)]">{capability.examples.map((example) => <li key={example}>{example}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-sand)] px-5 py-16 sm:px-8 md:py-24" aria-labelledby="stack-heading">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[.8fr_1.2fr] md:items-start">
          <div><p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">Working vocabulary</p><h2 id="stack-heading" className="mt-5 font-playfair text-4xl font-black md:text-5xl">Tools are useful when they serve the system.</h2></div>
          <div><p className="max-w-[60ch] leading-7 text-[var(--public-muted)]">These are the tools and boundaries used most often. The important part is choosing the smallest reliable combination for the problem.</p><div className="mt-8 flex flex-wrap gap-3">{stack.map((item) => <span key={item} className="rounded-full border border-[var(--public-ink)]/15 bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--public-green)]">{item}</span>)}</div></div>
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-cream)] px-5 py-16 text-center sm:px-8 md:py-24">
        <h2 className="font-playfair text-4xl font-black md:text-5xl">Start with the technical problem.</h2>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--public-muted)]">You do not need a polished brief. A short description, a link, or a confusing system boundary is enough to begin a useful conversation.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/work#case-studies" className="public-button inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--public-ink)]/20 px-7 py-3 font-bold text-[var(--public-ink)]">See selected work <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/contact" className="public-button inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white">Start a conversation <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </section>
    </main>
  );
}
