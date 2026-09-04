import Link from 'next/link';

export default function NotFound() {
  return <main id="main-content" className="flex min-h-[65vh] flex-col items-center justify-center bg-[#f7f4ed] px-4 text-center text-[#183229]"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">Page not found</p><h1 className="mt-4 font-playfair text-7xl font-black">404</h1><p className="mt-4 text-xl text-[#50675e]">This page may have moved, but you can return to the beginning.</p><Link href="/" className="mt-7 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white">Return Home</Link><Link href="/contact" className="mt-4 text-sm font-semibold text-[#126b4e] underline">Contact us</Link></main>;
}
