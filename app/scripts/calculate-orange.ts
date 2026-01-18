/**
 * Orange Color Calculator
 * =======================
 * Finds optimal orange colors that achieve 5:1 contrast ratio with white text
 * while maintaining high saturation (so they look orange, not brown).
 *
 * Run: npx ts-node scripts/calculate-orange.ts
 */

// ============================================================================
// WCAG Contrast Calculation
// ============================================================================

/**
 * Convert sRGB component to linear RGB
 */
function sRGBToLinear(c: number): number {
  const normalized = c / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance (WCAG formula)
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const rLinear = sRGBToLinear(r);
  const gLinear = sRGBToLinear(g);
  const bLinear = sRGBToLinear(b);
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
function getContrastRatio(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const L1 = getRelativeLuminance(r1, g1, b1);
  const L2 = getRelativeLuminance(r2, g2, b2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================================
// HSL to RGB Conversion
// ============================================================================

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ============================================================================
// Orange Color Search
// ============================================================================

interface OrangeCandidate {
  h: number;
  s: number;
  l: number;
  r: number;
  g: number;
  b: number;
  hex: string;
  contrastWithWhite: number;
  contrastWithBlack: number;
}

function findOptimalOranges(): OrangeCandidate[] {
  const candidates: OrangeCandidate[] = [];

  // Orange hue range: 15-45 degrees
  // High saturation: 70-100% (avoid brown)
  // Lightness: varies to hit contrast target

  for (let h = 15; h <= 45; h += 5) {
    for (let s = 70; s <= 100; s += 5) {
      for (let l = 20; l <= 60; l += 2) {
        const { r, g, b } = hslToRgb(h, s, l);

        const contrastWithWhite = getContrastRatio(r, g, b, 255, 255, 255);
        const contrastWithBlack = getContrastRatio(r, g, b, 0, 0, 0);

        // Target: 5:1 contrast with white text
        if (contrastWithWhite >= 4.9 && contrastWithWhite <= 6.0) {
          candidates.push({
            h,
            s,
            l,
            r,
            g,
            b,
            hex: rgbToHex(r, g, b),
            contrastWithWhite,
            contrastWithBlack,
          });
        }
      }
    }
  }

  return candidates;
}

// ============================================================================
// Analysis
// ============================================================================

console.log('🍊 Orange Color Calculator - Finding True Orange for Dark Mode\n');
console.log('Goal: White text (#FFF) on orange background with 5:1 contrast ratio');
console.log('Constraint: High saturation (70%+) to avoid brown appearance\n');

const candidates = findOptimalOranges();

// Sort by highest saturation first (most vibrant orange)
candidates.sort((a, b) => b.s - a.s || b.contrastWithWhite - a.contrastWithWhite);

console.log('='.repeat(70));
console.log('TOP ORANGE CANDIDATES (Highest Saturation First)');
console.log('='.repeat(70));

const topCandidates = candidates.slice(0, 15);
topCandidates.forEach((c, i) => {
  console.log(
    `${i + 1}. ${c.hex} | H:${c.h}° S:${c.s}% L:${c.l}% | ` +
      `Contrast: ${c.contrastWithWhite.toFixed(2)}:1 (white) ${c.contrastWithBlack.toFixed(2)}:1 (black)`
  );
});

console.log('\n' + '='.repeat(70));
console.log('COMPARISON WITH CURRENT TAILWIND COLORS');
console.log('='.repeat(70));

// Current Tailwind orange shades
const tailwindOranges = [
  { name: 'gold-500', hex: '#f97316', r: 249, g: 115, b: 22 },
  { name: 'gold-600', hex: '#ea580c', r: 234, g: 88, b: 12 },
  { name: 'gold-700', hex: '#c2410c', r: 194, g: 65, b: 12 },
  { name: 'gold-800', hex: '#9a3412', r: 154, g: 52, b: 18 },
];

console.log('\nTailwind Default Orange Shades:');
tailwindOranges.forEach((c) => {
  const contrastWhite = getContrastRatio(c.r, c.g, c.b, 255, 255, 255);
  const contrastBlack = getContrastRatio(c.r, c.g, c.b, 0, 0, 0);
  console.log(
    `  ${c.name}: ${c.hex} | ` +
      `Contrast: ${contrastWhite.toFixed(2)}:1 (white) ${contrastBlack.toFixed(2)}:1 (black)`
  );
});

console.log('\n' + '='.repeat(70));
console.log('RECOMMENDATIONS');
console.log('='.repeat(70));

// Find the best candidate with highest saturation meeting 5:1
const best = candidates.find((c) => c.s >= 90 && c.contrastWithWhite >= 5.0);
const goodEnough = candidates.find((c) => c.s >= 80 && c.contrastWithWhite >= 4.5);

if (best) {
  console.log(`\n✅ BEST: ${best.hex} (H:${best.h}° S:${best.s}% L:${best.l}%)`);
  console.log(`   Contrast: ${best.contrastWithWhite.toFixed(2)}:1 with white`);
  console.log('   Very saturated orange, meets 5:1 AA contrast');
}

if (goodEnough && (!best || goodEnough.hex !== best.hex)) {
  console.log(`\n👍 GOOD: ${goodEnough.hex} (H:${goodEnough.h}° S:${goodEnough.s}% L:${goodEnough.l}%)`);
  console.log(`   Contrast: ${goodEnough.contrastWithWhite.toFixed(2)}:1 with white`);
  console.log('   Good balance of vibrancy and contrast');
}

console.log('\n' + '='.repeat(70));
console.log('CUSTOM TAILWIND CONFIG SUGGESTION');
console.log('='.repeat(70));

const recommended = best || goodEnough || candidates[0];
if (recommended) {
  console.log(`
In tailwind.config.cjs, extend orange colors:

module.exports = {
  theme: {
    extend: {
      colors: {
        orange: {
          // Custom dark mode orange with high saturation
          'dark': '${recommended.hex}',
        }
      }
    }
  }
}

Or in lib/colors.ts, update solidButtonColors.orange:

orange: {
  bg: 'bg-gold-600 dark:bg-[${recommended.hex}]',
  hover: 'hover:bg-gold-700 dark:hover:bg-gold-700',
  text: 'text-white',
  focus: 'focus:ring-2 focus:ring-gold-500',
},
`);
}

// Also check black text contrast for light mode backgrounds
console.log('\n' + '='.repeat(70));
console.log('LIGHT MODE OPTIONS (Black text on orange)');
console.log('='.repeat(70));

const lightModeCandidates = [];
for (let h = 25; h <= 40; h += 5) {
  for (let s = 80; s <= 100; s += 5) {
    for (let l = 50; l <= 80; l += 5) {
      const { r, g, b } = hslToRgb(h, s, l);
      const contrastBlack = getContrastRatio(r, g, b, 0, 0, 0);
      if (contrastBlack >= 4.5 && contrastBlack <= 7.0) {
        lightModeCandidates.push({
          h,
          s,
          l,
          hex: rgbToHex(r, g, b),
          contrastBlack,
        });
      }
    }
  }
}

lightModeCandidates.sort((a, b) => b.s - a.s);
console.log('\nTop light mode oranges (black text):');
lightModeCandidates.slice(0, 5).forEach((c, i) => {
  console.log(`${i + 1}. ${c.hex} | H:${c.h}° S:${c.s}% L:${c.l}% | Contrast: ${c.contrastBlack.toFixed(2)}:1`);
});
