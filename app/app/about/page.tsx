import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUBLIC_CORE_PROMISE } from "@/lib/public-copy";

const principles = [
  [
    "Start with the real problem",
    "You do not need polished requirements or technical language. We begin with what is getting in the way.",
  ],
  [
    "Keep the work understandable",
    "We explain the choices in plain language, so you can see what is changing and why it matters.",
  ],
  [
    "Build the useful piece first",
    "We choose the smallest piece that makes a meaningful difference before making the work bigger.",
  ],
  [
    "Show the result",
    "You should be able to review what changed, what remains, and what decision comes next.",
  ],
] as const;

export const metadata: Metadata = {
  title: "About Us | NeedThisDone",
  description: PUBLIC_CORE_PROMISE,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Us | NeedThisDone",
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
            Meet the team
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            Practical technology, built around people.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
            We&apos;re the NeedThisDone team, led by Abe, a full-stack developer and technical operations specialist.
            We build websites, tools, and workflows that make complicated work easier
            to understand and move forward.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="background-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
              What we bring
            </p>
            <h2 id="background-heading" className="mt-5 font-playfair text-4xl font-black leading-tight md:text-5xl">
              Technical skill with a customer-facing mindset.
            </h2>
          </div>
          <div className="max-w-[60ch] space-y-5 leading-7 text-[var(--public-muted)]">
            <p>
              Our work combines full-stack development, technical operations, and years
              of customer-facing problem solving. That means we care about both the
              system behind the work and the person trying to use it.
            </p>
            <p>
              We use modern tools to build and improve real products, while keeping the
              conversation direct, the scope clear, and the next step practical.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-sand)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
              What you can count on
            </p>
            <h2 className="mt-5 font-playfair text-4xl font-black leading-tight md:text-5xl">
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
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-cream)]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            Bring the problem as it is.
          </h2>
          <p className="mx-auto mt-5 max-w-[60ch] leading-7 text-[var(--public-muted)]">
            You do not need to prepare a perfect brief. We will make the useful first
            piece and the next review point easier to see.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="public-button inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e]">
              Share Your Vision
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/services" className="public-button inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--public-ink)]/20 px-7 py-3 font-bold text-[var(--public-ink)]">
              Explore capabilities
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
