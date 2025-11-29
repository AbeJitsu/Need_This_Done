import { AccentVariant, accentColors } from '@/lib/colors';
import CircleBadge from './CircleBadge';

// ============================================================================
// StepCard Component
// ============================================================================
// Displays a numbered step with title, description, and bullet points.
// Used on the How It Works page to explain the process.
// Uses shared accentColors for consistent styling with Button and CircleBadge.

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  details: string[];
  color: AccentVariant;
}

export default function StepCard({
  number,
  title,
  description,
  details,
  color,
}: StepCardProps) {
  const colors = accentColors[color];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]">
      <div className="flex items-start gap-6">
        {/* Step number badge */}
        <CircleBadge number={number} color={color} />

        {/* Content */}
        <div className="flex-1">
          <h2 className={`text-xl font-bold mb-3 ${colors.text}`}>
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {description}
          </p>
          <ul className="space-y-2">
            {details.map((detail, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className={colors.text}>•</span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
