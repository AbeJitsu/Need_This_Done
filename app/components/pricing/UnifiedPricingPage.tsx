import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OfferComparison, ThreeStepFlow } from "@/components/public/PublicServiceVisuals";

export default function UnifiedPricingPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[var(--public-cream)] text-[var(--public-ink)]"
    >
      <section className="border-b border-[var(--public-ink)]/10">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--public-green)]">
            Pricing
          </p>
          <h1 className="mt-5 font-playfair text-5xl font-black leading-tight md:text-7xl">
            Know what help costs before you say yes.
          </h1>
          <p className="mx-auto mt-6 max-w-[60ch] text-lg leading-8 text-[var(--public-muted)]">
            A clear price starts with a clear piece of work.
            Tell us what keeps happening. We’ll listen and agree on what needs to change.
          </p>
        </div>
      </section>

      <div
        className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 md:py-24"
        id="website-fix"
      >
        <span
          id="website-improvement"
          className="absolute top-0 scroll-mt-24"
          aria-hidden="true"
        />
        <span
          id="ai-operator"
          className="absolute top-0 scroll-mt-24"
          aria-hidden="true"
        />
        <span
          id="managed-automation"
          className="absolute top-0 scroll-mt-24"
          aria-hidden="true"
        />
        <OfferComparison heading="Two clear ways to get help, each explained before work begins." />
      </div>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <p className="mb-10 max-w-[60ch] text-lg leading-8">
          We agree on the work and price before you commit.
        </p>
        <ThreeStepFlow />
      </section>

      <section className="bg-[var(--public-sand)]">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            You do not need to decide alone.
          </h2>
          <p className="mx-auto mt-5 max-w-[60ch] leading-7 text-[var(--public-muted)]">
            Share what is getting in the way. We will help you decide what can
            resolve it and tell you the price before work begins.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white"
          >
            Share Your Vision{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
