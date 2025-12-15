'use client';

// ============================================================================
// ServiceComparisonTable - Side-by-side service comparison
// ============================================================================
// Helps visitors compare services at a glance.
// Mobile-responsive: stacks into cards on smaller screens.

import { headingColors, formInputColors, titleColors } from '@/lib/colors';
import type { ComparisonRow } from '@/lib/page-content-types';
import Card from '@/components/Card';

interface ServiceComparisonTableProps {
  title: string;
  description: string;
  columns: [string, string, string];
  rows: ComparisonRow[];
}

// Service colors for column headers
const columnColors = ['green', 'blue', 'purple'] as const;

export default function ServiceComparisonTable({
  title,
  description,
  columns,
  rows,
}: ServiceComparisonTableProps) {
  return (
    <Card hoverColor="blue" hoverEffect="glow" className="mb-10">
      {/* Section Header */}
      <h2 className={`text-2xl font-bold ${headingColors.primary} mb-2 text-center`}>
        {title}
      </h2>
      <p className={`${formInputColors.helper} text-center mb-6`}>
        {description}
      </p>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-3" />
              {columns.map((col, idx) => (
                <th
                  key={col}
                  className={`text-center p-3 ${titleColors[columnColors[idx]]} font-bold text-lg`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={row.label}
                className={rowIdx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/30' : ''}
              >
                <td className={`p-3 ${headingColors.primary} font-medium`}>
                  {row.label}
                </td>
                {row.values.map((value, colIdx) => (
                  <td
                    key={colIdx}
                    className={`text-center p-3 ${formInputColors.helper}`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {columns.map((col, colIdx) => (
          <div
            key={col}
            className={`
              p-4 rounded-lg
              border-l-4
              ${colIdx === 0 ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20' : ''}
              ${colIdx === 1 ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
              ${colIdx === 2 ? 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}
            `}
          >
            <h3 className={`${titleColors[columnColors[colIdx]]} font-bold text-lg mb-3`}>
              {col}
            </h3>
            <dl className="space-y-2">
              {rows.map((row) => (
                <div key={row.label} className="flex justify-between">
                  <dt className={`${headingColors.secondary} text-sm`}>{row.label}</dt>
                  <dd className={`${headingColors.primary} text-sm font-medium`}>
                    {row.values[colIdx]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Card>
  );
}
