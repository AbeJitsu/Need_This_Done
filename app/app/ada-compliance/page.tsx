import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileSearch, ShieldCheck } from "lucide-react";
import { seoConfig } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Website Accessibility Checks | NeedThisDone",
  description:
    "Learn what a focused website accessibility review can check, what it cannot certify, and how a contained improvement engagement works.",
  alternates: { canonical: "/ada-compliance" },
  openGraph: {
    title: "Website Accessibility Checks | NeedThisDone",
    description:
      "Practical accessibility signals, a clear scope, and no compliance guarantees.",
    url: `${seoConfig.baseUrl}/ada-compliance`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Accessibility Checks | NeedThisDone",
    description:
      "Practical accessibility signals, a clear scope, and no compliance guarantees.",
  },
};

const commonChecks = [
  [
    "Text alternatives",
    "Meaningful images need useful text alternatives; decorative images should not create noise for screen-reader users.",
  ],
  [
    "Form labels",
    "Inputs need visible, connected labels so people know what information is being requested.",
  ],
  [
    "Keyboard access",
    "Links, controls, menus, and forms should be reachable and usable without a mouse.",
  ],
  [
    "Heading structure",
    "A clear heading order helps people scan a page and navigate it with assistive technology.",
  ],
  [
    "Color contrast",
    "Text and essential controls need enough contrast to remain readable in real use.",
  ],
  [
    "Clear links and errors",
    "Link text and form feedback should explain what happens next instead of relying only on visual context.",
  ],
];

export default function AdaCompliancePage() {
  return (
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="relative overflow-hidden bg-[#18372e] text-white">
        <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-5 py-20 sm:px-8 md:py-28">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">
            Website accessibility
          </p>
          <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-tight md:text-7xl">
            Make your website easier for more people to use.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-emerald-50/75">
            Our limited website snapshot checks for common barriers, how search
            engines can understand a page, and basic speed clues. It can point
            to a problem worth fixing, but it is not legal advice or a promise
            of compliance.
          </p>
          <div className="mt-9">
            <Link
              href="/site-analyzer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-300 px-7 py-3 font-bold text-[#18372e]"
            >
              Get a Website Snapshot{" "}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="mt-4">
              <Link
                href="/website-fix"
                className="font-semibold text-emerald-100 underline"
              >
                See Website Fix details
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <FileSearch className="h-8 w-8 text-[#126b4e]" aria-hidden="true" />
            <h2 className="mt-5 font-playfair text-4xl font-black">
              What a quick check can help you notice
            </h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-[#50675e]">
              Automatic checks can spot things worth looking at, such as missing
              labels, unclear page structure, or controls that may be hard to
              use. They cannot judge every interaction, every person’s
              experience, or every legal requirement.
            </p>
            <p className="mt-5 rounded-2xl border border-[#183229]/10 bg-white p-5 text-sm leading-6 text-[#40564e]">
              <strong className="text-[#183229]">
                Use this as a starting point for a real conversation.
              </strong>{" "}
              If you need legal advice or a full review, work with a qualified
              specialist.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#183229]/10 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">
            Useful checks
          </p>
          <h2 className="mt-4 font-playfair text-4xl font-black">
            Six places one website fix may focus
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {commonChecks.map(([title, description]) => (
              <article
                key={title}
                className="rounded-2xl border border-[#183229]/10 bg-[#f7f4ed] p-5"
              >
                <Check className="h-5 w-5 text-[#126b4e]" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#50675e]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24">
        <div className="rounded-3xl bg-[#e4eee6] p-8 text-center">
          <ShieldCheck
            className="mx-auto h-7 w-7 text-[#126b4e]"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-3xl font-black">
            Start with one problem you can see.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#50675e]">
            A Website Fix can address one agreed issue. Bigger website changes
            and legal reviews need their own plan.
          </p>
          <Link
            href="/website-fix"
            className="mt-7 inline-flex items-center gap-2 font-bold text-[#126b4e] underline"
          >
            See Website Fix details{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
