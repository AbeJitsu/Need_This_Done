import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    "We listen to what you have tried",
    "We want to understand what you have already done, why it made sense, and what is still getting in the way.",
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
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10 bg-[#18372e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            How we help
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            You do not have to keep carrying the problem alone.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#dce8dd] md:text-xl">
            Tell us what keeps happening and what you have tried. We will
            listen, make sure we understand, and help you resolve it.
          </p>
        </div>
      </section>

      <section
        className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24"
        aria-labelledby="process-heading"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">
            No pressure, no guessing
          </p>
          <h2
            id="process-heading"
            className="mt-5 font-playfair text-4xl font-black md:text-5xl"
          >
            A clear way from “this is not working” to a real change.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#50675e]">
            We do not rush you into a service or pretend every problem has the
            same answer. We start by hearing you out.
          </p>
        </div>
        <ol className="mt-12 divide-y divide-[#183229]/15 border-y border-[#183229]/15">
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
                <p className="mt-3 max-w-2xl leading-7 text-[#50675e]">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-[#183229]/10 bg-[#e8e2d5]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            You can stop trying to solve it by yourself.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#50675e]">
            Share what is getting in the way. We will help you find the right
            piece to resolve first.
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
              href="/work"
              className="font-semibold text-[#126b4e] underline"
            >
              See examples of problems we can help resolve
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
