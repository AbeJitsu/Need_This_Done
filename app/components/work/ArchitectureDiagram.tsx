'use client';

import type { CSSProperties } from 'react';
import type { ArchLayer } from '@/lib/portfolio-data';

// ============================================================================
// Architecture Diagram — Depth Map
// ============================================================================
// Renders the tech stack as a tapered layer stack: narrow at the top (frontend)
// and wide at the bottom (infrastructure), like a geological cross-section.
// Each layer is stacked with consistent spacing, z-indexed top-to-bottom.
//
// NOTE: emerald, blue, and purple are mapped to CSS variables in the Tailwind
// theme (e.g. emerald-500 → var(--green-500)). Tailwind v3 can't apply the
// /20 opacity modifier to CSS variables, so we use inline rgba styles for
// any property that needs alpha transparency. Amber uses Tailwind defaults
// and could use class-based opacity, but we keep all four consistent.

// RGB channel values for each layer color (sourced from globals.css)
const RGB = {
  emerald: [13, 122, 58],
  blue: [3, 105, 161],
  purple: [109, 40, 217],
  amber: [245, 158, 11],
} as const;

function rgba(color: readonly number[], alpha: number): string {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

// Build layer color config: inline styles for alpha-dependent properties,
// Tailwind classes for everything else (text colors, shadows, hover effects)
const layerColors: Record<
  string,
  {
    label: string;
    pillText: string;
    shadow: string;
    layerStyle: CSSProperties;
    pillStyle: CSSProperties;
  }
> = Object.fromEntries(
  Object.entries(RGB).map(([name, channels]) => [
    name,
    {
      label: `text-${name}-400`,
      pillText: `text-${name}-200`,
      shadow: 'shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
      layerStyle: {
        backgroundColor: rgba(channels, 0.2),
        borderColor: rgba(channels, 0.4),
        borderBottomColor: rgba(channels, 0.7),
      },
      pillStyle: {
        backgroundColor: rgba(channels, 0.25),
        borderColor: rgba(channels, 0.4),
      },
    },
  ]),
);

// Width tiers: top layer (index 0) = narrowest, bottom layer = widest
// On mobile these collapse to full width
const widthTiers = ['max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl'];

// Z-index decreases top→bottom so upper layers visually sit "on top"
const zTiers = ['z-40', 'z-30', 'z-20', 'z-10'];

interface ArchitectureDiagramProps {
  layers: ArchLayer[];
}

export default function ArchitectureDiagram({ layers }: ArchitectureDiagramProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {layers.map((layer, index) => {
        const colors = layerColors[layer.color];
        const width = widthTiers[index] ?? widthTiers[widthTiers.length - 1];
        const z = zTiers[index] ?? zTiers[zTiers.length - 1];

        return (
          <div
            key={layer.label}
            className={`w-full ${width} mx-auto relative ${z}`}
          >
            <div
              className={`
                rounded-xl border border-b-4
                ${colors.shadow}
                px-5 py-4 md:px-6 md:py-5
                transition-all duration-200
                hover:-translate-y-1 hover:shadow-lg
              `}
              style={colors.layerStyle}
            >
              {/* Layer label */}
              <div
                className={`text-xs font-bold tracking-wider uppercase ${colors.label} mb-3 text-center`}
              >
                {layer.label}
              </div>

              {/* Tech pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                {layer.items.map((item) => (
                  <span
                    key={item}
                    className={`
                      px-3 py-1 text-xs sm:text-sm rounded-lg font-medium whitespace-nowrap
                      border ${colors.pillText}
                    `}
                    style={colors.pillStyle}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
