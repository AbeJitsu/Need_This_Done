'use client';

// ============================================================================
// ScenarioMatcher - Interactive scenario cards for service discovery
// ============================================================================
// Helps visitors self-identify which service fits their situation.
// Clicking a scenario opens the corresponding service modal.
// Redesigned with visual interest: colored icon backgrounds, quote styling.

import { accentColors, headingColors, formInputColors, cardBgColors } from '@/lib/colors';
import { EditableItem } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';
import type { ServiceScenario } from '@/lib/page-content-types';
import { useServiceModal } from '@/context/ServiceModalContext';
import type { ServiceType } from '@/lib/service-modal-content';
import { Globe, Cog, Sparkles } from 'lucide-react';

interface ScenarioMatcherProps {
  title: string;
  description: string;
  scenarios: ServiceScenario[];
}

// Service-specific icons
const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'website-services': Globe,
  'data-documents': Cog,
  'virtual-assistant': Sparkles,
};

// Color configurations for visual interest
const colorConfigs: Record<string, {
  iconBg: string;
  iconColor: string;
  quoteBg: string;
  quoteAccent: string;
  hoverBg: string;
}> = {
  green: {
    iconBg: 'bg-green-100 dark:bg-green-900/50',
    iconColor: 'text-green-600 dark:text-green-400',
    quoteBg: 'bg-green-50/50 dark:bg-green-900/20',
    quoteAccent: 'border-l-green-400',
    hoverBg: 'hover:bg-green-50/30 dark:hover:bg-green-900/10',
  },
  blue: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    quoteBg: 'bg-blue-50/50 dark:bg-blue-900/20',
    quoteAccent: 'border-l-blue-400',
    hoverBg: 'hover:bg-blue-50/30 dark:hover:bg-blue-900/10',
  },
  purple: {
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    quoteBg: 'bg-purple-50/50 dark:bg-purple-900/20',
    quoteAccent: 'border-l-purple-400',
    hoverBg: 'hover:bg-purple-50/30 dark:hover:bg-purple-900/10',
  },
};

export default function ScenarioMatcher({
  title,
  description,
  scenarios,
}: ScenarioMatcherProps) {
  const { openModal } = useServiceModal();
  const { isEditMode } = useInlineEdit();

  const handleScenarioClick = (serviceKey: ServiceScenario['serviceKey']) => {
    // Don't open modal in edit mode - let EditableItem handle the click
    if (isEditMode) return;
    openModal(serviceKey as ServiceType);
  };

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2`}>
          {title}
        </h2>
        <p className={`${formInputColors.helper} max-w-xl mx-auto`}>
          {description}
        </p>
      </div>

      {/* Scenario Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {scenarios.map((scenario, index) => {
          const Icon = serviceIcons[scenario.serviceKey] || Globe;
          const colors = colorConfigs[scenario.color] || colorConfigs.green;

          return (
            <EditableItem
              key={index}
              sectionKey="scenarioMatcher"
              arrayField="scenarios"
              index={index}
              label={scenario.serviceTitle}
              content={scenario as unknown as Record<string, unknown>}
            >
              <button
                onClick={() => handleScenarioClick(scenario.serviceKey)}
                className={`
                  w-full p-6 rounded-2xl text-left
                  ${cardBgColors.base}
                  border border-gray-400 dark:border-gray-700/60
                  hover:border-gray-400 dark:hover:border-gray-600
                  hover:shadow-lg hover:-translate-y-1
                  transition-all duration-300
                  group
                  ${colors.hoverBg}
                `}
              >
                {/* Icon + Service Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`
                    w-10 h-10 rounded-xl ${colors.iconBg}
                    flex items-center justify-center
                    transition-transform duration-300 group-hover:scale-110
                  `}>
                    <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-semibold ${accentColors[scenario.color].text}`}>
                      {scenario.serviceTitle}
                    </span>
                  </div>
                  <span className={`
                    text-lg ${colors.iconColor}
                    opacity-0 group-hover:opacity-100
                    transition-all duration-300
                    group-hover:translate-x-1
                  `}>
                    →
                  </span>
                </div>

                {/* Styled Quotes */}
                <div className="space-y-3">
                  {scenario.quotes?.map((quote, quoteIndex) => (
                    <div
                      key={quoteIndex}
                      className={`
                        pl-3 py-2 rounded-r-lg
                        border-l-2 ${colors.quoteAccent}
                        ${colors.quoteBg}
                      `}
                    >
                      <p className={`${headingColors.secondary} text-sm leading-relaxed italic`}>
                        &ldquo;{quote}&rdquo;
                      </p>
                    </div>
                  )) || null}
                </div>

                {/* Click hint */}
                <p className={`
                  mt-4 text-xs ${formInputColors.helper}
                  opacity-0 group-hover:opacity-100 transition-opacity
                `}>
                  Click to learn more
                </p>
              </button>
            </EditableItem>
          );
        })}
      </div>
    </div>
  );
}
