import { Metadata } from 'next';
import AnalyzerForm from '@/components/site-analyzer/AnalyzerForm';
import { PUBLIC_CORE_PROMISE } from '@/lib/public-copy';

// ============================================================================
// Site Analyzer Page - /site-analyzer
// ============================================================================
// Public lead generation tool. Users enter a URL + email, get a free site
// analysis report emailed to them and viewable at /report/[id].

export const metadata: Metadata = {
  title: 'Website Snapshot | Need This Done',
  description:
    PUBLIC_CORE_PROMISE,
  alternates: { canonical: '/site-analyzer' },
  openGraph: {
    title: 'Website Snapshot | Need This Done',
    description: PUBLIC_CORE_PROMISE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Snapshot | Need This Done',
    description: PUBLIC_CORE_PROMISE,
  },
};

export default function SiteAnalyzerPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="border-b border-[var(--public-ink)]/10 bg-[var(--public-ink)] text-white">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#b9d5bd]">Website Fix tool</p>
          <h1 className="mt-5 font-playfair text-5xl font-black leading-[.98] sm:text-6xl">See where your website could work better.</h1>
          <p className="mt-6 max-w-[60ch] text-lg leading-8 text-[#dce8dd]">We check selected website signals. The findings can point to one useful correction.</p>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20">
        <div className="rounded-2xl border border-[var(--public-ink)]/10 bg-white p-6 sm:p-9">
          <h2 className="font-playfair text-3xl font-black">Send the snapshot to your inbox.</h2>
          <p className="mt-3 max-w-[60ch] leading-7 text-[var(--public-muted)]">We use your email to send a private report link. The checks are limited and do not review every interaction.</p>
          <div className="mt-8"><AnalyzerForm /></div>
        </div>
      </section>
    </main>
  );
}
