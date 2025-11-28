import {
  AccentColor,
  titleColors,
  topBorderColors,
  lightBgColors,
} from '@/lib/colors';
import Button from '@/components/Button';

// ============================================================================
// PricingCard Component
// ============================================================================
// Displays a pricing tier with title, price, features, and CTA button.
// Uses flexbox to ensure buttons stay aligned at the bottom regardless
// of content height differences between cards.

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  color: AccentColor;
  cta: string;
  href?: string;
  popular?: boolean;
}

export default function PricingCard({
  name,
  price,
  period,
  description,
  features,
  color,
  cta,
  href = '/contact',
  popular = false,
}: PricingCardProps) {
  return (
    <div
      className={`
        relative flex flex-col h-full
        bg-white dark:bg-gray-800 rounded-xl p-6
        border border-gray-200 dark:border-gray-700
        border-t-4 ${topBorderColors[color]}
        ${popular ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
        transition-all hover:border-gray-400
        hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)]
        dark:hover:border-gray-500
        dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]
      `}
    >
      {/* "Most Popular" badge */}
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}

      {/* Header section with name, price, and description */}
      <div className="text-center mb-6">
        <h2 className={`text-xl font-bold mb-2 ${titleColors[color]}`}>
          {name}
        </h2>
        <div className="mb-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {price}
          </span>
          <span className="text-gray-600 dark:text-gray-300 text-sm ml-1">
            {period}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {description}
        </p>
      </div>

      {/* Features list */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full ${lightBgColors[color]} flex items-center justify-center flex-shrink-0`}>
              <span className={`text-xs font-bold ${titleColors[color]}`}>✓</span>
            </div>
            <span className="text-gray-600 dark:text-gray-300 text-sm">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button - mt-auto pushes it to the bottom */}
      <div className="mt-auto">
        <Button variant={color} href={href} className="w-full">
          {cta}
        </Button>
      </div>
    </div>
  );
}
