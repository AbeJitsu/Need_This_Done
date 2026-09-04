import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PUBLIC_OFFERS } from "@/lib/public-offers";

const paths = [
  {
    id: "website-fix",
    alias: "website-improvement",
    name: "Website Fix",
    statement: "Make one important part of your website meaningfully better.",
    summary: PUBLIC_OFFERS["website-improvement"].summary,
    price: "$500",
    details: "/website-fix",
    contact: PUBLIC_OFFERS["website-improvement"].contactHref,
    goodFor: [
      "One page, path, or component",
      "A clear, contained correction",
      "A documented handoff",
    ],
  },
  {
    id: "managed-automation",
    alias: "ai-operator",
    name: "Managed Automation",
    statement: "Create a better way through one repeated problem at work.",
    summary: PUBLIC_OFFERS["ai-operator"].summary,
    price: "Proposal-based",
    details: "/managed-automation",
    contact: PUBLIC_OFFERS["ai-operator"].contactHref,
    goodFor: [
      "One repeated problem",
      "A shared picture of a better result",
      "A focused written proposal",
    ],
  },
] as const;

export default function ServicesPageClient() {
  return (
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10 bg-[#18372e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">
            What we do
          </p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            Start with the problem that keeps following you around.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#dce8dd] md:text-xl">
            You do not need to know which service fits. Tell us what is not
            working. We will listen and help you resolve the right piece first.
          </p>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"
        aria-labelledby="starting-points-heading"
      >
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">
          Concrete starting points
        </p>
        <h2
          id="starting-points-heading"
          className="mt-5 max-w-3xl font-playfair text-4xl font-black md:text-5xl"
        >
          Two clear places to start. No pressure to choose yet.
        </h2>
        <div className="mt-12 divide-y divide-[#183229]/15 border-y border-[#183229]/15">
          {paths.map((path) => (
            <article
              id={path.id}
              key={path.id}
              className="relative scroll-mt-24 py-10"
            >
              <span
                id={path.alias}
                className="absolute top-0 scroll-mt-24"
                aria-hidden="true"
              />
              <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-16">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-[#775d22]">
                    {path.price}
                  </p>
                  <h3 className="mt-3 font-playfair text-3xl font-black md:text-4xl">
                    {path.name}
                  </h3>
                </div>
                <div>
                  <p className="max-w-2xl text-2xl font-semibold leading-9">
                    {path.statement}
                  </p>
                  <p className="mt-4 max-w-2xl leading-7 text-[#50675e]">
                    {path.summary}
                  </p>
                  <ul className="mt-6 grid gap-3 text-sm text-[#40564e] sm:grid-cols-3">
                    {path.goodFor.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#126b4e]"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    <Link
                      href={path.details}
                      className="inline-flex min-h-11 items-center gap-2 px-2 py-3 font-bold text-[#126b4e] underline underline-offset-4"
                    >
                      See whether this fits{" "}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[#183229]/10 bg-[#e8e2d5]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            Not sure which path fits?
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-[#50675e]">
            That is completely fine. Share what is happening, and we will help
            you work out the right place to start.
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
              href="/how-it-works"
              className="font-semibold text-[#126b4e] underline"
            >
              See how we help
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
