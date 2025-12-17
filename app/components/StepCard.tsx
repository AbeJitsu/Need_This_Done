import Link from 'next/link';
import { AccentVariant, cardHoverColors, titleTextColors, cardBgColors, cardBorderColors, bodyTextColors } from '@/lib/colors';
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
  const cardClasses = `${cardBgColors.base} rounded-xl p-8 ${cardBorderColors.subtle} transition-all ${cardHoverColors[color]} hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]`;

  const cardContent = (
      <div>
        {/* Title row with badge */}
        <div className="flex items-start gap-4 mb-3">
          <CircleBadge number={number} color={color} />
          <h2 className={`text-xl font-bold ${titleTextColors[color]}`}>
            {title}
          </h2>
        </div>

        {/* Content - indented to align with title */}
        <p className={`ml-[4.5rem] ${bodyTextColors.gray} mb-4`}>
          {description}
        </p>
        <ul className="ml-[4.5rem] space-y-2">
          {details.map((detail, index) => (
            <li key={index} className={`flex items-center gap-2 text-sm ${bodyTextColors.gray}`}>
              <span className={titleTextColors[color]}>•</span>
              {detail}
            </li>
          ))}
        </ul>
        {href && (
          <p className={`text-sm font-medium mt-4 ${titleTextColors[color]}`}>
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
