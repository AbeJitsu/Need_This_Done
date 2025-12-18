'use client';

// ============================================================================
// ServiceComparisonTable - Side-by-side service comparison cards
// ============================================================================
// Displays services as three distinct cards instead of a table.
// Each card has its own visual identity with color-coded accents.
// Makes it easy to scan and compare services at a glance.

import { headingColors, formInputColors, serviceComparisonColors, cardBgColors } from '@/lib/colors';
import type { ComparisonRow } from '@/lib/page-content-types';
import type { ServiceType } from '@/lib/colors';

interface ServiceComparisonTableProps {
  title: string;
  description: string;
  columns: [string, string, string];
  rows: ComparisonRow[];
}

// Map column index to service type for color lookup
const serviceTypes: ServiceType[] = ['virtualAssistant', 'dataDocuments', 'website'];

// Labels that represent pricing (shown in highlighted pricing section)
const pricingLabels = ['Quick tasks', 'Bigger projects'];

export default function ServiceComparisonTable({
  title,
  description,
  columns,
  rows,
}: ServiceComparisonTableProps) {
  // Separate info rows from pricing rows
  const infoRows = rows.filter(row => !pricingLabels.includes(row.label));
  const pricingRows = rows.filter(row => pricingLabels.includes(row.label));

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2`}>
          {title}
        </h2>
        <p className={`${formInputColors.helper} max-w-2xl mx-auto`}>
          {description}
        </p>
      </div>

      {/* Three Service Cards - CSS Grid for consistent alignment */}
      <div className="grid md:grid-cols-3 gap-6">
        {columns.map((serviceName, colIdx) => {
          const colors = serviceComparisonColors[serviceTypes[colIdx]];

          return (
            <div
              key={serviceName}
              className={`
                rounded-xl overflow-hidden
                ${cardBgColors.base} ${colors.border}
                transition-shadow hover:shadow-lg
                grid grid-rows-[auto_1fr_auto]
              `}
            >
              {/* Card Header - Service Name */}
              <div className={`px-6 py-4 ${colors.headerBg}`}>
                <h3 className={`text-xl font-bold ${colors.headerText} text-center`}>
                  {serviceName}
                </h3>
              </div>

              {/* Card Body - Service Details with subgrid for row alignment */}
              <div className="px-6 py-5 grid content-start gap-4">
                {infoRows.map((row) => (
                  <div key={row.label} className="min-h-[4.5rem]">
                    <p className={`text-xs font-medium uppercase tracking-wide ${headingColors.secondary} mb-1`}>
                      {row.label}
                    </p>
                    <p className={`${headingColors.primary} text-sm leading-relaxed`}>
                      {row.values[colIdx]}
                    </p>
                  </div>
                ))}
              </div>

              {/* Card Footer - Pricing Section */}
              {pricingRows.length > 0 && (
                <div className={`px-6 py-4 ${colors.pricingBg} ${colors.pricingBorder}`}>
                  <div className="space-y-2">
                    {pricingRows.map((row) => (
                      <div key={row.label} className="flex justify-between items-center">
                        <span className={`text-sm ${headingColors.secondary}`}>
                          {row.label}
                        </span>
                        <span className={`font-semibold ${headingColors.primary}`}>
                          {row.values[colIdx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
