import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUBLIC_CORE_PROMISE, PUBLIC_BRAND_PROMISE } from "@/lib/public-copy";
import PublicPageVisual from "@/components/public/PublicPageVisual";

const principles = [
  [
    "Start with the real problem",
    "Start with the bottleneck, the people affected, and the result that would make the work better.",
  ],
  [
    "Keep the system understandable",
    "Make the important boundaries visible: what the interface does, where data lives, and which actions need review.",
  ],
  [
    "Build the useful piece first",
    "A small, working slice can be tested and improved before a larger plan takes shape.",
  ],
  [
    "Leave evidence behind",
    "Tests, accessible paths, clear records, and documented decisions make the work easier to trust later.",
  ],
] as const;

export const metadata: Metadata = {
  title: "About NeedThisDone | NeedThisDone",
  description: PUBLIC_CORE_PROMISE,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About NeedThisDone | NeedThisDone",
    description: PUBLIC_CORE_PROMISE,
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="public-page-hero border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">About NeedThisDone</p>
            <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
              {PUBLIC_BRAND_PROMISE}
            </h1>
            <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
              NeedThisDone builds practical software across the stack. The work connects
              vague problems to useful interfaces, sound data models, reliable APIs, and
              paths people can operate.
            </p>
          </div>
          <PublicPageVisual kind="problem-map" priority />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="background-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">The through line</p>
            <h2 id="background-heading" className="mt-5 font-playfair text-4xl font-black leading-tight md:text-5xl">
              Problems that cross more than one layer.
            </h2>
          </div>
          <div className="max-w-[60ch] space-y-5 leading-7 text-[var(--public-muted)]">
            <p>
              The work spans full-stack product development: React and Next.js,
              backends, APIs, databases, permissions, integrations, and automation.
            </p>
            <p>
              The focus extends beyond the demo. Failures need recovery, decisions need
              records, and systems should be understandable without guessing.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-sand)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">Working principles</p>
            <h2 className="mt-5 font-playfair text-4xl font-black leading-tight md:text-5xl">
              Clarity is part of the implementation.
            </h2>
          </div>
          <dl className="public-principles mt-14 grid gap-x-10 gap-y-10 py-10 md:grid-cols-2">
            {principles.map(([term, description], index) => (
              <div key={term}>
                <span className="public-principles__number" aria-hidden="true">0{index + 1}</span>
                <dt className="font-playfair text-2xl font-black">{term}</dt>
                <dd className="mt-3 max-w-lg leading-7 text-[var(--public-muted)]">{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-cream)]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">See the work, then start a conversation.</h2>
          <p className="mx-auto mt-5 max-w-[60ch] leading-7 text-[var(--public-muted)]">
            If you have a technical problem, a product idea, or a system you want to
            make more dependable, send the unpolished version. We can help define the
            first useful slice.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/work" className="public-button inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e]">
              See selected work <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="public-button inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--public-ink)]/20 px-7 py-3 font-bold text-[var(--public-ink)]">
              Start a conversation <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
