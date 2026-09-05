import Link from "next/link";
import { ArrowRight } from "lucide-react";

const examples = [
  {
    id: "website-fix", href: "/website-fix", link: "Explore Website Fix",
    title: "Make an important page easier to act on",
    area: "Website Fix",
    happening:
      "An important page is not guiding visitors to the next step. The message, layout, or call to action is getting in the way.",
    tried:
      "A team might adjust the copy, rearranged sections, or added calls to action, but the page still feels harder to use than it should.",
    better:
      "We identify the specific friction, make the agreed correction, and hand back a clearer page with a record of what changed.",
  },
  {
    id: "managed-automation", href: "/managed-automation", link: "Explore Managed Automation",
    title: "Give repeated requests a clearer path",
    area: "Managed Automation",
    happening:
      "A recurring request keeps moving between messages, notes, and tools. Nobody has a dependable view of the next action or owner.",
    tried:
      "A team might add reminders, documents, or another tool, but the work still depends on memory and manual follow-up.",
    better:
      "We map the real bottleneck, define the desired result, and give you a focused proposal for how to resolve it.",
  },
  {
    id: "first-step", href: "/contact", link: "Share Your Vision",
    title: "Turn a broad idea into one useful move",
    area: "Vision-first starting point",
    happening:
      "You can see the better experience you want, but the problem is still broad and the first move is unclear.",
    tried:
      "An owner might carry the idea, discussed it, or started looking for someone to build it, but the work has not yet become a clear plan.",
    better:
      "We listen for the outcome, turn the problem into a workable brief, and define the first focused piece we can complete together.",
  },
] as const;

export default function WorkPageClient() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            Examples
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            Explore what a useful change could look like.
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd]">
            These examples show the kinds of problems we can help resolve, from
            the first frustrating pattern to one clear piece of work.
          </p>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"
        aria-labelledby="example-list-heading"
      >
        <h2 id="example-list-heading" className="sr-only">
          Problems we can help resolve
        </h2>
        <div className="divide-y divide-[var(--public-ink)]/15 border-y border-[var(--public-ink)]/15">
          {examples.map((example, index) => (
            <article
              id={example.id}
              key={example.title}
              className="grid gap-7 py-10 lg:grid-cols-[4rem_.8fr_1.2fr] lg:gap-10"
            >
              <span className="text-sm font-bold text-[#775d22]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--public-green)]">
                  {example.area}
                </p>
                <h3 className="mt-4 font-playfair text-3xl font-black">
                  {example.title}
                </h3>
              </div>
              <div>
                <dl className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <dt className="font-bold">What is happening</dt>
                    <dd className="mt-2 leading-7 text-[var(--public-muted)]">
                      {example.happening}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold">What might be tried</dt>
                    <dd className="mt-2 leading-7 text-[var(--public-muted)]">
                      {example.tried}
                    </dd>
                  </div>
                </dl>
                <p className="mt-6 border-l-2 border-[#d0a94f] pl-4 text-sm leading-6 text-[var(--public-muted)]">
                  <span className="font-bold text-[var(--public-ink)]">
                    How we help resolve it:{" "}
                  </span>
                  {example.better}
                </p>
                <Link href={example.href} className="public-explore mt-4">{example.link}</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-sand)]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            What would you like to make possible?
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--public-muted)]">
            You can share the unfinished version. We will listen and help you
            resolve the right piece first.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white"
          >
            Share Your Vision{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-5">
            <Link
              href="/about"
              className="font-semibold text-[var(--public-green)] underline"
            >
              Why NeedThisDone
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
