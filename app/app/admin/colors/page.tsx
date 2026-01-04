'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Button from '@/components/Button';
import {
  contrastRatio,
  meetsWcagAA,
  meetsWcagAAA,
  findAccessibleShade,
  generateColorScale,
  getContrastLevel,
  formatContrastRatio,
} from '@/lib/wcag-contrast';
import { cardBgColors, headingColors, mutedTextColors, dividerColors } from '@/lib/colors';

// ============================================================================
// Admin Colors Page - WCAG Color Calculator
// ============================================================================
// What: Interactive tool for finding WCAG AA compliant color combinations.
// Why: Makes it easy to create accessible color palettes for the design system.
// How: Input a color, see auto-generated accessible shades with live preview.

export default function AdminColorsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  // Color state
  const [baseColor, setBaseColor] = useState('#a36b00'); // Gold as default
  const [colorName, setColorName] = useState('gold');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  // ============================================================================
  // Redirect Non-Admins
  // ============================================================================

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // ============================================================================
  // Generated Color Scale
  // ============================================================================

  const colorScale = useMemo(() => {
    try {
      return generateColorScale(baseColor);
    } catch {
      return null;
    }
  }, [baseColor]);

  // Calculate contrast ratios
  const contrastWithWhite = useMemo(() => {
    try {
      return contrastRatio(baseColor, '#ffffff');
    } catch {
      return 0;
    }
  }, [baseColor]);

  const contrastWithBlack = useMemo(() => {
    try {
      return contrastRatio(baseColor, '#000000');
    } catch {
      return 0;
    }
  }, [baseColor]);

  // Find accessible shades
  const accessibleForWhite = useMemo(() => {
    try {
      return findAccessibleShade(baseColor, '#ffffff', 4.5);
    } catch {
      return null;
    }
  }, [baseColor]);

  const accessibleForBlack = useMemo(() => {
    try {
      return findAccessibleShade(baseColor, '#000000', 4.5);
    } catch {
      return null;
    }
  }, [baseColor]);

  // ============================================================================
  // Export Functions
  // ============================================================================

  const exportCSS = () => {
    if (!colorScale) return;

    const css = `/* ${colorName} color scale - WCAG AA compliant */
:root {
  --${colorName}-50: ${colorScale[50]};
  --${colorName}-100: ${colorScale[100]};
  --${colorName}-200: ${colorScale[200]};
  --${colorName}-300: ${colorScale[300]};
  --${colorName}-400: ${colorScale[400]};
  --${colorName}-500: ${colorScale[500]}; /* 4.5:1 with white - dark mode bg */
  --${colorName}-600: ${colorScale[600]}; /* 4.5:1 with -100 - light mode text */
  --${colorName}-700: ${colorScale[700]};
  --${colorName}-800: ${colorScale[800]};
  --${colorName}-900: ${colorScale[900]};
}`;

    navigator.clipboard.writeText(css);
    alert('CSS variables copied to clipboard!');
  };

  const exportTailwind = () => {
    if (!colorScale) return;

    const config = `// ${colorName} color scale for tailwind.config.cjs
${colorName}: {
  50: 'var(--${colorName}-50)',
  100: 'var(--${colorName}-100)',
  200: 'var(--${colorName}-200)',
  300: 'var(--${colorName}-300)',
  400: 'var(--${colorName}-400)',
  500: 'var(--${colorName}-500)', // 4.5:1 with white
  600: 'var(--${colorName}-600)', // 4.5:1 with -100
  700: 'var(--${colorName}-700)',
  800: 'var(--${colorName}-800)',
  900: 'var(--${colorName}-900)',
},`;

    navigator.clipboard.writeText(config);
    alert('Tailwind config copied to clipboard!');
  };

  // ============================================================================
  // Loading and Auth States
  // ============================================================================

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className={mutedTextColors.light}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <PageHeader
        title="WCAG Color Calculator"
        description="Find WCAG AA compliant color combinations for your design system."
      />

      {/* Color Input Section */}
      <section className="mb-8">
        <Card hoverColor="purple" hoverEffect="none">
          <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
            Base Color Input
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color picker */}
            <div>
              <label className={`block text-sm font-medium ${headingColors.secondary} mb-2`}>
                Pick a color or enter hex value
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className={`w-16 h-16 rounded-lg ${dividerColors.border} border-2 cursor-pointer`}
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  placeholder="#a36b00"
                  className={`flex-1 px-4 py-3 rounded-lg border ${dividerColors.border} ${cardBgColors.base} ${headingColors.primary} font-mono`}
                />
              </div>
            </div>

            {/* Color name */}
            <div>
              <label className={`block text-sm font-medium ${headingColors.secondary} mb-2`}>
                Color name (for export)
              </label>
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="gold"
                className={`w-full px-4 py-3 rounded-lg border ${dividerColors.border} ${cardBgColors.base} ${headingColors.primary}`}
              />
            </div>
          </div>
        </Card>
      </section>

      {/* Contrast Analysis Section */}
      <section className="mb-8">
        <Card hoverColor="blue" hoverEffect="none">
          <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
            Contrast Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contrast with white */}
            <div className="p-6 rounded-lg" style={{ backgroundColor: baseColor }}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-white text-lg font-bold">On White Background</span>
                <ContrastBadge ratio={contrastWithWhite} />
              </div>
              <div className="text-white space-y-2">
                <p>Contrast: {formatContrastRatio(contrastWithWhite)}</p>
                <p>AA Normal: {meetsWcagAA(baseColor, '#ffffff') ? '✓ Pass' : '✗ Fail'}</p>
                <p>AA Large: {meetsWcagAA(baseColor, '#ffffff', { largeText: true }) ? '✓ Pass' : '✗ Fail'}</p>
                <p>AAA: {meetsWcagAAA(baseColor, '#ffffff') ? '✓ Pass' : '✗ Fail'}</p>
              </div>
              {accessibleForWhite && accessibleForWhite !== baseColor && (
                <div className="mt-4 pt-4 border-t border-white/30">
                  <p className="text-white text-sm mb-2">Suggested accessible shade:</p>
                  <div
                    className="w-full h-10 rounded flex items-center justify-center text-white font-mono text-sm"
                    style={{ backgroundColor: accessibleForWhite }}
                  >
                    {accessibleForWhite}
                  </div>
                </div>
              )}
            </div>

            {/* Contrast with black */}
            <div className="p-6 rounded-lg border-2" style={{ backgroundColor: baseColor }}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-black text-lg font-bold">On Black Background</span>
                <ContrastBadge ratio={contrastWithBlack} />
              </div>
              <div className="text-black space-y-2">
                <p>Contrast: {formatContrastRatio(contrastWithBlack)}</p>
                <p>AA Normal: {meetsWcagAA(baseColor, '#000000') ? '✓ Pass' : '✗ Fail'}</p>
                <p>AA Large: {meetsWcagAA(baseColor, '#000000', { largeText: true }) ? '✓ Pass' : '✗ Fail'}</p>
                <p>AAA: {meetsWcagAAA(baseColor, '#000000') ? '✓ Pass' : '✗ Fail'}</p>
              </div>
              {accessibleForBlack && accessibleForBlack !== baseColor && (
                <div className="mt-4 pt-4 border-t border-black/30">
                  <p className="text-black text-sm mb-2">Suggested accessible shade:</p>
                  <div
                    className="w-full h-10 rounded flex items-center justify-center text-black font-mono text-sm border"
                    style={{ backgroundColor: accessibleForBlack }}
                  >
                    {accessibleForBlack}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* Generated Color Scale */}
      {colorScale && (
        <section className="mb-8">
          <Card hoverColor="green" hoverEffect="none">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${headingColors.primary}`}>
                Generated Color Scale
              </h2>
              <div className="flex gap-2">
                <Button variant="gray" size="sm" onClick={exportCSS}>
                  Export CSS
                </Button>
                <Button variant="gray" size="sm" onClick={exportTailwind}>
                  Export Tailwind
                </Button>
              </div>
            </div>

            {/* Color swatches */}
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6">
              {([50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const).map((shade) => (
                <div key={shade} className="text-center">
                  <div
                    className="w-full aspect-square rounded-lg mb-1"
                    style={{ backgroundColor: colorScale[shade] }}
                    title={colorScale[shade]}
                  />
                  <div className={`text-xs font-medium ${mutedTextColors.normal}`}>
                    {shade}
                  </div>
                  <div className={`text-xs font-mono ${mutedTextColors.normal} truncate`}>
                    {colorScale[shade]}
                  </div>
                </div>
              ))}
            </div>

            {/* WCAG anchor explanation */}
            <div className={`${cardBgColors.elevated} rounded-lg p-4`}>
              <h3 className={`font-medium ${headingColors.primary} mb-2`}>
                WCAG Anchor Points
              </h3>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-sm ${mutedTextColors.normal}`}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded"
                    style={{ backgroundColor: colorScale[500] }}
                  />
                  <div>
                    <div className={`font-medium ${headingColors.primary}`}>500</div>
                    <div>4.5:1 with white → Dark mode background</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded"
                    style={{ backgroundColor: colorScale[600] }}
                  />
                  <div>
                    <div className={`font-medium ${headingColors.primary}`}>600</div>
                    <div>4.5:1 with -100 → Light mode text minimum</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Live Preview Section */}
      <section className="mb-8">
        <Card hoverColor="gold" hoverEffect="none">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold ${headingColors.primary}`}>
              Live Preview
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode('light')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  previewMode === 'light'
                    ? 'bg-gray-900 text-white'
                    : `${cardBgColors.elevated} ${headingColors.secondary}`
                }`}
              >
                Light Mode
              </button>
              <button
                onClick={() => setPreviewMode('dark')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  previewMode === 'dark'
                    ? 'bg-gray-900 text-white'
                    : `${cardBgColors.elevated} ${headingColors.secondary}`
                }`}
              >
                Dark Mode
              </button>
            </div>
          </div>

          {colorScale && (
            <div
              className={`rounded-lg p-6 ${
                previewMode === 'light' ? 'bg-white' : 'bg-gray-900'
              }`}
            >
              {/* Button preview */}
              <div className="mb-6">
                <h3
                  className={`text-sm font-medium mb-3 ${
                    previewMode === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}
                >
                  Button Example
                </h3>
                <button
                  className="px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: previewMode === 'light' ? colorScale[100] : colorScale[500],
                    color: previewMode === 'light' ? colorScale[700] : '#ffffff',
                  }}
                >
                  Primary Button
                </button>
              </div>

              {/* Card preview */}
              <div className="mb-6">
                <h3
                  className={`text-sm font-medium mb-3 ${
                    previewMode === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}
                >
                  Card Example
                </h3>
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: previewMode === 'light' ? colorScale[100] : colorScale[500],
                  }}
                >
                  <h4
                    style={{
                      color: previewMode === 'light' ? colorScale[800] : '#ffffff',
                    }}
                    className="font-semibold mb-2"
                  >
                    Card Title
                  </h4>
                  <p
                    style={{
                      color: previewMode === 'light' ? colorScale[600] : 'rgba(255,255,255,0.9)',
                    }}
                  >
                    This is an example of how your color would look in a card component.
                  </p>
                </div>
              </div>

              {/* Text preview */}
              <div>
                <h3
                  className={`text-sm font-medium mb-3 ${
                    previewMode === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}
                >
                  Text Hierarchy
                </h3>
                <div
                  className="space-y-2"
                  style={{
                    backgroundColor: previewMode === 'light' ? '#ffffff' : '#1f2937',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                  }}
                >
                  <p
                    className="text-xl font-bold"
                    style={{ color: previewMode === 'light' ? colorScale[800] : colorScale[200] }}
                  >
                    Heading Text (800/200)
                  </p>
                  <p
                    className="text-base"
                    style={{ color: previewMode === 'light' ? colorScale[600] : colorScale[400] }}
                  >
                    Body text using 600/400 shades for readable contrast.
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: previewMode === 'light' ? colorScale[500] : colorScale[500] }}
                  >
                    Muted text using 500 shade.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Back to Dashboard */}
      <div className="mt-8 text-center">
        <Button variant="gray" href="/admin/dev">
          Back to Dev Dashboard
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Contrast Badge Component
// ============================================================================

function ContrastBadge({ ratio }: { ratio: number }) {
  const level = getContrastLevel(ratio);

  const colors = {
    fail: 'bg-red-500 text-white',
    'aa-large': 'bg-yellow-500 text-black',
    aa: 'bg-green-500 text-white',
    aaa: 'bg-blue-500 text-white',
  };

  const labels = {
    fail: 'Fail',
    'aa-large': 'AA Large',
    aa: 'AA',
    aaa: 'AAA',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${colors[level]}`}>
      {labels[level]}
    </span>
  );
}
