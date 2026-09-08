import Link from "next/link";
import { ArrowRight, Sparkles, Target } from "lucide-react";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";
import { PUBLIC_OFFERS, type PublicOfferId } from "@/lib/public-offers";

const offerIds = ["website-improvement", "ai-operator"] as const satisfies readonly PublicOfferId[];

const offerPresentation = {
  "website-improvement": {
    icon: "target",
    accent: "border-[#126b4e] bg-[#e4eee6]",
    iconAccent: "bg-[#126b4e] text-white",
  },
  "ai-operator": {
    icon: "sparkles",
    accent: "border-[#8b6b26] bg-[#eee4cd]",
    iconAccent: "bg-[#d0a94f] text-[#183229]",
  },
} as const satisfies Record<PublicOfferId, {
  icon: "target" | "sparkles";
  accent: string;
  iconAccent: string;
}>;

const nextStep = PUBLIC_ROUTE_STAGES["/services"].secondary;

function OfferIcon({ name }: { name: "target" | "sparkles" }) {
  return name === "target" ? (
    <Target className="h-5 w-5" aria-hidden="true" />
  ) : (
    <Sparkles className="h-5 w-5" aria-hidden="true" />
  );
}

export default function ServicesPageClient() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            What we do
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            A clearer website. Less busywork.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
            Two focused ways to make something important easier to move forward.
            Start with the option that sounds closest, or bring the situation as
            it is.
          </p>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"
        aria-labelledby="starting-points-heading"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
            Starting points
          </p>
          <h2
            id="starting-points-heading"
            className="mt-5 font-playfair text-4xl font-black md:text-5xl"
          >
            Choose the kind of change you want to make.
          </h2>
        </div>

        <div className="public-offer-card-grid mt-12 grid gap-6 lg:grid-cols-2">
          {offerIds.map((offerId, index) => {
            const offer = PUBLIC_OFFERS[offerId];
            const presentation = offerPresentation[offerId];
            const routeId = offer.detailHref.slice(1);

            return (
              <article
                id={routeId}
                key={offerId}
                data-public-offer-card={offerId}
                className={`public-offer-card relative min-w-0 rounded-[1.75rem] border-t-4 p-7 text-[var(--public-ink)] shadow-[0_1.25rem_3rem_rgba(24,55,46,.06)] sm:p-9 ${presentation.accent}`}
              >
                <span
                  id={offer.id}
                  className="absolute scroll-mt-24"
                  aria-hidden="true"
                />
                <header className="flex items-start justify-between gap-5">
                  <div>
                    <span className="text-sm font-black tracking-[.14em] text-[#775d22]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-playfair text-3xl font-black md:text-4xl">
                      {offer.name}
                    </h3>
                  </div>
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${presentation.iconAccent}`}
                  >
                    <OfferIcon name={presentation.icon} />
                  </span>
                </header>
                <div data-public-offer-region="fit" className="pt-7">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-[#775d22]">
                    Who it helps
                  </p>
                  <p className="mt-3 text-2xl font-semibold leading-9">
                    {offer.fit}
                  </p>
                </div>
                <div data-public-offer-region="summary" className="pt-5">
                  <p className="max-w-[48ch] leading-7 text-[var(--public-muted)]">
                    {offer.summary}
                  </p>
                </div>
                <footer
                  data-public-offer-region="actions"
                  className="mt-8 flex flex-wrap items-end justify-between gap-5 border-t border-[var(--public-ink)]/15 pt-6"
                >
                  <p className="text-2xl font-bold">{offer.price}</p>
                  <Link
                    href={offer.detailHref}
                    className="inline-flex min-h-11 items-center gap-2 py-3 font-bold text-[var(--public-green)] underline underline-offset-4"
                  >
                    See {offer.name} details
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      </section>

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
