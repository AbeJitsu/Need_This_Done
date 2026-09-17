import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  PUBLIC_CAPABILITIES,
  PUBLIC_CAPABILITIES_INTRO,
} from "@/lib/public-capabilities";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";

const nextStep = PUBLIC_ROUTE_STAGES["/work"].secondary;

const productionProof = [
  {
    title: "A public site with a clear path",
    description:
      "Marketing pages, guided questions, and focused calls to action help a visitor move from a broad problem to a useful next step.",
  },
  {
    title: "A private place to keep work together",
    description:
      "Accounts, dashboards, and records give people one place to review requests, decisions, progress, and results.",
  },
  {
    title: "Workflows that do not lose the next step",
    description:
      "Structured intake, review points, and visible status replace scattered messages and unclear handoffs.",
  },
  {
    title: "Changes that can be checked",
    description:
      "Version control, automated checks, and clear evidence make the work easier to review before it moves forward.",
  },
] as const;

export default function WorkPageClient() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="public-page-hero border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            What we build
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            Full-stack work from first idea to working result.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd]">
            We build your vision, connect the tools you need, and solve the problem that matters most.
          </p>
        </div>
      </section>

      <section
        id="capabilities"
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"
        aria-labelledby="capabilities-heading"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
            The full path
          </p>
          <h2 id="capabilities-heading" className="mt-5 font-playfair text-4xl font-black md:text-5xl">
            One build, from interface to handoff.
          </h2>
          <p className="mt-5 max-w-[60ch] leading-7 text-[var(--public-muted)]">
            {PUBLIC_CAPABILITIES_INTRO}
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PUBLIC_CAPABILITIES.map((capability, index) => (
            <article
              key={capability.title}
              data-public-capability-card
              className="rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-white/70 p-6 shadow-[0_1.25rem_3rem_rgba(24,55,46,.06)] sm:p-7"
            >
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
                {capability.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-sand)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
              Built in production
            </p>
            <h2 className="mt-5 font-playfair text-4xl font-black md:text-5xl">
              NeedThisDone shows the pieces working together.
            </h2>
            <p className="mt-5 leading-7 text-[var(--public-muted)]">
              NeedThisDone is a production platform we designed and built: a public site, private workspace, APIs, database-backed state, and delivery checks in one system.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {productionProof.map((item, index) => (
              <article
                key={item.title}
                data-public-proof-card
                className="rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-white/70 p-6 shadow-[0_1.25rem_3rem_rgba(24,55,46,.06)] sm:p-8"
              >
                <span className="text-sm font-black tracking-[.14em] text-[#775d22]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-playfair text-2xl font-black leading-tight">
                  {item.title}
                </h3>
                <p className="mt-4 leading-7 text-[var(--public-muted)]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 border-t border-[var(--public-ink)]/10 pt-8 text-center">
            <Link
              href="/system"
              data-public-system-cta
              className="public-button inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--public-ink)]/20 px-5 py-2.5 font-bold text-[var(--public-ink)]"
            >
              See how the system carries work from request to review
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-cream)]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
            Choose the next piece
          </p>
          <h2 className="mt-5 font-playfair text-4xl font-black md:text-5xl">
            Start with the part that needs attention.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--public-muted)]">
            Start with a website, workflow, data problem, or larger build. We will agree on the useful first move.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/services"
              className="public-button inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--public-ink)]/20 px-7 py-3 font-bold text-[var(--public-ink)]"
            >
              See starting points
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="public-button inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white"
            >
              Share Your Vision
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-cream)]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            What would you like to make easier?
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--public-muted)]">
            You can bring the unfinished version. We will identify the useful first
            piece and make the next decision clear.
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
