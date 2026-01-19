'use client';

// ============================================================================
// Geometric Accents - Decorative background elements
// ============================================================================
// Subtle animated shapes that add visual depth without distraction.
// Positioned absolutely behind content for a layered effect.

interface GeometricAccentsProps {
  variant?: 'hero' | 'section';
}

export default function GeometricAccents({ variant = 'hero' }: GeometricAccentsProps) {
  if (variant === 'hero') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Large gradient circle - top right */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 blur-3xl animate-pulse-soft"
          style={{ animationDelay: '0s' }}
        />

        {/* Medium circle - bottom left */}
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-green-100 to-green-100 dark:from-green-900/30 dark:to-green-900/30 blur-2xl animate-pulse-soft"
          style={{ animationDelay: '1.5s' }}
        />

        {/* Small accent circle - top left */}
        <div
          className="absolute top-20 left-1/4 w-32 h-32 rounded-full bg-gold-100 dark:bg-gold-900/20 blur-xl animate-float"
          style={{ animationDelay: '0.5s' }}
        />

        {/* Floating geometric shape - lower right corner */}
        <svg
          className="absolute bottom-16 right-12 w-16 h-16 text-purple-200 dark:text-purple-800/50 animate-float"
          style={{ animationDelay: '1s' }}
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <polygon points="50,0 100,87 0,87" opacity="0.4" />
        </svg>

        {/* Small floating square - left side */}
        <svg
          className="absolute bottom-1/3 left-16 w-16 h-16 text-blue-200 dark:text-blue-800/50 animate-float"
          style={{ animationDelay: '2s' }}
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <rect x="15" y="15" width="70" height="70" rx="8" opacity="0.4" transform="rotate(15 50 50)" />
        </svg>
      </div>
    );
  }

  // Section variant - more subtle
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Subtle gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-gray-800/20" />

      {/* Small accent circle */}
      <div
        className="absolute -top-10 right-1/4 w-40 h-40 rounded-full bg-blue-100/50 dark:bg-blue-900/20 blur-2xl"
      />
    </div>
  );
}

// ============================================================================
// Process Step Connector - Visual flow between steps
// ============================================================================
// Animated arrow/line connecting process steps

interface StepConnectorProps {
  color?: 'blue' | 'purple' | 'green' | 'gold';
}

export function StepConnector({ color = 'purple' }: StepConnectorProps) {
  const colorClasses = {
    blue: 'text-blue-300 dark:text-blue-600',
    purple: 'text-purple-300 dark:text-purple-600',
    green: 'text-green-300 dark:text-green-600',
    gold: 'text-gold-300 dark:text-gold-600',
  };

  return (
    <div className={`hidden md:flex items-center justify-center ${colorClasses[color]}`}>
      <svg
        width="40"
        height="24"
        viewBox="0 0 40 24"
        fill="none"
        className="opacity-60"
      >
        <path
          d="M0 12h30M25 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
