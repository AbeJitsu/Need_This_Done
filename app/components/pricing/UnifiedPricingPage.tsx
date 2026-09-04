import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { OfferComparison } from "@/components/public/PublicServiceVisuals";

export default function UnifiedPricingPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#f7f4ed] text-[#183229]"
    >
      <section className="border-b border-[#183229]/10">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">
            Pricing
          </p>
          <h1 className="mt-5 font-playfair text-5xl font-black leading-tight md:text-7xl">
            Know what help costs before you say yes.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#50675e]">
            Website Fix is $500 for one agreed website fix. Managed Automation
            is priced by proposal: we write down the plan and price for one
            repeated task before work begins.
          </p>
        </div>
      </section>

      <div
        className="relative mx-auto max-w-5xl scroll-mt-24 px-5 py-16 sm:px-8 md:py-24"
        id="website-fix"
      >
        <span
          id="website-improvement"
          className="absolute top-0 scroll-mt-24"
          aria-hidden="true"
        />
        <span
          id="ai-operator"
          className="absolute top-0 scroll-mt-24"
          aria-hidden="true"
        />
        <span
          id="managed-automation"
          className="absolute top-0 scroll-mt-24"
          aria-hidden="true"
        />
        <OfferComparison heading="Two clear ways to get help, each explained before work begins." />
      </div>

      <section className="border-y border-[#183229]/10 bg-white">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-20">
          <section aria-labelledby="website-fix-payment">
            <h2
              id="website-fix-payment"
              className="font-playfair text-3xl font-black"
            >
              Website Fix payment
            </h2>
            <p className="mt-4 leading-7 text-[#50675e]">
              $250 by manual invoice to begin. $250 by manual invoice after the
              agreed fix is delivered.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-[#40564e]">
              {[
                "One contained scope",
                "One clear handoff",
                "No recurring payment",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#126b4e]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/website-fix"
              className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-[#126b4e] underline underline-offset-4"
            >
              See Website Fix details{" "}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
          <section
            aria-labelledby="managed-automation-payment"
            className="border-t border-[#183229]/10 pt-10 md:border-l md:border-t-0 md:pl-10 md:pt-0"
          >
            <h2
              id="managed-automation-payment"
              className="font-playfair text-3xl font-black"
            >
              Managed Automation proposal
            </h2>
            <p className="mt-4 leading-7 text-[#50675e]">
              The proposal states the repeated problem, the better result you
              want, how you will recognize progress, price, and payment terms.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-[#40564e]">
              {[
                "One repeated problem",
                "One shared picture of a better result",
                "A focused proposal",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#126b4e]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/managed-automation"
              className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-[#126b4e] underline underline-offset-4"
            >
              See Managed Automation details{" "}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </section>

      <section className="bg-[#e8e2d5]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-24">
          <h2 className="font-playfair text-4xl font-black md:text-5xl">
            You do not need to decide alone.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#50675e]">
            Share what is getting in the way. We will help you decide what can
            resolve it and tell you the price before work begins.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white"
          >
            Share Your Vision{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
