import Link from 'next/link';

export default function PublicFooter() {
  const groups = [
    ['Explore', [['/services', 'What We Do'], ['/how-it-works', 'How We Work'], ['/work', 'Examples'], ['/blog', 'Insights']]],
    ['Starting points', [['/website-fix', 'Website Fix'], ['/managed-automation', 'Managed Automation'], ['/pricing', 'Pricing'], ['/site-analyzer', 'Website Snapshot']]],
    ['Trust', [['/about', 'Why Us'], ['/faq', 'FAQ'], ['/ada-compliance', 'Accessibility'], ['/privacy', 'Privacy'], ['/terms', 'Terms']]],
    ['Contact', [['/contact', 'Share Your Vision']]],
  ] as const;
  return <footer className="border-t border-[#183229]/10 bg-[#183229] text-[#f7f4ed]"><div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_2fr]"><div><Link href="/" className="font-playfair text-xl font-black">Need This Done</Link><p className="mt-3 max-w-sm text-sm leading-6 text-[#dce8dd]">Your vision, brought to life with clarity, focus, and honest boundaries.</p></div><nav aria-label="Footer navigation" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{groups.map(([title, links]) => <div key={title}><h2 className="text-xs font-bold uppercase tracking-[.18em] text-[#b9d5bd]">{title}</h2><ul className="mt-4 space-y-3 text-sm text-[#dce8dd]">{links.map(([href, label]) => <li key={href}><Link className="hover:text-white hover:underline" href={href}>{label}</Link></li>)}</ul></div>)}</nav></div></footer>;
}
