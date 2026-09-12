import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUBLIC_CORE_PROMISE } from "@/lib/public-copy";

const principles = [
  [
    "Bounded work, on purpose",
    "We choose one useful piece to improve. We name what stays outside it.",
  ],
  [
    "Context before convention",
    "Your business, customers, and limits shape the recommendation. We do not force a familiar answer onto an unfamiliar situation.",
  ],
  [
    "Decisions stay yours",
    "We make tradeoffs visible. You decide the scope, timing, and whether work begins.",
  ],
  [
    "Proof over promises",
    "We show the change and call out what remains. We do not promise unsupported business results.",
  ],
] as const;

export const metadata: Metadata = {
  title: "Why Us | NeedThisDone",
  description:
    PUBLIC_CORE_PROMISE,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Why Us | NeedThisDone",
    description: PUBLIC_CORE_PROMISE,
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="public-page-hero border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            Why NeedThisDone
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            Clear help for problems that matter.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
            You know your business. We bring the technical know-how, keep the work
            focused, and show what changed.
          </p>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"
        aria-labelledby="principles-heading"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
            What you can count on
          </p>
          <h2
            id="principles-heading"
            className="mt-5 font-playfair text-4xl font-black leading-tight md:text-5xl"
          >
            Clarity is part of the work.
          </h2>
        </div>
        <dl className="public-principles mt-14 grid gap-x-10 gap-y-10 py-10 md:grid-cols-2">
          {principles.map(([term, description], index) => (
            <div key={term}>
              <span className="public-principles__number" aria-hidden="true">0{index + 1}</span>
              <dt className="font-playfair text-2xl font-black">{term}</dt>
              <dd className="mt-3 max-w-lg leading-7 text-[var(--public-muted)]">
                {description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-sand)]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            Bring us the part that needs a better boundary.
          </h2>
          <p className="mx-auto mt-5 max-w-[60ch] leading-7 text-[var(--public-muted)]">
            You do not need to prepare a perfect brief. We will help make the
            decision, boundary, and next review point easier to see.
          </p>
          <Link
            href="/contact"
            className="public-button mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e]"
          >
            Share Your Vision{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
