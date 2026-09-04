import Link from "next/link";
import { ArrowRight } from "lucide-react";

const examples = [
  {
    title: "Make an important page easier to act on",
    area: "Website Fix",
    happening:
      "An important page is not guiding visitors to the next step. The message, layout, or call to action is getting in the way.",
    tried:
      "You have adjusted the copy, rearranged sections, or added calls to action, but the page still feels harder to use than it should.",
    better:
      "We identify the specific friction, make the agreed correction, and hand back a clearer page with a record of what changed.",
  },
  {
    title: "Give repeated requests a clearer path",
    area: "Managed Automation",
    happening:
      "A recurring request keeps moving between messages, notes, and tools. Nobody has a dependable view of the next action or owner.",
    tried:
      "You have added reminders, documents, or another tool, but the work still depends on memory and manual follow-up.",
    better:
      "We map the real bottleneck, define the desired result, and give you a focused proposal for how to resolve it.",
  },
  {
    title: "Turn a broad idea into one useful move",
    area: "Vision-first starting point",
    happening:
      "You can see the better experience you want, but the problem is still broad and the first move is unclear.",
    tried:
      "You have carried the idea, discussed it, or started looking for someone to build it, but the work has not yet become a clear plan.",
    better:
      "We listen for the outcome, turn the problem into a workable brief, and define the first focused piece we can complete together.",
  },
] as const;

export default function WorkPageClient() {
  return (
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10 bg-[#18372e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            Examples
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            When something keeps getting in the way, we’re here to help fix it.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#dce8dd]">
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
        <p className="mb-8 max-w-3xl rounded-2xl border border-[#183229]/10 bg-white p-5 text-sm leading-6 text-[#50675e]">
          <strong className="text-[#183229]">
            These are hypothetical, representative scenarios.
          </strong>{" "}
          They are not client work, paid outcomes, or delivery proof. No time
          saving, delivery result, or live automation is claimed.
        </p>
        <div className="divide-y divide-[#183229]/15 border-y border-[#183229]/15">
          {examples.map((example, index) => (
            <article
              key={example.title}
              className="grid gap-7 py-10 lg:grid-cols-[4rem_.8fr_1.2fr] lg:gap-10"
            >
              <span className="text-sm font-bold text-[#775d22]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">
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
                    <dd className="mt-2 leading-7 text-[#50675e]">
                      {example.happening}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold">What you have tried</dt>
                    <dd className="mt-2 leading-7 text-[#50675e]">
                      {example.tried}
                    </dd>
                  </div>
                </dl>
                <p className="mt-6 border-l-2 border-[#d0a94f] pl-4 text-sm leading-6 text-[#50675e]">
                  <span className="font-bold text-[#183229]">
                    How we help resolve it:{" "}
                  </span>
                  {example.better}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[#183229]/10 bg-[#e8e2d5]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            What problem are you tired of carrying?
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[#50675e]">
            You can share the unfinished version. We will listen and help you
            resolve the right piece first.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white"
          >
            Share Your Vision{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-5">
            <Link
              href="/about"
              className="font-semibold text-[#126b4e] underline"
            >
              Why NeedThisDone
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
