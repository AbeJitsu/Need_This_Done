'use client';

import type { ArchLayer } from '@/lib/portfolio-data';

// ============================================================================
// Architecture Diagram - Visual stack layers
// ============================================================================
// Shows the NeedThisDone.com tech stack as layered rows.
// Each layer has a color matching the BJJ belt progression.

const layerColors: Record<string, { border: string; bg: string; label: string }> = {
  emerald: {
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-500/5',
    label: 'text-emerald-400',
  },
  blue: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/5',
    label: 'text-blue-400',
  },
  purple: {
    border: 'border-purple-500/50',
    bg: 'bg-purple-500/5',
    label: 'text-purple-400',
  },
  amber: {
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/5',
    label: 'text-amber-400',
  },
};

interface ArchitectureDiagramProps {
  layers: ArchLayer[];
}

export default function ArchitectureDiagram({ layers }: ArchitectureDiagramProps) {
  return (
    <div className="space-y-6">
      {layers.map((layer) => {
        const colors = layerColors[layer.color];
        return (
          <div
            key={layer.label}
            className={`rounded-xl border ${colors.border} ${colors.bg} p-4 md:p-5 flex items-center gap-6`}
          >
            {/* Label container */}
            <div className={`text-xs font-bold tracking-wider uppercase ${colors.label} whitespace-nowrap flex-shrink-0`}>
              {layer.label}
            </div>

            {/* Items - evenly distributed with equal spacing around */}
            <div className="flex flex-1 justify-around items-center">
              {layer.items.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 text-sm rounded-lg bg-white/5 text-slate-300 font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
