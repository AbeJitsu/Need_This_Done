import Link from 'next/link';
import { PUBLIC_PRIMARY_ACTION } from '@/lib/public-journey';

export default function PublicClosing({ title, children, href = PUBLIC_PRIMARY_ACTION.href, secondary }: {
  title: string;
  children: React.ReactNode;
  href?: string;
  secondary?: { href: string; label: string };
}) {
  return <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-sand)]">
    <div className="public-section text-center">
      <h2 className="font-playfair text-4xl font-black md:text-5xl">{title}</h2>
      <div className="public-reading mx-auto mt-5 leading-7 text-[var(--public-muted)]">{children}</div>
      <Link href={href} className="public-action mt-8">{PUBLIC_PRIMARY_ACTION.label}</Link>
      {secondary && <p className="mt-4"><Link href={secondary.href} className="public-explore">{secondary.label}</Link></p>}
    </div>
  </section>;
}
