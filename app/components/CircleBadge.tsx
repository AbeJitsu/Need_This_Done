import { AccentVariant, accentColors } from '@/lib/colors';

// ============================================================================
// CircleBadge Component
// ============================================================================
// A reusable numbered circle badge that can be used anywhere in the app.
// Uses shared accentColors for consistent styling with Button.
// Same colors in both light/dark modes (no inversion).

type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeShape = 'circle' | 'pill';

interface CircleBadgeProps {
  number?: number;
  text?: string;
  color: AccentVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
}

// Size-specific classes for circle shape
const circleSizeClasses: Record<BadgeSize, string> = {
  sm: 'w-10 h-10 text-base',
  md: 'w-14 h-14 text-xl',
  lg: 'w-20 h-20 text-2xl',
};

// Size-specific classes for pill shape (horizontal padding, fixed height)
const pillSizeClasses: Record<BadgeSize, string> = {
  sm: 'px-3 h-8 text-sm',
  md: 'px-5 h-11 text-lg',
  lg: 'px-6 h-14 text-xl',
};

export default function CircleBadge({
  number,
  text,
  color,
  size = 'md',
  shape = 'circle',
}: CircleBadgeProps) {
  const colors = accentColors[color];
  const sizeClass = shape === 'pill' ? pillSizeClasses[size] : circleSizeClasses[size];

  // Same styling as Button: bg-100, text-700/800, border-500/400
  return (
    <div
      className={`flex-shrink-0 ${sizeClass} ${colors.bg} border-2 ${colors.border} ${colors.text} rounded-full flex items-center justify-center font-bold`}
    >
      {text ?? number}
    </div>
  );
}
