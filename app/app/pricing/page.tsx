import { Metadata } from 'next';
import UnifiedPricingPage from '@/components/pricing/UnifiedPricingPage';

// ============================================================================
// Pricing Page — Menu Board Overview
// ============================================================================
// Repository-owned pricing overview with guarded hosted-payment handoffs.
// Quote authorization lives at /quote.

export const metadata: Metadata = {
  title: 'Pricing | NeedThisDone',
  description: 'Website Improvement is $500 with manual 50/50 invoicing. The managed AI operator is a proposal-based 30-day pilot.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Website Improvement & Managed AI Operator Pricing | NeedThisDone',
    description: 'One published $500 website engagement and one proposal-based, human-led operator pilot.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Improvement & Managed AI Operator Pricing | NeedThisDone',
    description: 'One published $500 website engagement and one proposal-based, human-led operator pilot.',
  },
};

export default function PricingPage() {
  return <UnifiedPricingPage />;
}
