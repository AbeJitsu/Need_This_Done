import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const principles = [
  [
    "Bounded work, on purpose",
    "We choose one meaningful piece to improve and name what stays outside it, so the work does not quietly become everything.",
  ],
  [
    "Context before convention",
    "Your business, customers, and constraints shape the recommendation. We do not force a familiar solution onto an unfamiliar situation.",
  ],
  [
    "Decisions stay yours",
    "We make the recommendation and its tradeoffs visible, but you keep the call on scope, timing, and whether the work should begin.",
  ],
  [
    "Proof over promises",
    "We show the exact change, call out what remains, and avoid promising a business result we cannot support yet.",
  ],
] as const;

export const metadata: Metadata = {
  title: "Why Us | NeedThisDone",
  description:
    "A bounded partner for clear scope, visible decisions, and work you can review.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Why Us | NeedThisDone",
    description: "Bounded work, visible decisions, and proof over promises.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            Why NeedThisDone
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            A partner who makes the work easier to trust.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
            You know your business. We bring structure without pretending to
            know it better than you do. The work stays bounded, visible, and
            easy to review.
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
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e]"
          >
            Share Your Vision{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
