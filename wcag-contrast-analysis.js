// WCAG Contrast Ratio Calculator
// Analyzes proposed button color combinations

// Color values from globals.css
const colors = {
  purple: {
    100: '#f3e8ff',
    300: '#d8b4fe',
    400: '#c084fc',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  blue: {
    100: '#dbeeff',
    300: '#93c8ff',
    400: '#5fa8ff',
    700: '#1456d1',
    800: '#1746a8',
    900: '#183d84',
  },
  green: {
    100: '#d9fce5',
    300: '#7aeea6',
    400: '#3ddd78',
    700: '#0c8039',
    800: '#106530',
    900: '#0f5329',
  },
  yellow: {
    100: '#fef9c3',
    300: '#fde047',
    400: '#facc15',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  orange: {
    100: '#ffedd5',
    300: '#fdba74',
    400: '#fb923c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  teal: {
    100: '#ccfbf1',
    300: '#5eead4',
    400: '#2dd4bf',
    700: '#0d9488',
    800: '#115e59',
    900: '#134e4a',
  },
  gray: {
    100: '#f5f3f0',
    200: '#e8e4df',
    300: '#d6d1ca',
    400: '#a8a29e',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
};

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrast(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) {
    console.error(`Invalid hex color: ${hex1} or ${hex2}`);
    return 0;
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG Standards
const WCAG_AA_NORMAL = 4.5;  // Normal text
const WCAG_AA_LARGE = 3.0;   // Large text (18pt+ or 14pt+ bold)
const WCAG_AAA_NORMAL = 7.0; // Enhanced normal text
const WCAG_AAA_LARGE = 4.5;  // Enhanced large text

console.log('='.repeat(80));
console.log('PROPOSED BUTTON COLOR SYSTEM - CONTRAST ANALYSIS');
console.log('='.repeat(80));
console.log('\nProposal: Use same colors in both light and dark modes');
console.log('- Background: color-100 (light)');
console.log('- Text: color-800 or color-900 (dark)');
console.log('- Border: color-300 or color-400');
console.log('\nWCAG Requirements:');
console.log('- Normal text (< 18pt): 4.5:1 minimum (AA), 7:1 enhanced (AAA)');
console.log('- Large text (≥ 18pt): 3:1 minimum (AA), 4.5:1 enhanced (AAA)');
console.log('- UI components: 3:1 minimum');
console.log('- Your requirement: 5:1 minimum (from CLAUDE.md)');
console.log('\n' + '='.repeat(80));

// Test all color combinations
Object.keys(colors).forEach(colorName => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${colorName.toUpperCase()} VARIANT`);
  console.log('='.repeat(80));

  const color = colors[colorName];

  // Test text on background (most important)
  console.log('\n📝 TEXT ON BACKGROUND:');
  console.log('-'.repeat(80));

  const combinations = [
    { bg: '100', text: '700', label: 'color-100 bg + color-700 text (DEFAULT)' },
    { bg: '100', text: '800', label: 'color-100 bg + color-800 text (HOVER)' },
    { bg: '100', text: '900', label: 'color-100 bg + color-900 text (DARKER HOVER)' },
  ];

  combinations.forEach(({ bg, text, label }) => {
    const ratio = getContrast(color[bg], color[text]);
    const passes5 = ratio >= 5.0;
    const passesAA = ratio >= WCAG_AA_NORMAL;
    const passesAAA = ratio >= WCAG_AAA_NORMAL;

    console.log(`\n${label}:`);
    console.log(`  Contrast: ${ratio.toFixed(2)}:1`);
    console.log(`  Your 5:1 requirement: ${passes5 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  WCAG AA (4.5:1): ${passesAA ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  WCAG AAA (7:1): ${passesAAA ? '✅ PASS' : '❌ FAIL'}`);
  });

  // Test border visibility (less critical but good to know)
  console.log('\n🔲 BORDER ON BACKGROUND (SAME COLOR):');
  console.log('-'.repeat(80));

  const borderCombos = [
    { bg: '100', border: '300', label: 'color-100 bg + color-300 border' },
    { bg: '100', border: '400', label: 'color-100 bg + color-400 border' },
  ];

  borderCombos.forEach(({ bg, border, label }) => {
    const ratio = getContrast(color[bg], color[border]);
    const passes3 = ratio >= 3.0;

    console.log(`\n${label}:`);
    console.log(`  Contrast: ${ratio.toFixed(2)}:1`);
    console.log(`  WCAG UI component (3:1): ${passes3 ? '✅ PASS' : '❌ FAIL'}`);
  });

  // Test gray borders (universal approach)
  console.log('\n\n🔲 BORDER ON BACKGROUND (GRAY BORDERS):');
  console.log('-'.repeat(80));

  const grayBorderCombos = [
    { bg: '100', grayBorder: '300', label: 'color-100 bg + gray-300 border (DARK MODE - TRY 1)' },
    { bg: '100', grayBorder: '400', label: 'color-100 bg + gray-400 border (DARK MODE - TRY 2)' },
    { bg: '100', grayBorder: '600', label: 'color-100 bg + gray-600 border (LIGHT MODE)' },
  ];

  grayBorderCombos.forEach(({ bg, grayBorder, label }) => {
    const ratio = getContrast(color[bg], colors.gray[grayBorder]);
    const passes3 = ratio >= 3.0;

    console.log(`\n${label}:`);
    console.log(`  Contrast: ${ratio.toFixed(2)}:1`);
    console.log(`  WCAG UI component (3:1): ${passes3 ? '✅ PASS' : '❌ FAIL'}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log('\nThe proposed approach:');
console.log('\nLIGHT MODE:');
console.log('- Background: bg-[color]-100');
console.log('- Text: text-[color]-700 (default) → text-[color]-800 (hover)');
console.log('- Border: border-gray-600 (darker gray)');
console.log('\nDARK MODE:');
console.log('- Background: bg-[color]-100 (same!)');
console.log('- Text: text-[color]-700 (default) → text-[color]-800 (hover)');
console.log('- Border: border-gray-400 (lighter gray)');
console.log('\nWould:');
console.log('1. Eliminate the complex color inversion strategy');
console.log('2. Keep background & text identical in both modes');
console.log('3. Only borders change between light/dark (gray-600 vs gray-400)');
console.log('4. Significantly simplify the button component');
console.log('5. Keep color variants for visual distinction (purple, blue, green, etc.)');
console.log('\nSee results above for contrast validation.\n');
