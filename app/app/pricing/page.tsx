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
  description: 'Pick your perfect fit. Every project is different, so here\'s a starting point.',
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
      description: 'Need something done fast? This is your go-to for quick wins.',
      features: [
        'Content updates & simple edits',
        'Data entry & quick formatting',
        'Document formatting',
        'Get it done in days, not weeks',
      ],
      color: 'green',
      cta: "Let's Do This",
    },
    {
      name: 'Standard Task',
      price: 'From $150',
      period: 'per task',
      description: 'Our most popular option. Great for projects that need a little extra care.',
      features: [
        'Research projects',
        'Spreadsheet organization',
        'Multi-step tasks',
        "Revisions included until you're happy",
      ],
      color: 'blue',
      popular: true,
      cta: "Let's Chat",
    },
    {
      name: 'Premium Service',
      price: 'From $500',
      period: 'per project',
      description: "For the big stuff. We'll be with you every step of the way.",
      features: [
        'Website builds & redesigns',
        'E-commerce setup',
        'Larger multi-phase projects',
        'A dedicated point of contact throughout',
      ],
      color: 'purple',
      cta: 'Tell Us More',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <PageHeader
          title="Pick Your Perfect Fit"
          description="Every project is different, so here's a starting point. Not sure which one? Just ask and we'll help you figure it out."
        />

        {/* Pricing Cards - staggered animation on load */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {pricingTiers.map((tier, index) => {
            const delayClass = index === 0 ? 'motion-safe:animate-fade-in'
              : index === 1 ? 'motion-safe:animate-fade-in-delay-100'
              : 'motion-safe:animate-fade-in-delay-200';
            return (
              <div key={index} className={`motion-reduce:opacity-100 ${delayClass}`}>
                <PricingCard {...tier} />
              </div>
            );
          })}
        </div>

        {/* Payment Structure Note */}
        <Card hoverColor="green" hoverEffect="glow" className="mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-700 dark:text-green-300 font-bold text-lg">50%</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">To Start</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Deposit to begin work</p>
              </div>
            </div>
            <div className="hidden sm:block w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 dark:text-blue-300 font-bold text-lg">50%</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">On Delivery</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">When you approve the work</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Custom Tasks + FAQ */}
        <Card hoverColor="orange" hoverEffect="glow">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Something Else in Mind?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Every project is unique. Tell us what you&apos;re working on and we&apos;ll figure out
              the best approach together. Or check out our FAQ for quick answers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="orange" href="/contact">
                Let&apos;s Figure It Out
              </Button>
              <Button variant="purple" href="/faq">
                Read the FAQ
              </Button>
            </div>
          </div>
        </Card>
    </div>
  );
}
