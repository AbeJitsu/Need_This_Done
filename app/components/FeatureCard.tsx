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
  variant?: 'default' | 'primary' | 'success';
}

export default function FeatureCard({
  icon,
  title,
  description,
  variant = 'default',
}: FeatureCardProps) {
  // ========================================================================
  // Subtle Accent Styles - Professional, not overwhelming
  // ========================================================================
  // Using light background tints (50-100 shades) keeps it professional
  // Dark borders (600-700) provide subtle visual distinction
  const accentStyles = {
    default: {
      container: 'border-gray-200 bg-white',
      icon: 'text-gray-700',
      title: 'text-gray-900',
      description: 'text-gray-600',
      hover: 'hover:border-gray-300 hover:shadow-lg',
    },
    primary: {
      container: 'border-blue-200 bg-blue-50/30',
      icon: 'text-blue-600',
      title: 'text-gray-900',
      description: 'text-gray-600',
      hover: 'hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10',
    },
    success: {
      container: 'border-green-200 bg-green-50/30',
      icon: 'text-green-600',
      title: 'text-gray-900',
      description: 'text-gray-600',
      hover: 'hover:border-green-300 hover:shadow-lg hover:shadow-green-500/10',
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
      `}
    >
      {/* Icon - Color varies by variant */}
      <div className={`text-3xl mb-3 ${styles.icon}`}>{icon}</div>

      {/* Title - Always dark gray for hierarchy */}
      <h3 className={`text-xl font-semibold mb-2 ${styles.title}`}>{title}</h3>

      {/* Description - Medium gray for readability */}
      <p className={`text-sm sm:text-base leading-relaxed ${styles.description}`}>
        {description}
      </p>
    </div>
  );
}
