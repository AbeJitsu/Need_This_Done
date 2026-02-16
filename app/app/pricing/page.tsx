import { Metadata } from 'next';
import UnifiedPricingPage from '@/components/pricing/UnifiedPricingPage';

// ============================================================================
// Pricing Page — Menu Board Overview
// ============================================================================
// Read-only pricing overview. No checkout here — commerce lives at /shop.
// Quote authorization lives at /quote.

export const metadata: Metadata = {
  title: 'Pricing - NeedThisDone',
  description: 'Simple pricing for websites, automation, and AI. Pay 50% to start, remainder on delivery.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing - NeedThisDone',
    description: 'Transparent pricing for web development, automation, and AI services. Pay 50% to start.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - NeedThisDone',
    description: 'Transparent pricing for web development, automation, and AI services. Pay 50% to start.',
  },
};

export default function PricingPage() {
  return <UnifiedPricingPage />;
}
