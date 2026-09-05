import Link from "next/link";
import PublicClosing from "./PublicClosing";
import { PUBLIC_OFFERS, type PublicOfferId } from "@/lib/public-offers";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";
import { ArrowRight, Check } from "lucide-react";

type OfferPageProps = {
  offerId: PublicOfferId;
  title: string;
  introduction: string;
  commitment: string;
  included: string[];
  excluded: string[];
};

export default function OfferPage({
  offerId,
  title,
  introduction,
  commitment,
  included,
  excluded,
}: OfferPageProps) {
  const offer = PUBLIC_OFFERS[offerId];
  const route = offerId === "website-improvement" ? "/website-fix" : "/managed-automation";
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="border-b border-[var(--public-ink)]/10 bg-[var(--public-ink)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#b9d5bd]">
            {offer.name} · A clear place to start
          </p>
          <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
            {introduction}
          </p>
          <Link
            href={offer.contactHref}
            className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--public-soft)] px-7 py-3 font-bold text-[var(--public-ink)] hover:bg-white"
          >
            Share Your Vision
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[.7fr_1.3fr] md:py-24">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--public-green)]">
            Before you say yes
          </p>
          <h2 className="mt-4 font-playfair text-4xl font-black">
            You will know what we are taking on.
          </h2>
        </div>
        <p className="max-w-[60ch] text-lg leading-8 text-[#40564e]">
          {commitment}
        </p>
      </section>
      <section className="border-y border-[var(--public-ink)]/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-20">
          <div>
            <h2 className="font-playfair text-3xl font-black">
              What is included
            </h2>
            <ul className="mt-6 space-y-4">
              {included.map((item) => (
                <li key={item} className="flex gap-3 leading-7 text-[#40564e]">
                  <Check
                    className="mt-1 h-5 w-5 shrink-0 text-[var(--public-green)]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-[var(--public-ink)]/10 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            <h2 className="font-playfair text-3xl font-black">
              What this does not include
            </h2>
            <ul className="mt-6 space-y-4">
              {excluded.map((item) => (
                <li key={item} className="leading-7 text-[#40564e]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <div className="public-section">
        <p className="text-3xl font-bold">{offer.price}</p>
        <p className="mt-3">We agree on the work and price before you commit.</p>
        <Link href={`/work#${route.slice(1)}`} className="public-explore mt-4">Explore a {offer.name} example</Link>
      </div>
      <PublicClosing title="Tell us what you would like to change." href={offer.contactHref} secondary={PUBLIC_ROUTE_STAGES[route].secondary}>
        <p>Share the part that matters to you. We will clarify the work together before you decide.</p>
      </PublicClosing>
    </main>
  );
}
