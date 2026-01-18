// ============================================================================
// WCAG Contrast System - EASY TO CHANGE (ETC)
// ============================================================================
//
// PRINCIPLE: Change here, works everywhere.
//
// This file is the SINGLE SOURCE OF TRUTH for:
//   - What shade of each color meets WCAG AA on each background
//   - Ready-to-use Tailwind classes for all pages
//
// USAGE (same everywhere):
//   import { accent } from '@/lib/contrast';
//
//   <h2 className={accent.emerald.text}>Title</h2>
//   <div className={accent.blue.border}>Card</div>
//
// TO CHANGE:
//   1. Adjust hex values in colorPalette (synced with globals.css)
//   2. The system auto-calculates the lightest compliant shade
//   3. All pages get the update
//
// ============================================================================

// ============================================================================
// COLOR PALETTE - Hex values synced with globals.css
// ============================================================================
// Change these if you adjust globals.css color definitions

// SYNCED WITH globals.css - Update both when changing colors
const colorPalette = {
  // Emerald (BJJ Green Belt - Primary)
  emerald: {
    50: '#f0fdf5', 100: '#e0fbeb', 200: '#b0f0cc', 300: '#7ce4a8',
    400: '#4ad080', 500: '#0d7a3a', 600: '#0a6830', 700: '#085626',
    800: '#05441c', 900: '#033212',
  },
  // Sky Blue (Secondary)
  blue: {
    50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
    400: '#38bdf8', 500: '#0369a1', 600: '#075985', 700: '#0c4a6e',
    800: '#083344', 900: '#042330',
  },
  // Violet (Tertiary)
  purple: {
    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
    400: '#a78bfa', 500: '#6d28d9', 600: '#5b21b6', 700: '#4c1d95',
    800: '#3b1578', 900: '#2a105a',
  },
  // Brown (BJJ Brown Belt - Warm accent)
  gold: {
    50: '#fdf8f6', 100: '#f5ebe6', 200: '#e8d5c9', 300: '#d4b8a5',
    400: '#b8917a', 500: '#8b6b54', 600: '#6f503d', 700: '#5c3f2e',
    800: '#4a3123', 900: '#3d2518',
  },
  // Teal (Additional accent)
  teal: {
    50: '#f0fffc', 100: '#d8fff8', 200: '#a8f5ea', 300: '#70eadb',
    400: '#38d4c5', 500: '#0d9488', 600: '#0d7a70', 700: '#0a6258',
    800: '#074a42', 900: '#04332d',
  },
  // Gray (Neutral)
  gray: {
    50: '#faf9f7', 100: '#f5f3f0', 200: '#e5e2dd', 300: '#d4d0ca',
    400: '#b0aaa3', 500: '#78716c', 600: '#5a5550', 700: '#454240',
    800: '#312f2e', 900: '#1e1d1c',
  },
  // Red (Error/Danger)
  red: {
    50: '#fff5f5', 100: '#ffe8e8', 200: '#ffc5c5', 300: '#ffa0a0',
    400: '#f07070', 500: '#dc2626', 600: '#b83838', 700: '#942d2d',
    800: '#702222', 900: '#4d1818',
  },
} as const;

// ============================================================================
// BACKGROUND CONTEXTS - The backgrounds your pages use
// ============================================================================
// Add new backgrounds here if needed

const backgrounds = {
  // Light backgrounds (most content)
  white: '#ffffff',
  gray50: '#faf9f7',
  gray100: '#f5f3f0',

  // Dark backgrounds (CTA sections)
  slate900: '#1e1d1c',
  slate800: '#312f2e',
} as const;

// ============================================================================
// CONTRAST CALCULATION (WCAG 2.1 formula)
// ============================================================================

type Shade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
type ColorName = keyof typeof colorPalette;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex: ${hex}`);
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(fg: string, bg: string): number {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Find the LIGHTEST shade that meets the target ratio
function findLightestShade(
  color: ColorName,
  background: string,
  targetRatio: number = 4.5
): Shade {
  const palette = colorPalette[color];
  const shades: Shade[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

  for (const shade of shades) {
    const ratio = getContrastRatio(palette[shade], background);
    if (ratio >= targetRatio) {
      return shade;
    }
  }
  return '900'; // Fallback to darkest
}

// For dark backgrounds, find the lightest LIGHT shade that works
function findLightestShadeOnDark(
  color: ColorName,
  background: string,
  targetRatio: number = 4.5
): Shade {
  const palette = colorPalette[color];
  // On dark backgrounds, we go from light to dark (50 is lightest)
  const shades: Shade[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

  for (const shade of shades) {
    const ratio = getContrastRatio(palette[shade], background);
    if (ratio >= targetRatio) {
      return shade;
    }
  }
  return '50'; // Fallback to lightest
}

// ============================================================================
// COMPUTED ACCENT SYSTEM - The main export
// ============================================================================
// All pages use this. Shades are auto-calculated for WCAG AA compliance.

type AccentColorSet = {
  // Text on light backgrounds (white, gray-50, gray-100)
  text: string;
  textHover: string;

  // Text on dark backgrounds (slate-900 CTA sections)
  textOnDark: string;

  // Backgrounds (light bg for badges, cards)
  bg: string;
  bgHover: string;

  // Borders
  border: string;
  borderHover: string;

  // The computed shade numbers (for reference)
  _shadeOnLight: Shade;
  _shadeOnDark: Shade;
};

function computeAccentColors(color: ColorName): AccentColorSet {
  // Calculate lightest shade for each context
  const shadeOnLight = findLightestShade(color, backgrounds.white);
  const shadeOnDark = findLightestShadeOnDark(color, backgrounds.slate900);
  const hoverShadeOnLight = String(Math.min(Number(shadeOnLight) + 100, 900)) as Shade;

  // Map to Tailwind classes
  // Special case: 'emerald' uses the emerald- prefix, others use their name
  const prefix = color;

  return {
    text: `text-${prefix}-${shadeOnLight}`,
    textHover: `hover:text-${prefix}-${hoverShadeOnLight}`,
    textOnDark: `text-${prefix}-${shadeOnDark}`,
    bg: `bg-${prefix}-100`,
    bgHover: `hover:bg-${prefix}-200`,
    border: `border-${prefix}-${shadeOnLight}`,
    borderHover: `hover:border-${prefix}-${hoverShadeOnLight}`,
    _shadeOnLight: shadeOnLight,
    _shadeOnDark: shadeOnDark,
  };
}

// ============================================================================
// MAIN EXPORT: accent
// ============================================================================
// Use this everywhere for consistent, accessible colors.
//
// Example:
//   import { accent } from '@/lib/contrast';
//   <h2 className={accent.emerald.text}>Green heading</h2>
//   <p className={accent.blue.textOnDark}>Blue on dark bg</p>

export const accent = {
  emerald: computeAccentColors('emerald'),
  blue: computeAccentColors('blue'),
  purple: computeAccentColors('purple'),
  gold: computeAccentColors('gold'),
  teal: computeAccentColors('teal'),
  gray: computeAccentColors('gray'),
  red: computeAccentColors('red'),
} as const;

// BJJ belt order for easy iteration
export const beltOrder: ColorName[] = ['emerald', 'blue', 'purple', 'gold'];

// ============================================================================
// SHADE MAP - For colors.ts to use computed values
// ============================================================================
// This is the ETC bridge: colors.ts imports these computed shades
// instead of hardcoding -600 everywhere.

export const computedShades = {
  // Lightest shade that meets WCAG AA on white background
  onWhite: {
    emerald: findLightestShade('emerald', backgrounds.white),
    blue: findLightestShade('blue', backgrounds.white),
    purple: findLightestShade('purple', backgrounds.white),
    gold: findLightestShade('gold', backgrounds.white),
    teal: findLightestShade('teal', backgrounds.white),
    gray: findLightestShade('gray', backgrounds.white),
    red: findLightestShade('red', backgrounds.white),
  },
  // Lightest shade on gray-100 background (slightly darker for some colors)
  onGray100: {
    emerald: findLightestShade('emerald', backgrounds.gray100),
    blue: findLightestShade('blue', backgrounds.gray100),
    purple: findLightestShade('purple', backgrounds.gray100),
    gold: findLightestShade('gold', backgrounds.gray100),
    teal: findLightestShade('teal', backgrounds.gray100),
    gray: findLightestShade('gray', backgrounds.gray100),
    red: findLightestShade('red', backgrounds.gray100),
  },
  // Lightest shade on dark backgrounds
  onDark: {
    emerald: findLightestShadeOnDark('emerald', backgrounds.slate900),
    blue: findLightestShadeOnDark('blue', backgrounds.slate900),
    purple: findLightestShadeOnDark('purple', backgrounds.slate900),
    gold: findLightestShadeOnDark('gold', backgrounds.slate900),
    teal: findLightestShadeOnDark('teal', backgrounds.slate900),
    gray: findLightestShadeOnDark('gray', backgrounds.slate900),
    red: findLightestShadeOnDark('red', backgrounds.slate900),
  },
} as const;

// ============================================================================
// UTILITY EXPORTS - For edge cases or debugging
// ============================================================================

export function getContrastReport(): void {
  console.log('\n=== WCAG AA Contrast Report ===\n');
  console.log('Lightest shade meeting 4.5:1 contrast:\n');

  for (const [name, colors] of Object.entries(accent)) {
    console.log(`${name}:`);
    console.log(`  On white:     ${colors._shadeOnLight} → ${colors.text}`);
    console.log(`  On slate-900: ${colors._shadeOnDark} → ${colors.textOnDark}`);
  }
}

// For dynamic calculation if needed
export { getContrastRatio, findLightestShade, colorPalette, backgrounds };
export type { ColorName, Shade };
