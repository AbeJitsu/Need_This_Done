'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PUBLIC_NAVIGATION, PUBLIC_PRIMARY_ACTION, isPublicRouteCurrent } from '@/lib/public-journey';

const links = PUBLIC_NAVIGATION;

export default function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--public-ink)]/10 bg-[var(--public-cream)]/95 text-[var(--public-ink)] backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between px-5 sm:px-8 lg:min-h-[80px]">
        <Link href="/" className="font-playfair text-xl font-black tracking-tight" onClick={() => setOpen(false)}>Need This Done</Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={isPublicRouteCurrent(pathname, link.href) ? 'page' : undefined} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${isPublicRouteCurrent(pathname, link.href) ? 'bg-[var(--public-soft)] text-[var(--public-ink)]' : 'text-[#40564e] hover:text-[var(--public-green)]'}`}>{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href={PUBLIC_PRIMARY_ACTION.href} className="hidden items-center rounded-full bg-[var(--public-green)] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#0c563e] focus-visible:ring-[#d0a94f] sm:inline-flex">{PUBLIC_PRIMARY_ACTION.label}</Link>
          <button ref={trigger} type="button" className="grid h-11 w-11 place-items-center rounded-lg transition hover:bg-[var(--public-sand)] focus-visible:ring-[#d0a94f] lg:hidden" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="public-mobile-navigation" onClick={() => setOpen((value) => !value)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
      </div>
      {open && <nav id="public-mobile-navigation" aria-label="Mobile navigation" className="border-t border-[var(--public-ink)]/10 bg-[var(--public-cream)] px-5 py-3 lg:hidden">
        {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={isPublicRouteCurrent(pathname, link.href) ? "page" : undefined} className={`block rounded-lg px-3 py-3 font-semibold text-[var(--public-ink)] hover:bg-[var(--public-soft)] ${isPublicRouteCurrent(pathname, link.href) ? "bg-[var(--public-soft)]" : ""}`}>{link.label}</Link>)}
        <Link href={PUBLIC_PRIMARY_ACTION.href} onClick={() => setOpen(false)} className="mt-2 block rounded-lg bg-[var(--public-green)] px-3 py-3 text-center font-bold text-white">{PUBLIC_PRIMARY_ACTION.label}</Link>
      </nav>}
    </header>
  );
}
