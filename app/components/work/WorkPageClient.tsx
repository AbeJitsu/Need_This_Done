import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";
import {
  getPublicExampleAnchor,
  PUBLIC_EXAMPLES,
  PUBLIC_EXAMPLE_IDS,
  PUBLIC_EXAMPLE_TITLES,
  PUBLIC_OFFERS,
} from "@/lib/public-offers";

const nextStep = PUBLIC_ROUTE_STAGES["/work"].secondary;

export default function WorkPageClient() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="public-page-hero border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            Examples
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            Explore what a useful change could look like.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd]">
            These examples are illustrative. They show what one focused change
            could look like.
          </p>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"
        aria-labelledby="example-list-heading"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
            Before and after
          </p>
          <h2
            id="example-list-heading"
            className="mt-5 font-playfair text-4xl font-black md:text-5xl"
          >
            Small changes can make the next move clearer.
          </h2>
        </div>

        <div className="mt-12 divide-y divide-[var(--public-ink)]/15 border-y border-[var(--public-ink)]/15">
          {PUBLIC_EXAMPLE_IDS.map((exampleId, index) => {
            const example = PUBLIC_EXAMPLES[exampleId];
            const relatedOffer = example.relatedOfferId
              ? PUBLIC_OFFERS[example.relatedOfferId]
              : null;

            return (
              <article
                id={getPublicExampleAnchor(exampleId)}
                key={exampleId}
                data-public-example-story={exampleId}
                className="w-full py-12 md:py-16"
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(12rem,.65fr)_minmax(0,1.35fr)] lg:gap-16">
                  <div>
                    <span className="text-sm font-black tracking-[.14em] text-[#775d22]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-[var(--public-green)]">
                      Illustrative example
                    </p>
                    <h3 className="mt-4 font-playfair text-3xl font-black leading-tight md:text-4xl">
                      {PUBLIC_EXAMPLE_TITLES[exampleId]}
                    </h3>
                  </div>

                  <div className="min-w-0">
                    <div className="public-example-comparison grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch md:gap-4">
                      <section className="rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-[#eee4cd] p-6 sm:p-8">
                        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#775d22]">
                          Before
                        </p>
                        <p className="mt-5 text-xl font-semibold leading-8">
                          {example.before}
                        </p>
                      </section>

                      <div
                        className="public-example-transition flex items-center justify-center gap-2 py-1 text-[var(--public-green)] md:px-1 md:py-0"
                        aria-hidden="true"
                      >
                        <span className="h-5 w-px bg-[var(--public-green)]/35 md:hidden" />
                        <ArrowDown className="h-5 w-5 md:hidden" />
                        <ArrowRight className="hidden h-5 w-5 md:block" />
                        <span className="h-5 w-px bg-[var(--public-green)]/35 md:hidden" />
                      </div>

                      <section className="rounded-[1.5rem] border border-[var(--public-green)]/20 bg-[#e4eee6] p-6 sm:p-8">
                        <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--public-green)]">
                          After
                        </p>
                        <p className="mt-5 text-xl font-semibold leading-8">
                          {example.after}
                        </p>
                      </section>
                    </div>

                    <section className="mt-6 rounded-[1.25rem] border-l-4 border-[var(--public-gold)] bg-white/60 p-6 sm:p-7">
                      <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--public-green)]">
                        What changed
                      </p>
                      <p className="mt-3 max-w-[60ch] leading-7 text-[var(--public-muted)]">
                        {example.change}
                      </p>
                    </section>

                    <div className="mt-5">
                      {relatedOffer ? (
                        <Link
                          href={relatedOffer.detailHref}
                          className="inline-flex min-h-11 items-center gap-2 py-3 font-bold text-[var(--public-green)] underline underline-offset-4"
                        >
                          Explore {relatedOffer.name}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      ) : (
                        <Link
                          href="/contact"
                          className="inline-flex min-h-11 items-center gap-2 py-3 font-bold text-[var(--public-green)] underline underline-offset-4"
                        >
                          Share Your Vision
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-sand)]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            What would you like to make possible?
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--public-muted)]">
            You can share the unfinished version. We will listen and help you
            find the right first move.
          </p>
          <Link
            href="/contact"
            className="public-button mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white"
          >
            Share Your Vision
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {nextStep && (
            <p className="mt-5">
              <Link
                href={nextStep.href}
                className="font-semibold text-[var(--public-green)] underline"
              >
                {nextStep.label}
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
