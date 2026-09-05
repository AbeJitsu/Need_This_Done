import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PUBLIC_OFFERS } from "@/lib/public-offers";

const comparison = [
  {
    name: "Website Fix",
    rows: [
      ["Choose this when", "One website problem is slowing people down."],
      ["Useful change", PUBLIC_OFFERS["website-improvement"].summary],
      ["Included work", "A review, one agreed correction, and a record of the result."],
      ["Price", PUBLIC_OFFERS["website-improvement"].price],
    ],
    cta: "See Website Fix details",
    href: "/website-fix",
  },
  {
    name: "Managed Automation",
    rows: [
      [
        "Choose this when",
        "One repeated problem keeps slowing important work.",
      ],
      ["Useful change", PUBLIC_OFFERS["ai-operator"].summary],
      ["Included work", "A task review, an agreed improvement, and a written proposal."],
      ["Price", PUBLIC_OFFERS["ai-operator"].price],
    ],
    cta: "See Managed Automation details",
    href: "/managed-automation",
  },
] as const;

export function OfferComparison({
  heading = "Choose the right starting point.",
}: {
  heading?: string;
}) {
  return (
    <section aria-labelledby="offer-comparison-heading">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--public-green)]">
        Two clear offers
      </p>
      <h2
        id="offer-comparison-heading"
        className="mt-4 max-w-3xl font-playfair text-4xl font-black leading-tight md:text-5xl"
      >
        {heading}
      </h2>
      <div className="mt-10 overflow-hidden rounded-[2rem] border border-[var(--public-ink)]/15 bg-white md:grid md:grid-cols-2">
        {comparison.map((offer) => (
          <article key={offer.name}
            className="border-b border-[var(--public-ink)]/15 p-7 text-[var(--public-ink)] last:border-b-0 sm:p-9 md:border-b-0 md:first:border-r">
            <h3 className="font-playfair text-3xl font-black md:min-h-[4.5rem]">
              {offer.name}
            </h3>
            <dl className="mt-7 divide-y divide-[var(--public-ink)]/10 border-y border-[var(--public-ink)]/10">
              {offer.rows.map(([term, description]) => (
                <div key={term} className="grid gap-2 py-4 lg:grid-cols-[8rem_1fr]">
                  <dt className="text-xs font-bold uppercase tracking-wider text-[var(--public-green)]">{term}</dt>
                  <dd className={term === "Price" ? "text-xl font-bold" : "max-w-[60ch] leading-7 text-[#50675e]"}>{description}</dd>
                </div>
              ))}
            </dl>
            <Link href={offer.href}
              className="mt-4 inline-flex min-h-11 items-center gap-2 py-3 font-bold text-[var(--public-green)] underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-[var(--public-green)]">
              {offer.cta}<ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

const deliverySteps = [
  ["We listen", "Tell us what keeps happening and what you have tried."],
  ["We agree on the change", "We confirm the work and price with you before starting."],
  ["We show what changed", "We resolve the agreed problem and show you the result."],
] as const;

export function ThreeStepFlow() {
  return (
    <section aria-labelledby="three-step-flow-heading">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--public-green)]">
        Three steps
      </p>
      <h2
        id="three-step-flow-heading"
        className="mt-4 font-playfair text-4xl font-black"
      >
        A short path from stuck to done.
      </h2>
      <ol className="mt-8 border-y border-[var(--public-ink)]/15 md:grid md:grid-cols-3 md:divide-x md:divide-[var(--public-ink)]/15">
        {deliverySteps.map(([title, description], index) => (
          <li
            key={title}
            className="flex gap-4 border-b border-[var(--public-ink)]/10 py-6 last:border-b-0 md:border-b-0 md:px-6 md:first:pl-0 md:last:pr-0"
          >
            <span className="text-sm font-black text-[var(--public-green)]">
              {index + 1}
            </span>
            <div>
              <h3 className="font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#50675e]">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const outcomeSteps = [
  ["Repeated problem", "Name the work that keeps getting stuck."],
  ["Better result", "Say what should be different when the work improves."],
  ["Focused work", "Keep the work aimed at moving that result forward."],
] as const;

export function OutcomeFocusFlow() {
  return (
    <section
      aria-labelledby="human-control-heading"
      className="rounded-[2rem] bg-[#18372e] p-7 text-white sm:p-9"
    >
      <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">
        Outcome focus
      </p>
      <h2
        id="human-control-heading"
        className="mt-4 font-playfair text-4xl font-black"
      >
        Keep the better state in view.
      </h2>
      <ol
        className="mt-8 grid gap-3 sm:grid-cols-2"
        aria-label="Repeated problem, better result, focused work"
      >
        {outcomeSteps.map(([title, description], index) => (
          <li
            key={title}
            className={`flex gap-3 rounded-2xl border border-white/15 bg-white/[.06] p-4${index === outcomeSteps.length - 1 ? " sm:col-span-2" : ""}`}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-300 font-black text-[#18372e]">
              {index === outcomeSteps.length - 1 ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <div className="min-w-0">
              <h3 className="font-black">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-emerald-50/70">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
