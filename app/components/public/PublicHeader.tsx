'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '/website-fix', label: 'Website Fix' },
  { href: '/managed-automation', label: 'Managed Automation' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/work', label: 'How We Work' },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#183229]/10 bg-[#f7f4ed]/95 text-[#183229] backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-playfair text-xl font-black tracking-tight" onClick={() => setOpen(false)}>Need This Done</Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${pathname === link.href ? 'bg-[#e4eee6] text-[#183229]' : 'text-[#40564e] hover:text-[#126b4e]'}`}>{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/contact" className="hidden min-h-11 items-center rounded-full bg-[#126b4e] px-5 text-sm font-bold text-white transition hover:bg-[#0c563e] sm:inline-flex">Choose a starting point</Link>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-lg lg:hidden" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
      </div>
      {open && <nav aria-label="Mobile navigation" className="border-t border-[#183229]/10 bg-[#f7f4ed] px-5 py-3 lg:hidden">
        {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-semibold text-[#183229] hover:bg-[#e4eee6]">{link.label}</Link>)}
        <Link href="/contact" onClick={() => setOpen(false)} className="mt-2 block rounded-lg bg-[#126b4e] px-3 py-3 text-center font-bold text-white">Choose a starting point</Link>
      </nav>}
    </header>
  );
}
