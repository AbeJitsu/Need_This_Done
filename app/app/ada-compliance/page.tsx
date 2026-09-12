import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileSearch, ShieldCheck } from "lucide-react";
import { seoConfig } from "@/lib/seo-config";
import { PUBLIC_CORE_PROMISE } from "@/lib/public-copy";

export const metadata: Metadata = {
  title: "Website Accessibility Checks | NeedThisDone",
  description:
    `${PUBLIC_CORE_PROMISE} See common website accessibility signals.`,
  alternates: { canonical: "/ada-compliance" },
  openGraph: {
    title: "Website Accessibility Checks | NeedThisDone",
    description: PUBLIC_CORE_PROMISE,
    url: `${seoConfig.baseUrl}/ada-compliance`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Accessibility Checks | NeedThisDone",
    description: PUBLIC_CORE_PROMISE,
  },
};

const commonChecks = [
  [
    "Text alternatives",
    "Meaningful images need useful text alternatives. Decorative images should stay quiet for screen-reader users.",
  ],
  [
    "Form labels",
    "Inputs need visible labels. People should know what information each field requests.",
  ],
  [
    "Keyboard access",
    "Links, controls, menus, and forms should work without a mouse.",
  ],
  [
    "Heading structure",
    "A clear heading order helps people scan and navigate with assistive technology.",
  ],
  [
    "Color contrast",
    "Text and essential controls need enough contrast to stay readable.",
  ],
  [
    "Clear links and errors",
    "Links and form feedback should explain what happens next.",
  ],
];

export default function AdaCompliancePage() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="public-page-hero relative overflow-hidden bg-[var(--public-dark)] text-white">
        <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-5 py-20 sm:px-8 md:py-28">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">
            Website accessibility
          </p>
          <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-tight md:text-7xl">
            Make your website easier for more people to use.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-emerald-50/75">
            Our limited website snapshot checks common barriers, search signals,
            and basic speed clues. It points to a problem worth reviewing.
            It is not legal advice.
          </p>
          <div className="mt-9">
            <Link
              href="/site-analyzer"
              className="public-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-300 px-7 py-3 font-bold text-[var(--public-dark)]"
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
            <FileSearch className="h-8 w-8 text-[var(--public-green)]" aria-hidden="true" />
            <h2 className="mt-5 font-playfair text-4xl font-black">
              What a quick check can help you notice
            </h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-[var(--public-muted)]">
              Automatic checks can flag missing labels, unclear structure, or
              controls that may be hard to use. They do not review every
              interaction or legal requirement.
            </p>
            <p className="mt-5 rounded-2xl border border-[var(--public-ink)]/10 bg-white p-5 text-sm leading-6 text-[#40564e]">
              <strong className="text-[var(--public-ink)]">
                Use this as a starting point for a real conversation.
              </strong>{" "}
              If you need legal advice or a full review, work with a qualified
              specialist.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--public-ink)]/10 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--public-green)]">
            Useful checks
          </p>
          <h2 className="mt-4 font-playfair text-4xl font-black">
            Six places one website fix may focus
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {commonChecks.map(([title, description]) => (
              <article
                key={title}
                className="rounded-2xl border border-[var(--public-ink)]/10 bg-[var(--public-cream)] p-5"
              >
                <Check className="h-5 w-5 text-[var(--public-green)]" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--public-muted)]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-24">
        <div className="rounded-3xl bg-[var(--public-soft)] p-8 text-center">
          <ShieldCheck
            className="mx-auto h-7 w-7 text-[var(--public-green)]"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-3xl font-black">
            Start with one problem you can see.
          </h2>
          <p className="mx-auto mt-3 max-w-[60ch] leading-7 text-[var(--public-muted)]">
            A Website Fix can address one agreed issue. Bigger website changes
            and legal reviews need their own plan.
          </p>
          <Link
            href="/website-fix"
            className="mt-7 inline-flex items-center gap-2 font-bold text-[var(--public-green)] underline"
          >
            See Website Fix details{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
