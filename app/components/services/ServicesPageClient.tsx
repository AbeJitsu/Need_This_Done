import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUBLIC_CAPABILITIES, PUBLIC_CAPABILITIES_INTRO } from "@/lib/public-capabilities";
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
            Capabilities
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            Practical help for the work that is getting in the way.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
            I build clear websites, useful tools, and dependable workflows. We start
            with the problem, then agree on the smallest useful piece of work.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="capabilities-heading">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
            What I can help with
          </p>
          <h2 id="capabilities-heading" className="mt-5 font-playfair text-4xl font-black md:text-5xl">
            More than one kind of fix.
          </h2>
          <p className="mt-5 max-w-[60ch] leading-7 text-[var(--public-muted)]">
            {PUBLIC_CAPABILITIES_INTRO}
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PUBLIC_CAPABILITIES.map((capability, index) => (
            <article key={capability.title} className="rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-white/70 p-6 shadow-[0_1.25rem_3rem_rgba(24,55,46,.06)] sm:p-7">
              <span className="text-sm font-black tracking-[.14em] text-[#775d22]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 font-playfair text-2xl font-black leading-tight">
                {capability.title}
              </h3>
              <p className="mt-4 leading-7 text-[var(--public-muted)]">
                {capability.description}
              </p>
              <ul className="mt-6 space-y-2 text-sm font-semibold leading-6 text-[var(--public-green)]">
                {capability.examples.map((example) => <li key={example}>{example}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-sand)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
              Clear places to start
            </p>
            <h2 className="mt-5 font-playfair text-4xl font-black md:text-5xl">
              Start small, then decide what helps next.
            </h2>
            <p className="mt-5 leading-7 text-[var(--public-muted)]">
              These are two simple offers for beginning a conversation. They do not
              limit what we can explore together.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {offerIds.map((offer) => {
              const detail = PUBLIC_OFFERS[offer];
              return (
                <article key={offer} className="rounded-[1.75rem] border border-[var(--public-ink)]/10 bg-white/80 p-7 shadow-[0_1.25rem_3rem_rgba(24,55,46,.06)] sm:p-9">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-[#775d22]">
                    Starting point
                  </p>
                  <h3 className="mt-4 font-playfair text-3xl font-black">
                    {detail.name}
                  </h3>
                  <p className="mt-5 text-xl font-semibold leading-8">
                    {detail.fit}
                  </p>
                  <p className="mt-5 max-w-[52ch] leading-7 text-[var(--public-muted)]">
                    {detail.summary}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-[var(--public-ink)]/10 pt-6">
                    <p className="text-2xl font-bold">{detail.price}</p>
                    <Link href={detail.detailHref} className="inline-flex min-h-11 items-center gap-2 font-bold text-[var(--public-green)] underline underline-offset-4">
                      See {detail.name} details
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-cream)]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            Not sure which path fits?
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--public-muted)]">
            Share what is happening. I will help you choose a useful starting point.
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
