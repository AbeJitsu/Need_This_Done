import type { Metadata } from "next";
import PublicClosing from "@/components/public/PublicClosing";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";

export const metadata: Metadata = {
  title: "How We Help | NeedThisDone",
  description:
    "Tell us what keeps getting in the way. We listen, make sure we understand, and help you resolve it.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  [
    "Tell us what is going on",
    "Bring the messy version. You do not need the right words, a finished plan, or a technical brief.",
  ],
  [
    "We clarify the context",
    "Tell us about any earlier attempts, what matters to you, and what you would like to avoid.",
  ],
  [
    "We agree on what fixed means",
    "We repeat the problem back in plain language and make sure we are aiming at the change that matters to you.",
  ],
  [
    "We show you the first piece we can resolve",
    "Before work starts, you see what we will take on, what it costs, and what is not included.",
  ],
  [
    "You decide, then we do the agreed work",
    "Nothing starts automatically. If you say yes, we resolve the agreed piece and show you what changed.",
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
            From your first idea to work you can review.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
            You share the situation. We clarify the goal, agree on the work,
            and show you the completed change.
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
            A clear way from “this is not working” to a real change.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--public-muted)]">
            We do not rush you into a service or pretend every problem has the
            same answer. We start by hearing you out.
          </p>
        </div>
        <ol className="mt-12 divide-y divide-[var(--public-ink)]/15 border-y border-[var(--public-ink)]/15">
          {steps.map(([title, description], index) => (
            <li
              key={title}
              className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr] sm:gap-8"
            >
              <span className="text-sm font-bold text-[#775d22]">
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
        <p>Share the result you want. We will clarify the first piece of work and what you can review before deciding.</p>
      </PublicClosing>
    </main>
  );
}
