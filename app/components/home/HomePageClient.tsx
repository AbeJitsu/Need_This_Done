import Link from "next/link";
import { ArrowRight } from "lucide-react";

const principles = [
  [
    "We hear you out",
    "You can bring the problem exactly as it is. We listen before we start suggesting answers.",
  ],
  [
    "We make it clear",
    "Before work begins, you see what we will resolve, what it costs, and what is included.",
  ],
  [
    "We start where it matters",
    "We take on the first useful piece instead of making the work bigger than it needs to be.",
  ],
  [
    "We are straight with you",
    "If something needs a different kind of help, we say so early and plainly.",
  ],
] as const;

const examples = [
  {
    title: "A website that earns the next click",
    happening:
      "An important page feels unclear, slow, inaccessible, or difficult to use.",
    tried:
      "You have adjusted the copy, layout, or calls to action, but the page still is not doing its job.",
    after:
      "We find the friction, make the agreed fix, and hand back a clearer page with a record of what changed.",
  },
  {
    title: "A better way through repeated work",
    happening:
      "A recurring task keeps crossing inboxes, documents, and tools without a dependable path.",
    tried:
      "You have added reminders, documents, or another tool, but the work still depends on manual follow-up.",
    after:
      "We identify the bottleneck, clarify the result, and define a focused proposal to move it forward.",
  },
] as const;

export default function HomePageClient() {
  return (
    <main
      id="main-content"
      className="overflow-hidden bg-[#f7f4ed] text-[#183229]"
    >
      <section className="relative border-b border-[#183229]/10">
        <div
          className="pointer-events-none absolute right-[-12rem] top-[-15rem] h-[34rem] w-[34rem] rounded-full bg-[#d0a94f]/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24 lg:py-28">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">
            For owners and founders
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] tracking-tight sm:text-6xl md:text-7xl">
            Your vision, brought to life.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#50675e] md:text-xl">
            When something keeps getting in the way, you should not have to keep
            guessing alone. Tell us what is happening. We will listen, make sure
            we understand, and help you resolve it.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e]"
            >
              Share Your Vision{" "}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/services"
              className="inline-flex min-h-12 items-center justify-center px-3 py-3 font-bold text-[#126b4e] underline underline-offset-4"
            >
              See what we do
            </Link>
          </div>
        </div>
      </section>

      <section
        id="what-we-do"
        aria-labelledby="what-we-do-heading"
        className="scroll-mt-24"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">
              What we do
            </p>
            <h2
              id="what-we-do-heading"
              className="mt-5 font-playfair text-4xl font-black leading-tight md:text-5xl"
            >
              A website problem. Repeated work. One place to start.
            </h2>
          </div>
          <div className="divide-y divide-[#183229]/15 border-y border-[#183229]/15">
            <article className="py-7">
              <h3 className="font-playfair text-3xl font-black">Website Fix</h3>
              <p className="mt-3 max-w-2xl leading-7 text-[#50675e]">
                For one page or part of your website that is making it harder
                for people to take the next step. We review it, agree on one
                fix, and complete it for $500.
              </p>
              <Link
                href="/website-fix"
                className="mt-5 inline-flex items-center gap-2 font-bold text-[#126b4e]"
              >
                See how Website Fix works{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
            <article className="py-7">
              <h3 className="font-playfair text-3xl font-black">
                Managed Automation
              </h3>
              <p className="mt-3 max-w-2xl leading-7 text-[#50675e]">
                For one repeated task that keeps relying on reminders, messages,
                or your memory. We write down the problem, the plan, and the
                price before work begins.
              </p>
              <Link
                href="/managed-automation"
                className="mt-5 inline-flex items-center gap-2 font-bold text-[#126b4e]"
              >
                See how repeated work can change{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section
        id="why-us"
        aria-labelledby="why-us-heading"
        className="scroll-mt-24 border-y border-[#183229]/10 bg-[#18372e] text-white"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
              Why Need This Done
            </p>
            <h2
              id="why-us-heading"
              className="mt-5 font-playfair text-4xl font-black leading-tight md:text-6xl"
            >
              You deserve to be heard before anyone starts prescribing
              solutions.
            </h2>
          </div>
          <dl className="mt-14 grid gap-x-10 gap-y-9 border-t border-white/15 pt-10 md:grid-cols-2">
            {principles.map(([term, description]) => (
              <div key={term}>
                <dt className="font-playfair text-2xl font-black text-white">
                  {term}
                </dt>
                <dd className="mt-3 max-w-lg leading-7 text-[#dce8dd]">
                  {description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="examples-heading">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">
            How we move a stuck problem forward
          </p>
          <h2
            id="examples-heading"
            className="mt-5 max-w-3xl font-playfair text-4xl font-black leading-tight md:text-5xl"
          >
            What better can look like.
          </h2>
          <div className="mt-12 divide-y divide-[#183229]/15 border-y border-[#183229]/15">
            {examples.map((example) => (
              <article
                key={example.title}
                className="grid gap-6 py-9 md:grid-cols-[.7fr_1fr] md:gap-14"
              >
                <h3 className="font-playfair text-3xl font-black">
                  {example.title}
                </h3>
                <dl className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[.16em] text-[#775d22]">
                      What is happening
                    </dt>
                    <dd className="mt-3 leading-7 text-[#50675e]">
                      {example.happening}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[.16em] text-[#775d22]">
                      What you have tried
                    </dt>
                    <dd className="mt-3 leading-7 text-[#50675e]">
                      {example.tried}
                    </dd>
                  </div>
                </dl>
                <p className="leading-7 text-[#50675e] md:col-start-2">
                  <span className="font-bold text-[#126b4e]">
                    How we help resolve it:{" "}
                  </span>
                  {example.after}
                </p>
              </article>
            ))}
          </div>
          <Link
            href="/work"
            className="mt-7 inline-flex items-center gap-2 font-bold text-[#126b4e]"
          >
            See more examples{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="border-t border-[#183229]/10 bg-[#e8e2d5]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">
            The next move
          </p>
          <h2 className="mt-5 font-playfair text-4xl font-black md:text-6xl">
            You do not have to have it all figured out.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#50675e]">
            Share what is getting in the way. We will hear you out and help you
            resolve the right piece first.
          </p>
          <Link
            href="/contact"
            className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white"
          >
            Share Your Vision{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
