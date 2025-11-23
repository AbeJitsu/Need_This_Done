// ============================================================================
// FeatureCard Component - Premium Design with Subtle Color Accents
// ============================================================================
// Displays feature information with minimal color use
// - default: Grayscale - most cards use this
// - primary: Subtle blue accent - for featured/primary features
// - success: Subtle green accent - for growth/positive features

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  benefit?: string;
  metric?: string;
  variant?: 'default' | 'primary' | 'success';
}

export default function FeatureCard({
  icon,
  title,
  description,
  benefit,
  metric,
  variant = 'default',
}: FeatureCardProps) {
  // ========================================================================
  // Subtle Accent Styles - Professional, with Full Dark Mode Support
  // ========================================================================
  // Using light background tints (50-100 shades) keeps it professional
  // Dark borders (600-700) provide subtle visual distinction
  // Dark mode uses inverted colors for consistency
  const accentStyles = {
    default: {
      container: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
      icon: 'text-gray-700 dark:text-gray-300',
      title: 'text-gray-900 dark:text-gray-100',
      description: 'text-gray-600 dark:text-gray-300',
      hover: 'hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg',
    },
    primary: {
      container: 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-gray-900 dark:text-gray-100',
      description: 'text-gray-600 dark:text-gray-300',
      hover: 'hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20',
    },
    success: {
      container: 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      title: 'text-gray-900 dark:text-gray-100',
      description: 'text-gray-600 dark:text-gray-300',
      hover: 'hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg hover:shadow-green-500/10 dark:hover:shadow-green-500/20',
    },
  };

  const styles = accentStyles[variant];

  return (
    <div
      className={`
        p-6 rounded-xl border-2
        ${styles.container}
        ${styles.hover}
        transition-all duration-300
        flex flex-col h-full
      `}
    >
      {/* Icon - Color varies by variant */}
      <div className={`text-3xl mb-3 ${styles.icon}`} role="img" aria-label={`${title} icon`}>
        {icon}
      </div>

      {/* Title - Always dark gray for hierarchy */}
      <h3 className={`text-xl font-semibold mb-2 ${styles.title}`}>{title}</h3>

      {/* Description - Medium gray for readability */}
      <p className={`text-sm sm:text-base leading-relaxed ${styles.description} mb-3`}>
        {description}
      </p>

      {/* Benefit - Why it matters */}
      {benefit && (
        <p className={`text-xs sm:text-sm ${styles.description} mb-3 italic border-l-2 border-current pl-3`}>
          <span role="img" aria-label="Tip">💡</span> {benefit}
        </p>
      )}

      {/* Metric - Proof with numbers */}
      {metric && (
        <div className={`text-xs font-semibold ${styles.icon} mt-auto pt-3 border-t border-current border-opacity-20`}>
          <span role="img" aria-label="Verified">✓</span> {metric}
        </div>
      )}
    </div>
  );
}
