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
    <main id="main-content" className="min-h-screen bg-[#f7f4ed] text-[#183229]"><section className="border-b border-[#183229]/10 bg-[#183229] text-white"><div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-24"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#b9d5bd]">Website Fix tool</p><h1 className="mt-5 font-playfair text-5xl font-black leading-[.98] sm:text-6xl">Get a limited website snapshot.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#dce8dd]">We check selected public SEO, accessibility, and performance signals. It is a starting point for review—not a grade, compliance verdict, or guarantee.</p></div></section><section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20"><div className="rounded-2xl border border-[#183229]/10 bg-white p-6 sm:p-9"><h2 className="font-playfair text-3xl font-black">Send the snapshot to your inbox.</h2><p className="mt-3 max-w-2xl leading-7 text-[#50675e]">We collect your email so we can send a link to this private report and a short summary. We do not treat the selected signals as a certification.</p><div className="mt-8"><AnalyzerForm /></div></div></section></main>
  );
}
