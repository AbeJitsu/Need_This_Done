// ============================================================================
// CloseIcon - Reusable X/close icon component
// ============================================================================
// What: Centralized X icon SVG with consistent styling
// Why: DRY - eliminates 15+ duplicated SVG definitions across codebase
// How: Import and use with optional size/className props

interface CloseIconProps {
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

export function CloseIcon({
  size = 'md',
  className = '',
  strokeWidth = 2,
  'aria-hidden': ariaHidden = true,
}: CloseIconProps) {
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default CloseIcon;
