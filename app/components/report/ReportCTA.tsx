import Link from 'next/link';
import { PUBLIC_OFFERS } from '@/lib/public-offers';

export default function ReportCTA() {
  const offer = PUBLIC_OFFERS['website-improvement'];
  return <section className="rounded-2xl bg-[var(--public-soft)] px-6 py-12 text-center text-[var(--public-ink)]">
    <h2 className="font-playfair text-3xl font-black">Choose one finding to look at more closely.</h2>
    <p className="public-reading mx-auto mt-4 leading-7">{offer.summary}</p>
    <p className="mt-4 font-bold">{offer.price}</p>
    <Link href={offer.detailHref} className="public-action mt-7">See Website Fix details</Link>
    <p className="mt-3"><Link href="/how-it-works" className="public-explore">See how we agree on the work</Link></p>
  </section>;
}
