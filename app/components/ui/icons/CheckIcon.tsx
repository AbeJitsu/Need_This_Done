// ============================================================================
// CheckIcon - Reusable checkmark icon component
// ============================================================================
// What: Centralized checkmark icon using lucide-react
// Why: DRY - eliminates duplicated SVG definitions across codebase
// How: Import and use with optional size/className props

import { Check } from 'lucide-react';

interface CheckIconProps {
  /** Icon size: sm (16px), md (20px), lg (24px), or custom className */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Stroke width (default: 2) */
  strokeWidth?: number;
  /** Accessibility: hidden from screen readers by default (decorative) */
  'aria-hidden'?: boolean;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function CheckIcon({
  size = 'md',
  className = '',
  strokeWidth = 2,
  'aria-hidden': ariaHidden = true,
}: CheckIconProps) {
  return (
    <Check
      size={sizeMap[size]}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}

export default CheckIcon;
