import { Metadata } from 'next';
import UnifiedPricingPage from '@/components/pricing/UnifiedPricingPage';

// ============================================================================
// Pricing Page — Menu Board Overview
// ============================================================================
// Repository-owned pricing overview with guarded hosted-payment handoffs.
// Quote authorization lives at /quote.

export const metadata: Metadata = {
  title: 'Pricing | NeedThisDone',
  description: 'A $500 Website Fix plus a proposal-based, human-run 30-day Managed Automation pilot.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Website Fix & Managed Automation Pricing | NeedThisDone',
    description: 'One published $500 Website Fix and one proposal-based 30-day Managed Automation pilot.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Fix & Managed Automation Pricing | NeedThisDone',
    description: 'One published $500 Website Fix and one proposal-based 30-day Managed Automation pilot.',
  },
};

export default function PricingPage() {
  return <UnifiedPricingPage />;
}
