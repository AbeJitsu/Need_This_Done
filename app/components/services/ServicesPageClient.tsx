import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ThreeStepFlow } from "@/components/public/PublicServiceVisuals";
import { PUBLIC_OFFERS } from "@/lib/public-offers";

const paths = [
  {
    id: "website-fix",
    alias: "website-improvement",
    name: PUBLIC_OFFERS["website-improvement"].name,
    statement: "People keep getting stuck on one part of your website.",
    summary: PUBLIC_OFFERS["website-improvement"].summary,
    price: PUBLIC_OFFERS["website-improvement"].price,
    details: PUBLIC_OFFERS["website-improvement"].detailHref,
    contact: PUBLIC_OFFERS["website-improvement"].contactHref,
    goodFor: [
      "One page, path, or component",
      "A clear, contained correction",
      "A clear record of the result",
    ],
  },
  {
    id: "managed-automation",
    alias: "ai-operator",
    name: PUBLIC_OFFERS["ai-operator"].name,
    statement: "The same task keeps taking time away from other work.",
    summary: PUBLIC_OFFERS["ai-operator"].summary,
    price: PUBLIC_OFFERS["ai-operator"].price,
    details: PUBLIC_OFFERS["ai-operator"].detailHref,
    contact: PUBLIC_OFFERS["ai-operator"].contactHref,
    goodFor: [
      "One repeated problem",
      "An agreed improvement",
      "A focused written proposal",
    ],
  },
] as const;

export default function ServicesPageClient() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            What we do
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            Make one useful change to your website or your working day.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
            You do not need to know which service fits. Tell us what you want to
            improve. We will listen and clarify a useful first piece of work.
          </p>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"
        aria-labelledby="starting-points-heading"
      >
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
          Concrete starting points
        </p>
        <h2
          id="starting-points-heading"
          className="mt-5 max-w-3xl font-playfair text-4xl font-black md:text-5xl"
        >
          Two clear places to start. No pressure to choose yet.
        </h2>
        <div className="mt-12 divide-y divide-[var(--public-ink)]/15 border-y border-[var(--public-ink)]/15">
          {paths.map((path) => (
            <article
              id={path.id}
              key={path.id}
              className="relative scroll-mt-24 py-10"
            >
              <span
                id={path.alias}
                className="absolute top-0 scroll-mt-24"
                aria-hidden="true"
              />
              <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-16">
                <div>
                  <h3 className="mt-3 font-playfair text-3xl font-black md:text-4xl">
                    {path.name}
                  </h3>
                </div>
                <div>
                  <p className="max-w-[60ch] text-2xl font-semibold leading-9">
                    {path.statement}
                  </p>
                  <p className="mt-4 max-w-[60ch] leading-7 text-[var(--public-muted)]">
                    {path.summary}
                  </p>
                  <ul className="mt-6 grid gap-3 text-sm text-[#40564e] sm:grid-cols-3">
                    {path.goodFor.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--public-green)]"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-7 text-2xl font-bold">{path.price}</p>
                  <div className="mt-4">
                    <Link
                      href={path.details}
                      className="inline-flex min-h-11 items-center gap-2 px-2 py-3 font-bold text-[var(--public-green)] underline underline-offset-4"
                    >
                      See {path.name} details{" "}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8"><ThreeStepFlow /></div>
      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-sand)]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            Not sure which path fits?
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--public-muted)]">
            That is completely fine. Share what is happening, and we will help
            you work out the right place to start.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white"
          >
            Share Your Vision{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-5">
            <Link
              href="/how-it-works"
              className="font-semibold text-[var(--public-green)] underline"
            >
              See how we help
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
