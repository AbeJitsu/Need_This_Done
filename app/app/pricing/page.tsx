import { Metadata } from 'next';
import UnifiedPricingPage from '@/components/pricing/UnifiedPricingPage';

// ============================================================================
// Pricing Page — Menu Board Overview
// ============================================================================
// Repository-owned pricing overview with guarded hosted-payment handoffs.
// Quote authorization lives at /quote.

export const metadata: Metadata = {
  title: 'Pricing | NeedThisDone',
  description: 'A $500 Website Fix plus a proposal-based way to improve one repeated problem at work.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Website Fix & Managed Automation Pricing | NeedThisDone',
    description: 'One published $500 Website Fix and one proposal-based Managed Automation engagement.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Fix & Managed Automation Pricing | NeedThisDone',
    description: 'One published $500 Website Fix and one proposal-based Managed Automation engagement.',
  },
};

export default function PricingPage() {
  return <UnifiedPricingPage />;
}
