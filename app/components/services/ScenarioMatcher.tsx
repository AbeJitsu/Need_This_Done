'use client';

// ============================================================================
// ScenarioMatcher - Interactive scenario cards for service discovery
// ============================================================================
// Helps visitors self-identify which service fits their situation.
// Clicking a scenario opens the corresponding service modal.

import { accentColors, headingColors, formInputColors } from '@/lib/colors';
import type { ServiceScenario } from '@/lib/page-content-types';
import { useServiceModal } from '@/context/ServiceModalContext';
import type { ServiceType } from '@/lib/service-modal-content';

interface ScenarioMatcherProps {
  title: string;
  description: string;
  scenarios: ServiceScenario[];
}

export default function ScenarioMatcher({
  title,
  description,
  scenarios,
}: ScenarioMatcherProps) {
  const { openModal } = useServiceModal();

  const handleScenarioClick = (serviceKey: ServiceScenario['serviceKey']) => {
    openModal(serviceKey as ServiceType);
  };

  return (
    <div className="mb-10">
      {/* Section Header */}
      <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2 text-center`}>
        {title}
      </h2>
      <p className={`${formInputColors.helper} text-center mb-6`}>
        {description}
      </p>

      {/* Scenario Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {scenarios.map((scenario, index) => (
          <button
            key={index}
            onClick={() => handleScenarioClick(scenario.serviceKey)}
            className={`
              p-6 rounded-xl text-left
              bg-white dark:bg-gray-800
              border-2 border-gray-200 dark:border-gray-700
              ${accentColors[scenario.color].hoverBorder}
              hover:shadow-lg
              transition-all duration-300
              group
            `}
          >
            {/* Service Badge - at top */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`
                  inline-block w-2 h-2 rounded-full
                  ${scenario.color === 'green' ? 'bg-green-500' : ''}
                  ${scenario.color === 'blue' ? 'bg-blue-500' : ''}
                  ${scenario.color === 'purple' ? 'bg-purple-500' : ''}
                `}
              />
              <span className={`text-sm ${accentColors[scenario.color].text} font-medium`}>
                {scenario.serviceTitle}
              </span>
              <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                →
              </span>
            </div>

            {/* Quotes */}
            <div className="space-y-3">
              {scenario.quotes.map((quote, quoteIndex) => (
                <p
                  key={quoteIndex}
                  className={`${formInputColors.helper} text-sm leading-relaxed pl-2`}
                >
                  "{quote}"
                </p>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
