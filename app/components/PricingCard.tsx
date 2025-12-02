import {
  AccentColor,
  titleColors,
  topBorderColors,
  checkmarkColors,
  cardHoverColors,
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
        ${popular ? 'border-2 border-blue-500 dark:border-blue-400' : 'border border-gray-200 dark:border-gray-700'}
        border-t-4 ${topBorderColors[color]}
        transition-all ${cardHoverColors[color]}
        hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)]
        dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]
        ${popular ? 'scale-105 md:scale-105 z-10 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30' : ''}
      `}
    >
      {/* "Most Popular" badge */}
      {popular && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/25">
          ⭐ Most Popular
        </span>
      )}

      {/* Header section with name, price, and description */}
      <div className="text-center mb-6">
        <h2 className={`text-xl font-bold mb-3 ${titleColors[color]}`}>
          {name}
        </h2>
        <div className="mb-3">
          <span className={`text-5xl font-bold ${titleColors[color]}`}>
            {price.replace('From ', '')}
          </span>
          <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
            starting {period}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {description}
        </p>
      </div>

      {/* Features list */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`w-6 h-6 rounded-full ${checkmarkColors[color].bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <svg className={`w-4 h-4 ${checkmarkColors[color].icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
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
