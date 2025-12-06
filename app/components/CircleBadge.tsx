import { AccentVariant, accentColors } from '@/lib/colors';

// ============================================================================
// CircleBadge Component
// ============================================================================
// A reusable numbered circle badge that can be used anywhere in the app.
// Uses shared accentColors for consistent styling with Button.
// Same colors in both light/dark modes (no inversion).

type BadgeSize = 'sm' | 'md' | 'lg';

interface CircleBadgeProps {
  number: number;
  color: AccentVariant;
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
  const colors = accentColors[color];
  const sizeClass = sizeClasses[size];

  // Same styling as Button: bg-100, text-700/800, border-500/400
  return (
    <div
      className={`flex-shrink-0 ${sizeClass} ${colors.bg} border-2 ${colors.border} ${colors.text} rounded-full flex items-center justify-center font-bold`}
    >
      {number}
    </div>
  );
}
