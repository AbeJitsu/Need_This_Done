import { Metadata } from 'next';
import UnifiedPricingPage from '@/components/pricing/UnifiedPricingPage';

// ============================================================================
// Pricing Page — Menu Board Overview
// ============================================================================
// Repository-owned pricing overview with guarded hosted-payment handoffs.
// Quote authorization lives at /quote.

export const metadata: Metadata = {
  title: 'Pricing | NeedThisDone',
  description: 'A $500 targeted fix with manual 50/50 invoicing, plus proposal-based automation system setup.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Targeted Fixes & Automation Setup Pricing | NeedThisDone',
    description: 'One published $500 targeted fix and one proposal-based automation system setup.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Targeted Fixes & Automation Setup Pricing | NeedThisDone',
    description: 'One published $500 targeted fix and one proposal-based automation system setup.',
  },
};

export default function PricingPage() {
  return <UnifiedPricingPage />;
}
