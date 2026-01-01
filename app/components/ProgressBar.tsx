import { AccentColor, accentColors, mutedTextColors } from '@/lib/colors';

// ============================================================================
// ProgressBar Component
// ============================================================================
// What: Visual progress indicator for LMS courses
// Why: Shows students their progress through courses and lessons
// How: Animated bar with percentage, label, and accessibility support
//
// Features:
// - Customizable color from accent palette
// - Multiple sizes (sm, md, lg)
// - Optional label and percentage display
// - Animated fill transition
// - Full accessibility with ARIA attributes

export interface ProgressBarProps {
  // Progress value (0-100)
  value: number;

  // Optional label (e.g., "Course Progress")
  label?: string;

  // Show percentage text
  showPercentage?: boolean;

  // Size variant
  size?: 'sm' | 'md' | 'lg';

  // Color theme
  color?: AccentColor;

  // Additional class names
  className?: string;
}

export default function ProgressBar({
  value,
  label,
  showPercentage = true,
  size = 'md',
  color = 'blue',
  className = '',
}: ProgressBarProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  const isComplete = clampedValue >= 100;

  // Size classes for the bar height
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  // Text size classes
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={className}>
      {/* Label and percentage row */}
      {(label || showPercentage) && (
        <div className={`flex justify-between items-center mb-1 ${textSizeClasses[size]}`}>
          {label && (
            <span className={mutedTextColors.light}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={`font-medium ${isComplete ? accentColors[color].text : mutedTextColors.light}`}>
              {Math.round(clampedValue)}%
              {isComplete && ' ✓'}
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className={`
          w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden
          ${sizeClasses[size]}
        `}
      >
        <div
          className={`
            ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out
            ${accentColors[color].bg}
          `}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
