import type { Metadata } from "next";
import PublicClosing from "@/components/public/PublicClosing";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";
import { PUBLIC_CORE_PROMISE } from "@/lib/public-copy";

export const metadata: Metadata = {
  title: "How We Help | NeedThisDone",
  description:
    PUBLIC_CORE_PROMISE,
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  [
    "Tell us what is going on",
    "Bring the messy version. You do not need a finished plan or a technical brief.",
  ],
  [
    "We ask what you have tried",
    "Tell us what you tried, what mattered, and what you want to avoid.",
  ],
  [
    "We agree on the result",
    "We repeat the problem in plain language. You confirm the change that matters.",
  ],
  [
    "You get a plan and a price",
    "Before work starts, you see the scope, price, and limits.",
  ],
  [
    "You decide, then we do the agreed work",
    "Nothing starts automatically. If you say yes, we complete the agreed piece and show what changed.",
  ],
] as const;

export default function HowItWorksPage() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            How we help
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            Tell us the problem. We will work out the next step.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
            You share the situation. We clarify the goal and agree on the work.
            Then we show the completed change.
          </p>
        </div>
      </section>

      <section
        className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24"
        aria-labelledby="process-heading"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
            No pressure, no guessing
          </p>
          <h2
            id="process-heading"
            className="mt-5 font-playfair text-4xl font-black md:text-5xl"
          >
            A clear way from “this is not working” to a useful change.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--public-muted)]">
            We do not rush you into a service. We start by hearing you out.
          </p>
        </div>
        <ol className="public-process mt-12">
          {steps.map(([title, description], index) => (
            <li
              key={title}
              className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr] sm:gap-8"
            >
              <span className="public-process__number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-playfair text-2xl font-black">{title}</h3>
                <p className="mt-3 max-w-[60ch] leading-7 text-[var(--public-muted)]">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <PublicClosing title="Start with what you know." secondary={PUBLIC_ROUTE_STAGES['/how-it-works'].secondary}>
        <p>Share the result you want. We will clarify the first piece and what you can review.</p>
      </PublicClosing>
    </main>
  );
}
