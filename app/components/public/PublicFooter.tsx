import Link from 'next/link';

export default function PublicFooter() {
  return <footer className="border-t border-[#183229]/10 bg-[#183229] text-[#f7f4ed]"><div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between"><div><Link href="/" className="font-playfair text-xl font-black">Need This Done</Link><p className="mt-3 max-w-md text-sm leading-6 text-[#dce8dd]">Your vision, brought to life with clarity, focus, and honest boundaries.</p></div><div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#dce8dd]"><Link href="/services">What We Do</Link><Link href="/about">Why Us</Link><Link href="/work">Examples</Link><Link href="/pricing">Pricing</Link><Link href="/faq">FAQ</Link><Link href="/blog">Insights</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div></footer>;
}
