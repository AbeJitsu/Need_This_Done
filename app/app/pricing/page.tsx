import { Metadata } from 'next';
import UnifiedPricingPage from '@/components/pricing/UnifiedPricingPage';
import { PUBLIC_CORE_PROMISE } from '@/lib/public-copy';

// ============================================================================
// Pricing Page — Menu Board Overview
// ============================================================================
// Repository-owned pricing overview with guarded hosted-payment handoffs.
// Quote authorization lives at /quote.

export const metadata: Metadata = {
  title: 'Pricing | NeedThisDone',
  description: `${PUBLIC_CORE_PROMISE} We agree on the work and price before you commit.`,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Website Fix & Managed Automation Pricing | NeedThisDone',
    description: PUBLIC_CORE_PROMISE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Fix & Managed Automation Pricing | NeedThisDone',
    description: PUBLIC_CORE_PROMISE,
  },
};

export default function PricingPage() {
  return <UnifiedPricingPage />;
}
