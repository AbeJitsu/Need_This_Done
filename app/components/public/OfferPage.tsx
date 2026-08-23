import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

type OfferPageProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  commitment: string;
  included: string[];
  excluded: string[];
  cta: string;
  href: '/contact?offer=website-fix' | '/contact?offer=managed-automation';
};

export default function OfferPage({ eyebrow, title, introduction, commitment, included, excluded, cta, href }: OfferPageProps) {
  return <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
    <section className="border-b border-[#183229]/10 bg-[#183229] text-white"><div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#b9d5bd]">{eyebrow}</p><h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">{title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[#dce8dd] md:text-xl">{introduction}</p><Link href={href} className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#e4eee6] px-7 py-3 font-bold text-[#183229] hover:bg-white">{cta}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[.7fr_1.3fr] md:py-24"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">The commitment</p><h2 className="mt-4 font-playfair text-4xl font-black">Clear before work begins.</h2></div><p className="max-w-2xl text-lg leading-8 text-[#40564e]">{commitment}</p></section>
    <section className="border-y border-[#183229]/10 bg-white"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-20"><div><h2 className="font-playfair text-3xl font-black">A good fit includes</h2><ul className="mt-6 space-y-4">{included.map((item) => <li key={item} className="flex gap-3 leading-7 text-[#40564e]"><Check className="mt-1 h-5 w-5 shrink-0 text-[#126b4e]" aria-hidden="true" />{item}</li>)}</ul></div><div className="border-t border-[#183229]/10 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0"><h2 className="font-playfair text-3xl font-black">Outside this scope</h2><ul className="mt-6 space-y-4">{excluded.map((item) => <li key={item} className="leading-7 text-[#40564e]">{item}</li>)}</ul></div></div></section>
    <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 md:py-24"><h2 className="font-playfair text-4xl font-black">Start with the situation you have.</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-[#50675e]">We confirm the boundary and next step with you. Nothing here starts an automatic purchase or gives us authority to act.</p><Link href={href} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white hover:bg-[#0c563e]">{cta}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></section>
  </main>;
}
