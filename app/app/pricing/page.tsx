import { Metadata } from 'next';
import UnifiedPricingPage from '@/components/pricing/UnifiedPricingPage';

// ============================================================================
// Pricing Page - All Services with Checkout
// ============================================================================
// Single unified page for:
// - Website packages (Launch Site, Growth Site) with 50% deposit checkout
// - Automation and Managed AI services (book a call)
// - Custom build configurator with add-ons

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
