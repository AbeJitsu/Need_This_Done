import { Globe, Cog, Brain, type LucideIcon } from 'lucide-react';
import { AccentColor, accentColors } from '@/lib/colors';

// ============================================================================
// Service Icons - Visual anchors for service cards
// ============================================================================
// Provides distinctive icons for each service type with animated entrance.
// Icons float gently to add subtle motion without distraction.

export type ServiceIconType = 'website' | 'automation' | 'ai' | 'custom';

interface ServiceIconProps {
  type: ServiceIconType;
  color: AccentColor;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

// Icon mapping for each service type
const iconMap: Record<ServiceIconType, LucideIcon> = {
  website: Globe,
  automation: Cog,
  ai: Brain,
  custom: Cog,
};

// Size classes for the icon container
const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

// Icon sizes in pixels
const iconSizes = {
  sm: 20,
  md: 28,
  lg: 40,
};

export default function ServiceIcon({
  type,
  color,
  size = 'md',
  animated = true,
}: ServiceIconProps) {
  const Icon = iconMap[type] || iconMap.custom;
  const colors = accentColors[color];

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colors.bg}
        border-2 ${colors.border}
        rounded-2xl
        flex items-center justify-center
        ${animated ? 'animate-float' : ''}
        transition-transform duration-300
        group-hover:scale-110
      `}
    >
      <Icon
        size={iconSizes[size]}
        className={colors.text}
        strokeWidth={1.5}
      />
    </div>
  );
}

// ============================================================================
// Helper to infer icon type from service title
// ============================================================================
export function getServiceIconType(title: string): ServiceIconType {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('website') || lowerTitle.includes('web')) {
    return 'website';
  }
  if (lowerTitle.includes('automation') || lowerTitle.includes('automate')) {
    return 'automation';
  }
  if (lowerTitle.includes('ai') || lowerTitle.includes('intelligence') || lowerTitle.includes('smart')) {
    return 'ai';
  }

  return 'custom';
}
