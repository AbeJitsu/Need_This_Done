import { FeatureCardVariant, featureCardColors } from '@/lib/colors';

// ============================================================================
// FeatureCard Component - Premium Design with Subtle Color Accents
// ============================================================================
// What: Displays feature information with minimal color use.
// Why: Highlights key features while maintaining professional aesthetics.
// How: Uses centralized colors.ts for consistent theming across variants.
// - default: Grayscale - most cards use this
// - primary: Subtle blue accent - for featured/primary features
// - success: Subtle green accent - for growth/positive features

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  benefit?: string;
  metric?: string;
  variant?: FeatureCardVariant;
}

export default function FeatureCard({
  icon,
  title,
  description,
  benefit,
  metric,
  variant = 'default',
}: FeatureCardProps) {
  // Get styles from centralized color system
  const styles = featureCardColors[variant];

  // Text colors are consistent across all variants
  const titleColor = 'text-gray-900 dark:text-gray-100';
  const descriptionColor = 'text-gray-600 dark:text-gray-300';

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
      <h3 className={`text-xl font-semibold mb-2 ${titleColor}`}>{title}</h3>

      {/* Description - Medium gray for readability */}
      <p className={`text-sm sm:text-base leading-relaxed ${descriptionColor} mb-3`}>
        {description}
      </p>

      {/* Benefit - Why it matters */}
      {benefit && (
        <p className={`text-xs sm:text-sm ${descriptionColor} mb-3 italic border-l-2 border-current pl-3`}>
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
