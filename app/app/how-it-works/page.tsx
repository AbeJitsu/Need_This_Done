import type { Metadata } from "next";
import PublicClosing from "@/components/public/PublicClosing";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";
import { PUBLIC_CORE_PROMISE } from "@/lib/public-copy";

export const metadata: Metadata = {
  title: "How I Work | NeedThisDone",
  description: PUBLIC_CORE_PROMISE,
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  [
    "Make the problem observable",
    "I start with the page, bottleneck, evidence, and desired result. A broad idea becomes a concrete slice of work.",
  ],
  [
    "Map the system boundary",
    "I identify which interface, data, API, integration, or operational path has to change together.",
  ],
  [
    "Build the smallest useful path",
    "I connect the pieces end to end, keeping the first result small enough to inspect and improve.",
  ],
  [
    "Verify what matters",
    "I use route, accessibility, browser, and workflow checks to confirm that the intended path still works.",
  ],
  [
    "Hand off a clear next decision",
    "The result should show what changed, what remains, and what I would do next if the work continues.",
  ],
] as const;

export default function HowItWorksPage() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="public-page-hero border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">How I work</p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            I make the next technical decision easier to see.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
            Good software work is not only writing code. It is choosing the right
            boundary, making the result observable, and leaving enough evidence for
            someone else to review.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="process-heading">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">A repeatable approach</p>
          <h2 id="process-heading" className="mt-5 font-playfair text-4xl font-black md:text-5xl">
            From an open question to a reviewable result.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--public-muted)]">
            This is the process behind the projects on the work page. The tools can
            change; the discipline stays useful.
          </p>
        </div>
        <ol className="public-process mt-12">
          {steps.map(([title, description], index) => (
            <li key={title} className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr] sm:gap-8">
              <span className="public-process__number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-playfair text-2xl font-black">{title}</h3>
                <p className="mt-3 max-w-[60ch] leading-7 text-[var(--public-muted)]">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <PublicClosing title="See how the pieces fit." secondary={PUBLIC_ROUTE_STAGES["/how-it-works"].secondary}>
        <p>Selected work shows the interfaces, data boundaries, APIs, and operational details together.</p>
      </PublicClosing>
    </main>
  );
}
