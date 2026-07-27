import { Metadata } from 'next';
import UnifiedPricingPage from '@/components/pricing/UnifiedPricingPage';

// ============================================================================
// Pricing Page — Menu Board Overview
// ============================================================================
// Repository-owned pricing overview with guarded hosted-payment handoffs.
// Quote authorization lives at /quote.

export const metadata: Metadata = {
  title: 'AI Growth Employee Engagements | NeedThisDone',
  description: 'Start with an AI Growth Employee Pilot, then continue with a managed employee when the role is proven.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'AI Growth Employee Engagements | NeedThisDone',
    description: 'A supervised pilot followed by ongoing managed operation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Growth Employee Engagements | NeedThisDone',
    description: 'A supervised pilot followed by ongoing managed operation.',
  },
};

export default function PricingPage() {
  return <UnifiedPricingPage />;
}
