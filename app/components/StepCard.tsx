import Link from 'next/link';
import { AccentVariant, cardHoverColors, titleTextColors, cardBgColors, cardBorderColors, bodyTextColors, shadowClasses } from '@/lib/colors';
import CircleBadge from './CircleBadge';

// ============================================================================
// StepCard Component
// ============================================================================
// Displays a numbered step with title, description, and bullet points.
// Used on the How It Works page to explain the process.
// Uses shared accentColors for consistent styling with Button and CircleBadge.
// Optionally links to a relevant page when href is provided.

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  details: string[];
  color: AccentVariant;
  href?: string;
}

export default function StepCard({
  number,
  title,
  description,
  details,
  color,
  href,
}: StepCardProps) {
  // Fallback to blue if color is undefined or invalid
  const safeColor = color && cardHoverColors[color] ? color : 'blue';
  const cardClasses = `${cardBgColors.base} rounded-xl p-12 ${cardBorderColors.subtle} transition-all ${cardHoverColors[safeColor]} ${shadowClasses.cardHover}`;

  const cardContent = (
      <div>
        {/* Title row with badge - centered */}
        <div className="flex items-start justify-center gap-4 mb-6">
          <CircleBadge number={number} color={safeColor} size="sm" />
          <h2 className={`text-xl font-bold ${titleTextColors[safeColor]}`}>
            {title}
          </h2>
        </div>

        {/* Content block - centered container with left-aligned text */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm px-6 py-4">
            <p className={`${bodyTextColors.gray} mb-4`}>
              {description}
            </p>
            <ul className="space-y-3">
          {details.map((detail, index) => (
            <li key={index} className={`flex items-start gap-2 text-sm ${bodyTextColors.gray}`}>
              <span className={titleTextColors[safeColor]}>•</span>
              {detail}
            </li>
          ))}
            </ul>
          </div>
        </div>
        {href && (
          <p className={`text-sm font-medium mt-4 ${titleTextColors[safeColor]}`}>
            Learn more →
          </p>
        )}
      </div>
  );

  // Wrap in Link if href is provided
  if (href) {
    return (
      <Link href={href} className={`block ${cardClasses}`}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
      {cardContent}
    </div>
  );
}
