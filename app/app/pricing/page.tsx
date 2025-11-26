import Link from 'next/link';

// ============================================================================
// Pricing Page - Service Pricing Tiers
// ============================================================================
// Displays pricing options for different service levels.

export const metadata = {
  title: 'Pricing - NeedThisDone',
  description: 'Simple, transparent pricing for everyday tasks. No hidden fees, no surprises.',
};

export default function PricingPage() {
  const pricingTiers = [
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

  const colorClasses = {
    purple: {
      border: 'border-t-purple-500',
      bg: 'bg-purple-600 hover:bg-purple-700',
      text: 'text-purple-600 dark:text-purple-400',
      light: 'bg-purple-100 dark:bg-purple-900/30',
    },
    blue: {
      border: 'border-t-blue-500',
      bg: 'bg-blue-600 hover:bg-blue-700',
      text: 'text-blue-600 dark:text-blue-400',
      light: 'bg-blue-100 dark:bg-blue-900/30',
    },
    green: {
      border: 'border-t-green-500',
      bg: 'bg-green-600 hover:bg-green-700',
      text: 'text-green-600 dark:text-green-400',
      light: 'bg-green-100 dark:bg-green-900/30',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            No hidden fees. No surprises. Just clear pricing for quality work.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {pricingTiers.map((tier, index) => {
            const colors = colorClasses[tier.color as keyof typeof colorClasses];
            return (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 border-t-4 ${colors.border} ${tier.popular ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''} transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="text-center mb-6">
                  <h2 className={`text-xl font-bold mb-2 ${colors.text}`}>
                    {tier.name}
                  </h2>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                      {tier.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 text-sm ml-1">
                      {tier.period}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full ${colors.light} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-xs font-bold ${colors.text}`}>✓</span>
                      </div>
                      <span className="text-gray-600 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-full font-semibold text-white ${colors.bg} transition-colors`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Custom Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-10 transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Not Sure What You Need?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Every task is different. Just tell us what you need help with and we'll give you a clear,
              honest quote. No pressure, no obligation. Just straightforward pricing.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 font-semibold rounded-full ring-1 ring-gray-700 dark:ring-gray-400 hover:bg-gray-100 hover:text-gray-800 hover:ring-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:hover:ring-gray-500 transition-all"
            >
              Tell Us What You Need
            </Link>
          </div>
        </div>

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
