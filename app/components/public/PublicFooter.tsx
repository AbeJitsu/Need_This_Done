'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PUBLIC_FOOTER_GROUPS, isPublicRouteCurrent } from '@/lib/public-journey';

export default function PublicFooter() {
  const pathname = usePathname();
  const groups = PUBLIC_FOOTER_GROUPS;
  return <footer className="border-t border-[var(--public-ink)]/10 bg-[var(--public-ink)] text-[var(--public-cream)]"><div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_2fr]"><div><Link href="/" className="font-playfair text-xl font-black">Need This Done</Link><p className="mt-3 max-w-sm text-sm leading-6 text-[#dce8dd]">Your vision, brought to life with clarity, focus, and honest boundaries.</p></div><nav aria-label="Footer navigation" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{groups.map(({title, links}) => <div key={title}><h2 className="text-xs font-bold uppercase tracking-[.18em] text-[#b9d5bd]">{title}</h2><ul className="mt-4 space-y-3 text-sm text-[#dce8dd]">{links.map(({href, label}) => <li key={href}><Link aria-current={isPublicRouteCurrent(pathname, href) ? "page" : undefined} className="inline-flex min-h-11 items-center hover:text-white hover:underline aria-[current=page]:underline" href={href}>{label}</Link></li>)}</ul></div>)}</nav></div></footer>;
}
