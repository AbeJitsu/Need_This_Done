import { Metadata } from 'next';
import AnalyzerForm from '@/components/site-analyzer/AnalyzerForm';

// ============================================================================
// Site Analyzer Page - /site-analyzer
// ============================================================================
// Public lead generation tool. Users enter a URL + email, get a free site
// analysis report emailed to them and viewable at /report/[id].

export const metadata: Metadata = {
  title: 'Website Snapshot | Need This Done',
  description:
    'Get a limited website snapshot of selected SEO, accessibility, and performance signals before deciding whether a Website Fix fits.',
  alternates: { canonical: '/site-analyzer' },
  openGraph: {
    title: 'Website Snapshot | Need This Done',
    description: 'Review selected website signals before choosing one contained Website Fix.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Snapshot | Need This Done',
    description: 'Review selected website signals before choosing one contained Website Fix.',
  },
};

export default function SiteAnalyzerPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[var(--public-cream)] text-[var(--public-ink)]"><section className="border-b border-[var(--public-ink)]/10 bg-[var(--public-ink)] text-white"><div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-24"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#b9d5bd]">Website Fix tool</p><h1 className="mt-5 font-playfair text-5xl font-black leading-[.98] sm:text-6xl">See where your website could work better.</h1><p className="mt-6 max-w-[60ch] text-lg leading-8 text-[#dce8dd]">We check selected public SEO, accessibility, and performance signals. The findings can help you choose one useful correction.</p></div></section><section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20"><div className="rounded-2xl border border-[var(--public-ink)]/10 bg-white p-6 sm:p-9"><h2 className="font-playfair text-3xl font-black">Send the snapshot to your inbox.</h2><p className="mt-3 max-w-[60ch] leading-7 text-[var(--public-muted)]">We collect your email so we can send a link to this private report and a short summary. Selected checks cannot certify compliance or assess every interaction.</p><div className="mt-8"><AnalyzerForm /></div></div></section></main>
  );
}
