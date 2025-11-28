import { StepColor, stepColors } from '@/lib/colors';

// ============================================================================
// CircleBadge Component
// ============================================================================
// A reusable numbered circle badge that can be used anywhere in the app.
// Supports three size variants for different contexts like step cards,
// FAQ items, hero sections, or pricing tiers.

type BadgeSize = 'sm' | 'md' | 'lg';

interface CircleBadgeProps {
  number: number;
  color: StepColor;
  size?: BadgeSize;
}

// Size-specific classes for each variant
const sizeClasses: Record<BadgeSize, string> = {
  sm: 'w-10 h-10 text-base',
  md: 'w-14 h-14 text-xl',
  lg: 'w-20 h-20 text-2xl',
};

export default function CircleBadge({
  number,
  color,
  size = 'md',
}: CircleBadgeProps) {
  const colors = stepColors[color];
  const sizeClass = sizeClasses[size];

  // Softer styling with border-2 to match button aesthetic
  return (
    <div
      className={`flex-shrink-0 ${sizeClass} ${colors.bg} border-2 ${colors.border} ${colors.numberText} rounded-full flex items-center justify-center font-bold`}
    >
      {number}
    </div>
  );
}
