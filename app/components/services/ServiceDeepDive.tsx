'use client';

// ============================================================================
// ServiceDeepDive - Expandable service details with full content
// ============================================================================
// Progressive disclosure: shows compact view by default, expands to reveal
// the complete service details. This is where users make decisions after
// being teased by the home page modals.

import { useState } from 'react';
import {
  serviceFullContentMap,
  type ServiceType,
  type ServiceFullContent,
} from '@/lib/service-modal-content';
import {
  headingColors,
  formInputColors,
  titleColors,
  lightBgColors,
  successCheckmarkColors,
} from '@/lib/colors';
import type { AccentColor } from '@/lib/colors';

interface ServiceDeepDiveProps {
  defaultExpanded?: ServiceType;
}

// Map service types to colors
const serviceColors: Record<ServiceType, AccentColor> = {
  'virtual-assistant': 'green',
  'data-documents': 'blue',
  'website-services': 'purple',
};

export default function ServiceDeepDive({ defaultExpanded }: ServiceDeepDiveProps) {
  const [expanded, setExpanded] = useState<ServiceType | null>(defaultExpanded || null);

  const services = Object.entries(serviceFullContentMap) as [ServiceType, ServiceFullContent][];

  return (
    <div className="mb-10">
      {/* Section Header */}
      <h2 className={`text-2xl font-bold ${headingColors.primary} mb-6 text-center`}>
        Learn More About Each Service
      </h2>

      {/* Service Tabs/Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {services.map(([key, content]) => {
          const color = serviceColors[key];
          const isActive = expanded === key;
          return (
            <button
              key={key}
              onClick={() => setExpanded(isActive ? null : key)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${isActive
                  ? `${lightBgColors[color]} ${titleColors[color]}`
                  : `bg-gray-100 dark:bg-gray-700 ${headingColors.secondary} hover:bg-gray-200 dark:hover:bg-gray-600`
                }
              `}
            >
              {content.title}
              <span className="ml-2">{isActive ? '−' : '+'}</span>
            </button>
          );
        })}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <ServiceDetail
          serviceType={expanded}
          content={serviceFullContentMap[expanded]}
          color={serviceColors[expanded]}
        />
      )}

      {/* Hint when nothing expanded */}
      {!expanded && (
        <p className={`text-center ${formInputColors.helper} italic`}>
          Click a service above to see details
        </p>
      )}
    </div>
  );
}

// ============================================================================
// ServiceDetail - Individual service expanded view
// ============================================================================

interface ServiceDetailProps {
  serviceType: ServiceType;
  content: ServiceFullContent;
  color: AccentColor;
}

function ServiceDetail({ content, color }: ServiceDetailProps) {
  return (
    <div
      className={`
        p-6 rounded-xl
        bg-white dark:bg-gray-800
        border-2 border-gray-200 dark:border-gray-700
        border-t-4
        ${color === 'green' ? 'border-t-green-500' : ''}
        ${color === 'blue' ? 'border-t-blue-500' : ''}
        ${color === 'purple' ? 'border-t-purple-500' : ''}
        animate-fadeIn
      `}
    >
      {/* Headline */}
      <h3 className={`text-xl font-bold ${titleColors[color]} mb-2`}>
        {content.headline}
      </h3>

      {/* Subtitle */}
      <p className={`${formInputColors.helper} mb-4`}>
        {content.subtitle}
      </p>

      {/* Two-column layout on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What we handle */}
        <div className="min-w-0">
          <h4 className={`font-semibold ${headingColors.primary} mb-3`}>
            What we handle:
          </h4>
          <ul className="space-y-2">
            {content.bulletPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className={`${successCheckmarkColors.icon} mt-1`}>✓</span>
                <span className={formInputColors.helper}>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Examples */}
        <div className={`min-w-0 overflow-hidden ${lightBgColors[color]} p-4 rounded-lg`}>
          <h4 className={`font-semibold ${headingColors.primary} mb-3`}>
            {content.examples.title}
          </h4>
          <ul className="space-y-2">
            {content.examples.items.map((item, idx) => (
              <li
                key={idx}
                className={`${headingColors.primary} text-sm pl-4 border-l-2 border-gray-400 dark:border-gray-500`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Reassurance */}
      <p className={`${formInputColors.helper} italic mt-4 text-center`}>
        "{content.reassurance}"
      </p>
    </div>
  );
}
