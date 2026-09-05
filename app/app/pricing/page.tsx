import { Metadata } from 'next';
import UnifiedPricingPage from '@/components/pricing/UnifiedPricingPage';

// ============================================================================
// Pricing Page — Menu Board Overview
// ============================================================================
// Repository-owned pricing overview with guarded hosted-payment handoffs.
// Quote authorization lives at /quote.

export const metadata: Metadata = {
  title: 'Pricing | NeedThisDone',
  description: 'Help with one website problem or one repeated task. We agree on the work and price before you commit.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Website Fix & Managed Automation Pricing | NeedThisDone',
    description: 'Understand the help included in Website Fix and Managed Automation before choosing a next step.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Fix & Managed Automation Pricing | NeedThisDone',
    description: 'Understand the help included in Website Fix and Managed Automation before choosing a next step.',
  },
};

export default function PricingPage() {
  return <UnifiedPricingPage />;
}
