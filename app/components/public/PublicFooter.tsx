import Link from 'next/link';

export default function PublicFooter() {
  return <footer className="border-t border-[#183229]/10 bg-[#183229] text-[#f7f4ed]"><div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-end md:justify-between"><div><Link href="/" className="font-playfair text-xl font-black">Need This Done</Link><p className="mt-2 max-w-md text-sm leading-6 text-[#dce8dd]">Focused help for one website problem or one repeated problem at work.</p></div><div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#dce8dd]"><Link href="/pricing">Pricing</Link><Link href="/faq">FAQ</Link><Link href="/blog">Insights</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link></div></div></footer>;
}
