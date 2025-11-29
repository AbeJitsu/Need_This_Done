import Link from 'next/link';
import PricingCard from '@/components/PricingCard';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import { AccentColor } from '@/lib/colors';

// ============================================================================
// Pricing Page - Service Pricing Tiers
// ============================================================================
// Displays pricing options for different service levels.

export const metadata = {
  title: 'Pricing - NeedThisDone',
  description: 'Simple, transparent pricing for everyday tasks. No hidden fees, no surprises.',
};

export default function PricingPage() {
  const pricingTiers: {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    color: AccentColor;
    cta: string;
    popular?: boolean;
  }[] = [
    {
      name: 'Quick Task',
      price: 'From $50',
      period: 'per task',
      description: 'Perfect for small, straightforward tasks that need quick attention.',
      features: [
        'Content updates & simple edits',
        'Data entry & quick formatting',
        'Document formatting',
        'Get it done in days, not weeks',
      ],
      color: 'purple',
      cta: 'Get Started',
    },
    {
      name: 'Standard Task',
      price: 'From $150',
      period: 'per task',
      description: 'For tasks that need a bit more time and attention to detail.',
      features: [
        'Research projects',
        'Spreadsheet organization',
        'Multi-step tasks',
        "Revisions included until you're happy",
      ],
      color: 'blue',
      popular: true,
      cta: 'Get a Quote',
    },
    {
      name: 'Premium Service',
      price: 'From $500',
      period: 'per project',
      description: 'For larger projects that require comprehensive work and planning.',
      features: [
        'Website builds & redesigns',
        'E-commerce setup',
        'Larger multi-phase projects',
        'A dedicated point of contact throughout',
      ],
      color: 'green',
      cta: 'Get a Quote',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <PageHeader
          title="Simple, Transparent Pricing"
          description="No hidden fees. No surprises. Just clear pricing for quality work."
        />

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {pricingTiers.map((tier, index) => (
            <PricingCard key={index} {...tier} />
          ))}
        </div>

        {/* Custom Tasks */}
        <Card hoverColor="orange" hoverEffect="glow" className="mb-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Not Sure What You Need?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Every task is different. Just tell us what you need help with and we'll give you a clear,
              honest quote. No pressure, no obligation. Just straightforward pricing.
            </p>
            <Button variant="orange" href="/contact">
              Tell Us What You Need
            </Button>
          </div>
        </Card>

        {/* FAQ Teaser */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Have questions about pricing or services?
          </p>
          <Link
            href="/faq"
            className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
          >
            Check out our FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
