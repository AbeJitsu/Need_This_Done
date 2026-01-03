// ============================================================================
// CheckmarkCircle - Circular container with checkmark icon
// ============================================================================
// What: Reusable checkmark in a colored circular background
// Why: DRY - eliminates 5+ duplicated patterns across components
// How: Import with color/size props, uses CheckIcon internally
//
// Usage:
//   <CheckmarkCircle color="green" size="md" />
//   <CheckmarkCircle color="blue" size="lg" showBorder />
//   <CheckmarkCircle color="gold" />  // All 7 AccentVariant colors supported!

import { CheckIcon } from './CheckIcon';
import { getCheckmarkColors, type AccentVariant } from '@/lib/colors';

type CheckmarkSize = 'sm' | 'md' | 'lg';

interface CheckmarkCircleProps {
  /** Color variant: any AccentVariant (purple, blue, green, gold, teal, gray, red) */
  color?: AccentVariant;
  /** Circle size: sm (20px), md (24px), lg (32px) */
  size?: CheckmarkSize;
  /** Show border around circle */
  showBorder?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

const sizeClasses: Record<CheckmarkSize, { container: string; icon: string }> = {
  sm: { container: 'w-5 h-5', icon: 'w-3 h-3' },
  md: { container: 'w-6 h-6', icon: 'w-4 h-4' },
  lg: { container: 'w-8 h-8', icon: 'w-5 h-5' },
};

export function CheckmarkCircle({
  color = 'green',
  size = 'md',
  showBorder = false,
  className = '',
}: CheckmarkCircleProps) {
  const { bg, border, icon } = getCheckmarkColors(color);
  const { container: containerSize, icon: iconSize } = sizeClasses[size];

  return (
    <div
      className={`
        ${containerSize}
        rounded-full
        ${bg}
        ${showBorder ? border : ''}
        flex items-center justify-center
        flex-shrink-0
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <CheckIcon
        className={`${iconSize} ${icon}`}
        strokeWidth={2.5}
        aria-hidden={true}
      />
    </div>
  );
}

export default CheckmarkCircle;
