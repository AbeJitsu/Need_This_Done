'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PUBLIC_NAVIGATION } from '@/lib/public-journey';

const links = PUBLIC_NAVIGATION;

export default function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#183229]/10 bg-[#f7f4ed]/95 text-[#183229] backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between px-5 sm:px-8 lg:min-h-[80px]">
        <Link href="/" className="font-playfair text-xl font-black tracking-tight" onClick={() => setOpen(false)}>Need This Done</Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${pathname === link.href ? 'bg-[#e4eee6] text-[#183229]' : 'text-[#40564e] hover:text-[#126b4e]'}`}>{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/contact" className="hidden items-center rounded-full bg-[#126b4e] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#0c563e] focus-visible:ring-[#d0a94f] sm:inline-flex">Share Your Vision</Link>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-lg transition hover:bg-[#e8e2d5] focus-visible:ring-[#d0a94f] lg:hidden" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="public-mobile-navigation" onClick={() => setOpen((value) => !value)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
      </div>
      {open && <nav id="public-mobile-navigation" aria-label="Mobile navigation" className="border-t border-[#183229]/10 bg-[#f7f4ed] px-5 py-3 lg:hidden">
        {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-semibold text-[#183229] hover:bg-[#e4eee6]">{link.label}</Link>)}
        <Link href="/contact" onClick={() => setOpen(false)} className="mt-2 block rounded-lg bg-[#126b4e] px-3 py-3 text-center font-bold text-white">Share Your Vision</Link>
      </nav>}
    </header>
  );
}
