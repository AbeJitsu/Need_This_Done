'use client';

// ============================================================================
// ServiceComparisonTable - Side-by-side service comparison cards
// ============================================================================
// Redesigned for better scannability with icon-based rows and clear visual
// hierarchy. Each card shows key info at a glance with pricing prominently displayed.

import { headingColors, formInputColors, cardBgColors } from '@/lib/colors';
import { EditableItem } from '@/components/InlineEditor';
import type { ComparisonRow } from '@/lib/page-content-types';
import { Target, Package, Clock, DollarSign, HeadphonesIcon, Globe, Cog, Sparkles } from 'lucide-react';

interface ServiceComparisonTableProps {
  title: string;
  description: string;
  columns: [string, string, string];
  rows: ComparisonRow[];
}

// Icon mapping for row labels
const rowIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Best for': Target,
  'What you get': Package,
  'Timeline': Clock,
  'Starting at': DollarSign,
  'Support included': HeadphonesIcon,
};

// Service icons and colors
const serviceConfig: Record<number, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  lightBg: string;
  accentBg: string;
  accentText: string;
}> = {
  0: {
    icon: Globe,
    color: 'text-green-600',
    lightBg: 'bg-green-50',
    accentBg: 'bg-green-500',
    accentText: 'text-green-700',
  },
  1: {
    icon: Cog,
    color: 'text-blue-600',
    lightBg: 'bg-blue-50',
    accentBg: 'bg-blue-500',
    accentText: 'text-blue-700',
  },
  2: {
    icon: Sparkles,
    color: 'text-purple-600',
    lightBg: 'bg-purple-50',
    accentBg: 'bg-purple-500',
    accentText: 'text-purple-700',
  },
};

export default function ServiceComparisonTable({
  title,
  description,
  columns,
  rows,
}: ServiceComparisonTableProps) {
  // Find specific rows by label
  const getRowValue = (label: string, colIdx: number) => {
    const row = rows.find(r => r.label === label);
    return row?.values[colIdx] || '';
  };

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2`}>
          {title}
        </h2>
        <p className={`${formInputColors.helper} max-w-2xl mx-auto`}>
          {description}
        </p>
      </div>

      {/* Three Service Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {columns.map((serviceName, colIdx) => {
          const config = serviceConfig[colIdx];
          const ServiceIcon = config.icon;

          // Build content object for this column (for inline editing)
          const columnContent: Record<string, unknown> = {
            name: serviceName,
          };
          rows.forEach((row, rowIdx) => {
            columnContent[`row_${rowIdx}_${row.label.replace(/\s+/g, '_')}`] = row.values[colIdx];
          });

          return (
            <EditableItem
              key={serviceName}
              sectionKey="comparison"
              arrayField="columns"
              index={colIdx}
              label={serviceName}
              content={columnContent}
            >
              <div
                className={`
                  h-full flex flex-col
                  rounded-2xl overflow-hidden
                  ${cardBgColors.base}
                  border border-gray-200/60 dark:border-gray-700/60
                  shadow-sm hover:shadow-lg hover:-translate-y-1
                  transition-all duration-300
                `}
              >
                {/* Card Header - Icon + Name + Best For */}
                <div className={`px-6 pt-6 pb-4 ${config.lightBg}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${config.accentBg} flex items-center justify-center`}>
                      <ServiceIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`text-lg font-bold ${config.accentText}`}>
                      {serviceName}
                    </h3>
                  </div>
                  <p className={`text-sm ${headingColors.primary} leading-relaxed`}>
                    {getRowValue('Best for', colIdx)}
                  </p>
                </div>

                {/* Key Info - Clear labeled sections (grows to push footer down) */}
                <div className="px-6 py-5 space-y-4 flex-grow">
                  {/* What You Get - with clear label */}
                  <div>
                    <div className={`text-xs font-semibold uppercase tracking-wide ${formInputColors.helper} mb-1.5`}>
                      Includes
                    </div>
                    <p className={`text-sm ${headingColors.primary} leading-relaxed`}>
                      {getRowValue('What you get', colIdx)}
                    </p>
                  </div>

                  {/* Timeline + Support - Clearly labeled */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={`text-xs font-semibold uppercase tracking-wide ${formInputColors.helper} mb-1`}>
                        Timeline
                      </div>
                      <span className={`text-sm font-medium ${headingColors.primary}`}>
                        {getRowValue('Timeline', colIdx)}
                      </span>
                    </div>
                    <div>
                      <div className={`text-xs font-semibold uppercase tracking-wide ${formInputColors.helper} mb-1`}>
                        Support
                      </div>
                      <span className={`text-sm font-medium ${headingColors.primary}`}>
                        {getRowValue('Support included', colIdx)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing Footer - always at bottom */}
                <div className={`px-6 py-4 ${config.lightBg} border-t border-gray-200/60 mt-auto`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${formInputColors.helper}`}>
                      Starting at
                    </span>
                    <span className={`text-xl font-bold ${config.accentText}`}>
                      {getRowValue('Starting at', colIdx)}
                    </span>
                  </div>
                </div>
              </div>
            </EditableItem>
          );
        })}
      </div>
    </section>
  );
}
