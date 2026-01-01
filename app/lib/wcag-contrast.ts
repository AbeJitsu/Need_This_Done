// ============================================================================
// WCAG Contrast Ratio Calculations
// ============================================================================
// Implements WCAG 2.1 contrast ratio formulas for accessibility compliance.
// Reference: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
//
// Key formulas:
// - Relative luminance: L = 0.2126*R + 0.7152*G + 0.0722*B (sRGB)
// - Contrast ratio: (L1 + 0.05) / (L2 + 0.05) where L1 > L2
//
// WCAG AA Requirements:
// - Normal text: 4.5:1 minimum
// - Large text (18pt+ or 14pt bold): 3:1 minimum
// - UI components: 3:1 minimum
//
// WCAG AAA Requirements:
// - Normal text: 7:1 minimum
// - Large text: 4.5:1 minimum

export interface RGB {
  r: number;
  g: number;
  b: number;
}

// ============================================================================
// Hex to RGB Conversion
// ============================================================================

export function hexToRgb(hex: string): RGB {
  // Remove # if present
  let cleanHex = hex.replace(/^#/, '');

  // Expand 3-digit hex to 6-digit
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

// ============================================================================
// RGB to Hex Conversion
// ============================================================================

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number): string => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

// ============================================================================
// Relative Luminance
// ============================================================================
// Per WCAG 2.1: https://www.w3.org/WAI/WCAG21/Techniques/general/G17

function sRGBtoLinear(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);

  const R = sRGBtoLinear(r);
  const G = sRGBtoLinear(g);
  const B = sRGBtoLinear(b);

  // WCAG luminance formula
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// ============================================================================
// Contrast Ratio
// ============================================================================
// Returns ratio from 1 (same color) to 21 (black/white)

export function contrastRatio(color1: string, color2: string): number {
  const L1 = relativeLuminance(color1);
  const L2 = relativeLuminance(color2);

  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);

  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================================
// WCAG Compliance Checks
// ============================================================================

export interface WcagOptions {
  largeText?: boolean; // 18pt+ or 14pt bold = 3:1 threshold
}

export function meetsWcagAA(
  foreground: string,
  background: string,
  options: WcagOptions = {}
): boolean {
  const ratio = contrastRatio(foreground, background);
  const threshold = options.largeText ? 3 : 4.5;
  return ratio >= threshold;
}

export function meetsWcagAAA(
  foreground: string,
  background: string,
  options: WcagOptions = {}
): boolean {
  const ratio = contrastRatio(foreground, background);
  const threshold = options.largeText ? 4.5 : 7;
  return ratio >= threshold;
}

// ============================================================================
// Find Accessible Shade
// ============================================================================
// Given a color, find a lighter or darker version that meets the target ratio

export function findAccessibleShade(
  color: string,
  targetBackground: string,
  targetRatio: number = 4.5
): string | null {
  // If already accessible, return as-is
  if (contrastRatio(color, targetBackground) >= targetRatio) {
    return color;
  }

  const bgLuminance = relativeLuminance(targetBackground);
  const { r, g, b } = hexToRgb(color);

  // Determine if we need to lighten or darken
  const needsDarker = bgLuminance > 0.5; // Light background = need darker color

  // Binary search for the accessible shade
  let low = 0;
  let high = 1;
  let bestColor: string | null = null;

  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;

    let adjustedR: number, adjustedG: number, adjustedB: number;

    if (needsDarker) {
      // Darken: multiply by factor
      adjustedR = r * mid;
      adjustedG = g * mid;
      adjustedB = b * mid;
    } else {
      // Lighten: blend toward white
      adjustedR = r + (255 - r) * mid;
      adjustedG = g + (255 - g) * mid;
      adjustedB = b + (255 - b) * mid;
    }

    const adjustedHex = rgbToHex({ r: adjustedR, g: adjustedG, b: adjustedB });
    const ratio = contrastRatio(adjustedHex, targetBackground);

    if (ratio >= targetRatio) {
      bestColor = adjustedHex;
      if (needsDarker) {
        low = mid; // Try less dark
      } else {
        high = mid; // Try less light
      }
    } else {
      if (needsDarker) {
        high = mid; // Need darker
      } else {
        low = mid; // Need lighter
      }
    }
  }

  return bestColor;
}

// ============================================================================
// Generate Color Scale with WCAG Anchors
// ============================================================================
// Generate a color scale where:
// - 500: 4.5:1 with white (dark mode background)
// - 600: 4.5:1 with -100 (light mode minimum text)

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export function generateColorScale(baseColor: string): ColorScale {
  const { r, g, b } = hexToRgb(baseColor);

  // Generate shades by adjusting brightness
  const adjustBrightness = (factor: number): string => {
    if (factor > 1) {
      // Lighten: blend toward white
      const blend = factor - 1;
      return rgbToHex({
        r: r + (255 - r) * blend,
        g: g + (255 - g) * blend,
        b: b + (255 - b) * blend,
      });
    } else {
      // Darken: multiply
      return rgbToHex({
        r: r * factor,
        g: g * factor,
        b: b * factor,
      });
    }
  };

  // Generate scale with WCAG-compliant 500 and 600
  const scale: Partial<ColorScale> = {};

  // Light shades (50-400)
  scale[50] = adjustBrightness(1.95);
  scale[100] = adjustBrightness(1.8);
  scale[200] = adjustBrightness(1.6);
  scale[300] = adjustBrightness(1.4);
  scale[400] = adjustBrightness(1.2);

  // Find 500 that meets 4.5:1 with white
  scale[500] = findAccessibleShade(baseColor, '#ffffff', 4.5) || adjustBrightness(0.85);

  // Find 600 that meets 4.5:1 with 100 shade
  scale[600] = findAccessibleShade(scale[500]!, scale[100]!, 4.5) || adjustBrightness(0.7);

  // Dark shades (700-900)
  scale[700] = adjustBrightness(0.5);
  scale[800] = adjustBrightness(0.3);
  scale[900] = adjustBrightness(0.15);

  return scale as ColorScale;
}

// ============================================================================
// Get Contrast Rating
// ============================================================================

export type ContrastLevel = 'fail' | 'aa-large' | 'aa' | 'aaa';

export function getContrastLevel(ratio: number): ContrastLevel {
  if (ratio >= 7) return 'aaa';
  if (ratio >= 4.5) return 'aa';
  if (ratio >= 3) return 'aa-large';
  return 'fail';
}

export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}
