// ============================================================================
// CheckIcon - Reusable checkmark icon component
// ============================================================================
// What: Centralized checkmark SVG with consistent styling
// Why: DRY - eliminates 14+ duplicated SVG definitions across codebase
// How: Import and use with optional size/className props

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

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function CheckIcon({
  size = 'md',
  className = '',
  strokeWidth = 2,
  'aria-hidden': ariaHidden = true,
}: CheckIconProps) {
  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden={ariaHidden}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export default CheckIcon;
