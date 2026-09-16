import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";

const nextStep = PUBLIC_ROUTE_STAGES["/work"].secondary;

const projectProof = [
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
            What I build
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            One real project. Many useful skills.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd]">
            NeedThisDone is the working platform I designed and build. It is the
            clearest example of how I bring websites, tools, workflows, and careful
            review together.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="project-heading">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
            A real working example
          </p>
          <h2 id="project-heading" className="mt-5 font-playfair text-4xl font-black md:text-5xl">
            Built to make important work easier to see and manage.
          </h2>
          <p className="mt-5 leading-7 text-[var(--public-muted)]">
            This is not presented as a client case study. It is my own product and
            the most honest way to show the kind of work I can take on.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {projectProof.map((item, index) => (
            <article key={item.title} className="rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-white/70 p-6 shadow-[0_1.25rem_3rem_rgba(24,55,46,.06)] sm:p-8">
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
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-sand)]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">
            The next question
          </p>
          <h2 className="mt-5 font-playfair text-4xl font-black md:text-5xl">
            Which part would make your work easier?
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--public-muted)]">
            The Capabilities page maps the kinds of problems I can help solve.
            Then we can decide whether a small first step or a larger project fits.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/services" className="public-button inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--public-ink)]/20 px-7 py-3 font-bold text-[var(--public-ink)]">
              Explore capabilities
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="public-button inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white">
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
