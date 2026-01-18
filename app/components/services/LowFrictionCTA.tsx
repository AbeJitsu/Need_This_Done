// ============================================================================
// LowFrictionCTA - "Still not sure?" call to action
// ============================================================================
// A warm, supportive CTA for visitors who can't decide.
// Offers low-commitment options: quick chat ($20) or free quote.

import Link from 'next/link';
import { headingColors, formInputColors, accentColors } from '@/lib/colors';
import type { EnhancedCTAButton } from '@/lib/page-content-types';
import Card from '@/components/Card';

interface LowFrictionCTAProps {
  title: string;
  description: string;
  primaryButton: EnhancedCTAButton;
  secondaryButton: EnhancedCTAButton;
}

export default function LowFrictionCTA({
  title,
  description,
  primaryButton,
  secondaryButton,
}: LowFrictionCTAProps) {
  return (
    <Card hoverColor="gold" hoverEffect="glow" className="mb-10 text-center">
      {/* Title */}
      <h2 className={`text-2xl font-bold ${headingColors.primary} mb-3`}>
        {title}
      </h2>

      {/* Description */}
      <p className={`${formInputColors.helper} mb-6 max-w-2xl mx-auto`}>
        {description}
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {/* Primary Button */}
        <Link
          href={primaryButton.href}
          className={`
            inline-flex flex-col items-center
            px-6 py-4 rounded-xl
            ${accentColors[primaryButton.variant].bg}
            ${accentColors[primaryButton.variant].text}
            border-2 ${accentColors[primaryButton.variant].border}
            hover:shadow-lg hover:scale-105
            transition-all duration-300
            font-semibold
          `}
        >
          <span className="text-lg">{primaryButton.text}</span>
          {primaryButton.subtext && (
            <span className="text-sm mt-1">{primaryButton.subtext}</span>
          )}
        </Link>

        {/* Secondary Button */}
        <Link
          href={secondaryButton.href}
          className={`
            inline-flex flex-col items-center
            px-6 py-4 rounded-xl
            bg-white dark:bg-gray-700
            ${headingColors.primary}
            border-2 border-gray-400 dark:border-gray-600
            ${accentColors[secondaryButton.variant].hoverBorder}
            hover:shadow-lg hover:scale-105
            transition-all duration-300
            font-semibold
          `}
        >
          <span className="text-lg">{secondaryButton.text}</span>
          {secondaryButton.subtext && (
            <span className={`text-sm ${formInputColors.helper} mt-1`}>
              {secondaryButton.subtext}
            </span>
          )}
        </Link>
      </div>
    </Card>
  );
}
