import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const principles = [
  [
    "We notice what keeps coming back",
    "Good ideas can get buried under repeated workarounds, competing advice, and the feeling that every possible fix is too big.",
  ],
  [
    "We respect what you have already tried",
    "Earlier attempts usually made sense at the time. We ask about them before we start telling you what to do next.",
  ],
  [
    "We stay with the real problem",
    "We repeat back what we understand, agree on the first piece to resolve, and keep the work aimed there.",
  ],
  [
    "We are honest about what comes next",
    "We tell you the price, what is included, and what still needs another kind of help before you have to decide.",
  ],
] as const;

export const metadata: Metadata = {
  title: "Why Us | NeedThisDone",
  description:
    "How NeedThisDone keeps the desired outcome visible, the next step clear, and the work honestly bounded.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Why Us | NeedThisDone",
    description: "Outcome-led help with clear focus and honest boundaries.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10 bg-[#18372e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            Why NeedThisDone
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            You deserve to be heard before someone starts prescribing solutions.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#dce8dd] md:text-xl">
            We help owners and founders get to the real issue, agree on the
            first part to resolve, and move it forward without pretending every
            answer is simple.
          </p>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"
        aria-labelledby="principles-heading"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">
            The way we work
          </p>
          <h2
            id="principles-heading"
            className="mt-5 font-playfair text-4xl font-black leading-tight md:text-5xl"
          >
            You bring the context. We bring care, clarity, and follow-through.
          </h2>
        </div>
        <dl className="mt-14 grid gap-x-10 gap-y-10 border-y border-[#183229]/15 py-10 md:grid-cols-2">
          {principles.map(([term, description]) => (
            <div key={term}>
              <dt className="font-playfair text-2xl font-black">{term}</dt>
              <dd className="mt-3 max-w-lg leading-7 text-[#50675e]">
                {description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-[#183229]/10 bg-[#e8e2d5]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            Bring us the part that is keeping you stuck.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#50675e]">
            You do not need to choose a service or prepare a perfect brief. We
            will listen and help you resolve the right piece first.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e]"
          >
            Share Your Vision{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
