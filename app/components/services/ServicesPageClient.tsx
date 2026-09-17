import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUBLIC_OFFERS, type PublicOfferId } from "@/lib/public-offers";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";

const offerIds = ["website-improvement", "ai-operator"] as const satisfies readonly PublicOfferId[];
const nextStep = PUBLIC_ROUTE_STAGES["/services"].secondary;

export default function ServicesPageClient() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="public-page-hero border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            Starting points
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            Practical help for the work that is getting in the way.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
            Choose a clear place to start, then we can shape the larger build around the result you need.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="offers-heading">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
            Two clear ways to start
          </p>
          <h2 id="offers-heading" className="mt-5 font-playfair text-4xl font-black md:text-5xl">
            Start with the piece that needs attention.
          </h2>
          <p className="mt-5 max-w-[60ch] leading-7 text-[var(--public-muted)]">
            These offers keep the first step clear. The Work page shows the wider full-stack capability map.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {offerIds.map((offerId) => {
            const detail = PUBLIC_OFFERS[offerId];
            return (
              <article
                key={offerId}
                data-public-offer-card
                className="rounded-[1.75rem] border border-[var(--public-ink)]/10 bg-white/80 p-7 shadow-[0_1.25rem_3rem_rgba(24,55,46,.06)] sm:p-9"
              >
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#775d22]">
                  Starting point
                </p>
                <h3 className="mt-4 font-playfair text-3xl font-black">
                  {detail.name}
                </h3>
                <p data-public-offer-region="fit" className="mt-5 text-xl font-semibold leading-8">
                  {detail.fit}
                </p>
                <p data-public-offer-region="summary" className="mt-5 max-w-[52ch] leading-7 text-[var(--public-muted)]">
                  {detail.summary}
                </p>
                <div data-public-offer-region="actions" className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-[var(--public-ink)]/10 pt-6">
                  <p className="text-2xl font-bold">{detail.price}</p>
                  <Link
                    href={detail.detailHref}
                    className="inline-flex min-h-11 items-center gap-2 font-bold text-[var(--public-green)] underline underline-offset-4"
                  >
                    See {detail.name} details
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-cream)]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            Not sure which path fits?
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--public-muted)]">
            Share what is happening. We will help you choose a useful starting point.
          </p>
          <Link href="/contact" className="public-button mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white">
            Share Your Vision
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {nextStep && (
            <p className="mt-5">
              <Link href={nextStep.href} className="font-semibold text-[var(--public-green)] underline">
                {nextStep.label}
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
